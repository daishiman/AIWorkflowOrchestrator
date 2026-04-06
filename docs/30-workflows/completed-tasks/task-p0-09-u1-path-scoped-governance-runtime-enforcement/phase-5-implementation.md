# Phase 5: 実装（Green）

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 5                                          |
| Phase名    | 実装（Green）                              |
| 前提Phase  | Phase 4                                    |
| 後続Phase  | Phase 6                                    |
| ステータス | 完了                                       |
| 作成日     | 2026-04-06                                 |
| 機能名     | path-scoped-governance-runtime-enforcement |

---

## 目的

Phase 4 で作成した失敗テストを通す実装を行い、TDD Green 状態にする。

---

## 実装計画

### 新規作成ファイル

なし（既存ファイルの修正のみ）

### 修正ファイル

| ファイル                     | パス                                                                  | 変更内容                                 |
| ---------------------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| RuntimeSkillCreatorFacade.ts | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `createExecuteGovernanceCanUseTool` 修正 |

---

## 実行タスク

### タスク1: `createExecuteGovernanceCanUseTool` の修正

**目的**: `skillRoot` パラメータ追加と `targetPath` 抽出配線を実装する

**実装制約**:

- `SkillCreatorPermissionPolicy.evaluateContextPolicy()` は**改変禁止**（実装・テスト済み）
- 配線層（`RuntimeSkillCreatorFacade`）のみを修正する

**変更内容（Before/After）**:

Before:

```typescript
private createExecuteGovernanceCanUseTool() {
  return async (
    toolName: string,
    _input: Record<string, unknown>,  // ← 使っていない
    options: { toolUseID: string },
  ) => {
    const decision = evaluateGovernanceToolUse(toolName, "execute");
    // ↑ context 引数なし
    ...
  };
}
```

After:

```typescript
private extractTargetPath(input: Record<string, unknown>): string | undefined {
  const filePath =
    typeof input.file_path === "string" ? input.file_path : undefined;
  const pathValue =
    typeof input.path === "string" ? input.path : undefined;

  return filePath ?? pathValue;
}

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

**実行手順**:

1. `RuntimeSkillCreatorFacade.ts` を読み込み、現在の実装を確認する
2. `createExecuteGovernanceCanUseTool()` に `skillRoot: string` パラメータを追加する
3. `_input` を `input` に変更し、`targetPath` 抽出ロジックを追加する
4. `evaluateGovernanceToolUse(toolName, "execute", { targetPath, allowedSkillRoot: skillRoot })` に接続する
5. 呼び出し元の `execute()` メソッドで `skillRoot` を取得して渡すよう修正する

**期待される成果物**:

- 修正済み `RuntimeSkillCreatorFacade.ts`

### タスク2: `improve` phase の同様修正

**目的**: `createImproveGovernanceCanUseTool()` にも execute と同じ path-scoped 接続を行う

**実行手順**:

1. Phase 2 の設計決定に従い、`improve` phase も今回の修正範囲に含める
2. `createImproveGovernanceCanUseTool()` を追加または修正し、`skillRoot` と `targetPath` を execute と同じ方針で接続する
3. 共通 helper を切り出し、`extractTargetPath(input)` を `execute` / `improve` で共有する

**期待される成果物**:

- 修正済み実装（設計決定に従う）

### タスク3: TDD Green 確認

**目的**: Phase 4 で作成した失敗テストが PASS することを確認する

```bash
# path-scoped テスト実行
cd apps/desktop && npx vitest run src/main/services/runtime/__tests__/governance/path-scoped-enforcement.test.ts

# 既存 governance テスト全件実行
cd apps/desktop && npx vitest run src/main/services/runtime/__tests__/governance/
```

**確認項目**:

- [ ] TC-PATH-01〜TC-PATH-03 が PASS する（Green状態）
- [ ] 既存 90 件テストが引き続き PASS する

**期待される成果物**:

- テスト PASS の確認記録

---

## TDD サイクル確認

```bash
cd apps/desktop && npx vitest run src/main/services/runtime/__tests__/governance/
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 参照資料

| 参照資料                  | パス                                                                                          | 内容                 |
| ------------------------- | --------------------------------------------------------------------------------------------- | -------------------- |
| Phase 2 設計              | `outputs/phase-2/design.md`                                                                   | 実装方針             |
| Phase 4 テスト            | `apps/desktop/src/main/services/runtime/__tests__/governance/path-scoped-enforcement.test.ts` | 通すべきテスト       |
| CanUseToolContext 型定義  | `apps/desktop/src/main/services/runtime/governance/SkillCreatorPermissionPolicy.ts`           | 型定義               |
| evaluateGovernanceToolUse | `apps/desktop/src/main/services/runtime/governance/index.ts`                                  | 関数インターフェース |

---

## 成果物

| 成果物                       | パス                                                                  | 内容             |
| ---------------------------- | --------------------------------------------------------------------- | ---------------- |
| RuntimeSkillCreatorFacade.ts | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 修正済みファイル |
| テスト PASS 確認記録         | `outputs/phase-5/test-results.txt`                                    | vitest 出力記録  |

---

## 統合テスト連携

フロント/バック接続の実装とテスト支援コード整備（governance callback 接続）を行う。

---

## 完了条件

- [ ] `createExecuteGovernanceCanUseTool(skillRoot: string)` の修正が完了している
- [ ] `targetPath` 抽出ロジック（`file_path ?? path` fallback）が実装されている
- [ ] `evaluateGovernanceToolUse` に context が渡されている
- [ ] `improve` phase の対応方針（Phase 2 設計）に従った実装が完了している
- [ ] TC-PATH-01〜TC-PATH-03 が PASS している（Green状態）
- [ ] 既存 90 件テストが引き続き PASS している
- [ ] TypeScript 型エラーが発生していない
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4 が完了していること（失敗テスト作成済み）
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-6-test-expansion.md`
