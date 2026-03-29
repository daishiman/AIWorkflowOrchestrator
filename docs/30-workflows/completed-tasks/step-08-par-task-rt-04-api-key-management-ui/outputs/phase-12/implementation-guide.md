# Implementation Guide — TASK-RT-04

## Part 1: 中学生向けの説明

### なぜ必要か

この機能が必要な理由は、AI を使う前に「正しい利用者かどうか」を安全に確認する必要があるためです。キー入力ができないと、機能があっても利用者が使い始められません。

### 何をするか

たとえば、図書館で本を借りるときに利用カードを見せる流れに近いです。アプリでは API キーがその利用カードの役割になります。

- キーを入力する
- 入力内容を確認する
- 保存する
- 不要になったら削除する
- 状態（未設定/検証中/設定済み/エラー）を表示する

## Part 2: 技術詳細

### current contract と target delta

- current contract: `window.electronAPI.authKey.set/exists/delete` を利用
- target delta: UI task として `SkillLifecyclePanel` へ API キー設定パネルを統合

### 型定義（TypeScript）

```typescript
export type ApiKeyStatus = "not_set" | "validating" | "configured" | "error";

interface ApiKeySettingsPanelProps {
  onStatusChange?: (status: ApiKeyStatus) => void;
}
```

### APIシグネチャ

- `window.electronAPI.authKey.exists(): Promise<AuthKeyExistsResponse>`
- `window.electronAPI.authKey.set(key: string): Promise<AuthKeySetResponse>`
- `window.electronAPI.authKey.delete(): Promise<AuthKeyDeleteResponse>`

### 使用例

```ts
const result = await window.electronAPI.authKey.set("sk-ant-api03-xxxx");
if (!result.success) {
  console.error(result.error);
}
```

### エラーハンドリング

- 空入力: UI で即時バリデーションエラー
- 形式不正: UI で即時バリデーションエラー
- IPC/保存失敗: `apiError` を表示
- delete 失敗: エラーメッセージ表示

### エッジケース

- env-fallback ソースを `exists()` で返した場合の表示切り替え
- 保存直後に削除した場合の状態遷移
- 初期ロード失敗時の `not_set` フォールバック

### 設定可能なパラメータと定数一覧

| 項目          | 値                                    | 用途                 |
| ------------- | ------------------------------------- | -------------------- |
| APIキー最大長 | 200                                   | クライアント入力制限 |
| 形式チェック  | `^sk-ant-api\\d{2}-`                  | 事前入力検証         |
| 状態種別      | `not_set/validating/configured/error` | UI状態管理           |

### Phase 11 証跡参照

- `../phase-11/screenshots/TC-11-01-skill-authkey-initial.png`
- `../phase-11/screenshots/TC-11-02-skill-authkey-action.png`
- `../phase-11/screenshots/TC-11-03-skill-authkey-fallback.png`
