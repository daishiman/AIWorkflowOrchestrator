# タスク 3: ドキュメント更新履歴

| ファイル                                                                               | 変更種別 | 変更内容                                                         |
| -------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------- |
| `docs/00-requirements/18-skills.md`                                                    | 追記     | `3.2.2.1 自動生成時の正規化` に変換仕様を明文化                  |
| `docs/00-requirements/08-api-design.md`                                                | 追記     | `ハンドラ一意性` と運用注意の追加                                |
| `apps/desktop/src/main/services/skill/SkillService.ts`                                 | 変更     | Bug 2 修正（toWizardSkillName 正規化）+ Phase 8 JSDoc            |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                                         | 変更     | Bug 1 修正（重複ブロック削除 -35行）                             |
| `apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts`            | 追記     | T-IPC-13/14 Bug 1 回帰テスト                                     |
| `apps/desktop/src/main/services/skill/__tests__/SkillService.test.ts`                  | 追記     | SS-TWSN-01〜11 Bug 2 テスト                                      |
| `apps/desktop/src/main/ipc/__tests__/creatorHandlers.governanceState.test.ts`          | 新規     | Phase 7 カバレッジ補完（12 テスト）                              |
| `docs/30-workflows/fix-creator-handler-duplicate-skill-name-validation/index.md`       | 更新済み | Phase 状態の current facts への同期（index.md / artifacts.json） |
| `docs/30-workflows/fix-creator-handler-duplicate-skill-name-validation/artifacts.json` | 更新済み | Phase 状態の current facts への同期                              |

## 更新履歴

| 日付       | Phase | 変更者                      | 内容                                     |
| ---------- | ----- | --------------------------- | ---------------------------------------- |
| 2026-04-06 | 5     | TASK-FIX-IPC-SKILL-NAME-001 | Bug 1/2 実装修正                         |
| 2026-04-06 | 6     | TASK-FIX-IPC-SKILL-NAME-001 | テスト追加                               |
| 2026-04-06 | 7     | TASK-FIX-IPC-SKILL-NAME-001 | カバレッジ補完テスト追加                 |
| 2026-04-06 | 8     | TASK-FIX-IPC-SKILL-NAME-001 | JSDoc リファクタリング                   |
| 2026-04-06 | 12    | TASK-FIX-IPC-SKILL-NAME-001 | ドキュメント更新（index/artifacts 同期） |
