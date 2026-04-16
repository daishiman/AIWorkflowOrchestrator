# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 3                                          |
| タスクID   | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 |
| 機能名     | runCreateWorkflow→generateSkillMd 接続     |
| 前提Phase  | Phase 2                                    |
| 後続Phase  | Phase 4（PASS または MINOR の場合）        |
| 作成日     | 2026-04-16                                 |
| ステータス | 未実施                                     |

---

## 目的

Phase 2 の設計内容を多角的にレビューし、Phase 4（テスト作成）への進行可否を判定する。
PASS / MINOR / MAJOR のいずれかを決定し、MINOR の場合は追跡テーブルに記録する。

> **このPhaseはレビューゲートである。** コードの実装は行わない。

---

## 実行タスク

### タスク1: 設計一貫性チェック

| チェック項目                                                                                             | 判定基準                   | 結果   |
| -------------------------------------------------------------------------------------------------------- | -------------------------- | ------ |
| `case "create"` ブロックが `const structurePlan` で戻り値を受け取っている                                | コードパターンが設計と一致 | 未実施 |
| `if (structurePlan)` による truthy チェックが null/undefined の両方をカバーしている                      | 型安全性の確認             | 未実施 |
| `generateSkillMd(skillDir, structurePlan)` のシグネチャが `private async ... Promise<void>` になっている | TypeScript で型エラーなし  | 未実施 |
| tmpFile に `JSON.stringify(structurePlan)` を書き込む設計になっている                                    | シリアライズ方式の整合     | 未実施 |
| `generate_skill_md.js` に `--plan <tmpPlanPath> --output <skillMdPath>` で渡す設計になっている           | インターフェース契約の整合 | 未実施 |
| `finally` ブロックで tmpFile のクリーンアップが行われる設計になっている                                  | リソースリークなしの確認   | 未実施 |
| `void structurePlan;` の削除が設計に含まれている                                                         | 不要コード除去の確認       | 未実施 |

---

### タスク2: AC 整合チェック

| AC ID | 設計対応                                                                                                        | 充足判定 |
| ----- | --------------------------------------------------------------------------------------------------------------- | -------- |
| AC-1  | create ケースで `if (structurePlan)` が true の場合に `generateSkillMd` が呼ばれる設計になっている              | 未実施   |
| AC-2  | `structurePlan` が null の場合に `logger.error` でログを出力し `generateSkillMd` をスキップする設計になっている | 未実施   |
| AC-3  | `generate_skill_md.js` が `--plan` オプションで `structurePlan` を受け取る契約が設計に明記されている            | 未実施   |
| AC-4  | 既存テストへの影響範囲が調査されており、破壊的変更がないことが設計で確認されている                              | 未実施   |
| AC-5  | create モードの統合テスト（E2E）の設計概要が記載されている                                                      | 未実施   |

---

### タスク3: 後方互換性チェック

```bash
# runCreateWorkflow の呼び出し元確認（破壊的変更の影響範囲）
grep -rn "runCreateWorkflow" apps/desktop/src/

# generateSkillMd の既存実装確認（既存メソッドがあれば衝突がないか）
grep -rn "generateSkillMd" apps/desktop/src/

# ensureSkillMdExists の呼び出し元確認（fallback処理との競合確認）
grep -rn "ensureSkillMdExists" apps/desktop/src/

# void structurePlan の参照箇所確認（削除対象の把握）
grep -rn "void structurePlan" apps/desktop/src/
```

| チェック項目                                                   | 判定基準                                     | 結果   |
| -------------------------------------------------------------- | -------------------------------------------- | ------ |
| `runCreateWorkflow` の戻り値変更が他の呼び出し元に影響しないか | grep 結果で影響範囲を確認                    | 未実施 |
| `generateSkillMd` が既存メソッドと競合しないか                 | 同名メソッドがないことを確認                 | 未実施 |
| `ensureSkillMdExists` との処理順序に矛盾がないか               | fallback 処理の位置関係を確認                | 未実施 |
| 既存のテストケースが設計変更後も PASS 見込みか                 | 変更対象が既存テストの前提を破壊しないか確認 | 未実施 |

---

### タスク4: 命名規則チェック

```bash
# 既存メソッド命名パターン確認（camelCase）
grep -n "private async\|private " apps/desktop/src/main/services/skill/SkillCreatorService.ts | head -20

# ログ呼び出しパターン確認
grep -n "this.logger" apps/desktop/src/main/services/skill/SkillCreatorService.ts | head -10
```

| 確認項目                                  | 期待パターン       | 結果   |
| ----------------------------------------- | ------------------ | ------ |
| メソッド名 `generateSkillMd`              | camelCase          | 未実施 |
| 引数名 `skillDir`, `structurePlan`        | camelCase          | 未実施 |
| ローカル変数 `tmpPlanPath`, `skillMdPath` | camelCase          | 未実施 |
| ログメソッド呼び出し `this.logger.error`  | 既存パターンと一致 | 未実施 |

---

### タスク5: リスクチェック

| リスク                                                            | 評価                                                                    | 対応                                               |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------- |
| tmpFile の競合（同時並行 create 実行）                            | `Date.now()` で一意化しているが厳密な一意性は保証できない               | `crypto.randomUUID()` への変更を MINOR として記録  |
| `generate_skill_md.js` の `--plan` オプションが未実装の場合       | TASK-SC-FIX-GENERATE-SKILL-MD-001 が完了していない場合に IT が失敗する  | 依存タスク完了確認を Phase 1 で実施済みであること  |
| `generateSkillMd` 失敗時に `ensureSkillMdExists` が二重実行される | fallback の位置次第で SKILL.md が上書きされる可能性                     | fallback 処理の呼び出しタイミングを Phase 5 で確認 |
| `StructurePlanJson` の型が null を許容している場合                | `if (structurePlan)` チェックで対応可能だが型定義の確認が必要           | Phase 4 で型チェックを実施                         |
| tmpFile クリーンアップ失敗が蓄積する                              | `finally` ブロックで `logger.warn` のみのため一時ファイルが溜まる可能性 | 問題は軽微・許容範囲内                             |

---

### タスク6: レビュー判定基準

| 判定  | 条件                                                                         | 次のアクション         |
| ----- | ---------------------------------------------------------------------------- | ---------------------- |
| PASS  | 全チェック項目でリスクなし、AC-1〜AC-5 の設計対応が充足                      | Phase 4 へ進む         |
| MINOR | 小さな指摘事項あり（実装時に並行解消可能）                                   | Phase 4 へ進む（追跡） |
| MAJOR | 設計の根本的な問題（型設計の破綻・AC未充足・依存タスク未完了による設計不可） | Phase 2 へ戻る         |

**MAJOR 判定となる条件の例:**

- TASK-SC-FIX-GENERATE-SKILL-MD-001 が未完了で `--plan` インターフェースが未確定のため設計が成立しない
- `StructurePlanJson` 型が存在せず、`generateSkillMd` のシグネチャが定義できない
- AC-1〜AC-5 のいずれかを設計が満たせない構造的欠陥がある

**総合判定:** （実行時に PASS / MINOR / MAJOR を記録）

---

### タスク7: MINOR 追跡テーブル

| MINOR ID         | 指摘内容                                                          | 解決予定Phase | 解決確認Phase | 備考               |
| ---------------- | ----------------------------------------------------------------- | ------------- | ------------- | ------------------ |
| （実行時に記録） | tmpFile 一意性: `Date.now()` → `crypto.randomUUID()` への変更検討 | Phase 5       | Phase 7       | リスクチェック参照 |

---

### タスク8: Phase 4 開始条件

Phase 4（テスト作成）を開始できる条件:

- [ ] 総合判定が PASS または MINOR であること
- [ ] MAJOR 判定の場合は Phase 2 へ戻り再設計を行うこと
- [ ] MINOR の指摘事項が追跡テーブルに記録されていること
- [ ] AC-1〜AC-5 の設計対応が全て確認されていること

---

## 参照資料

| 資料名                 | パス                                                          | 用途                            |
| ---------------------- | ------------------------------------------------------------- | ------------------------------- |
| Phase 1 成果物         | `outputs/phase-1/spec-extraction-map.md`                      | 要件・AC参照                    |
| Phase 2 成果物         | `outputs/phase-2/design-doc.md`                               | 設計書参照                      |
| SkillCreatorService.ts | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 変更箇所確認                    |
| 依存タスク仕様書       | `docs/30-workflows/TASK-SC-FIX-GENERATE-SKILL-MD-001/`        | 依存タスク完了・--plan 契約確認 |

---

## 統合テスト連携【必須】

| 判定項目               | 基準     | 結果   |
| ---------------------- | -------- | ------ |
| 型チェック（設計段階） | PASS     | 未実施 |
| lint                   | 0 error  | 未実施 |
| 依存タスク契約との整合 | 確認済み | 未実施 |

---

## 多角的チェック観点

| 観点             | チェック内容                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| 設計の完結性     | `generateSkillMd` の設計が tmpFile → スクリプト実行 → クリーンアップの全フローをカバーしているか     |
| 依存タスク整合   | TASK-SC-FIX-GENERATE-SKILL-MD-001 の `--plan` インターフェースと本設計の呼び出し規約が一致しているか |
| テスト設計適合   | Phase 4 でテストを書きやすい設計（モック可能なシグネチャ・責務分離）になっているか                   |
| エラー設計妥当性 | エラーの throw / log の使い分けが一貫しており、呼び出し元で適切にハンドリングできるか                |
| 最小変更原則     | 設計変更が本タスクのスコープ（戻り値の接続）に限定されており、過剰な変更がないか                     |

---

## 成果物

| 成果物           | パス                               | 説明                                  |
| ---------------- | ---------------------------------- | ------------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/gate-decision.md` | PASS/MINOR/MAJOR 判定・指摘事項・追跡 |

---

## 完了条件

- [ ] 設計一貫性チェック（7項目）が完了
- [ ] AC-1〜AC-5 の設計対応が確認済み
- [ ] 後方互換性チェック（grep による影響範囲確認）が完了
- [ ] 命名規則チェック（4項目）が完了
- [ ] リスクチェック（5項目）が完了
- [ ] 総合判定（PASS/MINOR/MAJOR）が記録されている
- [ ] MINOR 判定の指摘事項があれば追跡テーブルに記録済み
- [ ] Phase 4 開始条件（PASS or MINOR）が充足されている
- [ ] `outputs/phase-3/gate-decision.md` が作成されている
- [ ] 本Phase内の全タスクを100%実行完了

---

## サブタスク管理

1. 設計一貫性チェック（7項目）
2. AC 整合チェック（AC-1〜AC-5）
3. 後方互換性チェック（grep による影響範囲確認）
4. 命名規則チェック（4項目）
5. リスクチェック（5項目）
6. 総合判定記録
7. MINOR 追跡テーブル記録（該当時）
8. Phase 4 開始条件の確認
9. 成果物（gate-decision.md）の出力

---

## Phase末端アクション【必須】

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 --phase 3 \
  --artifacts "outputs/phase-3/gate-decision.md:設計レビュー判定結果（PASS/MINOR/MAJOR・指摘事項）"
```

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

---

## 次のPhase

Phase 4: テスト作成（PASS または MINOR の場合）
Phase 2: 設計（MAJOR の場合）
