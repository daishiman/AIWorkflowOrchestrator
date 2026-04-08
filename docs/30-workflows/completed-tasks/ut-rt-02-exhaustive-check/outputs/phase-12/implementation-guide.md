# UT-RT-02-EXHAUSTIVE-CHECK-001 実装ガイド

## Part 1: 中学生でもわかる版 — exhaustive check とは何か

### なぜ必要か

新しい種類が追加されたときに、処理漏れをコンパイル時に見つける仕組みです。`if (success === false)` だけでは将来の case 漏れを防げないため、`switch` と `assertNever` を組み合わせます。

### 何をするか

`RuntimeSkillCreatorFacade.executeAsync()` の分岐処理を `switch` 文 + `assertNever` パターンで書き換えます。

この機能でできること: 新バリアントを union 型に追加した際、switch の case を書き忘れていると TypeScript がコンパイルエラーを出して教えてくれます。

### assertNever とは

`assertNever` は「ここには絶対来てはいけない」という印鑑のようなものです。来てしまったら「未対応のケースがあります！」とエラーを出します。

### 今回作ったもの

| 成果物                           | 内容                                                             |
| -------------------------------- | ---------------------------------------------------------------- |
| `classifyExecuteResult()` helper | mixed union を文字列 `ExecuteOutcome` に正規化する関数           |
| `assertNever()` helper           | 到達不能パスを型レベルで検証する module-local 関数               |
| `switch(outcome)` パターン       | `executeAsync()` 内のリファクタ済み分岐処理                      |
| TC-08 テスト                     | unknown variant が catch パスを経由することを確認する smoke test |

### 事実と将来例の境界

| 区分       | 内容                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| 現在の事実 | `executeAsync()` は `classifyExecuteResult()` → `switch(outcome)` → `assertNever` で動作する |
| 将来例     | union に新バリアントが追加された場合は、`classifyExecuteResult()` とテストを更新する         |
| 非対象     | `retry` のような追加バリアントは現時点では未実装                                             |

---

## Part 2: 開発者向け技術詳細

### 変更対象

**ファイル**: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

### APIシグネチャ

```typescript
// ── Module-local helpers for executeAsync() exhaustive switch (UT-RT-02) ──
type ExecuteOutcome = "success" | "error" | "terminal_handoff";

function classifyExecuteResult(result: SkillExecuteResponse): ExecuteOutcome;
function assertNever(x: never): never;
```

### 役割分担

| 要素                    | 役割                                                                 |
| ----------------------- | -------------------------------------------------------------------- |
| `classifyExecuteResult` | mixed union を `ExecuteOutcome` 文字列に変換する純粋関数             |
| `switch(outcome)`       | 正規化後の outcome ごとに処理を分岐する                              |
| `assertNever`           | `(x: never): never` で到達不能パスを型レベルとランタイムの両方で検出 |

### assertNever 関数の型定義

```typescript
function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}
```

- 引数型 `never`: TypeScript が「到達不能」と判定した値のみ受け付ける
- 戻り値型 `never`: この関数は必ず例外を投げる（正常値を返さない）
- `x` に実際の値が渡された場合 → 型推論が正しくない = 新バリアントに未対応

### classifyExecuteResult helper の型定義

```typescript
type ExecuteOutcome = "success" | "error" | "terminal_handoff";

function classifyExecuteResult(result: SkillExecuteResponse): ExecuteOutcome {
  if (typeof result === "object" && result !== null && "type" in result) {
    switch (result.type) {
      case "terminal_handoff":
        return "terminal_handoff";
      default:
        return assertNever(result.type);
    }
  }
  if ("success" in result) {
    return result.success === false ? "error" : "success";
  }
  return assertNever(result);
}
```

**設計ポイント**:

- `"type" in result` で `terminal_handoff` バリアントを分離し、`switch (result.type)` の default で exhaustive check を行う
- `success === false`（厳格等価）を使い、`success: undefined` の場合を "success" として扱う（旧コードとの振る舞い一致）
- `switch (result.type)` 側は `assertNever(result.type)`、`success` 側は `assertNever(result)` で将来の新バリアントを型レベルで検出

### Before / After コード例

**Before (isStructuredError パターン)**:

```typescript
const isStructuredError =
  typeof executeResult === "object" &&
  executeResult !== null &&
  "success" in executeResult &&
  executeResult.success === false;
const phase = isStructuredError ? "error" : "complete";
this.workflowEngine.triggerPhaseTransition(
  planId,
  phase,
  phase === "complete" ? 100 : 0,
);
if (isStructuredError) {
  // error 処理...
}
```

**After (switch + assertNever パターン)**:

```typescript
const outcome = classifyExecuteResult(executeResult);
switch (outcome) {
  case "terminal_handoff":
  case "success":
    this.workflowEngine.triggerPhaseTransition(planId, "complete", 100);
    break;
  case "error": {
    this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
    // error 処理...
    break;
  }
  default:
    assertNever(outcome);
}
```

### 将来例（未実装バリアントが追加された場合）

以下は `retry` バリアントが追加されたときの例であり、現時点の実装ではない。

```typescript
// 新バリアント追加時の手順
// 1. skillCreator.ts に新バリアントを追加
type RuntimeSkillCreatorExecuteResponse =
  | RuntimeSkillCreatorExecuteResult
  | { type: "terminal_handoff"; bundle: TerminalHandoffBundle }
  | RuntimeSkillCreatorExecuteErrorResponse
  | { type: "retry"; reason: string }; // ← 新バリアント追加

// 2. pnpm typecheck を実行 → classifyExecuteResult() で assertNever がコンパイルエラーを報告
// 3. classifyExecuteResult() に case を追加
function classifyExecuteResult(result: SkillExecuteResponse): ExecuteOutcome {
  if ("type" in result) {
    switch (result.type) {
      case "terminal_handoff":
        return "terminal_handoff";
      case "retry":
        return "success"; // ← case 追加
      default:
        return assertNever(result.type);
    }
  }
  // ...
}
```

### discriminated union の判別子設計

| バリアント                                | 判別子                     | 型              | 注意点                                                      |
| ----------------------------------------- | -------------------------- | --------------- | ----------------------------------------------------------- |
| `RuntimeSkillCreatorExecuteResult`        | `success: boolean`         | `boolean`       | literal 型でないため classifyExecuteResult() で正規化が必要 |
| `{ type: "terminal_handoff" }`            | `type: "terminal_handoff"` | literal         | 直接 switch で検出可能                                      |
| `RuntimeSkillCreatorExecuteErrorResponse` | `success: false`           | `false` literal | `=== false` で検出                                          |

### エラーハンドリング

| ケース                         | 挙動                                                             |
| ------------------------------ | ---------------------------------------------------------------- |
| outcome = "error"              | `triggerPhaseTransition(planId, "error", 0)` + snapshot callback |
| `classifyExecuteResult` catch  | `assertNever` が `Error("Unhandled case: ...")` をスロー         |
| `executeAsync` outer try/catch | スローされた Error を catch → `onWorkflowStateSnapshot` に伝達   |
| 新バリアント未対応             | コンパイルエラー（ランタイムではなく型検査時に検出）             |

**エラーメッセージフォーマット**:

```typescript
// assertNever がスローするエラーメッセージ
`Unhandled case: ${JSON.stringify(x)}`;
// 例: "Unhandled case: \"unknown_variant\""
```

### エッジケース

| ケース                          | 期待動作                                                             |
| ------------------------------- | -------------------------------------------------------------------- |
| `success: undefined`            | `undefined === false` → false → "success" として処理（旧コード互換） |
| `success: null`                 | `null === false` → false → "success" として処理                      |
| `success: true`                 | "success" として処理                                                 |
| `type: "terminal_handoff"` のみ | "terminal_handoff" → "complete" として処理                           |
| 未知の `type` 値                | `assertNever` → `executeAsync` の catch パスで処理                   |

### 設定項目と定数一覧

| 定数 / 型               | 値 / 型定義                                  | 用途                                      |
| ----------------------- | -------------------------------------------- | ----------------------------------------- |
| `ExecuteOutcome`        | `"success" \| "error" \| "terminal_handoff"` | switch 文の分岐キーとなる正規化済み文字列 |
| `classifyExecuteResult` | module-local 関数                            | mixed union → ExecuteOutcome への変換     |
| `assertNever`           | module-local 関数                            | 到達不能パスの型検証・ランタイムガード    |

本実装は設定ファイルや環境変数を持たない。`ExecuteOutcome` リテラル型が唯一の拡張ポイントで、新バリアント追加時はここに文字列を追加する。

### テスト構成

| テスト ID | 内容                                         | 種別    | 目的                                 |
| --------- | -------------------------------------------- | ------- | ------------------------------------ |
| T-01      | ErrorResponse を返す場合のエラーハンドリング | 既存    | 回帰確認                             |
| T-02      | catch パス（例外スロー）                     | 既存    | 回帰確認                             |
| T-03      | terminal_handoff を返す場合の完了処理        | 既存    | 回帰確認                             |
| T-04      | success を返す場合の完了処理                 | 既存    | 回帰確認                             |
| T-05      | ErrorResponse（追加ケース）                  | 既存    | 回帰確認                             |
| T-06      | catch パス（追加ケース）                     | 既存    | 回帰確認                             |
| TC-T4-01  | success variant の正常系                     | 新規    | classifyExecuteResult の正常系       |
| TC-T4-02  | success variant の追加確認                   | 新規    | success === undefined エッジケース   |
| TC-T4-03  | error (ErrorResponse) の確認                 | 新規    | error パスの型ガード確認             |
| TC-T4-04  | error (SkillExecuteResult success=false)     | 新規    | strict equality エッジケース         |
| TC-08     | unknown variant smoke test                   | 新規    | assertNever のランタイム動作確認     |
| TC-09     | 新バリアント追加時のコンパイルエラー確認     | it.todo | 型レベル exhaustive check の手動確認 |

**テストファイル**: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts`

### 新バリアント追加時の手順

1. `packages/shared/src/types/skillCreator.ts` の `RuntimeSkillCreatorExecuteResponse` に新バリアントを追加
2. `pnpm --filter @repo/desktop typecheck` を実行 → `assertNever` 行でコンパイルエラーが発生することを確認
3. `classifyExecuteResult()` または outer switch に case を追加してエラーを解消
4. テストを追加・実行して PASS することを確認

### assertNever 配置の考え方

本タスクでは assertNever を module-local helper として `RuntimeSkillCreatorFacade.ts` 内に配置した。

理由:

- 外部依存なしでモジュールが完結する
- mixed union の正規化ロジックはこのファイル固有の知識
- 将来的に shared utility 化する場合は UT-RT-02-TYPE-EXPANSION-TEST-001 タスクで対応
