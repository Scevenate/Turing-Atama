export interface Level {
  id: string;
  title: string;
  /** Markdown content */
  description: string;
  /** Positions that are pre-filled. Missing positions are blank ("null"). */
  initialTape: Record<number, string>;
  initialHead: number;
  /**
   * Expected tape after halt.
   * Only these positions are checked — other cells are ignored.
   * Use "null" to assert a cell must be blank.
   */
  expected: Record<number, string>;
  /** Example solution shown in editor on first open */
  starterCode?: string;
}
