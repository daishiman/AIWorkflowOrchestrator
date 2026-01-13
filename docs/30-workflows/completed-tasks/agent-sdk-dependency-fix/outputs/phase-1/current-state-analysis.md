# 現状調査レポート - Agent SDK 依存関係修正

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | AGENT-SDK-DEP-FIX                       |
| Phase      | 1 - 要件定義                            |
| 作成日     | 2026-01-13                              |
| ステータス | 完了                                    |
| ブランチ   | docs/task-spec-agent-sdk-dependency-fix |

---

## エラー概要

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@anthropic-ai/claude-agent-sdk'
imported from /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/apps/desktop/out/main/index.js
```

**発生タイミング**: Electronアプリ起動時（Main Process初期化）

---

## 調査結果

### 1. パッケージインストール状態

| 確認項目                                   | 結果          | 詳細                           |
| ------------------------------------------ | ------------- | ------------------------------ |
| `apps/desktop/package.json` 宣言           | ✅ 存在       | `"^0.2.5"` で宣言済み          |
| `pnpm-lock.yaml` エントリ                  | ✅ 存在       | `0.2.5(zod@4.3.5)` で記載      |
| `node_modules/@anthropic-ai/` ディレクトリ | ❌ 存在しない | パッケージ未インストール       |
| `apps/desktop/node_modules/@anthropic-ai/` | ❌ 存在しない | ローカルnode_modulesにも未存在 |
| npm registry                               | ✅ 存在       | 最新版 0.2.6                   |

### 2. ビルド出力確認

**ファイル**: `apps/desktop/out/main/index.js`

```javascript
// 行19
import { query } from "@anthropic-ai/claude-agent-sdk";
```

- ビルド後のファイルにESM import文が残存
- `externalizeDepsPlugin()` により外部化されている
- 実行時にパッケージが見つからない

### 3. electron-vite設定

**ファイル**: `apps/desktop/electron.vite.config.ts`

```typescript
main: {
  plugins: [externalizeDepsPlugin()],
  // ...
}
```

- `externalizeDepsPlugin()` が `package.json` の依存関係を外部化
- SDKパッケージはバンドルされず、import文のまま出力される
- 外部化されたパッケージは `node_modules` に存在する必要がある

### 4. SDKの使用箇所

| ファイル                                                   | インポート                                  | 用途                |
| ---------------------------------------------------------- | ------------------------------------------- | ------------------- |
| `packages/shared/src/agent/agent-client.ts:6`              | `import ClaudeSDK from "@anthropic-ai/..."` | SDK本体のインポート |
| `packages/shared/src/agent/__tests__/agent-client.test.ts` | `vi.mock("@anthropic-ai/...")`              | テスト用モック      |
| `apps/desktop/vitest.config.ts`                            | alias設定でモックに置き換え                 | テスト時のモック    |

### 5. テスト環境との差異

| 環境   | SDK解決方法                                         | 状態    |
| ------ | --------------------------------------------------- | ------- |
| テスト | vitest.config.ts のaliasでモックファイルに置き換え  | ✅ 動作 |
| ビルド | externalizeDepsPluginで外部化（node_modulesを参照） | ❌ 失敗 |
| 開発   | electron-vite devでホットリロード                   | 要確認  |

---

## 根本原因

### 特定された根本原因

**pnpmワークスペースにおける依存関係解決の問題**

1. `apps/desktop/package.json` にSDKを宣言
2. `packages/shared/src/agent/agent-client.ts` でSDKをimport
3. しかし `packages/shared/package.json` にはSDKの依存宣言がない
4. pnpmのストリクトな依存解決により、sharedパッケージからの参照が解決されない

### 副次的要因

| 要因                  | 説明                                                       |
| --------------------- | ---------------------------------------------------------- |
| externalizeDepsPlugin | 依存関係を外部化するため、node_modulesに存在が必須         |
| pnpm strict mode      | 幽霊依存関係を許可しない厳密なモジュール解決               |
| モノレポ構成          | packages/shared が実際に使用するパッケージを宣言していない |

---

## 影響範囲

### 影響を受けるコンポーネント

| コンポーネント      | 影響        | 詳細                             |
| ------------------- | ----------- | -------------------------------- |
| Electronアプリ起動  | ❌ 失敗     | Main Process初期化時にクラッシュ |
| Agent IPC Handler   | ❌ 使用不可 | IPCハンドラが登録されない        |
| AgentSDKPage        | ❌ 使用不可 | UI側からのクエリが実行不可       |
| AgentView/Skill機能 | ⚠️ 部分的   | Agent連携機能が使用不可          |
| 単体テスト          | ✅ 正常     | モックにより動作                 |
| E2Eテスト           | ❌ 失敗     | 実アプリが起動しない             |

### 影響を受けないコンポーネント

| コンポーネント        | 理由                         |
| --------------------- | ---------------------------- |
| Webアプリ             | Agent SDKを使用していない    |
| UI/共通コンポーネント | Agent機能に依存しない        |
| Vitestテスト          | モックが適切に設定されている |

---

## 推奨修正方針

### 方針A: packages/sharedにSDK依存を追加（推奨）

**実施内容**:

1. `packages/shared/package.json` に `@anthropic-ai/claude-agent-sdk` を追加
2. `pnpm install` を実行

**メリット**:

- 最小限の変更
- pnpmのベストプラクティスに準拠
- 依存関係の明示化

**デメリット**:

- 両方のpackage.jsonで管理が必要

### 方針B: electron-vite設定でSDKをバンドル

**実施内容**:

1. `externalizeDepsPlugin()` のオプションでSDKを除外
2. SDKをビルドに含める

**メリット**:

- node_modulesへの依存を削減

**デメリット**:

- バンドルサイズ増加
- ネイティブモジュールの問題リスク

### 方針C: SDKの遅延読み込み

**実施内容**:

1. 動的インポートに変更
2. SDKが存在しない場合のフォールバック実装

**メリット**:

- SDK未インストール時も起動可能

**デメリット**:

- 実装複雑化
- 型安全性低下

---

## 結論

**推奨**: 方針A（packages/sharedにSDK依存を追加）

根本原因はpnpmのストリクトな依存解決ポリシーに起因する。
`packages/shared` で使用するパッケージは、同パッケージのpackage.jsonで明示的に宣言する必要がある。

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-13 | 初版作成 |
