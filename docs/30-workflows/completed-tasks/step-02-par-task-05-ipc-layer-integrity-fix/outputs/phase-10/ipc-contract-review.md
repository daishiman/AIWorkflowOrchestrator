# Phase 10 IPC契約レビュー

## 判定

PASS

## Phase 1-6 相当の確認結果

| 項目               | getDetail                            | update                                          |
| ------------------ | ------------------------------------ | ----------------------------------------------- |
| チャンネル名       | `skill:get-detail`                   | `skill:update`                                  |
| Preload 呼び出し   | `safeInvokeUnwrap(..., { skillId })` | `safeInvokeUnwrap(..., { skillName, updates })` |
| Main 受信 payload  | `{ skillId }`                        | `{ skillName, updates }`                        |
| P42 バリデーション | PASS                                 | PASS                                            |
| P45 命名           | `skillId`                            | `skillName`                                     |
| unregister         | 既存 removeHandler 維持              | `removeHandler(SKILL_UPDATE)` 追加              |

## 契約差分監査で潰した点

- `safeInvoke` 記載ではなく `safeInvokeUnwrap` が現行正本
- `shared` 側に欠けていた `SKILL_GET_DETAIL` / `SKILL_UPDATE` を追加して AC-8 を成立
- `skill:update` は positional payload ではなく object payload が正

## 補足

- `SkillService.updateSkill()` はスタブだが、IPC 契約そのものは成立している
- 具体的な更新ロジックは unassigned task として切り出した
