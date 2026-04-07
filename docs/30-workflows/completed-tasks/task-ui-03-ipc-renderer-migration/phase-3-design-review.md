# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 3                                 |
| Phase名    | 設計レビュー                      |
| 機能名     | task-ui-03-ipc-renderer-migration |
| 前提Phase  | Phase 2: 設計                     |
| 次Phase    | Phase 4: テスト作成               |
| ステータス | pending                           |
| 作成日     | 2026-04-07                        |

## 目的

Phase 2 の設計を検証し、実装進行の可否を判断する。

## 実行タスク

- Phase 2 の設計方針を確認する
- `window.skillCreatorAPI` への統一方針を確認する
- `electronAPI.skillCreator` の preload 互換シム方針を確認する
- PASS / MINOR / MAJOR / CRITICAL を記録する

## 判断基準

| 判定     | 条件                                                         |
| -------- | ------------------------------------------------------------ |
| PASS     | 移行方針が明確で既存動作への影響が最小限                     |
| MINOR    | 軽微な設計変更が必要だが実装は進められる                     |
| MAJOR    | 型定義の不一致等、根本的な見直しが必要（Phase 2 に差し戻し） |
| CRITICAL | 移行先APIが存在しない等、前提条件が満たされていない状態      |

## レビューチェックリスト

- [ ] `window.skillCreatorAPI.applyRuntimeImprovement` が preload に存在する
- [ ] `window.skillCreatorAPI.getGovernanceState` が preload に存在する（または代替手段が設計されている）
- [ ] 型定義が移行後も TypeScript エラーなしで通過する
- [ ] `electronAPI.skillCreator` は preload の互換シムとして扱い、renderer からの direct ref が 0 件である
- [ ] IPC分離契約の内容が TASK-UI-02 の実装と整合している

## 参照資料

| 資料名             | パス                       | 説明       |
| ------------------ | -------------------------- | ---------- |
| Phase 2 設計       | `phase-2-design.md`        | 比較方針   |
| Phase 1 要件       | `phase-1-requirements.md`  | AC定義     |
| Phase 4 テスト作成 | `phase-4-test-creation.md` | 次フェーズ |

## 統合テスト連携

- Phase 4 にレビュー結果を引き継ぐ
- MAJOR / CRITICAL の場合は Phase 2 に差し戻す

## 成果物

| 成果物       | パス                                    | 説明     |
| ------------ | --------------------------------------- | -------- |
| レビュー結果 | `outputs/phase-3/design-review-gate.md` | 判定結果 |

## 完了条件

- [ ] レビューチェックリスト全項目確認
- [ ] PASS/MINOR/MAJOR/CRITICAL の判定が記録されている
- [ ] PASS/MINOR の場合: Phase 4 への進行を承認
- [ ] MAJOR/CRITICAL の場合: 差し戻し先と理由が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

→ [Phase 4: テスト作成](./phase-4-test-creation.md)
