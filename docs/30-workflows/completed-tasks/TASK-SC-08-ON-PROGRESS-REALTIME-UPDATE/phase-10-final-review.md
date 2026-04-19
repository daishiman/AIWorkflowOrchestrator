# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 10                                                                          |
| 機能名     | TASK-SC-08                                                                  |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 前提Phase  | Phase 9                                                                     |
| 後続Phase  | Phase 11                                                                    |
| 作成日     | 2026-04-19                                                                  |
| ステータス | pending                                                                     |

## 目的

acceptance criteriaとblockerの判定を確定し、最終ゲートで出荷可否と是正項目を固定する。

## 背景

`useStreamingProgress` のPHASE_TO_STAGEマップがcreateモード前提であり、他モードのphaseメッセージが正しいstageに吸収されない。またonProgressコールバックがUIに接続されておらず、generationProgressがリアルタイム更新されない。

## SubAgentチーム編成

| SubAgent   | 関心ごと              | 主担当                                         |
| ---------- | --------------------- | ---------------------------------------------- |
| SubAgent-A | Renderer/Hook責務     | useStreamingProgress・PHASE_TO_STAGEマップ整合 |
| SubAgent-B | State/Store責務       | generationProgressSlice・stage型・AC-2確認     |
| SubAgent-C | UI/コンポーネント責務 | GenerateStep動的テキスト・AC-3確認             |
| SubAgent-D | 統合監査              | 矛盾・漏れ・整合・依存判定・AC-1〜AC-6全体確認 |

## 実行タスク

- 最終整合レビュー: 全Phaseの矛盾と漏れを再確認する
- ブロッカー判定: MAJOR/MINOR/NONEの分類で是正優先順位を確定する
- 是正計画確定: 未解決項目の是正順序を確定する
- 出荷判定: 実装移行可否の判定基準を固定する

## 最終レビューチェックリスト

### 機能要件（AC-1〜AC-6）

| AC   | 内容                                                                                  | 判定 | 備考 |
| ---- | ------------------------------------------------------------------------------------- | ---- | ---- |
| AC-1 | executePlan実行中にonProgressコールバックが呼ばれる                                   | [ ]  |      |
| AC-2 | generationProgressがリアルタイム更新される                                            | [ ]  |      |
| AC-3 | UIのプログレステキストが動的に変化する（静的テキストでない）                          | [ ]  |      |
| AC-4 | mode-specific phaseがplanningに吸収されず対応するstage/表示に反映                     | [ ]  |      |
| AC-5 | collaborative/orchestrate/update/improve-promptでprogress表示がcreate前提に退行しない | [ ]  |      |
| AC-6 | pnpm typecheck（desktop）がPASS                                                       | [ ]  |      |

### 非機能要件

| 項目                                    | 基準                                     | 判定 |
| --------------------------------------- | ---------------------------------------- | ---- |
| useEffect cleanupでリスナー解除         | isGenerating=false時にリスナーが残らない | [ ]  |
| PHASE_TO_STAGEはフラットマップ          | モード別分岐なし・文字列マッチのみ       | [ ]  |
| isGenerating=true間のみリスナー受け付け | ガード条件が実装されている               | [ ]  |
| pnpm lint PASS                          | ESLintエラー0件                          | [ ]  |
| テスト全件PASS                          | 失敗テスト0件                            | [ ]  |

## ブロッカー判定基準

| レベル | 定義                                                    | 対応                                          |
| ------ | ------------------------------------------------------- | --------------------------------------------- |
| MAJOR  | AC-1〜AC-6のいずれか未達・typecheck失敗・メモリリーク   | 修正完了まで出荷不可。即時是正。              |
| MINOR  | lint警告残存・テスト一部skip（.skip+Issue有）           | Issueに記録し、次スプリントで対処。出荷は可。 |
| NONE   | 全AC達成・typecheck/lint/test全PASS・リスク台帳対策済み | 出荷可。PR作成フェーズへ進む。                |

## 是正計画テンプレート

```markdown
## 是正計画（Phase 10）

### 是正対象

- [ ] 項目: <未達AC番号またはリスクID>
- [ ] 原因: <根本原因>
- [ ] 担当: <SubAgent-X>
- [ ] 期限: <日付>

### 是正手順

1. <手順1>
2. <手順2>

### 完了確認

- [ ] 再テスト実施
- [ ] ACチェック再確認
```

## 出荷準備チェック

| チェック項目                               | 確認方法                                        | 結果 |
| ------------------------------------------ | ----------------------------------------------- | ---- |
| pnpm typecheck（desktop）PASS              | `pnpm --filter @repo/desktop typecheck`         | [ ]  |
| pnpm lint（desktop）PASS                   | `pnpm --filter @repo/desktop lint`              | [ ]  |
| テスト全件PASS                             | `pnpm --filter @repo/desktop test`              | [ ]  |
| ドキュメント整合（Phase 12成果物確認）     | outputs/phase-12/ の全ファイル存在確認          | [ ]  |
| Issue #2268 クローズドのまま（reopen禁止） | `gh issue view 2268 --json state`でCLOSEDを確認 | [ ]  |

## ゲート判定基準

ブロッカー判定がNONEであり、出荷準備チェックが全件クリアした場合のみPhase 11へ進む。MAJORが1件でもある場合はPhase 10に留まり是正を実施する。

## 参照資料

| 参照資料           | パス                                                    | 説明           |
| ------------------ | ------------------------------------------------------- | -------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md`            | Phase 1 成果物 |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`                | Phase 1 成果物 |
| 仕様抽出結果       | `outputs/phase-1/aiworkflow-requirements-extraction.md` | Phase 1 成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`                | Phase 2 成果物 |
| テスト戦略         | `outputs/phase-2/test-strategy.md`                      | Phase 2 成果物 |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md`             | Phase 5 成果物 |
| 変更ファイル一覧   | `outputs/phase-5/changed-files.md`                      | Phase 5 成果物 |
| 品質レポート       | `outputs/phase-9/quality-report.md`                     | Phase 9 成果物 |
| リスク台帳         | `outputs/phase-9/risk-register.md`                      | Phase 9 成果物 |
| 因果ループ監査     | `outputs/phase-9/causal-loop-check.md`                  | Phase 9 成果物 |

## 実行手順

1. 入力成果物を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. 成果物を outputs/phase-10/ に定義する。
4. 完了条件で矛盾・漏れ・整合・依存を判定する。

## 統合テスト連携

- Phase 9 までの実測値を再掲するだけでなく、targeted test / validator / artifacts parity を再確認する
- Phase 11/12 成果物が事実と矛盾しないことを最終レビューの必須入力とする
- 仕様同期を未実施のまま「同期済み」と断定しない

## 多角的チェック観点

| 観点     | 確認内容                                                  |
| -------- | --------------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                        |
| 漏れ     | 要件から成果物への未反映項目がないか確認する              |
| 整合性   | useStreamingProgress/Store/UI契約が一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する             |

## 成果物

| 成果物           | パス                                              | 説明                   |
| ---------------- | ------------------------------------------------- | ---------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`         | 最終判定・ブロッカー表 |
| 是正計画         | `outputs/phase-10/corrective-action-plan.md`      | 是正手順・期限         |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md` | 移行可否確認           |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] ブロッカー判定がNONEであることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
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

Phase 11: 手動テスト検証
