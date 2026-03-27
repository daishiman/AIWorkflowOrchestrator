# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 7                                             |
| Phase名    | カバレッジ確認                                |
| 対象機能   | TASK-SDK-04-U2-plan-execute-canonical-binding |
| 前提Phase  | Phase 6: テスト拡充                           |
| 次Phase    | Phase 8: リファクタリング                     |
| ステータス | completed                                     |
| 作成日     | 2026-03-27                                    |

## 目的

AC-1〜AC-5 と concern coverage を照合し、drift 再発ポイントの抜けをなくす。

## 実行タスク

### Task 1: 受入条件カバレッジ

- AC ごとのテスト対応表を作る
- approved / draft / cancel / regression を個別 concern として扱う

### Task 2: 依存関係カバレッジ

- store hook、component state、runtime API mock の3層を確認する

## 参照資料

| 資料名     | パス                                                                                       | 説明            |
| ---------- | ------------------------------------------------------------------------------------------ | --------------- |
| テスト拡充 | `phase-6-test-expansion.md`                                                                | coverage 対象   |
| 実装記録   | `outputs/phase-5/implementation-record.md`                                                 | coverage の根拠 |
| 品質教訓   | `.agents/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md` | 再発観点        |

## 統合テスト連携

- review -> edit -> execute の一連フローを coverage の中核ケースに置く
- 行数よりも concern coverage を優先して判定する

## 成果物

| 成果物             | パス                                 | 説明                   |
| ------------------ | ------------------------------------ | ---------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | AC と concern の対応表 |

## 完了条件

- [ ] AC-1〜AC-5 の対応表がある
- [ ] concern coverage の抜けがない
- [ ] dependency edge が記録されている
- [ ] Phase 8 に渡す重複削減候補が整理されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
