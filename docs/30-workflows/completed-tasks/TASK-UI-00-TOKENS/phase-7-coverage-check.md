# Phase 7: カバレッジ確認

## メタ情報

| 項目          | 値                                                                                 |
| ------------- | ---------------------------------------------------------------------------------- |
| タスクID      | TASK-UI-00-TOKENS                                                                  |
| Phase         | 7                                                                                  |
| Phase名       | カバレッジ確認                                                                     |
| 前提Phase     | Phase 6（テスト拡充）完了 — 追加テストが全て PASS していること                     |
| 前Phase成果物 | `outputs/phase-6/coverage-report.md`、`renderWithTheme.test.tsx`（追加テスト込み） |
| 実行方式      | 直列（カバレッジ測定 → 判定 → 記録）                                               |

## 目的

Phase 6 で拡充したテストを含めた最終的なカバレッジを測定し、プロジェクトのカバレッジ基準（Line 80%+、Branch 60%+、Function 80%+）を満たしていることを確認する。未達の場合は Phase 6 に戻り追加テストを作成する。

## 実行タスク

- Phaseタスク実行: 本PhaseのTaskを順に実行し、結果を成果物へ記録する

### Task 1: カバレッジ測定実行

#### 1.1 測定コマンド

```bash
cd apps/desktop && pnpm vitest run src/renderer/tests/helpers/renderWithTheme.test.tsx --coverage
```

#### 1.2 カバレッジゲートテーブル

| 指標              | 最低基準 | 推奨基準 | 対象ファイル          | 未達時アクション |
| ----------------- | -------- | -------- | --------------------- | ---------------- |
| Line Coverage     | 80%      | 90%      | `renderWithTheme.tsx` | Phase 6 に戻る   |
| Branch Coverage   | 60%      | 70%      | `renderWithTheme.tsx` | Phase 6 に戻る   |
| Function Coverage | 80%      | 90%      | `renderWithTheme.tsx` | Phase 6 に戻る   |

#### 1.3 ゲート判定ロジック

```
IF (Line >= 80% AND Branch >= 60% AND Function >= 80%) THEN
  → PASS: Phase 8 へ進む
ELSE
  → FAIL: Phase 6 に戻り、未カバー箇所のテストを追加
```

### Task 2: カバレッジレポート作成

#### 2.1 レポート内容

`outputs/phase-7/coverage-report.md` に以下を記録する:

| セクション                 | 内容                                          |
| -------------------------- | --------------------------------------------- |
| 測定日時                   | YYYY-MM-DD HH:mm                              |
| 測定コマンド               | 実行したコマンド文字列                        |
| 対象ファイル一覧           | カバレッジ対象のファイルパス                  |
| カバレッジ結果テーブル     | Line / Branch / Function の各値と基準充足判定 |
| テストケース総数           | Phase 4 + Phase 6 のテストケース合計数        |
| 未カバー行（該当する場合） | カバーされていない行番号と内容                |
| ゲート判定結果             | PASS / FAIL                                   |

#### 2.2 レポートテンプレート

```markdown
# Phase 7: カバレッジ確認レポート

## 測定情報

| 項目         | 値                                                  |
| ------------ | --------------------------------------------------- |
| 測定日時     | YYYY-MM-DD HH:mm                                    |
| 測定コマンド | `cd apps/desktop && pnpm vitest run ... --coverage` |

## カバレッジ結果

| ファイル              | Line | Branch | Function | 基準充足 |
| --------------------- | ---- | ------ | -------- | -------- |
| `renderWithTheme.tsx` | XX%  | XX%    | XX%      | ✅/❌    |

## テストケース数

| Phase   | テストケース数    |
| ------- | ----------------- |
| Phase 4 | 7                 |
| Phase 6 | 5 + WCAG + 整合性 |
| 合計    | XX                |

## ゲート判定

判定: **PASS** / **FAIL**

（FAIL の場合、未カバー箇所の詳細を記載）
```

### Task 3: 全テスト PASS 確認

#### 3.1 全テスト実行コマンド

```bash
cd apps/desktop && pnpm vitest run
```

#### 3.2 確認事項

| 確認項目                                     | 期待結果                          |
| -------------------------------------------- | --------------------------------- |
| `renderWithTheme.test.tsx` の全テストが PASS | Phase 4 + Phase 6 のテスト全 PASS |
| 既存テストが壊れていない                     | 既存の全テストが PASS             |
| テスト間の状態汚染がない                     | テスト実行順序に依存していない    |

## 参照資料

| 資料                                                                        | 参照目的                              |
| --------------------------------------------------------------------------- | ------------------------------------- |
| `docs/30-workflows/TASK-UI-00-TOKENS/phase-6-test-expansion.md`             | Phase 6 のテスト拡充結果              |
| `outputs/phase-6/coverage-report.md`                                        | Phase 6 のカバレッジ結果              |
| `.claude/rules/02-code-quality.md` — カバレッジ基準                         | Line 80%+, Branch 60%+, Function 80%+ |
| `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト品質基準                        |

- 依存Phase成果物参照: `phase-5-*`、`phase-6-*`

## システム仕様（aiworkflow-requirements）

本Phaseは `aiworkflow-requirements` の参照仕様を根拠として進める。適用対象は本書の「参照資料」に列挙した `.claude/skills/aiworkflow-requirements/references/*.md` とし、UI/UX・アクセシビリティ・テスト品質の3観点を完了条件にトレースする。

| 観点             | 抽出した必須要件                              | 反映先                     |
| ---------------- | --------------------------------------------- | -------------------------- |
| UI/UX            | Apple HIG準拠のトークン・テーマ設計を維持する | 実行タスク、完了条件       |
| アクセシビリティ | WCAG 2.1 AA（コントラスト/操作性）を満たす    | 実行タスク、統合テスト連携 |
| 品質保証         | Vitest/品質ゲートを満たす                     | 統合テスト連携、完了条件   |

## 実行手順

| Step | 内容                                                                           | 実行方式 |
| ---- | ------------------------------------------------------------------------------ | -------- |
| 1    | カバレッジ付きテスト実行（Task 1）: `--coverage` フラグでテスト実行            | 直列     |
| 2    | カバレッジ結果の判定: ゲートテーブルに照らしてPASS/FAILを判定                  | 直列     |
| 3    | FAIL の場合: Phase 6 に戻り追加テストを作成後、再度 Phase 7 を実行             | 直列     |
| 4    | PASS の場合: カバレッジレポート作成（Task 2）                                  | 直列     |
| 5    | 全テスト PASS 確認（Task 3）: `pnpm vitest run` で既存テストも含め全テスト実行 | 直列     |

## 統合テスト連携

- カバレッジ未達時は Phase 6 にループバックし、テストを追加する
- Phase 6 → Phase 7 のループは最大 3 回まで。3 回ループ後も未達の場合は、未カバー理由を `coverage-report.md` に記載し、次 Phase へ進む
- 全テスト PASS かつカバレッジ基準充足後、Phase 8（リファクタリング）に進む

## 多角的チェック観点

| 観点               | 検証内容                                                   |
| ------------------ | ---------------------------------------------------------- |
| カバレッジ基準充足 | Line 80%+, Branch 60%+, Function 80%+ の全てを満たしている |
| 既存テスト不変     | 新規テスト追加により既存テストが壊れていない               |
| レポート完全性     | カバレッジ結果、テストケース数、ゲート判定が記録されている |
| テスト独立性       | テスト実行順序を変えても全テストが PASS する               |

## 成果物

| #   | 成果物             | パス                                 |
| --- | ------------------ | ------------------------------------ |
| 1   | カバレッジレポート | `outputs/phase-7/coverage-report.md` |

## 完了条件

- [ ] カバレッジ測定コマンドが実行されている
- [ ] カバレッジ結果が Line 80%+, Branch 60%+, Function 80%+ を全て満たしている（FAIL の場合は Phase 6 に戻る）
- [ ] `outputs/phase-7/coverage-report.md` が作成され、測定結果とゲート判定が記録されている
- [ ] `cd apps/desktop && pnpm vitest run` で全テスト（既存テスト含む）が PASS
- [ ] テスト間の状態汚染がないことが確認されている
- [ ] 本Phase内の全タスク（Task 1〜3）を100%実行完了

## サブタスク管理

| タスク | 状態    | 担当 |
| ------ | ------- | ---- |
| Task 1 | pending | -    |
| Task 2 | pending | -    |
| Task 3 | pending | -    |

## タスク100%実行確認

- [ ] Task 1: カバレッジ測定実行 — 完了
- [ ] Task 2: カバレッジレポート作成 — 完了
- [ ] Task 3: 全テスト PASS 確認 — 完了

## 次のPhase

Phase 8: リファクタリング — `phase-8-refactoring.md`

> **判定フロー**: カバレッジ基準未達の場合は Phase 6 に戻り、テスト拡充後に再度 Phase 7 を実行する。PASS の場合のみ Phase 8 へ進む。
