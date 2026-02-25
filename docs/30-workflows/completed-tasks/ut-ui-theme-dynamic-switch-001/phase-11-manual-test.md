# Phase 11: 手動テスト検証

## メタ情報

| 項目      | 値                                                                      |
| --------- | ----------------------------------------------------------------------- |
| Phase     | 11                                                                      |
| タスクID  | UT-UI-THEME-DYNAMIC-SWITCH-001                                          |
| 機能名    | UT-UI-THEME-DYNAMIC-SWITCH-001                                          |
| 作成日    | 2026-02-25                                                              |
| 前提Phase | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10 |
| 後続Phase | Phase 12                                                                |

## 目的

実利用操作に基づく手動検証手順を定義し、機械テストで見えない体験品質を評価する。

## 実行タスク

- 設定画面操作検証: 4モード切替の挙動を検証する。
- OS連動検証: systemモードの追従挙動を検証する。
- 永続化検証: 再起動復元と無効値フォールバックを検証する。
- 結果統合: 判定可能形式で記録する。

### タスク1: 設定画面操作検証（SubAgent A）

- 4モード選択、表示同期、切替即時性を確認する。

### タスク2: OS連動検証（SubAgent B）

- system選択時のOS変更追従を確認する。

### タスク3: 永続化検証（SubAgent C）

- 再起動後復元、無効値復元時フォールバックを確認する。

### タスク4: 結果統合（SubAgent D）

- 手動結果を判定可能形式で整理する。

## 統合テスト連携

- 手動結果と統合テスト結果の差分を比較し、追加修正候補を抽出する。
- 手動で再現した問題をPhase 12の未タスク検出入力へ送る。

## 参照資料

| 参照資料         | パス                                                                  | 内容                 |
| ---------------- | --------------------------------------------------------------------- | -------------------- |
| 依存Phase成果物  | `phase-1-requirements.md`                                             | dependency: phase-1  |
| 依存Phase成果物  | `phase-2-design.md`                                                   | dependency: phase-2  |
| 依存Phase成果物  | `phase-5-implementation.md`                                           | dependency: phase-5  |
| 依存Phase成果物  | `phase-6-test-expansion.md`                                           | dependency: phase-6  |
| 依存Phase成果物  | `phase-7-coverage-check.md`                                           | dependency: phase-7  |
| 依存Phase成果物  | `phase-8-refactoring.md`                                              | dependency: phase-8  |
| 依存Phase成果物  | `phase-9-quality-assurance.md`                                        | dependency: phase-9  |
| 依存Phase成果物  | `phase-10-final-review.md`                                            | dependency: phase-10 |
| 設定画面UX       | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md` | 手動観点             |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                             | Phase 10 成果物      |

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

| 成果物         | パス                                     | 内容         |
| -------------- | ---------------------------------------- | ------------ |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | ケース別結果 |

## 完了条件

- [ ] 4モード切替の手動シナリオが定義されている。
- [ ] system追従と再起動復元の手動シナリオが定義されている。
- [ ] 失敗時の再現手順が記録される形式になっている。

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

Phase 12
