# Phase 6 回帰ケース表

| ケースID    | レイヤ   | 内容                                        | 結果 |
| ----------- | -------- | ------------------------------------------- | ---- |
| REG-TYPE-01 | shared   | `SkillId` と `SkillName` の相互代入禁止     | PASS |
| REG-TYPE-02 | shared   | `toSkillId` / `toSkillName` の値保持        | PASS |
| REG-UI-01   | renderer | `onImport` が `skill.name` を渡す           | PASS |
| REG-UI-02   | renderer | `importedSkillIds` は `skill.id` 判定を維持 | PASS |
| REG-IPC-01  | main ipc | `skill:import` の型・trimバリデーション維持 | PASS |
| REG-IPC-02  | main ipc | `skill:remove` の型・trimバリデーション維持 | PASS |
| REG-IPC-03  | main ipc | sender検証失敗時の拒否挙動維持              | PASS |
