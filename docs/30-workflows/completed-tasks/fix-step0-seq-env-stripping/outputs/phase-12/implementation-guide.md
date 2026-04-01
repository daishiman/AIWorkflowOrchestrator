# Implementation Guide

## Part 1: 中学生レベルの説明

環境変数は、プログラムが動くときに持っていく「持ち物」のようなものです。`PATH` は「どこに道具があるか」を覚えていて、`ANTHROPIC_API_KEY` は AI サービスの鍵です。

たとえば、引っ越しで必要な荷物を 1 個だけ持っていくと、到着先でドアを開けるための鍵や地図を忘れて困ります。今回の bug はそれと同じで、鍵だけ渡して地図を落としていたため `node` を見つけられませんでした。

今回の修正は、いま持っている荷物を全部そのまま渡してから、最後に AI の鍵だけ差し替えるやり方です。こうすると、道具も鍵も両方そろいます。

## Part 2: 技術者向け

### 対象

| ファイル                                                                         | 内容                          |
| -------------------------------------------------------------------------------- | ----------------------------- |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`                          | `callSDKQuery()` の env merge |
| `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts`      | 既存 auth suite の拡張        |
| `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts` | baseline 維持                 |

### 変更点

```ts
private async callSDKQuery(
  prompt: string,
  options: SDKQueryOptions,
): Promise<{ stream: () => AsyncIterable<unknown> }>
```

```ts
env: { ...process.env, ANTHROPIC_API_KEY: apiKey }
```

`process.env` をスプレッドし、`ANTHROPIC_API_KEY` を最後に置くことで、`PATH` と `HOME` を保持したまま AuthKeyService の値を優先できる。

### エッジケース

- `apiKey` がない場合は `getApiKey()` 側で止まる
- `process.env.ANTHROPIC_API_KEY` があっても AuthKeyService が勝つ
- `PATH` が残るので `node cli.js` の解決が壊れない

### 設定値

| 値                  | 意味                                 |
| ------------------- | ------------------------------------ |
| `PATH`              | 子プロセスでコマンドを探すための経路 |
| `ANTHROPIC_API_KEY` | AI サービスの認証キー                |
