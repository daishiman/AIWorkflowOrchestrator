# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                                |
| ------ | ------------------------------------------------- |
| Phase  | 11                                                |
| 機能名 | task-execute-async-snapshot-error-propagation-001 |
| 作成日 | 2026-04-18                                        |

## 目的

NON_VISUAL タスクとして、手動 UI 撮影ではなく自動テストと実行記録を正本証跡にする。

## NON_VISUAL 宣言【必須】

| 項目               | 内容                    |
| ------------------ | ----------------------- |
| タスク種別         | NON_VISUAL              |
| UI変更             | なし                    |
| スクリーンショット | 不要                    |
| 主証跡             | `manual-test-result.md` |

**スクリーンショットを作らない理由**:

- `RuntimeSkillCreatorFacade.executeAsync()` と IPC relay の確認が主である
- Renderer の新規 UI 変更を含まない
- 代替証跡として targeted test / typecheck / lint を残せる

## 実行タスク

- NON_VISUAL 宣言を `manual-test-result.md` に記録する
- 自動テスト結果を証跡として要約する
- 発見課題を `discovered-issues.md` に記録する（0件でも出力必須）

## 参照資料

| 資料名          | パス                                                                                              | 説明                 |
| --------------- | ------------------------------------------------------------------------------------------------- | -------------------- |
| Phase 2 成果物  | `outputs/phase-2/design-notes.md`                                                                 | 契約判断の前提       |
| Phase 5 成果物  | `outputs/phase-5/implementation-notes.md`                                                         | no-op / 修正有無     |
| Phase 6 成果物  | `outputs/phase-6/test-expansion.md`                                                               | 追加テスト要否       |
| Phase 7 成果物  | `outputs/phase-7/coverage-report.md`                                                              | カバレッジ確認       |
| Phase 8 成果物  | `outputs/phase-8/refactoring-notes.md`                                                            | 冗長説明削除結果     |
| Phase 9 成果物  | `outputs/phase-9/quality-assurance-report.md`                                                     | 実行コマンドの再確認 |
| Phase 10 成果物 | `outputs/phase-10/final-review-result.md`                                                         | 持越し論点確認       |
| runtime テスト  | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | 主証跡               |
| IPC テスト      | `apps/desktop/src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts`                     | relay 証跡           |

## 実行手順

### Step 1: 代替証跡の取得

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts \
  src/main/ipc/__tests__/creatorHandlers.fire-and-forget.test.ts
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

### Step 2: `manual-test-result.md` 記録内容

`outputs/phase-11/manual-test-result.md` には次を必ず含める。

- 証跡の主ソース
- 実行コマンド
- 実行件数サマリー
- edge case 一覧表
- 仕様判断根拠
- スクリーンショットを作らない理由

### Step 3: 発見課題の記録

`outputs/phase-11/discovered-issues.md` を 0件でも作成する。

## 成果物

| 成果物                   | パス                                        | 必須 |
| ------------------------ | ------------------------------------------- | ---- |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | 必須 |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 必須 |
| 発見課題一覧             | `outputs/phase-11/discovered-issues.md`     | 必須 |

## 完了条件

- [ ] NON_VISUAL 宣言を記録した
- [ ] 証跡の主ソースと件数を記録した
- [ ] スクリーンショット不要理由を記録した
- [ ] 発見課題一覧を 0件でも出力した

## 次Phase

→ [Phase 12: ドキュメント更新](phase-12-documentation.md)
