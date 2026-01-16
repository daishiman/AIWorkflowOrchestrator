# SDK 依存関係修正 - 実装ガイド

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | AGENT-SDK-DEP-FIX                       |
| Phase      | 12 - ドキュメント更新                   |
| 作成日     | 2026-01-13                              |
| ステータス | 完了                                    |
| ブランチ   | docs/task-spec-agent-sdk-dependency-fix |

---

# Part 1: 概念的説明

## これは何？

### 図書館の蔵書管理に例えると

想像してください。あなたは大きな図書館の司書（しちょ）です。

```
図書館（プロジェクト）
├── 1F 一般書コーナー（apps/desktop）
│   └── 蔵書目録A（package.json）→「AI辞典を使います」と記載
│
└── 2F 参考書コーナー（packages/shared）
    └── 蔵書目録B（package.json）→ 記載なし ← ここが問題！
    └── 実際の作業マニュアル（agent-client.ts）→「AI辞典」を使っている
```

**問題**: 2Fの参考書コーナーで「AI辞典」を使っているのに、
蔵書目録Bには「AI辞典を使います」と書いてありませんでした。

厳格な図書館ルール（pnpm の strict mode）では、
「蔵書目録に書いてない本は使えません！」と怒られてしまいます。

### 解決方法

蔵書目録B（packages/shared/package.json）に
「AI辞典（@anthropic-ai/claude-agent-sdk）を使います」と1行追加するだけ！

```
修正前                           修正後
┌─────────────────────────┐     ┌─────────────────────────┐
│ 蔵書目録B               │     │ 蔵書目録B               │
│                         │     │                         │
│ 使う本:                 │     │ 使う本:                 │
│ - 型定義辞典            │ →   │ - 型定義辞典            │
│ - バリデーション本      │     │ - バリデーション本      │
│                         │     │ - AI辞典 ← 追加！      │
└─────────────────────────┘     └─────────────────────────┘
```

---

## なぜこの問題が起きた？

### 開発時と本番時の違い

```
開発時（テスト実行時）
┌───────────────────────────────────────────────────┐
│                    vitest                          │
│  「AI辞典？ダミー本で代用しておくね」（モック）     │
│         ↓                                         │
│   テストは成功！✓                                 │
└───────────────────────────────────────────────────┘

本番時（アプリ起動時）
┌───────────────────────────────────────────────────┐
│                   Electron                         │
│  「AI辞典はどこ？蔵書目録にないから探せない！」    │
│         ↓                                         │
│   エラー: ERR_MODULE_NOT_FOUND ✗                  │
└───────────────────────────────────────────────────┘
```

テスト時は「ダミー本」で代用していたため、
実際の本がないことに気づかなかったのです。

---

## どう解決した？

### たった1行の追加

```json
// packages/shared/package.json

{
  "dependencies": {
    "zod": "^3.23.8",
    "@anthropic-ai/claude-agent-sdk": "^0.2.5" // ← この1行を追加
  }
}
```

**追加後の効果**:

1. `pnpm install` で AI辞典（SDK）がダウンロードされる
2. 蔵書目録に記載があるため、Electron が本を見つけられる
3. アプリが正常に起動する

---

## 用語集（Part 1）

| 用語                                           | 読み方                           | 意味                                       |
| ---------------------------------------------- | -------------------------------- | ------------------------------------------ |
| SDK（Software Development Kit）                | エスディーケー                   | 開発に必要な道具セット                     |
| pnpm（Performant npm）                         | ピーエヌピーエム                 | パッケージ管理ツール                       |
| package.json（パッケージジェイソン）           | パッケージドットジェイソン       | 依存関係を記載する設定ファイル             |
| ERR_MODULE_NOT_FOUND（Error Module Not Found） | エラーモジュールノットファウンド | モジュールが見つからないエラー             |
| dependencies（ディペンデンシーズ）             | ディペンデンシーズ               | このプロジェクトが必要とする外部パッケージ |

---

# Part 2: 技術的詳細

## アーキテクチャ

### モノレポ構成と依存関係

```
AIWorkflowOrchestrator/
├── apps/
│   └── desktop/                          # Electronアプリ
│       ├── package.json                  # SDK依存あり（既存）
│       │   └── dependencies:
│       │       └── "@repo/shared": "workspace:*"
│       │       └── "@anthropic-ai/claude-agent-sdk": "^0.2.5"
│       └── src/
│           └── main/
│               └── agent/
│                   └── agent-handler.ts  # AgentClient を使用
│
├── packages/
│   └── shared/                           # 共有パッケージ
│       ├── package.json                  # SDK依存なし → あり（修正）
│       │   └── dependencies:
│       │       └── "@anthropic-ai/claude-agent-sdk": "^0.2.5" ← 追加
│       └── src/
│           └── agent/
│               └── agent-client.ts       # SDK を直接 import
│                   └── import ClaudeSDK from "@anthropic-ai/claude-agent-sdk"
│
└── pnpm-workspace.yaml                   # ワークスペース設定
```

### 依存関係の流れ

```
┌─────────────────────────────────────────────────────────────────┐
│                        pnpm install                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    pnpm-lock.yaml 更新                           │
│  @anthropic-ai/claude-agent-sdk@0.2.5 → node_modules に配置     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 packages/shared/package.json                     │
│  dependencies: "@anthropic-ai/claude-agent-sdk": "^0.2.5"       │
│                         ↓                                        │
│  pnpm がこのパッケージからの SDK アクセスを許可                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              packages/shared/src/agent/agent-client.ts           │
│  import ClaudeSDK from "@anthropic-ai/claude-agent-sdk"         │
│                         ↓                                        │
│  正常に SDK を解決して初期化可能                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 設定詳細

### 変更前後の比較

**packages/shared/package.json（修正前）**:

```json
{
  "name": "@repo/shared",
  "dependencies": {
    "zod": "^3.23.8"
    // SDK の記載なし
  }
}
```

**packages/shared/package.json（修正後）**:

```json
{
  "name": "@repo/shared",
  "dependencies": {
    "zod": "^3.23.8",
    "@anthropic-ai/claude-agent-sdk": "^0.2.5" // 追加
  }
}
```

### electron-vite 設定（変更なし）

```typescript
// apps/desktop/electron.vite.config.ts

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(), // SDK を外部化（バンドルしない）
    ],
    build: {
      rollupOptions: {
        output: {
          format: "es", // ESM 形式で出力
        },
      },
    },
  },
});
```

**externalizeDepsPlugin の役割**:

- node_modules の依存関係をバンドルに含めない
- ビルド時間の短縮
- バンドルサイズの削減

---

## pnpm の依存解決

### node-linker 設定

```ini
# .npmrc
node-linker=isolated
```

**isolated モードの特徴**:

| 特徴               | 説明                                          |
| ------------------ | --------------------------------------------- |
| 厳格な依存解決     | package.json に宣言された依存のみアクセス可能 |
| 重複排除           | 同一バージョンの依存は1箇所に配置             |
| シンボリックリンク | node_modules 内はシンボリックリンクで構成     |
| 幽霊依存の防止     | 宣言していない依存へのアクセスを防ぐ          |

### 修正が必要だった理由

```
修正前（エラー発生）
┌─────────────────────────────────────────────────────────────┐
│ packages/shared/                                             │
│   ├── package.json（SDK 宣言なし）                           │
│   └── src/agent/agent-client.ts                             │
│         └── import ClaudeSDK from "@anthropic-ai/..."       │
│               ↓                                              │
│         pnpm: 「その依存、package.json に書いてないよ」      │
│               ↓                                              │
│         ERR_MODULE_NOT_FOUND                                 │
└─────────────────────────────────────────────────────────────┘

修正後（正常動作）
┌─────────────────────────────────────────────────────────────┐
│ packages/shared/                                             │
│   ├── package.json（SDK 宣言あり）←───────────────┐         │
│   └── src/agent/agent-client.ts                   │         │
│         └── import ClaudeSDK from "@anthropic-ai/..."       │
│               ↓                                              │
│         pnpm: 「OK、シンボリックリンク経由でアクセスしてね」 │
│               ↓                                              │
│         正常に SDK を解決                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## エラーハンドリング

### SDK 初期化失敗時のフォールバック

```typescript
// packages/shared/src/agent/agent-client.ts

export class AgentClient {
  private sdk: ClaudeSDK | null = null;
  private status: AgentStatusType = "not_initialized";

  async initialize(apiKey: string): Promise<void> {
    try {
      this.status = "initializing";
      this.sdk = new ClaudeSDK({ apiKey });
      await this.sdk.initialize();
      this.status = "initialized";
    } catch (error) {
      this.status = "error";
      // AgentInitializationError として再スロー
      throw new AgentInitializationError("SDK initialization failed", {
        cause: error,
      });
    }
  }
}
```

**フォールバック設計**:

| 状態              | アプリ動作                | Agent機能 |
| ----------------- | ------------------------- | --------- |
| SDK初期化成功     | 正常起動                  | 利用可能  |
| SDK初期化失敗     | 正常起動（Agent機能なし） | 利用不可  |
| SDKモジュールなし | 正常起動（Agent機能なし） | 利用不可  |

---

## 用語集（Part 2）

| 用語                          | 読み方                   | 意味                                  |
| ----------------------------- | ------------------------ | ------------------------------------- |
| monorepo（モノレポ）          | モノレポ                 | 複数パッケージを1リポジトリで管理     |
| workspace（ワークスペース）   | ワークスペース           | モノレポ内のパッケージ群              |
| externalize（外部化）         | エクスターナライズ       | バンドルに含めず外部依存として扱う    |
| node-linker                   | ノードリンカー           | node_modules の構築方法設定           |
| isolated（分離）              | アイソレーテッド         | 厳格な依存解決モード                  |
| symlink（シンボリックリンク） | シンボリックリンク       | ファイルへの参照リンク                |
| ghost dependency（幽霊依存）  | ゴーストディペンデンシー | 宣言なしで使える依存（pnpm では防止） |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-13 | 初版作成 |
