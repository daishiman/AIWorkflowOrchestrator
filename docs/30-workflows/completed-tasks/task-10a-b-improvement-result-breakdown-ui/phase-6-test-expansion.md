# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 6                                          |
| タスクID   | UT-TASK-10A-B-003                          |
| 機能名     | task-10a-b-improvement-result-breakdown-ui |
| タスク名   | 改善結果内訳表示実装                       |
| 作成日     | 2026-03-05                                 |
| 前提Phase  | Phase 5                                    |
| 後続Phase  | Phase 7                                    |
| タスク種別 | completed（実装・テスト・文書化完了）      |

## 目的

初期テスト設計に不足するケースを補い、部分失敗シナリオの回帰リスクを下げる。

## 背景

Phase 4 の基本ケースだけでは複合状態（成功+失敗+スキップ混在）を十分に担保できないため、拡張計画が必要。

## 実行タスク

| Task     | 内容                   | 目的                                                       | 実行パターン |
| -------- | ---------------------- | ---------------------------------------------------------- | ------------ |
| Task 6-1 | 不足ケース抽出         | 組み合わせ爆発を抑えつつ未網羅ケースを抽出する。           | seq          |
| Task 6-2 | 回帰観点追加           | 既存機能（トースト・フィルタ）への副作用ケースを追加する。 | seq          |
| Task 6-3 | 失敗メッセージ検証追加 | error reason の多言語/長文ケースを追加する。               | seq          |

- タスク実行: 実行タスク表の項目を順に完了し、成果物へ反映する。

## Atent Team SubAgent分担（関心分離）

| SubAgent   | 関心ごと         | 主成果物                         | 実行パターン |
| ---------- | ---------------- | -------------------------------- | ------------ |
| SubAgent-A | 混在ケース追加   | test-expansion-plan のケース一覧 | par          |
| SubAgent-B | 副作用ケース追加 | regression-checklist             | par          |
| SubAgent-C | 統合整理         | test-expansion-plan 最終版       | seq          |

## 参照資料

| 参照資料                   | パス                                                                                          | 内容                            |
| -------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------- |
| 入力タスク指示書           | docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui.md               | Why/What/How と完了条件の正本   |
| 親ワークフロー             | docs/30-workflows/completed-tasks/skill-analysis-view/                                        | TASK-10A-B 本体仕様と成果物参照 |
| 前Phase仕様                | phase-5-implementation.md                                                                     | 前提条件と引き継ぎ事項          |
| Phase 10 指摘元            | docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-10/final-review-result.md | MINOR M3 の原文確認             |
| 依存Phase成果物（Phase 5） | outputs/phase-5/                                                                              | 依存関係に基づく参照成果物      |

## システム仕様抽出（aiworkflow-requirements）

| 仕様                   | パス                                                                            | 適用内容                                                    |
| ---------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 抽出ナビ               | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                  | テスト関連仕様の選定漏れを防ぐ                              |
| テスト品質             | .claude/skills/aiworkflow-requirements/references/quality-requirements.md       | カバレッジ目標と判定基準を確認する                          |
| コンポーネントテスト   | .claude/skills/aiworkflow-requirements/references/testing-component-patterns.md | UIテストパターンを確認する                                  |
| アクセシビリティテスト | .claude/skills/aiworkflow-requirements/references/testing-accessibility.md      | a11y観点の試験項目を確認する                                |
| テストフィクスチャ     | .claude/skills/aiworkflow-requirements/references/testing-fixtures.md           | 再利用可能なデータ設計を確認する                            |
| 機能別UI               | .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md   | 検証対象UI責務を再確認する                                  |
| UI設計原則             | .claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md    | Apple HIG/WCAG観点の追加ケースを抽出する                    |
| 型契約                 | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md | `OperationResult<ImprovementResult>` の境界ケースを抽出する |
| 状態管理               | .claude/skills/aiworkflow-requirements/references/arch-state-management.md      | 状態遷移の回帰ケースを抽出する                              |
| IPC API                | .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md              | `skill:improve` 契約回帰ケースを抽出する                    |
| API一覧                | .claude/skills/aiworkflow-requirements/references/api-endpoints.md              | IPC命名/戻り値の回帰ケースを抽出する                        |
| セキュリティ境界       | .claude/skills/aiworkflow-requirements/references/security-api-electron.md      | Renderer-Preload-Main 境界の回帰ケースを抽出する            |
| IPCセキュリティ        | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md      | sender検証/sanitizeの回帰ケースを抽出する                   |
| エラーハンドリング     | .claude/skills/aiworkflow-requirements/references/error-handling.md             | 失敗理由表示の回帰ケースを抽出する                          |

## 実行手順

1. 参照資料を確認し、入力条件と制約を確定する（seq）。
2. SubAgentごとの成果物草案を作成する（par）。
3. SubAgent成果物を統合し、欠落観点を解消する（seq）。
4. 完了条件チェックを実施し、次Phaseへ引き継ぐ（seq）。

## 統合テスト連携（Phase 1〜11は必須）

Phase 7 のカバレッジ確認で追跡しやすいよう、追加ケースに優先度と対象責務を紐付ける。

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

| 成果物             | パス                                    | 内容                               |
| ------------------ | --------------------------------------- | ---------------------------------- |
| テスト拡充計画     | outputs/phase-6/test-expansion-plan.md  | 追加ケースと優先度を定義する       |
| 回帰チェックリスト | outputs/phase-6/regression-checklist.md | 既存機能への影響確認項目を整理する |

## 完了条件

- [ ] 混在状態ケースが追加されている。
- [ ] 副作用テスト（既存機能影響）の観点が明記されている。
- [ ] Phase 7 で使う追跡IDが付与されている。
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
  docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui --phase 6
```

## 次のPhase

Phase 7: テストカバレッジ確認（phase-7-coverage-check.md）
