# Phase 2: 契約決定書

## 採用設計: 案 B（Renderer guard + 既存 cancel IPC）

### IPC 非伝播方針（明文化）

`AbortSignal` は IPC 境界を越えてシリアライズできないため、
`window.electronAPI.skill.create()` の引数に `signal` を含めない。

```typescript
// IPC 呼び出し shape（変更なし）
window.electronAPI.skill.create({
  description: string,
  options: { generateTasks, addAgents, addReferences },
  context?: SkillCreationContext,
  // signal は含めない ← 設計決定
})
```

### Renderer 内での guard 位置

```
createSkill(description, options, context, signal)
  │
  ├─ バリデーション（description 空チェック）
  ├─ signal?.aborted チェック → true なら return "" ← Renderer guard
  └─ window.electronAPI.skill.create({ ... }) ← signal なし
```

### Main 側のキャンセル経路（既存のまま）

```
cancelGeneration()
  → skillCreatorAPI.cancelGeneration() IPC
  → Main 側 AbortController.abort()（TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 で実装済み）
```

## テストケース対応

| テストケース | 検証内容                                                     |
| ------------ | ------------------------------------------------------------ |
| TC-01        | non-aborted signal を渡した場合、IPC は現行 shape で呼ばれる |
| TC-02        | signal.aborted === true の場合、IPC が呼ばれない             |
| TC-03        | signal 省略時に後方互換で動く                                |
| TC-WIZ-01    | startGeneration() の返値が createSkill 第4引数に渡る         |
