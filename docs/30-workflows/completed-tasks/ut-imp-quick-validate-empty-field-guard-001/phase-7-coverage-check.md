# Phase 7: テストカバレッジ確認 — name/description 空フィールドガード

## メタ情報

| 項目      | 値                                          |
| --------- | ------------------------------------------- |
| タスクID  | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 |
| Phase     | 7 — カバレッジ確認                          |
| 作成日    | 2026-02-27                                  |
| 前提Phase | Phase 6（テスト拡充）完了                   |
| 次Phase   | Phase 8（リファクタリング）                 |
| Issue     | #913                                        |

## 目的

Phase 6 で拡充したテスト結果を検証し、カバレッジ基準を確認する。基準未達の場合は Phase 6 に戻り、追加テストを作成する。

## 実行タスク

### Task 7-1: カバレッジ測定

#### 測定コマンド

```bash
cd .claude/skills/skill-creator && pnpm vitest run scripts/__tests__/quick_validate.test.js --coverage
```

Vitest の `--coverage` オプションで v8 カバレッジプロバイダを使用する。

#### カバレッジ対象ファイル

| ファイル                                                 | 役割                 |
| -------------------------------------------------------- | -------------------- |
| `.claude/skills/skill-creator/scripts/quick_validate.js` | メイン検証スクリプト |

`utils.js` は共有ユーティリティであり、本タスクの直接カバレッジ対象ではない（別タスクでカバレッジを管理する）。ただし、`parseFrontmatter` の呼び出しパスは本タスクのテストを通じて間接的にカバーされる。

### Task 7-2: カバレッジ基準の判定

#### ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 判定結果（実測値を記入） |
| ----------------- | -------- | -------- | ------------------------ |
| Line Coverage     | 80%      | 90%      | **\_\_**%                |
| Branch Coverage   | 60%      | 70%      | **\_\_**%                |
| Function Coverage | 80%      | 90%      | **\_\_**%                |

#### 判定テーブル

| 判定項目                            | 基準 | 結果（実測後に記入） |
| ----------------------------------- | ---- | -------------------- |
| quick_validate.js Line Coverage     | 80%+ | [ ] 達成 / [ ] 未達  |
| quick_validate.js Branch Coverage   | 60%+ | [ ] 達成 / [ ] 未達  |
| quick_validate.js Function Coverage | 80%+ | [ ] 達成 / [ ] 未達  |
| 全テスト PASS                       | 100% | [ ] 達成 / [ ] 未達  |
| 新規テスト（TC-GUARD シリーズ）PASS | 100% | [ ] 達成 / [ ] 未達  |
| 既存テスト（TC-N 〜 TC-IT）PASS     | 100% | [ ] 達成 / [ ] 未達  |

### Task 7-3: 未カバー箇所の分析

カバレッジレポートから未カバー行・未カバー分岐を特定する。

#### 想定される未カバー箇所

| 行番号   | コード                           | 未カバー理由                                       | 対応方針                    |
| -------- | -------------------------------- | -------------------------------------------------- | --------------------------- |
| L28-57   | `showHelp()`                     | CLI ヘルプ表示は子プロセステストでは呼び出しにくい | 許容（CLIヘルプは手動確認） |
| L257-289 | `main()` 関数の引数なし/パスなし | `process.exit` を伴うため子プロセスで間接テスト    | 既存 TC-OP テストでカバー   |
| L84-106  | `print(verbose)` の一部分岐      | verbose + 各種組合せの全パターン網羅が困難         | Phase 6 の verbose テスト   |

#### P41 対策

Vitest v8 カバレッジプロバイダは、インライン arrow function を独立した関数としてカウントする（P41）。`QuickValidationResult` クラス内のメソッドが全て呼び出されていない場合、Function Coverage が低下する可能性がある。

対策:

- `addError`, `addWarning`, `addPassed`, `isValid`, `print` の全メソッドが少なくとも 1 回呼び出されていることを確認する
- 既存テストで `verbose: true` を使用するテストケースがあるため、`print(true)` パスはカバーされている

### Task 7-4: Phase 6 差し戻し判定

| 条件                       | アクション                               |
| -------------------------- | ---------------------------------------- |
| 全カバレッジ基準達成       | Phase 8 へ進む                           |
| Line Coverage のみ未達     | Phase 6 に戻り、未カバー行のテスト追加   |
| Branch Coverage のみ未達   | Phase 6 に戻り、未カバー分岐のテスト追加 |
| Function Coverage のみ未達 | Phase 6 に戻り、未呼出関数のテスト追加   |
| 複数指標が未達             | Phase 6 に戻り、優先度順に対応           |

**差し戻し時の注意事項**:

- 差し戻しループは最大 2 回まで。3 回目の未達で MINOR 指摘として未タスク化する
- カバレッジのためだけに意味のないテストを追加しない（テストの目的が明確であること）

### Task 7-5: カバレッジレポートの作成

以下の情報を `outputs/phase-7/coverage-summary.md` に記録する:

```markdown
# カバレッジサマリ

## 測定日時

YYYY-MM-DD HH:MM

## 測定コマンド

cd .claude/skills/skill-creator && pnpm vitest run scripts/**tests**/quick_validate.test.js --coverage

## 結果

| ファイル          | Line      | Branch    | Function  |
| ----------------- | --------- | --------- | --------- |
| quick_validate.js | \_\_\_\_% | \_\_\_\_% | \_\_\_\_% |

## テスト件数

- 総テスト数: \_\_\_\_
- PASS: \_\_\_\_
- FAIL: 0
- SKIP: \_\_\_\_ (TC-WC-NEW-001, TC-WC-NEW-002)

## 判定

[ ] 全基準達成 → Phase 8 へ
[ ] 未達 → Phase 6 へ差し戻し（理由: \_\_\_\_）
```

## 参照資料

| 資料                           | パス                                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Phase 5 実装仕様               | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/phase-5-implementation.md` |
| Phase 6 テスト拡充仕様         | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/phase-6-test-expansion.md` |
| カバレッジ基準                 | `.claude/rules/02-code-quality.md#カバレッジ基準`                                                         |
| P41: v8 インライン関数カウント | `.claude/rules/06-known-pitfalls.md#P41`                                                                  |
| quality-requirements           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                               |

## 統合テスト連携

| シナリオカテゴリ        | 検証内容                           | 基準 |
| ----------------------- | ---------------------------------- | ---- |
| ユニットテスト Line     | quick_validate.js の行カバレッジ   | 80%+ |
| ユニットテスト Branch   | quick_validate.js の分岐カバレッジ | 60%+ |
| ユニットテスト Function | quick_validate.js の関数カバレッジ | 80%+ |
| 全テスト PASS           | 全テストケースが成功               | 100% |

## 多角的チェック観点

- [ ] カバレッジ測定コマンドが正しく実行される
- [ ] `--coverage` オプションが v8 プロバイダを使用している
- [ ] カバレッジレポートが `quick_validate.js` を含んでいる
- [ ] 未カバー箇所の理由が明確に説明されている
- [ ] 差し戻し判定が基準に基づいている

## 成果物

| 成果物           | 配置先                                |
| ---------------- | ------------------------------------- |
| カバレッジサマリ | `outputs/phase-7/coverage-summary.md` |

## 完了条件

- [ ] カバレッジ測定が完了している
- [ ] Line Coverage 80%+ を達成（または差し戻し判定済み）
- [ ] Branch Coverage 60%+ を達成（または差し戻し判定済み）
- [ ] Function Coverage 80%+ を達成（または差し戻し判定済み）
- [ ] カバレッジサマリがドキュメント化されている
- [ ] 全テストが PASS
- [ ] 差し戻しの場合、Phase 6 への具体的な指示が記録されている

## 次の Phase

- カバレッジ基準達成 → Phase 8（リファクタリング）へ進む
- カバレッジ基準未達 → Phase 6（テスト拡充）へ戻る
