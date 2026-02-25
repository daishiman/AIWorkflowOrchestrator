# Phase 13: PR作成

## メタ情報

| 項目      | 値                                                                                          |
| --------- | ------------------------------------------------------------------------------------------- |
| Phase     | 13                                                                                          |
| タスクID  | UT-UI-THEME-DYNAMIC-SWITCH-001                                                              |
| 機能名    | UT-UI-THEME-DYNAMIC-SWITCH-001                                                              |
| 作成日    | 2026-02-25                                                                                  |
| 前提Phase | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11, Phase 12 |
| 後続Phase | 完了                                                                                        |

## 目的

PR作成に必要な情報を不足なく準備し、レビュワーが即時評価できる状態を作る。

## 実行タスク

- 変更要約作成: 目的、影響範囲、非対象範囲を整理する。
- 検証結果整理: テストと手動確認の結果を整理する。
- レビューポイント整理: 重点確認点を整理する。

### タスク1: 変更要約作成（SubAgent D）

- 変更目的、影響範囲、非対象範囲を整理する。

### タスク2: 検証結果整理（SubAgent C）

- テスト結果、カバレッジ、手動検証を要約する。

### タスク3: レビューポイント整理（SubAgent A/B）

- Store設計、IPC契約、UI挙動の重点確認点を列挙する。

## 参照資料

| 参照資料             | パス                                          | 内容                 |
| -------------------- | --------------------------------------------- | -------------------- |
| 依存Phase成果物      | `phase-1-requirements.md`                     | dependency: phase-1  |
| 依存Phase成果物      | `phase-2-design.md`                           | dependency: phase-2  |
| 依存Phase成果物      | `phase-5-implementation.md`                   | dependency: phase-5  |
| 依存Phase成果物      | `phase-6-test-expansion.md`                   | dependency: phase-6  |
| 依存Phase成果物      | `phase-7-coverage-check.md`                   | dependency: phase-7  |
| 依存Phase成果物      | `phase-8-refactoring.md`                      | dependency: phase-8  |
| 依存Phase成果物      | `phase-9-quality-assurance.md`                | dependency: phase-9  |
| 依存Phase成果物      | `phase-10-final-review.md`                    | dependency: phase-10 |
| 依存Phase成果物      | `phase-11-manual-test.md`                     | dependency: phase-11 |
| 依存Phase成果物      | `phase-12-documentation.md`                   | dependency: phase-12 |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`     | Phase 10 成果物      |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`      | Phase 11 成果物      |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | Phase 12 成果物      |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`     | Phase 12 成果物      |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md` | Phase 12 成果物      |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`  | Phase 12 成果物      |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`   | Phase 12 成果物      |

## システム仕様（aiworkflow-requirements）

| 参照資料                    | パス                                                                                        | 本Phaseでの適用                                     |
| --------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| テーマ設計仕様              | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | テーマモード・FOUC・永続化要件の整合確認            |
| 状態管理仕様                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand Slice/Selector と P31 対策の整合確認        |
| デスクトップ状態仕様        | `.claude/skills/aiworkflow-requirements/references/rag-desktop-state.md`                    | Main/Preload/Renderer の責務分離とテーマIPC整合確認 |
| IPC/セキュリティ仕様        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | safeInvoke/safeOn、チャネル契約、検証方針の整合確認 |
| 設定画面UI仕様              | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                       | 設定画面UX・アクセシビリティ要件の整合確認          |
| テスト仕様                  | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | テーマ横断テスト方針と後始末ルールの整合確認        |
| エラー処理仕様              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | `electron-store` 取得時フォールバック設計の整合確認 |
| APIエンドポイント仕様       | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | IPCチャンネル命名規則・契約整合の確認               |
| IPCシステム仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | systemテーマ連携時のIPC責務境界を確認               |
| Preload APIセキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | contextBridge公開範囲と入力検証方針を確認           |
| 実装パターン仕様            | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P5/P31再発防止パターンの適用確認                    |
| 品質要件仕様                | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ閾値・品質ゲート基準の整合確認            |
| タスク運用仕様              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | spec_created/未タスク連携の運用整合を確認           |

## 実行手順

1. 参照資料と依存Phase成果物を確認し、入力・制約・判定基準を固定する。
2. 実行タスクを上から順に実施し、各タスクの判断根拠を成果物に記録する。
3. 完了条件のチェックリストを検証し、次Phaseへ引き継ぐ事項を記録する。

## 多角的チェック観点（AIが判断）

| 観点               | 本Phaseでの適用判断                    | 仕様参照先                                                  |
| ------------------ | -------------------------------------- | ----------------------------------------------------------- |
| セキュリティ       | IPCや入力値を扱う箇所で必須            | `aiworkflow-requirements: security-*.md`                    |
| UI/UX              | Renderer変更・設定画面変更時に適用     | `aiworkflow-requirements: ui-ux-*.md`                       |
| アーキテクチャ     | 層責務・依存方向の確認で適用           | `aiworkflow-requirements: architecture-*.md`                |
| API設計            | IPC契約を定義・変更する場合に適用      | `aiworkflow-requirements: api-*.md`                         |
| データ整合性       | `electron-store` を扱う場合に適用      | `aiworkflow-requirements: database-*.md`, `interfaces-*.md` |
| エラーハンドリング | フォールバック・失敗系を扱う場合に適用 | `aiworkflow-requirements: error-handling.md`                |
| テスタビリティ     | テスト仕様・品質判定を扱う場合に適用   | `aiworkflow-requirements: testing-*.md`                     |

## 成果物

| 成果物 | パス                          | 内容               |
| ------ | ----------------------------- | ------------------ |
| PR情報 | `outputs/phase-13/pr-info.md` | PR本文テンプレート |

## 完了条件

- [ ] PRタイトル、要約、テスト結果、レビュー観点が定義されている。
- [ ] 参照リンクが Phase 1-12 の成果物に接続している。
- [ ] レビュー時の確認順序が明記されている。

## サブタスク管理

1. 参照資料の確認
2. 実行タスクの実施（タスク単位で管理）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json への反映方針が確認されている

## Phase実行記録

### 実行タスク

| タスク      | 結果   | 備考              |
| ----------- | ------ | ----------------- |
| 実行タスク1 | 未実施 | Phase実行時に更新 |
| 実行タスク2 | 未実施 | Phase実行時に更新 |
| 実行タスク3 | 未実施 | Phase実行時に更新 |

### 発見事項

- 良かった点: Phase実行時に記録
- 問題点: Phase実行時に記録
- 改善提案: Phase実行時に記録

### 次Phaseへの引き継ぎ事項

- Phase実行時に記録

## 次のPhase

完了
