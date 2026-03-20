# [#1221] "[UT-FIX-PHASE11-SCREENSHOT-AUTOMATION-001] Phase 11 スクリーンショット自動化 - CLI 環境での Electron アプリ画面キャプチャ"

## メタ情報

```yaml
task_id: UT-FIX-PHASE11-SCREENSHOT-AUTOMATION-001
task_name: Phase 11 スクリーンショット自動化 - CLI 環境での Electron アプリ画面キャプチャ
category: インフラ改善
target_feature: Phase 11 手動テスト / スクリーンショット取得スクリプト
priority: 低
scale: 中規模
status: 未実施
source_phase: TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 Phase 12 未タスク検出（2026-03-14）
created_date: 2026-03-14
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-fix-phase11-screenshot-automation-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 の Phase 11（手動テスト）において、スクリーンショット撮影が仕様書上で必須とされていたが、CLI 環境では Electron アプリの実画面キャプチャを直接実行できなかった。自動テスト結果を「間接的な視覚検証」として代替記録する方式で Phase 11 を完了としたが、Apple UI/UX エンジニアとしての視覚品質検証は不完全だった。

既存の Phase 11 スクリーンショット取得スクリプト（`capture-workspace-preview-search-resilience-guard-phase11.mjs` 等）は `phase11-static-server.mjs` で静的ビルドを配信し、Playwright で接続する方式を採用している。この方式は CLI 環境でも動作するが、**chat-edit 画面（WorkspaceChatEditView 等）を含む新画面への対応が未整備**であった。

### 1.2 問題点・課題

- Phase 11 手動テスト仕様書でスクリーンショット撮影が指示されるが、CLI 環境では Electron プロセスの実画面キャプチャができない。
- `electron-vite dev` 実行時に esbuild の platform 設定（node/browser）が食い違い、capture スクリプトが Electron プロセスと共存できないケースがある。
- chat-edit 系の新画面向けキャプチャスクリプトが存在しないため、毎回ゼロから作成する必要がある。
- 新しいキャプチャスクリプト作成時に参照できるテンプレートやチェックリストがない。

### 1.3 放置した場合の影響

- Phase 11 で「視覚検証なし」のまま完了するタスクが累積し、UI 品質劣化を見逃すリスクが高まる。
- 新しい画面を追加するたびにキャプチャスクリプトを一から設計し直す工数が発生する。
- Apple HIG 準拠のライト/ダーク両テーマ検証が自動化されず、コントラスト比（WCAG 2.1 AA: 4.5:1 以上）の退行が検出されない。

## 2. 何を達成するか（What）

### 2.1 目的

CLI 環境において、Phase 11 手動テストのスクリーンショット取得を自動化する汎用的な仕組みを整備する。具体的には、`phase11-static-server.mjs` + Playwright 方式をベースに、chat-edit 系画面向けのキャプチャスクリプトテンプレートと実行ガイドを作成する。

### 2.2 最終ゴール

1. chat-edit 系画面（WorkspaceChatEditView 等）のスクリーンショットを CLI 環境から取得できる。
2. 新しい画面向けキャプチャスクリプトを 30 分以内に作成できるテンプレートが存在する。
3. ライト/ダーク両テーマの画面証跡が `outputs/phase-11/screenshots/` に自動生成される。
4. 同種の課題（P53）が再発した際に 5 ステップで解決できる手順が文書化されている。

### 2.3 スコープ

#### 含むもの

- `capture-workspace-chat-edit-phase11.mjs` スクリプトの新規作成（chat-edit 画面対応）
- Phase 11 キャプチャスクリプト汎用テンプレート（`capture-phase11-template.mjs`）の作成
- `phase11-static-server.mjs` を使用した起動・接続手順のドキュメント化
- モック LLM アダプタ（固定レスポンス返却）の組み込み方法の文書化
- ライト/ダーク両テーマの自動切替キャプチャ

#### 含まないもの

- Playwright E2E テストスイートの全面整備（別タスク: `task-e2e-test-expansion.md`）
- xvfb-run（Linux 専用）を使った実 Electron プロセスのキャプチャ（macOS 非対応）
- CI/CD パイプラインへの組み込み（後続タスクで対応）
- 既存キャプチャスクリプト（40 本以上）の全面リファクタリング

### 2.4 成果物

- `apps/desktop/scripts/capture-workspace-chat-edit-phase11.mjs`（新規）
- `apps/desktop/scripts/capture-phase11-template.mjs`（汎用テンプレート、新規）
- `docs/30-workflows/completed-tasks/unassigned-task/task-fix-phase11-screenshot-automation-001.md`（本指示書）

## 3. どのように実行するか（How）

### 3.1 前提条件

- `pnpm --filter @repo/desktop build:renderer` でレンダラービルドが完了していること。
- `apps/desktop/out/renderer/` に静的ビルド成果物が存在すること。
- `playwright` が `apps/desktop` の devDependencies に登録されていること。
- Node.js 20 以上が利用可能であること。

### 3.2 依存タスク

なし（単独で着手可能）。ただし、以下のタスクが先行して完了していると作業が容易になる。

- TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001（chat-edit 画面の実装完了）

### 3.3 実行手順

#### Phase A: 既存スクリプト調査と方式確定

1. 既存キャプチャスクリプト（`capture-workspace-preview-search-resilience-guard-phase11.mjs`、`capture-ai-runtime-step02-task10-phase11.mjs`）を読んで構造を理解する。
2. `phase11-static-server.mjs` の起動オプションと配信ロジックを確認する。
3. chat-edit 画面の URL パス（`/?phase11Harness=workspace-chat-edit&skipAuth=true` 等）を特定する。
4. `grep -rn "phase11Harness\|skipAuth" apps/desktop/src/renderer/` でハーネスパラメータの受け取り箇所を特定する。

#### Phase B: chat-edit 向けキャプチャスクリプト作成

1. `capture-workspace-chat-edit-phase11.mjs` を以下の構造で作成する。
   - `screenshotDir`: `docs/30-workflows/ai-runtime-authmode-unification/tasks/.../outputs/phase-11/screenshots/`
   - `scenarios` 配列: TC-11-01 ～ TC-11-06 程度のシナリオを定義
   - ライト/ダーク切替: `page.emulateMedia({ colorScheme: "light" | "dark" })` を使用
   - モック LLM: `skipAuth=true` ハーネスで固定レスポンスを返すアダプタ使用
2. `node apps/desktop/scripts/phase11-static-server.mjs` でサーバーを起動し、スクリプトを実行して動作確認する。
3. `outputs/phase-11/screenshots/` にスクリーンショットが生成されることを確認する。

#### Phase C: 汎用テンプレート作成

1. `capture-phase11-template.mjs` として汎用テンプレートを作成する。
   - コメントで各セクションの役割（URL 設定、シナリオ定義、テーマ切替、保存先）を説明する。
   - TODO コメントで実装者が変更すべき箇所を明示する。
2. テンプレートの使い方を `apps/desktop/scripts/README-phase11-capture.md` にまとめる（任意）。

#### Phase D: 動作確認と証跡記録

1. 全シナリオを実行し、`outputs/phase-11/screenshots/` に画像が生成されることを確認する。
2. `ls -lt outputs/phase-11/screenshots/` で更新時刻を確認する（P53 対策）。
3. `phase11-capture-metadata.json` に取得日時・スクリプトバージョン・シナリオ一覧を記録する。

### 3.4 苦戦箇所と対策

#### P53: CLI 環境でのスクリーンショット取得制約

- **症状**: Phase 11 手動テスト仕様書でスクリーンショット撮影が指示されるが、CLI 環境では Electron 実プロセスのウィンドウキャプチャが不可能。
- **対策**: `phase11-static-server.mjs` でレンダラーの静的ビルドを serve し、Playwright の `chromium.launch()` で接続する。`skipAuth=true` クエリパラメータでハーネスモードを起動する。

#### P59: Preload API 未公開による画面遷移ブロック

- **症状**: キャプチャスクリプトが chatEditAPI や workspaceAPI を使って画面遷移しようとするが、Playwright 経由の接続では Preload の contextBridge が存在しないため `window.chatEditAPI` が undefined になる。
- **対策**: `grep -c "exposeInMainWorld" apps/desktop/src/preload/index.ts` で公開 API 数を事前確認する。静的ビルドではハーネスモード（`?phase11Harness=...`）を使い、React コンポーネントが直接 Props として状態を受け取る形でスタンドアロン描画する。Preload API への依存を排除する。

#### P61: 動的アダプタ注入（モック LLM レスポンス）

- **症状**: capture スクリプトで LLM レスポンスが必要な画面（チャット編集中 UI 等）を描画する際、実際の API 呼び出しが発生して CLI 環境でタイムアウトする。
- **対策**: `?phase11Harness=workspace-chat-edit&mockLLM=true` のようなクエリパラメータで固定レスポンスを返すモックアダプタを注入する。モックアダプタは `src/renderer/test-harness/mock-llm-adapter.ts` に配置する。

#### esbuild platform mismatch

- **症状**: `electron-vite dev` 実行中に esbuild の platform 設定（`node` vs `browser`）が food い違い、capture スクリプトが ESM で読み込む Node.js モジュール（`node:fs` 等）と Electron の renderer プロセスが共存できない。
- **対策**: `electron-vite dev` は使わず、`pnpm --filter @repo/desktop build:renderer` で静的ビルドを生成してから `phase11-static-server.mjs` で配信する。capture スクリプトは Electron プロセスとは独立した純粋な Node.js スクリプトとして実行する。

### 3.5 同種課題の簡潔解決手順（5 ステップ）

```
症状: 新しい画面向けのスクリーンショット取得スクリプトが存在しない
根本原因: capture スクリプトがタスクごとに個別作成されており、テンプレートがない

5手順:
  1. pnpm --filter @repo/desktop build:renderer でレンダラービルドを生成する
  2. phase11-static-server.mjs を起動してビルドを配信する（デフォルトポート: 4173）
  3. capture-phase11-template.mjs をコピーして対象画面の URL・シナリオを設定する
  4. ?phase11Harness=<画面名>&skipAuth=true&mockLLM=true でハーネスモードを起動する
  5. node apps/desktop/scripts/capture-<画面名>-phase11.mjs を実行して screenshots/ を確認する

検証ゲート: outputs/phase-11/screenshots/ に TC-11-*.png が生成され、
           phase11-capture-metadata.json に取得日時が記録されていること
```

## 4. 受入基準

### 機能要件

- [ ] `capture-workspace-chat-edit-phase11.mjs` を実行すると `outputs/phase-11/screenshots/` に PNG が生成される
- [ ] ライト/ダーク両テーマのスクリーンショットが生成される（`TC-11-*-light.png` / `TC-11-*-dark.png`）
- [ ] `phase11-capture-metadata.json` に取得日時・シナリオ一覧・スクリプトバージョンが記録される
- [ ] `capture-phase11-template.mjs` が存在し、コピーするだけで新しいスクリプトの骨格が作れる
- [ ] `phase11-static-server.mjs` との連携手順が 5 ステップ以内で完了できる

### 品質要件

- [ ] Preload API（contextBridge）に依存しない。ハーネスモードで完結する
- [ ] スクリプトが `node apps/desktop/scripts/capture-workspace-chat-edit-phase11.mjs` 一コマンドで実行できる
- [ ] 生成された PNG のサイズが 10KB 以上（空白画面でないことの確認）
- [ ] P53（CLI 制約）、P59（Preload API 未公開）、P61（モック LLM）の各対策が実装されている

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に作成済み
- [ ] `task-workflow.md` の残課題テーブルに本タスクが登録済み
- [ ] `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` に P53 教訓が参照されている

## 5. 参照資料

### 既知の落とし穴

- `.claude/rules/06-known-pitfalls.md` — P53（CLI 環境でのスクリーンショット取得制約）
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` — P53, P59, P61

### 既存の静的サーバー

- `apps/desktop/scripts/phase11-static-server.mjs` — Phase 11 向け静的ビルド配信サーバー

### 既存キャプチャスクリプト（参考実装）

- `apps/desktop/scripts/capture-workspace-preview-search-resilience-guard-phase11.mjs` — Playwright + 静的サーバー方式の標準実装例
- `apps/desktop/scripts/capture-ai-runtime-step02-task10-phase11.mjs` — 本タスク（TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001）のフォールバックキャプチャ実装例

### ライトテーマ対応の参考ワークフロー

- `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-contrast-regression-guard.md` — Phase 11 スクリーンショット取得とライト/ダーク両テーマ検証のワークフロー参考
- `apps/desktop/scripts/capture-light-theme-contrast-regression-guard-phase11.mjs` — ライト/ダークテーマ切替キャプチャの実装例
