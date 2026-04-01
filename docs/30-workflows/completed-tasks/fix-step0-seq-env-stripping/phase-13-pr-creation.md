# Phase 13: PR作成

## メタ情報

| 項目   | 値                                               |
| ------ | ------------------------------------------------ |
| Phase  | 13                                               |
| 機能名 | SkillExecutor env オプション全環境変数上書き修正 |
| 作成日 | 2026-04-01                                       |

## 目的

Phase 1-12 の成果が揃っているときだけ PR 作成テンプレートを使えるようにする。

## 重要事項

- コミットしない
- PR を作成しない
- user approval があるまで blocked のまま

## PR 作成前チェックリスト

- [ ] Phase 10 の最終レビューが PASS
- [ ] Phase 11 の手動テストが PASS
- [ ] Phase 12 の 6 成果物が存在する
- [ ] `pnpm --filter @repo/desktop exec vitest run` が PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop lint` が PASS

## PR タイトル

```text
fix(desktop): TASK-FIX-ENV-STRIPPING — SkillExecutor env オプション全環境変数上書き修正（spawn ENOENT 解消）
```

## PR 説明テンプレート

### 概要

`SkillExecutor.ts:861` の `env: { ANTHROPIC_API_KEY: apiKey }` が `PATH` を含む inherited env を消していたため、Agent SDK の `query()` が `spawn("node", [cli.js])` で `ENOENT` を起こす問題を修正する。

### 根本原因

`env` オプションに部分的な object を渡すと、Node.js の `spawn()` はその object だけを子プロセスに渡す。`PATH` が消えるため `node` 解決に失敗する。

### 修正内容

```diff
- env: { ANTHROPIC_API_KEY: apiKey }, // TASK-FIX-16-1: 環境変数経由で認証キーを渡す
+ env: { ...process.env, ANTHROPIC_API_KEY: apiKey }, // TASK-FIX-ENV-STRIPPING: process.env を展開し PATH 等を保持
```

### 検証

- `SkillExecutor.auth.test.ts` で PATH / precedence を確認
- `SkillExecutor.sdk-types.test.ts` は baseline として維持
- `typecheck` / `lint` / `vitest` を PASS

### 参照

- `outputs/phase-12/documentation-changelog.md`
- `outputs/phase-12/phase12-task-spec-compliance-check.md`
- `outputs/phase-11/manual-test-result.md`

## コミットメッセージ

```text
fix(desktop): TASK-FIX-ENV-STRIPPING — SkillExecutor env オプション全環境変数上書き修正
```

## 成果物

| 成果物  | パス                      | 説明       |
| ------- | ------------------------- | ---------- |
| PR 作成 | `phase-13-pr-creation.md` | 本ファイル |

## 完了条件

- [ ] PR 作成が blocked である
- [ ] source が `outputs/phase-12/*` に揃っている
- [ ] 壊れた Markdown fence がない
- [ ] **本Phase内の全タスクを100%実行完了**
