# Phase 8: post-refactor checklist

| #   | 観点               | 確認内容                                                             | 結果 |
| --- | ------------------ | -------------------------------------------------------------------- | ---- |
| 1   | DTO 名             | `AuthModeStatus`, `AuthModeChangedEvent`, `IPCResponse` の命名を維持 | PASS |
| 2   | event payload      | `previousMode`, `mode`, `status`, `changedAt` を維持                 | PASS |
| 3   | sender 順序        | invalid sender が invalid mode より先に返る                          | PASS |
| 4   | import source      | public auth-mode 型が shared 起点になっている                        | PASS |
| 5   | Renderer listener  | listener が `event.status` を再構築しない                            | PASS |
| 6   | SettingsView mount | 個別 selector + `useEffect([initializeAuthMode])` を維持             | PASS |
| 7   | regression 維持    | Phase 6 の回帰テスト群が green                                       | PASS |
| 8   | coverage 維持      | touched file の数値目標を満たす                                      | PASS |

## 残留リスク

- service internal event 名と public event 名が似ているため、Phase 12 の spec で境界を明記する必要がある
