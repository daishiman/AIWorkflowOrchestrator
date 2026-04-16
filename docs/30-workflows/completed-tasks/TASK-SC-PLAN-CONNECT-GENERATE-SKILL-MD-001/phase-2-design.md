# Phase 2: 設計

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 2                                          |
| タスクID   | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 |
| 機能名     | runCreateWorkflow→generateSkillMd 接続     |
| 前提Phase  | Phase 1                                    |
| 後続Phase  | Phase 3                                    |
| 作成日     | 2026-04-16                                 |
| ステータス | 未実施                                     |

---

## 目的

`runCreateWorkflow` → `generateSkillMd` 接続の実装設計を行う。
接続パターン・`generateSkillMd` メソッドシグネチャ・エラー処理・テスト設計概要を確定し、
Phase 3 レビューゲートへの進行に必要な設計ドキュメントを生成する。

---

## 実行タスク

### タスク1: 接続設計

#### 1-1. create ケースの修正設計

`SkillCreatorService.ts` の switch 文 `create` ケースを以下のパターンに変更する。

**変更前（現状）:**

```typescript
case "create":
  structurePlan = await this.runCreateWorkflow(options);
  // AC-2: runCreateWorkflow 完了後、後続処理が正常に続く
  break;
// ...
void structurePlan; // 将来 generateSkillMd へ渡す（タスクA完了後に接続）
```

**変更後（設計）:**

```typescript
case "create": {
  const structurePlan = await this.runCreateWorkflow(options);
  if (structurePlan) {
    await this.generateSkillMd(skillDir, structurePlan);
  } else {
    this.logger.error(
      "structurePlan is null, falling back to ensureSkillMdExists",
      { skillDir },
    );
    await this.ensureSkillMdExists(skillDir, options.name, options.description);
  }
  break;
}
```

**設計ポイント:**

| ポイント              | 説明                                                             |
| --------------------- | ---------------------------------------------------------------- |
| `const structurePlan` | `void structurePlan;` を削除し、const で受け取る                 |
| null チェック         | `if (structurePlan)` で truthy チェック（null/undefined 両対応） |
| エラーログ            | null の場合は `this.logger.error` でログ出力し fallback を起動   |
| `break` のスコープ    | `case` ブロックをブレースで囲み変数スコープを明確化              |

---

### タスク2: generateSkillMd メソッドの設計

#### 2-1. メソッドシグネチャ

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

#### 2-2. 内部処理フロー

```
1. tmpPlanPath = path.join(os.tmpdir(), `skill-plan-${Date.now()}.json`)
2. await fs.writeFile(tmpPlanPath, JSON.stringify(structurePlan), "utf-8")
3. skillMdPath = path.join(skillDir, "SKILL.md")
4. await this.scriptExecutor.execute("generate_skill_md.js", ["--plan", tmpPlanPath, "--output", skillMdPath])
5. await fs.unlink(tmpPlanPath)  // 一時ファイルクリーンアップ
```

#### 2-3. 既存 fallback 処理との関係

```bash
# ensureSkillMdExists の実装確認
grep -n "ensureSkillMdExists" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

| 処理                  | 位置付け                                                                    |
| --------------------- | --------------------------------------------------------------------------- |
| `generateSkillMd`     | structurePlan あり → プランベースで SKILL.md を生成（本タスクで実装）       |
| `ensureSkillMdExists` | structurePlan なし or plan生成失敗時 → テンプレートベースで SKILL.md を保証 |

`generateSkillMd` は plan ベース生成の専用処理として抽出し、
`ensureSkillMdExists` は null 時と plan 生成失敗時の保険として残す。

---

### タスク3: エラー処理設計

| ケース                          | 処理                                                                                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `structurePlan` が `null`       | `logger.error` でログ出力 → `ensureSkillMdExists(skillDir, options.name, options.description)` を呼ぶ                                    |
| `structurePlan` が `undefined`  | 同上（`if (structurePlan)` で両方カバー）                                                                                                |
| tmpFile 書き込み失敗            | 例外をキャッチし `logger.error` でログ → `ensureSkillMdExists(skillDir, structurePlan.skillName, structurePlan.description)` へ fallback |
| `generate_skill_md.js` 実行失敗 | 例外をキャッチし `logger.error` でログ → `ensureSkillMdExists(skillDir, structurePlan.skillName, structurePlan.description)` へ fallback |
| tmpFile クリーンアップ失敗      | `logger.warn` でログ（処理は継続）                                                                                                       |

**エラー処理コード骨格:**

```typescript
private async generateSkillMd(
  skillDir: string,
  structurePlan: StructurePlanJson,
): Promise<void> {
  const tmpPlanPath = path.join(os.tmpdir(), `skill-plan-${Date.now()}.json`);
  try {
    await fs.writeFile(tmpPlanPath, JSON.stringify(structurePlan), "utf-8");
    const skillMdPath = path.join(skillDir, "SKILL.md");
    await this.scriptExecutor.execute("generate_skill_md.js", [
      "--plan", tmpPlanPath,
      "--output", skillMdPath,
    ]);
  } catch (err) {
    this.logger.error("generateSkillMd failed", { skillDir, err });
    await this.ensureSkillMdExists(
      skillDir,
      structurePlan.skillName,
      structurePlan.description,
    );
  } finally {
    try {
      await fs.unlink(tmpPlanPath);
    } catch {
      this.logger.warn("Failed to clean up tmpPlanPath", { tmpPlanPath });
    }
  }
}
```

---

### タスク4: テスト設計概要

#### 4-1. ユニットテスト（UT）

| テストケース                                            | 期待動作                                                           |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| `runCreateWorkflow` が `StructurePlanJson` を返した場合 | `generateSkillMd` が1回呼ばれること                                |
| `runCreateWorkflow` が `null` を返した場合              | `generateSkillMd` が呼ばれないこと・`logger.error` が呼ばれること  |
| `generateSkillMd` で tmpFile 書き込み失敗               | 例外が呼び出し元に伝搬すること                                     |
| `generate_skill_md.js` 実行失敗                         | 例外が呼び出し元に伝搬すること・tmpFile がクリーンアップされること |

#### 4-2. 統合テスト（IT）

| テストケース                                        | 期待動作                                                |
| --------------------------------------------------- | ------------------------------------------------------- |
| create モード E2E（正常系）                         | `runCreateWorkflow` → `generateSkillMd` → SKILL.md 生成 |
| `generate_skill_md.js` が `--plan` で受け取る正常系 | SKILL.md が指定 `--output` パスに生成されること         |

---

## 参照資料

| 資料名                 | パス                                                                | 用途                                           |
| ---------------------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| SkillCreatorService.ts | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`       | 修正箇所確認（line 100-130, 160-220, 630-650） |
| generate_skill_md.js   | `apps/desktop/src/main/services/skill/scripts/generate_skill_md.js` | --plan オプションのインターフェース確認        |
| Phase 1 成果物         | `outputs/phase-1/spec-extraction-map.md`                            | 要件・AC参照                                   |

---

## 統合テスト連携【必須】

本設計における統合ポイント・契約（API・スキーマ）を以下に定義する。

| 統合ポイント                               | 契約                                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `generateSkillMd(skillDir, structurePlan)` | 引数: `skillDir: string`, `structurePlan: StructurePlanJson`。戻り値: `Promise<void>`     |
| tmpFile フォーマット                       | `JSON.stringify(structurePlan)` → UTF-8 JSON ファイル                                     |
| `generate_skill_md.js` 呼び出し規約        | `--plan <tmpPlanPath> --output <skillMdPath>`（TASK-SC-FIX-GENERATE-SKILL-MD-001 が定義） |
| エラー伝搬契約                             | `generateSkillMd` 内の例外は fallback 後も再失敗した場合にのみ呼び出し元へ伝搬            |

| 判定項目               | 基準    | 現状   |
| ---------------------- | ------- | ------ |
| 型チェック（設計段階） | PASS    | 未計測 |
| lint                   | 0 error | 未計測 |
| UT カバレッジ Line     | 80%+    | 未計測 |

---

## 多角的チェック観点

| 観点               | チェック内容                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| null 安全性        | `if (structurePlan)` で null/undefined の両方をカバーできているか                                          |
| tmpFile の競合     | 複数の create 実行が同時に走った場合に tmpFile が競合しないか（`Date.now()` で一意化）                     |
| エラー伝搬の一貫性 | `generateSkillMd` の例外が create ケース全体のエラーハンドリングと整合しているか                           |
| fallback との競合  | `ensureSkillMdExists` と `generateSkillMd` が二重で SKILL.md を生成しないか                                |
| 依存タスク整合     | `generate_skill_md.js` の `--plan` インターフェースが TASK-SC-FIX-GENERATE-SKILL-MD-001 の設計と一致するか |

---

## 成果物

| 成果物 | パス                            | 説明                                                   |
| ------ | ------------------------------- | ------------------------------------------------------ |
| 設計書 | `outputs/phase-2/design-doc.md` | 接続設計・メソッド設計・エラー処理設計・テスト設計概要 |

---

## 完了条件

- [ ] 接続設計（create ケース修正パターン）が図/コードで表現されている
- [ ] `generateSkillMd` メソッドシグネチャ（引数・戻り値型）が確定している
- [ ] 内部処理フロー（tmpFile 書き込み → スクリプト実行 → クリーンアップ）が確定している
- [ ] `ensureSkillMdExists` との関係整理が完了している
- [ ] エラー処理設計（5ケース）が完了している
- [ ] UT テスト設計概要（4ケース）が記載されている
- [ ] IT テスト設計概要（2ケース）が記載されている
- [ ] 統合ポイント・契約（API・スキーマ）が設計に反映されている
- [ ] `outputs/phase-2/design-doc.md` が作成されている
- [ ] 本Phase内の全タスクを100%実行完了

---

## サブタスク管理

1. create ケースの修正設計（変更前後コードの確定）
2. `generateSkillMd` メソッドシグネチャの設計
3. 内部処理フローの設計（tmpFile・スクリプト実行・クリーンアップ）
4. `ensureSkillMdExists` との関係整理
5. エラー処理設計（5ケース）
6. UT テスト設計概要（4ケース）
7. IT テスト設計概要（2ケース）
8. 成果物（design-doc.md）の出力

---

## Phase末端アクション【必須】

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 --phase 2 \
  --artifacts "outputs/phase-2/design-doc.md:接続設計・メソッド設計・エラー処理設計・テスト設計概要"
```

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

---

## 次のPhase

Phase 3: 設計レビューゲート
