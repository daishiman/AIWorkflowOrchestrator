# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 2                                      |
| Phase名    | 設計                                   |
| 前提Phase  | Phase 1（要件定義）                    |
| 後続Phase  | Phase 3（設計レビューゲート）          |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-25                             |
| 機能名     | TASK-3-2-skillexecutor-ipc-integration |

---

## 目的

SkillExecutor IPC Handler統合のアーキテクチャ設計・詳細設計を行い、実装の指針を確立する。

## 背景

Phase 1で定義した要件に基づき、Preload API・React Hook・UIコンポーネントの設計を行う。既存のパターン（agentAPI、llmAPIなど）を参考にしながら、一貫性のある設計を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: アーキテクチャ設計

**目的**: 全体のデータフローとコンポーネント間の連携を設計する

**実行手順**:

1. データフロー図を作成する

   ```
   ┌─────────────────────────────────────────────────────────────┐
   │                     Renderer Process                         │
   │  ┌─────────────────────────────────────────────────────────┐ │
   │  │               SkillStreamDisplay.tsx                     │ │
   │  │                    ↓ props                               │ │
   │  │               useSkillExecution.ts                       │ │
   │  │                    ↓ state管理                           │ │
   │  │              skillAPI.onStream(callback)                 │ │
   │  └──────────────────────┬──────────────────────────────────┘ │
   │                          │ contextBridge                     │
   │  ┌──────────────────────┴──────────────────────────────────┐ │
   │  │               Preload Script                              │ │
   │  │           ipcRenderer.on("skill:stream")                 │ │
   │  └──────────────────────┬──────────────────────────────────┘ │
   └─────────────────────────┼───────────────────────────────────┘
                             │ IPC
   ┌─────────────────────────┼───────────────────────────────────┐
   │                   Main Process                               │
   │  ┌──────────────────────┴──────────────────────────────────┐ │
   │  │              SkillExecutor                                │ │
   │  │        webContents.send("skill:stream", message)         │ │
   │  └──────────────────────────────────────────────────────────┘ │
   └─────────────────────────────────────────────────────────────┘
   ```

2. コンポーネント責務を定義する

   | コンポーネント     | レイヤー        | 責務                     |
   | ------------------ | --------------- | ------------------------ |
   | skillAPI           | Preload         | IPC通信の抽象化          |
   | useSkillExecution  | React Hook      | 状態管理・ライフサイクル |
   | SkillStreamDisplay | React Component | UI表示                   |

**期待される成果物**:

- `outputs/phase-2/architecture-design.md`

---

### タスク2: Preload API詳細設計

**目的**: skillAPI拡張のインターフェースを詳細設計する

**実行手順**:

1. 既存パターンを確認する
   - `agentAPI.onStream`: 参考実装パターン
   - `llmAPI.onStreamChunk`: 参考実装パターン

2. skillAPI拡張インターフェースを設計する

   ```typescript
   interface SkillAPI {
     // 既存
     execute: (
       request: SkillExecutionRequest,
     ) => Promise<SkillExecutionResponse>;
     getImportedSkills: () => Promise<ImportedSkill[]>;
     getSkillById: (skillId: string) => Promise<SkillMetadata | null>;

     // 新規追加
     onStream: (callback: (message: SkillStreamMessage) => void) => () => void;
     abort: (executionId: string) => Promise<boolean>;
     getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;
   }
   ```

3. 型定義を設計する
   - `SkillStreamMessage`: ストリーミングメッセージ（既存）
   - `SkillExecutionRequest`: 実行リクエスト（既存）
   - `SkillExecutionResponse`: 実行レスポンス（既存）

**期待される成果物**:

- `outputs/phase-2/preload-api-design.md`

---

### タスク3: React Hook設計

**目的**: useSkillExecutionフックの詳細設計を行う

**実行手順**:

1. State設計

   ```typescript
   interface UseSkillExecutionState {
     messages: SkillStreamMessage[];
     status: "idle" | "running" | "completed" | "error";
     executionId: string | null;
     error: SkillExecutionError | null;
   }
   ```

2. API設計

   ```typescript
   interface UseSkillExecutionReturn {
     messages: SkillStreamMessage[];
     status: "idle" | "running" | "completed" | "error";
     error: SkillExecutionError | null;
     execute: (prompt: string) => Promise<SkillExecutionResponse>;
     abort: () => Promise<void>;
     reset: () => void;
   }
   ```

3. ライフサイクル設計
   - マウント時: onStreamリスナー登録
   - アンマウント時: リスナー解除（メモリリーク防止）
   - executionId変更時: メッセージフィルタリング更新

**期待される成果物**:

- `outputs/phase-2/react-hook-design.md`

---

### タスク4: UIコンポーネント設計

**目的**: SkillStreamDisplayコンポーネントの詳細設計を行う

**実行手順**:

1. コンポーネント構成を設計する

   ```
   SkillStreamDisplay
   ├── StreamHeader (実行状態表示)
   ├── StreamContent (メッセージ一覧)
   │   ├── TextMessage
   │   ├── ToolUseMessage
   │   └── ErrorMessage
   └── StreamActions (中断ボタンなど)
   ```

2. Props設計

   ```typescript
   interface SkillStreamDisplayProps {
     skillId: string;
     onComplete?: () => void;
     onError?: (error: SkillExecutionError) => void;
   }
   ```

3. 既存UIパターンとの整合性確認
   - AgentViewとの統合方法
   - 既存のストリーミング表示（llmAPI）との一貫性

**期待される成果物**:

- `outputs/phase-2/ui-component-design.md`

---

## 参照資料

| 参照資料             | パス                                                                        | 内容               |
| -------------------- | --------------------------------------------------------------------------- | ------------------ |
| Phase 1成果物        | `outputs/phase-1/`                                                          | 要件定義           |
| Agent SDK仕様        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | 既存パターン       |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`     | UI設計ガイドライン |
| 既存Preload API      | `apps/desktop/src/preload/index.ts`                                         | 参考実装           |

---

## 成果物

| 成果物               | パス                                     | 内容         |
| -------------------- | ---------------------------------------- | ------------ |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md` | 全体設計     |
| Preload API設計      | `outputs/phase-2/preload-api-design.md`  | API詳細設計  |
| React Hook設計       | `outputs/phase-2/react-hook-design.md`   | Hook詳細設計 |
| UIコンポーネント設計 | `outputs/phase-2/ui-component-design.md` | UI詳細設計   |

---

## 統合テスト連携

本Phaseでは統合テストの設計を行う。以下の統合テストシナリオを`outputs/phase-2/integration-test-design.md`に記載する:

| シナリオID | シナリオ         | 検証内容                        |
| ---------- | ---------------- | ------------------------------- |
| IT-001     | スキル実行〜完了 | execute→onStream受信→完了状態   |
| IT-002     | スキル実行中断   | execute→abort→中断状態          |
| IT-003     | エラー発生時     | execute→エラー受信→エラー表示   |
| IT-004     | 複数実行         | 複数executionIdのメッセージ分離 |

---

## 完了条件

- [ ] アーキテクチャ設計（データフロー図・コンポーネント責務）が完了
- [ ] Preload API拡張インターフェースが設計されている
- [ ] React Hook（useSkillExecution）のState/API/ライフサイクルが設計されている
- [ ] UIコンポーネント（SkillStreamDisplay）の構成・Propsが設計されている
- [ ] 統合テストシナリオが設計されている
- [ ] 全ての成果物が`outputs/phase-2/`に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-2-skillexecutor-ipc-integration/phase-3-design-review-gate.md`
