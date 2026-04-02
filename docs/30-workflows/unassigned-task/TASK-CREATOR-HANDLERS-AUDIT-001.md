# TASK-CREATOR-HANDLERS-AUDIT-001: skill-creator:\* 他ハンドラーの fire-and-forget 化調査

## メタ情報

| 項目     | 値                                                                            |
| -------- | ----------------------------------------------------------------------------- |
| タスクID | TASK-CREATOR-HANDLERS-AUDIT-001                                               |
| 検出元   | TASK-FIX-EXECUTE-PLAN-FF-001 Phase 12 unassigned-task-detection（2026-04-01） |
| 優先度   | LOW                                                                           |
| 影響     | 同様の長時間タイムアウト問題が他ハンドラーに潜在している可能性                |
| 検出日   | 2026-04-01                                                                    |

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

## 苦戦箇所（TASK-FIX-EXECUTE-PLAN-FF-001 より）

### execute-plan 修正への集中と横断調査の時間不足

- **困難だった理由**: `skill-creator:execute-plan` の fire-and-forget 化に集中した結果、他の `skill-creator:*` ハンドラーへの横断的な影響調査を実施する時間が不足した。`creatorHandlers.ts` には複数のハンドラーが含まれているが、それぞれの処理時間特性（LLM 呼び出し含む長時間処理か否か）の調査は今回のスコープ外とした
- **採った解決策**: 調査タスクとして切り出し、未タスクとして記録。execute-plan 以外のハンドラーは現状維持
- **将来への知見**: IPC ハンドラーを fire-and-forget 化する際は、同一ファイル内の全ハンドラーの処理時間特性を一括で調査・記録すること。個別対応では類似問題の見落としリスクがあるため、ハンドラー監査（audit）を Phase 1 要件に含めることを推奨する

## 関連

- 親タスク: TASK-FIX-EXECUTE-PLAN-FF-001
- 関連タスク: TASK-IPC-CHANNEL-TIMEOUT-CLEANUP-001（timeout 設定の整理）
- 関連ファイル:
  - `apps/desktop/src/main/ipc/creatorHandlers.ts`
  - `apps/desktop/src/preload/skill-creator-api.ts`
  - `apps/desktop/src/preload/ipc-utils.ts`
