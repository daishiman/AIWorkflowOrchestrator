# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 11                          |
| 機能名 | conversational-interview-ui |
| 作成日 | 2026-03-29                  |

## 目的

実際の Electron アプリ上で手動テストを実施し、ユーザー体験を確認する。

## 実行タスク

- 手動テストチェックリストの作成
- 手動テストの実施
- 発見された問題の記録
- 代表スクリーンショットまたは NON_VISUAL の判定と理由の記録

## 参照資料

| 資料名   | パス       | 説明     |
| -------- | ---------- | -------- |
| index.md | `index.md` | 受入基準 |

## 実行手順

### ステップ1: テストチェックリストを作成する

受入基準に基づき、手動テストのチェックリストを作成する。

### ステップ2: 手動テストを実施する

Electron アプリを起動し、チェックリストに従ってテストを実施する。

### ステップ3: 発見された問題を記録する

問題があれば discovered-issues.md に記録する。

### ステップ4: evidence 方針を確定する

UI task のため、原則は representative screenshots を取得する。取得できない場合のみ NON_VISUAL とし、理由を `manual-test-report.md` に記録する。

## テストケース

- TC-11-01: 初学者モードで会話型インタビューが開始できる
- TC-11-02: `single_select` / `multi_select` / `confirm` / `free_text` / `secret` が各 UI で操作できる
- TC-11-03: undo と progress 表示が動作する
- TC-11-04: keyboard 操作で回答できる
- NV-11-01: 画面全景ではなく代表 UI 状態を evidence として扱う

## 画面カバレッジマトリクス

| テストケース | UI 状態                  | evidence 方針             | 証跡ファイル                 |
| ------------ | ------------------------ | ------------------------- | ---------------------------- |
| TC-11-01     | 開始直後の会話 UI        | representative screenshot | `screenshots/TC-11-01-*.png` |
| TC-11-02     | 各 input kind の操作状態 | representative screenshot | `screenshots/TC-11-02-*.png` |
| TC-11-03     | undo / progress 表示状態 | representative screenshot | `screenshots/TC-11-03-*.png` |
| TC-11-04     | keyboard フォーカス状態  | representative screenshot | `screenshots/TC-11-04-*.png` |
| NV-11-01     | 非視覚検証の補助確認     | NON_VISUAL                | `manual-test-report.md`      |

## 成果物

| 成果物                | パス                                        | 説明                       |
| --------------------- | ------------------------------------------- | -------------------------- |
| manual test checklist | `outputs/phase-11/manual-test-checklist.md` | テストチェックリスト       |
| manual test result    | `outputs/phase-11/manual-test-result.md`    | テスト結果                 |
| manual test report    | `outputs/phase-11/manual-test-report.md`    | evidence 方針と所見        |
| discovered issues     | `outputs/phase-11/discovered-issues.md`     | 発見された問題             |
| screenshot plan       | `outputs/phase-11/screenshot-plan.json`     | 代表スクリーンショット計画 |

## 完了条件

- [ ] 手動テストチェックリストが作成されている
- [ ] 手動テストが実施されている
- [ ] 発見された問題が記録されている
- [ ] evidence 方針（representative / NON_VISUAL）が記録されている
- [ ] テストケースと画面カバレッジマトリクスが記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 12: ドキュメント更新
