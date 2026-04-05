# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目      | 内容    |
| --------- | ------- |
| Phase     | 2       |
| Phase名   | 設計    |
| カテゴリ  | 設計    |
| 前提Phase | Phase 1 |
| 後続Phase | Phase 3 |

## 目的

`execute -> parseLlmResponseToContent -> SkillFileWriter.persist` の統合トポロジーと責務境界を確定する。
OutputHandler（session-output パイプライン）を統合先と混同しない前提も同時に固定する。

## 設計の要点（Current Facts）

- 正式パス: `RuntimeSkillCreatorFacade` 内で `parseLlmResponseToContent` を呼び、抽出した content を `SkillFileWriter.persist` へ渡す
- `skillName` 方針: raw pass-through（validation は Writer に委譲）
- OutputHandler: `SkillCreatorIpcBridge` 経由の別系統。`toSlug()` は path-safe 前提

## 成果物

- 統合トポロジー設計図: `outputs/phase-2/topology-design.md`
