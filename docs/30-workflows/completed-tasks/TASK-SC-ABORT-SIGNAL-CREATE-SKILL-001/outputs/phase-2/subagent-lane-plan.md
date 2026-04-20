# Phase 2: SubAgent レーン計画

| Lane | 担当              | 目的                                                | 並列可否 |
| ---- | ----------------- | --------------------------------------------------- | -------- |
| A    | task-spec 監査    | 13 phase / artifact / canonical 名監査              | 並列     |
| B    | requirements 監査 | current facts / lessons learned / Phase 12 同期監査 | 並列     |
| C    | 実装監査          | 実コード整合、過剰要件除去、最小修正案作成          | 並列     |

## Lane 分担詳細

### Lane A: task-specification-creator 準拠監査

- Phase 数 13 の妥当性確認
- canonical artifact 名の確認（`implementation-guide.md`, `system-spec-update-summary.md` 等）
- Phase 13 `blocked` ルールの確認

### Lane B: aiworkflow-requirements 抽出監査

- `lessons-learned-skill-cancel-abortsignal.md` との整合性
- `lessons-learned-skill-creator-cancel-chain.md` との整合性
- Phase 12 same-wave sync 対象の確認

### Lane C: 実装整合・エレガンス監査

- 実コードの Abort 伝播点確認（2 箇所のみ修正）
- 過剰テスト要件の除去確認
- `jest.spyOn` 禁止 / `vi.spyOn` または public flow 使用の確認
