# Phase 2: 設計

## メタ情報

| 項目      | 内容                                            |
| --------- | ----------------------------------------------- |
| Phase     | 2                                               |
| タスクID  | UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001 |
| 前提Phase | Phase 1                                         |
| 後続Phase | Phase 3                                         |
| 作成日    | 2026-04-21                                      |

## 目的

変更対象を `field map`、`consumer matrix`、`validation matrix` の3成果物に分解し、`.claude/.agents/apps/desktop` の対象集合を一致させたうえで Phase 5-7 の実装・検証順序を固定する。

## 実行タスク

1. field map を 3組6フィールド中心で整理する
2. consumer matrix で writer / fixture / reader / test の担当を明示する
3. validation matrix で grep / diff / test の確認順序を定義する
4. root / mirror 同期手順を `.claude` → `.agents` の一方向で固定する
5. `apps/desktop` fixture / test / `SkillScanner` を consumer に追加する

## 参照資料

| 資料                | パス                                                                          |
| ------------------- | ----------------------------------------------------------------------------- |
| Phase template core | `.claude/skills/task-specification-creator/references/phase-template-core.md` |
| EVALS schema spec   | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`      |

## 実行手順

### 設計判断

- 正本方言: `snake_case v1`
- 正本root: `.claude/skills`
- mirror root: `.agents/skills`
- 実装順序: writer → fixture → reader → test
- validator: 本タスクでは full 実装せず、後続 `UNASSIGNED-EVALS-VALIDATOR-GUARD-001` へ引き継ぐ

### concern 分解

| concern       | 主対象             | 出力                    |
| ------------- | ------------------ | ----------------------- |
| 方言統一      | 3組6フィールド     | `unification-design.md` |
| consumer 影響 | 6スキル横断        | `consumer-matrix.md`    |
| 検証順序      | grep / diff / test | `validation-matrix.md`  |

## 統合テスト連携

| 判定項目          | 基準                                        | 結果 |
| ----------------- | ------------------------------------------- | ---- |
| consumer matrix   | writer / fixture / reader / test を全件網羅 | TBD  |
| validation matrix | 実行順が定義済み                            | TBD  |

## 多角的チェック観点（AIが判断）

- 抽象化思考: EVALS個別ではなくスキーマ移行設計として整理する
- システム思考: root 誤認が全Phaseへ波及することを前提に設計する
- トレードオン思考: 検証を増やし過ぎず、silent break 防止に直結するものだけ残す

## サブタスク管理

1. field map 設計
2. consumer matrix 設計
3. validation matrix 設計

## 成果物

| 成果物          | パス                                    | 説明                          |
| --------------- | --------------------------------------- | ----------------------------- |
| 統一設計        | `outputs/phase-2/unification-design.md` | root / 方言 / 順序 / rollback |
| consumer 行列   | `outputs/phase-2/consumer-matrix.md`    | 6スキル横断の責務表           |
| validation 行列 | `outputs/phase-2/validation-matrix.md`  | grep / diff / test 手順       |

## 完了条件

- [ ] 3成果物の責務分離ができた
- [ ] `.claude` 正本 / `.agents` mirror 契約を固定した
- [ ] validator を本タスク内と後続タスクで二重定義していない

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを完了
- [ ] 成果物3件を定義
- [ ] 4条件を確認

## 次Phase

Phase 3: 設計レビュー
