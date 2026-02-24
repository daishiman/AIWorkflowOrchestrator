# TASK-UI-00-ATOMS: Atoms共通コンポーネント実装

## メタ情報

| 項目         | 値                                                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-UI-00-ATOMS                                                                                                                    |
| タスク名     | Atoms共通コンポーネント実装（StatusIndicator・FilterChip・SkeletonCard・SuggestionBubble・RelativeTime新規、Badge・EmptyState拡張） |
| 優先度       | 高（Molecules/Organismsの前提条件）                                                                                                 |
| 複雑度       | medium                                                                                                                              |
| 依存タスク   | TASK-UI-00-TOKENS（完了済み）                                                                                                       |
| ブロック対象 | TASK-UI-00-MOLECULES, TASK-UI-00-ORGANISMS                                                                                          |
| 作成日       | 2026-02-22                                                                                                                          |
| ステータス   | 全Phase完了（PR #880）                                                                                                              |

---

## 概要

全画面で再利用される最小単位のUIコンポーネント（Atoms）を実装する。新規5コンポーネントの作成と既存2コンポーネントの仕様拡張を行い、Apple HIG準拠・WCAG 2.1 AA・レスポンシブ対応を満たす。

### 対象コンポーネント

| #   | コンポーネント   | タイプ   | 概要                                                           |
| --- | ---------------- | -------- | -------------------------------------------------------------- |
| 1   | StatusIndicator  | 新規     | ステータスドット（running/success/error/warning/idle/offline） |
| 2   | FilterChip       | 新規     | フィルターピル（選択/非選択切替、count/icon表示）              |
| 3   | Badge            | 既存拡張 | primary variant追加、content props、デザイントークン移行       |
| 4   | SkeletonCard     | 新規     | ローディングプレースホルダー（3バリエーション）                |
| 5   | SuggestionBubble | 新規     | アクション提案ピル（3サイズ、マイクロインタラクション）        |
| 6   | EmptyState       | 既存拡張 | suggestions/compact/mood追加、action拡張                       |
| 7   | RelativeTime     | 新規     | 相対時刻表示（3フォーマット、自動更新）                        |

---

## Phase一覧

| Phase | 名称             | ファイル                       | カテゴリ     | ステータス |
| ----- | ---------------- | ------------------------------ | ------------ | ---------- |
| 1     | 要件定義         | `phase-1-requirements.md`      | 要件         | 完了       |
| 2     | 設計             | `phase-2-design.md`            | 設計         | 完了       |
| 3     | 設計レビュー     | `phase-3-design-review.md`     | ゲート       | 完了       |
| 4     | テスト作成       | `phase-4-test-creation.md`     | TDD-Red      | 完了       |
| 5     | 実装             | `phase-5-implementation.md`    | TDD-Green    | 完了       |
| 6     | テスト拡充       | `phase-6-test-expansion.md`    | 品質         | 完了       |
| 7     | カバレッジ確認   | `phase-7-coverage-check.md`    | 品質         | 完了       |
| 8     | リファクタリング | `phase-8-refactoring.md`       | TDD-Refactor | 完了       |
| 9     | 品質保証         | `phase-9-quality-assurance.md` | 品質         | 完了       |
| 10    | 最終レビュー     | `phase-10-final-review.md`     | ゲート       | 完了       |
| 11    | 手動テスト       | `phase-11-manual-test.md`      | 検証         | 完了       |
| 12    | ドキュメント     | `phase-12-documentation.md`    | 文書化       | 完了       |
| 13    | PR作成           | `phase-13-pr-creation.md`      | 完了         | 完了       |

---

## 依存関係マップ

```
TASK-UI-00-TOKENS（完了済み）
        │
        ▼
TASK-UI-00-ATOMS（本タスク）
        │
        ├──▶ TASK-UI-00-MOLECULES
        └──▶ TASK-UI-00-ORGANISMS
```

### Phase間依存

```
Phase 1 → Phase 2 → Phase 3（ゲート: PASS/MINOR/MAJOR）
                              │
                              ▼ PASS or MINOR
Phase 4 → Phase 5 → Phase 6 → Phase 7（ゲート: 基準未達→Phase 6へ）
                                        │
                                        ▼ PASS
Phase 8 → Phase 9 → Phase 10（ゲート: PASS/MINOR/MAJOR/CRITICAL）
                               │
                               ▼ PASS or MINOR
Phase 11 → Phase 12 → Phase 13
```

### コンポーネント実装順序制約

```
Task 1-4: StatusIndicator, FilterChip, Badge, SkeletonCard（並列実行可能）
Task 5:   SuggestionBubble（独立）
Task 6:   EmptyState（SuggestionBubble完了後）
Task 7:   RelativeTime（独立）
Task 8:   atoms/index.ts エクスポート追加（全コンポーネント完了後）
```

---

## 実行手順

### Wave 1: 分析・設計（直列）

| Step | Phase | 内容                                             |
| ---- | ----- | ------------------------------------------------ |
| 1    | 1     | 既存コンポーネント分析、7コンポーネント要件定義  |
| 2    | 2     | インターフェース設計、デザイントークンマッピング |
| 3    | 3     | 設計レビュー（PASS/MINOR/MAJOR判定）             |

### Wave 2: TDD実装（直列）

| Step | Phase | 内容                                                       |
| ---- | ----- | ---------------------------------------------------------- |
| 4    | 4     | テスト作成（TDD: Red）、約120テストケース                  |
| 5    | 5     | 実装（TDD: Green）、7コンポーネント + index.tsエクスポート |

### Wave 3: 品質確保（直列、Phase 7でループ可能）

| Step | Phase | 内容                                                    |
| ---- | ----- | ------------------------------------------------------- |
| 6    | 6     | エッジケース・テーマ横断・アクセシビリティテスト拡充    |
| 7    | 7     | カバレッジ確認（Line 80%+, Branch 60%+, Function 80%+） |
| 8    | 8     | コード品質改善、共通パターン抽出                        |
| 9    | 9     | ESLint・TypeScript型チェック・全テスト実行              |

### Wave 4: 検証・完了（直列）

| Step | Phase | 内容                                                      |
| ---- | ----- | --------------------------------------------------------- |
| 10   | 10    | 最終レビュー（要件-実装整合性、HIG準拠、WCAG検証）        |
| 11   | 11    | 手動テスト（テーマ切替、レスポンシブ、キーボード操作）    |
| 12   | 12    | ドキュメント（実装ガイドPart1+2、仕様更新、未タスク検出） |
| 13   | 13    | PR作成（ユーザー許可後）                                  |

---

## テスト戦略

### テスト件数見積もり

| コンポーネント   | Phase 4（初期）  | Phase 6（拡充） | 合計見積もり |
| ---------------- | ---------------- | --------------- | ------------ |
| StatusIndicator  | 17件             | 10件            | 27件         |
| FilterChip       | 13件             | 8件             | 21件         |
| Badge            | 8件（+既存17件） | 5件             | 30件         |
| SkeletonCard     | 13件             | 6件             | 19件         |
| SuggestionBubble | 19件             | 8件             | 27件         |
| EmptyState       | 16件（+既存7件） | 6件             | 29件         |
| RelativeTime     | 26件             | 8件             | 34件         |
| **合計**         | **112件**        | **51件**        | **約187件**  |

### テスト環境ルール（Pitfall対策）

| Pitfall | 対策                                                  |
| ------- | ----------------------------------------------------- |
| P39     | happy-dom環境では`fireEvent`を使用（`userEvent`禁止） |
| P40     | テスト実行は `cd apps/desktop && pnpm vitest run`     |
| P9      | `beforeEach`で状態リセット                            |
| P13     | RelativeTimeでは`vi.advanceTimersByTime()`使用        |
| P31     | Atoms は props 駆動。Store直接参照しない              |

---

## 成果物一覧

### コード成果物（Phase 5で作成）

| #   | 成果物                             | パス                                                                                    |
| --- | ---------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | StatusIndicator コンポーネント     | `apps/desktop/src/renderer/components/atoms/StatusIndicator/index.tsx`                  |
| 2   | StatusIndicator テスト             | `apps/desktop/src/renderer/components/atoms/StatusIndicator/StatusIndicator.test.tsx`   |
| 3   | FilterChip コンポーネント          | `apps/desktop/src/renderer/components/atoms/FilterChip/index.tsx`                       |
| 4   | FilterChip テスト                  | `apps/desktop/src/renderer/components/atoms/FilterChip/FilterChip.test.tsx`             |
| 5   | Badge コンポーネント（拡張）       | `apps/desktop/src/renderer/components/atoms/Badge/index.tsx`                            |
| 6   | Badge テスト（拡張）               | `apps/desktop/src/renderer/components/atoms/Badge/Badge.test.tsx`                       |
| 7   | SkeletonCard コンポーネント        | `apps/desktop/src/renderer/components/atoms/SkeletonCard/index.tsx`                     |
| 8   | SkeletonCard テスト                | `apps/desktop/src/renderer/components/atoms/SkeletonCard/SkeletonCard.test.tsx`         |
| 9   | SuggestionBubble コンポーネント    | `apps/desktop/src/renderer/components/atoms/SuggestionBubble/index.tsx`                 |
| 10  | SuggestionBubble テスト            | `apps/desktop/src/renderer/components/atoms/SuggestionBubble/SuggestionBubble.test.tsx` |
| 11  | EmptyState コンポーネント（拡張）  | `apps/desktop/src/renderer/components/atoms/EmptyState/index.tsx`                       |
| 12  | EmptyState テスト（拡張）          | `apps/desktop/src/renderer/components/atoms/EmptyState/EmptyState.test.tsx`             |
| 13  | RelativeTime コンポーネント        | `apps/desktop/src/renderer/components/atoms/RelativeTime/index.tsx`                     |
| 14  | RelativeTime テスト                | `apps/desktop/src/renderer/components/atoms/RelativeTime/RelativeTime.test.tsx`         |
| 15  | atoms/index.ts（エクスポート追加） | `apps/desktop/src/renderer/components/atoms/index.ts`                                   |

### ドキュメント成果物（各Phase outputs/配下）

| Phase | 主要成果物                                              |
| ----- | ------------------------------------------------------- |
| 1     | 要件定義書、アクセシビリティ要件、テーマ要件            |
| 2     | インターフェース設計、トークンマッピング、テスト戦略    |
| 3     | 設計レビュー結果、HIG準拠検証、後方互換性検証           |
| 4     | テスト仕様書                                            |
| 5     | 実装サマリー                                            |
| 6     | エッジケーステスト、テーマテスト、a11yテスト仕様        |
| 7     | カバレッジレポート、ギャップ分析                        |
| 8     | コード品質分析、リファクタリングログ                    |
| 9     | ESLint/TypeCheck/テストレポート、品質ゲート結果         |
| 10    | 要件-実装整合性、デザイントークン監査、最終レビュー結果 |
| 11    | テーマ/レスポンシブ/インタラクション/a11y手動テスト結果 |
| 12    | 実装ガイド(Part1+2)、changelog、未タスクレポート        |
| 13    | PR情報                                                  |

---

## 設計レビュー（Phase 3）MINOR指摘事項

| ID  | 指摘内容                                            | 対応Phase |
| --- | --------------------------------------------------- | --------- |
| R-1 | FilterChip transition未定義                         | Phase 5   |
| R-2 | SkeletonCard内部DOM構造未詳細                       | Phase 5   |
| R-3 | SuggestionBubble sm(36px)と最小44px矛盾             | Phase 5   |
| R-4 | FilterChip高さ未定義                                | Phase 5   |
| R-5 | EmptyState celebrating アニメーション適用対象不明確 | Phase 5   |
| R-6 | EmptyState memoパターン維持未言及                   | Phase 5   |

---

## 既知の落とし穴

| Pitfall | 内容                                   | 対策                                       |
| ------- | -------------------------------------- | ------------------------------------------ |
| P31     | Zustand Store Hooks無限ループ          | Atoms は props 駆動。Store直接参照しない   |
| P39     | happy-dom環境でuserEvent非互換         | `fireEvent`を使用                          |
| P40     | テスト実行ディレクトリ依存             | `cd apps/desktop && pnpm vitest run`       |
| P9      | モジュールスコープ変数のテスト間リーク | `beforeEach`で毎回リセット                 |
| P13     | タイマーテストの無限ループ             | `vi.advanceTimersByTime()`使用             |
| 新規    | 既存Badge後方互換性                    | 既存children + 5 variant維持。拡張のみ     |
| 新規    | 既存EmptyState後方互換性               | 既存props維持。新規propsは全てオプショナル |
| 新規    | EmptyState内SuggestionBubble依存       | SuggestionBubbleを先に実装                 |
| 新規    | Apple HIG tertiaryLabel低コントラスト  | --text-muted使用時にコントラスト比検証     |

---

## 参照資料

| 参照                    | パス                                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Atoms仕様書（元タスク） | `../../skill-import-agent-system/tasks/completed-task/00-2-atoms-components.md`                                        |
| デザイントークン仕様    | `../../skill-import-agent-system/tasks/completed-task/00-1-design-tokens.md`                                           |
| UI基盤設計              | `../../skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-050-ui-00-ui-design-foundation.md` |
| デザイントークン実装    | `apps/desktop/src/renderer/styles/tokens.css`                                                                          |
| UIコンポーネント仕様    | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                |
| デザイン原則            | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                                         |
| デザインシステム        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                                             |
| テストパターン          | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                                      |
| a11yテスト              | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                                           |
| UIアーキテクチャ        | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                              |
| 状態管理                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                           |
| 品質要件                | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                            |

## aiworkflow-requirements 抽出結果（本実装で必須）

`aiworkflow-requirements/indexes/resource-map.md` を起点に、`search-spec.js`（キーワード: `Atoms`）で候補仕様を列挙し、今回実装で必要な情報を採否判定した。

| 区分 | カテゴリ               | 抽出した仕様ファイル                      | 本タスクでの用途                                            |
| ---- | ---------------------- | ----------------------------------------- | ----------------------------------------------------------- |
| 必須 | UI実装                 | `ui-ux-components.md`                     | Atoms共通要件、コンポーネント責務、アクセシビリティ要件確認 |
| 必須 | UIデザインシステム     | `ui-ux-design-system.md`                  | デザイントークン、カラー、タイポグラフィ整合                |
| 必須 | UI設計原則             | `ui-ux-design-principles.md`              | Apple HIG / WCAG 2.1 AA準拠の判断基準                       |
| 必須 | UIアーキテクチャ       | `arch-ui-components.md`                   | Atomic Design境界、Atoms/Molecules/Organisms責務確認        |
| 必須 | コンポーネントテスト   | `testing-component-patterns.md`           | Phase 4/6 のテスト戦略、テーマ横断テスト設計                |
| 必須 | アクセシビリティテスト | `testing-accessibility.md`                | キーボード操作、スクリーンリーダー、コントラスト検証        |
| 必須 | 品質要件               | `quality-requirements.md`                 | カバレッジ基準、品質ゲート判定                              |
| 補助 | Atoms専用実装知見      | `ui-ux-atoms-patterns.md`                 | 7コンポーネント実装時の苦戦箇所と再利用パターン確認         |
| 補助 | 実装パターン           | `architecture-implementation-patterns.md` | S12-S17（Props最小化/型衝突回避等）の再利用                 |
| 補助 | 教訓                   | `lessons-learned.md`                      | Phase運用時の再発防止（P31/P39/P40/P46/P47）                |

以下は今回の Atoms 実装範囲では非該当として扱う（仕様更新対象外）:

- `api-*.md`（IPC/API変更なし）
- `database-*.md`（DBスキーマ変更なし）
- `security-*.md`（認証/認可/IPCセキュリティ仕様変更なし）
