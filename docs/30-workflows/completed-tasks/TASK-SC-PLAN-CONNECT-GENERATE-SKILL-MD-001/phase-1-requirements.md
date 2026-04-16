# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 1                                          |
| タスクID   | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 |
| 機能名     | runCreateWorkflow→generateSkillMd 接続     |
| 前提Phase  | -                                          |
| 後続Phase  | Phase 2                                    |
| 作成日     | 2026-04-16                                 |
| ステータス | 未実施                                     |

---

## 目的

`runCreateWorkflow` → `generateSkillMd` 接続の要件を定義する。
現状コードの調査（P50チェック）を通じて依存タスクの完了状態を確認し、
受け入れ条件（AC-1〜AC-5）とスコープを確定する。

---

## 実行タスク

### タスク1: P50チェック（現状コード調査）

#### 1-1. SkillCreatorService.ts の runCreateWorkflow 実装確認

```bash
# runCreateWorkflow の実装確認（line 630付近）
grep -n "runCreateWorkflow" apps/desktop/src/main/services/skill/SkillCreatorService.ts

# void structurePlan; の箇所確認（line 126付近）
grep -n "void structurePlan" apps/desktop/src/main/services/skill/SkillCreatorService.ts

# create ケース全体の確認
grep -n -A 20 'case "create"' apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

#### 1-2. generate_skill_md.js の --plan オプション確認

```bash
# --plan オプションの実装状況確認（TASK-SC-FIX-GENERATE-SKILL-MD-001 完了状態確認）
grep -n "plan\|--plan" apps/desktop/src/main/services/skill/scripts/generate_skill_md.js

# スクリプトの引数処理全体確認
grep -n "argv\|args\|process.argv" apps/desktop/src/main/services/skill/scripts/generate_skill_md.js
```

#### 1-3. generateSkillMd メソッドの確認

```bash
# generateSkillMd メソッドの有無確認
grep -n "generateSkillMd\|ensureSkillMdExists" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

#### 1-4. 既存テストファイルの確認

```bash
# SkillCreatorService のテストファイル確認
find apps/desktop/src -name "*.test.ts" | xargs grep -l "SkillCreatorService\|runCreateWorkflow" 2>/dev/null

# テストの現状確認
grep -n "runCreateWorkflow\|generateSkillMd" apps/desktop/src/main/services/skill/__tests__/*.test.ts 2>/dev/null || echo "テストファイルなし"
```

---

### タスク2: 受け入れ条件（AC）の定義

| ID   | 受け入れ条件                                                                                              | 検証方法                                                                        |
| ---- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| AC-1 | create モードで `runCreateWorkflow` が `StructurePlanJson` を返した場合、`generateSkillMd` が呼ばれること | UT: `generateSkillMd` が1回 call されることをモックで確認                       |
| AC-2 | `structurePlan` が `null` の場合は `generateSkillMd` をスキップし、エラーログを出力すること               | UT: `generateSkillMd` が call されないこと・`logger.error` が呼ばれることを確認 |
| AC-3 | `generate_skill_md.js` が `--plan` オプションで `structurePlan` を受け取り正常動作すること                | IT: `--plan <tmpFile>` で実行した場合に SKILL.md が生成されること               |
| AC-4 | 既存のテストが全て PASS すること                                                                          | `pnpm --filter @repo/desktop exec vitest run` が全件 PASS                       |
| AC-5 | 接続後の統合テストが追加されていること                                                                    | create モードの E2E テストが新規追加されており PASS すること                    |

---

### タスク3: スコープ定義

#### 含むもの（In Scope）

| 対象                                             | 内容                                                                                     |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `SkillCreatorService.ts` の `create` ケース修正  | `void structurePlan;` を `if (structurePlan) { await this.generateSkillMd(...) }` に変更 |
| `generateSkillMd` メソッドの実装または修正       | `skillDir` と `StructurePlanJson` を受け取り `generate_skill_md.js` を呼ぶ               |
| `structurePlan` が `null` の場合のエラーログ処理 | `this.logger.error` 等でエラーを記録しスキップ                                           |
| UT の追加（AC-1〜AC-2 の検証）                   | モックを使ったユニットテスト                                                             |
| IT の追加（AC-3・AC-5 の検証）                   | create モードの統合テスト                                                                |

#### 含まないもの（Out of Scope）

| 対象                                              | 理由                                                               |
| ------------------------------------------------- | ------------------------------------------------------------------ |
| `generate_skill_md.js` の `--plan` オプション実装 | `TASK-SC-FIX-GENERATE-SKILL-MD-001` の責務（先行タスクで対応済み） |
| `runCreateWorkflow` 自体のロジック変更            | 本タスクは戻り値の接続のみ                                         |
| UI/レンダラー側の変更                             | バックエンドサービス層のみ対象                                     |

---

## 参照資料

| 資料名                  | パス                                                                              | 用途                           |
| ----------------------- | --------------------------------------------------------------------------------- | ------------------------------ |
| SkillCreatorService.ts  | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                     | 現状コード確認（主要修正対象） |
| generate_skill_md.js    | `apps/desktop/src/main/services/skill/scripts/generate_skill_md.js`               | --plan オプション状態確認      |
| 元タスク仕様書          | `docs/30-workflows/unassigned-task/TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001.md` | 要件原本参照                   |
| aiworkflow-requirements | `.claude/skills/aiworkflow-requirements/references/`                              | プロジェクト共通仕様参照       |

---

## 統合テスト連携【必須】

本タスクは `SkillCreatorService` → `generate_skill_md.js` のプロセス間連携を含む。
以下の統合ポイントを要件に明記する。

| 統合ポイント                                        | 要件                                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------------ |
| `generateSkillMd(skillDir, structurePlan)` 呼び出し | `structurePlan` が非 null の場合のみ呼ばれること（AC-1）                 |
| `generate_skill_md.js` への `--plan` 渡し           | tmpFile に JSON シリアライズした `structurePlan` を書き込み、パスを渡す  |
| `structurePlan` が null の場合のフロー              | エラーログ出力・スキップ（AC-2）                                         |
| データフロー                                        | `runCreateWorkflow` → `StructurePlanJson` → `generateSkillMd` → SKILL.md |

| 判定項目                 | 基準 | 現状   |
| ------------------------ | ---- | ------ |
| ユニットテスト Line      | 80%+ | 未計測 |
| ユニットテスト Branch    | 60%+ | 未計測 |
| ユニットテスト Function  | 80%+ | 未計測 |
| 統合テスト（create E2E） | PASS | 未実施 |

---

## 多角的チェック観点

| 観点           | チェック内容                                                                         |
| -------------- | ------------------------------------------------------------------------------------ |
| 依存タスク整合 | TASK-SC-FIX-GENERATE-SKILL-MD-001 が完了し `--plan` オプションが利用可能か           |
| null 安全性    | `structurePlan` が null/undefined になりうる全ケースを洗い出せているか               |
| エラー処理網羅 | スクリプト実行失敗時・null時のフローが要件に含まれているか                           |
| 後方互換性     | 既存の `ensureSkillMdExists` など fallback 処理と競合しないか                        |
| テスト独立性   | 統合テストが外部スクリプトに依存し CI で不安定にならないか（モック戦略の検討が必要） |

---

## 成果物

| 成果物         | パス                                     | 説明                                     |
| -------------- | ---------------------------------------- | ---------------------------------------- |
| 要件抽出マップ | `outputs/phase-1/spec-extraction-map.md` | 現状コード調査結果・AC一覧・スコープ定義 |

---

## 完了条件

- [ ] P50チェック完了（`runCreateWorkflow` の戻り値・`void structurePlan;` の箇所・`generate_skill_md.js` の `--plan` 状態・既存テスト確認済み）
- [ ] 依存タスク（TASK-SC-FIX-GENERATE-SKILL-MD-001）の完了状態を確認済み
- [ ] AC-1〜AC-5 が検証可能な形で定義されている
- [ ] スコープ（In Scope / Out of Scope）が明確に定義されている
- [ ] 統合テスト連携の要件（統合ポイント・データフロー）が明記されている
- [ ] `outputs/phase-1/spec-extraction-map.md` が作成されている
- [ ] 本Phase内の全タスクを100%実行完了

---

## サブタスク管理

1. P50チェック（現状コード・依存タスク状況確認）
2. `generate_skill_md.js` の `--plan` オプション状態確認
3. 既存テストファイルの確認
4. AC-1〜AC-5 の定義
5. スコープ（In Scope / Out of Scope）の定義
6. 統合テスト連携の要件明記
7. 成果物（spec-extraction-map.md）の出力

---

## Phase末端アクション【必須】

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 --phase 1 \
  --artifacts "outputs/phase-1/spec-extraction-map.md:要件抽出マップ（現状調査・AC・スコープ）"
```

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

---

## 次のPhase

Phase 2: 設計
