# [#1531] [UT-06-002-UT-5] revokeTool ハンドラ P42準拠 3段バリデーション適用

## メタ情報

```yaml
issue_number: 1531
title: [UT-06-002-UT-5] revokeTool ハンドラ P42準拠 3段バリデーション適用
state: OPEN
priority: 低
scale: -
category: セキュリティ
status: 未実施
created_date: 2026-03-23
updated_date: 2026-03-23
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1531
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

`permission:revokeTool` ハンドラの引数バリデーションが `String(args?.toolName ?? "")` という暗黙変換パターンで、P42準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が適用されていない。

## 対応方針

`String(args?.toolName ?? "")` を `typeof args?.toolName !== "string" || args.toolName.trim() === ""` パターンに置換する。バリデーションエラー時は以下の形式で返す。

```typescript
{ success: false, error: { code: "VALIDATION_ERROR", message: "toolName must be a non-empty string" } }
```

これにより、型チェック → 空文字列チェック → トリム後空文字列チェックの3段バリデーションが完成する。

## 変更対象ファイル

| ファイル                                                                | 変更種別 |
| ----------------------------------------------------------------------- | -------- |
| `apps/desktop/src/main/ipc/permission-store-handlers.ts`                | 修正     |
| `apps/desktop/src/main/ipc/__tests__/permission-store-handlers.test.ts` | 修正     |

## 完了条件

- [ ] revokeTool ハンドラに P42準拠 3段バリデーション（型チェック → 空文字列 → トリム空文字列）が適用されている
- [ ] スペースのみの入力（`"   "`）が VALIDATION_ERROR として拒否される
- [ ] 関連テストが PASS する

---

**元タスク**: UT-06-002 | **検出日**: 2026-03-23
