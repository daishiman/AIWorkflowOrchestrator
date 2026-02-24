# Phase 2: 設計（修正方針設計） - UT-SKILL-IMPORT-CHANNEL-CONFLICT-001

## メタ情報

| 項目               | 値                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------- |
| タスクID           | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001                                                      |
| Phase              | 2（設計）                                                                                 |
| 機能名             | ut-skill-import-channel-conflict-001                                                      |
| 作成日             | 2026-02-24                                                                                |
| 前提Phase          | Phase 1（要件定義）                                                                       |
| 目的               | 修正対象箇所の詳細特定と修正方針を設計する                                                |
| 成果物ディレクトリ | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-2/` |

## 目的

Phase 1 で定義した機能要件（FR-001〜FR-006）と受け入れ基準（AC-01〜AC-10）を実現するために、仕様書修正の具体的な方針・修正手順・修正内容を設計する。

## 背景

本タスクは仕様書（Markdown）の修正のみを行い、コード変更は含まない。設計対象は以下の2ファイル・6箇所:

1. **task-022-task-9f-skill-share.md** — 3箇所の修正
2. **task-030-ui-05-skill-center-view.md** — 3箇所の修正

## 実行タスク

- 実行方針: 本Phaseで定義した Task セクションを上から順に100%実施する。

### Task 2-1: task-022-task-9f-skill-share.md の修正設計

**目的**: TASK-9F 仕様書の修正箇所を詳細に特定し、具体的な修正内容を設計する

#### 修正箇所1: Step 3「IPC拡張」チャネル名修正

**対象セクション**: Step 3（IPC拡張 — channels.ts, handlers, preload）

**修正方針**:

- Step 3 のチャネル一覧テーブルで `skill:import` を `skill:importFromSource` に変更する
- チャネルの説明文「外部ソースからのスキルインポート」は変更不要（既に適切）
- 引数型 `ShareTarget` は変更不要（既に適切）

**修正前後の比較**:

| 項目       | 修正前         | 修正後                   |
| ---------- | -------------- | ------------------------ |
| チャネル名 | `skill:import` | `skill:importFromSource` |
| 説明       | 変更なし       | 変更なし                 |
| 引数型     | 変更なし       | 変更なし                 |

#### 修正箇所2: artifacts.modifies セクション追加

**対象セクション**: artifacts テーブル（modifies 列）

**修正方針**:

- `modifies` に以下のファイルパスを追加:
  - `apps/desktop/src/main/ipc/channels.ts`（チャネルホワイトリストに3チャネル追加が必要）
  - `apps/desktop/src/preload/types.ts`（Preload 型定義に `importFromSource` メソッド追加が必要）

#### 修正箇所3: 注記の追加

**対象セクション**: Step 3 付近

**修正方針**:

- 以下の注記を追加:
  > ⚠️ **注意**: `skill:import` チャネルは既存のローカルスキルインポート（UT-FIX-SKILL-IMPORT-INTERFACE-001）で使用済みです。引数は `skillName: string` で、`SkillImportManager.importSkills([skillName])` を呼び出します。外部ソースインポートは `skill:importFromSource` を使用してください。この改名は UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 で実施されました。

---

### Task 2-2: task-030-ui-05-skill-center-view.md の修正設計

**目的**: 05 UI仕様書の修正箇所を詳細に特定し、具体的な修正内容を設計する

#### 修正箇所4: セクション15B.2 IPC テーブル修正

**対象セクション**: セクション15B.2「ImportSkillDialog / ExportSkillDialog」の IPC テーブル

**修正方針**:

- IPC テーブル内の `skill:import` を `skill:importFromSource` に変更する
- 引数型の `ShareTarget` は変更不要
- 戻り値型の `ImportResult` は変更不要

**対象行の特定方法**:

```bash
grep -n "skill:import" task-030-ui-05-skill-center-view.md | grep -i "ShareTarget\|外部\|source"
```

#### 修正箇所5: セクション15B.2 フロー記述修正

**対象セクション**: セクション15B.2 のフロー記述（テーブル外の本文）

**修正方針**:

- フロー記述内の `skill:import` を `skill:importFromSource` に変更する
- コンテキスト: 「インポートボタン押下 → `skill:importFromSource` → 結果表示」のフロー

#### 修正箇所6: セクション11 IPC 連携テーブルへの3チャネル追加

**対象セクション**: セクション11「IPC連携」のチャネル一覧テーブル

**修正方針**:

- 既存の `skill:import`（ローカルスキルインポート）行は変更しない
- 以下の3行を追加する:

| チャネル名               | 方向            | 引数                                              | 戻り値             | 説明                             |
| ------------------------ | --------------- | ------------------------------------------------- | ------------------ | -------------------------------- |
| `skill:importFromSource` | Renderer → Main | `ShareTarget`                                     | `ImportResult`     | 外部ソースからのスキルインポート |
| `skill:validateSource`   | Renderer → Main | `ShareTarget`                                     | `ValidationResult` | インポート元の検証               |
| `skill:export`           | Renderer → Main | `{ skillName: string, destination: ShareTarget }` | `ExportResult`     | スキルのエクスポート             |

**追加位置**: 既存の `skill:import` 行の直後（チャネル名のアルファベット順を維持）

---

### Task 2-3: 修正順序の設計

**目的**: 修正の実行順序を定義し、整合性を保つ

**推奨修正順序**:

| 順序 | 修正内容                                  | 理由                                   |
| ---- | ----------------------------------------- | -------------------------------------- |
| 1    | task-022 Step 3 チャネル名修正            | 根本となるチャネル名の変更を最初に行う |
| 2    | task-022 artifacts.modifies 追加          | 同一ファイルの修正を連続で行う         |
| 3    | task-022 注記追加                         | 同一ファイルの修正を連続で行う         |
| 4    | task-030 セクション15B.2 IPC テーブル修正 | UI仕様書の修正に移行                   |
| 5    | task-030 セクション15B.2 フロー記述修正   | 同一セクション内を連続で修正する       |
| 6    | task-030 セクション11 IPC テーブル追加    | 新規追加のため最後に行う               |

---

### Task 2-4: 影響範囲分析

**目的**: 修正による影響範囲を分析し、追加修正が必要な箇所がないことを確認する

**影響範囲確認コマンド**:

```bash
# TASK-9F 関連の全仕様書で skill:import を検索
grep -rn "skill:import" docs/30-workflows/skill-import-agent-system/tasks/ | grep -v "skill:importFromSource" | grep -v ".md:#"
```

**確認ポイント**:

| #   | 確認項目                                                                  | 期待結果                    |
| --- | ------------------------------------------------------------------------- | --------------------------- |
| 1   | task-022 以外の TASK-9F 関連ファイルで外部インポート文脈の `skill:import` | 0件（他ファイルに波及なし） |
| 2   | task-030 以外の UI仕様書で外部インポート文脈の `skill:import`             | 0件（他ファイルに波及なし） |
| 3   | 既存の `skill:import`（ローカルインポート）の仕様記述                     | 変更なし                    |

---

### Task 2-5: IPC チャネル命名の妥当性検証

**目的**: `skill:importFromSource` の命名がプロジェクトの命名規則に沿っているかを検証する

**既存のスキル関連チャネル命名パターン**:

| チャネル名      | パターン              |
| --------------- | --------------------- |
| `skill:list`    | `skill:` + 動詞       |
| `skill:import`  | `skill:` + 動詞       |
| `skill:remove`  | `skill:` + 動詞       |
| `skill:chain:*` | `skill:chain:` + 動詞 |

**`skill:importFromSource` の妥当性**:

| 評価項目       | 結果 | 理由                                                                    |
| -------------- | ---- | ----------------------------------------------------------------------- |
| 命名規則準拠   | ✅   | `skill:` プレフィックス + 動作名のパターンに準拠                        |
| 用途の明確性   | ✅   | `FromSource` により外部ソースインポートであることが明確                 |
| 既存との差別化 | ✅   | `skill:import`（ローカル）と `skill:importFromSource`（外部）で区別可能 |
| 可読性         | ⚠️   | やや長いが、Preload API では `importFromSource()` で短縮可能            |

**結論**: `skill:importFromSource` は妥当な命名である。

## 参照資料

> 依存Phase成果物: Phase 1

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

| 資料名           | パス                                                                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 1 要件定義 | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/phase-1-requirements.md`                                             |
| 元タスク仕様書   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-010-ut-skill-import-channel-conflict-001.md` |
| task-9f 仕様書   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-022-task-9f-skill-share.md`                  |
| 05 UI仕様書      | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-030-ui-05-skill-center-view.md`              |
| P5（二重登録）   | `.claude/rules/06-known-pitfalls.md#P5`                                                                                                      |
| P44（IPC不整合） | `.claude/rules/06-known-pitfalls.md#P44`                                                                                                     |

## 統合テスト連携

本タスクは仕様書修正中心のため、統合テストは仕様間整合の確認を対象とする。

- Phase 10 の最終レビュー結果との整合を確認する。
- Phase 11 の目視確認結果を `outputs/phase-11/manual-test-result.md` に集約する。
- Phase 12 の未タスク検出・仕様更新判断へ引き継ぐ。

## 成果物

| 成果物         | パス                                     |
| -------------- | ---------------------------------------- |
| 修正方針設計書 | `outputs/phase-2/architecture-design.md` |

## 完了条件

- [ ] Task 2-1: task-022 の3箇所の修正内容が設計されている
- [ ] Task 2-2: task-030 の3箇所の修正内容が設計されている
- [ ] Task 2-3: 修正順序が定義されている（6ステップ）
- [ ] Task 2-4: 影響範囲分析が完了し、追加修正が不要であることが確認されている
- [ ] Task 2-5: チャネル命名の妥当性が検証されている
- [ ] 各修正箇所の修正前後の比較が明確に記述されている
- [ ] 成果物ファイルが `outputs/phase-2/` に出力されている

## 次Phase

Phase 3（設計レビュー）へ進む。Phase 2 で設計した修正方針の妥当性を検証する。
