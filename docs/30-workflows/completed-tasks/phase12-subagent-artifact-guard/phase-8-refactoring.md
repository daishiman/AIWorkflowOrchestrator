# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 8                                          |
| 機能名     | phase12-subagent-artifact-guard            |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001 |
| タスク名   | Phase 12 SubAgent成果物固定ガード          |
| Issue      | #955                                       |
| 前提Phase  | Phase 7                                    |
| 後続Phase  | Phase 9                                    |
| 作成日     | 2026-03-03                                 |
| ステータス | pending                                    |

## 目的

テンプレート構造の最適化と重複排除を行い、Phase 12成果物の運用品質を向上させる。「コード実装のリファクタリング」ではなく「テンプレート・手順書の構造改善」として実施する。

## 背景

Phase 5で作成したテンプレート（`spec-update-summary.md`テンプレート、`spec-sync-subagent-report.md`テンプレート）と三点突合手順が、Phase 7までの検証を経て機能的には完成している。Phase 8では構造の最適化（DRY原則適用、命名統一、参照パス整理）を行い、100人中100人が同じ理解で運用できる品質を目指す。

## SubAgent分担

| SubAgent | 担当                                |
| -------- | ----------------------------------- |
| A        | テンプレート構造最適化・DRY原則適用 |
| B        | 命名規則統一・参照構造整理          |
| C        | 三点突合手順簡素化・全体整合性確認  |

## 実行タスク

### Task 8-1: テンプレート構造最適化

- `spec-update-summary.md` テンプレートと `spec-sync-subagent-report.md` テンプレートの共通部分（メタ情報セクション、完了条件チェックリスト形式）を抽出する
- DRY原則を適用し、共通フィールドを統一フォーマットとして定義する
- テンプレート固有のセクション（SubAgent責務表、三点突合結果表）は分離して保持する

### Task 8-2: 命名規則統一

- 成果物名の表記ゆれを検出する（例: 「仕様同期サマリ」vs「spec-update-summary」、「SubAgentレポート」vs「spec-sync-subagent-report」）
- セクション名の表記ゆれを検出する（例: 「完了条件」vs「完了基準」、「成果物」vs「アウトプット」）
- 統一された命名規則を `outputs/phase-8/naming-convention.md` に記録する

### Task 8-3: 参照構造整理

- テンプレート間の参照パスを相対パスで統一する
- 外部仕様書への参照パス（`.claude/skills/` 配下）の正確性を検証する
- 参照切れがないことを `grep` で確認する

### Task 8-4: 三点突合手順の簡素化

- Phase 5で定義した三点突合（「仕様書セクション × 実ファイル × テスト」の3点を照合）の手順を最小ステップに圧縮する
- 冗長な中間手順を排除し、判定に必要な情報のみを残す
- 簡素化後も判定結果が同一であることを検証する

## 参照資料

| 資料名                   | パス                                                                           | 用途                         |
| ------------------------ | ------------------------------------------------------------------------------ | ---------------------------- |
| Phase 1 成果物           | `outputs/phase-1/requirements-definition.md`                                   | 要件定義（入力）             |
| Phase 2 成果物           | `outputs/phase-2/architecture-design.md`                                       | アーキテクチャ設計（入力）   |
| Phase 5 成果物           | `outputs/phase-5/implementation-summary.md`                                    | テンプレート実装結果（入力） |
| Phase 6 成果物           | `outputs/phase-6/coverage-report.md`                                           | テスト拡充結果（入力）       |
| Phase 7 成果物           | `outputs/phase-7/coverage-report.md`                                           | カバレッジ確認結果（入力）   |
| spec-update-workflow正本 | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 仕様更新ワークフロー基準     |
| lessons-learned正本      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | 過去教訓の参照               |
| task-workflow正本        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | タスク管理基準               |

## 実行手順

1. Phase 5-7の成果物を読み込み、テンプレート・手順書の現状構造を把握する
2. `spec-update-summary.md` と `spec-sync-subagent-report.md` の共通セクションを抽出する
3. 命名規則の表記ゆれを `grep` で検出し、統一方針を決定する
4. 参照パスの正確性を検証する（`ls` / `grep` で実在確認）
5. 三点突合の手順を最小ステップに圧縮する
6. リファクタリング前後の等価性を確認する（手順適用結果が同一）
7. 成果物を `outputs/phase-8/` に記録する

## 統合テスト連携

- リファクタリング後のテンプレートで模擬的なPhase 12実行を想定し、テンプレート→監査フローが正常動作することを確認する
- 監査スクリプト（`verify-unassigned-links.js`、`audit-unassigned-tasks.js`）が変更後のテンプレート構造と整合していることを検証する

## 多角的チェック観点（AIが判断）

| 観点         | 確認内容                                               | 参照仕様                               |
| ------------ | ------------------------------------------------------ | -------------------------------------- |
| DRY原則遵守  | テンプレート間の重複が排除されているか                 | Phase 5成果物                          |
| 命名一貫性   | 全成果物・セクション名が統一命名規則に従っているか     | `outputs/phase-8/naming-convention.md` |
| 参照整合性   | 全参照パスが実在するファイルを指しているか             | `spec-update-workflow.md`              |
| 手順等価性   | 三点突合の簡素化後も判定結果が変わらないか             | Phase 5の三点突合定義                  |
| スコープ遵守 | コード実装や既存baseline違反の解消に踏み込んでいないか | Phase 1要件定義                        |

## 成果物

| 成果物               | パス                                          | 内容                                 |
| -------------------- | --------------------------------------------- | ------------------------------------ |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`          | テンプレート構造改善の実施記録       |
| 命名規則定義         | `outputs/phase-8/naming-convention.md`        | 統一された命名規則の定義             |
| 簡素化三点突合手順   | `outputs/phase-8/simplified-triangulation.md` | 最小ステップに圧縮された三点突合手順 |

## 完了条件

- [ ] テンプレート構造の共通部分が抽出・統一されている
- [ ] 命名規則が統一され、表記ゆれが0件である
- [ ] 全参照パスが実在するファイルを指している（参照切れ0件）
- [ ] 三点突合手順が最小ステップに圧縮されている
- [ ] リファクタリング前後で手順適用結果が等価である
- [ ] Phase 7までの成果物との整合が確認できる
- [ ] 次Phaseへ引き継ぐ情報が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料（Phase 5-7成果物）を確認する
2. Task 8-1: テンプレート構造最適化を実施する
3. Task 8-2: 命名規則統一を実施する
4. Task 8-3: 参照構造整理を実施する
5. Task 8-4: 三点突合手順の簡素化を実施する
6. 成果物を `outputs/phase-8/` に記録する
7. 完了条件を確認する

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] Phase内で定義した成果物を全件記録
- [ ] 引き継ぎ情報を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard
```

## Phase実行記録

| 項目         | 記録    |
| ------------ | ------- |
| 実行タスク   | pending |
| 発見事項     | pending |
| 引き継ぎ事項 | pending |

## 次のPhase

Phase 9: 品質保証
