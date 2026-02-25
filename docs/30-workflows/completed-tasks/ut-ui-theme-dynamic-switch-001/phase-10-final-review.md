# Phase 10: 最終レビューゲート

## メタ情報

| 項目      | 値                             |
| --------- | ------------------------------ |
| Phase     | 10                             |
| タスクID  | UT-UI-THEME-DYNAMIC-SWITCH-001 |
| 機能名    | UT-UI-THEME-DYNAMIC-SWITCH-001 |
| 作成日    | 2026-02-25                     |
| 前提Phase | Phase 1, Phase 2, Phase 5      |
| 後続Phase | Phase 11                       |

## 目的

出荷前レビューとして要件達成度、設計整合、品質結果を最終判定する。

## 実行タスク

- 要件照合: 要件と証跡を1対1で照合する。
- 設計照合: 設計逸脱を評価する。
- 品質照合: 品質結果を評価する。
- ゲート判定: 最終判定を確定する。

### タスク1: 要件トレーサビリティ確認（SubAgent D）

- Phase 1要件と実装証跡を1対1で照合する。

### タスク2: 設計整合確認（SubAgent A/B）

- Phase 2設計との差分を評価し、逸脱を分類する。

### タスク3: 品質結果確認（SubAgent C）

- カバレッジ、テスト、静的解析結果の妥当性を評価する。

### タスク4: ゲート判定

- PASS/MINOR/MAJOR/CRITICAL を確定する。

## 統合テスト連携

- 統合テストの成功条件を最終判定条件へ含める。
- 失敗シナリオの残件をPhase 11の手動検証対象へ移送する。

## 参照資料

| 参照資料             | パス                                         | 内容                |
| -------------------- | -------------------------------------------- | ------------------- |
| 依存Phase成果物      | `phase-1-requirements.md`                    | dependency: phase-1 |
| 依存Phase成果物      | `phase-2-design.md`                          | dependency: phase-2 |
| 依存Phase成果物      | `phase-5-implementation.md`                  | dependency: phase-5 |
| 品質結果             | `phase-9-quality-assurance.md`               | 品質判定入力        |
| 要件定義書           | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物      |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物      |
| スコープ定義         | `outputs/phase-1/scope-definition.md`        | Phase 1 成果物      |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md`     | Phase 2 成果物      |
| API仕様              | `outputs/phase-2/api-specification.md`       | Phase 2 成果物      |
| 状態遷移定義         | `outputs/phase-2/state-machine.md`           | Phase 2 成果物      |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`  | Phase 5 成果物      |
| カバレッジゲート結果 | `outputs/phase-7/coverage-report.md`         | Phase 7 成果物      |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md`         | Phase 8 成果物      |
| 品質レポート         | `outputs/phase-9/quality-report.md`          | Phase 9 成果物      |

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

## レビューゲート判定

| 判定     | 条件                     | 対応                              |
| -------- | ------------------------ | --------------------------------- |
| PASS     | 全レビュー観点で問題なし | Phase 11へ進行                    |
| MINOR    | 軽微な指摘あり           | 未タスク化してPhase 11へ進行      |
| MAJOR    | 重大な問題あり           | 影響範囲に応じて戻り先Phaseへ戻る |
| CRITICAL | 致命的な問題あり         | Phase 1へ戻って要件を再確認       |

### 戻り先判定

| 問題種別                  | 戻り先Phase            |
| ------------------------- | ---------------------- |
| 要件の問題                | Phase 1                |
| 設計の問題                | Phase 2                |
| テスト設計の問題          | Phase 4                |
| 実装の問題                | Phase 5                |
| テスト拡充/カバレッジ未達 | Phase 6 または Phase 7 |
| コード品質の問題          | Phase 8                |

## 成果物

| 成果物           | パス                                      | 内容       |
| ---------------- | ----------------------------------------- | ---------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | ゲート判定 |

## 完了条件

- [ ] 判定結果と根拠が記録されている。
- [ ] MINOR/MAJOR/CRITICAL の戻り先Phaseが定義されている。
- [ ] Phase 11へ渡す確認項目が確定している。

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

Phase 11
