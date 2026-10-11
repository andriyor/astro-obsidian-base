/** One table view of a base, as written by the sync CLI. */
export type View = { name: string; headers: string[]; rows: unknown[][] };

/** A synced .base snapshot: what `<ObsidianBase base={...} />` takes. */
export type Base = { name: string; views: View[] };
