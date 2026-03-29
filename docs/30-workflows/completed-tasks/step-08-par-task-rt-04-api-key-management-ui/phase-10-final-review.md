# Phase 10: 最終レビュー

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 10                    |
| 機能名     | api-key-management-ui |
| 作成日     | 2026-03-29            |
| ステータス | pending               |

## 目的

AC、blocker、open issue を最終確認し、Phase 11 実施条件を固定する。

## 実行タスク

- AC 充足マトリクスを作る
- blocker を判定する
- Phase 11 実施条件を整理する

## 参照資料

| 資料名  | パス                           | 説明     |
| ------- | ------------------------------ | -------- |
| Phase 7 | `phase-7-coverage-check.md`    | coverage |
| Phase 9 | `phase-9-quality-assurance.md` | quality  |

## 実行手順

### ステップ1: AC 判定

1. AC-1〜AC-6 を PASS / MINOR / FAIL で判定する。

### ステップ2: blocker 判定

1. 手動テストを止める blocker を抽出する。
2. 未タスクへ送る軽微差分を分ける。

### ステップ3: handoff

1. Phase 11 で確認すべき TC-ID を固定する。
2. screenshot 対象状態を固定する。

## 統合テスト連携

- Phase 11 の TC-11-01〜03 と `outputs/phase-11/manual-test-result.md` を同期する。
- screenshot coverage と metadata を Phase 12 実装ガイドから参照できる状態にする。
- fallback capture を使用した場合は再撮影タスクを未タスクとして formalize する。
- 自動テスト（`ApiKeySettingsPanel.test.tsx`）と手動 TC-ID（TC-11-01〜03）の対応表を `outputs/phase-10/final-review-result.md` に記録する。
- CI 未実行やローカル実行不能（例: esbuild platform mismatch）は blocker か MINOR かを明示し、Phase 11 へ持ち越す条件を明記する。

## 成果物

| 成果物              | パス                                      | 説明       |
| ------------------- | ----------------------------------------- | ---------- |
| final review result | `outputs/phase-10/final-review-result.md` | 判定表     |
| gate decision       | `outputs/phase-10/gate-decision.md`       | 実施可否   |
| open issues         | `outputs/phase-10/open-issues.md`         | 未解決事項 |

## 完了条件

- [ ] AC 判定マトリクスがある
- [ ] blocker と MINOR が分離されている
- [ ] Phase 11 の確認項目が固定されている
- [ ] **本Phase内の全タスクを100%実行完了**
