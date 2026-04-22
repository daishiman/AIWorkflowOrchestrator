# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 1                                               |
| タスクID   | UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001 |
| タスク種別 | NON_VISUAL / `implementation_mode: bugfix`      |
| 前提Phase  | なし                                            |
| 後続Phase  | Phase 2                                         |
| 作成日     | 2026-04-21                                      |

## 目的

正本方言、正本root、mirror root、consumer 範囲、依存ゲートを確定し、以降の Phase が参照する契約を固定する。

## 実行タスク

1. Step 0: P50チェックで既存実装・既存 EVALS 使用実態を確認する
2. 対象6スキルの writer / fixture / reader を棚卸しする
3. 3組6フィールドの出現箇所を field map に整理する
4. 先行タスク依存と Phase 5 着手条件を明文化する
5. AC-1〜AC-5 を requirement として番号付きで固定する

## 参照資料

| 資料               | パス                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| Phase 1 template   | `.claude/skills/task-specification-creator/references/phase-template-phase1.md`                 |
| EVALS スキーマ正本 | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`                        |
| EVALS lessons      | `.claude/skills/aiworkflow-requirements/references/lessons-learned-evals-consumer-audit-001.md` |

## 実行手順

### Step 0: P50チェック

- `rg -n "currentLevel|current_level|totalUsageCount|total_usage_count|lastEvaluated|last_evaluated" .claude/skills .agents/skills`
- `git log --oneline -- .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`
- `.claude/skills` を正本、`.agents/skills` を mirror として扱うことを確認する

### Step 1: 要件抽出

- FR-1: 3組6フィールドの方言統一
- FR-2: writer → fixture → reader → test の順序固定
- FR-3: `.claude/skills` / `.agents/skills` parity
- NFR-1: grep / diff / test の再実行可能性
- NFR-2: Phase 11 / 12 の canonical 成果物名一致

### Step 2: 依存ゲート定義

- 先行タスク未完了時は Phase 1-3 まで
- Phase 5 以降は `UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001` 完了確認後に着手

## 統合テスト連携

| 判定項目       | 基準                       | 結果 |
| -------------- | -------------------------- | ---- |
| field map 完成 | 3組6フィールド全件把握     | TBD  |
| root 契約確認  | `.claude` / `.agents` 固定 | TBD  |
| 依存ゲート確認 | Phase 5 着手条件を明記     | TBD  |

## 多角的チェック観点（AIが判断）

- 批判的思考: 問題を「方言統一」と「運用契約」に分けて扱う
- MECE: field / consumer / root / gate / evidence の5分類で漏れなく確認する
- why思考: silent break 防止に寄与しない要件を混ぜない

## サブタスク管理

1. 要件抽出
2. field map 前提整理
3. 依存ゲート固定

## 成果物

| 成果物         | パス                                      | 説明                                    |
| -------------- | ----------------------------------------- | --------------------------------------- |
| 要件要約       | `outputs/phase-1/requirements-summary.md` | FR/NFR と AC 一覧                       |
| 正本抽出マップ | `outputs/phase-1/spec-extraction-map.md`  | skill / reference / current fact 対応   |
| リスク登録簿   | `outputs/phase-1/risk-register.md`        | 依存・silent break・parity の主要リスク |

## 完了条件

- [ ] AC-1〜AC-5 を requirement として固定した
- [ ] 正本root / mirror root を明文化した
- [ ] 依存ゲートを明文化した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを完了
- [ ] 成果物3件を定義
- [ ] 矛盾なし・漏れなし・整合性あり・依存関係整合を確認

## 次Phase

Phase 2: 設計
