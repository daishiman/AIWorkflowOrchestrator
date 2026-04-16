# TASK-SW-STRUCT-001 未タスク検出

## 結論

current facts では formalized な未タスクは 0 件。

## 判定理由

- `create` モードの責務は `runCreateWorkflow()` に閉じており、`purpose` / `agents` / `features` の current facts が確定している
- `createSkill()` は `runCreateWorkflow()` -> `init_skill.js` -> `generateSkillMd()` の順で完結している
- future wording は current docs から除去済みで、未完了タスクとして formalize する必要がない

## 3 ステップ確認

| Step | 確認内容                                 | 結果 |
| ---- | ---------------------------------------- | ---- |
| 1    | current facts から未タスク候補を抽出     | 完了 |
| 2    | formalized すべき issue へ昇格するか判定 | 完了 |
| 3    | 0 件でも summary を残す                  | 完了 |

## 参考メモ

- LLM による purpose / features の拡張は将来の改善余地だが、現ブランチの unassigned task ではない
- `.agents` の確認や SKILL.md 生成フローは current facts の検証対象として残す
