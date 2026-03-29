# Phase 13: PR作成

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 13                               |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

user 承認前提の blocked state を維持しつつ、local check と change summary までを準備する。

## 実行タスク

- local check を実行する
- change summary を作成する
- blocked 理由を記録する

## 参照資料

| 資料名            | パス                                                                             | 説明           |
| ----------------- | -------------------------------------------------------------------------------- | -------------- |
| Phase 12 結果     | `phase-12-documentation.md`                                                      | close-out      |
| Phase 13 テンプレ | `.agents/skills/task-specification-creator/references/phase-template-phase13.md` | blocked ルール |

## 実行手順

### ステップ1: local check

```bash
pnpm typecheck
pnpm lint
pnpm vitest run
```

### ステップ2: blocked 記録

- user approval がないため commit / PR は実行しない
- `spec_created` task のため local check と summary までで止める

## 統合テスト連携

- 承認後のみ PR 作成へ進む

## 成果物

| 成果物               | パス                                     | 説明             |
| -------------------- | ---------------------------------------- | ---------------- |
| ローカルチェック結果 | `outputs/phase-13/local-check-result.md` | コマンド結果要約 |
| 変更サマリ           | `outputs/phase-13/change-summary.md`     | 変更点要約       |

## 完了条件

- [ ] local check 結果が記録されている
- [ ] blocked 理由が明記されている
- [ ] user approval なしで commit / PR を要求していない
- [ ] **本Phase内の全タスクを100%実行完了**
