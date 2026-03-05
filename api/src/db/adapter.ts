export interface DatabaseAdapter {
  readonly db: any;
  readonly rawDb: unknown;
  readonly authProvider: "sqlite" | "pg";
  checkpoint(): void;
  close(): void | Promise<void>;
}
