# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 9                               |
| Phase名    | 品質保証                        |
| 機能名     | ipc-session-runtime-unification |
| 対象機能   | TASK-UI-03 IPC 二重経路統合     |
| 前提Phase  | Phase 8: リファクタリング       |
| 次Phase    | Phase 10: 最終レビュー          |
| ステータス | pending                         |
| 作成日     | 2026-04-06                      |

## 目的

IPC 統合の不変条件を検証し、セキュリティ均一性・契約整合性・実装品質を品質ゲートとして確認する。

## 実行タスク

### Task 1: IPC 不変条件の検証

- 「全チャネルがホワイトリストに登録されている」不変条件を確認する
- 「全ハンドラーに sender 検証が適用されている」不変条件を確認する
- 「パストラバーサル防止が全ファイルパス引数に適用されている」不変条件を確認する
- 「Main/Preload/型定義が同期している」不変条件を確認する

### Task 2: 実装品質チェック

- preload と Main のハンドラー対応が 1:1 であることを確認する
- エラーハンドリングが統一されていることを確認する
- 型安全性: any 型の使用がないことを確認する
- 命名規則が一貫していることを確認する
- デッドコードが残っていないことを確認する

### Task 3: IPC 契約ドリフト検証

品質ゲートとして IPC 契約のドリフトがないことを検証する:

- 以下のコマンドを実行し、IPC 契約の整合性を確認する:
  ```bash
  pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only
  ```
- 統合後の全チャネルが IPC 契約チェックの対象に含まれていることを確認する
- ドリフトが検出された場合は blocker として Phase 10 に報告する

### Task 4: セキュリティ均一性最終確認

- Session IPC と Runtime IPC でセキュリティチェックの適用に差がないことを最終確認する
- 共通セキュリティミドルウェアが全ハンドラーに適用されていることを確認する
- `security-skill-ipc-core.md` の要件と実装の対応表を作成する

### Task 5: 仕様書品質チェック

- phase 名、成果物名、artifacts 名称を統一する
- Phase 11/12 の補助成果物を先に定義する
- artifacts.json と実ファイル名が揃っていることを確認する

## 参照資料

| 資料名               | パス                                       | 説明             |
| -------------------- | ------------------------------------------ | ---------------- |
| 実装記録             | `outputs/phase-5/implementation-record.md` | 品質ゲートの根拠 |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md`       | 品質ゲート対象   |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`       | AC 対応表        |

### システム仕様（aiworkflow-requirements）

> 品質保証で必ず���下のシステム仕様を確認し、整合性を検証してください。

| 参照資料                  | パス                                                                           | 内容                             |
| ------------------------- | ------------------------------------------------------------------------------ | -------------------------------- |
| Agent IPC チャネル仕様    | `.agents/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`      | 正本チャネル定義との最終整合確認 |
| IPC契約チェックリスト     | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`  | IPC契約ドリフト検証              |
| スキル実行IPCセキュリティ | `.agents/skills/aiworkflow-requirements/references/security-skill-ipc-core.md` | セキュリティ均一性の最終確認     |

## 統合テスト連携

- 不変条件のテストが Phase 4/6 で定義されていることを cross-check する
- Phase 10 へ渡す blocker をここで出し切る

## 成果物

| 成果物      | パス                           | 説明                                                        |
| ----------- | ------------------------------ | ----------------------------------------------------------- |
| QA レポート | `outputs/phase-9/qa-report.md` | 不変条件検証、実装品質、IPC契約ドリフト、セキュリティ均一性 |

## 完了条件

- [ ] IPC 不変条件が全て検証されている
- [ ] 実装品質の blocker が整理されている
- [ ] IPC契約ドリフト検証（`check-ipc-contracts.ts --report-only`）を実行し問題がないことを確認した
- [ ] セキュリティ均一性が最終確認されている
- [ ] 仕様書品質の drift が解消されている
- [ ] artifacts と実ファイル名が揃っている
- [ ] Phase 10 に渡す gate 材料が揃っている
- [ ] aiworkflow-requirements の関連仕様を確認した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 10: 最終レビュー](./phase-10-final-review.md)
