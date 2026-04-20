# Phase 1 成果物: 要件整理メモ

- タスクID: TASK-LOGS-ARCHIVE-POLICY-001
- 作成日: 2026-04-19
- タスク種別: docs-only / NON_VISUAL / `verify_existing`

## 1. 背景と 4条件の一次結論

| 条件         | 一次結論                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------- |
| 矛盾なし     | 文書執筆 / mirror 同期 / index 反映 / blocked PR を責務分離すれば成立可能                 |
| 漏れなし     | canonical 6成果物 骨格・legacy 共存方針（F-001）・エスカレーション先（F-005）の追補が必要 |
| 整合性あり   | docs-only / NON_VISUAL / `verify_existing` を全 Phase 前提として固定                      |
| 依存関係整合 | 正本作成 → mirror 同期 → index 更新 → Phase 12 close-out の直列で閉じる                   |

## 2. 現状計測（`.claude/skills/` LOGS.md）

| skill                      | 行数 | バイト (KB) | 300行超 | 30KB超 | archive 推奨 |
| -------------------------- | ---- | ----------- | ------- | ------ | ------------ |
| int-test-skill             | 6    | 0.1         | 否      | 否     | 対象外       |
| github-issue-manager       | 13   | 0.3         | 否      | 否     | 対象外       |
| skill-fixture-runner       | 40   | 1.3         | 否      | 否     | 対象外       |
| claude-agent-sdk           | 336  | 26.4        | 超      | 未達   | **要**       |
| skill-creator              | 2542 | 123.0       | 超      | 超     | **要**       |
| aiworkflow-requirements    | 2908 | 571.4       | 超      | 超     | **要**       |
| task-specification-creator | 3158 | 233.9       | 超      | 超     | **要**       |

`.agents/skills/` の LOGS.md は上記と同一行数（mirror 対称性あり）。

## 3. 既存 `logs-archive-*.md` の棚卸し

| スキル                     | 確認結果                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| task-specification-creator | `logs-archive-2026-feb.md` / `logs-archive-2026-march.md`（月名英語スペル）＋ `logs-archive-index.md` / `logs-archive-legacy.md` |
| aiworkflow-requirements    | 既に `logs-archive-YYYY-MM-<topic>.md` 形式の月次トピック分割アーカイブが 30 件超存在                                            |

→ **新規則 `logs-archive-YYYY-MM.md` は task-specification-creator 側の feb/march と数値月で不一致**。
aiworkflow-requirements 側は `YYYY-MM-<topic>.md` のトピック拡張形式で併存している。
→ legacy（feb/march）は残置、新規は YYYY-MM の数値形式に統一する方針を Phase 2 で確定する（F-001）。

## 4. 閾値候補 3 軸整理

| 軸           | 候補 A | 候補 B | 候補 C | 採用判断                                          |
| ------------ | ------ | ------ | ------ | ------------------------------------------------- |
| 行数         | 300    | 500    | 1000   | 300（既存 feb/march/YYYY-MM-topic の実績と整合）  |
| バイトサイズ | 30 KB  | 50 KB  | 100 KB | 30 KB（同上、claude-agent-sdk が 26.4 KB で境界） |
| 期間         | 月次   | 四半期 | 半期   | 月次（既存運用実績と TASK-CONFLICT-PREVENT-001）  |

採用基準案: **300 行 OR 30 KB OR 月次** の OR 条件（ハイブリッド方式）。
判定タイミングは月初 1 日（F-003 で Phase 2 に引き継ぎ）。

## 5. Phase 2 への引き継ぎ

- 採用閾値: 行数 300 / サイズ 30 KB / 月次の OR 条件
- 命名規則: `logs-archive-YYYY-MM.md`（正規表現 `^logs-archive-\d{4}-(0[1-9]|1[0-2])\.md$`）
- legacy（feb/march）は残置・新規は数値形式に統一
- mirror sync 対象として `.claude/skills/aiworkflow-requirements/references/` が機能するかは
  Phase 3 R-3 → Phase 4 TC-07/08 で実測検証する
- 未決事項: 判定タイミングの時刻（Phase 2 で月初第1営業日に固定予定）

## 6. docs-only / NON_VISUAL / `verify_existing` 前提固定

| 分類                  | 値                                                          |
| --------------------- | ----------------------------------------------------------- |
| taskType              | docs                                                        |
| visual classification | NON_VISUAL（UI 変更なし・スクリーンショット不要）           |
| implementation_mode   | `verify_existing`（既存のアーカイブ実例を参照し再構築不要） |

本設定は index.md / artifacts.json / Phase 1 全てで一致していることを確認済み。
