# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                                      |
| ---------- | ------------------------------------------------------- |
| Phase      | 1                                                       |
| 機能名     | TASK-10A-F Store駆動ライフサイクルUI統合                |
| 作成日     | 2026-03-07                                              |
| 状態       | 未着手                                                  |
| 依存タスク | TASK-10A-B (完了), TASK-10A-C (完了), TASK-10A-D (完了) |

## 目的

SkillCreateWizard と useSkillAnalysis フック内の直接 `window.electronAPI` 呼び出し（4箇所）を排除し、agentSlice の store action 経由に統一する。TASK-10A-D で agentSlice に追加済みの `analyzeSkill`, `applySkillImprovements`, `autoImproveSkill`, `createSkill` アクションと個別セレクタ（`useAnalyzeSkill`, `useCreateSkill` 等）を、コンポーネント/フック側で使用するように書き換える。

## 実行タスク

- 直接IPC呼び出しの特定と排除: 4箇所の `window.electronAPI` 直接呼び出しを store action に置換する
- useSkillAnalysis フックのリファクタリング: store action を注入可能な設計に変更する
- SkillCreateWizard のリファクタリング: `window.electronAPI.skill.create()` を `useCreateSkill()` セレクタ経由に変更する
- テストファイルの更新: モック対象を `window.electronAPI` から store action に変更する
- P31/P48 対策の検証: 個別セレクタ使用と useShallow 適用基準の確認

## 参照資料

| 資料名                      | パス                                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| SkillCreateWizard 実装      | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                    |
| useSkillAnalysis フック     | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts`                                |
| SkillManagementPanel 実装   | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                                 |
| agentSlice 定義             | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                                |
| Store index（セレクタ）     | `apps/desktop/src/renderer/store/index.ts`                                                            |
| SkillCreateWizard テスト    | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`                     |
| SkillAnalysisView テスト    | `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx`                     |
| arch-state-management       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                          |
| architecture-implementation | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`           |
| ui-ux-feature-components    | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                       |
| interfaces-agent-sdk-skill  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                     |
| api-ipc-agent               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                  |
| error-handling              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                 |
| quality-requirements        | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                           |
| P31 対策ルール              | `.claude/rules/06-known-pitfalls.md#P31`                                                              |
| P48 対策ルール              | `.claude/rules/06-known-pitfalls.md#P48`                                                              |
| P42 バリデーションルール    | `.claude/rules/06-known-pitfalls.md#P42`                                                              |
| 状態管理ルール              | `.claude/rules/03-state-management.md`                                                                |
| TASK-10A-D Phase 1          | `docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION/phase-1-requirements.md` |

## 実行手順

### Step 1: 直接IPC呼び出し箇所の特定

以下の4箇所が排除対象である:

| #   | ファイル                    | 行  | 呼び出し内容                                                      | 置換先 store action                           |
| --- | --------------------------- | --- | ----------------------------------------------------------------- | --------------------------------------------- |
| 1   | `SkillCreateWizard.tsx`     | 46  | `window.electronAPI.skill.create({ description, options })`       | `createSkill(description, options)`           |
| 2   | `hooks/useSkillAnalysis.ts` | 94  | `window.electronAPI.skill.analyze(skillName)`                     | `analyzeSkill(skillName)`                     |
| 3   | `hooks/useSkillAnalysis.ts` | 140 | `window.electronAPI.skill.applyImprovements(skillName, selected)` | `applySkillImprovements(skillName, selected)` |
| 4   | `hooks/useSkillAnalysis.ts` | 171 | `window.electronAPI.skill.autoImprove(skillName)`                 | `autoImproveSkill(skillName)`                 |

### Step 2: store action の要件定義

agentSlice に既に実装済みの以下のアクションを使用する（新規追加は不要）:

| アクション名             | セレクタ名                  | シグネチャ                                                        |
| ------------------------ | --------------------------- | ----------------------------------------------------------------- |
| `analyzeSkill`           | `useAnalyzeSkill`           | `(skillName: string) => Promise<void>`                            |
| `applySkillImprovements` | `useApplySkillImprovements` | `(skillName: string, suggestions: Suggestion[]) => Promise<void>` |
| `autoImproveSkill`       | `useAutoImproveSkill`       | `(skillName: string) => Promise<void>`                            |
| `createSkill`            | `useCreateSkill`            | `(description: string, options: {...}) => Promise<string>`        |

### Step 3: useSkillAnalysis フックの書き換え要件

useSkillAnalysis フック内の3箇所の直接IPC呼び出しを、store action の関数参照を受け取る形に変更する。変更方針は以下の2案から選択する:

- **案A（Props注入方式）**: useSkillAnalysis の引数に store action 関数を追加する
- **案B（内部セレクタ方式）**: useSkillAnalysis 内部で `useAnalyzeSkill()` 等の個別セレクタを直接呼び出す

いずれの方式でも、以下の要件を満たすこと:

- `window.electronAPI` への直接参照が useSkillAnalysis 内に残らない
- P31 対策として個別セレクタパターンを使用する
- 既存の `UseSkillAnalysisReturn` インターフェースの戻り値型は変更しない（後方互換性維持）

### Step 4: SkillCreateWizard の書き換え要件

`handleGenerate` 関数内の `window.electronAPI.skill.create()` を `useCreateSkill()` セレクタ経由に変更する:

- `useCreateSkill()` から取得した `createSkill` 関数を使用する
- `createSkill` の戻り値（スキルパス文字列）を `setSkillPath` に設定する
- エラーハンドリングは agentSlice の `skillError` と SkillCreateWizard ローカルの `error` ステートの両方で管理する
- `isGenerating` ローカルステートは維持する（ウィザードのステップ遷移制御に必要）

### Step 5: P31/P48 対策要件の定義

- P31: useSkillAnalysis 内で store action を使用する場合、個別セレクタ（`useAnalyzeSkill()` 等）で取得した関数参照を useCallback の依存配列に含める。合成 Hook は使用しない
- P48: useSkillAnalysis の戻り値に `.filter()` / `.map()` で配列を返す派生セレクタがある場合、`useShallow` を適用する。現状の `UseSkillAnalysisReturn` では `selectedSuggestions` が `Set<number>` 型であり配列ではないため、P48 適用は不要と判断する

### Step 6: TASK-10A-G 回帰テスト基盤への引き渡し要件

TASK-10A-G（回帰テスト基盤）で以下を検証できるようにデータフロー要件を定義する:

| データフロー                                          | 検証内容                                                                   |
| ----------------------------------------------------- | -------------------------------------------------------------------------- |
| `useAnalyzeSkill()` → `agentSlice.analyzeSkill` → IPC | store action 経由で IPC が呼び出され、`currentAnalysis` に結果が格納される |
| `useCreateSkill()` → `agentSlice.createSkill` → IPC   | store action 経由で IPC が呼び出され、スキルパスが返される                 |
| `useApplySkillImprovements()` → `agentSlice` → IPC    | store action 経由で改善が適用され、再分析が自動実行される                  |
| `useAutoImproveSkill()` → `agentSlice` → IPC          | store action 経由で全自動改善が実行され、再分析が自動実行される            |

## 機能要件

### FR-1: SkillCreateWizard の直接IPC呼び出し排除

- `SkillCreateWizard.tsx` の `handleGenerate` 関数（行46）で `window.electronAPI.skill.create()` を呼び出している箇所を、`useCreateSkill()` セレクタから取得した `createSkill` 関数に置換する
- `createSkill` の戻り値からスキルパスを取得し、`setSkillPath` に設定する
- 置換後、`SkillCreateWizard.tsx` 内に `window.electronAPI` への参照が0箇所であることを `grep` で検証する

### FR-2: useSkillAnalysis の分析呼び出し排除

- `useSkillAnalysis.ts` の `handleAnalyze` 関数（行94）で `window.electronAPI.skill.analyze()` を呼び出している箇所を、store action の `analyzeSkill` に置換する
- store action 呼び出し後、`currentAnalysis` セレクタから分析結果を取得して `analysis` ローカルステートを更新する

### FR-3: useSkillAnalysis の改善適用呼び出し排除

- `useSkillAnalysis.ts` の `handleApplySelected` 関数（行140）で `window.electronAPI.skill.applyImprovements()` を呼び出している箇所を、store action の `applySkillImprovements` に置換する
- 改善適用後の再分析は store action 内で自動実行されるため、明示的な再分析呼び出しは不要

### FR-4: useSkillAnalysis の全自動改善呼び出し排除

- `useSkillAnalysis.ts` の `handleAutoImprove` 関数（行171）で `window.electronAPI.skill.autoImprove()` を呼び出している箇所を、store action の `autoImproveSkill` に置換する
- 全自動改善後の再分析は store action 内で自動実行されるため、明示的な再分析呼び出しは不要

### FR-5: テストファイルのモック対象変更

- `SkillCreateWizard.test.tsx` のモック対象を `window.electronAPI.skill.create` から store action の `createSkill` に変更する
- `SkillAnalysisView.test.tsx` のモック対象を `window.electronAPI.skill.analyze` / `applyImprovements` / `autoImprove` から store action の対応アクションに変更する
- テストで store action をモック化する際は `vi.fn()` で個別にモックし、`useAppStore` の部分モックまたは `zustand` のテストユーティリティを使用する

### FR-6: 直接IPC呼び出しゼロの検証

- 修正完了後、以下のコマンドで直接IPC呼び出しが0件であることを検証する:
  ```
  grep -rn "window\.electronAPI" apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
  grep -rn "window\.electronAPI" apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts
  ```
- 両方のコマンドの出力が0行であること

## 非機能要件

### NFR-1: P31（Zustand無限ループ）対策

- useSkillAnalysis 内で store action を取得する際、個別セレクタパターン（`useAnalyzeSkill()`, `useApplySkillImprovements()` 等）を使用する
- 合成 Store Hook（オブジェクトを返す形式）は使用しない
- `useEffect` の依存配列には個別セレクタから取得した関数参照のみを含める
- Zustand のアクション参照は安定しているため、依存配列に含めても無限ループは発生しない

### NFR-2: P48（useShallow）対策

- useSkillAnalysis 内で `.filter()` / `.map()` によって新しい配列参照を返す派生セレクタを使用する場合、`useShallow` を適用する
- 現時点では P48 適用対象のセレクタは存在しないが、将来の拡張時に備えて本要件を定義する

### NFR-3: 後方互換性

- `UseSkillAnalysisReturn` インターフェースの全プロパティ型を変更しない
- `SkillCreateWizardProps` インターフェースを変更しない
- `SkillAnalysisView` の Props インターフェース（`skillName: string, onClose: () => void`）を変更しない
- 既存の SkillManagementPanel からの呼び出しコードは変更しない

### NFR-4: エラーハンドリング

- store action 内のエラーは `skillError` 状態に格納される（既存実装を維持）
- useSkillAnalysis のローカル `error` ステートは、store の `skillError` を参照するか、store action の try/catch エラーを反映する
- SkillCreateWizard のローカル `error` ステートは維持し、store action のエラーをキャッチして設定する

### NFR-5: テスト品質

- 修正後のテストが全て PASS すること
- テスト内で `window.electronAPI` への直接モックが残らないこと（store action モックに統一）
- happy-dom 環境で実行すること（P39 対策）
- テスト実行は `apps/desktop/` ディレクトリから行うこと（P40 対策）

## 受け入れ基準

### AC-1: SkillCreateWizard の直接IPC排除

- **Given**: SkillCreateWizard が表示され、スキル説明が入力済みである
- **When**: 「生成」ボタンをクリックする
- **Then**: `useCreateSkill()` から取得した `createSkill` 関数が呼び出され、`window.electronAPI.skill.create()` は呼び出されない

### AC-2: useSkillAnalysis の分析呼び出し排除

- **Given**: SkillAnalysisView が `skillName="test-skill"` でマウントされる
- **When**: `useSkillAnalysis` フックが初期化される
- **Then**: `useAnalyzeSkill()` から取得した `analyzeSkill` 関数が呼び出され、`window.electronAPI.skill.analyze()` は呼び出されない

### AC-3: useSkillAnalysis の改善適用排除

- **Given**: 分析結果が表示され、1件以上の提案が選択されている
- **When**: 「選択した改善を適用」ボタンをクリックする
- **Then**: `useApplySkillImprovements()` から取得した `applySkillImprovements` 関数が呼び出され、`window.electronAPI.skill.applyImprovements()` は呼び出されない

### AC-4: useSkillAnalysis の全自動改善排除

- **Given**: 分析結果が表示されている
- **When**: 「全自動改善」ボタンをクリックし、確認ダイアログで「OK」を選択する
- **Then**: `useAutoImproveSkill()` から取得した `autoImproveSkill` 関数が呼び出され、`window.electronAPI.skill.autoImprove()` は呼び出されない

### AC-5: 直接IPC呼び出しゼロ

- **Given**: 全ての修正が完了している
- **When**: `grep -rn "window\.electronAPI" SkillCreateWizard.tsx useSkillAnalysis.ts` を実行する
- **Then**: 出力が0行である

### AC-6: 既存テスト全PASS

- **Given**: テストファイルのモック対象が store action に変更されている
- **When**: `cd apps/desktop && pnpm vitest run src/renderer/components/skill/` を実行する
- **Then**: 全テストが PASS する

### AC-7: 後方互換性維持

- **Given**: SkillManagementPanel から SkillAnalysisView と SkillCreateWizard が呼び出されている
- **When**: SkillManagementPanel のコードを変更せずにビルドする
- **Then**: TypeScript コンパイルエラーが発生しない

## スコープ定義

### 含む

- `SkillCreateWizard.tsx` の `window.electronAPI.skill.create()` を store action に置換
- `useSkillAnalysis.ts` の `window.electronAPI.skill.analyze()` を store action に置換
- `useSkillAnalysis.ts` の `window.electronAPI.skill.applyImprovements()` を store action に置換
- `useSkillAnalysis.ts` の `window.electronAPI.skill.autoImprove()` を store action に置換
- `SkillCreateWizard.test.tsx` のモック対象変更
- `SkillAnalysisView.test.tsx` のモック対象変更

### 含まない

- agentSlice への新規アクション追加（TASK-10A-D で追加済み）
- store/index.ts への新規セレクタ追加（TASK-10A-D で追加済み）
- IPC ハンドラの変更
- Preload API の変更
- SkillManagementPanel の変更
- ChatPanel の変更
- 新規 IPC チャンネルの追加

## 統合テスト連携

### テスト対象のデータフロー

| 連携元            | 連携先                            | 検証内容                                                                               |
| ----------------- | --------------------------------- | -------------------------------------------------------------------------------------- |
| SkillCreateWizard | agentSlice.createSkill            | `useCreateSkill()` セレクタ経由で `createSkill` が呼び出される                         |
| useSkillAnalysis  | agentSlice.analyzeSkill           | `useAnalyzeSkill()` セレクタ経由で `analyzeSkill` が呼び出される                       |
| useSkillAnalysis  | agentSlice.applySkillImprovements | `useApplySkillImprovements()` セレクタ経由で `applySkillImprovements` が呼び出される   |
| useSkillAnalysis  | agentSlice.autoImproveSkill       | `useAutoImproveSkill()` セレクタ経由で `autoImproveSkill` が呼び出される               |
| agentSlice        | Preload API                       | store action 内部で `window.electronAPI.skill.*` を呼び出す（agentSlice 側は変更なし） |

### テスト環境の制約

- happy-dom 環境で実行する（P39 対策: userEvent は使用禁止、fireEvent を使用）
- テスト実行は `apps/desktop/` ディレクトリから行う（P40 対策）
- store action のモック化には `vi.fn()` を使用する
- `window.electronAPI` のモックはテストから除去する（store action レベルでモック化するため）

## アーキテクチャ層別要件

### Renderer 層

| 対象ファイル                           | 変更内容                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------- |
| `SkillCreateWizard.tsx`                | `useCreateSkill()` インポート追加、`handleGenerate` 内の IPC 呼び出しを store action に置換 |
| `hooks/useSkillAnalysis.ts`            | `useAnalyzeSkill()` 等のインポート追加、3箇所の IPC 呼び出しを store action に置換          |
| `__tests__/SkillCreateWizard.test.tsx` | モック対象を `window.electronAPI` から store action に変更                                  |
| `__tests__/SkillAnalysisView.test.tsx` | モック対象を `window.electronAPI` から store action に変更                                  |

### IPC 通信層（変更なし）

本タスクでは IPC ハンドラおよび Preload API の変更は不要。agentSlice 内の既存 store action が IPC を呼び出す構造は維持する。

## 成果物

| 成果物     | パス                                                                  | 説明           |
| ---------- | --------------------------------------------------------------------- | -------------- |
| 要件定義書 | `docs/30-workflows/store-driven-lifecycle-ui/phase-1-requirements.md` | 本ドキュメント |

## 完了条件

- [ ] 直接IPC呼び出し4箇所が全て特定されている（Step 1 テーブル）
- [ ] store action の要件が定義されている（Step 2 テーブル）
- [ ] useSkillAnalysis の書き換え方針が2案提示されている（Step 3）
- [ ] SkillCreateWizard の書き換え要件が定義されている（Step 4）
- [ ] P31/P48 対策要件が定義されている（Step 5）
- [ ] TASK-10A-G 引き渡し要件が定義されている（Step 6）
- [ ] 機能要件 FR-1 〜 FR-6 が全て定義されている
- [ ] 非機能要件 NFR-1 〜 NFR-5 が全て定義されている
- [ ] 受け入れ基準 AC-1 〜 AC-7 が Given/When/Then 形式で記載されている
- [ ] スコープ定義（含む/含まない）が明確に記載されている
- [ ] 統合テスト連携のデータフローが列挙されている
- [ ] アーキテクチャ層別要件が定義されている
- [ ] 参照資料パスが全て正確である
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 2: 設計 → `phase-2-design.md`
