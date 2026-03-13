# Phase 7 Output: Coverage Gap List

| 区分                     | 現状                                                                    | 判断                                                       |
| ------------------------ | ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| Workspace 全体分岐       | chat / file browser / watch path の既存分岐が多く、今回未変更のまま残る | 今回の guard 導入範囲外のため blocker ではない             |
| Preview mode 分岐        | image / html / markdown の全派生分岐は targeted capture 対象外          | 既存 test が担保、guard task では parse / transport を優先 |
| docs validation coverage | validator スクリプト自体に unit test を追加していない                   | Phase 12 の実行証跡で補完                                  |

## 次アクション

- workspace 全体の branch coverage を上げる場合は専用の Workspace regression task に切り出す
- validator スクリプトの unit test 追加は Phase 12 系メタタスクで扱う
