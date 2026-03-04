# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 値                                                                  |
| ---------- | ------------------------------------------------------------------- |
| タスク ID  | TASK-10A-D                                                          |
| Phase      | 11                                                                  |
| 機能名     | スキルライフサイクルUI統合                                          |
| 作成日     | 2026-03-03                                                          |
| 状態       | 未着手                                                              |
| 前提条件   | Phase 10（最終レビュー）が PASS または MINOR 判定で完了していること |
| 後続Phase  | Phase 12（ドキュメント更新）                                        |
| 成果物パス | `outputs/phase-11/`                                                 |

## 目的

自動テストでは検証できないユーザー体験・UI/UX・実環境動作を手動で確認する。SkillManagementPanel に統合された SkillAnalysisView と SkillCreateWizard が設計どおりに機能し、ChatPanel からのスキル管理パネルアクセス、ビュー切替（list/analysis/create）、agentSlice のスキル分析・改善・作成アクションが正しく動作することを検証する。

## 実行タスク

- 手動テストシナリオの実行: 全5シナリオ・17テストケースを順次実行
- 画面カバレッジマトリクスに基づくスクリーンショット撮影
- UI/UX品質評価（Apple HIG / WCAG 2.1 AA）
- DevTools 確認: コンソールエラーなし・パフォーマンスの検証

## 参照資料

| 資料名                  | パス                                                                                                         | 説明                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| Phase 11/12ガイド       | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                  | 手動テスト・ドキュメント作成ガイド |
| UIコンポーネント仕様    | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                      | 画面構造・状態表示の確認           |
| UI機能仕様              | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                              | 画面導線・機能単位の期待値確認     |
| UIデザインシステム      | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                                   | 色/タイポ/間隔の視覚整合確認       |
| IPC API契約             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                         | 操作時のAPI契約確認                |
| スキルIPCセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                    | 手動検証時の境界条件確認           |
| 設計書                  | `phase-2-design.md`                                                                                          | レイアウト/状態設計確認            |
| 実装サマリー            | `outputs/phase-5/implementation-result.md`                                                                   | 実装内容確認                       |
| テスト拡充結果          | `outputs/phase-6/test-expansion-result.md`                                                                   | 拡充テスト観点確認                 |
| カバレッジ結果          | `outputs/phase-7/coverage-result.md`                                                                         | カバレッジ達成確認                 |
| リファクタ結果          | `outputs/phase-8/refactoring-result.md`                                                                      | 品質改善内容確認                   |
| 最終レビュー結果        | `outputs/phase-10/final-review-result.md`                                                                    | Phase 10 判定結果                  |
| テスト仕様書            | `phase-4-test-creation.md`                                                                                   | テスト設計                         |
| 品質検証結果            | `outputs/phase-9/quality-verification-result.md`                                                             | Phase 9 品質レポート               |
| 既知の落とし穴          | `.claude/rules/06-known-pitfalls.md`                                                                         | P28: 手動テスト確認漏れ            |
| TASK-10A-A Phase 11結果 | `docs/30-workflows/completed-tasks/TASK-10A-A-SKILL-MANAGEMENT-PANEL/outputs/phase-11/manual-test-result.md` | list/editorビューの手動テスト参照  |

## 実行手順

### ステップ1: テスト環境準備

```bash
# 開発サーバー起動
cd apps/desktop
pnpm dev

# DevTools を開き、Console タブを監視
```

前提条件:

- スキルが3件以上インポート済みであること
- TASK-10A-A（SkillManagementPanel）、TASK-10A-B（SkillAnalysisView）、TASK-10A-C（SkillCreateWizard）の全変更がマージ済みであること

### ステップ2: テストシナリオ順次実行

以下のテストケーステーブルを TC-01 から TC-05 まで順に実行する。

### ステップ3: 結果記録

各テストケースの実行結果を `outputs/phase-11/manual-test-result.md` に記録する。

### ステップ4: スクリーンショット保存

画面カバレッジマトリクスに基づき、スクリーンショットを `outputs/phase-11/screenshots/` に保存する。

### ステップ5: 発見課題記録

手動テストで発見した課題を `outputs/phase-11/discovered-issues.md` に記録する。0件でもファイルを作成し「発見課題: 0件」と明記する。

---

## テストシナリオ

### TC-01: スキル管理パネルアクセス（ChatPanel統合）

| No  | テスト項目             | 前提条件                    | 操作手順                               | 期待結果                                                             | 実行結果 | 備考 |
| --- | ---------------------- | --------------------------- | -------------------------------------- | -------------------------------------------------------------------- | -------- | ---- |
| 1-1 | パネルアクセス         | ChatPanel が表示されている  | ChatPanel のスキル管理ボタンをクリック | SkillManagementPanel が表示される（listビュー）                      | -        | -    |
| 1-2 | スキル一覧の表示       | SkillManagementPanel 表示中 | スキル一覧の表示内容を確認             | インポート済みスキルが名前・説明文付きで一覧表示される               | -        | -    |
| 1-3 | ChatPanelへの復帰      | SkillManagementPanel 表示中 | 「戻る」ボタンをクリック               | ChatPanel に戻り、チャット履歴が保持されている                       | -        | -    |
| 1-4 | 再アクセス時の状態保持 | ChatPanelに戻った後         | 再度スキル管理ボタンをクリック         | SkillManagementPanel が listビューで表示される（前回の状態リセット） | -        | -    |

### TC-02: スキル分析フロー（SkillAnalysisView統合）

| No  | テスト項目     | 前提条件                   | 操作手順                               | 期待結果                                                               | 実行結果 | 備考 |
| --- | -------------- | -------------------------- | -------------------------------------- | ---------------------------------------------------------------------- | -------- | ---- |
| 2-1 | 分析画面表示   | スキル一覧が表示されている | 任意のスキルの「分析」ボタンをクリック | SkillAnalysisView が表示され、analysisビューに切り替わる               | -        | -    |
| 2-2 | 分析結果の表示 | SkillAnalysisView 表示中   | 分析結果の内容を確認                   | スコア（0-100）、カテゴリ、サジェスション、リスク情報が表示される      | -        | -    |
| 2-3 | 改善提案の適用 | 分析結果が表示されている   | 改善提案の「適用」ボタンをクリック     | agentSlice の applyImprovements アクションが実行され、結果が反映される | -        | -    |
| 2-4 | 一覧への復帰   | SkillAnalysisView 表示中   | 「戻る」ボタンをクリック               | listビューに戻り、スキル一覧が表示される                               | -        | -    |

### TC-03: スキル作成フロー（SkillCreateWizard統合）

| No  | テスト項目           | 前提条件                   | 操作手順                                 | 期待結果                                                        | 実行結果 | 備考 |
| --- | -------------------- | -------------------------- | ---------------------------------------- | --------------------------------------------------------------- | -------- | ---- |
| 3-1 | 作成画面表示         | スキル一覧が表示されている | 「新規作成」ボタンをクリック             | SkillCreateWizard が表示され、createビューに切り替わる          | -        | -    |
| 3-2 | ステップ1: Describe  | SkillCreateWizard 表示中   | スキル名と説明を入力し「次へ」をクリック | Configure ステップに進む                                        | -        | -    |
| 3-3 | ステップ2: Configure | Configure ステップ表示中   | 設定を入力し「次へ」をクリック           | Generate ステップに進む                                         | -        | -    |
| 3-4 | ステップ3: Generate  | Generate ステップ表示中    | 生成処理を確認                           | agentSlice の create アクションが実行され、生成結果が表示される | -        | -    |
| 3-5 | ステップ4: Complete  | Generate 完了後            | 完了画面の内容を確認                     | 作成完了メッセージが表示され、スキル一覧更新のオプションがある  | -        | -    |
| 3-6 | 一覧への復帰         | Complete ステップ表示中    | 「完了」または「戻る」ボタンをクリック   | listビューに戻り、新しく作成されたスキルが一覧に追加されている  | -        | -    |

### TC-04: ビュー切替の正常動作

| No  | テスト項目             | 前提条件             | 操作手順                                         | 期待結果                                           | 実行結果 | 備考 |
| --- | ---------------------- | -------------------- | ------------------------------------------------ | -------------------------------------------------- | -------- | ---- |
| 4-1 | list → analysis → list | listビュー表示中     | 分析→戻る の順で操作                             | listビューに正しく戻り、一覧が最新状態で表示される | -        | -    |
| 4-2 | list → create → list   | listビュー表示中     | 新規作成→キャンセルまたは完了→戻る の順で操作    | listビューに正しく戻り、一覧が最新状態で表示される | -        | -    |
| 4-3 | analysis後のcreate遷移 | analysisビュー表示中 | 「戻る」でlistに戻ってから「新規作成」をクリック | analysis→list→create の遷移が正常に動作する        | -        | -    |

### TC-05: エラーハンドリング

| No  | テスト項目                 | 前提条件                     | 操作手順                                               | 期待結果                                                   | 実行結果 | 備考 |
| --- | -------------------------- | ---------------------------- | ------------------------------------------------------ | ---------------------------------------------------------- | -------- | ---- |
| 5-1 | IPC通信失敗時              | スキル管理パネル表示中       | DevTools Network タブで IPC 通信を遅延/失敗させる      | ユーザーに分かりやすいエラーメッセージが表示される         | -        | -    |
| 5-2 | 分析対象スキル不存在       | スキル一覧が表示されている   | スキルを削除してから、削除前に取得した参照で分析を試行 | エラーメッセージが表示され、アプリがクラッシュしない       | -        | -    |
| 5-3 | 作成中のネットワークエラー | SkillCreateWizard Generate中 | 生成処理中にネットワーク接続を切断                     | エラーメッセージが表示され、リトライまたはキャンセルが可能 | -        | -    |
| 5-4 | コンソールエラー確認       | 全テストケース実行中         | DevTools Console タブを監視                            | エラーメッセージが0件                                      | -        | -    |

---

## DevTools 確認

| No  | 確認項目             | 操作手順                                                | 期待結果                   | 実行結果 | 備考 |
| --- | -------------------- | ------------------------------------------------------- | -------------------------- | -------- | ---- |
| D-1 | コンソールエラー     | DevTools Console タブを開いた状態で全テストケースを実行 | エラーメッセージが0件      | -        | -    |
| D-2 | コンソールワーニング | DevTools Console タブを確認                             | React 関連の Warning が0件 | -        | -    |
| D-3 | ネットワークエラー   | DevTools Network タブを開いた状態でスキル操作を実行     | 失敗リクエスト（赤）が0件  | -        | -    |

---

## 画面カバレッジマトリクス

### テストケース別証跡

| テストケース | 画面状態                  | スクリーンショット証跡                                         |
| ------------ | ------------------------- | -------------------------------------------------------------- |
| TC-01        | listビュー（デフォルト）  | `outputs/phase-11/screenshots/TC-01-skill-management-list.png` |
| TC-02        | analysisビュー            | `outputs/phase-11/screenshots/TC-02-analysis-view.png`         |
| TC-03        | createビュー              | `outputs/phase-11/screenshots/TC-03-create-view.png`           |
| TC-04        | list⇄analysis/create 復帰 | `outputs/phase-11/screenshots/TC-04-view-roundtrip-list.png`   |
| TC-05        | エラー状態（分析エラー）  | `outputs/phase-11/screenshots/TC-05-error-state.png`           |

### 対象コンポーネント

| コンポーネント       | 主要ビュー                                     | 関連テストケース |
| -------------------- | ---------------------------------------------- | ---------------- |
| SkillManagementPanel | listビュー、analysisビュー、createビュー       | TC-01, TC-04     |
| SkillAnalysisView    | 分析中ローディング、分析結果表示               | TC-02            |
| SkillCreateWizard    | Describe/Configure/Generate/Complete各ステップ | TC-03            |
| ChatPanel            | スキル管理ボタン表示、パネル切替               | TC-01            |

### UI状態マトリクス

| UI状態                           | コンポーネント       | 撮影優先度 | テストケース |
| -------------------------------- | -------------------- | ---------- | ------------ |
| listビュー（デフォルト）         | SkillManagementPanel | A          | TC-01        |
| analysisビュー表示               | SkillAnalysisView    | A          | TC-02        |
| 分析結果（スコア・カテゴリ表示） | SkillAnalysisView    | A          | TC-02        |
| createビュー Describe ステップ   | SkillCreateWizard    | A          | TC-03        |
| createビュー Configure ステップ  | SkillCreateWizard    | A          | TC-03        |
| createビュー Generate ステップ   | SkillCreateWizard    | A          | TC-03        |
| createビュー Complete ステップ   | SkillCreateWizard    | A          | TC-03        |
| ChatPanel スキル管理ボタン       | ChatPanel            | A          | TC-01        |
| ダークモード（listビュー）       | SkillManagementPanel | A          | -            |
| ダークモード（analysisビュー）   | SkillAnalysisView    | A          | -            |
| ダークモード（createビュー）     | SkillCreateWizard    | A          | -            |
| エラー状態（IPC通信失敗）        | SkillManagementPanel | B          | TC-05        |
| エラー状態（分析対象不存在）     | SkillAnalysisView    | B          | TC-05        |
| エラー状態（作成中ネットワーク） | SkillCreateWizard    | B          | TC-05        |
| 空状態（スキル0件）              | SkillManagementPanel | B          | -            |
| フォーカス状態（各ボタン）       | 全コンポーネント     | C          | -            |

### 撮影優先度の定義

| 優先度 | 分類         | 説明                                                  |
| ------ | ------------ | ----------------------------------------------------- |
| A      | 高価値・容易 | 各ビューの正常表示、ライト/ダークモード。必ず撮影する |
| B      | 高価値・困難 | エラー状態、空状態。再現条件の準備が必要              |
| C      | 低価値・容易 | フォーカス状態。時間があれば撮影                      |
| D      | 低価値・困難 | ホバー/アニメーション。撮影不要（N/A可）              |

---

## UI/UX品質評価

### Apple HIG準拠チェック

| 確認項目         | 基準                                                             | 確認対象                             | 結果 |
| ---------------- | ---------------------------------------------------------------- | ------------------------------------ | ---- |
| カラー（ライト） | 背景 `#FFFFFF`/`#F2F2F7`、アクセント `#007AFF`、エラー `#FF3B30` | 全コンポーネント                     | -    |
| カラー（ダーク） | 背景 `#000000`/`#1C1C1E`、アクセント `#0A84FF`、エラー `#FF453A` | 全コンポーネント                     | -    |
| スペーシング     | 8px グリッドに準拠                                               | パネル内余白、ボタン間隔、リスト行間 | -    |
| 角丸             | 8px～12px で統一                                                 | カード、ボタン、入力フィールド       | -    |
| 影               | カード: `0 1px 3px rgba(0,0,0,0.04)`                             | SkillManagementPanel のカード要素    | -    |
| フォント         | システムフォント（`-apple-system`, `BlinkMacSystemFont`）        | 全テキスト                           | -    |

### WCAG 2.1 AA チェック

| 確認項目         | 基準                                    | 確認対象                           | 結果 |
| ---------------- | --------------------------------------- | ---------------------------------- | ---- |
| コントラスト比   | 通常テキスト 4.5:1 以上、大テキスト 3:1 | 全テキスト要素（DevTools で計測）  | -    |
| キーボード操作   | 全機能にキーボードのみでアクセス可能    | Tab/Enter/Space/Escape の動作      | -    |
| フォーカスリング | フォーカスされた要素に視認可能なoutline | ボタン、入力フィールド、リスト項目 | -    |
| ARIAラベル       | インタラクティブ要素に適切なラベル      | ボタン、リンク、フォーム要素       | -    |
| 色のみの情報伝達 | 色だけで情報を伝えていない              | ステータス表示、エラー表示         | -    |

### レスポンシブ対応

| 確認項目       | 基準                           | 確認対象             | 結果 |
| -------------- | ------------------------------ | -------------------- | ---- |
| パネル幅変更時 | レイアウト崩れなし             | SkillManagementPanel | -    |
| 長いスキル名   | テキストが規定文字数で省略表示 | SkillListItem        | -    |
| ウィザード幅   | 各ステップのフォームが収まる   | SkillCreateWizard    | -    |

---

## 統合テスト連携

- 仕様契約確認: `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` と `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` を参照し、analyze/applyImprovements/autoImprove/create アクションの入力・戻り値契約を一致させる。
- セキュリティ観点: `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` と `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` の sender 検証・入力検証方針を適用する。
- テスト接続: Phase 4/6/7 のテスト成果物を Phase 10/11 の判定基準へ接続し、差分が出た場合は Phase 2（設計）または Phase 5（実装）へ戻して再検証する。
- 状態管理確認: agentSlice に追加した analyze, applyImprovements, autoImprove, create アクションの個別セレクタ（P31対策）が正しく動作することを手動でも確認する。

## 成果物

| 成果物             | パス                                     | 必須 | 説明                                 |
| ------------------ | ---------------------------------------- | ---- | ------------------------------------ |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md` | ✅   | 全5シナリオ・17テストケースの結果    |
| スクリーンショット | `outputs/phase-11/screenshots/`          | ✅   | 画面カバレッジマトリクスに基づく証跡 |
| 発見課題リスト     | `outputs/phase-11/discovered-issues.md`  | ✅   | 発見した問題の記録（0件でも必須）    |

## 完了条件

- [ ] 全5シナリオ・17テストケース（TC-01〜TC-05）の実行が完了している
- [ ] 各テストケースの結果（PASS/FAIL）が `manual-test-result.md` に記録されている
- [ ] DevTools 確認（D-1〜D-3）が完了している
- [ ] 画面カバレッジマトリクスの優先度A項目のスクリーンショットが `outputs/phase-11/screenshots/` に保存されている
- [ ] UI/UX品質評価（Apple HIG、WCAG 2.1 AA、レスポンシブ）の全項目が確認されている
- [ ] 発見した問題が `discovered-issues.md` に記録されている（0件の場合も「発見課題: 0件」と明記）
- [ ] FAIL 判定のテストケースがある場合、修正方針が `discovered-issues.md` に記載されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-10A-D-SKILL-LIFECYCLE-UI-INTEGRATION --phase 11
```

## 次のPhase

Phase 12: ドキュメント更新
