# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| Phase      | 11                                                      |
| 機能名     | TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001    |
| タスク名   | Electron sandbox iterableエラーの原因分離と再発防止設計 |
| 前提Phase  | Phase 10                                                |
| 後続Phase  | Phase 12                                                |
| 作成日     | 2026-03-05                                              |
| ステータス | pending                                                 |

## 目的

手動検証と証跡で実利用品質を確認し、非視覚タスクでも UI 回帰有無を明示的に判定する。

## 背景

OAuthセッション確立後に sandbox bundle iterable エラーが出力され、主因と副作用ログが混在する。
本修正は Main IPC契約と Renderer state 正規化が中心だが、画面回帰の有無をスクリーンショットで固定する。

## Atent Team（SubAgent）編成

| SubAgent   | 関心ごと        | 主担当                     |
| ---------- | --------------- | -------------------------- |
| SubAgent-A | Main/IPC責務    | 登録順序・ライフサイクル   |
| SubAgent-B | Preload/API契約 | 型契約・公開境界           |
| SubAgent-C | Renderer/UX回帰 | 画面証跡・操作導線確認     |
| SubAgent-D | 統合監査        | 矛盾・漏れ・整合・依存判定 |

## 実行タスク

- 手動シナリオ設計: TC-IDベースで視覚/非視覚シナリオを固定する
- 証跡取得計画: スクリーンショットとログ採取手順を固定する
- 判定記録: PASS/FAIL判定と根拠を成果物に記録する

## 参照資料

| 参照資料             | パス                                              | 説明            |
| -------------------- | ------------------------------------------------- | --------------- |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`         | Phase 10 成果物 |
| 是正計画             | `outputs/phase-10/corrective-action-plan.md`      | Phase 10 成果物 |
| 出荷準備チェック     | `outputs/phase-10/release-readiness-checklist.md` | Phase 10 成果物 |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md`          | Phase 2 成果物  |
| IPC契約設計          | `outputs/phase-2/ipc-contract-design.md`          | Phase 2 成果物  |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物  |
| 契約差分             | `outputs/phase-5/contract-diff.md`                | Phase 5 成果物  |
| 拡張テストケース     | `outputs/phase-6/expanded-test-cases.md`          | Phase 6 成果物  |
| 回帰テスト結果       | `outputs/phase-6/regression-test-result.md`       | Phase 6 成果物  |
| カバレッジ計画       | `outputs/phase-7/coverage-plan.md`                | Phase 7 成果物  |
| 網羅率レポート       | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物  |
| リファクタリング計画 | `outputs/phase-8/refactoring-plan.md`             | Phase 8 成果物  |
| 責務境界マップ       | `outputs/phase-8/responsibility-boundary-map.md`  | Phase 8 成果物  |
| 品質レポート         | `outputs/phase-9/quality-report.md`               | Phase 9 成果物  |
| リスク台帳           | `outputs/phase-9/risk-register.md`                | Phase 9 成果物  |

## 実行手順

1. 入力成果物と差分を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. 視覚TCはスクリーンショット取得、非視覚TCはコード/テスト証跡を採取する。
4. 成果物を `outputs/phase-11/` に出力し、完了条件で矛盾・漏れ・整合・依存を判定する。

## テストケース

| テストケース | 種別 | 観点                 | 期待結果                                               |
| ------------ | ---- | -------------------- | ------------------------------------------------------ |
| TC-11-UI-01  | 視覚 | ルートナビゲーション | 左ナビと主要導線の情報階層が崩れていない               |
| TC-11-UI-02  | 視覚 | Skill Center 一覧    | カード整列・検索導線・余白が一貫している               |
| TC-11-UI-03  | 視覚 | UI Design Foundation | トークン表示・検索入力・プレビューの可読性が維持される |

## 画面カバレッジマトリクス

| テストケース | 対象画面/状態                                   | 証跡                                                                | 判定基準                                   |
| ------------ | ----------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------ |
| TC-11-UI-01  | `/` 初期表示（AppDock含む）                     | `outputs/phase-11/screenshots/TC-11-UI-01-root-navigation.png`      | ナビゲーション導線、主要領域の視認性が維持 |
| TC-11-UI-02  | `/advanced/skill-center` 一覧表示               | `outputs/phase-11/screenshots/TC-11-UI-02-skill-center-view.png`    | カード配列、検索UI、CTA導線の一貫性        |
| TC-11-UI-03  | `/advanced/ui-design-foundation` プレビュー表示 | `outputs/phase-11/screenshots/TC-11-UI-03-ui-design-foundation.png` | タイポグラフィ、コントラスト、境界視認性   |

## 非視覚シナリオ（補助）

| ケースID | 観点         | 手順                                                             | 期待結果                       |
| -------- | ------------ | ---------------------------------------------------------------- | ------------------------------ |
| NV-11-01 | Main契約     | `profileHandlers.test.ts` で `getProviders` payload shape を確認 | `data` が配列契約で返却される  |
| NV-11-02 | Renderer契約 | `authSlice.test.ts` で malformed `linkedProviders` 回復を確認    | 異常データを破棄しUI継続       |
| NV-11-03 | UI回帰       | `AccountSection.portal.test.tsx` を実行                          | Portal操作の既存挙動に退行なし |

## 統合テスト連携

- SubAgent-A/B/C の検証ケース（視覚3件 + 非視覚3件）を並列で設計する。
- SubAgent-D が統合順序を直列で確定する。
- AuthFlowOrchestratorログとRendererコンソールログの時系列一致を検証対象に固定する。

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001
```

## 次のPhase

Phase 12: ドキュメント更新
