# Phase 13: PR作成

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase番号  | 13                           |
| Phase名    | PR作成                       |
| 目的       | コミット・PR・CI確認         |
| 前提Phase  | Phase 12（ドキュメント更新） |
| 推定作業量 | 小                           |

---

## 1. 目的

型エクスポート検証タスクの成果物をコミットし、Pull Requestを作成してCI確認を行う。

---

## 2. 実行タスク

### Task 13-1: 変更内容の確認

#### 目的

コミット対象の変更内容を確認する。

#### 確認コマンド

```bash
# 変更ファイルの一覧
git status

# 変更内容の確認
git diff --cached
git diff
```

#### 変更対象（想定）

| カテゴリ       | 変更ファイル                                  | 内容               |
| -------------- | --------------------------------------------- | ------------------ |
| 修正（必要時） | `packages/shared/src/services/graph/index.ts` | export追加         |
| 修正（必要時） | `apps/desktop/src/**/*.ts`                    | インポートパス修正 |
| ドキュメント   | `outputs/phase-*/`                            | 各Phase成果物      |

#### 成果物

| 成果物         | 配置先                               |
| -------------- | ------------------------------------ |
| 変更内容確認書 | `outputs/phase-13/change-summary.md` |

#### 完了条件

- [ ] 変更ファイルが全て特定されている
- [ ] 不要なファイルが含まれていない

---

### Task 13-2: コミット作成

#### 目的

変更内容をコミットする。

#### コミットメッセージ形式

```
fix(@repo/shared): Community型エクスポート検証完了

- @repo/shared から @repo/desktop への型インポート検証
- 型チェック・ビルド・pre-push hook全てPASS
- インポートパス修正（必要に応じて）

Closes #373

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

#### コミット手順

```bash
# 変更をステージング
git add packages/shared/src/services/graph/index.ts
git add apps/desktop/src/  # 修正があれば
git add docs/30-workflows/shared-type-export-03-verification/

# コミット作成
git commit -m "$(cat <<'EOF'
fix(@repo/shared): Community型エクスポート検証完了

- @repo/shared から @repo/desktop への型インポート検証
- 型チェック・ビルド・pre-push hook全てPASS

Closes #373

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

#### 成果物

| 成果物       | 配置先                              |
| ------------ | ----------------------------------- |
| コミット記録 | `outputs/phase-13/commit-record.md` |

#### 完了条件

- [ ] コミットが作成されている
- [ ] コミットメッセージが適切
- [ ] 不要なファイルがコミットされていない

---

### Task 13-3: PR作成（ユーザー許可必須）

> **重要**: PR作成は必ずユーザーの明示的な許可を得てから実行すること。

#### 目的

Pull Requestを作成する。

#### PR作成前チェックリスト

- [ ] ユーザーからPR作成の許可を得ている
- [ ] ローカルでのビルド・テストが成功している
- [ ] コミットが正しく作成されている

#### PR作成コマンド

```bash
# リモートにプッシュ
git push -u origin docs/shared-type-export-03-spec

# PR作成
gh pr create --title "fix(@repo/shared): Community型エクスポート検証完了" --body "$(cat <<'EOF'
## Summary

- @repo/shared から @repo/desktop への型インポート検証
- 型チェック・ビルド・pre-push hook全てPASS
- SHARED-TYPE-EXPORT-03タスク完了

## Test plan

- [x] `pnpm typecheck` 成功
- [x] `pnpm build` 成功
- [x] pre-push hook通過

## Related

- Closes #373
- Part 1: SHARED-TYPE-EXPORT-01（型整理）
- Part 2: SHARED-TYPE-EXPORT-02（メインエクスポート）

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

#### 成果物

| 成果物     | 配置先                          |
| ---------- | ------------------------------- |
| PR作成記録 | `outputs/phase-13/pr-record.md` |

#### 完了条件

- [ ] PRが作成されている
- [ ] PR内容が適切
- [ ] 関連Issueがリンクされている

---

### Task 13-4: CI確認

#### 目的

CI/CDパイプラインが成功することを確認する。

#### 確認項目

| 確認項目         | コマンド            | 期待結果 |
| ---------------- | ------------------- | -------- |
| GitHub Actions   | `gh pr checks`      | 全PASS   |
| ビルドステータス | GitHub PR画面で確認 | 成功     |
| Lintステータス   | GitHub PR画面で確認 | 成功     |

#### 確認コマンド

```bash
# PRのステータス確認
gh pr status

# CIチェック結果確認
gh pr checks
```

#### 成果物

| 成果物     | 配置先                          |
| ---------- | ------------------------------- |
| CI確認結果 | `outputs/phase-13/ci-result.md` |

#### 完了条件

- [ ] 全CIチェックがPASS
- [ ] マージ可能状態になっている

---

## 3. 参照資料

### Phase 11/12成果物

| 成果物                  | 参照目的     |
| ----------------------- | ------------ |
| verification-report.md  | 検証結果     |
| implementation-guide.md | ドキュメント |

### 関連Issue

| Issue番号 | 内容                    |
| --------- | ----------------------- |
| #373      | Community型エクスポート |

---

## 4. 成果物一覧

| 成果物         | ファイル名          | 必須 |
| -------------- | ------------------- | ---- |
| 変更内容確認書 | `change-summary.md` | ✅   |
| コミット記録   | `commit-record.md`  | ✅   |
| PR作成記録     | `pr-record.md`      | ✅   |
| CI確認結果     | `ci-result.md`      | ✅   |

---

## 5. 完了条件

### 機能要件

- [ ] 変更内容が確認されている
- [ ] コミットが作成されている
- [ ] PRが作成されている（ユーザー許可後）
- [ ] CIが成功している

### 品質要件

- [ ] コミットメッセージが適切
- [ ] PR内容が適切
- [ ] 全CIチェックがPASS

### Phase完了時の必須アクション

1. 上記成果物を `outputs/phase-13/` に出力
2. artifacts.json の phase-13 ステータスを更新
3. 各タスクを100%実行し、完遂した旨を明記
4. PR URLをユーザーに報告

---

## 6. 重要な注意事項

### PR作成の許可

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                               | 理由                                           |
| -------------------------------------- | ---------------------------------------------- |
| 勝手にPRを作成する                     | レビュー前の変更がリモートに反映されてしまう   |
| ユーザー確認なしで`/ai:diff-to-pr`実行 | 意図しないブランチやコミットが作成される可能性 |

### マージについて

**マージはユーザーがGitHub UIで手動実行**

- 本タスクではPR作成までが対象
- マージはレビュー後にユーザーが判断
