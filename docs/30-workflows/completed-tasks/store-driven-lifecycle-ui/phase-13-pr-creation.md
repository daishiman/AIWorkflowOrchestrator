# Phase 13: PR準備・承認待ち

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase      | 13                        |
| タスクID   | TASK-10A-F                |
| 機能名     | store-driven-lifecycle-ui |
| 作成日     | 2026-03-08                |
| ステータス | 未着手                    |

## 目的

全Phaseの成果物を最終確認し、PR本文とチェックリストを準備する。Phase 12 完了後の成果物は本 completed workflow に統合済みであり、コミット、push、PR作成は**ユーザーの明示的な許可がある場合のみ**実行する。

## 実行タスク

- 成果物最終確認: 全Phase（1-12）の成果物が揃っていることを確認する
- PR本文準備: `outputs/phase-13/pr-body.md` を作成する
- 承認待ち整理: commit / push / `gh pr create` の実行条件を明記する
- 承認後のみ実行: ユーザー許可が出た場合に限り git / gh コマンドを実行する

## 参照資料

| 資料名         | パス                                                                       | 説明                             |
| -------------- | -------------------------------------------------------------------------- | -------------------------------- |
| PR作成ルール   | `.claude/skills/task-specification-creator/references/execute-workflow.md` | PR自動実行禁止と承認ゲートの確認 |
| Git/ツーリング | `.claude/rules/07-git-and-tooling.md`                                      | コミット/PR の実行ルール         |
| 全Phase成果物  | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/`             | 全仕様書と outputs               |
| task-workflow  | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`       | 完了台帳の参照                   |

### システム仕様（aiworkflow-requirements）

- 該当なし（PR準備手順のみ）

### 前提Phase成果物

| 資料名                | パス                                                                                       | 用途                       |
| --------------------- | ------------------------------------------------------------------------------------------ | -------------------------- |
| Phase 1 要件          | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-1-requirements.md`      | FR/NFR要件の最終確認       |
| Phase 2 設計          | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-2-design.md`            | 設計方針の最終確認         |
| Phase 5 実装          | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-5-implementation.md`    | 実装内容の最終確認         |
| Phase 6 テスト        | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-6-test-expansion.md`    | テスト拡充結果の確認       |
| Phase 7 カバレッジ    | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-7-coverage-check.md`    | カバレッジ結果の確認       |
| Phase 8 リファクタ    | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-8-refactoring.md`       | リファクタリング結果の確認 |
| Phase 9 品質          | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-9-quality-assurance.md` | 品質検証結果の確認         |
| Phase 10 レビュー     | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-10-final-review.md`     | 最終レビュー結果の確認     |
| Phase 11 手動テスト   | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-11-manual-test.md`      | 手動テスト結果の確認       |
| Phase 12 ドキュメント | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-12-documentation.md`    | ドキュメント更新結果の確認 |

## 実行手順

### ステップ1: 成果物最終チェックリスト

| Phase | 成果物                      | 確認 |
| ----- | --------------------------- | ---- |
| 1     | 要件定義書                  | [ ]  |
| 2     | 設計書                      | [ ]  |
| 3     | 設計レビュー書              | [ ]  |
| 4     | テスト設計書 + テストコード | [ ]  |
| 5     | 実装コード                  | [ ]  |
| 6     | 拡充テストコード            | [ ]  |
| 7     | カバレッジ確認書            | [ ]  |
| 8     | リファクタリング記録        | [ ]  |
| 9     | 品質検証記録                | [ ]  |
| 10    | 最終レビュー記録            | [ ]  |
| 11    | 手動テスト記録              | [ ]  |
| 12    | 実装ガイド + 仕様書更新     | [ ]  |

### ステップ2: PR本文ドラフト作成

**出力先:** `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-13/pr-body.md`

**PRタイトル候補（70文字以内）:**

```
refactor(skill): SkillCreateWizard/AnalysisViewのstore駆動統合
```

**PR本文テンプレート:**

```markdown
## Summary

- `useSkillAnalysis` の直接 `window.electronAPI.skill.*` 呼び出しを Store action 経由に統一
- `SkillCreateWizard` の既存 Store 契約と一覧同期の整合を確認
- Phase 11/12 の証跡・仕様同期を更新

## Test Plan

- [ ] `pnpm --filter @repo/desktop typecheck`
- [ ] `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/`
- [ ] `verify-all-specs --workflow docs/30-workflows/completed-tasks/store-driven-lifecycle-ui --strict`
- [ ] `validate-phase-output.js docs/30-workflows/completed-tasks/store-driven-lifecycle-ui`
- [ ] Phase 11 screenshot coverage / Phase 12 validator が PASS
```

### ステップ3: ユーザー承認待ちを明記

- この Phase のデフォルト到達点は **PR本文準備完了** までとする
- 本 workflow が移管後の正本であることを明記し、旧 current workflow への参照を残さない
- `git checkout -b` / `git commit` / `git push` / `gh pr create` はユーザーの明示許可後のみ実行する
- ユーザー許可前に remote 変更を発生させない

### ステップ4: 承認後にのみ実行するコマンド

```bash
# ここから先はユーザー承認後のみ
git checkout -b feature/task-10a-f-store-driven-lifecycle-ui
pnpm lint
pnpm typecheck
cd apps/desktop && pnpm vitest run
git add docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/
git commit -m "refactor(skill): SkillCreateWizard/AnalysisViewのstore駆動統合"
git push -u origin feature/task-10a-f-store-driven-lifecycle-ui
gh pr create \
  --title "refactor(skill): SkillCreateWizard/AnalysisViewのstore駆動統合" \
  --body-file docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-13/pr-body.md
```

### ステップ5: 承認後の CI 確認

- [ ] GitHub Actions の CI パイプラインが全て PASS
- [ ] TypeScript 型チェックが PASS
- [ ] ESLint が PASS
- [ ] 全テストが PASS

## 多角的チェック観点

| 観点          | 確認内容                                                                         |
| ------------- | -------------------------------------------------------------------------------- |
| 承認ゲート    | commit / push / PR がユーザー許可後のみ実行される                                |
| 移管整合      | completed 正本のみを handoff 対象としても、移管前 2workflow 監査結果が失われない |
| PRタイトル長  | 70文字以内であること                                                             |
| Summary構成   | 1-3 箇条書きで変更内容を記述する                                                 |
| Test Plan構成 | テスト項目がチェックリスト形式で記述される                                       |
| ブランチ命名  | `feature/` プレフィックスであること                                              |
| remote 安全性 | 許可前に `git push` / `gh pr create` を実行しない                                |

## 成果物

| 成果物     | パス                                                                                      | 説明               |
| ---------- | ----------------------------------------------------------------------------------------- | ------------------ |
| PR準備記録 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-13-pr-creation.md`     | 本ドキュメント     |
| PR本文     | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/outputs/phase-13/pr-body.md` | PR本文テンプレート |
| PR URL     | GitHub PR URL                                                                             | ユーザー承認後のみ |

## 完了条件

- [ ] 全Phase（1-12）の成果物が揃っていることを確認済み
- [ ] `outputs/phase-13/pr-body.md` が作成されている
- [ ] PRタイトルが70文字以内である
- [ ] PR本文に Summary と Test Plan が含まれている
- [ ] commit / push / PR はユーザー許可後のみ実行することが明記されている
- [ ] ユーザー許可がない場合、このPhaseは「PR本文準備完了」で停止できる
- [ ] ユーザー許可後に実行する場合、`--no-verify` を使用しない
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

なし（タスク完了）
