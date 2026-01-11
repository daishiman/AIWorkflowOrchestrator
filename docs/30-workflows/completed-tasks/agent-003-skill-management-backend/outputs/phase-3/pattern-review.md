# 既存パターン整合性レビュー

## メタ情報

| 項目   | 内容                                    |
| ------ | --------------------------------------- |
| Phase  | 3                                       |
| タスク | タスク1: 既存パターンとの整合性レビュー |
| 作成日 | 2026-01-11                              |

---

## 1. 確認したファイル

| ファイル                                           | 内容                         |
| -------------------------------------------------- | ---------------------------- |
| `apps/desktop/src/preload/channels.ts`             | IPCチャネル定義              |
| `apps/desktop/src/main/ipc/fileHandlers.ts`        | 既存IPCハンドラー            |
| `apps/desktop/src/main/services/HistoryService.ts` | 既存サービスクラス           |
| `apps/desktop/src/main/ipc/validation.ts`          | バリデーションユーティリティ |

---

## 2. レビュー結果

### 2.1 ファイル命名規則

| 項目               | 既存パターン   | Phase 2設計    | 判定 | 備考                      |
| ------------------ | -------------- | -------------- | ---- | ------------------------- |
| ハンドラーファイル | キャメルケース | キャメルケース | PASS | `agentHandlers.ts` で整合 |
| サービスファイル   | パスカルケース | パスカルケース | PASS | `SkillService.ts` で整合  |
| テストファイル     | `*.test.ts`    | `*.test.ts`    | PASS | パターン一致              |

### 2.2 IPCチャネル命名規則

| 項目           | 既存パターン         | Phase 2設計          | 判定  | 備考                              |
| -------------- | -------------------- | -------------------- | ----- | --------------------------------- |
| プレフィックス | `{domain}:{action}`  | `agent:{action}`     | MINOR | 既存 `skill:` チャネルあり（※）   |
| アクション名   | ケバブケース         | ケバブケース         | PASS  | 例: `scan-available-skills`       |
| 定数名         | スネークケース大文字 | スネークケース大文字 | PASS  | 例: `AGENT_SCAN_AVAILABLE_SKILLS` |

**※重大発見**: 既存の`channels.ts`に以下の`skill:`プレフィックスチャネルが既に定義されている：

```typescript
// Skill management operations (既存)
SKILL_LIST_AVAILABLE: "skill:list-available",
SKILL_LIST_IMPORTED: "skill:list-imported",
SKILL_IMPORT: "skill:import",
SKILL_REMOVE: "skill:remove",
SKILL_GET_DETAIL: "skill:get-detail",
```

Phase 2設計では`agent:`プレフィックスを使用していたが、既存パターンに合わせて`skill:`プレフィックスを使用すべき。

### 2.3 クラス設計パターン

| 項目           | 既存パターン         | Phase 2設計 | 判定  |
| -------------- | -------------------- | ----------- | ----- |
| クラス形式     | ES6 class            | ES6 class   | PASS  |
| コンストラクタ | 依存性注入           | 依存性注入  | PASS  |
| メソッド形式   | async/await          | async/await | PASS  |
| ファクトリ関数 | `createXxxService()` | なし        | MINOR |

### 2.4 依存性注入パターン

| 項目     | 既存パターン         | Phase 2設計          | 判定 |
| -------- | -------------------- | -------------------- | ---- |
| 注入方法 | constructor          | constructor          | PASS |
| 外部依存 | インターフェース経由 | インターフェース経由 | PASS |

### 2.5 エラーハンドリングパターン

| 項目             | 既存パターン                                     | Phase 2設計      | 判定  |
| ---------------- | ------------------------------------------------ | ---------------- | ----- |
| レスポンス形式   | `{ success, data?, error? }`                     | `IPCError` throw | MINOR |
| エラーメッセージ | `error instanceof Error ? ... : "Unknown error"` | 同様             | PASS  |

---

## 3. 指摘事項

### 3.1 MINOR: IPCチャネル名の修正が必要

**問題**: Phase 2設計では`agent:`プレフィックスを使用しているが、既存のチャネル定義では`skill:`プレフィックスが使用されている。

**影響範囲**:

- `outputs/phase-2/ipc-design.md`
- `outputs/phase-2/design.md`

**修正内容**:
既存のチャネル定義に合わせて、設計のチャネル名を変更する：

| Phase 2設計                   | 修正後（既存パターン準拠） |
| ----------------------------- | -------------------------- |
| `agent:scan-available-skills` | `skill:list-available`     |
| `agent:get-imported-skills`   | `skill:list-imported`      |
| `agent:import-skills`         | `skill:import`             |
| `agent:remove-skill`          | `skill:remove`             |
| `agent:get-skill-detail`      | `skill:get-detail`         |

### 3.2 MINOR: ファクトリ関数の追加推奨

**問題**: `HistoryService`には`createHistoryService()`ファクトリ関数があるが、Phase 2設計にはない。

**対応**: 必須ではないが、一貫性のため`createSkillService()`の追加を推奨。

### 3.3 MINOR: エラーレスポンス形式の統一

**問題**: 既存ハンドラーは`{ success: false, error: string }`形式を返すが、Phase 2設計では`IPCError`をthrowする設計。

**対応**: 既存パターンに合わせて、`{ success, error }`形式のレスポンスに修正するか、または新しいパターンとして`IPCError` throwを採用するか検討が必要。本タスクでは既存の`IPCError` throw設計を維持（新しいエラーパターンとして採用）。

---

## 4. 判定

### 総合判定: MINOR

軽微な指摘があるが、修正後Phase 4へ進行可能。

### 必要な修正

1. **必須**: IPCチャネル名を既存の`skill:`プレフィックスに統一
2. **推奨**: ファクトリ関数`createSkillService()`の追加

### 修正不要項目

- ファイル命名規則
- クラス設計パターン
- 依存性注入パターン
- エラーハンドリングパターン（新パターンとして採用）
