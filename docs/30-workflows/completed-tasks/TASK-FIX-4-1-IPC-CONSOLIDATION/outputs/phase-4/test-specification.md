# テスト仕様書

## メタ情報

| 項目   | 値              |
| ------ | --------------- |
| Phase  | 4               |
| 作成日 | 2026-02-04      |
| 作成者 | Claude Opus 4.5 |

---

## 1. テストスコープ

### 1.1 対象テストファイル

| テストファイル                       | 内容                         |
| ------------------------------------ | ---------------------------- |
| `channels.ipc-consolidation.test.ts` | IPC統合テスト（新規追加）    |
| `channels.skill-import.test.ts`      | 既存チャンネルテスト（維持） |

---

## 2. テストケース一覧

### 2.1 旧チャンネル削除テスト

| No  | テスト項目                                                | 期待結果  |
| --- | --------------------------------------------------------- | --------- |
| 1   | SKILL_LIST_AVAILABLEがIPC_CHANNELSに存在しない            | undefined |
| 2   | skill:list-availableがALLOWED_INVOKE_CHANNELSに含まれない | false     |
| 3   | SKILL_LIST_IMPORTEDがIPC_CHANNELSに存在しない             | undefined |
| 4   | skill:list-importedがALLOWED_INVOKE_CHANNELSに含まれない  | false     |

### 2.2 チャンネル統一テスト

| No  | テスト項目                                            | 期待結果 |
| --- | ----------------------------------------------------- | -------- |
| 5   | SKILL_LISTが`skill:list`と等しい                      | true     |
| 6   | SKILL_LISTがALLOWED_INVOKE_CHANNELSに含まれる         | true     |
| 7   | SKILL_GET_IMPORTEDが`skill:getImported`と等しい       | true     |
| 8   | SKILL_GET_IMPORTEDがALLOWED_INVOKE_CHANNELSに含まれる | true     |

### 2.3 ハードコード文字列排除テスト

| No  | テスト項目                                    | 期待結果 |
| --- | --------------------------------------------- | -------- |
| 9   | SKILL_COMPLETEが`skill:complete`と等しい      | true     |
| 10  | SKILL_ERRORが`skill:error`と等しい            | true     |
| 11  | SKILL_COMPLETEがALLOWED_ON_CHANNELSに含まれる | true     |
| 12  | SKILL_ERRORがALLOWED_ON_CHANNELSに含まれる    | true     |

### 2.4 仕様準拠チャンネル完全性テスト

| No  | テスト項目                                  | 期待結果     |
| --- | ------------------------------------------- | ------------ |
| 13  | 仕様書定義の8つのInvokeチャンネルが全て定義 | 全て存在     |
| 14  | 仕様書定義の4つのOnチャンネルが全て定義     | 全て存在     |
| 15  | 全Invokeチャンネルがホワイトリストに登録    | 全て登録済み |
| 16  | 全OnチャンネルがONホワイトリストに登録      | 全て登録済み |

### 2.5 重複チャンネル排除テスト

| No  | テスト項目                 | 期待結果              |
| --- | -------------------------- | --------------------- |
| 17  | skill:list関連の重複がない | skill:listのみ存在    |
| 18  | imported関連の重複がない   | skill:getImportedのみ |

### 2.6 ホワイトリストクリーンアップテスト

| No  | テスト項目                                        | 期待結果   |
| --- | ------------------------------------------------- | ---------- |
| 19  | 旧チャンネルがALLOWED_INVOKE_CHANNELSに含まれない | 含まれない |
| 20  | 旧チャンネルがALLOWED_ON_CHANNELSに含まれない     | 含まれない |

---

## 3. テストカバレッジ目標

| 指標              | 目標 |
| ----------------- | ---- |
| Line Coverage     | 100% |
| Branch Coverage   | 100% |
| Function Coverage | 100% |

※ channels.tsは定数定義のみのため100%を目標

---

## 4. TDD Red状態の確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --grep "TASK-FIX-4-1"

# 期待結果: 実装前はテストが失敗する（Red状態）
```

---

## 5. テストファイル配置

| ファイル      | パス                                                                    |
| ------------- | ----------------------------------------------------------------------- |
| IPC統合テスト | `apps/desktop/src/preload/__tests__/channels.ipc-consolidation.test.ts` |
| 既存テスト    | `apps/desktop/src/preload/__tests__/channels.skill-import.test.ts`      |
