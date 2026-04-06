# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 9                                       |
| 機能名 | Playwright E2E 動的テストフレームワーク |
| 作成日 | 2026-03-31                              |

## 目的

Layer 1 / Layer 2 / 既存 Chromium の統合確認を行い、加えて mirror parity（`.claude` 正本と `.agents` mirror の一致）・link 検証・line budget を一括判定して品質を保証する。

## 実行タスク

- `ui-ux-layer1` の完走確認を行う
- `ui-ux-layer2` の完走確認を行う
- 既存 `chromium` プロジェクトが壊れていないことを確認する
- 必要に応じて再実行条件を記録する
- `.claude/skills/task-specification-creator/scripts/` と `.agents/skills/task-specification-creator/scripts/` の mirror parity を確認する（`diff -qr` で差分ゼロを確認）
- `phase-*.md` のリンク（参照パス）が実在するファイルを指しているか確認する

## 参照資料

| 資料名                | パス                                                 | 説明         |
| --------------------- | ---------------------------------------------------- | ------------ |
| Phase 7 baseline      | [phase-7-baseline.md](phase-7-baseline.md)           | 比較対象     |
| Phase 8 script update | [phase-8-script-update.md](phase-8-script-update.md) | 実行ロジック |

## 実行手順

1. Layer 1 を実行する。
2. Layer 2 を実行する。
3. Chromium を実行する。
4. 失敗時はどの lane が壊れたかを切り分ける。
5. mirror parity を確認する: `diff -qr .claude/skills/task-specification-creator/scripts .agents/skills/task-specification-creator/scripts`
6. 差分がある場合は `rsync` で同期する

## 統合テスト連携

- Phase 7 の baseline が正しいことを前提にする
- Phase 10 の README へ実行結果を反映する

## 多角的チェック観点（AIが判断）

| 観点       | 確認内容                                                 |
| ---------- | -------------------------------------------------------- |
| システム   | Phase 4〜8 の依存が閉じているか                          |
| 戦略・価値 | 変更が既存テストへ波及していないか                       |
| 問題解決   | 失敗したときの再実行ルートが明確か                       |
| 品質保証   | `.claude` と `.agents` の mirror parity が保たれているか |
| 品質保証   | phase-\*.md のリンクが実在するパスを指しているか         |

## サブタスク管理

1. Layer 1 実行
2. Layer 2 実行
3. Chromium 実行
4. 失敗分析

## 成果物

| 成果物           | パス                                         | 説明                        |
| ---------------- | -------------------------------------------- | --------------------------- |
| 統合テスト結果   | `outputs/phase-9/integration-test-report.md` | 実行結果                    |
| 実行ログ要約     | `outputs/phase-9/execution-summary.md`       | 波及有無の記録              |
| 品質保証サマリー | `outputs/phase-9/quality-summary.md`         | mirror parity・link検証結果 |

## 完了条件

- [ ] Layer 1 が完走している
- [ ] Layer 2 が完走している
- [ ] Chromium が完走している
- [ ] 再実行条件が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 統合テストの全結果が残っている
- [ ] baseline と script update の整合が確認できている
- [ ] Phase 10 に引き継げる状態である

## 次のPhase

Phase 10: 最終レビュー
