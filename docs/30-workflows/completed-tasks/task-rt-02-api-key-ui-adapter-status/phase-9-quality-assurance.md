# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                   |
| ---------- | ------------------------------------ |
| Phase      | 9                                    |
| Phase名    | 品質保証                             |
| 前提Phase  | Phase 8                              |
| 後続Phase  | Phase 10                             |
| ステータス | spec_created                         |
| 作成日     | 2026-03-29                           |
| 機能名     | task-rt-02-api-key-ui-adapter-status |

## 目的

lint、typecheck、テスト、IPC drift audit を通し、既存契約再利用前提が守られていることを保証する。

## 実行タスク

- Lint / typecheck 実行
- テストと coverage 最終確認
- IPC / preload 契約ドリフト監査

## 統合テスト連携【必須】

品質保証で自動テスト結果を集約確認する。

## 参照資料

| 参照資料       | パス                                                                        | 内容                          |
| -------------- | --------------------------------------------------------------------------- | ----------------------------- |
| 品質基準       | `.claude/skills/task-specification-creator/references/quality-standards.md` | 基準                          |
| IPC drift 監査 | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`         | `check-ipc-contracts.ts` 導線 |

## 成果物

| 成果物       | パス                                | 説明                                   |
| ------------ | ----------------------------------- | -------------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | lint / type / tests / drift audit 結果 |

## 完了条件

- [ ] lint が成功している
- [ ] typecheck が成功している
- [ ] テストが成功している
- [ ] IPC / preload 契約ドリフトがない
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 10: 最終レビューゲート
