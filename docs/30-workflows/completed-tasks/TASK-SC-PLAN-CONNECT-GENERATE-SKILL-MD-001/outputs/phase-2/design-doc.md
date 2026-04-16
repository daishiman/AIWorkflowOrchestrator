# Phase 2: 設計書

## 1. 接続設計

### 変更前（現状）

```typescript
// switch文 create ケース（line 114-117）
case "create":
  structurePlan = await this.runCreateWorkflow(options);
  break;

// line 126: 戻り値を破棄
void structurePlan; // 将来 generateSkillMd へ渡す（タスクA完了後に接続）

// line 173-218: 汎用プランで SKILL.md 生成（全モード共通）
const skillMdPath = path.join(skillDir, "SKILL.md");
const tmpPlanPath = path.join(os.tmpdir(), `skill-plan-${randomUUID()}.json`);
try {
  const plan = {
    skillName: options.name,
    workflow: { summary: options.description, ... },
    ...
  };
  await fs.writeFile(tmpPlanPath, JSON.stringify(plan), "utf-8");
  const generateResult = await this.scriptExecutor.execute("generate_skill_md.js", [...]);
  // ... fallback 処理
} finally {
  await fs.unlink(tmpPlanPath).catch(() => {});
}
```

### 変更後（設計）

```typescript
// switch文 create ケース: 変更なし
case "create":
  structurePlan = await this.runCreateWorkflow(options);
  break;

// void structurePlan; を削除

// lines 173-218 の汎用ブロックを条件分岐に置換
if (structurePlan) {
  await this.generateSkillMd(skillDir, structurePlan);
} else {
  this.logger.error("structurePlan is null, falling back to ensureSkillMdExists");
  await this.ensureSkillMdExists(skillDir, options.name, options.description);
}
```

---

## 2. generateSkillMd メソッド設計

### 2-1. メソッドシグネチャ

```typescript
/**
 * structurePlan を基に SKILL.md を生成する。
 * generate_skill_md.js を --plan オプション付きで呼び出す。
 *
 * @param skillDir - スキルのディレクトリパス
 * @param structurePlan - runCreateWorkflow が返した構造計画JSON
 */
private async generateSkillMd(
  skillDir: string,
  structurePlan: StructurePlanJson,
): Promise<void>
```

### 2-2. 内部処理フロー

```
1. tmpPlanPath = path.join(os.tmpdir(), `skill-plan-${randomUUID()}.json`)
2. skillMdPath = path.join(skillDir, "SKILL.md")
3. StructurePlanJson → workflow形式 plan に変換:
   {
     skillName: structurePlan.skillName,
     workflow: {
       summary: structurePlan.description,
       anchors: structurePlan.anchors || [],
       trigger: { description: ..., keywords: structurePlan.triggers || [structurePlan.skillName] },
       phases: [],
       tasks: [],
     },
     directories: {},
     files: [],
   }
4. await fs.writeFile(tmpPlanPath, JSON.stringify(plan), "utf-8")
5. generateResult = await this.scriptExecutor.execute("generate_skill_md.js", ["--plan", tmpPlanPath, "--output", skillMdPath])
6. shouldUseFallback = !generateResult.success
7. if (!shouldUseFallback) → fs.access(skillMdPath) で存在確認 → 失敗なら shouldUseFallback = true
8. if (shouldUseFallback) → ensureSkillMdExists(skillDir, structurePlan.skillName, structurePlan.description)
9. finally: fs.unlink(tmpPlanPath).catch(() => {})
```

### 2-3. 既存 fallback 処理との関係

| 処理                  | 位置付け                                                                  |
| --------------------- | ------------------------------------------------------------------------- |
| `generateSkillMd`     | structurePlan あり → plan-based で SKILL.md を生成（本タスクで新規実装）  |
| `ensureSkillMdExists` | null 時 or plan 生成失敗時 → テンプレートベースで SKILL.md を保証（既存） |

---

## 3. エラー処理設計

| ケース                                    | 処理                                                                                           |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `structurePlan` が `null`                 | `logger.error` でログ出力 → `ensureSkillMdExists(skillDir, options.name, options.description)` |
| `structurePlan` が `undefined`            | 同上（`if (structurePlan)` で両方カバー）                                                      |
| tmpFile 書き込み失敗                      | catch ブロックが拾い → `logger.error` でログ → 例外を再スロー（後続の createSkill が失敗）     |
| `generate_skill_md.js` 実行失敗           | `shouldUseFallback = true` → `ensureSkillMdExists` で fallback                                 |
| SKILL.md が存在しない（スクリプト成功後） | `fs.access` チェック → `shouldUseFallback = true` → `ensureSkillMdExists` で fallback          |
| tmpFile クリーンアップ失敗                | `logger.warn` でログ（処理は継続）                                                             |

---

## 4. logger フィールド追加設計

サービスに logger フィールドを追加する（console wrapper）。

```typescript
private readonly logger = {
  error: (msg: string, meta?: unknown) => console.error(`[SkillCreatorService] ${msg}`, meta),
  warn: (msg: string, meta?: unknown) => console.warn(`[SkillCreatorService] ${msg}`, meta),
};
```

---

## 5. テスト設計概要

### 5-1. ユニットテスト（UT）

| テストケース                                                          | 期待動作                                                                 |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| TC-CONNECT-1: `runCreateWorkflow` が `StructurePlanJson` を返した場合 | `generateSkillMd` が1回呼ばれること                                      |
| TC-CONNECT-2: `runCreateWorkflow` が `null` を返した場合              | `generateSkillMd` が呼ばれないこと・`ensureSkillMdExists` が呼ばれること |
| TC-CONNECT-3: `generateSkillMd` の内部スクリプト引数確認              | `generate_skill_md.js --plan <path> --output <path>` で呼ばれること      |
| TC-CONNECT-4: スクリプト実行失敗時の fallback                         | `ensureSkillMdExists(skillDir, skillName, description)` が呼ばれること   |

### 5-2. 統合テスト（IT）

| テストケース                                  | 期待動作                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------- |
| IT-CONNECT-1: create モード E2E               | `runCreateWorkflow` → `generateSkillMd` → `generate_skill_md.js` 呼び出しフロー |
| IT-CONNECT-2: JSON シリアライズ → tmpPlanPath | tmpPlanPath に workflow 形式の JSON が書き込まれること                          |

---

## 6. 統合ポイント・契約

| 統合ポイント                               | 契約                                                                                     |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `generateSkillMd(skillDir, structurePlan)` | 引数: `skillDir: string`, `structurePlan: StructurePlanJson`。戻り値: `Promise<void>`    |
| tmpFile フォーマット                       | workflow 形式 JSON（`skillName`, `workflow.*`, `directories`, `files`）                  |
| `generate_skill_md.js` 呼び出し規約        | `--plan <tmpPlanPath> --output <skillMdPath>`                                            |
| エラー伝搬契約                             | tmpFile 書き込み失敗のみ呼び出し元に伝搬。スクリプト失敗・SKILL.md 未生成は内部 fallback |
