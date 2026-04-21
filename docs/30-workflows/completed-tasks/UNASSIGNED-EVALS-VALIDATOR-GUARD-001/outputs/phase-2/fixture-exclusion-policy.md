# fixture EVALS 除外ポリシー

## 除外対象

`apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json`

## 除外方針

allowlist ベース（glob 不採用）。理由:

- 動的パス consumer が存在し、単純 glob では consumer を網羅できない
- fixture EVALS は apps/ 配下に存在し、スキルディレクトリと明確に分離されている
- TC-004 契約の固定内容を validator が書き換えないよう、除外を明示的に管理する

## 実装

```js
const FIXTURE_EXCLUSION_LIST = [
  "apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json",
];

function isExcluded(filePath) {
  return FIXTURE_EXCLUSION_LIST.some(
    (excluded) => filePath.endsWith(excluded) || filePath.includes(excluded),
  );
}
```

## TC-004 影響確認

fixture EVALS.json は validate-evals.js の検証対象に含まれない。
TC-004 テストファイルは apps/ 配下にあり、.claude/skills/ とパスが明確に分離されているため干渉しない。
