# Phase 13: 完了・PR 作成

## メタ情報

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| タスクID | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001             |
| フェーズ | Phase 13                                         |
| 機能名   | agentview-improve-route                          |
| 作成日   | 2026-03-17                                       |
| 依存     | Phase 12 成果物（outputs/phase-12/、全完了済み） |

## 目的

全 Phase の成果物を最終確認し、PR を作成してレビュー依頼を行う。

> 重要: PR 作成はユーザーの明示的な許可を得てから実行する。

## 実行タスク

### Task 1: 成果物最終確認

- [ ] Phase 1〜12 の全成果物が `outputs/` 配下に揃っていることを確認
- [ ] `artifacts.json` の全 Phase ステータスが「完了」であることを確認
- [ ] 以下の成果物が存在することを確認:
  - `outputs/phase-1/` — 要件定義
  - `outputs/phase-2/` — 設計
  - `outputs/phase-3/` — 設計レビュー（PASS）
  - `outputs/phase-4/` — テストコード
  - `outputs/phase-5/` — 実装コード
  - `outputs/phase-6/` — テスト拡充
  - `outputs/phase-7/` — カバレッジ確認（PASS）
  - `outputs/phase-8/` — リファクタリング
  - `outputs/phase-9/` — 品質検証（全PASS）
  - `outputs/phase-10/` — 最終レビュー（PASS or MINOR）
  - `outputs/phase-11/` — 手動テスト（全PASS）
  - `outputs/phase-12/` — ドキュメント

### Task 2: コミット前チェックリスト確認

- [ ] `pnpm lint` が通ること
- [ ] `pnpm typecheck` が通ること
- [ ] 関連テストが全て PASS すること
- [ ] `--no-verify` を使っていないこと（禁止）

### Task 3: ブランチ状態確認

- [ ] `git status` でステージング状態を確認
- [ ] `git diff --stat` で変更ファイルの一覧を確認
- [ ] コミットすべきでないファイル（`.env`、シークレット等）が含まれていないことを確認

### Task 4: ユーザー許可待ち

> PR 作成前にユーザーの明示的な許可が必要です。

- [ ] ユーザーに以下を報告する:
  - 実装した機能のサマリー（AgentView CTA バナー、SkillAnalysisView ナビゲーション）
  - 変更ファイル一覧
  - テスト結果（PASS数）
  - カバレッジ数値
- [ ] ユーザーから「PR を作成してください」の指示を受けるまで待機

### Task 5: PR 作成（ユーザー許可後）

- [ ] ブランチ名を確認（`feature/agentview-improve-route` 等）
- [ ] リモートにプッシュ: `git push -u origin <branch-name>`
- [ ] PR を作成:

  ```bash
  gh pr create \
    --title "feat(agentview): 改善 CTA バナーと SkillAnalysisView ナビゲーション追加" \
    --body "$(cat <<'EOF'
  ## Summary
  - AgentView に改善 CTA バナーを追加（表示条件: `isExecutionComplete && selectedSkillName`）
  - SkillAnalysisView に `onNavigateBack` / `onNavigateToAgent` コールバックを追加
  - P31 対策として個別セレクタのみを使用

  ## Test Plan
  - [ ] AgentView CTA バナーの表示/非表示が仕様通りであることを確認
  - [ ] SkillAnalysisView からの戻り導線が正常に動作することを確認
  - [ ] ライト/ダークモードで表示が正常であることを確認
  - [ ] `pnpm test` が全 PASS であることを確認

  ## Related Task
  TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001
  EOF
  )"
  ```

- [ ] PR URL をユーザーに報告

### Task 6: PR 作成後の確認

- [ ] PR の CI チェックが通過していることを確認
- [ ] レビュアーを設定（該当する場合）
- [ ] 未タスク（Phase 12 Task 4 で検出）の GitHub Issue が作成されていることを確認

## 参照資料

- Phase 12 成果物: `outputs/phase-12/`
- Git & ツーリングルール: `.claude/rules/07-git-and-tooling.md`（PR 作成ルール）
- CLAUDE.md（`--no-verify` 禁止）

## 実行手順

1. Task 1〜3 で最終確認を実施
2. Task 4 でユーザーへ報告・許可を待つ
3. 許可を受けたら Task 5 で PR を作成
4. Task 6 で PR 後の確認を実施

## 成果物

```
outputs/phase-13/
  final-summary.md    # 全Phase完了サマリー（実装内容・テスト結果・カバレッジ）
  pr-url.txt          # 作成した PR の URL
```

## 完了条件

- [ ] 全 Phase の成果物確認済み
- [ ] コミット前チェックリストが全 PASS
- [ ] ユーザーから PR 作成の許可を取得済み
- [ ] PR が作成済み（URL が記録済み）
- [ ] CI チェックが通過
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク完了

TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 の全 Phase（1〜13）が完了。
