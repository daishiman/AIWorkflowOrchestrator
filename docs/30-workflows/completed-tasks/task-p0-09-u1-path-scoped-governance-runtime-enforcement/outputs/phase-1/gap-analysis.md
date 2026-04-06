# Phase 1: 現状調査・要件定義 — gap-analysis.md

## 1. 現状コード調査

### createExecuteGovernanceCanUseTool() 現行実装（RuntimeSkillCreatorFacade.ts:328-344）

```typescript
private createExecuteGovernanceCanUseTool() {
  return async (
    toolName: string,
    _input: Record<string, unknown>,  // ← 未使用（_ prefix）
    options: { toolUseID: string },
  ) => {
    const decision = evaluateGovernanceToolUse(toolName, "execute");
    // ↑ context 引数なし → path-scoped 判定が発動しない
    if (decision.allowed) {
      return { behavior: "allow" as const, toolUseID: options.toolUseID };
    }
    return {
      behavior: "deny" as const,
      message: decision.reason,
      toolUseID: options.toolUseID,
    };
  };
}
```

**問題点**:

- `_input` が未使用 → `file_path`/`path` から `targetPath` を抽出していない
- `evaluateGovernanceToolUse(toolName, "execute")` に context を渡していない
- `SkillCreatorPermissionPolicy.evaluateContextPolicy()` が持つ path-scoped deny が発動しない

### skillRoot 取得方法

`getExplicitSkillCreatorRoot()` (RuntimeSkillCreatorFacade.ts:764-769):

```typescript
private getExplicitSkillCreatorRoot(): string | undefined {
  return this.resourceLoader &&
    typeof this.resourceLoader.getBasePath === "function"
    ? this.resourceLoader.getBasePath()
    : undefined;
}
```

- `_executeInternal()` からは `this.getExplicitSkillCreatorRoot()` で取得可能
- すでに `listSessions()` や `buildNormalizerContext()` で使用されている実績あり

### CanUseToolContext 型定義（SkillCreatorPermissionPolicy.ts:208-213）

```typescript
export interface CanUseToolContext {
  targetPath?: string;
  allowedSkillRoot?: string;
}
```

- `evaluateContextPolicy()` は既に実装済み・テスト済み → 改変禁止
- `canUseTool(toolName, phase, context?)` の第3引数として渡す

### improve phase の対応状況

- `improve()` は `llmAdapter.sendChat()` を使用（skillExecutor 不使用）
- `createImproveGovernanceCanUseTool()` は現在存在しない
- `applyImprovement()` での file write 時に path-scoped 判定が未実施
- 対応方針: `createImproveGovernanceCanUseTool(skillRoot: string)` を新規作成し、execute と同一 helper で実装する

---

## 2. 影響ファイル一覧

| ファイル                                                                                      | 変更種別 | 理由                                                                            |
| --------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                         | 修正     | createExecuteGovernanceCanUseTool 修正 + createImproveGovernanceCanUseTool 追加 |
| `apps/desktop/src/main/services/runtime/__tests__/governance/path-scoped-enforcement.test.ts` | 新規作成 | TC-PATH-01〜06                                                                  |
| `apps/desktop/src/main/services/runtime/governance/SkillCreatorPermissionPolicy.ts`           | 変更なし | 実装済み・テスト済みのため改変禁止                                              |
| `apps/desktop/src/main/services/runtime/governance/index.ts`                                  | 変更なし | export 変更なし                                                                 |

---

## 3. 命名規則

| 種別     | 規則                     | 例                                                       |
| -------- | ------------------------ | -------------------------------------------------------- |
| メソッド | camelCase                | `createExecuteGovernanceCanUseTool`, `extractTargetPath` |
| テストID | `TC-PATH-XX` 形式        | TC-PATH-01, TC-PATH-02                                   |
| describe | メソッド名またはクラス名 | `createExecuteGovernanceCanUseTool`                      |
| ファイル | kebab-case.test.ts       | `path-scoped-enforcement.test.ts`                        |

---

## 4. 受入基準

| ID   | 基準                                                                              | 検証方法                                |
| ---- | --------------------------------------------------------------------------------- | --------------------------------------- |
| AC-1 | `execute` phase で skill root 外への Write/Edit が `deny` される                  | TC-PATH-01 PASS                         |
| AC-2 | `execute` phase で skill root 内への Write/Edit が `allow` される                 | TC-PATH-02 PASS                         |
| AC-3 | context が取得できない場合（`targetPath` なし）は tool-level 判定のみ（後方互換） | TC-PATH-03 PASS                         |
| AC-4 | 既存 90 件 governance tests が全 PASS                                             | `vitest run __tests__/governance/`      |
| AC-5 | TypeScript 型エラーなし                                                           | `pnpm --filter @repo/desktop typecheck` |
| AC-6 | `improve` phase で skill root 外への Edit が `deny` される                        | TC-PATH-05 PASS                         |

---

## 5. improve phase 対応方針

- `execute` と `improve` で同一 helper `extractTargetPath(input)` を共有
- `createImproveGovernanceCanUseTool(skillRoot: string)` を新規追加
- `createExecuteGovernanceCanUseTool(skillRoot: string)` と対称的な実装
- テスト TC-PATH-05 で callback の deny 動作を直接検証

---

## 完了確認

- [x] `createExecuteGovernanceCanUseTool()` 現行実装を把握
- [x] `skillRoot` の取得方法が特定済み（`getExplicitSkillCreatorRoot()`）
- [x] `CanUseToolContext` 型定義の確認済み
- [x] 命名規則が記録済み
- [x] `improve` phase の対応方針が決定済み（execute と同一 helper）
- [x] 既存 90 件テストが全 PASS 確認済み
