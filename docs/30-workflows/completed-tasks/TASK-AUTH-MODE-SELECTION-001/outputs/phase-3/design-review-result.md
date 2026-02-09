# 設計レビュー結果

## メタ情報

| 項目               | 内容                                   |
| ------------------ | -------------------------------------- |
| レビュー日         | 2026-02-09                             |
| タスクID           | TASK-AUTH-MODE-SELECTION-001           |
| レビュー対象       | Phase 1-2成果物                        |
| レビューファイル数 | Phase 1: 6ファイル、Phase 2: 8ファイル |

---

## 判定結果

**判定: MINOR**

設計は全体的に高品質で、セキュリティ原則、Electron 3プロセスモデル、および機能要件をすべてカバーしている。しかし、4点の軽微な不整合が検出されたため、これらの対応後にPhase 4へ進行可能。

---

## レビュー結果詳細

### 1. 要件と設計の整合性

#### 機能要件カバレッジ (FR-1〜FR-12)

| ID    | 要件                               | 設計カバレッジ                                     | 判定 |
| ----- | ---------------------------------- | -------------------------------------------------- | ---- |
| FR-1  | 認証方式選択UI                     | AuthModeSelector (セグメントコントロール)          | OK   |
| FR-2  | 永続化                             | electron-store (auth-mode-store.json)              | OK   |
| FR-3  | 認証プロバイダー切り替え           | AuthModeService.getCredential()                    | OK   |
| FR-4  | サブスクリプション未ログインエラー | AuthModeStatus.error + ガイダンス                  | OK   |
| FR-5  | APIキー未設定エラー                | AuthModeStatus.error + ガイダンス                  | OK   |
| FR-6  | 認証状態表示                       | AuthModeStatusIndicator                            | OK   |
| FR-7  | 確認ダイアログ                     | UI設計書ワイヤーフレーム + isConfirmDialogOpen状態 | OK   |
| FR-8  | Keychainトークン取得               | SubscriptionAuthProvider.getToken()                | OK   |
| FR-9  | Keychainアクセス許可               | KEYCHAIN_ACCESS_DENIED エラーハンドリング          | OK   |
| FR-10 | エラーガイダンス                   | AUTH_MODE_ERROR_GUIDANCE マッピング                | OK   |
| FR-11 | 自動検出（任意）                   | スコープ外として明記                               | OK   |
| FR-12 | バリデーションロジック             | validateMode() + トークンプレフィックス検証        | OK   |

**結果**: 全12要件がカバー済み

#### 非機能要件カバレッジ (NFR-1〜NFR-10)

| ID     | 要件                    | 設計対応                                    | 判定 |
| ------ | ----------------------- | ------------------------------------------- | ---- |
| NFR-1  | 1秒以内の切り替え       | キャッシュ(5分TTL)、非同期処理設計          | OK   |
| NFR-2  | トークン暗号化保存      | Keychain(macOS) + safeStorage(APIキー)      | OK   |
| NFR-3  | Rendererへ直接公開禁止  | architecture-design.md で明示的に禁止       | OK   |
| NFR-4  | エラーサニタイズ        | sanitizeErrorMessage() 関数設計             | OK   |
| NFR-5  | 構造化ログ              | ログサニタイズ + デバッグモード設計         | OK   |
| NFR-6  | Keychain初回確認のみ    | macOS標準動作に依存                         | OK   |
| NFR-7  | 200-300msアニメーション | UI設計書で指定(200ms ease-out)              | OK   |
| NFR-8  | Main Process経由IPC     | 4チャンネル全てMain Process経由             | OK   |
| NFR-9  | 環境変数フォールバック  | CLAUDE_CODE_OAUTH_TOKEN + ANTHROPIC_API_KEY | OK   |
| NFR-10 | テストカバレッジ80%     | テスト戦略で言及                            | OK   |

**結果**: 全10要件がカバー済み

#### 受入基準テスト可能性 (AC-1〜AC-11)

| ID    | 受入基準                   | テスト可能性                                 | 判定 |
| ----- | -------------------------- | -------------------------------------------- | ---- |
| AC-1  | サブスクリプション認証成功 | getCredential() + hasToken() でテスト可能    | OK   |
| AC-2  | 未ログイン時エラー         | AuthModeStatus.isAuthenticated=false + error | OK   |
| AC-3  | APIキー認証成功            | getCredential() + hasKey() でテスト可能      | OK   |
| AC-4  | キー未設定エラー           | AuthModeStatus.hasCredentials=false + error  | OK   |
| AC-5  | 認証方式切り替え即時反映   | setMode() + onModeChange() イベント          | OK   |
| AC-6  | 永続化確認                 | electron-store 読み込み/書き込みテスト       | OK   |
| AC-7  | トークン期限切れ           | TokenInfo.isExpired + エラーガイダンス       | OK   |
| AC-8  | 認証状態表示               | AuthModeStatusIndicator UIテスト             | OK   |
| AC-9  | Keychainアクセス許可       | KEYCHAIN_ACCESS_DENIED エラーハンドリング    | OK   |
| AC-10 | 無効APIキーエラー          | INVALID_API_KEY_FORMAT バリデーション        | OK   |
| AC-11 | 確認ダイアログキャンセル   | closeConfirmDialog() + 状態維持テスト        | OK   |

**結果**: 全11受入基準がテスト可能

---

### 2. セキュリティ（トークン取り扱い）

| チェック項目                           | 設計での対応                                            | 判定 |
| -------------------------------------- | ------------------------------------------------------- | ---- |
| トークン/APIキーはMain Processのみ管理 | SubscriptionAuthProvider, AuthKeyService はMain Process | OK   |
| Rendererにトークン送信禁止             | IPC仕様で明示（isAuthenticated booleanのみ送信）        | OK   |
| 認証エラーサニタイズ                   | sanitizeErrorMessage() でトークン/キーパターン除去      | OK   |
| IPCチャンネルホワイトリスト            | ALLOWED_INVOKE_CHANNELS, ALLOWED_ON_CHANNELS 登録設計   | OK   |
| sender検証                             | withValidation() ラッパー使用設計                       | OK   |
| ログ出力制限                           | sanitizeTokenForLog() 関数設計                          | OK   |

**結果**: 全セキュリティ要件を満たす

---

### 3. Electron 3プロセスモデル準拠

```
┌─────────────────────────────────────────────────────────────────┐
│ Main Process                                                     │
│ - AuthModeService (認証方式管理)                                │
│ - SubscriptionAuthProvider (Keychain経由トークン取得)          │
│ - AuthKeyService (既存APIキー管理)                              │
│ - IPC Handlers (auth-mode:* チャンネル)                         │
│ - electron-store (永続化)                                       │
└────────────────────────────────────────────────────────────┬────┘
                                                             │
                                                   contextBridge
                                                             │
┌────────────────────────────────────────────────────────────▼────┐
│ Preload                                                          │
│ - authModeApi (get, set, getStatus, validate, onChanged)         │
└────────────────────────────────────────────────────────────┬────┘
                                                             │
                                                    ipcRenderer
                                                             │
┌────────────────────────────────────────────────────────────▼────┐
│ Renderer Process                                                 │
│ - authModeSlice (Zustand状態管理)                               │
│ - AuthModeSettingsSection (UI)                                  │
│ - AuthModeSelector (UI)                                         │
│ - AuthModeStatusIndicator (UI)                                  │
└─────────────────────────────────────────────────────────────────┘
```

**結果**: 3プロセスモデルに完全準拠

---

### 4. 既存AuthKeyServiceとの統合方式

| チェック項目                | 設計での対応                                     | 判定 |
| --------------------------- | ------------------------------------------------ | ---- |
| インターフェース変更なし    | IAuthKeyService を参照のみ、変更不要             | OK   |
| SkillExecutorへの影響最小限 | DI第3引数でIAuthModeService注入                  | OK   |
| DIパターン適切使用          | AuthModeServiceDependencies インターフェース定義 | OK   |
| 既存テストへの影響          | モック追加のみ（P21教訓参照）                    | OK   |

**結果**: 既存実装との統合設計が適切

---

### 5. 型安全性

| チェック項目         | 設計での対応                                      | 判定                  |
| -------------------- | ------------------------------------------------- | --------------------- | --- |
| AuthMode型定義       | `"subscription"                                   | "api-key"` リテラル型 | OK  |
| AuthModeStatus型定義 | 厳密なインターフェース（mode, isAuthenticated等） | OK                    |
| IPCリクエスト型      | AuthModeSetRequest, AuthModeValidateRequest       | OK                    |
| IPCレスポンス型      | IPCResponse<T> ジェネリック型                     | OK                    |
| 型ガード関数         | isValidAuthMode() type predicate                  | OK                    |
| エラーコード型安全性 | AUTH_MODE_ERROR_CODES const assertion             | OK                    |
| トークン定数         | TOKEN_CONSTANTS const assertion                   | OK                    |

**結果**: 型安全性が十分に確保されている

---

### 6. 状態管理

| チェック項目           | 設計での対応                                                  | 判定 |
| ---------------------- | ------------------------------------------------------------- | ---- |
| Zustand Slice パターン | createAuthModeSlice: StateCreator 使用                        | OK   |
| リスナー二重登録防止   | authModeListenerRegistered フラグ + resetAuthModeListenerFlag | OK   |
| 個別セレクタ           | selectAuthMode, selectAuthModeStatus 等定義                   | OK   |
| 状態リセット           | resetAuthMode() アクション                                    | OK   |
| 非同期アクション       | fetchMode, setMode, fetchStatus 等 async対応                  | OK   |
| エラーハンドリング     | handleAuthModeError() ヘルパー関数                            | OK   |

**結果**: Zustand設計原則に従った適切な設計

---

## 指摘事項

### MINOR-1: DEFAULT_AUTH_MODE の不整合

**問題箇所:**

- `type-definitions.ts` (line 51): `DEFAULT_AUTH_MODE: AuthMode = "api-key"`
- `auth-mode-service-design.md` (line 30): `DEFAULT_AUTH_MODE: AuthMode = "subscription"`
- `state-management-design.md` (line 170): `mode: "subscription"` (初期値)
- `architecture-design.md` (line 404): `authMode | "subscription"` (デフォルト)

**影響:** 設計書間でデフォルト値が不整合。実装時に混乱の原因となる可能性。

**推奨対応:**
要件定義書ではサブスクリプション優先の方針のため、`type-definitions.ts` の `DEFAULT_AUTH_MODE` を `"subscription"` に統一する。

```typescript
// 修正前
export const DEFAULT_AUTH_MODE: AuthMode = "api-key";

// 修正後
export const DEFAULT_AUTH_MODE: AuthMode = "subscription";
```

---

### MINOR-2: Preload API オブジェクト名の表記ゆれ

**問題箇所:**

- `state-management-design.md`: `window.electronAPI.authMode`
- `ipc-specification.md`: `window.api.authMode`

**影響:** 実装時にどちらのAPIパスを使用するか不明確。

**推奨対応:**
既存の preload 実装パターンを確認し、統一する。一般的には `window.electronAPI` が Electron 標準に近い命名。

```typescript
// 統一案
declare global {
  interface Window {
    electronAPI: {
      authMode: AuthModeAPI;
      // ... 他のAPI
    };
  }
}
```

---

### MINOR-3: Zustand persist の二重永続化リスク

**問題箇所:**
`state-management-design.md` (line 639-646):

```typescript
persist(
  (...args) => ({ ... }),
  {
    partialize: (state) => ({
      mode: state.mode, // Renderer側で永続化
    }),
  }
)
```

**影響:**

- `mode` は electron-store (Main Process) で永続化設計済み
- Zustand persist も使用すると二重永続化となり、同期問題が発生する可能性

**推奨対応:**
Zustand persist から `mode` を除外するか、persist 自体を使用しない設計に変更。

```typescript
// 修正案: persistを使用しないか、modeを除外
persist(
  (...args) => ({ ... }),
  {
    partialize: (state) => ({
      // mode は除外（Main Process で永続化）
      // 他の永続化が必要な状態のみ
    }),
  }
)
```

---

### MINOR-4: 環境変数定数の命名規則

**問題箇所:**

- `cli-auth-investigation.md`: `CLAUDE_CODE_OAUTH_TOKEN`（直接使用）
- `subscription-auth-provider-design.md` (line 308): `ENV_CLAUDE_CODE_OAUTH_TOKEN`（定数名）

**影響:** 軽微。実装時の一貫性のため統一が望ましい。

**推奨対応:**
定数名は `ENV_` プレフィックスを付けて値と区別する設計で問題ないが、ドキュメント内で定数参照時は統一する。

```typescript
// 定数定義
export const ENV_CLAUDE_CODE_OAUTH_TOKEN = "CLAUDE_CODE_OAUTH_TOKEN";

// 使用時
const token = process.env[ENV_CLAUDE_CODE_OAUTH_TOKEN];
```

---

## 設計の優れた点

1. **セキュリティ設計が徹底**
   - トークン/APIキーの Renderer 送信禁止が一貫
   - sanitizeErrorMessage, sanitizeTokenForLog の設計
   - IPCチャンネルホワイトリスト管理

2. **詳細なエラーハンドリング**
   - エラーコード体系（バリデーション/認証/トークン/Keychain/ストレージ）
   - 各エラーに対するユーザーガイダンス定義
   - Result パターンの導入

3. **テスト容易性**
   - DIパターンによるモック注入設計
   - IKeychainAccess インターフェースでkeytar抽象化
   - リスナー二重登録防止のテスト戦略

4. **UI/UXへの配慮**
   - Apple HIG準拠のデザイントークン
   - WCAG 2.1 AA準拠のアクセシビリティ
   - キーボード操作対応

5. **既存実装との互換性**
   - AuthKeyServiceのインターフェース維持
   - SkillExecutorへのDI第3引数設計
   - 既知の落とし穴（P5, P21等）への対策

---

## 次のアクション

| 優先度 | アクション                                       | 担当          |
| ------ | ------------------------------------------------ | ------------- |
| 1      | MINOR-1: DEFAULT_AUTH_MODEを"subscription"に統一 | Phase 4開始前 |
| 2      | MINOR-2: window.electronAPI に統一               | Phase 4開始前 |
| 3      | MINOR-3: Zustand persistからmode除外             | Phase 4開始前 |
| 4      | MINOR-4: 環境変数定数の参照を統一                | Phase 4開始前 |
| 5      | Phase 4開始: テストケース設計・実装              | レビュー後    |

---

## 関連ドキュメント

| ドキュメント                 | パス                                                   |
| ---------------------------- | ------------------------------------------------------ |
| 要件定義書                   | `outputs/phase-1/requirements-definition.md`           |
| 受入基準                     | `outputs/phase-1/acceptance-criteria.md`               |
| アーキテクチャ設計           | `outputs/phase-2/architecture-design.md`               |
| AuthModeService設計          | `outputs/phase-2/auth-mode-service-design.md`          |
| SubscriptionAuthProvider設計 | `outputs/phase-2/subscription-auth-provider-design.md` |
| IPC仕様書                    | `outputs/phase-2/ipc-specification.md`                 |
| 状態管理設計書               | `outputs/phase-2/state-management-design.md`           |
| UI設計書                     | `outputs/phase-2/ui-wireframe.md`                      |
| 型定義                       | `outputs/phase-2/type-definitions.ts`                  |
| セキュリティルール           | `.claude/rules/04-electron-security.md`                |
| 既知の落とし穴               | `.claude/rules/06-known-pitfalls.md`                   |
