# Phase 5: 実装

## メタ情報

| 項目   | 値                                               |
| ------ | ------------------------------------------------ |
| Phase  | 5                                                |
| 機能名 | SkillExecutor env オプション全環境変数上書き修正 |
| 作成日 | 2026-04-01                                       |

## 目的

Phase 2 の設計に従い、`SkillExecutor.ts:861` の `env` オプションを 1 行修正し、TDD Green フェーズを達成する。

## 実装対象

- `apps/desktop/src/main/services/skill/SkillExecutor.ts`（L861 の 1 行のみ）
- `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts`（既存ケース拡張）

## 実装手順

### ステップ 1: SkillExecutor.ts の現状確認

```bash
# 問題箇所の現状確認
grep -n "ANTHROPIC_API_KEY\|env:" apps/desktop/src/main/services/skill/SkillExecutor.ts | head -20

# L855-870 周辺の全体確認
sed -n '855,870p' apps/desktop/src/main/services/skill/SkillExecutor.ts
```

確認事項:

- L861 に `env: { ANTHROPIC_API_KEY: apiKey }` が存在することを確認する
- `callSDKQuery` メソッドのシグネチャを確認する
- `apiKey` がどのスコープで参照されているか確認する

### ステップ 2: 1 行修正の適用

`SkillExecutor.ts:861` を以下の通り変更する。

#### 変更前（修正前コード）

```typescript
const conversation = query({
  prompt,
  options: {
    env: { ANTHROPIC_API_KEY: apiKey }, // TASK-FIX-16-1: 環境変数経由で認証キーを渡す
    tools: options.tools,
    permissionMode: options.permissionMode,
    abortController: options.abortController,
    hooks: this.toSdkHookMatchers(options.hooks),
    canUseTool: options.canUseTool,
  },
});
```

#### 変更後（修正後コード）

```typescript
const conversation = query({
  prompt,
  options: {
    env: { ...process.env, ANTHROPIC_API_KEY: apiKey }, // TASK-FIX-ENV-STRIPPING: process.env を展開し PATH 等を保持
    tools: options.tools,
    permissionMode: options.permissionMode,
    abortController: options.abortController,
    hooks: this.toSdkHookMatchers(options.hooks),
    canUseTool: options.canUseTool,
  },
});
```

#### 変更の差分（1 行のみ）

```diff
-    env: { ANTHROPIC_API_KEY: apiKey }, // TASK-FIX-16-1: 環境変数経由で認証キーを渡す
+    env: { ...process.env, ANTHROPIC_API_KEY: apiKey }, // TASK-FIX-ENV-STRIPPING: process.env を展開し PATH 等を保持
```

### ステップ 3: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

確認事項:

- `{ ...process.env, ANTHROPIC_API_KEY: apiKey }` の型が `query()` の `env` オプションの型と互換性があることを確認する
- `process.env` は `NodeJS.ProcessEnv`（`{ [key: string]: string | undefined }`）型であり、通常の SDK `env` オプションと互換性がある

### ステップ 4: テスト実行（TDD Green フェーズ）

```bash
# Phase 4 で定義したテストの実行
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillExecutor.auth.test.ts
```

Phase 4 で定義した TC-01 〜 TC-03 が全て PASS することを確認する（Green フェーズ）。

### ステップ 5: 既存テストへの影響確認

```bash
# SkillExecutor 関連テスト全体実行
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillExecutor.auth.test.ts \
  src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts
```

## 実装上の注意事項

| 項目                        | 注意点                                                                                                               |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `process.env` の型          | `NodeJS.ProcessEnv`（`{ [key: string]: string \| undefined }`）型のため、`undefined` 値を含む可能性がある            |
| スプレッド順序              | `{ ...process.env, ANTHROPIC_API_KEY: apiKey }` の順序が重要。`ANTHROPIC_API_KEY` を後に書くことで引数値が優先される |
| `AgentExecutor.ts` への影響 | 変更なし。`AgentExecutor.ts` は独立して正常動作しているため修正不要                                                  |
| コメントの更新              | 既存コメント `// TASK-FIX-16-1` を `// TASK-FIX-ENV-STRIPPING` に変更する（Phase 8 で詳細化）                        |

## 参照資料

| 資料名           | パス                                                    | 説明                   |
| ---------------- | ------------------------------------------------------- | ---------------------- |
| 設計書           | `./phase-2-design.md`                                   | env オプション修正設計 |
| テスト仕様       | `./phase-4-test-creation.md`                            | TC-01 〜 TC-03         |
| SkillExecutor.ts | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | 修正対象（L861）       |

## 成果物

| 成果物       | パス                                                                        | 説明               |
| ------------ | --------------------------------------------------------------------------- | ------------------ |
| 実装仕様     | `phase-5-implementation.md`                                                 | 本ファイル         |
| 実装順序     | `outputs/phase-5/implementation-sequencing.md`                              | 変更適用の実行順序 |
| 修正ファイル | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                     | 実装済みコード     |
| テスト更新   | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts` | 既存ケース拡張     |

## 完了条件

- [ ] `SkillExecutor.ts:861` の `env: { ANTHROPIC_API_KEY: apiKey }` が `env: { ...process.env, ANTHROPIC_API_KEY: apiKey }` に変更されている
- [ ] コメントが `// TASK-FIX-ENV-STRIPPING: process.env を展開し PATH 等を保持` に更新されている
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] Phase 4 の TC-01 〜 TC-03 が全て PASS している（TDD Green フェーズ）
- [ ] **本Phase内の全タスクを100%実行完了**
