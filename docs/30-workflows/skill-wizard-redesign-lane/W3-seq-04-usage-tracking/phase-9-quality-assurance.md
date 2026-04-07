# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 9                            |
| タスクID   | UT-SKILL-WIZARD-W3-seq-04    |
| 機能名     | 使用率計装（usage tracking） |
| 前提Phase  | Phase 8                      |
| 後続Phase  | Phase 10                     |
| 作成日     | 2026-04-07                   |
| ステータス | pending                      |

## 目的

計装実装の静的解析・リスク評価・因果ループ監査を実施し、リリース可能な品質水準を確認する。

## 静的解析チェック

```bash
# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# ESLint チェック
pnpm --filter @repo/desktop lint

# Prettier フォーマット確認
pnpm --filter @repo/desktop format:check
```

### 確認観点

| 観点                                | 確認内容                                                     |
| ----------------------------------- | ------------------------------------------------------------ |
| TypeScript エラー                   | 型安全な `trackEvent` の型引数が正しく推論されること         |
| イベント名のタイポ                  | `SkillWizardEvents` マップ外のイベント名で型エラーが出ること |
| ペイロード型の整合                  | 各イベントのペイロードが定義通りであること                   |
| `skill_wizard_started` の空 payload | 空オブジェクトのみを受け取ること                             |
| 未使用インポート                    | `trackEvent` のインポートが未使用になっていないこと          |
| React hooks ルール違反              | `useEffect` 内の `trackEvent` 呼び出しが適切であること       |

## リスク評価

| リスク                                             | 発生確率 | 影響度 | 対策                                                           |
| -------------------------------------------------- | -------- | ------ | -------------------------------------------------------------- | ---------------- |
| `skill_wizard_started` が dev で重複して見える     | 低       | 低     | StrictMode の二重マウントは Phase 6 のテストハーネスで分離する |
| 本番環境で console.info が出力される               | 低       | 低     | `NODE_ENV` チェックで防止済み                                  |
| `skill_wizard_started` に余計なキーが混ざる        | 低       | 低     | 空オブジェクトだけを許容し、source を持たせない                |
| `skippedAtQuestion` に不正な値が渡される           | 低       | 低     | 型で `number                                                   | null` に制約済み |
| LLM 生成失敗時に `generation_completed` が発火する | 低       | 中     | try/catch 外に計装を置かないことで防止                         |
| 将来の分析基盤移行時に呼び出し側を変更する必要     | 確実     | 低     | 拡張設計で差し替えポイントを明示済み                           |

## 因果ループ監査

```
trackEvent スタブ実装
  → console.info に依存する
  → 本番環境では NODE_ENV チェックで出力を抑制
  → 将来基盤に差し替えてもスタブのインターフェースは変わらない ✓

skill_wizard_started の useEffect 計装
  → コンポーネントマウント時に1回発火
  → StrictMode では dev-only の二重マウントがあり得る
  → Phase 6 のテストハーネスで production 想定と切り分ける ✓

skill_wizard_next_action の CompleteStep 計装
  → CompleteStep が onNextAction を呼ぶ前に trackEvent を発火
  → onNextAction が失敗した場合もイベントは発火済み
  → 受容可能リスク（計装は best-effort）✓

renderer-local trackEvent
  → SkillAnalytics / AnalyticsStore とは切り分ける
  → UI 計装の責務を main process に持ち込まない
  → execution-centric 基盤との依存ループを作らない ✓
```

## 多角的チェック観点

| 思考法         | 確認内容                                                   |
| -------------- | ---------------------------------------------------------- |
| 逆説思考       | trackEvent が呼ばれない場合にどの計装が欠落するか          |
| システム思考   | W2-seq-03a との依存・将来基盤への影響を確認する            |
| if 思考        | LLM失敗・StrictMode二重発火・スキップ各分岐を確認する      |
| 改善思考       | 将来の分析基盤接続手順を extension-design.md に明記する    |
| 因果関係ループ | 計装が新たな副作用（パフォーマンス劣化等）を生まないか確認 |

## 統合テスト連携

- Phase 4 / 6 で定義した mock と edge case を再確認し、`skill_wizard_started` の空 payload と dev-only 重複を区別する。
- Phase 10 の最終レビューは PASS/MINOR/MAJOR/CRITICAL の判定に接続し、MINOR は Phase 12 で formalize する。
- Phase 11 は NON_VISUAL のため、品質確認は screenshot ではなく console / automation evidence に基づいて行う。

## 参照資料

| 資料名         | パス                                             | 用途           |
| -------------- | ------------------------------------------------ | -------------- |
| 実装サマリー   | `outputs/phase-5/implementation-summary.md`      | Phase 5 成果物 |
| リファクタ計画 | `outputs/phase-8/refactoring-plan.md`            | Phase 8 成果物 |
| 再テスト計画   | `outputs/phase-8/post-refactor-test-plan.md`     | Phase 8 成果物 |
| 責務境界マップ | `outputs/phase-8/responsibility-boundary-map.md` | Phase 8 成果物 |
| 拡張設計書     | `outputs/phase-2/extension-design.md`            | Phase 2 成果物 |
| 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`         | Phase 1 成果物 |

## 実行タスク

1. Phase 8 成果物を確認する。
2. TypeScript 型チェック・ESLint を実行する。
3. リスク評価テーブルを完成させる。
4. 因果ループ監査を実施する（StrictMode 二重発火を重点確認）。
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
- [ ] StrictMode 二重発火リスクが評価されていること
- [ ] 因果ループ監査が完了していること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 静的解析実行
3. リスク評価実施
4. 因果ループ監査実施（StrictMode重点）
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 10: 最終レビュー
