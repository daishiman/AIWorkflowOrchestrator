# Phase 1: 要件定義

## メタ情報

| 項目      | 値                             |
| --------- | ------------------------------ |
| Phase     | 1                              |
| タスクID  | UT-UI-THEME-DYNAMIC-SWITCH-001 |
| 機能名    | UT-UI-THEME-DYNAMIC-SWITCH-001 |
| 作成日    | 2026-02-25                     |
| 前提Phase | なし                           |
| 後続Phase | Phase 2                        |

## 目的

テーマ切替機能の要件を4モード、永続化、OS追従、FOUC防止、P31対策の観点で確定し、実装前の解釈差を排除する。

## 実行タスク

- タスク抽出: A/B/Cの担当領域で要件を抽出する。
- 受け入れ基準定義: 検証可能なACを定義する。
- スコープ確定: 対象と対象外を確定する。

### タスク1: 要件抽出（SubAgent A/B/C 並列）

- A: Renderer要件を抽出する（`themeMode`, `resolvedTheme`, `ThemeProvider`, `ThemeSelector`）。
- B: Main/Preload要件を抽出する（`nativeTheme`、IPCチャネル、イベント通知）。
- C: 永続化とテスト要件を抽出する（`electron-store`、テストヘルパー、カバレッジ基準）。

### タスク2: 受け入れ基準定義（SubAgent D 直列）

- 4モード切替、再起動復元、OS変更追従、初期描画一貫性の検証条件を定義する。
- Phase 10で機械判定できる完了基準へ正規化する。

### タスク3: スコープ境界確定（SubAgent D 直列）

- 対象: テーマ切替導線、状態管理、IPC、永続化、テスト。
- 対象外: 新テーマ追加、Tailwind統合、配色再設計。

## 統合テスト連携

- テーマ切替の正常系、異常系、再起動復元の統合観点を要件へ組み込む。
- IPC経由のsystem追従イベントを統合テスト対象として明記する。

## 参照資料

| 参照資料       | パス                                                                              | 内容                       |
| -------------- | --------------------------------------------------------------------------------- | -------------------------- |
| 元タスク       | `docs/30-workflows/completed-tasks/ut-ui-theme-dynamic-switch-001.md`             | Why/What/Howの原文         |
| Issue定義      | `https://github.com/daishiman/AIWorkflowOrchestrator/issues/870`                  | 追跡ID、優先度             |
| テーマ仕様正本 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`        | テーマモード、永続化、FOUC |
| 状態管理正本   | `.claude/skills/aiworkflow-requirements/references/rag-desktop-state.md`          | layer責務、テーマIPC       |
| Slice設計正本  | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | Zustand構造、P31対策       |
| テスト正本     | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テーマ横断テスト           |
| カバレッジ基準 | `.claude/skills/task-specification-creator/references/coverage-standards.md`      | 80/60/80                   |

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

| 成果物       | パス                                         | 内容        |
| ------------ | -------------------------------------------- | ----------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | FR/NFR一覧  |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能AC  |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象/対象外 |

## 完了条件

- [ ] 4モード（kanagawa-dragon/light/dark/system）の機能要件が確定している。
- [ ] `themeMode` と `resolvedTheme` の責務分離が明文化されている。
- [ ] `nativeTheme` 連動要件がイベント単位で明記されている。
- [ ] 永続化キーとフォールバック戦略が定義されている。
- [ ] テスト観点とカバレッジ目標が定量で定義されている。

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

Phase 2
