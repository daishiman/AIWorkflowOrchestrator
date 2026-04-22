# 受け入れ基準（AC）

> Phase 1 Step 3 成果物
> 作成日: 2026-04-21

## AC 一覧

| AC   | 内容                                                                                                                           | 判定方法                                                                 |
| ---- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| AC-1 | `task-specification-creator/EVALS.json` と `evals-schema-spec.md` §6 の `qualityInsights` 定義が突合され、差分が明記されている | `field-inventory.md` で差分を確認できること                              |
| AC-2 | `qualityInsights` 現行フィールドの型・意味・writer・更新主体が事実ベースで棚卸しされている                                     | `field-inventory.md` / `writer-survey.md` に全フィールドの記載があること |
| AC-3 | 正本 update/no-op の判定根拠が記録されている                                                                                   | `requirements-definition.md` に判定表があること                          |
| AC-4 | validator=0件の扱いが current facts と後続タスク境界で整理されている                                                           | `requirements-definition.md` §3-2 に記載があること                       |
| AC-5 | 他スキルへの波及方針が opt-in / opt-out の判断軸付きで記録されている                                                           | `requirements-definition.md` §3-3 に記載があること                       |

## フィールド数の整合

実際の EVALS.json フィールド数: **10**（4スカラー + 1コンテナ `taskMetrics` + 5サブフィールド）

evals-schema-spec.md §6 の記述フィールド数: **11**（4スカラー + 7 flat `taskMetrics.*`）

→ **不一致**: spec の `taskMetrics.*` フィールドが実態と乖離している。本タスクで修正する。

## 確定した追記アクション

1. `evals-schema-spec.md` §6 の `taskMetrics` サブフィールド定義を実際の構造に修正（update）
2. §6.1 運用ルールに writer・更新タイミング・運用責任を補強（update）
3. topic-map に `qualityInsights` エントリを追記（update）
4. quick-reference に `qualityInsights` エントリを追記（update）
5. validator=0件の扱い、opt-in方針は記録のみ（本タスクでは実装なし）
