export type ConnectorRef = {
  type: string;
  status: string;
  /** Server-side only — access tokens / API keys for retrievers. */
  config?: Record<string, unknown>;
};

export type GetContextInput = {
  query: string;
  userId: string;
  workspaceId: string;
  conversationId?: string;
  agent?: string;
  connectors: ConnectorRef[];
};
