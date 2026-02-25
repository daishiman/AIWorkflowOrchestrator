---
id: TASK-013A-CONTRACT-AUDIT
tier: 2
title: task-013A IPC契約監査
phase: 1
depends_on: [TASK-013]
parallel_with: [TASK-013B-DATAFLOW-AUDIT, TASK-013C-UI-BOUNDARY-AUDIT]
blocks: [TASK-013D-SEQUENCE-REDESIGN]
status: completed
priority: high
estimated_complexity: small
tags: [docs, ipc, contract, audit]
---

# task-013A IPC契約監査 — Skill IPC チャネル契約整合性検証

## 1. メタ情報

| 項目         | 値                                                                                                                                                                                                                                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-013A-CONTRACT-AUDIT                                                                                                                                                                                                                                                                                         |
| 親タスク     | TASK-013-UI-BACKEND-CONSISTENCY                                                                                                                                                                                                                                                                                  |
| 担当         | SubAgent-A                                                                                                                                                                                                                                                                                                       |
| ステータス   | 完了                                                                                                                                                                                                                                                                                                             |
| 作成日       | 2026-02-25                                                                                                                                                                                                                                                                                                       |
| 正本仕様書   | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`, `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`, `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` |
| タスク仕様書 | `task-020b`, `task-022`, `task-030`, `task-031b`                                                                                                                                                                                                                                                                 |
| 実装参照     | `apps/desktop/src/preload/channels.ts`                                                                                                                                                                                                                                                                           |

## 2. 目的

task-9 系（バックエンド IPC 実装仕様）と UI-05 系（フロントエンド UI 仕様）の間で、Skill IPC チャネルの契約定義に差分が存在するかを網羅的に検証する。P44（IPC インターフェース不整合）・P45（引数命名の契約ドリフト）の再発を防止し、後続タスク実装時の手戻りを排除する。

## 実行タスク

| #   | タスク名                     | 説明                                                                     |
| --- | ---------------------------- | ------------------------------------------------------------------------ |
| 1   | チャネル棚卸し               | 実装済み（channels.ts）と未実装（task-9D〜9J仕様）チャネルを全件抽出する |
| 2   | 3層契約照合                  | Main/Preload/Renderer のチャネル名・引数形式・戻り値を照合する           |
| 3   | P42/P44/P45 観点監査         | バリデーション・引数形式・命名ドリフトを判定する                         |
| 4   | 差分優先度付け               | CRITICAL/MAJOR/MINOR/INFO で是正優先度を分類する                         |
| 5   | 再発防止チェックリストの確定 | IPC 修正時に再利用可能な監査手順を定義する                               |

## 実行手順

1. `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` の Phase 1-6 を先に確認し、監査観点を固定する。
2. `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` / `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` / `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` を正本として、チャネル契約を照合する。
3. `channels.ts` と task-020b/task-022/task-030/task-031b を突合し、差分を `contract-diff-matrix.md` に記録する。
4. 検出差分を P42/P44/P45 観点で分類し、Wave 0 での是正対象を確定する。
5. `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` と `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md` の再発防止パターンを反映し、チェックリストを確定する。

## 3. 監査対象チャネル一覧

### 3-A. 実装済みチャネル（channels.ts に定義済み — 26チャネル）

| #   | チャネル名                  | channels.ts 定数名          | 方向 | 定義元タスク                      |
| --- | --------------------------- | --------------------------- | ---- | --------------------------------- |
| 1   | `skill:import`              | `SKILL_IMPORT`              | R→M  | UT-FIX-SKILL-IMPORT-INTERFACE-001 |
| 2   | `skill:remove`              | `SKILL_REMOVE`              | R→M  | UT-FIX-SKILL-REMOVE-INTERFACE-001 |
| 3   | `skill:get-detail`          | `SKILL_GET_DETAIL`          | R→M  | 既存（P45未修正）                 |
| 4   | `skill:execute`             | `SKILL_EXECUTE`             | R→M  | TASK-9A-B                         |
| 5   | `skill:stream`              | `SKILL_STREAM`              | M→R  | TASK-9A-B                         |
| 6   | `skill:abort`               | `SKILL_ABORT`               | R→M  | TASK-9A-B                         |
| 7   | `skill:get-status`          | `SKILL_GET_STATUS`          | R→M  | TASK-9A-B                         |
| 8   | `skill:list`                | `SKILL_LIST`                | R→M  | 既存                              |
| 9   | `skill:scan`                | `SKILL_SCAN`                | R→M  | 既存                              |
| 10  | `skill:getImported`         | `SKILL_GET_IMPORTED`        | R→M  | 既存                              |
| 11  | `skill:update`              | `SKILL_UPDATE`              | M→R  | 既存                              |
| 12  | `skill:complete`            | `SKILL_COMPLETE`            | M→R  | TASK-9A-B                         |
| 13  | `skill:error`               | `SKILL_ERROR`               | M→R  | TASK-9A-B                         |
| 14  | `skill:permission:request`  | `SKILL_PERMISSION_REQUEST`  | M→R  | TASK-9A-B                         |
| 15  | `skill:permission:response` | `SKILL_PERMISSION_RESPONSE` | R→M  | TASK-9A-B                         |
| 16  | `skill:analyze`             | `SKILL_ANALYZE`             | R→M  | TASK-9C                           |
| 17  | `skill:improve`             | `SKILL_IMPROVE`             | R→M  | TASK-9C                           |
| 18  | `skill:optimize`            | `SKILL_OPTIMIZE`            | R→M  | TASK-9C                           |
| 19  | `skill:optimize:variants`   | `SKILL_OPTIMIZE_VARIANTS`   | R→M  | TASK-9C                           |
| 20  | `skill:optimize:evaluate`   | `SKILL_OPTIMIZE_EVALUATE`   | R→M  | TASK-9C                           |
| 21  | `skill:readFile`            | `SKILL_READ_FILE`           | R→M  | TASK-9A（task-020b）              |
| 22  | `skill:writeFile`           | `SKILL_WRITE_FILE`          | R→M  | TASK-9A（task-020b）              |
| 23  | `skill:createFile`          | `SKILL_CREATE_FILE`         | R→M  | TASK-9A（task-020b）              |
| 24  | `skill:deleteFile`          | `SKILL_DELETE_FILE`         | R→M  | TASK-9A（task-020b）              |
| 25  | `skill:listBackups`         | `SKILL_LIST_BACKUPS`        | R→M  | TASK-9A（task-020b）              |
| 26  | `skill:restoreBackup`       | `SKILL_RESTORE_BACKUP`      | R→M  | TASK-9A（task-020b）              |

### 3-B. 未実装チャネル（タスク仕様書に定義済み・channels.ts 未登録 — 30チャネル）

| #   | チャネル名                      | 方向 | 定義元タスク | 備考                           |
| --- | ------------------------------- | ---- | ------------ | ------------------------------ |
| 27  | `skill:importFromSource`        | R→M  | task-9F      | 外部ソースインポート           |
| 28  | `skill:export`                  | R→M  | task-9F      | スキルエクスポート             |
| 29  | `skill:validateSource`          | R→M  | task-9F      | ソース検証                     |
| 30  | `skill:fork`                    | R→M  | task-9E      | スキルフォーク                 |
| 31  | `skill:chain:list`              | R→M  | task-9D      | チェーン一覧取得               |
| 32  | `skill:chain:get`               | R→M  | task-9D      | チェーン詳細取得               |
| 33  | `skill:chain:save`              | R→M  | task-9D      | チェーン保存                   |
| 34  | `skill:chain:delete`            | R→M  | task-9D      | チェーン削除                   |
| 35  | `skill:chain:execute`           | R→M  | task-9D      | チェーン実行                   |
| 36  | `skill:schedule:list`           | R→M  | task-9G      | スケジュール一覧               |
| 37  | `skill:schedule:add`            | R→M  | task-9G      | スケジュール追加               |
| 38  | `skill:schedule:update`         | R→M  | task-9G      | スケジュール更新               |
| 39  | `skill:schedule:delete`         | R→M  | task-9G      | スケジュール削除               |
| 40  | `skill:schedule:toggle`         | R→M  | task-9G      | スケジュール有効/無効切替      |
| 41  | `skill:debug:start`             | R→M  | task-9H      | デバッグセッション開始         |
| 42  | `skill:debug:command`           | R→M  | task-9H      | デバッグコマンド送信           |
| 43  | `skill:debug:breakpoint:add`    | R→M  | task-9H      | ブレークポイント追加           |
| 44  | `skill:debug:breakpoint:remove` | R→M  | task-9H      | ブレークポイント削除           |
| 45  | `skill:debug:inspect`           | R→M  | task-9H      | 変数インスペクション           |
| 46  | `skill:debug:evaluate`          | R→M  | task-9H      | 式評価                         |
| 47  | `skill:debug:event`             | M→R  | task-9H      | デバッグイベント通知（safeOn） |
| 48  | `skill:docs:generate`           | R→M  | task-9I      | ドキュメント生成               |
| 49  | `skill:docs:preview`            | R→M  | task-9I      | ドキュメントプレビュー         |
| 50  | `skill:docs:export`             | R→M  | task-9I      | ドキュメントエクスポート       |
| 51  | `skill:docs:templates`          | R→M  | task-9I      | テンプレート一覧               |
| 52  | `skill:analytics:record`        | R→M  | task-9J      | 実行記録                       |
| 53  | `skill:analytics:statistics`    | R→M  | task-9J      | 統計情報取得                   |
| 54  | `skill:analytics:summary`       | R→M  | task-9J      | サマリー取得                   |
| 55  | `skill:analytics:trend`         | R→M  | task-9J      | トレンドデータ取得             |
| 56  | `skill:analytics:export`        | R→M  | task-9J      | 分析データエクスポート         |

## 4. 契約差分検出結果

### 4-A. チャネル名不一致（CRITICAL）

| #   | UI仕様での名称       | 正本仕様での名称   | channels.ts                            | 検出元                | 影響                                                        |
| --- | -------------------- | ------------------ | -------------------------------------- | --------------------- | ----------------------------------------------------------- |
| 1   | `skill:detail`       | `skill:get-detail` | `SKILL_GET_DETAIL: "skill:get-detail"` | task-030 セクション11 | Renderer側で不正チャネル名を使用するとIPC通信が無応答になる |
| 2   | `skill:readMarkdown` | 該当なし           | 未定義                                 | task-030 セクション11 | 存在しないチャネルを呼び出すため100%失敗する                |

**差分 #1 の詳細**: task-030（UI-05 スキルセンタービュー）のセクション11 IPC チャネルテーブルで `skill:detail` と記載されているが、正本仕様（`interfaces-agent-sdk-skill.md`）および `channels.ts` の定数名は `skill:get-detail`（`SKILL_GET_DETAIL`）である。UI 実装時にこの仕様書を参照すると誤ったチャネル名を使用する。

**差分 #2 の詳細**: task-030 のセクション11で `skill:readMarkdown` が記載されているが、このチャネルは正本仕様・`channels.ts`・いずれのタスク仕様書にも定義が存在しない。スキルの README/ドキュメント読み込み用と推定されるが、既存の `skill:readFile`（TASK-9A）で代替可能か、専用チャネルとして新規定義が必要かを判断する必要がある。

### 4-B. 引数形式の差分（MAJOR）

| #   | チャネル名               | 正本/実装の引数形式                                            | タスク仕様での引数形式                             | 判定      | P44/P45関連                                        |
| --- | ------------------------ | -------------------------------------------------------------- | -------------------------------------------------- | --------- | -------------------------------------------------- |
| 1   | `skill:import`           | `skillName: string`（bare string）                             | task-030: `string`                                 | PASS      | P44解決済み                                        |
| 2   | `skill:remove`           | `skillName: string`（bare string）                             | task-030: `string`                                 | PASS      | P44解決済み                                        |
| 3   | `skill:get-detail`       | `skillId: string`（bare string）                               | task-030: `skillId`記載                            | **DRIFT** | P45該当（UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001） |
| 4   | `skill:readFile`         | `{ skillName: string; relativePath: string }`（object）        | task-020b: object形式                              | PASS      | P44準拠                                            |
| 5   | `skill:writeFile`        | `{ skillName: string; relativePath: string; content: string }` | task-020b: object形式                              | PASS      | P44準拠                                            |
| 6   | `skill:createFile`       | `{ skillName: string; relativePath: string; content: string }` | task-020b: object形式                              | PASS      | P44準拠                                            |
| 7   | `skill:deleteFile`       | `{ skillName: string; relativePath: string }`                  | task-020b: object形式                              | PASS      | P44準拠                                            |
| 8   | `skill:importFromSource` | 未実装                                                         | task-022: `ShareTarget`（object）                  | —         | 実装時にobject形式を維持                           |
| 9   | `skill:export`           | 未実装                                                         | task-022: `{ skillName: string; format?: string }` | —         | 実装時にobject形式を維持                           |

### 4-C. P45 命名ドリフト検出（MAJOR）

| #   | チャネル名         | 引数名（現行） | 実際の値セマンティクス | 修正要否 | 追跡タスク                              |
| --- | ------------------ | -------------- | ---------------------- | -------- | --------------------------------------- |
| 1   | `skill:get-detail` | `skillId`      | スキル名（文字列）     | 要修正   | UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001 |
| 2   | `skill:execute`    | `skillId`      | スキルID（ハッシュ値） | 確認要   | 実際にIDを渡しているなら命名は正しい    |
| 3   | `skill:abort`      | `executionId`  | 実行ID                 | PASS     | セマンティクス一致                      |
| 4   | `skill:get-status` | `executionId`  | 実行ID                 | PASS     | セマンティクス一致                      |
| 5   | `skill:analyze`    | `skillName`    | スキル名               | PASS     | セマンティクス一致                      |
| 6   | `skill:improve`    | `skillName`    | スキル名               | PASS     | セマンティクス一致                      |

### 4-D. P42 3段バリデーション適用状況

| #   | チャネル名               | typeof チェック | 空文字列チェック | .trim()チェック | 判定             |
| --- | ------------------------ | --------------- | ---------------- | --------------- | ---------------- |
| 1   | `skill:import`           | ✅              | ✅               | ✅              | PASS             |
| 2   | `skill:remove`           | ✅              | ✅               | ✅              | PASS             |
| 3   | `skill:get-detail`       | ✅              | ✅               | 未確認          | 要検証           |
| 4   | `skill:readFile`         | ✅              | ✅               | ✅              | PASS             |
| 5   | `skill:writeFile`        | ✅              | ✅               | ✅              | PASS             |
| 6   | `skill:createFile`       | ✅              | ✅               | ✅              | PASS             |
| 7   | `skill:deleteFile`       | ✅              | ✅               | ✅              | PASS             |
| 8   | `skill:listBackups`      | ✅              | ✅               | ✅              | PASS             |
| 9   | `skill:restoreBackup`    | ✅              | ✅               | ✅              | PASS             |
| 10  | 未実装チャネル（#27-56） | —               | —                | —               | 実装時に適用必須 |

### 4-E. `skill:import` と `skill:importFromSource` の責務分離

| 観点             | `skill:import`                             | `skill:importFromSource`                                                  |
| ---------------- | ------------------------------------------ | ------------------------------------------------------------------------- |
| 定義元タスク     | UT-FIX-SKILL-IMPORT-INTERFACE-001          | task-9F（task-022）                                                       |
| channels.ts 登録 | ✅ `SKILL_IMPORT`                          | ❌ 未登録                                                                 |
| 引数             | `skillName: string`                        | `ShareTarget`（object: `{ type, url?, path?, content? }`）                |
| 責務             | ローカルスキルディレクトリからのインポート | 外部ソース（URL/ファイルパス/クリップボード）からのインポート             |
| バリデーション   | P42 3段バリデーション適用済み              | 未実装（実装時に適用必須）                                                |
| セキュリティ検証 | sender検証 + skillNameバリデーション       | sender検証 + ShareTarget全フィールドバリデーション + パストラバーサル検証 |
| 衝突リスク       | なし                                       | なし（チャネル名が明確に分離）                                            |

**判定**: 責務分離は明確。`skill:import` はローカル、`skill:importFromSource` は外部ソース。チャネル名衝突なし。

## 5. 検出された問題の一覧と優先度

| #   | 問題ID                    | 重要度   | カテゴリ           | 概要                                                       | 推奨対応                                         |
| --- | ------------------------- | -------- | ------------------ | ---------------------------------------------------------- | ------------------------------------------------ |
| 1   | AUDIT-001-CHANNEL-NAME    | CRITICAL | チャネル名不一致   | task-030で`skill:detail`と記載、正本は`skill:get-detail`   | task-030のセクション11を`skill:get-detail`に修正 |
| 2   | AUDIT-002-PHANTOM-CHANNEL | CRITICAL | 存在しないチャネル | task-030で`skill:readMarkdown`を参照、定義が存在しない     | task-030から削除するか、`skill:readFile`で代替   |
| 3   | AUDIT-003-NAMING-DRIFT    | MAJOR    | P45命名ドリフト    | `skill:get-detail`の引数名が`skillId`だが実態は`skillName` | UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001で修正    |
| 4   | AUDIT-004-TRIM-VALIDATION | MINOR    | P42バリデーション  | `skill:get-detail`の`.trim()`チェック適用状況未確認        | 実装コードで`.trim()`の有無を検証                |
| 5   | AUDIT-005-FUTURE-CHANNELS | INFO     | 未実装チャネル     | task-9D〜9J の30チャネルが未実装                           | 実装時にP42/P44/P45準拠を徹底                    |

## 6. P44/P45 再発防止チェックポイント

新規 Skill IPC チャネル実装時に以下の6項目を全て検証する。

### チェックリスト

- [ ] **CP-1**: チャネル名が `channels.ts` の定数として登録されている
- [ ] **CP-2**: チャネル名が正本仕様（`interfaces-agent-sdk-skill.md`）と一致している
- [ ] **CP-3**: 引数形式が Main ハンドラと Preload API（`skill-api.ts`）で一致している
- [ ] **CP-4**: 引数名が実際に渡される値のセマンティクスと一致している（P45対策）
- [ ] **CP-5**: 全文字列引数に P42 3段バリデーション（`typeof` → `=== ""` → `.trim() === ""`）が適用されている
- [ ] **CP-6**: 3箇所同時更新（ハンドラ・Preload API・テスト）が実施されている（P23/P32対策）

### 引数形式の標準パターン

```typescript
// パターンA: 単一文字列引数（skill:import, skill:remove）
ipcMain.handle("skill:xxx", async (event, skillName: string) => {
  // P42 3段バリデーション
  if (typeof skillName !== "string" || skillName.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: "skillName must be a non-empty string",
    };
  }
});

// パターンB: オブジェクト引数（skill:readFile, skill:importFromSource）
ipcMain.handle("skill:yyy", async (event, args: SkillYyyArgs) => {
  // 各フィールドに P42 3段バリデーション適用
  if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: "skillName must be a non-empty string",
    };
  }
});
```

## 7. 成果物

| #   | ファイル名                    | パス（相対）                                      | 内容                     |
| --- | ----------------------------- | ------------------------------------------------- | ------------------------ |
| 1   | `task-013a-contract-audit.md` | `completed-tasks/task-013-subagent-team/`         | 本ファイル（監査仕様書） |
| 2   | `contract-diff-matrix.md`     | `completed-tasks/task-013-subagent-team/outputs/` | 全チャネル差分マトリクス |
| 3   | `channel-ownership-table.md`  | `completed-tasks/task-013-subagent-team/outputs/` | チャネル所有権テーブル   |

## 8. 完了条件

- [x] 実装済み26チャネル + 未実装30チャネルの全56チャネルを一覧化
- [x] チャネル名不一致を2件検出（AUDIT-001, AUDIT-002）
- [x] P45命名ドリフトを1件検出（AUDIT-003）
- [x] P42バリデーション適用状況を全実装済みチャネルで確認
- [x] `skill:import` と `skill:importFromSource` の責務分離を検証
- [x] P44/P45 再発防止チェックポイントを6項目で定義
- [x] `contract-diff-matrix.md` を完全作成
- [x] `channel-ownership-table.md` を完全作成

## 9. 参照資料

| 資料名                           | パス                                                                              |
| -------------------------------- | --------------------------------------------------------------------------------- |
| IPC チャネル定数定義             | `apps/desktop/src/preload/channels.ts`                                            |
| 正本: IPC Agent API              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              |
| 正本: Skill API インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| 正本: IPC セキュリティ           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      |
| 正本: Skill IPC セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         |
| 正本: IPC 契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     |
| 正本: IPC 型解決ガイド           | `.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md`  |
| 正本: 早見表                     | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`               |
| 正本: リソースマップ             | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                  |
| 正本: 教訓集                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            |
| タスク仕様: Skill Editor         | `task-020b-task-9a-skill-editor.md`                                               |
| タスク仕様: Skill Share          | `task-022-task-9f-skill-share.md`                                                 |
| タスク仕様: Skill Center View    | `task-030-ui-05-skill-center-view.md`                                             |
| タスク仕様: Skill Advanced Views | `task-031b-ui-05b-skill-advanced-views.md`                                        |
| P44 解決記録                     | `06-known-pitfalls.md#P44`                                                        |
| P45 解決記録                     | `06-known-pitfalls.md#P45`                                                        |
| P42 バリデーション標準           | `06-known-pitfalls.md#P42`                                                        |
