# Phase 2: 設計

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 2                               |
| タスクID   | TASK-SC-IMPROVE-PROMPT-IMPL-001 |
| ステータス | pending                         |
| 作成日     | 2026-04-21                      |

## 目的

`runImprovePromptWorkflow()` の制御フロー、責務境界、失敗時の挙動、progress 契約を設計し、Phase 3 でレビュー可能な状態にする。LLM 経路と `improveSkill()` フォールバック経路を混在させない。

## 実行タスク

### Task 1: ワークフロー設計

- `loading-skill -> analyzing -> improving -> validating -> done` を正本 progress とする
- `runImprovePromptWorkflow()` の入力、出力、副作用を定義する
- `case "improve-prompt"` から実処理へ到達する流れを記述する

### Task 2: 責務境界の設計

- `update` モードとの差異を固定する
- `SkillCreatorService` と `improveSkill()` の責務を分ける
- `SKILL.md` 読み込み、改善、書き戻しの境界を明示する

### Task 3: 異常系設計

- LLM 利用不可時のフォールバック
- ファイル読み書き失敗時のエラー境界
- AbortSignal の中断タイミング

## 参照資料

- [Phase 1: 要件定義](phase-1-requirements.md)
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`

## 実行手順

1. 正常系フローを固める
2. 失敗系とフォールバックを追加する
3. `update` モードとの差分を明文化する
4. Phase 4 のテスト観点へ落とし込む

## 統合テスト連携

Phase 2 では unit test と manual test が同じ観測点を参照できるよう、progress 名称、ファイル更新結果、abort 振る舞いを正本化する。

## 多角的チェック観点

- 要素分解 / MECE: 正常系、失敗系、abort、回帰を漏れなく分けているか
- システム思考: 依存タスクと兄弟タスクの境界が明確か
- トレードオン思考: LLM 利用時の品質と fallback の堅牢性の均衡が取れているか
- 論点思考: 真の論点を `prompt 改善処理の実装` に絞れているか

## サブタスク管理

| サブタスクID | 内容             | 担当   |
| ------------ | ---------------- | ------ |
| ST-2-01      | 正常系フロー設計 | Task 1 |
| ST-2-02      | 責務境界整理     | Task 2 |
| ST-2-03      | 異常系設計       | Task 3 |

## 成果物

- `outputs/phase-2/workflow-design.md`
- `outputs/phase-2/error-handling-design.md`
- `outputs/phase-2/dependency-boundary.md`

## 完了条件

- [ ] 実行フローと progress 契約が固定されていること
- [ ] `update` モードとの差異が明記されていること
- [ ] LLM / fallback / abort の3系統が整理されていること
- [ ] Phase 3 でレビュー可能な粒度になっていること

## タスク 100% 実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物が `outputs/phase-2/` に出力されていること
- [ ] Phase 3 に渡す設計判断が固定されていること

## 次 Phase

[Phase 3: 設計レビュー](phase-3-design-review.md) へ進む。
