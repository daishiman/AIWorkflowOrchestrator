# Phase 1: 要件定義

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 1                      |
| タスクID | TASK-SC-05-IMPROVE-LLM |
| 作成日   | 2026-03-22             |

## 目的

`RuntimeSkillCreatorFacade.improve()` の現行スタブ実装を調査し、LLM によるスキル改善提案生成の要件を定義する。improve-prompt.md の内容を確認し、改善提案の型定義（section, before, after, reason）を決定する。

## 実行タスク

1. `RuntimeSkillCreatorFacade.improve()` の現行スタブ実装を読み取り、インターフェースと戻り値型を確認する
2. `.claude/skills/skill-creator/agents/improve-prompt.md` の内容を読み取り、プロンプト設計に必要な情報を抽出する
3. `packages/shared/src/types/skillCreator.ts` の `RuntimeSkillCreatorImproveResult` 型の現状を確認する
4. 改善提案の型定義要件を策定する（section, before, after, reason フィールド）
5. 関連する受入基準 AC-5 の達成条件を明確化する
6. 既存の plan() / execute() との整合性を確認する

## 参照資料

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `packages/shared/src/types/skillCreator.ts`
- `.claude/skills/skill-creator/agents/improve-prompt.md`
- `apps/desktop/src/preload/types.ts`（IPC型定義）
- 関連FR: FR-3
- 関連AC: AC-5

## 成果物

- 要件定義書（本ファイル）
- improve() の現行インターフェース調査メモ
- 改善提案型定義要件リスト（section, before, after, reason の仕様）
- AC-5 達成条件の明文化

## 完了条件

- [ ] `improve()` の現行スタブ実装を確認した
- [ ] `improve-prompt.md` の内容を読み取り、プロンプト設計方針を策定した
- [ ] `RuntimeSkillCreatorImproveResult` 型の現状を確認した
- [ ] 改善提案フィールド（section, before, after, reason）の仕様を定義した
- [ ] AC-5「フィードバックを入力すると改善提案が返る」の達成条件を明文化した
- [ ] plan() / execute() との型・フロー整合性を確認した

## 次のPhase

Phase 2: 設計
