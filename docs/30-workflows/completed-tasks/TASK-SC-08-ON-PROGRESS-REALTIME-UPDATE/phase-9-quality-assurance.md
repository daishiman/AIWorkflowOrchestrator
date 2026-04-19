# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 9                                                                           |
| 機能名     | TASK-SC-08                                                                  |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 前提Phase  | Phase 8                                                                     |
| 後続Phase  | Phase 10                                                                    |
| 作成日     | 2026-04-19                                                                  |
| ステータス | pending                                                                     |

## 目的

line budget、link、mirror parityの一括判定により、品質とリスクを定量化して運用判断を可能にする。

## 背景

`useStreamingProgress` のPHASE_TO_STAGEマップがcreateモード前提であり、他モード（update/collaborative/orchestrate/improve-prompt）のphaseメッセージが正しいstageに吸収されない。またonProgressコールバックがUIに接続されておらず、generationProgressがリアルタイム更新されない。

## SubAgentチーム編成

| SubAgent   | 関心ごと              | 主担当                                         |
| ---------- | --------------------- | ---------------------------------------------- |
| SubAgent-A | Renderer/Hook責務     | useStreamingProgress・PHASE_TO_STAGEマップ整合 |
| SubAgent-B | State/Store責務       | generationProgressSlice・stage型・AC-2確認     |
| SubAgent-C | UI/コンポーネント責務 | GenerateStep動的テキスト・AC-3確認             |
| SubAgent-D | 統合監査              | 矛盾・漏れ・整合・依存判定・AC-1〜AC-6全体確認 |

## 実行タスク

- 品質チェック: typecheck・lint・テスト全件PASSを確認する
- AC達成確認: AC-1〜AC-6の全達成状況を表で記録する
- リスク評価: 残存リスクを影響度×発生頻度で分類する
- 因果ループ監査: 修正が新規障害を生む循環を評価する

## 品質チェックリスト

| チェック項目                      | コマンド                                              | 期待結果 | 判定 |
| --------------------------------- | ----------------------------------------------------- | -------- | ---- |
| pnpm typecheck（desktop）PASS確認 | `pnpm --filter @repo/desktop typecheck`               | EXIT 0   | [ ]  |
| pnpm lint（desktop）PASS確認      | `pnpm --filter @repo/desktop lint`                    | EXIT 0   | [ ]  |
| テスト全件PASS確認                | `pnpm --filter @repo/desktop test`                    | EXIT 0   | [ ]  |
| TypeScriptコンパイルエラー 0件    | `pnpm --filter @repo/desktop typecheck 2>&1 \| wc -l` | 0エラー  | [ ]  |
| ESLintエラー 0件                  | `pnpm --filter @repo/desktop lint 2>&1 \| grep error` | 0件      | [ ]  |

### AC-1〜AC-6 全達成確認表

| AC   | 内容                                                                                  | 判定 |
| ---- | ------------------------------------------------------------------------------------- | ---- |
| AC-1 | executePlan実行中にonProgressコールバックが呼ばれる                                   | [ ]  |
| AC-2 | generationProgressがリアルタイム更新される                                            | [ ]  |
| AC-3 | UIのプログレステキストが動的に変化する（静的テキストでない）                          | [ ]  |
| AC-4 | mode-specific phaseがplanningに吸収されず対応するstage/表示に反映                     | [ ]  |
| AC-5 | collaborative/orchestrate/update/improve-promptでprogress表示がcreate前提に退行しない | [ ]  |
| AC-6 | pnpm typecheck（desktop）がPASS                                                       | [ ]  |

## リスク台帳

| リスクID | リスク内容                                                                  | 影響度 | 発生頻度 | 対策                                                                   |
| -------- | --------------------------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------- |
| R-01     | isGeneratingガードとonProgress競合（useEffect cleanup前にコールバック着信） | 高     | 中       | useEffect cleanupで必ずリスナーを解除する。isGenerating=true間のみ受付 |
| R-02     | mode-specific phaseメッセージの国際化未対応（将来リスク）                   | 低     | 低       | 現時点はi18nキー化を見送り、将来タスクとしてunassigned-taskに記録する  |
| R-03     | pnpm typecheckタイムアウト（CLAUDE_TYPECHECK_TIMEOUT不足）                  | 中     | 低       | `export CLAUDE_TYPECHECK_TIMEOUT=120` でタイムアウトを延長する         |

## 因果ループ監査

### 強化ループ（正のフィードバック）

```
onProgress受信
  → generationProgress更新
    → UIテキスト更新
      → ユーザー体験向上
        → より詳細なフェーズ情報要求
          → PHASE_TO_STAGEマップ拡張ニーズ
            → onProgress受信（ループ拡大）
```

**判定**: 強化ループは想定内。PHASE_TO_STAGEのフラットマップ設計により、マップ拡張コストを最小化している。

### バランスループ（負のフィードバック）

```
isGenerating=true
  → onProgressリスナー登録
    → 処理完了（isGenerating=false）
      → useEffect cleanup発火
        → onProgressリスナー解除
          → isGenerating=false（ループ終端）
```

**判定**: バランスループは正常。cleanup漏れが発生した場合、メモリリークとゴーストコールバック（P5）が発生するため、cleanup実装が必須。

## 品質ゲート判定基準

| ゲート条件                  | 合格基準                             | 不合格時の対応                           |
| --------------------------- | ------------------------------------ | ---------------------------------------- |
| typecheck PASS              | エラー0件                            | 型エラーを修正してから先に進まない       |
| lint PASS                   | エラー0件、警告は許容（0が望ましい） | ESLintエラーを修正してから先に進まない   |
| テスト全件PASS              | 失敗0件                              | 失敗テストを修正または .skip + Issue作成 |
| AC-1〜AC-6 全達成           | 6/6達成                              | 未達ACを原因分析してから先に進まない     |
| R-01（cleanup）対策実施済み | useEffect cleanupでリスナー解除      | 実装を修正してから先に進まない           |

## 参照資料

| 参照資料           | パス                                             | 説明           |
| ------------------ | ------------------------------------------------ | -------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md`     | Phase 1 成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`         | Phase 1 成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`         | Phase 2 成果物 |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md`      | Phase 5 成果物 |
| 変更ファイル一覧   | `outputs/phase-5/changed-files.md`               | Phase 5 成果物 |
| リファクタ計画     | `outputs/phase-8/refactoring-plan.md`            | Phase 8 成果物 |
| 再テスト計画       | `outputs/phase-8/post-refactor-test-plan.md`     | Phase 8 成果物 |
| 責務境界マップ     | `outputs/phase-8/responsibility-boundary-map.md` | Phase 8 成果物 |

## 実行手順

1. 入力成果物を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. 成果物を outputs/phase-9/ に定義する。
4. 完了条件で矛盾・漏れ・整合・依存を判定する。

## 統合テスト連携

- `useStreamingProgress.test.ts` の targeted run を品質判定の一次ソースとする
- typecheck / lint / validator の結果を `quality-report.md` に実測値で転記する
- Phase 11 の NON_VISUAL 判定は本 Phase の「UI コンポーネント差分なし」確認と整合していることを必須とする

## 多角的チェック観点

| 観点     | 確認内容                                                  |
| -------- | --------------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                        |
| 漏れ     | 要件から成果物への未反映項目がないか確認する              |
| 整合性   | useStreamingProgress/Store/UI契約が一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する             |

## 成果物

| 成果物         | パス                                   | 説明                   |
| -------------- | -------------------------------------- | ---------------------- |
| 品質レポート   | `outputs/phase-9/quality-report.md`    | 品質評価結果・AC達成表 |
| リスク台帳     | `outputs/phase-9/risk-register.md`     | 残存リスク詳細         |
| 因果ループ監査 | `outputs/phase-9/causal-loop-check.md` | 因果循環評価記録       |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] AC-1〜AC-6 全達成を確認
- [ ] pnpm typecheck（desktop）PASS確認
- [ ] pnpm lint（desktop）PASS確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業（品質チェック・AC確認・リスク評価）
3. SubAgent-D の統合判定（因果ループ監査含む）
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE
```

## 次のPhase

Phase 10: 最終レビューゲート
