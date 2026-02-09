# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 2                            |
| Phase名    | 設計                         |
| タスクID   | TASK-AUTH-MODE-SELECTION-001 |
| Issue      | #750                         |
| 前提Phase  | Phase 1 (要件定義)           |
| 後続Phase  | Phase 3 (設計レビューゲート) |
| ステータス | 未実施                       |
| 作成日     | 2026-02-08                   |
| 機能名     | auth-mode-selection          |

---

## 目的

AuthModeService、SubscriptionAuthProvider、IPC、UIの設計を行う。

## 背景

Phase 1で定義した要件を実現するための技術設計を行う。既存のAuthKeyService（APIキー認証）とSupabase Auth（OAuth認証）を統合し、ユーザーが選択した認証方式に応じて適切なプロバイダーを使用する設計を行う。

---

## 実行タスク

### タスク1: AuthModeServiceインターフェース設計

認証方式の管理を担当するサービスのインターフェースを設計する。

**インターフェース定義**:

```typescript
/**
 * 認証方式
 */
type AuthMode = "subscription" | "api-key";

/**
 * 認証方式サービスインターフェース
 */
interface IAuthModeService {
  /**
   * 現在の認証方式を取得
   */
  getMode(): Promise<AuthMode>;

  /**
   * 認証方式を設定
   * @param mode - 設定する認証方式
   */
  setMode(mode: AuthMode): Promise<void>;

  /**
   * 現在の認証状態を取得
   */
  getStatus(): Promise<AuthModeStatus>;

  /**
   * 現在の認証方式で認証が有効かどうかを検証
   */
  validate(): Promise<AuthModeValidationResult>;
}
```

**依存関係**:

| 依存先         | 用途                               |
| -------------- | ---------------------------------- |
| AuthKeyService | APIキー認証の検証・取得            |
| Supabase Auth  | サブスクリプション認証のセッション |
| electron-store | 認証方式設定の永続化               |

**成果物**: `outputs/phase-2/auth-mode-service-design.md`

### タスク2: SubscriptionAuthProviderインターフェース設計

サブスクリプション認証時にAPIアクセスを提供するプロバイダーを設計する。

**インターフェース定義**:

```typescript
/**
 * サブスクリプション認証プロバイダー
 */
interface ISubscriptionAuthProvider {
  /**
   * サブスクリプション認証トークンを取得
   * @throws SubscriptionNotActiveError - サブスクリプションが無効
   * @throws NotLoggedInError - 未ログイン状態
   */
  getAccessToken(): Promise<string>;

  /**
   * 認証状態を確認
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * サブスクリプションプランを取得
   */
  getPlan(): Promise<SubscriptionPlan>;

  /**
   * トークンをリフレッシュ
   */
  refreshToken(): Promise<void>;
}

type SubscriptionPlan = "free" | "pro" | "enterprise";
```

**連携フロー**:

| ステップ | 処理                                             |
| -------- | ------------------------------------------------ |
| 1        | SkillExecutorがAuthModeServiceから認証方式を取得 |
| 2        | 認証方式が'subscription'の場合                   |
| 3        | SubscriptionAuthProviderからトークンを取得       |
| 4        | トークンを使用してAnthropic APIを呼び出し        |

**成果物**: `outputs/phase-2/subscription-auth-provider-design.md`

### タスク3: IPCチャンネル設計

認証方式管理のためのIPCチャンネルを設計する。

**チャンネル一覧**:

| チャンネル             | 方向            | 用途               | Request              | Response                        |
| ---------------------- | --------------- | ------------------ | -------------------- | ------------------------------- |
| `auth-mode:get`        | Renderer → Main | 現在の認証方式取得 | なし                 | `IPCResponse<AuthMode>`         |
| `auth-mode:set`        | Renderer → Main | 認証方式設定       | `{ mode: AuthMode }` | `IPCResponse<void>`             |
| `auth-mode:get-status` | Renderer → Main | 認証状態取得       | なし                 | `IPCResponse<AuthModeStatus>`   |
| `auth-mode:validate`   | Renderer → Main | 認証検証           | なし                 | `IPCResponse<ValidationResult>` |
| `auth-mode:changed`    | Main → Renderer | 認証方式変更通知   | -                    | `{ mode: AuthMode }`            |

**型定義**:

```typescript
interface AuthModeStatus {
  mode: AuthMode;
  isValid: boolean;
  details: {
    subscription?: {
      isLoggedIn: boolean;
      plan?: SubscriptionPlan;
      expiresAt?: number;
    };
    apiKey?: {
      isSet: boolean;
      isValid?: boolean;
    };
  };
}

interface AuthModeValidationResult {
  isValid: boolean;
  errors: AuthModeError[];
}

interface AuthModeError {
  code: AuthModeErrorCode;
  message: string;
}

type AuthModeErrorCode =
  | "NOT_LOGGED_IN"
  | "SUBSCRIPTION_EXPIRED"
  | "API_KEY_NOT_SET"
  | "API_KEY_INVALID"
  | "TOKEN_EXPIRED";
```

**セキュリティ要件**:

| 要件                     | 実装方法                     |
| ------------------------ | ---------------------------- |
| チャンネルホワイトリスト | `ALLOWED_CHANNELS`に登録     |
| 送信元検証               | `withValidation`ラッパー適用 |
| エラーサニタイズ         | `sanitizeErrorMessage()`使用 |

**成果物**: `outputs/phase-2/ipc-specification.md`

### タスク4: UIコンポーネント設計（セグメントコントロール）

認証方式を選択するためのUIコンポーネントを設計する。

**コンポーネント構成**:

| コンポーネント          | 層       | 責務                               |
| ----------------------- | -------- | ---------------------------------- |
| AuthModeSelector        | molecule | 認証方式選択セグメントコントロール |
| AuthModeStatusIndicator | atom     | 現在の認証状態インジケーター       |
| AuthModeSettingsSection | organism | 設定画面の認証方式セクション全体   |

**AuthModeSelector設計**:

```typescript
interface AuthModeSelectorProps {
  currentMode: AuthMode;
  status: AuthModeStatus;
  onModeChange: (mode: AuthMode) => void;
  disabled?: boolean;
}
```

**UI仕様**:

| 要素               | 仕様                                            |
| ------------------ | ----------------------------------------------- |
| セグメント数       | 2（サブスクリプション / APIキー）               |
| 選択状態表示       | アクティブセグメントをハイライト                |
| 状態インジケーター | 各セグメントに認証状態アイコン（✓/⚠/✗）         |
| ホバー状態         | 背景色変更（200ms transition）                  |
| 無効状態           | グレーアウト、pointer-events: none              |
| アクセシビリティ   | role="radiogroup"、aria-checked、キーボード操作 |

**ワイヤーフレーム**:

```
┌─────────────────────────────────────────────────────────┐
│ 認証方式                                                │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────┬─────────────────────┐          │
│ │ ✓ サブスクリプション │   APIキー           │          │
│ └─────────────────────┴─────────────────────┘          │
│                                                         │
│ 現在の状態: ログイン済み (Pro プラン)                   │
│ 有効期限: 2026-03-08                                    │
└─────────────────────────────────────────────────────────┘
```

**成果物**: `outputs/phase-2/ui-wireframe.md`

### タスク5: authModeSlice状態管理設計

Zustand storeに認証方式管理のSliceを追加する設計を行う。

**Slice設計**:

```typescript
interface AuthModeSlice {
  // 状態
  mode: AuthMode;
  status: AuthModeStatus | null;
  isLoading: boolean;
  error: string | null;

  // アクション
  fetchMode: () => Promise<void>;
  setMode: (mode: AuthMode) => Promise<void>;
  fetchStatus: () => Promise<void>;
  validate: () => Promise<AuthModeValidationResult>;
  clearError: () => void;
}
```

**状態遷移**:

| トリガー                  | 状態変更                                  |
| ------------------------- | ----------------------------------------- |
| fetchMode開始             | isLoading: true                           |
| fetchMode成功             | mode: 取得値, isLoading: false            |
| fetchMode失敗             | error: エラーメッセージ, isLoading: false |
| setMode開始               | isLoading: true                           |
| setMode成功               | mode: 新値, isLoading: false              |
| auth-mode:changedイベント | mode: イベント値                          |

**IPCリスナー管理**:

| 項目                 | 実装方法                                  |
| -------------------- | ----------------------------------------- |
| リスナー二重登録防止 | `authModeListenerRegistered`フラグ使用    |
| 登録タイミング       | initializeAuthMode()呼び出し時            |
| リセット関数         | `resetAuthModeListenerFlag()`（テスト用） |

**成果物**: `outputs/phase-2/state-management-design.md`

---

## 参照資料

| 参照資料             | パス                                                                              | 内容                  |
| -------------------- | --------------------------------------------------------------------------------- | --------------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                                      | Phase 1成果物         |
| 受入基準             | `outputs/phase-1/acceptance-criteria.md`                                          | テスト可能な基準      |
| 認証インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`            | 既存認証型定義        |
| 認証IPC仕様          | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`               | 既存認証IPCチャンネル |
| 認証セキュリティ設計 | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | 認証アーキテクチャ    |
| AuthKeyService型定義 | `apps/desktop/src/main/services/auth/types.ts`                                    | APIキー管理型定義     |
| セキュリティ原則     | `.claude/skills/aiworkflow-requirements/references/security-principles.md`        | セキュリティ設計原則  |

---

## 統合テスト連携【必須】

### Phase 2での必須アクション

- [ ] 統合ポイント/契約（API・スキーマ）を設計に反映
- [ ] AuthKeyService/Supabase Authとのインターフェース契約を定義
- [ ] エラーハンドリングの統合パターンを設計

**統合ポイント**:

| 統合ポイント                     | 契約定義                                          |
| -------------------------------- | ------------------------------------------------- |
| AuthModeService → AuthKeyService | IAuthKeyService.getKey(), hasKey(), validateKey() |
| AuthModeService → Supabase Auth  | supabase.auth.getSession(), getUser()             |
| Renderer → Main (IPC)            | auth-mode:\* チャンネル群                         |
| SkillExecutor → AuthModeService  | getMode(), validate()                             |

---

## アーキテクチャ層別設計

| 層               | 設計内容                                           | ファイル配置                             |
| ---------------- | -------------------------------------------------- | ---------------------------------------- |
| Renderer Process | AuthModeSelector, authModeSlice, useAuthModeフック | `apps/desktop/src/renderer/`             |
| Main Process     | AuthModeService, SubscriptionAuthProvider          | `apps/desktop/src/main/services/auth/`   |
| IPC通信          | authModeHandlers, チャンネル定義                   | `apps/desktop/src/main/ipc/`, `preload/` |
| Preload          | auth-mode:\* チャンネルのcontextBridge公開         | `apps/desktop/src/preload/`              |
| Shared           | AuthMode型、AuthModeStatus型                       | `packages/shared/types/auth.ts`          |

---

## 成果物

| 成果物                       | パス                                                   | 内容                         |
| ---------------------------- | ------------------------------------------------------ | ---------------------------- |
| AuthModeService設計          | `outputs/phase-2/auth-mode-service-design.md`          | サービスインターフェース設計 |
| SubscriptionAuthProvider設計 | `outputs/phase-2/subscription-auth-provider-design.md` | 認証プロバイダー設計         |
| IPC仕様                      | `outputs/phase-2/ipc-specification.md`                 | IPCチャンネル詳細設計        |
| UIワイヤーフレーム           | `outputs/phase-2/ui-wireframe.md`                      | UIコンポーネント設計         |
| 状態管理設計                 | `outputs/phase-2/state-management-design.md`           | Zustand Slice設計            |
| 型定義                       | `outputs/phase-2/type-definitions.ts`                  | TypeScript型定義             |
| アーキテクチャ設計           | `outputs/phase-2/architecture-design.md`               | 全体設計まとめ               |

---

## 設計原則

| 原則                 | 適用箇所                                                |
| -------------------- | ------------------------------------------------------- |
| 単一責務 (SRP)       | AuthModeServiceは認証方式管理のみ、認証実行は各Provider |
| 依存性逆転 (DIP)     | SkillExecutorはIAuthModeServiceに依存、具象は注入       |
| インターフェース分離 | IAuthKeyService, ISubscriptionAuthProviderを分離        |
| 最小権限             | Rendererには認証状態のみ公開、トークンは非公開          |

---

## 完了条件

- [ ] AuthModeServiceインターフェースが設計されている
- [ ] SubscriptionAuthProviderインターフェースが設計されている
- [ ] IPCチャンネル（4種類）が設計されている
- [ ] UIコンポーネント（セグメントコントロール）が設計されている
- [ ] authModeSlice状態管理が設計されている
- [ ] 型定義が完成している
- [ ] 既存AuthKeyServiceとの連携設計が完了している
- [ ] 統合テスト観点の契約が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 使用スキル

- repository-pattern: {{result}}
- type-safety-patterns: {{result}}
- interface-design: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/phase-3-design-review.md`
