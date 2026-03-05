# Phase 1 要件定義書

## 対象

- タスクID: TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001
- 不具合要約: `Renderer preflight` は API キー有効と判定するが、`Main/SkillExecutor` 側は `AuthKeyService` 未注入の経路で動作し、`skill:execute` が `AUTHENTICATION_ERROR` で失敗し得る。

## 現状観測（SubAgent分割）

### SubAgent-A（Main/IPC）

- `apps/desktop/src/main/ipc/skillHandlers.ts` の `registerSkillHandlers()` は `new SkillExecutor(mainWindow)` で生成しており、`AuthKeyService` を渡していない。
- `apps/desktop/src/main/ipc/index.ts` では `registerSkillHandlers(...)` の後に `AuthKeyService` を生成しており、同一インスタンス共有経路が存在しない。

### SubAgent-B（Preload/API契約）

- `api-ipc-agent.md` では `skill:execute` 失敗時に `errorCode?: string` を返却し、`AUTHENTICATION_ERROR` 伝搬を必須としている。
- `api-ipc-system.md` では `auth-key:exists` が `store -> ANTHROPIC_API_KEY env` 順で判定する契約。

### SubAgent-C（Renderer/UX）

- `skillExecutionAuthPreflight.ts` は `window.electronAPI.authKey.exists()` を用いて事前判定する。
- 事前判定 OK でも Main 側が異なるキー取得経路を使うと UX 上「事前OK→実行失敗」が起きる。

### SubAgent-D（統合監査）

- 根因は「同一認証状態を参照すべき Main 実行経路の DI 欠落」と「初期化順序不整合」。
- 修正境界は `registerSkillHandlers` と `registerAllIpcHandlers` の配線に限定する。

## 機能要件（FR）

- FR-01: `registerSkillHandlers` は `AuthKeyService` を受け取り、`SkillExecutor` 生成時に DI する。
- FR-02: `registerAllIpcHandlers` は `AuthKeyService` を単一生成し、`registerSkillHandlers` と `registerAuthKeyHandlers`/`registerAuthModeHandlers` で共有する。
- FR-03: `SkillExecutor.getApiKey()` の優先順位（`AuthKeyService.getKey() -> process.env.ANTHROPIC_API_KEY`）を実行時に保証する。
- FR-04: `skill:execute` の認証失敗は `AUTHENTICATION_ERROR` 契約を維持する（後方互換を壊さない）。
- FR-05: `registerSkillHandlers` の既存2引数呼び出し互換は維持する（第三引数はオプショナル）。

## 非機能要件（NFR）

- NFR-01: セキュリティ
- APIキー値をログ・エラーメッセージへ露出しない。

- NFR-02: 保守性
- 認証サービスの生成箇所を重複させない。

- NFR-03: テスト容易性
- DI配線の回帰をユニットテストで検知できること。

- NFR-04: 互換性
- 既存IPCテスト群（skill/auth/ipc registration）を破壊しない。

## スコープ

### In Scope

- `apps/desktop/src/main/ipc/index.ts`
- `apps/desktop/src/main/ipc/skillHandlers.ts`
- `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`（DI配線検証追加）

### Out of Scope

- Renderer画面実装の新規追加
- AuthKeyServiceのストレージ実装変更
- 仕様外のチャネル追加

## 依存仕様

- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`
- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`

## 完了判定（Phase 1）

- 機能要件/非機能要件が矛盾なく定義済み
- 受け入れ基準へ機械判定可能な粒度で変換済み
- 設計Phaseに渡す責務境界（Main/Preload/Renderer）を明文化済み
