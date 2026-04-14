# Phase 8: リファクタリング計画

## 方針

- 重複定義を削除する。
- shared からの参照を増やし、ローカル定義をなくす。
- `.claude` と `.agents` の mirror 同期を維持する。

## 実施対象

| 対象                      | 処置                     |
| ------------------------- | ------------------------ |
| `SkillScanner.ts`         | import 参照へ統一        |
| `init_skill.js`           | shared import + fallback |
| `claude-cli/constants.ts` | shared 定数へ寄せる      |
