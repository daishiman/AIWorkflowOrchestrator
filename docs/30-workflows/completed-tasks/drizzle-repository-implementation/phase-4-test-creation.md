# Phase 4: テスト作成（TDD Red） - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 4                                 |
| Phase名    | テスト作成（TDD Red）             |
| 前提Phase  | Phase 3                           |
| 後続Phase  | Phase 5                           |
| ステータス | 未実施                            |
| 作成日     | 2026-01-22                        |
| 機能名     | drizzle-repository-implementation |

---

## 目的

TDD（テスト駆動開発）のRedフェーズとして、実装前に失敗するテストケースを作成する。

## 背景

テスト駆動開発では、まず失敗するテスト（Red）を書き、次にテストを通す最小限の実装（Green）を行い、最後にリファクタリング（Refactor）を行う。本Phaseでは、DrizzleリポジトリのテストをRed状態で作成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テスト環境セットアップ

**目的**: Drizzleリポジトリテスト用の環境を構築する

**実行手順**:

1. テストファイルを作成:
   - `packages/shared/src/features/chat-history/infrastructure/persistence/__tests__/DrizzleChatSessionRepository.test.ts`
   - `packages/shared/src/features/chat-history/infrastructure/persistence/__tests__/DrizzleChatMessageRepository.test.ts`
2. テストヘルパーを作成（必要に応じて）:
   - `packages/shared/src/features/chat-history/infrastructure/persistence/__tests__/helpers/test-db.ts`
3. インメモリSQLiteのセットアップコードを実装:

   ```typescript
   import { drizzle } from "drizzle-orm/better-sqlite3";
   import Database from "better-sqlite3";
   import * as schema from "@/db/schema/chat-history";

   function createTestDb() {
     const sqlite = new Database(":memory:");
     const db = drizzle(sqlite, { schema });
     // マイグレーション実行
     return db;
   }
   ```

4. beforeEach/afterEach でDB初期化・クリーンアップを設定

**期待される成果物**:

- テストファイル2つ（スケルトン状態）
- テストヘルパー（test-db.ts）

---

### タスク2: DrizzleChatSessionRepository テストケース作成

**目的**: セッションリポジトリの全メソッドに対するテストケースを作成する

**実行手順**:

1. `findById` テストケース:

   ```typescript
   describe("findById", () => {
     it("should return session when exists", async () => {
       // Arrange: テストデータ挿入
       // Act: findById呼び出し
       // Assert: 取得したセッションを検証
     });

     it("should return null when not exists", async () => {
       // ...
     });
   });
   ```

2. `findByUserId` テストケース:
   - ユーザーの全セッション取得
   - ページネーション（limit/offset）
   - 空配列の場合
3. `findPinned` テストケース:
   - ピン留めセッションのみ取得
   - pinOrder順でソート
4. `search` テストケース（FTS5）:
   - キーワード検索
   - 部分一致
   - マッチなしの場合
5. `save` テストケース:
   - 新規作成
   - 更新（upsert）
6. `delete` テストケース:
   - 存在するセッション削除
   - 存在しないセッション削除
7. `exists` テストケース
8. `countPinned` テストケース

**期待される成果物**:

- `DrizzleChatSessionRepository.test.ts`: 全メソッドのテストケース（Red状態）

---

### タスク3: DrizzleChatMessageRepository テストケース作成

**目的**: メッセージリポジトリの全メソッドに対するテストケースを作成する

**実行手順**:

1. `findById` テストケース
2. `findBySessionId` テストケース:
   - セッション内の全メッセージ取得
   - messageIndex順でソート
   - ページネーション
3. `findLatestBySessionId` テストケース:
   - 最新メッセージ取得
   - メッセージがない場合
4. `countBySessionId` テストケース
5. `save` テストケース:
   - 新規作成
   - 更新
6. `saveMany` テストケース:
   - バッチ挿入
   - 空配列の場合
7. `delete` テストケース
8. `deleteBySessionId` テストケース:
   - セッションの全メッセージ削除

**期待される成果物**:

- `DrizzleChatMessageRepository.test.ts`: 全メソッドのテストケース（Red状態）

---

### タスク4: エラーケーステスト作成

**目的**: エラーハンドリングのテストケースを作成する

**実行手順**:

1. 存在しないIDでのfindById → null返却
2. 存在しないセッションへのメッセージ保存 → エラー
3. 重複ID挿入（同一IDで2回insert）→ upsert動作確認
4. 無効なデータ（空文字タイトル等）→ Mapper側でエラー

**期待される成果物**:

- 各テストファイルにエラーケースのテストを追加

---

### タスク5: 統合テストシナリオ作成

**目的**: SessionとMessage間の連携テストを作成する

**実行手順**:

1. セッション作成 → メッセージ追加 → メッセージ取得シナリオ
2. セッション削除時のメッセージカスケード削除シナリオ
3. FTS5検索とセッション取得の連携シナリオ
4. トランザクションを使用した複数操作シナリオ

**期待される成果物**:

- 統合テストファイル または 各テストファイルに統合テストセクション追加

---

### タスク6: テストRed状態確認

**目的**: 作成したテストが全て失敗することを確認する

**実行手順**:

1. テスト実行:
   ```bash
   pnpm --filter @repo/shared test -- --grep "DrizzleChatSessionRepository"
   pnpm --filter @repo/shared test -- --grep "DrizzleChatMessageRepository"
   ```
2. 全テストがFAIL（Red状態）であることを確認
3. 失敗理由が「実装がない」ためであることを確認
4. テストコードの型エラーがないことを確認:
   ```bash
   pnpm --filter @repo/shared typecheck
   ```

**期待される成果物**:

- `outputs/phase-4/test-red-confirmation.md`: Red状態確認レポート

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                           | 内容              |
| -------------------- | ------------------------------------------------------------------------------ | ----------------- |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | Repository IF定義 |

### Phase 2成果物

| 参照資料      | パス                                                        | 内容       |
| ------------- | ----------------------------------------------------------- | ---------- |
| Session設計書 | `outputs/phase-2/drizzle-chat-session-repository-design.md` | クラス設計 |
| Message設計書 | `outputs/phase-2/drizzle-chat-message-repository-design.md` | クラス設計 |
| テスト戦略    | `outputs/phase-2/test-strategy.md`                          | テスト方針 |

---

## 成果物

| 成果物                  | パス                                                                                                                  | 内容             |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Sessionリポジトリテスト | `packages/shared/src/features/chat-history/infrastructure/persistence/__tests__/DrizzleChatSessionRepository.test.ts` | テストコード     |
| Messageリポジトリテスト | `packages/shared/src/features/chat-history/infrastructure/persistence/__tests__/DrizzleChatMessageRepository.test.ts` | テストコード     |
| テストヘルパー          | `packages/shared/src/features/chat-history/infrastructure/persistence/__tests__/helpers/test-db.ts`                   | DB初期化ヘルパー |
| Red状態確認レポート     | `outputs/phase-4/test-red-confirmation.md`                                                                            | 確認結果         |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 4での統合テスト連携アクション**:

- DB接続モック・実DBテストシナリオを全カテゴリで作成
- SessionとMessageの連携テストシナリオを作成
- FTS5全文検索テストシナリオを作成
- トランザクションテストシナリオを作成

---

## 完了条件

- [ ] DrizzleChatSessionRepository の全メソッド（7メソッド）のテストケースが作成されている
- [ ] DrizzleChatMessageRepository の全メソッド（8メソッド）のテストケースが作成されている
- [ ] エラーケーステストが作成されている
- [ ] 統合テストシナリオが作成されている
- [ ] 全テストがRed状態（失敗）であることが確認されている
- [ ] テストコードの型エラーがないことが確認されている

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --grep "Drizzle"
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）がPASS/MINORで完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/drizzle-repository-implementation/phase-5-implementation.md`
