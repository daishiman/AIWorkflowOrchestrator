# Phase 9: 品質検証 — Lint・型チェック・全テスト実行による品質確認

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-9B-I-SDK-FORMAL-INTEGRATION             |
| Phase番号  | 9                                            |
| Phase名    | 品質検証                                     |
| 目的       | Lint・型チェック・全テスト実行による品質確認 |
| 前提Phase  | Phase 8（リファクタリング）                  |
| 後続Phase  | Phase 10（最終レビューゲート）               |
| ステータス | 未実施                                       |
| ブランチ   | refactor/task-9b-i-sdk-formal-integration    |
| 作成日     | 2026-02-12                                   |

---

## 目的

Phase 8 までの全成果物に対して、ESLint・TypeScript 型チェック・テスト全件実行を一括で実施し、品質基準への適合を検証する。本 Phase は Phase 10（最終レビューゲート）に進む前の最終品質確認であり、全チェック項目が PASS であることを Phase 10 の前提条件とする。

---

## 依存関係

| 依存元  | 成果物                               | 用途                     |
| ------- | ------------------------------------ | ------------------------ |
| Phase 8 | リファクタリング済みコード           | 品質検証対象             |
| Phase 8 | `outputs/phase-8/dry-analysis.md`    | DRY 分析の完了確認       |
| Phase 7 | `outputs/phase-7/coverage-report.md` | カバレッジ基準達成の参照 |

---

## 実行タスク

### Task 1: ESLint 実行 — Lint 警告・エラーゼロの確認

#### 実行コマンド

```bash
# デスクトップパッケージの Lint
pnpm --filter @repo/desktop lint

# 共有パッケージの Lint
pnpm --filter @repo/shared lint
```

#### 確認項目

| 確認項目                                            | 期待結果    |
| --------------------------------------------------- | ----------- |
| `@typescript-eslint/no-explicit-any` 違反がないこと | 違反 0 件   |
| ESLint エラーが 0 件であること                      | エラー 0 件 |
| ESLint 警告が 0 件であること                        | 警告 0 件   |
| `eslint-disable` コメントが新規追加されていないこと | 追加 0 件   |

#### 特記事項

- `@typescript-eslint/no-explicit-any` は本タスクの中核要件（FR-001）に直結するため、特に重点的に確認する
- `SkillExecutor.ts` 内に `eslint-disable-next-line @typescript-eslint/no-explicit-any` が残っていないことを明示的に確認する

---

### Task 2: TypeScript 型チェック — コンパイルエラーゼロの確認

#### 実行コマンド

```bash
# 共有パッケージの型チェック（型定義ファイルがここにあるため先に実行）
pnpm --filter @repo/shared typecheck

# デスクトップパッケージの型チェック
pnpm --filter @repo/desktop typecheck

# 全パッケージの型チェック（最終確認）
pnpm typecheck
```

#### 確認項目

| 確認項目                                                 | 期待結果    |
| -------------------------------------------------------- | ----------- |
| `pnpm --filter @repo/shared typecheck` が成功すること    | エラー 0 件 |
| `pnpm --filter @repo/desktop typecheck` が成功すること   | エラー 0 件 |
| `pnpm typecheck` が全パッケージで成功すること            | エラー 0 件 |
| `@ts-expect-error` が新規追加されていないこと（NFR-002） | 追加 0 件   |
| `@ts-ignore` が新規追加されていないこと                  | 追加 0 件   |

#### 実行順序の理由

`@repo/shared` に配置された型定義ファイル `@anthropic-ai-claude-agent-sdk.d.ts` を `@repo/desktop` が参照するため、`@repo/shared` の型チェックを先に成功させる必要がある。

---

### Task 3: 全テスト実行 — テスト全件 PASS の確認

#### 実行コマンド

```bash
# SkillExecutor 関連テスト全件実行
pnpm vitest run apps/desktop/src/main/services/skill/__tests__/

# 全パッケージのテスト実行（影響波及がないことの確認）
pnpm vitest run
```

#### 確認項目

| No. | テストファイル                         | 期待結果 |
| --- | -------------------------------------- | -------- |
| 1   | `SkillExecutor.test.ts`                | PASS     |
| 2   | `SkillExecutor.auth.test.ts`           | PASS     |
| 3   | `SkillExecutor.retry.test.ts`          | PASS     |
| 4   | `SkillExecutor.integration.test.ts`    | PASS     |
| 5   | `SkillExecutor.permission.test.ts`     | PASS     |
| 6   | `SkillExecutor.type-migration.test.ts` | PASS     |
| 7   | `SkillExecutor.sdk-types.test.ts`      | PASS     |

#### 全パッケージテスト

- `pnpm vitest run` で他パッケージのテストにも影響がないことを確認する
- 型定義ファイルの変更が `AgentExecutor` や `agent-client` のテストに影響していないことを確認する

---

### Task 4: 差分確認 — 変更ファイルがスコープ内であることの確認

#### 実行コマンド

```bash
# 変更ファイル一覧
git diff --stat main

# 変更ファイル数
git diff --name-only main | wc -l
```

#### 確認項目

| 確認項目                                                        | 期待結果       |
| --------------------------------------------------------------- | -------------- |
| 変更対象がスコープ内の 3 ファイル以内であること                 | 3 ファイル以内 |
| `AgentExecutor.ts` に差分がないこと                             | 差分なし       |
| `agent-client.ts` に差分がないこと                              | 差分なし       |
| テストファイル以外のプロダクションコードの変更が 2 ファイル以内 | 2 ファイル以内 |

#### スコープ内変更ファイル（許容範囲）

| ファイル                                                            | 変更種別                    |
| ------------------------------------------------------------------- | --------------------------- |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`             | `as any` 除去、コメント整理 |
| `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts`     | 型定義追加                  |
| `apps/desktop/src/test/__mocks__/@anthropic-ai/claude-agent-sdk.ts` | モック更新                  |

#### スコープ外変更（不許容）

- `apps/desktop/src/main/services/agent/AgentExecutor.ts` への変更
- `apps/desktop/src/main/services/agent/agent-client.ts` への変更
- `packages/shared/src/agent/types.ts` への変更
- `apps/desktop/src/preload/` 以下への変更

---

## 品質チェックマトリクス

| チェック項目         | コマンド                                | 合格基準              | 結果 |
| -------------------- | --------------------------------------- | --------------------- | ---- |
| ESLint（desktop）    | `pnpm --filter @repo/desktop lint`      | エラー 0 / 警告 0     | [ ]  |
| ESLint（shared）     | `pnpm --filter @repo/shared lint`       | エラー 0 / 警告 0     | [ ]  |
| TypeCheck（shared）  | `pnpm --filter @repo/shared typecheck`  | エラー 0              | [ ]  |
| TypeCheck（desktop） | `pnpm --filter @repo/desktop typecheck` | エラー 0              | [ ]  |
| TypeCheck（全体）    | `pnpm typecheck`                        | エラー 0              | [ ]  |
| テスト（Skill）      | `pnpm vitest run .../skill/__tests__/`  | 全件 PASS             | [ ]  |
| テスト（全体）       | `pnpm vitest run`                       | 全件 PASS             | [ ]  |
| 差分確認             | `git diff --stat main`                  | スコープ内 3 ファイル | [ ]  |
| `as any` 不在確認    | `grep "as any" SkillExecutor.ts`        | 0 件                  | [ ]  |
| `@ts-ignore` 不在    | `grep "@ts-ignore" SkillExecutor.ts`    | 0 件                  | [ ]  |

---

## 参照資料

| 参照資料           | パス                                         | 内容                 |
| ------------------ | -------------------------------------------- | -------------------- |
| Phase 1 要件定義書 | `outputs/phase-1/requirements-definition.md` | FR/NFR の参照        |
| Phase 7 カバレッジ | `outputs/phase-7/coverage-report.md`         | カバレッジ基準の確認 |
| Phase 8 DRY 分析   | `outputs/phase-8/dry-analysis.md`            | リファクタリング結果 |
| コード品質ルール   | `.claude/rules/02-code-quality.md`           | 品質基準の定義       |

---

## 実行手順

### Step 1: ESLint 実行

1. `pnpm --filter @repo/shared lint` を実行し、結果を記録する
2. `pnpm --filter @repo/desktop lint` を実行し、結果を記録する
3. エラーまたは警告がある場合は修正する

### Step 2: TypeScript 型チェック

1. `pnpm --filter @repo/shared typecheck` を実行し、結果を記録する
2. `pnpm --filter @repo/desktop typecheck` を実行し、結果を記録する
3. `pnpm typecheck` を実行し、全パッケージの結果を記録する
4. エラーがある場合は修正する

### Step 3: テスト全件実行

1. `pnpm vitest run apps/desktop/src/main/services/skill/__tests__/` を実行する
2. 全 7 テストファイルが PASS することを確認する
3. `pnpm vitest run` で全パッケージのテストを実行する
4. テスト失敗がある場合は原因を調査し修正する

### Step 4: 差分確認

1. `git diff --stat main` で変更ファイル一覧を確認する
2. スコープ外のファイルに変更がないことを確認する
3. 品質チェックマトリクスに全結果を記録する

### Step 5: 品質レポート作成

1. 品質チェックマトリクスの全項目の結果を記録する
2. `outputs/phase-9/quality-report.md` に出力する

---

## 成果物

| 成果物       | 説明                               | 配置先                              |
| ------------ | ---------------------------------- | ----------------------------------- |
| 品質レポート | 全チェック項目の実行結果と合否判定 | `outputs/phase-9/quality-report.md` |

---

## 統合テスト連携

品質保証の一環として、全テスト実行（ユニット + 統合）で型変更の影響がないことを最終確認する。

---

## 完了条件

- [ ] `pnpm --filter @repo/shared lint` がエラー・警告 0 件で成功している
- [ ] `pnpm --filter @repo/desktop lint` がエラー・警告 0 件で成功している
- [ ] `@typescript-eslint/no-explicit-any` 違反が 0 件であることが確認されている
- [ ] `pnpm --filter @repo/shared typecheck` がエラー 0 件で成功している
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 件で成功している
- [ ] `pnpm typecheck` が全パッケージでエラー 0 件で成功している
- [ ] `@ts-expect-error` / `@ts-ignore` が新規追加されていない
- [ ] SkillExecutor 関連テスト全 7 ファイルが PASS している
- [ ] `pnpm vitest run` で全パッケージのテストが PASS している
- [ ] `git diff --stat main` でスコープ外のファイルに変更がないことが確認されている
- [ ] 品質チェックマトリクスの全項目が PASS している
- [ ] 品質レポートが `outputs/phase-9/quality-report.md` に配置されている
- [ ] 本Phase内の全タスクを100%実行完了した

---

## 次Phase

**Phase 10: 最終レビューゲート** — 多角的品質・整合性の最終検証
