/**
 * ConversationDatabase Factory 関数 Unit Tests
 *
 * TDD Red Phase: conversationDatabase モジュールの Factory 関数群に対するテスト。
 * Phase 5 実装前に RED となることを確認する。
 *
 * @see docs/30-workflows/conversation-db-robustness/phase-4-test-creation.md
 * @see docs/30-workflows/conversation-db-robustness/phase-2-design.md
 */
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// === vi.hoisted でモック変数を hoisting 対象にする ===
const {
  MockDatabase,
  mockPragma,
  mockExec: _mockExec,
  mockClose,
  mockMkdirSync,
  mockDb,
} = vi.hoisted(() => {
  const mockPragma = vi.fn();
  const mockExec = vi.fn();
  const mockClose = vi.fn();
  const mockDb = {
    pragma: mockPragma,
    exec: mockExec,
    close: mockClose,
  };
  const MockDatabase = vi.fn(() => mockDb);
  const mockMkdirSync = vi.fn();
  return {
    MockDatabase,
    mockPragma,
    mockExec,
    mockClose,
    mockMkdirSync,
    mockDb,
  };
});

// better-sqlite3 モック
vi.mock("better-sqlite3", () => ({
  default: MockDatabase,
}));

// electron app モック
vi.mock("electron", () => ({
  app: {
    getPath: vi.fn(() => "/tmp/test-user-data"),
  },
}));

// node:fs モック
vi.mock("node:fs", () => ({
  default: {
    mkdirSync: mockMkdirSync,
  },
}));

// === モック設定後にテスト対象をインポート ===
import {
  initializeConversationDatabase,
  getConversationDatabase,
  closeConversationDatabase,
  isConversationDatabaseInitialized,
  _resetForTesting,
} from "../conversationDatabase";

// ============================================================
// T-01: 正常系 - DB 初期化成功（6件）
// ============================================================

describe("initializeConversationDatabase", () => {
  beforeEach(() => {
    // 各テスト前にモックとモジュール状態をリセット
    vi.clearAllMocks();
    _resetForTesting();
  });

  afterEach(() => {
    // P9対策: テスト間のモジュールスコープ状態リーク防止
    _resetForTesting();
  });

  it("initialize() で DB ファイルが自動作成される", () => {
    initializeConversationDatabase();

    // better-sqlite3 コンストラクタが呼ばれること
    expect(MockDatabase).toHaveBeenCalledTimes(1);
    // デフォルトパスに conversations.db が含まれること
    const callArg = MockDatabase.mock.calls[0][0] as string;
    expect(callArg).toContain("conversations.db");
  });

  it("initialize() で WAL モードが設定される", () => {
    initializeConversationDatabase();

    // pragma("journal_mode = WAL") が呼ばれること
    const pragmaCalls = mockPragma.mock.calls as [string, ...unknown[]][];
    const walCall = pragmaCalls.find(
      (call) =>
        typeof call[0] === "string" && call[0].toLowerCase().includes("wal"),
    );
    expect(walCall).toBeDefined();
  });

  it("initialize() で foreign_keys が有効化される", () => {
    initializeConversationDatabase();

    const pragmaCalls = mockPragma.mock.calls as [string, ...unknown[]][];
    const fkCall = pragmaCalls.find(
      (call) =>
        typeof call[0] === "string" &&
        call[0].toLowerCase().includes("foreign_keys"),
    );
    expect(fkCall).toBeDefined();
  });

  it("initialize() で busy_timeout が設定される", () => {
    initializeConversationDatabase();

    const pragmaCalls = mockPragma.mock.calls as [string, ...unknown[]][];
    const busyCall = pragmaCalls.find(
      (call) =>
        typeof call[0] === "string" &&
        call[0].toLowerCase().includes("busy_timeout"),
    );
    expect(busyCall).toBeDefined();
  });

  it("getConversationDatabase() で初期化済み DB インスタンスを返す", () => {
    initializeConversationDatabase();
    const db = getConversationDatabase();

    expect(db).not.toBeNull();
    expect(db).toBe(mockDb);
  });

  it("isConversationDatabaseInitialized() が true を返す", () => {
    initializeConversationDatabase();

    expect(isConversationDatabaseInitialized()).toBe(true);
  });
});

// ============================================================
// T-02: 異常系 - DB 初期化失敗（5件）
// ============================================================

describe("ConversationDatabase - エラー", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetForTesting();
  });

  afterEach(() => {
    _resetForTesting();
  });

  it("ディレクトリ作成失敗時にエラーを投げる", () => {
    mockMkdirSync.mockImplementationOnce(() => {
      throw new Error("EACCES: permission denied");
    });

    expect(() => initializeConversationDatabase()).toThrow();
  });

  it("DB ファイル作成失敗時にエラーを投げる", () => {
    MockDatabase.mockImplementationOnce(() => {
      throw new Error("SQLITE_CANTOPEN: unable to open database file");
    });

    expect(() => initializeConversationDatabase()).toThrow();
  });

  it("未初期化で getConversationDatabase() を呼ぶとエラー", () => {
    // _resetForTesting() で未初期化状態にしてあるので getConversationDatabase() はエラーを投げる
    expect(() => getConversationDatabase()).toThrow();
  });

  it("二重初期化は既存インスタンスを返す", () => {
    initializeConversationDatabase();
    const first = getConversationDatabase();

    // 二度目の初期化でも同じインスタンスが返ること（new Database は再呼び出しされない）
    initializeConversationDatabase();
    const second = getConversationDatabase();

    expect(MockDatabase).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
  });

  it("DBパスがスペースのみの場合はエラー（P42準拠）", () => {
    // P42: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
    expect(() => initializeConversationDatabase({ dbPath: "   " })).toThrow();
  });
});

// ============================================================
// T-03: ライフサイクル管理（4件）
// ============================================================

describe("ConversationDatabase - ライフサイクル", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetForTesting();
  });

  afterEach(() => {
    _resetForTesting();
  });

  it("closeConversationDatabase() で DB が安全にクローズされる", () => {
    initializeConversationDatabase();

    closeConversationDatabase();

    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("close() 後に isConversationDatabaseInitialized() が false を返す", () => {
    initializeConversationDatabase();
    closeConversationDatabase();

    expect(isConversationDatabaseInitialized()).toBe(false);
  });

  it("close() 後に getConversationDatabase() がエラーを投げる", () => {
    initializeConversationDatabase();
    closeConversationDatabase();

    expect(() => getConversationDatabase()).toThrow();
  });

  it("_resetForTesting() で内部状態がリセットされる", () => {
    initializeConversationDatabase();
    expect(isConversationDatabaseInitialized()).toBe(true);

    _resetForTesting();

    expect(isConversationDatabaseInitialized()).toBe(false);
    // リセット後は getConversationDatabase() がエラーを投げること
    expect(() => getConversationDatabase()).toThrow();
  });
});

// ============================================================
// T-05: エッジケース・回帰テスト（Phase 6追加）
// ============================================================

describe("ConversationDatabase - エッジケース", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetForTesting();
  });

  afterEach(() => {
    _resetForTesting();
  });

  it("DBパスに日本語文字を含む場合に正常動作する", () => {
    initializeConversationDatabase({ dbPath: "/tmp/テスト/db.sqlite" });
    expect(MockDatabase).toHaveBeenCalledWith("/tmp/テスト/db.sqlite");
  });

  it("DBパスに空白文字を含む場合に正常動作する", () => {
    initializeConversationDatabase({ dbPath: "/tmp/my db/db.sqlite" });
    expect(MockDatabase).toHaveBeenCalledWith("/tmp/my db/db.sqlite");
  });

  it("close() 後の再初期化が正常動作する", () => {
    initializeConversationDatabase({ dbPath: "/tmp/test1.db" });
    closeConversationDatabase();

    // 再初期化
    initializeConversationDatabase({ dbPath: "/tmp/test2.db" });
    expect(isConversationDatabaseInitialized()).toBe(true);
    expect(MockDatabase).toHaveBeenCalledTimes(2);
  });

  it("getConversationDatabase() が同一インスタンスを返す（activate再利用テスト）", () => {
    initializeConversationDatabase();
    const first = getConversationDatabase();
    const second = getConversationDatabase();
    expect(first).toBe(second);
  });

  it("DBパスが空文字の場合はエラー（P42準拠）", () => {
    expect(() => initializeConversationDatabase({ dbPath: "" })).toThrow(
      "dbPath must not be an empty string",
    );
  });
});
