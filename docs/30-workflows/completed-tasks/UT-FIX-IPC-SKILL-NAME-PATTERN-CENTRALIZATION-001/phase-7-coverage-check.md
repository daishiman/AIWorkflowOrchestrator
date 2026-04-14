# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 7                                                  |
| 機能名     | UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001   |
| タスク名   | スキル名バリデーション正規表現の shared 定数一元化 |
| 前提Phase  | Phase 6                                            |
| 後続Phase  | Phase 8                                            |
| 作成日     | 2026-04-06                                         |
| ステータス | completed                                          |

## 目的

Phase 4〜6 で作成・拡充したテストのカバレッジを計測し、目標値を達成していることを確認する。
未カバー行を特定し、追加テストの要否を判断する。

## 背景

shared 定数一元化によって新規作成された `skillName.ts` は変更頻度の低い定数ファイルであるため、
100% カバレッジを達成することが現実的かつ重要である。
また `SkillScanner.ts` の変更箇所および `init_skill.js` の変更箇所についても
それぞれ目標カバレッジを設定して確認する。

## 実行タスク

- `skillName.ts` のカバレッジを 100% にする。
- `SkillScanner.ts` の変更箇所カバレッジを 100% にする。
- `init_skill.js` の import 参照を手動確認する。
- 未カバー行の分析結果を `outputs/phase-7/` に出力する。

## SubAgentチーム編成

| SubAgent   | 関心ごと             | 主担当                                                       |
| ---------- | -------------------- | ------------------------------------------------------------ |
| SubAgent-A | shared定数カバレッジ | `skillName.ts` のカバレッジ計測・100%達成確認                |
| SubAgent-B | TypeScriptカバレッジ | `SkillScanner.ts` の変更箇所カバレッジ計測・100%達成確認     |
| SubAgent-C | ESM手動確認          | `init_skill.js` の変更箇所の手動カバレッジ確認・レポート作成 |
| SubAgent-D | 統合監査             | カバレッジレポートの矛盾・漏れ・トレーサビリティ判定         |

## カバレッジ目標

| 対象ファイル                                                  | 目標カバレッジ | 計測方法        |
| ------------------------------------------------------------- | -------------- | --------------- |
| `packages/shared/src/constants/skillName.ts`                  | 100%           | Vitest coverage |
| `apps/desktop/src/main/claude-cli/SkillScanner.ts` 変更箇所   | 100%           | Vitest coverage |
| `.claude/skills/skill-creator/scripts/init_skill.js` 変更箇所 | 手動確認       | コードレビュー  |

## カバレッジ計測コマンド

```bash
# shared定数のカバレッジ計測
pnpm --filter @repo/shared vitest run --coverage src/constants/skillName.test.ts

# SkillScanner のカバレッジ計測
pnpm --filter @repo/desktop vitest run --coverage \
  --coverage.include="src/main/services/skill/SkillScanner.ts"

# カバレッジレポートの確認（HTML）
open packages/shared/coverage/index.html
open apps/desktop/coverage/index.html
```

## 未カバー分析観点

| 分析観点               | 確認内容                                                              |
| ---------------------- | --------------------------------------------------------------------- |
| 分岐カバレッジ         | 正規表現のマッチ成功・失敗の両分岐がテストされているか                |
| 境界値カバレッジ       | `SKILL_NAME_PATTERN` の先頭・末尾・空文字境界のテストが存在するか     |
| エラーパスカバレッジ   | `undefined` / `null` 入力時の安全失敗パスがカバーされているか         |
| 変更行カバレッジ       | Phase 5 で変更した行が全てテストで実行されているか                    |
| init_skill.js 手動確認 | import 切り替え箇所・正規表現使用箇所が手動レビューで確認されているか |

## トレーサビリティマトリクス

| テストID       | 対象ファイル      | カバー対象行/分岐                      | カバレッジ達成 |
| -------------- | ----------------- | -------------------------------------- | -------------- |
| TC-01〜TC-09   | `skillName.ts`    | SKILL_NAME_PATTERN 正常/失敗マッチ分岐 | 確認中         |
| TC-10〜TC-12   | `SkillScanner.ts` | validateSkillName 変更行               | 確認中         |
| TC-E01〜TC-E03 | `skillName.ts`    | ビルド前後の定数解決分岐               | 確認中         |
| TC-E04〜TC-E06 | `init_skill.js`   | import 成功・失敗分岐（手動確認）      | 確認中         |

## 参照資料

| 参照資料         | パス                                                 | 説明             |
| ---------------- | ---------------------------------------------------- | ---------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md`              | Phase 4 成果物   |
| 拡充テストケース | `outputs/phase-6/expanded-test-cases.md`             | Phase 6 成果物   |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md`          | Phase 6 成果物   |
| エッジケース結果 | `outputs/phase-6/edge-case-result.md`                | Phase 6 成果物   |
| 要件仕様         | `.claude/skills/aiworkflow-requirements/references/` | 正本仕様の参照先 |

## 実行手順

1. Phase 6 の成果物（拡充テストケース・回帰テスト結果・エッジケース結果）を確認する。
2. SubAgent-A: `skillName.ts` のカバレッジを計測し、100%達成を確認する。未カバー行があれば追加テストを作成する。
3. SubAgent-B: `SkillScanner.ts` の変更箇所カバレッジを計測し、100%達成を確認する。未カバー行があれば追加テストを作成する。
4. SubAgent-C: `init_skill.js` の変更箇所を手動レビューし、import切り替え箇所と正規表現使用箇所が確認済みであることをレポートする。
5. SubAgent-D: トレーサビリティマトリクスを更新し、全テストIDとカバレッジの対応関係を確認する。
6. 未カバー行の分析結果を `outputs/phase-7/uncovered-analysis-plan.md` に記録する。
7. 成果物を `outputs/phase-7/` に出力する。

## 統合テスト連携

- Phase 6 の回帰テスト結果を入力として、Phase 8 のリファクタリング範囲を固定する。
- Phase 7 の未カバー分析は Phase 9 の品質保証で再確認する。

## 多角的チェック観点

| 観点     | 確認内容                                                                  |
| -------- | ------------------------------------------------------------------------- |
| 矛盾     | カバレッジ目標とテストケース数の矛盾がないか確認する                      |
| 漏れ     | 全変更ファイルのカバレッジが計測・確認されているか確認する                |
| 整合性   | トレーサビリティマトリクスが Phase 4/6 のテストIDと整合しているか確認する |
| 依存関係 | カバレッジ計測に必要な `@vitest/coverage-v8` 等が設定されているか確認する |
| 再現性   | カバレッジ計測がローカル環境と CI 環境の両方で同一結果になるか確認する    |

## 成果物

| 成果物                         | パス                                              | 説明                                     |
| ------------------------------ | ------------------------------------------------- | ---------------------------------------- |
| カバレッジ計画                 | `outputs/phase-7/coverage-plan.md`                | カバレッジ目標・計測方法・コマンドの定義 |
| 未カバー分析計画               | `outputs/phase-7/uncovered-analysis-plan.md`      | 未カバー行の特定と追加テスト要否の判断   |
| トレーサビリティカバレッジ報告 | `outputs/phase-7/traceability-coverage-report.md` | テストIDとカバレッジの対応関係レポート   |

## 完了条件

- [ ] `skillName.ts` のカバレッジが100%である
- [ ] `SkillScanner.ts` の変更箇所カバレッジが100%である
- [ ] `init_skill.js` の変更箇所が手動確認済みである
- [ ] トレーサビリティマトリクスの全テストIDが「達成済み」に更新されている
- [ ] 未カバー行の分析が完了し、追加テストの要否が判断されている
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 6 成果物の確認
2. SubAgent-A: `skillName.ts` カバレッジ計測・100%確認
3. SubAgent-B: `SkillScanner.ts` 変更箇所カバレッジ計測・100%確認
4. SubAgent-C: `init_skill.js` 変更箇所の手動確認・レポート作成
5. SubAgent-D: トレーサビリティマトリクス更新・統合判定
6. 未カバー行分析・追加テスト要否判断
7. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001
```

## 次のPhase

Phase 8: リファクタリング
