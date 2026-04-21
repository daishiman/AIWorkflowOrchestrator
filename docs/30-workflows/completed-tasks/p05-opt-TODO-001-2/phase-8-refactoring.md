# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 8                                    |
| タスクID   | TASK-SW-TODO-001                     |
| 機能名     | conversation-round-step-todo-cleanup |
| 前提Phase  | Phase 7                              |
| 後続Phase  | Phase 9                              |
| 作成日     | 2026-04-20                           |
| ステータス | completed                            |

## 目的

コードではなく workflow narrative と artifact 命名の冗長さを削り、最小複雑性へ整流する。

## リファクタリング対象

| 対象                | Before             | After                                  | 理由              |
| ------------------- | ------------------ | -------------------------------------- | ----------------- |
| implementation mode | 新規実装前提       | `verify_existing`                      | false work 排除   |
| Phase 11            | バッジ UI 目視前提 | NON_VISUAL evidence 前提               | current fact 反映 |
| artifacts           | root のみ          | root + `outputs/artifacts.json` parity | skill 準拠        |

## 成果物

| 成果物               | パス                                 | 説明              |
| -------------------- | ------------------------------------ | ----------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | Before/After/理由 |

## 完了条件

- [x] narrative の冗長さを除去した
- [x] artifact 命名を整流した
- [x] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本 Phase 内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

## 次のPhase

Phase 9: 品質保証
