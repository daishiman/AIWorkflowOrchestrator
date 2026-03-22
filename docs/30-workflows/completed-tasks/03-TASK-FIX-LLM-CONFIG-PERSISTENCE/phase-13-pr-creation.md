# Phase 13: 完了

## メタ情報

| 項目          | 内容                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------ |
| Phase番号     | 13                                                                                               |
| 機能名        | LLM設定永続化修正 (TASK-FIX-LLM-CONFIG-PERSISTENCE)                                              |
| 作成日        | 2026-03-20                                                                                       |
| 担当          | -                                                                                                |
| ステータス    | 未着手                                                                                           |
| 前Phase成果物 | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-12-documentation.md` |

## 目的

成果物の最終確認を行い、PR を作成して TASK-FIX-LLM-CONFIG-PERSISTENCE を完了する。

## 実行タスク

### タスク1: 成果物の最終確認

#### 修正ファイルの確認

```bash
# 変更ファイルの確認
git diff --stat HEAD

# 変更内容の確認
git diff HEAD -- apps/desktop/src/renderer/store/index.ts
git diff HEAD -- apps/desktop/src/renderer/store/slices/llmSlice.ts
```

**確認チェックリスト**:

- [ ] `apps/desktop/src/renderer/store/index.ts`: partialize に `selectedProviderId` と `selectedModelId` が追加されている
- [ ] `apps/desktop/src/renderer/store/index.ts`: `version: 2` に更新されている
- [ ] `apps/desktop/src/renderer/store/index.ts`: `migrate` 関数が追加されている
- [ ] `apps/desktop/src/renderer/store/slices/llmSlice.ts`: `validateAndSyncPersistedConfig` 関数が実装されている
- [ ] `apps/desktop/src/renderer/store/slices/llmSlice.ts`: providers fetch 完了後に `syncSelectedConfigToMain()` が呼ばれている

#### テスト成果物の確認

```bash
# Phase 4/5/6 で作成したテストファイルの確認
find apps/desktop/src/renderer/store -name "*.test.ts" | sort

# 全テスト実行（最終確認）
cd apps/desktop && pnpm vitest run src/renderer/store/
```

**確認チェックリスト**:

- [ ] T1〜T8 の全テストファイルが存在する
- [ ] 全テストが PASS している

#### ドキュメント成果物の確認

```bash
# Phase 12 で作成したドキュメントの確認
ls docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/

# 実装ガイドの確認
cat docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/outputs/phase-12/implementation-guide.md | head -50
```

**確認チェックリスト**:

- [ ] `outputs/phase-12/implementation-guide.md` が作成されている（Part 1 + Part 2 の2パート構成）
- [ ] `outputs/phase-12/documentation-changelog.md` が作成されている
- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成されている

### タスク2: 最終品質チェック

```bash
# Lint
cd apps/desktop && pnpm lint

# TypeCheck
cd apps/desktop && pnpm typecheck

# セキュリティ最終確認
grep -A 15 "partialize" apps/desktop/src/renderer/store/index.ts | grep -v "apiKey\|token\|secret\|password"
```

### タスク3: コミット作成

```bash
# ステージング
git add apps/desktop/src/renderer/store/index.ts
git add apps/desktop/src/renderer/store/slices/llmSlice.ts
git add apps/desktop/src/renderer/store/__tests__/
git add apps/desktop/src/renderer/store/slices/__tests__/
git add docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/

# コミット（conventional commits 形式）
git commit -m "fix(store): persist selectedProviderId/ModelId across restarts

- Add selectedProviderId/selectedModelId to Zustand persist partialize
- Bump persist version v1 -> v2 with safe migration function
- Add validateAndSyncPersistedConfig (P62: null-clear on invalid provider)
- Call syncSelectedConfigToMain() after providers fetch completes

Closes #<issue-number>"
```

**コミットルール**:

- `--no-verify` は絶対に使用しない
- pre-commit hook（lint-staged）を必ず通す
- コミットメッセージは conventional commits 形式

### タスク4: PR 作成

```bash
# PR作成（gh CLI使用）
gh pr create \
  --title "fix(store): persist LLM selection across app restarts" \
  --body "$(cat << 'EOF'
## Summary
- Add `selectedProviderId` and `selectedModelId` to Zustand persist target
- Bump persist store version v1 → v2 with safe migration
- Add `validateAndSyncPersistedConfig()` with P62 protection (no DEFAULT_CONFIG fallback)
- Call `syncSelectedConfigToMain()` after providers fetch to sync restored config

## Test Plan
- [ ] Unit tests: T1-1 ~ T8-2 (24 test cases) all PASS
- [ ] Manual test: App restart retains provider/model selection (Scenario 1-5)
- [ ] Security: partialize does not include API keys or credentials
- [ ] Migration: v1 persisted data successfully migrates to v2

## Related
- Task: TASK-FIX-LLM-CONFIG-PERSISTENCE
- Design: docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-2-design.md
EOF
)" \
  --base main
```

**PRルール** (07-git-and-tooling.md より):

- PR タイトルは70文字以内
- PR 本文に Summary（1-3箇条書き）+ Test Plan を含める
- main ブランチに直接 push しない

### タスク5: GitHub Issue のクローズ（該当する場合）

```bash
# このタスクに対応する GitHub Issue が存在する場合
gh issue close <issue-number> --comment \
  "TASK-FIX-LLM-CONFIG-PERSISTENCE 完了。PR: <PR-URL>"
```

## 参照資料

### プロジェクトルール

| 資料名           | パス                                  |
| ---------------- | ------------------------------------- |
| Git & ツーリング | `.claude/rules/07-git-and-tooling.md` |

### 前Phase成果物

| 資料名                | パス                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| Phase 12 ドキュメント | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-12-documentation.md` |

## 実行手順

1. **タスク1の実施**: 修正ファイル・テスト・ドキュメントの成果物を最終確認する
2. **タスク2の実施**: Lint・TypeCheck・セキュリティチェックを最終実行する
3. **タスク3の実施**: コミットを作成する（`--no-verify` 禁止）
4. **タスク4の実施**: PR を作成する
5. **タスク5の実施**: GitHub Issue が存在する場合はクローズする

## 成果物

| 成果物                        | パス                                                                                           | 説明               |
| ----------------------------- | ---------------------------------------------------------------------------------------------- | ------------------ |
| Phase 13 仕様書（本ファイル） | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-13-pr-creation.md` | 完了フェーズ手順書 |
| コミット                      | git log HEAD                                                                                   | 修正内容のコミット |
| PR                            | GitHub PR URL                                                                                  | レビュー待ちのPR   |

## 完了条件

- [ ] 修正ファイル（store/index.ts, llmSlice.ts）の変更内容を最終確認した
- [ ] 全テスト（T1〜T8）が PASS していることを最終確認した
- [ ] Phase 12 の成果物（outputs/phase-12/implementation-guide.md 等）が存在することを確認した
- [ ] Lint・TypeCheck が通ることを最終確認した
- [ ] `--no-verify` を使わずにコミットを作成した
- [ ] PR を作成した（Summary + Test Plan を含む）
- [ ] GitHub Issue が存在する場合はクローズした

## タスク完了

TASK-FIX-LLM-CONFIG-PERSISTENCE のすべての Phase が完了。

**修正内容サマリ**:

1. `store/index.ts` の partialize に `selectedProviderId` / `selectedModelId` を追加
2. persist version v1 → v2 へ更新し、migrate 関数を追加
3. `llmSlice.ts` に `validateAndSyncPersistedConfig` を実装（P62: nullクリア）
4. providers fetch 完了後に `syncSelectedConfigToMain()` を呼び出す

**影響範囲**:

- アプリ再起動後のLLM選択が保持されるようになった
- 既存ユーザーの persist データは v2 migrate により安全に引き継がれる
- 無効な Provider ID は DEFAULT_CONFIG にフォールバックせず、null クリアされる
