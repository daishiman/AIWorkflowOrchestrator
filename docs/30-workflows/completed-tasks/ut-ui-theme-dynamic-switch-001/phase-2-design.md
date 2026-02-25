# Phase 2: 設計

## メタ情報

| 項目      | 値                             |
| --------- | ------------------------------ |
| Phase     | 2                              |
| タスクID  | UT-UI-THEME-DYNAMIC-SWITCH-001 |
| 機能名    | UT-UI-THEME-DYNAMIC-SWITCH-001 |
| 作成日    | 2026-02-25                     |
| 前提Phase | Phase 1                        |
| 後続Phase | Phase 3                        |

## 目的

Renderer/Main/Preload/Storage の責務を固定し、実装順序を決定可能な設計仕様を作成する。

## 実行タスク

- State/UI設計: Renderer責務を固定する。
- IPC/Preload設計: チャネル契約と公開APIを固定する。
- 永続化設計: ストレージキーとフォールバックを固定する。
- 設計統合: レビュー入力資料を1セット化する。

### タスク1: State/UI設計（SubAgent A）

- `ThemeMode` 型設計。
- `settingsSlice` 拡張設計（state, actions, selector）。
- `ThemeProvider` と `ThemeSelector` のI/F設計。

### タスク2: IPC/Preload設計（SubAgent B）

- `theme:get`, `theme:set`, `theme:get-system`, `theme:system-changed` の契約を設計。
- `safeInvoke` / `safeOn` での公開APIを設計。
- watcher登録解除設計を定義。

### タスク3: 永続化/テスト設計（SubAgent C）

- `electron-store` キー設計（`theme.mode`）。
- 不正値フォールバック設計。
- 単体/統合/手動テスト設計。

### タスク4: 統合設計レビュー資料化（SubAgent D）

- A/B/C成果を統合し、Phase 3レビュー用パッケージを作る。

## 統合テスト連携

- UI操作からIPC呼び出し、永続化、再描画までの経路を統合シナリオとして定義する。
- system選択時のOSテーマ変更通知経路を統合シナリオとして定義する。

## 参照資料

| 参照資料        | パス                                                                         | 内容                         |
| --------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| Phase 1成果物   | `phase-1-requirements.md`                                                    | 要件基準                     |
| 設定画面仕様    | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`        | Settings UI構造              |
| テーマ状態管理  | `.claude/skills/aiworkflow-requirements/references/rag-desktop-state.md`     | layer分割とIPC               |
| IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | whitelist,型,検証            |
| エラー処理      | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | ストレージ取得フォールバック |
| 要件定義書      | `outputs/phase-1/requirements-definition.md`                                 | Phase 1 成果物               |
| 受け入れ基準    | `outputs/phase-1/acceptance-criteria.md`                                     | Phase 1 成果物               |
| スコープ定義    | `outputs/phase-1/scope-definition.md`                                        | Phase 1 成果物               |

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

| 成果物             | パス                                     | 内容                 |
| ------------------ | ---------------------------------------- | -------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | 層責務、データフロー |
| API仕様            | `outputs/phase-2/api-specification.md`   | IPC/Preload契約      |
| 状態遷移設計       | `outputs/phase-2/state-machine.md`       | theme mode解決規則   |

## 完了条件

- [ ] `themeMode`/`resolvedTheme` の状態遷移表が作成されている。
- [ ] IPC全チャネルのリクエスト/レスポンスが型付きで定義されている。
- [ ] `nativeTheme` 監視の登録/解除ライフサイクルが定義されている。
- [ ] `electron-store` の不正値入力時のフォールバックが定義されている。
- [ ] Phase 3レビュー入力が単一資料群に集約されている。

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

Phase 3
