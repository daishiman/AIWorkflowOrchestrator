# アーキテクチャパターン設計

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

本ドキュメントはAIWorkflowOrchestratorプロジェクトのアーキテクチャパターンのインデックスです。
各パターンは以下の分割ドキュメントで詳細を定義しています。

---

## ドキュメント構成

| カテゴリ               | ファイル                                                     | 説明                                   |
| ---------------------- | ------------------------------------------------------------ | -------------------------------------- |
| 機能追加パターン       | [arch-feature-addition.md](./arch-feature-addition.md)       | Web機能追加の手順とベストプラクティス  |
| Electronサービス       | [arch-electron-services.md](./arch-electron-services.md)     | Environment Backend、スキル管理        |
| 状態管理               | [arch-state-management.md](./arch-state-management.md)       | Zustand Slice、chatEditSlice           |
| Claude CLI連携         | [arch-claude-cli.md](./arch-claude-cli.md)                   | CLI連携、Renderer API                  |
| IPC・永続化            | [arch-ipc-persistence.md](./arch-ipc-persistence.md)         | IPCハンドラ登録、会話履歴永続化        |
| UIコンポーネント       | [arch-ui-components.md](./arch-ui-components.md)             | Monaco Diff Editor                     |

---

## パターン概要

### 機能追加パターン

Web機能（apps/web/src/features/）を追加する際の標準手順。

- フォルダ構成: schema.ts, executor.ts, executor.test.ts
- Zodによる入出力スキーマ定義
- IWorkflowExecutorインターフェース実装

📖 詳細: [arch-feature-addition.md](./arch-feature-addition.md)

### Electron Main Process サービス

デスクトップアプリのバックエンドサービス群。

| サービス           | 責務                               |
| ------------------ | ---------------------------------- |
| EnvironmentService | HTMLコードブロック抽出・サニタイズ |
| SkillService       | スキルスキャン・インポート管理     |
| PermissionResolver | 権限リクエスト管理                 |

📖 詳細: [arch-electron-services.md](./arch-electron-services.md)

### 状態管理パターン

Zustandを使用したRenderer側の状態管理。

| Slice名        | 責務                 |
| -------------- | -------------------- |
| uiSlice        | UI状態               |
| authSlice      | 認証状態             |
| chatSlice      | チャット状態         |
| agentSlice     | エージェント管理     |
| chatEditSlice  | コード編集状態       |

📖 詳細: [arch-state-management.md](./arch-state-management.md)

### Claude CLI連携パターン

claude CLIコマンドとの連携パターン。

- ClaudeCliManager: Facadeパターン
- child_process.spawnによるプロセス管理
- EventEmitterによるストリーミング出力

📖 詳細: [arch-claude-cli.md](./arch-claude-cli.md)

### IPC・永続化パターン

Electron IPC通信と永続化の設計パターン。

| パターン                | 説明                       |
| ----------------------- | -------------------------- |
| IPC Handler登録         | registerAllIpcHandlers統合 |
| Repository Pattern      | SQLite（better-sqlite3）   |
| ホワイトリストセキュリティ | safeInvoke/safeOn          |

📖 詳細: [arch-ipc-persistence.md](./arch-ipc-persistence.md)

### UIコンポーネントパターン

Renderer側の共通UIコンポーネント。

- Monaco Diff Editor: サイドバイサイド差分表示
- React Lazy Loading: バンドルサイズ最適化
- WCAG 2.1 AA準拠: アクセシビリティ

📖 詳細: [arch-ui-components.md](./arch-ui-components.md)

---

## アーキテクチャ層の関係

本システムは Renderer Process と Main Process の2層構成を採用している。Renderer Process 内のコンポーネント群は Preload Bridge を経由して Main Process と IPC 通信を行う。

### Renderer Process 層

| コンポーネント種別 | 技術          | 責務                             |
| ------------------ | ------------- | -------------------------------- |
| Components         | Monaco等      | UI描画、ユーザーインタラクション |
| Stores             | Zustand       | クライアント状態管理             |
| Hooks              | React         | ロジック再利用、副作用管理       |
| Preload Bridge     | window.*API   | Main Process への安全な橋渡し    |

Renderer Process 内では Components、Stores、Hooks が相互連携し、すべてのMain Process呼び出しは Preload Bridge（window.*API）を経由する。

### Main Process 層

| コンポーネント種別 | 技術/例       | 責務                           |
| ------------------ | ------------- | ------------------------------ |
| IPC Handlers       | index.ts      | Renderer からのリクエスト受付  |
| Services           | Skill等       | ビジネスロジック実行           |
| Repositories       | SQLite        | データ永続化                   |
| Managers           | ClaudeCLI     | 外部プロセス・CLI連携          |

IPC Handlers が Renderer からのリクエストを受け取り、適切な Services / Repositories / Managers に処理を委譲する。

### 通信フロー

1. Renderer Process 内の Components / Stores / Hooks が window.*API を呼び出す
2. Preload Bridge が IPC 経由で Main Process の IPC Handlers にリクエストを送信
3. IPC Handlers が Services / Repositories / Managers に処理を委譲
4. 結果が逆経路で Renderer Process に返却される

---

## Strangler Fig パターン（Facade standalone 関数 → 責務モジュールへの段階集約）

### 概要

旧実装を一度に削除するのではなく、先に新実装を parallel に追加し、参照先を切り替えてから旧実装を安全に削除するパターン。Martin Fowler の Strangler Fig Application に由来。

### 実績: TASK-RT-06（2026-04-04）

| 操作 | Before | After |
|---|---|---|
| `sdkMessageNormalizer.ts` | 228行（normalizeSdkMessage 系） | 470行（+normalizeSkillCreatorSdkMessage/Events） |
| `RuntimeSkillCreatorFacade.ts` | スタンドアロン 9関数（215行） | 削除（import は normalizer へ） |
| テストファイル | import 元: `../RuntimeSkillCreatorFacade` | import 元: `../sdkMessageNormalizer` |

**結果**: テストは import 先を変えるだけで全て Green を維持。Facade 側は削除のみで regression リスクゼロ。

### 適用条件

- 旧実装と新実装が同じ型シグネチャを持てる場合
- モジュール境界をまたぐ場合（ファイル間）でも有効
- テストが import 元に明示的に依存している場合、import 先変更で移行完了できる

### 関連パターン

- backward-compatible export: 旧 API と新 API を一時共存させる手法
- Facade 責務分離: Facade は「所有権・コンテキスト構築」に集中し、変換ロジックは専用モジュールへ委譲

---

## 変更履歴

| Version | Date       | Changes                                                         |
| ------- | ---------- | --------------------------------------------------------------- |
| 2.2.0   | 2026-04-04 | Strangler Fig パターンを追加（TASK-RT-06 実績）                 |
| 2.1.0   | 2026-01-26 | アーキテクチャ図をコードブロックから表形式・文章に変換          |
| 2.0.0   | 2026-01-26 | 6ファイルに分割（1296行→インデックス+詳細ファイル）              |
| 1.0.0   | 2026-01-25 | 初版作成                                                        |

---

## 関連ドキュメント

- [インターフェース定義（Agent SDK）](./interfaces-agent-sdk.md)
- [API エンドポイント設計](./api-endpoints.md)
- [セキュリティ設計](./security-api-electron.md)
