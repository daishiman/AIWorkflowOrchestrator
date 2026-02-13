# 実装ガイド: SDK統合テスト有効化

## Part 1: 概念的説明（中学生レベル）

### 日常の例え話

テストは、教科書の練習問題の「答え合わせ」のようなものです。

学校の教科書には、問題の後に正しい答えが載っていますよね。プログラムの世界にも同じ仕組みがあります。「テスト」は、プログラムが正しく動くかどうかを確認するための「答え合わせ問題集」です。

今回の作業を例えると:

- **教科書が新しい版に変わった**（SDKが統合された）
- でも**17問の答え欄が空白のまま**だった（TODOコメント）
- **正しい答えを書き込んだ**のが今回の作業

### なぜ必要か

答え欄が空白のままだと、問題が正しく出題されているか、教科書が正しいかを確認できません。特に以下のような大事な確認ができませんでした:

1. **認証チェック**: 「IDカードを持っている人だけ入れる」仕組みが正しく動くか
2. **エラー処理**: 何か問題が起きたとき、「ここが壊れています」と正しく教えてくれるか
3. **タイムアウト**: 30秒待っても返事がないとき、「返事がありません」と教えてくれるか

### 何をしたか

17問の空欄を全て埋めました:

- **3問**: パラメータ（設定値）が正しく渡されることの確認
- **1問**: 30秒待っても返事がない場合の動作確認
- **10問**: エラーが起きた場合の動作確認
- **3問**: APIキー（認証に使う鍵）の管理確認

## Part 2: 開発者向け技術詳細

### 変更概要

SDK統合前にTDDのRed Phaseとして作成されたプレースホルダーテスト17箇所を、SDK統合済みの実装に対する実質的なテストに変換した。

### 実装カテゴリ（17件）

| カテゴリ                     | 件数 | 実装内容                                                                             |
| ---------------------------- | ---- | ------------------------------------------------------------------------------------ |
| スキル名マッピング・パス検証 | 2    | `mockCreate` 呼び出し引数の `model/system/max_tokens/messages` を検証                |
| タイムアウト制御             | 1    | 30秒タイムアウトの挙動を検証（本タスクではモジュールモック制約により直接エラー注入） |
| エラーハンドリング           | 4    | `mockRejectedValueOnce` + `rejects.toThrow` で例外経路を検証                         |
| 認証・リクエスト設定         | 6    | APIキー設定、Bearerヘッダー、system prompt、max_tokens 等の設定確認                  |
| HTTPエラー・APIエラー        | 3    | `401/500` を `Object.assign(new Error(), { status })` で再現                         |
| SDK障害・パラメータ検証      | 1    | SDK障害時のメッセージ伝播と呼び出しパラメータ整合性を検証                            |

### コード例1: `mockCreate` 設定パターン

```typescript
vi.mock("@anthropic-ai/claude-code", () => ({
  claudeCode: {
    create: vi.fn(),
  },
}));

mockCreate.mockResolvedValue({
  id: "test-id",
  status: "completed",
});
```

### コード例2: `vi.advanceTimersByTimeAsync` パターン

```typescript
vi.useFakeTimers();
const promise = executor.execute(params);
await vi.advanceTimersByTimeAsync(30000);
await expect(promise).rejects.toThrow("timeout");
vi.useRealTimers();
```

補足: `skill-executor.test.ts` は `vi.mock("../agent-client")` により内部タイマー実装が置き換わるため、本タスクでは `mockRejectedValueOnce(new Error("Request timeout"))` の直接注入で同等の失敗経路を検証した。

### P9対策の詳細

`vi.clearAllMocks()`は呼び出し記録（`.mock.calls`）をクリアするが、`mockImplementation`で設定された実装はリセットしない。そのため、`beforeEach`でモックのデフォルト動作を明示的に再設定する必要がある:

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  mockAgentAPI.query.mockResolvedValue({
    content: JSON.stringify({ changes: [] }),
    usage: { inputTokens: 100, outputTokens: 50 },
  });
});
```

### 変更ファイル一覧

| ファイル                | 変更箇所                                              | 変更種別              |
| ----------------------- | ----------------------------------------------------- | --------------------- |
| skill-executor.test.ts  | SDK-SE-05, SDK-SE-13, SDK-SE-14 + P9対策beforeEach x2 | TODO有効化 + バグ修正 |
| agent-client.test.ts    | AC-06, SDK-AC-01~06, SDK-AC-09~10                     | TODO有効化            |
| sdk-integration.test.ts | INT-02, INT-05, SDK-INT-01                            | TODO有効化            |
