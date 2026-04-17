# Phase 12: 実装ガイド

## タスクID

TASK-SW-STRUCT-001

## 中学生レベルの説明

スキルを作るときに、説明書の「目的」と「使う道具の名前」が間違って入っていると、あとで説明書を読む人が困ります。
今回の修正では、目的の欄にはちゃんと説明文を入れ、道具の欄には道具の名前だけを入れるように直しました。

## 技術者向けの要点

### 変更済みの実装

```typescript
const structurePlan: StructurePlanJson = {
  skillName: options.name,
  description: options.description,
  purpose: options.description,
  features: [],
  agents: ["extract-purpose", "plan-structure"],
};
```

### 接続ポイント

- `generateSkillMd()` は `structurePlan.purpose` を正規化して `triggerDescription` に使用する
- `createSkill()` の公開シグネチャは変更していない
- `loadAgent` を使わないので、`runCreateWorkflow()` は内部データ生成に集中できる

## 結論

`STRUCT-001` の実装は current branch で完了しており、後続タスクはこのガイドを前提に参照できる。
