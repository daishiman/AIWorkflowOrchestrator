# Phase 13: PR作成

## メタ情報

| 項目         | 内容                       |
| ------------ | -------------------------- |
| フェーズ     | 13                         |
| フェーズ名   | PR作成                     |
| 目的         | コミット・PR・CI確認       |
| 前提フェーズ | Phase 12: ドキュメント更新 |
| 次フェーズ   | なし（タスク完了）         |
| 想定成果物   | PR URL                     |

---

## 1. 目的

実装完了したコードをコミットし、Pull Requestを作成する。

**重要**: PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。

---

## 2. 事前確認

### 2.1 ローカル確認チェックリスト

PR作成前に以下を全て確認すること:

| #   | 確認項目             | コマンド                                   | 状態 |
| --- | -------------------- | ------------------------------------------ | ---- |
| 1   | ビルドが成功する     | `pnpm --filter @repo/shared build`         | [ ]  |
| 2   | 全テストがパスする   | `pnpm --filter @repo/shared test -- --run` | [ ]  |
| 3   | 型チェックがパスする | `pnpm --filter @repo/shared typecheck`     | [ ]  |
| 4   | Lintエラーがない     | `pnpm --filter @repo/shared lint`          | [ ]  |
| 5   | フォーマットが正しい | `pnpm --filter @repo/shared format:check`  | [ ]  |

### 2.2 変更ファイル確認

```bash
git status
git diff --stat
```

**期待される変更ファイル**:

- [ ] `packages/shared/src/constants/security.ts` - 新規
- [ ] `packages/shared/src/constants/index.ts` - 新規
- [ ] `packages/shared/src/constants/__tests__/security.test.ts` - 新規
- [ ] `packages/shared/src/index.ts` - 更新
- [ ] `docs/30-workflows/completed-tasks/task-2c-security-patterns/` - 新規（ドキュメント）

---

## 3. 実行タスク

### Task 13-1: 変更の最終確認

**目的**: コミット前の最終確認を行う

**手順**:

```bash
# 変更ファイル一覧
git status

# 差分確認
git diff

# ステージング前のクリーンアップ
pnpm --filter @repo/shared build
pnpm --filter @repo/shared test -- --run
pnpm --filter @repo/shared lint
```

### Task 13-2: ユーザー確認

**目的**: PR作成の許可を得る

**確認内容**:

> 以下の変更をコミットし、PRを作成してよいですか？
>
> **変更ファイル**:
>
> - `packages/shared/src/constants/security.ts` (新規)
> - `packages/shared/src/constants/index.ts` (新規)
> - `packages/shared/src/constants/__tests__/security.test.ts` (新規)
> - `packages/shared/src/index.ts` (更新)
>
> **コミットメッセージ**:
>
> ```
> feat(shared): add security patterns for skill execution
>
> - Add DANGEROUS_PATTERNS constant (bash commands, protected paths)
> - Add ALLOWED_TOOLS_WHITELIST constant
> - Add utility functions (isDangerousCommand, isProtectedPath, etc.)
> - Add unit tests for all security functions
>
> Closes: TASK-2C
> ```

### Task 13-3: PR作成

**目的**: `/ai:diff-to-pr` コマンドを使用してPRを作成する

**手順**:

1. ユーザーの許可を確認
2. `/ai:diff-to-pr` コマンドを実行
3. PR URLを記録

**PR テンプレート**:

```markdown
## Summary

- Add security pattern definitions for skill execution safety
- Implement dangerous command detection
- Implement protected path detection
- Add allowed tools whitelist validation

## Changes

- New: `packages/shared/src/constants/security.ts`
- New: `packages/shared/src/constants/index.ts`
- New: `packages/shared/src/constants/__tests__/security.test.ts`
- Updated: `packages/shared/src/index.ts`

## Test plan

- [x] Unit tests for isDangerousCommand()
- [x] Unit tests for isProtectedPath()
- [x] Unit tests for matchGlobPattern()
- [x] Unit tests for validateAllowedTools()
- [x] Unit tests for filterAllowedTools()
- [x] Build verification
- [x] Type check verification

## Related

- Task: TASK-2C
- Blocks: TASK-3-1 (Skill Executor)
```

### Task 13-4: CI確認

**目的**: CIが正常に完了することを確認する

**確認項目**:

- [ ] ビルドジョブ成功
- [ ] テストジョブ成功
- [ ] Lintジョブ成功
- [ ] 型チェックジョブ成功

---

## 4. 禁止事項

| 禁止事項                              | 理由                                     |
| ------------------------------------- | ---------------------------------------- |
| 勝手にPRを作成する                    | レビュー前の変更がリモートに反映される   |
| ユーザー確認なしで実行する            | 意図しないコミットが作成される可能性     |
| ローカル確認をスキップする            | 動作確認されていないコードがPRに含まれる |
| `--force` や `--no-verify` を使用する | 安全性チェックがスキップされる           |

---

## 5. 参照資料

| 資料名         | パス                               |
| -------------- | ---------------------------------- |
| PRテンプレート | `.github/pull_request_template.md` |
| CI設定         | `.github/workflows/`               |
| コミット規約   | `CONTRIBUTING.md`                  |

---

## 6. 完了条件

- [ ] Task 13-1 完了: 変更の最終確認
- [ ] Task 13-2 完了: ユーザー確認（明示的な許可取得）
- [ ] Task 13-3 完了: PR作成
- [ ] Task 13-4 完了: CI確認
- [ ] PR URLが記録されている
- [ ] CIが全てパス

---

## 7. 統合テスト連携【必須】

> **N/A**: 本タスクは定数・ユーティリティ関数のみのため、統合テスト連携は対象外です。

---

## 8. 成果物

| 成果物         | パス                                 | 状態     |
| -------------- | ------------------------------------ | -------- |
| PR URL         | -                                    | 作成待ち |
| タスク完了報告 | `outputs/task-completion-summary.md` | 作成待ち |

---

## 9. Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100%実行完了
- [ ] 各タスクを 100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] PR URLを記録

---

## 10. サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. Task 13-1: 変更の最終確認
2. Task 13-2: ユーザー確認
3. Task 13-3: PR作成（ユーザー許可後）
4. Task 13-4: CI確認
5. タスク完了報告作成
6. 完了条件の検証

**重要**:

- 各サブタスクは実行完了後すぐに completed に更新すること
- Task 13-3 はユーザーの明示的な許可後にのみ実行すること

---

## 11. タスク完了報告

PR作成・CI確認後、以下のフォーマットで完了報告を作成:

```markdown
# TASK-2C: セキュリティパターン定義 - 完了報告

## 概要

スキル実行時のセキュリティチェックに使用するパターン定義を実装しました。

## 成果物

- `packages/shared/src/constants/security.ts`
- `packages/shared/src/constants/index.ts`
- `packages/shared/src/constants/__tests__/security.test.ts`

## テスト結果

- 全テストパス: ✅
- カバレッジ: XX%

## PR

- URL: [PR #XXX](https://github.com/...)
- CI: ✅ All checks passed

## 次のタスク

- TASK-3-1: スキル実行エンジン（このタスクがブロック解除）
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
