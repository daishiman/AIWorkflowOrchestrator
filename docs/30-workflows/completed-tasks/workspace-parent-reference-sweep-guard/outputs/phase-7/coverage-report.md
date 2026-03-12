# Coverage Report

## カバレッジ概要

| 対象                              | 総数 | カバー済み | カバレッジ |
| --------------------------------- | ---- | ---------- | ---------- |
| sweep manifest 項目（M-01〜M-10） | 10   | 10         | 100%       |
| drift class                       | 3    | 3          | 100%       |
| 受入基準（AC-1〜AC-5）            | 5    | 5          | 100%       |

## manifest カバレッジ

| Manifest ID                 | 検証方法                               | 証跡                               |
| --------------------------- | -------------------------------------- | ---------------------------------- |
| M-01 parent-pointer         | required / forbidden string check      | validator + `task-060` manual read |
| M-02 child-workflow         | exists check                           | `REQUIRED_PATHS` + manual read     |
| M-03 completed-task-pointer | required link + forbidden status regex | validator                          |
| M-04 master-index           | required / forbidden string check      | validator                          |
| M-05 legacy-index           | table row + forbidden pending regex    | validator                          |
| M-06 task-workflow-ledger   | required / forbidden string check      | validator                          |
| M-07 ui-feature-ledger      | required / forbidden string check      | validator                          |
| M-08 interfaces-ledger      | required / forbidden string check      | validator                          |
| M-09 capture-script         | required / forbidden string check      | validator                          |
| M-10 mirror-root            | `diff -qr` 実行                        | validator + manual transcript      |

## カバレッジ評価

- 自動検証だけで parent pointer / pointer docs / index / interfaces / capture / mirror を横断できる。
- 文章の読みやすさや参照説明の自然さは Phase 11 の手動監査で補完した。
- UI screenshot カバレッジは非該当。今回の変更対象は docs/script であり、Renderer UI 状態の差分はない。
