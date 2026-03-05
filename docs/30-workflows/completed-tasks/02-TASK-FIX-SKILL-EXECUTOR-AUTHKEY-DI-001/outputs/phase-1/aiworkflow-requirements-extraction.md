# Phase 1 aiworkflow仕様抽出

## 実行ログ

- resource-map抜粋: `outputs/phase-1/resource-map-excerpt.md`
- 検索ログ:
  - `outputs/phase-1/search-auth.txt`
  - `outputs/phase-1/search-ipc.txt`
  - `outputs/phase-1/search-preload.txt`
  - `outputs/phase-1/search-renderer.txt`
  - `outputs/phase-1/search-task-fix.txt`（一致なし）

## 抽出カテゴリ（resource-map基準）

### API / IPC

- `api-ipc-agent.md`
  - `skill:execute` 契約
  - `AUTHENTICATION_ERROR` の `errorCode` 伝搬
  - Renderer preflight と Main 最終防衛の二重境界
- `api-ipc-system.md`
  - `auth-key:exists` の判定順（store→env）

### Interface

- `interfaces-agent-sdk-executor.md`
  - AuthKeyService DI、APIキー取得優先順、認証失敗契約
- `interfaces-agent-sdk-skill.md`
  - `skill:execute` 失敗レスポンス、preload `Error.code` 転写、Renderer preflight

### Security

- `security-electron-ipc.md`
  - preflightガードと Main 側最終防衛の分離
- `security-api-electron.md`
  - `errorCode` 伝搬経路の維持要件

### Architecture

- `arch-electron-services.md`
  - Main Process サービスの DI/責務分離

### Error / Quality

- `error-handling.md`
  - 認証エラー分類
- `quality-requirements.md`
  - `skillHandlers.execute`/preload/renderer 回帰テスト観点

### Lessons / Pitfalls

- `lessons-learned.md`
  - `skill:execute` 契約ブリッジと再発パターン
- `.claude/rules/06-known-pitfalls.md`
  - 実装時の既知落とし穴確認（再登録・契約ドリフト防止）

## 抽出結果要約

- 仕様上、`auth-key:exists` と `skill:execute` は同じ認証実体を参照して整合することが前提。
- 既存実装は Main 配線で `AuthKeyService` DI が分離される余地があり、仕様契約に対して脆弱。
- 修正は「DI配線の一本化」が主眼で、UI変更は不要。

## 設計へ引き継ぐ論点

- Main 初期化順をどう固定するか（`authKeyService` 生成タイミング）。
- `registerSkillHandlers` のシグネチャ拡張時の互換性維持。
- 回帰テストで同一インスタンス共有を検証する方法。
