# アーキテクチャ設計書 - Agent SDK 依存関係修正

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | AGENT-SDK-DEP-FIX                       |
| Phase      | 2 - 設計                                |
| 作成日     | 2026-01-13                              |
| ステータス | 完了                                    |
| ブランチ   | docs/task-spec-agent-sdk-dependency-fix |

---

## 根本原因の確認

### 問題の本質

```
packages/shared/src/agent/agent-client.ts:6
import ClaudeSDK from "@anthropic-ai/claude-agent-sdk";
```

`@anthropic-ai/claude-agent-sdk` が `packages/shared/package.json` の dependencies に宣言されていない。

### pnpm の依存解決動作

| 設定                 | 値         | 影響                                       |
| -------------------- | ---------- | ------------------------------------------ |
| `.npmrc` node-linker | `isolated` | 各パッケージに完全なnode_modulesを作成     |
| pnpm strict mode     | デフォルト | 宣言されていない依存関係へのアクセスを禁止 |
| workspace protocol   | 使用       | `workspace:*` でパッケージ間参照           |

---

## 修正方針

### 推奨方針: packages/shared に依存関係を追加

**修正内容**:

1. `packages/shared/package.json` の dependencies に `@anthropic-ai/claude-agent-sdk` を追加
2. `pnpm install` を実行して依存関係を解決

**変更ファイル**:

- `packages/shared/package.json` （1ファイルのみ）

### 方針比較

| 方針                        | 複雑度 | リスク | 推奨度 |
| --------------------------- | ------ | ------ | ------ |
| A: shared に依存追加        | 低     | 低     | ★★★★★  |
| B: electron-vite でバンドル | 中     | 中     | ★★☆☆☆  |
| C: 動的インポート           | 高     | 中     | ★☆☆☆☆  |

### 方針A の詳細（採用）

```jsonc
// packages/shared/package.json への変更
{
  "dependencies": {
    // 既存の依存関係...
    "@anthropic-ai/claude-agent-sdk": "^0.2.5", // 追加
  },
}
```

**メリット**:

- 最小限の変更（1行追加）
- pnpmのベストプラクティスに準拠
- 依存関係の明示化
- バンドルサイズへの影響なし

**デメリット**:

- desktop と shared の両方で SDK バージョンを管理する必要あり

### 方針B の詳細（不採用）

`electron.vite.config.ts` で SDK をバンドル対象にする。

```typescript
// 変更案（不採用）
main: {
  plugins: [externalizeDepsPlugin({
    exclude: ['@anthropic-ai/claude-agent-sdk']
  })],
}
```

**不採用理由**:

- SDK（71.8MB）をバンドルすることでバンドルサイズが大幅に増加
- ネイティブモジュールの問題リスク

### 方針C の詳細（不採用）

動的インポートでSDKを読み込み、存在しない場合はフォールバック。

**不採用理由**:

- 実装複雑化
- 型安全性低下
- 本質的な問題解決ではない

---

## 設計詳細

### 変更箇所

| ファイル                       | 変更内容                 |
| ------------------------------ | ------------------------ |
| `packages/shared/package.json` | dependencies に SDK 追加 |

### 変更による影響

| コンポーネント           | 変更後の動作                     |
| ------------------------ | -------------------------------- |
| `pnpm install`           | SDK がnode_modulesにインストール |
| `packages/shared` ビルド | SDK を外部依存として参照         |
| `apps/desktop` ビルド    | electron-vite で外部化維持       |
| `apps/desktop` 実行時    | node_modules から SDK 解決       |

### モジュール解決フロー（修正後）

```
1. Electron 起動
   ↓
2. apps/desktop/out/main/index.js 実行
   ↓
3. import "@anthropic-ai/claude-agent-sdk"
   ↓
4. node_modules/@anthropic-ai/claude-agent-sdk を参照
   ↓
5. SDK 正常読み込み ✅
```

---

## 統合ポイント

### SDK → Main Process

| API       | 契約                            |
| --------- | ------------------------------- |
| `query()` | prompt, options → Promise<void> |
| `abort()` | void → void                     |

### Main → Renderer (IPC)

| チャンネル      | ペイロード                          |
| --------------- | ----------------------------------- |
| `agent:message` | `SDKMessage { type, content, ... }` |

### エラー伝播

```
SDK エラー
  ↓ AgentClient でラップ
AgentError (AgentQueryError, AgentTimeoutError, etc.)
  ↓ IPC 経由でシリアライズ
Renderer で deserialize
  ↓
UI でエラー表示
```

---

## 検証計画

### Phase 5 実装後の検証項目

1. `pnpm install` が正常完了
2. `node_modules/@anthropic-ai/claude-agent-sdk` が存在
3. `pnpm --filter @repo/desktop build` が正常完了
4. `pnpm --filter @repo/desktop dev` でアプリ起動
5. Agent IPC チャンネルが応答

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-13 | 初版作成 |
