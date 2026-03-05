# Phase 1: 要件定義 — 自動修正可能フィルタボタン実装

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 1                                           |
| タスクID   | UT-TASK-10A-B-001                           |
| 機能名     | ut-task-10a-b-001-autofixable-filter-button |
| 前提Phase  | なし                                        |
| 後続Phase  | Phase 2 設計                                |
| 作成日     | 2026-03-05                                  |
| ステータス | 完了（2026-03-05）                          |

## 目的

`SuggestionList` で auto-fixable 提案を一括選択する要件を、実装・テスト可能な粒度で確定する。

## Atent Team（SubAgent）分担

| SubAgent | 担当                                      |
| -------- | ----------------------------------------- |
| A        | UI要件（表示、ボタン配置、a11y）          |
| B        | 状態要件（選択Set更新、既存操作との整合） |
| C        | 品質要件（受け入れ基準、検証可能性）      |

## 実行タスク

### Task 1-1: 機能要件（FR）定義

- FR-1: `autoFixable === true` の提案を一括選択する操作を提供する。
- FR-2: 一括選択後も既存の「選択提案を適用」フローが維持される。
- FR-3: auto-fixable 提案が0件の場合、操作は無効化またはガードされる。
- FR-4: 既存の個別チェック選択・全選択導線を壊さない。

### Task 1-2: 非機能要件（NFR）定義

- NFR-1: 操作要素はキーボード操作可能である。
- NFR-2: ボタンラベル/補助ラベルがスクリーンリーダーで解釈可能である。
- NFR-3: 一括選択処理は提案件数 n に対して O(n) で完結する。
- NFR-4: 既存テストとの後方互換を維持する。

### Task 1-3: 受け入れ基準（AC）定義

- AC-1: auto-fixable true/false 混在時、クリック後に true のみ選択される。
- AC-2: 提案0件時にエラーなく操作不可状態を維持する。
- AC-3: 全件 false 時に誤選択が発生しない。
- AC-4: 既存の個別選択UIが機能し続ける。

### Task 1-4: スコープ確定

- 含む: `SuggestionList.tsx`, `useSkillAnalysis.ts`, 関連テスト。
- 含まない: Main Process 側の改善ロジック、`autoFixable` 判定生成。

## 並列実行計画

| タスク                     | 実行パターン | 理由                                     |
| -------------------------- | ------------ | ---------------------------------------- |
| Task 1-1(A) と Task 1-2(B) | 並列         | UI要件と状態要件が独立して整理可能       |
| Task 1-3(C)                | 直列         | FR/NFR確定後に検証基準を閉じる必要がある |

## 参照資料

| 資料名         | パス                                                                                               | 用途                    |
| -------------- | -------------------------------------------------------------------------------------------------- | ----------------------- |
| 元タスク指示書 | `docs/30-workflows/completed-tasks/task-10a-b-autofixable-filter-button.md`                        | Why/What/How の原文要件 |
| 親タスク要件   | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-1/requirements-definition.md` | FR-3-2 の親要件確認     |
| UI機能仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                    | 既存責務境界の確認      |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                        | ACの検証可能性基準      |

## 実行手順

1. 参照資料を確認して判断根拠を固定する。
2. 実行タスクを順に実施し、成果物へ記録する。
3. 完了条件を検証し、次Phaseへ引き継ぐ。

## 多角的チェック観点（AIが判断）

| 観点                 | 確認内容                         | 参照仕様                      |
| -------------------- | -------------------------------- | ----------------------------- |
| セキュリティ         | 入力検証・境界防御が必要かを確認 | `security-*.md`               |
| UI/UX                | 操作導線・a11y要件の充足を確認   | `ui-ux-*.md`                  |
| アーキテクチャ       | 責務分離と依存方向を確認         | `architecture-*.md`           |
| API/インターフェース | 既存契約とのドリフト有無を確認   | `api-*.md`, `interfaces-*.md` |
| エラーハンドリング   | 失敗時の通知と分類を確認         | `error-handling.md`           |

## 統合テスト連携（Phase 1〜11）

- Phase 4 で unit/integration の検証観点へ引き継ぐため、ACを操作シナリオに変換可能な形で記述する。

## 成果物

| 成果物       | パス                                         |
| ------------ | -------------------------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        |

## 完了条件

- [x] FR/NFR/AC が重複なく定義されている
- [x] 含む/含まない範囲が明確である
- [x] Phase 2 が迷わず開始できる入力が揃っている

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物3点を出力済み
- [x] 引き継ぎ事項を記録済み

## 次のPhase

Phase 2: 設計
