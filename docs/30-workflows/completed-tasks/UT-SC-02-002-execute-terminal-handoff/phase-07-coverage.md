# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 7                                     |
| タスクID | UT-SC-02-002                          |
| 機能名   | UT-SC-02-002-execute-terminal-handoff |
| 作成日   | 2026-03-23                            |

## 目的

Phase 6 完了後、カバレッジ計測を行い基準値を達成していることを確認する。基準未達の場合は Phase 6 に戻り追加テストを記述する。

## 実行タスク

1. カバレッジ付きでテストを実行する
2. Line / Branch / Function カバレッジの基準値を確認する
3. 未達の場合は未カバーブランチを特定し、Phase 6 に戻る

## 参照資料

- テストファイル: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`
- 実装ファイル: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- カバレッジ基準（`02-code-quality.md` より）:
  - Line Coverage: 最低 80%（推奨 90%）
  - Branch Coverage: 最低 60%（推奨 70%）
  - Function Coverage: 最低 80%（推奨 90%）

## 実行手順

### Step 1: カバレッジを計測する

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260323-120152-wt-5/apps/desktop
pnpm vitest run --coverage src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts
```

### Step 2: レポートを確認する

以下の形式で出力されるカバレッジレポートを確認する。

```
 % Stmts  | % Branch |  % Funcs |  % Lines | Uncovered Line #s
----------|----------|----------|----------|-----------------------
  RuntimeSkillCreatorFacade.ts
```

対象ファイルは `RuntimeSkillCreatorFacade.ts` の行のみ確認する。

### Step 3: 基準値判定

| 指標              | 最低基準 | 推奨基準 | 判定           |
| ----------------- | -------- | -------- | -------------- |
| Line Coverage     | 80%      | 90%      | 計測結果を記入 |
| Branch Coverage   | 60%      | 70%      | 計測結果を記入 |
| Function Coverage | 80%      | 90%      | 計測結果を記入 |

#### 基準達成の場合

Phase 8（リファクタリング）へ進む。

#### 基準未達の場合

カバレッジレポートの `Uncovered Line #s` を確認し、未カバーブランチを特定する。Phase 6 に戻り追加テストを記述する。

### Step 4: 基準未達時の典型的な未カバー箇所

実装後に未カバーになりやすい箇所を事前に把握しておく。

#### resolveDecision メソッド（L53-58）

```typescript
private resolveDecision(authMode: AuthMode, apiKey: string | null) {
  if (authMode === "api-key" && (!apiKey || apiKey.trim() === "")) {
    return this.resolver.resolveWithService(authMode);
  }
  return this.resolver.resolve(authMode, apiKey);
}
```

- 分岐 1: `authMode === "api-key"` かつ `apiKey` が null/空文字 → `resolveWithService`
- 分岐 2: それ以外 → `resolve`

E-3（subscription モードで terminal_handoff）、E-6（api-key モードで apiKey=null + integrated_api）、E-8（明示的 apiKey）でこれらの分岐は既にカバーされる。

#### execute メソッドの terminal_handoff 分岐

```typescript
if (decision.type === "terminal_handoff") {
  const bundle = this.handoffBuilder.build(planResult.skillSpec, process.cwd());
  return { type: "terminal_handoff", bundle };
}
```

E-3, E-4, E-5, E-7, E-8 でカバーされる。

#### execute メソッドの error パス（L戻り値の `error` フィールド）

```typescript
error: response.error?.message,
```

Optional chaining のため、`error` が undefined のパスと `error.message` が返るパスの両方をカバーする必要がある。

- E-1（success: true, error なし）: `undefined` パスをカバー
- E-2（success: false, error あり）: `error.message` パスをカバー

これらは既存テストでカバーされている。

#### skillSpec の truncation（L128相当）

```typescript
planResult.skillSpec.split("\n")[0]?.substring(0, 50) ?? "unnamed";
```

- 正常パス（split の結果が非 null）: E-1, E-2 でカバー
- `?? "unnamed"` パス（split 結果が undefined）: このパスは `"".split("\n")[0]` が `""` を返すため実際には到達しない。v8 カバレッジプロバイダがインライン arrow function をカウントする場合（P41 参照）、この箇所の分岐カバレッジが低下することがある

Branch Coverage が 60% を下回る場合、`"unnamed"` フォールバックのテストケースを追加する。

```typescript
// 追加テスト（必要な場合）
it("skillSpec が空文字列の場合は skillName が unnamed になる", async () => {
  vi.spyOn(RuntimePolicyResolver.prototype, "resolve").mockResolvedValue({
    type: "integrated_api",
    apiKey: "sk-test",
    permissionMode: "default",
  });
  executeMock.mockResolvedValue({
    executionId: "exec-unnamed",
    success: true,
  });

  const result = await facade.execute(
    {
      planId: "plan-unnamed",
      skillSpec: "",
      estimatedSteps: 3,
    },
    "api-key",
    "sk-test",
  );

  expect(result).toEqual(
    expect.objectContaining({
      skillName: "", // split("")[0] は "" なので "unnamed" にはならない
    }),
  );
});
```

注意: `"".split("\n")[0]` は `""` であり `undefined` ではないため、`?? "unnamed"` のフォールバックには実際には到達しない。Branch Coverage の判定はツール依存のため、計測結果に従う。

### Step 5: 基準達成を記録する

カバレッジ計測結果を以下の形式で記録する。

```
計測日時: 2026-03-23
テストファイル: apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts
対象ファイル: apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

Line Coverage:     xx% （基準 80%: PASS/FAIL）
Branch Coverage:   xx% （基準 60%: PASS/FAIL）
Function Coverage: xx% （基準 80%: PASS/FAIL）

判定: PASS / Phase 6 に戻る
```

## 多角的チェック観点

| 観点               | 適用判断                          | 確認内容                                         |
| ------------------ | --------------------------------- | ------------------------------------------------ |
| セキュリティ       | terminal_handoff でのセキュリティ | SkillExecutor 非呼び出しの保証                   |
| アーキテクチャ     | 3メソッドのパターン統一           | plan/improve/execute の分岐パターンの一貫性      |
| エラーハンドリング | Optional chaining の安全性        | `response.error?.message` 等の null 安全パターン |

## 統合テスト連携

本 Phase はカバレッジ確認のみ。カバレッジが基準を達成していても、`resolveDecision` の private メソッドに対するテストは直接記述せず、public メソッド（plan/execute/improve）経由で間接的にテストする。

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## 成果物

| 成果物                   | パス               | 説明                                          |
| ------------------------ | ------------------ | --------------------------------------------- |
| カバレッジ計測結果のログ | （コンソール出力） | pnpm vitest run --coverage の実行結果         |
| 基準達成確認記録         | 本仕様書の Step 5  | Line/Branch/Function カバレッジの計測値と判定 |

## 完了条件

- [ ] `pnpm vitest run --coverage` が実行できる
- [ ] Line Coverage 80% 以上を達成している
- [ ] Branch Coverage 60% 以上を達成している
- [ ] Function Coverage 80% 以上を達成している
- [ ] 未達の場合は Phase 6 に戻り追加テストを記述済み
- [ ] 計測結果を Step 5 に記録済み
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次のPhase

Phase 8（リファクタリング）: コード品質改善（必要な場合）
