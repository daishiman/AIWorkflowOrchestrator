# TASK-UT-RT-01-EXHAUSTIVE-CHECK-EXECUTE-RESPONSE-001 - タスク指示書

## メタ情報

```yaml
issue_number: 2006
```

## メタ情報

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| タスクID     | TASK-UT-RT-01-EXHAUSTIVE-CHECK-EXECUTE-RESPONSE-001                         |
| タスク名     | executeAsync() レスポンス exhaustive check 導入                             |
| 分類         | リファクタリング / 品質改善（follow-up）                                    |
| 対象機能     | RuntimeSkillCreatorFacade.executeAsync() のエラー判定ロジック               |
| 優先度       | 中                                                                          |
| 見積もり規模 | 小規模                                                                      |
| ステータス   | 未実施                                                                      |
| 発見元       | TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 Phase 3 設計レビュー |
| 発見日       | 2026-04-06                                                                  |
| issue番号    | 1993                                                                        |
| 親タスク     | TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`RuntimeSkillCreatorFacade.executeAsync()` は `execute()` の戻り値である `RuntimeSkillCreatorExecuteResponse` union 型を受け取り、エラーか否かを判定している。

現在の判定ロジック（`apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` 行 1170-1175）は以下の inline 条件式になっている：

```typescript
const isStructuredError =
  typeof executeResult === "object" &&
  executeResult !== null &&
  "success" in executeResult &&
  executeResult.success === false;
```

`RuntimeSkillCreatorExecuteResponse` の union 型定義（`packages/shared/src/types/skillCreator.ts`）は現在 3 メンバーで構成されている：

```typescript
export type RuntimeSkillCreatorExecuteResponse =
  | RuntimeSkillCreatorExecuteResult // success: boolean
  | { type: "terminal_handoff"; bundle: TerminalHandoffBundle }
  | RuntimeSkillCreatorExecuteErrorResponse; // success: false
```

上記の inline 条件式は `success === false` のみを確認するため、`RuntimeSkillCreatorExecuteResult`（`success: false`）と `RuntimeSkillCreatorExecuteErrorResponse`（`success: false`）を区別しない。将来この union 型に新しいメンバーが追加された場合、`executeAsync()` を含むすべての consumer 側に対応コードが必要になるが、exhaustive check パターンがなければコンパイラが新ケースの漏れを検出できない。

### 1.2 問題点・課題

- `executeAsync()` の `isStructuredError` 判定は `success === false` チェックのみであり、union の各メンバーを discriminant で明示的に分岐していない
- `switch` + `exhaustive check（never 型）` パターンが導入されていないため、union 型拡張時に consumer 側の型エラーが発生せず、新ケースのハンドリング漏れが静的に検出されない
- 将来 union 型が拡張された場合（例: `{ type: "partial_success"; ... }` など）、`executeAsync()` 以外の consumer（`verifyAndImproveLoop` の `terminal_handoff` 判定等）も同時に更新が必要だが、対象箇所が散在しており一括洗い出しが困難

### 1.3 放置した場合の影響

- `RuntimeSkillCreatorExecuteResponse` union に新メンバーが追加された際、`executeAsync()` が新ケースを無言でスルーし、誤った `phase` (`"complete"` / `"error"`) でワークフローが遷移する可能性がある
- TypeScript コンパイラが警告を出さないまま実行時バグが混入し、デバッグコストが増大する
- 新メンバー追加時に consumer を網羅的に特定するためのコードサーチが毎回必要になり、将来の開発効率が低下する

---

## 2. 何を達成するか（What）

### 2.1 目的

`executeAsync()` の union 型判定を `switch` + `satisfies never` による exhaustive check パターンに置換し、将来の union 型拡張に対してコンパイル時に漏れを検出できる構造に変更する。

### 2.2 最終ゴール

- `RuntimeSkillCreatorFacade.executeAsync()` の inline 条件式 `isStructuredError` を除去し、各 union メンバーに対応する `switch` 分岐に置き換えた状態
- union に未知のメンバーが追加された場合に `default` ブランチで `satisfies never` 型エラーが発生し、コンパイル時に漏れが検出される状態
- `executeAsync()` と同等の exhaustive check パターンが導入されていることを確認するテストが追加されている状態

### 2.3 スコープ

#### 含むもの

- `RuntimeSkillCreatorFacade.ts` の `executeAsync()` メソッド内の `isStructuredError` inline 条件式を exhaustive switch に置換
- TypeScript の `never` 型を使った exhaustive check ヘルパー関数（`assertNever`）の導入（同ファイルまたは shared utilities）
- `executeAsync()` の各 union ケースに対応するユニットテストの追加
- exhaustive check が機能していることを確認するコンパイル時テスト（型テスト）の追加

#### 含まないもの

- `verifyAndImproveLoop()` 内の `terminal_handoff` / `success` 判定の exhaustive check 化（別タスクで対応）
- `RuntimeSkillCreatorExecuteResponse` 型定義自体の変更
- Renderer 側の consumer コードの変更
- 新しい union メンバーの追加

### 2.4 成果物

- 変更ファイル: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- 追加テスト: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.exhaustive.test.ts`（または既存テストファイルへの追記）
- （必要に応じて）exhaustive check ユーティリティ: `assertNever` ヘルパー関数

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 が完了済みであること（親タスク）
- `RuntimeSkillCreatorFacade.ts` の現行実装を理解していること
- TypeScript の discriminated union パターンと `never` 型を理解していること

### 3.2 依存タスク

| 依存タスク                                             | 内容                                                  |
| ------------------------------------------------------ | ----------------------------------------------------- |
| TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 | 親タスク。executeAsync() の基本実装が完了していること |

### 3.3 必要な知識

- TypeScript discriminated union パターン
- `never` 型と `satisfies never` による exhaustive check パターン
- `RuntimeSkillCreatorExecuteResponse` の 3 メンバー（`RuntimeSkillCreatorExecuteResult` / `{ type: "terminal_handoff" }` / `RuntimeSkillCreatorExecuteErrorResponse`）のdiscriminant
- Vitest によるユニットテスト記述

#### discriminant の把握

各メンバーの判別方法（親タスクで確認済みの知見）：

```typescript
// terminal_handoff メンバーの判定
isExecuteTerminalHandoff(result) → "type" in result && result.type === "terminal_handoff"

// エラーレスポンスの判定
isExecuteErrorResponse(result)  → "success" in result && result.success === false
```

ただし `RuntimeSkillCreatorExecuteResult` も `success: false` を持つケース（実行失敗時）があるため、
`isExecuteErrorResponse` だけでは両者を区別できない点に注意。

### 3.4 推奨アプローチ

1. `assertNever` ヘルパー関数をモジュールスコープに追加する

```typescript
function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unexpected value: ${JSON.stringify(value)}`);
}
```

2. `executeAsync()` の inline 条件式を以下の switch に置換する：

```typescript
// Before（現行）
const isStructuredError =
  typeof executeResult === "object" &&
  executeResult !== null &&
  "success" in executeResult &&
  executeResult.success === false;
const phase = isStructuredError ? "error" : "complete";

// After（exhaustive switch）
function classifyExecuteResult(
  result: RuntimeSkillCreatorExecuteResponse,
): "terminal_handoff" | "structured_error" | "success" | "execution_failed" {
  if ("type" in result && result.type === "terminal_handoff") {
    return "terminal_handoff";
  }
  if ("success" in result) {
    if (
      result.success === false &&
      "error" in result &&
      "code" in result.error
    ) {
      // RuntimeSkillCreatorExecuteErrorResponse（adapter ステータス起因）
      return "structured_error";
    }
    return result.success ? "success" : "execution_failed";
  }
  // 将来の union 拡張時にここでコンパイルエラーが発生する
  return assertNever(result);
}
```

3. `executeAsync()` 内を `classifyExecuteResult()` の戻り値で分岐させ、各ケースを明示的に処理する

4. 対応するテストを追加する

---

## 4. 実行手順

### Phase構成

小規模タスクのため 3 Phase で構成する。

| Phase | 名称                 | 概要                                            |
| ----- | -------------------- | ----------------------------------------------- |
| 1     | 設計・アプローチ確定 | exhaustive check パターンの設計と既存コード調査 |
| 2     | 実装                 | assertNever 導入、executeAsync() の switch 化   |
| 3     | テスト追加・完了確認 | ユニットテスト追加、型チェック・lint 通過確認   |

---

### Phase 1: 設計・アプローチ確定

#### 目的

exhaustive check の具体的な実装方針を確定し、既存コードへの影響範囲を把握する。

#### 手順

1. `packages/shared/src/types/skillCreator.ts` の `RuntimeSkillCreatorExecuteResponse` 型定義を確認し、現在の union メンバーを列挙する
2. `RuntimeSkillCreatorFacade.ts` の `executeAsync()` メソッド（行 1140-1203）を読み、現行の `isStructuredError` 判定ロジックを確認する
3. `verifyAndImproveLoop()` など、`RuntimeSkillCreatorExecuteResponse` を扱う他の箇所を Grep で洗い出し、影響範囲を確認する
4. `assertNever` を既存の shared utilities に追加するか、`RuntimeSkillCreatorFacade.ts` のモジュールスコープに追加するかを判断する
5. `classifyExecuteResult()` 関数のインターフェースを設計し、各 union メンバーとの対応関係をドキュメント化する

#### 成果物

- 設計メモ（コード内コメントまたは Phase ドキュメント）

#### 完了条件

- `RuntimeSkillCreatorExecuteResponse` の全メンバーが列挙されている
- `assertNever` の配置場所が決定している
- `executeAsync()` への変更範囲が明確になっている

---

### Phase 2: 実装

#### 目的

`assertNever` ヘルパーを導入し、`executeAsync()` の判定ロジックを exhaustive switch に置換する。

#### 手順

1. `assertNever` ヘルパー関数をモジュールスコープに追加する（または既存 utilities に追加）
2. `classifyExecuteResult()` 関数を実装し、各 union メンバーを discriminant で分岐させる
3. `executeAsync()` の `isStructuredError` inline 条件式と `phase` 判定を `classifyExecuteResult()` 呼び出しに置き換える
4. 各ケース（`"terminal_handoff"` / `"structured_error"` / `"execution_failed"` / `"success"`）の処理が元の動作と等価であることを確認する
5. `pnpm --filter @repo/desktop typecheck` でコンパイルエラーがないことを確認する
6. `pnpm --filter @repo/desktop lint` で lint エラーがないことを確認する

#### 成果物

- 変更済み `RuntimeSkillCreatorFacade.ts`

#### 完了条件

- TypeScript コンパイルが通る
- lint エラーがない
- 既存テストが全て PASS する（リグレッションなし）

---

### Phase 3: テスト追加・完了確認

#### 目的

exhaustive check パターンが正しく動作することをテストで保証し、タスクを完了させる。

#### 手順

1. 既存の `RuntimeSkillCreatorFacade` テストファイルを確認する
2. `executeAsync()` の各 union ケースに対応するユニットテストを追加する：
   - `success: true` の `RuntimeSkillCreatorExecuteResult` → `phase === "complete"` に遷移
   - `success: false` の `RuntimeSkillCreatorExecuteResult` → `phase === "error"` に遷移
   - `RuntimeSkillCreatorExecuteErrorResponse` → `phase === "error"` に遷移し、`onWorkflowStateSnapshot` にエラーメッセージが渡される
   - `{ type: "terminal_handoff" }` → `phase === "complete"` に遷移（または適切な動作）
3. `classifyExecuteResult()` の戻り値に対する型テストを追加する（`expectTypeOf` or コンパイル時チェック）
4. `pnpm --filter @repo/desktop test` でテストが全て PASS することを確認する
5. `pnpm --filter @repo/desktop typecheck` の最終確認を行う

#### 成果物

- 追加済みテストファイル（または既存ファイルへの追記）

#### 完了条件

- 全ての追加テストが PASS する
- TypeScript コンパイルが通る
- lint エラーがない
- `executeAsync()` の exhaustive check パターンが機能していることがテストで確認されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `RuntimeSkillCreatorFacade.ts` の `executeAsync()` における `isStructuredError` inline 条件式が除去されている
- [ ] `RuntimeSkillCreatorExecuteResponse` の各 union メンバーが discriminant で明示的に分岐されている
- [ ] `assertNever`（または同等の）exhaustive check パターンが `default` ブランチに組み込まれている
- [ ] 既存の `executeAsync()` の動作（phase 遷移、`onWorkflowStateSnapshot` 呼び出し）がリグレッションしていない

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通る
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしで通る
- [ ] `pnpm --filter @repo/desktop test` が全て PASS する
- [ ] 新たに追加したテストが `executeAsync()` の全 union ケースをカバーしている

### ドキュメント要件

- [ ] 変更内容と exhaustive check パターンの意図がコード内コメントで説明されている

---

## 6. 検証方法

### テストケース

| テストID | 入力                                                                                                                                   | 期待結果                                                                            |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| TC-01    | execute() が `{ success: true, ... }` を返す                                                                                           | phase が `"complete"` に遷移する                                                    |
| TC-02    | execute() が `{ success: false, error: ..., sdkEvents: ... }` を返す（`RuntimeSkillCreatorExecuteResult`）                             | phase が `"error"` に遷移する                                                       |
| TC-03    | execute() が `{ success: false, error: { code: "llm_adapter_unavailable", ... } }` を返す（`RuntimeSkillCreatorExecuteErrorResponse`） | phase が `"error"` に遷移し、`onWorkflowStateSnapshot` にエラーメッセージが渡される |
| TC-04    | execute() が `{ type: "terminal_handoff", bundle: ... }` を返す                                                                        | 適切なフェーズ遷移が行われる（現行動作と等価）                                      |
| TC-05    | `classifyExecuteResult()` に将来の unknown なメンバー型を渡す（型テスト）                                                              | コンパイルエラーが発生する（never 型エラー）                                        |

### 検証手順

1. `pnpm --filter @repo/desktop typecheck` を実行してコンパイルエラーがないことを確認
2. `pnpm --filter @repo/desktop lint` を実行して lint エラーがないことを確認
3. `pnpm --filter @repo/desktop test` を実行して全テストが PASS することを確認
4. `RuntimeSkillCreatorFacade.executeAsync()` に対応するテストの各 TC が PASS していることを確認
5. `assertNever` の `default` ブランチが実際にコンパイルエラーを発生させることをローカルで一時的に確認（新しい union メンバーを型定義に追加してみる）

---

## 7. リスクと対策

| リスク                                                                                                                                       | 影響度 | 発生確率 | 対策                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `executeAsync()` の動作変更により既存の phase 遷移ロジックにリグレッションが発生                                                             | 高     | 低       | Phase 2 で既存テストを全 PASS させてから Phase 3 に進む。Phase 3 でさらに追加テストを実施する                                     |
| `RuntimeSkillCreatorExecuteResult`（success: false）と `RuntimeSkillCreatorExecuteErrorResponse`（success: false）の区別ロジックが複雑になる | 中     | 中       | `classifyExecuteResult()` 関数でロジックを集中管理し、コメントで discriminant を説明する                                          |
| `assertNever` の配置場所（shared vs. local）の判断で迷う                                                                                     | 低     | 中       | タスク開始時に Phase 1 で決定する。他ファイルで使われていなければ `RuntimeSkillCreatorFacade.ts` モジュールスコープへの追加でよい |
| exhaustive check を導入することで将来の union 拡張者がコンパイルエラーに戸惑う                                                               | 低     | 低       | コード内コメントで exhaustive check の意図を説明する                                                                              |

---

## 8. 参照情報

### 関連ドキュメント

- 対象ファイル: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- 型定義: `packages/shared/src/types/skillCreator.ts`（`RuntimeSkillCreatorExecuteResponse` 行 877-880）
- 親タスク仕様書: `docs/30-workflows/completed-tasks/task-ut-rt-01-execute-async-snapshot-error-message-001/index.md`
- 発見ソース: `docs/30-workflows/completed-tasks/task-ut-rt-01-execute-async-snapshot-error-message-001/outputs/phase-12/unassigned-task-detection.md`
- Phase 3 設計レビュー: `docs/30-workflows/completed-tasks/task-ut-rt-01-execute-async-snapshot-error-message-001/phase-3-design-review.md`

### 参考資料

- TypeScript Handbook: [Narrowing - Exhaustiveness checking](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking)
- `satisfies` 演算子: TypeScript 4.9 以降で利用可能（`satisfies never` パターン）

---

## 9. 備考

### 苦戦箇所【記入必須】

> 以下は親タスク TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 の実装中に判明した知見（発見ソース: `outputs/phase-12/unassigned-task-detection.md` および `phase-3-design-review.md`）。

| 項目     | 内容                                                                                                                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状     | `RuntimeSkillCreatorExecuteResponse` の union メンバーを discriminant で区別する際、`terminal_handoff` と error 系の 2 種類の `success: false` メンバーの判定ロジックが複雑になった                                                                    |
| 原因     | `RuntimeSkillCreatorExecuteResult`（`success: boolean`）と `RuntimeSkillCreatorExecuteErrorResponse`（`success: false`）がどちらも `success` フィールドを持ち、さらに `terminal_handoff` は `type` フィールドを持つという 3 種類の discriminant が必要 |
| 対応     | discriminant の優先順位を「`type` フィールドの有無（terminal_handoff）→ `error.code` の有無（structured error）→ `success` boolean（実行結果）」の順で確認することで判別可能                                                                           |
| 再発防止 | `classifyExecuteResult()` のような分類関数を一箇所に集約し、コメントで discriminant の根拠を明記することで、将来の union 拡張者が迷わないようにする                                                                                                    |

**discriminant 関数の参考実装（親タスクで確認済み）:**

```typescript
// terminal_handoff の判定
isExecuteTerminalHandoff(result) → "type" in result && result.type === "terminal_handoff"

// adapter ステータス起因のエラーレスポンスの判定
isExecuteErrorResponse(result)  → "success" in result && result.success === false
                                   && "error" in result && "code" in result.error
                                   // （RuntimeSkillCreatorExecuteResult は error.code を持たない）
```

**将来 union 型拡張時の注意:**

- `RuntimeSkillCreatorExecuteResponse` に新メンバーを追加する際は、`executeAsync()` に加えて `verifyAndImproveLoop()` 内の `terminal_handoff` 判定（行 521-537）および `"success" in improveResult` 判定（行 495-518）も同時に更新が必要。これらの箇所も現在 inline 条件式であるため、将来のリファクタリング対象として認識しておくこと。
- `executeAsync()` に exhaustive check を導入した後、union 型を拡張する際に `assertNever` がコンパイルエラーを出すことで、上記の洗い出しが自動的に促される設計が望ましい。

### レビュー指摘の原文（該当する場合）

```
Phase 3 設計レビュー（phase-3-design-review.md）未タスク候補欄より：

| 候補                                                                      | 理由                                                                                          |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `RuntimeSkillCreatorExecuteResponse` union 拡張時の exhaustive check 導入 | 将来 union メンバーが増えた際の網羅性保証のため。現時点は inline 判定で十分なためスコープ外。 |
```

### 補足事項

- 本タスクは現時点では inline 条件式で十分に機能しており、バグではない。将来の保守性向上を目的としたリファクタリングである
- `assertNever` ヘルパーは非常にシンプルな関数のため、外部ライブラリの追加は不要
- TypeScript 4.9 以降の `satisfies` 演算子を使う場合、`result satisfies never` 形式でも同等の効果が得られる
