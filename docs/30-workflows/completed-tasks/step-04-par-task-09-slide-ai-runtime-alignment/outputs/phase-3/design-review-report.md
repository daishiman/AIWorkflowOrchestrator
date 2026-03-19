# Phase 3: 設計レビュー報告

## メタ情報

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| タスクID | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| Phase    | 3                                       |
| 作成日   | 2026-03-19                              |

---

## レビュー結果サマリー

| Gate 判定 | **PASS** |
| --------- | -------- |

MINOR 指摘 2 件あり。Phase 4 に進行可。

---

## 7 観点レビュー結果

### 観点 1: Direct SDK / Silent Fallback 排除の完全性

| チェック項目                                                   | 判定 | 根拠                                                                          |
| -------------------------------------------------------------- | ---- | ----------------------------------------------------------------------------- |
| `@anthropic-ai/sdk` 直 import が設計上残らないか               | PASS | agent-client.ts 全体を廃止する設計。skill-executor.ts は IAuthKeyService 経由 |
| electron-store 直読みが設計上残らないか                        | PASS | agent-client.ts 廃止で排除。IAuthKeyService が唯一の正規経路                  |
| `process.env.ANTHROPIC_API_KEY` silent fallback が排除されるか | PASS | agent-client.ts 廃止で排除。IAuthKeyService.exists() で env-fallback 判定     |
| コメントと実態の乖離が解消されるか                             | PASS | agent-client.ts:163 のシミュレーションコメントはファイル廃止で解消            |

### 観点 2: Internal Role の UI 非露出

| チェック項目                                                        | 判定 | 根拠                                                                                |
| ------------------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------- |
| watcher / modifier / reverse-sync が UI mode 切替として露出しないか | PASS | SlideUIStatus は synced/running/degraded/guidance の 4 状態。internal role は非露出 |
| internal orchestration が Renderer から直接呼び出されないか         | PASS | IPC 経由のみ。DI 依存関係図で確認済み                                               |

### 観点 3: Reverse-sync / Watcher / Sync Status の Authority 保全

| チェック項目                                    | 判定 | 根拠                                                                     |
| ----------------------------------------------- | ---- | ------------------------------------------------------------------------ |
| reverse-sync の authority が SyncManager に集約 | PASS | Authority テーブルで SyncManager が SyncStatus/Direction/Progress を管理 |
| watch-start/stop lifecycle が明確               | PASS | FileWatcher の start/stop が IPC 経由で明確に制御される設計              |
| sync status push が Renderer まで到達するか     | PASS | slide:sync-status-changed → Zustand slideSlice の push 経路が設計済み    |
| onHtmlChange 未接続問題が設計で解消されるか     | PASS | T-5-5 で FileWatcher.onHtmlChange → SyncManager.reverseSync() を接続     |

### 観点 4: IPC セキュリティ

| チェック項目                                     | 判定 | 根拠                                                                  |
| ------------------------------------------------ | ---- | --------------------------------------------------------------------- |
| 全 slide IPC ハンドラに validateIpcSender が設計 | PASS | T-2-5 で全 6 invoke チャネルに適用設計済み                            |
| projectPath に P42 準拠 3 段バリデーション       | PASS | 5 チャネルに typeof → === "" → .trim() === "" を設計済み              |
| パストラバーサル検出                             | PASS | 5 チャネルに detectPathTraversal() 適用設計済み                       |
| Preload whitelist に slide チャネルが登録        | PASS | ALLOWED_INVOKE_CHANNELS に 6、ALLOWED_ON_CHANNELS に 6 を追加設計済み |

### 観点 5: UI/UX 整合性

| チェック項目                                              | 判定 | 根拠                                                                 |
| --------------------------------------------------------- | ---- | -------------------------------------------------------------------- |
| ui-ux-realization.md の 4 状態が全て設計に含まれるか      | PASS | synced/running/degraded/guidance の 4 状態が UI マッピングに定義済み |
| degraded 時のマイクロコピーが「回復導線の同居」原則に準拠 | PASS | 失敗理由 + 次アクション + ステップ表示が同一ブロックに配置           |
| Persistent Terminal Launcher が SlideWorkspace に配置     | PASS | 右下固定で全状態常時表示の設計済み                                   |

### 観点 6: Cross-task 契約の整合

| チェック項目                                           | 判定 | 根拠                                                               |
| ------------------------------------------------------ | ---- | ------------------------------------------------------------------ |
| Task01 の RuntimeResolver / access matrix を正しく参照 | PASS | RuntimeResolver.resolve() を呼び出し、local 判定を増やさない設計   |
| skill-lifecycle Task03 が同じ契約を参照できるか        | PASS | SkillExecutor の execute 契約が共通インターフェース                |
| IPC チャネル名が正本仕様と統一されているか             | PASS | 4 チャネル rename + push 衝突解決（sync-status-changed）が設計済み |

### 観点 7: Zustand State 設計

| チェック項目                                | 判定  | 根拠                                                                   |
| ------------------------------------------- | ----- | ---------------------------------------------------------------------- |
| slideSlice が P31（無限ループ）リスクを回避 | PASS  | 個別セレクタ 15 個を設計。合成 Hook 非推奨                             |
| P48（useShallow 未適用）リスクがないか      | PASS  | オブジェクトセレクタ 3 個に useShallow 適用設計済み                    |
| useSlideProject の依存配列が安全か          | MINOR | 既存 useSlideProject の P31 リスクは残存。本タスクスコープ外として記録 |

---

## MINOR 追跡テーブル

| MINOR ID  | 指摘内容                                                        | 解決予定 Phase | 解決確認 Phase | 備考                                    |
| --------- | --------------------------------------------------------------- | -------------- | -------------- | --------------------------------------- |
| TECH-M-01 | useSlideProject の P31 リスク（store 全体取得パターン）残存     | スコープ外     | N/A            | 別タスク化（未タスク検出で記録）        |
| TECH-M-02 | SyncStatus 型の `out-of-sync` → `idle` 変更による既存テスト影響 | Phase 5        | Phase 9        | 影響範囲: SyncStatusIndicator, store.ts |

---

## Simpler Alternative 検討

| 代替案                                                              | メリット         | デメリット                               | 採否     |
| ------------------------------------------------------------------- | ---------------- | ---------------------------------------- | -------- |
| agent-client.ts を修正して IAuthKeyService に差し替え（廃止しない） | 変更範囲が小さい | Direct SDK import が残る、責務境界が曖昧 | **却下** |
| slide 系を全て新規実装する                                          | クリーンな設計   | 工数が大きい、既存テストの廃棄           | **却下** |
| IPC チャネル名を現行のまま維持する                                  | 変更なし         | 正本仕様との乖離が残る                   | **却下** |

**採用設計**: agent-client.ts 廃止 + modifier-skill.ts 統合 + IPC チャネル名正本統一。理由: 責務境界の明確化、正本仕様との整合、セキュリティ要件の充足。

---

## Gate 判定

### 判定: **PASS**

- MAJOR / CRITICAL: 0 件
- MINOR: 2 件（TECH-M-01 はスコープ外、TECH-M-02 は Phase 5 で解決）
- 全 7 観点で重大な設計問題なし

### Phase 4 開始条件

- Phase 1-3 の全成果物が出力済み
- MINOR 追跡テーブルに解決計画が記録済み
- Simpler Alternative の検討が完了

### Phase 13 blocked 条件

- Phase 1-12 の全成果物が完了していること
- MINOR 指摘が全て解決済みまたは未タスク化されていること
