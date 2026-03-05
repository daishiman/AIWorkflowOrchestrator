# Phase 5: 実装 — 自動修正可能フィルタボタン実装

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 5                  |
| タスクID   | UT-TASK-10A-B-001  |
| 前提Phase  | Phase 4            |
| 後続Phase  | Phase 6 テスト拡充 |
| 作成日     | 2026-03-05         |
| ステータス | 完了（2026-03-05） |

## 目的

Phase 4 の Red テストを Green にする最小実装を行い、UI責務と状態責務を分離したまま機能を成立させる。

## Atent Team（SubAgent）分担

| SubAgent | 担当                                            |
| -------- | ----------------------------------------------- |
| A        | `SuggestionList.tsx` のボタン追加・イベント配線 |
| B        | `useSkillAnalysis.ts` の選択更新ヘルパー実装    |
| C        | A/B統合後の回帰確認（型・テスト）               |

## 実行タスク

- UI導線実装: `SuggestionList` へ一括選択ボタンと無効条件を追加する
- 状態更新実装: `useSkillAnalysis` に auto-fixable 選択更新ヘルパーを追加する
- 統合実装: `SkillAnalysisView` で UI と Hook を接続する

### Task 5-1: UI実装

- `SuggestionList` に「自動修正可能を選択」ボタンを追加する。
- `onSelectAutoFixable` ハンドラを受け取り、押下時に呼び出す。
- `disabled` と `aria-label` を要件どおり設定する。

### Task 5-2: 状態更新実装

- `useSkillAnalysis` に選択Set再構築ヘルパーを実装する。
- auto-fixable インデックスのみ選択した Set を生成する。
- 既存選択トグル処理と競合しないよう責務を分離する。

### Task 5-3: 連携実装

- `SkillAnalysisView` で A/B を結線する。
- 既存の適用ボタン活性条件に影響がないことを確認する。

## 並列実行計画

| タスク                     | 実行パターン | 理由                   |
| -------------------------- | ------------ | ---------------------- |
| Task 5-1(A) と Task 5-2(B) | 並列         | UIとHookの実装点が独立 |
| Task 5-3(C)                | 直列         | A/B完了後の統合作業    |

## 参照資料

依存Phase成果物: Phase 4

| 資料名           | パス                                                                            | 用途                                             |
| ---------------- | ------------------------------------------------------------------------------- | ------------------------------------------------ |
| 状態管理仕様     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | Hook責務分離                                     |
| IPC/API契約      | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`            | `skill:analyze`/`skill:improve` 契約非変更の確認 |
| セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`       | 入力検証・エラーサニタイズ方針の確認             |
| UI仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | SkillAnalysisView整合                            |
| エラー処理       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`           | 操作失敗時の扱い                                 |
| 実装ガイドライン | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`   | 実装品質基準                                     |

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

- 実装後は Phase 4 で定義したテストIDに対応する実装コミット単位を記録する。

## 成果物

| 成果物           | パス                                        |
| ---------------- | ------------------------------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          |
| 状態遷移確認メモ | `outputs/phase-5/state-transition-check.md` |

## 完了条件

- [x] Phase 4 の Red ケースが Green へ遷移する
- [x] UI責務と状態責務の分離が維持される
- [x] 既存機能への回帰がない

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物3点を出力済み
- [x] 引き継ぎ事項を記録済み

## 次のPhase

Phase 6: テスト拡充
