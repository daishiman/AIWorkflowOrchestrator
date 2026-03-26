# APIセキュリティ・Electronセキュリティ

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

本ドキュメントはAIWorkflowOrchestratorプロジェクトのセキュリティ仕様のインデックスです。
API認証・認可、Electron IPC、スキル実行のセキュリティ設計を定義しています。

**親ドキュメント**: [security-implementation.md](./security-implementation.md)

---

## ドキュメント構成

| カテゴリ               | ファイル                                             | 説明                                          |
| ---------------------- | ---------------------------------------------------- | --------------------------------------------- |
| APIセキュリティ        | [security-api.md](./security-api.md)                 | 認証・認可、レート制限、CORS、依存関係管理    |
| Electron IPC           | [security-electron-ipc.md](./security-electron-ipc.md) | BrowserWindow設定、CSP、IPCパターン、実装例 |
| スキル実行定数         | [security-skill-execution.md](./security-skill-execution.md) | 危険パターン、保護パス、許可ツール定数    |
| スキルIPC              | [security-skill-ipc.md](./security-skill-ipc.md)     | Claude CLI、Preload API、Permission IPC       |

---

## セキュリティ原則

### Electron セキュリティ設定

| 設定                        | 推奨値 | 理由                               |
| --------------------------- | ------ | ---------------------------------- |
| nodeIntegration             | false  | Rendererからのシステムアクセス防止 |
| contextIsolation            | true   | preloadスクリプトの分離            |
| sandbox                     | true   | Chromiumサンドボックスの有効化     |
| webSecurity                 | true   | Same-Originポリシーの強制          |
| allowRunningInsecureContent | false  | HTTP上のコンテンツ実行防止         |

### IPC通信セキュリティ

| 原則               | 説明                                     |
| ------------------ | ---------------------------------------- |
| contextIsolation   | Preloadスクリプトでのみ通信APIを公開     |
| チャネルホワイトリスト | 許可されたチャネルのみ通信可能           |
| sender検証         | withValidation()でリクエスト元を検証     |
| 型安全性           | 全チャネルに対してTypeScript型定義を適用 |

---

## テスト品質サマリー

| コンポーネント               | テスト数 | カバレッジ     |
| ---------------------------- | -------- | -------------- |
| セキュリティ定数（TASK-2C）  | 102      | 98.4% Line     |
| slideSettings IPC            | 156      | 94.30% Line    |
| history preload              | 28       | 100%           |
| スキルインポートIPC          | 60       | -              |
| SkillExecutor IPC            | 192      | -              |
| Permission IPC               | 93       | -              |
| Claude CLI                   | 240      | 25/240 Security |

---

## 完了タスク

| タスク | 完了日 | 説明 |
|--------|--------|------|
| TASK-2C | 2026-01-24 | セキュリティ定数・検証関数 |
| TASK-3-1-D | 2026-01-26 | Permission Dialog UI |
| TASK-3-1-E | 2026-01-26 | Permission Store永続化 |
| TASK-3-2 | 2026-01-25 | SkillExecutor IPC Handler |
| TASK-4-1 | 2026-01-25 | スキルインポートIPCチャネル |
| slide-directory-settings | 2026-01-14 | スライド設定セキュリティ |
| history-preload-setup | 2026-01-13 | 履歴preloadセキュリティ |
| claude-code-cli-integration | 2026-01-17 | Claude CLI連携セキュリティ |

---

## 完了タスク

| タスクID   | タスク名                             | 完了日     | 変更内容                                                                         |
| ---------- | ------------------------------------ | ---------- | -------------------------------------------------------------------------------- |
| UT-FIX-5-4 | AgentSDKAPI型定義不一致修正          | 2026-02-10 | `agentSDKAPI.abort()` 戻り値型を `void` → `Promise<void>` に修正（P23パターン準拠） |
| UT-FIX-5-3 | Preload Agent Abort セキュリティ修正 | 2026-02-10 | `agentSDKAPI.abort()` を `safeInvoke()` 経由に変更、Main側 `ipcMain.handle()` 使用  |
| UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 | skill:ハンドラP42準拠バリデーション形式統一 | 2026-02-24 | skillHandlers.ts 6ハンドラにP42準拠3段バリデーション（typeof+trim）とthrow形式エラーを適用。全11ハンドラのバリデーション形式統一完了 |
| TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 | `skill:execute` 認証 preflight ガード | 2026-03-04 | Main 失敗契約へ `errorCode` を追加、Preload `safeInvokeUnwrap` で `Error.code` 転写、Renderer execute 前 `auth-key:exists` 判定で実行停止 |

---

## 完了タスク（TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001）

> 完了日: 2026-03-25

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| 実装内容 | ApprovalGate による承認フロー、Consumer Auth Guard（CAG）、sanitizeForApiKeys による API key 除去、3層レイヤーアーキテクチャ（Primary / Safety / Detail Surface） |
| 主要コンポーネント | ApprovalGate.ts, approvalHandlers.ts, advancedConsoleHandlers.ts, disclosureHandlers.ts, RuntimePolicyResolver.ts |
| 追加チャンネル | `approval:respond` / `approval:request` / `execution:get-disclosure-info` / `execution:get-terminal-log` / `execution:get-copy-command` |
| セキュリティ契約 | DENY-5（API key 非公開）、DENY-6（terminal command sanitize）、DENY-9（外部送信承認必須）、CAG-1〜3、NAS-1〜4 |

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                                     |
| ---------- | ---------- | ---------------------------------------------------------------------------- |
| 2.3.0      | 2026-03-04 | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001完了反映: `skill:execute` の `errorCode` 伝搬契約と Renderer preflight (`auth-key:exists`) を完了タスクへ追加 |
| 2.2.0      | 2026-02-10 | UT-FIX-5-4完了: AgentSDKAPI.abort()型定義修正。`void` → `Promise<void>` に修正 |
| 2.1.0      | 2026-02-10 | UT-FIX-5-3完了: Agent Abort IPC セキュリティ修正                              |
| 2.0.0      | 2026-01-26 | 4ファイルに分割（730行→インデックス+詳細ファイル）    |
| 1.6.0      | 2026-01-25 | TASK-4-1完了: スキルインポートIPCチャネル8件追加      |
| 1.5.0      | 2026-01-25 | TASK-3-2完了: Skill Execution Preload APIセキュリティ |
| 1.4.0      | 2026-01-17 | Claude CLI Renderer APIセキュリティ追加               |
| 1.3.0      | 2026-01-17 | Claude Code CLI連携セキュリティ追加                   |
| 1.2.0      | 2026-01-14 | slideSettingsAPI実装例追加                            |
| 1.1.0      | 2026-01-13 | historyAPI実装例追加                                  |
| 1.0.0      | 2026-01-01 | 初版作成                                              |

---

## 関連ドキュメント

- [セキュリティ実装概要](./security-implementation.md)
- [入力バリデーション](./security-input-validation.md)
- [デプロイメント](./deployment.md)
