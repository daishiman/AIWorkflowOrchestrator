# implementation-guide.md — TASK-P0-09-U1

## Part 1: 中学生レベルの概念説明

### なぜこの修正が必要だったの？

学校の入り口に守衛さんがいる、と想像してください。守衛さんは「どの生徒がどの教室に入ってよいか」のルールブックを持っています（これが `SkillCreatorPermissionPolicy`）。

# Phase 12: 実装ガイド — TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001

このルールブックには「自分の担当教室（`allowedSkillRoot`）以外の部屋へは入れない」というルールが書いてありました。でも今まで、守衛さんは「あなたは教室に入っていいよ」とは言っていたけれど、**「その教室は本当に君の担当教室？」という確認をしていませんでした**。

今回の修正では、守衛さんが入室許可を出す前に「今から行こうとしている教室番号（`targetPath`）と、あなたが担当している教室番号（`allowedSkillRoot`）が一致するか」を必ず確認するようにしました。

### 何をするか

`RuntimeSkillCreatorFacade.execute()` / `improve()` に LLMAdapter の状態ガードを追加し、初期化前・失敗時に明確なエラーを返すようにした。あわせて `RuntimeSkillCreatorExecuteErrorResponse` を追加し、renderer 側で structured error をメッセージに正規化する。

**修正前（問題のある状態）**:

```
守衛さん: 「Writeツールを使いたいんだね。execute フェーズだから OK！どうぞ！」
         ← どのファイルに書き込もうとしているか確認していない！
```

**修正後（正しい状態）**:

```
守衛さん: 「Writeツールを使いたいんだね。
           ちょっと待って。どのファイルに書き込もうとしているの？
           → /outside/path/file.ts？それは担当エリア外！ダメです（deny）
           → /allowed/skills/my-skill/SKILL.md？担当エリア内！どうぞ（allow）」
```

---

## Part 2: 技術者向け説明

### 問題の本質

`RuntimeSkillCreatorFacade.createExecuteGovernanceCanUseTool()` が `evaluateGovernanceToolUse` に `context` を渡していなかった。`SkillCreatorPermissionPolicy.evaluateContextPolicy()` は実装・テスト済みだったが、配線層が未接続だった。

### インターフェース / 型定義

```typescript
// governance/SkillCreatorPermissionPolicy.ts
export interface CanUseToolContext {
  targetPath?: string; // 操作対象のファイルパス
  allowedSkillRoot?: string; // 許可された skill ディレクトリ root
}

// governance/index.ts
export function canUseTool(
  toolName: string,
  phase: SkillCreatorGovernancePhase,
  context?: CanUseToolContext,
): SkillCreatorToolDecision;
```

### API シグネチャと使用例

```typescript
// RuntimeSkillCreatorFacade.ts（修正後）

// 共通 helper: file_path → path のフォールバック
private extractTargetPath(input: Record<string, unknown>): string | undefined {
  const filePath = typeof input.file_path === "string" ? input.file_path : undefined;
  const pathValue = typeof input.path === "string" ? input.path : undefined;
  return filePath ?? pathValue;
}

// execute phase canUseTool callback
private createExecuteGovernanceCanUseTool(skillRoot: string) {
  return async (toolName, input, options) => {
    const targetPath = this.extractTargetPath(input);
    const decision = evaluateGovernanceToolUse(toolName, "execute", {
      targetPath,
      allowedSkillRoot: skillRoot,
    });
    return decision.allowed
      ? { behavior: "allow", toolUseID: options.toolUseID }
      : { behavior: "deny", message: decision.reason, toolUseID: options.toolUseID };
  };
}

// improve phase canUseTool callback（同一パターン、phase のみ異なる）
private createImproveGovernanceCanUseTool(skillRoot: string) { ... }

// _executeInternal() での呼び出し
canUseTool: this.createExecuteGovernanceCanUseTool(
  this.getExplicitSkillCreatorRoot() ?? "",
),
```

### エラーハンドリングとエッジケース

| ケース                                              | 動作                                                                                           |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `targetPath` が undefined（input にパスなし）       | `context.targetPath` が falsy → path-scoped チェックスキップ → tool-level 判定のみ（後方互換） |
| `skillRoot` が空文字列                              | `context.allowedSkillRoot` が falsy → チェックスキップ → tool-level 判定のみ                   |
| `input.file_path` が string 以外                    | `typeof` ガードで undefined として扱い `input.path` にフォールバック                           |
| sibling path prefix 攻撃（`/allowed/skills-evil/`） | `isPathWithinRoot()` の `startsWith("${root}/")` 境界チェックで阻止                            |

### 設定可能なパラメータと定数一覧

| 項目                | 種別       | 説明                                                                                                                              |
| ------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `skillRoot`         | パラメータ | `execute()` から `createExecuteGovernanceCanUseTool(skillRoot)` / `createImproveGovernanceCanUseTool(skillRoot)` に渡す許可ルート |
| `targetPath`        | パラメータ | `input.file_path` もしくは `input.path` から抽出する操作対象パス                                                                  |
| `allowedSkillRoot`  | パラメータ | `evaluateGovernanceToolUse()` に渡す比較基準のルート                                                                              |
| `file_path`         | 定数的キー | SDK 入力の第1優先キー。存在すれば最優先で採用する                                                                                 |
| `path`              | 定数的キー | `file_path` がない場合のフォールバックキー                                                                                        |
| `behavior: "allow"` | 定数       | 許可時の返却値                                                                                                                    |
| `behavior: "deny"`  | 定数       | 拒否時の返却値                                                                                                                    |

### 修正ファイル一覧

| ファイル                                                                                      | 変更内容                                                                                                                                          |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                         | `extractTargetPath` 追加、`createExecuteGovernanceCanUseTool` 修正、`createImproveGovernanceCanUseTool` 新規追加、`_executeInternal` 呼び出し修正 |
| `apps/desktop/src/main/services/runtime/__tests__/governance/path-scoped-enforcement.test.ts` | TC-PATH-01〜06 + extractTargetPath 4件 = 11件追加                                                                                                 |

## 変更内容

- `RuntimeSkillCreatorFacade.execute()` / `improve()` の先頭に `_llmAdapterStatus` ガードを追加
- `RuntimeSkillCreatorExecuteErrorResponse` を shared types に追加
- renderer の consumer で structured error を message に正規化
- execute ack 後に workflow snapshot を再読込し、failure snapshot を UI に反映
- improve 失敗時は `recordImproveFailure()` 経由で improve phase の snapshot を保持

## Part 1: 中学生レベルの説明

### なぜ必要か

AI に仕事を頼む前に「まだ準備中」や「準備に失敗した」状態があり、そのまま実行するとわかりにくい失敗になります。最初に状態を確認して、はっきり「今は使えない」と返す必要がありました。

### 何をしたか

実行を始める前に「準備できているか」を確認し、準備ができていない場合は分かりやすいエラーを返すようにしました。これにより、失敗理由があいまいにならず、ユーザーが次にやるべきことを判断しやすくなりました。

### たとえ

自動販売機でジュースを買う前に「在庫切れ」ランプが点くのと同じです。先に教えてくれるので、無駄にボタンを押して困らなくなります。

## Part 2: 技術者向け

### 変更ファイル

- `packages/shared/src/types/skillCreator.ts`
- `packages/shared/src/types/index.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.*.test.ts`
- `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/manual-test-report.md`
- `outputs/phase-11/discovered-issues.md`
- `outputs/phase-11/ui-sanity-visual-review.md`

### 追加された型

```ts
export interface RuntimeSkillCreatorExecuteErrorResponse {
  success: false;
  error: { code: RuntimeSkillCreatorDegradedReason; message: string };
}
```

`RuntimeSkillCreatorExecuteResponse` は上記 error 型を含む union に拡張される。

### エラーハンドリング

- `_llmAdapterStatus === "failed"` の場合は `llm_adapter_unavailable` を返す
- `_llmAdapterStatus === "initializing"` の場合は初期化中のメッセージを返す
- execute ack 後の snapshot 再読込により、failure path の UI 反映漏れを防止

### 影響範囲

- IPC や public channel の追加はなし
- 既存の正常系レスポンスは互換維持

### 画面証跡

本タスクは runtime guard 追加のため UI の追加変更なし。Phase 11 は NON_VISUAL の証跡で記録している。
