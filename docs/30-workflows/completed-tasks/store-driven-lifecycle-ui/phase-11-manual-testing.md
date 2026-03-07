# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 11                                    |
| 機能名     | store-driven-lifecycle-ui             |
| タスクID   | TASK-10A-F                            |
| タスク名   | スキルライフサイクルUIのStore駆動統合 |
| 作成日     | 2026-03-07                            |
| ステータス | 未実施                                |

## 目的

SkillCreateWizard と SkillAnalysisView の直接 `window.electronAPI` 呼び出しを Zustand agentSlice 経由に統一した後、UIテスト・E2Eシナリオを手動で実行し、Store駆動への移行が正常に動作することを検証する。

## 修正対象ファイル

| ファイル                                                               | 変更内容                                                            |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`     | `window.electronAPI` 直接呼び出しを agentSlice アクション経由に変更 |
| `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` | `window.electronAPI` 直接呼び出しを agentSlice アクション経由に変更 |
| `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`  | Store駆動に統一された API 呼び出しパターンへの整合                  |

## 実行タスク

- 手動テスト実行: 7つのテストケース（TC-11-01〜TC-11-07）を手動で実行し、Store駆動統合の正常動作を検証する
- スクリーンショット撮影: 各テストケースの実行結果をスクリーンショットで証跡化する
- Store状態確認: React DevToolsでagentSliceの状態遷移が正しいことを確認する
- 旧API未使用確認: DevTools Consoleで直接IPC呼び出しが発生していないことを確認する

## テストケーステーブル

| TC-ID    | テスト内容               | 前提条件                                    | 操作手順                                                                                                                           | 期待結果                                                                                                                                                           | 証跡       |
| -------- | ------------------------ | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| TC-11-01 | スキル作成ウィザード完了 | SkillCenter画面が表示されている             | 1.「新規作成」ボタンをクリック 2.スキル名を入力 3.設定項目を入力 4.「生成」ボタンをクリック 5.完了画面を確認                       | 1.ウィザードダイアログが表示される 2.入力フィールドに値が反映される 3.設定が保存される 4.loading状態→success状態に遷移する 5.スキル一覧に新規スキルが追加される    | SCREENSHOT |
| TC-11-02 | スキル分析実行           | スキルが1件以上存在し、対象スキルが選択済み | 1.「分析」ボタンをクリック 2.分析結果の表示を待つ 3.スコア表示を確認                                                               | 1.loading スピナーが表示される 2.分析結果パネルが表示される 3.スコアが数値で表示される                                                                             | SCREENSHOT |
| TC-11-03 | 改善提案の適用           | TC-11-02 が完了し分析結果が表示されている   | 1.改善提案リストから1件を選択 2.「適用」ボタンをクリック 3.適用結果を確認                                                          | 1.選択した提案がハイライトされる 2.loading状態→success状態に遷移する 3.改善結果がパネルに表示される                                                                | SCREENSHOT |
| TC-11-04 | 自動改善の実行           | スキルが1件以上存在し、対象スキルが選択済み | 1.「自動改善」ボタンをクリック 2.改善結果を確認                                                                                    | 1.loading状態→success状態に遷移する 2.改善結果が表示され、変更差分が確認できる                                                                                     | SCREENSHOT |
| TC-11-05 | エラー時のUI表示         | DevTools でネットワークをオフラインに設定   | 1.スキル作成ウィザードで「生成」ボタンをクリック 2.エラー表示を確認 3.ネットワーク復旧後にリトライ操作                             | 1.error状態に遷移しエラーメッセージが赤色で表示される 2.エラーメッセージにユーザー向けの説明が含まれる 3.リトライ後にsuccess状態に遷移する                         | SCREENSHOT |
| TC-11-06 | Store状態の一貫性確認    | DevTools の React DevTools タブを開いている | 1.TC-11-01 を実行 2.React DevTools で agentSlice の状態を確認 3.`window.electronAPI` への直接呼び出しが存在しないことを確認        | 1.スキル作成が正常完了する 2.agentSlice 内に作成されたスキル情報が反映されている 3.DevTools Console で `window.electronAPI.skill` の直接呼び出しログが出力されない | SCREENSHOT |
| TC-11-07 | 旧API未使用の確認        | DevTools Console を開いている               | 1.Console に `window.electronAPI.skill.analyze` と入力し関数の存在を確認 2.実際の分析操作を実行 3.Console のネットワークログを確認 | 1.関数自体は Preload 経由で存在する 2.UI操作時に Store アクション経由で呼び出される 3.直接呼び出しのログが出力されない                                             | SCREENSHOT |

## 画面カバレッジマトリクス

| 画面 / コンポーネント    | TC-11-01 | TC-11-02 | TC-11-03 | TC-11-04 | TC-11-05 | TC-11-06 | TC-11-07 |
| ------------------------ | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| SkillCreateWizard        | o        |          |          |          | o        | o        |          |
| SkillAnalysisView        |          | o        | o        | o        |          |          | o        |
| SkillManagementPanel     | o        | o        |          |          |          |          |          |
| agentSlice（Store状態）  | o        | o        | o        | o        | o        | o        | o        |
| エラー表示コンポーネント |          |          |          |          | o        |          |          |

## 証跡配置ルール

| 証跡種類           | 配置先                                   | ファイル命名規則                                       |
| ------------------ | ---------------------------------------- | ------------------------------------------------------ |
| スクリーンショット | `outputs/phase-11/screenshots/`          | `TC-11-XX-step-YY.png`（XX=ケースID, YY=ステップ番号） |
| コンソールログ     | `outputs/phase-11/screenshots/`          | `TC-11-XX-console.png`                                 |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md` | -                                                      |

## 参照資料

### 実装・証跡

| 資料名               | パス                                                                   | 用途                          |
| -------------------- | ---------------------------------------------------------------------- | ----------------------------- |
| SkillCreateWizard    | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`     | Store駆動統合の主対象         |
| useSkillAnalysis     | `apps/desktop/src/renderer/components/skill/hooks/useSkillAnalysis.ts` | 分析ロジックのStore駆動化対象 |
| SkillManagementPanel | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`  | スキル管理画面の統合確認先    |
| agentSlice           | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                 | Store アクション定義の確認先  |

### システム仕様

| 資料名                     | パス                                                                              | 用途                                     |
| -------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------- |
| phase templates            | `.claude/skills/task-specification-creator/references/phase-templates.md`         | Phase 文書の構造を揃える                 |
| arch-state-management      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | Store 構成と agentSlice の設計を確認する |
| task-workflow-phases       | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`       | Phase 11 で残す証跡の粒度を確認する      |
| testing-component-patterns | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | component / integration の境界を確認する |
| ui-ux-design-principles    | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`    | UX 検証の基準を確認する                  |

### 前提Phase成果物

| 資料名          | パス                | 用途                           |
| --------------- | ------------------- | ------------------------------ |
| Phase 1 成果物  | `outputs/phase-1/`  | 要件定義の出力を参照する       |
| Phase 2 成果物  | `outputs/phase-2/`  | 設計の出力を参照する           |
| Phase 5 成果物  | `outputs/phase-5/`  | 実装の出力を参照する           |
| Phase 6 成果物  | `outputs/phase-6/`  | テスト拡充の出力を参照する     |
| Phase 7 成果物  | `outputs/phase-7/`  | カバレッジ確認の出力を参照する |
| Phase 8 成果物  | `outputs/phase-8/`  | リファクタリング出力を参照する |
| Phase 9 成果物  | `outputs/phase-9/`  | 品質検証の出力を参照する       |
| Phase 10 成果物 | `outputs/phase-10/` | 最終レビューの出力を参照する   |

## 実行手順

1. `pnpm --filter @repo/desktop dev` でデスクトップアプリを起動する
2. SkillCenter 画面に遷移し、TC-11-01 からTC-11-05 を順番に実行する
3. 各テストケースの操作手順に従い、期待結果と実際の結果を比較する
4. DevTools を開き、TC-11-06 と TC-11-07 を実行して Store 状態と API 呼び出しパターンを確認する
5. 各ステップのスクリーンショットを証跡配置ルールに従って保存する
6. `outputs/phase-11/manual-test-result.md` に全テストケースの結果を記録する

## 統合テスト連携

- TC-11-01 〜 TC-11-05: UI 操作の機能正当性を確認し、Phase 5 の実装が仕様どおりに動作することを証明する
- TC-11-06: Store 状態の一貫性を確認し、直接 `window.electronAPI` 呼び出しが排除されていることを証明する
- TC-11-07: Preload API 自体は存在するが、UI 操作時には Store アクション経由で呼び出されることを証明する

## 成果物

| 成果物             | パス                                     | 説明                           |
| ------------------ | ---------------------------------------- | ------------------------------ |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md` | 全テストケースの実行結果と判定 |
| スクリーンショット | `outputs/phase-11/screenshots/`          | 各テストケースの証跡画像       |

## 完了条件

- [ ] TC-11-01 〜 TC-11-07 の全テストケースを実行し、結果を記録している
- [ ] 全テストケースの期待結果と実際の結果が一致している
- [ ] 証跡（スクリーンショット）が `outputs/phase-11/screenshots/` に TC-ID 対応で配置されている
- [ ] `outputs/phase-11/manual-test-result.md` に全テストケースの結果が記録されている
- [ ] Store 経由の呼び出しパターンが確認され、直接 `window.electronAPI` 呼び出しが排除されていることが証明されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. デスクトップアプリの起動と画面遷移
3. TC-11-01 〜 TC-11-05 の実行と証跡取得
4. TC-11-06 〜 TC-11-07 の実行と証跡取得
5. 手動テスト結果の記録
6. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で完了内容を実行記録へ残している

## 次のPhase

Phase 12: ドキュメント更新
