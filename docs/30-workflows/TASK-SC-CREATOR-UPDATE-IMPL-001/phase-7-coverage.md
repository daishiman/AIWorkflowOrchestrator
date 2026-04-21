# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 7                               |
| タスクID   | TASK-SC-CREATOR-UPDATE-IMPL-001 |
| ステータス | 未実施                          |
| 作成日     | 2026-04-21                      |
| タスク種別 | NON_VISUAL（UI変更なし）        |
| 前Phase    | 6: テスト拡充                   |
| 次Phase    | 8: リファクタリング             |

---

## 目的

`runUpdateWorkflow()` の実装に対するブランチカバレッジを可視化し、
テストが不足しているパスを特定する。
LLMあり/なし・AbortSignal 中断・エラーハンドリングの全分岐が
テストによって検証されていることを確認し、Phase 8 のリファクタリングへ安全に移行できる状態を確立する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ブランチカバレッジの確認

**目的**: `runUpdateWorkflow()` の全分岐がテストでカバーされているかを確認する

**実行手順**:

1. 以下のコマンドでカバレッジレポートを生成する

```bash
pnpm --filter @repo/desktop test SkillCreatorService.update --coverage
```

2. `runUpdateWorkflow()` のブランチカバレッジ（Branch Coverage）を確認する
3. 以下の分岐が全てカバーされていることを照合する

**確認すべきブランチ一覧**:

| 分岐                                     | 対応テストID      | 期待カバレッジ |
| ---------------------------------------- | ----------------- | -------------- |
| `llmClient` が `null` の場合             | UPD-NORMAL-01     | カバー済み     |
| `llmClient` が存在する場合               | UPD-NORMAL-02     | カバー済み     |
| `fs.readFile()` が成功する場合           | UPD-NORMAL-01〜02 | カバー済み     |
| `fs.readFile()` が ENOENT エラーの場合   | UPD-FAIL-01       | カバー済み     |
| `fs.readFile()` がその他エラーの場合     | UPD-FAIL-02       | カバー済み     |
| `extractPurposeWithLlm()` が失敗の場合   | UPD-FAIL-03〜04   | カバー済み     |
| `loading-skill` 前の AbortSignal 中断    | UPD-ABORT-01      | カバー済み     |
| `analyzing` 前の AbortSignal 中断        | UPD-ABORT-02      | カバー済み     |
| `generating-skill` 前の AbortSignal 中断 | UPD-ABORT-03      | カバー済み     |
| `validating` 前の AbortSignal 中断       | UPD-ABORT-04      | カバー済み     |
| AbortError の再スロー                    | UPD-ABORT-05      | カバー済み     |

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` のブランチカバレッジセクション

---

### タスク2: カバレッジ不足パスの特定と対処

**目的**: カバレッジレポートで検出された未カバーの分岐を特定し、対処方針を決定する

**実行手順**:

1. カバレッジレポートの `runUpdateWorkflow()` 行を確認し、未カバーのブランチ（`0x` 表示）を列挙する
2. 未カバーのブランチがある場合、以下のいずれかで対処する
   - テストを追加して本 Phase 内でカバーする（軽微な追加で対応可能な場合）
   - 次フェーズ以降の課題として `outputs/phase-7/coverage-report.md` に記録する
3. 意図的にカバーしない分岐（到達不可能なパス等）は除外理由を明記する

**カバレッジ目標**:

| 指標                                   | 目標値   | 判定                   |
| -------------------------------------- | -------- | ---------------------- |
| `runUpdateWorkflow` ブランチカバレッジ | 90% 以上 | 未達の場合は残課題記録 |
| `case "update":` ライン カバレッジ     | 100%     | 必須                   |

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` のカバレッジ不足・除外理由セクション

---

### タスク3: update モード全体の動作確認（統合観点）

**目的**: `case "update":` から `runUpdateWorkflow()` までの呼び出し経路が
テストで一貫して検証されていることを確認する

**実行手順**:

1. `SkillCreatorService.integration.test.ts` が `update` モードのテストケースを含むかを確認する
2. 統合テストで `update` モードが未検証の場合、以下のテストケースが
   `SkillCreatorService.update.test.ts` でカバーされていることを代替確認とする
   - `case "update":` が `runUpdateWorkflow()` を呼び出すこと
   - `emitProgress` が `update` モードの PROGRESS_FLOWS に従って発火すること
3. 統合テストの `update` モードカバレッジ状況を `coverage-report.md` に記録する

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` の統合観点セクション

---

### タスク4: テスト実行時間の計測

**目的**: 追加されたテスト群が CI 実行時間に与える影響を計測し、許容範囲内であることを確認する

**実行手順**:

1. 以下のコマンドで update テストの実行時間を計測する

```bash
pnpm --filter @repo/desktop test SkillCreatorService.update --reporter=verbose
```

2. 実行時間を記録し、以下の基準で評価する

| 評価基準                                            | 判定基準       |
| --------------------------------------------------- | -------------- |
| `SkillCreatorService.update.test.ts` 単体の実行時間 | 30秒以内で許容 |
| `SkillCreatorService` 関連テスト全体の追加時間      | 60秒以内で許容 |

3. 許容範囲を超える場合はモック設定の見直しを推奨事項として記録する

**期待される成果物**:

- `outputs/phase-7/coverage-report.md` の実行時間評価セクション

---

## 参照資料

| 参照資料                  | パス                                                                                     | 内容                                       |
| ------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------ |
| update テスト（拡充済み） | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.update.test.ts`      | Phase 6 で拡充したテストファイル           |
| integration テスト        | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.integration.test.ts` | 統合テストの update モードカバレッジ確認   |
| SkillCreatorService 実装  | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                            | `runUpdateWorkflow()` 実装・分岐構造の確認 |
| Phase 6 成果物            | `outputs/phase-6/expansion-test-result.md`                                               | テスト拡充結果（テストID 一覧）            |

---

## 成果物

| 成果物             | パス                                 | 内容                                                       |
| ------------------ | ------------------------------------ | ---------------------------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | ブランチカバレッジ・不足パス・統合観点・実行時間評価を記載 |

---

## 統合テスト連携

**Phase 7 の統合テスト連携アクション**:

- ブランチカバレッジの可視化により、`runUpdateWorkflow()` の全分岐が CI で保護されていることを確認する
- カバレッジ不足が発見された場合は Phase 6 へ戻り、不足テストを追加してから再実行する
- 統合テストでの `update` モードカバレッジ状況を記録し、後続フェーズへ引き継ぐ
- 実行時間計測により、テスト追加が CI パイプラインに与える影響を定量的に把握する

---

## 多角的チェック観点（AIが判断）

| 観点                   | チェック内容                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| ブランチ網羅性         | `llmClient` あり/なし・全 AbortSignal 中断ポイント・エラーハンドリングが全てカバーされているか |
| 到達不可能パスの識別   | 除外したブランチに理由が明記されているか                                                       |
| 統合テストとの補完     | unit テストと integration テストで `update` モードが重複なく補完されているか                   |
| カバレッジ目標の妥当性 | 90% 目標が `runUpdateWorkflow()` の複雑度に対して適切か                                        |
| CI 時間への影響        | 30秒/テストファイルの基準が守られているか                                                      |

---

## サブタスク管理

| サブタスクID | 内容                                   | ステータス |
| ------------ | -------------------------------------- | ---------- |
| ST-7-01      | ブランチカバレッジ確認・レポート生成   | 未実施     |
| ST-7-02      | カバレッジ不足パスの特定と対処方針決定 | 未実施     |
| ST-7-03      | update モード統合観点の確認            | 未実施     |
| ST-7-04      | テスト実行時間の計測と評価             | 未実施     |

---

## ゲート判定

| 判定基準                                          | 条件     | 次のアクション                                   |
| ------------------------------------------------- | -------- | ------------------------------------------------ |
| `runUpdateWorkflow` ブランチカバレッジが 90% 以上 | 目標達成 | Phase 8（リファクタリング）へ進む                |
| `runUpdateWorkflow` ブランチカバレッジが 90% 未満 | 目標未達 | Phase 6 へ戻り不足テストを追加                   |
| `case "update":` ラインカバレッジが 100%          | 必須達成 | Phase 8 へ進む                                   |
| CI 実行時間が許容範囲内（30秒/ファイル以内）      | 時間内   | Phase 8 へ進む                                   |
| CI 実行時間が許容範囲超                           | 時間超過 | モック設定見直しを推奨事項として記録しPhase 8 へ |

---

## 完了条件

- [ ] `runUpdateWorkflow()` のブランチカバレッジが算出されている
- [ ] 全分岐（llmClient あり/なし・AbortSignal 中断・エラーハンドリング）が照合されている
- [ ] カバレッジ不足パスが特定され、対処方針または除外理由が記録されている
- [ ] `case "update":` のラインカバレッジが 100% であることが確認されている
- [ ] テスト実行時間が計測され、許容範囲内であることが確認されている
- [ ] ゲート判定が実施され、Phase 8 への進行可否が決定されている
- [ ] `outputs/phase-7/coverage-report.md` が生成されている

---

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-SC-CREATOR-UPDATE-IMPL-001/phase-8-refactoring.md`
