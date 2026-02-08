# Phase 13: PR作成

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| Phase    | 13                                        |
| タスクID | TASK-FIX-1-2-SKILLEXECUTOR-TYPE-CLEANUP   |
| タスク名 | SkillExecutor内の重複型定義を共有型に統一 |
| 分類     | リファクタリング                          |
| 機能名   | skillexecutor-type-cleanup                |
| 作成日   | 2026-02-07                                |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後にPRを作成
- CI確認: CIが通過したことを確認
- タスク完了処理: タスクディレクトリをcompleted-tasksに移動

## 参照資料

| 資料名               | パス                                          | 説明           |
| -------------------- | --------------------------------------------- | -------------- |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | Phase 12成果物 |

---

## 実行手順

### Step 1: ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼内容**:

````markdown
## ローカル動作確認のお願い

PR作成前に、以下の確認をお願いします:

1. **型チェック**
   ```bash
   pnpm typecheck
   ```
````

2. **ビルド**

   ```bash
   pnpm --filter @repo/shared build
   pnpm --filter @repo/desktop build
   ```

3. **テスト実行**

   ```bash
   pnpm test
   ```

4. **アプリ起動確認**（任意）
   ```bash
   pnpm --filter @repo/desktop dev
   ```

問題がなければ、PR作成を進めます。

````

### Step 2: 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**サマリーテンプレート**:

```markdown
## 変更サマリー

### タスク情報
- タスクID: TASK-FIX-1-2-SKILLEXECUTOR-TYPE-CLEANUP
- タスク名: SkillExecutor内の重複型定義を共有型に統一
- 分類: リファクタリング

### 変更ファイル
1. `apps/desktop/src/main/services/skill/SkillExecutor.ts`
   - ローカル型定義を削除
   - @repo/sharedからの型importに統一

2. `packages/shared/src/types/skill-system/skill-executor.ts`
   - 共有型定義を追加（または既存型を更新）

### 影響範囲
- 外部インターフェース: 変更なし
- 動作: 変更なし（リファクタリングのみ）

### テスト結果
- 型チェック: PASS
- ユニットテスト: PASS
- 手動テスト: PASS

---

**PR作成を進めてよろしいですか？**
````

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### Step 3: PR作成（ユーザー許可後）

ユーザーの許可を得た後、PRを作成する。

#### 方法1: /ai:diff-to-pr スキルを使用

```
/ai:diff-to-pr
```

#### 方法2: gh CLI を使用（フォールバック）

```bash
# 現在のブランチ名を確認
git branch --show-current

# 変更をステージング
git add .

# コミット
git commit -m "refactor(skill): SkillExecutor内の重複型定義を共有型に統一

- SkillExecutor.tsのローカル型定義を削除
- @repo/sharedの共有型定義に統一
- 外部インターフェース変更なし

TASK-FIX-1-2-SKILLEXECUTOR-TYPE-CLEANUP"

# リモートにプッシュ
git push -u origin $(git branch --show-current)

# PR作成
gh pr create \
  --title "refactor(skill): SkillExecutor内の重複型定義を共有型に統一" \
  --body "## Summary
- SkillExecutor.ts内のローカル型定義6つを削除
- @repo/sharedの共有型定義に統一
- 外部インターフェース変更なし（リファクタリングのみ）

## Test plan
- [x] 型チェック（pnpm typecheck）
- [x] ユニットテスト（pnpm test）
- [x] ビルド確認（pnpm build）
- [x] 手動テスト（Phase 11完了）

## Related
- タスクID: TASK-FIX-1-2-SKILLEXECUTOR-TYPE-CLEANUP
"
```

### Step 4: CI確認

PRが作成されたら、CIの結果を確認する。

```bash
# PR一覧を確認
gh pr list

# PR のステータスを確認
gh pr checks <PR番号>

# CI結果を確認
gh pr view <PR番号> --web
```

**確認項目**:

- [ ] Lint チェックがPASS
- [ ] 型チェックがPASS
- [ ] テストがPASS
- [ ] ビルドが成功

### Step 5: タスク完了処理【必須】

**PRが作成され、CIが通過した後**、タスクディレクトリを完了タスクフォルダに移動する。

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-FIX-1-2-skillexecutor-type-cleanup/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-FIX-1-2

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-FIX-1-2-skillexecutor-type-cleanupをcompleted-tasksに移動"
git push
```

---

## PR情報記録

PR作成後、以下の情報を `outputs/phase-13/pr-info.md` に記録:

```markdown
# PR情報

## 基本情報

- PR番号: #XXX
- PR URL: https://github.com/xxx/xxx/pull/XXX
- 作成日時: 2026-02-07 HH:MM:SS
- ブランチ: feature/skillexecutor-type-cleanup → main

## CI結果

- Lint: PASS
- TypeCheck: PASS
- Test: PASS
- Build: PASS

## レビューステータス

- レビュー待ち / 承認済み / マージ済み
```

---

## 成果物

| 成果物 | パス                          | 説明             |
| ------ | ----------------------------- | ---------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL・CI結果等 |

---

## 完了条件

### ローカル確認依頼

- [ ] ユーザーにローカル動作確認を依頼している

### PR作成許可

- [ ] 変更サマリーを提示している
- [ ] ユーザーから**明示的な許可**を得ている

### PR作成・CI

- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] PR URLが記録されている
- [ ] CIが全て通過している
  - [ ] Lint PASS
  - [ ] TypeCheck PASS
  - [ ] Test PASS
  - [ ] Build PASS

### タスク完了処理

- [ ] タスクディレクトリが `docs/30-workflows/completed-tasks/` に移動されている
- [ ] 移動コミットがプッシュされている

### 全体

- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

---

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. ユーザーにローカル動作確認を依頼
2. 変更サマリーの提示
3. ユーザーからのPR作成許可待ち
4. PR作成（許可後）
5. CI結果確認
6. pr-info.md作成
7. タスクディレクトリの移動
8. 移動コミット・プッシュ
9. 完了条件の検証

---

## 禁止事項

- [ ] **ユーザー許可なしでのPR作成禁止**
- [ ] `--no-verify` オプションの使用禁止
- [ ] `git push --force` の使用禁止

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全作業を100%完了
- [ ] PR URLが取得できている
- [ ] CIが全てPASS
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] pr-info.mdが作成されている

---

## 次のPhase

なし（ワークフロー完了）
