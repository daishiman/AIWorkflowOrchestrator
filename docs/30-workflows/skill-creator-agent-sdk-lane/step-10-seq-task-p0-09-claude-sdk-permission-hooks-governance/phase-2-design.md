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
- phase ごとの dependency boundary を設計する
- canonical path と provenance の受け渡しを設計する

## 参照資料

| 資料名  | パス                                                                                              | 説明       |
| ------- | ------------------------------------------------------------------------------------------------- | ---------- |
| Phase 1 | `phase-1-requirements.md`                                                                         | 要件       |
| RT-06   | `../../completed-tasks/step-08-par-task-rt-06-claude-sdk-message-contract-normalization/index.md` | event 契約 |

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

| phase   | permissionMode  | allowedTools           | disallowedTools         | canUseTool の判断                 |
| ------- | --------------- | ---------------------- | ----------------------- | --------------------------------- |
| plan    | read-only       | read 系中心            | write / execute         | 変更を伴う tool は拒否            |
| execute | workspace-write | 生成対象 dir のみ      | repo-wide / destructive | provenance が一致する場合のみ許可 |
| verify  | read-only       | test / lint / validate | write                   | 読み取りと検証のみ許可            |
| improve | workspace-write | 限定 edit / refactor   | destructive / unrelated | 改善対象ファイルのみ許可          |

### ステップ2: hooks factory を設計する

- SessionStart: provenance 記録
- PreToolUse: policy 判定
- PostToolUse: 結果記録
- SessionEnd: summary 記録

### ステップ3: audit / UI payload を設計する

- provenance、decision reason、tool result を event payload に含める
- permission denial は UI で reason 付き表示にする
- audit sink は main 側で一元化し、renderer は read-only のみ参照する

### ステップ4: dependency boundary を固定する

- `RuntimeSkillCreatorFacade.ts` は SDK option 組み立て専任
- `creatorHandlers.ts` は IPC bridge 専任
- `skill-creator-api.ts` は renderer 露出専任
- `packages/shared/src/types/skillCreator.ts` は共有契約専任

## IPC 4層整合

| 層  | 対象            | 確認内容                          |
| --- | --------------- | --------------------------------- |
| 1   | constant / type | 共有型と定数が存在するか          |
| 2   | main handler    | permission / audit を生成できるか |
| 3   | preload API     | renderer へ安全に公開されているか |
| 4   | renderer UI     | denial / audit を読めるか         |

## validation matrix

| 検証対象 | コマンド / 観点            | 期待結果                                     |
| -------- | -------------------------- | -------------------------------------------- |
| policy   | phase 別 option レビュー   | plan / execute / verify / improve が分かれる |
| hooks    | hook sequence レビュー     | SessionStart 〜 SessionEnd が追える          |
| audit    | provenance / denial 確認   | reason 付きで記録される                      |
| UI       | permission denial 表示確認 | 理由つきで表示される                         |

## 成果物

| 成果物            | パス                                   | 説明                |
| ----------------- | -------------------------------------- | ------------------- |
| governance design | `outputs/phase-2/governance-design.md` | policy / hooks 設計 |

## 完了条件

- [x] phase 別 policy が設計されている
- [x] hooks factory の責務が定義されている
- [x] audit / UI payload の責務が分離されている
- [x] canonical path と provenance の受け渡しが定義されている
- [x] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携

- plan / execute / verify / improve の各 phase で permission boundary を検証できるようにする
- hooks の event order と denial 表示が trace 可能であることを確認する

## 多角的チェック観点（AIが判断）

- `permissionMode` が phase ごとに過不足なく分かれているか
- `canUseTool` が allow だけでなく deny の根拠も返せるか
- hooks が主処理を固定化していないか
- provenance と canonical path が UI から監査できるか

## サブタスク管理

| SubAgent   | 責務                   |
| ---------- | ---------------------- |
| SubAgent-A | permission policy 設計 |
| SubAgent-B | hooks / audit 設計     |
| SubAgent-C | UI / IPC payload 設計  |

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.jsonが更新されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

Phase 3: 設計レビュー
