# UT-SDK-07-EXECUTION-CHANNELS-EXPANSION-001: EXECUTION_CHANNELS の shared 定義拡充

## メタ情報

```yaml
issue_number: 1714
task_id: UT-SDK-07-EXECUTION-CHANNELS-EXPANSION-001
task_name: EXECUTION_CHANNELS の shared 定義拡充（TERMINAL_LOG / COPY_COMMAND 移管）
category: 仕様整合
target_feature: packages/shared/src/ipc/channels.ts EXECUTION_CHANNELS 拡充
priority: 低
scale: 小規模
status: 未実施
source_phase: UT-SDK-07 Phase 12 unassigned-task-detection（2026-03-29）
created_date: 2026-03-29
dependencies: [UT-SDK-07]
```

| 項目         | 内容                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| タスクID     | UT-SDK-07-EXECUTION-CHANNELS-EXPANSION-001                                |
| タスク名     | EXECUTION_CHANNELS の shared 定義拡充（TERMINAL_LOG / COPY_COMMAND 移管） |
| 分類         | 仕様整合                                                                  |
| 対象機能     | `packages/shared/src/ipc/channels.ts` の `EXECUTION_CHANNELS` 定数        |
| 優先度       | 低                                                                        |
| 見積もり規模 | 小規模                                                                    |
| ステータス   | 未実施                                                                    |
| 発見元       | UT-SDK-07 Phase 12 — APPROVAL/EXECUTION チャネルを shared に移管後        |
| 発見日       | 2026-03-29                                                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-SDK-07 では `APPROVAL_CHANNELS`（`approval:respond`, `approval:request`）と `EXECUTION_CHANNELS`（`execution:get-disclosure-info`）を `packages/shared/src/ipc/channels.ts` に移管した。しかし、execution 系チャネルには他にも `TERMINAL_LOG`（`terminal:log`）や `COPY_COMMAND`（`execution:copy-command`）など desktop 側でのみ定義されているチャネルが存在する。これらを shared に一元化することで、cross-layer の contract test が正確になる。

### 1.2 問題点・課題

- `apps/desktop/src/preload/channels.ts` にのみ定義されている execution 系チャネルが残存している
- shared / desktop 間で channel 名のコピーが生じており、drift リスクがある
- `governance-bundle.test.ts` の契約テストが shared 側の定義を参照していないため、drift が検出されない

### 1.3 放置した場合の影響

- 後続タスクで execution チャネルを参照する際、shared/desktop どちらの定義を使うか混乱する
- channel 名の typo や変更が cross-layer で伝播せず、silent bug になる

---

## 2. 何を達成するか（What）

### 2.1 目的

`TERMINAL_LOG` / `COPY_COMMAND` など残存する execution 系チャネルを `packages/shared/src/ipc/channels.ts` の `EXECUTION_CHANNELS` に追加し、desktop 側はそこから import するよう変更する。

### 2.2 最終ゴール

- `EXECUTION_CHANNELS` に `terminal:log` / `execution:copy-command` が含まれている
- `apps/desktop/src/preload/channels.ts` がそれらを shared から import している
- `governance-bundle.test.ts` 観点 5 に parity assertion が追加されている

### 2.3 スコープ

**含むもの**:

- shared 側 `EXECUTION_CHANNELS` へのチャネル追加
- desktop preload 側の import 先変更
- parity テストの追加

**含まないもの**:

- チャネルのセマンティクス変更
- 新規チャネルの追加

---

## 3. 実行手順

1. `apps/desktop/src/preload/channels.ts` で定義されている execution 系チャネルを棚卸しする
2. `packages/shared/src/ipc/channels.ts` の `EXECUTION_CHANNELS` に未移管チャネルを追加する
3. desktop 側の定義を shared からの import に変更する
4. `apps/desktop/src/preload/channels.test.ts` にチャネル名 parity テストを追加する
5. `pnpm --filter @repo/desktop test:run -- src/preload/channels.test.ts` で確認する

---

## 3.5 苦戦箇所と解決策

| 苦戦箇所                                                        | 原因                                                                          | 解決策                                                                                                                    |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| どのチャネルを移管対象とするか判断が難しい                      | execution 系チャネルの中には「純粋な execution」と「UI 側専用」が混在している | `apps/desktop/src/preload/channels.ts` の既存コメントと IPC handler の実装を確認し、shared で共有すべきチャネルを分類する |
| desktop 側の既存テストが channels.ts のインポートに依存している | import 先変更でテストのモック設定が壊れる場合がある                           | テスト内のモック対象を `@repo/shared/ipc/channels` に更新し、実装と同期させる                                             |

---

## 4. 完了条件チェックリスト

- [ ] `TERMINAL_LOG` / `COPY_COMMAND` が `EXECUTION_CHANNELS` に含まれている
- [ ] desktop preload が shared から import している
- [ ] `channels.test.ts` の parity テストが green
- [ ] `governance-bundle.test.ts` の観点 5 が通る

---

## 5. 参照情報

- `packages/shared/src/ipc/channels.ts`（UT-SDK-07 で追加された APPROVAL/EXECUTION 定義）
- `apps/desktop/src/preload/channels.ts`（移管元）
- `apps/desktop/src/preload/channels.test.ts`（parity テスト追加先）
- `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts`（観点 5）
- Issue #1714: [UT-SDK-07-EXECUTION-CHANNELS-EXPANSION-001]
- 関連 Issue #1708: [仕様整合性] EXECUTION_CHANNELS の shared 定義拡充

## 6. 備考

本タスクは仕様整合系（Low）。UT-SDK-07 の移管作業の続きとして着手する。
Issue #1708 と重複する可能性があるため、着手前に #1708 の状況を確認すること。
