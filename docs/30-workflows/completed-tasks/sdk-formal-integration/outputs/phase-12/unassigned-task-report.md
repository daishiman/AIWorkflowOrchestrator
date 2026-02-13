# Phase 12: 未タスク検出レポート

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| タスクID | TASK-9B-I-SDK-FORMAL-INTEGRATION |
| Phase    | 12（未タスク検出）               |
| 作成日   | 2026-02-12                       |

---

## 1. 検出結果

### 検出された未タスク: 1件

#### UT-9B-I-001: カスタム型宣言ファイルと SDK 実型の共存整理

- **概要**: `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts` は SDK がインストールされているため TypeScript に無視されている。この `declare module` ファイルの役割を整理し、不要であれば削除すべき。
- **影響**: 低（現在は実害なし。開発者の混乱の原因になり得る）
- **関連ファイル**: `packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts`
- **優先度**: 低

## 2. 検出方法

- `as any` 除去作業中に、カスタム `declare module` が SDK 実型に無視されることを発見
- `agent-client.ts` が `ClaudeSDK` default export を使用しているため、完全削除の影響調査が必要
