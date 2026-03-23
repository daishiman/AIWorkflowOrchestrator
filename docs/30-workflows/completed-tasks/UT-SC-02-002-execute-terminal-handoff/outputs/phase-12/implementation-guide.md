# UT-SC-02-002: execute() terminal_handoff 未分岐修正 実装ガイド

## メタ情報

| 項目     | 値                                                                 |
| -------- | ------------------------------------------------------------------ |
| タスクID | UT-SC-02-002                                                       |
| 対象     | `RuntimeSkillCreatorFacade.execute()` の `terminal_handoff` 未分岐 |
| 作成日   | 2026-03-23                                                         |
| Phase    | 12 (ドキュメント)                                                  |

---

## Part 1: 概念説明（中学生でも分かるレベル）

### 「terminal_handoff」って何？ ―― お店の転送電話で考えよう

お客さんが AI（`RuntimeSkillCreatorFacade`）に電話をかけてきたとします。

**ケース A: 「ターミナルで直接作業したい」（`terminal_handoff`）**

お客さんが「ターミナルで直接作業したい」と言ってきた場合（`execution_type = "terminal_handoff"`）、
AI は「では、ターミナル担当の窓口に転送します」と言って、そちらに電話をつなぎます。
このとき、AI 自身は何も作業しません――「転送しました」という結果（`TerminalHandoffBundle`）だけを返します。

具体的には「どのコマンドを実行すればいいか」「どのディレクトリで作業するか」「手動でやり直す手順」といった情報がまとまった "転送メモ" を渡すだけです。

**ケース B: 「AI に統合 API で処理してほしい」（`integrated_api`）**

お客さんが「AI に処理を任せたい」と言ってきた場合（`execution_type = "integrated_api"`）、
AI は自分で作業（`SkillExecutor` への委譲 → LLM へのリクエスト等）を行い、その結果を返します。

**この「誰が作業するか」を最初に振り分けるのが `execute()` の分岐ロジックです。**

### なぜ分岐が必要だったの？

修正前の `execute()` メソッドには、`plan()` や `improve()` にはあった `terminal_handoff` 分岐が欠落していました。
つまり「転送電話の仕組み」が `execute()` だけ壊れていたのです。

- `plan()` : 分岐あり（正常）
- `execute()` : **分岐なし（バグ）** ← 今回の修正対象
- `improve()` : 分岐あり（正常）

これは例えるなら、お店に3つの窓口（計画・実行・改善）があるのに、「実行」窓口だけ転送電話が繋がっていなかった状態です。お客さんが「ターミナルで実行したい」と言っても、その要望が無視されて AI が勝手に作業を始めてしまう問題がありました。

### 修正後の動き（3つの窓口すべてで転送可能に）

```
お客さん → [RuntimeSkillCreatorFacade]
              │
              ├─ plan()    → 「計画」窓口 → terminal_handoff or integrated_api
              ├─ execute() → 「実行」窓口 → terminal_handoff or integrated_api  ← 修正箇所
              └─ improve() → 「改善」窓口 → terminal_handoff or integrated_api
```

---

## Part 2: 技術者向け実装詳細

### 1. Union 型パターン

#### 定義場所

`packages/shared/src/types/skillCreator.ts` (L364-L369)

#### 型定義

```typescript
export type RuntimeSkillCreatorExecuteResponse =
  | RuntimeSkillCreatorExecuteResult
  | {
      type: "terminal_handoff";
      bundle: TerminalHandoffBundle;
    };
```

この Union 型は、既存の `RuntimeSkillCreatorPlanResponse`（L354-L359）および `RuntimeSkillCreatorImproveResponse`（L374-L379）と同一パターンで設計されています。3つの Response 型すべてが `通常結果 | { type: "terminal_handoff"; bundle: TerminalHandoffBundle }` という統一構造を持ちます。

#### バレルエクスポート

`packages/shared/src/types/index.ts` (L130-L131) に `RuntimeSkillCreatorExecuteResult` と `RuntimeSkillCreatorExecuteResponse` の両方がエクスポートされています。

### 2. 分岐ロジック

#### 対象ファイル

`apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` (L93-L134)

#### 修正内容

`execute()` メソッド内で `RuntimePolicyResolver.resolve()` / `resolveWithService()` から返される `decision` オブジェクトを使い、`terminal_handoff` と `integrated_api` を分岐します。

```typescript
async execute(
  planResult: SkillPlanResult,
  authMode: AuthMode,
  apiKey: string | null,
): Promise<RuntimeSkillCreatorExecuteResponse> {
  const decision = await this.resolveDecision(authMode, apiKey);

  // terminal_handoff ケース: SkillExecutor を呼び出さず即時返却
  if (decision.type === "terminal_handoff") {
    const bundle = this.handoffBuilder.build(
      planResult.skillSpec,
      process.cwd(),
    );
    return { type: "terminal_handoff", bundle };
  }

  // integrated_api ケース: 既存の SkillExecutor.execute() 委譲フロー
  const request: SkillExecutionRequest = {
    prompt: planResult.skillSpec,
    skillId: `creator-${planResult.planId}`,
  };
  // ...SkillExecutor への委譲処理...
}
```

#### 分岐の詳細

| 分岐条件                               | 動作                                                                                   |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| `decision.type === "terminal_handoff"` | `handoffBuilder.build(planResult.skillSpec, process.cwd())` でバンドル生成し、即時返却 |
| `decision.type === "integrated_api"`   | 既存の `SkillExecutor.execute()` に request と skillMeta を渡して委譲                  |

#### resolveDecision の判定ロジック（共通ヘルパー）

`resolveDecision()` (L53-L58) は `plan()` / `execute()` / `improve()` の3メソッドで共通使用されます。

```typescript
private resolveDecision(authMode: AuthMode, apiKey: string | null) {
  if (authMode === "api-key" && (!apiKey || apiKey.trim() === "")) {
    return this.resolver.resolveWithService(authMode);
  }
  return this.resolver.resolve(authMode, apiKey);
}
```

- `api-key` モードで apiKey が空/null の場合: `resolveWithService()` で `IAuthKeyService` 経由のキー取得を試行
- それ以外: `resolve()` で直接判定

#### RuntimePolicyResolver の3パターン分岐

| パターン | 条件                             | 結果               |
| -------- | -------------------------------- | ------------------ |
| A        | apiKey 有効（trim 後非空文字列） | `integrated_api`   |
| B        | apiKey 無効 + subscription 無効  | `terminal_handoff` |
| C        | apiKey 無効 + subscription 有効  | `terminal_handoff` |

### 3. テスト設計

#### テストファイル

`apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`

#### execute テストケース一覧（8件）

| #   | テストケース                                                      | 検証ポイント                                                                   |
| --- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1   | SkillExecutor に request と metadata を委譲し、成功結果を返す     | `integrated_api` パスで `executeMock` が正しい引数で呼ばれること               |
| 2   | SkillExecutor のエラーを message に変換し、skillName を50文字切詰 | エラー応答の形式と skillName 切り詰めロジック                                  |
| 3   | terminal_handoff 判定時は builder の結果を返す                    | `executeMock` が呼ばれないこと（`expect(executeMock).not.toHaveBeenCalled()`） |
| 4   | apiKey 未指定で resolveWithService が terminal_handoff を返す場合 | `resolveWithService` 経由の terminal_handoff パス                              |
| 5   | 明示的 apiKey 指定でも terminal_handoff は正しく返る              | 明示的 apiKey でも resolver が terminal_handoff を返せば従う                   |
| 6   | apiKey 未指定で resolveWithService が integrated_api を返す場合   | `resolveWithService` 経由の integrated_api パスで executor に委譲              |
| 7   | resolveWithService terminal_handoff 時の build 引数が正しい       | `buildSpy` に `planResult.skillSpec` と `process.cwd()` が渡ること             |
| 8   | 明示的 apiKey が渡された場合は resolveWithService を使わない      | `resolveWithService` が呼ばれないこと                                          |

#### terminal_handoff テストの核心アサーション

```typescript
// terminal_handoff 時: SkillExecutor は一切呼ばれない
expect(executeMock).not.toHaveBeenCalled();

// handoffBuilder.build() に正しい引数が渡る
expect(buildSpy).toHaveBeenCalledWith("my-skill\nbody", process.cwd());

// 返却値が terminal_handoff 形式である
expect(result).toEqual({
  type: "terminal_handoff",
  bundle: handoffBundle,
});
```

### 4. IPC ハンドラの戻り値型

#### 対象ファイル

`apps/desktop/src/main/ipc/creatorHandlers.ts` (L90-L138)

#### 戻り値型の更新

`skill-creator:execute-plan` ハンドラの戻り値型が `IpcResult<RuntimeSkillCreatorExecuteResponse>` に設定されており、`terminal_handoff` バリアントを含む Union 型を正しくラップしています。

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_CREATOR_EXECUTE_PLAN,
  async (
    event: IpcMainInvokeEvent,
    args: {
      planId: string;
      skillSpec: string;
      authMode?: AuthMode;
      apiKey?: string | null;
    },
  ): Promise<IpcResult<RuntimeSkillCreatorExecuteResponse>> => {
    // ...バリデーション・facade.execute() 呼び出し...
    return { success: true, data: result };
  },
);
```

Renderer 側では `result.data` が `RuntimeSkillCreatorExecuteResponse` 型となり、`"type" in result.data` による型ナロイングで `terminal_handoff` と `RuntimeSkillCreatorExecuteResult` を安全に判別できます。

### 5. 関連ファイル一覧

| ファイル                                                                             | 役割                                               |
| ------------------------------------------------------------------------------------ | -------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                                          | Union 型 `RuntimeSkillCreatorExecuteResponse` 定義 |
| `packages/shared/src/types/index.ts`                                                 | バレルエクスポート                                 |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                | 分岐ロジック本体                                   |
| `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`                    | 実行経路判定（3パターン分岐）                      |
| `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`                   | TerminalHandoffBundle 構築                         |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                                       | IPC ハンドラ（戻り値型更新）                       |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` | ユニットテスト（8件）                              |

### 6. 設計判断の根拠

#### なぜ `plan()` / `improve()` と同じパターンにしたか

`RuntimeSkillCreatorFacade` の3メソッド（`plan` / `execute` / `improve`）はすべて同一の routing 責務を持ちます。`resolveDecision()` → 分岐 → 早期リターン or 委譲という共通パターンを適用することで、以下を実現しました。

1. **一貫性**: 3メソッドすべてが同じ分岐パターンを持つため、1つのメソッドの動作を理解すれば他のメソッドも理解できる
2. **非破壊性**: `integrated_api` パス（else 側）は既存コードをそのまま維持し、`terminal_handoff` の早期リターンを追加するだけで完結
3. **テスタビリティ**: `executeMock.not.toHaveBeenCalled()` による「呼ばれないこと」の検証が明快

#### `void decision;` 行の除去

修正前は `decision` 変数が未使用のため `void decision;` で ESLint/TypeScript の unused 警告を抑制していました。分岐ロジックの追加により `decision` が正しく使用されるようになったため、この行は不要となり除去されました。
