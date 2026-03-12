# Boundary Cases

| ケース                        | 期待                                              |
| ----------------------------- | ------------------------------------------------- |
| 空 request                    | default session title を返す                      |
| 長い request                  | mode prefix を保ったまま maxLength 内へ収める     |
| attachments 0 件              | summary は `追加コンテキストなし`                 |
| selected files 3 件超         | summary は先頭3件 + `ほかN件`                     |
| stream error                  | error は保持、stream ids と content はクリア      |
| revive                        | overlay keys は戻らない                           |
| lifecycle source surface 不正 | `isSkillLifecycleChatHandoffAllowed()` が拒否する |
