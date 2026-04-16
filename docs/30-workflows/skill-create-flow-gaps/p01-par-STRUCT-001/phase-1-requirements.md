# Phase 1: 要件定義

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 1                  |
| Phase名    | 要件定義           |
| 対象機能   | TASK-SW-STRUCT-001 |
| 前提Phase  | -（起点）          |
| 次Phase    | Phase 2: 設計      |
| ステータス | 完了               |
| 作成日     | 2026-04-15         |

## 実施結果

current branch の `runCreateWorkflow()` は次の形に修正済み。

```typescript
{
  skillName: options.name,
  description: options.description,
  purpose: options.description,
  features: [],
  agents: ["extract-purpose", "plan-structure"],
}
```

### 確認結果

| AC   | 状態 | 根拠                                                                    |
| ---- | ---- | ----------------------------------------------------------------------- |
| AC-1 | PASS | `purpose` は `options.description` を使用                               |
| AC-2 | PASS | `agents` はエージェント名リストを返す                                   |
| AC-3 | PASS | `features` は空配列のまま                                               |
| AC-4 | PASS | `loadAgent` 依存を削除し、`runCreateWorkflow()` は純粋な構造生成に縮約  |
| AC-5 | PASS | `SkillCreatorService.struct-001.test.ts` が current branch の仕様を検証 |

## 影響範囲

- `generateSkillMd()` の `triggerDescription` は、修正後の `purpose` を正規化して利用する
- IPC 契約・外部 API の変更なし
- `createSkill()` の返却型（`Promise<string>`）は変更なし

## LLM 統合の分離方針

- `purpose` の実抽出は別タスク
- `features` の自動生成も別タスク
- 今回は `StructurePlanJson` の意味整合だけを修正

## 後続タスクとの接続点

- TASK-SW-STRUCT-002 は、修正済みの `StructurePlanJson` を `generate_skill_md.js` に渡す前提で成立する

## 成果物

| 成果物          | パス                              |
| --------------- | --------------------------------- |
| requirements.md | `outputs/phase-1/requirements.md` |

## 次 Phase

→ [Phase 2: 設計](./phase-2-design.md)
