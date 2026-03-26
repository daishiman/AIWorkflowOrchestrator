# [#1518] "[UT-RUNTIME-FACADE-RETURN-TYPE-001] UT"

## メタ情報

```yaml
task_id: UT-RUNTIME-FACADE-RETURN-TYPE-001
task_name: UT
category: -
target_feature: -
priority: medium
scale: -
status: unassigned
source_phase: -
created_date: 2026-03-23
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-RUNTIME-FACADE-RETURN-TYPE-001.md
```

| 項目       | 内容       |
| ---------- | ---------- |
| 優先度     | medium     |
| 規模       | -          |
| ステータス | unassigned |

---

## 目的

`RuntimeSkillCreatorPlanResponse` / `RuntimeSkillCreatorImproveResponse` の `bundle` → `guidance` 変更が Preload/Renderer 側に波及していないか確認し、必要に応じて型定義を更新する。

## 背景

UT-RUNTIME-BUILDER-MIGRATION-001 で shared 型定義（`skillCreator.ts`）の terminal_handoff バリアントを `bundle: TerminalHandoffBundle` から `guidance: HandoffGuidance` に変更した。Preload/Renderer 側でこの型を参照している箇所があれば型エラーが発生する可能性がある。

## 実行タスク

1. `grep -rn "RuntimeSkillCreatorPlanResponse\|RuntimeSkillCreatorImproveResponse" apps/desktop/src/` で全参照箇所を確認
2. `.bundle` でアクセスしている箇所を `.guidance` に移行
3. Renderer コンポーネントで `TerminalHandoffBundle` を直接参照している箇所がないか確認

## 受入基準

- [ ] `pnpm typecheck` が PASS する
- [ ] `.bundle` でアクセスしている箇所が0件、または `.guidance` に移行済み
