# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 9                                          |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03a                 |
| 機能名     | SkillCreateWizard オーケストレーション更新 |
| 前提Phase  | Phase 8                                    |
| 後続Phase  | Phase 10                                   |
| 作成日     | 2026-04-07                                 |
| ステータス | pending                                    |

## 目的

静的解析・リスク評価・因果ループ監査を実施し、リリース可能な品質水準を確認する。

## 静的解析チェック

```bash
# ESLint チェック
pnpm --filter @repo/desktop lint

# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# Prettier フォーマット確認
pnpm --filter @repo/desktop format:check
```

### 確認観点

| 観点                   | 確認内容                                                          |
| ---------------------- | ----------------------------------------------------------------- |
| ESLint エラー          | 0件であること                                                     |
| TypeScript エラー      | 0件であること                                                     |
| 未使用変数             | `description` / `options` / `generationMode` 関連の残骸がないこと |
| any 型の使用           | 新規 `any` が追加されていないこと                                 |
| React hooks ルール違反 | `useEffect` / `useState` の依存配列が正しいこと                   |

## リスク評価

| リスク                                                 | 発生確率 | 影響度 | 対策                                         |
| ------------------------------------------------------ | -------- | ------ | -------------------------------------------- |
| `inferSmartDefaults` の推論ミスによる誤デフォルト      | 低       | 中     | inferenceLog で推論根拠を確認可能にしている  |
| `handleGenerate` の二重呼び出し                        | 低       | 高     | `isGenerating` フラグで防止                  |
| W1-par-02a/W1-par-02b/W1-par-02c との props 契約不整合 | 低       | 高     | Phase 3 設計レビューで確認済み               |
| `GenerateStep` に legacy prop が残存する               | 低       | 中     | Phase 5 の props 差分と Phase 7 の回帰で検出 |
| `handleRetry` / `skillPath` の接続漏れ                 | 低       | 高     | Phase 5/10/11 で Step 0 復帰と表示を確認     |
| LLM 生成失敗時のエラーハンドリング漏れ                 | 中       | 高     | try/catch + エラー state で対応              |
| TypeScript 型エラーの見逃し                            | 低       | 中     | `pnpm typecheck` で CI チェック              |

## 因果ループ監査

### 修正が新たな問題を生む循環がないかの確認

```
description / options / generationMode 削除
  → template 分岐コードが完全に除去される
  → DescribeStep/ConfigureStep の参照がなくなる
  → wizard/index.ts の旧エクスポートが不要になる（W2-seq-03bで対処）
  → 循環なし ✓

handleRetry 追加
  → CompleteStep から Step 0 に戻れる
  → formData / answers を再利用して前回入力をプリフィルできる
  → skillPath をクリアして古い完了結果の残留を防ぐ
  → 循環なし ✓

inferSmartDefaults 追加
  → formData を引数として受け取る
  → W0-seq-01 型定義の SkillInfoFormData に依存する
  → W0-seq-01 型定義変更 → inferSmartDefaults の引数型も変わる
  → 型チェックで検出可能 ✓

handleQualityFeedback 追加
  → W3-seq-04 計装に依存する
  → W3-seq-04 の trackEvent スタブが未実装の場合は参照エラー
  → W3-seq-04 は W2-seq-03a 完了後に実装するため問題なし ✓
```

## 多角的チェック観点

| 思考法         | 確認内容                                                                     |
| -------------- | ---------------------------------------------------------------------------- |
| 逆説思考       | generationMode が削除されていない場合どうなるか                              |
| システム思考   | W1-par-02a/W1-par-02b/W1-par-02c/W2-seq-03b/W3-seq-04 との相互作用を確認する |
| if 思考        | LLM 生成失敗・スキップ・二重送信の各分岐を確認する                           |
| 改善思考       | 再発防止として型チェックを CI に組み込む                                     |
| 因果関係ループ | 修正が新たな障害を生む循環がないか確認する                                   |

## 参照資料

| 資料名         | パス                                             | 用途           |
| -------------- | ------------------------------------------------ | -------------- |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | Phase 8 成果物 |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md`     | Phase 8 成果物 |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | Phase 8 成果物 |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`         | Phase 1 成果物 |

## 実行手順

1. Phase 8 成果物を確認する。
2. 静的解析（ESLint/TypeScript/Prettier）を実行する。
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
- [ ] 静的解析がエラー 0 件であること
- [ ] リスク評価が完了していること
- [ ] 因果ループ監査が完了していること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 静的解析実行
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
