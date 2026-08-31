import type { PortfolioFile } from "../types.ts";

const ALLOWED = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export async function readPortfolioFiles(files: FileList | File[]): Promise<PortfolioFile[]> {
  const selected = Array.from(files).filter((file) => ALLOWED.has(file.type));
  return Promise.all(
    selected.map(async (file) => {
      const bytes = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
      }
      return {
        name: file.name,
        mediaType: file.type,
        data: btoa(binary),
      };
    }),
  );
}
