# Phase 5: 実装

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 5                                 |
| Phase名    | 実装                              |
| 機能名     | task-ui-03-ipc-renderer-migration |
| 前提Phase  | Phase 4: テスト作成               |
| 次Phase    | Phase 6: テスト拡充               |
| ステータス | pending                           |
| 作成日     | 2026-04-07                        |

## 目的

2コンポーネントの IPC 経路を `window.electronAPI.skillCreator` から `window.skillCreatorAPI` に移行する。

## 実行手順

### 0. 実装前チェック（必須）

```bash
# 現行テストが全て pass することを確認
pnpm --filter @repo/desktop test -- --run

# 旧経路参照の現状確認
grep -rn "window.electronAPI.skillCreator" apps/desktop/src/renderer --include="*.tsx" --include="*.ts"
```

## 実行タスク

### Task 1: ImprovementProposalPanel.tsx の移行

`apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx` の line 73 付近:

**変更前**:

```typescript
await window.electronAPI.skillCreator.applyRuntimeImprovement(...)
```

**変更後**:

```typescript
await window.skillCreatorAPI.applyRuntimeImprovement(...)
```

型定義の変更が必要な場合は `packages/shared/src/types/skillCreator.ts` も合わせて確認する。

### Task 2: GovernanceSummaryPanel.tsx の移行

`apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx` の line 93 付近:

**変更前**:

```typescript
window.electronAPI.skillCreator.getGovernanceState;
```

**変更後**:

```typescript
window.skillCreatorAPI.getGovernanceState;
```

### Task 3: IPC 契約チェックリスト準拠確認

移行完了後に以下を確認する:

- [ ] Main Process ハンドラーに変更なし（API参照側の変更のみ）
- [ ] Preload API（`skill-creator-api.ts`）の変更なし（メソッドは既存）
- [ ] 型定義の変更有無を確認
- [ ] チャネルホワイトリスト（`channels.ts`）に変更なし

### Task 4: 旧経路参照ゼロ確認

```bash
# 移行後に旧経路が0件であることを確認
grep -rn "window.electronAPI.skillCreator" apps/desktop/src/renderer --include="*.tsx" --include="*.ts"
# → 結果が0件であることを確認
```

## 参照資料

| 資料名                | パス                                                                          | 説明             |
| --------------------- | ----------------------------------------------------------------------------- | ---------------- |
| 設計書                | `outputs/phase-2/design-document.md`                                          | 移行方針         |
| テストマトリクス      | `outputs/phase-4/test-matrix.md`                                              | fail-first観点   |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | 同時更新チェック |

## 多角的チェック観点

| 観点           | 適用判断                   | 確認内容                           |
| -------------- | -------------------------- | ---------------------------------- |
| アーキテクチャ | IPC参照変更のため適用      | 変更後も既存パターンと一致すること |
| IPC通信        | チャネル参照変更のため適用 | IPC契約チェックリスト準拠          |
| 型安全性       | TypeScript型整合のため適用 | typecheck エラーなし               |

## 統合テスト連携

- Phase 4 で定義した fail-first テストケースを pass に反転する

## 成果物

| 成果物   | パス                                       | 説明                                 |
| -------- | ------------------------------------------ | ------------------------------------ |
| 実装記録 | `outputs/phase-5/implementation-record.md` | 変更ファイル一覧・変更内容・確認結果 |

## 完了条件

- [ ] `ImprovementProposalPanel.tsx` が `window.skillCreatorAPI` 経路を使用している
- [ ] `GovernanceSummaryPanel.tsx` が `window.skillCreatorAPI` 経路を使用している
- [ ] `grep "window.electronAPI.skillCreator" renderer/` の結果が0件
- [ ] IPC 契約チェックリストの確認が完了している
- [ ] Phase 4 のテストが全て pass する
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
