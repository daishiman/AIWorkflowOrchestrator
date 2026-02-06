# SDK認証基盤構築 - タスク指示書

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE    |
| タスク名     | Claude Agent SDK用認証キー管理基盤の構築 |
| 分類         | 新規基盤（セキュリティ）                 |
| 対象機能     | SDK認証・キー管理                        |
| 優先度       | 最高                                     |
| 見積もり規模 | 中規模                                   |
| ステータス   | 未実施                                   |
| 実行順序     | 01c（並列可能 — 即時着手）               |
| 発見元       | skill-system-conflict-report #16         |
| 発見日       | 2026-02-05                               |
| 関連Phase    | Phase 0（構造的断絶の解消）              |
| 関連Issue    | -                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SkillExecutor.callSDKQuery()` が Claude Agent SDK の `query()` API を呼び出す際、認証キー（`ANTHROPIC_API_KEY`）を渡していない。SDK は認証なしでは動作しないため、仮にハンドラーのルーティング（#15）を修正しても、SDK 呼び出しは必ず失敗する。

### 1.2 問題点・課題

| 問題                             | 影響                                |
| -------------------------------- | ----------------------------------- |
| 認証キー取得メカニズムが未構築   | SDK 認証が不可能                    |
| `query()` に認証キーが渡されない | 全てのSDK呼び出しが認証エラーで失敗 |
| キーのセキュア保存が未実装       | 平文保存はセキュリティ違反          |
| キー設定UIが未提供               | ユーザーがキーを入力する手段がない  |

**現在のコード** (`SkillExecutor.ts` L746-755):

```typescript
const { query } = (await import("@anthropic-ai/claude-agent-sdk")) as any;
const conversation = query({
  prompt,
  options: {
    tools: options.tools,
    permissionMode: options.permissionMode,
    signal: options.signal,
    // ← 認証キーが渡されていない
  },
});
```

### 1.3 放置した場合の影響

- **致命的**: SDK ベースのスキル実行が認証段階で100%失敗
- #15（ルーティング修正）を完了しても機能しない
- E2E テストが不可能

---

## 2. 何を達成するか（What）

### 2.1 目的

Anthropic 認証キーをセキュアに管理し、SDK `query()` 呼び出し時に渡す基盤を構築する。

### 2.2 最終ゴール

1. 認証キーを `electron.safeStorage` で暗号化保存
2. `query()` 呼び出し時に認証キーを渡す
3. キー未設定時の明確なエラーメッセージ
4. キー設定用のIPC API提供

### 2.3 スコープ

#### 含むもの

- 認証キーの暗号化保存・復号取得メカニズム（Main Process）
- SkillExecutor への認証キー注入
- キー設定・検証用 IPC ハンドラー
- キー未設定時のバリデーション

#### 含まないもの

- キー設定UI（別タスクで対応）
- OAuth/SSO 認証フロー
- 複数キーの管理

### 2.4 成果物

| 成果物                    | 説明                        |
| ------------------------- | --------------------------- |
| 認証キー管理サービス      | 暗号化保存・復号・検証      |
| 修正された SkillExecutor  | 認証キーを `query()` に渡す |
| 認証キー用 IPC ハンドラー | 設定・検証・削除            |
| Preload API 拡張          | 認証キー操作用ブリッジ      |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- なし（独立して着手可能）

### 3.2 依存タスク

- なし（Layer 0 の独立タスク）

### 3.3 必要な知識

- Electron `safeStorage` API
- Claude Agent SDK `query()` API のオプション
- Electron IPC ハンドラー設計

### 3.4 推奨アプローチ

1. 認証キー管理サービスを Main Process に作成
2. `safeStorage.encryptString()` / `decryptString()` で暗号化保存
3. SkillExecutor のコンストラクタまたは execute() にキー取得を組み込み
4. IPC ハンドラーで設定・検証 API を公開

---

## 4. 実行手順

### Step 1: 認証キー管理サービス設計

#### 目的

セキュリティ原則に準拠した認証キー管理の設計

#### 手順

1. `04-electron-security.md` の認証セキュリティ原則を確認
2. `safeStorage` の利用パターンを設計
3. 保存先（`electron-store` の暗号化フィールド）を決定

**設計案**:

```typescript
// main/services/AuthKeyService.ts
class AuthKeyService {
  private store: ElectronStore;

  async setKey(key: string): Promise<void> {
    const encrypted = safeStorage.encryptString(key);
    this.store.set("anthropic_auth_key", encrypted.toString("base64"));
  }

  async getKey(): Promise<string | null> {
    const encrypted = this.store.get("anthropic_auth_key");
    if (!encrypted) return null;
    return safeStorage.decryptString(Buffer.from(encrypted, "base64"));
  }

  async validateKey(key: string): Promise<boolean> {
    // Anthropic API に軽量リクエストを送信して検証
  }

  async deleteKey(): Promise<void> {
    this.store.delete("anthropic_auth_key");
  }
}
```

### Step 2: SkillExecutor への統合

#### 目的

`query()` 呼び出し時に認証キーを渡す

#### 手順

1. `callSDKQuery()` で認証キーを取得
2. `query()` のオプションにキーを追加
3. キー未設定時に明確なエラーを返す

### Step 3: IPC ハンドラー作成

#### 目的

Renderer から認証キーを設定・検証可能にする

#### 手順

1. `AUTH_KEY_SET`, `AUTH_KEY_VALIDATE`, `AUTH_KEY_DELETE`, `AUTH_KEY_EXISTS` チャンネル定義
2. ハンドラー登録
3. Preload API 拡張

### Step 4: テスト

#### 手順

1. AuthKeyService の暗号化・復号テスト
2. キー未設定時のエラーハンドリングテスト
3. SkillExecutor がキーを渡すことの検証

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 認証キーが `safeStorage` で暗号化保存される
- [ ] `query()` 呼び出し時に認証キーが渡される
- [ ] キー未設定時に明確なエラーメッセージが返る
- [ ] IPC 経由でキーの設定・検証・削除が可能

### 品質要件

- [ ] 全テストが PASS
- [ ] キーが平文でログ・ストレージに露出しない
- [ ] `04-electron-security.md` の原則に準拠

### セキュリティ要件

- [ ] 認証キーは Main Process のみでアクセス（Renderer に送信しない）
- [ ] ログにキーが含まれない
- [ ] `safeStorage` が利用不可の環境でのフォールバック

---

## 6. 検証方法

### テストケース

1. キーの設定 → 暗号化保存 → 復号取得
2. キー未設定時の SDK 呼び出し → 適切なエラー
3. 無効なキーでの検証 → `false` 返却
4. キー削除 → 再取得で `null`

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                             |
| ---------------------------- | ------ | -------- | -------------------------------- |
| safeStorage が利用不可の環境 | 高     | 低       | 環境変数フォールバック           |
| キーの漏洩                   | 高     | 低       | Main Process 限定、ログ除外      |
| SDK のオプション仕様変更     | 中     | 低       | SDK バージョン固定、テストで検証 |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/rules/04-electron-security.md`（認証セキュリティ）
- `apps/desktop/src/main/services/skill/SkillExecutor.ts` L746-755
- Electron `safeStorage` API ドキュメント
- Claude Agent SDK `query()` API リファレンス

### 関連タスク

- TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING（本タスク完了が前提）
- TASK-9B-I-SDK-FORMAL-INTEGRATION（SDK正式統合時にキー渡し方を調整）

---

## 9. 備考

### 発見経緯

水平思考（SDKの利用要件から逆算して実装を検証）により発見。`query()` のコードを読んだだけでは「何かが足りない」ことに気づきにくく、SDKの認証要件からの逆算で欠落が明確になった。

### クリティカルパス上の位置

本タスクはクリティカルパスB（SDK基盤→ルーティング）の起点。#15（ハンドラールーティング修正）は本タスクの完了に依存する。Layer 0 に位置し、即時着手可能。

### 環境変数によるフォールバック

`safeStorage` が利用不可能な環境（一部のLinuxデスクトップ）では、環境変数 `ANTHROPIC_API_KEY` をフォールバックとして使用する設計を推奨。ただしこの場合、キーは暗号化されないため、ユーザーへの警告表示が必要。
