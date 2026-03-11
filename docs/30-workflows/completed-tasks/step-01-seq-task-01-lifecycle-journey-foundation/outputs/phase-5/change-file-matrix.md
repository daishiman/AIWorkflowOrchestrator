# 変更ファイル表

| ファイル                                                                           | 種別   | 変更内容                                                   |
| ---------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------- |
| apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts                      | new    | 一次導線・責務・advanced policy の正本                     |
| apps/desktop/src/renderer/App.tsx                                                  | update | legacy alias 正規化                                        |
| apps/desktop/src/renderer/views/SkillCenterView/index.tsx                          | update | 一次導線 guide panel と surface ownership panel 追加       |
| apps/desktop/src/renderer/navigation/skillLifecycleJourney.test.ts                 | new    | contract test                                              |
| apps/desktop/src/renderer/views/SkillCenterView/**tests**/SkillCenterView.test.tsx | update | journey / surface ownership panel test                     |
| apps/desktop/scripts/capture-task-skill-lifecycle-01-phase11.mjs                   | new    | workflow 専用 screenshot script（TC-11-05 は要素 capture） |
