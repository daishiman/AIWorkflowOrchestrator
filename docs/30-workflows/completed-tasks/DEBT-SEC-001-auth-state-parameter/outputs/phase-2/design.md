# Phase 2: 設計ドキュメント

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 2                                 |
| 機能名 | DEBT-SEC-001-auth-state-parameter |
| 作成日 | 2026-02-06                        |
| 状態   | 完了                              |

## StateManagerモジュール設計

### インターフェース定義

```typescript
type OAuthProvider = "google" | "github" | "discord";

interface StateEntry {
  state: string;
  provider: OAuthProvider;
  createdAt: number;
  expiresAt: number;
}

const STATE_EXPIRY_MS = 10 * 60 * 1000; // 10分
```

### StateManagerクラス設計

```typescript
class StateManager {
  private states: Map<string, StateEntry> = new Map();
  generate(provider: OAuthProvider): string;
  validate(state: string, provider: OAuthProvider): boolean;
  cleanup(): void;
}

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

## セキュリティ設計方針

| 方針               | 詳細                                                      |
| ------------------ | --------------------------------------------------------- |
| メモリのみ保存     | Mapはプロセス終了時に消失。ディスクには一切永続化しない   |
| 高エントロピー     | crypto.randomBytes(32)で256bit乱数（推測不可能）          |
| ワンタイムユース   | 検証成功後にMapから即座に削除（リプレイ攻撃防止）         |
| 有効期限           | 10分経過で自動無効化（放置されたstateの悪用防止）         |
| プロバイダー紐付け | stateとproviderのペアで検証（クロスプロバイダー攻撃防止） |

## データフロー設計

```
[Renderer] --(auth:login)--> [Main Process]
                                   |
                              stateManager.generate(provider)
                                   |
                              signInWithOAuth({ queryParams: { state } })
                                   |
                              [External Browser] → [Supabase]
                                   |
                              callback: aiworkflow://auth/callback#...&state=xxx
                                   |
                              handleAuthCallback(url)
                                   |
                              hashParams.get("state")
                                   |
                              stateManager.validate(state, provider)
                                   |
                              [成功] → トークン処理続行
                              [失敗] → AUTH_STATE_CHANGED(error)
```

## 既存ファイル修正設計

### authHandlers.ts修正

- `stateManager.generate(provider)` でstate生成
- `options.queryParams: { state }` を追加

### index.ts修正（handleAuthCallback関数内）

- `hashParams.get('state')` でstateパラメータ抽出
- state形式バリデーション: `/^[a-f0-9]{64}$/`
- `stateManager.validate(state, provider)` で検証
- 検証失敗時: `AUTH_STATE_CHANGED` でエラー通知し早期リターン

## アーキテクチャ層別設計

| 層           | 設計内容                                                    | ファイル                                               |
| ------------ | ----------------------------------------------------------- | ------------------------------------------------------ |
| Main Process | StateManagerモジュール新規作成（generate/validate/cleanup） | `apps/desktop/src/main/infrastructure/stateManager.ts` |
| IPC通信      | authHandlers.ts修正（state生成、queryParams追加）           | `apps/desktop/src/main/ipc/authHandlers.ts`            |
| Main Process | index.ts修正（handleAuthCallback内でstate検証）             | `apps/desktop/src/main/index.ts`                       |
| Preload      | 変更不要（既存チャネル使用）                                | -                                                      |
| Renderer     | 変更不要（AUTH_STATE_CHANGEDイベント経由でエラー受信）      | -                                                      |

## 設計判断

| 選択肢                      | 採用   | 理由                                              |
| --------------------------- | ------ | ------------------------------------------------- |
| Map（メモリ）でstate保存    | 採用   | ディスク永続化不要、セキュリティ上安全            |
| シングルトンパターン        | 採用   | Main Processで1インスタンスのみ必要               |
| crypto.randomBytes(32)      | 採用   | 暗号学的に安全な乱数生成（256bit）                |
| electron-store等にstate保存 | 不採用 | ディスク保存はセキュリティリスク                  |
| UUIDv4でstate生成           | 不採用 | randomBytesより低エントロピー（122bit vs 256bit） |

## 完了確認

- [x] StateManagerクラス設計が完了している
- [x] インターフェース定義（StateEntry）が完了している
- [x] データフローが設計されている
- [x] 既存ファイル修正箇所が特定されている
- [x] セキュリティ設計方針が明記されている
- [x] 本Phase内の全タスクを100%実行完了
