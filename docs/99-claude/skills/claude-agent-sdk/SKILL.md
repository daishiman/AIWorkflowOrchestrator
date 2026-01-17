---
name: claude-agent-sdk
description: |
  Claude Agent SDK（@anthropic-ai/claude-agent-sdk）を使用したエージェント統合の実装を専門とするスキル。
  query() API、Hooksシステム、Permission Control、Electron統合、ストリーミング処理を支援します。

  Anchors:
  • Claude Agent SDK Official Docs / 適用: SDK API、Hooks、Permissions / 目的: 公式パターンに準拠した実装
  • Electron IPC Best Practices / 適用: Main-Renderer間通信 / 目的: セキュアなプロセス間通信
  • TypeScript Handbook / 適用: 型定義、ジェネリクス / 目的: 型安全なSDK統合

  Trigger:
  Claude Agent SDKを使用したエージェント機能実装、query() APIストリーミング処理、Hooksシステム実装、Electron統合、Permission Control設計、MCP統合を行う場合に使用。
  claude-agent-sdk, query API, PreToolUse, PostToolUse, PermissionRequest, Electron IPC, MCP, ストリーミング, 権限制御

allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

# Claude Agent SDK

## 概要

Claude Agent SDK（`@anthropic-ai/claude-agent-sdk`）を使用したエージェント統合の実装を専門とするスキル。query() API、Hooksシステム、Permission Control、Electron統合、ストリーミング処理を支援します。

**対象言語**: TypeScript のみ

## 最新情報取得

SDK情報は頻繁に更新されるため、実装前に最新情報を確認してください。

```bash
# 最新情報を取得
node .claude/skills/claude-agent-sdk/scripts/fetch-latest-info.mjs

# npmパッケージ情報のみ
node .claude/skills/claude-agent-sdk/scripts/fetch-latest-info.mjs --category npm
```

詳細なURL一覧は `references/official-urls.md` を参照してください。

## ワークフロー

### Phase 1: 要件の明確化と設計方針の決定

**目的**: エージェント統合の要件を理解し、適切なパターンを選定する

**アクション**:

1. 使用するツール（Read, Edit, Bash等）を特定
2. Permission Control戦略を決定
3. `references/query-api.md` で基礎パターンを確認
4. `references/permission-control.md` で権限設計を確認

**Task**: `agents/analyze-agent-requirements.md` を参照

### Phase 2: SDK統合の実装

**目的**: query() APIとHooksを実装し、エージェント機能を構築する

**アクション**:

1. `assets/agent-handler-template.ts` を参照してIPCハンドラを実装
2. `references/hooks-system.md` でHooksパターンを確認
3. `references/electron-ipc.md` でElectron統合パターンを確認
4. ストリーミング処理とエラーハンドリングを実装

**Task**: `agents/implement-agent-integration.md` を参照

### Phase 3: 検証と記録

**目的**: 成果物の品質を確認し、ナレッジを記録する

**アクション**:

1. `scripts/validate-agent-setup.mjs` で設定の検証
2. Permission Controlのテスト
3. 実装パターンのドキュメント化

**Task**: `agents/validate-agent-setup.md` を参照

## Task仕様ナビ

| Task                   | 概要                                | 対応する Phase | リソース                                |
| ---------------------- | ----------------------------------- | -------------- | --------------------------------------- |
| query() API基本実装    | ストリーミングメッセージ処理の基本  | Phase 1, 2     | query-api.md, agent-handler-template.ts |
| Hooks実装              | PreToolUse/PostToolUse/Permission   | Phase 2        | hooks-system.md                         |
| Permission Control設計 | 権限ルールの設計と実装              | Phase 1, 2     | permission-control.md                   |
| Electron IPC統合       | Main-Renderer間のAgent通信          | Phase 2        | electron-ipc.md                         |
| エラーハンドリング     | AbortSignal、タイムアウト、リトライ | Phase 2        | error-handling.md                       |
| MCP統合                | MCPサーバーとの連携                 | Phase 2, 3     | mcp-integration.md                      |
| セキュリティ設計       | サンドボックス、ホスティング        | Phase 2, 3     | security-sandboxing.md                  |

## ベストプラクティス

### すべきこと

- Permission Rulesで適切な権限制御を設計する
- PreToolUseフックで危険なコマンドをブロックする
- AbortSignalを使用してタイムアウト処理を実装する
- IPCチャネル名を一貫した命名規則で設計する
- ストリーミングメッセージを適切にUI更新に反映する
- エラー発生時のフォールバック処理を実装する

### 避けるべきこと

- permissionMode: 'auto' を本番環境で使用する
- Hookなしで危険なツール（Bash等）を許可する
- Main ProcessでUIロジックを処理する
- ストリーミング中のエラーを無視する
- APIキーをRenderer Processで扱う
- signal.abortedのチェックを省略する

## クイックリファレンス

### パッケージインストール

```bash
pnpm add @anthropic-ai/claude-agent-sdk
```

### 基本使用例

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

const conversation = query({
  prompt: "Hello, Claude!",
  options: {
    tools: ["Read", "Edit"],
    permissionMode: "ask",
  },
});

for await (const message of conversation.stream()) {
  console.log(message);
}
```

### Hook実装例

```typescript
const options = {
  hooks: {
    PreToolUse: async (input, toolUseID, { signal }) => {
      if (input.toolName === "Bash" && input.args.command?.includes("rm -rf")) {
        return {
          proceed: false,
          message: "危険なコマンドは許可されていません",
        };
      }
      return { proceed: true };
    },
  },
};
```

## リソース参照

### 責務別ドキュメント

```bash
# query() API、SDKMessage型、ストリーミング
cat .claude/skills/claude-agent-sdk/references/query-api.md

# Hooksシステム（全イベント、実装パターン）
cat .claude/skills/claude-agent-sdk/references/hooks-system.md

# Permission Control（4層システム、ルール）
cat .claude/skills/claude-agent-sdk/references/permission-control.md

# Electron IPC統合
cat .claude/skills/claude-agent-sdk/references/electron-ipc.md

# エラーハンドリング
cat .claude/skills/claude-agent-sdk/references/error-handling.md

# MCP統合
cat .claude/skills/claude-agent-sdk/references/mcp-integration.md

# セキュリティとサンドボックス
cat .claude/skills/claude-agent-sdk/references/security-sandboxing.md

# 公式URL一覧
cat .claude/skills/claude-agent-sdk/references/official-urls.md
```

### テンプレート参照

```bash
cat .claude/skills/claude-agent-sdk/assets/agent-handler-template.ts
cat .claude/skills/claude-agent-sdk/assets/use-agent-hook-template.ts
```

### スクリプト実行

```bash
# 最新情報取得
node .claude/skills/claude-agent-sdk/scripts/fetch-latest-info.mjs --help

# 設定検証
node .claude/skills/claude-agent-sdk/scripts/validate-agent-setup.mjs --help
```

## 関連ドキュメント

| ドキュメント                  | パス                                                                               | 説明                                |
| ----------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------- |
| Agent SDKインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`        | 統合システム設計仕様（型定義、IPC） |
| APIリファレンス               | `docs/30-workflows/agent-sdk-integration/outputs/phase-12/api-reference.md`        | 公開API詳細リファレンス             |
| 実装ガイド                    | `docs/30-workflows/agent-sdk-integration/outputs/phase-12/implementation-guide.md` | 概念的・技術的実装ガイド            |

## 変更履歴

| Version | Date       | Changes                                        |
| ------- | ---------- | ---------------------------------------------- |
| 2.1.0   | 2026-01-08 | 関連ドキュメントセクション追加、aiworkflow連携 |
| 2.0.0   | 2026-01-08 | 責務ベースに再構成、最新情報取得フロー追加     |
| 1.0.0   | 2026-01-08 | 初期バージョン作成                             |
