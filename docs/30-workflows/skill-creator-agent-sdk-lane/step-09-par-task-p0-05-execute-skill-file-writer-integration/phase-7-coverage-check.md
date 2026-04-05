# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目      | 内容           |
| --------- | -------------- |
| Phase     | 7              |
| Phase名   | カバレッジ確認 |
| カテゴリ  | 品質           |
| 前提Phase | Phase 6        |
| 後続Phase | Phase 8        |

## 目的

本タスクのスコープ（Facade の Step 3.5-3.6）周辺が十分にカバーされていることを確認する。
Facade 全体ファイルのカバレッジ率は大規模ファイルの性質上低くなり得るため、スコープ局所のカバー状況を重視する。

## 実行タスク（例）

```bash
pnpm --filter @repo/desktop test -- --coverage --testPathPattern="persist-integration|SkillFileWriter|parseLlmResponseToContent"
```

## Current Facts（スコープ局所のカバーに使うテスト）

- 正常系: `F-01`, `F-02`
- スキップ系: `F-05`, `F-06`, `E-28`
- DI 未注入: `F-04`, `E-16`, `E-29`
- persist 失敗/例外: `F-03`, `E-10 ~ E-14`
- parse 例外: `E-15`
- PATH_TRAVERSAL/rollback: `E-21 ~ E-25`
