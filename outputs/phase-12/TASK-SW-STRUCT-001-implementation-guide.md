# TASK-SW-STRUCT-001 実装ガイド（Phase 12）

## Part 1: 中学生レベルの概念説明

### 何を直したか

スキル作成アプリの「作成モード」で、スキルの設計メモを作る部分を整理しました。
これまでは、メモの「目的」に長い命令文が入っていて、あとで自動生成する道具が読み取りにくい状態でした。

### 日常の例え

たとえば、遠足の持ち物メモに「おにぎり」と書くところへ、先生への長いお願い文を書いてしまうようなものです。
メモの役割は「何を持っていくか」を短く正しく書くことなので、長い説明文が混ざると次の人が困ります。

### なぜ必要か

スキルの作成では、あとから `SKILL.md` を自動生成します。
そのため、最初のメモは「説明文をそのまま置く」「使う部品名を並べる」といった、読みやすくて壊れにくい形にしておく必要があります。

### 何を変えたか

- `purpose` には `options.description` を入れるようにしました
- `agents` には `["extract-purpose", "plan-structure"]` を入れるようにしました
- `features` はまだ空配列のままにしました
- 途中で失敗したときは `null` を返して、あと続きの処理が止まらないようにしました

## Part 2: 技術者向け実装ガイド

### 修正対象

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`

### 型定義

```ts
interface StructurePlanJson {
  skillName: string;
  description: string;
  purpose: string;
  features: string[];
  agents: string[];
  triggers?: string[];
  anchors?: Anchor[];
}
```

### API シグネチャ

```ts
async createSkill(options: CreateSkillOptions): Promise<string>
private async runCreateWorkflow(
  options: CreateSkillOptions,
): Promise<StructurePlanJson | null>
private async generateSkillMd(
  skillDir: string,
  structurePlan: StructurePlanJson,
): Promise<void>
```

### 使用例

```ts
const skillPath = await service.createSkill({
  name: "test-skill",
  description: "テスト用スキル",
  mode: "create",
});
```

`createSkill()` は `runCreateWorkflow()` で構造計画を作り、その後 `init_skill.js` と `generateSkillMd()` を順番に実行します。

### エラーハンドリング

- `runCreateWorkflow()` は内部例外が起きたら `null` を返します
- `createSkill()` は `structurePlan` が `null` でも `ensureSkillMdExists()` にフォールバックします
- `generateSkillMd()` は一時 JSON を `os.tmpdir()` に書き出し、`finally` で削除します
- `generate_skill_md.js` 実行に失敗した場合も `ensureSkillMdExists()` へフォールバックします

### エッジケース

| ケース                         | 挙動                                               |
| ------------------------------ | -------------------------------------------------- |
| `description` が空文字列       | `purpose` も空文字列として扱う                     |
| `options.name` が空文字列      | `createSkill()` の入力バリデーションでエラーにする |
| `description` の getter が例外 | `runCreateWorkflow()` は `null` を返す             |
| `generate_skill_md.js` が失敗  | `ensureSkillMdExists()` にフォールバックする       |
| 一時ファイル削除が失敗         | non-fatal として無視する                           |

### 設定 / 定数

| 項目                            | 値 / 意味                                         |
| ------------------------------- | ------------------------------------------------- |
| `MAX_SKILL_NAME_LENGTH`         | スキル名の上限長                                  |
| `generate_skill_md.js --plan`   | 一時 JSON の入力パス                              |
| `generate_skill_md.js --output` | 生成先 `SKILL.md` の出力パス                      |
| `purpose`                       | `options.description` をそのまま橋渡しする        |
| `agents`                        | `extract-purpose` / `plan-structure` の名前リスト |

### 検証観点

- `purpose === options.description`
- `agents === ["extract-purpose", "plan-structure"]`
- `features === []`
- `runCreateWorkflow()` の例外時に `null` を返す
