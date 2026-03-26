# [#1590] [TASK-SC-09] improve モードハンドリング実装

## メタ情報

```yaml
issue_number: 1590
title: [TASK-SC-09] improve モードハンドリング実装
state: OPEN
priority: 中
scale: -
category: -
status: 未実施
created_date: 2026-03-24
updated_date: 2026-03-24
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1590
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

SkillLifecyclePanel の handlePrepare で detectMode が "improve" を返した場合のハンドリングを実装し、既存スキルの改善フローを正しく動作させる。

## 背景

TASK-SC-06-UI-RUNTIME-CONNECTION の AC-1（planSkill 呼出し）は "plan" モードでのみ動作するように実装された。
detectMode は "plan" と "improve" の2つのモードを返す可能性がある。"improve" モードが返された場合、planSkill ではなく improveSkill API を呼ぶ必要がある。

## 変更対象ファイル

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/preload/skill-creator-api.ts`
- `apps/desktop/src/renderer/store/slices/agentSlice.ts`

## 受入基準

- [ ] detectMode が "improve" を返した場合に improveSkill API が呼ばれること
- [ ] "improve" モードで generationStep/generationProgress が適切に遷移すること
- [ ] "plan" モードの既存動作に影響がないこと（回帰テスト PASS）
- [ ] TypeScript 型チェック PASS
- [ ] 関連テスト全件 PASS

## 苦戦箇所（TASK-SC-06 実装知見）

| 苦戦箇所                                    | 問題                                                                                         | 解決策                                                                                         |
| ------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| detectMode の戻り値パターン拡大             | "plan" 以外のモード（"improve" 含む）を返す可能性があるが TASK-SC-06 では "plan" のみ処理    | 新モード追加時は handlePrepare の if/else 分岐を追加し、API 存在チェックを必ず行う             |
| SkillCreatorRuntimeApi の optional メソッド | ローカル型で全メソッドが `?` (optional) のため null チェック漏れがコンパイル時に検出されない | API メソッドの存在チェック後に early return し、Graceful Degradation パターン（P65/S30）に従う |

## 参照

- TASK-SC-06-UI-RUNTIME-CONNECTION Phase 10 レビュー（U-1）
- 指示書: `docs/30-workflows/unassigned-task/TASK-SC-09-IMPROVE-MODE-HANDLING.md`
