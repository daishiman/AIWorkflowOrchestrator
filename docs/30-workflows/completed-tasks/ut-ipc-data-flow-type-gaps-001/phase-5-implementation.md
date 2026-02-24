# Phase 5: 仕様書修正（実装に代えて）

## メタ情報

| 項目       | 値                             |
| ---------- | ------------------------------ |
| Phase      | 5                              |
| タスクID   | UT-IPC-DATA-FLOW-TYPE-GAPS-001 |
| 機能名     | データフロー型ギャップ解消     |
| 作成日     | 2026-02-24                     |
| タスク種別 | 仕様書修正のみ                 |
| 前提Phase  | Phase 4（検証基準設計）        |

## 目的

task-9 シリーズのバックエンド型定義と UI タスク群のフロントエンド Props 定義間に存在する 6 つのデータフロー型ギャップを、仕様書レベルで解消する。

## 参照資料

| ドキュメント               | パス                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| タスク仕様書               | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-011-ut-ipc-data-flow-type-gaps-001.md`            |
| Phase 1 抽出成果物         | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-1/aiworkflow-requirements-extraction.md` |
| Phase 4                    | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-4-test-creation.md`                              |
| IPC API 仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                     |
| Skill インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                        |
| IPC セキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                             |
| Skill IPC セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                                |
| 実装パターン仕様           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                              |
| P5（二重登録）             | `.claude/rules/06-known-pitfalls.md#P5`                                                                                  |
| P42（trim漏れ）            | `.claude/rules/06-known-pitfalls.md#P42`                                                                                 |
| P44（IPC不整合）           | `.claude/rules/06-known-pitfalls.md#P44`                                                                                 |
| P45（命名ドリフト）        | `.claude/rules/06-known-pitfalls.md#P45`                                                                                 |

## ファイル名の注意事項

タスク仕様書（task-011）で参照されているファイル名と実際のファイルシステム上の名前に不一致がある。本ドキュメントでは**実際のファイル名**を使用する:

| task-011 での参照名                       | 実際のファイル名（使用する名前）           |
| ----------------------------------------- | ------------------------------------------ |
| `task-021-task-9a-skill-editor.md`        | `task-020b-task-9a-skill-editor.md`        |
| `task-032-ui-05b-skill-advanced-views.md` | `task-031b-ui-05b-skill-advanced-views.md` |

共通パス:

```
TASK_BASE = docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence
```

## 修正優先順序

| 順序 | Gap | 重要度 | 理由                                               |
| ---- | --- | ------ | -------------------------------------------------- |
| 1    | 6   | 高     | P44 再発防止。実装時に最初に参照される仕様書のため |
| 2    | 1   | 中     | 複数の task-9 に影響。Date → string の横断的変更   |
| 3    | 2   | 中     | フロントエンドの独自マッピングを排除               |
| 4    | 3   | 中     | データフローの明確化                               |
| 5    | 4   | 低     | UI 側の表示ロジックのみ                            |
| 6    | 5   | 高     | P5（リスナー二重登録）の直接的なリスク             |

---

## 実行タスク

### Step 1: Gap 6 修正 — task-9a IPC 引数形式の統一

**修正対象ファイル**: `${TASK_BASE}/task-020b-task-9a-skill-editor.md`

**関連 Pitfall**: P44（IPC インターフェース不整合）、P45（引数命名の契約ドリフト）

**修正内容**: Step 2 のコード例で使用されている positional 形式の `safeInvoke` 呼び出しをオブジェクト形式に統一する。

#### Before（現状）

```typescript
// Preload API 呼び出し（positional 形式）
const content = await window.electronAPI.skill.readFile(skillName, filePath);
// 内部: safeInvoke(IPC_CHANNELS.SKILL_READ_FILE, skillName, filePath)

await window.electronAPI.skill.writeFile(skillName, filePath, content);
// 内部: safeInvoke(IPC_CHANNELS.SKILL_WRITE_FILE, skillName, filePath, content)

await window.electronAPI.skill.createFile(skillName, filePath, content);
// 内部: safeInvoke(IPC_CHANNELS.SKILL_CREATE_FILE, skillName, filePath, content)

await window.electronAPI.skill.deleteFile(skillName, filePath);
// 内部: safeInvoke(IPC_CHANNELS.SKILL_DELETE_FILE, skillName, filePath)

const backups = await window.electronAPI.skill.listBackups(skillName);
// 内部: safeInvoke(IPC_CHANNELS.SKILL_LIST_BACKUPS, skillName)

await window.electronAPI.skill.restoreBackup(skillName, backupPath);
// 内部: safeInvoke(IPC_CHANNELS.SKILL_RESTORE_BACKUP, skillName, backupPath)
```

#### After（修正後）

```typescript
// Preload API 呼び出し（オブジェクト形式 — P44 対策）
const content = await window.electronAPI.skill.readFile({
  skillName,
  relativePath,
});
// 内部: safeInvoke(IPC_CHANNELS.SKILL_READ_FILE, { skillName, relativePath })

await window.electronAPI.skill.writeFile({ skillName, relativePath, content });
// 内部: safeInvoke(IPC_CHANNELS.SKILL_WRITE_FILE, { skillName, relativePath, content })

await window.electronAPI.skill.createFile({ skillName, relativePath, content });
// 内部: safeInvoke(IPC_CHANNELS.SKILL_CREATE_FILE, { skillName, relativePath, content })

await window.electronAPI.skill.deleteFile({ skillName, relativePath });
// 内部: safeInvoke(IPC_CHANNELS.SKILL_DELETE_FILE, { skillName, relativePath })

const backups = await window.electronAPI.skill.listBackups({ skillName });
// 内部: safeInvoke(IPC_CHANNELS.SKILL_LIST_BACKUPS, { skillName })

await window.electronAPI.skill.restoreBackup({ skillName, backupPath });
// 内部: safeInvoke(IPC_CHANNELS.SKILL_RESTORE_BACKUP, { skillName, backupPath })
```

**注意事項**:

1. 引数名は P45 準拠で実際の値のセマンティクスに一致させる（`filePath` → `relativePath`）
2. IPC ハンドラ側の型定義も対応するオブジェクト形式の interface を定義する
3. P42 準拠の 3 段バリデーション（型チェック → 空文字列 → トリム空文字列）を各ハンドラの注記に追加する

#### IPC ハンドラ型定義の追加

以下の型定義セクションを task-9a 仕様書の IPC インターフェース定義に追加する:

```typescript
// IPC ハンドラ引数型（P42 準拠 3 段バリデーション対応）
interface SkillReadFileArgs {
  skillName: string; // 3段バリデーション: typeof === "string" && !== "" && .trim() !== ""
  relativePath: string; // 3段バリデーション: typeof === "string" && !== "" && .trim() !== ""
}

interface SkillWriteFileArgs extends SkillReadFileArgs {
  content: string; // typeof === "string"（空文字列は許可: 空ファイル作成のケース）
}

interface SkillCreateFileArgs extends SkillWriteFileArgs {}

interface SkillDeleteFileArgs extends SkillReadFileArgs {}

interface SkillListBackupsArgs {
  skillName: string; // 3段バリデーション
}

interface SkillRestoreBackupArgs {
  skillName: string; // 3段バリデーション
  backupPath: string; // 3段バリデーション
}
```

---

### Step 2: Gap 1 修正 — Date 型シリアライズ注記追加

**修正対象ファイル**:

1. `${TASK_BASE}/task-022-task-9f-skill-share.md`
2. `${TASK_BASE}/task-023a-task-9g-skill-schedule.md`
3. `${TASK_BASE}/task-023b-task-9h-skill-debug.md`（波及）
4. `${TASK_BASE}/task-023d-task-9j-skill-analytics.md`

**関連 Pitfall**: なし（新規方針の策定）

**シリアライズ方針**:

| 型               | IPC 型定義（Preload ↔ Renderer） | バックエンド内部（Main Process） | 変換タイミング                      |
| ---------------- | -------------------------------- | -------------------------------- | ----------------------------------- |
| Date             | `string`（ISO 8601）             | `Date`                           | ハンドラの戻り値で `.toISOString()` |
| Date（nullable） | `string \| null`                 | `Date \| null`                   | 同上、`null` はそのまま             |

#### 2-A: task-9f（スキル共有）の修正

**Before**:

```typescript
export interface ImportResult {
  importedAt: Date;
  // ...
}
```

**After**:

```typescript
export interface ImportResult {
  /** @format ISO 8601 — IPC経由では string として送受信。バックエンド内部では Date を使用し、ハンドラ戻り値で .toISOString() に変換する */
  importedAt: string; // ISO 8601 (例: "2026-02-24T12:00:00.000Z")
  // ...
}
```

#### 2-B: task-9g（スキルスケジュール）の修正

**Before**:

```typescript
export interface ScheduledSkill {
  lastRun?: Date;
  nextRun?: Date;
  // ...
}

export interface SkillSchedule {
  runAt?: Date;
  // ...
}

export interface ScheduledRunResult {
  startedAt: Date;
  completedAt?: Date;
  // ...
}
```

**After**:

```typescript
export interface ScheduledSkill {
  /** @format ISO 8601 — IPC経由では string として送受信 */
  lastRun?: string | null; // ISO 8601
  /** @format ISO 8601 */
  nextRun?: string | null; // ISO 8601
  // ...
}

export interface SkillSchedule {
  /** @format ISO 8601 */
  runAt?: string | null; // ISO 8601
  // ...
}

export interface ScheduledRunResult {
  /** @format ISO 8601 */
  startedAt: string; // ISO 8601
  /** @format ISO 8601 */
  completedAt?: string | null; // ISO 8601
  // ...
}
```

#### 2-C: task-9h（スキルデバッグ）の修正 — Gap 1 波及

**Before**:

```typescript
export interface DebugSession {
  startedAt: Date;
  // ...
}

export interface DebugStep {
  timestamp: Date;
  // ...
}

export interface CallStackEntry {
  startTime: Date;
  // ...
}
```

**After**:

```typescript
export interface DebugSession {
  /** @format ISO 8601 — IPC経由では string として送受信 */
  startedAt: string; // ISO 8601
  // ...
}

export interface DebugStep {
  /** @format ISO 8601 */
  timestamp: string; // ISO 8601
  // ...
}

export interface CallStackEntry {
  /** @format ISO 8601 */
  startTime: string; // ISO 8601
  // ...
}
```

#### 2-D: task-9j（スキル分析）の修正

**Before**:

```typescript
export interface SkillUsageEvent {
  timestamp: Date;
  // ...
}

export interface SkillStatistics {
  lastUsed?: Date;
  // ...
}

export interface AnalyticsPeriod {
  start: Date;
  end: Date;
}

export interface TrendDataPoint {
  timestamp: Date;
  // ...
}

export interface SkillUsageSummary {
  lastUsed: Date;
  // ...
}
```

**After**:

```typescript
export interface SkillUsageEvent {
  /** @format ISO 8601 — IPC経由では string として送受信 */
  timestamp: string; // ISO 8601
  // ...
}

export interface SkillStatistics {
  /** @format ISO 8601 */
  lastUsed?: string | null; // ISO 8601
  // ...
}

export interface AnalyticsPeriod {
  /** @format ISO 8601 — Renderer から送信時も ISO 8601 文字列を使用 */
  start: string; // ISO 8601
  /** @format ISO 8601 */
  end: string; // ISO 8601
}

export interface TrendDataPoint {
  /** @format ISO 8601 */
  timestamp: string; // ISO 8601
  // ...
}

export interface SkillUsageSummary {
  /** @format ISO 8601 */
  lastUsed: string; // ISO 8601
  // ...
}
```

#### 共通: IPC シリアライズ方針セクションの追加

各仕様書に以下の共通セクションを追加する（型定義セクションの直前または直後）:

```markdown
### IPC シリアライズ方針（Date 型）

本タスクの Date 型フィールドは IPC 経由で ISO 8601 文字列（`string`）として送受信する。

- **バックエンド（Main Process）内部**: `Date` オブジェクトを使用
- **IPC 境界（ハンドラ戻り値）**: `.toISOString()` で ISO 8601 文字列に変換
- **Renderer 側**: `string` として受け取り、表示時に `new Date(isoString)` で復元

この方針は以下の理由に基づく:

1. contextBridge の Structured Clone は Date を保持するが、JSON API（Web版）では string に変換される
2. ISO 8601 文字列であれば `new Date()` で確実に復元可能
3. IPC 型とドメイン型の混在を避け、型安全性を維持
```

---

### Step 3: Gap 2 修正 — DebugSession.status に idle 追加

**修正対象ファイル**: `${TASK_BASE}/task-023b-task-9h-skill-debug.md`

**関連 Pitfall**: なし

#### Before

```typescript
export interface DebugSession {
  id: string;
  skillName: string;
  status: "running" | "paused" | "completed" | "error";
  // ...
}
```

#### After

```typescript
export interface DebugSession {
  id: string;
  skillName: string;
  status: "idle" | "running" | "paused" | "completed" | "error";
  // ...
}
```

**`idle` の定義**: デバッグセッションが未開始の初期状態。DebugPanel のマウント時にデフォルトで設定される。`skill:debug:start` ハンドラの呼び出し前のデフォルト値として使用する。

#### status 値セットの整合性確認

| 値          | task-9h（バックエンド） | 05B（フロントエンド） | 説明                       |
| ----------- | ----------------------- | --------------------- | -------------------------- |
| `idle`      | ✅ 追加                 | ✅ 既存               | セッション未開始           |
| `running`   | ✅ 既存                 | ✅ 既存               | 実行中                     |
| `paused`    | ✅ 既存                 | ✅ 既存               | ブレークポイントで一時停止 |
| `completed` | ✅ 既存                 | ✅ 既存               | 正常完了                   |
| `error`     | ✅ 既存                 | ✅ 既存               | エラー終了                 |

---

### Step 4: Gap 3 修正 — DocPreview の onExport データフロー定義

**修正対象ファイル**: `${TASK_BASE}/task-030-ui-05-skill-center-view.md`

**関連 Pitfall**: なし

#### Before

```typescript
interface DocPreviewProps {
  doc: GeneratedDoc | null;
  isLoading: boolean;
  onExport: (format: string, path: string) => void;
  onCopy: () => void;
  onClose: () => void;
}
```

#### After

```typescript
interface DocPreviewProps {
  doc: GeneratedDoc | null;
  isLoading: boolean;
  /** docId ベースのエクスポート — Main 側で docId からドキュメントを取得して出力する */
  onExport: (docId: string, format: ExportFormat, outputPath: string) => void;
  onCopy: () => void;
  onClose: () => void;
}

/** エクスポート形式の型安全な定義 */
type ExportFormat = "markdown" | "html" | "pdf";
```

#### IPC データフロー図の追加

以下のデータフロー説明を task-030 の DocPreview セクションに追加する:

```markdown
#### DocPreview エクスポートのデータフロー

1. **Renderer（DocPreview）**: ユーザーがエクスポートボタンをクリック
   - `onExport(doc.id, selectedFormat, outputPath)` を呼び出す
   - `doc` オブジェクト全体ではなく `doc.id`（docId）のみを渡す

2. **Preload（contextBridge）**: IPC チャネルに変換
   - `safeInvoke(IPC_CHANNELS.SKILL_DOCS_EXPORT, { docId, format, outputPath })`

3. **Main（IPC ハンドラ）**: ドキュメント取得＋エクスポート実行
   - `docId` から `GeneratedDoc` を取得（SkillDocsService 経由）
   - `exportToFile(doc, outputPath)` を実行
   - 結果を `ExportResult` として返す

4. **Preload → Renderer**: 結果を返す
   - `ExportResult` をそのまま返す（Date 型フィールドがある場合は ISO 8601 文字列）
```

**理由**: Renderer から Main へ `GeneratedDoc` オブジェクト全体を渡すのではなく、`docId` のみを渡す。これにより:

1. IPC 経由で大きなオブジェクトを転送するコストを回避
2. Main 側で最新のドキュメント状態を使用可能
3. Renderer 側のキャッシュ不整合リスクを排除

---

### Step 5: Gap 4 修正 — ExportResult 変換ロジック追加

**修正対象ファイル**: `${TASK_BASE}/task-030-ui-05-skill-center-view.md`

**関連 Pitfall**: なし

#### 追加する変換ロジック注記

task-030 の ExportSkillDialog セクションに以下を追加:

```markdown
#### ExportResult → UI コールバック変換ロジック

`skill:export` IPC ハンドラの戻り値 `ExportResult`（task-9f 定義）を ExportSkillDialog の UI 表示に変換するロジック:

##### 成功時（`ExportResult.success === true`）

- `shareUrl` が存在する場合: 共有 URL をダイアログに表示し、クリップボードコピーボタンを有効化
- `shareUrl` が `undefined` の場合（ローカルエクスポート）: 「エクスポート完了」メッセージと出力先パスを表示
- `exportedFiles` の件数を「N 件のファイルをエクスポートしました」として表示

##### 失敗時（`ExportResult.success === false`）

- エラーメッセージを表示（`ExportResult` に `error?: string` フィールドを追加検討）
- リトライボタンを有効化
- 連続失敗時（3回以上）は「手動エクスポートを試してください」の案内を表示
```

```typescript
// ExportResult → UI 変換の型定義
interface ExportDialogState {
  isExporting: boolean;
  result: ExportResult | null;
  errorMessage: string | null;
  retryCount: number;
}

// 変換関数の概要
function handleExportResult(result: ExportResult): ExportDialogState {
  if (result.success) {
    return {
      isExporting: false,
      result,
      errorMessage: null,
      retryCount: 0,
    };
  }
  return {
    isExporting: false,
    result,
    errorMessage: "エクスポートに失敗しました。再試行してください。",
    retryCount: prev.retryCount + 1,
  };
}
```

---

### Step 6: Gap 5 修正 — safeOn 購読仕様追加

**修正対象ファイル**: `${TASK_BASE}/task-031b-ui-05b-skill-advanced-views.md`

**関連 Pitfall**: P5（リスナー二重登録）

#### 追加する safeOn 購読仕様

05B の DebugPanel セクションに以下を追加:

```markdown
#### skill:debug:event のイベント購読（P5 対策）

DebugPanel は `skill:debug:event` チャネルを `safeOn` で購読し、デバッグイベント（ステップ実行、ブレークポイントヒット、変数変更等）をリアルタイムで受信する。

##### 購読パターン（React StrictMode 対応）

P5（リスナー二重登録）を防止するため、`useEffect` のクリーンアップ関数でリスナーを解除する:
```

```typescript
// DebugPanel のイベント購読パターン（P5 対策）
useEffect(() => {
  // safeOn はクリーンアップ関数を返す
  const cleanup = window.electronAPI.skill.onDebugEvent((event: DebugEvent) => {
    switch (event.type) {
      case "step":
        setCurrentStep(event.step);
        break;
      case "breakpoint-hit":
        setSessionStatus("paused");
        setCurrentBreakpoint(event.breakpoint);
        break;
      case "variable-changed":
        setVariables((prev) => ({ ...prev, [event.path]: event.value }));
        break;
      case "session-ended":
        setSessionStatus(event.error ? "error" : "completed");
        break;
    }
  });

  // StrictMode 対策: アンマウント時にリスナーを確実に解除
  return () => cleanup();
}, []); // 依存配列は空 — リスナーはマウント時に一度だけ登録
```

```markdown
##### 注意事項

1. **React StrictMode**: 開発環境では `useEffect` が2回実行される。`cleanup()` 関数で確実にリスナーを解除しないと、リスナーが二重登録される（P5 パターン）
2. **safeOn の戻り値**: `safeOn` は解除関数（`() => void`）を返す。この戻り値を `useEffect` の return で呼び出す
3. **DebugEvent 型**: task-9h で定義される `DebugEvent` 型を使用する。IPC 経由のため Date フィールドは ISO 8601 文字列（Gap 1 方針）
4. **Preload 側の定義**: `safeOn(IPC_CHANNELS.SKILL_DEBUG_EVENT, callback)` として実装。IPC_CHANNELS 定数を使用する（ハードコード文字列禁止 — P27 対策）
```

#### Preload API の追加定義

05B に以下の Preload API 定義を追加:

```typescript
// Preload API（contextBridge 経由で公開）
interface SkillAPI {
  // ... 既存メソッド ...

  /** デバッグイベントの購読（Main → Renderer プッシュ通知） */
  onDebugEvent: (callback: (event: DebugEvent) => void) => () => void;
  // 戻り値は解除関数（safeOn パターン）
}
```

---

### Step 7: 整合性確認 — 全修正箇所の相互整合性チェック

**目的**: Step 1-6 で修正した全仕様書間で型定義・データフロー・命名が一貫していることを確認する。

#### 7-A: Date 型の一貫性確認

以下の全ファイルで Date 型フィールドが `string`（ISO 8601）に統一されていることを確認:

| ファイル | Date 型フィールド                                         | IPC 型                                 |
| -------- | --------------------------------------------------------- | -------------------------------------- |
| task-9f  | `importedAt`                                              | `string` (ISO 8601)                    |
| task-9g  | `lastRun`, `nextRun`, `runAt`, `startedAt`, `completedAt` | `string \| null` / `string` (ISO 8601) |
| task-9h  | `startedAt`, `timestamp`, `startTime`                     | `string` (ISO 8601)                    |
| task-9j  | `timestamp`, `lastUsed`, `start`, `end`                   | `string` / `string \| null` (ISO 8601) |

#### 7-B: DebugSession.status の一貫性確認

| ファイル | 型定義                             | 値セット                                                    |
| -------- | ---------------------------------- | ----------------------------------------------------------- |
| task-9h  | `DebugSession.status`              | `"idle" \| "running" \| "paused" \| "completed" \| "error"` |
| 05B      | `DebugControlsProps.sessionStatus` | `"idle" \| "running" \| "paused" \| "completed" \| "error"` |

→ 値セットが完全一致していること

#### 7-C: IPC 引数形式の一貫性確認

task-9a の全 IPC 呼び出しがオブジェクト形式に統一されていること:

```bash
# 検証コマンド
grep -n "safeInvoke" "${TASK_BASE}/task-020b-task-9a-skill-editor.md" | grep -v "{"
# 期待: 0行
```

#### 7-D: DocPreview データフローの一貫性確認

05 の `onExport` 引数（`docId, format, outputPath`）が以下と整合していること:

- IPC チャネル `skill:docs:export` の引数（`{ docId, format, outputPath }`）
- Main 側ハンドラの引数型定義

#### 7-E: ExportResult 型の一貫性確認

task-9f の `ExportResult` 型と 05 の ExportSkillDialog の変換ロジックが整合していること:

- `ExportResult.success` → UI 表示の分岐条件
- `ExportResult.shareUrl` → 共有 URL の表示
- `ExportResult.exportedFiles` → ファイル数の表示

---

## 統合テスト連携

| 連携観点           | 実施内容                                                                    | 検証先                          |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------- |
| IPC 契約整合       | Renderer → Preload → Main の引数型/戻り値型を突合し、契約ドリフトを防止する | Phase 4〜7 の検証コマンドと結果 |
| 型変換整合         | Date/ISO 8601・ExportResult 変換・DebugEvent ペイロードの境界変換を確認する | 修正対象 7 仕様書 + Phase 6/7   |
| イベント購読安全性 | safeOn + cleanup による二重登録防止（P5）を確認する                         | 05B 仕様書 + Phase 6/9          |

## 成果物

| 成果物           | パス                                                                                         | 説明           |
| ---------------- | -------------------------------------------------------------------------------------------- | -------------- |
| 仕様書修正手順書 | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-5-implementation.md` | 本ドキュメント |

## 完了条件

- [ ] Step 1: task-9a の IPC 引数形式がオブジェクト形式に統一されている
- [ ] Step 2: task-9f, 9g, 9h, 9j の Date 型フィールドに ISO 8601 シリアライズ方針が明記されている
- [ ] Step 3: task-9h の DebugSession.status に `idle` が追加されている
- [ ] Step 4: 05 の DocPreviewProps.onExport が docId ベースのフローに修正されている
- [ ] Step 5: 05 の ExportSkillDialog に ExportResult 変換ロジックが記載されている
- [ ] Step 6: 05B の DebugPanel に safeOn 購読仕様と P5 対策が追加されている
- [ ] Step 7: 全修正箇所の相互整合性が確認されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## 次の Phase

Phase 6: 仕様書間相互整合性検証（テスト拡充に代えて）→ `phase-6-test-expansion.md`
