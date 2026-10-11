# astro-obsidian-base

Show [Obsidian Bases](https://help.obsidian.md/bases) tables on an Astro site.

A CLI queries a `.base` file against your vault with [mdbasequery](https://github.com/intellectronica/mdbasequery) and writes a JSON snapshot into your site. Commit the snapshot; the site then builds without access to the vault (CI, Docker). An Astro component renders it as a table.

## Install

```sh
pnpm add github:andriyor/astro-obsidian-base
```

## Sync a base

```sh
pnpm astro-obsidian-base ~/vault path/in/vault/tools.base            # -> src/data/bases/tools.json
pnpm astro-obsidian-base ~/vault path/in/vault/tools.base --out data # custom folder
```

Re-run it whenever the notes change. Only table views are exported. `[[wikilinks]]` become plain text.

## Render it (.mdx)

```mdx
import ObsidianBase from 'astro-obsidian-base/ObsidianBase.astro';
import tools from '../../data/bases/tools.json';

<ObsidianBase base={tools} />
<ObsidianBase base={tools} view="Cost" />
```

Without `view`, the first view is shown. Column headers use the base's `displayName` when set. The table breaks out of the text column to the full viewport width and scrolls sideways if it still doesn't fit. Values render as `✓`/`✗` for booleans, numbers with thousands separators, URLs as links.

## Types

```ts
import type { Base, View } from 'astro-obsidian-base/types';
```

The CLI is TypeScript (`src/sync.ts`), run through [tsx](https://tsx.is) because Node doesn't strip types from files inside `node_modules`. `pnpm typecheck` runs `tsc`.

## Known limits

- mdbasequery 0.0.2 returns `file.ext` with a leading dot; the CLI rewrites `file.ext == "md"` filters until [mdbasequery#27](https://github.com/intellectronica/mdbasequery/pull/27) ships.
- Only Markdown notes are queried, so bases over other file types come out empty.
