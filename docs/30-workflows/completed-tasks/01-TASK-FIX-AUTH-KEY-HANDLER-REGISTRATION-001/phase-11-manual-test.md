# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| Phase      | 11                                                     |
| 機能名     | TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001             |
| タスク名   | auth-key IPCハンドラ登録漏れとライフサイクル整合の修正 |
| 前提Phase  | Phase 10                                               |
| 後続Phase  | Phase 12                                               |
| 作成日     | 2026-03-05                                             |
| ステータス | pending                                                |

## 目的

手動検証と証跡で実利用品質を確認し、TC単位で画面証跡と判定根拠を固定する。

## 背景

`auth-key:exists` で `No handler registered` が発生し、実行前認証確認が停止する。

## SubAgentチーム編成

| SubAgent   | 関心ごと        | 主担当                     |
| ---------- | --------------- | -------------------------- |
| SubAgent-A | Main/IPC責務    | 登録順序・ライフサイクル   |
| SubAgent-B | Preload/API契約 | 型契約・公開境界           |
| SubAgent-C | Renderer/UX契約 | 状態遷移・表示整合         |
| SubAgent-D | 統合監査        | 矛盾・漏れ・整合・依存判定 |

## 実行タスク

- 手動シナリオ設計: TC-IDベースで視覚/非視覚シナリオを固定する
- 証跡取得計画: スクリーンショットとログ採取手順を固定する
- 判定記録: PASS/FAIL判定と根拠を成果物に記録する

## 参照資料

| 参照資料               | パス                                              | 説明            |
| ---------------------- | ------------------------------------------------- | --------------- |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`      | Phase 1 成果物  |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`          | Phase 1 成果物  |
| アーキテクチャ設計     | `outputs/phase-2/architecture-design.md`          | Phase 2 成果物  |
| IPC契約設計            | `outputs/phase-2/ipc-contract-design.md`          | Phase 2 成果物  |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物  |
| 契約差分               | `outputs/phase-5/contract-diff.md`                | Phase 5 成果物  |
| 拡張テストケース       | `outputs/phase-6/expanded-test-cases.md`          | Phase 6 成果物  |
| 回帰テスト結果         | `outputs/phase-6/regression-test-result.md`       | Phase 6 成果物  |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | Phase 7 成果物  |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物  |
| リファクタ計画         | `outputs/phase-8/refactoring-plan.md`             | Phase 8 成果物  |
| 責務境界マップ         | `outputs/phase-8/responsibility-boundary-map.md`  | Phase 8 成果物  |
| 品質レポート           | `outputs/phase-9/quality-report.md`               | Phase 9 成果物  |
| リスク台帳             | `outputs/phase-9/risk-register.md`                | Phase 9 成果物  |
| 最終レビュー結果       | `outputs/phase-10/final-review-result.md`         | Phase 10 成果物 |
| 是正計画               | `outputs/phase-10/corrective-action-plan.md`      | Phase 10 成果物 |
| 出荷準備チェック       | `outputs/phase-10/release-readiness-checklist.md` | Phase 10 成果物 |

## 実行手順

1. 入力成果物を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. 成果物を outputs/phase-N/ に定義する。
4. 完了条件で矛盾・漏れ・整合・依存を判定する。

## テストケース

| テストケース | 種別 | 観点                         | 期待結果                                                             |
| ------------ | ---- | ---------------------------- | -------------------------------------------------------------------- |
| TC-11-UI-01  | 視覚 | ルートナビゲーション         | ダッシュボード初期表示で情報階層と主要導線が崩れていない             |
| TC-11-UI-02  | 視覚 | Skill Center 一覧            | カードレイアウト・タイポグラフィ・余白が一貫している                 |
| TC-11-UI-03  | 視覚 | UI Design Foundation Preview | トークン表示・検索入力・パネル構成が読みやすく、視認性が保たれている |

## 画面カバレッジマトリクス

| テストケース | 対象画面/状態                          | 証跡                                                                | 判定基準                                       |
| ------------ | -------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| TC-11-UI-01  | `/dashboard` 初期表示                  | `outputs/phase-11/screenshots/TC-11-UI-01-root-navigation.png`      | レイアウト破綻なし、ナビゲーション可視         |
| TC-11-UI-02  | `/advanced/skill-center` 一覧表示      | `outputs/phase-11/screenshots/TC-11-UI-02-skill-center-view.png`    | カード整列、検索導線の可読性維持               |
| TC-11-UI-03  | `/ui-design-foundation` プレビュー表示 | `outputs/phase-11/screenshots/TC-11-UI-03-ui-design-foundation.png` | コンポーネント境界・文字コントラストが視認可能 |

## 非視覚シナリオ（補助）

| ケースID | 観点     | 手順                                        | 期待結果                                       |
| -------- | -------- | ------------------------------------------- | ---------------------------------------------- |
| NV-11-01 | 登録順序 | `registerAllIpcHandlers` の呼び出し順を確認 | `registerAuthKeyHandlers` が必ず実行される     |
| NV-11-02 | 解除順序 | `unregisterAllIpcHandlers` を確認           | `unregisterAuthKeyHandlers` が解除時に呼ばれる |
| NV-11-03 | 冪等性   | auth-key lifecycle テストを実行             | register/unregister 複数サイクルで破綻しない   |

## 統合テスト連携

- SubAgent-A/B/C の検証ケース（視覚3件 + 非視覚3件）を並列で設計する。
- SubAgent-D が統合順序を直列で確定する。
- auth-key:set / auth-key:exists / auth-key:validate / auth-key:delete を統合対象に固定する。
- Main登録完了時刻とRenderer呼び出し時刻をログで突合する。
- 再登録シナリオで `No handler registered` を再発させない。
- 統合ログは `outputs/phase-11/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                          |
| -------- | ------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                |
| 漏れ     | 要件から成果物への未反映項目がないか確認する      |
| 整合性   | Main/Preload/Renderer契約が一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する     |

## 成果物

| 成果物                 | パス                                     | 説明             |
| ---------------------- | ---------------------------------------- | ---------------- |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md` | 手動検証結果     |
| 証跡インデックス       | `outputs/phase-11/evidence-index.md`     | 証跡一覧         |
| スクリーンショット計画 | `outputs/phase-11/screenshot-plan.md`    | 撮影計画         |
| スクリーンショット実体 | `outputs/phase-11/screenshots/*.png`     | TC単位の画面証跡 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] `validate-phase11-screenshot-coverage` が PASS であることを確認
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/01-TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001
```

## 次のPhase

Phase 12: ドキュメント更新
