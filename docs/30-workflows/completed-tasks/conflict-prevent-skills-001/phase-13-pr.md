# Phase 13: PR 作成

## メタ情報

| 項目 | 値 |
| --- | --- |
| Phase | 13 |
| 機能名 | conflict-prevent-skills-001 |
| 作成日 | 2026-04-18 |

## 目的

user approval 取得後にのみ PR 準備へ進めるよう、blocked 条件と必要証跡を固定する。

## 実行タスク

1. blocked 理由を明記する
2. Phase 12 までの完了根拠を整理する
3. approval 後に必要な local check と PR 情報の雛形を定義する

## 参照資料

| 資料名 | パス | 用途 |
| --- | --- | --- |
| phase 13 template | `.agents/skills/task-specification-creator/references/phase-template-phase13.md` | blocked ルール |
| phase 12 doc | `docs/30-workflows/conflict-prevent-skills-001/phase-12-documentation.md` | close-out 前提 |

## 実行手順

### ステップ1: blocked 条件

- user の明示承認が出るまで `blocked`
- commit / push / PR 作成を自動化しない

### ステップ2: approval 後の準備

- local check 結果を `outputs/phase-13/local-check-result.md` にまとめる
- change summary を `outputs/phase-13/change-summary.md` にまとめる
- PR 本文案を `outputs/phase-13/pr-info.md` にまとめる

## 統合テスト連携

- local check は Phase 9 / 12 の結果を再利用する

## 多角的チェック観点（AIが判断）

- 批判的思考: approval なしに進む抜け道がないか
- 戦略的思考: blocked のままでも次の人が再開しやすいか

## サブタスク管理

| SubTask | 内容 | 担当 |
| --- | --- | --- |
| ST-25 | blocked 理由の維持 | Lane C |

## 成果物

- `outputs/phase-13/local-check-result.md`
- `outputs/phase-13/change-summary.md`
- `outputs/phase-13/pr-info.md`

## 完了条件

- [ ] user approval 必須が明記されている
- [ ] blocked 理由が明記されている
- [ ] approval 後の成果物パスが定義されている

## タスク100%実行確認【必須】

- [ ] blocked 条件を記載した
- [ ] 成果物パスを記載した
- [ ] commit / PR 自動実行禁止を記載した

## 次Phase

user approval を受けた時点でのみ実行する。
