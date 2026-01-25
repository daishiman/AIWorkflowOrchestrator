# Phase 5: 実装（TDD: Green） - TASK-3-1-A SDK query() 基本実装

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 5                    |
| Phase名    | 実装（TDD: Green）   |
| 前提Phase  | Phase 4 (テスト作成) |
| 後続Phase  | Phase 6 (テスト拡充) |
| ステータス | 未実施               |
| 作成日     | 2026-01-24           |
| 機能名     | TASK-3-1-A-sdk-query |

---

## 目的

Phase 4 で作成したテストを通すための最小限の実装を行う。
TDD の Green フェーズとして、テストを通すことに集中する。

## 背景

SkillExecutor クラスの実装により、スキル実行機能の基盤を構築する。
Claude Agent SDK の query() API を使用し、ストリーミングレスポンスを処理する。

---

## 実行タスク

### タスク1: SkillExecutor クラス実装

**目的**: 基本クラス構造を実装する

**実行手順**:

1. クラスの基本構造を作成
2. コンストラクタを実装
3. パブリックメソッド（execute, abort）を実装
4. テストが通ることを確認

**実装ファイル**:

- `apps/desktop/src/main/services/skill/SkillExecutor.ts`

**実装コード（参考）**:

```typescript
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

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  async execute(
    request: SkillExecutionRequest,
    skill: SkillMetadata,
  ): Promise<SkillExecutionResponse> {
    const executionId = uuidv4();
    const abortController = new AbortController();

    this.activeExecutions.set(executionId, abortController);

    try {
      const prompt = await this.buildPrompt(request.prompt, skill);

      const conversation = query({
        prompt,
        options: {
          tools: skill.allowedTools || ["Read", "Edit", "Bash", "Glob", "Grep"],
          permissionMode: "default",
          signal: abortController.signal,
        },
      });

      for await (const message of conversation.stream()) {
        if (abortController.signal.aborted) break;
        await this.handleStreamMessage(executionId, message);
      }

      return { executionId, success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return { executionId, success: false, error: errorMessage };
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  abort(executionId: string): boolean {
    const controller = this.activeExecutions.get(executionId);
    if (controller) {
      controller.abort();
      this.activeExecutions.delete(executionId);
      return true;
    }
    return false;
  }

  // ... プライベートメソッド
}
```

### タスク2: ストリーミング処理実装

**目的**: SDK からのストリーミングメッセージを処理・配信

**実行手順**:

1. handleStreamMessage を実装
2. convertToStreamMessage を実装
3. sendStream を実装
4. 各メッセージタイプの変換ロジックを実装

### タスク3: プロンプト構築実装

**目的**: スキル実行用のプロンプトを構築

**実行手順**:

1. buildPrompt を実装
2. buildContextInfo を実装
3. スキルメタデータの情報を適切に含める

### タスク4: テスト通過確認

**目的**: 全テストが Green になることを確認

**実行手順**:

1. ユニットテストを実行
2. 失敗しているテストがあれば修正
3. 全テストが通過することを確認

---

## 参照資料

| 参照資料           | パス                                                                        | 内容          |
| ------------------ | --------------------------------------------------------------------------- | ------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                                     | Phase 4成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`                                    | Phase 2成果物 |
| Agent SDK仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | SDK API仕様   |
| 元タスク定義       | `docs/30-workflows/skill-import-agent-system/tasks/task-3-1-a-sdk-query.md` | 実装詳細      |

---

## 統合テスト連携【必須】

Main→Renderer ストリーミング配信の実装:

| 実装項目       | 内容                                          |
| -------------- | --------------------------------------------- |
| SDK連携        | query() API 呼び出し、stream() イテレーション |
| メッセージ変換 | SDK メッセージ → SkillStreamMessage への変換  |
| IPC配信        | webContents.send("skill:stream", message)     |
| 中断処理       | AbortController.abort() → stream ループ終了   |

---

## 依存パッケージ

```bash
# SDK と UUID を追加
pnpm --filter @repo/desktop add @anthropic-ai/claude-agent-sdk uuid
pnpm --filter @repo/desktop add -D @types/uuid
```

---

## 成果物

| 成果物           | パス                                                    | 内容         |
| ---------------- | ------------------------------------------------------- | ------------ |
| SkillExecutor    | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | 実装コード   |
| インデックス更新 | `apps/desktop/src/main/services/skill/index.ts`         | エクスポート |

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

---

## 完了条件

- [ ] SkillExecutor クラスが実装されている
- [ ] execute() メソッドがスキルを実行できる
- [ ] abort() メソッドが実行を中止できる
- [ ] ストリーミング処理が実装されている
- [ ] すべてのテストが成功状態（Green）
- [ ] IPC 配信が実装されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-3-1-A-sdk-query/phase-6-test-expansion.md`
