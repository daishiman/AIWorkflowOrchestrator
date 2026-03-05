# TASK-054 aiworkflow 必要仕様抽出マトリクス

## 目的

TASK-UI-00-ORGANISMS 実装で必要な仕様を .claude/skills/aiworkflow-requirements から漏れなく抽出し、採用根拠を明示する。

## 抽出結果

| 関心ごと             | 仕様書                                  | 判定     | 理由                                |
| -------------------- | --------------------------------------- | -------- | ----------------------------------- |
| UI責務               | ui-ux-components.md                     | 採用     | Organisms責務を定義するため必須     |
| UI設計原則           | ui-ux-design-principles.md              | 採用     | Apple HIG / WCAG基準の適用に必須    |
| デザイントークン     | ui-ux-design-system.md                  | 採用     | breakpoint と token の適用に必須    |
| UI構造               | arch-ui-components.md                   | 採用     | Atomic Design境界の確認に必須       |
| 機能別UI仕様         | ui-ux-feature-components.md             | 採用     | 既存UI整合と命名統一に必須          |
| 状態管理             | arch-state-management.md                | 採用     | P31回避に必須                       |
| 実装パターン         | architecture-implementation-patterns.md | 採用     | P39/P40対策を適用するため必須       |
| コンポーネントテスト | testing-component-patterns.md           | 採用     | happy-dom + fireEvent 方針に必須    |
| テストフィクスチャ   | testing-fixtures.md                     | 採用     | 再現可能なテストデータ運用に必須    |
| a11yテスト           | testing-accessibility.md                | 採用     | role / aria / keyboard 検証に必須   |
| 品質基準             | quality-requirements.md                 | 採用     | 品質ゲートとカバレッジ判定に必須    |
| API契約              | api-\*.md                               | 条件付き | 今回は新規IPC追加なしのため参照のみ |
| DB仕様               | database-\*.md                          | 除外     | 今回はDB変更なし                    |

## 検索実行ログ（search-spec）

| クエリ                | 結果       | 解釈                                                |
| --------------------- | ---------- | --------------------------------------------------- |
| Organisms             | ヒットあり | 既存のAtomic Design責務・UI構造を採用               |
| CardGrid              | 0件        | 新規コンポーネントのため共通UI仕様へマッピング      |
| MasterDetailLayout    | 0件        | 新規コンポーネントのため共通UI仕様へマッピング      |
| SearchFilterList      | 0件        | 新規コンポーネントのため共通UI仕様へマッピング      |
| P31                   | ヒットあり | 状態管理方針（props駆動・局所状態）へ反映           |
| happy-dom / fireEvent | ヒットあり | P39対策としてテスト方針へ反映                       |
| P40                   | ヒットあり | `cd apps/desktop && pnpm vitest run` 実行規約へ反映 |
| WCAG / aria-live      | ヒットあり | a11y検証観点（role/aria/keyboard）へ反映            |

## 抜け漏れ確認

- resource-map の UI実装、テスト実装、コンポーネントテスト、アクセシビリティテスト、状態管理の導線を確認済み。
- 各仕様書は Phase 1 から Phase 13 の システム仕様（aiworkflow-requirements） セクションへ反映済み。
- 直接ヒットしない新規コンポーネント名は、Atomic Design/UI原則/テスト原則へ逆引きして漏れを補完済み。
