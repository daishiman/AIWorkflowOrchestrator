# Phase 6: 仕様書間相互整合性検証（テスト拡充に代えて）

## メタ情報

| 項目       | 値                             |
| ---------- | ------------------------------ |
| Phase      | 6                              |
| タスクID   | UT-IPC-DATA-FLOW-TYPE-GAPS-001 |
| 機能名     | データフロー型ギャップ解消     |
| 作成日     | 2026-02-24                     |
| タスク種別 | 仕様書修正のみ                 |
| 前提Phase  | Phase 5（仕様書修正）          |

## 目的

Phase 5 で修正した 7 つの仕様書間で、型定義・データフロー・命名規約が相互に整合していることを検証する。コード変更がないため、テスト拡充ではなく仕様書の横断的整合性確認を実施する。

## 参照資料

| ドキュメント               | パス                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Phase 1 抽出成果物         | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-1/aiworkflow-requirements-extraction.md` |
| Phase 5                    | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-5-implementation.md`                             |
| Phase 4                    | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-4-test-creation.md`                              |
| 実装パターン仕様           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                              |
| IPC セキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                             |
| Skill インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                        |

## 実行タスク

- 横断整合検証: Date/Status/IPC 引数の整合を横断確認する
- データフロー検証: 5ポイントで型変換境界を検証する
- 品質規約検証: Pitfall 参照と命名規約の一貫性を検証する

### Task 1: Date 型シリアライズ方針の横断的一貫性検証

**目的**: 4 つの仕様書（task-9f, 9g, 9h, 9j）で Date 型のシリアライズ方針が統一されていること

#### 検証項目

| #   | 検証内容                                                 | 対象ファイル        | 期待結果                                                                |
| --- | -------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------- |
| 1-1 | Date 型フィールドが `string`（ISO 8601）に変更されている | task-9f, 9g, 9h, 9j | 全ファイルで `string` に統一                                            |
| 1-2 | `@format ISO 8601` JSDoc 注記が付与されている            | task-9f, 9g, 9h, 9j | 全 Date フィールドに注記あり                                            |
| 1-3 | nullable フィールドが `string \| null` と定義されている  | task-9g, 9j         | `lastRun?`, `nextRun?`, `completedAt?`, `lastUsed?` が `string \| null` |
| 1-4 | IPC シリアライズ方針セクションが追加されている           | task-9f, 9g, 9h, 9j | 共通方針セクションが存在                                                |
| 1-5 | 変換タイミング（`.toISOString()`）が明記されている       | task-9f, 9g, 9h, 9j | ハンドラ戻り値での変換を明記                                            |

#### 検証コマンド

```bash
TASK_BASE="docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence"

# 全ファイルで ISO 8601 の記載を確認
for file in task-022-task-9f-skill-share.md task-023a-task-9g-skill-schedule.md task-023b-task-9h-skill-debug.md task-023d-task-9j-skill-analytics.md; do
  echo "=== ${file} ==="
  grep -c "ISO 8601" "${TASK_BASE}/${file}"
done
# 期待: 全ファイルで 1 以上

# Date 型が string に変更されていないファイルの検出（漏れ検出）
for file in task-022-task-9f-skill-share.md task-023a-task-9g-skill-schedule.md task-023b-task-9h-skill-debug.md task-023d-task-9j-skill-analytics.md; do
  echo "=== ${file} ==="
  grep -n ": Date" "${TASK_BASE}/${file}" | grep -v "JSDoc\|コメント\|バックエンド内部\|ドメイン"
done
# 期待: IPC 型定義内に `: Date` が残っていない（バックエンド内部説明での言及は許容）
```

### Task 2: DebugSession.status の相互整合性検証

**目的**: task-9h と 05B で `DebugSession.status` / `DebugControlsProps.sessionStatus` の値セットが一致していること

#### 検証項目

| #   | 検証内容                                                      | 対象ファイル | 期待結果                                                    |
| --- | ------------------------------------------------------------- | ------------ | ----------------------------------------------------------- |
| 2-1 | task-9h の status に `idle` が含まれる                        | task-9h      | `"idle" \| "running" \| "paused" \| "completed" \| "error"` |
| 2-2 | 05B の sessionStatus と値セットが一致                         | 05B          | 同上                                                        |
| 2-3 | `idle` の定義説明が task-9h に記載されている                  | task-9h      | 「セッション未開始の初期状態」の説明あり                    |
| 2-4 | 05B の DebugControls で idle 時のボタン無効化が定義されている | 05B          | idle 時は continue/stepOver 等が disabled                   |

#### 検証コマンド

```bash
# task-9h の status 値セット確認
grep -n "idle\|running\|paused\|completed\|error" "${TASK_BASE}/task-023b-task-9h-skill-debug.md" | head -5

# 05B の sessionStatus 値セット確認
grep -n "idle\|running\|paused\|completed\|error" "${TASK_BASE}/task-031b-ui-05b-skill-advanced-views.md" | head -5
```

### Task 3: IPC データフローの型変換ポイント検証

**目的**: IPC の各ポイント（Renderer → Preload → Main → Preload → Renderer）で型変換が明確に定義されていること

#### 検証マトリクス

| データフロー        | 送信側の型                    | IPC チャネル          | 受信側の型                                                    | 変換ポイント                  | 対象ファイル |
| ------------------- | ----------------------------- | --------------------- | ------------------------------------------------------------- | ----------------------------- | ------------ |
| DocPreview → Main   | `(docId, format, outputPath)` | `skill:docs:export`   | `{ docId: string, format: ExportFormat, outputPath: string }` | Preload で object 化          | 05           |
| Main → ExportDialog | `ExportResult`                | `skill:export` 戻り値 | `ExportDialogState`                                           | `handleExportResult()` で変換 | 05, task-9f  |
| Main → DebugPanel   | `DebugEvent`                  | `skill:debug:event`   | DebugPanel state 更新                                         | `safeOn` コールバック内で分岐 | 05B, task-9h |
| Editor → Main       | `(skillName, relativePath)`   | `skill:readFile`      | `{ skillName, relativePath }`                                 | Preload で object 化          | task-9a      |

#### 検証項目

| #   | 検証内容                                                             | 期待結果                             |
| --- | -------------------------------------------------------------------- | ------------------------------------ |
| 3-1 | DocPreview の `onExport` 引数が `(docId, format, outputPath)` に統一 | 05 に記載                            |
| 3-2 | ExportResult の変換ロジックが 05 に記載                              | 成功/失敗の分岐ロジックあり          |
| 3-3 | DebugEvent の safeOn 購読パターンが 05B に記載                       | P5 対策付きの useEffect パターンあり |
| 3-4 | task-9a の IPC 引数がオブジェクト形式に統一                          | 全 safeInvoke がオブジェクト形式     |

### Task 4: Pitfall 参照の整合性検証

**目的**: 修正した仕様書が参照すべき Pitfall（P5, P42, P44, P45）を正しく参照していること

#### 検証項目

| #   | 検証内容                                | 対象ファイル | 期待結果                                              |
| --- | --------------------------------------- | ------------ | ----------------------------------------------------- |
| 4-1 | Gap 6 修正で P44 への参照が含まれている | task-9a      | P44 対策としてオブジェクト形式を使用する旨の記載      |
| 4-2 | Gap 6 修正で P45 への参照が含まれている | task-9a      | 引数名のセマンティクス一致（`relativePath` 等）の記載 |
| 4-3 | Gap 6 修正で P42 への参照が含まれている | task-9a      | 3段バリデーション方針の記載                           |
| 4-4 | Gap 5 修正で P5 への参照が含まれている  | 05B          | リスナー二重登録防止の記載                            |
| 4-5 | Gap 5 修正で P27 への参照が含まれている | 05B          | IPC_CHANNELS 定数使用の記載                           |

#### 検証コマンド

```bash
# P44/P45/P42 の参照確認（task-9a）
grep -n "P44\|P45\|P42\|3段バリデーション\|オブジェクト形式" "${TASK_BASE}/task-020b-task-9a-skill-editor.md"

# P5/P27 の参照確認（05B）
grep -n "P5\|P27\|二重登録\|IPC_CHANNELS\|ハードコード" "${TASK_BASE}/task-031b-ui-05b-skill-advanced-views.md"
```

### Task 5: 命名規約の横断的一貫性検証

**目的**: 修正した全仕様書で引数名・型名・チャネル名の命名が一貫していること

#### 検証項目

| #   | 検証内容                                                                  | 期待結果                        |
| --- | ------------------------------------------------------------------------- | ------------------------------- |
| 5-1 | `skillName` が全仕様書で統一されている（`skillId` が混在していない）      | P45 準拠                        |
| 5-2 | `relativePath` が task-9a で統一されている（`filePath` が混在していない） | P45 準拠                        |
| 5-3 | `ExportFormat` 型が 05 と task-9f で一致している                          | `"markdown" \| "html" \| "pdf"` |
| 5-4 | `DebugEvent` 型が task-9h と 05B で一致している                           | 同一の型を参照                  |

#### 検証コマンド

```bash
# skillId の残存確認（P45 ドリフト検出）
grep -n "skillId" "${TASK_BASE}/task-020b-task-9a-skill-editor.md"
# 期待: 0行（全て skillName に統一）

# filePath の残存確認
grep -n "filePath" "${TASK_BASE}/task-020b-task-9a-skill-editor.md" | grep -v "relativePath"
# 期待: 0行（全て relativePath に統一）
```

## 統合テスト連携

| 連携観点           | 実施内容                                                                    | 検証先                          |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------- |
| IPC 契約整合       | Renderer → Preload → Main の引数型/戻り値型を突合し、契約ドリフトを防止する | Phase 4〜7 の検証コマンドと結果 |
| 型変換整合         | Date/ISO 8601・ExportResult 変換・DebugEvent ペイロードの境界変換を確認する | 修正対象 7 仕様書 + Phase 6/7   |
| イベント購読安全性 | safeOn + cleanup による二重登録防止（P5）を確認する                         | 05B 仕様書 + Phase 6/9          |

## 成果物

| 成果物           | パス                                                                                         | 説明           |
| ---------------- | -------------------------------------------------------------------------------------------- | -------------- |
| 相互整合性検証書 | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-6-test-expansion.md` | 本ドキュメント |

## 完了条件

- [ ] Task 1: Date 型シリアライズ方針が 4 ファイルで統一されていることを確認
- [ ] Task 2: DebugSession.status の値セットが task-9h と 05B で一致していることを確認
- [ ] Task 3: IPC データフローの各ポイントで型変換が明確に定義されていることを確認
- [ ] Task 4: 関連 Pitfall（P5, P42, P44, P45, P27）への参照が正しいことを確認
- [ ] Task 5: 引数名・型名の命名が全仕様書で一貫していることを確認
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## 次の Phase

Phase 7: 全 Gap 修正の網羅性確認（カバレッジ確認に代えて）→ `phase-7-coverage-check.md`
