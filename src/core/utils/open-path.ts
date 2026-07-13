/**
 * Cross-platform "open this path/url with the OS default handler".
 *
 *   macOS:   `open <path>`
 *   Linux:   `xdg-open <path>`
 *   Windows: `cmd.exe /c start "" <path>`   (empty title arg required when the
 *            path contains spaces or special chars — otherwise `start` treats
 *            the first quoted arg as a window title and silently does nothing).
 *
 * Returns true on spawn success, false on any failure. Never throws.
 * Fire-and-forget: stdio is ignored, errors are swallowed.
 */
import { IS_DARWIN, IS_WIN } from "../platform/index.js";

export function openPath(pathOrUrl: string): boolean {
  try {
    if (IS_WIN) {
      // `cmd /c start` interprets `&`, `^`, `%`, `|`, `"` in the URL as
      // shell metacharacters, opening the user up to argument injection if
      // pathOrUrl came from untrusted input (LLM-generated link, pasted
      // text). Reject any URL containing those before invoking cmd.exe.
      if (/[&^%|"`<>]/.test(pathOrUrl)) return false;
      Bun.spawn(["cmd.exe", "/c", "start", "", pathOrUrl], {
        stdio: ["ignore", "ignore", "ignore"],
        windowsHide: true,
      });
      return true;
    }
    if (IS_DARWIN) {
      Bun.spawn(["open", pathOrUrl], { stdio: ["ignore", "ignore", "ignore"] });
      return true;
    }
    // Linux: honor $BROWSER when set (isolated HOME / containers often lose
    // mimeapps.list, so xdg-open falls back to Firefox instead of Brave/Chrome).
    // Supports bare commands ("brave") and %s templates ("brave %s").
    const browser = process.env.BROWSER?.trim();
    if (browser) {
      const parts = browser.split(/\s+/).filter(Boolean);
      if (parts.length > 0) {
        const args = parts.map((p) => (p === "%s" ? pathOrUrl : p));
        if (!parts.includes("%s")) args.push(pathOrUrl);
        const cmd = args[0];
        if (cmd) {
          Bun.spawn([cmd, ...args.slice(1)], { stdio: ["ignore", "ignore", "ignore"] });
          return true;
        }
      }
    }
    Bun.spawn(["xdg-open", pathOrUrl], { stdio: ["ignore", "ignore", "ignore"] });
    return true;
  } catch {
    return false;
  }
}
