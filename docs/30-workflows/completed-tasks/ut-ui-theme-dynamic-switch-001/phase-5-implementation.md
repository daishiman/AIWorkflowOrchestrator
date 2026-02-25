# Phase 5: 実装

## メタ情報

| 項目      | 値                             |
| --------- | ------------------------------ |
| Phase     | 5                              |
| タスクID  | UT-UI-THEME-DYNAMIC-SWITCH-001 |
| 機能名    | UT-UI-THEME-DYNAMIC-SWITCH-001 |
| 作成日    | 2026-02-25                     |
| 前提Phase | Phase 4                        |
| 後続Phase | Phase 6                        |

## 目的

RedテストをGreenへ反転させる実装手順を定義し、ファイル単位の変更境界を固定する。

## 実行タスク

- Renderer実装: settingsSliceとUIを実装する。
- Main/Preload実装: IPCハンドラとAPI公開を実装する。
- 永続化実装: 保存、復元、フォールバックを実装する。
- 統合自己レビュー: 変更境界と型整合を点検する。

### タスク1: Renderer実装（SubAgent A）

- `settingsSlice` に `themeMode` / `resolvedTheme` / setter を実装する。
- 個別セレクタを導入し、合成Hook利用を回避する。
- `ThemeProvider` と `ThemeSelector` を実装する。

### タスク2: Main/Preload実装（SubAgent B）

- テーマIPCハンドラを実装する。
- `nativeTheme` 監視登録と解除を実装する。
- Preload公開APIを `safeInvoke` / `safeOn` で実装する。

### タスク3: 永続化実装（SubAgent C）

- `electron-store` への保存/復元を実装する。
- 不正値時フォールバックを実装する。

### タスク4: 統合と自己レビュー（SubAgent D）

- 変更ファイル境界、依存追加、型差分を点検する。

## 統合テスト連携

- Phase 4で定義したRedケースを実装単位に紐付ける。
- Store、IPC、UIの3経路で最低1本ずつ統合検証を実施する計画を記載する。

## 参照資料

| 参照資料        | パス                                                                         | 内容                |
| --------------- | ---------------------------------------------------------------------------- | ------------------- |
| Phase 4成果物   | `phase-4-test-creation.md`                                                   | Red入力             |
| テーマ状態管理  | `.claude/skills/aiworkflow-requirements/references/rag-desktop-state.md`     | レイヤー責務        |
| IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | safeInvoke契約      |
| エラー処理      | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | storeフォールバック |
| Zustandガイド   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | 個別セレクタ運用    |
| テスト仕様書    | `outputs/phase-4/test-specification.md`                                      | Phase 4 成果物      |
| テストケース    | `outputs/phase-4/test-cases.md`                                              | Phase 4 成果物      |

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

- [ ] Green状態（Phase 4で作成した失敗テストが成功）を確認
- [ ] 仕様変更を伴う実装差分がある場合は設計差分記録を更新

## 成果物

| 成果物       | パス                                        | 内容         |
| ------------ | ------------------------------------------- | ------------ |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | 変更点と理由 |

## 完了条件

- [ ] Store/UI/IPC/Preload/永続化の変更点がファイル単位で定義されている。
- [ ] `system` モード時のOS追従処理が設計どおり定義されている。
- [ ] watcher解除処理が定義され、再登録時の重複防止が明記されている。
- [ ] 実装後に実行する検証コマンドが列挙されている。

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

Phase 6
