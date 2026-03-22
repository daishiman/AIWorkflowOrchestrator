# Phase 1: 要件定義

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 1                            |
| 機能名 | slide-runtime-alignment-impl |
| 作成日 | 2026-03-22                   |
| Issue  | #1363                        |

## 目的

slide IPC/Runtime 経路の正本仕様と現行コードの差分（drift）を特定し、実装収束の受入基準を定義する。

## 実行タスク

- drift 一覧の特定と影響範囲分析
- 受入基準（AC-1〜AC-12）の定義
- スコープ境界の明確化

## 背景

Task 09 で slide runtime/auth-mode alignment の正本仕様は確定したが、現行コードは legacy slide path のまま残っている。正本仕様（`api-ipc-system-core.md`、`interfaces-agent-sdk-skill-advanced.md`）と現行実装の乖離が4箇所で確認されている。

## 現状分析

### drift 一覧

| #   | drift                        | 現行コード                                                                                            | 正本仕様                                                              | 重要度   |
| --- | ---------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------- |
| D1  | IPC handler 未接続           | `registerSlideIpcHandlers()` が `ipc/index.ts` から呼ばれていない                                     | 全 slide IPC を `registerAllIpcHandlers()` 経由で登録                 | CRITICAL |
| D2  | チャネル名 legacy            | `slide:startWatching` / `slide:stopWatching`                                                          | `slide:watch-start` / `slide:watch-stop`                              | HIGH     |
| D3  | SDK 直接利用                 | `agent-client.ts` が `@anthropic-ai/sdk` / `safeStorage` / `electron-store` / env fallback を直接利用 | RuntimeResolver 経由で `integrated` / `handoff` 分岐                  | CRITICAL |
| D4  | modifier-skill 独立実装      | `modifier-skill.ts` が独立モジュールとして残存（呼び出し元ゼロ）                                      | `skill-executor.ts` に統合                                            | MEDIUM   |
| D5  | validateIpcSender 未実装     | slide 系 IPC ハンドラ全6本に未適用                                                                    | 全ハンドラに `validateIpcSender` + P42 3段バリデーション + path guard | HIGH     |
| D6  | slideSlice store fields 不足 | `syncDirection` / `syncProgress` / `syncError` / `isHandoff` / `handoffGuidance` が未追加             | 正本 store fields 7項目                                               | MEDIUM   |

### 影響範囲

| レイヤー   | ファイル                                        | 変更種別                                        |
| ---------- | ----------------------------------------------- | ----------------------------------------------- |
| Main IPC   | `apps/desktop/src/main/ipc/index.ts`            | handler 登録追加                                |
| Main Slide | `apps/desktop/src/main/slide/ipc-handlers.ts`   | channel rename + validateIpcSender + path guard |
| Main Slide | `apps/desktop/src/main/slide/skill-executor.ts` | RuntimeResolver 統合 + modifier 統合            |
| Main Slide | `apps/desktop/src/main/slide/agent-client.ts`   | legacy path 廃止                                |
| Main Slide | `apps/desktop/src/main/slide/modifier-skill.ts` | skill-executor.ts へ統合                        |
| Preload    | `apps/desktop/src/preload/channels.ts`          | channel 定数 rename                             |
| Preload    | `apps/desktop/src/preload/index.ts`             | slideApi channel 参照更新                       |
| Shared     | `packages/shared/src/slide/types.ts`            | HandoffGuidance 型追加                          |
| Renderer   | slide store（slideSlice）                       | store fields 追加                               |

## 受入基準

### 機能要件

- [ ] AC-1: `registerSlideIpcHandlers()` が `ipc/index.ts` の `registerAllIpcHandlers()` から呼ばれる
- [ ] AC-2: IPC チャネル名が正本 12 チャネルへ統一されている（invoke 6 + push 6）
- [ ] AC-3: `skill-executor.ts` が RuntimeResolver と handoffGuidance を返せる
- [ ] AC-4: `phase === "modifier"` が `skill-executor.ts` の同一実行面で処理される

### 品質要件

- [ ] AC-5: 全 invoke ハンドラに `validateIpcSender` が適用されている
- [ ] AC-6: 全 `projectPath` 引数に P42 3段バリデーション + `detectPathTraversal` が適用されている
- [ ] AC-7: `agent-client.ts` の SDK 直接利用・env fallback が除去されている
- [ ] AC-8: エラーはサニタイズされ内部パス・スタックトレースが Renderer に漏洩しない

### 非機能要件

- [ ] AC-9: `pnpm --filter @repo/desktop typecheck` が PASS する
- [ ] AC-10: slide 関連テストが全て PASS する
- [ ] AC-11: slideSlice に正本 7 fields が追加されている
- [ ] AC-12: Renderer 側の slideApi 呼び出し（SlideWorkspace 等）が新チャネルメソッド名（watchStart, reverseSync, cancel 等）を使用している

## スコープ

### 含むもの

- Main IPC 接続（D1）
- チャネル名統一（D2）
- RuntimeResolver 統合（D3）
- modifier-skill 統合（D4）
- validateIpcSender 追加（D5）
- slideSlice store fields 追加（D6）

### 含まないもの

- SlideWorkspace の見た目改善全般
- 既存 unrelated workflow の IPC 整理
- Renderer UI コンポーネントの新規作成（`SlideGuidanceBlock` 等）

## 参照資料

| 資料名        | パス                                                                                            | 説明                            |
| ------------- | ----------------------------------------------------------------------------------------------- | ------------------------------- |
| IPC 正本      | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                      | canonical 12チャネル定義        |
| Runtime 正本  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-advanced.md`      | RuntimeResolver / modifier 契約 |
| Security 正本 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`               | validateIpcSender 要件          |
| State 正本    | `.claude/skills/aiworkflow-requirements/references/arch-state-management-advanced.md`           | slideSlice store fields         |
| Workflow 正本 | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | canonical set / drift 記録      |
| Task09 教訓   | `.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md`      | IPC/Preload 教訓                |

## 統合テスト連携

Phase 4 で以下のテスト観点を設計する:

- slide invoke 6チャネルの request/response 契約
- handoff と integrated の分岐
- reverse-sync / error / progress の push event
- validateIpcSender / P42 / path guard の検証順序

## 完了条件

受入基準 AC-1〜AC-12 の全チェックが PASS していること。

## 次のPhase

Phase 2（設計）へ進む。
