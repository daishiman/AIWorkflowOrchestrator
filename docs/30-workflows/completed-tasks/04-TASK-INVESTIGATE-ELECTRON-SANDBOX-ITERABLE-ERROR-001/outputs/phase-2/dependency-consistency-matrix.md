# Phase 2 依存整合マトリクス

| 依存元           | 依存先         | 整合内容                            | 判定 |
| ---------------- | -------------- | ----------------------------------- | ---- |
| Phase 1 FR-01    | Main IPC修正   | `toAuthUser` 適用済み               | OK   |
| Phase 1 FR-02/03 | Renderer修正   | `normalizeLinkedProviders` 導入済み | OK   |
| Phase 1 FR-04    | テスト追加     | 2ケース追加済み                     | OK   |
| 既存UI契約       | AccountSection | 差分なしで回帰PASS                  | OK   |
