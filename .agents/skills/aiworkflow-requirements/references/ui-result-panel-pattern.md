# UI Result Panel パターンガイド

## 概要
skill の plan/execute 結果を表示するResultPanelコンポーネント群の設計パターン。
TASK-RT-03（SkillCreationResultPanel）実装から確立。

## コンポーネント構成

### ErrorBanner（共通エラー表示）
- 役割: エラー状態の統一表示
- Props: `error: PanelError, onRetry?: () => void`
- パターン: `role="alert"` + retryable フラグ + onRetry コールバック

### DetailPanel（結果詳細表示）
- 役割: Plan/Execute の詳細結果表示
- 状態管理: `isLoading → error → null → data` の4状態遷移
- パターン: スケルトンローダー + ErrorBanner + null guard + 詳細表示

### result-panel-parts.tsx（共通UIパーツ）
- SectionHeader: セクション区切り線 + ヘッダーテキスト
- TagList: タグスタイルリスト（trigger/anchor 共用）
- DetailFooter: ID フッター（planId/executeId 共用）
- StatusBadge: 成功/失敗/pending バッジ

## 重要設計決定

### raw result の保持場所
**決定**: global store でなく、呼び出し元コンポーネントの local state で保持
**理由**: 表示専用のデータはglobal store不要、phase遷移で自動リセット

### terminal_handoff vs integrated_api 分離
**決定**: DetailPanel は integrated_api レスポンスのみ対象
**実装**: `if ("planId" in response.data)` 型ガードで判定
**理由**: terminal_handoff は既存TerminalHandoffCardで処理済み（二重表示回避）

### progressive disclosure
**決定**: 大量メタデータ（permissionDenials等）は折りたたみ+件数バッジ
**実装**: `useState(false)` で expanded 管理

## コンポーネント設計パターン早見表

| パターン     | 適用基準                                                       | 例                     |
| ------------ | -------------------------------------------------------------- | ---------------------- |
| React.memo   | props が安定しており再レンダリング防止が有効な場合             | ErrorBanner            |
| local state  | コンポーネント固有の一時データで store 化が不要な場合          | rawPlanDetail          |
| 共有部品抽出 | 2 つ以上のコンポーネントで同一の UI パターンが繰り返される場合 | result-panel-parts.tsx |

## テスト戦略
- @testing-library/react + Vitest + happy-dom 環境
- ResizeObserver は vi.stubGlobal でモック必要
- 4状態（loading/error/null/data）全カバー
- edge case: 長テキスト、大量データ、XSS防止
