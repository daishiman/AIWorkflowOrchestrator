# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 13                                           |
| タスクID   | UT-FIX-STORE-SETTINGS-DEEP-MERGE-001         |
| 機能名     | store-settings-deep-merge                    |
| タスク名   | settings:update ハンドラのディープマージ対応 |
| 前提Phase  | Phase 12                                     |
| 後続Phase  | -                                            |
| 作成日     | 2026-04-16                                   |
| ステータス | pending                                      |

## 目的

Phase 1〜12 の全作業成果を main ブランチへマージするための PR を作成し、
CI 全件 PASS を確認する。ユーザーの明示承認がある場合のみ PR 作成を実行する。

## 背景

`settings:update` IPCハンドラのシャローマージ問題（Issue #2197）に対して、
`deepMerge<T>` 関数の実装・テスト追加・ドキュメント更新を完了した。
本 Phase では変更内容を PR にまとめ、レビュー可能な状態にする。

## 注意事項（PR blocked ルール）

> **ユーザーの明示承認がない限り、PR 作成は blocked のままにする。**

以下の条件を全て満たした上でユーザー承認を得た場合のみ PR 作成へ進む。

| 前提条件                           | 確認状況 |
| ---------------------------------- | -------- |
| Phase 10 ゲート判定 PASS           | pending  |
| Phase 11 手動テスト PASS           | pending  |
| Phase 12 ドキュメント更新完了      | pending  |
| CI 全件 PASS（ユーザー承認後確認） | pending  |

## SubAgentチーム編成

| SubAgent   | 関心ごと     | 主担当                                                  |
| ---------- | ------------ | ------------------------------------------------------- |
| SubAgent-A | 変更サマリー | Phase 1〜12 の変更内容を整理し PR 本文を準備する        |
| SubAgent-B | ローカル確認 | ブランチ状態・コミット履歴・型チェック・lint を確認する |
| SubAgent-C | CI 確認      | PR 作成後に `gh run view` で CI 結果を確認する          |
| SubAgent-D | 統合監査     | 矛盾・漏れ・整合性・依存関係の最終確認を行う            |

## 実行タスク

- **変更サマリー確認**: Phase 5 の変更ファイル一覧（`outputs/phase-5/changed-files.md`）を確認し、PR に含まれる変更の全容を把握する
- **PR 作成準備**: PR 本文（タイトル・変更サマリー・関連 Issue・テスト結果・確認事項）を準備する
- **ローカル確認**: 作業ブランチが最新 main からの差分であることを確認し、typecheck / lint / テストが全件 PASS であることを確認する
- **PR 作成（ユーザー承認後）**: ユーザー承認後のみ `gh pr create` を実行する
- **CI 確認（ユーザー承認後）**: `gh run view` で CI 結果を確認し、全件 PASS を確認する
- **タスク完了処理**: Issue #2197 のコメントに PR 番号を記録する（クローズはしない）

## 参照資料

| 参照資料             | パス                                                     | 説明            |
| -------------------- | -------------------------------------------------------- | --------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`             | Phase 1 成果物  |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                 | Phase 1 成果物  |
| アーキテクチャ設計書 | `outputs/phase-2/architecture-design.md`                 | Phase 2 成果物  |
| IPC 契約設計書       | `outputs/phase-2/ipc-contract-design.md`                 | Phase 2 成果物  |
| テスト戦略書         | `outputs/phase-2/test-strategy.md`                       | Phase 2 成果物  |
| ゲート判定書         | `outputs/phase-3/gate-decision.md`                       | Phase 3 成果物  |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`              | Phase 5 成果物  |
| 変更ファイル一覧     | `outputs/phase-5/changed-files.md`                       | Phase 5 成果物  |
| 拡張テストケース     | `outputs/phase-6/expanded-test-cases.md`                 | Phase 6 成果物  |
| 回帰テスト結果       | `outputs/phase-6/regression-test-result.md`              | Phase 6 成果物  |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`                     | Phase 7 成果物  |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md`                     | Phase 8 成果物  |
| QA結果               | `outputs/phase-9/qa-results.md`                          | Phase 9 成果物  |
| 最終レビュー         | `outputs/phase-10/final-review.md`                       | Phase 10 成果物 |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                 | Phase 11 成果物 |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Phase 12 成果物 |
| 仕様書更新サマリー   | `outputs/phase-12/system-spec-update-summary.md`         | Phase 12 成果物 |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`            | Phase 12 成果物 |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | Phase 12 成果物 |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | Phase 12 成果物 |
| Phase12準拠チェック  | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 成果物 |

## 実行手順

### 1. ブランチ確認

```bash
# 作業ブランチと最新 main の差分確認
git log --oneline main..HEAD

# 未コミットの変更がないことを確認
git status
```

### 2. ローカル確認

```bash
# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint

# テスト実行
pnpm --filter @repo/desktop test
```

### 3. PR 作成準備（ユーザー承認前に準備）

PR タイトル:

```
fix(storeHandlers): settings:update ハンドラをディープマージ対応に修正 (#2197)
```

PR 本文テンプレート:

```markdown
## 変更サマリー

- `settings:update` IPCハンドラをshallow merge→deep merge対応に修正
- `deepMerge<T>` 関数を追加（配列上書き・null上書き・undefined省略）
- ネストオブジェクト部分更新のテストケースを追加（TC-01〜TC-05）

## 関連 Issue

Close #2197

## テスト結果

- 既存テスト: 全件 PASS
- 新規テスト（TC-01〜TC-05）: 全件 PASS
- カバレッジ: [Phase 7 結果を参照]

## 確認事項

- [ ] TypeScript 型チェック PASS
- [ ] Lint PASS
- [ ] 全テスト PASS
- [ ] CI パイプライン PASS
```

### 4. PR 作成（ユーザー承認後のみ実行）

> **この手順はユーザーの明示承認後のみ実行する。承認前は実行しないこと。**

```bash
gh pr create \
  --title "fix(storeHandlers): settings:update ハンドラをディープマージ対応に修正 (#2197)" \
  --body "$(cat <<'EOF'
## 変更サマリー

- `settings:update` IPCハンドラをshallow merge→deep merge対応に修正
- `deepMerge<T>` 関数を追加（配列上書き・null上書き・undefined省略）
- ネストオブジェクト部分更新のテストケースを追加（TC-01〜TC-05）

## 関連 Issue

Close #2197

## テスト結果

- 既存テスト: 全件 PASS
- 新規テスト（TC-01〜TC-05）: 全件 PASS
- カバレッジ: [Phase 7 結果を参照]

## 確認事項

- [ ] TypeScript 型チェック PASS
- [ ] Lint PASS
- [ ] 全テスト PASS
- [ ] CI パイプライン PASS
EOF
)"
```

### 5. CI 確認（ユーザー承認後・PR 作成後に実行）

```bash
# CI 結果確認
gh run view

# PR ステータス確認
gh pr status
```

### 6. タスク完了処理（CI 全件 PASS 後）

```bash
# Issue #2197 に PR 番号をコメント（クローズはしない）
gh issue comment 2197 --body "PR #<PR番号> を作成しました。CI 全件 PASS を確認済みです。"
```

## 統合テスト連携

| 判定項目              | 基準      | 結果    |
| --------------------- | --------- | ------- |
| TypeScript 型チェック | PASS      | pending |
| lint                  | 0 error   | pending |
| 全テスト              | 全件 PASS | pending |
| CI パイプライン       | 全件 PASS | pending |

## 多角的チェック観点

| 観点     | 確認内容                                                                                |
| -------- | --------------------------------------------------------------------------------------- |
| 矛盾     | PR 本文の変更サマリーと Phase 5 変更ファイル一覧が一致しているか確認する                |
| 漏れ     | Issue #2197 の受け入れ基準（AC-1〜AC-5）が全て満たされているか確認する                  |
| 整合性   | コミットメッセージが Phase 1〜12 の変更内容を正確に要約しているか確認する               |
| 依存関係 | Phase 10 ゲート PASS・Phase 11 手動テスト PASS が前提条件として満たされているか確認する |

## サブタスク管理

1. 参照資料（Phase 1〜12 成果物）の確認
2. ブランチ状態・ローカル確認（typecheck / lint / test）
3. PR 本文・タイトルの準備
4. ユーザー承認確認（blocked 解除待ち）
5. PR 作成（ユーザー承認後）
6. CI 確認（PR 作成後）
7. タスク完了処理（CI 全件 PASS 後）

## 成果物

| 成果物           | パス                                     | 説明                                            |
| ---------------- | ---------------------------------------- | ----------------------------------------------- |
| PR 準備情報      | `outputs/phase-13/pr-info.md`            | PR タイトル・本文・ローカル確認結果（常に作成） |
| PR 作成結果      | `outputs/phase-13/pr-creation-result.md` | PR URL・CI 結果（ユーザー承認後に作成）         |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | typecheck / lint / test の実行結果              |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | Phase 1〜12 の変更内容要約                      |

> **注意**: `outputs/phase-13/pr-creation-result.md` はユーザー承認後のみ作成する。
> 承認前は `outputs/phase-13/pr-info.md` の作成で止め、PR 作成は実行しないこと。

## 完了条件

- [ ] ローカル確認（typecheck / lint / test）が全件 PASS であることを確認した
- [ ] PR 本文・タイトルの準備が完了している
- [ ] ユーザーの明示承認を確認した（承認なしは blocked のまま）
- [ ] PR 作成後に CI 全件 PASS を確認した（ユーザー承認後）
- [ ] Issue #2197 に PR 番号をコメントした（クローズはしない）
- [ ] 矛盾がないことを確認した
- [ ] 漏れがないことを確認した
- [ ] 整合性が取れていることを確認した
- [ ] 依存関係が取れていることを確認した
- [ ] 本 Phase 内の全タスクを 100% 実行完了した

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了した
- [ ] `outputs/phase-13/pr-info.md` と `outputs/phase-13/local-check-result.md` を作成した
- [ ] `outputs/phase-13/change-summary.md` を作成した
- [ ] ユーザー承認の有無を記録した
- [ ] PR 作成はユーザー承認後のみ実行した（未承認の場合は blocked のまま）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認した
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-FIX-STORE-SETTINGS-DEEP-MERGE-001
```

## PR 作成制約

- ユーザーの明示承認がある場合だけ PR 作成へ進む。
- 明示承認がない場合は `outputs/phase-13/pr-info.md` の作成で終了する。
- CI が全件 PASS するまで PR をマージしない。

## 次Phase

Phase -: -（本タスク完了）
