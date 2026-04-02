# Phase 13: PR 作成

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 13                                         |
| 機能名 | ut-safety-gov-disclosure-runtime-injection |
| 作成日 | 2026-04-02                                 |

## 目的

ユーザーの明示承認後、PR を作成して CI を確認する。
タスクディレクトリを completed-tasks に移動してタスクを完了とする。

## 実行タスク

- タスク1: ユーザー承認確認【必須・このPhase開始前】
- タスク2: ブランチ作成と最終コミット確認
- タスク3: PR 作成
- タスク4: CI 確認
- タスク5: タスクディレクトリの移動

## 実行手順

### ステップ1: ユーザー承認確認

**注意**: このフェーズはユーザーが「PR を作成してください」と明示的に指示するまで実行しない。

### ステップ2: ブランチ作成と最終コミット確認

```bash
# ブランチ作成（未作成の場合）
git checkout -b feat/ut-safety-gov-disclosure-runtime-injection-001

# 変更ファイルの確認
git status
git diff --stat

# コミット状況の確認
git log --oneline -5
```

期待する変更ファイル:

| ファイル                                                         | 変更種別 |
| ---------------------------------------------------------------- | -------- |
| `apps/desktop/src/main/ipc/index.ts`                             | 修正     |
| `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` | 新規     |

### ステップ3: PR 作成

```bash
gh pr create \
  --title "feat(disclosure): UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001 — disclosure情報をruntime注入" \
  --body "$(cat <<'EOF'
## Summary

- `getDisclosureInfo()` のplaceholder実装を廃止し、`IAuthModeService` から runtime の authMode を取得して disclosure 情報を動的に返すよう変更
- `buildDisclosureInfo(authModeService: IAuthModeService)` 純粋関数を `ipc/index.ts` に実装
- subscription モード → `"Claude Code CLI"`, api-key モード → `"Anthropic API"`, 未設定 → `"unknown"` の3パターン対応
- `disclosureHandlers.test.ts` を新規作成し AC-1〜AC-7 をユニットテストで検証
- DENY-5 準拠: API key / token を renderer に返さない設計を維持

## 関連 Issue

Closes #1804

## 変更ファイル

- `apps/desktop/src/main/ipc/index.ts` — L907-918 の TODO(DI) placeholder を `buildDisclosureInfo` に差し替え
- `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` — 新規ユニットテスト（AC-1〜AC-7 検証）

## Test plan

- [ ] `pnpm --filter @repo/desktop test -- --run` で全テスト PASS を確認
- [ ] `pnpm --filter @repo/desktop lint` で lint エラーなしを確認
- [ ] `pnpm --filter @repo/desktop typecheck` で型エラーなしを確認
- [ ] Electron アプリを起動し、subscription / api-key モードで disclosure 表示を手動確認（Phase 11 スクリーンショット参照）

## Screenshots

Phase 11 の手動テスト証跡: `outputs/phase-11/screenshots/`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### ステップ4: CI 確認

```bash
# CI ステータス確認
gh pr checks

# PR 情報確認
gh pr view
```

CI が全て PASS するまで確認する。

CI が FAIL した場合の対応:

| CI 失敗種別      | 対応方法                                                       |
| ---------------- | -------------------------------------------------------------- |
| lint エラー      | Phase 8 相当の修正を行い、追加コミットをプッシュする           |
| typecheck エラー | Phase 8 相当の修正を行い、追加コミットをプッシュする           |
| テスト失敗       | Phase 6 相当の修正を行い、追加コミットをプッシュする           |
| ビルドエラー     | `pnpm --filter @repo/desktop build` でローカル確認してから修正 |

### ステップ5: タスクディレクトリの移動

**注意**: CI 全 PASS 確認後に実施する。

```bash
# タスクディレクトリを completed-tasks に移動
mv docs/30-workflows/completed-tasks/ut-safety-gov-disclosure-runtime-injection \
   docs/30-workflows/completed-tasks/

git add docs/30-workflows/
git commit -m "chore(disclosure): UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001 — タスクディレクトリをcompleted-tasksへ移動"
git push
```

## 参照資料

| 資料名                    | パス                                                                                                  | 説明                            |
| ------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------- |
| Phase 11 手動テスト証跡   | `outputs/phase-11/`                                                                                   | PR 本文のスクリーンショット参照 |
| Phase 12 ドキュメント更新 | `phase-12-documentation.md`                                                                           | 関連 Issue の完了確認           |
| 実装ファイル              | `apps/desktop/src/main/ipc/index.ts`                                                                  | PR 変更対象                     |
| テストファイル            | `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts`                                      | PR 変更対象                     |
| unassigned-task 仕様書    | `docs/30-workflows/completed-tasks/unassigned-task/UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001.md` | Issue #1804 の元仕様            |

## 統合テスト連携【必須】

| 判定項目                 | 基準 | 結果   |
| ------------------------ | ---- | ------ |
| ユニットテストLine       | 80%+ | 未計測 |
| ユニットテストBranch     | 60%+ | 未計測 |
| ユニットテストFunction   | 80%+ | 未計測 |
| 結合テストAPI            | 100% | 未計測 |
| 結合テストシナリオ正常系 | 100% | 未計測 |
| 結合テストシナリオ異常系 | 80%+ | 未計測 |
| CI 全通過                | 100% | -      |

## 成果物

| 成果物  | パス                          | 説明                  |
| ------- | ----------------------------- | --------------------- |
| PR 情報 | `outputs/phase-13/pr-info.md` | PR URL・CI 結果の記録 |

## 完了条件

- [ ] ユーザーの明示承認が得られている
- [ ] ブランチ `feat/ut-safety-gov-disclosure-runtime-injection-001` が作成されている
- [ ] PR が作成されている（タイトル: `feat(disclosure): UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001 — disclosure情報をruntime注入`）
- [ ] CI が全て PASS している
- [ ] タスクディレクトリが `completed-tasks/` に移動されている
- [ ] PR 情報が `outputs/phase-13/pr-info.md` に記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

| タスク                     | 状態 | 備考 |
| -------------------------- | ---- | ---- |
| ユーザー承認確認           | -    | -    |
| ブランチ作成・コミット確認 | -    | -    |
| PR 作成                    | -    | -    |
| CI 確認                    | -    | -    |
| タスクディレクトリ移動     | -    | -    |
| PR 情報ファイル作成        | -    | -    |

## タスク完了

すべての Phase が完了し、PR がマージされた時点でタスク `UT-SAFETY-GOV-DISCLOSURE-RUNTIME-INJECTION-001` は完了となる。
