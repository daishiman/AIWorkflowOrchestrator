# implementation-guide.md — TASK-P0-09-U1

## Part 1: 中学生レベルの概念説明

### なぜこの修正が必要だったの？

学校の入り口に守衛さんがいる、と想像してください。守衛さんは「どの生徒がどの教室に入ってよいか」のルールブックを持っています（これが `SkillCreatorPermissionPolicy`）。

このルールブックには「自分の担当教室（`allowedSkillRoot`）以外の部屋へは入れない」というルールが書いてありました。でも今まで、守衛さんは「あなたは教室に入っていいよ」とは言っていたけれど、**「その教室は本当に君の担当教室？」という確認をしていませんでした**。

今回の修正では、守衛さんが入室許可を出す前に「今から行こうとしている教室番号（`targetPath`）と、あなたが担当している教室番号（`allowedSkillRoot`）が一致するか」を必ず確認するようにしました。

### 何をするか

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
