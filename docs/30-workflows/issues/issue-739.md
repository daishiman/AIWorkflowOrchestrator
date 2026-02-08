# [#739] [UT-STORE-VALIDATION-001] electron-store型バリデーション横展開

## メタ情報

```yaml
issue_number: 739
title: [UT-STORE-VALIDATION-001] electron-store型バリデーション横展開
state: OPEN
priority: 中
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-02-08
updated_date: 2026-02-08
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/739
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

TASK-FIX-4-2-SKILL-STORE-PERSISTENCEで発見した型アサーション問題を、他のelectron-store使用箇所にも横展開する。

## 背景

- `store.get()` の戻り値を `as string[]` で型キャストしていた
- 実行時バリデーションなしで不正データがそのまま使用されていた
- アプリ再起動時にデータ消失バグが発生

## 解決済みの実装パターン

```typescript
function validateStoredSkillIds(value: unknown): string[] {
  if (value == null) return [];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}
```

## 対象ファイル（要調査）

1. `themeHandlers.ts` - `store.get("theme.mode", "system") as ThemeMode`
2. `skillImportStore.ts` - `Store<SkillStoreSchema>` ジェネリクス
3. `SessionStorage.ts` - 複数箇所
4. `workspaceHandlers.ts` - 2箇所
5. `slideSettingsStore.ts` - 複数箇所
6. `agent-client.ts` - `store.get("anthropic_api_key")`

## 完了条件

- [ ] 全対象ファイルの調査完了
- [ ] 型バリデーション関数の追加
- [ ] テスト追加（各ファイル）
- [ ] ドキュメント更新

## 参照

- タスク仕様書: `docs/30-workflows/unassigned-task/task-imp-store-validation-001.md`
- 関連タスク: TASK-FIX-4-2-SKILL-STORE-PERSISTENCE
- 知見: `.claude/rules/06-known-pitfalls.md#P19`

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
