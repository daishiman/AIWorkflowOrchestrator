# Phase 12: 実装ガイド

## Part 1: 中学生向けの説明

### なぜ必要か

スキルを作っても「このスキルは何ができるのか」が空っぽだと、あとから見た人が中身を理解しづらくなります。説明がないまま箱だけ並んでいる状態を減らすために、作成時点で機能一覧を自動で入れる必要がありました。

### たとえば

新しい本を図書館に置くとき、本棚に本だけ入れて紹介カードを付けないと、読む人はその本が何の本かすぐには分かりません。今回の変更は、本を置くと同時に紹介カードも自動で書いておく仕組みです。

### 今回作ったもの

- 何をしたか: `features` の自動生成と SKILL.md 反映経路を追加した
- スキルの説明文をもとに、AIまたは補助ロジックで「できること一覧」を作るようにした
- うまく作れなかったときでも、スキル作成全体は止めずに先へ進めるようにした
- 作られた一覧は、そのまま `SKILL.md` の `features` に反映されるようにした

## Part 2: 技術者向けの詳細

### アーキテクチャ概要

`runCreateWorkflow()` が `options.description` を入力として `generateFeaturesWithLlm(description, signal?)` を呼び、その戻り値を `StructurePlanJson.features` に入れる。生成結果は `generateSkillMd()` に引き継がれ、最終的に `SKILL.md` の `features` セクションへ書き込まれる。

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

### APIシグネチャ

```ts
private async generateFeaturesWithLlm(
  description: string,
  signal?: AbortSignal,
): Promise<string[]>

private parseFeaturesResponse(response: string): string[]
```

```bash
node .claude/skills/skill-creator/scripts/generate_features.js \
  --description "文章を要約するスキル" \
  --agent "<plan-structure agent content>"
```

### 使用例

```ts
const structurePlan = {
  skillName: options.name,
  description: options.description,
  purpose: options.description,
  features: await this.generateFeaturesWithLlm(options.description, signal),
  agents: ["extract-purpose", "plan-structure"],
};
```

### エラーハンドリング

- `resourceLoader.loadAgent("plan-structure")` 失敗時は `catch` で握り、`[]` を返す
- `generate_features.js` が非 0 相当で失敗しても `[]` を返す
- `parseFeaturesResponse()` が JSON 配列抽出に失敗した場合も、呼び出し元の `catch` で `[]` にフォールバックする
- `logger.warn()` に原因と説明文を残し、workflow 自体は継続する

### エッジケース

| ケース             | 挙動                                                               |
| ------------------ | ------------------------------------------------------------------ |
| 空 description     | script 側が引数エラーになっても service 側で `[]` にフォールバック |
| 空配列応答         | `parseFeaturesResponse()` が reject                                |
| 数値や `null` 混在 | 文字列要素のみ採用                                                 |
| Claude CLI 不在    | script が失敗し、service 側で `[]` へフォールバック                |
| timeout            | service 側で `[]` を返して継続                                     |

### 設定項目と定数一覧

| 項目           | 内容                                                                 |
| -------------- | -------------------------------------------------------------------- |
| script 名      | `generate_features.js`                                               |
| agent 名       | `plan-structure`                                                     |
| script timeout | 30秒 (`generate_features.js` 内 `execSync(..., { timeout: 30000 })`) |
| fallback 値    | `[]`                                                                 |
| fallback 実装  | `generateFeaturesHeuristic(description)`                             |

### テスト構成

| ファイル                                 | 目的                                      |
| ---------------------------------------- | ----------------------------------------- |
| `SkillCreatorService.features.test.ts`   | success / fallback / parse 境界の検証     |
| `SkillCreatorService.struct-001.test.ts` | 既存 `runCreateWorkflow()` 契約の回帰確認 |

### Consumer Contract & IPC Compatibility

- IPC 変更なし
- public API 変更なし
- Renderer/UI 変更なし
- 変更は `SkillCreatorService` の内部生成ロジックと補助 script に限定される

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。

代替証跡:

- `outputs/phase-10/final-review-result.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/phase11-capture-metadata.json`
