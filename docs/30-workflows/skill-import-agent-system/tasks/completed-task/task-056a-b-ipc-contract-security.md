---
id: TASK-UI-01-B-IPC-CONTRACT-SECURITY
tier: 3
title: IPC契約・Preload公開面・セキュリティ境界の定義
phase: 6
depends_on: [TASK-UI-00-DESIGN-FOUNDATION]
parallel_with: [TASK-UI-01-A-STORE-SLICE-BASELINE]
blocks: [TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN]
status: pending
priority: critical
estimated_complexity: large
tags: [backend, electron, ipc, preload, security]

execution:
  mode: sequential
  timeout_minutes: 70
  retry_count: 1
  allow_partial: false

verification:
  auto_verify: true
  require_tests: true
  require_typecheck: true

artifacts:
  creates:
    - docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-056-ui-01-store-ipc-architecture/outputs/task-056b-ipc-contract-table.md
  modifies:
    - apps/desktop/src/preload/channels.ts
    - apps/desktop/src/preload/types.ts
    - apps/desktop/src/main/ipc/*.ts
---

# TASK-UI-01-B: IPC契約・Preload公開面・セキュリティ境界の定義

## 概要

UI刷新で追加されるIPCチャネルを設計し、チャネル命名・引数バリデーション・sender検証・エラーサニタイズを統一する。P42/P44/P45の再発を防ぐため、Renderer-Preload-Mainの3層契約を同時に固定する。

## 入力

- `task-056-ui-01-store-ipc-architecture.md`（親仕様）
- `apps/desktop/src/preload/channels.ts`
- `apps/desktop/src/preload/types.ts`
- `apps/desktop/src/main/ipc/`

## 出力

- `outputs/task-056b-ipc-contract-table.md`: チャネル、引数、戻り値、検証規約
- `outputs/task-056b-ipc-security-checklist.md`: sender検証・ホワイトリスト・エラー処理チェック

## システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                                        | 反映ポイント                      |
| ------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------- |
| APIエンドポイント一覧    | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | IPC命名規則、カテゴリ整理         |
| システムIPC仕様          | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | invoke/on契約、IPCResponse型      |
| Electron APIセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | contextIsolation・whitelist       |
| Electron IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender検証、P42 3段バリデーション |
| 実装パターン             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P44/P45契約ドリフト防止           |

## 実行手順

### Step 1: チャネル契約表の作成

- `notification:*` と `history:*` のチャネル一覧を確定する。
- invoke系とevent系を分離し、双方向契約を明記する。

### Step 2: 入出力型と検証規約の定義

- 引数は `typeof` / 空文字 / `trim()` の3段検証を標準化する。
- 戻り値は統一Result型で定義し、例外を直接返さない。

### Step 3: セキュリティ境界の確定

- Mainハンドラー先頭でsender検証を実施する順序を固定する。
- Preload公開APIは最小公開に限定し、禁止APIを明記する。

## 検証条件

- [ ] 全チャネルが `channels.ts` 定数で管理される設計
- [ ] invoke/on の方向とPayload型が全件定義済み
- [ ] P42 3段バリデーション要件が全引数で明文化済み
- [ ] sender検証とエラーサニタイズ順序が仕様化済み
- [ ] Renderer/Preload/Mainの3層契約差分が0件

## リスクと対策

| リスク                 | 対策                        |
| ---------------------- | --------------------------- |
| 文字列ハードコード再発 | `IPC_CHANNELS` 定数のみ利用 |
| PreloadとMainの型ずれ  | 同時更新箇所を表で固定      |
| sender検証抜け         | ハンドラー先頭で必須化      |
