# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 8                                                |
| 名称       | リファクタリング                                 |
| タスクID   | TASK-P0-09                                       |
| ステータス | 未実施                                           |
| 依存       | Phase 7 完了                                     |
| 完了条件   | リファクタリング後も全テストが PASS していること |

---

## 目的

Phase 5〜6 で実装したコードの設計品質を高める。
重複の除去・命名の統一・コメントの整理を行い、保守性を向上させる。
**テストの動作は変えない**（リファクタリング原則）。

---

## 実行タスク

### T-08-1: 命名規則の統一確認

Phase 1 で記録した命名規則との整合を全ファイルで確認する。

**確認観点**:

- 定数: `SCREAMING_SNAKE_CASE`（READ_TOOLS, WRITE_TOOLS, TEST_TOOLS, IMPROVE_TOOLS, DESTRUCTIVE_TOOLS）
- 関数: `camelCase`（getPolicy, canUseTool, getAllPolicies, evaluateContextPolicy, createHooks, recordEvent...）
- クラス: `PascalCase`（SkillCreatorAuditSink）
- インターフェース: `PascalCase`（SkillCreatorHooks, CanUseToolContext）
- 型: `PascalCase`（SkillCreatorGovernancePhase, SkillCreatorSdkPolicy...）

```bash
# 命名規則チェック（lint で部分的に自動検証可能）
pnpm --filter @repo/desktop lint
```

**変更前/後記録形式**（Feedback RT-03 準拠）:

| 対象                 | Before | After | 理由 |
| -------------------- | ------ | ----- | ---- |
| （変更があれば記録） |        |       |      |

**完了条件**:

- [ ] 全ファイルの命名規則が統一されている
- [ ] 変更した箇所が Before/After テーブルで記録されている

---

### T-08-2: コードの重複除去

**重複確認観点**:

1. **policy evaluation の重複**: `canUseTool()` と `createExecuteGovernanceCanUseTool()` で同一ロジックが重複していないか
   - 現状: `createExecuteGovernanceCanUseTool()` が `evaluateGovernanceToolUse(toolName, "execute")` を呼んでいる
   - これは適切な委譲なので重複ではない

2. **session 開始/終了パターンの重複**: 各 phase（plan/execute/verify/improve）で `onSessionStart` / `onSessionEnd` を呼ぶパターンが重複している
   - リファクタリング検討: `withGovernanceSession(phase, sessionId, fn)` のようなヘルパーに抽出できるか
   - **判断**: `RuntimeSkillCreatorFacade.ts` は既に大きいため、今回は抽出せず TODO コメントに留める

3. **auditSink.recordEvent の引数重複**: 各 hooks で `sessionId` / `phase` を毎回渡す
   - `createHooks` でクロージャとしてキャプチャするのが現状の設計（適切）

**完了条件**:

- [ ] 重複の有無が確認されており、除去方針が記録されている
- [ ] 重複を除去した場合は Before/After テーブルで記録されている

---

### T-08-3: コメントの整理

**確認観点**:

- 各ファイルのクラス/関数 JSDoc が設計意図を正しく説明しているか
- U1 carry-forward の TODO コメントが適切な位置に記載されているか
- セキュリティ判断（hooks をコード側に固定する理由）がコメントで説明されているか
- `_input` の未使用に関する TODO(human) または U1 carry-forward コメントが記載されているか

**必須コメント確認**:

```typescript
// SkillCreatorPermissionPolicy.ts
// - POLICY_TABLE への Object.freeze の理由
// - evaluateContextPolicy の TODO(U1): path-scoped enforcement はTASK-P0-09-U1で実装

// SkillCreatorHooksFactory.ts
// - hooks をコード側に固定する理由（manifest 破損時の governance 無効化リスク回避）

// SkillCreatorAuditSink.ts
// - 永続化（ファイル/DB）は将来スコープの TODO コメント

// RuntimeSkillCreatorFacade.ts
// - createExecuteGovernanceCanUseTool の _input 未使用: TASK-P0-09-U1 carry-forward コメント
```

**完了条件**:

- [ ] 必須コメントが全て記載されている
- [ ] U1 carry-forward の TODO コメントが適切な場所に記載されている

---

### T-08-4: リファクタリング後の全テスト実行

```bash
# 全テスト実行でリグレッションがないことを確認
pnpm --filter @repo/desktop test -- --grep "governance|SkillCreatorPermission|SkillCreatorHooks|SkillCreatorAudit" --run

# 型チェック・lint
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

**完了条件**:

- [ ] 全テストが PASS している（リグレッションなし）
- [ ] typecheck / lint がエラーなし

---

## 参照資料

- `phase-7-coverage-check.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/task-specification-creator/references/phase-template-phase12.md`

---

## 成果物

| 成果物名                       | パス                                               | 必須 |
| ------------------------------ | -------------------------------------------------- | ---- |
| リファクタリング変更記録       | `outputs/phase-8/refactoring-changes.md`           | ✅   |
| テスト実行結果（リファクタ後） | `outputs/phase-8/test-result-after-refactoring.md` | ✅   |

---

## 完了条件チェックリスト

- [ ] 命名規則が全ファイルで統一されている
- [ ] 重複コードの有無が確認・対応されている
- [ ] 必須コメント（U1 carry-forward / セキュリティ判断 / 将来スコープ）が記載されている
- [ ] リファクタリング変更が Before/After テーブルで記録されている
- [ ] リファクタリング後も全テストが PASS している
- [ ] typecheck / lint がエラーなし
- [ ] `outputs/phase-8/` に全成果物が配置されている
