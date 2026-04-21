# [#2088] chore(test): vitest.config.ts resolve.alias 自動解決対応 [UT-SKILL-WIZARD-VITEST-ALIAS-AUTO-RESOLVE-001]

## メタ情報

```yaml
task_id: UT-SKILL-WIZARD-VITEST-ALIAS-AUTO-RESOLVE-001
task_name: vitest.config.ts resolve.alias 自動解決対応
category: 改善
target_feature: テスト基盤 / ビルド設定
priority: 低
scale: 小規模
status: 未実施
source_phase: UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001 Phase 10 MINOR
created_date: 2026-04-11
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-VITEST-ALIAS-AUTO-RESOLVE-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`apps/desktop/vitest.config.ts` の `resolve.alias` に `@repo/shared` の subpath エクスポート（例: `@repo/shared/types/skillWizard`）を手動でエントリ追加しなければならない問題を解消する。

`vite-tsconfig-paths` が value import（`SEMANTIC_LABEL_MAP` 等）を解決できないため、手動追加が必要になった。新しい subpath を追加するたびに手動対応が必要で、設定の二重管理が発生している。

## 背景・課題

- `@repo/shared/types/skillWizard` からの value import がテスト環境で解決できなかった
- `vite-tsconfig-paths` が type import は解決できるが value import は解決できないケースがある
- `tsconfig.json` の `paths` と `vitest.config.ts` の `resolve.alias` が同一情報を重複管理

## 対応方針

**アプローチA（推奨）**: `tsconfig.json` を読み込んで `resolve.alias` を動的生成することで、subpath 追加時の手動対応を不要にする。

関連Issue（別問題）:

- #1715 `@repo/shared` メインパッケージの alias 解決（本タスクはsubpathが対象）
- #1707 viteエイリアス設定の動的インポート調査

## 関連ファイル

- `apps/desktop/vitest.config.ts`
- `apps/desktop/tsconfig.json`
- `docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-VITEST-ALIAS-AUTO-RESOLVE-001.md`
