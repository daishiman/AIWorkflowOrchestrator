# [#1708] [仕様整合性] EXECUTION_CHANNELS の shared 定義拡充（TERMINAL_LOG / COPY_COMMAND）(UT-IPC-EXECUTION-CHANNELS-PARITY-001)

## メタ情報

```yaml
task_id: UT-IPC-EXECUTION-CHANNELS-PARITY-001
task_name: UT
category: 仕様整合性
target_feature: -
priority: low
scale: -
status: unassigned
source_phase: -
created_date: 2026-03-29
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-IPC-EXECUTION-CHANNELS-PARITY-001.md
```

| 項目       | 内容       |
| ---------- | ---------- |
| 優先度     | low        |
| 規模       | -          |
| ステータス | unassigned |

---

## 概要

`EXECUTION_GET_TERMINAL_LOG`（`"execution:get-terminal-log"`）および
`EXECUTION_GET_COPY_COMMAND`（`"execution:get-copy-command"`）が
`apps/desktop/src/preload/channels.ts` の `IPC_CHANNELS` にのみ定義されており、
`packages/shared/src/ipc/channels.ts` の `EXECUTION_CHANNELS` には含まれていない。

同カテゴリ（実行情報取得系）の `EXECUTION_GET_DISCLOSURE_INFO` は
TASK-UT-SDK-07 で `EXECUTION_CHANNELS` に追加済みのため、
3チャネルの定義場所が分散した状態になっている。

---

## 背景

### TASK-UT-SDK-07 での対応範囲

TASK-UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001 において、以下のチャネルを
`packages/shared/src/ipc/channels.ts` へ移管・追加した:

| チャネル定数                    | チャネル文字列                    | 対応グループ         |
| ------------------------------- | --------------------------------- | -------------------- |
| `APPROVAL_RESPOND`              | `"approval:respond"`              | `APPROVAL_CHANNELS`  |
| `APPROVAL_REQUEST`              | `"approval:request"`              | `APPROVAL_CHANNELS`  |
| `EXECUTION_GET_DISCLOSURE_INFO` | `"execution:get-disclosure-info"` | `EXECUTION_CHANNELS` |

### 意図的に残した未対応チャネル

以下の2チャネルは今回スコープ外として意図的に対応を見送った:

| チャネル定数                 | チャネル文字列                 | 定義場所                                    |
| ---------------------------- | ------------------------------ | ------------------------------------------- |
| `EXECUTION_GET_TERMINAL_LOG` | `"execution:get-terminal-log"` | `apps/desktop/src/preload/channels.ts` のみ |
| `EXECUTION_GET_COPY_COMMAND` | `"execution:get-copy-command"` | `apps/desktop/src/preload/channels.ts` のみ |

### 現状の実装詳細

`apps/desktop/src/preload/channels.ts`（L392–393）:

```typescript
EXECUTION_GET_TERMINAL_LOG: "execution:get-terminal-log",
EXECUTION_GET_COPY_COMMAND: "execution:get-copy-command",
```

`packages/shared/src/ipc/channels.ts`（L147–149）:

```typescript
export const EXECUTION_CHANNELS = {
  EXECUTION_GET_DISCLOSURE_INFO: "execution:get-disclosure-info",
} as const;
```

また `apps/desktop/src/preload/channels.ts` は `APPROVAL_CHANNELS` と `EXECUTION_CHANNELS` を
`@repo/shared/src/ipc/channels` から import して参照統合しているが（L388–391）、
`EXECUTION_GET_TERMINAL_LOG` と `EXECUTION_GET_COPY_COMMAND` はインラインのリテラル文字列として
`IPC_CHANNELS` に直接追加されている。

---

## なぜ必要か（Why）

1. **仕様整合性**: 同一カテゴリ（`execution:*` 系）のチャネルが shared と preload に分散すると、
   将来的な IPC 契約変更時の変更漏れリスクが増す。
2. **shared パッケージの完全性**: `packages/shared/src/ipc/channels.ts` を IPC チャネルの
   "単一の真実の源（Single Source of Truth）" として機能させるには、
   同カテゴリのチャネルは同一グループオブジェクトに集約すべきである。
3. **テスト容易性**: shared のチャネル型 `IpcChannel` に含まれないチャネルは、
   shared 側の型検査対象にならないため、コンパイル時の契約検証が不完全になる。

---

## 何を達成するか（What）

- `packages/shared/src/ipc/channels.ts` の `EXECUTION_CHANNELS` に
  `EXECUTION_GET_TERMINAL_LOG` と `EXECUTION_GET_COPY_COMMAND` を追加する。
- `apps/desktop/src/preload/channels.ts` でインラインリテラルとして定義している
  該当2チャネルを `EXECUTION_CHANNELS` の参照経由へ置き換える。
- shared 側の `IpcChannel` 型に2チャネルが含まれる状態にする。

---

## どのように実行するか（How）

### 変更対象ファイル

| ファイル                               | 変更種別 | 変更内容                                                   |
| -------------------------------------- | -------- | ---------------------------------------------------------- |
| `packages/shared/src/ipc/channels.ts`  | 修正     | `EXECUTION_CHANNELS` に2定数を追加                         |
| `apps/desktop/src/preload/channels.ts` | 修正     | インラインリテラルを `EXECUTION_CHANNELS.*` 参照へ置き換え |

### 変更方針

`EXECUTION_CHANNELS` を以下のように拡張する:

```typescript
export const EXECUTION_CHANNELS = {
  EXECUTION_GET_DISCLOSURE_INFO: "execution:get-disclosure-info",
  EXECUTION_GET_TERMINAL_LOG: "execution:get-terminal-log",
  EXECUTION_GET_COPY_COMMAND: "execution:get-copy-command",
} as const;
```

`apps/desktop/src/preload/channels.ts` のインライン定義（L392–393）を参照経由へ置き換える:

```typescript
EXECUTION_GET_TERMINAL_LOG: EXECUTION_CHANNELS.EXECUTION_GET_TERMINAL_LOG,
EXECUTION_GET_COPY_COMMAND: EXECUTION_CHANNELS.EXECUTION_GET_COPY_COMMAND,
```

---

## 実行手順

1. `packages/shared/src/ipc/channels.ts` を開き、`EXECUTION_CHANNELS` オブジェクトに
   `EXECUTION_GET_TERMINAL_LOG` と `EXECUTION_GET_COPY_COMMAND` を追加する。
2. `apps/desktop/src/preload/channels.ts` のインライン定義（L392–393 付近）を
   `EXECUTION_CHANNELS.*` 参照へ置き換える。
3. `pnpm --filter @repo/shared build` でビルドエラーがないことを確認する。
4. `pnpm typecheck` で型エラーがないことを確認する。
5. `pnpm lint` でリントエラーがないことを確認する。
6. `ALLOWED_INVOKE_CHANNELS`（`apps/desktop/src/preload/channels.ts` L679–681 付近）に
   変更の影響がないことを確認する（参照経由への置き換えのため実値は変わらないはず）。

---

## 完了条件

- [ ] `packages/shared/src/ipc/channels.ts` の `EXECUTION_CHANNELS` に
      `EXECUTION_GET_TERMINAL_LOG` と `EXECUTION_GET_COPY_COMMAND` が含まれている
- [ ] shared の `IpcChannel` 型に `"execution:get-terminal-log"` と `"execution:get-copy-command"` が含まれている
- [ ] `apps/desktop/src/preload/channels.ts` でインラインリテラルではなく `EXECUTION_CHANNELS.*` 経由で参照している
- [ ] `pnpm typecheck` が PASS すること
- [ ] `pnpm lint` が PASS すること
- [ ] `ALLOWED_INVOKE_CHANNELS` にチャネルが引き続き登録されていること

---

## 開発知見・苦戦箇所

TASK-UT-SDK-07 の時点では、`EXECUTION_GET_TERMINAL_LOG` と `EXECUTION_GET_COPY_COMMAND` は
`TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001` で追加された比較的新しいチャネルであり、
SDK-07 のスコープ（`APPROVAL_CHANNELS` と `EXECUTION_GET_DISCLOSURE_INFO` の shared 移管）と
一括して対応するとリスクが高まる可能性があったため意図的に残した。

本タスクは純粋な移管作業であり実値（チャネル文字列）の変更は不要なため、
実装難易度は低い。ただし以下の点には注意:

- `packages/shared` は `apps/desktop` に import されているため、
  shared 側の変更後に desktop 側のビルドを通して循環参照が生じないことを確認すること。
- `IpcChannel` 型は `preload/channels.ts` と `packages/shared/src/ipc/channels.ts` の
  両方に定義されており、それぞれ独立した型エイリアスである点に注意
  （完全統合は別の大きなリファクタリングタスクとなる）。

---

## 関連仕様書・参照

- `packages/shared/src/ipc/channels.ts` — 現在の `EXECUTION_CHANNELS` 定義
- `apps/desktop/src/preload/channels.ts` — インライン定義箇所（L392–393 付近）
- TASK-UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001 仕様書 — 移管済みチャネルの背景
- TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 — `EXECUTION_GET_TERMINAL_LOG` / `EXECUTION_GET_COPY_COMMAND` の追加元タスク
