# Phase 7: 全 Gap 修正の網羅性確認（カバレッジ確認に代えて）

## メタ情報

| 項目       | 値                                |
| ---------- | --------------------------------- |
| Phase      | 7                                 |
| タスクID   | UT-IPC-DATA-FLOW-TYPE-GAPS-001    |
| 機能名     | データフロー型ギャップ解消        |
| 作成日     | 2026-02-24                        |
| タスク種別 | 仕様書修正のみ                    |
| 前提Phase  | Phase 6（仕様書間相互整合性検証） |

## 目的

6 つの Gap すべてが修正されていることの網羅性を確認する。コード変更がないため、カバレッジ測定ではなく Gap → 修正ファイル → 検証結果のトレーサビリティマトリクスで網羅性を担保する。

## 参照資料

| ドキュメント         | パス                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| タスク仕様書         | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-011-ut-ipc-data-flow-type-gaps-001.md`            |
| Phase 1 抽出成果物   | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-1/aiworkflow-requirements-extraction.md` |
| Phase 4              | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-4-test-creation.md`                              |
| Phase 5              | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-5-implementation.md`                             |
| Phase 6              | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-6-test-expansion.md`                             |
| 実装パターン仕様     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                              |
| IPC セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                             |

## 実行タスク

### Task 1: トレーサビリティマトリクス

#### Gap → 修正ファイル → 修正内容 → 検証結果

| Gap | 問題の概要                           | 修正対象ファイル    | Phase 5 Step | 修正内容                                                          | 検証コマンド（Phase 4）                     | 検証結果        |
| --- | ------------------------------------ | ------------------- | ------------ | ----------------------------------------------------------------- | ------------------------------------------- | --------------- |
| 1   | Date型のIPCシリアライズ問題          | task-9f, 9g, 9h, 9j | Step 2       | Date → string (ISO 8601) + JSDoc注記 + シリアライズ方針セクション | `grep -n "ISO 8601"`                        | □ PASS / □ FAIL |
| 2   | DebugSession.status に idle がない   | task-9h             | Step 3       | status ユニオン型に `idle` を追加 + 定義説明                      | `grep -n "idle"`                            | □ PASS / □ FAIL |
| 3   | DocPreview onExport 引数不整合       | task-030 (05)       | Step 4       | onExport を docId ベースに修正 + IPC データフロー図               | `grep -n "docId"`                           | □ PASS / □ FAIL |
| 4   | ExportResult → UI 変換ロジック未記載 | task-030 (05)       | Step 5       | 変換ロジック注記 + 成功/失敗の分岐                                | `grep -n "ExportResult"`                    | □ PASS / □ FAIL |
| 5   | safeOn 購読仕様が 05B に未記載       | task-031b (05B)     | Step 6       | safeOn 購読パターン + P5 対策 + Preload API 定義                  | `grep -n "safeOn\|onDebugEvent"`            | □ PASS / □ FAIL |
| 6   | task-9a IPC 引数形式が positional    | task-020b (9a)      | Step 1       | オブジェクト形式に統一 + IPC 引数型定義 + P42 3段バリデーション   | `grep -n "safeInvoke" \| grep -v "{"` → 0行 | □ PASS / □ FAIL |

### Task 2: 修正漏れの grep 検証

#### 2-A: Date 型の修正漏れ検出

```bash
TASK_BASE="docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence"

# IPC 型定義内に Date 型が残存していないことを確認
echo "=== Date型残存チェック ==="
for file in task-022-task-9f-skill-share.md task-023a-task-9g-skill-schedule.md task-023b-task-9h-skill-debug.md task-023d-task-9j-skill-analytics.md; do
  result=$(grep -c ": Date;" "${TASK_BASE}/${file}" 2>/dev/null || echo "0")
  if [ "$result" -gt 0 ]; then
    echo "FAIL: ${file} に ': Date;' が ${result} 件残存"
    grep -n ": Date;" "${TASK_BASE}/${file}"
  else
    echo "PASS: ${file}"
  fi
done
```

**判定基準**: IPC 型定義セクション内の `: Date;` が 0 件であること。バックエンド内部説明での `Date` 型言及は許容する。

#### 2-B: positional 形式の残存検出

```bash
echo "=== positional形式残存チェック ==="
# safeInvoke の呼び出しでオブジェクト形式でないものを検出
grep -n "safeInvoke" "${TASK_BASE}/task-020b-task-9a-skill-editor.md" | grep -v "{" | grep -v "^#\|^\-\-"
# 期待: 0行
result=$?
if [ $result -eq 1 ]; then
  echo "PASS: positional形式の残存なし"
else
  echo "FAIL: positional形式が残存"
fi
```

#### 2-C: idle 状態の追加確認

```bash
echo "=== idle追加チェック ==="
# task-9h の DebugSession.status 定義行を抽出
grep -n "status.*idle\|idle.*status\|idle.*running\|running.*idle" "${TASK_BASE}/task-023b-task-9h-skill-debug.md"
# 期待: 1行以上ヒット
```

#### 2-D: safeOn パターンの追加確認

```bash
echo "=== safeOn購読チェック ==="
grep -n "safeOn\|onDebugEvent\|cleanup" "${TASK_BASE}/task-031b-ui-05b-skill-advanced-views.md"
# 期待: 3行以上ヒット（safeOn, onDebugEvent, cleanup の各キーワード）
```

#### 2-E: docId ベースのフロー確認

```bash
echo "=== docIdフローチェック ==="
grep -n "docId" "${TASK_BASE}/task-030-ui-05-skill-center-view.md"
# 期待: 2行以上ヒット（onExport 引数 + IPC データフロー）
```

#### 2-F: ExportResult 変換ロジック確認

```bash
echo "=== ExportResult変換チェック ==="
grep -n "ExportResult\|handleExportResult\|success.*false\|リトライ" "${TASK_BASE}/task-030-ui-05-skill-center-view.md"
# 期待: 3行以上ヒット
```

### Task 3: Gap 間の相互影響確認

#### 3-A: Gap 1（Date型）× Gap 5（safeOn）の相互影響

`skill:debug:event` で送信される `DebugEvent` 内の Date 型フィールドが ISO 8601 方針に準拠していること:

| 検証項目                                                                                 | 期待結果                              |
| ---------------------------------------------------------------------------------------- | ------------------------------------- |
| 05B の safeOn コールバック内で受信する DebugEvent の Date フィールドが string であること | ISO 8601 方針が適用されている旨の記載 |
| task-9h の DebugEvent 型定義で Date が string (ISO 8601) に変更されていること            | Step 2-C の修正が適用済み             |

#### 3-B: Gap 2（idle）× Gap 5（safeOn）の相互影響

DebugPanel が `idle` 状態で safeOn リスナーを登録した場合の動作:

| 検証項目                                                             | 期待結果                                            |
| -------------------------------------------------------------------- | --------------------------------------------------- |
| idle 状態でも safeOn リスナーが登録されること                        | useEffect のマウント時に登録（status に依存しない） |
| `session-ended` イベント後に status が `idle` にリセットされないこと | `completed` または `error` に遷移                   |

#### 3-C: Gap 3（docId）× Gap 4（ExportResult）の相互影響

DocPreview の onExport と ExportResult の一連のフロー:

| 検証項目                                                                    | 期待結果                 |
| --------------------------------------------------------------------------- | ------------------------ |
| onExport で docId を送信 → ExportResult が返る、というフローが明確          | IPC データフロー図に記載 |
| ExportResult.exportedFiles がエクスポートされたファイルパスの配列であること | task-9f の型定義と一致   |

### Task 4: 網羅性サマリー

#### チェックリスト

- [ ] Gap 1: 4 ファイル（task-9f, 9g, 9h, 9j）の全 Date フィールドに ISO 8601 注記が追加されている
- [ ] Gap 1: IPC 型定義内に `: Date;` パターンが残存していない
- [ ] Gap 2: task-9h の DebugSession.status に `idle` が追加されている
- [ ] Gap 2: 05B の DebugControlsProps.sessionStatus と値セットが完全一致している
- [ ] Gap 3: 05 の DocPreviewProps.onExport が `(docId, format, outputPath)` に修正されている
- [ ] Gap 3: IPC データフロー図が追加されている
- [ ] Gap 4: ExportResult の変換ロジック（成功/失敗）が 05 に記載されている
- [ ] Gap 5: 05B に safeOn 購読パターンが追加されている
- [ ] Gap 5: P5 対策（useEffect クリーンアップ）が明記されている
- [ ] Gap 6: task-9a の全 safeInvoke 呼び出しがオブジェクト形式に統一されている
- [ ] Gap 6: IPC 引数型の interface 定義が追加されている
- [ ] Gap 6: P42 準拠 3 段バリデーション方針が記載されている
- [ ] Gap 1×5: safeOn で受信する DebugEvent の Date フィールドが ISO 8601 方針に準拠している
- [ ] Gap 2×5: idle 状態での safeOn リスナー登録動作が定義されている
- [ ] Gap 3×4: docId → ExportResult の一連のフローが明確に定義されている

#### 網羅率

| カテゴリ                | 対象数 | 確認済み | 網羅率 |
| ----------------------- | ------ | -------- | ------ |
| Gap 修正（6 Gap）       | 6      | □        | □/6    |
| 修正ファイル数          | 7      | □        | □/7    |
| Date フィールド数       | 12     | □        | □/12   |
| IPC 引数形式（task-9a） | 6      | □        | □/6    |
| Gap 間相互影響          | 3      | □        | □/3    |

**合格基準**: 全カテゴリで 100% 網羅

### Task 5: 未達時のフォールバック

網羅性確認で FAIL となった場合の対応:

| 状況                      | 対応                                        |
| ------------------------- | ------------------------------------------- |
| Date フィールドの修正漏れ | Phase 5 Step 2 に戻り、該当フィールドを修正 |
| positional 形式の残存     | Phase 5 Step 1 に戻り、該当呼び出しを修正   |
| idle の追加漏れ           | Phase 5 Step 3 に戻り、修正                 |
| safeOn パターンの記載漏れ | Phase 5 Step 6 に戻り、追加                 |
| Gap 間相互影響の不整合    | Phase 6 の該当 Task に戻り、整合性を修正    |

→ Phase 5 に戻って修正後、再度 Phase 6-7 を実行する（Phase 7 → Phase 5 → Phase 6 → Phase 7 のループ）

## 統合テスト連携

| 連携観点           | 実施内容                                                                    | 検証先                          |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------- |
| IPC 契約整合       | Renderer → Preload → Main の引数型/戻り値型を突合し、契約ドリフトを防止する | Phase 4〜7 の検証コマンドと結果 |
| 型変換整合         | Date/ISO 8601・ExportResult 変換・DebugEvent ペイロードの境界変換を確認する | 修正対象 7 仕様書 + Phase 6/7   |
| イベント購読安全性 | safeOn + cleanup による二重登録防止（P5）を確認する                         | 05B 仕様書 + Phase 6/9          |

## 成果物

| 成果物       | パス                                                                                         | 説明           |
| ------------ | -------------------------------------------------------------------------------------------- | -------------- |
| 網羅性確認書 | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-7-coverage-check.md` | 本ドキュメント |

## 完了条件

- [ ] Task 1: トレーサビリティマトリクスが全 6 Gap について PASS であること
- [ ] Task 2: grep 検証で修正漏れが 0 件であること
- [ ] Task 3: Gap 間の相互影響が全て確認されていること
- [ ] Task 4: 網羅性サマリーの全チェックリストが完了していること
- [ ] Task 5: FAIL 項目がある場合、Phase 5 に戻って修正完了していること
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## 次の Phase

Phase 8: リファクタリング → `phase-8-refactoring.md`

※ 仕様書修正タスクのため、Phase 8（リファクタリング）は仕様書の文言・構造の改善に適応される
