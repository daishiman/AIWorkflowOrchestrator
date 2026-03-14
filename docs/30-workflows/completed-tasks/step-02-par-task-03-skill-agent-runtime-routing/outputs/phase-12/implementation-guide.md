# 実装ガイド: Skill / Agent / Skill Creator runtime ルーティング統一

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 |
| Phase      | 12                                       |
| 作成日     | 2026-03-14                               |
| ステータス | completed                                |

## Part 1: 中学生向け概念説明

### なぜこの仕組みが必要か

同じ「AI実行」でも、設定によって動かし方が違うためです。
`api-key` モードではアプリ内で直接実行し、`subscription` モードでは terminal へ引き渡す必要があります。
この分岐を毎画面でバラバラに実装すると、表示と実行が食い違って事故が起きます。

### 何が変わるか

- 実行前に `RuntimePolicyResolver` が実行経路を決める
- 直接実行できないときは `terminal_handoff` を返す
- Skill / Agent / Creator で同じ判断型を使う

### 日常の例え

たとえば学校の職員室で、提出物を「先生に直接渡す」か「受付ボックスに入れる」かを先に振り分けるイメージです。
振り分けルールが1つなら、教室ごとに別ルールを覚える必要がありません。

## Part 2: 技術者向け詳細

### 1. 現在の実装スコープ

- 実装済み
  - `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`
  - `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`
  - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
  - `SkillExecutor` / `AgentExecutor` の `RuntimeDecision` 受け取り拡張
- 未配線
  - `registerSkillHandlers` / `registerAgentExecutionHandlers` で resolver を起動していない
  - `creatorHandlers.ts` の新規チャンネルが preload/public API まで接続されていない
  - `TerminalHandoffCard` は単体実装のみで画面導線未接続

### 2. TypeScript 型定義

```ts
export type AuthMode = "subscription" | "api-key";

export interface TerminalHandoffBundle {
  launcher: string;
  promptBundle: string;
  cwd: string;
  suggestedCommand: string;
  manualRetryRule: string;
  runbook?: string;
}

export type RuntimeDecision =
  | {
      type: "integrated_api";
      apiKey: string;
      permissionMode?: "default" | "acceptEdits" | "bypassPermissions";
    }
  | {
      type: "terminal_handoff";
      bundle: TerminalHandoffBundle;
    };
```

### 3. APIシグネチャ

```ts
// Runtime policy
resolve(authMode: AuthMode, apiKey: string | null): Promise<RuntimeDecision>

// Skill execution
execute(
  request: SkillExecutionRequest,
  skill: SkillMetadata,
  decision?: RuntimeDecision,
): Promise<SkillExecutionResponse>

// Agent execution
start(decision?: RuntimeDecision): Promise<void>
```

### 4. 使用例

#### 使用例1: 直接実行

```ts
const decision = await resolver.resolve("api-key", apiKey);
await skillExecutor.execute(request, skill, decision);
```

#### 使用例2: terminal handoff（CLI案内）

```bash
claude -p "（スキルのプロンプトを入力してください）"
```

### 5. エラーハンドリング

- `SkillExecutor` は `AUTHENTICATION_ERROR` / `SDK_ERROR` などのエラーコードを返す
- `AgentExecutor` は stream/status チャネルへエラー通知を送る
- `creatorHandlers.ts` は `VALIDATION_ERROR` / `EXECUTION_FAILED` を返す
- 失敗時も `sanitizeErrorMessage` 方針に合わせ、内部情報をUIへ漏らさない

### 6. エッジケース

- `authMode = "api-key"` かつ API key 空文字: `terminal_handoff` へフォールバック
- `authMode = "subscription"` かつ API key あり: `terminal_handoff` を優先
- `Skill API not available` や未認証画面では Phase 11 の runtime表示検証がブロックされる
- `creatorHandlers.ts` を登録しないまま channel を呼ぶと IPC not found になる

### 7. 設定と定数一覧

| 設定項目           | 現在値 / 型                                 | 用途                         |
| ------------------ | ------------------------------------------- | ---------------------------- |
| `AuthMode`         | `"subscription" \| "api-key"`               | runtime 分岐の入力           |
| `permissionMode`   | `default / acceptEdits / bypassPermissions` | integrated 実行時の権限制御  |
| `launcher`         | `"claude"`                                  | handoff 実行コマンドの先頭   |
| `suggestedCommand` | `claude -p "..."`                           | ユーザー向けコピー用コマンド |
| `manualRetryRule`  | 文字列メッセージ                            | handoff 時の説明文           |

### 8. 実装完了に向けた最短手順

1. `registerSkillHandlers` と `registerAgentExecutionHandlers` に resolver 呼び出しを追加する
2. `creatorHandlers.ts` を composition root と preload API に接続する
3. `TerminalHandoffCard` を Skill/Agent/Creator の実行結果表示に組み込む
4. Phase 11 を再実施し、`BLOCKED` の3ケースを解消する
