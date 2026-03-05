# Phase 3: 設計レビューゲート

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| Phase        | 3                              |
| Phase名      | 設計レビューゲート             |
| 前提Phase    | Phase 1, Phase 2               |
| 後続Phase    | Phase 4                        |
| ステータス   | completed                      |
| 作成日       | 2026-03-05                     |
| 機能名       | task-056d-viewtype-routing-nav |
| 担当SubAgent | SubAgent-A                     |

## 目的

Phase 2の設計に対して、ViewType契約、ルーティング網羅、ナビ整合、依存タスク連携を判定し、実装前の手戻りリスクを下げる。

## 実行タスク

- ゲート判定: PASS/MINOR/MAJOR/CRITICAL の判定基準で設計を評価する。
- 不整合抽出: 型重複、分岐欠落、ショートカット競合を検出する。
- 戻り先決定: 問題種別ごとにPhase 1またはPhase 2への戻り条件を定義する。

## 参照資料

| 参照資料     | パス                                                                           | 内容             |
| ------------ | ------------------------------------------------------------------------------ | ---------------- |
| Phase 1仕様  | `phase-1-requirements.md`                                                      | 要件整合確認     |
| Phase 2仕様  | `phase-2-design.md`                                                            | 設計対象         |
| 設計成果物   | `outputs/phase-2/routing-switch-design.md`                                     | 分岐詳細         |
| レビュー基準 | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | 判定基準         |
| ナビ正本     | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`        | 画面導線基準     |
| 状態管理正本 | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | ViewType責務基準 |

## システム仕様（aiworkflow-requirements）

| 参照資料       | パス                                                                                        | 内容                  |
| -------------- | ------------------------------------------------------------------------------------------- | --------------------- |
| UI/UX設計      | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | AppDock契約の評価基準 |
| アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | SoC整合判定           |
| 実装パターン   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 網羅性判定            |
| エラー仕様     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | 失敗時表現の妥当性    |

## 実行手順

### ステップ1: 設計資料レビュー

Phase 1/2成果物を比較し、要件と設計の対応を確認する。

### ステップ2: ゲート判定

判定基準テーブルで PASS/MINOR/MAJOR/CRITICAL を決定する。

### ステップ3: 戻り先定義

MAJOR以上の問題について戻り先Phaseを指定する。

## 統合テスト連携

| 観点           | 内容                                                        |
| -------------- | ----------------------------------------------------------- |
| テスト連携準備 | Phase 4へ引き渡すレビュー指摘をテストケース化対象として明示 |
| 契約連携       | 分岐網羅指摘はカバレッジ観点へ連携                          |
| UI連携         | ショートカット競合指摘は手動試験観点へ連携                  |

## 成果物

| 成果物           | パス                                      | 内容         |
| ---------------- | ----------------------------------------- | ------------ |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定結果     |
| レビュー指摘一覧 | `outputs/phase-3/review-findings.md`      | 指摘と戻り先 |

## 完了条件

- [x] 判定結果が PASS/MINOR/MAJOR/CRITICAL で記録されている
- [x] 指摘項目が再現可能な記述で整理されている
- [x] MAJOR/CRITICAL時の戻り先が定義されている
- [x] Phase 4へ引き渡す観点が列挙されている
- [x] 本Phase内の全タスクを100%実行完了

## レビューゲート（Phase 3）

### レビュー結果判定

| 判定     | 条件                   | 次のアクション              |
| -------- | ---------------------- | --------------------------- |
| PASS     | 指摘ゼロ               | Phase 4へ進む               |
| MINOR    | 軽微指摘のみ           | 指摘記録のうえPhase 4へ進む |
| MAJOR    | 実装阻害指摘あり       | Phase 2へ戻る               |
| CRITICAL | 要件欠落または契約破綻 | Phase 1へ戻る               |

### 戻り先決定基準

| 問題の種類   | 戻り先  |
| ------------ | ------- |
| 要件漏れ     | Phase 1 |
| 設計不整合   | Phase 2 |
| ナビ契約破綻 | Phase 2 |

## 次のPhase

Phase 4: テスト作成

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                   | 仕様参照先                                   |
| ------------------ | -------------------------- | -------------------------------------------- |
| UI/UX              | ナビ設計の妥当性判定で適用 | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | View/型境界判定で適用      | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | 指摘記録品質判定で適用     | `aiworkflow-requirements: error-handling.md` |

## サブタスク管理

1. 参照資料の確認
2. ゲート判定
3. 指摘整理
4. 戻り先決定
5. 完了条件の確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物を指定パスに出力
- [x] 完了条件のチェックを更新
