# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 11                                         |
| タスクID   | UT-TASK-10A-B-003                          |
| 機能名     | task-10a-b-improvement-result-breakdown-ui |
| タスク名   | 改善結果内訳表示実装                       |
| 作成日     | 2026-03-05                                 |
| 前提Phase  | Phase 10                                   |
| 後続Phase  | Phase 12                                   |
| タスク種別 | completed（実装・テスト・文書化完了）      |

## 目的

画面上で結果内訳が読み取れることをユーザー視点で検証する手動試験計画を作成する。

## 背景

結果内訳表示は視覚表現の妥当性が重要で、ユニットテストだけでは説明可能性を担保できない。

## 実行タスク

| Task      | 内容             | 目的                                                      | 実行パターン |
| --------- | ---------------- | --------------------------------------------------------- | ------------ |
| Task 11-1 | 手動シナリオ定義 | 成功のみ/失敗含む/スキップ含む/混在のシナリオを定義する。 | seq          |
| Task 11-2 | 画面証跡計画     | スクリーンショット取得対象と判定項目を定義する。          | seq          |
| Task 11-3 | 操作性確認観点   | キーボード操作・読み上げ・色依存排除観点を定義する。      | seq          |

- タスク実行: 実行タスク表の項目を順に完了し、成果物へ反映する。

## Atent Team SubAgent分担（関心分離）

| SubAgent   | 関心ごと         | 主成果物                               | 実行パターン |
| ---------- | ---------------- | -------------------------------------- | ------------ |
| SubAgent-A | 操作シナリオ設計 | manual-test-scenarios                  | par          |
| SubAgent-B | 証跡計画設計     | screenshot-plan                        | par          |
| SubAgent-C | 合否統合         | manual-test-result / discovered-issues | seq          |

## 参照資料

| 参照資料                    | パス                                                                                          | 内容                            |
| --------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------- |
| 入力タスク指示書            | docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui.md               | Why/What/How と完了条件の正本   |
| 親ワークフロー              | docs/30-workflows/completed-tasks/skill-analysis-view/                                        | TASK-10A-B 本体仕様と成果物参照 |
| 前Phase仕様                 | phase-10-final-review.md                                                                      | 前提条件と引き継ぎ事項          |
| Phase 10 指摘元             | docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-10/final-review-result.md | MINOR M3 の原文確認             |
| 依存Phase成果物（Phase 1）  | outputs/phase-1/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 2）  | outputs/phase-2/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 5）  | outputs/phase-5/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 6）  | outputs/phase-6/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 7）  | outputs/phase-7/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 8）  | outputs/phase-8/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 9）  | outputs/phase-9/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 10） | outputs/phase-10/                                                                             | 依存関係に基づく参照成果物      |

## システム仕様抽出（aiworkflow-requirements）

| 仕様               | パス                                                                            | 適用内容                                         |
| ------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------ |
| 抽出ナビ           | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                  | 対象仕様の選定漏れを防ぐ                         |
| 機能別UI           | .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md   | SkillAnalysisView の責務と未タスク背景を確認する |
| UIコンポーネント   | .claude/skills/aiworkflow-requirements/references/ui-ux-components.md           | 表示階層とUI整合を確認する                       |
| UI設計原則         | .claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md    | Apple HIG/WCAG観点で手動試験観点を定義する       |
| デザインシステム   | .claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md        | トークン整合の目視確認観点を定義する             |
| UIアーキテクチャ   | .claude/skills/aiworkflow-requirements/references/arch-ui-components.md         | 表示責務境界の試験観点を定義する                 |
| 型契約             | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md | ImprovementResult 契約を確認する                 |
| 状態管理           | .claude/skills/aiworkflow-requirements/references/arch-state-management.md      | agentSlice の分析/改善状態を確認する             |
| IPC API            | .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md              | skill:improve 契約を確認する                     |
| API一覧            | .claude/skills/aiworkflow-requirements/references/api-endpoints.md              | IPC命名規則・契約整合の試験観点を定義する        |
| セキュリティ境界   | .claude/skills/aiworkflow-requirements/references/security-api-electron.md      | Renderer-Preload-Main 境界を確認する             |
| IPCセキュリティ    | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md      | sender検証・sanitize方針の試験観点を定義する     |
| エラーハンドリング | .claude/skills/aiworkflow-requirements/references/error-handling.md             | 失敗理由表示時のエラー表現を整合させる           |
| a11yテスト指針     | .claude/skills/aiworkflow-requirements/references/testing-accessibility.md      | キーボード/読み上げ試験観点を定義する            |

## テストケース

| テストケース | 状態                         | 目的                                                   |
| ------------ | ---------------------------- | ------------------------------------------------------ |
| TC-11-01     | 初期表示（適用前）           | 分析結果カードと提案リストの初期レイアウトを確認する   |
| TC-11-02     | mixed（成功/スキップ/失敗）  | 3区分表示と件数バッジの同時表示を確認する              |
| TC-11-03     | success only（ライトテーマ） | 成功のみ表示時の情報密度とライトテーマ視認性を確認する |
| TC-11-04     | skipped only                 | スキップ時の文言と空領域崩れがないことを確認する       |
| TC-11-05     | error only（モバイル）       | 390px幅で失敗理由と操作導線の可読性を確認する          |

## 画面カバレッジマトリクス

| テストケース | 表示状態                    | テーマ/デバイス      | 証跡                                                                  |
| ------------ | --------------------------- | -------------------- | --------------------------------------------------------------------- |
| TC-11-01     | 初期表示（適用前）          | Dark / Desktop       | `outputs/phase-11/screenshots/TC-11-01-default-before-apply-dark.png` |
| TC-11-02     | mixed（成功/スキップ/失敗） | Dark / Desktop       | `outputs/phase-11/screenshots/TC-11-02-result-mixed-dark.png`         |
| TC-11-03     | success only                | Light / Desktop      | `outputs/phase-11/screenshots/TC-11-03-result-success-light.png`      |
| TC-11-04     | skipped only                | Dark / Desktop       | `outputs/phase-11/screenshots/TC-11-04-result-skipped-dark.png`       |
| TC-11-05     | error only                  | Dark / Mobile(390px) | `outputs/phase-11/screenshots/TC-11-05-result-error-mobile-dark.png`  |

## 実行手順

1. 参照資料を確認し、入力条件と制約を確定する（seq）。
2. SubAgentごとの成果物草案を作成する（par）。
3. SubAgent成果物を統合し、欠落観点を解消する（seq）。
4. 完了条件チェックを実施し、次Phaseへ引き継ぐ（seq）。

## 統合テスト連携（Phase 1〜11は必須）

Phase 10 の最終レビュー項目と1対1で対応する試験ケースIDを割り当て、判定根拠を追跡可能にする。

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                     | 仕様参照先                                  |
| ------------------ | -------------------------------------------- | ------------------------------------------- |
| セキュリティ       | 入力検証・境界防御・エラー露出制御を扱う場合 | aiworkflow-requirements: security-\*.md     |
| UI/UX              | 表示構造・情報設計・操作性を扱う場合         | aiworkflow-requirements: ui-ux-\*.md        |
| アーキテクチャ     | 責務分離・状態遷移・依存関係を扱う場合       | aiworkflow-requirements: architecture-\*.md |
| API設計            | IPC契約・レスポンス形式を扱う場合            | aiworkflow-requirements: api-\*.md          |
| データ整合性       | 型契約・状態整合を扱う場合                   | aiworkflow-requirements: interfaces-\*.md   |
| エラーハンドリング | 失敗理由表示・回復導線を扱う場合             | aiworkflow-requirements: error-handling.md  |
| アクセシビリティ   | 読み上げ・キーボード操作を扱う場合           | aiworkflow-requirements: ui-ux-\*.md        |

## 成果物

| 成果物             | パス                                      | 内容                                       |
| ------------------ | ----------------------------------------- | ------------------------------------------ |
| 手動テストシナリオ | outputs/phase-11/manual-test-scenarios.md | 操作手順と期待結果を定義する               |
| 画面証跡計画       | outputs/phase-11/screenshot-plan.md       | 必須スクリーンショットと確認観点を整理する |
| 手動テスト結果     | outputs/phase-11/manual-test-result.md    | テストケース別の結果と証跡紐付けを記録する |
| 発見課題           | outputs/phase-11/discovered-issues.md     | 重要度付きの発見課題を記録する             |

## 完了条件

- [ ] 主要4状態のシナリオが定義されている。
- [ ] スクリーンショット証跡の取得対象が明記されている。
- [ ] アクセシビリティ観点が試験項目に含まれている。
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料確認
2. 実行タスク実施
3. SubAgent成果物統合
4. 成果物配置確認
5. 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui --phase 11
```

## 次のPhase

Phase 12: ドキュメント更新（phase-12-documentation.md）
