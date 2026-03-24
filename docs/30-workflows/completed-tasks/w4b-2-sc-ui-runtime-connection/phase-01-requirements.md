# Phase 1: 要件定義

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 1                                |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 機能名   | w4b-2-sc-ui-runtime-connection   |
| 作成日   | 2026-03-22                       |
| 更新日   | 2026-03-24                       |

## 目的

SkillLifecyclePanel / SkillCreateWizard から RuntimeSkillCreatorFacade の plan→execute→improve フローを呼び出す要件を定義する。現行の `skill:create` への直結フローを調査し、UI 変更要件を明確化する。

## 実行タスク

- 現行フロー調査: SkillLifecyclePanel / SkillCreateWizard / Preload API / IPC / Main Process / RuntimeSkillCreatorFacade / Zustand Store の現状を調査する
- ギャップ分析: UI→Runtime 接続が必要な箇所（G1-G6）を特定する
- 受入基準定義: AC-1, AC-3, AC-4, AC-7 の達成条件を明文化する
- Zustand 状態追加要件定義: AgentSlice に追加する5フィールド + 11セレクタの要件を定義する

## 現行フロー調査結果

### 1. SkillLifecyclePanel（単一ページライフサイクル）

**ファイル**: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

3段階の UI フローを持つ:

| Step | 名称                       | 実装                                                      |
| ---- | -------------------------- | --------------------------------------------------------- |
| 1    | 依頼をまとめる             | テキストエリア入力 → `handlePrepare()` / `handleCreate()` |
| 2    | 生成したスキルを実行する   | `handleExecute()` → `skill:execute` IPC 直結              |
| 3    | 改善の次アクションを決める | `handlePlanImprovement()` → `skillCreator.improveSkill()` |

**重要な発見**:

- `handleCreate()` は AgentSlice の `createSkill()` を呼び出し、`window.electronAPI.skill.create()` に直結
- `handlePrepare()` は `skillCreatorApi.detectMode()` を呼び出してモード判定するが、**planSkill は未呼出**
- モード判定 API 未接続時は graceful degradation で「create モード」にフォールバック
- 既に `handoffGuidance` 状態が AgentSlice に存在（`HandoffGuidance | null`）

### 2. SkillCreateWizard（4段階ウィザード）

**ファイル**: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`

| Step | コンポーネント | 入力内容                     | 遷移条件                        |
| ---- | -------------- | ---------------------------- | ------------------------------- |
| 0    | DescribeStep   | スキル説明（自然言語）       | `description.trim().length > 0` |
| 1    | ConfigureStep  | オプション（3つの checkbox） | 「生成」ボタンクリック          |
| 2    | GenerateStep   | 生成中スピナー/エラー表示    | 自動遷移 → Step 3               |
| 3    | CompleteStep   | 生成パス表示 + 閉じるボタン  | `onClose` 呼び出し              |

**重要な発見**:

- DescribeStep は既に自然言語入力テキストエリアを持つ（「このスキルが何をするか自然言語で説明してください」）
- GenerateStep はシンプルなスピナー + エラー表示のみ（plan 結果表示なし）
- ウィザードから `planSkill`/`executePlan` は**未呼出**

### 3. Preload API（SkillCreatorAPI）

**ファイル**: `apps/desktop/src/preload/skill-creator-api.ts`

Runtime メソッドは**既に定義済み**:

```typescript
planSkill(prompt, authMode?, apiKey?): Promise<IpcResult<RuntimeSkillCreatorPlanResponse>>
executePlan(planId, skillSpec, authMode?, apiKey?): Promise<IpcResult<RuntimeSkillCreatorExecuteResult>>
improveSkillWithFeedback(skillName, feedback, authMode?, apiKey?): Promise<IpcResult<RuntimeSkillCreatorImproveResponse>>
```

### 4. IPC チャンネル

**ファイル**: `apps/desktop/src/preload/channels.ts`

Runtime チャンネルは**定義済み + ホワイトリスト登録済み**:

| チャンネル定数                | チャンネル名                  |
| ----------------------------- | ----------------------------- |
| `SKILL_CREATOR_PLAN`          | `skill-creator:plan`          |
| `SKILL_CREATOR_EXECUTE_PLAN`  | `skill-creator:execute-plan`  |
| `SKILL_CREATOR_IMPROVE_SKILL` | `skill-creator:improve-skill` |

### 5. Main Process ハンドラ

**ファイル**: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`

- `registerSkillCreatorHandlers(mainWindow, skillCreatorService, runtimeSkillCreatorService?)` で optional DI
- `runtimeSkillCreatorService` が存在する場合のみ runtime ハンドラを追加登録（P65 対策済み）

### 6. RuntimeSkillCreatorFacade

**ファイル**: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

- 3つのロール: Planner / Executor / Improver
- `plan()` メソッドは `terminal_handoff` / `integrated_api` の2経路を持つ
- LLMAdapter は Setter Injection で遅延注入（P34 準拠）
- LLMAdapter 未注入時は graceful degradation（stub 応答）

### 7. Zustand Store（AgentSlice）

**ファイル**: `apps/desktop/src/renderer/store/slices/agentSlice.ts`

既存の関連状態:

| フィールド             | 型                             | 用途                        |
| ---------------------- | ------------------------------ | --------------------------- |
| `isExecuting`          | `boolean`                      | スキル実行中フラグ          |
| `skillExecutionStatus` | `SkillExecutionStatus \| null` | ライフサイクル状態          |
| `handoffGuidance`      | `HandoffGuidance \| null`      | Terminal Handoff ガイダンス |
| `isAnalyzing`          | `boolean`                      | 分析中フラグ                |
| `isImproving`          | `boolean`                      | 改善中フラグ                |
| `skillError`           | `string \| null`               | エラーメッセージ            |

**未存在**（追加が必要）:

- `isGenerating` / `generationProgress` / `generationError` / `currentPlanId`

## ギャップ分析

### 接続が必要な箇所

| #   | 起点                                 | 終点                                       | 現状     |
| --- | ------------------------------------ | ------------------------------------------ | -------- |
| G1  | SkillLifecyclePanel.handlePrepare()  | skillCreatorApi.planSkill()                | 未接続   |
| G2  | SkillLifecyclePanel（plan 結果表示） | skillCreatorApi.executePlan()              | 未接続   |
| G3  | SkillCreateWizard（LLM 生成モード）  | skillCreatorApi.planSkill()                | 未接続   |
| G4  | AgentSlice（生成状態管理）           | isGenerating / generationProgress 等       | 未実装   |
| G5  | GenerateStep（plan 結果表示）        | RuntimeSkillCreatorPlanResponse の UI 表示 | 未実装   |
| G6  | TerminalHandoff 表示                 | plan→execute 中のプログレス UI             | 部分実装 |

## 受入基準の明文化

### 受入基準の採番方針

本タスクでは、UI→Runtime パイプライン接続に直接関わる4つの受入基準を選定した:

- AC-1: LLM 生成フロー開始（planSkill 呼び出し）
- AC-3: TerminalHandoff 時の UI 状態表示
- AC-4: execute 完了後のスキル利用可能
- AC-7: 既存 skill:create フローの非破壊（後方互換性）

AC-2（SkillCreateWizard 接続）、AC-5（リアルタイムプログレス）、AC-6（改善フロー接続）はスコープ外として未タスク化対象（R-2, R-3）とした。

### AC-1: SkillLifecyclePanel から LLM 生成フローが開始できる

- SkillLifecyclePanel の「方針を決める」ボタンクリック時に `skillCreatorApi.planSkill(description)` が呼ばれる
- planSkill のレスポンス（`RuntimeSkillCreatorPlanResponse`）が UI に表示される
- `terminal_handoff` レスポンス時は TerminalHandoff ガイダンスが表示される
- `integrated_api` レスポンス時は plan 結果（推定ステップ数等）が表示される

### AC-3: TerminalHandoff 時の UI 状態表示

- `executePlan()` 実行中は `isGenerating=true` で UI がロック状態になる
- TerminalHandoff ガイダンス（`handoffGuidance`）が表示される
- プログレステキスト（`generationProgress`）がリアルタイム更新される
- ユーザーは「キャンセル」で TerminalHandoff を中断できる

### AC-4: execute 完了後にスキルが利用可能になる

- `executePlan()` 完了後に `fetchSkills()` が呼ばれスキル一覧が更新される
- 新規作成されたスキルが `selectSkillByName()` で自動選択される
- `skillExecutionStatus` が `"idle"` または `"completed"` に遷移する

### AC-7: 既存 skill:create フローが非破壊（後方互換性）

- SkillCreateWizard の既存4段階フロー（Describe→Configure→Generate→Complete）が変更なく動作する
- SkillLifecyclePanel の「スキルを生成する」ボタンは従来通り `createSkill()` を呼び出す
- `handlePrepare()` を経由しない直接生成パスが維持される
- LLM 生成モード非選択時は従来の `skill:create` IPC が使用される

## Zustand 状態追加要件

AgentSlice に以下を追加:

| フィールド           | 型                   | 初期値  | 用途                               |
| -------------------- | -------------------- | ------- | ---------------------------------- |
| `isGenerating`       | `boolean`            | `false` | planSkill/executePlan 実行中フラグ |
| `generationProgress` | `string \| null`     | `null`  | 生成プログレスメッセージ           |
| `generationError`    | `string \| null`     | `null`  | 生成エラーメッセージ               |
| `currentPlanId`      | `string \| null`     | `null`  | 現在の plan ID                     |
| `currentPlanResult`  | `PlanResult \| null` | `null`  | plan 結果（UI 表示用）             |

個別セレクタ（P31 対策）:

- `useIsSkillGenerating()`
- `useGenerationProgress()`
- `useGenerationError()`
- `useCurrentPlanId()`
- `useCurrentPlanResult()`
- `useSetIsSkillGenerating()`
- `useClearGenerationState()`

## 参照資料

| 資料名                    | パス                                                                  | 説明                           |
| ------------------------- | --------------------------------------------------------------------- | ------------------------------ |
| SkillLifecyclePanel       | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`  | 単一ページライフサイクルUI     |
| SkillCreateWizard         | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`    | 4段階ウィザードUI              |
| SkillCreatorAPI           | `apps/desktop/src/preload/skill-creator-api.ts`                       | Preload API定義                |
| IPC チャンネル定義        | `apps/desktop/src/preload/channels.ts`                                | チャンネル定数・ホワイトリスト |
| RuntimeSkillCreatorFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 3ロール Facade                 |
| AgentSlice                | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                | Zustand 状態管理               |
| P31対策                   | `.claude/rules/06-known-pitfalls.md#P31`                              | 合成Hook無限ループ防止         |

## 実行手順

### ステップ1: 現行フロー調査

対象ファイル（SkillLifecyclePanel, SkillCreateWizard, Preload API, IPC, Main Process, RuntimeSkillCreatorFacade, AgentSlice）のソースコードを読み、各コンポーネントの責務と接続状態を記録する。

### ステップ2: ギャップ分析

UI→Runtime で接続が必要な箇所を特定し、G1-G6 として表形式で記録する。

### ステップ3: 受入基準定義

AC-1, AC-3, AC-4, AC-7 の達成条件を「〜したとき〜が〜される」形式で明文化する。

### ステップ4: Zustand 状態追加要件定義

AgentSlice に追加するフィールド・セレクタの型・初期値・用途を定義する。

## 統合テスト連携

Phase 1（要件定義）では統合テストの直接実施はないが、以下の観点を後続Phaseのテスト設計に引き継ぐ:

- ギャップ G1-G6 の各接続ポイントに対応するテストシナリオの特定
- 既存テスト（SkillLifecyclePanel.test.tsx）への影響範囲の特定
- 後方互換性（AC-7）のリグレッションテスト要件の抽出

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                                             |
| ------------------ | -------- | -------------------------------------------------------------------- |
| セキュリティ       | 該当     | IPC チャンネルのホワイトリスト登録確認、P42 3段バリデーション要件    |
| UI/UX              | 該当     | SkillLifecyclePanel の Plan 結果表示、TerminalHandoff ガイダンス表示 |
| アーキテクチャ     | 該当     | Zustand 状態設計（P31/P48 対策）、Preload→Main→Runtime の依存方向    |
| エラーハンドリング | 該当     | planSkill/executePlan 失敗時の graceful degradation 設計             |

## サブタスク管理

Phase実行開始時にTaskCreateで以下のサブタスクを作成する:

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の実施
4. 成果物の作成
5. 完了条件の検証

## 成果物

| 成果物     | パス                                                                        | 説明       |
| ---------- | --------------------------------------------------------------------------- | ---------- |
| 要件定義書 | `docs/30-workflows/w4b-2-sc-ui-runtime-connection/phase-01-requirements.md` | 本ファイル |

## 完了条件

- [x] `SkillLifecyclePanel.handleCreate()` の現行フローを確認した
- [x] `window.electronAPI.skillCreator.*` の利用可能メソッドを確認した
- [x] DescribeStep の UI 変更要件を定義した（既存テキストエリアを活用）
- [x] TerminalHandoff 表示要件を定義した
- [x] Zustand 状態追加要件を定義した（5フィールド + 11セレクタ）
- [x] AC-1, AC-3, AC-4, AC-7 の達成条件を明文化した
- [x] 既存 skill:create フローとの後方互換性要件を確認した
- [x] ギャップ分析（G1-G6）を完了した

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了した
- [x] 各タスクの成果物が生成されている
- [x] 完了条件を全て満たしている

## 次のPhase

Phase 2: 設計
