# TASK-SC-LLM-PURPOSE-WIRE-001 実装ガイド

## Part 1: 中学生向けの説明

### なぜ必要か

この変更の目的は、スキルの「ひとことで言うと何をするか」を、説明文そのものではなく AI が整理した短い要約に置き換えることです。そうしないと、あとで見返したときに長い設計メモがそのまま残って読みづらくなります。

### たとえば

料理の注文票を考えると分かりやすいです。レシピ本をそのまま注文票に貼るのではなく、料理人が読んで「今日は栄養バランスのよい定食を作る」と短く書き直したほうが分かりやすいです。今回の `extract-purpose` はレシピ本、LLM は料理人、`purpose` は注文票の短い説明です。

### 何をしたか

1. `extract-purpose` という指示書を読み込む
2. スキル名と説明文を AI に渡す
3. AI の返答から `summary` だけを取り出して `purpose` に入れる

## Part 2: 技術者向けの説明

### 型と責務

```ts
interface LlmGenerateOptions {
  system: string;
  user: string;
}

interface LlmClient {
  generate(options: LlmGenerateOptions): Promise<string>;
}
```

### 実装フロー

```ts
const purposeAgentDef = await this.resourceLoader.loadAgent("extract-purpose", {
  signal,
});
const skillInput = `スキル名: ${options.name}\n説明: ${options.description}`;
const response = await this.llmClient.generate({
  system: purposeAgentDef,
  user: skillInput,
});
const purpose = this.normalizePurposeResponse(response);
```

### 返答の扱い

- JSON 文字列または `json コードブロック` を返した場合:
  `summary` を優先採用
- JSON ではない場合:
  trim 済み文字列をそのまま採用
- 空文字の場合:
  空文字を返す
- `llmClient` 未設定または `loadAgent` / `generate` 失敗時:
  `null` を返し、呼び出し元で `options.description` にフォールバック

### エッジケース

- `extract-purpose` が JSON 以外を返しても purpose を失わない
- abort 系例外は握りつぶさず rethrow する
- `create` モード以外には purpose 抽出を波及させない

### 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。
