# Phase 2: 設計 - TASK-3-1-A SDK query() 基本実装

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 2                      |
| Phase名    | 設計                   |
| 前提Phase  | Phase 1 (要件定義)     |
| 後続Phase  | Phase 3 (設計レビュー) |
| ステータス | 未実施                 |
| 作成日     | 2026-01-24             |
| 機能名     | TASK-3-1-A-sdk-query   |

---

## 目的

Phase 1 で定義した要件を実現可能な設計に落とし込む。
SkillExecutor クラスのアーキテクチャ、API設計、ストリーミング設計を行う。

## 背景

Claude Agent SDK の `query()` API を使用した SkillExecutor クラスの実装において、
適切なクラス設計、エラーハンドリング、ストリーミング処理の設計が必要。

---

## 実行タスク

### タスク1: クラス設計

**目的**: SkillExecutor クラスの構造を設計する

**実行手順**:

1. クラスのパブリック API を設計
2. プライベートメソッドの責務を定義
3. 依存関係を特定（BrowserWindow, SkillScanner等）
4. クラス図を作成

**期待される成果物**:

- クラス設計書
- クラス図

### タスク2: ストリーミング設計

**目的**: SDK からのストリーミングメッセージを処理する設計

**実行手順**:

1. SDK の stream() メソッドの仕様を確認
2. メッセージ変換ロジックを設計
3. IPC 配信メカニズムを設計
4. シーケンス図を作成

**期待される成果物**:

- ストリーミング設計書
- シーケンス図

### タスク3: エラーハンドリング設計

**目的**: エラー処理の設計

**実行手順**:

1. 想定されるエラーパターンを洗い出す
2. エラー種別ごとの処理方針を定義
3. リトライ戦略を設計

**期待される成果物**:

- エラーハンドリング設計書

---

## 参照資料

| 参照資料      | パス                                                                        | 内容          |
| ------------- | --------------------------------------------------------------------------- | ------------- |
| 要件定義書    | `outputs/phase-1/requirements-definition.md`                                | Phase 1成果物 |
| 受け入れ基準  | `outputs/phase-1/acceptance-criteria.md`                                    | Phase 1成果物 |
| Agent SDK仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | SDK API仕様   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                         | 内容                            |
| ------------------------- | ---------------------------------------------------------------------------- | ------------------------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | query() API、ストリーミング仕様 |
| アーキテクチャパターン    | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Main/Renderer分離パターン       |

---

## 設計ガイダンス

### SkillExecutor クラス構造

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts

import { query } from "@anthropic-ai/claude-agent-sdk";
import { v4 as uuidv4 } from "uuid";
import type { BrowserWindow } from "electron";
import type {
  SkillMetadata,
  SkillExecutionRequest,
  SkillExecutionResponse,
  SkillStreamMessage,
} from "@repo/shared";

export class SkillExecutor {
  private mainWindow: BrowserWindow;
  private activeExecutions: Map<string, AbortController> = new Map();

  constructor(mainWindow: BrowserWindow);

  // パブリック API
  async execute(
    request: SkillExecutionRequest,
    skill: SkillMetadata,
  ): Promise<SkillExecutionResponse>;
  abort(executionId: string): boolean;

  // プライベートメソッド
  private async buildPrompt(
    userPrompt: string,
    skill: SkillMetadata,
  ): Promise<string>;
  private buildContextInfo(skill: SkillMetadata): string;
  private async handleStreamMessage(
    executionId: string,
    message: unknown,
  ): Promise<void>;
  private convertToStreamMessage(
    executionId: string,
    message: unknown,
  ): SkillStreamMessage | null;
  private sendStream(message: SkillStreamMessage): void;
}
```

### ストリーミングフロー

```
1. execute() 呼び出し
   ↓
2. executionId 生成 & AbortController 作成
   ↓
3. buildPrompt() でプロンプト構築
   ↓
4. query() API 呼び出し
   ↓
5. for await (message of stream()) ループ
   ↓
6. handleStreamMessage() でメッセージ処理
   ↓
7. convertToStreamMessage() で型変換
   ↓
8. sendStream() で IPC 配信
   ↓
9. 完了時に activeExecutions から削除
```

---

## 成果物

| 成果物             | パス                                       | 内容           |
| ------------------ | ------------------------------------------ | -------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`   | クラス設計     |
| ストリーミング設計 | `outputs/phase-2/streaming-design.md`      | ストリーム処理 |
| エラー設計         | `outputs/phase-2/error-handling-design.md` | エラー処理     |

---

## 統合テスト連携【必須】

IPC連携ポイント・メッセージ契約を設計に反映:

| 統合ポイント        | 契約定義                                     |
| ------------------- | -------------------------------------------- |
| SDK → SkillExecutor | query() API呼び出し、stream() イテレーション |
| SkillExecutor → IPC | webContents.send("skill:stream", message)    |
| IPC → Renderer      | ipcRenderer.on("skill:stream", callback)     |

---

## 完了条件

- [ ] SkillExecutor クラスの設計が完了している
- [ ] パブリック API（execute, abort）が定義されている
- [ ] ストリーミング処理フローが設計されている
- [ ] エラーハンドリング方針が定義されている
- [ ] IPC連携ポイント・メッセージ契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-3-1-A-sdk-query/phase-3-design-review.md`
