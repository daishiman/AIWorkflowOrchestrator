# TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 - タスク指示書

## メタ情報

| 項目         | 内容                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| タスクID     | TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001                              |
| タスク名     | `executeAsync()` での error message 形式統一                                        |
| 分類         | 改善                                                                                |
| 対象機能     | RuntimeSkillCreatorFacade — executeAsync / onWorkflowStateSnapshot                  |
| 優先度       | 中                                                                                  |
| 見積もり規模 | 小規模                                                                              |
| ステータス   | 未実施                                                                              |
| 発見元       | Phase 10（TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 最終レビュー MINOR 指摘） |
| 発見日       | 2026-04-04                                                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 では `execute()` / `improve()` に LLMAdapter ステータスガードを実装し、`RuntimeSkillCreatorExecuteErrorResponse`（`success: false` + `error.code` + `error.message`）の structured error 形式を導入した。

`executeAsync()` はその `execute()` を内部で呼び出す fire-and-forget 型ラッパーであり、`execute()` から返却された structured error を受け取った後、フェーズ遷移（`triggerPhaseTransition(planId, "error", 0)`）を行う。

しかし現状の実装では、`execute()` が `success: false` の structured error を返した場合でも、そのエラーの詳細メッセージ（`error.code` / `error.message`）は `onWorkflowStateSnapshot` へ伝搬されない。一方、例外が発生した場合は `error instanceof Error ? error.message : String(error)` という形式のメッセージを `onWorkflowStateSnapshot` に渡すコードパスが存在する（ただし snapshot が存在しない場合のみ）。

この結果、`onWorkflowStateSnapshot` へ渡る error message の形式が「例外ルート」と「structured error ルート」で不揃いになっている。

### 1.2 問題点・課題

現状の `executeAsync()` における error 伝搬パスの不揃い：

| ケース                                                        | error の伝搬                                                                                                                       |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `execute()` が `success: false` を返す（adapter guard, etc.） | `triggerPhaseTransition("error")` のみ。`onWorkflowStateSnapshot` への `error` 引数は渡されない                                    |
| `execute()` が例外をスローする                                | `triggerPhaseTransition("error")` + snapshot が null の場合のみ `onWorkflowStateSnapshot?.(planId, null, errorMessage)` を呼び出す |

Renderer 側は `onWorkflowStateSnapshot` が提供する snapshot または error 引数を元に UI を更新する。structured error の `error.message` が伝わらないと、Renderer は「なぜエラーになったか」を表示できない。

### 1.3 放置した場合の影響

- adapter ステータスガードが `execute()` で発動した場合（API キー未設定など）、Renderer 側の UI にはエラー理由が表示されない
- ユーザーは「スキル実行に失敗した」という事実は確認できるが、その原因（「API キーを設定してください」など）を UI から読み取れない
- adapter guard の投資効果（actionable message の提供）が `executeAsync()` 経由の呼び出しでは得られない

---

## 2. 何を達成するか（What）

### 2.1 目的

`executeAsync()` が `execute()` から structured error（`success: false`）を受け取った場合も、その `error.message` を `onWorkflowStateSnapshot` に適切に伝搬させることで、Renderer 側でエラー理由を表示できるようにする。

### 2.2 最終ゴール

- `executeAsync()` 内の全エラーパスで `onWorkflowStateSnapshot` に渡る error の形式が統一されている
- structured error の `error.message` が Renderer の snapshot または error 引数として届く
- `execute()` / `plan()` / `improve()` の adapter guard と同等品質の actionable message が UI に表示される

### 2.3 スコープ

#### 含むもの

- `RuntimeSkillCreatorFacade.executeAsync()` の structured error パスに `onWorkflowStateSnapshot` へのエラーメッセージ伝搬を追加
- エラーメッセージ形式の統一（例外ルートと structured error ルートを揃える）
- `executeAsync()` のエラーパスを対象としたテストの追加または修正

#### 含まないもの

- `SkillCreatorWorkflowEngine` の内部 snapshot 生成ロジックの変更
- `execute()` / `improve()` / `plan()` 自体のエラーハンドリング変更
- Renderer 側（`SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx`）の UI 変更
- 新規エラーコードの追加

### 2.4 成果物

| 成果物                                                                                                                     | 内容                                                             |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                                      | `executeAsync()` の structured error パスに error 伝搬処理を追加 |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` または既存テストファイル | structured error 伝搬シナリオのテスト追加                        |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 が完了済みであること
- `RuntimeSkillCreatorExecuteErrorResponse` 型が `packages/shared/src/types/skillCreator.ts` に定義済みであること
- `RuntimeSkillCreatorFacade.executeAsync()` と `onWorkflowStateSnapshot` の現状実装を把握済みであること

### 3.2 依存タスク

| タスクID                                        | 依存理由                                                               |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 | structured error 型（`RuntimeSkillCreatorExecuteErrorResponse`）の前提 |

### 3.3 必要な知識

- `RuntimeSkillCreatorFacade.executeAsync()` の fire-and-forget パターンと `onWorkflowStateSnapshot` のシグネチャ
- `RuntimeSkillCreatorExecuteResponse` の union 型（`RuntimeSkillCreatorExecuteResult` / `{ type: "terminal_handoff"; bundle }` / `RuntimeSkillCreatorExecuteErrorResponse`）
- `SkillCreatorWorkflowEngine.triggerPhaseTransition()` と snapshot 取得の連携

### 3.4 推奨アプローチ

1. `executeAsync()` の try ブロック内で `execute()` の返却値を受け取った後、`success: false` の structured error の場合に `onWorkflowStateSnapshot?.(planId, snapshot, errorMessage)` を明示的に呼び出す
2. snapshot が存在する場合は snapshot を第2引数として渡し、error.message を第3引数として渡す（現状は例外時のみ snapshot なしでの伝搬）
3. 以下の3パスを明示的にハンドリングする：
   - `isExecuteErrorResponse(result)` → `onWorkflowStateSnapshot` に error.message を渡す
   - `isExecuteTerminalHandoff(result)` → 現状のまま（terminal_handoff は別処理）
   - それ以外（`RuntimeSkillCreatorExecuteResult`）→ 成功パス

---

## 4. 実行手順

### Phase 構成

| Phase | 名称     | 概要                                              |
| ----- | -------- | ------------------------------------------------- |
| 1     | 現状調査 | `executeAsync()` の現行実装とエラーパスを確認する |
| 2     | 設計     | 修正方針と型ガード関数を設計する                  |
| 3     | 実装     | `executeAsync()` にエラー伝搬処理を追加する       |
| 4     | テスト   | structured error 伝搬のテストを追加する           |
| 5     | 検証     | typecheck / lint / 既存テスト PASS を確認する     |

### Phase 1: 現状調査

#### 目的

`executeAsync()` の現行実装と `onWorkflowStateSnapshot` のシグネチャを確認し、修正対象箇所を特定する。

#### 手順

1. `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` の `executeAsync()` メソッド（約 955〜1011 行）を読む
2. `onWorkflowStateSnapshot` の型定義（約 940〜943 行）を確認する
3. `execute()` の返却型（`RuntimeSkillCreatorExecuteResponse`）の union メンバーを `packages/shared/src/types/skillCreator.ts` で確認する
4. 既存テストファイルで `executeAsync` に関するテストの有無を確認する

#### 成果物

修正対象箇所の特定メモ

#### 完了条件

- `executeAsync()` の try/catch ブロックの全パスが把握できている
- `onWorkflowStateSnapshot` の第3引数 `error?` が optional であることを確認している

### Phase 2: 設計

#### 目的

`executeAsync()` 内での type narrowing 方針と、`onWorkflowStateSnapshot` へのエラー伝搬ロジックを設計する。

#### 手順

1. `RuntimeSkillCreatorExecuteResponse` の union 型に対して、以下の判定関数を設計する：
   - `isExecuteErrorResponse(result)`: `"success" in result && result.success === false` で判定
   - `isExecuteTerminalHandoff(result)`: `"type" in result && result.type === "terminal_handoff"` で判定
2. structured error の場合に渡す error message を決定する（`result.error.message` をそのまま渡す）
3. snapshot が存在する場合と存在しない場合の両方で `onWorkflowStateSnapshot` を呼び出す方針を決定する

#### 成果物

修正設計メモ（コードスニペット案）

#### 完了条件

- 3つのパス（error / terminal_handoff / success）それぞれの処理が設計済みである
- 既存の例外パスとの一貫性が保たれている

### Phase 3: 実装

#### 目的

`executeAsync()` の try ブロック内に structured error 伝搬ロジックを追加する。

#### 手順

1. `RuntimeSkillCreatorFacade.ts` の `executeAsync()` を修正する
2. `execute()` の返却値に対して以下の処理を追加する：

```typescript
// 修正イメージ（executeAsync の try ブロック内）
const executeResult = await this.execute(
  planResult,
  args.authMode ?? "api-key",
  args.apiKey ?? null,
);

let errorMessage: string | undefined;

if ("success" in executeResult && executeResult.success === false) {
  // structured error パス（adapter guard 等）
  errorMessage = executeResult.error.message;
  this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  this.onWorkflowStateSnapshot?.(planId, snapshot ?? null, errorMessage);
} else if (
  "type" in executeResult &&
  executeResult.type === "terminal_handoff"
) {
  // terminal_handoff パス（現状のまま）
  this.workflowEngine.triggerPhaseTransition(planId, "complete", 100);
} else {
  // 成功パス
  this.workflowEngine.triggerPhaseTransition(planId, "complete", 100);
}
```

3. 実装後、`pnpm --filter @repo/desktop typecheck` を実行して型エラーがないことを確認する

#### 成果物

修正済み `RuntimeSkillCreatorFacade.ts`

#### 完了条件

- TypeScript コンパイルエラーが 0 件である
- `execute()` の全 union ケースが明示的にハンドリングされている

### Phase 4: テスト

#### 目的

structured error 伝搬のテストを追加し、修正が正しく機能することを検証する。

#### 手順

1. 既存の `RuntimeSkillCreatorFacade` テストファイルを確認する（`__tests__/` ディレクトリ）
2. 以下のテストシナリオを追加する：
   - `execute()` が `success: false` の structured error を返した場合に `onWorkflowStateSnapshot` が `error.message` を伴って呼び出されること
   - `execute()` が `terminal_handoff` を返した場合は error 引数なしでフェーズが `complete` に遷移すること
   - `execute()` が成功結果を返した場合はエラー伝搬が行われないこと
3. `pnpm --filter @repo/desktop test` を実行し、全テストが PASS することを確認する

#### 成果物

追加されたテストケース

#### 完了条件

- structured error 伝搬シナリオのテストが追加されている
- 既存テストがリグレッションなし
- 新規テストが全て PASS している

### Phase 5: 検証

#### 目的

実装全体の品質を確認する。

#### 手順

1. `pnpm --filter @repo/desktop typecheck` でTypeScript 型チェックを実行
2. `pnpm --filter @repo/desktop lint` で ESLint を実行
3. `pnpm --filter @repo/desktop test` で全テストを実行
4. Phase 3 で変更した `executeAsync()` のコードを最終確認する

#### 成果物

各ツールの実行結果（エラー 0 件）

#### 完了条件

- typecheck エラーが 0 件
- lint エラーが 0 件
- 全テストが PASS している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `executeAsync()` が `execute()` から `success: false` の structured error を受け取った場合、`onWorkflowStateSnapshot` に `error.message` が渡される
- [ ] `execute()` の全 union ケース（`RuntimeSkillCreatorExecuteResult` / `terminal_handoff` / `RuntimeSkillCreatorExecuteErrorResponse`）が `executeAsync()` 内で明示的にハンドリングされている
- [ ] 例外スローのパス（catch ブロック）の挙動が変わっていない

### 品質要件

- [ ] TypeScript コンパイルエラーが 0 件
- [ ] ESLint エラーが 0 件
- [ ] 既存の `executeAsync()` テストがリグレッションなし
- [ ] structured error 伝搬シナリオの新規テストが追加されている

### ドキュメント要件

- [ ] 修正した関数に JSDoc または inline コメントで意図が記述されている（任意）

---

## 6. 検証方法

### テストケース

| ID   | シナリオ                                                                                                                     | 期待結果                                                                                                   |
| ---- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| T-01 | `execute()` が `{ success: false, error: { code: "llm_adapter_unavailable", message: "APIキーを設定してください" } }` を返す | `onWorkflowStateSnapshot` が `"APIキーを設定してください"` を第3引数に渡して呼び出される                   |
| T-02 | `execute()` が `{ type: "terminal_handoff", bundle: ... }` を返す                                                            | `onWorkflowStateSnapshot` の第3引数は `undefined` / フェーズが `complete` に遷移する                       |
| T-03 | `execute()` が `{ success: true, ... }` などの正常結果を返す                                                                 | `onWorkflowStateSnapshot` の第3引数は `undefined` / フェーズが `complete` に遷移する                       |
| T-04 | `execute()` が例外をスローする                                                                                               | 既存の catch パスが動作し、`onWorkflowStateSnapshot` が `error.message` を渡して呼び出される（既存テスト） |

### 検証手順

```bash
# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# ESLint
pnpm --filter @repo/desktop lint

# テスト実行
pnpm --filter @repo/desktop test -- --testPathPattern "RuntimeSkillCreatorFacade"
```

---

## 7. リスクと対策

| リスク                                                                                     | 影響度 | 発生確率 | 対策                                                                                                           |
| ------------------------------------------------------------------------------------------ | ------ | -------- | -------------------------------------------------------------------------------------------------------------- |
| `onWorkflowStateSnapshot` の第3引数 `error?` の型が変更された場合に呼び出し側が壊れる      | 中     | 低       | 実装前に型定義を確認し、optional であることを保証する                                                          |
| `RuntimeSkillCreatorExecuteResponse` の union が将来拡張された場合に網羅性チェックが漏れる | 中     | 中       | 明示的な型ガード関数（discriminant function）を実装し、exhaustive check（`satisfies never`）パターンを検討する |
| Renderer 側の consumer が `error` 引数の増加に対応できていない場合                         | 低     | 低       | `onWorkflowStateSnapshot` の `error` は元から optional のため、既存コードへの破壊的変更は発生しない            |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                                  | パス                                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 親タスク仕様書（Phase 10 MINOR 指摘の発生元） | `docs/30-workflows/ut-rt-01-execute-improve-adapter-guard-001/`                                              |
| 元タスク未タスク仕様書                        | `docs/30-workflows/unassigned-task/task-ut-rt-01-execute-improve-adapter-guard-001.md`                       |
| RuntimeSkillCreatorFacade 実装                | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                        |
| skillCreator 型定義                           | `packages/shared/src/types/skillCreator.ts`                                                                  |
| Phase 10 最終レビュー                         | `docs/30-workflows/ut-rt-01-execute-improve-adapter-guard-001/phase-10-final-review.md`                      |
| Phase 12 未タスク検出レポート                 | `docs/30-workflows/ut-rt-01-execute-improve-adapter-guard-001/outputs/phase-12/unassigned-task-detection.md` |

### 参考資料

- `RuntimeSkillCreatorExecuteResponse` の union 型定義は `packages/shared/src/types/skillCreator.ts` を参照
- `onWorkflowStateSnapshot` のシグネチャは `RuntimeSkillCreatorFacade.ts` 約 940 行を参照

---

## 9. 備考

### レビュー指摘の原文（Phase 10 MINOR 指摘）

```
`executeAsync()` が adapter エラーを `onWorkflowStateSnapshot` に伝搬する際のメッセージフォーマット統一
判定: MINOR / 対応: Phase 12 で未タスク化
```

出典: `docs/30-workflows/ut-rt-01-execute-improve-adapter-guard-001/phase-10-final-review.md`

### 苦戦箇所（実装時のアドバイス）

TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 の実装経験から、以下の点に注意すること：

**Renderer 側の type narrowing**

`RuntimeSkillCreatorExecuteResponse` の union 型が拡張されたことで（`RuntimeSkillCreatorExecuteErrorResponse` が追加）、Renderer 側（`SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx`）の type narrowing が不完全になっていた。本タスクで `executeAsync()` を修正した後、Renderer 側が `onWorkflowStateSnapshot` の第3引数 `error` を受け取って UI に反映できているかを確認すること。

**解決方法の参考**

親タスクでは以下の3つの discriminant function を明示的に実装することで解決した：

- `isExecuteTerminalHandoff(result)` → `"type" in result && result.type === "terminal_handoff"`
- `isExecuteErrorResponse(result)` → `"success" in result && result.success === false`
- デフォルト（上記以外）→ `RuntimeSkillCreatorExecuteResult`

本タスクでも同様のアプローチを採用することを推奨する。

**Snapshot の UI 表示**

execute ack 後に `getWorkflowState()` を再読込して failure snapshot を優先的に表示するよう改修が必要だった経緯がある（`SkillCreateWizard.tsx`）。`onWorkflowStateSnapshot` にエラーメッセージを渡した後、Renderer が snapshot を再取得しているかを確認すること。

**将来の union 型拡張時の注意**

union 型を拡張する際は、consumer 側の type guard を一度に全て洗い出して同時に更新すること。ack-only response に対しても renderer 側で snapshot を再取得する習慣が重要。
