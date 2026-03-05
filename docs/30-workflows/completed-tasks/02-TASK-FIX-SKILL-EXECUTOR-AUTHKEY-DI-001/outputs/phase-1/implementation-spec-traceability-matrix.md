# Phase 1 トレーサビリティ行列

| ID    | 要件                                             | 仕様根拠                                               | 実装対象                                          | テスト/検証                                                   |
| ----- | ------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------- |
| TR-01 | SkillExecutorへAuthKeyServiceを注入する          | `interfaces-agent-sdk-executor.md` (キー取得優先順/DI) | `main/ipc/skillHandlers.ts`                       | `ipc-double-registration.test.ts` でDI配線確認                |
| TR-02 | authKeyServiceを単一生成して共有する             | `arch-electron-services.md` (DI責務分離)               | `main/ipc/index.ts`                               | `ipc-double-registration.test.ts` で同一インスタンス検証      |
| TR-03 | `skill:execute` の失敗契約を維持する             | `api-ipc-agent.md` (`errorCode?: string`)              | `main/ipc/skillHandlers.ts`                       | `skillHandlers.execute.test.ts` 回帰                          |
| TR-04 | preflight判定とMain判定の不整合を解消する        | `api-ipc-agent.md` + `api-ipc-system.md`               | `main/ipc/index.ts` + `main/ipc/skillHandlers.ts` | 手動シナリオ + 既存preflight関連テスト                        |
| TR-05 | 認証失敗時コードは `AUTHENTICATION_ERROR` を維持 | `interfaces-agent-sdk-skill.md`                        | 既存契約維持（破壊しない）                        | `skill-api.contract.test.ts`, `skillHandlers.execute.test.ts` |
| TR-06 | 後方互換（2引数registerSkillHandlers）維持       | `interfaces-agent-sdk-skill.md`（後方互換契約）        | `main/ipc/skillHandlers.ts`                       | 既存handler登録テスト群                                       |

## 監査観点

- 矛盾: 仕様と実装対象の不一致なし
- 漏れ: Main/Preload/Renderer境界の要件を全て行列化
- 整合: `AUTHENTICATION_ERROR` 契約を維持する前提で設計
- 依存: Phase 2で責務境界詳細へ展開可能
