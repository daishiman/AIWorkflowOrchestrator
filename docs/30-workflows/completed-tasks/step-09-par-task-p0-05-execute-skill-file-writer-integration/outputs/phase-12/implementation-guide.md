# TASK-P0-05: execute-skill-file-writer-integration 実装ガイド

## Part 1: 中学生レベル概念説明

### なぜ必要か

AIに「スキルを作って」と頼むと、AIはプログラムのコードを生成して返してくれます。でもこれまで、その返ってきたコードを **ファイルとして保存する仕組み** がありませんでした。AIが一生懸命コードを作ってくれても、それがどこにも保存されないまま消えてしまう状態だったのです。

### 何をするか

このタスクでは、3つのことを実現しました：

1. **AIの回答を読み取る** — AIが返したテキストの中から、` ``` ` で囲まれたコード部分だけを取り出す
2. **必要な部分を分類する** — 取り出したコードを「メインファイル」「エージェント定義」「スクリプト」「参考資料」に分ける
3. **ファイルとして保存する** — 分類したコードを正しい場所にファイルとして書き出す

### たとえば

手紙（AIの回答）を受け取ったとき、その中には「お知らせ」「申込用紙」「地図」など複数の書類が入っていることがあります。封筒から取り出して（パース）、種類ごとに分けて（分類）、それぞれ正しいファイルに閉じる（保存）——今回の実装はまさにこれと同じ流れです。

### 結果どうなるか

AIがスキルのコードを生成したら、自動的にファイルシステムに保存されるようになりました。次からはそのスキルをすぐに使うことができます。保存に失敗しても、AI自体の実行結果は消えません（安全設計）。

---

## Part 2: 技術詳細

### 型定義

#### SkillGeneratedContent（既存・変更なし）

```typescript
interface SkillGeneratedContent {
  skillMd: string;
  agents: Array<{ name: string; content: string }>;
  scripts: Array<{ name: string; content: string }>;
  references: Array<{ name: string; content: string }>;
}
```

#### RuntimeSkillCreatorExecuteResult（拡張フィールド）

```typescript
interface RuntimeSkillCreatorExecuteResult {
  // ... 既存フィールド ...

  /** SkillFileWriter.persist() の結果。persist 未実行またはスキップ時は null */
  persistResult?: { skillPath: string; files: string[] } | null;

  /** persist 失敗時のエラーメッセージ。成功またはスキップ時は null */
  persistError?: string | null;
}
```

### API シグネチャ

#### parseLlmResponseToContent

```typescript
function parseLlmResponseToContent(
  sdkEvents: SkillCreatorSdkEvent[],
): SkillGeneratedContent | null;
```

- `assistant` / `result` イベントのテキストを結合
- 正規表現でコードブロックを抽出
- 見出し行（`### filepath`）でファイル分類
- `agents/*.md` / `references/*.md` は Writer 側で二重に `.md` が付かないよう、拡張子を除去して正規化
- コードブロック 0 件の場合は `null`（正常ケース）

#### execute() 内の persist フロー

```typescript
// execute() 内、SDKイベント正規化後に挿入
const content = parseLlmResponseToContent(sdkEvents);

if (content && this.skillFileWriter) {
  persistResult = await this.skillFileWriter.persist(
    planResult.skillName,
    content,
    { overwrite: true },
  );
}
```

### エラーハンドリング

| ケース                                | 挙動                                                   |
| ------------------------------------- | ------------------------------------------------------ |
| パース結果 null（コードブロックなし） | `persistResult: null`, persist 未呼出                  |
| skillFileWriter 未DI                  | `console.warn` + persist スキップ                      |
| persist 成功                          | `persistResult: { skillPath, files[] }`                |
| persist 失敗                          | `persistError: エラーメッセージ`, `success: true` 維持 |
| execute 自体が失敗                    | persist 未呼出                                         |

### 設定パラメータ

| パラメータ  | 値                                 | 説明                         |
| ----------- | ---------------------------------- | ---------------------------- |
| `overwrite` | `true`（デフォルト）               | 既存ファイルの上書き許可     |
| `basePath`  | SkillFileWriter コンストラクタ引数 | 書き出し先ルートディレクトリ |

### 変更ファイル一覧

| ファイル                                                                                                 | 変更内容                                         |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `packages/shared/src/types/skillCreator.ts`                                                              | `persistResult`, `persistError` フィールド追加   |
| `apps/desktop/src/main/services/runtime/parseLlmResponseToContent.ts`                                    | 新規作成（LLM応答パーサー）                      |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                    | `execute()` に persist 連携追加                  |
| `apps/desktop/src/main/services/runtime/__tests__/parseLlmResponseToContent.test.ts`                     | パーサーUT（14件、見出し揺れ・`.md` 正規化含む） |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.persist-integration.test.ts` | Facade persist UT（11件）                        |
