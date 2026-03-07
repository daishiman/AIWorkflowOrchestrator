# Phase 12: 実装ガイド

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| タスクID | TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 |
| Phase    | 12 - ドキュメント                          |
| 実施日   | 2026-03-06                                 |

---

## Part 1: 概念説明（中学生向け）

### 「鍵と鍵穴」で理解する AuthKeySection

#### 設定画面は「玄関」

アプリの設定画面は、家の玄関のようなものです。玄関にはいくつかの入口があり、それぞれに合う鍵が必要です。

#### AuthModeSelector = 「どの鍵を使うか選ぶ」

設定画面には「認証モード選択」があります。これは「どの鍵を使って家に入るか」を選ぶことに相当します:

- **subscription（定期券）**: 毎月のお金を払って入る方法。鍵は不要
- **api-key（専用の鍵）**: 自分だけの鍵を作って入る方法

#### AuthKeySection = 「鍵そのものを登録する」

`api-key` を選んだ場合だけ、「鍵を登録するコーナー」が表示されます。これが AuthKeySection です。

定期券を使う人に鍵の登録コーナーを見せても意味がないので、`subscription` の時は隠れています。

#### 4つの状態 = 鍵の状態

鍵の登録状況は 4 つの状態で表示されます:

| 状態           | 日常の例え                               | バッジの色 |
| -------------- | ---------------------------------------- | ---------- |
| 保存済み       | 鍵を作って金庫に入れた状態               | 緑         |
| 環境変数で設定 | 合鍵が別の場所（環境変数）にある状態     | 黄         |
| 未設定         | まだ鍵を作っていない状態                 | 赤         |
| 確認不可       | 金庫の中が見えない（通信エラーなど）状態 | 灰         |

#### セキュリティ = 「鍵は見せない」

鍵を登録するとき、入力した値は一時的にメモ帳（ローカル state）に書いて、登録が終わったらすぐにメモ帳を消します。金庫（Main Process）に入れたら、もう誰にも鍵の中身は見せません。

---

## Part 2: 開発者向け実装詳細

### AuthKeySection コンポーネント設計

#### ファイル構成

```
apps/desktop/src/renderer/components/settings/
  AuthKeySection/
    index.tsx              # AuthKeySection コンポーネント本体
    AuthKeySection.test.tsx # 単体テスト
  SettingsView/
    index.tsx              # SettingsView（AuthKeySection を条件付きレンダリング）
    SettingsView.test.tsx   # 統合テスト
```

#### コンポーネント階層

```
SettingsView
  +-- AuthModeSelector          # 認証モード選択（既存）
  +-- AuthKeySection            # authKey 状態表示・管理（新規）★
  |     +-- ステータスバッジ     # 4状態の視覚表示
  |     +-- キー入力フォーム     # パスワードマスク付き入力
  |     +-- 保存/削除ボタン      # IPC 呼び出しトリガー
  +-- ApiKeysSection            # 汎用 API キー管理（既存）
```

#### 表示条件

```typescript
// SettingsView 内での条件付きレンダリング
const authMode = useAuthMode(); // 個別セレクタ（P31対策）

{authMode === "api-key" && <AuthKeySection />}
```

### 4状態判定ロジック

AuthKeySection は 2 つの IPC 呼び出し結果を組み合わせて 4 状態を判定する:

| `auth-key:status` の `hasCredentials` | `auth-key:exists` の `exists` | 判定状態       |
| ------------------------------------- | ----------------------------- | -------------- |
| `true`                                | -                             | 保存済み（緑） |
| `false`                               | `true`                        | 環境変数（黄） |
| `false`                               | `false`                       | 未設定（赤）   |
| エラー                                | -                             | 確認不可（灰） |

### IPC 利用（既存契約、変更なし）

| チャンネル        | 方向            | 用途           |
| ----------------- | --------------- | -------------- |
| `auth-key:status` | Renderer → Main | ステータス取得 |
| `auth-key:exists` | Renderer → Main | 環境変数確認   |
| `auth-key:save`   | Renderer → Main | キー保存       |
| `auth-key:delete` | Renderer → Main | キー削除       |

Preload/Main の変更は不要。既存の IPC ハンドラをそのまま利用する。

### セキュリティ考慮事項

1. **生キーの保持**: `useState` でローカルに保持し、`auth-key:save` 呼び出し後に即座に空文字列にリセット
2. **Renderer への返却制限**: IPC は成否（boolean）のみを返却し、保存済みキーの値は返さない
3. **パスワードマスク**: `<input type="password">` をデフォルトとし、トグルで一時的に `type="text"` に切替可能
4. **contextBridge 境界**: 既存の Preload 層（contextBridge）を経由するため、Renderer から Node.js API への直接アクセスなし

### Zustand セレクタ使用（P31 対策）

```typescript
// 個別セレクタを使用（合成 Hook は使用禁止）
const authMode = useAuthMode(); // AuthModeSlice の個別セレクタ
const setAuthMode = useSetAuthMode(); // アクション用の個別セレクタ
```

合成 Hook（`useAuthModeStore()`）の戻り値関数を `useEffect` の依存配列に含めると無限ループが発生するため、必ず個別セレクタを使用する。
