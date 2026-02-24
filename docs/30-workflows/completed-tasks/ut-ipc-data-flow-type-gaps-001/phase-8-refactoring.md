# Phase 8: 仕様書品質改善（リファクタリングに代えて）

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase番号  | 8                                   |
| Phase名    | 仕様書品質改善                      |
| 目的       | 仕様書の用語・表現・構造の統一      |
| 前提Phase  | Phase 7（仕様整合性カバレッジ確認） |
| 後続Phase  | Phase 9（品質保証）                 |
| ステータス | 未実施                              |
| タスクID   | UT-IPC-DATA-FLOW-TYPE-GAPS-001      |
| 機能名     | データフロー型ギャップ解消          |
| 作成日     | 2026-02-24                          |
| タスク種別 | 仕様書修正のみ（実コード変更なし）  |

---

## 目的

Phase 5で修正した仕様書の品質を改善する。動作（仕様の意味）を変えずに、表現・用語・構造の統一を行う。

---

## 対象Gap一覧

| Gap ID | 概要                                     | 関連仕様書                         |
| ------ | ---------------------------------------- | ---------------------------------- |
| Gap 1  | Date型のIPCシリアライズ問題              | task-9f, task-9g, task-9h, task-9j |
| Gap 2  | DebugSession.status に idle がない       | task-9h, 05B                       |
| Gap 3  | DocPreview onExport 引数不整合           | task-030, task-9i                  |
| Gap 4  | ExportResult → UI コールバック変換未記載 | task-030, task-9f                  |
| Gap 5  | skill:debug:event の safeOn 購読未記載   | 05B                                |
| Gap 6  | task-9a IPC引数形式 positional → object  | task-9a                            |

---

## 実行タスク

- 表現統一: Date型注記・safeOn 記法・型説明の表現を統一する
- 契約統一: IPC 引数形式と命名ルールを P44/P45 観点で統一する
- 参照統一: 修正対象仕様書と参照リンクの整合性を確認する

| #   | タスク名                            | 概要                                                        |
| --- | ----------------------------------- | ----------------------------------------------------------- |
| 1   | Date型注記フォーマット統一          | 全Date型フィールドの注記をISO 8601 string形式に統一         |
| 2   | DebugSession.status値セット統一確認 | task-9hと05Bでstatus値セットが完全一致していることを確認    |
| 3   | IPC引数形式の一貫性確認             | 全コード例がオブジェクト形式（P44/P45対策）であることを確認 |
| 4   | safeOnパターン記載フォーマット統一  | safeOnパターンが統一フォーマット（P5対策含む）に準拠確認    |
| 5   | 相互参照リンク検証                  | 仕様書間の参照リンクが正しいリンク先を指していることを確認  |
| 6   | 品質改善レポート作成                | 実施内容・結果をレポートとして記録                          |

---

## 参照資料

| 資料名                     | パス・参照先                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Phase 2 設計書             | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-2-design.md`                                     |
| Phase 5 修正結果           | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-5-implementation.md`                             |
| Phase 6 整合性検証         | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-6-test-expansion.md`                             |
| Phase 7 成果物             | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-7-coverage-check.md`                             |
| Phase 1 抽出成果物         | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-1/aiworkflow-requirements-extraction.md` |
| 修正対象仕様書群           | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/`                             |
| P44 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md#P44`                                                                                 |
| P45 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md#P45`                                                                                 |
| P5 既知の落とし穴          | `.claude/rules/06-known-pitfalls.md#P5`                                                                                  |
| P42 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md#P42`                                                                                 |
| IPC API 仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                     |
| Skill IF 仕様              | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                        |
| IPC セキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                             |
| Skill IPC セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                                |
| 実装パターン仕様           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                              |

---

## 実行手順

### Step 1: Date型注記のフォーマット統一

全Date型フィールドの注記が以下のフォーマットに統一されていることを確認・修正する。

**統一フォーマット**:

```typescript
/**
 * @format ISO 8601
 * @serialization IPC経由ではstring型として送受信される
 */
fieldName: string; // バックエンド内部ではDate型、IPC境界でISO 8601文字列に変換
```

**対象ファイルと確認項目**:

| 対象仕様書 | 確認フィールド                     | 統一前の状態（想定） | 統一後の記法            |
| ---------- | ---------------------------------- | -------------------- | ----------------------- |
| task-9f    | `createdAt`, `updatedAt`           | Date型のまま記載     | ISO 8601 string注記追加 |
| task-9g    | `startedAt`, `completedAt`         | Date型のまま記載     | ISO 8601 string注記追加 |
| task-9h    | `startTime`, `endTime`, `lastPing` | Date型のまま記載     | ISO 8601 string注記追加 |
| task-9j    | `exportedAt`                       | Date型のまま記載     | ISO 8601 string注記追加 |

**検証コマンド**:

```bash
# Date型注記の不統一を検出
TASK_BASE="docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence"
grep -rn "Date" "${TASK_BASE}"/task-0*.md | grep -v "ISO 8601" | grep -v "^#"
```

### Step 2: DebugSession.status 値セットの統一

task-9h と 05B（DebugControlsProps）で `status` の値セットが完全に一致していることを確認する。

**統一する値セット**:

```typescript
type DebugSessionStatus = "idle" | "running" | "paused" | "completed" | "error";
```

**確認項目**:

| 確認箇所         | 確認内容                                       | 期待値                                                      |
| ---------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| task-9h          | DebugSession.status の型定義                   | `'idle' \| 'running' \| 'paused' \| 'completed' \| 'error'` |
| 05B              | DebugControlsProps.status の型定義             | task-9h と完全一致                                          |
| task-9h コード例 | コード例内の status 値が値セットに含まれること | `'stopped'` → `'completed'` に統一済みか確認                |

**注意**: task-9h で `'stopped'` が使用されている場合は `'completed'` に統一する。変更時は全コード例を検索して置換する。

### Step 3: IPC引数形式の一貫性確認

task-9a のコード例が全てオブジェクト形式に統一されていることを確認する。他の task-9 シリーズのコード例も同様にオブジェクト形式であることを確認する。

**統一フォーマット（P44/P45対策）**:

```typescript
// ❌ positional形式（禁止）
ipcMain.handle('channel:name', async (event, arg1, arg2) => { ... });

// ✅ オブジェクト形式（必須）
ipcMain.handle('channel:name', async (event, args: { field1: string; field2: number }) => { ... });
```

**確認対象**:

| 仕様書  | 確認するコード例            | 確認項目                   |
| ------- | --------------------------- | -------------------------- |
| task-9a | skill:create, skill:update  | オブジェクト形式であること |
| task-9f | IPC ハンドラ例              | オブジェクト形式であること |
| task-9g | IPC ハンドラ例              | オブジェクト形式であること |
| task-9h | debug:start, debug:pause 等 | オブジェクト形式であること |
| task-9j | doc:export, doc:preview 等  | オブジェクト形式であること |

**検証コマンド**:

```bash
# positional形式の残存を検出（event の後にカンマ区切りの引数がある）
TASK_BASE="docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence"
grep -n "async (event," "${TASK_BASE}"/task-0*.md | grep -v "args:"
```

### Step 4: safeOn パターンの記載フォーマット統一

05B の `safeOn` パターンが既存の `safeOn` 使用箇所と同じフォーマットで記載されていることを確認する。

**統一フォーマット**:

```typescript
// Preload側（safeOn登録）
safeOn(IPC_CHANNELS.SKILL_DEBUG_EVENT, (data: DebugEventPayload) => {
  // イベントハンドリング
});

// Main側（イベント送信）
mainWindow.webContents.send(IPC_CHANNELS.SKILL_DEBUG_EVENT, payload);
```

**確認項目**:

- [ ] safeOn のコールバック引数に型注記がある
- [ ] IPC_CHANNELS 定数を使用している（ハードコード文字列でない）
- [ ] クリーンアップ（リスナー解除）パターンが記載されている
- [ ] P5（リスナー二重登録）防止パターンが記載されている

### Step 5: 相互参照リンクの検証

修正した仕様書間の相互参照リンクが正しく機能するか確認する。

**確認項目**:

| 参照元  | 参照先  | 参照内容                        |
| ------- | ------- | ------------------------------- |
| 05B     | task-9h | DebugSession型定義の参照        |
| 05B     | task-9j | DocPreview/ExportResult型の参照 |
| task-9h | 05B     | DebugControlsProps の使用箇所   |
| task-9j | 05B     | onExport コールバックの使用箇所 |

---

## 統合テスト連携

| 連携観点           | 実施内容                                                                    | 検証先                          |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------- |
| IPC 契約整合       | Renderer → Preload → Main の引数型/戻り値型を突合し、契約ドリフトを防止する | Phase 4〜7 の検証コマンドと結果 |
| 型変換整合         | Date/ISO 8601・ExportResult 変換・DebugEvent ペイロードの境界変換を確認する | 修正対象 7 仕様書 + Phase 6/7   |
| イベント購読安全性 | safeOn + cleanup による二重登録防止（P5）を確認する                         | 05B 仕様書 + Phase 6/9          |

## 成果物

| 成果物           | 説明                     | 配置先                                        |
| ---------------- | ------------------------ | --------------------------------------------- |
| 品質改善レポート | 品質改善の実施内容・結果 | `outputs/phase-8/spec-quality-improvement.md` |

---

## 完了条件

- [ ] Date型注記のフォーマットが全仕様書（task-9f, 9g, 9h, 9j）で統一されている
- [ ] DebugSession.status の値セットが task-9h と 05B で一致している
- [ ] IPC引数形式が全コード例でオブジェクト形式に統一されている
- [ ] safeOn パターンの記載フォーマットが統一されている（P5対策含む）
- [ ] 仕様書間の相互参照リンクが正しい
- [ ] 品質改善レポートが作成・配置されている
- [ ] 本Phase内の全タスクを100%実行完了

---

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. Date型注記フォーマット統一（Step 1）
2. DebugSession.status 値セット統一確認（Step 2）
3. IPC引数形式の一貫性確認（Step 3）
4. safeOn パターン記載フォーマット統一（Step 4）
5. 相互参照リンク検証（Step 5）
6. 品質改善レポート作成
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 品質改善レポートが生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001 --phase 8
```

---

## 次のPhase

Phase 9: 品質保証

---

## 備考

- 本タスクは仕様書修正のみのため、リファクタリングPhaseを「仕様書品質改善」に読み替える
- 仕様の意味（セマンティクス）は変更しない。表現・用語・構造の統一のみ実施する
- P44（IPCインターフェース不整合）、P45（引数命名ドリフト）の再発防止がStep 3の主目的
- P5（リスナー二重登録）防止パターンの記載確認がStep 4の主目的
