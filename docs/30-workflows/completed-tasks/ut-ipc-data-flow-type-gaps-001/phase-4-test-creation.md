# Phase 4: 検証基準設計（テスト設計に代えて）

## メタ情報

| 項目       | 値                                        |
| ---------- | ----------------------------------------- |
| Phase      | 4                                         |
| タスクID   | UT-IPC-DATA-FLOW-TYPE-GAPS-001            |
| 機能名     | データフロー型ギャップ解消                |
| 作成日     | 2026-02-24                                |
| タスク種別 | 仕様書修正のみ                            |
| 前提Phase  | Phase 1-3（要件定義・設計・設計レビュー） |

## 目的

仕様書修正の正しさを検証するための基準とコマンドを設計する。本タスクはコード変更を伴わないため、自動テスト（Vitest）ではなく `grep` / `diff` ベースの仕様書検証を行う。

## 実行タスク

- 検証基準設計: 各 Gap の修正を確認するための検証コマンドを設計する
- 検証チェックリスト作成: 全 6 Gap の修正完了を確認するチェックリストを作成する

## 参照資料

| ドキュメント               | パス                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| タスク仕様書               | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-011-ut-ipc-data-flow-type-gaps-001.md`            |
| Phase 2 設計書             | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-2-design.md`                                     |
| Phase 3 設計レビュー       | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-3-design-review.md`                              |
| Phase 1 抽出成果物         | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-1/aiworkflow-requirements-extraction.md` |
| IPC API 仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                     |
| Skill インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                        |
| IPC セキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                             |
| P5（二重登録）             | `.claude/rules/06-known-pitfalls.md#P5`                                                                                  |
| P44（IPC不整合）           | `.claude/rules/06-known-pitfalls.md#P44`                                                                                 |

## ファイル名の注意事項

タスク仕様書（task-011）で参照されているファイル名と実際のファイルシステム上の名前に不一致がある:

| task-011 での参照名                       | 実際のファイル名                           |
| ----------------------------------------- | ------------------------------------------ |
| `task-021-task-9a-skill-editor.md`        | `task-020b-task-9a-skill-editor.md`        |
| `task-032-ui-05b-skill-advanced-views.md` | `task-031b-ui-05b-skill-advanced-views.md` |

以下の検証コマンドでは**実際のファイル名**を使用する。

## 検証コマンド一覧

以下の `TASK_BASE` を共通パス変数として使用する:

```bash
TASK_BASE="docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence"
```

### Gap 1: Date 型シリアライズ注記の追加確認

**目的**: task-9f, 9g, 9j の Date 型フィールドに ISO 8601 シリアライズ方針が明記されていること

```bash
# task-9f: ImportResult.importedAt の注記確認
grep -n "ISO 8601\|toISOString\|シリアライズ" "${TASK_BASE}/task-022-task-9f-skill-share.md"
# 期待: 1行以上ヒット（importedAt に関するシリアライズ方針）

# task-9g: ScheduledSkill, ScheduledRunResult の注記確認
grep -n "ISO 8601\|toISOString\|シリアライズ" "${TASK_BASE}/task-023a-task-9g-skill-schedule.md"
# 期待: 1行以上ヒット（lastRun, nextRun, startedAt, completedAt, runAt に関するシリアライズ方針）

# task-9j: AnalyticsPeriod, SkillUsageEvent 等の注記確認
grep -n "ISO 8601\|toISOString\|シリアライズ" "${TASK_BASE}/task-023d-task-9j-skill-analytics.md"
# 期待: 1行以上ヒット（timestamp, lastUsed, start, end に関するシリアライズ方針）
```

**追加検証**: task-9h にも Date 型フィールド（`startedAt`, `timestamp`, `startTime`）があるため、Gap 1 の波及確認を実施

```bash
grep -n "ISO 8601\|toISOString\|シリアライズ" "${TASK_BASE}/task-023b-task-9h-skill-debug.md"
# 期待: 1行以上ヒット（startedAt, timestamp, startTime に関するシリアライズ方針）
```

### Gap 2: DebugSession.status に idle が含まれること

**目的**: task-9h の `DebugSession.status` ユニオン型に `idle` が追加されていること

```bash
# idle が DebugSession.status の型定義内に存在することを確認
grep -n "idle" "${TASK_BASE}/task-023b-task-9h-skill-debug.md"
# 期待: status 型定義行で idle がヒット

# 05B との整合性確認: DebugControlsProps の sessionStatus と一致すること
grep -n "idle.*running.*paused\|running.*idle" "${TASK_BASE}/task-031b-ui-05b-skill-advanced-views.md"
# 期待: sessionStatus 型定義行がヒット（既存）
```

### Gap 3: DocPreview onExport が docId ベースに修正されていること

**目的**: `DocPreviewProps.onExport` が `docId` ベースのデータフローに修正されていること

```bash
# onExport の引数に docId が含まれることを確認
grep -n "docId" "${TASK_BASE}/task-030-ui-05-skill-center-view.md"
# 期待: onExport の引数定義行で docId がヒット

# IPC データフロー（skill:docs:export）の記載確認
grep -n "skill:docs:export\|docs:export" "${TASK_BASE}/task-030-ui-05-skill-center-view.md"
# 期待: IPC チャネル定義がヒット
```

### Gap 4: ExportResult 変換ロジックが追加されていること

**目的**: `ExportResult` から UI コールバックへの変換ロジックが記載されていること

```bash
# ExportResult の変換ロジック（success/error ハンドリング）確認
grep -n "ExportResult\|success.*false\|shareUrl" "${TASK_BASE}/task-030-ui-05-skill-center-view.md"
# 期待: ExportResult の参照と success/error のハンドリングロジック記載

# エラーケースのハンドリング記載確認
grep -n "エラー.*表示\|error.*handling\|リトライ" "${TASK_BASE}/task-030-ui-05-skill-center-view.md"
# 期待: エラー時の UI 表示方針が記載
```

### Gap 5: safeOn 購読パターンが追加されていること

**目的**: 05B の DebugPanel に `skill:debug:event` の `safeOn` 購読仕様と P5 対策が追加されていること

```bash
# safeOn パターンの記載確認
grep -n "safeOn\|onDebugEvent" "${TASK_BASE}/task-031b-ui-05b-skill-advanced-views.md"
# 期待: safeOn 購読パターンのコード例がヒット

# P5 対策（クリーンアップ関数）の記載確認
grep -n "cleanup\|クリーンアップ\|StrictMode\|P5\|二重登録" "${TASK_BASE}/task-031b-ui-05b-skill-advanced-views.md"
# 期待: リスナー解除のクリーンアップパターンが記載

# useEffect のリスナー登録パターン確認
grep -n "useEffect" "${TASK_BASE}/task-031b-ui-05b-skill-advanced-views.md"
# 期待: useEffect 内でのリスナー登録＋クリーンアップパターン
```

### Gap 6: IPC 引数形式がオブジェクト形式に統一されていること

**目的**: task-9a の全 IPC 呼び出し例がオブジェクト形式（`{ key: value }`）に統一されていること

```bash
# safeInvoke の全呼び出しを確認
grep -n "safeInvoke" "${TASK_BASE}/task-020b-task-9a-skill-editor.md"
# 期待: 全行でオブジェクト形式（{...}）が使用されている

# positional 形式（カンマ区切りの個別引数）が残っていないことを確認
grep -n "safeInvoke.*SKILL.*," "${TASK_BASE}/task-020b-task-9a-skill-editor.md" | grep -v "{"
# 期待: 0行（オブジェクト形式でない呼び出しが残っていない）
```

## 検証チェックリスト

### Gap 1: Date 型シリアライズ方針

- [ ] task-9f の `ImportResult.importedAt` に ISO 8601 シリアライズ方針が明記されている
- [ ] task-9g の `ScheduledSkill.lastRun` / `nextRun` に ISO 8601 シリアライズ方針が明記されている
- [ ] task-9g の `SkillSchedule.runAt` に ISO 8601 シリアライズ方針が明記されている
- [ ] task-9g の `ScheduledRunResult.startedAt` / `completedAt` に ISO 8601 シリアライズ方針が明記されている
- [ ] task-9j の `SkillUsageEvent.timestamp` に ISO 8601 シリアライズ方針が明記されている
- [ ] task-9j の `SkillStatistics.lastUsed` に ISO 8601 シリアライズ方針が明記されている
- [ ] task-9j の `AnalyticsPeriod.start` / `end` に ISO 8601 シリアライズ方針が明記されている
- [ ] task-9j の `TrendDataPoint.timestamp` に ISO 8601 シリアライズ方針が明記されている
- [ ] task-9j の `SkillUsageSummary.lastUsed` に ISO 8601 シリアライズ方針が明記されている
- [ ] task-9h の `DebugSession.startedAt` に ISO 8601 シリアライズ方針が明記されている（波及）
- [ ] task-9h の `DebugStep.timestamp` に ISO 8601 シリアライズ方針が明記されている（波及）
- [ ] task-9h の `CallStackEntry.startTime` に ISO 8601 シリアライズ方針が明記されている（波及）
- [ ] IPC 型（`string`）とドメイン型（`Date`）の分離方針が記載されている

### Gap 2: DebugSession.status

- [ ] task-9h の `DebugSession.status` に `idle` が追加されている
- [ ] `idle` の意味（デバッグセッション未開始の初期状態）が説明されている
- [ ] 05B の `DebugControlsProps.sessionStatus` と値セットが一致している

### Gap 3: DocPreview onExport

- [ ] 05 の `DocPreviewProps.onExport` が `(docId: string, format: string, outputPath: string)` に修正されている
- [ ] IPC データフロー（Renderer → `skill:docs:export` → Main）が図示されている
- [ ] Main 側での docId からドキュメント取得のフローが明記されている

### Gap 4: ExportResult 変換ロジック

- [ ] `ExportResult.success === true` の場合の UI 表示方針が記載されている
- [ ] `ExportResult.success === false` の場合のエラーハンドリングが記載されている
- [ ] `shareUrl` の UI への受け渡し方法が明記されている

### Gap 5: safeOn 購読仕様

- [ ] 05B の DebugPanel に `skill:debug:event` の `safeOn` 購読パターンが追加されている
- [ ] `useEffect` のクリーンアップ関数でリスナー解除する仕様が明記されている
- [ ] P5（リスナー二重登録）対策が明記されている
- [ ] React StrictMode での動作が考慮されている

### Gap 6: IPC 引数形式

- [ ] task-9a の `skill:readFile` がオブジェクト形式 `{ skillName, relativePath }` に修正されている
- [ ] task-9a の `skill:writeFile` がオブジェクト形式 `{ skillName, relativePath, content }` に修正されている
- [ ] task-9a の `skill:createFile` がオブジェクト形式 `{ skillName, relativePath, content }` に修正されている
- [ ] task-9a の `skill:deleteFile` がオブジェクト形式 `{ skillName, relativePath }` に修正されている
- [ ] task-9a の `skill:listBackups` がオブジェクト形式 `{ skillName }` に修正されている
- [ ] task-9a の `skill:restoreBackup` がオブジェクト形式 `{ skillName, backupPath }` に修正されている
- [ ] positional 形式の safeInvoke 呼び出しが残っていない

## 統合テスト連携

| 連携観点           | 実施内容                                                                    | 検証先                          |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------- |
| IPC 契約整合       | Renderer → Preload → Main の引数型/戻り値型を突合し、契約ドリフトを防止する | Phase 4〜7 の検証コマンドと結果 |
| 型変換整合         | Date/ISO 8601・ExportResult 変換・DebugEvent ペイロードの境界変換を確認する | 修正対象 7 仕様書 + Phase 6/7   |
| イベント購読安全性 | safeOn + cleanup による二重登録防止（P5）を確認する                         | 05B 仕様書 + Phase 6/9          |

## 成果物

| 成果物         | パス                                                                                        | 説明           |
| -------------- | ------------------------------------------------------------------------------------------- | -------------- |
| 検証基準設計書 | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-4-test-creation.md` | 本ドキュメント |

## 完了条件

- [x] 全 6 Gap の検証コマンドが設計されている
- [x] Gap 1 の波及対象（task-9h の Date 型）を追加で検証対象に含めている
- [x] 検証チェックリストが全 Gap について作成されている
- [x] 各検証コマンドの期待結果が明確に記載されている
- [x] ファイル名の不一致（task-011 spec vs 実ファイル）が注記されている
- [x] 本 Phase 内の全タスクを 100% 実行完了

## 次の Phase

Phase 5: 仕様書修正（実装に代えて）→ `phase-5-implementation.md`
