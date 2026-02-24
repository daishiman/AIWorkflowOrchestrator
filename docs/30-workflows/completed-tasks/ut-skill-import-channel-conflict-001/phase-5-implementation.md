# Phase 5: 実装（TDD: Green） - UT-SKILL-IMPORT-CHANNEL-CONFLICT-001

## メタ情報

| 項目               | 値                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------- |
| タスクID           | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001                                                      |
| Phase              | 5（実装）                                                                                 |
| 機能名             | ut-skill-import-channel-conflict-001                                                      |
| 作成日             | 2026-02-24                                                                                |
| 前提Phase          | Phase 4（テスト作成 — grep 検証コマンド設計完了）                                         |
| 目的               | 設計に基づいて仕様書の Markdown 修正を実行し、grep 検証を PASS させる                     |
| 成果物ディレクトリ | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-5/` |

## 目的

Phase 2 の設計方針と Phase 4 の検証コマンドに基づき、2つの仕様書ファイルの Markdown を修正する。本タスクではコード変更は行わず、仕様書（Markdown ファイル）の修正が「実装」に相当する。修正完了後に Phase 4 で設計した grep 検証コマンドを実行し、全検証が PASS することを確認する。

## 背景

- 既存の `skill:import` チャネル（ローカルインポート、引数: `string`）は UT-FIX-SKILL-IMPORT-INTERFACE-001 で修正済み
- TASK-9F で新規定義される `skill:import` チャネル（外部ソースインポート、引数: `ShareTarget`）との名前競合を事前解消する
- 修正対象は仕様書2ファイルのみ。コード（`channels.ts`、`skill-api.ts`、`preload/types.ts`）は TASK-9F 実装時に変更する

## 修正対象ファイル

| #   | ファイル       | パス                                                                                                                            | 修正箇所数                       |
| --- | -------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| 1   | task-9f 仕様書 | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`     | 3箇所 + artifacts追加 + 注記追加 |
| 2   | 05 UI仕様書    | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md` | 5箇所 + セクション11追加         |

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 5-1: task-022-task-9f-skill-share.md の修正

**目的**: TASK-9F 仕様書の Step 3 でチャネル名を `skill:import` から `skill:importFromSource` に変更し、artifacts.modifies を追加する

**実行手順**:

1. ファイルを開く: `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`

2. **Step 3 チャネル名修正（3箇所）**:
   - Step 3 内の外部ソースインポート文脈で使用されている `skill:import` を `skill:importFromSource` に変更する
   - 修正対象は TASK-9F の外部ソースインポートに関する記述のみ
   - 既存のローカルインポートに言及している箇所は変更しない

   ```
   修正前: skill:import（外部ソースインポート文脈）
   修正後: skill:importFromSource
   ```

3. **artifacts.modifies 追加**:
   - `artifacts.modifies` セクションに以下の2ファイルを追加する:
     - `apps/desktop/src/main/ipc/channels.ts`
     - `apps/desktop/src/preload/types.ts`

4. **注記追加**:
   - 以下の注記を Step 3 の冒頭または適切な位置に追加する:

   ```markdown
   > **注記**: `skill:import` チャネルは既存のローカルスキルインポート
   > （UT-FIX-SKILL-IMPORT-INTERFACE-001）で使用済み。
   > 外部ソースインポートは `skill:importFromSource` を使用する。
   ```

**検証**: 修正後に以下を確認する:

- `grep -c "skill:importFromSource" task-022-task-9f-skill-share.md` → 3件以上
- `grep -c "channels.ts" task-022-task-9f-skill-share.md` → 1件以上
- `grep -c "preload/types.ts" task-022-task-9f-skill-share.md` → 1件以上

**成果物**: 修正された `task-022-task-9f-skill-share.md`

---

### Task 5-2: task-030-ui-05-skill-center-view.md の修正（セクション15B.2）

**目的**: UI仕様書のセクション15B.2 で外部ソースインポートのチャネル名を修正する

**実行手順**:

1. ファイルを開く: `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md`

2. **セクション15B.2 IPC テーブル修正（5箇所）**:
   - GitHub からのインポート: `skill:import` → `skill:importFromSource`
   - Gist からのインポート: `skill:import` → `skill:importFromSource`
   - URL からのインポート: `skill:import` → `skill:importFromSource`
   - ローカルファイルからのインポート: `skill:import` → `skill:importFromSource`
   - フロー記述内の `skill:import`（外部ソース文脈）→ `skill:importFromSource`

   > **重要**: セクション15B.2 内の全ての外部ソースインポート関連の `skill:import` を変更する。
   > ローカルスキルインポート（既存機能）に関する記述がある場合は変更しない。

**検証**: `grep -c "skill:importFromSource" task-030-ui-05-skill-center-view.md` → 5件以上

**成果物**: 修正された `task-030-ui-05-skill-center-view.md`（セクション15B.2 部分）

---

### Task 5-3: task-030-ui-05-skill-center-view.md の修正（セクション11）

**目的**: UI仕様書のセクション11 IPC 連携テーブルに3つの新チャネルを追加する

**実行手順**:

1. 引き続き `task-030-ui-05-skill-center-view.md` のセクション11（IPC 連携テーブル）を修正する

2. **IPC 連携テーブルに3チャネル追加**:

   以下の3行をテーブルに追加する:

   | チャネル名               | 方向          | 引数                                              | 説明                             |
   | ------------------------ | ------------- | ------------------------------------------------- | -------------------------------- |
   | `skill:importFromSource` | Renderer→Main | `ShareTarget`                                     | 外部ソースからのスキルインポート |
   | `skill:validateSource`   | Renderer→Main | `ShareTarget`                                     | インポート元の検証               |
   | `skill:export`           | Renderer→Main | `{ skillName: string, destination: ShareTarget }` | スキルのエクスポート             |

   > **注記**: 既存の `skill:import`（引数: `string`、ローカルインポート）は変更しない。

**検証**:

- `grep -c "skill:importFromSource" task-030-ui-05-skill-center-view.md` → 5件以上（セクション15B.2 + セクション11）
- `grep -c "skill:validateSource" task-030-ui-05-skill-center-view.md` → 1件以上
- `grep -c "skill:export" task-030-ui-05-skill-center-view.md` → 1件以上

**成果物**: 修正された `task-030-ui-05-skill-center-view.md`（セクション11 部分）

---

### Task 5-4: grep 検証実行

**目的**: Phase 4 で設計した全検証コマンドを実行し、修正結果の正当性を確認する

**実行手順**:

1. Phase 4 の Task 4-1 〜 Task 4-5 の全検証コマンドを順に実行する
2. 各コマンドの実行結果と期待結果を比較する
3. 全検証が PASS であることを確認する

**検証結果テンプレート**:

| 検証ID    | 検証内容                          | 期待結果 | 実行結果 | 判定 |
| --------- | --------------------------------- | -------- | -------- | ---- |
| Task 4-1  | 旧チャネル名残存（TASK-9F文脈）   | 0行      |          |      |
| Task 4-2a | task-022 新チャネル名件数         | 3件以上  |          |      |
| Task 4-2b | task-030 新チャネル名件数         | 5件以上  |          |      |
| Task 4-3a | ローカルインポート記述            | 1件以上  |          |      |
| Task 4-3b | 外部インポート新チャネル          | 1件以上  |          |      |
| Task 4-4a | skill:importFromSource (task-030) | 5件以上  |          |      |
| Task 4-4b | skill:validateSource (task-030)   | 1件以上  |          |      |
| Task 4-4c | skill:export (task-030)           | 1件以上  |          |      |
| Task 4-5a | channels.ts (task-022)            | 1件以上  |          |      |
| Task 4-5b | preload/types.ts (task-022)       | 1件以上  |          |      |

**判定基準**:

- 全行が PASS → Phase 5 完了、Phase 9（品質保証）へ進む
- いずれかが FAIL → 該当 Task に戻って修正を行い、再度検証する

**成果物**: `outputs/phase-5/implementation-summary.md`（検証結果テンプレートを含む）

## 参照資料

> 依存Phase成果物: Phase 4

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                                        | 内容                                        |
| --------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------- |
| API IPC仕様           | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | 既存 `skill:import` 契約の正本確認          |
| Skillインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Renderer/Preload/Main の契約整合確認        |
| IPCセキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | チャネルホワイトリストと契約ドリフト防止    |
| Skill IPC詳細         | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | `skill:import` 系チャネル検証要件の詳細確認 |
| 型/チャネル調査手順   | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`            | チャネル名衝突時の横断確認手順              |
| IPC契約チェック       | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 3層同時更新チェック（P23/P32/P42/P44）      |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC不整合再発防止パターン参照               |
| 教訓                  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 類似タスクの再発防止知見                    |

| 資料名             | パス                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計       | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/phase-2-design.md`                                      |
| Phase 4 テスト仕様 | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/phase-4-test-creation.md`                               |
| task-022 修正対象  | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`     |
| task-030 修正対象  | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md` |
| P44（IPC不整合）   | `.claude/rules/06-known-pitfalls.md#P44`                                                                                        |

## 統合テスト連携

本タスクは仕様書修正中心のため、統合テストは仕様間整合の確認を対象とする。

- Phase 10 の最終レビュー結果との整合を確認する。
- Phase 11 の目視確認結果を `outputs/phase-11/manual-test-result.md` に集約する。
- Phase 12 の未タスク検出・仕様更新判断へ引き継ぐ。

## 成果物

| 成果物            | パス                                                    |
| ----------------- | ------------------------------------------------------- |
| 実装サマリー      | `outputs/phase-5/implementation-summary.md`             |
| 修正済み task-022 | task-022-task-9f-skill-share.md（インプレース修正）     |
| 修正済み task-030 | task-030-ui-05-skill-center-view.md（インプレース修正） |

## 完了条件

- [ ] Task 5-1: task-022 の Step 3 チャネル名が3箇所修正されている
- [ ] Task 5-1: task-022 の artifacts.modifies に channels.ts と preload/types.ts が追加されている
- [ ] Task 5-1: task-022 に注記（既存チャネルとの区別）が追加されている
- [ ] Task 5-2: task-030 のセクション15B.2 のチャネル名が5箇所修正されている
- [ ] Task 5-3: task-030 のセクション11 に3チャネルが追加されている
- [ ] Task 5-4: Phase 4 の全検証コマンドが PASS している
- [ ] `outputs/phase-5/implementation-summary.md` が作成されている

## 次Phase

Phase 6（テスト拡充）へ進む。ただし本タスクはコード変更なしのため N/A。
