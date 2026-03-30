# Phase 7: カバレッジ外リスク

| リスク                                           | severity | 対応先     | 説明                                                                                                              |
| ------------------------------------------------ | -------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| runtime での manifest 自動読み込み               | medium   | TASK-P0-04 | ManifestLoader がどのタイミングで manifest を読み込むかは TASK-P0-04 の責務                                       |
| manifest の hot-reload 対応                      | low      | future     | manifest 変更時のキャッシュ invalidation は ManifestLoader のキャッシュ機構でカバー済み                           |
| skill-creator ファイル追加時の manifest 更新忘れ | low      | operation  | NFR-02 により最小限の更新で対応可能。代表ファイルのみ resource 化しているため、新ディレクトリ追加時のみ更新が必要 |
