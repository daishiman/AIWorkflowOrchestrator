# APIキー連動とチャット実行経路整合ワークフロー仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。  
> 管理: `.claude/skills/aiworkflow-requirements/references/`

---

## 概要

Settings の APIキー操作と `ai.chat` 実行経路がずれることで発生する「保存済みなのに使えない」不整合を、IPC 契約・型契約・UI 表示契約を同一ターンで同期して解消する標準ワークフローを定義する。

**トリガー**: `apiKey:save/delete` 後の実行失敗、`auth-key:exists` 判定曖昧、`ai.chat` provider/model ルーティング不整合  
**実行環境**: ローカル（worktree）+ Phase 12 仕様同期

---

## フェーズ構造

### フェーズ一覧

| Phase | 名称 | 入力 | 出力 |
| --- | --- | --- | --- |
| Phase 1 | 契約差分抽出 | Main/Preload/Renderer 実装差分、既存仕様 | 更新対象仕様書マトリクス |
| Phase 2 | 実装同期 | IPC/型/UI 契約差分 | 実装済み契約（source, sync, cache clear） |
| Phase 3 | 仕様同期 | Phase 2 の確定内容 | 更新済み system spec |
| Phase 4 | 検証固定 | テスト結果、Phase 11 証跡、監査結果 | 完了判定と再利用手順 |

### フロー図

1. `ai.chat` と `llm` 選択状態の契約差分を抽出する。
2. `llm:set-selected-config` と `auth-key:exists.source` を実装契約として固定する。
3. `apiKey:save/delete` 後の adapter cache clear を実行契約へ統合する。
4. 仕様書別に実装内容と苦戦箇所を同期する。
5. テスト・スクリーンショット・未タスク監査で完了判定を確定する。

### SubAgent 編成（関心ごと分離）

| SubAgent | 主責務 | 入力 | 出力 |
| --- | --- | --- | --- |
| SubAgent-A | 型/インターフェース同期 | `interfaces-auth.md`, `llm-ipc-types.md` | `source`/request 型契約の確定 |
| SubAgent-B | IPC/実行経路同期 | `api-ipc-system.md`, `api-endpoints.md` | channel・解決順・cache clear 契約 |
| SubAgent-C | セキュリティ/UI 同期 | `security-electron-ipc.md`, `ui-ux-settings.md` | 判定根拠の非機密化と表示契約 |
| SubAgent-D | 台帳同期 | `task-workflow.md` | 完了記録・検証証跡・苦戦箇所 |
| SubAgent-E | 教訓化 | `lessons-learned.md` | 再発条件付きの再利用手順 |
| Lead | 統合検証 | A-E成果物 | 最終整合、変更履歴更新 |

---

## 今回実装内容（2026-03-11）

| 観点 | 実装内容 |
| --- | --- |
| 実行経路 | `AI_CHAT` に `providerId/modelId` 明示指定ルートを追加し、片指定を fail-fast 化 |
| 同期経路 | `llm:set-selected-config` を追加し、Renderer の選択状態を Main へ同期 |
| 鍵保管契約 | `SecureStorage` を `api-keys` 単一正本参照へ収束 |
| キャッシュ整合 | `apiKey:save/delete` 後に `LLMAdapterFactory.clearInstance(provider)` を実行 |
| UI判定契約 | `auth-key:exists` を `{ exists, source }` へ拡張し、`saved/env-fallback/not-set` を返却 |
| UI表示契約 | `authMode === "api-key"` 時のみ `AuthKeySection` を表示、`source` 優先表示へ統一 |

---

## 苦戦箇所と再発防止

| 苦戦箇所 | 再発条件 | 今回の対処 | 標準ルール |
| --- | --- | --- | --- |
| APIキー更新後の stale adapter | 永続化だけ更新し runtime cache を残す | `apiKey:save/delete` 成功後に provider 単位で clear | 認証情報更新は「永続化 + cache clear」を1セットで実装 |
| `ai.chat` の参照先ドリフト | Renderer 選択状態を Main に渡さない | `llm:set-selected-config` を追加し即時同期 | Main が実行主体の機能は専用同期IPCを必須化 |
| `auth-key:exists` の情報不足 | boolean のみで判定根拠を返さない | `source` を契約に追加し UI を `source` 優先へ移行 | UI が複数状態を扱う場合、判定根拠フィールドを契約化 |

---

## 同種課題の5分解決カード

1. 実行経路（Main）と選択経路（Renderer）を分離し、同期チャネルを先に定義する。  
2. APIキー更新時は storage 更新と adapter cache clear を同一トランザクションで扱う。  
3. UI の表示分岐に必要な由来情報（`source`）を IPC レスポンスへ昇格する。  
4. `interfaces-auth` / `llm-ipc-types` / `api-ipc-system` / `security-electron-ipc` / `ui-ux-settings` / `task-workflow` / `lessons-learned` の7仕様書を同一ターンで同期し、`api-endpoints.md` を探索インデックスとして追随更新する。  
5. Phase 11 screenshot と targeted tests を完了台帳に同値転記して固定する。  

---

## 最適なファイル形成（責務マトリクス）

| 関心ごと | 最適な反映先 | 反映理由 |
| --- | --- | --- |
| AuthKey の型契約 | `interfaces-auth.md` | UI 判定条件の正本 |
| LLM request/同期型 | `llm-ipc-types.md` | request/response の境界正本 |
| 実行経路/IPC契約 | `api-ipc-system.md` | channel と解決順の正本 |
| エンドポイント一覧 | `api-endpoints.md` | 探索用インデックス |
| 非機密判定と sender 境界 | `security-electron-ipc.md` | セキュリティ方針の正本 |
| Settings 表示条件 | `ui-ux-settings.md` | 画面状態の正本 |
| 完了判定/証跡 | `task-workflow.md` | 台帳管理 |
| 再発防止手順 | `lessons-learned.md` | 次回の短手順起点 |

---

## 検証コマンド（最小セット）

| コマンド | 目的 | 合格条件 |
| --- | --- | --- |
| `pnpm --filter @repo/desktop exec vitest run src/main/handlers/__tests__/llm.test.ts src/main/ipc/__tests__/aiHandlers.llm.test.ts src/main/ipc/__tests__/authKeyHandlers.test.ts src/preload/channels.test.ts src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx src/renderer/views/SettingsView/SettingsView.test.tsx` | 主要経路回帰 | PASS（対象テスト全通過） |
| `node apps/desktop/scripts/capture-task-fix-apikey-chat-tool-integration-phase11.mjs` | 代表状態 screenshot | 3件取得完了 |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/api-key-chat-tool-integration-alignment` | 証跡整合 | PASS |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/api-key-chat-tool-integration-alignment` | 実装ガイド要件確認 | PASS |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` | 今回差分の未タスク監査 | `currentViolations=0` |

---

## 関連改善タスク

| 未タスクID | 概要 | 参照 |
| --- | --- | --- |
| UT-IMP-APIKEY-CHAT-TRIPLE-SYNC-GUARD-001 | `apiKey:save/delete` の cache clear、`llm:set-selected-config` の Main 同期、`auth-key:exists.source` の UI 表示を単一回帰マトリクスで guard する（完了: 2026-03-11） | `docs/30-workflows/completed-tasks/task-imp-apikey-chat-triple-sync-guard-001.md` |

---

## 関連ドキュメント

| ドキュメント | 説明 |
| --- | --- |
| [interfaces-auth.md](./interfaces-auth.md) | `AuthKeyExistsResponse.source` 契約正本 |
| [llm-ipc-types.md](./llm-ipc-types.md) | `AIChatRequest` / `LLMSetSelectedConfigRequest` |
| [api-ipc-system.md](./api-ipc-system.md) | `AI_CHAT` 解決順、cache clear 契約 |
| [ui-ux-settings.md](./ui-ux-settings.md) | AuthKeySection 表示契約 |
| [security-electron-ipc.md](./security-electron-ipc.md) | 非機密判定と IPC セキュリティ |
| [task-workflow.md](./task-workflow.md) | 完了台帳と検証証跡 |
| [lessons-learned.md](./lessons-learned.md) | 苦戦箇所と再利用手順 |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
| --- | --- | --- |
| 2026-03-11 | 1.1.1 | UT-IMP-APIKEY-CHAT-TRIPLE-SYNC-GUARD-001 の完了移管を反映し、関連改善タスクの参照先を `completed-tasks` 側へ更新 |
| 2026-03-11 | 1.1.0 | UT-IMP-APIKEY-CHAT-TRIPLE-SYNC-GUARD-001 を関連未タスクとして追加し、3点セットの guard 導線を workflow spec から直接辿れるようにした |
| 2026-03-11 | 1.0.0 | TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 の実装内容・苦戦箇所・5分解決カードを、仕様書別責務分離で新規作成 |
