# Phase 1: スコープ境界

## メタ情報

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| Phase    | 1                                                        |
| 作成日   | 2026-03-08                                               |
| 作成者   | SubAgent-Lead-Sync                                       |

---

## 1. スコープ内

### 1.1 自動テスト

| 項目                              | 対象ファイル / ディレクトリ                                                       | 説明                                                          |
| --------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| SettingsView 統合テスト新規作成   | `apps/desktop/src/renderer/views/SettingsView/SettingsView.integration.test.tsx`  | real composition で SettingsView を検証する新規テストファイル |
| settings integration harness      | `apps/desktop/src/renderer/views/SettingsView/__tests__/settings-test-harness.ts` | store + electronAPI mock の一元管理ヘルパー                   |
| 既存 SettingsView.test.tsx の維持 | `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`              | 既存の unit test はそのまま残す（削除しない）                 |

### 1.2 手動テスト証跡

| 項目                         | 説明                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------- |
| manual evidence テンプレート | Phase 11 の手動テスト手順に settings shell 到達を必須条件として組み込む           |
| screenshot 要件              | 設定画面全体の表示、auth-mode セクション、ApiKeysSection を含むスクリーンショット |

### 1.3 回帰テスト行列

| 項目                         | 説明                                                     |
| ---------------------------- | -------------------------------------------------------- |
| 先行タスク AC マッピング行列 | task-05/06/07 の AC と統合テストケース ID の対応テーブル |

---

## 2. スコープ外

| 項目                            | 理由                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------- |
| E2E テスト（Playwright）の導入  | テスト基盤の刷新は本タスクの修正規模を超える。別途タスク化が必要                |
| visual regression テスト        | スクリーンショット比較基盤の構築は独立した検討が必要                            |
| 外部 test runner の刷新         | Vitest + happy-dom の構成を維持する。Jest 等への移行は対象外                    |
| SettingsView 以外の画面テスト   | AgentView, SkillCenterView 等の画面テスト改善は対象外                           |
| AccountSection の IPC mock 詳細 | AccountSection は Supabase Auth に依存し、IPC mock の詳細設計は別タスクで扱う   |
| 先行タスク 05/06/07 の実装      | 先行タスクの実装は各タスクの Phase 4-9 で行う。08 はその結果を検証する立場      |
| ThemeSelector / ProfileSection  | これらは既に real composition で SettingsView.test.tsx 内に含まれており追加不要 |

---

## 3. 並列/直列ポリシー

### 3.1 先行タスクとの関係

```
task-05 (authKey UI 整合)       ─┐
task-06 (apiKey 契約ガード)     ─┼─ 並列実行可能 ─→ task-08 (統合回帰カバレッジ) ─→ 直列実行
task-07 (persist ハードニング)  ─┘
```

- task-05/06/07 は互いに独立しており並列実行可能
- task-08 は task-05/06/07 の AC を束ねる後続タスクであり、05/06/07 の仕様確定後に直列で実行する
- 08 の Phase 4 以降は 05/06/07 の Phase 5（実装）完了後に開始することを推奨する

### 3.2 タスク内の Phase 並列化

| Phase 帯    | 実行方式         | 説明                                                       |
| ----------- | ---------------- | ---------------------------------------------------------- |
| Phase 1-3   | SubAgent 直列    | 要件固定 → 設計 → レビューゲートの順序を守る               |
| Phase 4-9   | SubAgent + Codex | SubAgent がテストケース定義と変更境界を固定、Codex が実装  |
| Phase 10-13 | SubAgent 直列    | 最終レビュー → 手動テスト → ドキュメント → PR の順序を守る |

### 3.3 commit / push / PR の制約

- commit / push / PR はユーザーの明示指示後に限る
- Phase 4-9 のコード変更は単一コミットにまとめることを推奨する

---

## 4. 変更影響範囲

### 4.1 変更対象ファイル（予定）

| 層    | ファイル                                                                          | 変更種別 |
| ----- | --------------------------------------------------------------------------------- | -------- |
| Tests | `apps/desktop/src/renderer/views/SettingsView/SettingsView.integration.test.tsx`  | 新規作成 |
| Tests | `apps/desktop/src/renderer/views/SettingsView/__tests__/settings-test-harness.ts` | 新規作成 |
| Docs  | `docs/30-workflows/08-.../outputs/phase-11/manual-test-template.md`               | 新規作成 |
| Docs  | `docs/30-workflows/08-.../outputs/phase-4/regression-matrix.md`                   | 新規作成 |

### 4.2 変更しないファイル

| 層       | ファイル                                                                   | 理由                             |
| -------- | -------------------------------------------------------------------------- | -------------------------------- |
| Tests    | `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`       | 既存 unit test は残す            |
| Renderer | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                   | プロダクションコードの変更は不要 |
| Renderer | `apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx` | プロダクションコードの変更は不要 |
| Renderer | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`  | プロダクションコードの変更は不要 |
| Renderer | `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx`  | プロダクションコードの変更は不要 |

---

## 5. リスク

| リスク                                                       | 影響度 | 軽減策                                                        |
| ------------------------------------------------------------ | ------ | ------------------------------------------------------------- |
| AccountSection の Supabase Auth 依存が統合テストを困難にする | 高     | AccountSection は store mock で認証状態を制御し、IPC は不使用 |
| ApiKeysSection の electronAPI mock が複雑になる              | 中     | settings-test-harness で mock factory パターンを適用          |
| happy-dom の制約で一部のイベントが動作しない                 | 中     | P39 準拠で fireEvent を使用。userEvent は使用しない           |
| 先行タスク 05/06/07 の実装が変更される可能性                 | 低     | AC レベルで追跡し、実装詳細には依存しない                     |
