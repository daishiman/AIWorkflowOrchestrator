# Phase 11: 手動テスト

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase番号 | 11                                      |
| 機能名    | ChatView エラーサイレント握りつぶし修正 |
| タスクID  | TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE  |
| 作成日    | 2026-03-20                              |
| 前Phase   | `phase-10-final-review.md`              |

## 目的

Electron アプリを実際に起動し、ChatView 画面でエラーバナーが正しく表示・消去されることを手動で確認する。自動テストでは検証しにくい UI のルック&フィール、Apple HIG 準拠、実機相当の見え方をスクリーンショット証跡と合わせて検証する。

## 実行タスク

- Task 1: ChatView の初期表示とエラー表示の前提状態を確認する。
- Task 2: API キー未設定時のエラーバナーをライト / ダークで確認する。
- Task 3: バナーの手動クローズと自動消去を確認する。
- Task 4: 画面カバレッジと証跡ファイル名を `TC-11-01` 〜 `TC-11-05` で固定する。

### Task 1: アプリ起動

```bash
pnpm --filter @repo/desktop dev
```

Electron アプリが起動したら ChatView 画面に遷移する。

## テストケース

### Task 2: エラーバナー表示確認

| TC-ID    | シナリオ              | 期待結果                                               | 証跡ファイル                                                      |
| -------- | --------------------- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| TC-11-01 | default-light         | 初期表示でエラーバナーが出ていないことを確認する       | `outputs/phase-11/screenshots/TC-11-01-default-light.png`         |
| TC-11-02 | api-key-missing-light | API キー未設定でライトテーマのエラーバナーが表示される | `outputs/phase-11/screenshots/TC-11-02-api-key-missing-light.png` |
| TC-11-03 | error-dismissed-light | ライトテーマで手動クローズ後にバナーが消えている       | `outputs/phase-11/screenshots/TC-11-03-error-dismissed-light.png` |
| TC-11-04 | api-key-missing-dark  | API キー未設定でダークテーマのエラーバナーが表示される | `outputs/phase-11/screenshots/TC-11-04-api-key-missing-dark.png`  |
| TC-11-05 | auto-cleared-dark     | ダークテーマで 5 秒後に自動消去される                  | `outputs/phase-11/screenshots/TC-11-05-auto-cleared-dark.png`     |

### Task 3: 消去挙動の確認

1. TC-11-03 でバナーを手動クローズし、再描画されないことを確認する。
2. TC-11-05 で 5 秒経過後に自動消去されることを確認する。
3. 再送信時に `chatError` がクリアされることを確認する。

### Task 4: 画面カバレッジ固定

## 画面カバレッジマトリクス

| TC-ID    | 画面状態               | テーマ | 証跡ファイル                                                      |
| -------- | ---------------------- | ------ | ----------------------------------------------------------------- |
| TC-11-01 | ChatView default       | light  | `outputs/phase-11/screenshots/TC-11-01-default-light.png`         |
| TC-11-02 | API key missing banner | light  | `outputs/phase-11/screenshots/TC-11-02-api-key-missing-light.png` |
| TC-11-03 | banner dismissed       | light  | `outputs/phase-11/screenshots/TC-11-03-error-dismissed-light.png` |
| TC-11-04 | API key missing banner | dark   | `outputs/phase-11/screenshots/TC-11-04-api-key-missing-dark.png`  |
| TC-11-05 | auto clear after 5s    | dark   | `outputs/phase-11/screenshots/TC-11-05-auto-cleared-dark.png`     |

### Task 5: UIのルック&フィール確認

| 確認項目                             | 基準                                                  |
| ------------------------------------ | ----------------------------------------------------- |
| エラーバナーの位置                   | チャット入力フォームの直上に配置されている            |
| エラーバナーの色（ライトモード）     | 赤系の背景・テキスト（Apple systemRed: #FF3B30 近似） |
| エラーバナーの色（ダークモード）     | 赤系の背景・テキスト（Apple systemRed: #FF453A 近似） |
| エラーメッセージのフォント・サイズ   | 他のUIと統一されている                                |
| ×ボタンのアクセシビリティ            | キーボード（Tab → Enter）で操作可能                   |
| エラーバナーとその他UIの間のスペース | 8pxグリッドに従った余白がある                         |

## 参照資料

| 資料名                   | パス                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| Phase 2 設計書           | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-2-design.md`            |
| Phase 5 実装             | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-5-implementation.md`    |
| Phase 6 テスト拡充       | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-6-test-expansion.md`    |
| Phase 7 カバレッジ確認   | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-7-coverage-check.md`    |
| Phase 8 リファクタリング | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-8-refactoring.md`       |
| Phase 9 品質保証         | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-9-quality-assurance.md` |
| Phase 10 最終レビュー    | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-10-final-review.md`     |
| Phase 12 ドキュメント    | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-12-documentation.md`    |
| 既知の落とし穴（P53）    | `.claude/rules/06-known-pitfalls.md`                                                       |

## 実行手順

### Step 1: アプリ起動

```bash
pnpm --filter @repo/desktop dev
```

### Step 2: 各シナリオの実行

TC-11-01 〜 TC-11-05 を順次実行し、期待値と実際の動作を比較する。PNG 実体は `outputs/phase-11/screenshots/` に配置済みであり、参照名は本ファイルと `manual-test-result.md` で一致させる。

### Step 3: 確認結果の記録

`manual-test-result.md`、`screenshot-plan.md`、`screenshot-coverage.md` に同じ TC-ID とファイル名を記録する。

## 統合テスト連携

- `manual-test-result.md` は validator が読む正本として扱う。
- `screenshot-plan.md` と `screenshot-coverage.md` は同一 TC-ID と証跡名を再掲し、後続の証跡差し替えを容易にする。
- `WorkspaceChatInput` や他画面のエラーは本 Task の主対象に含めず、別 workflow の回帰観測として分離する。

## 成果物

| 成果物                        | パス                                                                                                  |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| Phase 11 仕様書（本ファイル） | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/phase-11-manual-test.md`                 |
| 手動テスト結果                | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-11/manual-test-result.md`  |
| 撮影計画                      | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-11/screenshot-plan.md`     |
| 画面カバレッジ                | `docs/30-workflows/01-TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE/outputs/phase-11/screenshot-coverage.md` |

## 完了条件

- [ ] TC-11-01 から TC-11-05 の証跡ファイル名が一致している
- [ ] `manual-test-result.md` に TC-ID と `証跡` 列がある
- [ ] `screenshot-plan.md` に撮影条件が明記されている
- [ ] `screenshot-coverage.md` に 5 ケース分のカバレッジがある
- [x] 画像実体の配置と証跡 PNG の参照解決を確認済み

## 次Phase

Phase 12: ドキュメント（`phase-12-documentation.md`）
