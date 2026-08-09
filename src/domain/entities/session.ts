export interface Session {
  token: string;
  identifier: string;
  /** Client-side expiry estimate (ms epoch); the server is always the
   *  source of truth for actual expiry. */
  expiresAt: number;
}
