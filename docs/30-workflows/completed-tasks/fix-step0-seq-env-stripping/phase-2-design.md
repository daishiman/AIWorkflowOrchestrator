# Phase 2: 設計

## メタ情報

| 項目   | 値                                               |
| ------ | ------------------------------------------------ |
| Phase  | 2                                                |
| 機能名 | SkillExecutor env オプション全環境変数上書き修正 |
| 作成日 | 2026-04-01                                       |

## 目的

`SkillExecutor.ts:861` の `env` オプション修正に関する Concern 設計、セキュリティ設計判断の記録、変更前後コード比較を定義する。

## Concern 設計（1 concern: env オプション修正）

### Concern-01: env オプションへの `process.env` スプレッド追加

| 項目         | 内容                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------- |
| Concern 名   | env オプション修正                                                                                 |
| 対象ファイル | `apps/desktop/src/main/services/skill/SkillExecutor.ts`（L861）                                    |
| 変更メソッド | `callSDKQuery`                                                                                     |
| 変更種別     | 既存コードへの 1 行変更                                                                            |
| 変更量       | 1行（`env: { ANTHROPIC_API_KEY: apiKey }` → `env: { ...process.env, ANTHROPIC_API_KEY: apiKey }`） |
| 影響範囲     | `callSDKQuery` メソッド内のみ                                                                      |
| テスト影響   | 既存テストへの影響最小（`SkillExecutor.auth.test.ts` への既存ケース拡張で十分）                    |

## 現在の実装（問題のあるコード）

```typescript
// SkillExecutor.ts:858-868 - 現在（問題あり）
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

### 問題点

- `env: { ANTHROPIC_API_KEY: apiKey }` は `process.env` 全体を上書きする
- Node.js の `spawn()` は `env` オプションが指定されると、そのオブジェクト**のみ**を子プロセスへ渡す
- `PATH` が含まれないため `node` コマンドの実行ファイルが見つからず `ENOENT` が発生する
- `HOME`、`NODE_ENV` 等の他の環境変数も失われる

## 修正後の設計

```typescript
// SkillExecutor.ts:858-868 - 修正後
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

### 設計の要点

- `{ ...process.env }` で Main プロセスの全環境変数を展開する
- その後 `ANTHROPIC_API_KEY: apiKey` で認証キーを上書き（スプレッドより後ろに書くことで優先される）
- `PATH`、`HOME`、`NODE_ENV` 等の必須環境変数が保持される
- `spawn("node", [cli.js])` が `PATH` を参照して `node` を正常に発見できる

## セキュリティ設計判断の記録

### 採用案: `{ ...process.env, ANTHROPIC_API_KEY: apiKey }`

**採用理由**:

1. 修正コストが最小（1行の変更）
2. Main プロセスの `process.env` はレンダラーに公開されない（IPC 境界の内側）
3. SDK の子プロセスは信頼されたプロセスであり、Main プロセスの環境変数を渡すことは許容範囲
4. `AgentExecutor.ts` が事実上 `process.env` 全体を子プロセスへ渡している（env 未指定）のと同等

**IPC 境界での安全性**:

```
[Renderer Process]
        ↓ IPC 呼び出し（apiKey のみを引数として渡す）
[Main Process / SkillExecutor.callSDKQuery()]
        ↓ spawn（{ ...process.env, ANTHROPIC_API_KEY: apiKey } を子プロセスへ渡す）
[SDK 子プロセス / node cli.js]
```

Renderer プロセスは `process.env` 全体には触れない。`apiKey` のみが IPC 経由で渡される。

### 代替案: 最小権限指定

```typescript
env: {
  ANTHROPIC_API_KEY: apiKey,
  PATH: process.env.PATH,
  HOME: process.env.HOME,
  NODE_ENV: process.env.NODE_ENV,
}
```

**不採用理由**:

1. 将来的に SDK が必要とする環境変数が増えた場合に保守コストが発生する
2. `TMPDIR`、`XDG_RUNTIME_DIR` 等の OS 依存変数が漏れるリスクがある
3. 採用案と比較してセキュリティ上の実質的な差が小さい（どちらも Main プロセス内で完結）

**Phase 2 設計判断**: `{ ...process.env, ANTHROPIC_API_KEY: apiKey }` を採用する。

## 変更前後コード比較

| 観点                | 変更前                          | 変更後                                            |
| ------------------- | ------------------------------- | ------------------------------------------------- |
| `env` オプション    | `{ ANTHROPIC_API_KEY: apiKey }` | `{ ...process.env, ANTHROPIC_API_KEY: apiKey }`   |
| `PATH` の有無       | なし（ENOENT の原因）           | あり（`process.env.PATH` が含まれる）             |
| `HOME` の有無       | なし                            | あり（`process.env.HOME` が含まれる）             |
| `NODE_ENV` の有無   | なし                            | あり（`process.env.NODE_ENV` が含まれる）         |
| `ANTHROPIC_API_KEY` | `apiKey` の値が設定される       | `apiKey` の値が設定される（スプレッド後に上書き） |
| spawn 動作          | ENOENT（PATH なし）             | 正常（PATH あり）                                 |

## シーケンス図（修正前後）

### 修正前（ENOENT 発生）

```
SkillExecutor.callSDKQuery()
    |
    |-- query({ env: { ANTHROPIC_API_KEY } })
    |       ↓
    |   SDK内部: spawn("node", ["cli.js"], { env: { ANTHROPIC_API_KEY } })
    |       ↓
    |   OS: PATH なし → node コマンドが見つからない
    |       ↓
    |   Error: spawn node ENOENT
```

### 修正後（正常動作）

```
SkillExecutor.callSDKQuery()
    |
    |-- query({ env: { ...process.env, ANTHROPIC_API_KEY } })
    |       ↓
    |   SDK内部: spawn("node", ["cli.js"], { env: { PATH, HOME, ..., ANTHROPIC_API_KEY } })
    |       ↓
    |   OS: PATH あり → node コマンドが正常に発見・実行される
    |       ↓
    |   正常動作
```

## 変更スコープ

| ファイル                                                                    | 変更内容                                           | 変更量 |
| --------------------------------------------------------------------------- | -------------------------------------------------- | ------ |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`（L861）             | `env` オプションに `...process.env` スプレッド追加 | 1行    |
| `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts` | 既存ケース拡張で `PATH` 保持と上書き優先を確認     | 追記   |

変更なしのファイル:

- `apps/desktop/src/main/services/agent/AgentExecutor.ts`（独立して正常動作、変更不要）
- IPC 層のファイル（変更不要）
- UI 層のファイル（変更不要）

## 参照資料

| 資料名           | パス                                                    | 説明                               |
| ---------------- | ------------------------------------------------------- | ---------------------------------- |
| 要件定義         | `./phase-1-requirements.md`                             | FR / NFR / AC                      |
| SkillExecutor.ts | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | 修正対象ファイル（L858-868, L861） |
| AgentExecutor.ts | `apps/desktop/src/main/services/agent/AgentExecutor.ts` | 比較参照: env 未指定で正常動作     |

## 成果物

| 成果物         | パス                                 | 説明           |
| -------------- | ------------------------------------ | -------------- |
| 設計書         | `phase-2-design.md`                  | 本ファイル     |
| 設計トポロジー | `outputs/phase-2/design-topology.md` | Concern 設計図 |

## 完了条件

- [ ] Concern-01（env オプション修正）が定義されている
- [ ] セキュリティ設計判断（採用案 vs 代替案）が記録されている
- [ ] 変更前後コード比較が明記されている
- [ ] シーケンス図で修正前後の違いが示されている
- [ ] 変更スコープが `SkillExecutor.ts:861` の 1 行と `SkillExecutor.auth.test.ts` の既存ケース拡張に限定されていることが確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
