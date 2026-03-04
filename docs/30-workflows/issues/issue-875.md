# [#875] "[UT-FIX-TS-VITEST-TSCONFIG-PATHS-001] Vitest alias と tsconfig paths の同期自動化"

## メタ情報

```yaml
task_id: UT-FIX-TS-VITEST-TSCONFIG-PATHS-001
task_name: Vitest alias と tsconfig paths の同期自動化
category: 改善
target_feature: `@repo/shared` モジュール解決運用
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 3（MINOR）
created_date: 2026-02-21
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-vitest-tsconfig-paths-sync-automation.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. 背景

`@repo/shared` サブパス追加時に、`exports` / `typesVersions` / `paths` / `vitest alias` の4箇所同期が必要で、手動運用では更新漏れが発生しやすい。

## 2. 目的

単一ソースから `tsconfig.paths` と `vitest alias` を生成または検証し、同期漏れを機械的に防止する。

## 3. スコープ

- 含むもの: `apps/desktop/tsconfig.json`, `apps/desktop/vitest.config.ts`, `packages/shared/package.json` の整合検証/自動生成
- 含まないもの: `@repo/shared` の公開API設計変更

## 4. 実行手順（概要）

1. `packages/shared/package.json` の `exports` を基準データとして抽出する
2. `paths` / `alias` の現在値を収集し差分を計算する
3. `pnpm` スクリプトで検証を定常化し、CIに組み込む
4. 失敗時の修正手順をドキュメント化する

## 5. 完了条件

- [ ] 同期漏れを検知するCLIが実装されている
- [ ] CIで自動検証される
- [ ] 追加・変更時の運用手順が仕様書に反映されている

## 6. 参照

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `docs/30-workflows/unassigned-task/task-fix-ts-shared-module-resolution-001.md`
- `docs/30-workflows/unassigned-task/task-imp-vitest-alias-sync-automation-001.md`
