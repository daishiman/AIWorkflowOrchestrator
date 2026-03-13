# Phase 11 手動テスト計画（スクリーンショット検証）

## メタ情報

| 項目     | 内容                                         |
| -------- | -------------------------------------------- |
| タスクID | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001 |
| Phase    | 11                                           |
| 作成日   | 2026-03-13                                   |
| 対象     | 設定画面の auth/runtime 表示整合             |
| 検証方式 | 代表UI状態をスクリーンショットで記録して判定 |

---

## 1. 検証目的

設定画面の以下3領域が、`Integrated API Runtime` と `Claude Code Terminal Surface` の責務分離に沿って表示されるかを確認する。

1. 認証方式カード（`Claude Agent SDK 認証方式`）
2. Claude Agent SDK APIキーセクション
3. APIキー設定一覧

---

## 2. テストケース

| TC-ID    | 検証内容                    | 期待結果                                      | 証跡ファイル                                              |
| -------- | --------------------------- | --------------------------------------------- | --------------------------------------------------------- |
| TC-11-00 | 設定画面3領域の統合レビュー | 3領域の改善要求が同一画面で判読できる         | `screenshots/TC-11-00-settings-authmode-review-board.png` |
| TC-11-01 | Access Capability Card 同期 | access card の状態語彙と導線が整合している    | `screenshots/TC-11-01-access-card-sync.png`               |
| TC-11-02 | Missing API key ガイダンス  | APIキー不足時の guidance が明示される         | `screenshots/TC-11-02-runtime-missing-api-key.png`        |
| TC-11-03 | Terminal unavailable 表示   | terminal unavailable の理由と導線が表示される | `screenshots/TC-11-03-terminal-unavailable.png`           |

---

## 3. 実行手順

1. `phase-11-manual-test.md` の `テストケース` と `画面カバレッジマトリクス` を基準に TC-ID を固定する。
2. `outputs/phase-11/screenshots/` に証跡画像を保存する。
3. `outputs/phase-11/manual-test-result.md` の `証跡` 列へ `screenshots/<file>.png` 形式で記録する。
4. `validate-phase11-screenshot-coverage.js` を実行して機械検証する。

---

## 4. 受け入れ条件

- 4ケース（TC-11-00〜03）がすべて PASS
- `manual-test-result.md` の `証跡` 列と `screenshots/` 実体が 1:1 で一致
- `validate-phase11-screenshot-coverage.js` が PASS
