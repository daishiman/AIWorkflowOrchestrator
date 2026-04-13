# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Phase      | 7                                                           |
| タスクID   | TASK-SW-FIX-DATAFLOW-001                                    |
| 機能名     | Step 1回答→スキル生成連携（Q1〜Q6コンテキストブリッジ実装） |
| タスク種別 | implementation                                              |
| 前提Phase  | Phase 6（テスト拡充完了）                                   |
| 後続Phase  | Phase 8                                                     |
| 作成日     | 2026-04-12                                                  |
| ステータス | completed                                                   |

## 目的

追加・変更したコードが TC-01〜TC-18 によって十分にカバーされているかを計測し、未到達ブロックを分析する。カバレッジ対象は「変更したファイルおよびブロック」に限定する。

## カバレッジ対象範囲

| 対象ファイル                                           | 確認項目                                           |
| ------------------------------------------------------ | -------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`            | 型定義（コードカバレッジ対象外・型チェックで代替） |
| `SkillCreateWizard.tsx` の `buildSkillContext()`       | line/branch カバレッジ 100% 目標                   |
| `SkillCreateWizard.tsx` の `handleGenerate()` 修正箇所 | line カバレッジ 100% 目標                          |
| `agentSlice.ts` の `createSkill` Thunk 修正箇所        | line/branch カバレッジ 100% 目標                   |
| `skillHandlers.ts` の `buildSkillGenerationPrompt()`   | line/branch カバレッジ 100% 目標                   |
| `skillHandlers.ts` の IPC ハンドラ修正箇所             | line カバレッジ 100% 目標                          |

## カバレッジ目標

| 対象                                | line カバレッジ | branch カバレッジ |
| ----------------------------------- | --------------- | ----------------- |
| `buildSkillContext()` 関数          | 100%            | 100%              |
| `buildSkillGenerationPrompt()` 関数 | 100%            | 100%              |
| `createSkill` Thunk 修正箇所        | 100%            | 90% 以上          |
| `handleGenerate()` 修正箇所         | 100%            | -                 |
| 変更ファイル全体（4ファイル合算）   | 85% 以上        | 80% 以上          |

> **注意**: カバレッジ対象範囲は「変更したファイル・ブロック」に限定する。全ファイル一律指定は局所検証の意図をぼやかすため採用しない。

## カバレッジ計測コマンド

```bash
# buildSkillContext / SkillCreateWizard のカバレッジ
pnpm vitest run --coverage \
  --coverage.include="apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx" \
  --reporter=verbose

# skillHandler のカバレッジ
pnpm vitest run --coverage \
  --coverage.include="apps/desktop/src/main/ipc/skillHandlers.ts" \
  --reporter=verbose

# agentSlice のカバレッジ
pnpm vitest run --coverage \
  --coverage.include="apps/desktop/src/renderer/store/slices/agentSlice.ts" \
  --reporter=verbose

# カバレッジレポート確認
cat coverage/coverage-summary.json | jq '.total'
```

## ブランチカバレッジ重点確認箇所

`buildSkillGenerationPrompt()` は各フィールドの `if (context.xxx)` 分岐が多いため、以下のブランチが全てカバーされていることを確認する：

| 分岐                                          | True ケース   | False ケース  |
| --------------------------------------------- | ------------- | ------------- |
| `if (context.skillName)`                      | TC-07         | TC-08 / TC-12 |
| `if (context.category)`                       | TC-07         | TC-08 / TC-12 |
| `if (context.q1Purpose \|\| context.purpose)` | TC-07 / TC-15 | TC-12         |
| `if (context.q2Target)`                       | TC-07         | TC-08 / TC-12 |
| `if (context.q3Tools)`                        | TC-07         | TC-08         |
| `if (context.q4Timing)`                       | TC-07         | TC-08         |
| `if (context.q5Output)`                       | TC-07         | TC-08         |
| `if (context.q6Constraints)`                  | TC-07         | TC-08         |

## 未到達分析手順

カバレッジ計測後、未到達ブロックが発見された場合：

1. 未到達理由を分析する（dead code か・テスト不足か）
2. テスト不足の場合 → Phase 6 へ戻りテスト追加
3. dead code の場合 → Phase 8（リファクタリング）で対処

## 参照資料

| 資料名                   | パス                                                                         | 用途             |
| ------------------------ | ---------------------------------------------------------------------------- | ---------------- |
| Phase 6 拡充テストケース | `outputs/phase-6/expanded-test-cases.md`                                     | テスト一覧の確認 |
| coverage-standards       | `.claude/skills/task-specification-creator/references/coverage-standards.md` | カバレッジ基準   |

## 成果物

| 成果物           | パス                                 | 説明                                     |
| ---------------- | ------------------------------------ | ---------------------------------------- |
| カバレッジ報告書 | `outputs/phase-7/coverage-report.md` | 実測値・未到達分析・対処方針を含む報告書 |

## 完了条件

- [ ] 変更箇所の line/branch カバレッジが実測記録されていること
- [ ] 未到達ブロックの分析結果が記録されていること
- [ ] カバレッジ目標の達成可否が明記されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 8: リファクタリング
