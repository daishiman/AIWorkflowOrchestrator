# コンポーネントテストパターン

## 概要
この親仕様書は rulebook family の入口であり、実践パターン・詳細例・履歴は child companion へ分離した。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [testing-component-patterns-core.md](testing-component-patterns-core.md) | core specification | 概要 / 1. Storeモッキングパターン / 2. テストデータファクトリ / 3. アクセシビリティテスト |
| [testing-component-patterns-details.md](testing-component-patterns-details.md) | detail specification | 9. Zustand Store Hooks テストパターン / 9.1 AuthMode 契約テストパターン（TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001） / 10. Main Process SDKテスト有効化パターン（TASK-FIX-11-1-SDK-TEST-ENABLEMENT） / 11. SkillEditor テストパターン（TASK-9A completed） |
| [testing-component-patterns-advanced.md](testing-component-patterns-advanced.md) | advanced specification | 13. Atoms コンポーネントテストパターン（TASK-UI-00-ATOMS） / 14. Preload Shape 異常系テストパターン（2026-03-07追加） / 15. SettingsView 統合ハーネスパターン（2026-03-08追加） / 16. 統合テストハーネスパターン |
| [testing-component-patterns-history.md](testing-component-patterns-history.md) | history bundle | 参照 / 関連未タスク / 変更履歴 |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`
