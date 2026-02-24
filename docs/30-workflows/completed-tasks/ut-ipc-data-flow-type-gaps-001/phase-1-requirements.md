# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                                           |
| ---------- | ------------------------------------------------------------ |
| Phase      | 1                                                            |
| タスクID   | UT-IPC-DATA-FLOW-TYPE-GAPS-001                               |
| 機能名     | バックエンド型定義と UI Props 間のデータフロー型ギャップ解消 |
| 作成日     | 2026-02-24                                                   |
| タスク種別 | 仕様書修正のみ（実コード変更なし）                           |

## 目的

task-9 シリーズ（9A-9J）のバックエンド型定義と、UI タスク（task-030 / task-031b）のフロントエンド Props 定義の間に存在する 6 つのデータフロー型ギャップを、仕様書レベルで特定・分析し、修正要件を定義する。

## 実行タスク

- Gap 分析: 6 つの型ギャップの詳細分析と影響範囲の特定
- 受入基準定義: 各 Gap の修正完了条件を定義
- スコープ確認: 仕様書修正のみ（実コード変更を含まない）であることを確認

## 参照資料

| 資料                              | パス                                                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| タスク元仕様書                    | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-011-ut-ipc-data-flow-type-gaps-001.md` |
| aiworkflow リソースマップ         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                              |
| IPC API 仕様                      | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                          |
| Skill インターフェース仕様        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                             |
| IPC セキュリティ仕様              | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                  |
| Skill IPC セキュリティ仕様        | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                     |
| 実装パターン仕様                  | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                   |
| IPC 契約チェックリスト            | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                                 |
| IPC 型解決ガイド                  | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`                              |
| エラーハンドリング仕様            | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                         |
| タスクワークフロー仕様            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                          |
| P5（リスナー二重登録）            | `.claude/rules/06-known-pitfalls.md#P5`                                                                       |
| P44（IPC インターフェース不整合） | `.claude/rules/06-known-pitfalls.md#P44`                                                                      |
| P45（命名ドリフト）               | `.claude/rules/06-known-pitfalls.md#P45`                                                                      |
| P42（trim バリデーション漏れ）    | `.claude/rules/06-known-pitfalls.md#P42`                                                                      |

---

## aiworkflow-requirements 抽出結果

今回タスクで必要な仕様を `aiworkflow-requirements` から抽出した結果を以下に定義する。

| 抽出ID | 参照仕様                                  | 抽出した要件                                                                       | 本タスクへの適用Gap |
| ------ | ----------------------------------------- | ---------------------------------------------------------------------------------- | ------------------- |
| AR-01  | `security-electron-ipc.md`                | IPC 契約は Main/Preload/呼び出し例の3点同時整合を必須とする（P44/P45対策）         | Gap 6               |
| AR-02  | `security-skill-ipc.md`                   | 文字列引数は `typeof` / 空文字 / `trim()` の3段バリデーションを要求する（P42対策） | Gap 6               |
| AR-03  | `interfaces-agent-sdk-skill.md`           | `safeInvoke` / `safeOn` のホワイトリスト前提と cleanup パターンを明記する          | Gap 5, 6            |
| AR-04  | `architecture-implementation-patterns.md` | IPC 戻り値型の境界変換ルール（Result 変換・UI 反映）を記述する                     | Gap 4               |
| AR-05  | `api-ipc-agent.md`                        | IPC Request/Response の型契約と引数命名の一貫性を維持する                          | Gap 3, 6            |
| AR-06  | `error-handling.md`                       | 失敗時のエラー種別・UI 表示方針・再試行方針を仕様へ明示する                        | Gap 4               |
| AR-07  | `task-workflow.md`                        | MINOR 指摘は未タスク化し、追跡可能な形で残課題管理に登録する                       | Phase 3, 10, 12     |
| AR-08  | `ipc-contract-checklist.md`               | IPC 修正時は契約変更前後チェック（P44/P45/P42）を品質ゲートとして実施する          | Gap 5, 6            |
| AR-09  | `ipc-type-resolution-guide.md`            | IPC 境界の型変換ルール（引数統一/戻り値変換/S13）を明示して契約ドリフトを防止する  | Gap 1, 4, 6         |

**抽出成果物**:

- `outputs/phase-1/aiworkflow-requirements-extraction.md`

## 要件一覧

### Gap 1: Date 型の IPC シリアライズ問題

**問題**: 複数の task-9 仕様書で `Date` 型を使用しているが、IPC 経由（Renderer ↔ Main）のシリアライズ方針が未記載。Electron の contextBridge は Structured Clone を使用し Date オブジェクトは保持されるが、将来的な Web 版対応（JSON 経由）を考慮すると一貫した文字列化方針が必要。

**影響範囲**:

| 仕様書                      | 実ファイル名                           | フィールド                                                                                                                                                                                              |
| --------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| task-9f（スキル共有）       | `task-022-task-9f-skill-share.md`      | `ImportResult.importedAt: Date`                                                                                                                                                                         |
| task-9g（スケジュール実行） | `task-023a-task-9g-skill-schedule.md`  | `ScheduledSkill.lastRun?: Date`, `ScheduledSkill.nextRun?: Date`, `ScheduledRunResult.startedAt: Date`, `ScheduledRunResult.completedAt?: Date`                                                         |
| task-9h（デバッグモード）   | `task-023b-task-9h-skill-debug.md`     | `DebugSession.startedAt: Date`, `DebugStep.timestamp: Date`, `CallStackEntry.startTime: Date`                                                                                                           |
| task-9j（使用統計・分析）   | `task-023d-task-9j-skill-analytics.md` | `SkillUsageEvent.timestamp: Date`, `AnalyticsPeriod.start: Date`, `AnalyticsPeriod.end: Date`, `TrendDataPoint.timestamp: Date`, `SkillStatistics.lastUsed?: Date`, `SkillUsageSummary.lastUsed?: Date` |

**要件**: 全 Date 型フィールドに IPC 経由のシリアライズ方針（ISO 8601 文字列）を明記する

**受入基準**:

- [ ] 全 Date 型フィールドに「IPC 経由では ISO 8601 文字列（`string`）として送受信」の注記が追加されている
- [ ] バックエンド内部では `Date` を使用し、ハンドラの戻り値で `.toISOString()` に変換する旨が記載されている
- [ ] nullable な Date フィールド（`lastRun?`, `nextRun?`, `completedAt?`, `lastUsed?`）の IPC 型は `string | null` であることが明記されている

---

### Gap 2: DebugControls の idle 状態不整合

**問題**: フロントエンド（05B）の `DebugControlsProps.sessionStatus` には `idle` が含まれるが、バックエンド（task-9h）の `DebugSession.status` には `idle` が含まれない。フロントエンド側でセッション未開始を `idle` として独自マッピングする必要があるが、その変換ロジックが未定義。

**影響範囲**:

| レイヤー       | 仕様書                    | 実ファイル名                               | 型定義                                                                                        |
| -------------- | ------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| バックエンド   | task-9h（デバッグモード） | `task-023b-task-9h-skill-debug.md`         | `DebugSession.status: "running" \| "paused" \| "completed" \| "error"`                        |
| フロントエンド | 05B（スキル詳細ビュー）   | `task-031b-ui-05b-skill-advanced-views.md` | `DebugControlsProps.sessionStatus: "idle" \| "running" \| "paused" \| "completed" \| "error"` |

**要件**: task-9h の `DebugSession.status` に `idle` を追加し、フロントエンドとの整合性を確保する

**受入基準**:

- [ ] task-9h の `DebugSession.status` に `idle` が追加されている
- [ ] `idle` の説明が追加されている（デバッグセッション未開始の初期状態）
- [ ] `idle` 状態のセッションオブジェクトの初期値が定義されている

---

### Gap 3: DocPreview の onExport データフロー不整合

**問題**: フロントエンド（05）の `DocPreviewProps.onExport` は `(format: string, path: string)` を受け取るが、バックエンド（task-9i）の `exportToFile` は `(doc: GeneratedDoc, outputPath: string)` を受け取る。Renderer から Main へドキュメントオブジェクトを渡すフローが未定義。

**影響範囲**:

| レイヤー       | 仕様書                      | 実ファイル名                          | インターフェース                                      |
| -------------- | --------------------------- | ------------------------------------- | ----------------------------------------------------- |
| フロントエンド | 05（スキルセンタービュー）  | `task-030-ui-05-skill-center-view.md` | `onExport: (format: string, path: string) => void`    |
| バックエンド   | task-9i（ドキュメント生成） | `task-023c-task-9i-skill-docs.md`     | `exportToFile(doc: GeneratedDoc, outputPath: string)` |

**要件**: docId ベースのデータフローを定義し、Renderer → Main 間のドキュメント取得フローを明確化する

**受入基準**:

- [ ] `DocPreviewProps.onExport` が `(docId: string, format: string, outputPath: string) => void` に修正されている
- [ ] IPC データフロー図（Renderer → `skill:docs:export` → Main → ファイル出力）が追加されている
- [ ] Main 側で `docId` からドキュメントを取得するロジックの概要が記載されている

---

### Gap 4: ExportResult の型ギャップ

**問題**: バックエンド（task-9f）の `ExportResult` は完全なオブジェクト（`success`, `destination`, `exportedFiles`, `shareUrl?`）だが、フロントエンド（05）の `ExportSkillDialog` のコールバック `onExportComplete` は `shareUrl` のみを受け取る。変換ロジックとエラーハンドリングが未記載。

**影響範囲**:

| レイヤー       | 仕様書                     | 実ファイル名                          | 型定義                                                            |
| -------------- | -------------------------- | ------------------------------------- | ----------------------------------------------------------------- |
| バックエンド   | task-9f（スキル共有）      | `task-022-task-9f-skill-share.md`     | `ExportResult { success, destination, exportedFiles, shareUrl? }` |
| フロントエンド | 05（スキルセンタービュー） | `task-030-ui-05-skill-center-view.md` | `onExportComplete: (shareUrl?: string) => void`                   |

**要件**: `ExportResult` から UI コールバックへの変換ロジックと、エラー時のハンドリングを記載する

**受入基準**:

- [ ] `success === true` の場合の `shareUrl` 表示ロジックが記載されている
- [ ] `success === false` の場合のエラーハンドリング（エラーメッセージ表示、リトライボタン有効化）が記載されている
- [ ] `ExportResult` → `onExportComplete` への変換箇所（Renderer 側の IPC 呼び出し後）が特定されている

---

### Gap 5: skill:debug:event の safeOn 購読仕様が未記載

**問題**: task-9h で定義される `skill:debug:event` は Main → Renderer へのプッシュ通知（`ipcMain.on` / Renderer 側 `safeOn`）だが、05B の `DebugPanel` にはこのイベント購読の仕様が記載されていない。P5（リスナー二重登録）のリスクが未検討。

**影響範囲**:

| レイヤー       | 仕様書                    | 実ファイル名                               | 関連                     |
| -------------- | ------------------------- | ------------------------------------------ | ------------------------ |
| バックエンド   | task-9h（デバッグモード） | `task-023b-task-9h-skill-debug.md`         | `skill:debug:event` 定義 |
| フロントエンド | 05B（スキル詳細ビュー）   | `task-031b-ui-05b-skill-advanced-views.md` | 購読仕様が未記載         |

**要件**: 05B の DebugPanel に `safeOn` 購読パターンを追加し、P5（リスナー二重登録）対策を明記する

**受入基準**:

- [ ] `useEffect` + cleanup パターンのコード例が追加されている
- [ ] P5（StrictMode 対策）が明記されている
- [ ] `DebugEvent` の型定義（イベントペイロード）が DebugPanel セクションに記載されている

---

### Gap 6: task-9a IPC 引数形式の乖離

**問題**: task-9a の Step 2 コード例では個別引数（positional）形式で `safeInvoke` を呼び出しているが、実装済みコード（UT-FIX-SKILL-IMPORT-INTERFACE-001 以降）はオブジェクト形式に統一されている。仕様書と実装の乖離が P44 パターンの再発リスクを生む。

**影響範囲**:

| レイヤー | 仕様書                    | 実ファイル名                        | 現状の記述                                                            |
| -------- | ------------------------- | ----------------------------------- | --------------------------------------------------------------------- |
| Preload  | task-9a（スキルエディタ） | `task-020b-task-9a-skill-editor.md` | `safeInvoke(CHANNELS.SKILL_READ, skillName, filePath)` （positional） |

**要件**: task-9a の全 IPC 呼び出し例をオブジェクト形式に統一し、P44 パターンの再発を防止する

**受入基準**:

- [ ] task-9a の全 `safeInvoke` 呼び出し例がオブジェクト形式（`safeInvoke(CHANNEL, { key: value })`）に統一されている
- [ ] P44/P45 再発防止の注意書きが追加されている

---

## 修正対象ファイル一覧

> **注記**: task-011 仕様書で使用されたファイル名と実際のファイル名に差異がある。以下は実際のファイル名を使用する。

| #   | Gap     | task-011 記載名                         | 実ファイル名                               | 修正内容                                    |
| --- | ------- | --------------------------------------- | ------------------------------------------ | ------------------------------------------- |
| 1   | Gap 6   | task-021-task-9a-skill-editor.md        | `task-020b-task-9a-skill-editor.md`        | IPC 引数形式をオブジェクト形式に統一        |
| 2   | Gap 1,4 | task-022-task-9f-skill-share.md         | `task-022-task-9f-skill-share.md`          | Date 型シリアライズ注記 + ExportResult 変換 |
| 3   | Gap 1   | task-023a-task-9g-skill-schedule.md     | `task-023a-task-9g-skill-schedule.md`      | Date 型シリアライズ注記                     |
| 4   | Gap 2,5 | task-023b-task-9h-skill-debug.md        | `task-023b-task-9h-skill-debug.md`         | idle 追加 + Date 型注記                     |
| 5   | Gap 1   | task-023d-task-9j-skill-analytics.md    | `task-023d-task-9j-skill-analytics.md`     | Date 型シリアライズ注記                     |
| 6   | Gap 3,4 | task-030-ui-05-skill-center-view.md     | `task-030-ui-05-skill-center-view.md`      | onExport 修正 + ExportResult 変換ロジック   |
| 7   | Gap 2,5 | task-032-ui-05b-skill-advanced-views.md | `task-031b-ui-05b-skill-advanced-views.md` | safeOn 購読仕様追加（ファイル名注意）       |

## スコープ

### 含むもの

- 上記 7 つの仕様書ファイルの修正
- Date 型シリアライズ方針の標準化
- IPC データフローの明確化
- P5/P44/P45 再発防止策の記載

### 含まないもの

- 実コードの変更
- Date 型ユーティリティ関数の実装
- IPC ハンドラの実装変更
- テストコードの変更

---

## 統合テスト連携

| 連携観点           | 実施内容                                                                    | 検証先                          |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------- |
| IPC 契約整合       | Renderer → Preload → Main の引数型/戻り値型を突合し、契約ドリフトを防止する | Phase 4〜7 の検証コマンドと結果 |
| 型変換整合         | Date/ISO 8601・ExportResult 変換・DebugEvent ペイロードの境界変換を確認する | 修正対象 7 仕様書 + Phase 6/7   |
| イベント購読安全性 | safeOn + cleanup による二重登録防止（P5）を確認する                         | 05B 仕様書 + Phase 6/9          |

## 成果物

| 成果物     | パス                                                                                       | 説明             |
| ---------- | ------------------------------------------------------------------------------------------ | ---------------- |
| 要件定義書 | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-1-requirements.md` | 6 Gap の詳細分析 |

## 完了条件

- [ ] 6 つの Gap が詳細に分析されている
- [ ] aiworkflow-requirements から必要要件（AR-01〜AR-09）が抽出され、Gap との対応が定義されている
- [ ] 各 Gap の受入基準が定義されている
- [ ] 影響を受ける仕様書ファイルが一覧化されている（実ファイル名で）
- [ ] スコープ（仕様書修正のみ）が明確に記載されている
- [ ] task-011 のファイル名と実ファイル名の差異が記録されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## 次の Phase

Phase 2: 設計
