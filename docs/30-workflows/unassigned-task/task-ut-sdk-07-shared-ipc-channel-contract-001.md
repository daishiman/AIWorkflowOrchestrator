# UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001: packages/shared/src/ipc/channels.ts を desktop 実装へ同期

## メタ情報

```yaml
task_id: UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001
task_name: packages/shared/src/ipc/channels.ts を desktop 実装へ同期
category: 契約整合
target_feature: shared IPC channel 定義と desktop preload allowlist の parity
priority: 高
scale: 小規模
status: 未実施
source_phase: TASK-SDK-07 Phase 12 unassigned-task-detection（2026-03-28）
created_date: 2026-03-28
dependencies: [TASK-SDK-07]
```

| 項目         | 内容                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| タスクID     | UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001                               |
| タスク名     | packages/shared/src/ipc/channels.ts を desktop 実装へ同期               |
| 分類         | 契約整合                                                                |
| 対象機能     | shared IPC channel 定義 / `apps/desktop/src/preload/channels.ts` parity |
| 優先度       | 高                                                                      |
| 見積もり規模 | 小規模                                                                  |
| ステータス   | 未実施                                                                  |
| 発見元       | TASK-SDK-07 Phase 12 unassigned-task-detection                          |
| 発見日       | 2026-03-28                                                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`apps/desktop/src/preload/channels.ts` には `APPROVAL_RESPOND` / `EXECUTION_GET_DISCLOSURE_INFO` / `APPROVAL_REQUEST` が定義済みだが、`packages/shared/src/ipc/channels.ts` との parity が確認されていない。Task07 で shared channel を再利用したが、shared 側の定義状況が未確認のまま閉じた。

### 1.2 問題点・課題

- shared package 側に `approval:respond` / `execution:get-disclosure-info` が定義されているか未確認
- parity drift があると cross-layer contract test が false green になる
- Task07 の governance bundle は shared channel 再利用を前提としているため、shared 側の定義不在は MB-3 違反になりうる

### 1.3 放置した場合の影響

- shared ↔ desktop の channel 名 drift が後続タスクで問題化する
- `governance-bundle.test.ts` の 観点 5（disclosure separation）が実装と乖離する可能性がある

---

## 2. 何を達成するか（What）

### 2.1 目的

`packages/shared/src/ipc/channels.ts`（または相当する shared 定義）と `apps/desktop/src/preload/channels.ts` の channel 名 parity を確認し、drift があれば修正する。

### 2.2 最終ゴール

- `APPROVAL_RESPOND`, `EXECUTION_GET_DISCLOSURE_INFO`, `APPROVAL_REQUEST` が shared/preload 両方で同一文字列として定義されている
- parity test が cross-layer で通る

### 2.3 スコープ

#### 含むもの

- shared / desktop 両側の channel 定義調査
- 差分があれば shared 側へ追加 or desktop 側を shared から import するよう変更
- parity テストの追加または既存テストへの assertion 追加

#### 含まないもの

- Approval request surface UI の実装（別タスク）

---

## 3. 実行手順

1. `packages/shared/src/ipc/channels.ts` が存在するか確認
2. `apps/desktop/src/preload/channels.ts` の `APPROVAL_RESPOND` / `EXECUTION_GET_DISCLOSURE_INFO` / `APPROVAL_REQUEST` の string 値を確認
3. shared 側の定義と比較し、drift を検出
4. drift がある場合は shared 側へ追加し、desktop 側を shared から import するよう変更
5. `governance-bundle.test.ts` 観点 5 にて cross-layer parity assertion を追加

---

## 4. 完了条件チェックリスト

- [ ] shared / desktop の channel 名が一致している
- [ ] parity test が cross-layer で通る
- [ ] `APPROVAL_RESPOND != EXECUTION_GET_DISCLOSURE_INFO` assertion が通る

---

## 5. 参照情報

- `apps/desktop/src/preload/channels.ts`
- `packages/shared/src/ipc/channels.ts`（要存在確認）
- `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts`（観点 5）
- `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-12/implementation-guide.md`
