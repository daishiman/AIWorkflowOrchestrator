# Phase 4: テスト作成

## メタ情報

| 項目      | 値                             |
| --------- | ------------------------------ |
| Phase     | 4                              |
| タスクID  | UT-UI-THEME-DYNAMIC-SWITCH-001 |
| 機能名    | UT-UI-THEME-DYNAMIC-SWITCH-001 |
| 作成日    | 2026-02-25                     |
| 前提Phase | Phase 1, Phase 2, Phase 3      |
| 後続Phase | Phase 5                        |

## 目的

テーマ切替機能をTDD Redで失敗再現できるテスト仕様とテストケースを作成する。

## 実行タスク

- Storeテスト設計: `themeMode` と `resolvedTheme` の失敗条件を定義する。
- IPCテスト設計: `theme:get-system` と `theme:system-changed` の契約を定義する。
- UIテスト設計: 切替UIと `data-theme` 同期の失敗条件を定義する。
- Red計画整理: Green移行条件を定義する。

### タスク1: Storeテスト仕様（SubAgent A/C）

- `themeMode` 設定、`resolvedTheme` 解決、system追従の失敗ケースを定義する。

### タスク2: IPC/Preloadテスト仕様（SubAgent B/C）

- `theme:get-system` と `theme:system-changed` の契約テストを定義する。
- whitelist外チャネル拒否ケースを定義する。

### タスク3: UIテスト仕様（SubAgent A/C）

- `ThemeSelector` 4モード切替。
- `ThemeProvider` による `data-theme` 同期。
- 初期表示時のFOUC防止判定。

### タスク4: テスト実行計画（SubAgent D）

- Red失敗条件、Green後期待条件、Refactor後の非退行条件を定義する。

## 統合テスト連携

- 設定画面操作から最終反映までのE2E相当経路を統合テストへ割り当てる。
- `system` モードでのIPC通知とUI更新を統合テストに割り当てる。

## 参照資料

| 参照資料             | パス                                                                              | 内容                |
| -------------------- | --------------------------------------------------------------------------------- | ------------------- |
| Phase 1成果物        | `phase-1-requirements.md`                                                         | AC入力              |
| Phase 2成果物        | `phase-2-design.md`                                                               | 設計入力            |
| Phase 3成果物        | `phase-3-design-review.md`                                                        | 指摘反映            |
| テーマテストパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | renderWithTheme運用 |
| P31対策              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | 合成Hook回避        |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                                      | Phase 1 成果物      |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`                                          | Phase 1 成果物      |
| スコープ定義         | `outputs/phase-1/scope-definition.md`                                             | Phase 1 成果物      |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md`                                          | Phase 2 成果物      |
| API仕様              | `outputs/phase-2/api-specification.md`                                            | Phase 2 成果物      |
| 状態遷移定義         | `outputs/phase-2/state-machine.md`                                                | Phase 2 成果物      |
| 設計レビュー結果     | `outputs/phase-3/design-review-result.md`                                         | Phase 3 成果物      |

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

## TDD検証

```bash
pnpm test
```

- [ ] Red状態（失敗するテスト）であることを確認
- [ ] 受け入れ基準とテストケースが1対1で対応していることを確認

## 成果物

| 成果物           | パス                                    | 内容        |
| ---------------- | --------------------------------------- | ----------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md` | テスト観点  |
| テストケース一覧 | `outputs/phase-4/test-cases.md`         | 入力/期待値 |

## 完了条件

- [ ] Store/IPC/UIの3系統でRedケースが定義されている。
- [ ] テストケースが機械判定可能な期待値を持つ。
- [ ] `renderWithTheme` または `renderWithAllThemes` の利用方針が明記されている。
- [ ] P31とP39の回避方針がテスト仕様に含まれている。

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

Phase 5
