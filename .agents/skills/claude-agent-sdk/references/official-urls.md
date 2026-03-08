# 公式リソースURL

Claude Agent SDKの最新情報を取得するための公式リソース一覧。

## 公式ドキュメント

| カテゴリ           | URL                                                                 |
| ------------------ | ------------------------------------------------------------------- |
| Overview           | https://platform.claude.com/docs/en/agent-sdk/overview              |
| Quickstart         | https://platform.claude.com/docs/en/agent-sdk/quickstart            |
| TypeScript SDK     | https://platform.claude.com/docs/en/agent-sdk/typescript            |
| TypeScript V2 Preview | https://platform.claude.com/docs/en/agent-sdk/typescript-v2-preview |
| Hooks              | https://platform.claude.com/docs/en/agent-sdk/hooks                 |
| Permissions        | https://platform.claude.com/docs/en/agent-sdk/permissions           |
| MCP Integration    | https://platform.claude.com/docs/en/agent-sdk/mcp                   |
| Streaming vs Single | https://platform.claude.com/docs/en/agent-sdk/streaming-vs-single-mode |
| Secure Deployment  | https://platform.claude.com/docs/en/agent-sdk/secure-deployment     |
| Hosting            | https://platform.claude.com/docs/en/agent-sdk/hosting               |

## GitHub リポジトリ

| リポジトリ           | URL                                                          |
| -------------------- | ------------------------------------------------------------ |
| TypeScript SDK       | https://github.com/anthropics/claude-agent-sdk-typescript    |
| Python SDK           | https://github.com/anthropics/claude-agent-sdk-python        |
| Demos                | https://github.com/anthropics/claude-agent-sdk-demos         |
| CHANGELOG            | https://github.com/anthropics/claude-agent-sdk-typescript/blob/main/CHANGELOG.md |

## npm パッケージ

| パッケージ                      | URL                                                           |
| ------------------------------- | ------------------------------------------------------------- |
| @anthropic-ai/claude-agent-sdk  | https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk  |

## ブログ記事

| 記事                  | URL                                                                              |
| --------------------- | -------------------------------------------------------------------------------- |
| Engineering Blog      | https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk |

## 調査ワークフロー

### 定期確認（推奨頻度: 週次）

1. **CHANGELOG確認**: GitHub TypeScript SDKのCHANGELOGで破壊的変更を確認
2. **npm確認**: 最新バージョンとリリースノートを確認
3. **ドキュメント確認**: 公式ドキュメントで新機能/廃止機能を確認

### 調査優先順位

| 優先度 | 対象                     | 理由                       |
| ------ | ------------------------ | -------------------------- |
| 高     | CHANGELOG                | 破壊的変更の早期検知       |
| 高     | TypeScript V2 Preview    | 次期API仕様の把握          |
| 中     | Hooks ドキュメント       | 新規フックイベントの追加   |
| 中     | Secure Deployment        | セキュリティベストプラクティス更新 |
| 低     | Demos リポジトリ         | 実装パターンの参考         |

### fetch-latest-info.mjs 使用方法

```bash
# 全URLの最新情報を取得
node .claude/skills/claude-agent-sdk/scripts/fetch-latest-info.mjs

# 特定カテゴリのみ
node .claude/skills/claude-agent-sdk/scripts/fetch-latest-info.mjs --category docs
node .claude/skills/claude-agent-sdk/scripts/fetch-latest-info.mjs --category github
node .claude/skills/claude-agent-sdk/scripts/fetch-latest-info.mjs --category npm
```
