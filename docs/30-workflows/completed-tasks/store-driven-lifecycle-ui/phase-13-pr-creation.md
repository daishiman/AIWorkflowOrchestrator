# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 13                                    |
| 機能名     | store-driven-lifecycle-ui             |
| タスクID   | TASK-10A-F                            |
| タスク名   | スキルライフサイクルUIのStore駆動統合 |
| 作成日     | 2026-03-07                            |
| ステータス | 未実施                                |

## 目的

TASK-10A-F の全 Phase 成果物を最終確認し、PR を作成してレビュー準備を完了する。

## 実行タスク

### Task 1: 全Phase成果物の存在確認

以下の成果物が全て存在することを確認する:

| Phase | 成果物               | パス                                            | 確認 |
| ----- | -------------------- | ----------------------------------------------- | ---- |
| 1     | 要件定義書           | `outputs/phase-1/`                              | [ ]  |
| 2     | 設計書               | `outputs/phase-2/`                              | [ ]  |
| 3     | 設計レビュー結果     | `outputs/phase-3/`                              | [ ]  |
| 4     | テストケース設計     | `outputs/phase-4/`                              | [ ]  |
| 5     | 実装コード           | 修正対象ファイル群                              | [ ]  |
| 6     | テスト拡充           | `outputs/phase-6/`                              | [ ]  |
| 7     | カバレッジレポート   | `outputs/phase-7/`                              | [ ]  |
| 8     | リファクタリング結果 | `outputs/phase-8/`                              | [ ]  |
| 9     | 品質検証結果         | `outputs/phase-9/`                              | [ ]  |
| 10    | 最終レビュー結果     | `outputs/phase-10/`                             | [ ]  |
| 11    | 手動テスト結果       | `outputs/phase-11/manual-test-result.md`        | [ ]  |
| 11    | スクリーンショット   | `outputs/phase-11/screenshots/`                 | [ ]  |
| 12    | 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | [ ]  |
| 12    | 更新履歴             | `outputs/phase-12/documentation-changelog.md`   | [ ]  |
| 12    | 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md` | [ ]  |
| 12    | スキル改善レポート   | `outputs/phase-12/skill-feedback-report.md`     | [ ]  |
| 12    | 仕様更新サマリ       | `outputs/phase-12/spec-update-summary.md`       | [ ]  |

### Task 2: artifacts.json の整合性確認

- `artifacts.json` の全 Phase エントリが `completed` ステータスであることを確認する
- 各 Phase の成果物パスが実際のファイルパスと一致していることを確認する

### Task 3: 品質検証の最終実行

以下のコマンドを実行し、全て PASS することを確認する:

```bash
# Lint チェック
pnpm --filter @repo/desktop lint

# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト実行
cd apps/desktop && pnpm vitest run src/renderer/components/skill/
```

### Task 4: ブランチ作成とコミット

- ブランチ名: `feature/task-10a-f-store-driven-lifecycle-ui`
- コミットメッセージ規則: `feat(desktop): SkillCreateWizard/AnalysisView Store駆動統合`
- **実行制約**: ユーザーの明示的な許可を得てからコミットとプッシュを実行する

### Task 5: PR 作成

- **実行制約**: ユーザーの明示的な許可を得てから PR を作成する

#### PR 情報

| 項目           | 内容                                                          |
| -------------- | ------------------------------------------------------------- |
| PRタイトル     | `feat(desktop): SkillCreateWizard/AnalysisView Store駆動統合` |
| ベースブランチ | `main`                                                        |
| ヘッドブランチ | `feature/task-10a-f-store-driven-lifecycle-ui`                |

#### PR 本文テンプレート

```markdown
## Summary

- SkillCreateWizard の直接 `window.electronAPI` 呼び出しを Zustand agentSlice アクション経由に統一
- useSkillAnalysis Hook の API 呼び出しを Store 駆動パターンに移行
- SkillManagementPanel の整合性を Store 駆動パターンに統一

## Changes

### 修正ファイル

- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`
- `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`
- 関連テストファイル

### 変更パターン

- `window.electronAPI.skill.xxx()` → `agentSlice` アクション経由
- 個別セレクタ（`useCreateSkill()`, `useAnalyzeSkill()` 等）を使用
- エラーハンドリングを Store 状態で管理

## Test Plan

- [ ] `pnpm --filter @repo/desktop lint` PASS
- [ ] `pnpm --filter @repo/desktop typecheck` PASS
- [ ] `cd apps/desktop && pnpm vitest run src/renderer/components/skill/` PASS
- [ ] 手動テスト TC-11-01 〜 TC-11-07 PASS（証跡: `outputs/phase-11/screenshots/`）

## Screenshots

手動テスト証跡は `outputs/phase-11/screenshots/` を参照
```

#### PR 作成コマンド

```bash
gh pr create \
  --title "feat(desktop): SkillCreateWizard/AnalysisView Store駆動統合" \
  --body-file outputs/phase-13/pr-body.md \
  --base main \
  --head feature/task-10a-f-store-driven-lifecycle-ui
```

### Task 6: handoff 整備

`outputs/phase-13/handoff-checklist.md` を作成し、以下を記録する:

| 引き継ぎ先   | 引き継ぎ内容                                                                          |
| ------------ | ------------------------------------------------------------------------------------- |
| レビュア     | PR の Review 観点（Store 駆動パターンの正当性、エラーハンドリング、テストカバレッジ） |
| 次タスク担当 | TASK-10A シリーズの残タスクと依存関係                                                 |
| 未タスク担当 | Phase 12 で検出された未タスクの一覧と優先度                                           |

## 参照資料

### 実装・証跡

| 資料名               | パス                                                                   | 用途                     |
| -------------------- | ---------------------------------------------------------------------- | ------------------------ |
| SkillCreateWizard    | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`     | 変更内容の最終確認       |
| useSkillAnalysis     | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` | 変更内容の最終確認       |
| SkillManagementPanel | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`  | 変更内容の最終確認       |
| Phase 11 成果物      | `outputs/phase-11/`                                                    | 手動テスト証跡の参照     |
| Phase 12 成果物      | `outputs/phase-12/`                                                    | ドキュメント成果物の参照 |

### システム仕様

| 資料名              | パス                                                                       | 用途                     |
| ------------------- | -------------------------------------------------------------------------- | ------------------------ |
| phase templates     | `.claude/skills/task-specification-creator/references/phase-templates.md`  | Phase 文書の構造を揃える |
| task-workflow       | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`       | PR 記録先を確認する      |
| task-workflow-rules | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md` | PR 作成の規則を確認する  |

### 前提Phase成果物

| 資料名          | パス                | 用途                           |
| --------------- | ------------------- | ------------------------------ |
| Phase 1 成果物  | `outputs/phase-1/`  | 要件定義の出力を参照する       |
| Phase 2 成果物  | `outputs/phase-2/`  | 設計の出力を参照する           |
| Phase 3 成果物  | `outputs/phase-3/`  | 設計レビューの出力を参照する   |
| Phase 4 成果物  | `outputs/phase-4/`  | テスト設計の出力を参照する     |
| Phase 5 成果物  | `outputs/phase-5/`  | 実装の出力を参照する           |
| Phase 6 成果物  | `outputs/phase-6/`  | テスト拡充の出力を参照する     |
| Phase 7 成果物  | `outputs/phase-7/`  | カバレッジ確認の出力を参照する |
| Phase 8 成果物  | `outputs/phase-8/`  | リファクタリング出力を参照する |
| Phase 9 成果物  | `outputs/phase-9/`  | 品質保証の出力を参照する       |
| Phase 10 成果物 | `outputs/phase-10/` | 最終レビューの出力を参照する   |
| Phase 11 成果物 | `outputs/phase-11/` | 手動テスト結果の参照           |
| Phase 12 成果物 | `outputs/phase-12/` | ドキュメント成果物の参照       |

## 実行手順

1. Task 1: 全Phase成果物の存在を確認する
2. Task 2: artifacts.json の整合性を確認する
3. Task 3: `pnpm lint`, `pnpm typecheck`, `pnpm vitest run` を実行して全 PASS を確認する
4. Task 4: **ユーザーの許可を得てから** ブランチ作成・コミット・プッシュを実行する
5. Task 5: **ユーザーの許可を得てから** `gh pr create` で PR を作成する
6. Task 6: handoff-checklist.md を作成する

## 統合テスト連携

- Phase 1-12 の成果物が全て存在し、artifacts.json と整合していることを確認する
- Phase 9 の品質検証結果と Phase 13 の最終実行結果が一致していることを確認する
- Phase 11 の手動テスト証跡が PR 本文から参照可能であることを確認する

## 成果物

| 成果物            | パス                                    | 説明                  |
| ----------------- | --------------------------------------- | --------------------- |
| PR 本文           | `outputs/phase-13/pr-body.md`           | PR 本文のマークダウン |
| handoff checklist | `outputs/phase-13/handoff-checklist.md` | 引き継ぎ項目一覧      |

## 完了条件

- [ ] Phase 1-12 の全成果物が存在している
- [ ] artifacts.json の全 Phase が `completed` ステータスである
- [ ] `pnpm lint`, `pnpm typecheck`, テスト実行が全て PASS している
- [ ] ユーザーの明示的な許可を得てからコミット・プッシュ・PR作成を実行している
- [ ] PR タイトルが `feat(desktop): SkillCreateWizard/AnalysisView Store駆動統合` である
- [ ] PR 本文に Summary、Changes、Test Plan、Screenshots 参照が含まれている
- [ ] handoff-checklist.md が作成され、レビュア・次タスク担当・未タスク担当への引き継ぎが記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. Task 1: 全Phase成果物の存在確認
3. Task 2: artifacts.json の整合性確認
4. Task 3: 品質検証の最終実行
5. Task 4: ブランチ作成とコミット（ユーザー許可後）
6. Task 5: PR 作成（ユーザー許可後）
7. Task 6: handoff 整備
8. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了内容を実行記録へ残している

## 次のPhase

タスク完了
