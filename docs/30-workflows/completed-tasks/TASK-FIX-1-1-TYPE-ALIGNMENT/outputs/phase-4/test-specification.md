# テスト仕様書: TASK-FIX-1-1-TYPE-ALIGNMENT

## メタ情報

| 項目     | 内容                        |
| -------- | --------------------------- |
| タスクID | TASK-FIX-1-1-TYPE-ALIGNMENT |
| Phase    | 4                           |
| 作成日   | 2026-02-04                  |

---

## 1. テスト方針

### 1.1 TDDアプローチ

- **Red Phase**: 移行対象の型に対するテストを作成（現時点で失敗）
- **Green Phase**: skill.tsに型を移行してテストをパス
- **Refactor Phase**: コード品質を改善

### 1.2 テスト対象

| 対象                | テスト内容                   | ファイル        |
| ------------------- | ---------------------------- | --------------- |
| 移行対象型          | 型構造・値の検証             | `skill.test.ts` |
| 型エクスポート      | 正しいモジュールからのexport | `skill.test.ts` |
| Discriminated Union | 型絞り込み動作               | `skill.test.ts` |
| 定数                | SKILL_EXECUTION_DEFAULTS値   | `skill.test.ts` |

---

## 2. テストカテゴリ

### 2.1 移行対象型テスト

| 型名                       | テスト内容                  |
| -------------------------- | --------------------------- |
| `ExecutionState`           | 5種類の値の検証             |
| `ExecutionInfo`            | 構造・必須/オプション検証   |
| `SkillExecutionErrorCode`  | 9種類のエラーコード検証     |
| `SkillExecutionError`      | 構造・detailsオプション検証 |
| `ExecutionContext`         | 構造・AbortController検証   |
| `SKILL_EXECUTION_DEFAULTS` | 5つの定数値検証             |

### 2.2 型エクスポートテスト

| テスト内容                           | 期待結果             |
| ------------------------------------ | -------------------- |
| skill.tsから移行型をimport           | コンパイル成功       |
| skill-execution.ts削除後のimport失敗 | モジュール存在しない |

---

## 3. テスト実行方法

```bash
# 全テスト実行
pnpm --filter @repo/shared test

# 特定テストファイル
pnpm --filter @repo/shared test skill.test.ts

# カバレッジ付き
pnpm --filter @repo/shared test:coverage
```

---

## 4. 期待される結果

### 4.1 Red Phase（現在）

```
FAIL  src/types/__tests__/skill.test.ts
  ✓ 既存テストは成功
  ✕ TASK-FIX-1-1関連テストは型未定義で失敗
```

### 4.2 Green Phase（Phase 5後）

```
PASS  src/types/__tests__/skill.test.ts
  ✓ 全テスト成功
```

---

## 5. カバレッジ目標

| 指標              | 目標 |
| ----------------- | ---- |
| Line Coverage     | 80%+ |
| Branch Coverage   | 60%+ |
| Function Coverage | 80%+ |
