# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 9                                                             |
| タスクID   | TASK-SW-FIX-MODE-MGMT-001                                     |
| 機能名     | generationModeラジオボタン廃止・LLM専用化・Step 1スキップ修正 |
| 前提Phase  | Phase 8                                                       |
| 後続Phase  | Phase 10                                                      |
| 作成日     | 2026-04-12                                                    |
| ステータス | pending                                                       |

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

| 観点                   | 確認内容                                                              |
| ---------------------- | --------------------------------------------------------------------- |
| ESLint エラー          | 0件であること                                                         |
| TypeScript エラー      | 0件であること                                                         |
| 未使用変数             | `generationMode` / `hasActivatedLlmMode` 関連の残骸が0件であること    |
| any 型の使用           | 新規 `any` が追加されていないこと                                     |
| React hooks ルール違反 | `useState` の依存配列が正しいこと                                     |
| 削除対象コードの残存   | `"template"` / `"llm"` 文字列リテラルがウィザード内に残っていないこと |

## リスク評価

| リスク                                                       | 発生確率 | 影響度 | 対策                                                       |
| ------------------------------------------------------------ | -------- | ------ | ---------------------------------------------------------- |
| `generationMode` 削除後の型エラー                            | 低       | 高     | `pnpm typecheck` でCI前に検出                              |
| `hasActivatedLlmMode` 参照箇所の削除漏れ                     | 低       | 中     | Phase 5 の影響範囲マップで全箇所を把握済み                 |
| `handleStep0Next` 修正後にStep 2へ直接遷移するリグレッション | 低       | 高     | Phase 4/6 の自動テストで検出                               |
| `SkillInfoStep` のprops型変更による子コンポーネント影響      | 低       | 中     | Phase 4 の統合テストでカバー                               |
| TASK-SW-FIX-DATAFLOW-001 との結合部での整合性崩れ            | 低       | 高     | 依存タスク完了後に結合テストを実施                         |
| Wave B 並列タスク（TASK-SW-FIX-FEEDBACK-001）との競合        | 低       | 中     | 変更ファイルが重複しないことをPhase 1 影響範囲マップで確認 |

## 因果ループ監査

### 修正が新たな問題を生む循環がないかの確認

```
generationMode / hasActivatedLlmMode 削除
  → template分岐コードが完全除去される
  → SkillInfoStep のpropsからラジオボタン関連が消える
  → SkillCreateWizard がLLM専用の単純なステートマシンになる
  → 循環なし ✓

handleStep0Next 修正（goToStep(2)除去）
  → Step 1（ConversationRoundStep）が必ず表示される
  → Q1〜Q6インタビューが必ず実行される
  → TASK-SW-FIX-DATAFLOW-001 の Step 1回答→スキル生成連携が有効になる
  → 循環なし ✓

ラジオボタンUI削除
  → SkillInfoStep.tsx からJSX要素が除去される
  → generationMode関連propが除去される
  → 親コンポーネントからの不要なprop渡しが消える
  → 循環なし ✓
```

## 多角的チェック観点

| 思考法         | 確認内容                                                                   |
| -------------- | -------------------------------------------------------------------------- |
| 逆説思考       | `generationMode`が削除されていない場合、Step 1スキップが継続する           |
| システム思考   | TASK-SW-FIX-DATAFLOW-001 / TASK-SW-FIX-FEEDBACK-001 との相互作用を確認する |
| if 思考        | フォーム未入力・Step 1途中離脱・生成失敗の各分岐を確認する                 |
| 改善思考       | 再発防止として型チェックをCIに組み込む                                     |
| 因果関係ループ | 修正が新たな障害を生む循環がないか確認する                                 |

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
- [ ] `generationMode` / `hasActivatedLlmMode` 残骸コードが0件であること
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
