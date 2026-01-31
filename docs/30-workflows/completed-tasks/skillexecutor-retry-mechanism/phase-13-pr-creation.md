# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目      | 内容                          |
| --------- | ----------------------------- |
| Phase     | 13                            |
| Phase名   | PR作成                        |
| カテゴリ  | 完了                          |
| 機能名    | skillexecutor-retry-mechanism |
| 作成日    | 2026-01-30                    |
| 前提Phase | Phase 12（ドキュメント更新）  |
| 後続Phase | なし（最終Phase）             |

## 目的

全Phaseの成果物をまとめてPull Requestを作成する。PR作成はユーザーの明示的な許可を得てから実行する。

---

## 実行タスク

### Task 1: ローカル最終検証

**目的**: PR作成前にローカルで全品質基準を最終確認する。

**手順**:

1. ビルド確認:
   ```bash
   pnpm --filter @repo/shared build
   pnpm --filter @repo/desktop build
   ```
2. テスト確認:
   ```bash
   pnpm --filter @repo/desktop test -- --run
   ```
3. 型チェック:
   ```bash
   pnpm --filter @repo/desktop typecheck
   pnpm --filter @repo/shared typecheck
   ```
4. Lint:
   ```bash
   pnpm --filter @repo/desktop lint
   pnpm --filter @repo/shared lint
   ```
5. 全コマンドがエラーなしで完了することを確認する

**期待される成果物**:

- ローカル検証結果（`outputs/phase-13/local-verification.md`）

### Task 2: 変更内容の整理

**目的**: PRに含まれる変更内容を整理する。

**手順**:

1. 変更ファイル一覧を作成する:
   ```bash
   git diff --stat main
   ```
2. 主要な変更内容を整理する:
   - `packages/shared/src/types/skill.ts`: RetryConfig型、RetryableErrorType型、RetryMessageContent型追加
   - `apps/desktop/src/main/services/skill/SkillExecutor.ts`: リトライ機構実装（executeWithRetry, isRetryableError, calculateBackoffDelay, sleep）
   - `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts`: リトライテスト67+ケース
   - システム仕様書更新（該当ファイル）

**期待される成果物**:

- 変更内容サマリー（`outputs/phase-13/change-summary.md`）

### Task 3: PR作成（ユーザー許可必須）

**目的**: Pull Requestを作成する。ユーザーの明示的な許可を得てから実行する。

**手順**:

1. **ユーザーに許可を求める**: PR作成の準備が完了したことを報告し、作成してよいか確認する
2. 許可が得られたら`/ai:diff-to-pr`を使用してPRを作成する
3. PR本文に以下を含める:
   - 変更概要
   - テスト結果サマリー
   - 破壊的変更の有無（なし）
   - 関連Issue（#584）

**期待される成果物**:

- PR（GitHub上）

### Task 4: CI/CD結果確認

**目的**: CI/CDパイプラインの結果を確認する。

**手順**:

1. PR作成後、CI/CDの実行を待つ
2. 全チェックがパスしていることを確認する
3. 失敗がある場合は原因を調査し修正する

**期待される成果物**:

- CI/CD確認結果（`outputs/phase-13/ci-results.md`）

---

## 参照資料

| 参照資料       | パス                                                                | 用途               |
| -------------- | ------------------------------------------------------------------- | ------------------ |
| Phase 12成果物 | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-12/` | ドキュメント       |
| /ai:diff-to-pr | diff-to-prスキル                                                    | PR作成ワークフロー |

---

## 成果物

| 成果物           | パス                                     | 種別     |
| ---------------- | ---------------------------------------- | -------- |
| ローカル検証結果 | `outputs/phase-13/local-verification.md` | document |
| 変更内容サマリー | `outputs/phase-13/change-summary.md`     | document |
| CI/CD確認結果    | `outputs/phase-13/ci-results.md`         | document |

---

## 完了条件

- [ ] ローカルでbuild, test, typecheck, lintが全てパスしている
- [ ] 変更内容が整理されている
- [ ] ユーザーの許可を得てPRが作成されている
- [ ] CI/CDが全パスしている
- [ ] 関連Issue（#584）がPRに紐付いている
- [ ] 本Phase内の全タスク（Task 1-4）を100%実行完了

---

## Phase完了時必須アクション

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/skillexecutor-retry-mechanism \
  --phase 13 \
  --artifacts "outputs/phase-13/change-summary.md:変更内容サマリー"
```

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skillexecutor-retry-mechanism --phase 13
```

---

## Phase実行記録

| 項目              | 内容 |
| ----------------- | ---- |
| 実行タスク        |      |
| 発見事項          |      |
| 次Phaseへの引継ぎ |      |

---

## 最終Phase

本Phaseが最終Phaseです。PR作成完了をもってタスク完了とします。
