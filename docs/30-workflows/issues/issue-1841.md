# [#1841] [TASK-CREATOR-HANDLERS-AUDIT-001] skill-creator:\* 他ハンドラーの fire-and-forget 化調査

## メタ情報

```yaml
issue_number: 1841
title: [TASK-CREATOR-HANDLERS-AUDIT-001] skill-creator:* 他ハンドラーの fire-and-forget 化調査
state: OPEN
priority: 低
scale: -
category: 改善
status: 未実施
created_date: 2026-04-01
updated_date: 2026-04-01
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1841
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

`skill-creator:execute-plan` と同様の長時間タイムアウト問題が、他の `skill-creator:*` ハンドラーに存在しないか確認する調査タスク。fire-and-forget 化が必要なハンドラーを特定し、対応方針を決定する。

## 背景

TASK-FIX-EXECUTE-PLAN-FF-001 では `skill-creator:execute-plan` の長時間ブロッキング問題を修正した。このタスクは LLM 呼び出しを含む長時間処理を同期的に待機していたため、IPC タイムアウトが発生していた。

同様のパターン（長時間処理を同期的に待機する IPC ハンドラー）が他の `skill-creator:*` ハンドラーにも存在する可能性がある。これらを事前に特定・修正することで、同じ問題の再発を防ぐ。

## 推定作業内容

- [ ] `apps/desktop/src/main/ipc/creatorHandlers.ts` の全 `skill-creator:*` ハンドラーを列挙する
- [ ] 各ハンドラーの処理時間特性を調査する（LLM 呼び出し / ファイル I/O / CPU バウンドな処理を含むか）
- [ ] 長時間処理を含むハンドラーを特定し、現在のタイムアウト設定と実際の処理時間を比較する
- [ ] fire-and-forget 化が適切なハンドラーを特定し、優先度付けを行う
- [ ] 調査結果を文書化し、対応が必要なハンドラーに対して個別タスクを作成する
- [ ] `CHANNEL_TIMEOUTS` 設定の全チャンネルについて設定値の妥当性を確認する（TASK-IPC-CHANNEL-TIMEOUT-CLEANUP-001 と連携）

## 完了条件

- [ ] `skill-creator:*` 全ハンドラーの処理時間特性と fire-and-forget 化の要否が文書化されている
- [ ] 対応が必要なハンドラーに対して個別の未タスクまたはタスク仕様書が作成されている
- [ ] 調査の結果「問題なし」の場合もその根拠が記録されている

## 関連

- 仕様書: `docs/30-workflows/unassigned-task/TASK-CREATOR-HANDLERS-AUDIT-001.md`
- 親タスク: TASK-FIX-EXECUTE-PLAN-FF-001
