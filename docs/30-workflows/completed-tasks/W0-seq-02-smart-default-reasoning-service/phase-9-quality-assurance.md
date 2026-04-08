# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 9                                              |
| タスクID   | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| 機能名     | スマートデフォルト推論サービス実装             |
| 前提Phase  | Phase 8                                        |
| 後続Phase  | Phase 10                                       |
| 作成日     | 2026-04-07                                     |
| ステータス | pending                                        |

## 目的

静的解析・リスク評価・因果ループ監査を実施し、リリース可能な品質水準を確認する。

## 実行タスク

1. ESLint / TypeScript / Prettier を確認する。
2. リスク評価を整理する。
3. 因果ループ監査を実施する。

## 統合テスト連携

- Phase 10 へ進める前の品質ゲートとして扱う。
- Phase 8 のリファクタ後の結果であることを前提にする。

## 静的解析チェック

```bash
# ESLint チェック
pnpm --filter @repo/shared lint

# TypeScript 型チェック
pnpm --filter @repo/shared typecheck

# Prettier フォーマット確認
pnpm --filter @repo/shared format:check
```

## 追加品質ゲート

| 観点          | 合格条件                                                    | 確認方法                                                                                                                                                        |
| ------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| line budget   | workflow / spec / report の line budget が 500 行を超えない | `wc -l` で確認し、500 行を超える場合は split / archive 方針を記録する                                                                                           |
| link          | 参照リンク切れが 0 件                                       | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md` |
| mirror parity | `.claude` 正本と `.agents` mirror の差分が 0 件             | `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`                                                                  |

### 確認観点

| 観点                   | 確認内容                                                            |
| ---------------------- | ------------------------------------------------------------------- |
| ESLint エラー          | 0件であること                                                       |
| TypeScript エラー      | 0件であること                                                       |
| any 型の使用           | 新規 `any` が追加されていないこと（NFR-02）                         |
| 未使用変数             | 未使用のインポート・変数が残っていないこと                          |
| React hooks ルール違反 | 本サービスは純粋関数のため非該当                                    |
| Strict モード準拠      | `input?.purpose ?? ""` 等の null チェックが適切であること（NFR-01） |

## リスク評価

| リスク                                            | 発生確率 | 影響度 | 対策                                                    |
| ------------------------------------------------- | -------- | ------ | ------------------------------------------------------- |
| キーワードの大文字小文字で推論ミス                | 中       | 低     | テストで大文字小文字区別の仕様を明示・文書化する        |
| 先勝ちルールによる意図しないツール選択            | 低       | 低     | inferenceLog で推論根拠を確認可能にしている             |
| `SkillInfoFormData` 型定義変更による引数型ミス    | 低       | 高     | TypeScript 型チェックで CI 検出・W0-seq-01 との連動確認 |
| `SmartDefaultResult` 型定義変更による返り値型ミス | 低       | 高     | TypeScript 型チェックで CI 検出                         |
| W2-seq-03a がインポートする際の barrel 解決失敗   | 低       | 中     | barrel の `index.ts` にエクスポートが追加済みか確認     |
| 推論ルールの網羅性不足（新ツール対応漏れ）        | 中       | 低     | Phase 8 でキーワードを定数化し拡張容易な構造にする      |

## 因果ループ監査

### 修正が新たな問題を生む循環がないかの確認

```
smartDefaultReasoningService.ts 新規追加
  → W0-seq-01 型定義（SkillInfoFormData/SmartDefaultResult）に依存
  → W0-seq-01 型定義変更 → 引数/返り値型エラー → TypeScript で検出可能 ✓

inferSmartDefaults を packages/shared に配置
  → W2-seq-03a（SkillCreateWizard）からインポート可能
  → SkillCreateWizard.tsx のインライン実装を本サービスに置き換え可能
  → 循環依存なし ✓

barrel（index.ts）へのエクスポート追加
  → packages/shared の他エクスポートと競合しないか確認が必要
  → 既存の named export と名称衝突がない限り問題なし ✓
```

## 多角的チェック観点

| 思考法         | 確認内容                                                               |
| -------------- | ---------------------------------------------------------------------- |
| 逆説思考       | 推論ロジックが W0-seq-01 型変更に追随しない場合どうなるか（CI で検出） |
| システム思考   | W2-seq-03a との依存関係・barrel 解決・型整合を確認する                 |
| if 思考        | purpose=null/undefined/空文字・category=null の各フォールバックを確認  |
| 改善思考       | 推論キーワードの拡張を容易にするため定数化が有効か                     |
| 因果関係ループ | 修正が新たな障害を生む循環がないか確認する                             |

## 参照資料

| 資料名         | パス                                                                                    | 用途                               |
| -------------- | --------------------------------------------------------------------------------------- | ---------------------------------- |
| 実装サマリー   | `outputs/phase-5/implementation-summary.md`                                             | Phase 5 成果物                     |
| 品質ゲート基準 | `.claude/skills/task-specification-creator/references/patterns-validation-and-audit.md` | line budget / link / mirror parity |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`                                                   | Phase 8 成果物                     |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md`                                            | Phase 8 成果物                     |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md`                                        | Phase 8 成果物                     |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`                                                | Phase 1 成果物                     |

## 実行手順

1. Phase 8 成果物を確認する。
2. 静的解析（ESLint/TypeScript/Prettier）と追加品質ゲート（line budget / link / mirror parity）を実行する。
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
