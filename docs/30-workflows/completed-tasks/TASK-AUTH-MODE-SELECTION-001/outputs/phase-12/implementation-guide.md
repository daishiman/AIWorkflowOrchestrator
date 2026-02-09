# 認証方式選択機能 実装ガイド

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| タスクID | TASK-AUTH-MODE-SELECTION-001 |
| 機能名   | auth-mode-selection          |
| 作成日   | 2026-02-09                   |
| 対象読者 | 初学者〜開発者               |

---

# Part 1: 概念説明（中学生レベル）

## 認証方式って何？

図書館で本を借りるとき、図書館カードを見せますよね？
これは「あなたが誰か」を確認するためです。

AIWorkflowOrchestrator でも同じように、
「あなたが本当にこのサービスを使える人か」を確認します。
これを**認証**と呼びます。

---

## 2つの認証方式

AIWorkflowOrchestrator には2つの「身分証明書」があります：

### 1. サブスクリプション認証（月額会員証）

```
┌─────────────────────────────────────┐
│  🎫 サブスクリプション会員証        │
│                                     │
│  名前: あなた                       │
│  プラン: Claude Pro                 │
│  有効期限: 自動更新                 │
│                                     │
│  💡 一度ログインすれば毎回見せなくてOK │
└─────────────────────────────────────┘
```

- **Claude の月額プラン**に入っている人向け
- Claude Code CLI でログインするだけで使える
- 毎月定額料金で使い放題

**日常の例え**: スポーツジムの月額会員証

- 一度会員になれば、毎回カードをかざすだけで入れる
- 毎月決まった料金を払う

### 2. APIキー認証（使った分だけ払う券）

```
┌─────────────────────────────────────┐
│  🔑 APIキー                         │
│                                     │
│  sk-ant-api03-xxxxxxxxxxxxxxxxxx    │
│                                     │
│  💰 使った分だけ料金がかかります     │
│  ⚠️ この番号は誰にも見せないで！    │
└─────────────────────────────────────┘
```

- **使った分だけ料金を払いたい人**向け
- 自分専用の秘密の番号（APIキー）を設定
- 使用量に応じて料金が発生

**日常の例え**: プリペイドカード

- 使う前にチャージ（お金を入れる）
- 使った分だけ残高が減る

---

## なぜ2つの方式があるの？

```
┌─────────────────────────────────────────────────────────┐
│                     どっちを選ぶ？                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  サブスクリプション認証          APIキー認証           │
│        🎫                            🔑                 │
│                                                         │
│  ・毎月定額                    ・使った分だけ          │
│  ・ログインするだけ            ・自分のキーを設定      │
│  ・Claude Proユーザー向け      ・開発者向け            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

| 状況                      | おすすめ認証方式       |
| ------------------------- | ---------------------- |
| Claude Pro を契約している | サブスクリプション認証 |
| たまにしか使わない        | APIキー認証            |
| 会社のAPIキーを使う       | APIキー認証            |
| シンプルに使いたい        | サブスクリプション認証 |

---

## 認証方式の切り替え方

```
    設定画面
    ┌───────────────────────────────────────┐
    │                                       │
    │   認証設定                            │
    │   ┌─────────────┬─────────────┐       │
    │   │サブスク認証 │ APIキー認証  │       │
    │   │    ✓       │              │       │
    │   └─────────────┴─────────────┘       │
    │                                       │
    │   ✅ 認証済み                         │
    │                                       │
    └───────────────────────────────────────┘
```

1. 設定画面を開く
2. 「認証設定」セクションを見つける
3. 使いたい認証方式をクリック
4. 確認ダイアログで「切り替える」を選択
5. 完了！

---

# Part 2: 技術詳細（開発者向け）

## アーキテクチャ概要

### コンポーネント構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                        Renderer Process                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    React Application                     │   │
│  │  ┌─────────────────────┐  ┌──────────────────────────┐  │   │
│  │  │   AuthModeSelector  │  │      authModeSlice       │  │   │
│  │  │   (UIコンポーネント)  │→│   (Zustand Store)        │  │   │
│  │  └─────────────────────┘  └──────────────────────────┘  │   │
│  └───────────────────────────────────│──────────────────────┘   │
│                                      ↓ IPC                      │
└──────────────────────────────────────│──────────────────────────┘
                                       ↓
┌──────────────────────────────────────│──────────────────────────┐
│                        Preload Script                           │
│  ┌───────────────────────────────────┴─────────────────────┐   │
│  │                   contextBridge API                      │   │
│  │   - authMode.get() / set() / getStatus() / validate()   │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────│──────────────────────────┘
                                       ↓
┌──────────────────────────────────────│──────────────────────────┐
│                         Main Process                            │
│  ┌─────────────────┐  ┌────────────────────────────────────┐   │
│  │authModeHandlers │→ │         AuthModeService            │   │
│  │  (IPCハンドラ)   │  │   ┌────────────────────────────┐  │   │
│  └─────────────────┘  │   │ SubscriptionAuthProvider   │  │   │
│                       │   │   (Keychainアクセス)        │  │   │
│                       │   └────────────────────────────┘  │   │
│                       └────────────────────────────────────┘   │
│                                      ↓                          │
│                       ┌────────────────────────────────────┐   │
│                       │          electron-store           │   │
│                       │       (永続化ストレージ)           │   │
│                       └────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### データフロー図

```
┌─────────────────────────────────────────────────────────────────┐
│                    認証方式切り替えフロー                        │
└─────────────────────────────────────────────────────────────────┘

User Input → AuthModeSelector → authModeSlice → IPC → authModeHandlers
                                                           ↓
                                                   AuthModeService
                                                           ↓
                                              ┌───────────────────┐
                                              │ mode === 'subscription' │
                                              └─────────┬─────────┘
                                    ┌─────────────────┴─────────────────┐
                                    ↓                                   ↓
                         SubscriptionAuthProvider              AuthKeyService
                                    │                                   │
                                    ↓                                   ↓
                           macOS Keychain                      safeStorage
                           (Claude Code CLI)                   (ユーザーAPIキー)
```

---

## インターフェース定義

### AuthMode 型定義

```typescript
// packages/shared/src/types/auth-mode.ts

/**
 * 認証方式の種類
 * - "subscription": サブスクリプション認証（Claude Code CLI）
 * - "api-key": APIキー認証（ユーザー設定）
 */
export type AuthMode = "subscription" | "api-key";

/**
 * 認証方式の設定状態
 */
export interface AuthModeConfig {
  mode: AuthMode;
  isValid: boolean;
  lastValidated: string | null;
}

/**
 * 認証方式変更イベント
 */
export interface AuthModeChangeEvent {
  previousMode: AuthMode;
  newMode: AuthMode;
  timestamp: string;
}

/**
 * 認証状態の詳細
 */
export interface AuthModeStatus {
  mode: AuthMode;
  isValid: boolean;
  lastValidated: string | null;
  error: string | null;
}
```

### IPC チャンネル一覧

| チャンネル名       | 方向            | パラメータ         | 戻り値               | 説明               |
| ------------------ | --------------- | ------------------ | -------------------- | ------------------ |
| auth-mode:get      | Renderer → Main | なし               | AuthMode             | 現在の認証方式取得 |
| auth-mode:set      | Renderer → Main | { mode: AuthMode } | void                 | 認証方式設定       |
| auth-mode:status   | Renderer → Main | なし               | AuthModeStatus       | 認証状態取得       |
| auth-mode:validate | Renderer → Main | なし               | { isValid: boolean } | 認証方式検証       |
| auth-mode:changed  | Main → Renderer | { mode: AuthMode } | -                    | 方式変更通知       |

### Zustand Store 構造

```typescript
// apps/desktop/src/renderer/store/slices/authModeSlice.ts

interface AuthModeState {
  // 状態
  mode: AuthMode;
  status: AuthModeStatus | null;
  isLoading: boolean;
  error: string | null;

  // 確認ダイアログ
  isConfirmDialogOpen: boolean;
  pendingMode: AuthMode | null;

  // アクション
  setMode: (mode: AuthMode) => Promise<void>;
  fetchMode: () => Promise<void>;
  fetchStatus: () => Promise<void>;
  validateMode: () => Promise<boolean>;
  openConfirmDialog: (mode: AuthMode) => void;
  closeConfirmDialog: () => void;
  confirmModeChange: () => Promise<void>;
}
```

---

## コード例

### 認証方式の切り替え方法

```typescript
// Renderer側での認証方式切り替え
import { useAuthModeStore } from '@/store';

function SettingsPage() {
  const { mode, setMode, isLoading } = useAuthModeStore();

  const handleModeChange = async (newMode: AuthMode) => {
    try {
      await setMode(newMode);
      console.log('認証方式を切り替えました:', newMode);
    } catch (error) {
      console.error('切り替えに失敗しました:', error);
    }
  };

  return (
    <AuthModeSelector
      currentMode={mode}
      onModeChange={handleModeChange}
      disabled={isLoading}
    />
  );
}
```

### 認証状態の取得方法

```typescript
// 認証状態を取得してUIに反映
import { useAuthModeStore } from '@/store';
import { useEffect } from 'react';

function AuthStatusDisplay() {
  const { status, fetchStatus, isLoading } = useAuthModeStore();

  useEffect(() => {
    fetchStatus();
  }, []);

  if (isLoading) return <Spinner />;

  return (
    <div>
      <p>認証方式: {status?.mode === 'subscription' ? 'サブスクリプション' : 'APIキー'}</p>
      <p>状態: {status?.isValid ? '✅ 認証済み' : '❌ 未認証'}</p>
      {status?.error && <p className="error">{status.error}</p>}
    </div>
  );
}
```

### エラーハンドリング

```typescript
// 認証エラーのハンドリング
async function executeSkill(skillId: string) {
  const { mode, validateMode } = useAuthModeStore.getState();

  // 認証方式を検証
  const isValid = await validateMode();

  if (!isValid) {
    if (mode === "subscription") {
      throw new Error("Claude Code CLIでログインしてください");
    } else {
      throw new Error("有効なAPIキーを設定してください");
    }
  }

  // スキル実行...
}
```

---

## トラブルシューティング

### よくある問題と解決方法

#### 1. 「サブスクリプション認証が失敗する」

**原因**: Claude Code CLI にログインしていない

**解決方法**:

```bash
# ターミナルで以下を実行
claude login
```

#### 2. 「APIキーが無効です」というエラー

**原因**: APIキーが間違っているか、期限切れ

**解決方法**:

1. [Anthropic Console](https://console.anthropic.com/) にアクセス
2. 新しいAPIキーを発行
3. 設定画面でAPIキーを再設定

#### 3. 「認証方式を切り替えられない」

**原因**: 前回の認証処理が完了していない

**解決方法**:

1. アプリを再起動
2. 再度設定画面で認証方式を選択

#### 4. 「macOS Keychainへのアクセスが拒否された」

**原因**: アプリのKeychain権限がない

**解決方法**:

1. システム環境設定 → セキュリティとプライバシー
2. プライバシータブで「AIWorkflowOrchestrator」を許可

---

## セキュリティに関する注意事項

### APIキーの取り扱い

```
⚠️ 重要なセキュリティルール ⚠️

1. APIキーは絶対に他人に見せない
2. GitHubやSlackにAPIキーを投稿しない
3. スクリーンショットにAPIキーが写らないよう注意
4. APIキーが漏洩したら、すぐに無効化して新しいキーを発行
```

### アーキテクチャ上のセキュリティ対策

| 対策              | 説明                                            |
| ----------------- | ----------------------------------------------- |
| Main Process 管理 | トークン・APIキーはRenderer Processに公開しない |
| 暗号化保存        | electron-store の safeStorage で暗号化          |
| sender検証        | IPC呼び出しの送信元を検証                       |
| エラーサニタイズ  | 内部エラー情報をRendererに漏洩しない            |
