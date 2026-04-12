# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 8                                              |
| タスクID   | UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001   |
| タスク名   | describe.skip 内の旧 testid 参照クリーンアップ |
| 前提Phase  | Phase 7                                        |
| 後続Phase  | Phase 9                                        |
| 作成日     | 2026-04-11                                     |
| ステータス | 未実施                                         |

## 目的

Phase 5 の実装（`skill-lifecycle-request-input` testid 参照削除）に対して、
duplicate・naming drift を除去し、削除後のテストファイル全体の可読性と保守性を向上させる。

本タスクは NON_VISUAL クリーンアップであるため、リファクタリングは最小限にとどめる。

## 実行タスク

### リファクタリング分析

#### 変更対象テーブル

| 対象ファイル                                                                                        | Before                                   | After        | 理由                         |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------ | ---------------------------- |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`  | `skill-lifecycle-request-input` 参照あり | 参照削除済み | 削除済み testid の参照を除去 |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | `skill-lifecycle-request-input` 参照あり | 参照削除済み | 削除済み testid の参照を除去 |

#### duplicate 検出

```bash
# 2ファイル内に重複した testid 参照が残っていないか確認
grep -rn "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/

# describe.skip ブロック内の重複チェック
grep -n "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

**確認結果**:

- `skill-lifecycle-request-input` 参照が全て削除されていることを確認
- 不要なコメントや空行がなければ変更不要
- duplicate なし（削除のみのため）

#### navigation drift 確認

本タスクは UI を持たないため navigation drift 確認は N/A。

#### naming drift 確認

| 項目                   | 確認内容                                           | 判定 |
| ---------------------- | -------------------------------------------------- | ---- |
| testid 参照名          | `skill-lifecycle-request-input` が残存していないか | [ ]  |
| describe.skip ブロック | スキップ理由が明確なコメントが存在するか           | [ ]  |
| 残存する testid 参照名 | 現行 UI の testid と一致しているか                 | [ ]  |

## リファクタリング内容

NON_VISUAL クリーンアップのため、リファクタリングは最小限。
削除後のテストファイル全体の可読性を確認し、以下のみを整理する:

1. **不要なコメントの確認**: `skill-lifecycle-request-input` に関するコメントが残っている場合は削除
2. **空行の整理**: 削除によって生じた余分な空行があれば整理
3. **describe.skip ブロックの整合性確認**: スキップ理由が現状と合致しているか確認

## リファクタリング後のテスト確認

```bash
# リファクタリング後の全テスト実行
pnpm --filter @repo/desktop test:run
```

## 参照資料

| 資料名             | パス                                        | 用途           |
| ------------------ | ------------------------------------------- | -------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`        | Phase 7 成果物 |
| Phase 5 実装結果   | `outputs/phase-5/implementation-summary.md` | 削除対象の確認 |

## 実行手順

1. 対象2ファイルを開き、`skill-lifecycle-request-input` 参照が全て削除されていることを確認する
2. 不要なコメント・空行がある場合は整理する
3. `pnpm --filter @repo/desktop test:run` を実行してリファクタリング後のテストを確認する
4. リファクタリング報告を outputs/phase-8/ に出力する

## 統合テスト連携

```bash
# リファクタリング後の全テスト実行
pnpm --filter @repo/desktop test:run
```

## 多角的チェック観点

| 観点                 | 確認内容                                            |
| -------------------- | --------------------------------------------------- |
| 削除完全性           | `skill-lifecycle-request-input` 参照が0件であること |
| describe.skip 整合性 | スキップブロックの内容が現行UIと矛盾していないこと  |
| コード可読性         | 削除後のコードが読みやすく整理されていること        |
| テスト通過           | 全テストが PASS することを確認                      |

## 成果物

| 成果物               | パス                                    | 説明                            |
| -------------------- | --------------------------------------- | ------------------------------- |
| リファクタリング報告 | `outputs/phase-8/refactoring-report.md` | リファクタリング内容（N/A含む） |

## 完了条件

- [ ] duplicate の確認完了（なし）
- [ ] naming drift の確認完了（問題なし）
- [ ] リファクタリング後のテストが全件 PASS

## サブタスク管理

| サブタスクID | 内容                     | 状態   |
| ------------ | ------------------------ | ------ |
| ST-8-1       | duplicate 検出・確認     | 未実施 |
| ST-8-2       | naming drift 確認        | 未実施 |
| ST-8-3       | 不要コメント・空行の整理 | 未実施 |
| ST-8-4       | リファクタリング後テスト | 未実施 |

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001
```

## 次のPhase

Phase 9: 品質保証
