# Phase 11: 手動検証（仕様書レビュー） - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 11                                 |
| Phase名    | 手動検証（仕様書レビュー）         |
| 前提Phase  | Phase 10（最終レビュー）           |
| 後続Phase  | Phase 12（ドキュメント更新）       |
| ステータス | 未実施                             |
| 作成日     | 2026-02-24                         |
| タスクID   | UT-IPC-DATA-FLOW-TYPE-GAPS-001     |
| 機能名     | データフロー型ギャップ解消         |
| タスク種別 | 仕様書修正のみ（実コード変更なし） |

---

## 目的

自動検証（grep等）では確認できない仕様書の品質を手動でレビューする。特に、型定義の意味的な整合性、IPCデータフローの論理的な正確性、後続実装者が正しく理解できる記述になっているかを確認する。

## 背景

本タスクは実コード変更を伴わない仕様書修正タスクであるため、手動テストは「Electron環境での動作確認」ではなく「仕様書の品質レビュー」として実施する。修正した7つの仕様書について、型整合性・データフロー追跡・後続実装者視点の3軸でレビューを行う。

---

## 修正対象ファイル（7つ）

すべて `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/` 配下:

| No  | ファイル名                               | 対応Gap     |
| --- | ---------------------------------------- | ----------- |
| 1   | task-020b-task-9a-skill-editor.md        | Gap 6       |
| 2   | task-022-task-9f-skill-share.md          | Gap 1, 4    |
| 3   | task-023a-task-9g-skill-schedule.md      | Gap 1       |
| 4   | task-023b-task-9h-skill-debug.md         | Gap 1, 2, 5 |
| 5   | task-023d-task-9j-skill-analytics.md     | Gap 1       |
| 6   | task-030-ui-05-skill-center-view.md      | Gap 3, 4    |
| 7   | task-031b-ui-05b-skill-advanced-views.md | Gap 2, 5    |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 型整合性レビュー

**目的**: 修正した型定義が仕様書間で統一されていることを確認する

**実行手順**:

1. Gap 1（Date型シリアライズ）: task-9f, 9g, 9j の3ファイルで Date 型のIPC境界における型変換注記を比較し、同一フォーマット（ISO 8601文字列）で統一されていることを確認する
2. Gap 2（DebugSession.status）: task-9h と 05B の2ファイルで `DebugSession.status` の値セットを比較し、`'idle' | 'running' | 'paused' | 'completed' | 'error'` で一致していることを確認する
3. Gap 6（IPC引数形式）: task-9a の全 `safeInvoke` コード例を確認し、positional形式（個別引数）が0箇所であることを確認する

**テストケース**:

| No  | カテゴリ | テスト項目                                              | 前提条件    | 操作手順                            | 期待結果                                                   | 実行結果   | 備考  |
| --- | -------- | ------------------------------------------------------- | ----------- | ----------------------------------- | ---------------------------------------------------------- | ---------- | ----- |
| 1   | 型整合性 | Date型シリアライズ方針がtask-9f, 9g, 9jで統一されている | Phase 5完了 | 3ファイルのDate型注記を比較         | 同一フォーマット（ISO 8601文字列）で記載                   | {{RESULT}} | Gap 1 |
| 2   | 型整合性 | DebugSession.statusの値セットが9hと05Bで一致            | Phase 5完了 | 両ファイルのstatus型を比較          | `'idle'\|'running'\|'paused'\|'completed'\|'error'` で一致 | {{RESULT}} | Gap 2 |
| 3   | IPC引数  | task-9aの全IPC呼び出しがオブジェクト形式                | Phase 5完了 | task-9aのsafeInvokeコード例を全確認 | positional形式が0箇所                                      | {{RESULT}} | Gap 6 |

**期待される成果物**:

- `outputs/phase-11/type-consistency-review.md`

---

### タスク2: データフロー追跡レビュー

**目的**: IPCデータフローを手動で追跡し、型変換ポイントが正しいか確認する

**実行手順**:

1. Gap 3（DocPreview onExport）: 05 の `onExport` 定義からIPCフロー図を追跡し、Renderer → `skill:docs:export` → Main → ファイル出力の経路が明確に記載されていることを確認する
2. Gap 4（ExportResult → UI コールバック変換）: 05 の `ExportSkillDialog` 変換ロジック注記を確認し、success/failure の両ケースが記載されていることを確認する
3. Gap 5（safeOn購読パターン）: 05B の `DebugPanel` における `useEffect` + cleanup パターンを確認し、React StrictMode対策（P5）が明記されていることを確認する

**テストケース**:

| No  | カテゴリ     | テスト項目                                   | 前提条件    | 操作手順                                         | 期待結果                                           | 実行結果   | 備考  |
| --- | ------------ | -------------------------------------------- | ----------- | ------------------------------------------------ | -------------------------------------------------- | ---------- | ----- |
| 4   | データフロー | DocPreview onExportのデータフローが明確      | Phase 5完了 | 05のonExport定義とIPCフロー図を追跡              | Renderer→skill:docs:export→Main→ファイル出力が明確 | {{RESULT}} | Gap 3 |
| 5   | 変換ロジック | ExportResultからUIコールバックへの変換が明確 | Phase 5完了 | 05のExportSkillDialog変換ロジック注記を確認      | success/failureの両ケースが記載                    | {{RESULT}} | Gap 4 |
| 6   | イベント購読 | safeOnパターンがP5対策を含む                 | Phase 5完了 | 05BのDebugPanelのuseEffect+cleanupパターンを確認 | StrictMode対策（リスナー解除）が明記               | {{RESULT}} | Gap 5 |

**期待される成果物**:

- `outputs/phase-11/data-flow-trace-review.md`

---

### タスク3: 後続実装者視点レビュー

**目的**: 修正後の仕様書を初めて読む実装者の視点でレビューし、曖昧な箇所がないか確認する

**実行手順**:

1. 修正した7つの仕様書全てを「初見の実装者」として通読する
2. 曖昧語（条件未定義語・任意判断語・列挙省略語）が残っていないか確認する（02-code-quality.md コーディング規約準拠）
3. 仕様書間の参照リンクが正しいか確認する
4. P44/P45再発リスクが排除されているか確認する

**テストケース**:

| No  | カテゴリ    | テスト項目                           | 前提条件    | 操作手順                                   | 期待結果                             | 実行結果   | 備考  |
| --- | ----------- | ------------------------------------ | ----------- | ------------------------------------------ | ------------------------------------ | ---------- | ----- |
| 7   | 相互参照    | 修正した仕様書間の参照リンクが正しい | Phase 5完了 | 各仕様書の参照セクションを確認             | リンク先が存在し正しい内容を参照     | {{RESULT}} | 全体  |
| 8   | 実装者視点  | 後続実装者が仕様書を正しく理解できる | Phase 5完了 | 初見で仕様書を読み、曖昧な箇所がないか確認 | 曖昧表現なし                         | {{RESULT}} | 全体  |
| 9   | Pitfall対策 | P44/P45再発リスクが排除されている    | Phase 5完了 | IPC引数形式と命名のセマンティクスを確認    | positional形式なし、命名ドリフトなし | {{RESULT}} | Gap 6 |

**期待される成果物**:

- `outputs/phase-11/implementer-perspective-review.md`

---

### タスク4: 発見課題の記録

**目的**: レビュー中に発見した課題を記録する

**実行手順**:

1. 各タスクで発見した問題を記録する
2. 問題の重要度を分類する
3. 対応方針を決定する

**課題分類**:

| 重要度   | 基準                                 | 対応               |
| -------- | ------------------------------------ | ------------------ |
| 致命的   | 型定義の矛盾により後続実装が不可能   | Phase 5 へ戻り修正 |
| 重大     | データフローに論理的な欠陥がある     | 本フェーズで修正   |
| 軽微     | 表現の改善が望ましいが実装に支障なし | Phase 12 で記録    |
| 改善提案 | より良くするためのアイデア           | Phase 12 で記録    |

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`

---

## 参照資料

| 参照資料                    | パス                                                                                                                     | 内容                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| Phase 2 設計書              | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-2-design.md`                                     | 設計根拠             |
| Phase 5 修正結果            | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-5-implementation.md`                             | 反映内容             |
| Phase 6 整合性検証          | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-6-test-expansion.md`                             | 横断整合             |
| Phase 7 網羅性確認          | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-7-coverage-check.md`                             | 網羅性               |
| Phase 8 品質改善            | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-8-refactoring.md`                                | 品質改善内容         |
| Phase 9 品質保証            | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-9-quality-assurance.md`                          | 品質保証結果         |
| 修正対象仕様書（7ファイル） | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/`                             | 修正対象             |
| Phase 1 抽出成果物          | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-1/aiworkflow-requirements-extraction.md` | 要件抽出根拠         |
| IPC API 仕様                | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                     | IPC 契約             |
| Skill IF 仕様               | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                        | safeInvoke/safeOn    |
| IPC セキュリティ仕様        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                             | P44/P45/P42          |
| Skill IPC セキュリティ仕様  | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                                | P5/P42               |
| P44（IPC不整合）            | `.claude/rules/06-known-pitfalls.md#P44`                                                                                 | skill:import/remove  |
| P45（命名ドリフト）         | `.claude/rules/06-known-pitfalls.md#P45`                                                                                 | skillId vs skillName |
| P5（リスナー二重登録）      | `.claude/rules/06-known-pitfalls.md#P5`                                                                                  | StrictMode対策       |
| Phase 10 レビュー結果       | `outputs/phase-10/final-review-result.md`                                                                                | 最終レビュー         |

---

## 統合テスト連携

| 連携観点           | 実施内容                                                                    | 検証先                          |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------- |
| IPC 契約整合       | Renderer → Preload → Main の引数型/戻り値型を突合し、契約ドリフトを防止する | Phase 4〜7 の検証コマンドと結果 |
| 型変換整合         | Date/ISO 8601・ExportResult 変換・DebugEvent ペイロードの境界変換を確認する | 修正対象 7 仕様書 + Phase 6/7   |
| イベント購読安全性 | safeOn + cleanup による二重登録防止（P5）を確認する                         | 05B 仕様書 + Phase 6/9          |

## 成果物

| 成果物                 | パス                                                 | 説明                     |
| ---------------------- | ---------------------------------------------------- | ------------------------ |
| 型整合性レビュー結果   | `outputs/phase-11/type-consistency-review.md`        | Gap 1, 2, 6 の型確認結果 |
| データフロー追跡結果   | `outputs/phase-11/data-flow-trace-review.md`         | Gap 3, 4, 5 のフロー確認 |
| 実装者視点レビュー結果 | `outputs/phase-11/implementer-perspective-review.md` | 全体の可読性・整合性確認 |
| 発見課題               | `outputs/phase-11/discovered-issues.md`              | 課題一覧                 |

---

## 完了条件

- [ ] すべてのテストケース（9件）が実行済み
- [ ] すべてのテストケースがPASS
- [ ] 修正した7つの仕様書全てを手動でレビュー済み
- [ ] 発見課題が記録されている（0件の場合も明記）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（4タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（4ファイル）が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10 が完了していること
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-12-documentation.md`
