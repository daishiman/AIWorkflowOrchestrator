# Phase 1 スコープ定義: SkillCenterView 作成導線 CTA 実装

## メタ情報

- タスクID: step-02-par-task-02-skillcenter-create-route
- フェーズ: Phase 1 - 要件定義（スコープ定義）
- 作成日: 2026-03-17
- 依存タスク: step-01-seq-task-01-viewtype-renderView-foundation (Task01)
- 並列タスク: step-02-par-task-03-skilldetail-action-buttons (Task03)

---

## 1. 対象範囲（変更ファイル一覧）

### 1-1. skillLifecycleJourney.ts

**変更内容**: `ctaLabel` フィールドの追加

- ジャーニーステップ定義型（`SkillLifecycleStep` または相当する型）に `ctaLabel?: string` フィールドを追加する
- 各ステップの定義オブジェクトに `ctaLabel` の値を設定する
  - 「スキルを作る」ステップ: `ctaLabel` にボタンラベル文字列を設定（例: "スキルを作る"）
  - 「スキルを使う」ステップ: `ctaLabel` にボタンラベル文字列を設定（例: "ワークスペースへ"）
  - 「スキルを改善する」ステップ: `ctaLabel` にボタンラベル文字列を設定（例: "分析を開始する"）
- `onAction?: () => void` フィールドは Task01 で既定義のため、本タスクでの追加は不要
- `forbiddenResponsibility` の制約: `ctaLabel` はナビゲーション先を示すラベルのみであり、実行ロジックを含まない

**変更前後の差分イメージ**:

```typescript
// 変更前（onAction のみ）
interface SkillLifecycleStep {
  // ...既存フィールド
  onAction?: () => void;
}

// 変更後（ctaLabel を追加）
interface SkillLifecycleStep {
  // ...既存フィールド
  onAction?: () => void;
  ctaLabel?: string;
}
```

### 1-2. useSkillCenter.ts

**変更内容**: 3つのナビゲーションアクション追加

- `handleNavigateToCreate`: `setCurrentView("skillCreate")` を呼び出す関数
- `handleNavigateToWorkspace`: `setCurrentView` でワークスペースビューへ遷移する関数（ViewType キーは実装時に確認）
- `handleNavigateToAnalysis`: `setCurrentView("skillAnalysis")` を呼び出す関数

**フック戻り値への追加**:

```typescript
return {
  // ...既存の戻り値
  handleNavigateToCreate,
  handleNavigateToWorkspace,
  handleNavigateToAnalysis,
};
```

**setCurrentView の取得方法**:

- `useAppStore((state) => state.setCurrentView)` パターンを使用する
- `useSetCurrentView` 個別セレクタが追加済みであればそちらを優先する
- P31 対策: `setCurrentView` はアクション関数であり参照が安定しているため、`useCallback` の依存配列に含めても安全

**Task03 との衝突回避**:

- useSkillCenter.ts の変更は「ナビゲーションアクションの追加」のみ
- Task03 が変更する可能性のある既存関数（スキル選択、詳細パネル表示等）には触れない
- 追加する関数名はナビゲーション専用のプレフィックス（`handleNavigateTo...`）を使用して命名が衝突しないようにする

### 1-3. SkillCenterView/index.tsx

**変更内容**（3箇所）:

#### 変更箇所 A: ヘッダー CTA ボタン追加

- SkillCenterView ヘッダー部分に「+ 新しいツールを作る」ボタンコンポーネントを追加する
- `useSkillCenter` フックから `handleNavigateToCreate` を取得して `onClick` に渡す
- ボタンのスタイルはプライマリ（systemBlue）を適用する
- Task03 の変更領域（SkillDetailPanel 表示ロジック）とは独立した位置での変更

#### 変更箇所 B: JourneyPanel への onAction 注入

- `SkillLifecycleJourneyPanel`（index.tsx 内インライン実装）の各ステップに `onAction` を注入する
- 「スキルを作る」ステップ: `onAction: handleNavigateToCreate`
- 「スキルを使う」ステップ: `onAction: handleNavigateToWorkspace`
- 「スキルを改善する」ステップ: `onAction: handleNavigateToAnalysis`

#### 変更箇所 C: CTA ボタンレンダリング

- JourneyPanel の各ステップカードに `ctaLabel` と `onAction` が存在する場合、CTA ボタンをレンダリングするロジックを追加する
- ボタンの表示条件: `step.ctaLabel && step.onAction` の両方が truthy の場合のみ表示

### 1-4. store/index.ts（検討）: useSetCurrentView 個別セレクタ追加

**状態**: 現時点では未定義。実装時に以下を判断する。

- `useAppStore((state) => state.setCurrentView)` パターンで十分な場合: 変更不要
- P31 / Zustand ベストプラクティスに従い個別セレクタを追加する場合: `useSetCurrentView` を定義する

```typescript
// 個別セレクタを追加する場合の例
export const useSetCurrentView = () =>
  useAppStore((state) => state.setCurrentView);
```

---

## 2. 除外範囲（forbiddenResponsibility 対象）

以下は本タスクのスコープ外であり、実装してはならない。

### 2-1. スキル作成ロジック本体

- スキルファイルの作成、保存、バリデーション処理
- IPC ハンドラへの `skill:create` 呼び出し
- SkillCreateView コンポーネントの実装（Task01 の仕様に基づくが、本タスクは「遷移」のみ）

### 2-2. SkillAnalysisView の分析ロジック

- スキル分析の実行処理
- 分析結果の表示・レポート生成
- IPC ハンドラへの分析系呼び出し

### 2-3. SkillDetailPanel の編集・分析ボタン（Task03 の責務）

- SkillDetailPanel 内に表示される「編集」「分析」「削除」等のアクションボタン
- 個別スキルに対する操作 UI の実装
- Task03 が担当するため、本タスクでは変更しない

### 2-4. AgentView の改善導線（Task04 の責務）

- AgentView からスキル改善フローへのナビゲーション
- 実行結果に基づくスキル改善提案 UI
- Task04 が担当するため、本タスクでは変更しない

---

## 3. Task03 との衝突回避方針

### 共有ファイルの変更箇所分離

Task02 と Task03 は以下のファイルを共有する:

- `SkillCenterView/index.tsx`
- `useSkillCenter.ts`

衝突を回避するために、以下の方針で変更箇所を分離する。

**index.tsx の分離方針**:

| 変更領域              | Task02                           | Task03               |
| --------------------- | -------------------------------- | -------------------- |
| ヘッダー領域          | CTA ボタン追加（ヘッダー右側）   | 変更なし             |
| JourneyPanel 領域     | onAction 注入 + CTA レンダリング | 変更なし             |
| SkillDetailPanel 領域 | 変更なし                         | アクションボタン追加 |
| スキルリスト領域      | 変更なし                         | Task03 の判断に従う  |

**useSkillCenter.ts の分離方針**:

| 変更内容               | Task02                                        | Task03              |
| ---------------------- | --------------------------------------------- | ------------------- |
| ナビゲーション関数追加 | handleNavigateToCreate / Workspace / Analysis | 変更なし            |
| スキル操作関数         | 変更なし                                      | Task03 の判断に従う |

**マージ戦略**:

- Task02 と Task03 が並列で作業する場合、それぞれ異なる行・関数を変更するため、自動マージが成功することを期待する
- マージ競合が発生した場合は、両タスクの変更を両方保持する方向で解決する

---

## 4. 依存境界図

```
[Task01: ViewType/renderView 基盤]
      |
      | (ViewType: "skillCreate", "skillAnalysis" が追加済み)
      | (onAction?: () => void が型定義済み)
      |
      v
[Task02: SkillCenterView CTA 実装] ---- 並列 ---- [Task03: SkillDetailPanel アクション]
      |                                                   |
      | 変更ファイル:                                     | 変更ファイル:
      | - skillLifecycleJourney.ts (ctaLabel 追加)        | - SkillDetailPanel コンポーネント
      | - useSkillCenter.ts (ナビゲーション関数追加)      | - useSkillCenter.ts (操作関数追加)
      | - SkillCenterView/index.tsx (ヘッダー + Journey)  | - SkillCenterView/index.tsx (DetailPanel)
      | - store/index.ts (検討)                           |
      |                                                   |
      v                                                   v
[Task04: AgentView 改善導線]
      |
      | (Task02/03 の完了が前提)
```

**依存方向**:

- Task02 は Task01 の成果物（ViewType 定義、renderView case）に依存する
- Task03 は Task02 とは独立して並列実行可能
- Task04 は Task02/03 の完了後に開始される（Task04 の定義に従う）

**インターフェース境界**:

- Task02 が公開するインターフェース: `handleNavigateToCreate`, `handleNavigateToWorkspace`, `handleNavigateToAnalysis` の3関数（useSkillCenter.ts 経由）
- Task03 が依存するインターフェース: 既存の useSkillCenter.ts の戻り値（Task02 の追加は影響しない）

---

## 統合テスト連携

### Task02 変更がもたらす統合テスト観点

- `useSkillCenter.ts` の `handleNavigateToCreate` / `handleNavigateToWorkspace` / `handleNavigateToAnalysis` が Zustand Store の `setCurrentView` と正しく接続していることを確認する
- Task03 と共有する `index.tsx` / `useSkillCenter.ts` の変更が並列マージ後も両者の機能が共存していることを統合テストで確認する
- Task01 が提供する `skillCreate` / `skillAnalysis` の `renderView()` case が、Task02 の `setCurrentView` 呼び出し後に正しくレンダリングされることを確認する

### リグレッション確認項目

- 既存の SkillCenterView の表示（スキルリスト、詳細パネル等）が壊れていないこと
- 既存のナビゲーション（Dashboard、AgentView 等）が正常に動作すること
- JourneyPanel の既存ステップ表示が変更による影響を受けていないこと

---

## 完了条件

- [ ] 対象ファイル一覧（1-1 から 1-4）が全て記載されている
- [ ] 各ファイルの変更内容が具体的に定義されている
- [ ] 除外範囲（forbiddenResponsibility 対象）が明確に列挙されている
- [ ] Task03 との衝突回避方針が記載されている
- [ ] 依存境界図が作成されている
- [ ] requirements-definition.md が並行して作成されている
