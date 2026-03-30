# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 9                                                |
| Phase名    | 品質保証                                         |
| 対象機能   | TASK-P0-02 verify→improve→re-verify 閉ループ修復 |
| 前提Phase  | Phase 8: リファクタリング                        |
| 次Phase    | Phase 10: 最終レビュー                           |
| ステータス | pending                                          |
| 作成日     | 2026-03-29                                       |
| 更新日     | 2026-03-30                                       |

## 目的

state machine の不変条件を検証し、閉ループの全遷移が安全であることを品質ゲートとして確認する。

## 実行タスク

### Task 1: state 不変条件の検証

- 「verify phase でのみ recordVerifyPass/Failure が呼べる」不変条件を確認する
- 「improve phase でのみ re-verify が要求できる」不変条件を確認する
- 「遷移テーブルに存在しない遷移は全て禁止される」不変条件を確認する
- dead state（到達不能状態）が存在しないことを再確認する

### Task 2: 実装品質チェック

- recordVerifyPass/Failure の対称性が維持されていることを確認する
- Facade と Engine の責務分離が適切であることを確認する
- IPC handler が Engine の内部状態に直接アクセスしていないことを確認する
- 型安全性: any 型の使用がないことを確認する
- セキュリティ: IPC handler の sender 検証（`event.senderFrame` / `webContents.id` チェック）が適切に実装されていることを確認する

### Task 3: IPC契約ドリフト検証

品質ゲートとして IPC 契約のドリフトがないことを検証する:

- 以下のコマンドを実行し、IPC 契約の整合性を確認する:
  ```bash
  pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only
  ```
- 新規追加した verify pass handler が IPC 契約チェックの対象に含まれていることを確認する
- ドリフトが検出された場合は blocker として Phase 10 に報告する

### Task 4: 仕様書品質チェック

- phase 名、成果物名、artifacts 名称を統一する
- Phase 11/12 の補助成果物を先に定義する
- artifacts.json と実ファイル名が揃っていることを確認する

## 参照資料

| 資料名               | パス                                       | 説明             |
| -------------------- | ------------------------------------------ | ---------------- |
| 実装記録             | `outputs/phase-5/implementation-record.md` | 品質ゲートの根拠 |
| リファクタリング記録 | `phase-8-refactoring.md`                   | 品質ゲート対象   |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`       | AC 対応表        |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                                        | 内容                                  |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------- |
| Skill Creator Service仕様 | `.agents/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | SkillCreatorService仕様との整合性確認 |
| IPC契約チェックリスト     | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC修正時の整合性確認                 |

## 統合テスト連携

- 不変条件のテストが Phase 4/6 で定義されていることを cross-check する
- Phase 10 へ渡す blocker をここで出し切る

## 成果物

| 成果物           | パス                                | 説明                               |
| ---------------- | ----------------------------------- | ---------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | 不変条件検証、実装品質、仕様書品質 |

## 完了条件

- [ ] state 不変条件が全て検証されている
- [ ] 実装品質の blocker が整理されている
- [ ] 仕様書品質の drift が解消されている
- [ ] artifacts と実ファイル名が揃っている
- [ ] Phase 10 に渡す gate 材料が揃っている
- [ ] IPC契約ドリフト検証（`check-ipc-contracts.ts --report-only`）を実行し問題がないことを確認した
- [ ] IPC handler の sender 検証が適切に実装されていることを確認した
- [ ] aiworkflow-requirements の関連仕様を確認した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 10: 最終レビュー](./phase-10-final-review.md)
