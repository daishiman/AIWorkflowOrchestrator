# Phase 4: テスト設計結果

## タスクID

TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001

## テストケース一覧

### types.test.ts (4件)

| TC ID    | テスト名                                        | AC   | 検証内容                 |
| -------- | ----------------------------------------------- | ---- | ------------------------ |
| TC-VT-01 | skillAnalysis が ViewType union に含まれること  | AC-1 | 型代入チェック           |
| TC-VT-02 | skillCreate が ViewType union に含まれること    | AC-1 | 型代入チェック           |
| TC-VT-03 | 既存の ViewType member が引き続き有効であること | AC-5 | 既存15メンバーの配列代入 |
| TC-VT-04 | ViewType union が合計 17 member を持つこと      | AC-1 | 全17メンバーの網羅       |

### App.renderView.viewtype.test.tsx (4件)

| TC ID     | テスト名                                       | AC   | 検証内容                              |
| --------- | ---------------------------------------------- | ---- | ------------------------------------- |
| TC-RV-01  | skillAnalysis case が SkillAnalysisView を描画 | AC-2 | data-testid確認 + skillName props検証 |
| TC-RV-01b | skillAnalysis で null フォールバック           | AC-2 | demo-skill フォールバック             |
| TC-RV-02  | skillCreate case が SkillCreateWizard を描画   | AC-3 | data-testid確認                       |
| TC-RV-03  | dashboard が引き続き描画                       | AC-5 | 既存ケース非破壊検証                  |

### skillLifecycleJourney.test.ts (5件)

| TC ID    | テスト名                                            | AC   | 検証内容                |
| -------- | --------------------------------------------------- | ---- | ----------------------- |
| TC-SL-01 | onAction?: () => void を受け入れ                    | AC-4 | 型代入+typeOf検証       |
| TC-SL-02 | onAction 省略可能                                   | AC-4 | undefined検証           |
| TC-SL-03 | 既存定数が onAction なしで有効                      | AC-4 | forEach + undefined検証 |
| TC-SL-04 | normalizeSkillLifecycleView が skillAnalysis を通過 | AC-6 | 変換なし検証            |
| TC-SL-05 | normalizeSkillLifecycleView が skillCreate を通過   | AC-6 | 変換なし検証            |

## テスト設計方針

- TDD Red フェーズ: 実装前にテストを先行作成
- happy-dom 環境使用（P39: fireEvent使用、userEvent禁止）
- テスト間状態リセット（P9: beforeEach で clearAllMocks）
- dynamic import パターンでモック設定を各テストで独立制御

## 結果

- 全13件: PASS
