# [#1593] [TASK-SC-12] Hybrid State Pattern ガイドドキュメント化

## メタ情報

```yaml
issue_number: 1593
title: [TASK-SC-12] Hybrid State Pattern ガイドドキュメント化
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-03-24
updated_date: 2026-03-24
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1593
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

TASK-SC-06 で導入された `localPlanResult ?? storePlanResult` の Hybrid State Pattern を architecture-implementation-patterns.md に正式なパターンとして文書化し、エラーパスでの非対称クリアリスクを防止するガイドラインを提供する。

## 背景

TASK-SC-06-UI-RUNTIME-CONNECTION では、IPC 呼出しの即時レスポンス（localPlanResult）と Store 経由の非同期レスポンス（storePlanResult）を `localPlanResult ?? storePlanResult` の Null Coalescing で統合する Hybrid State Pattern を導入した。

リスク:

1. **非対称クリア**: エラーパスで localPlanResult がクリアされず、古い成功結果が残存して UI に表示される
2. **優先順位の暗黙性**: `??` 演算子による優先順位がドキュメント化されておらず、後続開発者が意図を誤解する
3. **テスタビリティ**: local と store の両方の状態を制御する必要がありテストが複雑化

## 変更対象ファイル

- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

## 受入基準

- [ ] architecture-implementation-patterns.md に Hybrid State Pattern が記載されていること
- [ ] 適用条件、リスク、防止策が明記されていること
- [ ] 正誤のコード例が含まれていること
- [ ] SkillLifecyclePanel のエラーパスで非対称クリアが発生しないことがテストで保証されていること
- [ ] topic-map.md が再生成されていること

## 参照

- TASK-SC-06-UI-RUNTIME-CONNECTION Phase 10 レビュー（U-4）
- architecture-implementation-patterns.md（パターン集の正本）
- P31: Zustand Store Hooks 無限ループ
- 指示書: `docs/30-workflows/unassigned-task/TASK-SC-12-HYBRID-STATE-PATTERN-GUIDE.md`
