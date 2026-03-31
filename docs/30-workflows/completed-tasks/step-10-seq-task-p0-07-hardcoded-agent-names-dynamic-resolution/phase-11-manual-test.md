# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 11                                       |
| 機能名 | hardcoded-agent-names-dynamic-resolution |
| 作成日 | 2026-03-29                               |

## 目的

本タスクは runtime 内部契約の是正であり UI 変更を含まない。Phase 11 では Electron 画面確認の代わりに、manifest 実運用経路と legacy 経路の両方が current facts 通りに動くことを手動で確認し、非視覚エビデンスとして記録する。

## 実行タスク

- 手動テストチェックリストの作成
- 手動テストの実施
- 発見された問題の記録

## 参照資料

| 資料名   | パス       | 説明     |
| -------- | ---------- | -------- |
| index.md | `index.md` | 受入基準 |

## 実行手順

### ステップ1: テストチェックリストを作成する

受入基準に基づき、手動テストのチェックリストを作成する。

### ステップ2: 手動テストを実施する

UI 変更なしのため、runtime 対象テストと型検証を実行し、manifest custom agent 名が plan/improve の system prompt に反映されることを確認する。

### ステップ3: 発見された問題を記録する

問題があれば discovered-issues.md に記録する。

## 成果物

| 成果物                | パス                                        | 説明                 |
| --------------------- | ------------------------------------------- | -------------------- |
| manual test checklist | `outputs/phase-11/manual-test-checklist.md` | 非視覚チェックリスト |
| manual test result    | `outputs/phase-11/manual-test-result.md`    | 非視覚テスト結果     |
| discovered issues     | `outputs/phase-11/discovered-issues.md`     | 発見された問題       |

## 完了条件

- [ ] 手動テストチェックリストが作成されている
- [ ] 手動テストが実施されている
- [ ] 発見された問題が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**
