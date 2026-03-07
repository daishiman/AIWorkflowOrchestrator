# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 9                                               |
| 機能名     | ut-task-10a-b-008-unassigned-count-resync-guard |
| タスクID   | UT-TASK-10A-B-008                               |
| タスク名   | 未タスク件数再計算同期ガード                    |
| 前提Phase  | Phase 5                                         |
| 後続Phase  | Phase 10                                        |
| 作成日     | 2026-03-06                                      |
| ステータス | completed                                       |

## 目的

実装差分が要件、設計、テスト、再利用カードと矛盾せず、文書品質と監査品質の両方で通過できるかを確認する。

## Atent Team（SubAgent）分担

| SubAgent | 関心ごと     | 実行順序    | 役割                               |
| -------- | ------------ | ----------- | ---------------------------------- |
| A        | 文書品質監査 | 先行        | 3台帳と教訓の文面整合を監査する    |
| B        | 監査品質監査 | Aと並列     | コマンド期待値と記録形式を監査する |
| C        | リスク監査   | A/B後に直列 | 残余リスクと保留事項を整理する     |
| D        | 品質報告統合 | C後に直列   | 品質報告へ統合する                 |

## 実行タスク

- 文書品質監査: 3台帳と教訓の文面整合を確認する
- 監査品質監査: `verify-unassigned-links` と `audit` の記録形式を確認する
- リスク整理: 保留事項と残余リスクを整理する
- 品質報告統合: 監査結果を `quality-report.md` と `risk-register.md` へ集約する

## 参照資料

### 前Phase成果物

| 資料名                       | パス                                        | 用途               |
| ---------------------------- | ------------------------------------------- | ------------------ |
| Phase 5 実装サマリー         | `outputs/phase-5/implementation-summary.md` | 実装差分を確認する |
| Phase 8 リファクタリング記録 | `outputs/phase-8/refactoring-log.md`        | 整理結果を確認する |
| Phase 8 再利用ガードパターン | `outputs/phase-8/reusable-guard-pattern.md` | 再利用性を確認する |

### システム仕様（aiworkflow-requirements）

| 資料名           | パス                                                                          | 用途                                      |
| ---------------- | ----------------------------------------------------------------------------- | ----------------------------------------- |
| タスク運用正本   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`          | 品質報告で参照する台帳更新結果を確認する  |
| タスク運用ルール | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`    | 完了/未完了の配置条件を品質判定へ反映する |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | 品質報告の粒度を確認する                  |
| 開発ガイドライン | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | 検証結果記録の粒度を確認する              |
| 教訓正本         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`        | 再発防止ルールを確認する                  |

## 実行手順

1. Phase 5 と Phase 8 の成果物を読み、文面矛盾がないか確認する。
2. `verify-unassigned-links` と `audit` の記録形式が再現可能か確認する。
3. 残余リスクを「状態変化」「参照切れ」「監査誤読」の3分類で整理する。
4. 品質報告とリスク登録表へ集約する。

## 統合テスト連携

- Phase 10 は Phase 9 の品質報告をゲート判定の入力に使う。
- Phase 11 は Phase 9 のリスク登録表を目視確認の観点表に使う。

## 多角的チェック観点（関心分離）

| 観点       | 確認内容                             | 正本              |
| ---------- | ------------------------------------ | ----------------- |
| 文面整合   | 3台帳と教訓の文が矛盾しないか        | quality-report.md |
| 監査整合   | コマンド期待値と記録形式が一致するか | quality-report.md |
| リスク分類 | 残余リスクが3分類で整理されているか  | risk-register.md  |
| 引継ぎ性   | Phase 10/11 が迷わず読めるか         | quality-report.md |

## 成果物

| 成果物       | パス                                | 説明                   |
| ------------ | ----------------------------------- | ---------------------- |
| 品質報告     | `outputs/phase-9/quality-report.md` | 品質監査結果を記録する |
| リスク登録表 | `outputs/phase-9/risk-register.md`  | 残余リスクを記録する   |

## 完了条件

- [x] 文書品質と監査品質を監査した
- [x] 残余リスクを3分類で整理した
- [x] Phase 10 のゲート入力を準備した
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 5/8 成果物の確認
2. SubAgent-A/B の並列監査
3. SubAgent-C のリスク整理
4. SubAgent-D の品質報告統合
5. 成果物出力

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載の2ファイルを定義した
- [x] 品質監査とリスク整理を完了した
- [x] Phase 10 の入力を固定した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-task-10a-b-008-unassigned-count-resync-guard
```

## 次のPhase

Phase 10: 最終レビューゲート
