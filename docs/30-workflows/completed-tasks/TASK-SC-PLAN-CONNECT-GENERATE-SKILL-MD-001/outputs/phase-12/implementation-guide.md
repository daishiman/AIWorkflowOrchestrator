# Phase 12: 実装ガイド

## Part 1: 初学者向け（日常の例え話）

### なぜこの変更が必要だったのか

たとえば、あなたがロボットに「料理のレシピを考えて」とお願いしたとします。
ロボットはレシピを考えて答えてくれましたが、そのレシピは誰も使わずに捨てられていました。
「せっかく考えてもらったのに、もったいない！」と思いますよね。

今回の変更は、まさにそれを直したものです。

`SkillCreatorService`（スキルを作るロボット）は、`runCreateWorkflow`（設計書を考える担当）が
作った「設計書（structurePlan）」を受け取っていましたが、それを `void structurePlan;` という
コードで「捨てて」いました。

この変更では、その設計書を捨てずに `generateSkillMd`（SKILL.md を書く担当）に渡すように
しました。これで、ロボットが考えた設計書が実際に SKILL.md ファイルとして保存されるようになります。

### 何をするか

1. **設計書（structurePlan）を受け取る** — `runCreateWorkflow` が返す設計書を変数に保存
2. **設計書があれば SKILL.md を生成** — `generateSkillMd` というメソッドを呼ぶ
3. **設計書がなければ代わりの方法で SKILL.md を作る** — テンプレートから作る `ensureSkillMdExists` を使う

---

## Part 2: 開発者向け

### Current Contract（現在）

```typescript
// SkillCreatorService.ts（現在）
const structurePlan = await this.runCreateWorkflow(options);

if (structurePlan) {
  await this.generateSkillMd(skillDir, structurePlan);
} else if (options.mode === "create") {
  this.logger.warn(
    "structurePlan is null, falling back to ensureSkillMdExists",
    {
      skillDir,
      skillName: options.name,
      mode: options.mode,
    },
  );
  await this.ensureSkillMdExists(skillDir, options.name, options.description);
} else {
  await this.ensureSkillMdExists(skillDir, options.name, options.description);
}
```

### Target Delta（今回の wave で整えた点）

```typescript
// SkillCreatorService.ts（現在の実装方針）
// - create モード以外は silent fallback
// - create モードで structurePlan が無い場合は warn を出す
// - generateSkillMd は purpose / anchors / triggers を workflow 形式へ正規化する
```

### API シグネチャ

```typescript
// 新規追加メソッド
private async generateSkillMd(
  skillDir: string,
  structurePlan: StructurePlanJson,
): Promise<void>
```

### 型定義

```typescript
// StructurePlanJson（既存インターフェース）
import type { Anchor } from "@repo/shared/types";

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

### StructurePlanJson → workflow 変換マッピング

| StructurePlanJson フィールド | workflow 形式フィールド                                     |
| ---------------------------- | ----------------------------------------------------------- |
| `skillName`                  | `plan.skillName`                                            |
| `description`                | `plan.workflow.summary`                                     |
| `anchors` (任意)             | `plan.workflow.anchors` (shared `Anchor[]` をそのまま使用)  |
| `purpose`                    | `plan.workflow.trigger.description` に補足として反映        |
| `skillName`                  | `plan.workflow.trigger.description` の基本文                |
| `triggers` (任意)            | `plan.workflow.trigger.keywords` (空配列時も `[skillName]`) |

> `generate_skill_md.js` は `Anchor.source` を基本に、互換のため `name` も受け取る。

### 処理フロー

```
generateSkillMd(skillDir, structurePlan)
  │
  ├─ 1. tmpPlanPath = os.tmpdir() + `/skill-plan-${randomUUID()}.json`
  ├─ 2. plan オブジェクト構築（StructurePlanJson → workflow 形式）
  ├─ 3. fs.writeFile(tmpPlanPath, JSON.stringify(plan))
  ├─ 4. scriptExecutor.execute("generate_skill_md.js", ["--plan", tmpPlanPath, "--output", skillMdPath])
  ├─ 5. generateResult.success == false → reason 付きで fallback（ensureSkillMdExists）
  ├─ 6. fs.access(skillMdPath) 失敗 → reason 付きで fallback
  └─ finally: fs.unlink(tmpPlanPath).catch(() => {})  // cleanup
```

### エラーハンドリング

| シナリオ                                | 動作                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------ |
| `structurePlan` が null                 | create モードのみ `logger.warn` 後 `ensureSkillMdExists` で fallback     |
| 非 create モードで `structurePlan` null | silent fallback（従来テンプレート生成）                                  |
| `fs.writeFile` 失敗                     | catch → `logger.error` → `ensureSkillMdExists` fallback                  |
| スクリプト実行失敗                      | `generateResult.success = false` → `stderr` / `exitCode` 付きで fallback |
| SKILL.md が生成されなかった             | `fs.access` 失敗 → `skillMdPath` 付きで fallback                         |
| catch ブロック（その他例外）            | `logger.error` → `ensureSkillMdExists` fallback                          |
| cleanup 失敗（unlink）                  | 非致命的、エラーを握りつぶして継続                                       |

### エッジケース

- `structurePlan.anchors` が undefined → `[]` を使用
- `structurePlan.triggers` が undefined または空配列 → `[structurePlan.skillName]` を使用
- `structurePlan.purpose` が undefined / 空白 → trigger description は `skillName` ベースにフォールバック
- `Anchor` は `source` / `application` / `purpose` を持つ shared 型。互換のため script 側は `name` も受け入れる
- `scriptExecutor` が ENOENT → catch ブロックで fallback

### 設定可能パラメータ・定数

| パラメータ    | 場所                              | デフォルト | 説明                   |
| ------------- | --------------------------------- | ---------- | ---------------------- |
| `tmpPlanPath` | `os.tmpdir()` + UUID              | 自動生成   | 一時 JSON ファイルパス |
| `skillMdPath` | `path.join(skillDir, "SKILL.md")` | 固定       | 出力 SKILL.md パス     |
| スクリプト名  | `"generate_skill_md.js"`          | 固定       | 実行スクリプト         |

### logger フィールド

```typescript
private readonly logger = {
  error: (msg: string, meta?: unknown) =>
    console.error(`[SkillCreatorService] ${msg}`, meta),
  warn: (msg: string, meta?: unknown) =>
    console.warn(`[SkillCreatorService] ${msg}`, meta),
};
```
