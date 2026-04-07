# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 1                                      |
| Phase名    | 要件定義                               |
| 機能名     | task-ui-03-ipc-renderer-migration      |
| 対象機能   | TASK-UI-03-REMAINING IPC renderer 移行 |
| 前提Phase  | -                                      |
| 次Phase    | Phase 2: 設計                          |
| ステータス | pending                                |
| 作成日     | 2026-04-07                             |

## 目的

旧IPC経路（`window.electronAPI.skillCreator`）を使用している2コンポーネントの現状を分析し、移行要件と受入条件を確定する。

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

```bash
# 旧経路の使用箇所を確認
grep -rn "window.electronAPI.skillCreator" apps/desktop/src/renderer --include="*.tsx" --include="*.ts"

# skillCreatorAPI の公開状況確認
grep -n "exposeInMainWorld\|skillCreatorAPI" apps/desktop/src/preload/index.ts

# 移行先APIの存在確認（applyRuntimeImprovement, getGovernanceState）
grep -n "applyRuntimeImprovement\|getGovernanceState" apps/desktop/src/preload/skill-creator-api.ts
```

## 実行タスク

### Task 1: 旧経路使用箇所の完全列挙

対象ファイルと使用状況を確認する:

| ファイル                                                                              | 行  | 使用メソッド              | コンテキスト        |
| ------------------------------------------------------------------------------------- | --- | ------------------------- | ------------------- |
| `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx`             | 73  | `applyRuntimeImprovement` | Skill改善提案の適用 |
| `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx` | 93  | `getGovernanceState`      | ガバナンス状態取得  |

追加の使用箇所がないことを `grep` で確認すること。

### Task 2: 移行先API存在確認

`window.skillCreatorAPI`（`apps/desktop/src/preload/skill-creator-api.ts`）に以下が存在することを確認する:

- `applyRuntimeImprovement` メソッド
- `getGovernanceState` メソッド（または同等の状態取得API）

存在しない場合は Phase 2 でインターフェース追加が必要であることを記録する。

### Task 3: 受入条件の確定

| AC   | 条件                                                                  | 検証方法       |
| ---- | --------------------------------------------------------------------- | -------------- |
| AC-1 | `ImprovementProposalPanel.tsx` が `window.skillCreatorAPI` 経路を使用 | コードレビュー |
| AC-2 | `GovernanceSummaryPanel.tsx` が `window.skillCreatorAPI` 経路を使用   | コードレビュー |
| AC-3 | `grep "window.electronAPI.skillCreator" renderer/` の結果が0件        | grep検索       |
| AC-4 | IPC分離契約設計ドキュメントが存在する                                 | ファイル確認   |
| AC-5 | チャネル命名規則ガイドラインが存在する                                | ファイル確認   |
| AC-6 | typecheck エラーなし                                                  | typecheck      |
| AC-7 | lint エラーなし                                                       | lint           |
| AC-8 | 既存テスト全 PASS                                                     | CI             |

## 参照資料

| 資料名                   | パス                                                                                  | 説明                        |
| ------------------------ | ------------------------------------------------------------------------------------- | --------------------------- |
| ImprovementProposalPanel | `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx`             | 旧経路使用コンポーネント1   |
| GovernanceSummaryPanel   | `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx` | 旧経路使用コンポーネント2   |
| skill-creator-api.ts     | `apps/desktop/src/preload/skill-creator-api.ts`                                       | 移行先APIの定義             |
| preload/index.ts         | `apps/desktop/src/preload/index.ts`                                                   | API公開エントリポイント     |
| IPC契約チェックリスト    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`         | IPC修正時の同時更新チェック |

## 多角的チェック観点

| 観点           | 適用判断                          | 確認内容                          |
| -------------- | --------------------------------- | --------------------------------- |
| アーキテクチャ | IPC経路移行のため適用             | 移行後も機能が維持されること      |
| IPC通信        | チャネル参照変更のため適用        | IPC契約チェックリスト準拠         |
| セキュリティ   | renderer側のAPI参照変更のため確認 | contextBridge経由であることを確認 |

## 統合テスト連携

- Phase 2 に移行方針を引き継ぐ
- Phase 3 で設計の妥当性を確認する

## 成果物

| 成果物     | パス                                         | 説明                              |
| ---------- | -------------------------------------------- | --------------------------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | 旧経路使用箇所・移行先API・AC定義 |

## 完了条件

- [ ] 旧経路使用箇所の完全列挙（2ファイル確認、追加箇所なし確認）
- [ ] 移行先API（`applyRuntimeImprovement`、`getGovernanceState`）の存在確認
- [ ] AC-1〜AC-8 が定義されている
- [ ] 含む/含まないが明確
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

→ [Phase 2: 設計](./phase-2-design.md)
