# UT-TASKSPEC-DESIGN-TEMPLATE-BRANCH-001: type:design テンプレート分岐追加

## メタ情報

| 項目         | 内容                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------- |
| タスクID     | UT-TASKSPEC-DESIGN-TEMPLATE-BRANCH-001                                                      |
| 発見元       | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 Phase 12 skill-feedback-report.md 改善提案1 |
| 発見日       | 2026-03-24                                                                                  |
| 優先度       | 中                                                                                          |
| 種別         | スキル改善                                                                                  |
| 対象スキル   | task-specification-creator                                                                  |
| 関連仕様書   | .claude/skills/task-specification-creator/SKILL.md, references/phase-templates.md           |
| GitHub Issue | #1550                                                                                       |

## 背景

Phase 4-9 のテンプレートは implementation（コード実装）前提で記述されている。
設計タスク（type: design）では「テスト作成」「実装」「テスト拡充」「カバレッジ確認」を
planning document の作成に読み替える必要があるが、この読み替えが暗黙的で実行者が混乱する。

TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 の実行時に、Phase 4-9 の各テンプレートを
設計タスク向けに解釈し直す必要があり、Phase ごとの成果物名・目的・完了条件の読み替えに
認知負荷がかかった。

## 対応内容

1. `phase-templates.md` に `type: design` 向けの Phase 4-9 テンプレートを追加する
   - Phase 4: テスト作成 → 設計検証計画（test-matrix.md → verification-plan.md）
   - Phase 5: 実装 → 設計文書作成（implementation → design document creation）
   - Phase 6: テスト拡充 → 設計拡充（edge case matrix の設計観点版）
   - Phase 7: カバレッジ確認 → 設計網羅性確認（FR/NFR 充足率）
   - Phase 8: リファクタリング → 設計整理（simplification candidates）
   - Phase 9: 品質検証 → 設計品質検証（quality checklist の設計観点版）

2. `SKILL.md` のタスク生成ロジックに `type` フィールドによる条件分岐を追加する

3. `artifacts.json` 生成時に `type: design` の場合は coverage gate を省略する

## 受入基準

- [ ] `phase-templates.md` に type:design 向け Phase 4-9 テンプレートが追加されている
- [ ] SKILL.md のタスク生成フローに type 分岐が含まれている
- [ ] type:design タスクで Phase 4-9 を実行した際に読み替えが不要になっている
- [ ] 既存の type:implementation テンプレートに影響がないこと

## 苦戦箇所・教訓

| ID         | 苦戦箇所                                                                                                                   | 将来の解決指針                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| L-CBLG-001 | Phase 10 MINOR 照合時に risk-register との cross-reference チェックが不足し、設計への反映が PARTIAL のまま PASS 判定された | Phase 10 レビューで MINOR 指摘を出す際はリスク台帳との cross-reference を必ず確認 |
| L-FB-001   | 設計タスクで Phase 4「テスト作成」の解釈に迷い、planning document として読み替える判断に時間がかかった                     | type:design 分岐をテンプレートに組み込み、暗黙の読み替えを排除する                |

## 参照

- `docs/30-workflows/completed-tasks/step-06-seq-task-09-canonical-bridge-ledger-governance/outputs/phase-12/skill-feedback-report.md` (改善提案1)
- `.claude/skills/task-specification-creator/references/phase-templates.md`
