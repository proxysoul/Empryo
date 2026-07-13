import type { InfoPopupLine } from "../../../../components/modals/InfoPopup.js";
import { useUIStore } from "../../../../stores/ui.js";
import { providerIcon } from "../../../icons.js";
import { getThemeTokens } from "../../../theme/index.js";
import { openPath } from "../../../utils/open-path.js";
import { invalidateProviderModelCache } from "../../models.js";
import { checkProviders } from "../../provider.js";
import { loginWithDeviceCode } from "./device-code.js";
import { isLoggedIn } from "./token-store.js";

/** Popup width for Grok login — long URLs + region note need more than the 72 default. */
const GROK_LOGIN_POPUP_WIDTH = 84;
/** Soft wrap for InfoPopup text rows (InfoLine truncates; it does not wrap). */
const GROK_LOGIN_LINE_WIDTH = 76;

/** Word-wrap a string into InfoPopup text lines (InfoLine is single-row + truncate). */
export function wrapInfoText(
  text: string,
  color: string,
  maxWidth = GROK_LOGIN_LINE_WIDTH,
): InfoPopupLine[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: InfoPopupLine[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxWidth) {
      current = next;
      continue;
    }
    if (current) lines.push({ type: "text", label: current, color });
    // Hard-split tokens longer than maxWidth (e.g. long URLs).
    if (word.length > maxWidth) {
      for (let i = 0; i < word.length; i += maxWidth) {
        const chunk = word.slice(i, i + maxWidth);
        if (i + maxWidth < word.length) {
          lines.push({ type: "text", label: chunk, color });
        } else {
          current = chunk;
        }
      }
    } else {
      current = word;
    }
  }
  if (current) lines.push({ type: "text", label: current, color });
  return lines;
}

/** Success copy after device-code login. */
export function getGrokLoginSuccessLines(
  theme: ReturnType<typeof getThemeTokens>,
): InfoPopupLine[] {
  return [
    {
      type: "text",
      label: "Logged in to Grok (subscription).",
      color: theme.success,
    },
    {
      type: "text",
      label: "Press Esc to open the model picker, or use Ctrl+L / /models.",
      color: theme.textPrimary,
    },
    { type: "spacer" },
    ...wrapInfoText(
      "Note: not all models are available in every region. A VPN (e.g. to the US) may be required for the newest subscription-only models.",
      theme.textSecondary,
    ),
  ];
}

function openUrlInBrowser(url: string): boolean {
  return openPath(url);
}

export function runGrokDeviceLogin(onEvent?: (message: string) => void): {
  promise: Promise<void>;
  abort: () => void;
} {
  const controller = new AbortController();

  const promise = (async () => {
    if (isLoggedIn()) {
      onEvent?.("Already logged in to Grok (subscription).");
      return;
    }

    await loginWithDeviceCode({
      signal: controller.signal,
      onStatus: (message) => onEvent?.(message),
      onCode: ({ userCode, verificationUri, verificationUriComplete }) => {
        const url = verificationUriComplete || verificationUri;
        onEvent?.("Opening browser for Grok login...");
        const opened = openUrlInBrowser(url);
        if (opened) {
          onEvent?.("Browser opened. Complete the login on the xAI / X page.");
        } else {
          onEvent?.("Could not open browser automatically. Open this URL manually:");
          onEvent?.(url);
        }
        onEvent?.(`User code: ${userCode}`);
        // Always surface the URL in the TUI so users can copy it if the wrong
        // browser opened or the window was missed.
        onEvent?.("URL:");
        onEvent?.(url);
      },
    });
  })();

  return {
    promise,
    abort: () => controller.abort(),
  };
}

export async function requestGrokAuth(): Promise<void> {
  const theme = getThemeTokens();
  const lines: InfoPopupLine[] = [
    {
      type: "text",
      label: "Starting Grok (subscription) login...",
      color: theme.textSecondary,
    },
  ];

  let handle: ReturnType<typeof runGrokDeviceLogin> | null = null;
  let finished = false;

  const updatePopup = (onClose?: () => void) => {
    useUIStore.getState().openInfoPopup({
      title: "Grok Login",
      icon: providerIcon("grok"),
      width: GROK_LOGIN_POPUP_WIDTH,
      lines: [...lines],
      // During login, Esc aborts the poll. After success, Esc opens the model picker.
      // openModal() resets ALL modals (including this popup), so we must not call it
      // until the user dismisses — otherwise the success/region note never appears.
      onClose:
        onClose ??
        (() => {
          if (!finished) handle?.abort();
        }),
    });
  };

  updatePopup();
  handle = runGrokDeviceLogin((message) => {
    // Wrap long status lines (URLs) so InfoLine does not truncate them mid-string.
    if (message.length > GROK_LOGIN_LINE_WIDTH || /^https?:\/\//.test(message)) {
      lines.push(...wrapInfoText(message, theme.textPrimary));
    } else {
      lines.push({ type: "text", label: message, color: theme.textPrimary });
    }
    updatePopup();
  });

  try {
    await handle.promise;
    finished = true;
    invalidateProviderModelCache("grok");
    await checkProviders().catch(() => {});
    lines.push({ type: "spacer" });
    lines.push(...getGrokLoginSuccessLines(theme));
    updatePopup(() => {
      useUIStore.getState().openModal("llmSelector");
    });
  } catch (error) {
    finished = true;
    if (error instanceof Error && error.name === "AbortError") {
      // User cancellation is already handled by the onClose abort; don't
      // reopen the popup with an error message after the user pressed Esc.
      return;
    }
    const message = error instanceof Error ? error.message : String(error);
    lines.push(...wrapInfoText(`Error: ${message}`, theme.brandSecondary));
    updatePopup();
  }
}
