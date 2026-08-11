import { type NextRequest } from "next/server";

import { progressBus } from "@/server/analysis/progress-bus";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      const send = (data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          closed = true;
        }
      };

      // Initial comment to flush headers in some proxies.
      try {
        controller.enqueue(encoder.encode(`: connected\n\n`));
      } catch {
        closed = true;
      }

      const unsubscribe = progressBus.subscribe(
        id,
        (event) => send({ type: "event", ...event }),
        () => {
          send({ type: "done" });
          if (!closed) {
            try {
              controller.close();
            } catch {
              /* ignore */
            }
            closed = true;
          }
        },
      );

      // Heartbeat to keep idle connections alive.
      const heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          closed = true;
        }
      }, 15000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        if (!closed) {
          try {
            controller.close();
          } catch {
            /* ignore */
          }
          closed = true;
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
