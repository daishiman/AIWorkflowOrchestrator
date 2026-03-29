# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                                   |
| ---------- | ------------------------------------ |
| Phase      | 11                                   |
| Phase名    | 手動テスト                           |
| 前提Phase  | Phase 10                             |
| 後続Phase  | Phase 12                             |
| ステータス | spec_created                         |
| 作成日     | 2026-03-29                           |
| 機能名     | task-rt-02-api-key-ui-adapter-status |
| タスク分類 | UI task                              |

## 目的

APIキー管理画面で、接続状態表示と retry UX が期待どおりに見えるかを人手で検証する。

## 実行タスク

- シナリオ実行: ready / initializing / failed / retry を確認する
- a11y 確認: キーボード操作と読み上げ導線を確認する
- evidence 取得: screenshot と手順結果を保存する

## 手動テストシナリオ

| #   | シナリオ                       | 期待結果                                          |
| --- | ------------------------------ | ------------------------------------------------- |
| 1   | API key 未登録 provider を表示 | 登録導線のみ表示される                            |
| 2   | 登録済み provider の初回確認   | `initializing` 表示後に `ready/failed` へ収束する |
| 3   | 接続成功ケース                 | `ready` 表示になる                                |
| 4   | 接続失敗ケース                 | `failed` 表示と retry CTA が出る                  |
| 5   | retry 実行                     | 対象行だけ loading し、結果が更新される           |
| 6   | ライト/ダークテーマ切替        | 可読性が維持される                                |
| 7   | save/delete 後の再読込         | provider 行と health 表示が整合する               |

## アクセシビリティ検証

| 確認項目                           | 結果 |
| ---------------------------------- | ---- |
| retry button に Tab で到達できる   | [ ]  |
| Enter / Space で retry 実行できる  | [ ]  |
| status が読み上げ対象になる        | [ ]  |
| 色だけに依存しない表示になっている | [ ]  |

## 統合テスト連携【必須】

手動で UI / preload / Main の通し動作を確認する。

## 参照資料

| 参照資料          | パス                                                                                        | 内容       |
| ----------------- | ------------------------------------------------------------------------------------------- | ---------- |
| screenshot ガイド | `.claude/skills/task-specification-creator/references/phase-11-screenshot-guide.md`         | 撮影ルール |
| verification 手順 | `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md` | 検証ルール |

## 成果物

| 成果物                   | パス                                        | 説明            |
| ------------------------ | ------------------------------------------- | --------------- |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | シナリオ結果    |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | a11y と確認観点 |
| スクリーンショット群     | `outputs/phase-11/screenshots/`             | UI evidence     |

## 完了条件

- [ ] 主要シナリオが実行されている
- [ ] a11y 検証が完了している
- [ ] evidence が保存されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 12: ドキュメント更新
