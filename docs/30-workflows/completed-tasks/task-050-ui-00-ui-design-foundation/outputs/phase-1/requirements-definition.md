# Phase 1 要件定義（TASK-UI-00-DESIGN-FOUNDATION）

## 1. 機能要件（FR）

| ID        | 要件                                                                                                                       | 対応タスク |
| --------- | -------------------------------------------------------------------------------------------------------------------------- | ---------- |
| FR-UI-001 | `tokens.css` に `kanagawa-dragon` / `light` / `dark` の3テーマを定義し、`light`/`dark` はApple HIG System Colorsへ統一する | Task 1     |
| FR-UI-002 | Atoms（StatusIndicator, FilterChip, Badge, SkeletonCard, SuggestionBubble, EmptyState, RelativeTime）をprops駆動で提供する | Task 2.1   |
| FR-UI-003 | Molecules（SearchBar, CodeViewer, TabSwitcher, SlideInPanel, ConfirmDialog）を提供する                                     | Task 2.2   |
| FR-UI-004 | Organisms（CardGrid, MasterDetailLayout, SearchFilterList）を提供する                                                      | Task 2.3   |
| FR-UI-005 | Lucideアイコンを統一辞書に基づいて使用し、UIパターン間でアイコン命名を一貫化する                                           | Task 3     |
| FR-UI-006 | 4ブレークポイント（mobile/tablet/desktop/wide）でレイアウト動作を定義する                                                  | Task 4     |
| FR-UI-007 | WCAG 2.1 AAに基づくARIA・キーボード操作・フォーカス管理を実装する                                                          | Task 5     |
| FR-UI-008 | マイクロインタラクション（hover/active/success/error）を統一トークンで表現する                                             | Task 5C    |
| FR-UI-009 | UX文言をやさしい日本語へ寄せる変換方針を適用する                                                                           | Task 5D    |
| FR-UI-010 | IPC失敗/オフライン時のエラー表示パターンを共通化する                                                                       | Task 5B    |
| FR-UI-011 | テストヘルパー `renderWithTheme` と3テーマ検証を標準化する                                                                 | Task 6     |

## 2. 非機能要件（NFR）

| ID         | 要件             | 判定基準                                                                         |
| ---------- | ---------------- | -------------------------------------------------------------------------------- |
| NFR-UI-001 | 保守性           | すべての共通UIは `atoms/molecules/organisms` 配下へ分離し、責務重複を作らない    |
| NFR-UI-002 | テスト容易性     | `fireEvent` ベースで再現可能なテストを作成し、`pnpm vitest run` で安定実行できる |
| NFR-UI-003 | 可読性           | プロパティ名・状態名・TC-ID命名を統一する                                        |
| NFR-UI-004 | アクセシビリティ | `role` / `aria-*` / フォーカス制御を主要部品で担保する                           |
| NFR-UI-005 | 品質ゲート       | 対象範囲カバレッジで lines/functions >= 80, branches >= 60 を達成する            |

## 3. 依存関係

- 後続タスク（053〜061）は本タスクで定義する共通UI APIを前提に実装する
- `settingsSlice` のテーマ固定制約解除は本スコープ外（別タスク連携）

## 4. 実行メモ

- SubAgent相当の関心分離を `Tokens / Components / UX-A11y / Test` で定義
- Phase 4でRed化する対象をTC-IDへ変換済み（`acceptance-criteria.md` 参照）
