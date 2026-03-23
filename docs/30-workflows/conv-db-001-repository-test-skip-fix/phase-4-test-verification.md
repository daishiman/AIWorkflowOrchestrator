# Phase 4: テストコード静的確認（リビルド前）

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 4                                    |
| 機能名 | conv-db-001-repository-test-skip-fix |
| 作成日 | 2026-03-22                           |

## 目的

既存の75件テストの構造を確認し、テストコードの変更が不要であることを検証する。リビルド後にテストが正常に実行できる状態であることを事前に確認する。

## 実行タスク

- テスト構造確認: 75件テストの分類と依存関係を確認
- P9チェック: テスト間のDB状態リーク防止が正しく実装されているか確認
- スキップ条件確認: `describeIfBetterSqlite3` の条件ロジックが正しいか確認
- テストコード不変確認: テストコードに変更が不要であることを確認

## 参照資料

| 資料名            | パス                                                                                | 説明                       |
| ----------------- | ----------------------------------------------------------------------------------- | -------------------------- |
| Phase 2 設計      | `docs/30-workflows/conv-db-001-repository-test-skip-fix/phase-2-design.md`          | リビルド戦略・影響範囲     |
| Phase 3 レビュー  | `docs/30-workflows/conv-db-001-repository-test-skip-fix/phase-3-design-review.md`   | レビュー結果               |
| P9 既知の落とし穴 | `.claude/rules/06-known-pitfalls.md#P9`                                             | テスト間DB状態リーク       |
| テストファイル    | `apps/desktop/src/main/repositories/__tests__/conversationRepository.test.ts`       | 対象テストコード           |
| DB実装コア仕様    | `.claude/skills/aiworkflow-requirements/references/database-implementation-core.md` | SQLite/better-sqlite3 設計 |
| IPC永続化アーキ   | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`         | ConversationRepository構成 |

## 実行手順

### ステップ1: テスト構造の確認

#### テストケース分類（75件）

| describe グループ                  | テスト件数 | テストID接頭辞 |
| ---------------------------------- | ---------- | -------------- |
| listConversations                  | 10         | CR-LC-01〜10   |
| getConversation                    | 6          | CR-GC-01〜06   |
| createConversation                 | 11         | CR-CC-01〜11   |
| updateConversation                 | 8          | CR-UC-01〜08   |
| deleteConversation                 | 4          | CR-DC-01〜04   |
| addMessage                         | 11         | CR-AM-01〜11   |
| searchConversations                | 7          | CR-SC-01〜07   |
| Edge Cases - Concurrent Operations | 2          | EC-CO-01〜02   |
| Edge Cases - Soft Delete           | 1          | EC-SD-01       |
| Edge Cases - Update Validation     | 3          | EC-UV-01〜03   |
| Edge Cases - Update Metadata       | 2          | EC-UM-01〜02   |
| Edge Cases - Search                | 3          | EC-SR-01〜03   |
| Integration - Full Lifecycle       | 2          | INT-FL-01〜02  |
| Integration - Data Persistence     | 1          | INT-DP-01      |
| Integration - Performance          | 2          | INT-PF-01〜02  |
| Boundary Tests - Large Data Sets   | 2          | BT-LD-01〜02   |
| **合計**                           | **75**     |                |

### ステップ2: P9 チェック（テスト間 DB 状態リーク防止）

テストファイル L94-103 の `beforeEach` / `afterEach` を確認:

```typescript
// L94-97: beforeEach で毎回新しい :memory: DB を作成
beforeEach(() => {
  db = createTestDB();
  repository = new ConversationRepository(db);
});

// L99-103: afterEach で DB を確実にクローズ
afterEach(() => {
  if (db) {
    db.close();
  }
});
```

**P9 チェック結果**: PASS

- 各テストで独立した `:memory:` DB を使用（ファイルDBではなくインメモリ）
- `beforeEach` で毎回新規作成
- `afterEach` で確実にクローズ
- テスト間の状態リークリスクなし

### ステップ3: スキップ条件ロジックの確認

テストファイル L19-37 の `describeIfBetterSqlite3` ロジック:

```typescript
// L19: createRequire でCJS互換のrequireを作成
const require = createRequire(import.meta.url);
let BetterSqlite3Ctor: BetterSqlite3Constructor | null = null;

try {
  // L22: better-sqlite3 をCJS形式でロード
  const loaded = require("better-sqlite3");
  const candidateCtor = "default" in loaded ? loaded.default : loaded;

  // L29-30: ネイティブバイナリの実動作テスト
  const probe = new candidateCtor(":memory:");
  probe.close();

  // L32: 成功時のみコンストラクタを保存
  BetterSqlite3Ctor = candidateCtor;
} catch {
  // L34: 失敗時はnullのまま
  BetterSqlite3Ctor = null;
}

// L37: null → describe.skip、非null → describe
const describeIfBetterSqlite3 = BetterSqlite3Ctor ? describe : describe.skip;
```

**ロジック確認結果**: PASS

- モジュール解決だけでなく、実際のDB作成（`:memory:`）までプローブしている
- `default` エクスポートとモジュール直接エクスポートの両方に対応
- リビルド後にネイティブバイナリが正しくロードされれば、自動的に `describe` に解決される
- テストコードの変更は不要

### ステップ4: テストコード不変確認

テストコードに変更が不要であることを確認:

| 確認項目                                                             | 結果 | 理由                                                |
| -------------------------------------------------------------------- | ---- | --------------------------------------------------- |
| `describeIfBetterSqlite3` の条件ロジックは正しいか                   | OK   | ネイティブバイナリ存在時に自動的に describe に解決  |
| `createTestDB()` のスキーマは `conversationDatabase.ts` と一致するか | OK   | 同じテーブル定義（`CREATE TABLE` / `CREATE INDEX`） |
| `ConversationRepository` の import パスは正しいか                    | OK   | `../conversationRepository` で正常解決              |
| テストで使用する型（`Message`等）の import は正しいか                | OK   | `../../shared/types/conversation` で正常解決        |

**結論**: テストコードの変更は不要。リビルドのみで75件全テストが実行可能になる。

## 統合テスト連携

Phase 4 では以下を確認済み:

- テスト間の状態分離が正しく実装されている（P9 準拠）
- テストファイルのスキップ条件がリビルドで自動解決される設計

Phase 5 でリビルド後、実際にテストを実行して75件 PASS を確認する。

## 成果物

| 成果物                 | パス                                                                                  | 説明           |
| ---------------------- | ------------------------------------------------------------------------------------- | -------------- |
| テストコード静的確認書 | `docs/30-workflows/conv-db-001-repository-test-skip-fix/phase-4-test-verification.md` | 本ドキュメント |

## 完了条件

- [ ] 75件テストの分類と構造が確認されている
- [ ] P9 チェック（テスト間 DB 状態リーク防止）が PASS
- [ ] `describeIfBetterSqlite3` の条件ロジックが正しいことが確認されている
- [ ] テストコードの変更が不要であることが確認されている
- [ ] 本Phase内の全タスクを100%実行完了

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断               | 仕様参照先                                                 |
| ------------ | ---------------------- | ---------------------------------------------------------- |
| データ整合性 | DB操作テストの構造確認 | `aiworkflow-requirements: database-implementation-core.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. テスト構造の確認
2. P9 チェック（テスト間 DB 状態リーク防止）の実施
3. スキップ条件ロジックの確認
4. テストコード不変確認の実施
5. 成果物の作成・配置
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/conv-db-001-repository-test-skip-fix --phase 4
```

## 次のPhase

Phase 5: 実装
