import "server-only";

import { type ProgressEvent } from "@/lib/utils";

const MAX_BUFFERED = 30;
const TTL_MS = 10 * 60 * 1000; // forget channels 10 min after completion

type Subscriber = (event: ProgressEvent) => void;

type Channel = {
  events: ProgressEvent[];
  subscribers: Set<Subscriber>;
  done: boolean;
  /** Timer that drops the channel from the registry after TTL when done. */
  expiresAt?: ReturnType<typeof setTimeout>;
};

// Module-level map persists across requests within a single process.
// Best-effort: works in dev and in single-instance/Fluid Compute deploys
// when the streaming request hits the same instance that runs generation.
const channels = new Map<string, Channel>();

function getOrCreate(id: string): Channel {
  let ch = channels.get(id);
  if (!ch) {
    ch = { events: [], subscribers: new Set(), done: false };
    channels.set(id, ch);
  }
  return ch;
}

export const progressBus = {
  publish(id: string, text: string) {
    const ch = getOrCreate(id);
    const event: ProgressEvent = { ts: Date.now(), text };
    ch.events.push(event);
    if (ch.events.length > MAX_BUFFERED) {
      ch.events.splice(0, ch.events.length - MAX_BUFFERED);
    }
    for (const s of ch.subscribers) {
      try {
        s(event);
      } catch {
        // ignore broken subscribers
      }
    }
  },

  /** Mark the channel done and schedule its removal. Triggers final flush for late subscribers. */
  finish(id: string) {
    const ch = channels.get(id);
    if (!ch) return;
    ch.done = true;
    if (ch.expiresAt) clearTimeout(ch.expiresAt);
    ch.expiresAt = setTimeout(() => channels.delete(id), TTL_MS);
  },

  /** Subscribe; immediately replays buffered events. Returns unsubscribe. */
  subscribe(
    id: string,
    onEvent: Subscriber,
    onDone?: () => void,
  ): () => void {
    const ch = getOrCreate(id);
    for (const e of ch.events) onEvent(e);
    if (ch.done) {
      onDone?.();
      return () => undefined;
    }
    ch.subscribers.add(onEvent);
    let interval: ReturnType<typeof setInterval> | undefined;
    if (onDone) {
      interval = setInterval(() => {
        if (channels.get(id)?.done) {
          clearInterval(interval);
          interval = undefined;
          onDone();
        }
      }, 250);
    }
    return () => {
      ch.subscribers.delete(onEvent);
      if (interval) clearInterval(interval);
    };
  },
};
