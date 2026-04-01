# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                               |
| ------ | ------------------------------------------------ |
| Phase  | 1                                                |
| 機能名 | SkillExecutor env オプション全環境変数上書き修正 |
| 作成日 | 2026-04-01                                       |

## 目的

`SkillExecutor.ts:861` の `env: { ANTHROPIC_API_KEY: apiKey }` が `PATH` を含む全環境変数を上書きし、Agent SDK の `query()` が `spawn("node", [cli.js])` で `ENOENT` を発生させる問題の要件を定義する。

## P50 チェック（実装状態確認）手順

### ステップ 1: 問題の再現確認

```bash
# SkillExecutor.ts の問題箇所を確認
grep -n "ANTHROPIC_API_KEY\|env:" apps/desktop/src/main/services/skill/SkillExecutor.ts | head -20
```

確認事項:

- L861 付近に `env: { ANTHROPIC_API_KEY: apiKey }` が存在することを確認する
- `process.env` のスプレッドが存在しないことを確認する（問題の存在確認）

### ステップ 2: AgentExecutor.ts との比較確認

```bash
# AgentExecutor.ts の env オプション状況を確認
grep -n "env:\|ANTHROPIC_API_KEY" apps/desktop/src/main/services/agent/AgentExecutor.ts | head -20
```

確認事項:

- `AgentExecutor.ts` では `env` オプションが未指定であることを確認する
- `env` 未指定時は Node.js が `process.env` 全体を子プロセスへ渡すため ENOENT が発生しないことを確認する

### ステップ 3: 修正箇所の特定

```bash
# 周辺コードの確認
sed -n '855,870p' apps/desktop/src/main/services/skill/SkillExecutor.ts
```

## 変更対象ファイルのインベントリ（2ファイル）

| ファイル                                                                    | 行番号 | 変更種別 | 変更内容                                                                                    |
| --------------------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`                     | L861   | 修正     | `env: { ANTHROPIC_API_KEY: apiKey }` → `env: { ...process.env, ANTHROPIC_API_KEY: apiKey }` |
| `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts` | 既存   | 追記     | `PATH` 保持と `ANTHROPIC_API_KEY` 上書き優先のアサーションを追加                            |

## 調査結果サマリー

### エラー

```
Error: spawn node ENOENT
    at Process.ChildProcess._handle.onexit (node:internal/child_process:...)
```

### 根本原因

`SkillExecutor.ts:861` の `env: { ANTHROPIC_API_KEY: apiKey }` が `spawn()` に渡す環境変数を `ANTHROPIC_API_KEY` のみに限定する。Node.js の `child_process.spawn()` は `env` オプションが指定された場合、そのオブジェクトのみを子プロセスの環境変数として使用する。`PATH` が含まれないため、`node` コマンドの実行ファイルパスが解決できず `ENOENT` が発生する。

### 調査対象ファイル

| ファイル                                                | 調査結果                                                                                |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts` | L861 に `env: { ANTHROPIC_API_KEY: apiKey }` が存在する（ENOENT の根本原因）            |
| `apps/desktop/src/main/services/agent/AgentExecutor.ts` | `env` オプション未指定のため `process.env` 全体が子プロセスへ渡される（正常動作の証拠） |

## 機能要件

| ID    | 要件                                                                                                | 優先度 |
| ----- | --------------------------------------------------------------------------------------------------- | ------ |
| FR-01 | `query()` の `env` オプションに `PATH` が含まれること（`spawn ENOENT` が発生しないこと）            | must   |
| FR-02 | `query()` の `env` オプションに `ANTHROPIC_API_KEY` が含まれること                                  | must   |
| FR-03 | `ANTHROPIC_API_KEY` は `process.env` の同名キーを上書きすること（引数の `apiKey` が優先されること） | must   |
| FR-04 | Agent SDK が `node cli.js` を正常に spawn できること                                                | must   |

## 非機能要件

| ID     | 要件                                                                                                                           | 優先度 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------ | ------ |
| NFR-01 | セキュリティ: Main プロセスの `process.env` は Renderer には公開されない（IPC 境界内に留まること）                             | must   |
| NFR-02 | 変更スコープを `SkillExecutor.ts` の `callSDKQuery` メソッドの `env` オプション 1行と既存 auth テスト 1 ファイルに限定すること | should |
| NFR-03 | `AgentExecutor.ts` には変更を加えないこと（独立して正常動作しているため）                                                      | must   |
| NFR-04 | 既存テストへのリグレッションがないこと                                                                                         | must   |

## 受入基準（AC-1 〜 AC-5）

| ID   | 基準                                                                                           | 確認方法                  |
| ---- | ---------------------------------------------------------------------------------------------- | ------------------------- |
| AC-1 | `query()` の `env` オプションに `PATH` が含まれること（spawn ENOENT が発生しないこと）         | ユニットテスト（Phase 4） |
| AC-2 | `query()` の `env` オプションに `ANTHROPIC_API_KEY` が含まれること                             | ユニットテスト（Phase 4） |
| AC-3 | 修正後、SDK が `node cli.js` を正常に spawn できること                                         | ユニットテスト（Phase 4） |
| AC-4 | 既存テストが全て PASS すること                                                                 | CI（Phase 9）             |
| AC-5 | セキュリティ: Main プロセスの `process.env` は Renderer には公開されない（IPC 境界内に留まる） | コードレビュー（Phase 3） |

## セキュリティ設計の考慮事項

### IPC 境界での漏洩リスク評価

| 観点                                           | 評価       | 根拠                                                                                                 |
| ---------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------- |
| `process.env` の Renderer への漏洩             | リスクなし | `callSDKQuery` は Main プロセス内で完結する。`env` オプションは `spawn()` の子プロセスへのみ渡される |
| `ANTHROPIC_API_KEY` の Renderer への漏洩       | リスクなし | IPC ハンドラー内で `apiKey` を取得・使用し、Renderer への返却値には含めない設計                      |
| `process.env` 内の機密変数の子プロセスへの漏洩 | 許容範囲   | SDK の子プロセスは信頼されたプロセスであり、`ANTHROPIC_API_KEY` 自体を渡すことが目的                 |

### 代替案比較

| 方式                                                                                                            | セキュリティ | 実装コスト | 採用判断 |
| --------------------------------------------------------------------------------------------------------------- | ------------ | ---------- | -------- |
| `{ ...process.env, ANTHROPIC_API_KEY: apiKey }`                                                                 | 許容範囲     | 最小       | 採用     |
| `{ ANTHROPIC_API_KEY: apiKey, PATH: process.env.PATH, HOME: process.env.HOME, NODE_ENV: process.env.NODE_ENV }` | 最小権限原則 | 中         | 代替案   |

設計判断の記録は Phase 2 に委ねる。

## 参照資料

| 資料名                          | パス                                                                             | 説明                                    |
| ------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------- |
| SkillExecutor.ts                | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                          | 修正対象ファイル（L858-868, L861）      |
| SkillExecutor.auth.test.ts      | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts`      | 既存検証の拡張対象（PATH / precedence） |
| SkillExecutor.sdk-types.test.ts | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts` | 型安全の既存 baseline                   |
| AgentExecutor.ts                | `apps/desktop/src/main/services/agent/AgentExecutor.ts`                          | 比較参照: env 未指定で正常動作          |

## 成果物

| 成果物         | パス                                     | 説明               |
| -------------- | ---------------------------------------- | ------------------ |
| 要件定義       | `phase-1-requirements.md`                | 本ファイル         |
| 仕様抽出マップ | `outputs/phase-1/spec-extraction-map.md` | P50 チェック成果物 |

## 完了条件

- [ ] エラーの根本原因（`env` オプションによる `PATH` 消失）が特定されている
- [ ] 変更対象ファイルが 2 ファイル（`SkillExecutor.ts` L861, `SkillExecutor.auth.test.ts`）であることが確認されている
- [ ] 機能要件（FR-01 〜 FR-04）が明記されている
- [ ] 非機能要件（NFR-01 〜 NFR-04）が明記されている
- [ ] 受入基準（AC-1 〜 AC-5）が明記されている
- [ ] セキュリティ設計の考慮事項が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**
