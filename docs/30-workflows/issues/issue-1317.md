# [#1317] [TASK-IMP-SKILLCENTER-CTA-ACCESSIBILITY-001] SkillCenterView CTA 型安全性・アクセシビリティ改善

## メタ情報

```yaml
issue_number: 1317
title: [TASK-IMP-SKILLCENTER-CTA-ACCESSIBILITY-001] SkillCenterView CTA 型安全性・アクセシビリティ改善
state: CLOSED
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-03-18
updated_date: 2026-03-18
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1317
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## タスク概要

`useSkillCenter.ts` 内の `as` 型キャストを排除し、実行時の型安全性を確保する。同時に、CTA ボタン群にアクセシビリティ属性を追加し、WCAG 2.1 AA 準拠を達成する。

## 背景

TASK-SKILL-LIFECYCLE-02（SkillCenterView にスキル作成ルートを追加するタスク）の実装時に、`useSkillCenter.ts` フック内で `CategoryId` と `SkillCategory` の型の不一致を回避するために `as` 型キャストが導入された。具体的には、`useSkillCategory()` の戻り値を `as string | null` でキャスト（L179）し、`setSkillCategory` を `as (v: string | null) => void` でキャスト（L325）している。これらは Phase 12（ドキュメント）の二次検証で検出された。

また、同タスクで追加された SkillLifecycleJourneyPanel の CTA ボタンおよびヘッダーの「新規作成」CTA ボタンに `aria-label` が未設定であり、装飾目的の chevron-right アイコンにも `aria-hidden` が付与されていないことが確認された。

### 問題点

1. **型安全性の欠如（P19/P49 違反）**: `CategoryId`（`"all" | "dev" | "writing" | "analysis" | "automation" | "other"`）と `SkillCategory`（`"testing" | "design" | "development" | "documentation" | "security" | "performance" | "other"`）は共通値が `"other"` のみであり、型の不一致が `as` キャストにより暗黙的に握りつぶされている
2. **スクリーンリーダー対応不足（WCAG 2.1 AA 違反）**: ヘッダーの「新規作成」CTA ボタンおよび JourneyPanel の各 CTA ボタンに `aria-label` が設定されていない
3. **装飾アイコンの不適切な読み上げ**: JourneyPanel CTA ボタン内の chevron-right アイコンに `aria-hidden="true"` が付与されていない

## スコープ

| 対象                                             | 含む/含まない              |
| ------------------------------------------------ | -------------------------- |
| `useSkillCenter.ts` の `as` 型キャスト排除       | 含む                       |
| ヘッダー CTA の `aria-label` 追加                | 含む                       |
| JourneyPanel CTA の `aria-label` 追加            | 含む                       |
| JourneyPanel chevron-right の `aria-hidden` 追加 | 含む                       |
| `CategoryId` と `SkillCategory` の型統合         | 含まない（別タスクで検討） |
| 他コンポーネントのアクセシビリティ改善           | 含まない                   |

### 修正対象ファイル

| #   | ファイル                                                                       | 内容                                                                   |
| --- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| 1   | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` L179 | `useSkillCategory() as string \| null` の `as` キャスト排除            |
| 2   | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` L325 | `setSkillCategory as (v: string \| null) => void` の `as` キャスト排除 |
| 3   | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx` L387-395, L170-178 | `aria-label` 追加、chevron-right に `aria-hidden="true"` 追加          |

## 受入基準

- [ ] `useSkillCenter.ts` 内の `as` 型キャストが 0 件であること（`grep -n ' as ' useSkillCenter.ts` で確認）
- [ ] `CategoryId` から `SkillCategory | null` への変換がアダプタ関数を通じて行われていること
- [ ] ヘッダー CTA（`data-testid="header-create-cta"`）に `aria-label` が設定されていること
- [ ] JourneyPanel CTA（`data-testid="skill-lifecycle-cta-*"`）に `aria-label` が設定されていること
- [ ] JourneyPanel CTA 内の chevron-right アイコンに `aria-hidden="true"` が設定されていること
- [ ] ヘッダー CTA 内の plus アイコンに `aria-hidden="true"` が設定されていること
- [ ] `pnpm typecheck` がエラーなしで通ること
- [ ] 既存テストが全て PASS すること
- [ ] `aria-label` を検証するテストが追加されていること（ロールベースクエリで確認）

## 参照

- タスク仕様書: `docs/30-workflows/completed-tasks/skill-lifecycle-routing/unassigned-task/task-imp-skillcenter-cta-accessibility-001.md`
- 発見元: TASK-IMP-SKILLCENTER-CREATE-ROUTE-001 二次検証
- 関連 Pitfall: P19（型キャストバイパス）、P31（Zustand 個別セレクタ）、P39（happy-dom テスト）、P49（type predicate での `as` キャスト）
