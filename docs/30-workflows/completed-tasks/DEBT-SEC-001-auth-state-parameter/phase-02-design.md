# Phase 2: 設計

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 2                                 |
| 機能名 | DEBT-SEC-001-auth-state-parameter |
| 作成日 | 2026-02-05                        |
| 状態   | 未着手                            |

## 目的

要件を実現可能な構造に落とし込む。

## 実行タスク

- StateManagerクラス設計: generate, validate, cleanup メソッドの設計
- インターフェース定義: StateEntry型の設計
- データフロー設計: OAuth認証開始からstate検証までの流れ
- 既存ファイル修正設計: authHandlers.ts、index.tsの変更箇所特定

---

## StateManagerモジュール設計

### インターフェース定義

```typescript
// apps/desktop/src/main/infrastructure/stateManager.ts

/** OAuthプロバイダー種別 */
type OAuthProvider = "google" | "github" | "discord";

/** State保存エントリ */
interface StateEntry {
  state: string;
  provider: OAuthProvider;
  createdAt: number;
  expiresAt: number;
}

/** State有効期限: 10分 */
const STATE_EXPIRY_MS = 10 * 60 * 1000;
```

### StateManagerクラス設計

```typescript
class StateManager {
  /** state保存用Map（メモリのみ、ディスク永続化なし） */
  private states: Map<string, StateEntry> = new Map();

  /**
   * stateパラメータを生成し、プロバイダーと紐付けて保存する
   * @param provider - OAuthプロバイダー
   * @returns 生成されたstate文字列（hex）
   */
  generate(provider: OAuthProvider): string;

  /**
   * stateパラメータを検証する（ワンタイムユース: 検証成功時に削除）
   * @param state - 検証対象のstate文字列
   * @param provider - 期待するOAuthプロバイダー
   * @returns 検証成功ならtrue、失敗ならfalse
   */
  validate(state: string, provider: OAuthProvider): boolean;

  /**
   * 期限切れのstateエントリを削除する
   */
  cleanup(): void;
}

/** シングルトンインスタンスをエクスポート */
export const stateManager = new StateManager();
```

### メソッド詳細設計

#### generate(provider)

1. `crypto.randomBytes(32).toString('hex')` で64文字のランダム文字列を生成
2. StateEntryを作成: `{ state, provider, createdAt: Date.now(), expiresAt: Date.now() + STATE_EXPIRY_MS }`
3. Mapに `state` をキーとして保存
4. state文字列を返却

#### validate(state, provider)

1. Mapから `state` に対応するエントリを取得
2. エントリが存在しない場合: `false` を返却
3. `provider` が一致しない場合: エントリを削除し `false` を返却
4. `Date.now() > expiresAt` の場合: エントリを削除し `false` を返却
5. 検証成功: エントリを削除し（ワンタイムユース）`true` を返却

#### cleanup()

1. Mapの全エントリを走査
2. `Date.now() > expiresAt` のエントリを削除

### セキュリティ設計方針

| 方針               | 詳細                                                      |
| ------------------ | --------------------------------------------------------- |
| メモリのみ保存     | Mapはプロセス終了時に消失。ディスクには一切永続化しない   |
| 高エントロピー     | crypto.randomBytes(32)で256bit乱数（推測不可能）          |
| ワンタイムユース   | 検証成功後にMapから即座に削除（リプレイ攻撃防止）         |
| 有効期限           | 10分経過で自動無効化（放置されたstateの悪用防止）         |
| プロバイダー紐付け | stateとproviderのペアで検証（クロスプロバイダー攻撃防止） |

---

## データフロー設計

### OAuth認証フロー（state付き）

```
[Renderer]                [Main Process]                [External Browser]     [Supabase]
    |                          |                              |                    |
    |-- auth:login(provider) ->|                              |                    |
    |                          |                              |                    |
    |                    stateManager.generate(provider)       |                    |
    |                    state = "abc123..."                   |                    |
    |                          |                              |                    |
    |                    signInWithOAuth({                     |                    |
    |                      provider,                          |                    |
    |                      options: {                          |                    |
    |                        queryParams: { state },          |                    |
    |                        redirectTo: "aiworkflow://..."    |                    |
    |                      }                                  |                    |
    |                    })                                    |                    |
    |                          |-- OAuth URL with state ------>|                    |
    |                          |                              |-- authenticate --->|
    |                          |                              |                    |
    |                          |                              |<-- callback URL ---|
    |                          |                              |   #access_token=...|
    |                          |                              |   &state=abc123... |
    |                          |                              |                    |
    |                          |<- aiworkflow://auth/callback#...(hash fragment) --|
    |                          |                              |                    |
    |                    handleAuthCallback(url)               |                    |
    |                    hashParams = new URLSearchParams(     |                    |
    |                      url.hash.slice(1)                  |                    |
    |                    )                                     |                    |
    |                    state = hashParams.get("state")       |                    |
    |                    provider = detectProvider(url)         |                    |
    |                          |                              |                    |
    |                    stateManager.validate(state, provider) |                   |
    |                          |                              |                    |
    |                    [成功] → トークン処理続行             |                    |
    |                    [失敗] → エラー通知                   |                    |
    |                          |                              |                    |
    |<- AUTH_STATE_CHANGED ----|                              |                    |
```

### 重要な学び（TASK-FIX-GOOGLE-LOGIN-001）

OAuth Implicit Flowでは、コールバックURLのパラメータは**クエリパラメータ（`?`）ではなくハッシュフラグメント（`#`）**で返される。stateパラメータもハッシュフラグメントに含まれるため、`url.hash.slice(1)`から`URLSearchParams`でパースする必要がある。

---

## 既存ファイル修正設計

### authHandlers.ts修正（line 96-101付近）

```typescript
// Before: signInWithOAuth呼び出し（state なし）
const { data, error } = await supabase.auth.signInWithOAuth({
  provider,
  options: {
    redirectTo: `aiworkflow://auth/callback`,
  },
});

// After: state生成してqueryParamsに追加
import { stateManager } from "../infrastructure/stateManager";

const state = stateManager.generate(provider);
const { data, error } = await supabase.auth.signInWithOAuth({
  provider,
  options: {
    queryParams: { state },
    redirectTo: `aiworkflow://auth/callback`,
  },
});
```

### index.ts修正（handleAuthCallback関数内）

```typescript
// handleAuthCallback関数内にstate検証を追加
import { stateManager } from "./infrastructure/stateManager";

function handleAuthCallback(url: URL): void {
  // ハッシュフラグメントからパラメータ抽出（#ではなく?で返るケースはない）
  const hashParams = new URLSearchParams(url.hash.slice(1));
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  const state = hashParams.get("state");
  const providerToken = hashParams.get("provider_token");

  // プロバイダー検出
  const provider = detectProvider(url, providerToken);

  // state検証（stateがない場合、または検証失敗の場合はエラー）
  if (!state || !stateManager.validate(state, provider)) {
    // エラーハンドリング: AUTH_STATE_CHANGEDでエラー通知
    mainWindow?.webContents.send("AUTH_STATE_CHANGED", {
      event: "SIGNED_OUT",
      error: "Invalid or expired authentication state",
      errorCode: "CSRF_VALIDATION_FAILED",
    });
    return;
  }

  // 以降: トークン処理を続行
  // ...
}
```

---

## アーキテクチャ層別設計

| 層           | 設計内容                                                    | ファイル                                               |
| ------------ | ----------------------------------------------------------- | ------------------------------------------------------ |
| Main Process | StateManagerモジュール新規作成（generate/validate/cleanup） | `apps/desktop/src/main/infrastructure/stateManager.ts` |
| IPC通信      | authHandlers.ts修正（state生成、queryParams追加）           | `apps/desktop/src/main/ipc/authHandlers.ts`            |
| Main Process | index.ts修正（handleAuthCallback内でstate検証）             | `apps/desktop/src/main/index.ts`                       |
| Preload      | 変更不要（既存チャネル使用）                                | -                                                      |
| Renderer     | 変更不要（AUTH_STATE_CHANGEDイベント経由でエラー受信）      | -                                                      |

---

## 設計判断

| 選択肢                      | 採用   | 理由                                              |
| --------------------------- | ------ | ------------------------------------------------- |
| Map（メモリ）でstate保存    | 採用   | ディスク永続化不要、セキュリティ上安全            |
| シングルトンパターン        | 採用   | Main Processで1インスタンスのみ必要               |
| crypto.randomBytes(32)      | 採用   | 暗号学的に安全な乱数生成（256bit）                |
| electron-store等にstate保存 | 不採用 | ディスク保存はセキュリティリスク                  |
| UUIDv4でstate生成           | 不採用 | randomBytesより低エントロピー（122bit vs 256bit） |

---

## 参照資料

| 資料名               | パス                                                                              | 説明                             |
| -------------------- | --------------------------------------------------------------------------------- | -------------------------------- |
| 認証アーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | Supabase + Electron認証          |
| セキュリティ設計原則 | `.claude/skills/aiworkflow-requirements/references/security-principles.md`        | OAuth/CSRF対策原則               |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                                      | Phase 1成果物                    |
| IPC認証チャネル      | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`               | AUTH_STATE_CHANGEDペイロード仕様 |
| セキュリティ運用     | `.claude/skills/aiworkflow-requirements/references/security-operations.md`        | セキュリティイベントログ設計     |

---

## 実行手順

1. 参照資料を確認する
2. 実行タスクを順番に実施する
3. 各タスクの成果物を作成する
4. 完了条件を全て満たすことを確認する
5. 成果物を所定のパスに配置する

---

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント           | 契約定義                                                          |
| ---------------------- | ----------------------------------------------------------------- |
| Supabase OAuth API     | signInWithOAuth options.queryParams に state を追加               |
| カスタムプロトコル     | aiworkflow://auth/callback#...state=xxx でstateが返却される       |
| IPC通信                | AUTH_STATE_CHANGED ペイロードにerror/errorCodeフィールド追加      |
| StateManagerモジュール | generate(provider) → string / validate(state, provider) → boolean |

---

## 多角的チェック観点（AIが判断）

本Phaseの成果物に対して、以下の観点から品質を検証する:

| 観点       | 確認内容                                 |
| ---------- | ---------------------------------------- |
| 完全性     | 全ての要求事項が漏れなく反映されているか |
| 一貫性     | 他のPhase成果物との矛盾がないか          |
| 正確性     | 技術的な記述が正確であるか               |
| 追跡可能性 | 要件→設計→実装→テストの追跡が可能か      |

---

## 成果物

| 成果物           | パス                        | 説明           |
| ---------------- | --------------------------- | -------------- |
| 設計ドキュメント | `outputs/phase-2/design.md` | 本ドキュメント |

---

## 完了条件

- [ ] StateManagerクラス設計が完了している
- [ ] インターフェース定義（StateEntry）が完了している
- [ ] データフローが設計されている
- [ ] 既存ファイル修正箇所が特定されている
- [ ] セキュリティ設計方針が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

| サブタスク     | 状態 | 備考 |
| -------------- | ---- | ---- |
| (実行時に記録) | -    | -    |

---

## タスク100%実行確認【必須】

- [ ] 全ての実行タスクを完了した
- [ ] 全ての成果物を作成した
- [ ] 全ての完了条件を満たした
- [ ] 成果物の品質を多角的チェック観点で検証した

> **注意**: このチェックリストが全てチェックされるまで、次のPhaseに進んではならない。

## 次のPhase

Phase 3: 設計レビューゲート
