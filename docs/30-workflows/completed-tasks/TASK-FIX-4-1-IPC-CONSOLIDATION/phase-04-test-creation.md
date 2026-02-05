# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 4                              |
| 機能名 | TASK-FIX-4-1-IPC-CONSOLIDATION |
| 作成日 | 2026-02-04                     |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

## 実行タスク

### Task 1: チャンネル定義テスト

**目的**: IPC_CHANNELS定数が仕様通り定義されていることを検証する

**テストケース**:

| No  | テスト項目                             | 期待結果                           |
| --- | -------------------------------------- | ---------------------------------- |
| 1   | SKILL_LIST定数が存在する               | `skill:list`と等しい               |
| 2   | SKILL_SCAN定数が存在する               | `skill:scan`と等しい               |
| 3   | SKILL_GET_IMPORTED定数が存在する       | `skill:getImported`と等しい        |
| 4   | SKILL_EXECUTE定数が存在する            | `skill:execute`と等しい            |
| 5   | SKILL_COMPLETE定数が存在する           | `skill:complete`と等しい           |
| 6   | SKILL_PERMISSION_REQUEST定数が存在する | `skill:permission:request`と等しい |
| 7   | 旧チャンネル名が存在しない             | `skill:list-available`が未定義     |

### Task 2: ホワイトリストテスト

**目的**: ホワイトリストが正しく構成されていることを検証する

**テストケース**:

| No  | テスト項目                                    | 期待結果                    |
| --- | --------------------------------------------- | --------------------------- |
| 1   | ALLOWED_INVOKE_CHANNELSにskill:listが含まれる | true                        |
| 2   | ALLOWED_ON_CHANNELSにskill:completeが含まれる | true                        |
| 3   | 旧チャンネルがホワイトリストに含まれない      | skill:list-availableがfalse |
| 4   | 全スキルチャンネルがいずれかに登録されている  | 12チャンネル全て登録        |

### Task 3: safeInvoke/safeOnテスト

**目的**: 安全なIPC呼び出しパターンが機能することを検証する

**テストケース**:

| No  | テスト項目                                       | 期待結果         |
| --- | ------------------------------------------------ | ---------------- |
| 1   | 許可されたチャンネルでsafeInvokeが成功する       | Promise resolves |
| 2   | 許可されていないチャンネルでsafeInvokeが失敗する | Promise rejects  |
| 3   | 許可されたチャンネルでsafeOnが成功する           | リスナー登録成功 |
| 4   | 許可されていないチャンネルでsafeOnが失敗する     | リスナー登録失敗 |

### Task 4: ハンドラー統合テスト

**目的**: 新チャンネル名でハンドラーが正しく動作することを検証する

**テストケース**:

| No  | テスト項目                            | 期待結果             |
| --- | ------------------------------------- | -------------------- |
| 1   | skill:listでスキル一覧を取得できる    | OperationResult成功  |
| 2   | skill:executeでスキル実行を開始できる | executionId返却      |
| 3   | skill:completeイベントを受信できる    | コールバック呼び出し |

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 設計書       | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| 設計レビュー | `outputs/phase-3/design-review-result.md`    | Phase 3成果物 |

## 統合テスト連携【必須】

統合テストシナリオを設計する:

| シナリオカテゴリ | 検証内容                         | テストファイル               |
| ---------------- | -------------------------------- | ---------------------------- |
| チャンネル定義   | IPC_CHANNELS定数の完全性         | `channels.test.ts`           |
| ホワイトリスト   | ALLOWED\_\*\_CHANNELSの正確性    | `channels.whitelist.test.ts` |
| IPC通信          | safeInvoke/safeOnパターン        | `skill-api.test.ts`          |
| ハンドラー統合   | 新チャンネル名でのハンドラー動作 | `skillHandlers.test.ts`      |

## アーキテクチャ層別テスト

| 層           | テスト観点                     | テストファイル配置                     |
| ------------ | ------------------------------ | -------------------------------------- |
| Preload      | チャンネル定義、ホワイトリスト | `apps/desktop/src/preload/__tests__/`  |
| Main Process | ハンドラー登録、チャンネル処理 | `apps/desktop/src/main/ipc/__tests__/` |
| 統合         | End-to-End IPC通信             | `apps/desktop/src/__tests__/`          |

## 成果物

| 成果物             | パス                                         | 説明               |
| ------------------ | -------------------------------------------- | ------------------ |
| テスト仕様書       | `outputs/phase-4/test-specification.md`      | テスト設計         |
| テストケース       | `outputs/phase-4/test-cases.md`              | ケース一覧         |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md` | 統合テスト設計     |
| テストファイル     | `apps/desktop/src/**/*.test.ts`              | 実際のテストコード |

## 完了条件

- [ ] チャンネル定義テストが作成されている
- [ ] ホワイトリストテストが作成されている
- [ ] safeInvoke/safeOnテストが作成されている
- [ ] ハンドラー統合テストが作成されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## 次のPhase

Phase 5: 実装（TDD: Green）
