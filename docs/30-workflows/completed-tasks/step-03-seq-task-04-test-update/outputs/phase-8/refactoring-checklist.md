# Phase 8: リファクタリングチェックリスト

## 検証日時

2026-03-29

## 構造改善項目

| #   | 項目                                                       | 状態    | 備考                                            |
| --- | ---------------------------------------------------------- | ------- | ----------------------------------------------- |
| 1   | Phase 11 を `phase-11-manual-test.md` へ canonical rename  | ✅ 完了 | NON_VISUAL として記録                           |
| 2   | Phase 13 を `phase-13-pr-creation.md` へ canonical rename  | ✅ 完了 | blocked 状態を記録                              |
| 3   | Phase 7 を `phase-7-coverage-check.md` へ canonical rename | ✅ 完了 | 命名規約準拠                                    |
| 4   | outputs/phase-11/ に evidence ファイル追加                 | ✅ 完了 | manual-test-checklist.md, manual-test-result.md |
| 5   | outputs/phase-12/ に 6成果物追加                           | ✅ 完了 | implementation-guide.md 他                      |
| 6   | `artifacts.json` を Phase 11/12/13 追加で同期              | ✅ 完了 | root + outputs 両方                             |
| 7   | index.md に全 Phase リンクと関連ファイル追加               | ✅ 完了 | completed workflow 形式                         |
| 8   | 旧 root path 参照の除去                                    | ✅ 完了 | NFR-02 準拠                                     |

## stale 文言の置換

| 旧表現         | 新表現           |
| -------------- | ---------------- |
| 「変更予定」   | 「確認済み」     |
| 「未実装」     | 「P50 検証完了」 |
| 旧 nested path | canonical path   |

## 結論

コード変更なし。仕様書・artifact の構造改善のみ。
