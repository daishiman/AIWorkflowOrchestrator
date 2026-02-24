---
id: UT-IPC-DATA-FLOW-TYPE-GAPS-001
title: "task-9 バックエンド型定義と UI Props 間のデータフロー型ギャップ解消"
tier: 3
depends_on: [TASK-9A]
status: spec_created
priority: medium
estimated_complexity: large
tags: [backend, frontend, types, ipc, data-flow, serialization]
---

# task-9 バックエンド型定義と UI Props 間のデータフロー型ギャップ解消

## 1. Why（なぜ必要か）

### 1.1 背景

task-9 シリーズ（9A-9J）のバックエンド型定義と、UIタスク（task-030-ui-05-skill-center-view.md / task-031b-ui-05b-skill-advanced-views.md）のフロントエンド Props 定義の間に、複数のデータフロー型ギャップが検出された。これらのギャップは IPC を介したデータ受け渡し時に型不整合やランタイムエラーを引き起こす。

### 1.2 問題点

以下の6つの型ギャップが存在する:

**Gap 1: Date 型の IPC シリアライズ問題**

- task-9g の `ScheduledSkill.lastRun` / `nextRun` で `Date` 型を使用
- task-9j の `AnalyticsPeriod.start` / `end` で `Date` 型を使用
- task-9f の `ImportResult.importedAt` で `Date` 型を使用
- IPC 経由（Electron の Structured Clone Algorithm）では `Date` オブジェクトは保持されるが、JSON.stringify/parse を経由する場合は `string` に変換される。仕様書にシリアライズ方針が明記されていない

**Gap 2: DebugControls の idle 状態不整合**

- 05B の `DebugControlsProps` に `idle` 状態が含まれる
- task-9h の `DebugSession.status` は `running | paused | completed | error` のみで `idle` が含まれない
- フロントエンド側で「セッション未開始」を `idle` として独自マッピングする必要があるが、その変換ロジックが未定義

**Gap 3: DocPreview の onExport 引数不整合**

- 05-skill-center-view.md の `DocPreviewProps.onExport` は `(format: string, path: string)` を受け取る
- task-9i のバックエンド `exportToFile` は `(doc: GeneratedDoc, outputPath: string)` を受け取る
- Renderer から Main へ `GeneratedDoc` オブジェクト全体を渡すフローが未定義。ドキュメント ID ベースで取得するのか、Renderer 側でキャッシュしたオブジェクトを渡すのか方針が不明確

**Gap 4: ExportResult の型ギャップ**

- task-9f の `ExportResult` は `{ success, destination, exportedFiles, shareUrl? }` の完全なオブジェクト
- 05 の `ExportSkillDialog` のコールバックは `shareUrl` のみを渡す設計
- `ExportResult` から `shareUrl` への変換ロジック、およびエラー時（`success: false`）のハンドリングが未記載

**Gap 5: skill:debug:event のイベント購読仕様が未記載**

- task-9h で定義される `skill:debug:event` は Main → Renderer へのプッシュ通知（`ipcMain.on` / Renderer 側 `safeOn`）
- 05B の `DebugPanel` にはこのイベント購読（`safeOn` パターン）の仕様が記載されていない
- P5（リスナー二重登録）のリスクが未検討

**Gap 6: task-9a 仕様書の IPC 引数形式が実装と乖離**

- task-9a の Step 2 コード例では個別引数（positional）形式: `safeInvoke(CHANNELS.SKILL_READ, skillName, filePath)`
- 実装済みコード（UT-FIX-SKILL-IMPORT-INTERFACE-001 以降）はオブジェクト形式: `safeInvoke(CHANNELS.SKILL_READ, { skillName, filePath })`
- 仕様書と実装の乖離が P44 パターンの再発リスクを生む

### 1.3 放置した場合の影響

- task-9D-J の実装時に、バックエンド型とフロントエンド Props の不整合により型エラーまたはランタイムエラーが発生する
- Date 型のシリアライズ方針が不統一のまま実装が進み、一部の画面で日時表示が `[object Object]` や `Invalid Date` になる
- DebugPanel のイベント購読で P5（リスナー二重登録）が発生し、デバッグイベントが重複通知される
- 仕様書と実装の乖離が拡大し、後続の実装者が誤った前提で開発する

---

## 2. What（何をするか）

### 2.1 目的

task-9 シリーズのバックエンド型定義と 本ディレクトリの UI タスク群のフロントエンド Props 定義の間に存在する6つの型ギャップを仕様書レベルで解消する。

### 2.2 最終ゴール

- 全 Date 型フィールドに IPC シリアライズ方針（ISO 8601 文字列）が明記されている
- DebugSession.status に `idle` が追加され、フロントエンドとの整合性が取れている
- DocPreview の onExport のデータフローが明確に定義されている
- ExportResult から UI コールバックへの変換ロジックが記載されている
- skill:debug:event の safeOn 購読仕様が 05B に追加されている
- task-9a の IPC 引数形式がオブジェクト形式に統一されている

### 2.3 スコープ

#### 含むもの

- task-9a の Step 2 コード例修正（positional → オブジェクト形式）
- task-9f, 9g, 9j の Date 型フィールドにシリアライズ注記追加
- task-9h の DebugSession.status に `idle` を追加
- 05-skill-center-view.md の DocPreviewProps.onExport 修正
- 05B-skill-advanced-views.md に skill:debug:event の safeOn 購読仕様追加
- 05-skill-center-view.md の ExportSkillDialog に変換ロジック注記追加

#### 含まないもの

- 実コードの変更（本タスクは仕様書修正のみ）
- Date 型のユーティリティ関数実装（別タスク）
- IPC ハンドラの実装変更

### 2.4 成果物

| 成果物         | パス                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| task-9a 修正   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-020b-task-9a-skill-editor.md`        |
| task-9f 修正   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`          |
| task-9g 修正   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023a-task-9g-skill-schedule.md`      |
| task-9h 修正   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023b-task-9h-skill-debug.md`         |
| task-9j 修正   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023d-task-9j-skill-analytics.md`     |
| 05 UI仕様修正  | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md`      |
| 05B UI仕様修正 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-031b-ui-05b-skill-advanced-views.md` |

---

## 3. How（どう実現するか）

### 3.1 前提条件

- task-9a-9j の仕様書が存在すること
- 05-skill-center-view.md / 05B-skill-advanced-views.md が存在すること

### 3.2 依存タスク

| タスクID | 関係     | 説明                   |
| -------- | -------- | ---------------------- |
| TASK-9A  | 修正対象 | スキルエディタ仕様     |
| TASK-9F  | 修正対象 | スキル共有機能仕様     |
| TASK-9G  | 修正対象 | スキルスケジュール仕様 |
| TASK-9H  | 修正対象 | スキルデバッグ仕様     |
| TASK-9J  | 修正対象 | スキル分析仕様         |

### 3.3 必要な知識

- Electron Structured Clone Algorithm の挙動（Date オブジェクトはコピーされるが、JSON 経由では string になる）
- IPC データフロー: Renderer → Preload（contextBridge） → Main → Preload（contextBridge） → Renderer
- P5（リスナー二重登録）パターンと safeOn の使い方
- P44（IPC インターフェース不整合）パターンの再発防止

### 3.4 推奨アプローチ

#### Date 型シリアライズ方針

IPC 経由のデータ受け渡しでは、Date 型を **ISO 8601 文字列（`string`）** として定義する。理由:

1. Electron の contextBridge は Structured Clone を使用するが、将来的に JSON API 経由（Web 版等）にも対応する可能性がある
2. ISO 8601 文字列であれば `new Date(isoString)` で復元可能
3. TypeScript の型定義で `Date` と `string` の混在を避けられる

具体的には、バックエンド型定義の `Date` フィールドを `string` に変更し、JSDoc に `@format ISO 8601` を追記する。

#### DebugSession.status の idle 追加

DebugSession が存在しない（未開始）状態を表す `idle` を status ユニオンに追加する。これにより、フロントエンド側での独自マッピングが不要になる。

#### DocPreview の onExport データフロー

ドキュメント ID ベースのフローを採用する:

1. Renderer: `onExport(docId, format, outputPath)` を呼び出す
2. Preload: `safeInvoke('skill:docs:export', { docId, format, outputPath })` を送信
3. Main: `docId` からドキュメントを取得し、`exportToFile(doc, outputPath)` を実行

### 3.5 実装課題と解決策

#### 課題1: Date → string 変更の影響範囲

- **問題**: Date 型を string に変更すると、バックエンドサービス内で `Date` オブジェクトのメソッド（`.getTime()`, `.toLocaleDateString()` 等）を使用している箇所が型エラーになる
- **解決策**: バックエンド内部では `Date` を使用し、IPC の境界（ハンドラの戻り値）で `.toISOString()` に変換する。型定義は IPC 型（string）とドメイン型（Date）を分離する

#### 課題2: skill:debug:event の P5 対策

- **問題**: DebugPanel が React StrictMode で2回マウントされると、safeOn リスナーが二重登録される可能性がある
- **解決策**: 05B に「モジュールレベルのガード」パターンを明記する。`useEffect` のクリーンアップ関数でリスナーを解除する仕様を追加する

---

## 4. Steps（実行手順）

### Step 1: Gap 6 修正 — task-9a IPC 引数形式の統一

1. task-020b-task-9a-skill-editor.md の Step 2 コード例を確認
2. `safeInvoke(CHANNELS.SKILL_READ, skillName, filePath)` を `safeInvoke(CHANNELS.SKILL_READ, { skillName, filePath })` に修正
3. 他の IPC 呼び出し例も同様にオブジェクト形式に統一

### Step 2: Gap 1 修正 — Date 型シリアライズ注記

1. task-023a-task-9g-skill-schedule.md の `ScheduledSkill` 型定義で `lastRun: Date` / `nextRun: Date` に以下の注記を追加:
   - 「IPC 経由では ISO 8601 文字列（`string`）として送受信する。バックエンド内部では `Date` を使用し、ハンドラの戻り値で `.toISOString()` に変換する」
2. task-023d-task-9j-skill-analytics.md の `AnalyticsPeriod` 型定義で同様の注記を追加
3. task-022-task-9f-skill-share.md の `ImportResult.importedAt` で同様の注記を追加

### Step 3: Gap 2 修正 — DebugSession.status に idle 追加

1. task-023b-task-9h-skill-debug.md の `DebugSession.status` 型を `'idle' | 'running' | 'paused' | 'stopped' | 'error'` に変更
2. `idle` の説明を追加: 「デバッグセッションが未開始の初期状態。DebugPanel のマウント時にデフォルトで設定される」

### Step 4: Gap 3 修正 — DocPreview の onExport データフロー

1. 05-skill-center-view.md の `DocPreviewProps.onExport` を `(docId: string, format: string, outputPath: string)` に修正
2. IPC データフローの図示を追加: Renderer → `skill:docs:export` → Main（docId でドキュメント取得） → ファイル出力

### Step 5: Gap 4 修正 — ExportResult 変換ロジック

1. 05-skill-center-view.md の ExportSkillDialog セクションに変換ロジック注記を追加:
   - 「`ExportResult.success === true` の場合: `shareUrl` をダイアログに表示」
   - 「`ExportResult.success === false` の場合: エラーメッセージを表示し、リトライボタンを有効化」

### Step 6: Gap 5 修正 — skill:debug:event の safeOn 購読仕様

1. 05B-skill-advanced-views.md の DebugPanel セクションに safeOn 購読仕様を追加:

```typescript
// DebugPanel のイベント購読パターン（P5 対策）
useEffect(() => {
  const cleanup = window.electronAPI.skill.onDebugEvent((event: DebugEvent) => {
    // イベントハンドリング
  });
  return () => cleanup(); // StrictMode 対策: クリーンアップでリスナー解除
}, []);
```

2. 「`safeOn` パターンを使用し、`useEffect` のクリーンアップ関数でリスナーを解除する」旨を明記

### Step 7: 整合性確認

1. 修正した全仕様書の型定義が一貫していることを確認
2. IPC のデータフロー（Renderer → Preload → Main → Preload → Renderer）で型変換ポイントが明確であることを確認

---

## 5. Checklist（チェックリスト）

- [ ] task-9a の IPC 引数形式がオブジェクト形式に統一されている
- [ ] task-9f, 9g, 9j の Date 型フィールドに IPC シリアライズ方針（ISO 8601 文字列）が明記されている
- [ ] task-9h の DebugSession.status に `idle` が追加されている
- [ ] 05 の DocPreviewProps.onExport が docId ベースのフローに修正されている
- [ ] 05 の ExportSkillDialog に ExportResult → UI コールバックの変換ロジックが記載されている
- [ ] 05B の DebugPanel に skill:debug:event の safeOn 購読仕様が追加されている
- [ ] 05B の DebugPanel に P5（リスナー二重登録）対策が明記されている
- [ ] 全修正箇所で型定義の一貫性が保たれている

---

## 6. Verification（検証方法）

### 仕様書検証

```bash
# Date型のシリアライズ注記が追加されていることを確認
grep -n "ISO 8601\|toISOString" docs/30-workflows/skill-import-agent-system/tasks/task-9{f,g,j}*.md

# DebugSession.status に idle が含まれていることを確認
grep -n "idle" docs/30-workflows/skill-import-agent-system/tasks/task-9h*.md

# safeOn パターンが 05B に追加されていることを確認
grep -n "safeOn\|onDebugEvent" docs/30-workflows/skill-import-agent-system/tasks/task-031b-ui-05b-skill-advanced-views.md

# task-9a のオブジェクト形式確認
grep -n "safeInvoke" docs/30-workflows/skill-import-agent-system/tasks/task-9a*.md
```

### 実装時の検証

```bash
# 型チェック（全パッケージ）
pnpm typecheck

# Date型の使用箇所確認
grep -rn "Date;" packages/shared/src/types/skill*.ts

# IPC ハンドラの引数形式確認
grep -rn "ipcMain.handle.*skill:" apps/desktop/src/main/ipc/
```

---

## 7. Risks（リスクと対策）

| リスク                                                             | 影響度 | 発生確率 | 対策                                                          |
| ------------------------------------------------------------------ | ------ | -------- | ------------------------------------------------------------- |
| Date → string 変更がバックエンドのドメインロジックに影響           | 中     | 中       | IPC 型とドメイン型を分離し、ハンドラの境界でのみ変換する      |
| DebugSession.status に idle 追加が既存テストに影響                 | 低     | 低       | task-9h は未実装のため既存テストへの影響なし                  |
| DocPreview の onExport 変更が 05 の他のセクションに波及            | 中     | 低       | 変更箇所を grep で全量検索してから修正                        |
| skill:debug:event の safeOn パターンが他のイベントチャネルと不整合 | 中     | 中       | 既存の safeOn 使用箇所（skill:import 等）のパターンに合わせる |
| 6つのギャップ修正が1タスクとして大きすぎる                         | 低     | 中       | 各ギャップを独立した Step として順次実行可能に設計            |

---

## 8. References（参照）

| ドキュメント        | パス                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| task-9a 仕様書      | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-020b-task-9a-skill-editor.md`        |
| task-9f 仕様書      | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`          |
| task-9g 仕様書      | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023a-task-9g-skill-schedule.md`      |
| task-9h 仕様書      | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023b-task-9h-skill-debug.md`         |
| task-9j 仕様書      | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-023d-task-9j-skill-analytics.md`     |
| 05 UI仕様書         | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md`      |
| 05B UI仕様書        | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-031b-ui-05b-skill-advanced-views.md` |
| P5（二重登録）      | `.claude/rules/06-known-pitfalls.md#P5`                                                                                              |
| P44（IPC不整合）    | `.claude/rules/06-known-pitfalls.md#P44`                                                                                             |
| P45（命名ドリフト） | `.claude/rules/06-known-pitfalls.md#P45`                                                                                             |

### 関連タスク

| タスクID                             | 関係 | 説明                          |
| ------------------------------------ | ---- | ----------------------------- |
| UT-FIX-SKILL-IMPORT-INTERFACE-001    | 参考 | IPC 引数形式の統一パターン    |
| UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 | 関連 | skill:import チャネル競合解消 |
| UT-SKILL-IPC-PRELOAD-EXTENSION-001   | 関連 | 30チャネル追加の全体計画      |

---

## 9. Notes（補足）

### IPC シリアライズ方針の統一基準

本タスクで確立する Date 型のシリアライズ方針は、task-9 シリーズ全体に適用される標準とする:

| 型               | IPC 定義             | バックエンド内部 | 変換タイミング                      |
| ---------------- | -------------------- | ---------------- | ----------------------------------- |
| Date             | `string`（ISO 8601） | `Date`           | ハンドラの戻り値で `.toISOString()` |
| Date（nullable） | `string \| null`     | `Date \| null`   | 同上、`null` はそのまま             |

### Electron Structured Clone vs JSON の挙動差

| 経路                             | Date の扱い                                     | 推奨                                  |
| -------------------------------- | ----------------------------------------------- | ------------------------------------- |
| `ipcMain.handle` → contextBridge | Structured Clone: Date オブジェクトが保持される | ISO 8601 文字列に統一（一貫性のため） |
| JSON.stringify → JSON.parse      | string に変換（`"2026-02-22T12:00:00.000Z"`）   | ISO 8601 文字列に統一                 |
| Web API（将来）                  | JSON のみ                                       | ISO 8601 文字列に統一                 |

Structured Clone で Date が保持されるケースでも、一貫性のために ISO 8601 文字列を使用する。これにより、Web 版との互換性も確保される。

### Gap 修正の優先順位

| Gap                        | 重要度 | 理由                                               |
| -------------------------- | ------ | -------------------------------------------------- |
| Gap 6（task-9a 引数形式）  | 高     | P44 再発防止。実装時に最初に参照される仕様書のため |
| Gap 5（debug:event 購読）  | 高     | P5（リスナー二重登録）の直接的なリスク             |
| Gap 1（Date シリアライズ） | 中     | 複数の task-9 に影響するが、実装時に対処可能       |
| Gap 2（idle 状態）         | 中     | フロントエンドの独自マッピングを排除               |
| Gap 3（onExport フロー）   | 中     | データフローの明確化                               |
| Gap 4（ExportResult 変換） | 低     | UI 側の表示ロジックのみ                            |
