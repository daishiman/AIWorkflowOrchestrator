# テスト仕様書 - システムプロンプトのLLM API統合

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| タスクID   | TASK-CHAT-SYSPROMPT-LLM-001 |
| Phase      | 4                           |
| 作成日     | 2026-01-23                  |
| ステータス | 完了                        |

---

## 1. テスト戦略

### 1.1 テストアプローチ

- **TDD (Test-Driven Development)**: テストファーストで実装
- **モック戦略**: 外部依存（LLM API、Electron IPC）はモック化
- **カバレッジ目標**: Line Coverage 80%以上

### 1.2 テストレイヤー

| レイヤー | 対象               | テストファイル           |
| -------- | ------------------ | ------------------------ |
| ユニット | buildMessages関数  | `buildMessages.test.ts`  |
| ユニット | aiHandlers LLM統合 | `aiHandlers.llm.test.ts` |
| 統合     | IPC通信フロー      | `aiHandlers.llm.test.ts` |

---

## 2. テスト対象

### 2.1 buildMessages関数

**ファイル**: `apps/desktop/src/main/utils/buildMessages.ts`

**責務**: ユーザーメッセージとシステムプロンプトからLLMメッセージ配列を構築

**テストカテゴリ**:

| カテゴリ | テスト内容                   |
| -------- | ---------------------------- |
| 正常系   | システムプロンプトあり/なし  |
| 空白処理 | 空文字、空白のみ、トリム処理 |
| 境界値   | 1文字、長文、Unicode         |
| 順序確認 | systemがuserの前に配置される |

### 2.2 aiHandlers - LLM API統合

**ファイル**: `apps/desktop/src/main/ipc/aiHandlers.ts`

**責務**: IPC経由のチャットリクエストをLLM APIに転送し、レスポンスを返却

**テストカテゴリ**:

| カテゴリ               | テスト内容                                   |
| ---------------------- | -------------------------------------------- |
| システムプロンプト統合 | メッセージ構築、API呼び出し                  |
| プロバイダー選択       | アダプター取得、モデルID指定                 |
| エラーハンドリング     | APIキー未設定、LLMエラー、ネットワークエラー |
| 会話ID管理             | 新規生成、既存維持                           |
| RAGソース              | 有効/無効時の動作                            |

---

## 3. モック戦略

### 3.1 モック対象

| モジュール             | モック理由                   |
| ---------------------- | ---------------------------- |
| `electron`             | Electron IPCのテスト不可     |
| `LLMAdapterFactory`    | 外部API呼び出しを避ける      |
| `getSelectedLLMConfig` | Redux Store依存を排除        |
| `buildMessages`        | 他テストとの分離             |
| `SecureStorage`        | システムキーチェーン依存排除 |

### 3.2 モックパターン

```typescript
// vi.mock() でモジュールをモック化
vi.mock("../../adapters/llm/LLMAdapterFactory", () => ({
  LLMAdapterFactory: {
    getAdapter: vi.fn(),
  },
}));

// テスト内でモックの戻り値を設定
vi.mocked(LLMAdapterFactory.getAdapter).mockResolvedValue(mockAdapter);
```

---

## 4. カバレッジ目標

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## 5. テスト実行

### 5.1 コマンド

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# 特定ファイル実行
pnpm --filter @repo/desktop test buildMessages.test
pnpm --filter @repo/desktop test aiHandlers.llm.test

# カバレッジ付き
pnpm --filter @repo/desktop test:coverage
```

### 5.2 TDD検証（Red状態）

Phase 4完了時点では、実装が未完了のためテストは失敗状態（Red）となる。

```
✗ buildMessages → モジュール未作成
✗ aiHandlers.llm → LLM統合未実装
```

---

## 更新履歴

| 日付       | 版  | 変更内容 | 作成者 |
| ---------- | --- | -------- | ------ |
| 2026-01-23 | 1.0 | 初版作成 | Claude |
