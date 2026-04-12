# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 9                                |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03b       |
| 機能名     | wizard/index.ts エクスポート更新 |
| 前提Phase  | Phase 8                          |
| 後続Phase  | Phase 10                         |
| 作成日     | 2026-04-07                       |
| ステータス | pending                          |

## 目的

typecheck・targeted export test・リスク評価・因果ループ監査を実施し、エクスポート変更のリリース可能な品質水準を確認する。

## 静的解析チェック

```bash
# TypeScript 型チェック（最重要）
pnpm --filter @repo/desktop typecheck

# targeted export test
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/__tests__/wizard-exports.test.ts --maxWorkers 1
```

### 確認観点

| 観点                         | 確認内容                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------- |
| TypeScript エラー            | 削除エクスポートを参照するコードが残っていないこと                              |
| 型契約整合                   | `SkillInfoStepProps` と `GenerationMode` が barrel 経由で期待通り解決されること |
| 回帰ガード                   | `ConfigureStep` / `WizardOptions` が引き続き非公開であること                    |
| バレルエクスポートの循環参照 | deprecated `DescribeStep.tsx` が barrel を再参照せず、依存が安定していること    |

## リスク評価

| リスク                                               | 発生確率 | 影響度 | 対策                                           |
| ---------------------------------------------------- | -------- | ------ | ---------------------------------------------- |
| `DescribeStep` 系の旧 import が残っている            | 低       | 高     | typecheck / runtime export test で即時検出可能 |
| `GenerationMode` 再転送が壊れる                      | 低       | 中     | 型契約テストで即時検出可能                     |
| `SkillInfoStepProps` が public type でなくなる       | 低       | 中     | 型契約テストで即時検出可能                     |
| deprecated `DescribeStep.tsx` が barrel 再依存へ戻る | 低       | 中     | コードレビューと回帰テストで検出可能           |

## 因果ループ監査

```
DescribeStep 削除エクスポート
  → 旧 UI を barrel 経由で import するコードが壊れる
  → W2-seq-03a 側はすでに SkillInfoStep / ConversationRoundStep へ移行済み
  → 残存参照がある場合は export test と typecheck が検出 ✓

GenerationMode の再転送化
  → public type 名は維持しつつ定義元だけが GenerateStep.tsx に集約される
  → barrel 直下の inline 定義との二重管理がなくなる
  → 型契約テストが崩れた場合は即時検出 ✓

DescribeStep.tsx の依存整理
  → deprecated ファイルが barrel ではなく実装元を参照する
  → barrel 変更が legacy ファイルへ再帰的に波及しにくくなる
  → 循環依存のリスクが低減 ✓
```

## 多角的チェック観点

| 思考法         | 確認内容                                                       |
| -------------- | -------------------------------------------------------------- |
| 逆説思考       | 削除エクスポートが残っている場合にどのエラーが出るか           |
| システム思考   | W2-seq-03a/W1-par-02a/W1-par-02b/W1-par-02c との連携を確認する |
| if 思考        | W1-par-02a が未完了・W1-par-02b が未完了の各ケースを確認する   |
| 改善思考       | 廃止コンポーネントの参照を CI で自動検出する仕組みを検討       |
| 因果関係ループ | エクスポート変更が新たな型エラーを生む循環がないか確認する     |

## 参照資料

| 資料名         | パス                                             | 用途           |
| -------------- | ------------------------------------------------ | -------------- |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | Phase 8 成果物 |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md`     | Phase 8 成果物 |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | Phase 8 成果物 |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`         | Phase 1 成果物 |

## 実行手順

1. Phase 8 成果物を確認する。
2. TypeScript 型チェックと targeted export test を実行する。
3. リスク評価テーブルを完成させる。
4. 因果ループ監査を実施する。
5. 品質レポートを作成する。

## 成果物

| 成果物         | パス                                   | 説明                     |
| -------------- | -------------------------------------- | ------------------------ |
| 品質レポート   | `outputs/phase-9/quality-report.md`    | 静的解析結果・品質評価   |
| リスク台帳     | `outputs/phase-9/risk-register.md`     | リスク一覧と対策         |
| 因果ループ監査 | `outputs/phase-9/causal-loop-check.md` | 循環問題がないことの確認 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] TypeScript 型チェックがエラー 0 件であること
- [ ] targeted export test が Green であること
- [ ] 因果ループ監査が完了していること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 静的解析実行（型チェック・targeted export test）
3. リスク評価実施
4. 因果ループ監査実施
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 10: 最終レビュー
