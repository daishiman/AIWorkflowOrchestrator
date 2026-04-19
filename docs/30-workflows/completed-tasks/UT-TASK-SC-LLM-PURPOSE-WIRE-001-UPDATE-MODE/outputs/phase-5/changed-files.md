# Phase 5: 変更ファイル一覧

| ファイル                                                                     | 変更内容                                                                                                                    |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | `update` / `improve-prompt` で `init_skill.js` を踏まない dispatch 修正、既存スキル実在チェック追加、スタブワークフロー追加 |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | dispatch・非呼び出し・異常系・実在チェックのユニットテスト追加                                                              |
