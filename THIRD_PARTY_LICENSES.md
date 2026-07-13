# Third-Party Licenses

SoulForge includes and/or downloads the following third-party software.
This file satisfies attribution requirements for all included licenses.

---

## Bundled Dependencies (compiled into the SoulForge binary)

### Apache-2.0 Licensed

| Package | Version | Repository |
|---------|---------|------------|
| ai (Vercel AI SDK) | 6.x | https://github.com/vercel/ai |
| @ai-sdk/anthropic | 3.x | https://github.com/vercel/ai |
| @ai-sdk/google | 3.x | https://github.com/vercel/ai |
| @ai-sdk/openai | 3.x | https://github.com/vercel/ai |
| @ai-sdk/xai | 3.x | https://github.com/vercel/ai |
| @llmgateway/ai-sdk-provider | 3.x | https://github.com/theopenco/llmgateway-ai-sdk-provider |
| @mozilla/readability | 0.6.x | https://github.com/mozilla/readability |
| @openrouter/ai-sdk-provider | 2.x | https://github.com/OpenRouterTeam/ai-sdk-provider |
| @biomejs/biome | 2.x | https://github.com/biomejs/biome |
| typescript | 5.x | https://github.com/microsoft/TypeScript |

Copyright notice: Copyright (c) respective authors and contributors.

Licensed under the Apache License, Version 2.0. You may obtain a copy at:
https://www.apache.org/licenses/LICENSE-2.0

### MIT Licensed

| Package | Version | Repository |
|---------|---------|------------|
| @opentui/react | 0.1.x | https://github.com/anomalyco/opentui |
| chalk | 5.x | https://github.com/chalk/chalk |
| linkify-it | 5.x | https://github.com/markdown-it/linkify-it |
| marked | 17.x | https://github.com/markedjs/marked |
| neovim (node-client) | 5.x | https://github.com/neovim/node-client |
| react | 19.x | https://github.com/facebook/react |
| shiki | 4.x | https://github.com/shikijs/shiki |
| ts-morph | 27.x | https://github.com/dsherret/ts-morph |
| web-tree-sitter | 0.25.x | https://github.com/tree-sitter/tree-sitter |
| zod | 4.x | https://github.com/colinhacks/zod |
| zustand | 5.x | https://github.com/pmndrs/zustand |
| isbinaryfile | 5.x | https://github.com/gjtorikian/isBinaryFile |

### ISC Licensed

| Package | Version | Repository |
|---------|---------|------------|
| linkedom | 0.18.x | https://github.com/WebReflection/linkedom |

### Unlicense

| Package | Version | Repository |
|---------|---------|------------|
| tree-sitter-wasms | 0.1.x | https://github.com/AntV/tree-sitter-wasms |

---

## Bundled Binaries (included in distribution tarball)

These official, unmodified binaries are included in the SoulForge distribution.
LICENSE files are preserved from each upstream release.

| Tool | License | Source |
|------|---------|--------|
| Neovim | Apache-2.0 + Vim License | https://github.com/neovim/neovim |
| ripgrep | MIT / Unlicense | https://github.com/BurntSushi/ripgrep |
| fd | Apache-2.0 / MIT | https://github.com/sharkdp/fd |
| lazygit | MIT | https://github.com/jesseduffield/lazygit |
| CLIProxyAPI | MIT | https://github.com/router-for-me/CLIProxyAPI |

**Neovim license note:** Post-0.3 contributions are Apache-2.0. Code inherited from
Vim (identified by `vim-patch` token in commits) is under the Vim License, which
permits redistribution of unmodified copies provided the license text is included.
The Vim License is [listed as GPL-compatible](https://www.gnu.org/licenses/license-list.html)
by the GNU Project. Neovim's LICENSE.txt is included in the bundled binary directory.

## Auto-Installed Binaries (downloaded on first run if not bundled)

These tools are downloaded from their official GitHub releases to `~/.soulforge/bin/`
when not already present on the system.

### Nerd Fonts (bundled — Symbols Only variant)

| Font | License | Source |
|------|---------|--------|
| Symbols Nerd Font | SIL OFL 1.1 | https://github.com/ryanoasis/nerd-fonts |

### Nerd Fonts (optional, downloaded via /setup)

| Font | License | Source |
|------|---------|--------|
| JetBrains Mono Nerd Font | SIL OFL 1.1 | https://github.com/ryanoasis/nerd-fonts |
| Fira Code Nerd Font | SIL OFL 1.1 | https://github.com/ryanoasis/nerd-fonts |
| Cascadia Code Nerd Font | SIL OFL 1.1 | https://github.com/ryanoasis/nerd-fonts |
| Iosevka Nerd Font | SIL OFL 1.1 | https://github.com/ryanoasis/nerd-fonts |
| Hack Nerd Font | SIL OFL 1.1 | https://github.com/ryanoasis/nerd-fonts |

---

## Neovim Plugins (auto-installed via lazy.nvim on first editor launch)

These plugins are downloaded by lazy.nvim at runtime into `~/.local/share/soulforge/lazy/`.
SoulForge does not bundle or redistribute plugin source code — it references them
by name in `init.lua` and lazy.nvim clones them from GitHub on first use.

### Apache-2.0 Licensed

| Plugin | Repository |
|--------|------------|
| LazyVim | https://github.com/LazyVim/LazyVim |
| lazy.nvim | https://github.com/folke/lazy.nvim |
| snacks.nvim | https://github.com/folke/snacks.nvim |
| noice.nvim | https://github.com/folke/noice.nvim |
| flash.nvim | https://github.com/folke/flash.nvim |
| trouble.nvim | https://github.com/folke/trouble.nvim |
| todo-comments.nvim | https://github.com/folke/todo-comments.nvim |
| which-key.nvim | https://github.com/folke/which-key.nvim |
| ts-comments.nvim | https://github.com/folke/ts-comments.nvim |
| lazydev.nvim | https://github.com/folke/lazydev.nvim |
| nvim-treesitter | https://github.com/nvim-treesitter/nvim-treesitter |
| nvim-treesitter-textobjects | https://github.com/nvim-treesitter/nvim-treesitter-textobjects |
| nvim-lspconfig | https://github.com/neovim/nvim-lspconfig |
| mason.nvim | https://github.com/mason-org/mason.nvim |
| mason-lspconfig.nvim | https://github.com/mason-org/mason-lspconfig.nvim |

### MIT Licensed

| Plugin | Repository |
|--------|------------|
| catppuccin/nvim | https://github.com/catppuccin/nvim |
| lualine.nvim | https://github.com/nvim-lualine/lualine.nvim |
| gitsigns.nvim | https://github.com/lewis6991/gitsigns.nvim |
| nui.nvim | https://github.com/MunifTanjim/nui.nvim |
| mini.nvim (mini.ai, mini.icons, mini.pairs) | https://github.com/echasnovski/mini.nvim |
| conform.nvim | https://github.com/stevearc/conform.nvim |
| grug-far.nvim | https://github.com/MagicDuck/grug-far.nvim |
| nvim-ts-autotag | https://github.com/windwp/nvim-ts-autotag |
| mason-tool-installer.nvim | https://github.com/WhoIsSethDaniel/mason-tool-installer.nvim |
| blink.cmp | https://github.com/Saghen/blink.cmp |
| friendly-snippets | https://github.com/rafamadriz/friendly-snippets |
| persistence.nvim | https://github.com/folke/persistence.nvim |
| nvim-lint | https://github.com/mfussenegger/nvim-lint |

### Disabled (license incompatible)

| Plugin | License | Reason |
|--------|---------|--------|
| bufferline.nvim | GPL-3.0 | Incompatible with BUSL-1.1; disabled in init.lua |

---

## LSP Servers & Tools (auto-installed via Mason on first editor launch)

These are downloaded by Mason at runtime into `~/.local/share/soulforge/mason/`.
SoulForge does not bundle or redistribute these — Mason downloads official releases.

| Tool | License | Source |
|------|---------|--------|
| typescript-language-server | MIT | https://github.com/typescript-language-server/typescript-language-server |
| pyright | MIT | https://github.com/microsoft/pyright |
| ruff | MIT | https://github.com/astral-sh/ruff |
| eslint-lsp | MIT | https://github.com/microsoft/vscode-eslint |
| biome | MIT | https://github.com/biomejs/biome |
| lua-language-server | MIT | https://github.com/LuaLS/lua-language-server |
| rust-analyzer | Apache-2.0 / MIT | https://github.com/rust-lang/rust-analyzer |
| gopls | BSD-3-Clause | https://github.com/golang/tools |
| clangd | Apache-2.0 (LLVM) | https://github.com/clangd/clangd |
| json-lsp | MIT | https://github.com/microsoft/vscode |
| yaml-language-server | MIT | https://github.com/redhat-developer/yaml-language-server |
| html-lsp | MIT | https://github.com/microsoft/vscode |
| css-lsp | MIT | https://github.com/microsoft/vscode |
| tailwindcss-language-server | MIT | https://github.com/tailwindlabs/tailwindcss-intellisense |
| bash-language-server | MIT | https://github.com/bash-lsp/bash-language-server |
| emmet-language-server | MIT | https://github.com/olrtg/emmet-language-server |
| svelte-language-server | MIT | https://github.com/sveltejs/language-tools |
| vue-language-server | MIT | https://github.com/vuejs/language-tools |
| graphql-language-service-cli | MIT | https://github.com/graphql/graphiql |
| astro-language-server | MIT | https://github.com/withastro/language-tools |
| dockerfile-language-server | MIT | https://github.com/rcjsuen/dockerfile-language-server |
| docker-compose-language-service | MIT | https://github.com/microsoft/compose-language-service |
| marksman | MIT | https://github.com/artempyanykh/marksman |
| sqlls | MIT | https://github.com/joe-re/sql-language-server |
| taplo | MIT | https://github.com/tamasfe/taplo |
| prettier | MIT | https://github.com/prettier/prettier |
| shfmt | BSD-3-Clause | https://github.com/mvdan/sh |
| stylua | MPL-2.0 | https://github.com/JohnnyMorganz/StyLua |
| black | MIT | https://github.com/psf/black |
| isort | MIT | https://github.com/PyCQA/isort |
| shellcheck | GPL-3.0 | https://github.com/koalaman/shellcheck |

**Note on shellcheck**: GPL-3.0 licensed but downloaded and executed as a standalone binary
at runtime — not linked into or distributed with SoulForge. This is standard usage
(same as running any GPL CLI tool from a non-GPL editor).

---

## Ported / Adapted Source

### progrok (MIT) — xAI OAuth device-code helpers

Portions of the SuperGrok OAuth provider (`src/core/llm/providers/grok/`) are adapted from
[lidge-jun/progrok](https://github.com/lidge-jun/progrok) auth modules (device-code flow,
OIDC discovery trust checks, token store refresh). Original work is MIT-licensed.

Copyright (c) progrok contributors.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## License Texts

### Apache License 2.0

                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work.

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to the Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by the Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding any notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

### MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.

### ISC License

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES.

### SIL Open Font License 1.1

Full text: https://openfontlicense.org/open-font-license-official-text/

### Unlicense

This is free and unencumbered software released into the public domain.
Full text: https://unlicense.org/

### BSD-3-Clause License

Full text: https://opensource.org/licenses/BSD-3-Clause

### Vim License

VIM LICENSE

I)  There are no restrictions on distributing unmodified copies of Vim except
    that they must include this license text.  You can also distribute
    unmodified parts of Vim, likewise unrestricted except that they must
    include this license text.  You are also allowed to include executables
    that you made from the unmodified Vim sources, plus your own usage
    examples and Vim scripts.

II) It is allowed to distribute a modified (or extended) version of Vim,
    including executables and/or source code, when the following four
    conditions are met:
    1) This license text must be included unmodified.
    2) The modified Vim must be distributed in one of the following five ways:
       a) If you make changes to Vim yourself, you must clearly describe in
          the distribution how to contact you.
       b) If you receive a modified Vim that was distributed to you under the
          above conditions, you may further distribute it unmodified.
       c) Provide all the changes, including source code, with every copy of
          the modified Vim you distribute.
       d) When there is a maintainer, e-mail the maintainer and make the
          changes available to them within fourteen days after you receive the
          modified Vim.
       e) When the changes are very small this is not needed.
    3) A message must be added, at least in the strstrout() function and in
       the strversion() function, such that the user of the modified Vim is
       able to see that it was modified.
    4) The contact information as strequired by clause 2a must not be removed
       or changed, except that the strperson himself can make changes.

III) If you distribute a modified version of Vim, you are encouraged to use
     the Vim license for your changes and make them available to the
     maintainer, including the source code.  The strpreferred way to do this
     is by e-mail or by uploading the files to a server and e-mailing the
     URL. The current maintainer is Bram Moolenaar <Bram@vim.org>.  If the
     maintainer does not respond, use the Vim mailing list.

### Mozilla Public License 2.0

Full text: https://www.mozilla.org/en-US/MPL/2.0/
