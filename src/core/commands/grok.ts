import { providerIcon } from "../icons.js";
import { invalidateProviderModelCache } from "../llm/models.js";
import { checkProviders } from "../llm/provider.js";
import { deleteTokens, getLoginStatus } from "../llm/providers/grok.js";
import { getProvider } from "../llm/providers/index.js";
import { getThemeTokens } from "../theme/index.js";
import type { CommandContext, CommandHandler } from "./types.js";

async function refreshGrokState(): Promise<void> {
  invalidateProviderModelCache("grok");
  await checkProviders().catch(() => {});
}

export function getGrokStatusPopupLines(
  status: ReturnType<typeof getLoginStatus>,
  theme: ReturnType<typeof getThemeTokens>,
) {
  return [
    {
      type: "entry" as const,
      label: "Logged in",
      desc: status.loggedIn ? "yes" : "no",
      descColor: status.loggedIn ? theme.success : theme.warning,
    },
    {
      type: "entry" as const,
      label: "Account",
      desc: status.email ?? (status.loggedIn ? "(unknown)" : "—"),
    },
    ...(status.expiresAt
      ? [
          {
            type: "entry" as const,
            label: "Access token expires",
            desc: new Date(status.expiresAt).toLocaleString(),
          },
        ]
      : []),
    { type: "spacer" as const },
    {
      type: "text" as const,
      label: status.loggedIn
        ? "SuperGrok OAuth session is active. Pick a model with Ctrl+L."
        : "Not logged in. Run /grok login (requires SuperGrok / X Premium+).",
      color: status.loggedIn ? theme.textPrimary : theme.textSecondary,
    },
  ];
}

export function getGrokLogoutPopupLines(
  result: { ok: boolean; message: string },
  usingGrok: boolean,
  theme: ReturnType<typeof getThemeTokens>,
) {
  return [
    {
      type: "text" as const,
      label: result.message,
      color: result.ok ? theme.success : theme.brandSecondary,
    },
    ...(usingGrok
      ? [
          { type: "spacer" as const },
          {
            type: "text" as const,
            label:
              "The active model is still Grok (subscription). Switch models or log back in before your next prompt.",
            color: theme.textSecondary,
          },
        ]
      : []),
  ];
}

function showStatus(ctx: CommandContext): void {
  const theme = getThemeTokens();
  const status = getLoginStatus();
  ctx.openInfoPopup({
    title: "Grok Status",
    icon: providerIcon("grok"),
    lines: getGrokStatusPopupLines(status, theme),
  });
}

async function handleGrokLogin(_input: string, _ctx: CommandContext): Promise<void> {
  const provider = getProvider("grok");
  if (!provider?.onRequestAuth) {
    throw new Error("Grok auth flow is not available.");
  }
  // requestGrokAuth already refreshes providers, shows success + region note,
  // and opens the model picker — same shape as /codex login.
  await provider.onRequestAuth();
  await refreshGrokState();
}

async function handleGrokStatus(_input: string, ctx: CommandContext): Promise<void> {
  showStatus(ctx);
}

async function handleGrokLogout(_input: string, ctx: CommandContext): Promise<void> {
  const theme = getThemeTokens();
  let result: { ok: boolean; message: string };
  try {
    deleteTokens();
    result = { ok: true, message: "Logged out of Grok (subscription)." };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    result = { ok: false, message: `Logout failed: ${message}` };
  }
  await refreshGrokState();
  const usingGrok = ctx.chat.activeModel.startsWith("grok/");
  ctx.openInfoPopup({
    title: "Grok Logout",
    icon: providerIcon("grok"),
    lines: getGrokLogoutPopupLines(result, usingGrok, theme),
  });
}

async function handleGrokSwitch(_input: string, ctx: CommandContext): Promise<void> {
  const theme = getThemeTokens();
  try {
    deleteTokens();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    ctx.openInfoPopup({
      title: "Grok Switch Account",
      icon: providerIcon("grok"),
      lines: [
        {
          type: "text",
          label: `Could not log out of the current Grok account: ${message}`,
          color: theme.brandSecondary,
        },
      ],
    });
    return;
  }
  await refreshGrokState();
  ctx.openInfoPopup({
    title: "Grok Switch Account",
    icon: providerIcon("grok"),
    lines: [
      {
        type: "text",
        label: "Logged out of Grok. Starting login for another account...",
        color: theme.textPrimary,
      },
    ],
  });
  await handleGrokLogin(_input, ctx);
}

export function register(map: Map<string, CommandHandler>): void {
  map.set("/grok", handleGrokStatus);
  map.set("/grok login", handleGrokLogin);
  map.set("/grok status", handleGrokStatus);
  map.set("/grok logout", handleGrokLogout);
  map.set("/grok switch", handleGrokSwitch);
}
