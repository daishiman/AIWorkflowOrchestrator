# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                                      |
| ---------- | ------------------------------------------------------- |
| Phase      | 1                                                       |
| 機能名     | TASK-10A-D スキルライフサイクルUI統合                   |
| 作成日     | 2026-03-03                                              |
| 状態       | 未着手                                                  |
| 依存タスク | TASK-10A-A (完了), TASK-10A-B (完了), TASK-10A-C (完了) |

## 目的

既に実装済みの SkillManagementPanel（TASK-10A-A）、SkillAnalysisView（TASK-10A-B）、SkillCreateWizard（TASK-10A-C）を統合し、ChatPanel からスキルの一覧表示・編集・分析・改善・新規作成までの全ライフサイクルを操作可能にする。

現在 SkillManagementPanel の analysis ビューと create ビューはプレースホルダー（「準備中」テキスト）のままであり、agentSlice には分析・改善・作成に必要なアクションと個別セレクタが未定義である。

## 実行タスク

- analysis ビュー統合: SkillManagementPanel の analysis プレースホルダーを SkillAnalysisView に差し替える。
- create ビュー統合: SkillManagementPanel の create プレースホルダーを SkillCreateWizard に差し替える。
- 状態アクション拡張: agentSlice に分析・改善・作成アクションを追加する。
- セレクタ公開: 追加アクションに対応する個別セレクタを `store/index.ts` からエクスポートする。
- ChatPanel 導線追加: スキル管理パネルへの遷移トグルを ChatPanel に追加する。

## 参照資料

| 資料名                    | パス                                                                   |
| ------------------------- | ---------------------------------------------------------------------- |
| SkillManagementPanel 実装 | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`  |
| SkillAnalysisView 実装    | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`     |
| SkillCreateWizard 実装    | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`     |
| useSkillAnalysis フック   | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` |
| agentSlice 定義           | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                 |
| Store index（セレクタ）   | `apps/desktop/src/renderer/store/index.ts`                             |
| ChatPanel 実装            | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`              |
| Preload Skill API         | `apps/desktop/src/preload/skill-api.ts`                                |
| skill-improver 型定義     | `packages/shared/src/types/skill-improver.ts`                          |
| P31 対策ルール            | `.claude/rules/06-known-pitfalls.md#P31`                               |
| P42 バリデーションルール  | `.claude/rules/06-known-pitfalls.md#P42`                               |
| 状態管理ルール            | `.claude/rules/03-state-management.md`                                 |

## 実行手順

1. 現在の SkillManagementPanel の analysis ビュー（155-167行目）のプレースホルダーを特定する
2. SkillAnalysisView の Props インターフェース（`skillName: string`, `onClose: () => void`）を確認する
3. analysis ビューのプレースホルダーを `<SkillAnalysisView skillName={String(selectedSkill.name)} onClose={handleBackToList} />` に差し替える
4. create ビュー（170-181行目）のプレースホルダーを特定する
5. SkillCreateWizard の Props インターフェース（`onClose: () => void`）を確認する
6. create ビューのプレースホルダーを `<SkillCreateWizard onClose={handleBackToList} />` に差し替える
7. agentSlice の `AgentState` に `currentAnalysis: SkillAnalysis | null`, `isAnalyzing: boolean`, `isImproving: boolean` を追加する
8. agentSlice の `AgentActions` に `analyzeSkill`, `applySkillImprovements`, `autoImproveSkill`, `createSkill` アクションを追加する
9. store/index.ts に個別セレクタ（`useAnalyzeSkill`, `useApplySkillImprovements`, `useAutoImproveSkill`, `useCreateSkill`, `useCurrentAnalysis`, `useIsAnalyzingSkill`, `useIsImprovingSkill`）をエクスポートする
10. ChatPanel に `showSkillManagement` ローカルステートと SkillManagementPanel のレンダリング分岐を追加する
11. ChatPanel のヘッダーにスキル管理パネル切替ボタンを追加する

## 機能要件

### FR-1: SkillManagementPanel の analysis ビューで SkillAnalysisView が表示される

- SkillManagementPanel の `currentView === "analysis"` かつ `selectedSkill !== null` の場合、SkillAnalysisView コンポーネントがレンダリングされる
- SkillAnalysisView に `skillName` として `String(selectedSkill.name)` が渡される
- SkillAnalysisView に `onClose` として `handleBackToList`（リストビューへの遷移）が渡される
- data-testid は `skill-management-panel-analysis-view` を維持する

### FR-2: SkillManagementPanel の create ビューで SkillCreateWizard が表示される

- SkillManagementPanel の `currentView === "create"` の場合、SkillCreateWizard コンポーネントがレンダリングされる
- SkillCreateWizard に `onClose` として `handleBackToList`（リストビューへの遷移）が渡される
- data-testid は `skill-management-panel-create-view` を維持する

### FR-3: agentSlice に分析・改善・作成アクションが追加される

以下のアクションを `AgentActions` インターフェースに追加する:

| アクション名             | シグネチャ                                                         | 説明                                                                          |
| ------------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `analyzeSkill`           | `(skillName: string) => Promise<void>`                             | Preload API `skill.analyze()` を呼び出し、結果を `currentAnalysis` に格納する |
| `applySkillImprovements` | `(skillName: string, suggestions: Suggestion[]) => Promise<void>`  | Preload API `skill.applyImprovements()` を呼び出し、結果を反映する            |
| `autoImproveSkill`       | `(skillName: string) => Promise<void>`                             | Preload API `skill.autoImprove()` を呼び出し、結果を反映する                  |
| `createSkill`            | `(description: string, options: WizardOptions) => Promise<string>` | Preload API `skill.create()` を呼び出し、作成されたスキルのパスを返す         |

以下の状態を `AgentState` インターフェースに追加する:

| 状態名            | 型                      | 初期値  | 説明                 |
| ----------------- | ----------------------- | ------- | -------------------- |
| `currentAnalysis` | `SkillAnalysis \| null` | `null`  | 最新の分析結果       |
| `isAnalyzing`     | `boolean`               | `false` | 分析処理中フラグ     |
| `isImproving`     | `boolean`               | `false` | 改善適用処理中フラグ |

### FR-4: 各アクションに対応する個別セレクタHookが公開される

以下の個別セレクタを `store/index.ts` からエクスポートする:

| セレクタ名                  | 戻り値                                                             | 説明                 |
| --------------------------- | ------------------------------------------------------------------ | -------------------- |
| `useCurrentAnalysis`        | `SkillAnalysis \| null`                                            | 現在の分析結果       |
| `useIsAnalyzingSkill`       | `boolean`                                                          | 分析中フラグ         |
| `useIsImprovingSkill`       | `boolean`                                                          | 改善中フラグ         |
| `useAnalyzeSkill`           | `(skillName: string) => Promise<void>`                             | 分析アクション       |
| `useApplySkillImprovements` | `(skillName: string, suggestions: Suggestion[]) => Promise<void>`  | 改善適用アクション   |
| `useAutoImproveSkill`       | `(skillName: string) => Promise<void>`                             | 全自動改善アクション |
| `useCreateSkill`            | `(description: string, options: WizardOptions) => Promise<string>` | スキル作成アクション |

### FR-5: ChatPanel にスキル管理パネルへのアクセスが追加される

- ChatPanel に `showSkillManagement` ローカルステート（`useState<boolean>(false)`）を追加する
- チャットヘッダーの SkillSelector の隣にスキル管理パネル切替ボタンを配置する
- ボタンクリックで `showSkillManagement` をトグルする
- `showSkillManagement === true` の場合、メッセージエリアの代わりに SkillManagementPanel を表示する
- ボタンには aria-label「スキル管理パネルを開く」/「スキル管理パネルを閉じる」を付与する

### FR-6: 全コンポーネントがビュー遷移で連携する

- リストビュー → スキルカード「分析」ボタン → analysis ビュー（SkillAnalysisView 表示）
- リストビュー → スキルカード「編集」ボタン → editor ビュー（SkillEditor 表示、既存）
- リストビュー → 「新規作成」ボタン → create ビュー（SkillCreateWizard 表示）
- analysis / editor / create ビュー → 「閉じる」/「戻る」操作 → リストビューに戻る

## 非機能要件

### NFR-1: P31（Zustand無限ループ）対策

- 全ての新規セレクタは個別セレクタパターン（`useAppStore((state) => state.xxx)`）で実装する
- 合成Store Hook（オブジェクトを返す形式）は作成しない
- useEffect の依存配列には個別セレクタから取得した関数参照のみを含める

### NFR-2: P42準拠の3段バリデーション

agentSlice の各アクション内で Preload API を呼び出す前に、文字列引数に対して以下の3段バリデーションを実施する:

1. `typeof skillName !== "string"` → エラー
2. `skillName === ""` → エラー
3. `skillName.trim() === ""` → エラー

### NFR-3: エラーハンドリング

- 各アクション内で try/catch を使用し、エラーは `skillError` 状態に格納する
- エラーメッセージは `formatErrorMessage()` 関数（agentSlice 内に既存）を使用してフォーマットする
- Preload API 呼び出しエラー時は `isAnalyzing` / `isImproving` をfalseにリセットする

### NFR-4: Apple HIG準拠のUI

- スキル管理パネル切替ボタンは Apple HIG System Colors に準拠する CSS 変数を使用する
- ライト/ダーク両モードでの視認性を確保する
- ボタンのインタラクション状態（hover, active, focus-visible）を実装する
- アニメーションは 200-300ms とする

### NFR-5: アクセシビリティ

- スキル管理パネル切替ボタンに `aria-label` を付与する
- `aria-expanded` 属性で展開状態を通知する
- キーボード操作でスキル管理パネルの開閉が可能である

## 受け入れ基準

### AC-1: 分析ビューの統合

- **Given**: SkillManagementPanel のリストビューでスキルが1件以上表示されている
- **When**: スキルカードの「分析」ボタンをクリックする
- **Then**: SkillAnalysisView（data-testid: `skill-analysis-view`）が表示され、対象スキルの分析が自動実行される

### AC-2: 作成ビューの統合

- **Given**: SkillManagementPanel のリストビューが表示されている
- **When**: 「新規作成」ボタンをクリックする
- **Then**: SkillCreateWizard（data-testid: `skill-create-wizard`）が表示され、StepIndicator が「説明入力」ステップを示す

### AC-3: agentSlice のアクション追加

- **Given**: agentSlice が初期状態である
- **When**: `analyzeSkill("test-skill")` を実行する
- **Then**: `isAnalyzing` が `true` に変わり、Preload API 完了後に `currentAnalysis` に結果が格納され、`isAnalyzing` が `false` に戻る

### AC-4: 個別セレクタの公開

- **Given**: store/index.ts がインポートされている
- **When**: `useAnalyzeSkill()` を呼び出す
- **Then**: `(skillName: string) => Promise<void>` 型の安定した関数参照が返される

### AC-5: ChatPanel のスキル管理パネルアクセス

- **Given**: ChatPanel が表示されている
- **When**: ヘッダーのスキル管理切替ボタンをクリックする
- **Then**: メッセージエリアの代わりに SkillManagementPanel が表示される

### AC-6: スキル管理パネルの閉じ操作

- **Given**: ChatPanel 上で SkillManagementPanel が表示されている
- **When**: スキル管理切替ボタンを再度クリックする
- **Then**: SkillManagementPanel が非表示になり、元のメッセージエリアが表示される

### AC-7: ビュー遷移の連携

- **Given**: SkillManagementPanel の analysis ビューで SkillAnalysisView が表示されている
- **When**: SkillAnalysisView の閉じるボタン（X アイコン）をクリックする
- **Then**: SkillManagementPanel のリストビューに戻る

## スコープ定義

### 含む

- SkillManagementPanel の analysis / create プレースホルダー差し替え
- agentSlice への `analyzeSkill`, `applySkillImprovements`, `autoImproveSkill`, `createSkill` アクション追加
- agentSlice への `currentAnalysis`, `isAnalyzing`, `isImproving` 状態追加
- store/index.ts への個別セレクタ7件追加
- ChatPanel への `showSkillManagement` 状態とトグルボタン追加
- ChatPanel 上での SkillManagementPanel 条件レンダリング

### 含まない

- SkillAnalysisView の内部ロジック変更（TASK-10A-B で完了済み）
- SkillCreateWizard の内部ロジック変更（TASK-10A-C で完了済み）
- SkillEditor の変更（TASK-10A-A で完了済み）
- IPC ハンドラの変更（skill:analyze, skill:create, skill:improve は実装済み）
- Preload API の変更（skill.analyze, skill.create, skill.applyImprovements, skill.autoImprove は実装済み）
- 新規 IPC チャンネルの追加

## 統合テスト連携

### テスト対象のコンポーネント間連携

| 連携元               | 連携先               | 検証内容                                                                                               |
| -------------------- | -------------------- | ------------------------------------------------------------------------------------------------------ |
| SkillManagementPanel | SkillAnalysisView    | analysis ビューで SkillAnalysisView がレンダリングされ、`skillName` と `onClose` が正しく渡される      |
| SkillManagementPanel | SkillCreateWizard    | create ビューで SkillCreateWizard がレンダリングされ、`onClose` が正しく渡される                       |
| ChatPanel            | SkillManagementPanel | `showSkillManagement === true` で SkillManagementPanel がレンダリングされる                            |
| agentSlice           | Preload API          | `analyzeSkill` が `window.electronAPI.skill.analyze()` を呼び出し、結果を `currentAnalysis` に格納する |
| agentSlice           | Preload API          | `createSkill` が `window.electronAPI.skill.create()` を呼び出し、スキルパスを返す                      |

### テスト環境の制約

- happy-dom 環境で実行する（P39 対策: userEvent は使用禁止、fireEvent を使用）
- テスト実行は `apps/desktop/` ディレクトリから行う（P40 対策）
- `window.electronAPI.skill` のモック化が必要

## アーキテクチャ層別要件

### Renderer 層

| 対象ファイル                 | 変更内容                                                                                                                                             |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SkillManagementPanel.tsx`   | analysis ビューで `SkillAnalysisView` をレンダリング、create ビューで `SkillCreateWizard` をレンダリング                                             |
| `ChatPanel.tsx`              | `showSkillManagement` 状態追加、ヘッダーにトグルボタン追加、条件レンダリング                                                                         |
| `store/slices/agentSlice.ts` | `currentAnalysis`, `isAnalyzing`, `isImproving` 状態追加、`analyzeSkill`, `applySkillImprovements`, `autoImproveSkill`, `createSkill` アクション追加 |
| `store/index.ts`             | 7件の個別セレクタエクスポート追加                                                                                                                    |

### IPC 通信層（変更なし）

本タスクでは IPC ハンドラおよび Preload API の変更は不要。以下の既存 API を使用する:

| Preload API                                       | IPC チャンネル                         | 用途           |
| ------------------------------------------------- | -------------------------------------- | -------------- |
| `skill.analyze(skillName)`                        | `skill:analyze`                        | スキル分析     |
| `skill.applyImprovements(skillName, suggestions)` | `skill:improve`                        | 選択改善適用   |
| `skill.autoImprove(skillName)`                    | `skill:improve` (options.autoFix=true) | 全自動改善     |
| `skill.create({ description, options })`          | `skill:create`                         | スキル新規作成 |

## 成果物

| 成果物     | パス                                         | 説明           |
| ---------- | -------------------------------------------- | -------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | 本ドキュメント |

## 完了条件

- [ ] 機能要件 FR-1 〜 FR-6 が全て定義されている
- [ ] 非機能要件 NFR-1 〜 NFR-5 が全て定義されている
- [ ] 受け入れ基準 AC-1 〜 AC-7 が Given/When/Then 形式で記載されている
- [ ] スコープ定義（含む/含まない）が明確に記載されている
- [ ] 統合テスト連携の検証対象が列挙されている
- [ ] アーキテクチャ層別要件が定義されている
- [ ] 参照資料パスが全て正確である
- [ ] 依存タスク（TASK-10A-A, TASK-10A-B, TASK-10A-C）の完了状態が確認されている

## 次のPhase

Phase 2: 設計 → `phase-2-design.md`
