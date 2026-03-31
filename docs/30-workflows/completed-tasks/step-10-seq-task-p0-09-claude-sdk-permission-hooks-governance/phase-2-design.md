# Phase 2: 設計

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 2                                      |
| 機能名 | claude-sdk-permission-hooks-governance |
| 作成日 | 2026-03-29                             |

## 目的

phase 別 permission option、hooks factory、audit sink、UI 連携の設計を行う。

## 実行タスク

- phase 別 `permissionMode` を設計する
- `allowedTools` / `disallowedTools` / `canUseTool` を設計する
- Hooks factory と audit sink を設計する
- UI 表示 payload を設計する

## 参照資料

| 資料名  | パス                                                                           | 説明       |
| ------- | ------------------------------------------------------------------------------ | ---------- |
| Phase 1 | `phase-1-requirements.md`                                                      | 要件       |
| RT-06   | `../step-08-par-task-rt-06-claude-sdk-message-contract-normalization/index.md` | event 契約 |

## 実行手順

### ステップ1: phase 別 option を設計する

```typescript
interface SkillCreatorSdkPolicy {
  phase: "plan" | "execute" | "verify" | "improve";
  permissionMode: string;
  allowedTools: string[];
  disallowedTools?: string[];
}
```

### ステップ2: hooks factory を設計する

- SessionStart: provenance 記録
- PreToolUse: policy 判定
- PostToolUse: 結果記録
- SessionEnd: summary 記録

## 成果物

| 成果物            | パス                                   | 説明                |
| ----------------- | -------------------------------------- | ------------------- |
| governance design | `outputs/phase-2/governance-design.md` | policy / hooks 設計 |

## 完了条件

- [ ] phase 別 policy が設計されている
- [ ] hooks factory の責務が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
