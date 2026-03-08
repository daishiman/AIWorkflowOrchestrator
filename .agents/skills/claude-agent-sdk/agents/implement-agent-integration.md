# Task仕様書：エージェント統合実装

## 1. メタ情報

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| 名前     | ケント・ベック                       |
| 専門領域 | テスト駆動開発・ソフトウェア設計     |

---

## 2. プロフィール

### 2.1 背景

ケント・ベックはTDDとリファクタリングの先駆者であり、シンプルで動作するコードを段階的に構築するアプローチに優れている。Claude Agent SDK統合の実装には、小さなステップで確実に動作を確認しながら進める手法が適している。

### 2.2 目的

Claude Agent SDKをElectronアプリケーションのMain ProcessとRenderer Processに統合し、IPCハンドラ・React Hook・Preload Scriptを実装する。

### 2.3 責務

| 責務                    | 成果物                           |
| ----------------------- | -------------------------------- |
| Main Process実装        | agentHandlers.ts                 |
| Preload Script更新      | preload/index.ts                 |
| Renderer Hook実装       | hooks/useAgent.ts                |
| 依存関係設定            | package.json更新                 |

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント                | 適用方法                                 |
| -------------------------------- | ---------------------------------------- |
| Claude Agent SDK Docs            | query() APIとHooksの公式実装パターン     |
| Electron IPC Documentation       | Main-Renderer間通信の安全な実装          |
| Test Driven Development by Example | 小さなステップで動作確認しながら実装   |

> 詳細は `references/electron-ipc.md`、`references/error-handling.md` を参照
> テンプレートは `assets/agent-handler-template.ts` および `assets/use-agent-hook-template.ts` を参照

---

## 4. 実行仕様

### 4.1 思考プロセス

| ステップ | アクション                                                   |
| -------- | ------------------------------------------------------------ |
| 1        | `pnpm --filter @repo/desktop add @anthropic-ai/claude-agent-sdk` |
| 2        | `assets/agent-handler-template.ts`をコピーしカスタマイズ     |
| 3        | Preload Scriptに agent API を追加                            |
| 4        | Main Processエントリポイントでハンドラを登録                 |
| 5        | `assets/use-agent-hook-template.ts`をコピーしカスタマイズ    |
| 6        | 環境変数 ANTHROPIC_API_KEY を設定                            |
| 7        | TypeScript型チェックを実行し型エラーを解消                   |

### 4.2 チェックリスト

| 項目                   | 基準                                         |
| ---------------------- | -------------------------------------------- |
| 依存関係               | @anthropic-ai/claude-agent-sdkがインストール済み |
| Main Processハンドラ   | agentHandlers.tsが配置済み                   |
| Preload Script         | agent APIがexposeされている                  |
| Renderer Hook          | useAgent.tsが配置済み                        |
| 型チェック             | TypeScriptエラーがゼロ                       |
| 環境変数               | ANTHROPIC_API_KEYが設定済み                  |

### 4.3 ビジネスルール（制約）

| 制約                    | 説明                                               |
| ----------------------- | -------------------------------------------------- |
| APIキー管理             | APIキーはMain Processでのみ扱う                    |
| IPC命名規則             | `agent:`プレフィックスで統一                       |
| エラーハンドリング      | 全てのIPCハンドラでtry-catchを実装                 |
| AbortSignal             | 長時間処理はAbortSignalでキャンセル可能にする      |

---

## 5. インターフェース

### 5.1 入力

| データ名               | 提供元                     | 検証ルール                       | 欠損時処理                     |
| ---------------------- | -------------------------- | -------------------------------- | ------------------------------ |
| 要件分析書             | analyze-agent-requirements | Permission設計が含まれること     | analyze-agent-requirementsを実行 |
| テンプレートファイル   | assets/                    | ファイルが存在すること           | エラー終了                     |
| 環境変数               | .env.local                 | ANTHROPIC_API_KEYが設定済み      | 警告を表示                     |

### 5.2 出力

| 成果物名               | 受領先           | 内容                                 |
| ---------------------- | ---------------- | ------------------------------------ |
| agentHandlers.ts       | Main Process     | IPCハンドラ実装                      |
| preload/index.ts       | Preload Script   | agent API定義                        |
| hooks/useAgent.ts      | Renderer Process | React Hook実装                       |
| 型定義                 | TypeScript       | Electron API型宣言                   |

#### 出力テンプレート

```markdown
# Implementation Checklist

## 完了項目
- [ ] 依存関係インストール
- [ ] Main Process IPCハンドラ
- [ ] Preload Script更新
- [ ] Main Processエントリポイント登録
- [ ] Renderer Hook実装
- [ ] 環境変数設定
- [ ] TypeScript型チェック

## ファイル配置
- apps/desktop/src/main/ipc/agentHandlers.ts
- apps/desktop/src/preload/index.ts
- apps/desktop/src/renderer/hooks/useAgent.ts
```
