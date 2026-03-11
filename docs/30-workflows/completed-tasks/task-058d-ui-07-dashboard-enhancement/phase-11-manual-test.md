# Phase 11: 手動テスト検証

## メタ情報

| 項目         | 内容                          |
| ------------ | ----------------------------- |
| Phase        | 11                            |
| Phase名      | 手動テスト検証                |
| 前提Phase    | Phase 1, 2, 5, 6, 7, 8, 9, 10 |
| 後続Phase    | Phase 12                      |
| ステータス   | completed                     |
| 作成日       | 2026-03-11                    |
| 担当SubAgent | SubAgent-D                    |

## 目的

ホーム画面の見た目、操作性、レスポンシブ、スクリーンショット証跡を手動で確認する。

## 実行タスク

- レスポンシブ確認: desktop / mobile での見え方を確認する
- キーボード確認: CTA キーボード操作とフォーカス順を確認する
- 証跡取得: timeline、empty state、loading の画面証跡を取得する

## 参照資料

| 参照資料        | パス                                                                                        | 内容                  |
| --------------- | ------------------------------------------------------------------------------------------- | --------------------- |
| Phase 1成果物   | `outputs/phase-1/requirements-definition.md`                                                | 要件確認              |
| Phase 2成果物   | `outputs/phase-2/component-architecture.md`                                                 | UI 構造確認           |
| Phase 5仕様     | `phase-5-implementation.md`                                                                 | 実装対象              |
| Phase 6仕様     | `phase-6-test-expansion.md`                                                                 | 回帰観点              |
| Phase 7仕様     | `phase-7-coverage-check.md`                                                                 | カバレッジ補完観点    |
| Phase 8仕様     | `phase-8-refactoring.md`                                                                    | local/shared 境界確認 |
| Phase 9仕様     | `phase-9-quality-assurance.md`                                                              | 品質観点              |
| Phase 10仕様    | `phase-10-final-review.md`                                                                  | 手動確認の前提        |
| screenshot 手順 | `.agents/skills/task-specification-creator/references/screenshot-verification-procedure.md` | 証跡取得              |
| A11y テスト     | `.agents/skills/aiworkflow-requirements/references/testing-accessibility.md`                | 手動観点              |

## 統合テスト連携

| 観点     | 内容                                      |
| -------- | ----------------------------------------- |
| 画面状態 | normal / empty / loading / mobile         |
| 導線     | CTA と `historySearch` handoff の目視確認 |
| A11y     | keyboard / focus-visible / time semantics |

## テストケース

| テストケース | 状態                               | 観点        | 期待結果                                    |
| ------------ | ---------------------------------- | ----------- | ------------------------------------------- |
| TC-11-01     | normal / light / desktop           | hierarchy   | hero、suggestion、timeline の優先順位が明確 |
| TC-11-02     | empty / light / desktop            | empty state | welcoming tone と primary CTA が自然        |
| TC-11-03     | loading / dark / desktop           | loading     | skeleton の密度と視認性が崩れない           |
| TC-11-04     | normal / dark / mobile             | responsive  | 390px 幅で 1 カラムに収まり CTA が可視      |
| TC-11-05     | normal / kanagawa-dragon / desktop | theme       | accent / muted text / border がテーマに調和 |

## 画面カバレッジマトリクス

| 画面 | 表示状態 | テーマ          | viewport | 優先度 | テストケース | 証跡ファイル                                                             | 備考                         |
| ---- | -------- | --------------- | -------- | ------ | ------------ | ------------------------------------------------------------------------ | ---------------------------- |
| Home | normal   | light           | desktop  | A      | TC-11-01     | `outputs/phase-11/screenshots/TC-11-01-home-normal-light-desktop.png`    | hero / suggestion / timeline |
| Home | empty    | light           | desktop  | B      | TC-11-02     | `outputs/phase-11/screenshots/TC-11-02-home-empty-light-desktop.png`     | EmptyState + primary CTA     |
| Home | loading  | dark            | desktop  | B      | TC-11-03     | `outputs/phase-11/screenshots/TC-11-03-home-loading-dark-desktop.png`    | skeleton density             |
| Home | normal   | dark            | mobile   | A      | TC-11-04     | `outputs/phase-11/screenshots/TC-11-04-home-normal-mobile-dark.png`      | 390px 幅レスポンシブ         |
| Home | normal   | kanagawa-dragon | desktop  | A      | TC-11-05     | `outputs/phase-11/screenshots/TC-11-05-home-normal-kanagawa-desktop.png` | テーマ整合                   |

## 多角的チェック観点

| 観点               | 適用判断                                                    | 仕様参照先                                          |
| ------------------ | ----------------------------------------------------------- | --------------------------------------------------- |
| UI/UX              | 画面確認の主対象なので適用                                  | `aiworkflow-requirements: ui-ux-*.md`               |
| アクセシビリティ   | keyboard / SR / contrast の確認で適用                       | `aiworkflow-requirements: testing-accessibility.md` |
| アーキテクチャ     | local harness 利用可否の判断で適用                          | `aiworkflow-requirements: architecture-*.md`        |
| セキュリティ       | 新規権限要求や外部接続が増えていないことを確認するため適用  | `aiworkflow-requirements: security-*.md`            |
| エラーハンドリング | invalid data / empty / loading fallback の視覚確認で適用    | `aiworkflow-requirements: error-handling.md`        |
| テスタビリティ     | Phase 9/10 の観点が手動ケースへ落ちているか確認するため適用 | `aiworkflow-requirements: testing-*.md`             |

## 成果物

| 成果物                 | パス                                     | 内容     |
| ---------------------- | ---------------------------------------- | -------- |
| 手動テスト計画         | `outputs/phase-11/manual-test-plan.md`   | 観点一覧 |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md` | 実施結果 |
| スクリーンショット計画 | `outputs/phase-11/screenshot-plan.json`  | 撮影対象 |

## 完了条件

- [x] desktop / mobile の観点が含まれている
- [x] normal / empty / loading の証跡対象が含まれている
- [x] keyboard 観点が含まれている
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 手動観点整理
3. screenshot 計画整理
4. 発見事項整理
5. 完了条件の確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] `manual-test-plan.md` / `manual-test-result.md` / `screenshot-plan.json` が定義されている
- [x] normal / empty / loading / mobile の証跡対象が明記されている
- [x] `artifacts.json` の Phase 11 記述と整合している

## 次のPhase

Phase 12: ドキュメント更新
