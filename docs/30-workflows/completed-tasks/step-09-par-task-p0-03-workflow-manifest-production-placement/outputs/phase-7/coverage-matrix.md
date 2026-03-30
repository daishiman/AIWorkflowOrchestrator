# Phase 7: カバレッジマトリクス

| フィールド           | AC   | テストケース | カバー状況  |
| -------------------- | ---- | ------------ | ----------- |
| schemaVersion        | AC-6 | TC-02, RC-02 | ✅ カバー済 |
| workflowId           | AC-3 | TC-01, RC-03 | ✅ カバー済 |
| phases[].id          | AC-5 | TC-04        | ✅ カバー済 |
| phases[].title       | AC-5 | TC-04        | ✅ カバー済 |
| phases[].entryHookId | AC-7 | TC-06        | ✅ カバー済 |
| phases[].exitHookId  | AC-7 | TC-07        | ✅ カバー済 |
| phases[].dependsOn   | AC-5 | TC-10, EC-01 | ✅ カバー済 |
| phases[].resourceIds | AC-4 | TC-03        | ✅ カバー済 |
| resources[].id       | AC-4 | TC-03        | ✅ カバー済 |
| resources[].kind     | AC-4 | TC-09, EC-02 | ✅ カバー済 |
| resources[].path     | AC-4 | TC-03, RC-01 | ✅ カバー済 |
| resources[].phaseIds | AC-4 | TC-03        | ✅ カバー済 |
| entry[].id           | AC-7 | TC-05, TC-06 | ✅ カバー済 |
| entry[].command      | AC-7 | TC-05, EC-03 | ✅ カバー済 |
| exit[].id            | AC-7 | TC-05, TC-07 | ✅ カバー済 |
| exit[].command       | AC-7 | TC-05        | ✅ カバー済 |
| mirror parity        | AC-2 | TC-08        | ✅ カバー済 |

全フィールドがテストでカバーされている。
