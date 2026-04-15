# Phase 11: 手動テスト（VISUAL）

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 11                                   |
| Phase名    | 手動テスト（VISUAL）                 |
| 対象機能   | TASK-CRON-CUSTOM-VALIDATION-001      |
| 前提Phase  | Phase 10: 最終レビューゲート（PASS） |
| 次Phase    | Phase 12: ドキュメント更新           |
| ステータス | pending                              |
| 作成日     | 2026-04-14                           |

## タスク分類

**分類: VISUAL（UIタスク）**

本タスクは `VisualCronPicker` コンポーネントの direct input モードにバリデーション機能を追加するUI変更を含む。Phase 11 は**省略不可**であり、実際のElectronアプリでの動作確認とスクリーンショット取得が必須である。

## 目的

Electronアプリを起動し、スケジュール設定画面で direct input モードのバリデーション動作を実地確認する。SC-01〜SC-05 のスクリーンショットを取得し、UIの視覚的な正しさを証明する。

## 実行タスク

| Task      | 内容                                                                 |
| --------- | -------------------------------------------------------------------- |
| Task 11-1 | Electronアプリ起動確認                                               |
| Task 11-2 | スケジュール設定画面でのdirect inputモード切替確認                   |
| Task 11-3 | SC-01〜SC-05のスクリーンショット取得                                 |
| Task 11-4 | 手動テストチェックリスト記録                                         |
| Task 11-5 | スクリーンショット計画・キャプチャメタデータ作成（taskType: VISUAL） |

## 参照資料

| 資料名          | パス                                                                 | 用途                 |
| --------------- | -------------------------------------------------------------------- | -------------------- |
| Phase 10 成果物 | `outputs/phase-10/final-review-result.md`                            | 最終レビュー結果確認 |
| 実装ファイル    | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx` | 動作確認対象         |

## 実行手順

### 1. Electronアプリ起動

```bash
# 開発モードでアプリを起動
pnpm --filter @repo/desktop dev
```

アプリが正常に起動し、メインウィンドウが表示されることを確認する。

### 2. スケジュール設定画面への遷移

1. アプリのメイン画面からスケジュール設定画面を開く
2. VisualCronPicker コンポーネントが表示されていることを確認する
3. 初期状態（visual モード）でバリデーションが正常に動作していることを確認する

### 3. スクリーンショット取得

以下の5つのシナリオでスクリーンショットを取得する:

| SC ID | 操作手順                                                   | 期待結果                                     |
| ----- | ---------------------------------------------------------- | -------------------------------------------- |
| SC-01 | 「高度な設定」ボタンをクリックしてdirect inputモードへ切替 | 初期値cron式が有効な状態でエラーなし         |
| SC-02 | テキスト入力欄を空にする                                   | エラーメッセージ（role="alert"）が表示される |
| SC-03 | `0 9 * *`（4フィールド）を入力                             | syntax エラーが表示される                    |
| SC-04 | `0 9 0 * *` を入力                                         | day-of-month エラーが表示される              |
| SC-05 | `0 9 15 * *` を入力                                        | エラーなし正常状態                           |

### 4. スクリーンショット保存

```
outputs/phase-11/screenshot-plan.json
outputs/phase-11/screenshots/
├── phase11-capture-metadata.json
├── SC-01_direct-input-initial.png
├── SC-02_empty-input-error.png
├── SC-03_syntax-error-4fields.png
├── SC-04_day-of-month-zero-error.png
└── SC-05_valid-cron-no-error.png
```

### 5. 手動テストチェックリスト

| #   | テスト項目                                              | 期待結果                       | 判定    |
| --- | ------------------------------------------------------- | ------------------------------ | ------- |
| 1   | アプリが正常に起動する                                  | メインウィンドウ表示           | pending |
| 2   | スケジュール設定画面が開ける                            | VisualCronPicker表示           | pending |
| 3   | 「高度な設定」ボタンでdirect inputモードに切替可能      | テキスト入力欄表示             | pending |
| 4   | 有効なcron式で初期表示（SC-01）                         | エラーなし                     | pending |
| 5   | 空文字入力でエラー表示（SC-02）                         | role="alert"でエラーメッセージ | pending |
| 6   | 4フィールドcron式でsyntaxエラー（SC-03）                | エラーメッセージ表示           | pending |
| 7   | day-of-month=0でエラー（SC-04）                         | エラーメッセージ表示           | pending |
| 8   | 有効なcron式で正常表示（SC-05）                         | エラー解消                     | pending |
| 9   | visual モードに戻すとバリデーション状態がリセットされる | directInputError消失           | pending |

### 6. screenshot-plan.json と phase11-capture-metadata.json 作成

`outputs/phase-11/screenshot-plan.json` に撮影計画を記録し、撮影後の実測メタデータを
`outputs/phase-11/screenshots/phase11-capture-metadata.json` に保存する。

```json
{
  "taskId": "TASK-CRON-CUSTOM-VALIDATION-001",
  "taskType": "VISUAL",
  "phase": 11,
  "captureDate": "2026-04-14",
  "screenshots": [
    {
      "id": "SC-01",
      "filename": "SC-01_direct-input-initial.png",
      "description": "direct inputモード切替直後の初期状態",
      "expectedState": "有効なcron式でエラーなし"
    },
    {
      "id": "SC-02",
      "filename": "SC-02_empty-input-error.png",
      "description": "空文字入力時のエラー表示",
      "expectedState": "role=alert でエラーメッセージ表示"
    },
    {
      "id": "SC-03",
      "filename": "SC-03_syntax-error-4fields.png",
      "description": "4フィールドcron式入力時のsyntaxエラー",
      "expectedState": "フィールド数エラーメッセージ表示"
    },
    {
      "id": "SC-04",
      "filename": "SC-04_day-of-month-zero-error.png",
      "description": "day-of-month=0入力時のエラー",
      "expectedState": "day-of-monthエラーメッセージ表示"
    },
    {
      "id": "SC-05",
      "filename": "SC-05_valid-cron-no-error.png",
      "description": "有効なcron式入力時の正常状態",
      "expectedState": "エラーなし正常表示"
    }
  ]
}
```

`phase11-capture-metadata.json` には、実際の取得時刻・取得対象・ファイル名・判定結果を記録する。

## 統合テスト連携

| 判定項目                    | 基準         | 結果    |
| --------------------------- | ------------ | ------- |
| Electronアプリ起動          | 正常起動     | pending |
| direct inputモード切替      | 動作OK       | pending |
| SC-01〜SC-05取得            | 全件取得済み | pending |
| エラー表示/非表示の目視確認 | 期待通り     | pending |

## 多角的チェック観点

| 観点             | 確認内容                                                       |
| ---------------- | -------------------------------------------------------------- |
| 視認性           | エラーメッセージが見やすいフォントサイズ・色で表示されているか |
| レイアウト       | エラーメッセージ表示時にレイアウトが崩れないか                 |
| アニメーション   | モード切替時にちらつきや不自然な遷移がないか                   |
| レスポンシブ     | ウィンドウリサイズ時にバリデーションUIが適切に追従するか       |
| アクセシビリティ | スクリーンリーダーでエラーメッセージが読み上げられるか         |

## 成果物

| 成果物                       | パス                                                             | 説明                                     |
| ---------------------------- | ---------------------------------------------------------------- | ---------------------------------------- |
| 手動テストチェックリスト     | `outputs/phase-11/manual-test-checklist.md`                      | テスト項目と判定結果                     |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md`                         | VISUAL宣言・テスト結果・証跡サマリ       |
| 手動テストレポート           | `outputs/phase-11/manual-test-report.md`                         | 手動テストの総合レポート                 |
| VISUAL結果                   | `outputs/phase-11/visual-test-result.md`                         | VISUAL 証跡の要点と判定                  |
| UIビジュアルレビュー         | `outputs/phase-11/ui-sanity-visual-review.md`                    | 画面見た目・レイアウト・レスポンシブ確認 |
| スクリーンショット計画       | `outputs/phase-11/screenshot-plan.json`                          | taskType: "VISUAL" を含むキャプチャ計画  |
| スクリーンショットカバレッジ | `outputs/phase-11/screenshot-coverage.md`                        | SC-01〜SC-05 の被覆状況                  |
| 発見課題                     | `outputs/phase-11/discovered-issues.md`                          | 追加で検出した論点と対応方針             |
| スクリーンショットメタデータ | `outputs/phase-11/screenshots/phase11-capture-metadata.json`     | 実測メタデータ                           |
| SC-01画像                    | `outputs/phase-11/screenshots/SC-01_direct-input-initial.png`    | 初期状態のスクリーンショット             |
| SC-02画像                    | `outputs/phase-11/screenshots/SC-02_empty-input-error.png`       | 空文字入力時のスクリーンショット         |
| SC-03画像                    | `outputs/phase-11/screenshots/SC-03_syntax-error-4fields.png`    | 4フィールド入力時のスクリーンショット    |
| SC-04画像                    | `outputs/phase-11/screenshots/SC-04_day-of-month-zero-error.png` | day-of-month=0 のスクリーンショット      |
| SC-05画像                    | `outputs/phase-11/screenshots/SC-05_valid-cron-no-error.png`     | 有効なcron式のスクリーンショット         |

> **注意**: VISUAL タスクのため `screenshots/` ディレクトリを作成し、SC-01〜SC-05 を保存すること。

## 完了条件

- [ ] Electronアプリが正常に起動すること
- [ ] スケジュール設定画面が開けること
- [ ] direct inputモードに切替できること
- [ ] SC-01: 初期状態でエラーなし（スクリーンショット取得済み）
- [ ] SC-02: 空文字入力でエラー表示（スクリーンショット取得済み）
- [ ] SC-03: 4フィールドcron式でsyntaxエラー（スクリーンショット取得済み）
- [ ] SC-04: day-of-month=0でエラー（スクリーンショット取得済み）
- [ ] SC-05: 有効cron式で正常状態（スクリーンショット取得済み）
- [ ] `screenshot-plan.json` に `taskType: "VISUAL"` が明記されていること
- [ ] 手動テストチェックリスト・結果ファイルが作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
