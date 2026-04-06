# Phase 2: 設計 — design.md

## 1. createExecuteGovernanceCanUseTool 設計

### シグネチャ変更

```typescript
// Before
private createExecuteGovernanceCanUseTool()

// After
private createExecuteGovernanceCanUseTool(skillRoot: string)
```

### targetPath 抽出ロジック（共通 helper）

```typescript
private extractTargetPath(input: Record<string, unknown>): string | undefined {
  const filePath =
    typeof input.file_path === "string" ? input.file_path : undefined;
  const pathValue =
    typeof input.path === "string" ? input.path : undefined;
  return filePath ?? pathValue;
}
```

- `file_path` を優先し、なければ `path` にフォールバック
- どちらも存在しない場合は `undefined`（context なし扱い → tool-level 判定のみ）

### createExecuteGovernanceCanUseTool 実装

```typescript
private createExecuteGovernanceCanUseTool(skillRoot: string) {
  return async (
    toolName: string,
    input: Record<string, unknown>,
    options: { toolUseID: string },
  ) => {
    const targetPath = this.extractTargetPath(input);
    const decision = evaluateGovernanceToolUse(toolName, "execute", {
      targetPath,
      allowedSkillRoot: skillRoot,
    });
    return decision.allowed
      ? { behavior: "allow" as const, toolUseID: options.toolUseID }
      : {
          behavior: "deny" as const,
          message: decision.reason,
          toolUseID: options.toolUseID,
        };
  };
}
```

---

## 2. skillRoot 取得・受け渡し設計

`_executeInternal()` 内での変更:

```typescript
// Before
canUseTool: this.createExecuteGovernanceCanUseTool(),

// After
const skillRoot = this.getExplicitSkillCreatorRoot() ?? "";
// ...
canUseTool: this.createExecuteGovernanceCanUseTool(skillRoot),
```

### skillRoot が undefined の場合

- `?? ""` で空文字列にフォールバック
- `evaluateContextPolicy()` では `context.allowedSkillRoot` が falsy（空文字列）なら path-scoped チェックをスキップ
- 後方互換を維持（AC-3, TC-PATH-06）

---

## 3. improve phase 対応設計

### createImproveGovernanceCanUseTool 実装

```typescript
private createImproveGovernanceCanUseTool(skillRoot: string) {
  return async (
    toolName: string,
    input: Record<string, unknown>,
    options: { toolUseID: string },
  ) => {
    const targetPath = this.extractTargetPath(input);
    const decision = evaluateGovernanceToolUse(toolName, "improve", {
      targetPath,
      allowedSkillRoot: skillRoot,
    });
    return decision.allowed
      ? { behavior: "allow" as const, toolUseID: options.toolUseID }
      : {
          behavior: "deny" as const,
          message: decision.reason,
          toolUseID: options.toolUseID,
        };
  };
}
```

- `execute` との差分は phase が `"improve"` のみ
- `extractTargetPath()` を共通 helper として共有

---

## 4. テストケース設計

| テストID   | 説明                                                | 入力                                                                                          | 期待値                                 |
| ---------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------- |
| TC-PATH-01 | skill root 外の Write → deny                        | `input = { file_path: "/outside/path/file.ts" }`, `skillRoot = "/allowed/skills"`             | `deny`                                 |
| TC-PATH-02 | skill root 内の Write → allow                       | `input = { file_path: "/allowed/skills/my-skill/SKILL.md" }`, `skillRoot = "/allowed/skills"` | `allow`                                |
| TC-PATH-03 | context なし（input にパスがない）→ tool-level 判定 | `input = {}`                                                                                  | `allow`（Write は execute で allowed） |
| TC-PATH-04 | `input.path` キー（`file_path` なし）からの抽出     | `input = { path: "/outside/path/file.ts" }`                                                   | `deny`                                 |
| TC-PATH-05 | `improve` phase での path-scoped deny               | `improve` phase callback, `input = { file_path: "/outside/path" }`                            | `deny`                                 |
| TC-PATH-06 | skill root が未設定（empty string）の場合           | `skillRoot = ""`                                                                              | `allow`（context なし扱い）            |

---

## 5. 設計上の決定事項

1. **`evaluateContextPolicy()` は改変禁止**: 実装・テスト済みのため配線層のみを修正
2. **`extractTargetPath()` は private helper**: execute と improve で共有
3. **空文字列 skillRoot は context なし扱い**: falsy check で `evaluateContextPolicy` がスキップ
4. **`improve` の `canUseTool` は method として提供**: 現状の `improve()` は sendChat() のため SDK callback 非適用だが、method として実装し TC-PATH-05 で検証

---

## 完了確認

- [x] `createExecuteGovernanceCanUseTool(skillRoot: string)` の設計完了
- [x] `targetPath` 抽出ロジック（`file_path ?? path` fallback）設計完了
- [x] `skillRoot` の取得・受け渡し方法設計完了
- [x] `improve` phase の対応方針決定
- [x] TC-PATH-01〜TC-PATH-06 テストケース設計完了
