# Phase 13: 完了・PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001 |
| Phase      | 13                                          |
| Phase名    | 完了・PR作成                                |
| カテゴリ   | 改善                                        |
| ステータス | not_started                                 |
| 前提Phase  | Phase 12（ドキュメント完了）                |
| 後続Phase  | なし（最終Phase）                           |

## 目的

全 Phase の成果物を最終確認し、Pull Request を作成してレビューに提出する。コードとドキュメントの整合性が保たれた状態で、マージ可能な PR を準備する。

## 実行タスク

- タスク1: 成果物の最終確認
- タスク2: ブランチ作成とコミット
- タスク3: PR 作成

### タスク1: 成果物の最終確認

**目的**: 全 Phase の成果物が揃っていること、受入基準（AC-1〜AC-7）が全て満たされていることを確認する

**手順**:

1. `artifacts.json` を確認し、全 Phase のステータスが完了であることを確認する
2. 受入基準の最終チェックを実施する:

| ID   | 基準                                                                    | 確認方法                                           | 状態 |
| ---- | ----------------------------------------------------------------------- | -------------------------------------------------- | ---- |
| AC-1 | `rg "debug-clear-storage"` の全検出箇所が分類済み                       | Phase 1 棚卸し結果 + Phase 11 手動テスト結果を確認 | [ ]  |
| AC-2 | 不要な workaround / stale comment が削除または降格済み                  | `git diff` で変更内容を確認                        | [ ]  |
| AC-3 | e2e global-setup / screenshot script が現行前提で正常動作               | Phase 11 テスト結果を確認                          | [ ]  |
| AC-4 | `verify-unassigned-links.js` が PASS                                    | Phase 11 テスト結果を確認                          | [ ]  |
| AC-5 | `audit-unassigned-tasks --target-file` で `currentViolations=0`         | Phase 11 テスト結果を確認                          | [ ]  |
| AC-6 | `task-workflow.md` / `lessons-learned.md` / 関連 system spec が同期済み | Phase 12 documentation-changelog を確認            | [ ]  |
| AC-7 | 全既存テストが PASS                                                     | Phase 11 テスト結果を確認                          | [ ]  |

3. Phase 12 の完了条件が全て満たされていることを再確認する:
   - [ ] LOGS.md 2ファイル更新済み（P1/P25 対策）
   - [ ] SKILL.md 2ファイル更新済み（P29 対策）
   - [ ] topic-map.md 再生成済み（P2/P27 対策）
   - [ ] `unassigned-task-report.md` 作成済み
   - [ ] documentation-changelog の全 Step 完了結果が記録済み

### タスク2: ブランチ作成とコミット

**目的**: 変更を適切なブランチにコミットする

**手順**:

1. ブランチを作成する（未作成の場合）:

   ```bash
   git checkout -b refactor/debug-clear-storage-shim-cleanup
   ```

   - ブランチ名プレフィックス: `refactor/`（残骸クリーンアップのため）

2. コミット前チェックを実施する:

   ```bash
   pnpm lint
   pnpm typecheck
   cd apps/desktop && pnpm vitest run
   ```

3. 変更をステージングしてコミットする:

   ```bash
   git add <変更ファイル一覧>
   git commit -m "refactor: debug-clear-storage 残骸クリーンアップ

   - repo-wide の debug-clear-storage 前提コードを棚卸し・削除
   - e2e global-setup / screenshot script から stale な storage clear を除去
   - 仕様書内の記述を historical note に降格
   - development-guidelines / lessons-learned を更新

   Refs: UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001"
   ```

4. **`--no-verify` は絶対に使用しない**
5. pre-commit / pre-push フックが失敗した場合は、原因を修正してから再コミットする

### タスク3: PR 作成

**目的**: レビュー用の Pull Request を作成する

**手順**:

1. リモートにプッシュする:

   ```bash
   git push -u origin refactor/debug-clear-storage-shim-cleanup
   ```

2. PR を作成する:

   ```bash
   gh pr create \
     --title "refactor: debug-clear-storage 残骸クリーンアップ" \
     --body "$(cat <<'EOF'
   ## Summary
   - `TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001` で削除済みの debug-clear-storage について、repo 全体に残存していた前提コード・workaround・stale comment を棚卸しし、不要なものを削除、仕様書記述を historical note に降格
   - e2e global-setup / screenshot script の storage clear 前提を除去し、現行前提で正常動作することを確認
   - development-guidelines に debug コード管理ルールを追加、lessons-learned に教訓を記録

   ## Test Plan
   - [ ] `rg "debug-clear-storage" apps/ scripts/` で検出件数が 0
   - [ ] e2e テストが正常動作すること
   - [ ] Zustand persist 状態がアプリ再起動後も保持されること
   - [ ] `verify-unassigned-links.js` が PASS
   - [ ] 全テストスイートが PASS
   - [ ] system spec とコードの整合性が保たれていること

   **Task ID**: UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001
   EOF
   )"
   ```

3. PR タイトルが70文字以内であることを確認する
4. PR 本文に Summary（1-3 箇条書き）と Test Plan が含まれていることを確認する
5. PR URL を記録する

## 参照資料

| 参照資料         | パス                                                                                        | 説明               |
| ---------------- | ------------------------------------------------------------------------------------------- | ------------------ |
| Phase 12 成果物  | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-12/`                      | ドキュメント成果物 |
| Phase 11 成果物  | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-11/`                      | 手動テスト結果     |
| Phase 1 受入基準 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-1/acceptance-criteria.md` | AC-1〜AC-7 定義    |
| artifacts.json   | `docs/30-workflows/debug-clear-storage-shim-cleanup/artifacts.json`                         | 全Phase成果物管理  |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                          | 内容                   |
| ---------------- | ----------------------------------------------------------------------------- | ---------------------- |
| 開発ガイドライン | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | コミット前チェック手順 |
| 教訓集           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`        | 教訓追加の最終確認     |

## 成果物

| 成果物           | パス                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------- |
| PR URL           | （PR作成後に記録）                                                                       |
| 最終確認チェック | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-13/final-checklist.md` |

## 完了条件

- [ ] 受入基準 AC-1〜AC-7 が全て満たされていること
- [ ] Phase 12 の完了条件が全て満たされていることを再確認済み
- [ ] `pnpm lint` が PASS
- [ ] `pnpm typecheck` が PASS
- [ ] 全テストスイートが PASS
- [ ] ブランチが `refactor/` プレフィックスで作成されていること
- [ ] コミットに `--no-verify` を使用していないこと
- [ ] PR タイトルが70文字以内であること
- [ ] PR 本文に Summary + Test Plan が含まれていること
- [ ] PR URL が記録されていること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

なし（最終 Phase）。PR がマージされたらタスク完了。
