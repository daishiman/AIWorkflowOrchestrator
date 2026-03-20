# [#1318] [TASK-IMP-SKILLCENTER-UI-REFINEMENT-001] SkillCenterView UI 改善（8pxグリッド準拠・viewStyles分離）

## メタ情報

```yaml
issue_number: 1318
title: [TASK-IMP-SKILLCENTER-UI-REFINEMENT-001] SkillCenterView UI 改善（8pxグリッド準拠・viewStyles分離）
state: CLOSED
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-03-18
updated_date: 2026-03-18
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1318
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## タスク概要

SkillCenterView の UI 品質と保守性を向上させるため、以下の2点を実施する。

1. ヘッダー CTA ボタンの水平パディングを Apple HIG 推奨の 8px グリッド準拠値（`px-4` = 16px）に修正する
2. `viewStyles` オブジェクト（86行）を `SkillCenterView.styles.ts` として外部ファイルに分離し、単一責務原則（SRP）を回復する

## 背景

TASK-SKILL-LIFECYCLE-02 で SkillCenterView にヘッダー CTA ボタン（「新規作成」）を追加した際、ボタンの水平パディングに `px-3.5`（14px）が指定された。この値は Apple HIG が推奨する 8px グリッドの倍数（8, 16, 24, ...）から外れており、Phase 12 の二次検証で検出された。

また、同タスクで JourneyPanel や SurfaceOwnershipPanel のスタイル定義が追加された結果、`viewStyles` オブジェクトが約86行に膨れ上がった。`index.tsx` はコンポーネントロジック（約420行）とスタイル定義（約86行）が混在しており、SRP に違反する状態となっている。

このまま放置すると、`index.tsx` が 500 行超過の警告対象になる可能性があり、P47（CSS変数ベースのスタイルテストアサーション戦略）の適用も困難になる。

## スコープ

**スコープ内:**

- ヘッダー CTA の `px-3.5` を `px-4` に変更
- `viewStyles` オブジェクトを `SkillCenterView.styles.ts` に抽出
- `index.tsx` から `viewStyles` を import に切り替え
- 既存テストの PASS 確認

**スコープ外:**

- 他のコンポーネント（FeaturedSection, CategoryTabs 等）のスタイル分離
- 新規テストの追加（既存テストの PASS 確認のみ）
- 削除確認ダイアログ内のインラインスタイルの外部化

## 受入基準

- [ ] ヘッダー CTA の水平パディングが `px-4`（16px）であること
- [ ] `viewStyles` オブジェクトが `SkillCenterView.styles.ts` に分離されていること
- [ ] `index.tsx` から `viewStyles` が import 文で参照されていること
- [ ] `index.tsx` のファイル行数が分離前（538行）より減少していること
- [ ] `SkillCenterView.styles.ts` に `as const` アサーションが維持されていること
- [ ] 既存テスト（`SkillCenterView.cta.test.tsx` 等）が全て PASS すること
- [ ] UI の見た目に変化がないこと（視覚的リグレッションなし）
- [ ] `pnpm lint` および `pnpm typecheck` が PASS すること

## 参照

- タスク仕様書: `docs/30-workflows/completed-tasks/skill-lifecycle-routing/unassigned-task/task-imp-skillcenter-ui-refinement-001.md`
- 発見元: TASK-IMP-SKILLCENTER-CREATE-ROUTE-001 二次検証
- 関連ルール: `.claude/rules/01-architecture.md`（8pxグリッド、Apple HIG準拠、SRP）
- 関連 Pitfall: P47（CSS変数ベースのスタイルテストアサーション戦略）
