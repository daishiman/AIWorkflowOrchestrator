# Phase 1-3: 要件定義・設計・設計レビュー（統合）

## メタ情報

| 項目     | 内容          |
| -------- | ------------- |
| タスクID | TASK-FIX-13-1 |
| Phase    | 1-3（統合）   |
| 完了日   | 2026-02-13    |

## 要件

### 目的

`packages/shared/src/types/skill.ts` の deprecated プロパティを削除し、推奨代替に完全移行する。

### 対象プロパティ

| プロパティ          | 推奨代替             | 状態              |
| ------------------- | -------------------- | ----------------- |
| `Anchor.name`       | `Anchor.source`      | deprecated → 削除 |
| `Skill.lastUpdated` | `Skill.lastModified` | deprecated → 削除 |

### スコープ外

- `SkillImportConfig.lastUpdated` — electron-store JSON永続化互換のため維持
- `StorageMetadata.lastUpdated` — 異なるドメインの異なる型
- `StorageStats.lastUpdated` — 異なるドメインの異なる型

## 設計

### アプローチ

1. TDDで型削除テストを先行作成（`@ts-expect-error` による型レベルテスト）
2. deprecated 定義を削除
3. 全参照箇所が既に推奨代替を使用していることを検証

### 設計レビュー結果

**判定: PASS** — 小規模リファクタリングのため重大な設計リスクなし
