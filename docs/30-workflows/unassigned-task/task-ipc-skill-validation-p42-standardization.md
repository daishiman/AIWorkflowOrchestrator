# skillHandlers P42準拠バリデーション横展開 - タスク指示書

## メタ情報

```yaml
issue_number: 844
```

## メタ情報

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| タスクID     | UT-FIX-SKILL-VALIDATION-P42-001                        |
| タスク名     | skillHandlers P42準拠バリデーション横展開              |
| 分類         | 改善                                                   |
| 対象機能     | スキル管理IPCハンドラバリデーション                    |
| 優先度       | 中                                                     |
| 見積もり規模 | 小規模                                                 |
| ステータス   | 未実施                                                 |
| 発見元       | UT-FIX-SKILL-REMOVE-INTERFACE-001 実装時（2026-02-20） |
| 発見日       | 2026-02-20                                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-FIX-SKILL-REMOVE-INTERFACE-001 の実装において、`skill:remove` ハンドラに P42 準拠の3段バリデーション（型チェック → 空文字列チェック → `.trim()` 空文字列チェック）を追加した。しかし、同じ `skillHandlers.ts` 内の他の6ハンドラには、依然として `.trim()` チェックが欠落しているバリデーションパターンが残存している。

修正済みのハンドラ（`skill:remove`, `skill:optimize`, `skill:optimize:variants`, `skill:optimize:evaluate`）と未修正のハンドラが混在する「バリデーション一貫性の欠如」状態にある。

### 1.2 問題点・課題

`apps/desktop/src/main/ipc/skillHandlers.ts` の以下6ハンドラに、P42 準拠の `.trim()` バリデーションが欠落している：

| ハンドラ           | 行番号（参考） | 現在のバリデーション                     | P42 違反箇所                                        |
| ------------------ | -------------- | ---------------------------------------- | --------------------------------------------------- |
| `skill:get-detail` | 164-173        | `typeof args?.skillId !== "string"` のみ | `.trim()` なし、空文字列チェック（`=== ""`）なし    |
| `skill:execute`    | 197-205        | `args.skillId === ""`                    | `.trim()` なし（スペースのみの入力 `"   "` が通過） |
| `skill:abort`      | 227-234        | `executionId === ""`                     | `.trim()` なし                                      |
| `skill:get-status` | 247-258        | `executionId === ""`                     | `.trim()` なし                                      |
| `skill:analyze`    | 278-288        | `args.skillName === ""`                  | `.trim()` なし                                      |
| `skill:improve`    | 308-318        | `args.skillName === ""`                  | `.trim()` なし                                      |

### 1.3 放置した場合の影響

1. **セキュリティリスク**: スペースのみの入力（`"   "`）やタブ・改行のみの入力（`"\t\n"`）がバリデーションを通過し、サービス層に不正な値が到達する。サービス層でエラーが発生するが、IPC層での早期拒否（fail-fast）ができていない
2. **コードの一貫性低下**: 同一ファイル内で修正済みハンドラと未修正ハンドラが混在し、新規開発者がどちらのパターンに従うべきか判断に迷う
3. **デバッグの困難化**: IPC層で弾けるはずの不正入力がサービス層まで到達し、エラーメッセージが不明確になる（例: `"   "` を渡すとファイルシステムエラーで失敗するが、原因がバリデーション漏れだと気付きにくい）

---

## 2. 何を達成するか（What）

### 2.1 目的

`skillHandlers.ts` 内の全文字列引数バリデーションを P42 準拠の3段バリデーションに統一し、IPCハンドラ層でのバリデーション一貫性を確保する。

### 2.2 最終ゴール

- 6ハンドラ全てに `.trim() === ""` チェックを追加
- 各ハンドラのテストにスペースのみの入力（`"   "`）を拒否するテストケースを追加
- 既存テストが全て PASS すること

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/main/ipc/skillHandlers.ts` の6ハンドラのバリデーション修正
- `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` への P42 テストケース追加
- 修正済みの `skill:remove` パターンとの一貫性検証

#### 含まないもの

- `skill:import` ハンドラの修正（配列バリデーションであり、文字列 `.trim()` とは異なるパターン）
- `skill:list`, `skill:scan`, `skill:getImported` の修正（文字列引数を受け取らないため対象外）
- 引数名の `skillId` → `skillName` 統一（P46 パターン。本タスクのスコープ外。独立タスクとして管理すべき）
- サービス層のバリデーション変更
- Preload 層の変更

### 2.4 成果物

| 成果物           | パス                                                        |
| ---------------- | ----------------------------------------------------------- |
| 修正済みハンドラ | `apps/desktop/src/main/ipc/skillHandlers.ts`                |
| テストコード     | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `skill:remove` ハンドラの P42 準拠修正が完了していること（UT-FIX-SKILL-REMOVE-INTERFACE-001）
- `skill:optimize*` 系ハンドラの P42 準拠修正が完了していること（TASK-9A-B）

### 3.2 依存タスク

| タスクID                          | 内容                              | ステータス |
| --------------------------------- | --------------------------------- | ---------- |
| UT-FIX-SKILL-REMOVE-INTERFACE-001 | skill:remove インターフェース修正 | 完了       |
| TASK-9A-B                         | SkillFileManager IPC ハンドラ実装 | 完了       |

### 3.3 必要な知識

- P42 パターン（3段バリデーション）: `06-known-pitfalls.md` P42 セクション
- IPC セキュリティ原則: `04-electron-security.md`
- Vitest テスト実行: モノレポ環境でのテスト実行は `cd apps/desktop` が必須（P40）

### 3.4 推奨アプローチ

P42 準拠の3段バリデーションパターンを、修正済み `skill:remove` ハンドラを参考に6ハンドラへ横展開する。

**Before（現在のバリデーション）:**

```typescript
// skill:get-detail — 空文字列チェックなし
if (typeof args?.skillId !== "string") {
  return { success: false, error: "skillId must be a string" };
}

// skill:execute — .trim() なし
if (typeof args?.skillId !== "string" || args.skillId === "") {
  return { success: false, error: "skillId must be a string" };
}

// skill:abort / skill:get-status — .trim() なし
if (typeof executionId !== "string" || executionId === "") {
  return false; // or null
}

// skill:analyze / skill:improve — .trim() なし
if (typeof args?.skillName !== "string" || args.skillName === "") {
  return { success: false, error: "スキル名が指定されていません" };
}
```

**After（P42 準拠3段バリデーション）:**

```typescript
// skill:get-detail — 3段バリデーション追加
if (typeof args?.skillId !== "string" || args.skillId.trim() === "") {
  return { success: false, error: "skillId must be a non-empty string" };
}

// skill:execute — .trim() 追加
if (typeof args?.skillId !== "string" || args.skillId.trim() === "") {
  return { success: false, error: "skillId must be a non-empty string" };
}

// skill:abort — .trim() 追加
if (typeof executionId !== "string" || executionId.trim() === "") {
  return false;
}

// skill:get-status — .trim() 追加
if (typeof executionId !== "string" || executionId.trim() === "") {
  return null;
}

// skill:analyze — .trim() 追加
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
  return { success: false, error: "スキル名が指定されていません" };
}

// skill:improve — .trim() 追加
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
  return { success: false, error: "スキル名が指定されていません" };
}
```

### 3.5 実装課題と解決策（親タスクからの教訓）

#### 課題1: エラー応答パターンの不統一（P44 派生）

**問題**: 6ハンドラのバリデーション失敗時のエラー応答パターンが統一されていない。

| ハンドラ           | バリデーション失敗時の応答                |
| ------------------ | ----------------------------------------- |
| `skill:get-detail` | `return { success: false, error: "..." }` |
| `skill:execute`    | `return { success: false, error: "..." }` |
| `skill:abort`      | `return false`                            |
| `skill:get-status` | `return null`                             |
| `skill:analyze`    | `return { success: false, error: "..." }` |
| `skill:improve`    | `return { success: false, error: "..." }` |

**解決策**: 本タスクでは各ハンドラの既存の応答パターンを維持し、`.trim()` チェックの追加のみ行う。エラー応答パターンの統一は別タスク（UT-FIX-IPC-RESPONSE-PATTERN-003 等）のスコープとする。理由は、応答パターンの変更は呼び出し元（Renderer 側）への影響があるため、`.trim()` 追加とは分離して対応すべきだからである。

#### 課題2: テスト実行ディレクトリ依存（P40）

**問題**: モノレポ環境でプロジェクトルートからテストを実行すると、`apps/desktop/vitest.config.ts` の `environment` 設定と `setupFiles` が読み込まれず `document is not defined` エラーが発生する。

**解決策**: テスト実行は必ず以下のいずれかの方法で行う：

```bash
# 方法1: ディレクトリを移動して実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts

# 方法2: pnpm filter を使用
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.test.ts
```

#### 課題3: API 二重定義の型管理複雑性（P23）

**問題**: IPC ハンドラの引数型を変更する場合、`packages/shared/src/agent/types.ts` と `apps/desktop/src/preload/types.ts` の両方を同時に更新する必要がある。

**解決策**: 本タスクではハンドラの引数型自体は変更しない（`.trim()` チェックの追加のみ）。型定義ファイルの変更は不要であるため、P23 の影響は受けない。ただし、引数型変更を伴う修正を行う場合は P23/P32 に従い3箇所同時更新（ハンドラ・Preload API・テスト）を行う。

#### 課題4: P45 パターン（引数命名の契約ドリフト）への対応判断

**問題**: `skill:get-detail` と `skill:execute` は引数名が `skillId` だが、実際に渡される値がスキルIDなのかスキル名なのかが不明確。

**解決策**: 本タスクでは引数名の変更は行わない。`.trim()` バリデーション追加のみにスコープを限定する。引数名の `skillId` → `skillName` 統一は P46 パターンとして別タスクで管理する。

---

## 4. 実行手順

### Phase 構成

本タスクは小規模改善であるため、簡略化した Phase 構成を使用する。

| Phase | 名称       | 内容                             |
| ----- | ---------- | -------------------------------- |
| 4     | テスト作成 | 6ハンドラの P42 テストケース追加 |
| 5     | 実装       | `.trim()` チェックの追加         |
| 9     | 品質検証   | Lint・型チェック・全テスト実行   |

### 各 Phase 詳細

#### Phase 4: テスト作成

`apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` に以下のテストケースを追加する。各ハンドラに対し、修正済み `skill:remove` の SH-RM-05（スペースのみ拒否）と SH-RM-10（タブ改行のみ拒否）を参考にテストを作成する。

**追加テストケース一覧:**

| テストID | ハンドラ         | 内容                                  |
| -------- | ---------------- | ------------------------------------- |
| SH-GD-04 | skill:get-detail | スペースのみの skillId を拒否する     |
| SH-GD-05 | skill:get-detail | 空文字列の skillId を拒否する         |
| SH-EX-01 | skill:execute    | スペースのみの skillId を拒否する     |
| SH-AB-01 | skill:abort      | スペースのみの executionId を拒否する |
| SH-GS-01 | skill:get-status | スペースのみの executionId を拒否する |
| SH-AN-01 | skill:analyze    | スペースのみの skillName を拒否する   |
| SH-IM-01 | skill:improve    | スペースのみの skillName を拒否する   |

**テスト実装例（skill:get-detail）:**

```typescript
it("SH-GD-04: should reject whitespace-only skillId (P42)", async () => {
  const handler = handlers.get("skill:get-detail");
  if (!handler) {
    throw new Error("skill:get-detail handler not registered");
  }

  // When: スペースのみの文字列を渡す
  const result = await handler({}, { skillId: "   " });

  // Then: バリデーションエラーが返される
  const opResult = result as OperationResult<Skill>;
  expect(opResult.success).toBe(false);
  expect(opResult.error).toBeDefined();
});

it("SH-GD-05: should reject empty skillId", async () => {
  const handler = handlers.get("skill:get-detail");
  if (!handler) {
    throw new Error("skill:get-detail handler not registered");
  }

  // When: 空文字列を渡す
  const result = await handler({}, { skillId: "" });

  // Then: バリデーションエラーが返される
  const opResult = result as OperationResult<Skill>;
  expect(opResult.success).toBe(false);
  expect(opResult.error).toBeDefined();
});
```

**テスト実装例（skill:abort — 戻り値が `false` のパターン）:**

```typescript
it("SH-AB-01: should reject whitespace-only executionId (P42)", async () => {
  const handler = handlers.get("skill:abort");
  if (!handler) {
    throw new Error("skill:abort handler not registered");
  }

  // When: スペースのみの文字列を渡す
  const result = await handler({}, "   ");

  // Then: falseが返される
  expect(result).toBe(false);
});
```

#### Phase 5: 実装

`apps/desktop/src/main/ipc/skillHandlers.ts` の6ハンドラに `.trim() === ""` チェックを追加する。

**修正箇所一覧:**

1. **skill:get-detail**（行173）:

   ```typescript
   // Before
   if (typeof args?.skillId !== "string") {
   // After
   if (typeof args?.skillId !== "string" || args.skillId.trim() === "") {
   ```

2. **skill:execute**（行205）:

   ```typescript
   // Before
   if (typeof args?.skillId !== "string" || args.skillId === "") {
   // After
   if (typeof args?.skillId !== "string" || args.skillId.trim() === "") {
   ```

3. **skill:abort**（行234）:

   ```typescript
   // Before
   if (typeof executionId !== "string" || executionId === "") {
   // After
   if (typeof executionId !== "string" || executionId.trim() === "") {
   ```

4. **skill:get-status**（行258）:

   ```typescript
   // Before
   if (typeof executionId !== "string" || executionId === "") {
   // After
   if (typeof executionId !== "string" || executionId.trim() === "") {
   ```

5. **skill:analyze**（行288）:

   ```typescript
   // Before
   if (typeof args?.skillName !== "string" || args.skillName === "") {
   // After
   if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
   ```

6. **skill:improve**（行318）:
   ```typescript
   // Before
   if (typeof args?.skillName !== "string" || args.skillName === "") {
   // After
   if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
   ```

#### Phase 9: 品質検証

以下のコマンドを順番に実行し、全て PASS することを確認する：

```bash
# 1. テスト実行（P40 準拠: apps/desktop から実行）
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts

# 2. 型チェック
pnpm --filter @repo/desktop exec tsc --noEmit

# 3. Lint
pnpm --filter @repo/desktop exec eslint src/main/ipc/skillHandlers.ts
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `skill:get-detail` のバリデーションに `.trim() === ""` チェックが追加されている
- [ ] `skill:execute` のバリデーションに `.trim() === ""` チェックが追加されている
- [ ] `skill:abort` のバリデーションに `.trim() === ""` チェックが追加されている
- [ ] `skill:get-status` のバリデーションに `.trim() === ""` チェックが追加されている
- [ ] `skill:analyze` のバリデーションに `.trim() === ""` チェックが追加されている
- [ ] `skill:improve` のバリデーションに `.trim() === ""` チェックが追加されている
- [ ] スペースのみの入力（`"   "`）が全6ハンドラで拒否される
- [ ] タブ・改行のみの入力（`"\t\n"`）が全6ハンドラで拒否される

### 品質要件

- [ ] 全テストが PASS する
- [ ] TypeScript 型チェックが PASS する
- [ ] ESLint が PASS する
- [ ] 既存テストの変更がないこと（テスト追加のみ）

### ドキュメント要件

- [ ] 本タスク仕様書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` の残課題テーブルに登録されている

---

## 6. 検証方法

### テストケース

| テストID | ハンドラ         | 入力                   | 期待結果                           |
| -------- | ---------------- | ---------------------- | ---------------------------------- |
| SH-GD-04 | skill:get-detail | `{ skillId: "   " }`   | `{ success: false, error: "..." }` |
| SH-GD-05 | skill:get-detail | `{ skillId: "" }`      | `{ success: false, error: "..." }` |
| SH-EX-01 | skill:execute    | `{ skillId: "   " }`   | `{ success: false, error: "..." }` |
| SH-AB-01 | skill:abort      | `"   "`                | `false`                            |
| SH-GS-01 | skill:get-status | `"   "`                | `null`                             |
| SH-AN-01 | skill:analyze    | `{ skillName: "   " }` | `{ success: false, error: "..." }` |
| SH-IM-01 | skill:improve    | `{ skillName: "   " }` | `{ success: false, error: "..." }` |

### 検証手順

1. テストファーストで7つのテストケースを追加し、Red 状態を確認する
2. 6ハンドラのバリデーションを修正し、Green 状態を確認する
3. 既存テストが全て PASS することを確認する
4. `pnpm --filter @repo/desktop exec tsc --noEmit` で型チェック PASS を確認する
5. `pnpm --filter @repo/desktop exec eslint src/main/ipc/skillHandlers.ts` で Lint PASS を確認する

---

## 7. リスクと対策

| リスク                                                                    | 影響度 | 対策                                                                              |
| ------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------- |
| `skill:abort` / `skill:get-status` の戻り値変更による Renderer 側への影響 | 低     | 戻り値パターンは変更しない（`false` / `null` を維持）。`.trim()` チェック追加のみ |
| 既存テストとの干渉                                                        | 低     | テスト追加のみ行い、既存テストの変更は行わない                                    |
| P40（テスト実行ディレクトリ依存）による偽の失敗                           | 中     | `cd apps/desktop` からテストを実行する                                            |
| P11（PostToolUse フックによる Edit 失敗）                                 | 低     | 大量編集後は `git diff --stat` で変更数を検証する                                 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                | パス                                                                              | 参照理由                                         |
| --------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------ |
| P42 パターン                | `.claude/rules/06-known-pitfalls.md#P42`                                          | 3段バリデーションの標準パターン                  |
| P44 パターン                | `.claude/rules/06-known-pitfalls.md#P44`                                          | skill:import/remove インターフェース不整合の教訓 |
| P45 パターン                | `.claude/rules/06-known-pitfalls.md#P45`                                          | 参照ドリフトの教訓                               |
| P40 パターン                | `.claude/rules/06-known-pitfalls.md#P40`                                          | テスト実行ディレクトリ依存の教訓                 |
| P23 パターン                | `.claude/rules/06-known-pitfalls.md#P23`                                          | API 二重定義の型管理複雑性の教訓                 |
| IPC セキュリティ原則        | `.claude/rules/04-electron-security.md`                                           | IPC バリデーション原則                           |
| スキル IPC 仕様             | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | セキュリティ要件の正本                           |
| スキル SDK インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | インターフェース定義の正本                       |
| IPC 契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | IPC 契約検証の手順                               |

### 参考資料

| 資料                             | 参照理由                                                    |
| -------------------------------- | ----------------------------------------------------------- |
| `skill:remove` の P42 修正実装   | `skillHandlers.ts` 行150-156 — 修正パターンの参考実装       |
| `skill:optimize` の P42 修正実装 | `skillHandlers.ts` 行351 — `.trim()` チェック済みの参考実装 |
| `skill:remove` テスト SH-RM-05   | `skillHandlers.test.ts` — スペースのみ拒否テストの参考      |
| `skill:remove` テスト SH-RM-10   | `skillHandlers.test.ts` — タブ改行のみ拒否テストの参考      |

---

## 9. 備考

- 本タスクは `.trim()` チェックの追加のみに限定する。エラー応答パターンの統一（`throw` vs `return { success: false }`）は別タスク（UT-FIX-7-1-003 等）のスコープである
- 引数名の `skillId` → `skillName` 統一（P46 パターン）も別タスクとして管理する。本タスクでは既存の引数名を維持する
- `skill:get-detail` は他の5ハンドラと異なり、空文字列チェック自体が欠落しているため、`=== ""` と `.trim() === ""` の両方を1つの条件式で追加する
- `skill:abort` と `skill:get-status` は引数が直接 `string` 型で渡される（オブジェクトラップなし）。`skill:remove` と同じパターンである
