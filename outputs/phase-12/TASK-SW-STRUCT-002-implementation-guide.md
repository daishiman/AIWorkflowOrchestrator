# TASK-SW-STRUCT-002 実装ガイド

## メタ情報

| 項目     | 内容                                          |
| -------- | --------------------------------------------- |
| タスクID | TASK-SW-STRUCT-002                            |
| 機能名   | struct-002-connect-structure-plan-to-skill-md |
| 実装参照 | PR #2209 / commit c21cc553c                   |
| 作成日   | 2026-04-17                                    |

---

## Part 1: 中学生レベルの概念説明

### なぜこの修正が必要だったか？

スキルを「create」モードで作るとき、AIが「このスキルはこういう目的で使うんだ」という**設計書**（`structurePlan`）を作ります。でも、以前のコードはその設計書を受け取った後、こんなことをしていました：

```typescript
void structurePlan; // 設計書を使わずに捨てていた！
```

レシピを読んだのに捨てて、全然別の手順で料理するのと同じで、作られた SKILL.md に設計書の内容が全く反映されていませんでした。

### 何を変えたか？

設計書を捨てるのをやめて、SKILL.md の生成に使うようにしました。

- **before**: 設計書を捨てて固定テンプレートで SKILL.md を作る
- **after**: 設計書の内容（スキル名・目的・トリガー）を使って SKILL.md を作る

### もし設計書が使えない場合は？

万が一設計書が届かなかったり、SKILL.md を作るスクリプトが失敗したりしても、`ensureSkillMdExists` へフォールバックします。ただし、フォールバック先のファイル生成自体が失敗すれば例外は起こり得ます。

---

## Part 2: 技術者向け実装ガイド

### 変更ファイル

`apps/desktop/src/main/services/skill/SkillCreatorService.ts`

### 1. `void structurePlan;` の削除（:126）

```typescript
// 削除された行
void structurePlan; // 将来 generateSkillMd へ渡す（タスクA完了後に接続）
```

この1行を削除することで、不要な no-op をなくし、`structurePlan` をそのまま後続処理に渡す意図が明確になった。

### 2. SKILL.md 生成分岐（:304-329）

```typescript
if (structurePlan !== null) {
  await this.generateSkillMd(skillDir, structurePlan, operationSignal);
} else if (options.mode === "create") {
  this.logger.warn("structurePlan is null, falling back to ensureSkillMdExists", { ... });
  await this.ensureSkillMdExists(skillDir, options.name, options.description, operationSignal);
} else {
  await this.ensureSkillMdExists(skillDir, options.name, options.description, operationSignal);
}
```

### 3. `generateSkillMd` メソッド

```typescript
private async generateSkillMd(
  skillDir: string,
  structurePlan: StructurePlanJson,
  signal?: AbortSignal,
): Promise<void>
```

#### StructurePlanJson → plan 変換

| パラメータ                  | 用途                                     |
| --------------------------- | ---------------------------------------- |
| `options.name`              | フォールバック時のスキル名               |
| `options.description`       | フォールバック時の概要文                 |
| `structurePlan.skillName`   | create モードで反映するスキル名          |
| `structurePlan.purpose`     | trigger.description の元情報             |
| `structurePlan.description` | workflow.summary の元情報                |
| `anchors ?? []`             | `anchors` が未定義のときのフォールバック |

#### エッジケース

| ケース                      | 動作                                                    |
| --------------------------- | ------------------------------------------------------- |
| `structurePlan === null`    | `ensureSkillMdExists` へフォールバック（warn ログ付き） |
| `purpose` が空文字          | `"Use when {name} is requested"` の短縮形を使用         |
| `anchors` が undefined      | `[]` にフォールバック                                   |
| スクリプト実行失敗          | `ensureSkillMdExists` へフォールバック                  |
| SKILL.md が生成されない場合 | `ensureSkillMdExists` へフォールバック                  |
| 例外発生時                  | `ensureSkillMdExists` へフォールバック                  |

### 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要（NON_VISUAL タスク）。
