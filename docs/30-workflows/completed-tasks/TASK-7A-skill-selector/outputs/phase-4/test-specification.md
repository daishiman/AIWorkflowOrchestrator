# TASK-7A テスト仕様書

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 4          |
| 作成日 | 2026-01-30 |

## テスト戦略

- フレームワーク: Vitest + React Testing Library + userEvent
- 環境: happy-dom
- モック: useSkillStore をモジュールモックで差し替え
- テスト構成: 単一ファイル `SkillSelector.test.tsx` に全テストケースを集約

## モック戦略

```typescript
vi.mock("../../../store", () => ({
  useSkillStore: () => currentStoreState,
}));
```

- `currentStoreState` をテストごとに差し替えて各状態パターンをテスト
- `mockSelectSkill`, `mockRescanSkills` で関数呼び出しを検証
