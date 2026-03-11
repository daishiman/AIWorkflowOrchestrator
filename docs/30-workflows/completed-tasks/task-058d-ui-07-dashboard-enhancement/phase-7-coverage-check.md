# Phase 7: テストカバレッジ確認

## メタ情報

| 項目         | 内容                 |
| ------------ | -------------------- |
| Phase        | 7                    |
| Phase名      | テストカバレッジ確認 |
| 前提Phase    | Phase 5, Phase 6     |
| 後続Phase    | Phase 8              |
| ステータス   | completed            |
| 作成日       | 2026-03-11           |
| 担当SubAgent | SubAgent-D           |

## 目的

ホーム画面変更に対する UI 層のカバレッジ閾値を満たすか確認する。

## 実行タスク

- 閾値確認: Line 80% / Branch 60% / Function 80% を基準に確認する
- 対象範囲固定: `DashboardView` と helper の対象範囲を固定する
- 未カバー分析: 機能境界ごとの未カバー分岐を洗い出す

## 参照資料

| 参照資料       | パス                                                                         | 内容           |
| -------------- | ---------------------------------------------------------------------------- | -------------- |
| Phase 5仕様    | `phase-5-implementation.md`                                                  | 実装対象       |
| Phase 6仕様    | `phase-6-test-expansion.md`                                                  | 拡張テスト範囲 |
| カバレッジ基準 | `.agents/skills/task-specification-creator/references/coverage-standards.md` | 基準値         |
| 品質要件       | `.agents/skills/aiworkflow-requirements/references/quality-requirements.md`  | UI層品質       |

## 統合テスト連携

| 観点         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| ケース網羅   | greeting / suggestion / timeline / empty / loading / navigation |
| ファイル範囲 | `DashboardView` 本体と helper 群                                |
| 閾値判定     | UI層基準と task-spec 基準の両方で確認                           |

## 多角的チェック観点

| 観点               | 適用判断                                                          | 仕様参照先                                          |
| ------------------ | ----------------------------------------------------------------- | --------------------------------------------------- |
| テスタビリティ     | カバレッジ閾値判定のため適用                                      | `aiworkflow-requirements: testing-*.md`             |
| UI/UX              | 観測可能な UI 状態の漏れ確認で適用                                | `aiworkflow-requirements: ui-ux-*.md`               |
| アーキテクチャ     | helper 単位の測定範囲定義で適用                                   | `aiworkflow-requirements: architecture-*.md`        |
| セキュリティ       | 新規 IPC / Preload 追加がカバレッジ対象外でないか確認するため適用 | `aiworkflow-requirements: security-*.md`            |
| エラーハンドリング | fallback 系分岐の未測定を防ぐため適用                             | `aiworkflow-requirements: error-handling.md`        |
| アクセシビリティ   | keyboard / role ケースの測定漏れ確認で適用                        | `aiworkflow-requirements: testing-accessibility.md` |

## 成果物

| 成果物         | パス                                        | 内容           |
| -------------- | ------------------------------------------- | -------------- |
| カバレッジ目標 | `outputs/phase-7/coverage-target-report.md` | 閾値と対象     |
| ゲート結果     | `outputs/phase-7/coverage-gate-result.md`   | PASS/FAIL 判定 |

## 完了条件

- [x] 閾値が文書化されている
- [x] 対象ファイル範囲が固定されている
- [x] 未カバー分岐の扱いが定義されている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 対象ファイル範囲の確定
3. 閾値確認
4. 未カバー分岐整理
5. 完了条件の確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 閾値が具体値で記載されている
- [x] 成果物パスが `outputs/phase-7/` に確定している
- [x] `artifacts.json` の Phase 7 記述と整合している

## 次のPhase

Phase 8: リファクタリング
