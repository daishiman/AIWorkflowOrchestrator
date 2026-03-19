# Phase 5: 実装サマリー

## タスク: TASK-SKILL-LIFECYCLE-02 SkillCenter 作成導線CTA

## 変更ファイル一覧

| ファイルパス                                                              | 変更種別 | 概要                                                                                                                                                                      |
| ------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`           | 変更     | `SkillLifecycleJobGuide` に `ctaLabel?: string` と `onAction?: () => void` を追加、各ガイドに ctaLabel 値を設定                                                           |
| `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` | 変更     | `useAppStore` import追加、`navigateToSkillCreate/Workspace/SkillAnalysis` 関数追加（個別セレクタ形式・useCallback メモ化）、`UseSkillCenterReturn` 型拡張                 |
| `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`               | 変更     | ヘッダーCTAボタン追加、JourneyPanel CTAボタン追加、viewStylesにheaderRow/headerCta/journeyCardCtaスタイル追加、SkillLifecycleJourneyPanelをonJobActionprops受け取りに変更 |

## 実装詳細

### Step 1: skillLifecycleJourney.ts 型拡張

- `SkillLifecycleJobGuide` インターフェースに `ctaLabel?: string` を追加
- `SkillLifecycleJobGuide` インターフェースに `onAction?: () => void` を追加（コンポーネントからアクション注入用）
- 各ジョブガイドに ctaLabel を設定:
  - create: "作成を始める"
  - use: "使ってみる"
  - improve: "改善する"
- 既存の `SKILL_LIFECYCLE_JOB_GUIDES` 定数は `onAction` なしで定義（各コンポーネントが `onJobAction` props で注入する設計）

### Step 2: useSkillCenter.ts ナビゲーションアクション

- `useAppStore` から `setCurrentView` を個別セレクタで取得（P31 対策: 合成 Hook 非使用）
- `useCallback` でメモ化した3つのナビゲーション関数を追加:
  - `navigateToSkillCreate` → `setCurrentView("skillCreate")`
  - `navigateToWorkspace` → `setCurrentView("workspace")`
  - `navigateToSkillAnalysis` → `setCurrentView("skillAnalysis")`
- `UseSkillCenterReturn` 型に3関数のシグネチャ（`() => void`）を追加
- 戻り値オブジェクトに3関数を追加

### Step 3: SkillCenterView/index.tsx UI変更

- ヘッダーに `flex items-center justify-between` の `headerRow` レイアウトを追加
- ヘッダーCTAボタン（`data-testid="header-create-cta"`）を追加:
  - Apple HIG 準拠: `bg-[var(--status-primary)] text-white` filled スタイル
  - アイコン: `plus`（`Icon` コンポーネント使用）
  - ラベル: 「新規作成」
- `SkillLifecycleJourneyPanel` を `onJobAction?: Partial<Record<SkillLifecycleJob, () => void>>` props 受け取りに変更
- 各ジョブカードに条件付きCTAボタンを追加（`job.ctaLabel && action` がある場合のみ描画）:
  - `data-testid={skill-lifecycle-cta-${job.id}}` で識別可能
  - アイコン: `chevron-right`（`arrow-right` は Icon map 未登録のため）
  - スタイル: `bg-[var(--status-primary)]/10` text variant
- `SkillCenterView` コンポーネントで `journeyActions` を `useMemo` でメモ化:
  - `create → navigateToSkillCreate`
  - `use → navigateToWorkspace`
  - `improve → navigateToSkillAnalysis`
- `viewStyles` に `headerRow`、`headerCta`、`journeyCardCta` を追加（`as const` で型安全を維持）

## AC-6 準拠確認

- ヘッダーCTA はスキル作成への直接導線のみ（`navigateToSkillCreate` のみ呼び出す）
- JourneyPanel CTA は各ジョブの handoff 先へのナビゲーションのみ
- ビジネスロジック（スキル追加・削除・分析）はCTAに混入させない
- `SKILL_LIFECYCLE_JOB_GUIDES` 定数側に `onAction` は設定せず、ビュー側で注入（関心の分離）

## テスト結果

| テストスイート                                      | テスト数 | 結果                           |
| --------------------------------------------------- | -------- | ------------------------------ |
| useSkillCenter.navigation.test.ts（新規）           | 4        | ALL PASS                       |
| SkillCenterView.cta.test.tsx（新規）                | 26       | ALL PASS                       |
| skillLifecycleJourney.test.ts（追加: TC-SL-01〜15） | 20       | ALL PASS（既存5 + 追加15）     |
| useSkillCenter.test.ts（既存）                      | 13       | ALL PASS（リグレッションなし） |
| SkillCenterView既存テスト群                         | 140      | ALL PASS（リグレッションなし） |

## 統合テスト連携

### Phase 4 テストとの接続確認

- `useSkillCenter.navigation.test.ts` の TC-01〜TC-04 が全件 GREEN であり、3アクションと `setCurrentView` の接続を確認済み
- `SkillCenterView.cta.test.tsx` の TC-CTA-01〜TC-CTA-24（Escape・統合含む）が全件 GREEN であり、コンポーネントレベルの CTA 動作を確認済み
- 既存テスト（useSkillCenter.test.ts / skillLifecycleJourney.test.ts 既存5件）がリグレッションなしで PASS していることを確認済み

### Task01 との接続確認

- `setCurrentView("skillCreate")` / `setCurrentView("skillAnalysis")` が Task01 の `renderView()` の case 分岐で正しく処理されることを SkillCenterView 既存テスト群（140件 PASS）で間接確認済み

### Phase 6（テスト拡充）への引き継ぎ項目

- モバイルレスポンシブテスト（768px 未満アイコン専用 / タッチターゲット44px確認）は自動テスト化の対象として未作成
  - 理由: Phase 4/5 段階では CTA 動作テストと CSS 実装の確認を優先した
  - CSS 実装（`hidden sm:inline` / `sm:hidden` パターン等）の検証は Phase 6 で追加を検討
