# Phase 9: 品質保証

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 9                            |
| 機能名 | multi-select-user-input-kind |
| 作成日 | 2026-03-29                   |

## 目的

lint、typecheck、対象テスト、link 整合を確認し、task spec と実装計画のズレを残さない。

## 実行タスク

- task spec validator を再実行する
- shared type / engine / renderer の対象テストを再実行する
- typecheck と link 整合を確認する
- blocker があれば Phase 5〜8 へ戻す

## 参照資料

| 資料名           | パス                                                               | 説明          |
| ---------------- | ------------------------------------------------------------------ | ------------- |
| Phase 7 coverage | `phase-7-coverage-check.md`                                        | coverage 根拠 |
| commands         | `.agents/skills/task-specification-creator/references/commands.md` | validator     |

## 実行手順

### 想定コマンド

```bash
node .agents/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/step-09-par-task-rt-05-multi-select-user-input-kind

node .agents/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/step-09-par-task-rt-05-multi-select-user-input-kind --json
```

## 統合テスト連携

- Phase 10 の最終 gate は Phase 9 のコマンド結果をそのまま根拠にする
- Phase 12 の documentation changelog に validator 結果を転記する

## 成果物

| 成果物         | パス                                | 説明                |
| -------------- | ----------------------------------- | ------------------- |
| QA 仕様        | `phase-9-quality-assurance.md`      | 実行コマンドと gate |
| quality report | `outputs/phase-9/quality-report.md` | validator 結果      |

## 完了条件

- [ ] validator の再実行手順が定義されている
- [ ] テストと typecheck の確認観点が定義されている
- [ ] blocker 返却条件が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
