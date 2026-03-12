# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                                            |
| ------ | ------------------------------------------------------------- |
| Phase  | 9                                                             |
| 機能名 | step-02-par-task-03-skill-creator-execute-improve-integration |
| 作成日 | 2026-03-11                                                    |

## 目的

Task03 の UI、権限、IPC 安全性、責務分離、既存導線との整合を品質観点で確認し、Phase 10 の最終レビューへ進める。

## 実行タスク

- UX 品質確認: session card の理解負荷と action 配置を確認する
- 権限境界確認: skill 実行 API と preload 公開範囲を確認する
- 責務分離確認: session card、wizard、internal engine の境界を確認する
- 既存導線整合確認: SkillManagementPanel の list / analysis / create view 回帰を確認する

## 参照資料

| 参照資料             | パス                                        | 説明           |
| -------------------- | ------------------------------------------- | -------------- |
| 実装記録             | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| 変更ファイル一覧     | `outputs/phase-5/modified-files.md`         | Phase 5 成果物 |
| 統合フロー記録       | `outputs/phase-5/integration-flow.md`       | Phase 5 成果物 |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`        | Phase 8 成果物 |
| 責務再配置マップ     | `outputs/phase-8/responsibility-map.md`     | Phase 8 成果物 |

## 実行手順

### ステップ1: 品質観点ごとのチェックリストを作成する

UX、権限、責務分離、回帰の各観点で確認事項を定義する。

### ステップ2: 実装と仕様を照合する

コード、テスト、設計成果物を突合し、仕様逸脱の有無を確認する。

### ステップ3: 残リスクを整理する

Phase 10 で承認可否を判断できるように、残る懸念を重要度付きで記録する。

## 統合テスト連携

| 観点      | 接続対象                       | 検証内容                                            |
| --------- | ------------------------------ | --------------------------------------------------- |
| 権限境界  | preload skill API              | renderer から必要な API のみ公開されていること      |
| 回帰      | SkillManagementPanel view 切替 | 既存 view が破綻していないこと                      |
| UI 一貫性 | session card                   | create / execute / improve の視認性が維持されること |

## 成果物

| 成果物           | パス                                          | 説明               |
| ---------------- | --------------------------------------------- | ------------------ |
| 品質保証レポート | `outputs/phase-9/quality-assurance-report.md` | 品質観点ごとの判定 |
| リスク一覧       | `outputs/phase-9/risk-register.md`            | 残課題と対応方針   |

## 完了条件

- [ ] 品質観点ごとの判定結果が記録されている
- [ ] 権限境界と UI 回帰の確認結果がある
- [ ] Phase 10 へ渡す残リスクが整理されている
