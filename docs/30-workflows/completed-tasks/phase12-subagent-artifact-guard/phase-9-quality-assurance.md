# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 9                                          |
| 機能名     | phase12-subagent-artifact-guard            |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001 |
| タスク名   | Phase 12 SubAgent成果物固定ガード          |
| Issue      | #955                                       |
| 前提Phase  | Phase 8                                    |
| 後続Phase  | Phase 10                                   |
| 作成日     | 2026-03-03                                 |
| ステータス | pending                                    |

## 目的

テンプレート・監査スクリプト・運用手順の全体品質を検証し、Phase 12の運用品質が基準を満たしていることを確認する。「コードの品質保証」ではなく「ドキュメント・手順の品質保証」として実施する。

## 背景

Phase 8でテンプレート構造の最適化と重複排除が完了している。Phase 9では、最適化後のテンプレート・監査スクリプト・運用手順が品質基準を満たしているかを多角的に検証する。曖昧表現の排除、参照整合性の確認、監査スクリプトの動作確認を行い、Phase 10の最終レビューに耐えうる品質を確保する。

## SubAgent分担

| SubAgent | 担当                                         |
| -------- | -------------------------------------------- |
| A        | テンプレート品質チェック・曖昧表現検出       |
| B        | 監査スクリプト検証・実行結果確認             |
| C        | テンプレート間参照整合・エンドツーエンド検証 |

## 実行タスク

### Task 9-1: テンプレート品質チェック

- 全テンプレートから曖昧語セットを検出する（検出対象語セットA/B/C/Dを固定して機械判定する）
- 検出された曖昧表現を具体的な条件・基準に置換する
- 置換結果を `outputs/phase-9/ambiguity-elimination-log.md` に記録する
- 品質基準: 曖昧表現0件

### Task 9-2: 監査スクリプト検証

- `verify-unassigned-links.js` を実行し、結果を記録する
- `audit-unassigned-tasks.js` を実行し、結果を記録する
- 各スクリプトの実行コマンドと結果を `outputs/phase-9/script-execution-log.md` に記録する
- 品質基準: 全スクリプトがエラーなく実行完了

### Task 9-3: 整合性検証

- Phase 8で最適化されたテンプレート間の参照パスが全て有効であることを確認する
- テンプレートの必須フィールド（メタ情報、目的、実行タスク、成果物、完了条件）が100%網羅されていることを確認する
- 整合性検証結果を記録する

### Task 9-4: 機械検証実行

以下のコマンドを実行し、結果を記録する:

```bash
# 仕様書全体検証
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard

# Phase出力検証
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard

# メタ情報セクション存在確認
rg -n '^## メタ情報$' docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard/
```

### Task 9-5: エンドツーエンド検証

- リファクタリング後のテンプレートを使用して、Phase 12の全フローを模擬実行する
- テンプレート記入→三点突合→監査スクリプト実行→未タスク検出の一連の流れが正常に完了することを確認する
- 品質基準: 全フローが中断なく完了

## 参照資料

| 資料名                   | パス                                                                           | 用途                         |
| ------------------------ | ------------------------------------------------------------------------------ | ---------------------------- |
| Phase 5 成果物           | `outputs/phase-5/implementation-summary.md`                                    | テンプレート実装結果（入力） |
| Phase 6 成果物           | `outputs/phase-6/coverage-report.md`                                           | テスト拡充結果（入力）       |
| Phase 7 成果物           | `outputs/phase-7/coverage-report.md`                                           | カバレッジ確認結果（入力）   |
| Phase 8 成果物           | `outputs/phase-8/refactoring-log.md`                                           | リファクタリング結果（入力） |
| Phase 8 命名規則         | `outputs/phase-8/naming-convention.md`                                         | 命名規則定義（入力）         |
| Phase 8 三点突合手順     | `outputs/phase-8/simplified-triangulation.md`                                  | 簡素化三点突合手順（入力）   |
| spec-update-workflow正本 | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 仕様更新ワークフロー基準     |
| quality-requirements     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | 品質基準の参照               |

## 実行手順

1. Phase 8の全成果物を読み込み、リファクタリング結果を把握する
2. Task 9-1: 全テンプレートの曖昧表現を検出・排除する
3. Task 9-2: 監査スクリプトを実行し、結果を記録する
4. Task 9-3: テンプレート間の参照整合チェックを実施する
5. Task 9-4: 機械検証コマンドを実行し、結果を記録する
6. Task 9-5: エンドツーエンド検証を実施する
7. 品質レポートを `outputs/phase-9/quality-report.md` に集約する

## 統合テスト連携

- 品質監査に監査スクリプト実行結果を必須入力として取り込む
- エンドツーエンド検証でテンプレート→監査フローの全体整合性を確認する
- 品質レポートに全検証結果を一元集約する

## 多角的チェック観点（AIが判断）

| 観点                 | 確認内容                                                           | 参照仕様                              |
| -------------------- | ------------------------------------------------------------------ | ------------------------------------- |
| 曖昧表現排除         | テンプレート内の曖昧語セットA/B/C/Dが0件であるか                   | `02-code-quality.md` コーディング規約 |
| 参照整合性           | 全参照パスが実在するファイルを指しているか                         | `spec-update-workflow.md`             |
| 必須フィールド網羅   | メタ情報・目的・実行タスク・成果物・完了条件が100%網羅されているか | Phase仕様書テンプレート基準           |
| 監査スクリプト動作   | 全スクリプトがエラーなく実行完了しているか                         | 各スクリプトの仕様                    |
| エンドツーエンド整合 | テンプレート記入→三点突合→監査→検出の全フローが正常動作するか      | Phase 5-8成果物                       |
| スコープ遵守         | コード実装やPhase 1-11の変更に踏み込んでいないか                   | Phase 1要件定義                       |

## 品質基準

| 指標                       | 基準値       |
| -------------------------- | ------------ |
| 曖昧表現検出件数           | 0件          |
| 参照切れ件数               | 0件          |
| テンプレート必須フィールド | 100%網羅     |
| 監査スクリプト実行結果     | 全PASS       |
| エンドツーエンド検証       | 全フロー完了 |

## 成果物

| 成果物             | パス                                           | 内容                     |
| ------------------ | ---------------------------------------------- | ------------------------ |
| 品質レポート       | `outputs/phase-9/quality-report.md`            | 全検証結果の集約レポート |
| 曖昧表現排除記録   | `outputs/phase-9/ambiguity-elimination-log.md` | 曖昧表現の検出・置換記録 |
| スクリプト実行記録 | `outputs/phase-9/script-execution-log.md`      | 監査スクリプトの実行結果 |

## 完了条件

- [ ] 全テンプレートから曖昧表現が排除されている（0件）
- [ ] 全参照パスが実在するファイルを指している（参照切れ0件）
- [ ] テンプレート必須フィールドが100%網羅されている
- [ ] 監査スクリプトが全てエラーなく実行完了（全PASS）
- [ ] エンドツーエンド検証で全フローが正常完了
- [ ] 機械検証コマンドが全て正常終了
- [ ] Phase 8成果物との整合が確認できる
- [ ] 次Phaseへ引き継ぐ情報が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 8成果物を確認する
2. Task 9-1: テンプレート品質チェックを実施する
3. Task 9-2: 監査スクリプト検証を実施する
4. Task 9-3: 整合性検証を実施する
5. Task 9-4: 機械検証コマンドを実行する
6. Task 9-5: エンドツーエンド検証を実施する
7. 成果物を `outputs/phase-9/` に記録する
8. 完了条件を確認する

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

Phase 10: 最終レビューゲート
