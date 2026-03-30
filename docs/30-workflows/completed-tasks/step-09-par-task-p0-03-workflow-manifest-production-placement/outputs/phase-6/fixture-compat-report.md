# Phase 6: Fixture 互換性レポート

テストフィクスチャ（apps/desktop/src/main/services/runtime/**tests**/fixtures/workflow-manifest/workflow-manifest.json）と本番 manifest の構造差分:

| フィールド     | フィクスチャ           | 本番 manifest | 差分理由                                                  |
| -------------- | ---------------------- | ------------- | --------------------------------------------------------- |
| workflowId     | task-sdk-01-foundation | skill-creator | 対象 workflow が異なる（意図的）                          |
| phases 数      | 2                      | 5             | 本番は skill creation lifecycle の 5 phase（意図的）      |
| resources 数   | 2                      | 7             | 本番は agents/references/schemas の代表ファイル（意図的） |
| entry hooks 数 | 2                      | 5             | 各 phase に entry hook を用意（意図的）                   |
| exit hooks 数  | 2                      | 5             | 各 phase に exit hook を用意（意図的）                    |
| JSON構造       | 同一スキーマ           | 同一スキーマ  | schemaVersion=1 で構造互換                                |

全差分は意図的であり、JSON スキーマ構造としての互換性は維持されている。
