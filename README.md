<div align="center">

<picture>
  <source media="(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)" srcset="assets/empryo-mote-dark.svg" />
  <source media="(prefers-reduced-motion: reduce)" srcset="assets/empryo-mote-light.svg" />
  <source media="(prefers-color-scheme: dark)" srcset="assets/empryo-mote-dark-normal.gif" />
  <source media="(prefers-color-scheme: light)" srcset="assets/empryo-mote-light-normal.gif" />
  <img src="assets/empryo-mote-light-normal.gif" width="120" height="120" alt="Mote, the Empryo mascot" />
</picture>

# Empryo

Knows your code by heart.

[Download](https://empryo.com/download) · [Docs](https://empryo.com/docs) · [Benchmarks](https://empryo.com/benchmarks) · [Changelog](https://empryo.com/changelog) · [Discord](https://discord.gg/fX4H7GYSMJ)

<a href="https://discord.gg/fX4H7GYSMJ"><img alt="Join the Empryo Discord" src="https://img.shields.io/discord/1502779577804656874?label=Discord&logo=discord&logoColor=white&color=5865F2&style=flat" /></a>
<a href="https://x.com/BniWael"><img alt="Follow @BniWael on X" src="https://img.shields.io/badge/follow-%40BniWael-000000?logo=x&logoColor=white&style=flat" /></a>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/desktop-dark.webp" />
  <source media="(prefers-color-scheme: light)" srcset="assets/desktop-light.webp" />
  <img alt="The Empryo desktop app: the live map of a repository, one file and everything that imports it" src="assets/desktop-light.webp" width="880" />
</picture>

</div>

<details>
<summary>Watch the demo</summary>

<picture>
  <source media="(prefers-reduced-motion: reduce) and (prefers-color-scheme: dark)" srcset="assets/empryo-demo-still-dark.webp" />
  <source media="(prefers-reduced-motion: reduce)" srcset="assets/empryo-demo-still-light.webp" />
  <source media="(prefers-color-scheme: dark)" srcset="assets/empryo-demo-dark.webp" />
  <source media="(prefers-color-scheme: light)" srcset="assets/empryo-demo-light.webp" />
  <img alt="Empryo maps a repository, follows its connections, edits code and shows the diff in desktop and terminal views" src="assets/empryo-demo-light.webp" width="880" />
</picture>

[Full video, dark](assets/empryo-demo-dark.mp4) · [Full video, light](assets/empryo-demo-light.mp4)

</details>

## Install

```bash
curl -fsSL https://empryo.com/install.sh | bash   # macOS, Linux
irm https://empryo.com/install.ps1 | iex          # Windows
```

Desktop app and installers: [empryo.com/download](https://empryo.com/download) only.

Then connect a model and prompt. Code intelligence works out of the box: Empryo maps your code, installs the language servers your project needs and detects your test, lint and typecheck commands in the background, once per project. Nothing to configure, nothing to wait for. [How it works](https://empryo.com/docs/concepts/intelligence)

## What it does

- **It reads the map first.** It knows what an edit will touch before it makes it.
- **It edits by name.** A function or class, replaced exactly.
- **It checks its own work.** Typecheck, lint and tests, fixed in the same turn.
- **It remembers.** Decisions and past bugs, per project.

## Where Empryo stands

<div align="center">
<a href="https://empryo.com/benchmarks">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/benchmark-dark.webp" />
  <source media="(prefers-color-scheme: light)" srcset="assets/benchmark-light.webp" />
  <img alt="Every published run added up: Empryo against OpenCode, Claude Code and pi, on time and cost" src="assets/benchmark-light.webp" width="880" />
</picture>
</a>

<sub>Every published run, added up. Shorter bars win. Checked against the bill. [All rounds](https://empryo.com/benchmarks)</sub>
</div>

## Desktop, terminal or headless

One agent, the same map and memory, wherever you run it.

<div align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/terminal-dark.webp" />
  <source media="(prefers-color-scheme: light)" srcset="assets/terminal-light.webp" />
  <img alt="The Empryo terminal app" src="assets/terminal-light.webp" width="880" />
</picture>
</div>

## Public core and engine

This repository contains the public SoulForge v2 core and engine code under its [existing license](LICENSE). It is not the full source of Empryo v3; the current desktop app, new surfaces and newest features are developed privately.

## Empryo v3 usage

Empryo v3 is free for personal and internal business use, including company development, paid client work and headless CI. You can sell the work you create with it. Selling, hosting, wrapping or bundling Empryo itself as a commercial offering requires the owner's explicit prior written permission in a separate commercial license. Contact **empryo@proxysoul.com**.

The [Empryo v3 license](EMPRYO_V3_LICENSE.md) applies only to distributions supplied under those terms. It does not replace this repository's [SoulForge license](LICENSE), revoke earlier grants or change their existing conversion rights.

Bugs go to [Issues](https://github.com/proxysoul/soulforge/issues), ideas to [Discussions](https://github.com/proxysoul/soulforge/discussions).

## Sponsors

<div align="center">

<a href="https://llmgateway.io/dashboard?ref=6tjJR2H3X4E9RmVQiQwK" title="LLM Gateway">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/llmg-white.svg" />
    <source media="(prefers-color-scheme: light)" srcset="assets/llmg-dark.svg" />
    <img alt="LLM Gateway" src="assets/llmg-dark.svg" height="48" />
  </picture>
</a>

<sub>[Sponsor on GitHub](https://github.com/sponsors/proxysoul) · [All backers](BACKERS.md)</sub>

</div>
