# TASK-SW-STRUCT-002 テスト設計書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| タスクID   | TASK-SW-STRUCT-002                            |
| 機能名     | struct-002-connect-structure-plan-to-skill-md |
| 作成日     | 2026-04-15                                    |
| 完了確認日 | 2026-04-17                                    |

## テスト方針

TDD Red → Green フェーズ。実装前にテストを作成し、Phase 5 実装後に全件 PASS を目標とする。

## テストケース一覧

### 正常系（AC-1/AC-2 対応）

| TC ID        | テスト名                                                        | AC   | 対象ファイル                |
| ------------ | --------------------------------------------------------------- | ---- | --------------------------- |
| TC-CONNECT-1 | create モードで generateSkillMd が1回呼ばれること               | AC-2 | SkillCreatorService.test.ts |
| TC-CONNECT-3 | generate_skill_md.js を --plan と --output の引数で呼ぶこと     | AC-2 | SkillCreatorService.test.ts |
| IT-CONNECT-1 | runCreateWorkflow → generateSkillMd end-to-end フロー           | AC-2 | SkillCreatorService.test.ts |
| IT-CONNECT-2 | generateSkillMd が tmpPlanPath に workflow 形式 JSON を書き込む | AC-2 | SkillCreatorService.test.ts |

### 異常系（AC-3/AC-4 対応）

| TC ID        | テスト名                                                           | AC   | 対象ファイル                |
| ------------ | ------------------------------------------------------------------ | ---- | --------------------------- |
| TC-CONNECT-2 | structurePlan が null の場合はフォールバック・generateSkillMd 不呼 | AC-4 | SkillCreatorService.test.ts |
| TC-CONNECT-4 | スクリプト実行失敗時の ensureSkillMdExists フォールバック          | AC-3 | SkillCreatorService.test.ts |

### 回帰テスト（AC-5 対応）

| TC ID  | テスト名                                                  | AC   |
| ------ | --------------------------------------------------------- | ---- |
| TC-R01 | collaborative モードの既存テストが全て PASS する          | AC-5 |
| TC-R02 | collaborative モード: runCollaborativeWorkflow が正常動作 | AC-5 |
| TC-R03 | orchestrate モード: runOrchestrateWorkflow が正常動作     | AC-5 |

## baseline 確認

実装前に既存テストが PASS していることを確認済み（2026-04-17）。

## TDD Red 状態

current branch では implementation が既にマージ済みのため、Phase 5 は「回帰確認」として実施。
