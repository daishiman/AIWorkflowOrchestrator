# Phase 6: Edge Case テスト計画

Edge case tests added to `ManifestLoader.production-manifest.test.ts`:

| ID    | Edge Case                              | 期待動作                | 結果 |
| ----- | -------------------------------------- | ----------------------- | ---- |
| EC-01 | dependsOn に存在しない phase ID を指定 | validation error        | PASS |
| EC-02 | resource の kind を空文字にする        | validation error        | PASS |
| EC-03 | entry hook の command を空文字にする   | validation error        | PASS |
| EC-04 | phases を 1 つだけにする               | 検証通過（最低1 phase） | PASS |
