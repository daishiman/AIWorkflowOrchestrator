# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 4                                          |
| タスクID   | UT-TASK-10A-B-003                          |
| 機能名     | task-10a-b-improvement-result-breakdown-ui |
| タスク名   | 改善結果内訳表示実装                       |
| 作成日     | 2026-03-05                                 |
| 前提Phase  | Phase 3                                    |
| 後続Phase  | Phase 5                                    |
| タスク種別 | completed（実装・テスト・文書化完了）      |

## 目的

結果内訳表示に対するユニット/コンポーネントテスト設計を作成し、Red基準を固定する。

## 背景

成功・失敗・スキップの組み合わせが多く、ケース漏れが起きやすいため先にテストマトリクスを固定する。

## 実行タスク

| Task     | 内容                 | 目的                                                   | 実行パターン |
| -------- | -------------------- | ------------------------------------------------------ | ------------ |
| Task 4-1 | テストマトリクス作成 | applied/skipped/errors の組み合わせケースを列挙する。  | seq          |
| Task 4-2 | 期待DOM定義          | 表示ラベル・件数・失敗理由の期待値を定義する。         | seq          |
| Task 4-3 | モック戦略定義       | ImprovementResult フィクスチャを再利用可能に定義する。 | seq          |

- タスク実行: 実行タスク表の項目を順に完了し、成果物へ反映する。

## Atent Team SubAgent分担（関心分離）

| SubAgent   | 関心ごと                 | 主成果物                              | 実行パターン |
| ---------- | ------------------------ | ------------------------------------- | ------------ |
| SubAgent-A | 正常系テスト設計         | test-case-matrix の正常系ブロック     | par          |
| SubAgent-B | 異常系/部分失敗設計      | test-case-matrix の異常系ブロック     | par          |
| SubAgent-C | 共通フィクスチャ整備方針 | test-specification のフィクスチャ方針 | seq          |

## 参照資料

| 参照資料                   | パス                                                                                          | 内容                            |
| -------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------- |
| 入力タスク指示書           | docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui.md               | Why/What/How と完了条件の正本   |
| 親ワークフロー             | docs/30-workflows/completed-tasks/skill-analysis-view/                                        | TASK-10A-B 本体仕様と成果物参照 |
| 前Phase仕様                | phase-3-design-review.md                                                                      | 前提条件と引き継ぎ事項          |
| Phase 10 指摘元            | docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-10/final-review-result.md | MINOR M3 の原文確認             |
| 依存Phase成果物（Phase 1） | outputs/phase-1/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 2） | outputs/phase-2/                                                                              | 依存関係に基づく参照成果物      |
| 依存Phase成果物（Phase 3） | outputs/phase-3/                                                                              | 依存関係に基づく参照成果物      |

## システム仕様抽出（aiworkflow-requirements）

| 仕様                   | パス                                                                            | 適用内容                                                |
| ---------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------- |
| 抽出ナビ               | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                  | テスト関連仕様の選定漏れを防ぐ                          |
| テスト品質             | .claude/skills/aiworkflow-requirements/references/quality-requirements.md       | カバレッジ目標と判定基準を確認する                      |
| コンポーネントテスト   | .claude/skills/aiworkflow-requirements/references/testing-component-patterns.md | UIテストパターンを確認する                              |
| アクセシビリティテスト | .claude/skills/aiworkflow-requirements/references/testing-accessibility.md      | a11y観点の試験項目を確認する                            |
| テストフィクスチャ     | .claude/skills/aiworkflow-requirements/references/testing-fixtures.md           | 再利用可能なデータ設計を確認する                        |
| 機能別UI               | .claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md   | 検証対象UI責務を再確認する                              |
| UI設計原則             | .claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md    | Apple HIG/WCAG観点の期待値を固定する                    |
| 型契約                 | .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md | `OperationResult<ImprovementResult>` の期待値を固定する |
| 状態管理               | .claude/skills/aiworkflow-requirements/references/arch-state-management.md      | 状態遷移テスト観点を固定する                            |
| IPC API                | .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md              | `skill:improve` 契約テスト観点を固定する                |
| API一覧                | .claude/skills/aiworkflow-requirements/references/api-endpoints.md              | IPC命名/戻り値整合のテスト観点を固定する                |
| セキュリティ境界       | .claude/skills/aiworkflow-requirements/references/security-api-electron.md      | Renderer-Preload-Main 境界の異常系観点を固定する        |
| IPCセキュリティ        | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md      | sender検証/sanitizeの異常系観点を固定する               |
| エラーハンドリング     | .claude/skills/aiworkflow-requirements/references/error-handling.md             | エラー表示の期待結果を固定する                          |

## 実行手順

1. 参照資料を確認し、入力条件と制約を確定する（seq）。
2. SubAgentごとの成果物草案を作成する（par）。
3. SubAgent成果物を統合し、欠落観点を解消する（seq）。
4. 完了条件チェックを実施し、次Phaseへ引き継ぐ（seq）。

## 統合テスト連携（Phase 1〜11は必須）

Phase 5 実装前にテストケースIDを固定し、Phase 11 手動試験と同一ID体系で突合できるようにする。

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

| 成果物                 | パス                                  | 内容                                |
| ---------------------- | ------------------------------------- | ----------------------------------- |
| テスト仕様             | outputs/phase-4/test-specification.md | 対象関数・対象DOM・期待値を定義する |
| テストケースマトリクス | outputs/phase-4/test-case-matrix.md   | ケース一覧と優先度を記録する        |

## 完了条件

- [ ] 正常系/異常系/境界値ケースが網羅されている。
- [ ] テストケースIDが一意で追跡可能である。
- [ ] フィクスチャ再利用戦略が明文化されている。
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
  docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui --phase 4
```

## 次のPhase

Phase 5: 実装（phase-5-implementation.md）
