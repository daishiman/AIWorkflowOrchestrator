# Phase 2: 設計

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 2                                          |
| Phase名    | 設計                                       |
| 前提Phase  | Phase 1                                    |
| 後続Phase  | Phase 3                                    |
| ステータス | 完了                                       |
| 作成日     | 2026-04-06                                 |
| 機能名     | path-scoped-governance-runtime-enforcement |

---

## 目的

変更箇所と影響範囲を設計し、実装方針を確定する。

---

## 実行タスク

### タスク1: `createExecuteGovernanceCanUseTool` 設計

**目的**: `skillRoot: string` パラメータ追加と `targetPath` 抽出ロジックを設計する

**実行手順**:

1. Phase 1 の gap-analysis.md を参照し、現状実装を確認する
2. `createExecuteGovernanceCanUseTool(skillRoot: string)` のシグネチャ変更を設計する
3. `input` からの `targetPath` 抽出ロジックを設計する（`input?.file_path ?? input?.path`）
4. `allowedSkillRoot` として `skillRoot` を渡す配線を設計する
5. `improve` phase への同様の接続設計を決定する（`execute` と共通 helper で扱う）

**設計イメージ**:

```typescript
// 修正後のイメージ
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

**期待される成果物**:

- 設計方針の記録

### タスク2: `skillRoot` 取得・受け渡し設計

**目的**: `execute()` から `createExecuteGovernanceCanUseTool()` への `skillRoot` 受け渡しを設計する

**実行手順**:

1. `execute()` メソッドの現在のシグネチャを確認する
2. `skillRoot` の取得方法を確定する（`this.getExplicitSkillCreatorRoot()` 等）
3. `skillRoot` が未定義の場合のフォールバックを設計する（context なし扱い）

**期待される成果物**:

- `skillRoot` 受け渡し設計の記録

### タスク3: `improve` phase 対応設計

**目的**: `improve` phase でも execute と同じ path-scoped deny を有効化する設計を確定する

**実行手順**:

1. `createImproveGovernanceCanUseTool()` の有無を確認する
2. `execute` と `improve` で重複するロジックを共通 helper 化する設計を決定する
3. `improve` phase も今回の修正範囲に含める前提で設計決定を記録する

**期待される成果物**:

- `improve` phase 対応方針の記録

### タスク4: テストケース設計

**目的**: Phase 4 で実装するテストケースの構造を事前に設計する

**テストケース設計**:
| テストID | 説明 | 期待値 |
| ---------- | -------------------------------------------------- | ------- |
| TC-PATH-01 | skill root 外の Write → `deny` が返る | deny |
| TC-PATH-02 | skill root 内の Write → `allow` が返る | allow |
| TC-PATH-03 | context なし（input にパスがない）→ tool-level 判定 | allow/deny（tool-level） |
| TC-PATH-04 | `input.path` キー（`file_path` なし）からの抽出 | deny/allow（パスに依存） |
| TC-PATH-05 | `improve` phase での path-scoped deny | deny |
| TC-PATH-06 | skill root が未設定（empty string）の場合の動作 | context なし扱い |

**期待される成果物**:

- テストケース設計一覧

---

## 参照資料

| 参照資料                  | パス                                                                                | 内容                 |
| ------------------------- | ----------------------------------------------------------------------------------- | -------------------- |
| Phase 1 成果物            | `outputs/phase-1/gap-analysis.md`                                                   | 現状調査・要件       |
| CanUseToolContext 定義    | `apps/desktop/src/main/services/runtime/governance/SkillCreatorPermissionPolicy.ts` | 型定義確認           |
| evaluateGovernanceToolUse | `apps/desktop/src/main/services/runtime/governance/index.ts`                        | 関数インターフェース |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                              | 内容             |
| ---------------- | ----------------------------------------------------------------- | ---------------- |
| セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-*.md` | セキュリティ要件 |

---

## 成果物

| 成果物    | パス                        | 内容                       |
| --------- | --------------------------- | -------------------------- |
| design.md | `outputs/phase-2/design.md` | 設計方針・テストケース設計 |

---

## 統合テスト連携

統合ポイント（`canUseTool` callback と governance policy の接続契約）を設計に反映する。

---

## 完了条件

- [ ] `createExecuteGovernanceCanUseTool(skillRoot: string)` の設計が完了している
- [ ] `targetPath` 抽出ロジックが設計されている（`file_path ?? path` fallback）
- [ ] `skillRoot` の取得・受け渡し方法が設計されている
- [ ] `improve` phase の対応方針が決定されている
- [ ] TC-PATH-01〜TC-PATH-06 のテストケース設計が完了している
- [ ] `outputs/phase-2/design.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-3-design-review.md`
