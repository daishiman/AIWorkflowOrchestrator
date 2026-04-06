# Phase 11: 手動テスト検証 - TASK-P0-07 ハードコードされた AGENT_NAMES の動的解決

## メタ情報

| 項目      | 値                                                      |
| --------- | ------------------------------------------------------- |
| Phase     | 11                                                      |
| Phase名   | 手動テスト検証                                          |
| 機能名    | TASK-P0-07-hardcoded-agent-names-dynamic-resolution     |
| 作成日    | 2026-04-06                                              |
| タスクID  | TASK-P0-07                                              |
| カテゴリ  | NON_VISUAL（UI変更なし、Main Process リファクタリング） |
| 前提Phase | Phase 10: 最終レビューゲート                            |
| 後続Phase | Phase 12: ドキュメント更新                              |

### NON_VISUAL タスク宣言

| 項目                             | 値                                                                 |
| -------------------------------- | ------------------------------------------------------------------ |
| 証跡の主ソース                   | 自動テスト（RuntimeSkillCreatorFacade / manifestResourceResolver） |
| スクリーンショットを作らない理由 | NON_VISUAL タスク（UI変更なし、Main Process リファクタリング）     |

---

## 目的

Phase 10 までの最終レビューで確認した実装を、自動テスト結果および静的解析結果を代替エビデンスとして手動テスト検証を完了する。NON_VISUAL タスクのため、スクリーンショットは不要であり、自動テスト PASS・typecheck/lint エラーなし・grep によるコード品質確認をもって検証完了とする。

---

## 実行タスク

- タスク1: 自動テストの実行と結果記録
- タスク2: 静的解析チェック（typecheck / lint）
- タスク3: コード品質 grep 検証
- タスク4: manual-test-result.md の作成

---

## 参照資料

| 資料名                    | パス                                                                  | 説明                                   |
| ------------------------- | --------------------------------------------------------------------- | -------------------------------------- |
| RuntimeSkillCreatorFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | plan()/improve() の動的・静的パス実装  |
| manifestResourceResolver  | `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts`  | buildPhaseResourceRequestsFromManifest |
| planPromptConstants       | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`       | PLAN_RESOURCE_REQUESTS 静的定義        |
| improvePromptConstants    | `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`    | IMPROVE_RESOURCE_REQUESTS 静的定義     |
| Phase 1 要件定義          | `phase-1-requirements.md`                                             | FR/NFR/AC 定義                         |
| Phase 2 設計              | `phase-2-design.md`                                                   | 設計仕様                               |
| Phase 3 設計レビュー      | `phase-3-design-review.md`                                            | レビュー判定結果                       |

---

## 実行手順

### タスク1: 自動テストの実行と結果記録

**目的**: TASK-P0-07 で追加・変更されたテストスイートを実行し、全 PASS を確認する。

**実行コマンド**:

```bash
# RuntimeSkillCreatorFacade 関連テスト
pnpm --filter @repo/desktop test RuntimeSkillCreatorFacade

# manifestResourceResolver ユニットテスト
pnpm --filter @repo/desktop test manifestResourceResolver
```

**結果記録テーブル**:

| #    | テストスイート            | コマンド                                                     | 期待結果 | 実行結果 | テスト数 | 備考 |
| ---- | ------------------------- | ------------------------------------------------------------ | -------- | -------- | -------- | ---- |
| T-01 | RuntimeSkillCreatorFacade | `pnpm --filter @repo/desktop test RuntimeSkillCreatorFacade` | 全 PASS  | 未実施   | -        | -    |
| T-02 | manifestResourceResolver  | `pnpm --filter @repo/desktop test manifestResourceResolver`  | 全 PASS  | 未実施   | -        | -    |

**確認観点**:

- AC-1: `plan()` の動的パスで manifest の `plan` フェーズ `resourceIds` からエージェントリストが組み立てられる
- AC-2: `improve()` の動的パスで manifest の `improve` フェーズ `resourceIds` からエージェントリストが組み立てられる
- AC-3: manifest にフェーズが存在しない場合、`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` にフォールバックする
- AC-4: manifest の `resourceIds` が空の場合、`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` にフォールバックする
- AC-5: フォールバック発動時にログ出力がある
- AC-7: 既存テスト `T-P7-04` が PASS する

---

### タスク2: 静的解析チェック（typecheck / lint）

**目的**: 型安全性と lint ルール準拠を確認する。

**実行コマンド**:

```bash
# TypeScript型チェック
pnpm --filter @repo/desktop typecheck

# ESLintチェック
pnpm --filter @repo/desktop lint
```

**結果記録テーブル**:

| #    | チェック項目         | コマンド                                | 期待結果   | 実行結果 | エラー数 | 備考 |
| ---- | -------------------- | --------------------------------------- | ---------- | -------- | -------- | ---- |
| S-01 | TypeScript型チェック | `pnpm --filter @repo/desktop typecheck` | エラーなし | 未実施   | -        | -    |
| S-02 | ESLint               | `pnpm --filter @repo/desktop lint`      | エラーなし | 未実施   | -        | -    |

---

### タスク3: コード品質 grep 検証

**目的**: 実装が要件（FR-05, NFR-05）を満たしていることを grep で確認する。

**実行コマンド**:

```bash
# 確認1: PLAN_RESOURCE_REQUESTS が保持されていること（FR-05）
grep -rn "PLAN_RESOURCE_REQUESTS" apps/desktop/src/main/services/runtime/

# 確認2: IMPROVE_RESOURCE_REQUESTS が保持されていること（FR-05）
grep -rn "IMPROVE_RESOURCE_REQUESTS" apps/desktop/src/main/services/runtime/

# 確認3: 新規エージェント名定数が追加されていないこと（NFR-05）
# 以下のパターンで新たなハードコード定数がないことを確認
grep -rn "AGENT_NAMES\|AGENT_LIST\|const.*agents.*=" apps/desktop/src/main/services/runtime/ | grep -v "test\|__tests__\|node_modules\|PLAN_RESOURCE_REQUESTS\|IMPROVE_RESOURCE_REQUESTS"

# 確認4: buildPhaseResourceRequestsFromManifest が使用されていること
grep -rn "buildPhaseResourceRequestsFromManifest" apps/desktop/src/main/services/runtime/
```

**結果記録テーブル**:

| #    | 確認項目                                                | 期待結果                                      | 実行結果 | 備考 |
| ---- | ------------------------------------------------------- | --------------------------------------------- | -------- | ---- |
| G-01 | PLAN_RESOURCE_REQUESTS が保持されている                 | planPromptConstants.ts + 参照箇所にヒット     | 未実施   | -    |
| G-02 | IMPROVE_RESOURCE_REQUESTS が保持されている              | improvePromptConstants.ts + 参照箇所にヒット  | 未実施   | -    |
| G-03 | 新規エージェント名定数が追加されていない                | ヒットなし（0件）                             | 未実施   | -    |
| G-04 | buildPhaseResourceRequestsFromManifest が使用されている | manifestResourceResolver.ts + Facade にヒット | 未実施   | -    |

---

### タスク4: manual-test-result.md の作成

**目的**: Phase 11 の検証結果を成果物として記録する。

**記載必須項目**:

1. **NON_VISUAL タスク宣言**（メタ情報セクションに以下を明記）:
   - 「証跡の主ソース：自動テスト（RuntimeSkillCreatorFacade / manifestResourceResolver）」
   - 「スクリーンショットを作らない理由：NON_VISUAL タスク（UI変更なし、Main Process リファクタリング）」

2. **自動テスト結果サマリー**: タスク1 の T-01, T-02 の結果

3. **静的解析結果サマリー**: タスク2 の S-01, S-02 の結果

4. **grep 検証結果サマリー**: タスク3 の G-01〜G-04 の結果

5. **AC 充足確認テーブル**:

   | AC ID | 基準                                                            | 検証方法       | 結果 |
   | ----- | --------------------------------------------------------------- | -------------- | ---- |
   | AC-1  | plan() の動的パスで manifest の plan フェーズから組み立て       | automated-test | -    |
   | AC-2  | improve() の動的パスで manifest の improve フェーズから組み立て | automated-test | -    |
   | AC-3  | manifest にフェーズが存在しない場合のフォールバック             | automated-test | -    |
   | AC-4  | manifest の resourceIds が空の場合のフォールバック              | automated-test | -    |
   | AC-5  | フォールバック発動時のログ出力                                  | automated-test | -    |
   | AC-6  | PLAN_RESOURCE_REQUESTS / IMPROVE_RESOURCE_REQUESTS の保持       | code-review    | -    |
   | AC-7  | 既存テスト T-P7-04 が PASS                                      | automated-test | -    |
   | AC-8  | typecheck / lint がエラーなし                                   | automated-test | -    |

6. **発見問題一覧**（0件の場合も「0件」と明記）

**出力先**: `outputs/phase-11/manual-test-result.md`

---

## 統合テスト連携

### 自動テスト代替記録

本 Phase は NON_VISUAL タスクであるため、手動 UI テストの代わりに自動テスト結果を代替エビデンスとする。

| 判定項目                 | 基準                      | 備考                                                      |
| ------------------------ | ------------------------- | --------------------------------------------------------- |
| 自動テスト全 PASS        | RuntimeSkillCreatorFacade | plan()/improve() の動的解決パス + フォールバックパス      |
| 自動テスト全 PASS        | manifestResourceResolver  | buildPhaseResourceRequestsFromManifest の全変換パターン   |
| typecheck エラーなし     | desktop パッケージ全体    | NFR-02 の充足確認                                         |
| lint エラーなし          | desktop パッケージ全体    | NFR-03 の充足確認                                         |
| 静的定数保持確認（grep） | FR-05 / NFR-05            | PLAN_RESOURCE_REQUESTS / IMPROVE_RESOURCE_REQUESTS の存在 |

---

## 成果物

| 成果物         | パス                                     | 説明                                     |
| -------------- | ---------------------------------------- | ---------------------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | NON_VISUAL 代替エビデンス・AC充足記録    |
| 発見問題一覧   | `outputs/phase-11/discovered-issues.md`  | Critical/Major/Minor 分類（0件でも作成） |

---

## 完了条件

- [ ] 自動テスト `RuntimeSkillCreatorFacade` が全 PASS している
- [ ] 自動テスト `manifestResourceResolver` が全 PASS している
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過している
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしで通過している
- [ ] grep で `PLAN_RESOURCE_REQUESTS` が保持されていることを確認している（FR-05）
- [ ] grep で `IMPROVE_RESOURCE_REQUESTS` が保持されていることを確認している（FR-05）
- [ ] grep で新規エージェント名定数が追加されていないことを確認している（NFR-05）
- [ ] grep で `buildPhaseResourceRequestsFromManifest` が使用されていることを確認している
- [ ] AC-1〜AC-8 の全受け入れ基準が充足されている
- [ ] Critical 問題が 0 件であること（Major 以下は discovered-issues.md に記録して続行可）
- [ ] `outputs/phase-11/manual-test-result.md` に NON_VISUAL 宣言・自動テスト結果・AC充足テーブルが記載されている
- [ ] `outputs/phase-11/discovered-issues.md` が作成されている（0件でも作成必須）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 12: ドキュメント更新に進む。Phase 11 で発見された Minor 問題は Phase 12 の MINOR 追跡テーブルに転記する。
