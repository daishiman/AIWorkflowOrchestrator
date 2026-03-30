# Phase 8: 命名規則

| 対象          | 命名規則                         | 実装状況                                                           |
| ------------- | -------------------------------- | ------------------------------------------------------------------ |
| phase id      | kebab-case                       | ✅ 統一済 (requirements-gathering, plan, execute, verify, improve) |
| resource id   | kebab-case + kind prefix         | ✅ 統一済 (agent-xxx, ref-xxx, schema-xxx)                         |
| hook id       | phase-prefix + entry/exit suffix | ✅ 統一済 (rg-entry, plan-entry, etc.)                             |
| resource path | `./` 始まりの相対パス            | ✅ 統一済                                                          |

全 ID が規則に準拠。
