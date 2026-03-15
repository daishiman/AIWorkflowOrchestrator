# Phase 4 要件-設計トレーサビリティテスト仕様

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| タスクID | TASK-SKILL-LIFECYCLE-05    |
| タスク名 | 作成済みスキルを使う主導線 |
| Phase    | 4                          |
| 成果物   | traceability-test-design   |
| 作成日   | 2026-03-15                 |

---

## 概要

Phase 1 で定義した全要件が Phase 2 の設計に漏れなく反映されているかを確認する設計検証テスト。

---

## TC-TRACE-01: 3シナリオ対応確認

| テストケース ID | TC-TRACE-01                                                                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テスト種別      | 設計検証テスト（トレーサビリティ）                                                                                                                         |
| 対象要件        | Phase 1: シナリオ A（作成直後利用）/ B（あとから利用）/ C（履歴再利用）                                                                                    |
| 検証対象        | Phase 2 screen-transition-design.md セクション2.1/3.1/4.1                                                                                                  |
| 前提条件        | Phase 1 requirements-definition.md・Phase 2 screen-transition-design.md が存在                                                                             |
| 検証手順        | 1. Phase 1 usage-scenario-table.md の3シナリオ定義を確認 2. Phase 2 の画面遷移フロー図を確認 3. 各シナリオに開始地点・完了地点・CTA が定義されているか照合 |
| 期待結果        | シナリオ A/B/C それぞれに対応する画面遷移フローが Phase 2 に記載されている                                                                                 |
| 合否基準        | 3シナリオ全てに開始地点・完了地点・CTA が Phase 2 に定義されていれば PASS                                                                                  |

## TC-TRACE-02: 主利用導線対応確認

| テストケース ID | TC-TRACE-02                                                                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テスト種別      | 設計検証テスト（トレーサビリティ）                                                                                                                                    |
| 対象要件        | Phase 1: Workspace → Agent 二段構成                                                                                                                                   |
| 検証対象        | Phase 2 screen-transition-design.md + component-design.md                                                                                                             |
| 前提条件        | Phase 2 設計書が存在すること                                                                                                                                          |
| 検証手順        | 1. screen-transition-design.md 1.1 基本原則を確認 2. Workspace の責務（文脈準備）と Agent の責務（実行本体）の定義を照合 3. Task01 画面責務マトリクスとの整合性を確認 |
| 期待結果        | Workspace を「実行準備」、Agent を「実行本体」とする二段構成が設計に反映                                                                                              |
| 合否基準        | Workspace と Agent の責務分担が Task01 画面責務と一致していれば PASS                                                                                                  |

## TC-TRACE-03: 発見導線6経路対応確認

| テストケース ID | TC-TRACE-03                                                                                                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テスト種別      | 設計検証テスト（トレーサビリティ）                                                                                                                                                |
| 対象要件        | Phase 1: 6つの発見導線（一覧/検索/おすすめ/最近使った/お気に入り/履歴）                                                                                                           |
| 検証対象        | Phase 2 screen-transition-design.md セクション3.1 + component-design.md                                                                                                           |
| 検証手順        | 1. Phase 1 usage-scenario-table.md 3.2 の発見導線一覧を確認 2. Phase 2 の Skill Center レイアウト設計を照合 3. 6経路それぞれに対応する UI 要素（セクション/コンポーネント）を特定 |
| 期待結果        | 6つの発見方法が Skill Center 設計（3セクション + 検索バー + 履歴タブ）に対応                                                                                                      |
| 合否基準        | 6経路全てに対応する UI 要素が Phase 2 に定義されていれば PASS                                                                                                                     |

### 発見導線-UI要素 対応表

| #   | 発見導線   | 対応 UI 要素                          | Phase 2 参照箇所                |
| --- | ---------- | ------------------------------------- | ------------------------------- |
| 1   | 一覧表示   | Skill Center グリッドレイアウト       | screen-transition-design.md 3.1 |
| 2   | 検索       | 検索バー（スキル名/説明/タグ）        | screen-transition-design.md 3.1 |
| 3   | おすすめ   | RecommendedSkillSection               | component-design.md             |
| 4   | 最近使った | RecentlyUsedSection                   | component-design.md             |
| 5   | お気に入り | お気に入りフィルタ                    | screen-transition-design.md 3.1 |
| 6   | 履歴       | Agent 履歴タブ（RecentExecutionList） | screen-transition-design.md 4.1 |

## TC-TRACE-04: 改善フィードバックループ対応確認

| テストケース ID | TC-TRACE-04                                                                                                                                                                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テスト種別      | 設計検証テスト（トレーサビリティ）                                                                                                                                                                                                                   |
| 対象要件        | Phase 1: 実行結果 → EP-4 → 改善 → EP-2 → 再利用ループ                                                                                                                                                                                                |
| 検証対象        | Phase 2 screen-transition-design.md セクション5 + component-design.md PostExecutionActionBar                                                                                                                                                         |
| 検証手順        | 1. Phase 1 usage-scenario-table.md 5.1 のトリガー条件を確認 2. PostExecutionActionBar の「改善する」CTA 設計を確認 3. SkillAnalysisView への遷移コンテキスト（skillName + 実行結果）を確認 4. 改善完了後の復帰経路（EP-2 再採点 → 再利用導線）を確認 |
| 期待結果        | PostExecutionActionBar の「改善する」CTA が SkillAnalysisView への遷移を設計している                                                                                                                                                                 |
| 合否基準        | 改善戻りの遷移先・渡すコンテキスト（skillName + 実行結果）が定義されていれば PASS                                                                                                                                                                    |

## TC-TRACE-05: 品質表示7地点対応確認

| テストケース ID | TC-TRACE-05                                                                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テスト種別      | 設計検証テスト（トレーサビリティ）                                                                                                                                                             |
| 対象要件        | Phase 1: 品質表示の7地点定義                                                                                                                                                                   |
| 検証対象        | Phase 2 quality-display-placement.md                                                                                                                                                           |
| 検証手順        | 1. Phase 1 requirements-definition.md の品質表示7地点を確認 2. Phase 2 quality-display-placement.md のコンポーネント配置表を照合 3. 各地点 × コンポーネント名 × 表示モードの全組み合わせを確認 |
| 期待結果        | 7地点全てに対応するコンポーネント（ScoreGateBadge/ScoreDisplay/ScoreDelta）が配置設計                                                                                                          |
| 合否基準        | 7地点 × コンポーネント名 × 表示モードの全組み合わせが定義されていれば PASS                                                                                                                     |

### 品質表示7地点一覧

| #   | 表示地点               | コンポーネント                    | 表示モード          | Phase 2 参照                 |
| --- | ---------------------- | --------------------------------- | ------------------- | ---------------------------- |
| 1   | EP-1 採点完了画面      | ScoreGateBadge(md) + ScoreDisplay | フル表示            | quality-display-placement.md |
| 2   | Skill Center SkillCard | ScoreGateBadge(sm)                | バッジのみ          | quality-display-placement.md |
| 3   | SkillDetailPanel       | ScoreDisplay + ScoreGateBadge(md) | フル表示            | quality-display-placement.md |
| 4   | Workspace EP-3 バナー  | ScoreGateBadge(sm)                | コンパクト          | quality-display-placement.md |
| 5   | Agent 実行中ヘッダー   | ScoreGateBadge(sm)                | バッジのみ          | quality-display-placement.md |
| 6   | Agent 実行結果         | ScoreDisplay + ScoreDelta         | フル + デルタ       | quality-display-placement.md |
| 7   | Agent 履歴エントリ     | ScoreGateBadge(sm) + ScoreDelta   | コンパクト + デルタ | quality-display-placement.md |

---

## トレーサビリティマトリクス総括

| テストケース | Phase 1 要件  | Phase 2 設計            | 判定     |
| ------------ | ------------- | ----------------------- | -------- |
| TC-TRACE-01  | 3シナリオ定義 | 画面遷移フロー図        | 検証対象 |
| TC-TRACE-02  | 二段構成      | 画面責務分担            | 検証対象 |
| TC-TRACE-03  | 発見導線6経路 | Skill Center レイアウト | 検証対象 |
| TC-TRACE-04  | 改善ループ    | PostExecutionActionBar  | 検証対象 |
| TC-TRACE-05  | 品質表示7地点 | コンポーネント配置表    | 検証対象 |
