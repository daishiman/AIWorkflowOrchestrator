# Phase 1 成果物: 要件定義サマリー

## タスク概要

| 項目     | 値                                                     |
| -------- | ------------------------------------------------------ |
| タスク   | UT-SC-02-002: execute() の terminal_handoff 未分岐修正 |
| 種別     | セキュリティバグ修正                                   |
| 優先度   | 高                                                     |
| 元タスク | TASK-SC-02-RUNTIME-POLICY-CLOSURE                      |

## 問題

`RuntimeSkillCreatorFacade.execute()` が `terminal_handoff` 判定時に早期リターンせず、認証情報がない状態で `SkillExecutor.execute()` を呼び出す。`plan()` と `improve()` は正しく対応済みだが、`execute()` のみ `void decision;` で lint エラーを回避しているだけ。

## 機能要件（FR）

- FR-1: execute() が terminal_handoff 時に SkillExecutor を呼ばない
- FR-2: execute() が terminal_handoff 時に TerminalHandoffBundle を返す
- FR-3: RuntimeSkillCreatorExecuteResponse Union型を定義する
- FR-4: execute() の戻り値型を Union型に変更する
- FR-5: `void decision;` を除去する

## 非機能要件（NFR）

- NFR-1: 3メソッドの分岐パターン統一
- NFR-2: integrated_api パスの後方互換性
- NFR-3: テストカバレッジ基準維持

## 修正対象

- `packages/shared/src/types/skillCreator.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`
