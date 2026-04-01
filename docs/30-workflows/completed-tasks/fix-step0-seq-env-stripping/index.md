# TASK-FIX-ENV-STRIPPING: SkillExecutor env オプション全環境変数上書き修正

## 概要

`SkillExecutor.ts` の `callSDKQuery` メソッドで `query()` に渡す `env` オプションが `{ ANTHROPIC_API_KEY: apiKey }` のみであるため、`PATH` を含む全環境変数が失われる。結果として Agent SDK が `spawn("node", [cli.js])` 時に `ENOENT` エラーを発生させる。1行の修正（`{ ...process.env, ANTHROPIC_API_KEY: apiKey }`）で解決する。テストは既存の `SkillExecutor.auth.test.ts` を拡張して最小限でカバーする。

## メタ情報

| 項目       | 値                                                                    |
| ---------- | --------------------------------------------------------------------- |
| タスクID   | TASK-FIX-ENV-STRIPPING                                                |
| タイトル   | SkillExecutor env オプション全環境変数上書き修正（spawn ENOENT 解消） |
| 優先度     | P0（他の全IPC修正タスクの前提）                                       |
| 複雑度     | small（1行修正 + 既存テスト拡張）                                     |
| 依存タスク | なし（他タスクの前提となる独立タスク）                                |
| 作成日     | 2026-04-01                                                            |
| ステータス | completed                                                             |

## 背景・問題

### エラー内容

```
Error: spawn node ENOENT
    at Process.ChildProcess._handle.onexit (node:internal/child_process:...)
```

### 発生タイミング

スキル生成フローで `SkillExecutor.callSDKQuery()` が `query()` を呼び出す際に発生。

### 根本原因

`SkillExecutor.ts:861` の `env: { ANTHROPIC_API_KEY: apiKey }` が `process.env` 全体を上書きする。Node.js の `child_process.spawn()` はデフォルトで `process.env` を子プロセスへ渡すが、`env` オプションが指定された場合はそのオブジェクト**のみ**を環境変数として使用する。`ANTHROPIC_API_KEY` しか含まないオブジェクトでは `PATH` が存在しないため、`node` コマンドのパス解決に失敗し `ENOENT` が発生する。

`AgentExecutor.ts` では `env` オプションが未指定のため同問題は発生しない（比較参照）。

### 修正方針

スプレッド構文で `process.env` を展開してから `ANTHROPIC_API_KEY` で上書きする：

```typescript
env: { ...process.env, ANTHROPIC_API_KEY: apiKey }
```

## スコープ

### 含むもの

- `apps/desktop/src/main/services/skill/SkillExecutor.ts` の `callSDKQuery` メソッドの修正（1行）
- `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts` の既存ケース拡張

### 含まないもの

- `apps/desktop/src/main/services/agent/AgentExecutor.ts`（独立して正常動作）
- IPC 層の変更
- UI 変更
- `AgentExecutor.ts` の変更

## 修正対象ファイル

| ファイル                                                                    | 変更内容                                                 |
| --------------------------------------------------------------------------- | -------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`（L861）             | `env` オプションに `...process.env` を追加（1行）        |
| `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts` | `PATH` 保持と `ANTHROPIC_API_KEY` 上書き優先の確認を追加 |

## Phase 一覧

| Phase | 名称             | 仕様書                                                         |
| ----- | ---------------- | -------------------------------------------------------------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             |
| 9     | 品質保証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           |
| 12    | ドキュメント更新 | [phase-12-documentation.md](./phase-12-documentation.md)       |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           |

## 参照資料

| 資料名           | パス                                                    | 説明                               |
| ---------------- | ------------------------------------------------------- | ---------------------------------- |
| SkillExecutor.ts | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | 修正対象ファイル（L858-868, L861） |
| AgentExecutor.ts | `apps/desktop/src/main/services/agent/AgentExecutor.ts` | 比較参照: env 未指定で正常動作     |

## 完了定義

- `query()` の `env` オプションに `PATH` が含まれ、spawn ENOENT が発生しない
- `query()` の `env` オプションに `ANTHROPIC_API_KEY` が含まれる
- Agent SDK が `node cli.js` を正常に spawn できる
- 既存テストが全て PASS する
- Main プロセスの `process.env` は Renderer には公開されない（IPC 境界内に留まる）
- Phase 12 の成果物（`outputs/phase-12/` の6ファイル）が揃っている
