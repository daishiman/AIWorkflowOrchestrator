# TASK-IPC-CHANNEL-TIMEOUT-CLEANUP-001: CHANNEL_TIMEOUTS P0 値の恒久対応

## メタ情報

| 項目     | 値                                                                                    |
| -------- | ------------------------------------------------------------------------------------- |
| タスクID | TASK-IPC-CHANNEL-TIMEOUT-CLEANUP-001                                                  |
| 検出元   | TASK-FIX-EXECUTE-PLAN-FF-001 Phase 12 unassigned-task-detection（2026-04-01）         |
| 優先度   | LOW                                                                                   |
| 影響     | 暫定値 `1_800_000` が残存し、fire-and-forget 完全移行後の設計意図が不明確になるリスク |
| 検出日   | 2026-04-01                                                                            |

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

## 苦戦箇所（TASK-FIX-EXECUTE-PLAN-FF-001 より）

### fire-and-forget と safeInvoke の設計整合性

- **困難だった理由**: fire-and-forget 化後も renderer 側は `safeInvoke` を通じて ack を受け取る。ack 受信だけの呼び出しに 30 分タイムアウトを設定することは設計上不整合だが、移行過渡期の安全策として必要だった。「適切な timeout 値はいくつか」という判断が難しく、暫定値として `1_800_000` を設定した
- **採った解決策**: 暫定値として `CHANNEL_TIMEOUTS["skill-creator:execute-plan"] = 1_800_000` を設定し、恒久化は後続タスクへ委譲
- **将来への知見**: fire-and-forget チャンネルの `safeInvoke` timeout は「ack を受け取るまでの時間」に設定すべき（数秒〜数十秒）。長時間処理のタイムアウトはサーバー側で制御し、IPC 層は ack の速達性に責務を限定するのが正しい設計パターン

## 関連

- 親タスク: TASK-FIX-EXECUTE-PLAN-FF-001
- 関連タスク: TASK-CREATOR-HANDLERS-AUDIT-001（他ハンドラーの横断調査）
- 関連ファイル:
  - `apps/desktop/src/preload/ipc-utils.ts`
  - `apps/desktop/src/preload/skill-creator-api.ts`
