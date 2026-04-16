# Phase 5: 実装

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 5                                               |
| タスクID   | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001      |
| 機能名     | runCreateWorkflow-to-generateSkillMd-connection |
| 前提Phase  | Phase 4（テスト作成完了・Red 確認済み）         |
| 後続Phase  | Phase 6                                         |
| 作成日     | 2026-04-16                                      |
| ステータス | pending                                         |

## 目的

Phase 4 で作成したテストを Green にする最小実装を行う（TDD Green フェーズ）。
`SkillCreatorService.ts` の `void structurePlan;` を削除し、
`if (structurePlan)` ブロックで `generateSkillMd(skillDir, structurePlan)` を呼び出す接続を実装する。
既存の fallback 処理（`ensureSkillMdExists`）との整合性を維持しつつ、最小変更で Green を達成する。

## 実行タスク

### タスク1: `void structurePlan;` の削除と接続実装

**対象ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

**修正箇所（line 126 付近）**:

削除対象コード:

```typescript
void structurePlan; // 将来 generateSkillMd へ渡す（タスクA完了後に接続）
```

変更後コード:

```typescript
if (structurePlan) {
  await this.generateSkillMd(skillDir, structurePlan);
} else {
  this.logger.error(
    "structurePlan is null, falling back to ensureSkillMdExists",
  );
  await this.ensureSkillMdExists(skillDir, options.name, options.description);
}
```

確認コマンド:

```bash
# 変更前の状態確認
grep -n "void structurePlan" apps/desktop/src/main/services/skill/SkillCreatorService.ts

# 変更後の確認
grep -n "generateSkillMd\|structurePlan" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

### タスク2: `generateSkillMd` メソッドの実装または修正

**シグネチャ**:

```typescript
private async generateSkillMd(
  skillDir: string,
  structurePlan: StructurePlanJson,
): Promise<void>
```

**実装方針**:

1. `structurePlan` を `JSON.stringify()` して `tmpPlanPath` に書き込む
2. `this.scriptExecutor.execute("generate_skill_md.js", ["--plan", tmpPlanPath, "--output", skillMdPath])` を呼び出す
3. `generate_skill_md.js` 実行失敗時は `ensureSkillMdExists(skillDir, structurePlan.skillName, structurePlan.description)` を呼び出す（fallback）

**実装コード例**:

```typescript
private async generateSkillMd(
  skillDir: string,
  structurePlan: StructurePlanJson,
): Promise<void> {
  const tmpPlanPath = path.join(os.tmpdir(), `skill-plan-${Date.now()}.json`);
  const skillMdPath = path.join(skillDir, "SKILL.md");

  try {
    await fs.writeFile(tmpPlanPath, JSON.stringify(structurePlan), "utf-8");
    await this.scriptExecutor.execute("generate_skill_md.js", [
      "--plan",
      tmpPlanPath,
      "--output",
      skillMdPath,
    ]);
  } catch (error) {
    this.logger.error(
      `generateSkillMd: script execution failed, falling back to ensureSkillMdExists`,
      error,
    );
    await this.ensureSkillMdExists(
      skillDir,
      structurePlan.skillName,
      structurePlan.description,
    );
  } finally {
    // tmpPlanPath のクリーンアップ（エラーを握りつぶす）
    await fs.unlink(tmpPlanPath).catch(() => void 0);
  }
}
```

**既存 fallback との整合性確認**:

```bash
# ensureSkillMdExists の既存実装を確認
grep -n "ensureSkillMdExists" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

### タスク3: テスト実行（Green 確認）

```bash
# ターゲットテストのみ実行
pnpm --filter @repo/desktop test -- --run --reporter=verbose \
  src/main/services/skill/SkillCreatorService.test.ts

# 期待: 全テスト PASS（TC-1〜TC-4・IT-1〜IT-2）

# 全テスト実行（回帰なし確認）
pnpm --filter @repo/desktop test
```

### タスク4: 型チェック

```bash
# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# lint チェック
pnpm --filter @repo/desktop lint
```

## 参照資料

| 資料名                   | パス                                                                | 用途                       |
| ------------------------ | ------------------------------------------------------------------- | -------------------------- |
| Phase 4 テスト仕様書     | `outputs/phase-4/test-plan.md`                                      | テストケース参照           |
| Phase 2 設計書           | `outputs/phase-2/design-doc.md`                                     | 設計・インターフェース参照 |
| 実装対象ファイル         | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`       | 修正対象コード確認         |
| generate_skill_md.js     | `apps/desktop/src/main/services/skill/scripts/generate_skill_md.js` | スクリプトシグネチャ確認   |
| StructurePlanJson 型定義 | `apps/desktop/src/main/services/skill/types.ts`（または同等）       | 型定義確認                 |
| aiworkflow-requirements  | `.claude/skills/aiworkflow-requirements/references/`                | プロジェクト共通仕様参照   |

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備。

| 判定項目           | 基準    | 結果    |
| ------------------ | ------- | ------- |
| TC-1〜TC-4 全 PASS | PASS    | pending |
| IT-1〜IT-2 全 PASS | PASS    | pending |
| 型チェック PASS    | PASS    | pending |
| lint エラーなし    | 0 error | pending |
| 既存テスト回帰なし | 全 PASS | pending |

## 多角的チェック観点

| 観点     | 確認内容                                                                       |
| -------- | ------------------------------------------------------------------------------ |
| 矛盾     | `void structurePlan;` が完全に削除されており、残存していないか                 |
| 漏れ     | `structurePlan` null 時の `logger.error` 呼び出しが実装されているか            |
| 整合性   | fallback（`ensureSkillMdExists`）が既存の呼び出しパターンと一致しているか      |
| 依存関係 | `generateSkillMd` の tmpPlanPath クリーンアップが `finally` で確実に行われるか |

## 成果物

| 成果物         | パス                                                          | 説明                                  |
| -------------- | ------------------------------------------------------------- | ------------------------------------- |
| 実装コード変更 | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | void structurePlan 削除・接続実装追加 |
| 実装ノート     | `outputs/phase-5/implementation-notes.md`                     | 変更内容・判断理由の記録              |

## 完了条件

- [ ] `void structurePlan;` が削除されている
- [ ] `if (structurePlan)` ブロックで `generateSkillMd` が呼ばれている
- [ ] `structurePlan` null 時に `this.logger.error(...)` が呼ばれている
- [ ] `generateSkillMd` に `StructurePlanJson` 型の引数が正しく渡されている
- [ ] `tmpPlanPath` に `JSON.stringify(structurePlan)` が書き込まれている
- [ ] `scriptExecutor.execute("generate_skill_md.js", ["--plan", tmpPlanPath, "--output", skillMdPath])` が呼ばれている
- [ ] スクリプト失敗時の fallback（`ensureSkillMdExists`）が動作する
- [ ] TC-1〜TC-4 全ユニットテスト PASS
- [ ] IT-1〜IT-2 全統合テスト PASS
- [ ] 型チェック（`pnpm typecheck`）が PASS
- [ ] lint がエラーなし
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. 既存テスト baseline 確認（実装前）
2. `void structurePlan;` の削除
3. `if (structurePlan)` ブロックの追加
4. `this.logger.error(...)` の追加（null ケース）
5. `generateSkillMd` メソッドの実装
6. `tmpPlanPath` への JSON シリアライズ実装
7. `scriptExecutor.execute` 呼び出し実装
8. fallback（`ensureSkillMdExists`）の接続確認
9. テスト実行（Green 確認）
10. 型チェック・lint 確認
11. 既存テスト回帰確認
12. `outputs/phase-5/implementation-notes.md` 作成

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## Phase末端アクション【必須】

- `outputs/phase-5/implementation-notes.md` に実装内容・変更行数・判断理由を記録する
- `void structurePlan;` が削除されたことを確認し、diff を記録する
- Phase 6 の担当者に「Green 確認済み・全テスト PASS」を引き継ぐ

## 次のPhase

Phase 6: テスト拡充
