# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                                      |
| ---------- | ------------------------------------------------------- |
| Phase      | 1                                                       |
| 機能名     | TASK-10A-F スキルライフサイクルUIのStore駆動統合        |
| 作成日     | 2026-03-08                                              |
| 状態       | 未着手                                                  |
| 依存タスク | TASK-10A-B (完了), TASK-10A-C (完了), TASK-10A-D (完了) |

## 目的

`SkillCreateWizard` と `SkillAnalysisView` の直接 `window.electronAPI` 呼び出しを排除し、`agentSlice` の store action 経由に統一する。作成完了後の一覧同期と分析/改善状態の一貫性を確保し、`TASK-10A-G` の統合テスト基盤を固定する。

## 実行タスク

- CreateWizard 経路統一: `useCreateSkill` store action 経由でスキル作成を実行する設計を定義する。
- AnalysisView 経路統一: `useSkillAnalysis` フック内の analyze/improve 経路を store action（`useAnalyzeSkill`, `useApplySkillImprovements`, `useAutoImproveSkill`）経由に統一する設計を定義する。
- 状態遷移定義: 成功/失敗/再試行時の状態遷移表を定義する。
- P31 対策定義: 個別 selector・安定参照・依存配列ガードのルールを明文化する。
- 回帰観点定義: `TASK-10A-G` へ引き渡す回帰テスト観点（作成後一覧同期、改善後再分析）を定義する。

## 参照資料

| 資料名                    | パス                                                                                                                                         | 使用目的                     |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| 元タスク仕様書            | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-044-task-10a-f-store-driven-lifecycle-ui.md` | タスク全体要件               |
| 状態管理仕様              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                 | action/selector 責務分離     |
| 実装パターン              | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                                                  | store 駆動 UI パターン       |
| UI 機能仕様               | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                                              | 作成/分析/改善の UI 遷移整合 |
| Skill インターフェース    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                                            | create/analyze/improve 契約  |
| IPC API 仕様              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                         | チャネル責務境界             |
| IPC セキュリティ          | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                                 | sender/P42/境界検証          |
| エラー仕様                | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                        | エラーステート定義           |
| UI 設計原則               | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                                                               | a11y・操作一貫性             |
| 品質要件                  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                                  | テスト・品質ゲート基準       |
| SkillCreateWizard 実装    | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                                                           | 現在の IPC 依存調査          |
| useSkillAnalysis フック   | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`                                                                       | 現在の IPC 依存調査          |
| SkillManagementPanel 実装 | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                                                                        | 統合コンテキスト確認         |
| agentSlice 定義           | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                                                                       | 既存 action/state 確認       |
| Store index（セレクタ）   | `apps/desktop/src/renderer/store/index.ts`                                                                                                   | 既存個別セレクタ確認         |
| P31 対策ルール            | `.claude/rules/06-known-pitfalls.md#P31`                                                                                                     | 無限ループ防止パターン       |
| P42 バリデーションルール  | `.claude/rules/06-known-pitfalls.md#P42`                                                                                                     | 3段バリデーション            |
| P48 useShallow ルール     | `.claude/rules/06-known-pitfalls.md#P48`                                                                                                     | 派生セレクタの shallow 比較  |
| 状態管理ルール            | `.claude/rules/03-state-management.md`                                                                                                       | Zustand 設計原則             |

## 実行手順

1. SkillCreateWizard の現在のスキル作成呼び出し経路を特定する（`useCreateSkill` store action 経由であることを確認する）
2. useSkillAnalysis フックの現在の分析/改善呼び出し経路を特定する（`window.electronAPI.skill` を直接呼び出している箇所があれば列挙する）
3. 各呼び出し経路を store action 経由に統一する要件を定義する
4. 成功/失敗/再試行時の状態遷移表を作成する
5. P31 再発防止条件（個別 selector、安定参照、useEffect 依存配列ガード）を明文化する
6. TASK-10A-G に渡す回帰テスト観点を定義する

## 機能要件

### FR-1: SkillCreateWizard が store action 経由でスキル作成を実行する

- SkillCreateWizard は `useCreateSkill()` 個別セレクタから取得した `createSkill` アクションを使用してスキルを作成する
- `createSkill` アクション内部で `window.electronAPI.skill.create()` を呼び出す（コンポーネントからの直接 IPC 呼び出しは禁止）
- 作成成功時に `fetchSkills()` を呼び出してスキル一覧を同期する
- 作成結果（スキルパス）は `createSkill` の戻り値として返す

### FR-2: useSkillAnalysis フックが store action 経由で分析を実行する

- `useSkillAnalysis` フックは `useAnalyzeSkill()` 個別セレクタから取得した `analyzeSkill` アクションを使用してスキル分析を実行する
- `analyzeSkill` アクション内部で `window.electronAPI.skill.analyze()` を呼び出す
- 分析結果は `currentAnalysis` store 状態に格納される
- `useCurrentAnalysis()` 個別セレクタで分析結果を取得する

### FR-3: useSkillAnalysis フックが store action 経由で改善を適用する

- 選択改善適用は `useApplySkillImprovements()` 個別セレクタ経由の `applySkillImprovements` アクションを使用する
- 全自動改善は `useAutoImproveSkill()` 個別セレクタ経由の `autoImproveSkill` アクションを使用する
- 改善適用後は自動的に再分析を実行し、`currentAnalysis` を更新する

### FR-4: 処理中フラグが store 状態で一元管理される

- 分析中は `isAnalyzing: true` が store に設定される
- 改善適用中は `isImproving: true` が store に設定される
- エラー発生時は `skillError` に格納され、処理中フラグは `false` にリセットされる
- `useIsAnalyzingSkill()` と `useIsImprovingSkill()` 個別セレクタでフラグを取得する

### FR-5: エラー状態が store で一元管理される

- 分析/改善/作成で発生したエラーは全て `skillError` store 状態に格納される
- エラーメッセージは `formatErrorMessage()` でフォーマットする
- `useSkillError()` 個別セレクタでエラー状態を取得する
- `useClearSkillError()` 個別セレクタでエラーをクリアする

### FR-6: ローカル UI 状態はコンポーネント/フック内に保持する

- `useSkillAnalysis` フック内の `selectedSuggestions`（選択された提案インデックス）は `useState` で管理する
- `useSkillAnalysis` フック内の `improvementResult`（改善適用結果）は `useState` で管理する
- SkillCreateWizard 内の `description`, `options`, `isGenerating`, `error`, `skillPath` は `useState` で管理する

## 非機能要件

### NFR-1: P31（Zustand 無限ループ）対策

- store 状態と action の取得には個別セレクタパターン（`useAppStore((state) => state.xxx)`）を使用する
- 合成 Store Hook（オブジェクトを返す形式）は使用しない
- `useEffect` の依存配列には個別セレクタから取得したアクション関数参照のみを含める
- Zustand action 参照は安定しているため、依存配列に含めても無限ループは発生しない

### NFR-2: P42 準拠の 3段バリデーション

agentSlice の各 store action 内で Preload API を呼び出す前に、文字列引数に対して以下の 3段バリデーションを実施する:

1. `typeof skillName !== "string"` → `skillError` に設定して早期 return
2. `skillName === ""` → `skillError` に設定して早期 return
3. `skillName.trim() === ""` → `skillError` に設定して早期 return

### NFR-3: P48（useShallow）対策

- `.filter()` / `.map()` で新しい配列を返す派生セレクタには `useShallow` を適用する
- 本タスクの個別セレクタ（`useCurrentAnalysis`, `useIsAnalyzingSkill` 等）はプリミティブ値またはオブジェクト参照を返すため `useShallow` は不要

### NFR-4: エラーハンドリング

- 各 store action 内で try/catch を使用し、エラーは `skillError` 状態に格納する
- Preload API 呼び出し前に `window.electronAPI?.skill` の存在チェックを行う
- Preload API 呼び出しエラー時は `isAnalyzing` / `isImproving` を `false` にリセットする
- エラーメッセージに内部情報（スタックトレース、ファイルパス）を含めない

### NFR-5: パフォーマンス

- 個別セレクタは不要な再レンダーを防止する（プリミティブ値の比較で差分検知）
- 改善適用後の再分析は `applySkillImprovements` / `autoImproveSkill` 内で自動実行する（コンポーネント側で追加の useEffect を不要にする）

## 受け入れ基準

### AC-1: CreateWizard の store action 経由スキル作成

- **Given**: SkillCreateWizard がレンダリングされている
- **When**: 説明入力 → 設定 → 生成ステップを進行する
- **Then**: `useCreateSkill()` から取得した `createSkill` action が呼び出され、`window.electronAPI.skill.create()` はコンポーネントから直接呼び出されない

### AC-2: AnalysisView の store action 経由分析

- **Given**: SkillAnalysisView がスキル名 "test-skill" でレンダリングされている
- **When**: コンポーネントがマウントされる
- **Then**: `useAnalyzeSkill()` から取得した `analyzeSkill` action が呼び出され、結果が `useCurrentAnalysis()` で取得できる

### AC-3: 改善適用後の自動再分析

- **Given**: 分析結果が `currentAnalysis` に格納されている
- **When**: `applySkillImprovements` action を呼び出して改善を適用する
- **Then**: 改善適用完了後に自動的に再分析が実行され、`currentAnalysis` が更新される

### AC-4: エラー時の状態リセット

- **Given**: `analyzeSkill` action を実行中（`isAnalyzing === true`）
- **When**: Preload API 呼び出しでエラーが発生する
- **Then**: `isAnalyzing` が `false` にリセットされ、`skillError` にエラーメッセージが格納される

### AC-5: P31 対策の準拠

- **Given**: `useSkillAnalysis` フック内で store action を使用している
- **When**: フックが再レンダーされる
- **Then**: 個別セレクタから取得した action 参照が安定しており、`useEffect` の無限ループが発生しない

### AC-6: 作成後の一覧同期

- **Given**: SkillCreateWizard でスキル作成が成功した
- **When**: `createSkill` action が完了する
- **Then**: `fetchSkills()` が呼び出され、SkillManagementPanel のスキル一覧が最新状態に同期される

### AC-7: ローカル UI 状態の独立性

- **Given**: `useSkillAnalysis` フック内の `selectedSuggestions` が `useState` で管理されている
- **When**: 提案を選択/選択解除する
- **Then**: store 状態に影響を与えず、ローカル状態のみが更新される

## スコープ定義

### 含む

- SkillCreateWizard の `useCreateSkill` store action 経由統一
- useSkillAnalysis フックの analyze/improve 経路を store action 経由に統一
- agentSlice の `analyzeSkill`, `applySkillImprovements`, `autoImproveSkill`, `createSkill` action の内部で `window.electronAPI.skill.*` を呼び出す設計
- 状態遷移表（成功/失敗/再試行）の定義
- P31 対策（個別 selector、安定参照）の明文化
- TASK-10A-G へ引き渡す回帰テスト観点の定義
- 修正対象ファイル: `SkillCreateWizard.tsx`, `useSkillAnalysis.ts`, `SkillManagementPanel.tsx` と対応テストファイル

### 含まない

- agentSlice の状態/アクション追加（TASK-10A-D で完了済み）
- 個別セレクタの store/index.ts へのエクスポート追加（TASK-10A-D で完了済み）
- IPC ハンドラの変更（skill:analyze, skill:create, skill:improve は実装済み）
- Preload API の変更（skill.analyze, skill.create, skill.applyImprovements, skill.autoImprove は実装済み）
- 新規 IPC チャンネルの追加
- SkillManagementPanel のビュー切替ロジック変更（TASK-10A-D で完了済み）

## 統合テスト連携

### テスト対象のコンポーネント間連携

| 連携元             | 連携先       | 検証内容                                                                          |
| ------------------ | ------------ | --------------------------------------------------------------------------------- |
| SkillCreateWizard  | agentSlice   | `useCreateSkill` 経由で `createSkill` action が呼び出される                       |
| useSkillAnalysis   | agentSlice   | `useAnalyzeSkill` 経由で `analyzeSkill` action が呼び出される                     |
| useSkillAnalysis   | agentSlice   | `useApplySkillImprovements` 経由で `applySkillImprovements` action が呼び出される |
| useSkillAnalysis   | agentSlice   | `useAutoImproveSkill` 経由で `autoImproveSkill` action が呼び出される             |
| agentSlice         | Preload API  | 各 action 内部で `window.electronAPI.skill.*` が呼び出される                      |
| createSkill action | fetchSkills  | 作成成功後に `fetchSkills()` が呼び出されてスキル一覧が同期される                 |
| improve actions    | analyzeSkill | 改善適用成功後に自動再分析が実行されて `currentAnalysis` が更新される             |

### テスト環境の制約

- happy-dom 環境で実行する（P39 対策: userEvent は使用禁止、fireEvent を使用）
- テスト実行は `apps/desktop/` ディレクトリから行う（P40 対策）
- `window.electronAPI.skill` のモック化が必要
- agentSlice テストは `useAppStore.getState()` / `useAppStore.setState()` で直接状態検証

## 多角的チェック観点

### セキュリティ

- agentSlice の各 action で `window.electronAPI?.skill` の存在チェックがある
- P42 準拠 3段バリデーションが全文字列引数に適用されている
- エラーメッセージに内部情報が含まれない
- IPC ハンドラの変更がないため既存の sender 検証が維持される

### UI/UX

- 処理中状態（`isAnalyzing`, `isImproving`）がユーザーに視覚的にフィードバックされる
- エラー発生時にエラーメッセージが表示される
- ローカル UI 状態（提案選択等）が store 変更の影響を受けない

### アーキテクチャ

- レイヤー依存方向: Renderer（コンポーネント/フック）→ Store（agentSlice action）→ Preload API の一方向
- コンポーネントから `window.electronAPI` への直接呼び出しが排除される
- store action が IPC 通信の唯一の呼び出し元として機能する

### エラーハンドリング

- 全 store action に try/catch が実装されている
- エラーは `skillError` store 状態に一元格納される
- 処理中フラグ（`isAnalyzing`, `isImproving`）がエラー時に確実にリセットされる

## TASK-10A-G 回帰テスト観点

| 観点                   | 検証内容                                                                                              |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| 作成後一覧同期         | `createSkill` 成功後に `fetchSkills()` が呼ばれ、SkillManagementPanel の一覧に新スキルが表示される    |
| 改善後再分析           | `applySkillImprovements` / `autoImproveSkill` 成功後に `analyzeSkill` が自動呼び出しされる            |
| 分析→改善→再分析フロー | 分析結果から提案を選択 → 改善適用 → 再分析で更新された結果が表示される                                |
| エラー回復             | エラー発生後にリトライ（再度 action 呼び出し）で正常に処理が再開される                                |
| 状態初期化             | SkillAnalysisView を閉じて再度開いた場合、前回の `currentAnalysis` がクリアされ新たに分析が実行される |

## 成果物

| 成果物     | パス                      | 説明           |
| ---------- | ------------------------- | -------------- |
| 要件定義書 | `phase-1-requirements.md` | 本ドキュメント |

## 完了条件

- [ ] 機能要件 FR-1〜FR-6 が全て定義されている
- [ ] 非機能要件 NFR-1〜NFR-5 が全て定義されている
- [ ] 受け入れ基準 AC-1〜AC-7 が Given/When/Then 形式で記載されている
- [ ] スコープ定義（含む/含まない）が明確に記載されている
- [ ] 統合テスト連携の検証対象が列挙されている
- [ ] 多角的チェック観点（セキュリティ/UI/UX/アーキテクチャ/エラーハンドリング）が記載されている
- [ ] TASK-10A-G 回帰テスト観点が定義されている
- [ ] 参照資料パスが全て正確である
- [ ] 依存タスク（TASK-10A-B, TASK-10A-C, TASK-10A-D）の完了状態が確認されている

## 次のPhase

Phase 2: 設計 → `phase-2-design.md`
