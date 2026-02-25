# Phase 6: テスト拡充

## メタ情報

| 項目      | 値                             |
| --------- | ------------------------------ |
| Phase     | 6                              |
| タスクID  | UT-UI-THEME-DYNAMIC-SWITCH-001 |
| 機能名    | UT-UI-THEME-DYNAMIC-SWITCH-001 |
| 作成日    | 2026-02-25                     |
| 前提Phase | Phase 5                        |
| 後続Phase | Phase 7                        |

## 目的

正常系だけでなく境界値、異常系、再初期化、再起動復元を含む網羅テストへ拡張する。

## 実行タスク

- テーマ横断拡充: 3テーマとsystem解決を検証する。
- IPC異常系拡充: 無効入力と解除漏れを検証する。
- UIシナリオ拡充: 設定画面操作の連続ケースを検証する。
- レポート整理: 差分と未網羅を記録する。

### タスク1: テーマ横断テスト拡充（SubAgent C）

- 3テーマ + system解決の網羅テストを追加する。
- `afterEach` 後始末を標準化する。

### タスク2: IPC異常系拡充（SubAgent B/C）

- 無効チャネル、無効payload、イベント解除漏れの検証を追加する。

### タスク3: UI操作シナリオ拡充（SubAgent A/C）

- 設定画面の切替、再表示、アプリ再起動相当シナリオを追加する。

### タスク4: レポート整理（SubAgent D）

- カバレッジ差分と未網羅ポイントを整理する。

## 統合テスト連携

- UI操作、IPC通知、永続化復元を単一シナリオで検証する。
- 異常系シナリオでUI表示とエラー復旧動作を検証する。

## 参照資料

| 参照資料         | パス                                                                              | 内容                |
| ---------------- | --------------------------------------------------------------------------------- | ------------------- |
| Phase 5成果物    | `phase-5-implementation.md`                                                       | 実装差分入力        |
| テーマテスト方針 | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | 3テーマ検証         |
| 依存Phase成果物  | `phase-5-implementation.md`                                                       | dependency: phase-5 |
| テスト仕様書     | `outputs/phase-4/test-specification.md`                                           | Phase 4 成果物      |
| テストケース     | `outputs/phase-4/test-cases.md`                                                   | Phase 4 成果物      |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md`                                       | Phase 5 成果物      |

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

| 成果物             | パス                                  | 内容     |
| ------------------ | ------------------------------------- | -------- |
| 統合テスト結果     | `outputs/phase-6/integration-test.md` | 拡充結果 |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`  | 指標実測 |

## 完了条件

- [ ] 3テーマ + system解決テストが追加されている。
- [ ] IPC異常系テストが追加されている。
- [ ] 再起動復元シナリオが追加されている。
- [ ] カバレッジ実測値と取得コマンドが記録されている。

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

Phase 7
