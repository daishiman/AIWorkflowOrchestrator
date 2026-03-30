# Phase 2: 設計サマリ

## 設計判断

- `recordVerifyPass(planId, checks)` を `SkillCreatorWorkflowEngine` に追加する
- 遷移テーブルへ `improve -> verify` を追加し、既存 `improve -> execute` と共存させる
- `requestReverify()` の gate は improve-only とし、`terminal_handoff` を先に拒否する
- public IPC / preload / shared response shape は維持し、engine 内 state transition のみを修正する

## 非変更項目

- 新規 IPC channel は追加しない
- `verifyResult` shape は既存の `pending` / `fail` / `pass` を維持する
- `RuntimeSkillCreatorFacade.reverifyWorkflow()` は既存 bridge を継続利用する

## 参照

- 正本仕様: `phase-2-design.md`
- 実装証跡: `outputs/phase-5/implementation-record.md`
