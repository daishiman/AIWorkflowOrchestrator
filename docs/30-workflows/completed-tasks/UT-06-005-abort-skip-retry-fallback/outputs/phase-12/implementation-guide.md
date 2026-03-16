# 実装ガイド: Permission 拒否時フォールバック（abort/skip/retry/timeout）

**タスク ID**: UT-06-005-abort-skip-retry-fallback
**対象コンポーネント**: SkillExecutor / PermissionStore / PermissionFlowContext
**作成日**: 2026-03-16

---

## Part 1: 中学生レベル概念説明

### このタスクで何を作ったか？

Claude Code（AIアシスタント）がファイルを読んだり書いたり、コマンドを実行しようとするとき、先に「やっていいですか？」と確認することがあります。この「許可確認ダイアログ」に対して、ユーザーが「ダメ」と答えたり、長い間返事をしなかったりしたとき、AIがどうすればよいかを決める仕組みを作りました。

### お店のガードマンの例え

AIが色々な「ツール」を使って仕事をする様子を、お店（コンビニ）に買い物に来たお客さんで考えてみましょう。

**お店のルール**: 特別な商品（ファイルの書き込みや危険なコマンドの実行）を買う前に、店員さんに許可証を見せないといけません。

---

#### abort（アボート）: 入店をお断りして帰っていただく

```
お客さん「この商品をください」
店員さん「許可証を見せてください」
お客さん「見せません」

↓ abort 4ステップ

① 他の店員が同じお客さんを案内するのをやめる（cancelAll）
② 今日の入店ログを消す（revokeSessionEntries）
③ 記録帳に「今日このお客さんはお断りした」と書く（ログ）
④ お客さんのスマホに「本日はご利用できません」とメッセージを送る（IPC通知）
```

abort は「この買い物セッション全体を終了させる」最も強い手段です。一度 abort すると、同じ実行IDで再び abort しても何も起こりません（二度アナウンスしない）。

---

#### skip（スキップ）: その商品だけ買えないが他の商品は買える

```
お客さん「この特別な商品をください」
店員さん「許可証を見せてください」
お客さん「この商品はいいです（スキップ）、他のものだけ買います」

↓ skip フロー

① 「この商品はスキップしました」とメモする（ログ）
② お客さんのスマホに「この商品はスキップしました」と送る（IPC通知）
③ お客さんは引き続き他の商品を買い続けられる（実行継続）
```

skip は「今回だけこのツールを使わない」という穏やかな選択肢です。AIはそのまま他の作業を続けます。

---

#### retry（リトライ）: 許可証をもう一度見せてもらう（最大3回）

```
お客さん「この商品をください」
店員さん「許可証を見せてください」
お客さん「（何も言わず）」

↓ retry フロー（最大3回まで）

1回目失敗 → 「もう一度見せていただけますか？」
2回目失敗 → 「最後にもう一度確認させてください」
3回目失敗 → 「3回確認できませんでした。本日はご利用をお断りします」
           → abort（max_retries）へ
```

カウンターは `Map<requestId, retryCount>` で管理されています。3回で打ち切り、その後は abort に自動移行します。

---

#### timeout（タイムアウト）: 5分待っても返事が来なければお帰りいただく

```
お客さん「この商品をください」
店員さん「許可証を見せてください」

（5分間、返事なし）

店員さん「5分お待ちしましたが返事がありませんでした。
         本日はご利用をお断りします」→ abort（timeout）へ
```

PermissionResolver の `waitForResponse()` が 300,000ms（5分）以内に応答しなければ、タイムアウトエラーを投げて abort フローに移ります。5分という設定は「ユーザーがその場を離れた」と判断できる最短時間として設計されています。

---

#### fail-closed（フェイルクローズド）: 何かおかしいときは必ずお断り

```
予期しないエラーが発生

→ 「安全のため、ご利用をお断りします」（abort）
   ※ 許可してしまうよりも、断る方が安全
```

「おかしなことが起きたときは許可する」のではなく「断る」側に倒す設計です。セキュリティの鉄則です。

---

### なぜこの仕組みが必要なのか？

Permission（許可確認）を放置すると…

- ユーザーが返事をしなければ AI がずっと待ち続ける（UIが固まる）
- 拒否されたのに AI が他の方法で同じことをしようとする（セキュリティリスク）
- エラーが起きても AI が勝手に進み続ける（予測不能な動作）

この仕組みにより、AI の動作が**予測可能・安全・確定的**になります。

---

## Part 2: 開発者向け実装詳細

### 変更ファイル一覧

| ファイル                                                                        | 変更種別 | 変更概要                                                    |
| ------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`                         | 追記     | 型定義3種 + メソッド3つ追加（+187行）                       |
| `apps/desktop/src/main/services/skill/PermissionStore.ts`                       | 追記     | `revokeSessionEntries` メソッド追加（+20行）                |
| `packages/shared/src/types/permission-store.ts`                                 | 追記     | `IPermissionStore` に `revokeSessionEntries?` 追加（+10行） |
| `packages/shared/src/types/skill.ts`                                            | 追記     | `SkillPermissionResponse` に `skip?: boolean` 追加（+3行）  |
| `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts` | 新規     | フォールバックフロー全体のユニットテスト（23ケース）        |

---

### 型定義

#### AbortReason

```typescript
// SkillExecutor.ts L232
export type AbortReason = "denied" | "timeout" | "max_retries" | "unknown";
```

abort が発生した理由を4種類に分類します。IPC 通知のメッセージ本文にそのまま含まれます。

#### PermissionFlowContext

```typescript
// SkillExecutor.ts L235-241
export interface PermissionFlowContext {
  executionId: string; // どの実行か
  requestId: string; // どのリクエストか（retryCounter の Key）
  toolName: string; // どのツールへのリクエストか（ログ用）
  retryCount: number; // 現在のリトライ回数（0始まり）
  maxRetries: number; // 最大リトライ回数（定数: 3）
}
```

`processPermissionFallback()` に渡すコンテキスト情報です。retryCount と maxRetries を比較してフロー分岐を決定します。

#### PermissionFlowResult

```typescript
// SkillExecutor.ts L244-248
export interface PermissionFlowResult {
  action: "approved" | "skip" | "retry" | "abort";
  reason?: AbortReason; // abort 時のみ
  retryCount?: number; // retry 時のインクリメント後の値
}
```

呼び出し元（将来の Hook 統合）が受け取る判定結果です。`action` で次の処理を分岐します。

#### SkillPermissionResponse（shared 追加）

```typescript
// packages/shared/src/types/skill.ts L531
export interface SkillPermissionResponse {
  requestId: string;
  approved: boolean;
  rememberChoice?: boolean;
  rejectReason?: string;
  skip?: boolean; // UT-06-005 追加: true の場合は skip フロー
}
```

Renderer 側が `skip: true` を返すことで skip フローを起動します。

---

### メソッド実装詳細

#### processPermissionFallback（フロー判定）

```
PermissionResponse 受信
       │
       ├─ approved === true → { action: "approved" }
       │
       ├─ skip === true ────→ log → { action: "skip" }
       │
       └─ approved === false（拒否）
              │
              ├─ retryCount + 1 >= maxRetries
              │    → executeAbortFlow("max_retries")
              │    → { action: "abort", reason: "max_retries" }
              │
              ├─ retryCount + 1 < maxRetries
              │    → retryCounters.set(requestId, nextRetryCount)
              │    → { action: "retry", retryCount: nextRetryCount }
              │
              └─ 例外発生（catch）
                   → executeAbortFlow("unknown")  ← fail-closed (NFR-1)
                   → { action: "abort", reason: "unknown" }
```

**実装ファイル**: `SkillExecutor.ts` L1534-1585

---

#### executeAbortFlow（abort 4ステップ）

```typescript
async executeAbortFlow(reason: AbortReason, executionId: string): Promise<void>
```

**冪等性制御**:

```typescript
// L1602-1605
if (this.abortedExecutions.has(executionId)) {
  return; // 既に abort 済みなら早期リターン
}
this.abortedExecutions.add(executionId);
```

`Set<string>` で abort 済みの executionId を管理します。同じ executionId で2回呼ばれても副作用が発生しません（NFR-3）。

**4ステップの実装**:

```
Step 1: permissionResolver.cancelAll()
        │ 全 pending 状態の Permission リクエストをキャンセル
        │ try-catch で保護（失敗しても後続ステップを実行）

Step 2: permissionStore.revokeSessionEntries?.(executionId)
        │ セッション内で許可されたツールを全取り消し
        │ Optional Chaining（?）で IPermissionStore がオプショナルに対応
        │ try-catch で保護

Step 3: console.warn("[SkillExecutor] abort: reason=..., executionId=...")
        │ 監視・デバッグ用のログ記録

Step 4: mainWindow.webContents.send(SKILL_CHANNELS.SKILL_STREAM, message)
        │ Renderer にエラーメッセージを送信
        │ { type: "error", content: "Execution aborted: {reason}", isComplete: true }
        │ isDestroyed() チェック後に送信

（後処理）
        updateExecutionState(executionId, "aborted")
        retryCounters.clear()
```

各ステップを独立した try-catch で保護しているため、Step 1 が失敗しても Step 2〜4 は実行されます（NFR-1: fail-closed）。

---

#### executeSkipFlow（skip 通知）

```typescript
executeSkipFlow(executionId: string, toolName: string): void
```

同期メソッドです。ExecutionState は変更せず「running」のまま維持します。

**処理内容**:

1. `console.info("[SkillExecutor] skip: toolName=..., executionId=...")`
2. `sendStream({ type: "tool_use", content: "Tool skipped: {toolName}", isComplete: false })`

`isComplete: false` であることが重要です。skip はセッション終了ではなく「このツールだけスキップ」だからです。

---

#### revokeSessionEntries（PermissionStore 追加）

```typescript
// PermissionStore.ts L157-166
revokeSessionEntries(_sessionId: string): number {
  const count = this.toolCache.size;
  if (count > 0) {
    this.toolCache.clear();
    this.updateStore();
    log.info(`[PermissionStore] Session entries revoked: ${count} tools`);
  }
  return count;
}
```

引数 `_sessionId` はアンダースコアプレフィックスが示す通り現在は未使用です。将来のセッション別管理（複数同時実行時の許可分離）に向けた拡張ポイントとして残しています。現在の実装では全エントリを一括取り消しします。

**IPermissionStore への追加（オプショナル）**:

```typescript
// packages/shared/src/types/permission-store.ts L128
revokeSessionEntries?(sessionId: string): number;
```

`?` でオプショナルにしているのは、既存の IPermissionStore 実装（テストモック等）を壊さないための後方互換性設計です。呼び出し側では `?.()` で安全に呼び出します。

---

### PermissionResolver と SkillExecutor の連携フロー

```
Renderer（UI）
    │
    │ IPC: skill:permission-response
    ↓
SkillExecutor.handlePermissionResponse()
    │
    │ resolveRequest({ requestId, approved, ... })
    ↓
PermissionResolver（内部 Promise 解決）
    │
    │ waitForResponse() が resolve/reject
    ↓
sendPermissionRequest() の呼び出し元（将来の Hook）
    │
    │ PermissionFlowContext を構築
    ↓
processPermissionFallback(response, context)
    │
    ├─ "approved" → 処理継続
    ├─ "skip" → executeSkipFlow()
    ├─ "retry" → 再度 sendPermissionRequest()
    └─ "abort" → executeAbortFlow()
        │
        ↓
    updateExecutionState("aborted")
    sendStream({ type: "error", isComplete: true })
        │
        ↓
    Renderer が UI を中断完了状態に更新
```

---

### timeout 値（300,000ms = 5分）の設計根拠

| 候補                 | 理由                                                 |
| -------------------- | ---------------------------------------------------- |
| 30秒                 | ユーザーが考えている途中でタイムアウトする恐れがある |
| 1分                  | 席を外した場合にカバーできない                       |
| **5分（300,000ms）** | **ユーザーが席を外したと合理的に判断できる最短時間** |
| 10分                 | UI が長時間 permission_pending 状態になりすぎる      |

長時間のスキル実行（コード解析、大量ファイル処理）においても、ユーザーが5分以内に戻ることを期待する設計です。タイムアウトは `PermissionResolver.waitForResponse()` 内で Promise.race により実装されることを想定しています。

---

### IPC 通知の仕組み

#### abort 時

```typescript
// sendStream() 呼び出し（SkillExecutor.ts L1639-1647）
this.sendStream({
  executionId,
  id: uuidv4(),
  type: "error",
  content: `Execution aborted: ${reason}`, // "denied" | "timeout" | etc.
  timestamp: Date.now(),
  isComplete: true, // セッション終了を示す
});
```

`SKILL_CHANNELS.SKILL_STREAM`（チャンネル: `"skill:stream"`）を使用します。

**なぜ `SKILL_ABORT` チャンネルを使わないのか？**

`SKILL_ABORT` は Renderer → Main の方向（ユーザーが abort ボタンを押す）に使うチャンネルです。Main → Renderer の通知には `SKILL_STREAM` を使う設計です。チャンネルの方向を混同しないことが IPC 設計の原則です。

#### skip 時

```typescript
this.sendStream({
  executionId,
  id: uuidv4(),
  type: "tool_use",
  content: `Tool skipped: ${toolName}`,
  timestamp: Date.now(),
  isComplete: false, // セッションは継続
});
```

---

### 定数まとめ

| 定数名                   | 値          | 定義場所                     | 用途               |
| ------------------------ | ----------- | ---------------------------- | ------------------ |
| `PERMISSION_MAX_RETRIES` | `3`         | SkillExecutor.ts L251        | retry の最大回数   |
| タイムアウト             | `300,000ms` | PermissionResolver（設計値） | 無応答打ち切り時間 |

---

### NFR（非機能要件）の実装方法

#### NFR-1: fail-closed（障害時は安全側に倒す）

`processPermissionFallback` の catch ブロック:

```typescript
} catch (error: unknown) {
  console.error("[SkillExecutor] unknown error in permission fallback", error);
  await this.executeAbortFlow("unknown", context.executionId);
  return { action: "abort", reason: "unknown" };
}
```

`executeAbortFlow` の各ステップを独立した try-catch で保護:

```typescript
// Step 1 失敗でも Step 2〜4 が実行される
try { this.permissionResolver.cancelAll(); }
catch (error) { console.error(...); }

try { this.permissionStore.revokeSessionEntries?.(executionId); }
catch (error) { console.error(...); }

// Step 3, 4 は try-catch なし（console.warn と sendStream は安全）
```

#### NFR-3: 冪等性（二重 abort 防止）

```typescript
private abortedExecutions: Set<string> = new Set();

// executeAbortFlow の先頭
if (this.abortedExecutions.has(executionId)) {
  return;  // 早期リターン（副作用なし）
}
this.abortedExecutions.add(executionId);
```

`Set<string>` はメモリ上に保持されます。プロセス再起動でクリアされますが、実行IDは UUID のため衝突しません。

---

### テストカバレッジ（23ケース）

| テストグループ       | ケース数 | 対応する受入条件           |
| -------------------- | -------- | -------------------------- |
| abort フロー         | 7        | AC-01, AC-02, AC-03, AC-11 |
| skip フロー          | 4        | AC-04, AC-05, AC-11        |
| retry フロー         | 5        | AC-06, AC-07, AC-08, AC-11 |
| timeout フロー       | 4        | AC-09, AC-10, AC-11        |
| fail-closed（NFR-1） | 2        | NFR-1                      |
| **合計**             | **23**   |                            |

テストファイル: `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.fallback.test.ts`

---

### 今後の拡張ポイント

1. **セッション別許可管理**: `revokeSessionEntries(_sessionId)` の `_sessionId` を活用し、複数同時実行時にセッション毎の許可を独立管理する
2. **timeout 値の設定可能化**: `SkillExecutionRequest` に `permissionTimeoutMs` を追加し、スキル毎に調整可能にする
3. **retry 間隔の調整**: 現在は即時 retry だが、Exponential Backoff 付きの `sleep()` を挟むことでユーザーに考える時間を与える設計も検討可能
