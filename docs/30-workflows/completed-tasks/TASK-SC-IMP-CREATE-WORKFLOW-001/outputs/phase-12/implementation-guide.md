# Implementation Guide: TASK-SC-IMP-CREATE-WORKFLOW-001

## Part 1: 中学生レベルの説明

### たとえば、料理の下ごしらえ

`runCreateWorkflow` は、料理でいう「レシピを読み、材料の準備をする係」です。  
これまではこの係が何もしないままだったので、`create` モードでスキルを作っても、完成品の中身を組み立てる準備が足りませんでした。

今回の修正で、この係は `resourceLoader.loadAgent` を使って必要なレシピを読み、スキルの設計図を作るようになりました。  
レシピが見つからないときは、料理自体を止めるのではなく、まずは最低限の形で続けられるように `null` を返す仕組みにしています。

### なぜ必要か

- `create` モードでスキルを作るとき、何を作るかの土台が必要だから
- 先に設計図を作っておくと、あとで `generate_skill_md.js` に渡せるから
- 失敗時に止まりすぎず、後続処理を継続できるから

### 何をするか

- `runCreateWorkflow` で `extract-purpose` と `plan-structure` を読み込む
- `options.name` と `options.description` から `StructurePlanJson` を組み立てる
- 読み込みに失敗したら `null` を返す
- `createSkill()` は設計図を local variable で受け取る
- `generateSkillMd()` への最終接続はタスクA完了後に行う

### 視覚検証

- UI/UX 変更はないため、スクリーンショット撮影は不要
- 根拠: `outputs/phase-11/manual-test-result.md` にも「UI/UX変更を含まないため、スクリーンショット撮影は不要」と記載済み

---

## Part 2: 技術詳細

### 変更ファイル

| ファイル                                                                     | 変更内容                                                                                                             |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | `StructurePlanJson` 追加、`runCreateWorkflow` 実装、`createSkill()` の `create` 分岐を local variable handoff に変更 |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | `runCreateWorkflow` の戻り値を直接検証するように更新                                                                 |

### 追加した型

```typescript
interface StructurePlanJson {
  skillName: string;
  description: string;
  purpose: string;
  features: string[];
  agents: string[];
  triggers?: string[];
  anchors?: string[];
}
```

### API シグネチャ

```typescript
private async runCreateWorkflow(
  options: CreateSkillOptions,
): Promise<StructurePlanJson | null>
```

### 実装の流れ

1. `createSkill()` が `mode === "create"` を受ける
2. `runCreateWorkflow(options)` を呼ぶ
3. `resourceLoader.loadAgent("extract-purpose")` と `resourceLoader.loadAgent("plan-structure")` を読む
4. `StructurePlanJson` を組み立てる
5. `createSkill()` は `structurePlan` を local variable として保持する
6. `generateSkillMd(skillDir, structurePlan)` への接続はタスクA完了後に行う

### 代表コード

```typescript
let structurePlan: StructurePlanJson | null = null;

switch (options.mode) {
  case "create":
    structurePlan = await this.runCreateWorkflow(options);
    break;
  // ...
}

void structurePlan; // タスクA完了後に generateSkillMd へ接続
```

```typescript
private async runCreateWorkflow(
  options: CreateSkillOptions,
): Promise<StructurePlanJson | null> {
  try {
    const extractPurposeAgent =
      await this.resourceLoader.loadAgent("extract-purpose");
    const planStructureAgent =
      await this.resourceLoader.loadAgent("plan-structure");

    return {
      skillName: options.name,
      description: options.description,
      purpose: extractPurposeAgent,
      features: [],
      agents: [extractPurposeAgent, planStructureAgent],
    };
  } catch {
    return null;
  }
}
```

### エラーハンドリング

- `loadAgent` が例外を投げたら `null` を返す
- `createSkill()` は `null` を受けても継続する
- `void options` のような未使用回避コメントは削除済み

### エッジケース

- `options.description` は型上必須の `string`
- 空文字はそのまま `StructurePlanJson.description` に入る
- `undefined` は型契約上は想定外なので、もし破損入力が来るなら別途バリデーションが必要

### 設定可能パラメータ

| パラメータ            | 役割                             |
| --------------------- | -------------------------------- |
| `options.name`        | `skillName` の元になる値         |
| `options.description` | `description` の元になる値       |
| `extract-purpose`     | `purpose` の元になるエージェント |
| `plan-structure`      | 補助的な構造計画エージェント     |

### テスト観点

- `create` モードで `loadAgent` が呼ばれる
- `runCreateWorkflow` が `skillName` と `description` を返却値に含める
- `loadAgent` 失敗時に `null` が返る
- `collaborative` / `orchestrate` モードで `create` 用エージェントが呼ばれない

### タスクAとの境界

- 現在の修正は「構造計画を作るところまで」
- `generate_skill_md.js` への `--plan` / `--output` 接続はタスクA側の実装待ち
- そのため `structurePlan` は local variable で保持し、hidden property は使わない

### テスト結果

```text
Tests  63 passed (63)
```

AC-1〜AC-5 は全件 Green。`runCreateWorkflow` の戻り値も直接検証するように更新済み。
