# Phase 13: PR作成

## メタ情報

| 項目         | 内容                                    |
| ------------ | --------------------------------------- |
| フェーズ     | 13                                      |
| フェーズ名   | PR作成                                  |
| 目的         | `/ai:diff-to-pr` でコミット・PR・CI確認 |
| 前提フェーズ | Phase 12: ドキュメント更新              |
| 次フェーズ   | なし（タスク完了）                      |
| 想定成果物   | Pull Request                            |

---

## 1. 目的

全ての実装とドキュメント更新が完了した段階で、PRを作成しレビューを依頼する。

---

## 2. PR作成前チェックリスト

### 2.1 実装チェック

- [ ] specification.md §5.1 の全型が実装されている
- [ ] 既存型との後方互換性が維持されている
- [ ] エクスポートが正しく設定されている

### 2.2 品質チェック

- [ ] `pnpm --filter @repo/shared typecheck` が成功
- [ ] `pnpm --filter @repo/shared build` が成功
- [ ] `pnpm --filter @repo/shared test -- --run` が成功
- [ ] `pnpm --filter @repo/shared lint` がエラーなし

### 2.3 ドキュメントチェック

- [ ] 実装ガイドが作成されている
- [ ] 更新履歴が記録されている
- [ ] 未タスクレポートが作成されている

---

## 3. 実行タスク

### Task 13-1: 最終品質確認

**目的**: PR作成前の最終品質確認

**コマンド**:

```bash
# ビルド確認
pnpm --filter @repo/shared build

# 型チェック
pnpm --filter @repo/shared typecheck

# テスト
pnpm --filter @repo/shared test -- --run

# Lint
pnpm --filter @repo/shared lint

# 他パッケージへの影響確認
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/web typecheck
```

### Task 13-2: PR作成準備

**目的**: PR作成に必要な情報を整理

**PR情報**:
| 項目 | 内容 |
| ---------------- | -------------------------------------------------- |
| ブランチ名 | `task-1-1-type-definitions` |
| ベースブランチ | `main` |
| PRタイトル | `feat(shared): add skill import type definitions` |

**PR本文テンプレート**:

```markdown
## Summary

- Add type definitions for skill import feature (specification.md §5.1)
- Implement SkillMetadata, ImportedSkill, SkillStreamMessage types
- Add PermissionRequest/Response types for permission handling
- Maintain backward compatibility with existing Skill/SkillDetail types

## Test plan

- [ ] TypeScript strict mode compilation passes
- [ ] All unit tests pass
- [ ] Import from @repo/shared works in desktop/web packages
- [ ] JSDoc comments display correctly in IDE

---

Generated with [Claude Code](https://claude.com/claude-code)
```

### Task 13-3: PR作成

**重要**: PR作成はユーザーの明示的な許可を得てから実行すること

**手順**:

1. ユーザーに PR 作成の許可を求める
2. 許可を得たら `/ai:diff-to-pr` を実行
3. CI/CD の完了を待つ
4. マージ可能状態を確認

**PR作成コマンド（許可後）**:

```bash
# /ai:diff-to-pr skill を実行
# または手動で以下を実行

# 変更をステージング
git add packages/shared/src/types/skill.ts
git add packages/shared/src/types/__tests__/

# コミット
git commit -m "feat(shared): add skill import type definitions

- Add SkillMetadata, SkillSubResource, SkillOtherFile types
- Add ImportedSkill type for imported skills
- Add SkillExecutionRequest/Response types
- Add SkillStreamMessage Discriminated Union type
- Add PermissionRequest/Response types

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# リモートにプッシュ
git push -u origin task-1-1-type-definitions

# PR作成
gh pr create --title "feat(shared): add skill import type definitions" --body "$(cat <<'EOF'
## Summary

- Add type definitions for skill import feature (specification.md §5.1)
- Implement SkillMetadata, ImportedSkill, SkillStreamMessage types
- Add PermissionRequest/Response types for permission handling
- Maintain backward compatibility with existing Skill/SkillDetail types

## Test plan

- [ ] TypeScript strict mode compilation passes
- [ ] All unit tests pass
- [ ] Import from @repo/shared works in desktop/web packages
- [ ] JSDoc comments display correctly in IDE

---

Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Task 13-4: CI/CD確認

**目的**: CI/CDパイプラインの成功を確認

**確認項目**:

- [ ] ビルドジョブ成功
- [ ] テストジョブ成功
- [ ] Lintジョブ成功
- [ ] 型チェックジョブ成功

### Task 13-5: マージ可能状態確認

**目的**: PRがマージ可能な状態であることを確認

**確認項目**:

- [ ] 全CIジョブがパス
- [ ] コンフリクトなし
- [ ] レビュー承認（必要な場合）

---

## 4. 注意事項

### 4.1 PR作成に関する重要な注意

> **PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                                     | 理由                                           |
| -------------------------------------------- | ---------------------------------------------- |
| 勝手にPRを作成する                           | レビュー前の変更がリモートに反映されてしまう   |
| ユーザー確認なしで`/ai:diff-to-pr`を実行する | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする                   | 動作確認されていないコードがPRに含まれる       |

### 4.2 マージについて

- マージはユーザーがGitHub UIで手動実行
- CI/CD完了前のマージは行わない
- コンフリクトが発生した場合は報告

---

## 5. 参照資料

| 資料名             | パス                                               |
| ------------------ | -------------------------------------------------- |
| Git コミットガイド | CLAUDE.md                                          |
| PRテンプレート     | `.github/pull_request_template.md`（存在する場合） |

---

## 6. 完了条件

- [ ] Task 13-1 完了: 最終品質確認
- [ ] Task 13-2 完了: PR作成準備
- [ ] Task 13-3 完了: PR作成（ユーザー許可後）
- [ ] Task 13-4 完了: CI/CD確認
- [ ] Task 13-5 完了: マージ可能状態確認
- [ ] PR URLをユーザーに報告

---

## 7. 成果物

| 成果物       | パス          | 状態     |
| ------------ | ------------- | -------- |
| Pull Request | GitHub PR URL | 作成待ち |

---

## 8. 実行結果（実行時記入）

### 8.1 PR情報

| 項目     | 内容 |
| -------- | ---- |
| PR URL   | -    |
| PR番号   | -    |
| 作成日時 | -    |

### 8.2 CI/CD結果

| ジョブ     | 結果 |
| ---------- | ---- |
| ビルド     | -    |
| テスト     | -    |
| Lint       | -    |
| 型チェック | -    |

### 8.3 マージ状態

| 項目         | 状態 |
| ------------ | ---- |
| マージ可能   | -    |
| コンフリクト | -    |
| レビュー状態 | -    |

---

## 9. タスク完了処理【必須】

PR作成・CI確認後、以下のタスク完了処理を実行すること：

### 9.1 タスク仕様書の移動

```bash
# completed-tasks ディレクトリへ移動
mv docs/30-workflows/skill-import-agent-system/tasks/task-1-1-type-definitions \
   docs/30-workflows/skill-import-agent-system/completed-tasks/task-1-1-type-definitions
```

### 9.2 execution-plan.md の更新

`docs/30-workflows/skill-import-agent-system/execution-plan.md` のタスク状態を更新:

- [ ] TASK-1-1 の状態を `🟢 完了` に変更
- [ ] 完了日を記入
- [ ] 関連 PR 番号を記入

### 9.3 index.md の更新

`docs/30-workflows/skill-import-agent-system/index.md` を更新:

- [ ] 「完了タスク」セクションに TASK-1-1 を追加
- [ ] 関連リンクを更新

---

## 10. Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] タスク完了処理（§9）を実行

---

## 11. サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 13-1: 最終品質確認
3. Task 13-2: PR作成準備
4. Task 13-3: PR作成（ユーザー許可後）
5. Task 13-4: CI/CD確認
6. Task 13-5: マージ可能状態確認
7. タスク完了処理（completed-tasks移動）
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-23 | 初版作成 |
