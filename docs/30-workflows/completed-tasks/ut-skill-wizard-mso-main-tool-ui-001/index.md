# UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001: ut-skill-wizard-mso-main-tool-ui-001

## メタ情報

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001                                     |
| タスク名     | スキルウィザード Q5 複数選択時の「主ツール」UI表示                       |
| 種別         | unassigned-task / improvement                                            |
| 優先度       | medium                                                                   |
| スケール     | small                                                                    |
| 依存タスク   | UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001                                 |
| 発見元       | Phase 12（skill-wizard-multi-select-options OPT-MSO-002として登録）      |
| GitHub Issue | [#2071](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2071) |
| 作成日       | 2026-04-13                                                               |
| ステータス   | completed                                                                |

## 概要

スキルウィザード Q5（外部ツール選択）において、複数のツールが選択された場合に先頭選択項目へ「主ツール」バッジを表示する。
`resolveExternalIntegration` が `selectedOptions[0]` を主ツールとして参照する実装との非対称性をUIでユーザーに明示する。

## 背景

`resolveExternalIntegration` は複数選択時に `selectedOptions[0]` を「主ツール」として参照するが、
UI上では複数チェックボックスが同等に表示されており、どのツールが主ツールとして使われるかユーザーが把握できない。
この非対称性を解消するため、先頭選択項目に「主ツール」バッジを表示し、UIと実装の対応関係を明確にする。

なお、将来的に UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001 が完了し主ツール参照ロジックが変更された場合は
バッジ表示を容易に削除できる設計とする。

## 対象ファイル

| ファイル                                                                                     | 操作 | 説明                                                       |
| -------------------------------------------------------------------------------------------- | ---- | ---------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                | 変更 | Q5選択肢レンダリングに「主ツール」バッジ表示ロジックを追加 |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 変更 | Q5複数選択時のバッジ表示テストケースを追加                 |

## スコープ

### 含む

- Q5チェックボックスレンダリング部における先頭選択項目への「主ツール」バッジ表示
- バッジの `aria-label` に「主ツールとして使用される」情報を付与するアクセシビリティ対応
- バッジ表示の条件分岐（選択数が2以上の場合のみ表示）
- `ConversationRoundStep.test.tsx` へのバッジ表示検証テスト追加
- Phase 11 スクリーンショット証跡によるビジュアル確認

### 含まない

- `resolveExternalIntegration` ロジックの変更（UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001のスコープ）
- Q5以外の質問ステップへの変更
- 主ツール選択順序の変更機能（ドラッグ&ドロップ等）
- バッジのスタイルカスタマイズ機能

## 受入基準

| ID   | 受入基準                                                                                                                     |
| ---- | ---------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | Q5で2つ以上のツールが選択された際に、最初の選択肢に「主ツール」バッジが表示される                                            |
| AC-2 | 1つのみ選択されている場合は「主ツール」バッジが表示されない                                                                  |
| AC-3 | aria-labelに「主ツールとして使用される」情報が含まれる                                                                       |
| AC-4 | UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001完了後にバッジ表示が不要になった場合の削除が容易な設計（単一箇所のフラグで制御可能） |
| AC-5 | Phase 11と同等のスクリーンショット証跡で視覚的変更が確認される                                                               |
| AC-6 | ConversationRoundStep.test.tsxがQ5複数選択時のバッジ表示を検証する                                                           |

## Phaseリスト

| Phase | 名前         | 概要                                                                   |
| ----- | ------------ | ---------------------------------------------------------------------- |
| 1     | 要件定義     | 現状コード確認・バッジ表示条件・AC固定                                 |
| 2     | 設計         | バッジコンポーネント設計・条件分岐インターフェース設計                 |
| 3     | 設計レビュー | 設計の矛盾・漏れチェック・削除容易性確認                               |
| 4     | テスト作成   | TDD Red段階テスト定義（複数選択/単一選択/aria-labelケース）            |
| 5     | 実装         | ConversationRoundStep.tsxへのバッジ表示ロジック追加                    |
| 6     | テスト拡充   | エッジケース・アクセシビリティテスト追加                               |
| 7     | カバレッジ   | カバレッジ計測・未到達分析                                             |
| 8     | リファクタ   | コード品質改善・削除容易性確保                                         |
| 9     | 品質保証     | 静的解析・リスク評価                                                   |
| 10    | 最終レビュー | Phase 1-9 の成果物統合レビュー                                         |
| 11    | 手動テスト   | スクリーンショット証跡・ビジュアル確認・アクセシビリティ検証           |
| 12    | ドキュメント | 実装ガイド・仕様更新・更新履歴・未タスク・フィードバック・準拠チェック |
| 13    | PR作成       | blocked / 承認待ち（本タスクでは実行しない）                           |

## 関連

- 発見元タスク: skill-wizard-multi-select-options (OPT-MSO-002)
- 依存先タスク: UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001（主ツール解決ロジック変更）
- GitHub Issue: [#2071](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2071)
