# [#1253] [UT-06-002] AllowedToolEntryV2 PermissionStore 永続化実装

## メタ情報

```yaml
issue_number: 1253
title: [UT-06-002] AllowedToolEntryV2 PermissionStore 永続化実装
state: CLOSED
priority: 高
scale: -
category: -
status: 未実施
created_date: 2026-03-16
updated_date: 2026-03-16
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1253
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 目的

`AllowedToolEntryV2` 型を使用した `PermissionStore` の永続化ロジックを `electron-store` ベースで実装し、セッション終了 IPC を定義する。

TASK-SKILL-LIFECYCLE-06 の Phase 5 で設計された `AllowedToolEntryV2` と `PermissionStore` インターフェースが定義済みだが、`electron-store` への永続化ロジックおよびセッション終了タイミングの IPC 定義が未完了である。このためユーザーが毎回権限確認を受ける状態となっており、後続の PermissionDialog 実装もブロックされている。

## 受入基準

- [ ] `PermissionStore.read(toolName, skillName)` が toolName + skillName で検索できる
- [ ] `PermissionStore.write(entry)` が既存エントリを上書き・新規エントリを追加できる
- [ ] `PermissionStore.clearSessionEntries()` が session スコープのエントリのみ削除できる
- [ ] `electron-store` スキーマに `allowedTools: AllowedToolEntryV2[]` が定義されている
- [ ] `permission:clear-session` IPC チャンネルが登録されている
- [ ] アプリ終了時（`before-quit` イベント）にセッションエントリがクリアされる
- [ ] P42 準拠の 3 段バリデーション（型チェック → 空文字列 → トリム空文字列）が IPC ハンドラに適用されている
- [ ] IPC 契約チェックリスト（ipc-contract-checklist.md）Phase 1-6 が完了している
- [ ] 単体テストが PASS すること
- [ ] TypeScript 型エラー・ESLint エラーが 0 件

## 関連タスクID

| タスクID                | 関係性                                       |
| ----------------------- | -------------------------------------------- |
| TASK-SKILL-LIFECYCLE-06 | 発見元（完了済み）                           |
| TASK-SKILL-LIFECYCLE-08 | 後続（PermissionDialog UI 実装）             |
| UT-06-003               | 後続（SafetyGate が PermissionStore を使用） |
| UT-06-006               | 後続（high × time_24h テスト追加）           |
| UT-06-007               | 後続（high × time_7d テスト追加）            |

## 成果物

- `apps/desktop/src/main/stores/permission-store.ts`（新規）
- `apps/desktop/src/main/ipc/handlers/permission.ts`（更新：IPC チャンネル追加）
- `apps/desktop/src/main/ipc/channels.ts`（更新：チャンネル定数追加）
- `apps/desktop/src/main/stores/permission-store.test.ts`（新規）

## 参照資料

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/permission-store-interface.ts`
- `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`
- タスク指示書: `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/unassigned-task/task-ut-06-002-allowed-tool-entry-v2-permission-store.md`
