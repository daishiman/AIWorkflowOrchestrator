# 未検証導線一覧

| 項目                                  | 理由                  | 扱い                                 |
| ------------------------------------- | --------------------- | ------------------------------------ |
| SkillCenterView の detail panel 分岐  | Task01 の変更中心外   | 現行テストに委譲                     |
| SkillCenterView の delete dialog 分岐 | 既存機能              | 現行テストに委譲                     |
| App.tsx 全体行 coverage               | repo coverage exclude | typecheck + targeted behavior で代替 |
