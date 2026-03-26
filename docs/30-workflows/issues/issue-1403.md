# [#1403] [UT-FIX-VIEWHISTORY-ACCUMULATION-001] viewHistory セッション中蓄積の上限設定検討

## メタ情報

```yaml
issue_number: 1403
title: [UT-FIX-VIEWHISTORY-ACCUMULATION-001] viewHistory セッション中蓄積の上限設定検討
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-03-20
updated_date: 2026-03-20
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1403
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`viewHistory`（ビュー履歴）がセッション中に無制限に蓄積される可能性がある。長時間利用ユーザーでメモリ使用量が増大するリスクがある。

## 背景

Phase 10/11 レビューにて検出。`viewHistory` に上限が設定されていない場合、セッション継続中にエントリが無制限に増加する。

## 対象ファイル

- `viewHistory` を管理する Store Slice または `apps/desktop/src/renderer/App.tsx`

## 対応内容

1. `grep -rn "viewHistory" apps/desktop/src/` で管理箇所を特定
2. 上限値を定数（例: `const VIEW_HISTORY_MAX_SIZE = 100`）として定義
3. 新規エントリ追加時に上限チェックを行い、超過した場合は先頭エントリを削除（FIFO）

```typescript
const VIEW_HISTORY_MAX_SIZE = 100;
const newHistory = [...state.viewHistory, newEntry].slice(
  -VIEW_HISTORY_MAX_SIZE,
);
```

## 完了条件

- [ ] `viewHistory` の最大エントリ数が定数で定義されている
- [ ] 上限超過時に古いエントリから削除される（FIFO）
- [ ] 上限・FIFO テストが PASS

## 参照

- タスク指示書: `docs/30-workflows/unassigned-task/task-04-viewhistory-accumulation-limit.md`
- 発見元: Phase 10/11 最終レビュー（TASK-04）
- 関連ルール: `.claude/rules/03-state-management.md`
