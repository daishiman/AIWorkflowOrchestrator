# [#1840] [TASK-IPC-CHANNEL-TIMEOUT-CLEANUP-001] CHANNEL_TIMEOUTS 暫定値の恒久対応

## メタ情報

```yaml
issue_number: 1840
title: [TASK-IPC-CHANNEL-TIMEOUT-CLEANUP-001] CHANNEL_TIMEOUTS 暫定値の恒久対応
state: OPEN
priority: 低
scale: -
category: リファクタリング
status: 未実施
created_date: 2026-04-01
updated_date: 2026-04-01
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1840
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

`CHANNEL_TIMEOUTS` に設定された `1_800_000`（30分）は暫定値。fire-and-forget 完全移行後は `safeInvoke` 呼び出し方式そのものを見直すか、不要な timeout 設定を整理する必要がある。

## 背景

TASK-FIX-EXECUTE-PLAN-FF-001 で `skill-creator:execute-plan` を非ブロッキック化した際、既存の `safeInvoke` timeout 設定として `1_800_000`（30分）を暫定的に設定した。これは fire-and-forget 移行の過渡期における回避策であり、恒久的な設計値ではない。

fire-and-forget 化が完全に完了した状態では:

1. **timeout 設定の意味が変わる**: ack を受け取るだけの呼び出しに 30 分の timeout は不適切
2. **safeInvoke の利用方法の見直し**: fire-and-forget チャンネルに対して timeout ベースの safeInvoke を使い続けることが設計上の整合性を損なう
3. **未使用設定の残存**: 適切に整理しないと混乱の原因になる

## 推定作業内容

- [ ] `CHANNEL_TIMEOUTS` における `skill-creator:execute-plan` の設定値と設定意図を調査・文書化する
- [ ] fire-and-forget 完全移行後に `safeInvoke` の代わりに使用すべき呼び出しパターンを設計する
- [ ] 不要になった timeout 設定を削除または適切な値へ変更する
- [ ] 他の `safeInvoke` 呼び出しが同様の問題を抱えていないか横断調査する（TASK-CREATOR-HANDLERS-AUDIT-001 と連携）
- [ ] 変更後に IPC 通信が正常に機能することをテストで確認する

## 完了条件

- [ ] `skill-creator:execute-plan` チャンネルの timeout 設定が fire-and-forget 移行後の設計に整合している
- [ ] 暫定値 `1_800_000` が恒久値または削除に変更されている
- [ ] 変更の設計意図が仕様書に記録されている
- [ ] TypeScript 型チェック PASS
- [ ] 関連テスト全件 PASS

## 関連

- 仕様書: `docs/30-workflows/unassigned-task/TASK-IPC-CHANNEL-TIMEOUT-CLEANUP-001.md`
- 親タスク: TASK-FIX-EXECUTE-PLAN-FF-001
