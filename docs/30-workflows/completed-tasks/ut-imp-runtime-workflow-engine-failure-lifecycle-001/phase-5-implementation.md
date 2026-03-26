# Phase 5: 実装

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 5                                                    |
| 機能名 | ut-imp-runtime-workflow-engine-failure-lifecycle-001 |
| 作成日 | 2026-03-26                                           |

## 目的

workflow engine と facade に failure lifecycle 契約を実装する。

## 実行タスク

- engine に transition guard を追加する
- engine の execute fail / verify review / append artifact を実装する
- facade の executor reject 捕捉と state 保存を実装する

## 参照資料

| 資料名         | パス                                                                   | 説明                |
| -------------- | ---------------------------------------------------------------------- | ------------------- |
| engine 実装    | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | state owner         |
| facade 実装    | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | execute public path |
| Phase 2 output | `outputs/phase-2/failure-lifecycle-contract.md`                        | 契約                |
| Phase 4 output | `outputs/phase-4/test-specification.md`                                | テスト仕様          |

## 統合テスト連携

- Phase 5 の実装後に targeted vitest を実行する。
- Phase 7 は Green 結果と requirement の対応を再確認する。

## 成果物

| 成果物         | パス                                    | 説明                 |
| -------------- | --------------------------------------- | -------------------- |
| 実装ログ       | `outputs/phase-5/implementation-log.md` | 実装内容             |
| 変更ファイル表 | `outputs/phase-5/change-file-matrix.md` | 変更範囲             |
| Greenログ      | `outputs/phase-5/green-test-log.txt`    | targeted vitest 結果 |

## 完了条件

- [x] engine の失敗系 state 保存が実装されている
- [x] facade の reject path 保存が実装されている
- [x] targeted vitest が通っている
- [x] **本Phase内の全タスクを100%実行完了**
