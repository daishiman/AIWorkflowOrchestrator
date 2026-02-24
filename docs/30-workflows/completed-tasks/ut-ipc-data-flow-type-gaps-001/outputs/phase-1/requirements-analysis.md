# Phase 1: 要件分析書

## メタ情報

| 項目       | 値                                                           |
| ---------- | ------------------------------------------------------------ |
| タスクID   | UT-IPC-DATA-FLOW-TYPE-GAPS-001                               |
| Phase      | 1                                                            |
| 作成日     | 2026-02-24                                                   |
| タスク種別 | 仕様書修正のみ（実コード変更なし）                           |
| 機能名     | バックエンド型定義と UI Props 間のデータフロー型ギャップ解消 |

---

## 1. Gap 詳細分析

### 1.1 Gap 1: Date 型の IPC シリアライズ問題

**問題の本質**: task-9 シリーズの 4 つの仕様書（9f, 9g, 9h, 9j）で Date 型フィールドを使用しているが、IPC 境界（Renderer ↔ Main）での型変換方針が一切記載されていない。Electron の contextBridge は Structured Clone Algorithm を使用し Date オブジェクトは保持されるが、将来的な Web 版対応（JSON API 経由）を見据えると、一貫した文字列化方針が必要。

**影響フィールド一覧**（14 フィールド）:

| #   | 仕様書 | 実ファイル名                         | インターフェース   | フィールド  | nullable |
| --- | ------ | ------------------------------------ | ------------------ | ----------- | -------- |
| 1   | 9f     | task-022-task-9f-skill-share.md      | ImportResult       | importedAt  | No       |
| 2   | 9g     | task-023a-task-9g-skill-schedule.md  | ScheduledSkill     | lastRun     | Yes      |
| 3   | 9g     | task-023a-task-9g-skill-schedule.md  | ScheduledSkill     | nextRun     | Yes      |
| 4   | 9g     | task-023a-task-9g-skill-schedule.md  | ScheduledRunResult | startedAt   | No       |
| 5   | 9g     | task-023a-task-9g-skill-schedule.md  | ScheduledRunResult | completedAt | Yes      |
| 6   | 9h     | task-023b-task-9h-skill-debug.md     | DebugSession       | startedAt   | No       |
| 7   | 9h     | task-023b-task-9h-skill-debug.md     | DebugStep          | timestamp   | No       |
| 8   | 9h     | task-023b-task-9h-skill-debug.md     | CallStackEntry     | startTime   | No       |
| 9   | 9j     | task-023d-task-9j-skill-analytics.md | SkillUsageEvent    | timestamp   | No       |
| 10  | 9j     | task-023d-task-9j-skill-analytics.md | AnalyticsPeriod    | start       | No       |
| 11  | 9j     | task-023d-task-9j-skill-analytics.md | AnalyticsPeriod    | end         | No       |
| 12  | 9j     | task-023d-task-9j-skill-analytics.md | TrendDataPoint     | timestamp   | No       |
| 13  | 9j     | task-023d-task-9j-skill-analytics.md | SkillStatistics    | lastUsed    | Yes      |
| 14  | 9j     | task-023d-task-9j-skill-analytics.md | SkillUsageSummary  | lastUsed    | Yes      |

**データフロー方向の分類**:

| 方向            | フィールド                  | 変換方式                                       |
| --------------- | --------------------------- | ---------------------------------------------- |
| Main → Renderer | 上記 14 フィールドの大部分  | ハンドラ戻り値で `.toISOString()` に変換       |
| Renderer → Main | AnalyticsPeriod.start, .end | Renderer で ISO 8601 文字列を送信、Main で復元 |

**受入基準**:

- [ ] 全 14 フィールドに「IPC 経由では ISO 8601 文字列（`string`）として送受信」の注記が追加されている
- [ ] バックエンド内部では `Date` を使用し、ハンドラの戻り値で `.toISOString()` に変換する旨が記載されている
- [ ] nullable な Date フィールド（5 箇所: #2, #3, #5, #13, #14）の IPC 型は `string | null` であることが明記されている
- [ ] Renderer → Main 方向（AnalyticsPeriod.start/end）は `new Date(isoString)` による復元が明記されている
- [ ] 各仕様書に IPC シリアライズ方針テーブルが追加されている

---

### 1.2 Gap 2: DebugControls の idle 状態不整合

**問題の本質**: フロントエンド（05B）の `DebugControlsProps.sessionStatus` には `idle` が含まれるが、バックエンド（task-9h）の `DebugSession.status` には `idle` が含まれていない。

**実ファイル検証結果**:

| レイヤー       | 仕様書 | 実ファイル名                             | 現在の status 型定義                                        |
| -------------- | ------ | ---------------------------------------- | ----------------------------------------------------------- |
| バックエンド   | 9h     | task-023b-task-9h-skill-debug.md         | `"running" \| "paused" \| "completed" \| "error"`           |
| フロントエンド | 05B    | task-031b-ui-05b-skill-advanced-views.md | `"idle" \| "running" \| "paused" \| "completed" \| "error"` |

**注記**: task-011 元仕様書では task-9h の status に `stopped` と記載されていたが、実際の仕様書ファイルでは `completed` が使用されている。本分析では実ファイルの定義を正とする。

**受入基準**:

- [ ] task-9h の `DebugSession.status` に `idle` が追加されている
- [ ] `idle` の説明が追加されている（デバッグセッション未開始の初期状態）
- [ ] `idle` 状態のセッションオブジェクトの初期値が定義されている
- [ ] task-031b の `DebugControlsProps.sessionStatus` との値セットが完全一致している

---

### 1.3 Gap 3: DocPreview の onExport データフロー不整合

**問題の本質**: Renderer 側の `onExport` コールバックからバックエンドの `exportToFile` までのデータフローが未定義。

**実ファイル検証結果**:

| レイヤー       | 仕様書 | 実ファイル名                        | シグネチャ                                            |
| -------------- | ------ | ----------------------------------- | ----------------------------------------------------- |
| フロントエンド | 05     | task-030-ui-05-skill-center-view.md | `onExport: (format: string, path: string) => void`    |
| バックエンド   | 9i     | task-023c-task-9i-skill-docs.md     | `exportToFile(doc: GeneratedDoc, outputPath: string)` |

**設計判断**: `docId` ベースでの取得方式を採用。Renderer から Main へ `GeneratedDoc` 全体を渡すのではなく、`docId` を送信して Main 側のキャッシュから取得する。

**受入基準**:

- [ ] `DocPreviewProps.onExport` が `(docId: string, format: string, outputPath: string) => void` に修正されている
- [ ] IPC データフロー図（Renderer → Preload → Main → ファイル出力）が追加されている
- [ ] Main 側で `docId` からドキュメントを取得するロジックの概要が記載されている
- [ ] `docId` ベース方式の設計判断理由が記載されている

---

### 1.4 Gap 4: ExportResult の型ギャップ

**問題の本質**: バックエンドの `ExportResult` オブジェクトからフロントエンドの `onExportComplete` コールバックへの変換ロジックが未記載。

**実ファイル検証結果**:

| レイヤー       | 仕様書 | 実ファイル名                        | 型/インターフェース                                               |
| -------------- | ------ | ----------------------------------- | ----------------------------------------------------------------- |
| バックエンド   | 9f     | task-022-task-9f-skill-share.md     | `ExportResult { success, destination, exportedFiles, shareUrl? }` |
| フロントエンド | 05     | task-030-ui-05-skill-center-view.md | `onExportComplete: (shareUrl?: string) => void`                   |

**受入基準**:

- [ ] `success === true` の場合の `shareUrl` 表示ロジックが記載されている
- [ ] `success === false` の場合のエラーハンドリング（エラーメッセージ表示、リトライボタン有効化）が記載されている
- [ ] IPC 通信エラー（catch）のハンドリングが記載されている
- [ ] `ExportResult` → `onExportComplete` への変換箇所（ExportSkillDialog 内部）が特定されている

---

### 1.5 Gap 5: skill:debug:event の safeOn 購読仕様が未記載

**問題の本質**: task-9h で定義される `skill:debug:event` は Main → Renderer へのプッシュ通知だが、05B の `DebugPanel` にはこのイベント購読の仕様が記載されていない。P5（リスナー二重登録）のリスクが未検討。

**受入基準**:

- [ ] `useEffect` + cleanup パターンのコード例が追加されている
- [ ] P5（React StrictMode 二重実行対策）が明記されている
- [ ] `DebugEvent` の型定義（イベントペイロード）が DebugPanel セクションに記載されている
- [ ] イベントタイプごとのハンドリング分岐（step, breakpoint_hit, variable_change, error, completed）が示されている

---

### 1.6 Gap 6: task-9a IPC 引数形式の乖離

**問題の本質**: task-9a の仕様書では IPC ハンドラが positional 形式の引数を受け取る記述になっているが、実装済みコード（UT-FIX-SKILL-IMPORT-INTERFACE-001 以降）はオブジェクト形式に統一済み。

**実ファイル検証結果**:

task-020b-task-9a-skill-editor.md には以下の positional 形式が確認された:

```typescript
ipcMain.handle("skill:readFile", async (_, skillName: string, relativePath: string) => { ... });
ipcMain.handle("skill:writeFile", async (_, skillName: string, relativePath: string, content: string) => { ... });
ipcMain.handle("skill:listBackups", async (_, skillName: string) => { ... });
```

**受入基準**:

- [ ] task-9a の全 IPC ハンドラ定義とコード例がオブジェクト形式に統一されている
- [ ] P44/P45 再発防止の注意書きが追加されている
- [ ] ハンドラ側と Preload 側の引数名が一致していることが確認できる

---

## 2. 修正対象ファイル一覧

| #   | Gap       | task-011 記載名                         | 実ファイル名                               | 修正内容                                    |
| --- | --------- | --------------------------------------- | ------------------------------------------ | ------------------------------------------- |
| 1   | Gap 6     | task-021-task-9a-skill-editor.md        | `task-020b-task-9a-skill-editor.md`        | IPC 引数形式をオブジェクト形式に統一        |
| 2   | Gap 1,4   | task-022-task-9f-skill-share.md         | `task-022-task-9f-skill-share.md`          | Date 型シリアライズ注記 + ExportResult 変換 |
| 3   | Gap 1     | task-023a-task-9g-skill-schedule.md     | `task-023a-task-9g-skill-schedule.md`      | Date 型シリアライズ注記                     |
| 4   | Gap 1,2,5 | task-023b-task-9h-skill-debug.md        | `task-023b-task-9h-skill-debug.md`         | idle 追加 + Date 型注記 + DebugEvent 参照   |
| 5   | Gap 1     | task-023d-task-9j-skill-analytics.md    | `task-023d-task-9j-skill-analytics.md`     | Date 型シリアライズ注記                     |
| 6   | Gap 3,4   | task-030-ui-05-skill-center-view.md     | `task-030-ui-05-skill-center-view.md`      | onExport 修正 + ExportResult 変換ロジック   |
| 7   | Gap 2,5   | task-032-ui-05b-skill-advanced-views.md | `task-031b-ui-05b-skill-advanced-views.md` | safeOn 購読仕様追加 + idle 整合性注記       |

**ファイル名差異の記録**:

| task-011 記載名                         | 実ファイル名                             |
| --------------------------------------- | ---------------------------------------- |
| task-021-task-9a-skill-editor.md        | task-020b-task-9a-skill-editor.md        |
| task-032-ui-05b-skill-advanced-views.md | task-031b-ui-05b-skill-advanced-views.md |

---

## 3. aiworkflow-requirements 抽出要件との対応

| 抽出ID | 参照仕様                                | 抽出した要件                                                        | 適用 Gap        |
| ------ | --------------------------------------- | ------------------------------------------------------------------- | --------------- |
| AR-01  | security-electron-ipc.md                | IPC 契約変更時は Main/Preload/呼び出し例の3箇所を同時更新する       | Gap 6           |
| AR-02  | security-skill-ipc.md                   | 文字列引数は `typeof` / 空文字 / `trim()` の3段バリデーション必須   | Gap 6           |
| AR-03  | interfaces-agent-sdk-skill.md           | `safeInvoke`/`safeOn` のホワイトリスト前提と cleanup パターンを明記 | Gap 5, 6        |
| AR-04  | architecture-implementation-patterns.md | IPC 戻り値の型変換（Result→UI 変換）を境界で明示する                | Gap 4           |
| AR-05  | api-ipc-agent.md                        | Request/Response 型契約と引数命名の一貫性を維持する                 | Gap 3, 6        |
| AR-06  | error-handling.md                       | 失敗時のエラー種別・UI表示方針・再試行方針を仕様へ明示する          | Gap 4           |
| AR-07  | task-workflow.md                        | MINOR 指摘は未タスク化し追跡可能な残課題管理に登録する              | Phase 3, 10, 12 |
| AR-08  | ipc-contract-checklist.md               | IPC 修正前後の契約整合チェック（P44/P45/P42）を品質ゲートとして適用 | Gap 5, 6        |
| AR-09  | ipc-type-resolution-guide.md            | IPC 境界の型変換ルール（引数統一/戻り値変換/S13）を仕様に反映する   | Gap 1, 4, 6     |

---

## 4. スコープ確認

### 含むもの

- 上記 7 つの仕様書ファイルの修正（マークダウンテキストのみ）
- Date 型シリアライズ方針の標準化（注記追加）
- IPC データフローの明確化（図示・変換ロジック追記）
- P5/P44/P45 再発防止策の記載

### 含まないもの

- 実コードの変更（TypeScript ファイルの修正は一切なし）
- Date 型ユーティリティ関数の実装
- IPC ハンドラの実装変更
- テストコードの変更
- packages/shared の型定義ファイル変更

---

## 5. 修正優先順序

| 順序 | Gap   | 重要度 | 理由                                              |
| ---- | ----- | ------ | ------------------------------------------------- |
| 1    | Gap 6 | 高     | P44 再発防止。実装時に最初に参照される仕様書      |
| 2    | Gap 5 | 高     | P5（リスナー二重登録）の直接的リスク              |
| 3    | Gap 1 | 中     | 4 つの仕様書に影響する横断的修正（14 フィールド） |
| 4    | Gap 2 | 中     | フロントエンドとバックエンドの状態値統一          |
| 5    | Gap 3 | 中     | IPC データフローの明確化                          |
| 6    | Gap 4 | 低     | UI 側の表示ロジック補完                           |

---

## 6. 完了条件チェックリスト

- [x] 6 つの Gap が詳細に分析されている
- [x] aiworkflow-requirements から必要要件（AR-01〜AR-09）が抽出され、Gap との対応が定義されている
- [x] 各 Gap の受入基準が定義されている
- [x] 影響を受ける仕様書ファイルが一覧化されている（実ファイル名で）
- [x] スコープ（仕様書修正のみ）が明確に記載されている
- [x] task-011 のファイル名と実ファイル名の差異が記録されている
- [x] 実際の仕様書ファイルの内容を確認し、Gap の存在を検証済み
