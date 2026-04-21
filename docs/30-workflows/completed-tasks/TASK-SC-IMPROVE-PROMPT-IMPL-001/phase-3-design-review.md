# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 3                               |
| タスクID   | TASK-SC-IMPROVE-PROMPT-IMPL-001 |
| ステータス | pending                         |
| 作成日     | 2026-04-21                      |

## 目的

Phase 2 設計が受入基準を満たすかを判定し、Phase 4 へ進む条件を固定する。PASS / MINOR / MAJOR のどれかで記録し、差し戻し先を曖昧にしない。

## 実行タスク

### Task 1: 設計レビュー

- `runImprovePromptWorkflow()` の責務が単一責務か確認する
- `update` モードとの差異が明確か確認する
- `fallback` と `abort` の設計が安全か確認する

### Task 2: リスク評価

- prompt 対象抽出の破壊リスク
- SKILL.md 書き戻し失敗リスク
- 既存モードへの回帰リスク

### Task 3: Gate 判定

- PASS: Phase 4 へ進む
- MINOR: Phase 4 へ進むが Phase 6 / 12 で追跡する
- MAJOR: Phase 2 へ差し戻す

## 参照資料

- [Phase 2: 設計](phase-2-design.md)
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

## 実行手順

1. 設計論点をチェックリストで確認する
2. リスクを優先度付きで整理する
3. PASS / MINOR / MAJOR を決定する

## 統合テスト連携

Phase 3 では Phase 4 のテスト観点が `progress / file update / fallback / abort` をカバーできるかを確認し、不足があれば MAJOR とする。

## 多角的チェック観点

- 批判的思考: 本当にこの設計で改善対象だけを書き換えられるか
- 因果関係分析: `abort` 失敗がどこに波及するか
- 価値提案思考: 最小変更で最大の受入基準を満たせるか
- 改善思考: simpler alternative を捨てた理由が説明できるか

## サブタスク管理

| サブタスクID | 内容             | 担当   |
| ------------ | ---------------- | ------ |
| ST-3-01      | レビュー観点確認 | Task 1 |
| ST-3-02      | リスク評価       | Task 2 |
| ST-3-03      | Gate 判定        | Task 3 |

## 成果物

- `outputs/phase-3/design-review.md`
- `outputs/phase-3/gate-decision.md`

## 完了条件

- [ ] PASS / MINOR / MAJOR が記録されていること
- [ ] リスクと差し戻し先 Phase が明記されていること
- [ ] simpler alternative の採否が説明されていること
- [ ] Phase 4 の開始条件が固定されていること

## タスク 100% 実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物が `outputs/phase-3/` に出力されていること
- [ ] Phase 4 へ進む条件が明確であること

## 次 Phase

PASS または MINOR の場合、[Phase 4: テスト作成](phase-4-test-creation.md) へ進む。
