# テスト仕様書 - index.html→structure.md 逆同期機能

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| 機能名   | slide-reverse-sync               |
| タスクID | task-feat-slide-reverse-sync-001 |
| 作成日   | 2026-01-10                       |
| Phase    | 4                                |
| スキル   | tdd-principles                   |

---

## 1. テスト戦略

### 1.1 TDDアプローチ

本機能の開発はTDD（Test-Driven Development）サイクルに従う。

```
Red → Green → Refactor
 │      │         │
 │      │         └── コードの改善（テストを維持）
 │      └── 最小限の実装でテストを通過
 └── 失敗するテストを先に作成
```

### 1.2 テストピラミッド

```
        ┌─────────────┐
        │   E2E (少)   │  ← 手動テスト（Phase 11）
       ┌┴─────────────┴┐
       │  統合テスト (中) │  ← 本フェーズで作成
      ┌┴───────────────┴┐
      │ ユニットテスト (多) │  ← 本フェーズで作成
     └───────────────────┘
```

### 1.3 テスト対象コンポーネント

| コンポーネント | テスト種別 | 優先度 |
| -------------- | ---------- | ------ |
| FileWatcher    | ユニット   | 高     |
| SyncManager    | ユニット   | 高     |
| SkillExecutor  | ユニット   | 高     |
| ModifierSkill  | ユニット   | 高     |
| IPC Handlers   | 統合       | 中     |
| 全体フロー     | 統合       | 中     |

---

## 2. ユニットテスト仕様

### 2.1 FileWatcher テスト

**ファイル**: `apps/desktop/src/main/slide/__tests__/file-watcher.test.ts`

#### 2.1.1 新規テストケース

| テストID | テスト名                                            | 説明                                 |
| -------- | --------------------------------------------------- | ------------------------------------ |
| FW-01    | should watch index.html in addition to structure.md | index.html監視の追加確認             |
| FW-02    | should call onHtmlChange callback on html change    | HTML変更時のコールバック呼び出し確認 |
| FW-03    | should ignore html skill-originated changes         | html skill起因の変更を無視           |
| FW-04    | should ignore modifier skill-originated changes     | modifier skill起因の変更を無視       |
| FW-05    | should process html changes after TTL               | TTL経過後のHTML変更処理確認          |
| FW-06    | should handle bidirectional loop prevention         | 双方向ループ防止の確認               |

#### 2.1.2 テストコード構造

```typescript
describe("FileWatcher - Reverse Sync", () => {
  describe("onHtmlChange", () => {
    it("FW-01: should watch index.html in addition to structure.md");
    it("FW-02: should call onHtmlChange callback on html change");
    it("FW-03: should ignore html skill-originated changes");
  });

  describe("bidirectional loop prevention", () => {
    it("FW-04: should ignore modifier skill-originated changes");
    it("FW-05: should process html changes after TTL");
    it("FW-06: should handle bidirectional loop prevention");
  });
});
```

---

### 2.2 SyncManager テスト

**ファイル**: `apps/desktop/src/main/slide/__tests__/sync-manager.test.ts`

#### 2.2.1 新規テストケース

| テストID | テスト名                                     | 説明                                 |
| -------- | -------------------------------------------- | ------------------------------------ |
| SM-01    | should execute modifier skill on reverseSync | reverseSync でmodifierスキル実行確認 |
| SM-02    | should return structure changes on success   | 成功時の変更内容返却確認             |
| SM-03    | should throw error on reverseSync failure    | 失敗時のエラー処理確認               |
| SM-04    | should update sync direction on reverseSync  | 同期方向の更新確認                   |
| SM-05    | should handle cancel during reverseSync      | 逆同期中のキャンセル処理確認         |
| SM-06    | should emit progress during reverseSync      | 進捗通知確認                         |

#### 2.2.2 テストコード構造

```typescript
describe("SyncManager - Reverse Sync", () => {
  describe("reverseSync", () => {
    it("SM-01: should execute modifier skill on reverseSync");
    it("SM-02: should return structure changes on success");
    it("SM-03: should throw error on reverseSync failure");
    it("SM-04: should update sync direction on reverseSync");
  });

  describe("cancel and progress", () => {
    it("SM-05: should handle cancel during reverseSync");
    it("SM-06: should emit progress during reverseSync");
  });
});
```

---

### 2.3 SkillExecutor テスト

**ファイル**: `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`

#### 2.3.1 新規テストケース

| テストID | テスト名                                | 説明                               |
| -------- | --------------------------------------- | ---------------------------------- |
| SE-01    | should execute modifier skill           | modifier skill実行確認             |
| SE-02    | should pass correct context to modifier | modifierへの正しいコンテキスト渡し |
| SE-03    | should handle modifier skill timeout    | タイムアウト処理確認               |
| SE-04    | should retry on modifier skill failure  | リトライ機構確認                   |
| SE-05    | should report progress during modifier  | 進捗報告確認                       |
| SE-06    | should handle abort during modifier     | 中断処理確認                       |

#### 2.3.2 テストコード構造

```typescript
describe("SkillExecutor - Modifier Skill", () => {
  describe("execute modifier", () => {
    it("SE-01: should execute modifier skill");
    it("SE-02: should pass correct context to modifier");
    it("SE-03: should handle modifier skill timeout");
  });

  describe("error handling and retry", () => {
    it("SE-04: should retry on modifier skill failure");
    it("SE-05: should report progress during modifier");
    it("SE-06: should handle abort during modifier");
  });
});
```

---

### 2.4 ModifierSkill テスト（新規）

**ファイル**: `apps/desktop/src/main/slide/__tests__/modifier-skill.test.ts`

#### 2.4.1 テストケース

| テストID | テスト名                                 | 説明                                   |
| -------- | ---------------------------------------- | -------------------------------------- |
| MS-01    | should build correct prompt from context | プロンプト構築確認                     |
| MS-02    | should parse valid JSON response         | JSONレスポンスのパース確認             |
| MS-03    | should extract JSON from markdown block  | マークダウンブロックからのJSON抽出確認 |
| MS-04    | should return error on invalid response  | 不正レスポンスのエラー処理確認         |
| MS-05    | should validate structure changes format | 変更形式のバリデーション確認           |
| MS-06    | should handle empty changes array        | 空の変更配列の処理確認                 |

#### 2.4.2 テストコード構造

```typescript
describe("ModifierSkill", () => {
  describe("prompt building", () => {
    it("MS-01: should build correct prompt from context");
  });

  describe("response parsing", () => {
    it("MS-02: should parse valid JSON response");
    it("MS-03: should extract JSON from markdown block");
    it("MS-04: should return error on invalid response");
  });

  describe("validation", () => {
    it("MS-05: should validate structure changes format");
    it("MS-06: should handle empty changes array");
  });
});
```

---

## 3. 統合テスト仕様

### 3.1 ファイル変更フローテスト

**ファイル**: `apps/desktop/src/main/slide/__tests__/slide-integration.test.ts`

#### 3.1.1 テストケース

| テストID | テスト名                                      | 説明                     |
| -------- | --------------------------------------------- | ------------------------ |
| IT-01    | should trigger reverseSync on html change     | HTML変更→逆同期トリガー  |
| IT-02    | should update structure.md on successful sync | 成功時のstructure.md更新 |
| IT-03    | should prevent infinite loop on bidirectional | 双方向無限ループ防止     |
| IT-04    | should emit correct IPC events                | 正しいIPCイベント発火    |
| IT-05    | should handle concurrent sync requests        | 同時リクエスト処理       |
| IT-06    | should recover from Agent SDK failure         | Agent SDK障害からの回復  |

---

## 4. 境界値テスト

### 4.1 ファイルサイズ境界

| テストID | テスト名                                  | 境界値               |
| -------- | ----------------------------------------- | -------------------- |
| BV-01    | should accept html at size limit (10MB)   | 10MB（上限ぴったり） |
| BV-02    | should reject html over size limit        | 10MB + 1byte（超過） |
| BV-03    | should accept structure.md at limit (1MB) | 1MB（上限ぴったり）  |
| BV-04    | should reject structure.md over limit     | 1MB + 1byte（超過）  |

### 4.2 タイムアウト境界

| テストID | テスト名                            | 境界値                  |
| -------- | ----------------------------------- | ----------------------- |
| BV-05    | should complete just before timeout | 29999ms（ぎりぎり成功） |
| BV-06    | should timeout at 30 seconds        | 30001ms（タイムアウト） |

### 4.3 TTL境界

| テストID | テスト名                        | 境界値              |
| -------- | ------------------------------- | ------------------- |
| BV-07    | should ignore change at 999ms   | 999ms（TTL内）      |
| BV-08    | should process change at 1001ms | 1001ms（TTL経過後） |

---

## 5. モック戦略

### 5.1 Agent SDK モック

```typescript
// Agent SDK のモック定義
const mockAgentAPI = {
  query: vi.fn(),
  abort: vi.fn(),
  getStatus: vi.fn(),
  onMessage: vi.fn(),
};

vi.mock("../agent-client", () => ({
  getAgentAPI: () => mockAgentAPI,
}));
```

### 5.2 ファイルシステムモック

```typescript
// fsのモック定義
vi.mock("fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  stat: vi.fn(),
}));
```

### 5.3 Chokidarモック

```typescript
// chokidarのモック定義（既存パターンを使用）
class MockWatcher {
  private events: Map<string, Array<(...args: unknown[]) => void>> = new Map();
  close = vi.fn();

  on(event: string, handler: (...args: unknown[]) => void): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(handler);
    return this;
  }

  emit(event: string, ...args: unknown[]): boolean {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(...args));
      return true;
    }
    return false;
  }
}
```

---

## 6. テスト環境

### 6.1 テストフレームワーク

| 項目                   | 設定            |
| ---------------------- | --------------- |
| フレームワーク         | Vitest          |
| アサーションライブラリ | Vitest (expect) |
| モックライブラリ       | Vitest (vi)     |
| カバレッジツール       | c8              |

### 6.2 テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# 特定ファイルのテスト実行
pnpm --filter @repo/desktop test file-watcher

# カバレッジ付きテスト
pnpm --filter @repo/desktop test:coverage

# ウォッチモード
pnpm --filter @repo/desktop test:watch
```

---

## 7. カバレッジ目標

### 7.1 カバレッジ基準

| メトリクス     | 目標 | 最低限 |
| -------------- | ---- | ------ |
| 行カバレッジ   | 90%  | 80%    |
| 分岐カバレッジ | 85%  | 75%    |
| 関数カバレッジ | 95%  | 85%    |
| ステートメント | 90%  | 80%    |

### 7.2 除外対象

- ログ出力文
- 型定義ファイル
- インデックスファイル（re-export のみ）

---

## 8. 関連ドキュメント

| ドキュメント       | パス                                         |
| ------------------ | -------------------------------------------- |
| テストケース       | `outputs/phase-4/test-cases.md`              |
| 統合テスト設計書   | `outputs/phase-4/integration-test-design.md` |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     |
