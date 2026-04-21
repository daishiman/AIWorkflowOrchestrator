# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                                |
| ---------- | ------------------------------------------------- |
| Phase      | 1                                                 |
| 機能名     | TASK-RALLY-008                                    |
| タスク名   | processWorkflowOutcomeのfire-and-forget不整合修正 |
| 前提Phase  | -                                                 |
| 後続Phase  | Phase 2                                           |
| 作成日     | 2026-04-21                                        |
| ステータス | pending                                           |

## SubAgentチーム編成

| SubAgent   | 担当                                                                      | 実行形態          |
| ---------- | ------------------------------------------------------------------------- | ----------------- |
| SubAgent-A | processWorkflowOutcome全呼び出し箇所の特定・fire-and-forget箇所の洗い出し | 並列              |
| SubAgent-B | エラーハンドリング設計・setWorkflowError/setErrorの現状確認               | 並列              |
| SubAgent-C | A/B結果統合・受け入れ基準策定・要件定義書完成                             | 直列（A,B完了後） |

## 目的

`SkillLifecyclePanel.tsx`内の`processWorkflowOutcome`呼び出し箇所において、
`handleExecutePlan`では`await`付きで呼ばれているのに対し、`useEffect`内では
`void`（fire-and-forget）で呼ばれているという不整合を修正する要件を確定する。

## 背景

fire-and-forget箇所ではエラーが発生してもUIにエラー状態が反映されない。
RALLY-005で確立した`isSubmitting`フラグ管理と連携したエラーハンドリングが
fire-and-forget箇所では機能しない。
本タスクはRALLY-006（useEffect依存配列修正）完了後に着手する直列タスクである。

## SkillLifecyclePanelドメインの実行順序

```text
RALLY-001（dead code削除）
↓
RALLY-005（IPC権限設計確立）
↓
RALLY-006（useEffect依存配列修正）
↓
RALLY-008（fire-and-forget不整合修正）
```

## 実行タスク

- SubAgent-A: `processWorkflowOutcome`の全呼び出し箇所をgrepで特定する
- SubAgent-A: `void processWorkflowOutcome`形式の箇所（fire-and-forget候補）を特定する
- SubAgent-A: `handleExecutePlan`での`await`付き呼び出しを確認し、不整合を文書化する
- SubAgent-B: `setError`・`setWorkflowError`・`toErrorMessage`の現状を確認する
- SubAgent-B: `processWorkflowOutcome`の関数シグネチャ（`Promise<void>`か`void`か）を確認する
- SubAgent-C: 受け入れ基準AC-1〜AC-5を策定する

## 参照資料

| 資料名           | パス                                                                   | 用途                  |
| ---------------- | ---------------------------------------------------------------------- | --------------------- |
| 対象ファイル     | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`   | コード調査対象        |
| 設計ドキュメント | `docs/30-workflows/00-task-spec-design-docs/rally-phase-2-solution.md` | RALLY-008設計方針参照 |
| 既存index.md     | `docs/30-workflows/skill-create-flow-gaps/p08-seq-RALLY-008/index.md`  | タスク概要参照        |

## 成果物

| 成果物         | パス                                         | 説明                          |
| -------------- | -------------------------------------------- | ----------------------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件          |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`     | AC-1〜AC-5一覧                |
| コード調査結果 | `outputs/phase-1/code-investigation.md`      | fire-and-forget箇所の特定結果 |

## 完了条件

- [ ] `processWorkflowOutcome`の全呼び出し箇所が特定されていること
- [ ] `void processWorkflowOutcome`形式の箇所が特定されていること
- [ ] `processWorkflowOutcome`の関数シグネチャが確認されていること
- [ ] 受け入れ基準AC-1〜AC-5が策定されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計
