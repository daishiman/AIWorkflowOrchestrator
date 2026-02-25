# Phase 9: 品質保証

## メタ情報

| 項目      | 値                             |
| --------- | ------------------------------ |
| Phase     | 9                              |
| タスクID  | UT-UI-THEME-DYNAMIC-SWITCH-001 |
| 機能名    | UT-UI-THEME-DYNAMIC-SWITCH-001 |
| 作成日    | 2026-02-25                     |
| 前提Phase | Phase 5                        |
| 後続Phase | Phase 10                       |

## 目的

機能品質、型品質、セキュリティ品質、運用品質を統合評価し、最終ゲート入力を作成する。

## 実行タスク

- 静的品質確認: lint、型、契約整合を確認する。
- セキュリティ確認: IPC保護条件を確認する。
- 運用品質確認: 残課題とリスクを確認する。

### タスク1: 静的品質確認（SubAgent A/B/C）

- lint、型チェック、契約整合を確認する。

### タスク2: セキュリティ品質確認（SubAgent B）

- IPC入力検証、チャネル制限、イベント解除方針を確認する。

### タスク3: 運用品質確認（SubAgent D）

- 仕様書と実装の差分、未解決リスクを整理する。

## 統合テスト連携

- 統合テスト結果を品質判定に含め、失敗理由を分類する。
- 手動テスト候補ケースをPhase 11入力へ引き継ぐ。

## 参照資料

| 参照資料             | パス                                                                         | 内容                |
| -------------------- | ---------------------------------------------------------------------------- | ------------------- |
| 依存Phase成果物      | `phase-5-implementation.md`                                                  | dependency: phase-5 |
| IPCセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | 品質観点            |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | 評価基準            |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`                                  | Phase 5 成果物      |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md`                                         | Phase 8 成果物      |

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

## 品質ゲート

| ゲート項目   | 判定基準                                              |
| ------------ | ----------------------------------------------------- |
| 機能検証     | ユニット/統合テストが全件成功                         |
| コード品質   | lintと型チェックが0エラー                             |
| テスト網羅性 | Line 80%以上 / Branch 60%以上 / Function 80%以上      |
| セキュリティ | IPC入力検証・チャネル制約・購読解除ルールが満たされる |

## 成果物

| 成果物       | パス                                | 内容     |
| ------------ | ----------------------------------- | -------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質判定 |

## 完了条件

- [ ] lint/型/テストの評価項目が定義されている。
- [ ] IPCセキュリティ検証項目が定義されている。
- [ ] 未解決リスクと対応方針が記録されている。

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

Phase 10
