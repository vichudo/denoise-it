export type StoryType = "verdict" | "analysis" | "signal" | "noise";

interface ShareStoryParams {
  type: StoryType;
  id: string;
  index?: number;
}

/**
 * Fetches a story image from the API and shares it via Web Share API (mobile)
 * or triggers a download (desktop).
 */
export async function shareStoryImage({ type, id, index }: ShareStoryParams) {
  const params = new URLSearchParams({ type, id });
  if (index !== undefined) params.set("index", String(index));

  const res = await fetch(`/api/story-image?${params.toString()}`, {
    cache: "no-cache",
  });
  if (!res.ok) throw new Error("Failed to generate story image");

  const blob = await res.blob();
  const file = new File([blob], `denoise-${type}-${index ?? 0}.png`, {
    type: "image/png",
  });

  // Mobile: use Web Share API with file (touch device only)
  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice && navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file] });
    return;
  }

  // Desktop: download PNG directly
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copies the signal URL to clipboard.
 */
export async function copySignalUrl(id: string) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/s/${id}`
      : `/s/${id}`;
  await navigator.clipboard.writeText(url);
}
