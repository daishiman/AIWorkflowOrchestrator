# [#1523] UT-LLM-MOD-01-004: システム仕様書の旧モデルIDテーブル更新（9ファイル）

## メタ情報

```yaml
issue_number: 1523
title: UT-LLM-MOD-01-004: システム仕様書の旧モデルIDテーブル更新（9ファイル）
state: OPEN
priority: 中
scale: -
category: 改善
status: 未実施
created_date: 2026-03-23
updated_date: 2026-03-23
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1523
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | -      |
| ステータス | 未実施 |

---

## タスクID

UT-LLM-MOD-01-004

## 由来

TASK-LLM-MOD-01 30種思考法分析・漏れ検出

## 目的

`PROVIDER_CONFIGS` のモデル定義を最新化した後、`references/` 配下のシステム仕様書に残存する旧モデルIDのテーブル・コードサンプルを現行モデルIDに同期する。

## 苦戦箇所・知見

- 旧モデルIDの散在箇所が多い（`grep` で9ファイルにヒット）
- 一部は意図的な旧ID参照（`arch-state-management-*.md` の GAP-03 説明用サンプル）
- LLM関連以外のファイルにも旧IDが含まれる

## 対象ファイル（9ファイル）

- `references/interfaces-llm.md`
- `references/ui-ux-llm-selector.md`
- `references/arch-state-management-core.md`
- `references/arch-state-management-reference-selectors.md`
- `references/technology-backend.md`
- `references/technology-devops-core.md`
- `references/rag-desktop-state.md`
- `references/master-design.md`
- `references/lessons-learned-ipc-preload-runtime.md`

## 完了条件

- [ ] 上記9ファイルの旧モデルIDが現行モデルIDに更新または注釈追加
- [ ] GAP-03 説明用サンプル等の意図的な旧ID参照は注釈でコンテキスト維持
- [ ] `node scripts/generate-index.js` で topic-map.md を再生成

## 仕様書

`docs/30-workflows/unassigned-task/UT-LLM-MOD-01-004.md`
