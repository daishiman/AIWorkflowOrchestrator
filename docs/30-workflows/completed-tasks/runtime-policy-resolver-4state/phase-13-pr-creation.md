# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 13                                            |
| Phase 名   | PR作成                                        |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 |
| 前提 Phase | Phase 12（ドキュメント更新）                  |
| 後続 Phase | なし                                          |
| ステータス | blocked                                       |
| 作成日     | 2026-03-21                                    |
| 機能名     | runtime-policy-resolver-4state                |

## 目的

成果物の最終確認を行い、user approval が得られた場合のみ PR 準備を進める。

## 実行タスク

- 成果物確認: artifacts / outputs / validator 結果を最終確認する
- PR準備: user approval がある場合のみ `pr-preparation.md` を確定する

## 参照資料

| 参照資料              | パス                                                                          | 内容                           |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------------ |
| index.md              | docs/30-workflows/runtime-policy-resolver-4state/index.md                     | 受入基準・成果物一覧           |
| Phase 1 要件          | docs/30-workflows/runtime-policy-resolver-4state/phase-1-requirements.md      | 境界・受入基準                 |
| Phase 2 設計          | docs/30-workflows/runtime-policy-resolver-4state/phase-2-design.md            | capability bridge 設計         |
| Phase 5 実装          | docs/30-workflows/runtime-policy-resolver-4state/phase-5-implementation.md    | direct caller 実装             |
| Phase 6 拡充          | docs/30-workflows/runtime-policy-resolver-4state/phase-6-test-expansion.md    | degraded / silent path         |
| Phase 7 計測          | docs/30-workflows/runtime-policy-resolver-4state/phase-7-coverage-check.md    | coverage 根拠                  |
| Phase 8 整理          | docs/30-workflows/runtime-policy-resolver-4state/phase-8-refactoring.md       | 語彙整理結果                   |
| Phase 9 品質          | docs/30-workflows/runtime-policy-resolver-4state/phase-9-quality-assurance.md | lint / typecheck / test        |
| Phase 10 最終レビュー | docs/30-workflows/runtime-policy-resolver-4state/phase-10-final-review.md     | AC 検証結果                    |
| Phase 11 手動テスト   | docs/30-workflows/runtime-policy-resolver-4state/phase-11-manual-test.md      | manual evidence                |
| Phase 12 ドキュメント | docs/30-workflows/runtime-policy-resolver-4state/phase-12-documentation.md    | spec sync と validator 結果    |
| 親タスク backlog      | .claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md    | backlog sync 確認              |
| PR 作成ルール         | .claude/skills/task-specification-creator/references/execute-workflow.md      | user approval / blocked ルール |

## 実行手順

### ステップ1: 成果物最終確認

| 成果物                       | 確認方法                                              | 期待結果                         |
| ---------------------------- | ----------------------------------------------------- | -------------------------------- |
| RuntimePolicyResolver.ts     | ファイル読み取り                                      | capability authority bridge 済み |
| RuntimeSkillCreatorFacade.ts | ファイル読み取り                                      | `decision.capability` 分岐済み   |
| creatorHandlers.ts           | ファイル読み取り                                      | boundary 正規化済み              |
| validator                    | `validate-phase-output` / `verify-all-specs --strict` | PASS                             |
| ドキュメント                 | Phase 12 成果物確認                                   | 6 成果物 + mirror parity 完了    |

### ステップ2: PR 準備

user approval がある場合のみ実行する。approval 未取得時は Phase 13 ステータスを `blocked` のまま維持する。

```bash
# ブランチ名: feature/runtime-policy-capability-bridge
# PR タイトル: feat(runtime): bridge runtime policy to capability contract
```

`outputs/phase-13/pr-preparation.md` に以下を固定する。

- Summary: 1-3 箇条書き
- Test Plan: validator / targeted suite / scope boundary
- Parent Task: `TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001`

## 成果物

| 成果物         | 配置先                             |
| -------------- | ---------------------------------- |
| 最終確認結果   | 本ファイル実行結果欄追記           |
| pr-preparation | outputs/phase-13/pr-preparation.md |

## 完了条件

- [ ] 全成果物が確認済み
- [ ] 受入基準 AC-1〜AC-8 が全て充足
- [ ] user approval 未取得時は blocked を維持している
- [ ] approval 取得時のみ pr-preparation.md を確定している

## 多角的チェック観点

- 論理分析: 批判的思考・演繹思考・帰納的思考・アブダクション・垂直思考で approval 条件と blocked 条件の矛盾を除く
- 構造分解: 要素分解・MECE・2軸思考・プロセス思考で release 可能条件と保留条件を切り分ける
- メタ抽象: メタ思考・抽象化思考・ダブルループ思考で PR 準備が task 完了そのものではないことを明示する
- 発想拡張: ブレインストーミング・水平思考・逆説思考・類推思考・if思考・素人思考で summary/test-plan の最小構成を点検する
- システム: システム思考・因果関係分析・因果ループで backlog / workflow / PR の接続を確認する
- 戦略価値: トレードオン思考・プラスサム思考・価値提案思考・戦略的思考で blocked 維持と準備完了を両立させる
- 問題解決: why思考・改善思考・仮説思考・論点思考・KJ法で release blocker を明文化する

## サブタスク管理

1. 最終成果物確認
2. validator 結果確認
3. approval 状態確認
4. pr-preparation 更新または blocked 維持
5. 完了条件検証

## タスク100%実行確認【必須】

- [ ] Phase 13 の全タスクを 100% 実行完了
- [ ] approval 条件と blocked 条件を明文化
- [ ] `outputs/phase-13/pr-preparation.md` の扱いを確定
- [ ] task root と parent backlog の整合が維持されている

## 次 Phase

なし（user approval 待ち）。
