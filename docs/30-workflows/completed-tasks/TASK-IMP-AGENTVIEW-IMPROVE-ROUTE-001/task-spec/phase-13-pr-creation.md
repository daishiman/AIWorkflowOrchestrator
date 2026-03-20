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

全 Phase の成果物を最終確認し、ユーザーの明示承認がある場合のみ PR 作成へ進める状態にする。

## 実行タスク

- Task 1: Phase 1〜12 の成果物と `artifacts.json` を最終確認する
- Task 2: lint / typecheck / test の事前条件を再確認する
- Task 3: git 状態を確認して報告可能なサマリーを作る
- Task 4: ユーザー承認があるまで待機する
- Task 5: 承認後だけ PR を作成する

### Task 1: 成果物最終確認

- [ ] Phase 1〜12 の全成果物が揃っていることを確認
- [ ] `artifacts.json` の全 Phase ステータスが「完了」であることを確認
- [ ] `outputs/phase-4/` はテスト計画、`outputs/phase-5/` は実装サマリーであることを確認

### Task 2: コミット前チェックリスト確認

- [ ] `pnpm lint` が通ること
- [ ] `pnpm typecheck` が通ること
- [ ] 関連テストが全て PASS すること
- [ ] `outputs/phase-13/local-check-result.md` に結果を記録する

### Task 3: ブランチ状態確認

- [ ] `git status` で状態を確認する
- [ ] `git diff --stat` で変更ファイルの一覧を確認する
- [ ] `outputs/phase-13/change-summary.md` に変更要約を記録する

### Task 4: ユーザー許可待ち

- [ ] 実装した機能のサマリーを報告する
- [ ] 変更ファイル一覧、テスト結果、カバレッジを報告する
- [ ] ユーザーから「PR を作成してください」の指示を受けるまで待機する
- [ ] 許可がない場合は blocked 理由を `outputs/phase-13/final-summary.md` に記録する

### Task 5: PR 作成（ユーザー許可後のみ）

- [ ] ブランチ名を確認する
- [ ] リモートにプッシュする
- [ ] PR を作成し、URL を記録する
- [ ] `outputs/phase-13/pr-info.md` と `outputs/phase-13/pr-creation-result.md` を記録する

## 参照資料

| 参照資料            | パス                                                     | 内容                                     |
| ------------------- | -------------------------------------------------------- | ---------------------------------------- |
| Phase 1（要件定義） | `phase-1-requirements.md`                                | 最終的に満たす AC を確認する             |
| Phase 2（設計）     | `phase-2-design.md`                                      | 採択した設計方針を最終サマリーへ反映する |
| Phase 5（実装）     | `phase-5-implementation.md`                              | 実装対象と禁止事項を最終確認する         |
| Phase 6 成果物      | `outputs/phase-6/test-additions.md`                      | 追加テスト内容を確認する                 |
| Phase 7 成果物      | `outputs/phase-7/gate-result.md`                         | coverage gate を確認する                 |
| Phase 8 成果物      | `outputs/phase-8/refactoring-log.md`                     | リファクタリング結果を確認する           |
| Phase 9 成果物      | `outputs/phase-9/qa-summary.md`                          | 品質ゲート結果を確認する                 |
| Phase 10 成果物     | `outputs/phase-10/review-result.md`                      | review 判定を確認する                    |
| Phase 11 成果物     | `outputs/phase-11/manual-test-result.md`                 | 手動テスト結果を確認する                 |
| Phase 12 成果物     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 完了条件を確認する              |

## 統合テスト連携

- Phase 1〜12 で積み上げた evidence が AC と 1:1 で結び付くことを最終確認する
- 差分・未達・未タスクがある場合は PR 作成へ進まず、戻り先 Phase を明記する

## 成果物

```
outputs/phase-13/
  local-check-result.md
  change-summary.md
  final-summary.md
  pr-info.md                 # ユーザー承認後のみ作成
  pr-creation-result.md      # ユーザー承認後のみ作成
  pr-url.txt                 # ユーザー承認後のみ作成
```

## 完了条件

- [ ] 全 Phase の成果物確認済み
- [ ] `outputs/phase-13/local-check-result.md` と `outputs/phase-13/change-summary.md` が作成済み
- [ ] ユーザー許可の有無と blocked 理由または PR 実行結果が `outputs/phase-13/final-summary.md` に記録済み
- [ ] ユーザーが PR 作成を承認した場合のみ `outputs/phase-13/pr-info.md` / `outputs/phase-13/pr-creation-result.md` / `pr-url.txt` が作成済み
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク完了

TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 の全 Phase（1〜13）が完了。
