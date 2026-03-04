# 実装ガイド

## Part 1: 中学生向けの説明

### この改善は何を解決するのか

この機能は、道具を使う前に「準備ができているか」を先に確認する仕組みです。

日常で言うと、電車に乗る前に定期券が入っているかを改札の手前で確認するのと同じです。

- 定期券がないまま改札に行くと、その場で止まって混乱します。
- 先に確認すれば、改札に着く前にチャージや設定ができます。

今回の画面も同じで、スキル実行の前に API キーがあるかをチェックします。
なければ、すぐに「設定画面で登録してください」と案内して、実行を止めます。

### この機能でできること

| できること       | 説明                         | 例                       |
| ---------------- | ---------------------------- | ------------------------ |
| 事前チェック     | 実行前に必要な鍵があるか確認 | 「鍵なし」を実行前に発見 |
| 失敗理由の明確化 | 失敗の種類をはっきり伝える   | `AUTHENTICATION_ERROR`   |
| 次の行動を案内   | どこを直せば良いか表示       | 設定画面へ誘導           |

### なぜ先に止めるのか

- 無駄な実行を減らせる
- エラーの原因が分かりやすい
- ユーザーが次に何をすべきか迷わない

## Part 2: 技術者向け詳細

### 実装範囲

- Main IPC: `skill:execute` 失敗応答に `errorCode?: string` を追加
- Preload: `safeInvokeUnwrap` で `errorCode` を `Error.code` に転写
- Renderer: 共通 preflight（`preflightSkillExecutionAuth`）を AgentView / Hook / Store で使用
- Auth IPC: `auth-key:exists` が env fallback (`ANTHROPIC_API_KEY`) を含む

### 型・インターフェース

```ts
export type SkillExecuteFailure = {
  success: false;
  error: string;
  errorCode?: string;
};

export interface AuthKeyExistsResponse {
  exists: boolean;
}
```

### API シグネチャ

```ts
// Renderer -> Main
window.electronAPI.skill.execute(request: SkillExecutionRequest): Promise<SkillExecutionResponse>

// Renderer -> Main (preflight)
window.electronAPI.authKey.exists(): Promise<{ exists: boolean }>
```

### 使用例

```ts
const preflight = await preflightSkillExecutionAuth();
if (!preflight.ok) {
  setError(preflight.error);
  return;
}
await executeSkill(skillId, input);
```

### エラーハンドリング

| ケース         | 発生層    | 挙動                                             |
| -------------- | --------- | ------------------------------------------------ |
| APIキー未設定  | preflight | execute を呼ばず `AUTHENTICATION_ERROR` を返す   |
| 実行時認証失敗 | Main      | `errorCode: AUTHENTICATION_ERROR` 付きで失敗返却 |
| 一般例外       | Main      | 既存サニタイズ方針で `error` のみ返却            |

### 設定値・定数

| 名称                   | 値/用途                             |
| ---------------------- | ----------------------------------- |
| `ANTHROPIC_API_KEY`    | `auth-key:exists` fallback 判定対象 |
| `AUTHENTICATION_ERROR` | 認証エラー識別コード                |

### エッジケース

- `window.electronAPI.authKey` が未公開の環境では preflight をスキップして後方互換挙動にフォールバック。
- preflight 通過後でも実行時に認証失敗する可能性があるため、Main 側の最終防衛を維持。
