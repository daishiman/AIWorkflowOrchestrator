# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目      | 内容       |
| --------- | ---------- |
| Phase     | 13         |
| Phase名   | PR作成     |
| カテゴリ  | デリバリー |
| 前提Phase | Phase 12   |

## 目的

Phase 1〜12 の成果物をまとめ、GitHub Pull Request を作成する。
ただし **コミット/PR/push はユーザーの明示指示があるまで実行禁止**。

## Current Facts（PR本文に書くべきテスト構成）

- persist-integration: 22件（`F-01〜F-06`, `E-10〜E-16`, `E-21〜E-29`）
- SkillFileWriter: 28件
- parseLlmResponseToContent: 14件
- 合計: 64件

## PR本文テンプレ（例）

```markdown
## Summary

- execute() 完了後の `parseLlmResponseToContent -> SkillFileWriter.persist` 統合パスをテストで保証
- OutputHandler は別系統パイプラインとして責務境界を明文化（toSlug は path-safe）

## Test plan

- persist-integration.test.ts: 22件（F-01〜F-06, E-10〜E-16, E-21〜E-29）全パス
- SkillFileWriter.test.ts: 28件 全パス
- parseLlmResponseToContent.test.ts: 14件 全パス
```
