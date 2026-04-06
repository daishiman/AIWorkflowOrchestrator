# Phase 12 実装ガイド

## Part 1

### `auth-key:*` API キー設定 UI とは何か

#### なぜ必要か

API キーがないと、`SettingsView` の主導線でも `SkillLifecyclePanel` の補助導線でも、スキル実行の準備を始められません。

たとえば、家の鍵がないと玄関を開けられないのと同じで、API キーがなければアプリは外部サービスに安全に接続できません。

#### 何をするか

この UI は、キーの有無を見て、足りないときだけ入力案内を出します。`SettingsView` は主導線、`SkillLifecyclePanel` は補助導線です。

| 機能        | 説明                       | 例                                                                |
| ----------- | -------------------------- | ----------------------------------------------------------------- |
| 状態確認    | 設定済みかを確認する       | 起動時に `auth-key:exists` を呼ぶ                                 |
| 入力案内    | 未設定時に誘導する         | `ApiKeySettingsPanel` を開く                                      |
| 保存前確認  | 入力内容をその場で確認する | local validation の後に `auth-key:validate` で backend 検証を行う |
| 保存 / 削除 | 設定を残す / 消す          | `auth-key:set` / `auth-key:delete`                                |

`auth-key:validate` は Main 側の契約として残しているだけでなく、現行 UI の保存フローでも呼び出している。

## Part 2

### 型定義

```ts
export type ApiKeyStatus = "not_set" | "validating" | "configured" | "error";

export interface AuthKeyExistsResponse {
  exists: boolean;
  source: "saved" | "env-fallback" | "not-set";
}

export interface AuthKeyAPI {
  set(key: string): Promise<AuthKeySetResponse>;
  exists(): Promise<AuthKeyExistsResponse>;
  validate(key: string): Promise<AuthKeyValidateResponse>;
  delete(): Promise<AuthKeyDeleteResponse>;
}
```

### API シグネチャ

- `authKey.exists(): Promise<AuthKeyExistsResponse>`
- `authKey.set(key: string): Promise<AuthKeySetResponse>`
- `authKey.validate(key: string): Promise<AuthKeyValidateResponse>`
- `authKey.delete(): Promise<AuthKeyDeleteResponse>`

### 使用例

```ts
const status = await window.electronAPI.authKey.exists();
if (!status.exists) {
  // `ApiKeySettingsPanel` で入力を促す
}

const result = await window.electronAPI.authKey.set("sk-ant-api03-xxxx");
if (!result.success) {
  console.error(result.error);
}
```

### エラーハンドリング

- 空文字と trim 後空文字は拒否する
- 失敗時は API キーの生値を返さない
- `source` は `saved` / `env-fallback` / `not-set` の 3 値だけにする
- `auth-key:validate` は contract として残し、現行 UI は local validation の後に backend validation を行う

### エッジケース

- すでに同じキーが保存されている
- `env-fallback` で利用可能だが保存はしていない
- 削除後に再読み込みで `not-set` に戻る
- 連続操作で `configured` / `error` が揺れる

### 設定可能なパラメータと定数一覧

| 定数 / パラメータ | 値                                                | 用途                           |
| ----------------- | ------------------------------------------------- | ------------------------------ |
| `ApiKeyStatus`    | `not_set` / `validating` / `configured` / `error` | UI 状態                        |
| `source`          | `saved` / `env-fallback` / `not-set`              | 存在判定の根拠                 |
| `auth-key:*`      | 4 チャネル                                        | Main / Preload / Renderer 契約 |
| `blocked`         | Phase 13                                          | user approval 待ち             |

### Phase 11 証跡参照

- `../phase-11/screenshots/TC-11-01-skill-authkey-initial.png`
- `../phase-11/screenshots/TC-11-02-skill-authkey-action.png`
- `../phase-11/screenshots/TC-11-03-skill-authkey-fallback.png`
- `../phase-11/manual-test-result.md` の TC-11-04 は baseline reuse
- `../phase-11/screenshot-plan.json`
- `../phase-11/screenshot-coverage.md`
