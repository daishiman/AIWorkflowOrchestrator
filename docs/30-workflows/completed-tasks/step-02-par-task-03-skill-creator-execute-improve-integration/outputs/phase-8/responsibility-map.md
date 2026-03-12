# Phase 8 責務再配置マップ

| 要素                        | 変更前                                                                    | 変更後                                             |
| --------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------- |
| `SkillManagementPanel`      | list / create / analysis / editor に加え、新規 session 導線も抱える見込み | view 切替と一覧管理に責務を限定                    |
| `SkillLifecycleSessionCard` | 存在しない                                                                | create / execute / improve の一次導線を担当        |
| `skillButtonStyles`         | `SkillManagementPanel.tsx` 内部定義                                       | panel と session card の共有定義                   |
| lifecycle error 表示        | panel global alert と競合する見込み                                       | session card に寄せ、panel global は一覧管理系のみ |
