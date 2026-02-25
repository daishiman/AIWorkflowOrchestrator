# Phase 3: 設計レビューゲート

## メタ情報

| 項目      | 値                             |
| --------- | ------------------------------ |
| Phase     | 3                              |
| タスクID  | UT-UI-THEME-DYNAMIC-SWITCH-001 |
| 機能名    | UT-UI-THEME-DYNAMIC-SWITCH-001 |
| 作成日    | 2026-02-25                     |
| 前提Phase | Phase 1, Phase 2               |
| 後続Phase | Phase 4                        |

## 目的

Phase 2設計を実装可能性、安全性、検証可能性の観点で評価し、Redフェーズへ進む可否を判定する。

## 実行タスク

- 設計整合レビュー: A/B/Cの成果物を横断評価する。
- セキュリティレビュー: IPC契約と検証方針を評価する。
- テスト可能性レビュー: Red失敗再現性を評価する。
- ゲート判定: PASS/MINOR/MAJOR/CRITICALを確定する。

### タスク1: 設計整合レビュー（SubAgent D 主担当）

- A/B/C設計の境界矛盾を検証する。
- 依存関係逆転違反と責務重複を確認する。

### タスク2: セキュリティレビュー（SubAgent B）

- IPC契約、sender検証、whitelist、型整合を評価する。

### タスク3: テスト可能性レビュー（SubAgent C）

- Redテストで失敗再現可能かを判定する。
- テスト入力と期待値の明確度を評価する。

### タスク4: ゲート判定

- PASS/MINOR/MAJOR/CRITICAL で判定し、戻り先を明示する。

## 統合テスト連携

- Phase 4で作成する統合テストケースに対し、要件トレースIDを付与する。
- レビュー指摘をテスト観点へ直接接続できる形式で記録する。

## 参照資料

| 参照資料           | パス                                                                                        | 内容                |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------- |
| Phase 1成果物      | `phase-1-requirements.md`                                                                   | 要件整合            |
| Phase 2成果物      | `phase-2-design.md`                                                                         | 設計入力            |
| IPC契約チェック    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | 契約ドリフト防止    |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | watcher解除パターン |
| 要件定義書         | `outputs/phase-1/requirements-definition.md`                                                | Phase 1 成果物      |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`                                                    | Phase 1 成果物      |
| スコープ定義       | `outputs/phase-1/scope-definition.md`                                                       | Phase 1 成果物      |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`                                                    | Phase 2 成果物      |
| API仕様            | `outputs/phase-2/api-specification.md`                                                      | Phase 2 成果物      |
| 状態遷移定義       | `outputs/phase-2/state-machine.md`                                                          | Phase 2 成果物      |

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

| 判定  | 条件                     | 対応                                       |
| ----- | ------------------------ | ------------------------------------------ |
| PASS  | 全レビュー観点で問題なし | Phase 4へ進行                              |
| MINOR | 軽微な指摘あり           | 指摘対応後にPhase 4へ進行                  |
| MAJOR | 重大な問題あり           | 影響範囲に応じてPhase 1またはPhase 2へ戻る |

### 戻り先判定

| 問題種別             | 戻り先Phase |
| -------------------- | ----------- |
| 要件の問題           | Phase 1     |
| 設計の問題           | Phase 2     |
| 要件と設計の複合問題 | Phase 1     |

## 成果物

| 成果物           | パス                                      | 内容       |
| ---------------- | ----------------------------------------- | ---------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定と指摘 |

## 完了条件

- [ ] PASS/MINOR/MAJOR/CRITICAL のいずれかで判定済みである。
- [ ] 判定根拠が要件IDまたは設計IDに紐付いている。
- [ ] 修正が必要な場合の戻り先Phaseが記録されている。
- [ ] Phase 4で使用するテスト入力一覧が確定している。

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

Phase 4
