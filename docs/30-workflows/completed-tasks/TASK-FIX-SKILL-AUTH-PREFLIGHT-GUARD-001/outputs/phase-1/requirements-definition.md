# Phase 1 要件定義書

## 1. スコープ

- 対象: `skill:execute` 実行前の認証キー事前検知と設定誘導
- 対象レイヤー:
  - Main: `skillHandlers.ts`（エラー契約）
  - Preload: `skill-api.ts`（IPCエラー伝搬）
  - Renderer: `AgentView` / `useSkillExecution` / `agentSlice`（事前ガードと誘導メッセージ）
  - System IPC: `auth-key:exists`（事前判定の情報源）

## 2. 機能要件（FR）

- FR-01: スキル実行前に認証キー有無を判定できること（Preflight）
- FR-02: 認証キー未設定時は `AUTHENTICATION_ERROR` として扱うこと
- FR-03: 認証キー未設定時は「設定画面でAPIキー登録」を明示した誘導メッセージを返すこと
- FR-04: Main→Preload→Renderer のエラー伝搬でエラーコードを欠落させないこと
- FR-05: 既存 `skill:execute` 契約（`{ success, data|error }`）の後方互換を維持すること

## 3. 非機能要件（NFR）

- NFR-01: 既存テスト群に回帰を起こさない（対象モジュールの既存ケースPASS）
- NFR-02: IPCセキュリティ（`validateIpcSender`）を維持する
- NFR-03: 例外メッセージは既存サニタイズ方針を維持し、機密情報を漏らさない
- NFR-04: UI導線変更は最小変更で既存画面構成を壊さない

## 4. 境界・除外

- 除外: 認証モード切替UXの新規設計（既存 `SettingsView` を利用）
- 除外: 新規IPCチャネル追加（既存 `auth-key:exists` / `skill:execute` を活用）
- 除外: コミット/PR作成

## 5. 依存仕様（aiworkflow-requirements）

- `interfaces-agent-sdk-skill.md`: `skill:execute` 契約境界
- `api-ipc-agent.md`: IPCレスポンスラッパー契約
- `api-ipc-system.md`: `auth-key:*` 契約
- `security-electron-ipc.md`: sender検証
- `quality-requirements.md`: テスト・品質基準
- `ui-ux-feature-components.md`: エラー表示導線

## 6. リスク

- R-01: `auth-key:exists` と実行時キー解決ロジックの乖離
- R-02: エラーコード非伝搬による誘導不発
- R-03: 既存テストのモック前提（`window.electronAPI`）との衝突

## 7. リスク対応

- R-01対応: Preflightは既存 `auth-key:exists` を利用し、実行時失敗も `AUTHENTICATION_ERROR` で最終防衛
- R-02対応: `skillHandlers` で `errorCode` を返し、Preloadで `Error.code` へ転写
- R-03対応: Optional chaining で API 未提供環境は従来挙動を維持
