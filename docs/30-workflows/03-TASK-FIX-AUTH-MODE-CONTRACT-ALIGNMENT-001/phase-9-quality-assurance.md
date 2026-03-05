# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 9                                             |
| 機能名     | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001     |
| タスク名   | authMode Main/Preload/Renderer 契約形状の統一 |
| 前提Phase  | Phase 8                                       |
| 後続Phase  | Phase 10                                      |
| 作成日     | 2026-03-05                                    |
| ステータス | pending                                       |

## 目的

品質とリスクを定量化して運用判断を可能にする。

## 背景

auth-mode 応答形状と changed イベント形状が層ごとに不一致で、状態反映が破綻する。

## SubAgentチーム編成

| SubAgent   | 関心ごと        | 主担当                     |
| ---------- | --------------- | -------------------------- |
| SubAgent-A | Main/IPC責務    | 登録順序・ライフサイクル   |
| SubAgent-B | Preload/API契約 | 型契約・公開境界           |
| SubAgent-C | Renderer/UX契約 | 状態遷移・表示整合         |
| SubAgent-D | 統合監査        | 矛盾・漏れ・整合・依存判定 |

## 実行タスク

- 品質監査: 機能・セキュリティ・保守性を評価する
- リスク評価: 残存リスクを影響度×発生頻度で分類する
- 因果ループ監査: 修正が新規障害を生む循環を評価する

## 参照資料

### 実装・コード

| 資料名           | パス                                                      | 用途                 |
| ---------------- | --------------------------------------------------------- | -------------------- |
| authModeハンドラ | `apps/desktop/src/main/ipc/authModeHandlers.ts`           | レスポンス形状を確認 |
| AuthModeService  | `apps/desktop/src/main/services/auth/AuthModeService.ts`  | サービス出力型を確認 |
| Preload API      | `apps/desktop/src/preload/index.ts`                       | invoke透過契約を確認 |
| Preload型定義    | `apps/desktop/src/preload/types.ts`                       | ElectronAPI型を確認  |
| Renderer Slice   | `apps/desktop/src/renderer/store/slices/authModeSlice.ts` | 受信フィールドを確認 |

### システム仕様（aiworkflow-requirements）

| 資料名                 | パス                                                                              | 用途                          |
| ---------------------- | --------------------------------------------------------------------------------- | ----------------------------- |
| 認証I/F                | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`            | 認証型契約                    |
| システムIPC仕様        | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`             | auth-modeチャネル仕様         |
| IPC契約チェックリスト  | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | Main/Preload/Renderer同期基準 |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | Store契約運用                 |
| UI設定仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`             | 設定画面導線                  |
| UI機能仕様             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | 表示契約                      |
| 認証アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | 責務境界                      |
| IPCセキュリティ        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender検証                    |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | 失敗契約                      |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 回帰判定基準                  |
| タスク運用             | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | 台帳同期                      |
| 教訓                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | 契約ドリフト再発防止          |
| リソースマップ         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                  | 抽出漏れ防止                  |
| 検索スクリプト         | `.claude/skills/aiworkflow-requirements/scripts/search-spec.js`                   | 仕様抽出コマンド              |

### 依存Phase

| 資料名             | パス                        | 用途             |
| ------------------ | --------------------------- | ---------------- |
| 依存Phase 5 仕様   | `phase-5-implementation.md` | 依存入力を確認   |
| 依存Phase 5 成果物 | `outputs/phase-5/`          | 依存成果物を確認 |

## 実行手順

1. 入力成果物を確認する。
2. SubAgent-A/B/C を並列実行し、SubAgent-D で統合判定する。
3. 成果物を outputs/phase-N/ に定義する。
4. 完了条件で矛盾・漏れ・整合・依存を判定する。

## 統合テスト連携

- SubAgent-A/B/C の検証ケースを並列で設計する。
- SubAgent-D が統合順序を直列で確定する。
- auth-mode:get/set/status/validate のI/O契約を統合対象に固定する。
- auth-mode:changed のイベントpayloadをMain/Preload/Rendererで一致させる。
- 設定画面の状態反映遅延と欠損を0件にする。
- 統合ログは `outputs/phase-9/` に保存する。

## 多角的チェック観点

| 観点     | 確認内容                                          |
| -------- | ------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                |
| 漏れ     | 要件から成果物への未反映項目がないか確認する      |
| 整合性   | Main/Preload/Renderer契約が一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する     |

## 成果物

| 成果物         | パス                                   | 説明         |
| -------------- | -------------------------------------- | ------------ |
| 品質レポート   | `outputs/phase-9/quality-report.md`    | 品質評価結果 |
| リスク台帳     | `outputs/phase-9/risk-register.md`     | 残存リスク   |
| 因果ループ監査 | `outputs/phase-9/causal-loop-check.md` | 因果循環評価 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001
```

## 次のPhase

Phase 10: 最終レビューゲート
