# Responsibility Boundary Matrix

| 責務                         | 対象                                     | 対応              |
| ---------------------------- | ---------------------------------------- | ----------------- |
| comment semantics            | `pendingRequest` 合成式の意味説明        | 文書/コメント判断 |
| clear condition verification | `setRestoredPendingRequest(null)` の条件 | 静的確認          |
| downstream handoff           | RALLY-010〜013 への前提固定              | 文書化            |
