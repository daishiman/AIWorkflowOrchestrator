# TASK-P0-01 Implementation Guide

## メタ情報

| 項目      | 値                                                               |
| --------- | ---------------------------------------------------------------- |
| タスクID  | TASK-P0-01                                                       |
| タスク名  | verify 実行エンジン（Layer 1/2 コア + Layer 3/4 互換）の仕様整合 |
| 関連Issue | #1886                                                            |
| 作成日    | 2026-04-04                                                       |
| 対象読者  | 非エンジニア / 開発者                                            |

---

## Part 1: 中学生レベルの概念説明

### Layer とは何か

Layer（レイヤー）は、確認作業をいくつかの段階に分ける考え方です。

たとえば、先生が宿題を見るとき、いきなり中身を全部読むのではなく、まず「名前があるか」「ページがそろっているか」を見てから、「内容がきちんとしているか」を見ることがあります。これと同じで、今回の verify 実行エンジンも、先に形を見てから中身を見ます。

- **Layer 1**: ファイルやフォルダがあるかを確認する
- **Layer 2**: ファイルの中に必要な見出しや項目があるかを確認する
- **Layer 3**: さらに内容が十分にしっかりしているかを確認する
- **Layer 4**: ファイル同士のつながりが正しいかを確認する

なぜ Layer が必要かというと、順番を分けると「どこで問題が起きたか」がすぐにわかり、無駄な確認を減らせるからです。

### 独立モジュールとは何か

独立モジュールは、ほかの機能とべったりくっつかず、自分の役目だけをはっきり持っている部品です。

たとえば、家の中で電卓は計算だけをして、ノートはメモだけをします。電卓を直してもノートは壊れません。このように分かれていると、修正するときに影響が広がりにくくなります。

`SkillCreatorVerificationEngine` は「検証する」ことだけを担当します。検証した結果をどう使うかは、別の部品である `RuntimeSkillCreatorFacade` が決めます。

### この実装が何をするか

この実装は、スキル用のファイルがルールに合っているかを自動で確認します。

1. まずファイルやフォルダがあるかを見ます
2. 次に、ファイルの中に必要な見出しがあるかを見ます
3. さらに、内容が十分かどうかを見ます
4. そのあとで、関連ファイルのつながりが正しいかを見ます

結果は `info` / `warning` / `error` で返ります。`verifySkill()` 自体は結果を返すだけで、合格か不合格かの判定は `verifyAndImproveLoop()` が行います。

---

## Part 2: 技術者レベルの API リファレンス

### 1. `RuntimeSkillCreatorVerifyCheck`

`RuntimeSkillCreatorVerifyCheck` は verify 結果を表す共通のチェック単位です。

| field              | type                                           | 説明                                   |
| ------------------ | ---------------------------------------------- | -------------------------------------- |
| `id`               | `string`                                       | チェック ID。`L1-001`〜`L4-003` の形式 |
| `layer`            | `"layer1" \| "layer2" \| "layer3" \| "layer4"` | 検証レイヤー                           |
| `severity`         | `"info" \| "warning" \| "error"`               | 判定の重み                             |
| `summary`          | `string`                                       | 人間が読める説明                       |
| `evidenceSummary?` | `string`                                       | 補足証跡。任意                         |

```ts
import type { RuntimeSkillCreatorVerifyCheck } from "@repo/shared";

const check: RuntimeSkillCreatorVerifyCheck = {
  id: "L1-001",
  layer: "layer1",
  severity: "error",
  summary: "SKILL.md is missing",
  evidenceSummary: "path: /tmp/test-skill/SKILL.md",
};
```

#### current contract

Layer 3 / Layer 4 は current contract にすでに含まれています。今回は Layer 1 / Layer 2 のコア説明を主に整理し、4-layer 互換を壊さない読み方に揃えています。

### 2. `SkillCreatorVerificationEngine`

`SkillCreatorVerificationEngine` は `skillDir` 以下を検証し、`RuntimeSkillCreatorVerifyCheck[]` を返す独立モジュールです。

配置先: `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`

| 公開メソッド | シグネチャ                                                            | 戻り値                   | 例外                                                                       |
| ------------ | --------------------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------- |
| `verify`     | `verify(skillDir: string): Promise<RuntimeSkillCreatorVerifyCheck[]>` | 全レイヤーのチェック配列 | 通常の欠落や JSON 不正はチェックで返す。想定外の内部障害のみ例外化されうる |

```ts
import { SkillCreatorVerificationEngine } from "./SkillCreatorVerificationEngine";

const engine = new SkillCreatorVerificationEngine();
const checks = await engine.verify("/path/to/skill");

const hasErrors = checks.some((check) => check.severity === "error");
```

#### 使用例

```ts
const checks = await engine.verify(skillDir);
for (const check of checks) {
  console.log(`${check.id}: ${check.severity} - ${check.summary}`);
}
```

#### 例外

- `SKILL.md` が存在しない、`agents/` が空、`output-schema.json` が壊れている、といった通常の不備は例外にせずチェックとして返します
- `fs` 自体の予期しない障害やプロセス停止など、検証エンジン外の障害だけが例外として上がる可能性があります

### 3. Layer 1 / Layer 2 コアチェック一覧

#### Layer 1: 構造検証

| チェックID | 内容                              | 失敗時 severity |
| ---------- | --------------------------------- | --------------- |
| L1-001     | SKILL.md 存在確認                 | `error`         |
| L1-002     | agents/ ディレクトリ存在確認      | `error`         |
| L1-003     | agents/ に 1 件以上のファイル存在 | `error`         |
| L1-004     | references/ ディレクトリ存在確認  | `warning`       |
| L1-005     | output-schema.json 存在確認       | `warning`       |

#### Layer 2: コンテンツ検証

| チェックID | 内容                                  | 失敗時 severity |
| ---------- | ------------------------------------- | --------------- |
| L2-001     | SKILL.md H1 見出し確認                | `error`         |
| L2-002     | SKILL.md `## 概要` セクション確認     | `error`         |
| L2-003     | SKILL.md `## Trigger` セクション確認  | `error`         |
| L2-004     | SKILL.md `## Anchors` セクション確認  | `warning`       |
| L2-005     | agent ファイル H1 見出し確認          | `error`         |
| L2-006     | agent ファイル `## 責務` 確認         | `warning`       |
| L2-007     | output-schema.json の JSON 妥当性確認 | `error`         |

#### current facts

Layer 3 / Layer 4 の current contract は既に別の verify 契約へ同期済みです。ここでは Layer 1 / Layer 2 のコアだけを丁寧に説明しています。

### 4. エラーハンドリング

- `SKILL.md` が読めない場合、L2-001〜L2-004 はすべて `error` で返します
- `agents/` が存在しない場合、L2-005 / L2-006 は対象ファイルがないため発行しません
- `agents/` が空の場合、L1-003 は `error` になります
- `output-schema.json` が存在しない場合、L1-005 は `warning` になり、L2-007 / Layer 3 の一部チェックは発行しません
- `output-schema.json` が壊れている場合、L2-007 は `error` になります
- Layer 1 の失敗は Layer 2 以降の出力を止めません。返却配列には、読めた範囲のチェックがそのまま入ります

### 5. エッジケース

- `agents/` に `.md` 以外しかない場合でも、Layer 1 は「ファイルがある」と見なし、Layer 2 は `.md` のみを検査します
- `output-schema.json` が `true` / `null` / `[]` のような JSON の場合は、L2-007 は通っても Layer 3 で別の判定になります
- `SKILL.md` の見出しが空文字のままの場合、H1 や `## 概要` などは失敗として返ります
- 日本語やスペースを含むディレクトリ名でも、`path` ベースで扱うためそのまま検証できます

### 6. 設定項目と定数一覧

| 名前                          | 既定値 / 形式                                                  | 役割                                                  |
| ----------------------------- | -------------------------------------------------------------- | ----------------------------------------------------- |
| チェック ID 形式              | `L{N}-{NNN}`                                                   | レイヤーごとの識別子                                  |
| severity                      | `info` / `warning` / `error`                                   | 判定の重み                                            |
| Layer 3 文字数閾値            | 責務 20 文字 / Trigger 10 文字                                 | 内容の薄さを弾く基準                                  |
| 対象ファイル名                | `SKILL.md`, `agents/*.md`, `references/`, `output-schema.json` | 検証対象                                              |
| `verificationEngine` 未注入時 | `[]` 返却                                                      | `RuntimeSkillCreatorFacade` 側の graceful degradation |

### 7. `RuntimeSkillCreatorFacade` 経由の統合パターン

`RuntimeSkillCreatorFacade.verifySkill()` は、検証エンジンが注入されていればそのまま結果を返し、未注入なら空配列を返します。

```ts
import { RuntimeSkillCreatorFacade } from "./RuntimeSkillCreatorFacade";
import { SkillCreatorVerificationEngine } from "./SkillCreatorVerificationEngine";

const facade = new RuntimeSkillCreatorFacade({
  skillExecutor: {} as never,
  verificationEngine: new SkillCreatorVerificationEngine(),
});

const checks = await facade.verifySkill(skillDir);
const allPassed = checks.every((check) => check.severity === "info");
```

`verifyAndImproveLoop()` は `verifySkill()` の結果を見て、`error` があれば improve に進み、全件 `info` なら `recordVerifyPass()` に渡します。

#### 使用例

```ts
const result = await facade.verifyAndImproveLoop(
  "plan-001",
  skillDir,
  "sample-skill",
  "api-key",
);

console.log(result.finalStatus);
```
