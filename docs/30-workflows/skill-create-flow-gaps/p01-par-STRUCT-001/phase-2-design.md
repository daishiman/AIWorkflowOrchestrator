# Phase 2: 設計

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 2                           |
| Phase名    | 設計                        |
| 対象機能   | TASK-SW-STRUCT-001          |
| 前提Phase  | Phase 1: 要件定義           |
| 次Phase    | Phase 3: 設計レビューゲート |
| ステータス | 完了                        |
| 作成日     | 2026-04-15                  |

## 実施結果

設計で採用した方針Bは current branch の実装に反映済み。

### 現在の実装方針

- `runCreateWorkflow()` は `StructurePlanJson` を直接生成する
- `purpose` は `options.description`
- `features` は空配列
- `agents` は `["extract-purpose", "plan-structure"]`
- `loadAgent` 呼び出しは削除済み
- `try/catch` は将来の拡張を見据えて維持

### 型整合性

`StructurePlanJson` は既存の型定義のままで足りている。

```typescript
interface StructurePlanJson {
  skillName: string;
  description: string;
  purpose: string;
  features: string[];
  agents: string[];
  triggers?: string[];
  anchors?: Anchor[];
}
```

- `purpose: options.description` は `string`
- `agents: ["extract-purpose", "plan-structure"]` は `string[]`
- 新しい公開 API は不要

### 既存テストの影響

- `SkillCreatorService.struct-001.test.ts` が current branch の検証基準
- 既存の create モード系テストは、`loadAgent` 前提の期待値を見直す必要がある
- ただし外部契約変更はない

## 結論

この設計は current branch で実装済みであり、`generateSkillMd()` への後続接続の前提を満たしている。

## 成果物

| 成果物    | パス                        |
| --------- | --------------------------- |
| design.md | `outputs/phase-2/design.md` |

## 次 Phase

→ [Phase 3: 設計レビューゲート](./phase-3-design-review.md)
