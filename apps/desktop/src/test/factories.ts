/**
 * テストデータファクトリー
 * テスト用のモックデータ生成
 */

// テスト用簡易型定義（@repo/sharedの型と互換）
export interface TestChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  isFavorite: boolean;
  isPinned: boolean;
  pinOrder: number | null;
  lastMessagePreview: string | null;
  metadata: Record<string, unknown>;
  deletedAt: string | null;
}

export interface TestChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  messageIndex: number;
  timestamp: string;
  llmProvider: string | null;
  llmModel: string | null;
  llmMetadata: Record<string, unknown> | null;
  attachments: unknown[];
  systemPrompt: string | null;
  metadata: Record<string, unknown>;
}

let sessionCounter = 0;
let messageCounter = 0;

/**
 * モックチャットセッションを生成
 * @param overrides - 上書きするプロパティ
 */
export function createMockChatSession(
  overrides: Partial<TestChatSession> = {},
): TestChatSession {
  sessionCounter++;
  const now = new Date().toISOString();

  return {
    id: `session-${sessionCounter}`,
    userId: "test-user-id",
    title: `Test Session ${sessionCounter}`,
    createdAt: now,
    updatedAt: now,
    messageCount: 0,
    isFavorite: false,
    isPinned: false,
    pinOrder: null,
    lastMessagePreview: null,
    metadata: {},
    deletedAt: null,
    ...overrides,
  };
}

/**
 * モックチャットメッセージを生成
 * @param overrides - 上書きするプロパティ
 */
export function createMockChatMessage(
  overrides: Partial<TestChatMessage> = {},
): TestChatMessage {
  messageCounter++;
  const now = new Date().toISOString();

  return {
    id: `message-${messageCounter}`,
    sessionId: `session-${sessionCounter}`,
    role: "user",
    content: `Test message ${messageCounter}`,
    messageIndex: messageCounter - 1,
    timestamp: now,
    llmProvider: null,
    llmModel: null,
    llmMetadata: null,
    attachments: [],
    systemPrompt: null,
    metadata: {},
    ...overrides,
  };
}

/**
 * 複数のチャットセッションを生成
 * @param count - 生成数
 * @param overrides - 各セッションに適用する上書きプロパティ
 */
export function createMockChatSessions(
  count: number,
  overrides: Partial<TestChatSession> = {},
): TestChatSession[] {
  return Array.from({ length: count }, () => createMockChatSession(overrides));
}

/**
 * 複数のチャットメッセージを生成
 * @param count - 生成数
 * @param overrides - 各メッセージに適用する上書きプロパティ
 */
export function createMockChatMessages(
  count: number,
  overrides: Partial<TestChatMessage> = {},
): TestChatMessage[] {
  return Array.from({ length: count }, () => createMockChatMessage(overrides));
}

/**
 * 会話付きのチャットセッションを生成
 * @param messageCount - メッセージ数
 * @param sessionOverrides - セッションの上書きプロパティ
 */
export function createMockChatSessionWithMessages(
  messageCount: number = 4,
  sessionOverrides: Partial<TestChatSession> = {},
): { session: TestChatSession; messages: TestChatMessage[] } {
  const session = createMockChatSession({
    messageCount,
    ...sessionOverrides,
  });
  const messages: TestChatMessage[] = [];

  for (let i = 0; i < messageCount; i++) {
    messages.push(
      createMockChatMessage({
        sessionId: session.id,
        role: i % 2 === 0 ? "user" : "assistant",
        content:
          i % 2 === 0 ? `User message ${i + 1}` : `Assistant response ${i + 1}`,
        messageIndex: i,
        llmProvider: i % 2 === 1 ? "anthropic" : null,
        llmModel: i % 2 === 1 ? "claude-3-opus" : null,
      }),
    );
  }

  return { session, messages };
}

/**
 * ファクトリーカウンターをリセット
 * 各テスト間で一貫したIDを生成するため
 */
export function resetFactories(): void {
  sessionCounter = 0;
  messageCounter = 0;
}
