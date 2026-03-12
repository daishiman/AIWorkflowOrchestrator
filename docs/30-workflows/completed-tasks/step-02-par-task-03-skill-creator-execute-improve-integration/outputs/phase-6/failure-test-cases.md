# Phase 6 失敗系テスト一覧

| ID       | ケース                             | 期待結果                                             |
| -------- | ---------------------------------- | ---------------------------------------------------- |
| TC-06-01 | `detectMode` が失敗する            | mode hint は error 表示になるが create は継続できる  |
| TC-06-02 | `validateSkill` が false を返す    | create 後に validation message を表示する            |
| TC-06-03 | `executeSkill` が error を返す     | 作成済み skill を保持したまま error alert を表示する |
| TC-06-04 | `autoImproveSkill` が error を返す | session card に error alert を表示する               |
