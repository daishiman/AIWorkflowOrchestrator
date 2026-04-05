# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目      | 内容             |
| --------- | ---------------- |
| Phase     | 12               |
| Phase名   | ドキュメント更新 |
| カテゴリ  | ドキュメント     |
| 前提Phase | Phase 11         |
| 後続Phase | Phase 13         |

## 目的

本タスクの current facts（テスト構成/責務境界）をドキュメントに反映し、旧来の `E-11〜E-16` のような範囲表現で
誤解が生まれない状態にする。

## 反映すべき Current Facts

- persist-integration: 22件（`F-01〜F-06`, `E-10〜E-16`, `E-21〜E-29`）
- OutputHandler: 別系統パイプライン。`toSlug()` は path-safe 前提
- 参考の件数: OutputHandler 22件、SkillFileWriter 28件、parse 14件（合計 64件）
