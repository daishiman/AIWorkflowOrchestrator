# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 2                                         |
| Phase名    | 設計                                      |
| タスクID   | TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001 |
| 前提Phase  | Phase 1（要件定義）                       |
| 後続Phase  | Phase 3（設計レビュー）                   |
| ステータス | not_started                               |
| 作成日     | 2026-03-13                                |
| 機能名     | claude-code-terminal-surface              |

## 目的

embedded terminal を起点に、ユーザーが `claude` を自分で実行し、そのやり取りが transcript として UI に出力される terminal surface 設計を確定する。

## 実行タスク

- terminal transport 設計: shell 起動、cwd 反映、session / status、stdout / stderr transcript の authority をどこに置くか決める
- launcher / handoff 設計: `copy command`、`copy context`、`open cwd`、`launch terminal` の UX と境界を定義する
- transcript UI 設計: output stream、status badge、abort、retry、history、large output virtualization の公開面を定義する
- transcript share 設計: terminal transcript を chat へ手動共有する action と provenance 表示を定義する
- security boundary 設計: `no auto-send`、credential 非中継、hidden prompt injection 禁止、manual retry boundary を定義する
- integration 設計: ExecutionEnvironment、AgentSDKPage、Settings / access card と terminal surface の接続方法を定義する

## 設計方針

- terminal は `user-operated shell` として扱い、アプリは入力を自動送信しない
- Claude Code を起動する場合も、ユーザーが自分で `claude` を入力するか、明示確認後に非送信の提案文だけを提示する
- transcript は render 最適化と session 再表示を前提に、long-running output を落とさず扱う
- terminal surface は integrated runtime の代替エンジンにしない
- `裏で claude を実行して出力だけ返す` hidden background automation は採用しない
- terminal launcher は app shell から常時開ける固定導線として扱う

## Atent Team / SubAgent 分担

| 役割                    | 主担当                                                     |
| ----------------------- | ---------------------------------------------------------- |
| Terminal Session Agent  | shell / PTY / session / transcript 契約を整理する          |
| UX Surface Agent        | launch、output、abort、retry、history の UI 契約を整理する |
| Security Boundary Agent | `no auto-send`、credential 非中継、IPC 境界を整理する      |

## 参照資料

| 参照資料             | パス                                                                            | 内容                                                          |
| -------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Phase 1（要件定義）  | `phase-1-requirements.md`                                                       | 依存する前提成果物を確認する                                  |
| pack parent index    | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                    | 実行順序、依存グラフ、共通方針の正本を確認する                |
| pack design audit    | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`      | 多角的監査の結論、禁止事項、依存整合を確認する                |
| pack UI/UX 図解      | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`           | 5図セットの画面構成、状態遷移、CTA 導線を確認する             |
| ClaudeCliManager     | `apps/desktop/src/main/claude-cli/ClaudeCliManager.ts`                          | current facade / session API を確認する                       |
| ProcessManager       | `apps/desktop/src/main/claude-cli/ProcessManager.ts`                            | process lifecycle と terminal transport 候補を確認する        |
| SessionManager       | `apps/desktop/src/main/claude-cli/SessionManager.ts`                            | session lifecycle / transcript 保持を確認する                 |
| Claude CLI IPC       | `apps/desktop/src/main/claude-cli/ipc-handler.ts`                               | invoke/on channel と current automation 経路を確認する        |
| preload index        | `apps/desktop/src/preload/index.ts`                                             | `window.claudeCliAPI` の公開契約を確認する                    |
| preload channels     | `apps/desktop/src/preload/channels.ts`                                          | whitelist channel と event 契約を確認する                     |
| ExecutionEnvironment | `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/index.tsx` | terminal placeholder と environment selector の現状を確認する |
| AgentSDKPage         | `apps/desktop/src/renderer/pages/AgentSDKPage/index.tsx`                        | terminal surface の既存統合位置を確認する                     |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                         | パス                                                                                    | 内容                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| interfaces-agent-sdk-ui          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`          | Agent SDK UI / Hook の正本                                   |
| interfaces-agent-sdk-integration | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md` | Claude CLI / Agent SDK 統合の正本                            |
| interfaces-agent-sdk-history     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md`     | terminal history / execution environment の正本              |
| ui-ux-agent-execution            | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`            | Agent surface の UI 契約                                     |
| ui-ux-feature-components         | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`         | terminal panel / environment surface の正本                  |
| security-api-electron            | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`            | preload / terminal renderer security の正本                  |
| security-electron-ipc            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`            | IPC sender / error envelope の正本                           |
| arch-claude-cli                  | `.claude/skills/aiworkflow-requirements/references/arch-claude-cli.md`                  | Claude Code terminal / session / preload architecture の正本 |
| architecture-overview            | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`            | terminal surface の責務境界を確認する                        |
| pack UI/UX 正本                  | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                | terminal surface の CTA、状態、screenshot 契約を確認する     |

## UI/UX リアライズ

| 観点             | 内容                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| 画面構成         | 左に session list、中央に transcript、右上に status badge / abort / retry、下部に handoff action rail を置く |
| Primary CTA      | `terminal を開く` または `session に再接続`                                                                  |
| Secondary CTA    | `suggested command をコピー` `context をコピー` `working directory を開く`                                   |
| 状態             | `idle` `input-waiting` `running` `long-output` `unavailable` `history-replay` を扱う                         |
| マイクロコピー   | `この画面は自動送信しません` を terminal surface の共通説明にする                                            |
| アクセシビリティ | transcript 領域、control rail、session list を Tab 移動で巡回できるようにする                                |
| 常設導線         | app shell header と主要 panel header から同じ `Terminal` ボタンで dock を開けるようにする                    |
| 手動共有         | `選択範囲をチャットへ送る` `直近出力を添付` `セッションを貼り付ける` を、明示操作だけで出す                  |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Claude Code terminal surface と手動操作境界の整流 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

設計 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

launch、session、output stream、abort、retry、history、large output virtualization、`no auto-send` 境界の契約、state、IPC、security 境界を設計へ反映する。

## 成果物

| 成果物              | パス                                       | 内容                                           |
| ------------------- | ------------------------------------------ | ---------------------------------------------- |
| 設計サマリー        | `outputs/phase-2/design-summary.md`        | 責務境界、依存関係、接続順序を整理する         |
| 契約一覧            | `outputs/phase-2/contract-matrix.md`       | IPC、state、runtime 契約を一覧化する           |
| UI/UX 実体化        | `outputs/phase-2/ui-ux-realization.md`     | 画面構成、操作、状態、マイクロコピーを整理する |
| 画面状態一覧        | `outputs/phase-2/screen-state-matrix.md`   | terminal surface の状態遷移と CTA を整理する   |
| transcript 共有設計 | `outputs/phase-2/transcript-share-flow.md` | chat への手動共有操作と provenance を整理する  |

## 完了条件

- [ ] embedded terminal / launcher / transcript / history の shared contract が定義されている
- [ ] `copy only / no auto-send` と user-operated boundary が明文化されている
- [ ] terminal surface の画面構成、status、action rail、microcopy が実体化されている
- [ ] transcript -> chat の手動共有操作と自動共有禁止が明文化されている

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む
