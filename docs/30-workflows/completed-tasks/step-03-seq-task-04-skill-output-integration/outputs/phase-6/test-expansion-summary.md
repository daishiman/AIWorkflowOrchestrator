# Phase 6 成果物: テスト拡充サマリー — TASK-SDK-SC-04

## 追加テストケース (T-07〜T-09)

| ID    | 説明                                      | 対象                   |
| ----- | ----------------------------------------- | ---------------------- |
| T-07a | SKILL_END マーカーなし → null             | extractSkillFromOutput |
| T-07b | name フィールドなし → null                | extractSkillFromOutput |
| T-07c | スペース含むスキル名 → ハイフンスラッグ化 | extractSkillFromOutput |
| T-07d | パース失敗時は IPC 送信しない             | handleSessionComplete  |
| T-08a | mkdir 失敗 → Error スロー                 | saveSkill              |
| T-08b | writeFile 失敗 → Error スロー             | saveSkill              |
| T-09a | Registry 失敗でも IPC 通知は継続          | handleSessionComplete  |
| T-09b | 同名スキルの 2 回登録が可能               | registerToRegistry     |

## SkillRegistry 単体テスト追加

テストファイル: `apps/desktop/src/main/services/runtime/__tests__/SkillRegistry.test.ts`

計7テストケース（register/unregister/getAll/registerFromPath の正常系・エラー系）

## 全テスト結果

```
Test Files  3 passed (3)
Tests  26 passed (26)
```
