# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 7                            |
| Phase名    | カバレッジ確認               |
| 前提Phase  | Phase 6                      |
| 後続Phase  | Phase 8                      |
| ステータス | 未実施                       |
| 作成日     | 2026-04-18                   |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |

---

## 目的

Phase 6（テスト拡充）で追加されたテストケースを含む全テストスイートを対象に、
`SkillCreatorService.ts` の purpose 抽出パスに対して十分なコードカバレッジが達成されているかを確認する。
目標値未達の場合は Phase 6 へ差し戻し、テストケースの追加補強を行う。

## 背景

`extract-purpose` エージェントによる LLM 接続実装（Phase 5）と境界値テスト拡充（Phase 6）が完了した段階で、
実装が正常系・異常系・境界値の全パスで十分にカバーされているかを計測し、品質ゲートとして機能させる。
カバレッジ未達のまま後続フェーズへ進むと、リファクタリングや品質保証フェーズで潜在バグが見落とされるリスクがある。

---

## 実行タスク

### タスク1: カバレッジ計測の実行

**目的**: `SkillCreatorService.ts` を対象としたカバレッジレポートを生成する。

**実行手順**:

1. 以下のコマンドでカバレッジを計測する:
   ```bash
   pnpm --filter @repo/desktop test --coverage
   ```
2. 出力された `coverage/` ディレクトリ（または標準出力）のレポートを確認する。
3. `SkillCreatorService.ts` のカバレッジ数値（Line / Branch / Function）を記録する。
4. purpose 抽出パス（`loadAgent` → `llmClient.generate` → `structurePlan.purpose` への代入）が
   計測対象に含まれていることを確認する。

**期待される成果物**:

- カバレッジレポート（標準出力またはHTMLレポート）
- `SkillCreatorService.ts` の Line / Branch / Function カバレッジ数値の記録

---

### タスク2: カバレッジ目標値の評価

**目的**: 取得した数値を目標値と照合し、PASS/FAIL を判定する。

**目標値**:

| 指標              | 最低基準 (PASS) | 推奨基準 |
| ----------------- | --------------- | -------- |
| Line Coverage     | 80%             | 90%      |
| Branch Coverage   | 60%             | 70%      |
| Function Coverage | 80%             | 90%      |

**実行手順**:

1. 計測結果を上記テーブルと照合する。
2. 3指標が全て最低基準を満たす場合: **PASS** → Phase 8 へ進む。
3. いずれか1指標でも最低基準を下回る場合: **FAIL** → Phase 6 へ差し戻す。

**期待される成果物**:

- PASS/FAIL 判定結果の記録

---

### タスク3: concern coverage の確認（正常系・異常系・境界値）

**目的**: カバレッジ数値だけでなく、テストが意味あるシナリオをカバーしているかを確認する。

**確認対象シナリオ**:

| シナリオ区分                         | 確認内容                                                                                       |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| 正常系                               | `loadAgent` 成功 + `llmClient.generate` 成功 → `structurePlan.purpose` に LLM 結果が格納される |
| 異常系（LLM エラー）                 | `llmClient.generate` が例外をスローした場合の処理フロー                                        |
| 異常系（エージェント定義取得エラー） | `loadAgent("extract-purpose")` が失敗した場合の処理フロー                                      |
| 境界値                               | `skillInput` が空文字・undefined・極端に長い文字列の場合の挙動                                 |
| 境界値                               | `llmClient.generate` が空文字を返した場合の `structurePlan.purpose` の値                       |

**実行手順**:

1. 上記5シナリオに対応するテストケースが Phase 4〜6 で作成済みであることを確認する。
2. 未カバーのシナリオがある場合は Phase 6 差し戻し対象として記録する。

**期待される成果物**:

- concern coverage マトリクス（シナリオ × テストケース対応表）

---

### タスク4: カバレッジ未達時のフォールバック手順

**目的**: FAIL 判定時の対処フローを明確にする。

**差し戻し条件と対応アクション**:

| 条件                          | 差し戻し先 | アクション                                           |
| ----------------------------- | ---------- | ---------------------------------------------------- |
| Line Coverage < 80%           | Phase 6    | 未カバーの実装行を確認し、対応テストケースを追加する |
| Branch Coverage < 60%         | Phase 6    | 条件分岐ごとのテストケース（正常・異常）を追加する   |
| Function Coverage < 80%       | Phase 6    | 未テストの関数・メソッドを洗い出し、テストを追加する |
| concern coverage シナリオ漏れ | Phase 6    | 漏れシナリオのテストケースを Phase 6 で追加する      |

**実行手順**:

1. FAIL 条件に該当する項目を記録する。
2. Phase 6 のタスク仕様書に差し戻し理由を明記した上で Phase 6 を再実行する。
3. Phase 6 再実行後、再度 Phase 7 を実行する。

---

### タスク5: 統合テスト連携の確認

**目的**: 統合テストが引き続き成功しており、カバレッジ計測がユニットテストのみに閉じていないことを確認する。

**実行手順**:

1. 統合テストスイートを再実行する:
   ```bash
   pnpm --filter @repo/desktop test
   ```
2. 全テスト（ユニット + 統合）が PASS していることを確認する。
3. 統合テストの PASS をゲート条件として記録する。

**期待される成果物**:

- 統合テスト全件 PASS の確認記録

---

## 参照資料

| 参照資料            | パス                                                                               | 内容                        |
| ------------------- | ---------------------------------------------------------------------------------- | --------------------------- |
| SkillCreatorService | apps/desktop/src/main/services/skill/SkillCreatorService.ts                        | 実装対象                    |
| purpose 抽出テスト  | apps/desktop/src/main/services/skill/**tests**/SkillCreatorService.purpose.test.ts | Phase 4〜6 で作成したテスト |
| Phase 6 仕様書      | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/phase-6-test-expansion.md           | 前提Phase 仕様書            |
| タスク index        | docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/index.md                            | タスク全体概要              |

---

## 成果物

| 成果物                      | パス                                       | 内容                                           |
| --------------------------- | ------------------------------------------ | ---------------------------------------------- |
| カバレッジ計測結果記録      | outputs/phase-7/coverage-report.md         | Line/Branch/Function の計測値と PASS/FAIL 判定 |
| concern coverage マトリクス | outputs/phase-7/concern-coverage-matrix.md | シナリオ × テストケース対応表                  |

---

## 統合テスト連携

Phase 7 では以下の統合テスト連携アクションを実行する:

1. **統合テスト再実行**: `pnpm --filter @repo/desktop test` でユニットテスト・統合テストを一括実行し、全件 PASS を確認する。
2. **ゲート判定**: 統合テストが1件でも FAIL の場合、カバレッジ数値が目標値を上回っていても Phase 8 へは進まず、Phase 6 へ差し戻す。
3. **カバレッジ計測との整合性確認**: 統合テストのパス結果とカバレッジ数値が矛盾していないことを確認する。

---

## 完了条件

- [ ] `pnpm --filter @repo/desktop test --coverage` が正常に完了している
- [ ] `SkillCreatorService.ts` の Line Coverage が 80% 以上である
- [ ] `SkillCreatorService.ts` の Branch Coverage が 60% 以上である
- [ ] `SkillCreatorService.ts` の Function Coverage が 80% 以上である
- [ ] concern coverage マトリクスで全5シナリオがカバーされている
- [ ] 統合テストが全件 PASS している
- [ ] カバレッジレポートと PASS/FAIL 判定が `outputs/phase-7/` に記録されている
