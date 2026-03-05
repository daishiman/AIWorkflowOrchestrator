# Phase 1 要件定義: UI基盤反映監査

## 1. 監査目的

`TASK-UI-00-DESIGN-FOUNDATION`（task-050）の正本要件が、
分割仕様（00-1〜00-4）および後続画面仕様（task-057〜061）へ反映済みかを判定できる監査要件を確定する。

## 2. 反映元要件の監査単位（SubAgent-REQ-SOURCE）

| 監査ID  | 反映元セクション                      | 反映元証跡                                    |
| ------- | ------------------------------------- | --------------------------------------------- |
| SRC-T1  | Task 1: デザイントークン補完          | `task-050-ui-00-ui-design-foundation.md:36`   |
| SRC-T2  | Task 2: Atomic Design カタログ        | `task-050-ui-00-ui-design-foundation.md:279`  |
| SRC-T3  | Task 3: lucide-react アイコンマスター | `task-050-ui-00-ui-design-foundation.md:687`  |
| SRC-T4  | Task 4: レスポンシブ仕様              | `task-050-ui-00-ui-design-foundation.md:761`  |
| SRC-T5  | Task 5: WCAG/ARIA/フォーカス          | `task-050-ui-00-ui-design-foundation.md:795`  |
| SRC-T5C | Task 5C: マイクロインタラクション     | `task-050-ui-00-ui-design-foundation.md:842`  |
| SRC-T5D | Task 5D: UX言語ガイドライン           | `task-050-ui-00-ui-design-foundation.md:950`  |
| SRC-T5B | Task 5B: エラー/オフラインUI          | `task-050-ui-00-ui-design-foundation.md:1000` |
| SRC-T6  | Task 6: テスト戦略                    | `task-050-ui-00-ui-design-foundation.md:1055` |

## 3. 反映先監査対象（SubAgent-REQ-TARGET）

### 3.1 分割仕様（固定スコープ）

| 対象ID       | 仕様書                                     | 監査観点         | 初期判定                       |
| ------------ | ------------------------------------------ | ---------------- | ------------------------------ |
| TGT-SPLIT-01 | `00-1-design-tokens.md`                    | Task1/5C/6       | 要追記候補（互換参照ファイル） |
| TGT-SPLIT-02 | `00-2-atoms-components.md`                 | Task2/4/5/5C/6   | 監査対象                       |
| TGT-SPLIT-03 | `task-053-ui-00-3-molecules-components.md` | Task2/3/4/5/5C/6 | 監査対象                       |
| TGT-SPLIT-04 | `task-054-ui-00-4-organisms-components.md` | Task2/4/5/5C/6   | 監査対象                       |

### 3.2 後続画面仕様（固定スコープ）

| 対象ID       | 仕様書                                              | 監査観点      |
| ------------ | --------------------------------------------------- | ------------- |
| TGT-SCR-057  | `task-057-ui-02-global-nav-core.md`                 | Task3/4/5     |
| TGT-SCR-058A | `task-058a-ui-03-agent-view-enhancement.md`         | Task5C/5D     |
| TGT-SCR-058B | `task-058b-ui-04a-workspace-layout-filebrowser.md`  | Task4/5/5B/5D |
| TGT-SCR-059A | `task-059a-ui-04b-workspace-chat-panel.md`          | Task5B/5C/5D  |
| TGT-SCR-059B | `task-059b-ui-04c-workspace-preview-quicksearch.md` | Task5B/5D     |
| TGT-SCR-030  | `task-030-ui-05-skill-center-view.md`               | Task5B/5D     |
| TGT-SCR-058C | `task-058c-ui-06-history-search-view.md`            | Task5B/5D     |
| TGT-SCR-058D | `task-058d-ui-07-dashboard-enhancement.md`          | Task3/5D      |
| TGT-SCR-058E | `task-058e-ui-08-notification-center.md`            | Task5B/5D     |
| TGT-SCR-061  | `task-061-ui-09-onboarding-wizard.md`               | Task5D        |

## 4. aiworkflow-requirements 適用要件

| 要件カテゴリ                  | 参照仕様                                                          | 適用内容                                      |
| ----------------------------- | ----------------------------------------------------------------- | --------------------------------------------- |
| Atomic Design責務             | `ui-ux-components.md:27`                                          | Atoms/Molecules/Organismsの責務境界で監査する |
| Apple HIG/WCAG                | `ui-ux-design-principles.md:78`, `ui-ux-design-principles.md:223` | HIG準拠 + WCAG 2.1 AAを判定軸に含める         |
| トークン/8px/ブレークポイント | `ui-ux-design-system.md:163`, `ui-ux-design-system.md:198`        | token・spacing・responsive反映を確認する      |
| UIアーキテクチャ境界          | `arch-ui-components.md:773`                                       | UI層の依存方向違反を監査対象に含める          |
| 品質基準                      | `quality-requirements.md:609`, `quality-requirements.md:632`      | a11y/coverage観点の証跡要件を固定する         |

## 5. 並列/直列方針（SubAgent-REQ-CRITERIA統合）

- 直列1: 反映元監査ID定義（SRC-T1〜SRC-T6）
- 並列1: 分割仕様4本の監査（SubAgent-IMP-TOKENS/ATOMS/MOLECULES/ORGANISMS）
- 並列2: 画面仕様10本の監査（SubAgent-IMP-SCREENS）
- 直列2: 判定統合（SubAgent-IMP-INTEGRATOR）

## 6. Phase 2 への引き継ぎ入力

1. 監査マトリクスの必須列は `反映元ID/反映先/証跡/判定/修正案` とする。
2. 証跡は `path:line` 形式を必須とし、CLI実行時刻（JST）を添える。
3. `00-1-design-tokens.md` は参照導線の妥当性を重点レビュー対象にする。

## 7. Task 100% 実行確認

- [x] 監査対象定義を完了
- [x] 判定基準定義の入力を作成
- [x] スコープ固定を完了
- [x] 並列/直列方針を定義
- [x] Phase 2 引き継ぎ事項を明記
