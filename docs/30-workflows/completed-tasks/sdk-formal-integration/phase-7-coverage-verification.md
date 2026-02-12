# Phase 7: カバレッジ確認 — テストカバレッジ基準の充足判定

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-9B-I-SDK-FORMAL-INTEGRATION               |
| Phase番号  | 7                                              |
| Phase名    | カバレッジ確認                                 |
| 目的       | カバレッジ基準の充足を確認しゲート判定を行う   |
| 前提Phase  | Phase 6（テスト拡充）                          |
| 後続Phase  | Phase 8（リファクタリング）/ Phase 6（未達時） |
| ステータス | 未実施                                         |
| ブランチ   | refactor/task-9b-i-sdk-formal-integration      |
| 作成日     | 2026-02-12                                     |

---

## 目的

Phase 6 で追加したテストを含む全テストスイートを実行し、`SkillExecutor.ts` のカバレッジが規定の基準を充足しているかを確認する。カバレッジ基準を満たしていれば Phase 8（リファクタリング）に進行し、未達の場合は Phase 6（テスト拡充）に差し戻す。

---

## 依存関係

| 依存元  | 成果物                                     | 用途                 |
| ------- | ------------------------------------------ | -------------------- |
| Phase 6 | `outputs/phase-6/coverage-baseline.md`     | ベースラインとの比較 |
| Phase 6 | `outputs/phase-6/coverage-gap-analysis.md` | ギャップ解消の確認   |
| Phase 6 | 追加テストコード                           | カバレッジ測定に使用 |

---

## カバレッジ基準

### 基準テーブル

| 指標              | 最低基準（ゲート判定） | 推奨基準（目標値） | 未達時の対応     |
| ----------------- | ---------------------- | ------------------ | ---------------- |
| Line Coverage     | 80%                    | 90%                | Phase 6 差し戻し |
| Branch Coverage   | 60%                    | 70%                | Phase 6 差し戻し |
| Function Coverage | 80%                    | 90%                | Phase 6 差し戻し |

### 判定ルール

- **全達成**: 3 指標全てが最低基準を満たしている場合 → Phase 8 へ進行
- **一部未達**: いずれか 1 つ以上が最低基準を下回る場合 → Phase 6 へ差し戻し
- 推奨基準は目標値であり、ゲート判定には影響しない

---

## 実行タスク

### Task 1: カバレッジ再測定 — 全テスト実行後のカバレッジレポート取得

#### 実行コマンド

```bash
# 全テスト実行とカバレッジ取得
pnpm vitest run --coverage apps/desktop/src/main/services/skill/__tests__/
```

#### 測定対象

```
apps/desktop/src/main/services/skill/SkillExecutor.ts
```

#### テストファイル一覧（全 7 ファイル）

| No. | テストファイル                         | 種別               |
| --- | -------------------------------------- | ------------------ |
| 1   | `SkillExecutor.test.ts`                | 基本機能           |
| 2   | `SkillExecutor.auth.test.ts`           | 認証               |
| 3   | `SkillExecutor.retry.test.ts`          | リトライ           |
| 4   | `SkillExecutor.integration.test.ts`    | 統合               |
| 5   | `SkillExecutor.permission.test.ts`     | 権限管理           |
| 6   | `SkillExecutor.type-migration.test.ts` | 型マイグレーション |
| 7   | `SkillExecutor.sdk-types.test.ts`      | 型安全性（新規）   |

#### 成果物

カバレッジ測定結果を `outputs/phase-7/coverage-report.md` に記録する。

---

### Task 2: 基準充足判定 — ゲート判定の実施

#### 判定テーブル

| 指標              | Phase 6 ベースライン | Phase 7 測定値 | 最低基準 | 判定      |
| ----------------- | -------------------- | -------------- | -------- | --------- |
| Line Coverage     | （Phase 6 の値）     | （測定値）     | 80%      | PASS/FAIL |
| Branch Coverage   | （Phase 6 の値）     | （測定値）     | 60%      | PASS/FAIL |
| Function Coverage | （Phase 6 の値）     | （測定値）     | 80%      | PASS/FAIL |

#### 推奨基準との比較

| 指標              | 測定値     | 推奨基準 | 達成状況          |
| ----------------- | ---------- | -------- | ----------------- |
| Line Coverage     | （測定値） | 90%      | 達成/未達（参考） |
| Branch Coverage   | （測定値） | 70%      | 達成/未達（参考） |
| Function Coverage | （測定値） | 90%      | 達成/未達（参考） |

#### 総合判定

| 条件                            | 判定結果 | 次の行動                          |
| ------------------------------- | -------- | --------------------------------- |
| 3 指標全て最低基準以上          | **PASS** | Phase 8（リファクタリング）へ進行 |
| いずれか 1 指標でも最低基準未達 | **FAIL** | Phase 6（テスト拡充）へ差し戻し   |

---

### Task 3: 未達時対応 — Phase 6 差し戻し手順

#### 差し戻し条件

以下のいずれかが true の場合に差し戻す:

- Line Coverage < 80%
- Branch Coverage < 60%
- Function Coverage < 80%

#### 差し戻し時の指示

1. `outputs/phase-7/coverage-report.md` に未達箇所を詳細に記録する
2. 未達の指標ごとに、不足している行/分岐/関数を特定する
3. Phase 6 の `coverage-gap-analysis.md` を更新し、追加テストの候補を提示する
4. Phase 6 → Phase 7 のイテレーションを繰り返す

#### 差し戻し回数の上限

- 差し戻しは最大 3 回まで
- 3 回を超えた場合は、カバレッジ基準の見直し（Phase 1 への差し戻し）を検討する
- 差し戻し理由が「テスト不可能なコードパス」（デッドコード、環境依存等）の場合は、該当箇所をカバレッジ除外対象として文書化する

---

## 参照資料

| 参照資料                       | パス                                                                             | 内容                       |
| ------------------------------ | -------------------------------------------------------------------------------- | -------------------------- |
| Phase 6 カバレッジベースライン | `outputs/phase-6/coverage-baseline.md`                                           | ベースライン値             |
| Phase 6 ギャップ分析           | `outputs/phase-6/coverage-gap-analysis.md`                                       | 未網羅箇所の分析           |
| 型安全テスト                   | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts` | Phase 4-6 で作成したテスト |
| コード品質ルール               | `.claude/rules/02-code-quality.md`                                               | カバレッジ基準の定義       |

---

## 実行手順

### Step 1: テスト全件実行

1. `pnpm vitest run apps/desktop/src/main/services/skill/__tests__/` で全 7 テストファイルを実行する
2. 全テストが PASS することを確認する
3. テスト失敗がある場合は Phase 5 または Phase 6 の修正が必要

### Step 2: カバレッジレポート取得

1. `pnpm vitest run --coverage apps/desktop/src/main/services/skill/__tests__/` を実行する
2. `SkillExecutor.ts` のカバレッジ結果を抽出する
3. Line / Branch / Function の各指標を記録する

### Step 3: 基準充足判定

1. Task 2 の判定テーブルに測定値を記入する
2. 3 指標全てが最低基準以上かを判定する
3. 判定結果（PASS/FAIL）を記録する

### Step 4: 判定結果に基づく次アクション

1. **PASS の場合**: `outputs/phase-7/coverage-report.md` に達成結果を記録し、Phase 8 へ進行する
2. **FAIL の場合**: 未達箇所を記録し、Phase 6 への差し戻し指示を作成する

---

## 成果物

| 成果物             | 説明                                     | 配置先                               |
| ------------------ | ---------------------------------------- | ------------------------------------ |
| カバレッジレポート | 全テスト実行後のカバレッジ測定結果と判定 | `outputs/phase-7/coverage-report.md` |

---

## ゲート判定

| 判定結果 | 次Phase                                             |
| -------- | --------------------------------------------------- |
| PASS     | **Phase 8: リファクタリング**（カバレッジ基準達成） |
| FAIL     | **Phase 6: テスト拡充**（カバレッジ基準未達）       |

---

## 統合テスト連携

本タスクは型定義のみの変更であり、結合テストカバレッジ基準（API エンドポイント 100%、正常系 100%、異常系 80%+）は対象外。ユニットテストカバレッジ基準のみをゲート条件とする。

---

## 完了条件

- [ ] 全 7 テストファイルが実行され、全件 PASS している
- [ ] `SkillExecutor.ts` の Line Coverage が測定・記録されている
- [ ] `SkillExecutor.ts` の Branch Coverage が測定・記録されている
- [ ] `SkillExecutor.ts` の Function Coverage が測定・記録されている
- [ ] Phase 6 ベースラインとの比較が記録されている
- [ ] ゲート判定（PASS/FAIL）が明確に記録されている
- [ ] PASS の場合: 3 指標全てが最低基準以上であることが確認されている
- [ ] FAIL の場合: 未達箇所の詳細と Phase 6 差し戻し指示が記載されている
- [ ] カバレッジレポートが `outputs/phase-7/coverage-report.md` に配置されている
- [ ] 本Phase内の全タスクを100%実行完了した

---

## 次Phase

| 判定結果 | 次Phase                                        |
| -------- | ---------------------------------------------- |
| PASS     | **Phase 8: リファクタリング** — コード品質改善 |
| FAIL     | **Phase 6: テスト拡充** — 追加テスト作成       |
