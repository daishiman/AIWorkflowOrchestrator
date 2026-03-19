# Phase 1 要件定義: SkillCenterView 作成導線 CTA 実装

## メタ情報

- タスクID: step-02-par-task-02-skillcenter-create-route
- フェーズ: Phase 1 - 要件定義
- 作成日: 2026-03-17
- 依存タスク: step-01-seq-task-01-viewtype-renderView-foundation (Task01)

---

## 1. P50チェック結果

### 調査対象

SkillCenterView におけるヘッダー CTA ボタン、JourneyPanel 各カードの CTA ボタン、ナビゲーションアクションの実装状況を調査した。

### 結果

| 確認項目                                         | 状態     |
| ------------------------------------------------ | -------- |
| ヘッダー「+ 新しいツールを作る」CTAボタン        | 実装済み |
| JourneyPanel「スキルを作る」カード CTAボタン     | 実装済み |
| JourneyPanel「スキルを使う」カード CTAボタン     | 実装済み |
| JourneyPanel「スキルを改善する」カード CTAボタン | 実装済み |
| useSkillCenter.ts ナビゲーションアクション       | 実装済み |
| skillLifecycleJourney.ts の ctaLabel フィールド  | 追加済み |

### 判定

全受入基準（AC-1 から AC-8）が既に実装済みであることを確認した（P50チェック: 既実装）。
TDD フロー（Phase 4-5）は「新規実装」ではなく「検証・補完」モードで実施する。

#### 既実装確認の詳細（コード調査結果）

- `skillLifecycleJourney.ts`: `SkillLifecycleJobGuide` インターフェースに `ctaLabel?: string` および `onAction?: () => void` が追加済み。`SKILL_LIFECYCLE_JOB_GUIDES` 定数の各エントリに `ctaLabel` 値（「作成を始める」「使ってみる」「改善する」）が設定済み。
- `useSkillCenter.ts`: `navigateToSkillCreate` / `navigateToWorkspace` / `navigateToSkillAnalysis` の3アクションが `useCallback` + 個別セレクタ形式（P31対策済み）で実装済み。`UseSkillCenterReturn` 型にも追加済み。
- `SkillCenterView/index.tsx`: ヘッダーCTA（「+ 新しいツールを作る」）および JourneyPanel CTA（`ctaLabel` / `onAction` 条件付きレンダリング）が実装済み。

---

## 2. 機能要件

### AC-1: ヘッダー CTA ボタン表示

- SkillCenterView のヘッダー領域に「+ 新しいツールを作る」というラベルのプライマリ CTA ボタンを表示する
- ボタンはヘッダー右側に配置する
- ボタンのスタイルはプライマリアクション（アクセントカラー: systemBlue `#007AFF`）を適用する

### AC-2: ヘッダー CTA ボタンのナビゲーション動作

- ヘッダー CTA ボタンをクリックしたとき、`setCurrentView("skillCreate")` を呼び出す
- 呼び出し後、アプリケーションは skillCreate 画面に遷移する
- `setCurrentView` の取得は Zustand ストアの個別セレクタパターンを使用する（`useAppStore((state) => state.setCurrentView)` または `useSetCurrentView` 個別セレクタ）

### AC-3: JourneyPanel「スキルを作る」カード CTA

- JourneyPanel の「スキルを作る」カードに CTA ボタンを表示する
- ボタンのラベルは skillLifecycleJourney.ts の `ctaLabel` フィールドから取得する
- ボタンをクリックしたとき、`setCurrentView("skillCreate")` を呼び出す

### AC-4: JourneyPanel「スキルを使う」カード CTA

- JourneyPanel の「スキルを使う」カードに CTA ボタンを表示する
- ボタンのラベルは skillLifecycleJourney.ts の `ctaLabel` フィールドから取得する
- ボタンをクリックしたとき、`setCurrentView("workspace")` を呼び出す（またはワークスペースに相当するビューキー）

### AC-5: JourneyPanel「スキルを改善する」カード CTA

- JourneyPanel の「スキルを改善する」カードに CTA ボタンを表示する
- ボタンのラベルは skillLifecycleJourney.ts の `ctaLabel` フィールドから取得する
- ボタンをクリックしたとき、`setCurrentView("skillAnalysis")` を呼び出す

### AC-6: forbiddenResponsibility 違反なし

- 各 CTA ボタンはナビゲーションの起点（handoff CTA）としてのみ機能する
- スキル作成ロジック本体、分析ロジック本体、ワークスペース処理本体を SkillCenterView が実行してはならない
- `skillLifecycleJourney.ts` の `forbiddenResponsibility` 定義に従い、SkillCenter は「直接実行や詳細分析の本体を背負わない」
- CTA ボタンのクリックハンドラは `setCurrentView(targetView)` の呼び出しのみとする

---

## 3. 非機能要件

### AC-7: モバイル対応（768px 未満）

- 画面幅 768px 未満でも全 CTA ボタンが操作可能な状態でレンダリングされる
- ボタンがビューポートに収まり、タップ可能なサイズ（最小 44px x 44px）を確保する
- ヘッダー CTA ボタンがモバイル幅でも視認可能な位置に配置される
- JourneyPanel の各カード CTA ボタンがモバイル幅で縦方向にスタックしても操作可能な状態を維持する

### AC-8: Apple HIG 準拠

- スペーシングは 8px グリッドに基づいて設定する（padding: 8px, 16px, 24px 等）
- 角丸は 8px から 12px の範囲で統一する
- 影は繊細に適用する（例: `box-shadow: 0 1px 3px rgba(0,0,0,0.04)`）
- カラーパレットは CLAUDE.md 01-architecture.md に定義された Apple HIG System Colors を使用する
- ライトモードのアクセントカラーは `#007AFF`（systemBlue）を使用する
- ボタンのホバー・アクティブ・フォーカス状態のフィードバックを実装する
- アニメーションは 200-300ms の範囲で目的を持って適用する
- コントラスト比は WCAG 2.1 AA 基準（通常テキスト 4.5:1 以上）を満たす

---

## 4. Task01 依存インターフェース

### 前提: Task01 成果物の確認済み事項

Task01（step-01-seq-task-01-viewtype-renderView-foundation）が以下を完了済みであることを前提とする。

| 項目                             | 内容                                                                 | 状態     |
| -------------------------------- | -------------------------------------------------------------------- | -------- |
| ViewType への skillCreate 追加   | `ViewType` 型に `"skillCreate"` が追加済み                           | 確認済み |
| ViewType への skillAnalysis 追加 | `ViewType` 型に `"skillAnalysis"` が追加済み                         | 確認済み |
| onAction 型定義                  | `onAction?: () => void` が関連型に定義済み                           | 確認済み |
| renderView() の case 追加        | `renderView()` に `skillCreate` / `skillAnalysis` の case が追加済み | 確認済み |

### 使用する ViewType 名称

- スキル作成画面: `"skillCreate"`
- スキル分析画面: `"skillAnalysis"`
- ワークスペース画面: 既存の ViewType 定義から実際のキーを確認して使用する

### renderView() との接続

- `setCurrentView("skillCreate")` を呼び出すことで、`renderView()` が skillCreate コンポーネントをレンダリングする
- `setCurrentView("skillAnalysis")` を呼び出すことで、`renderView()` が skillAnalysis コンポーネントをレンダリングする
- SkillCenterView は遷移先コンポーネントを直接知る必要はなく、ViewType キーのみを渡す

### Zustand ストアとの接続

- `setCurrentView` の取得方法: `useAppStore((state) => state.setCurrentView)` パターンを使用する
- `useSetCurrentView` 個別セレクタが追加された場合はそちらを優先する
- P31 対策として、`setCurrentView` はアクション関数であるため `useEffect` 依存配列に含めても安全

---

## 5. 統合テスト連携観点

### Task03（SkillDetailPanel アクションボタン）との連携

- Task02 と Task03 は並列実行タスクであり、`index.tsx` と `useSkillCenter.ts` を共有ファイルとして持つ
- Task02 の変更範囲: ヘッダー CTA 追加、JourneyPanel への `onAction` 注入、CTA ボタンレンダリング
- Task03 の変更範囲: SkillDetailPanel の編集・分析ボタン（Task02 とは異なるコンポーネント領域）
- 統合テストでは両タスクの変更が共存した状態で全 AC が満たされることを確認する

### ナビゲーションフローの整合性

- `setCurrentView("skillCreate")` → skillCreate ビューが表示される（Task01 が保証）
- `setCurrentView("skillAnalysis")` → skillAnalysis ビューが表示される（Task01 が保証）
- 各遷移後に「戻る」操作で SkillCenter に戻れることを確認する（遷移先の実装に依存）

### リグレッション確認項目

- 既存の SkillCenterView の表示が壊れていないこと
- 既存のナビゲーション（Dashboard、AgentView 等）が正常に動作すること
- renderView() の他の case が影響を受けていないこと

---

## 完了条件

- [ ] 本ドキュメントの全セクションが記載されている
- [ ] AC-1 から AC-8 が具体的な実装要件として定義されている
- [ ] Task01 依存インターフェースが明確に記載されている
- [ ] Task03 との連携観点が記載されている
- [ ] scope-definition.md が並行して作成されている
