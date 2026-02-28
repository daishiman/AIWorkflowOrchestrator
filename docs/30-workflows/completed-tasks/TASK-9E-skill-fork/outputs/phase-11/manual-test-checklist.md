# Phase 11 手動テストチェックリスト（TASK-9E）

## 前提

- 自動テスト: 59 PASS（SkillForker 34 + IPC 25）
- 対象実装: Service + IPC + Preload + Shared型（UIコンポーネントなし）

## 手動確認（任意）

### 1. Preload API 公開確認

- [ ] DevTools で `typeof window.electronAPI.skill.forkSkill` が `"function"`

### 2. 正常系フォーク

```js
await window.electronAPI.skill.forkSkill({
  sourceSkill: "aiworkflow-requirements",
  newName: "aiworkflow-requirements-manual-test",
  description: "manual test",
  copyAgents: true,
  copyReferences: true,
  copyScripts: false,
  copyAssets: false,
  modifyAllowedTools: ["Read", "Grep"],
});
```

- [ ] 呼び出しが成功する
- [ ] 生成先に `SKILL.md` がある
- [ ] 生成先に `fork-metadata.json` がある
- [ ] `fork-metadata.json.forkedFrom` が source と一致する

### 3. 異常系

- [ ] source 不在時に失敗レスポンスが返る
- [ ] 同名 destination で失敗する
- [ ] `sourceSkill: "../x"` で拒否される

## 判定

| 項目         | 結果                           |
| ------------ | ------------------------------ |
| 自動テスト   | PASS                           |
| 型チェック   | PASS                           |
| 任意手動確認 | 未実施でも可（UI非依存のため） |
| 総合         | PASS                           |
