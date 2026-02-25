# Contract Diff Matrix — Skill IPC チャネル契約差分マトリクス

> 生成日: 2026-02-25
> 生成元: TASK-013A-CONTRACT-AUDIT (SubAgent-A)

## 凡例

| 記号    | 意味                                |
| ------- | ----------------------------------- |
| PASS    | 正本仕様とタスク仕様が一致          |
| DRIFT   | 差分あり — 修正が必要               |
| PHANTOM | 正本/実装に定義がないチャネルを参照 |
| N/A     | 未実装のため比較対象なし            |
| —       | 該当タスク仕様に記載なし            |

## 1. 実装済みチャネル差分マトリクス（26チャネル）

| #   | チャネル名                  | 正本仕様の引数形式                     | task-020b 記載     | task-022 記載 | task-030 記載        | task-031b 記載 | 差分有無  | P42適用 | P45適用   | 修正要否                           |
| --- | --------------------------- | -------------------------------------- | ------------------ | ------------- | -------------------- | -------------- | --------- | ------- | --------- | ---------------------------------- |
| 1   | `skill:import`              | `skillName: string`                    | —                  | —             | `string`（一致）     | —              | PASS      | ✅      | PASS      | 不要                               |
| 2   | `skill:remove`              | `skillName: string`                    | —                  | —             | `string`（一致）     | —              | PASS      | ✅      | PASS      | 不要                               |
| 3   | `skill:get-detail`          | `skillId: string`                      | —                  | —             | `skill:detail`と記載 | —              | **DRIFT** | 要検証  | **DRIFT** | **要修正**（AUDIT-001, AUDIT-003） |
| 4   | `skill:execute`             | `skillId: string`                      | —                  | —             | —                    | —              | PASS      | —       | 確認要    | 要確認                             |
| 5   | `skill:stream`              | M→R イベント                           | —                  | —             | —                    | —              | PASS      | —       | —         | 不要                               |
| 6   | `skill:abort`               | `executionId: string`                  | —                  | —             | —                    | —              | PASS      | —       | PASS      | 不要                               |
| 7   | `skill:get-status`          | `executionId: string`                  | —                  | —             | —                    | —              | PASS      | —       | PASS      | 不要                               |
| 8   | `skill:list`                | 引数なし                               | —                  | —             | `void`（一致）       | —              | PASS      | —       | —         | 不要                               |
| 9   | `skill:scan`                | 引数なし                               | —                  | —             | —                    | —              | PASS      | —       | —         | 不要                               |
| 10  | `skill:getImported`         | 引数なし                               | —                  | —             | —                    | —              | PASS      | —       | —         | 不要                               |
| 11  | `skill:update`              | M→R イベント                           | —                  | —             | —                    | —              | PASS      | —       | —         | 不要                               |
| 12  | `skill:complete`            | M→R イベント                           | —                  | —             | —                    | —              | PASS      | —       | —         | 不要                               |
| 13  | `skill:error`               | M→R イベント                           | —                  | —             | —                    | —              | PASS      | —       | —         | 不要                               |
| 14  | `skill:permission:request`  | M→R イベント                           | —                  | —             | —                    | —              | PASS      | —       | —         | 不要                               |
| 15  | `skill:permission:response` | `{ executionId, approved, … }`         | —                  | —             | —                    | —              | PASS      | —       | —         | 不要                               |
| 16  | `skill:analyze`             | `skillName: string`                    | —                  | —             | —                    | —              | PASS      | —       | PASS      | 不要                               |
| 17  | `skill:improve`             | `skillName: string`                    | —                  | —             | —                    | —              | PASS      | —       | PASS      | 不要                               |
| 18  | `skill:optimize`            | `skillName: string`                    | —                  | —             | —                    | —              | PASS      | —       | PASS      | 不要                               |
| 19  | `skill:optimize:variants`   | `skillName: string`                    | —                  | —             | —                    | —              | PASS      | —       | PASS      | 不要                               |
| 20  | `skill:optimize:evaluate`   | `{ skillName, variants }`              | —                  | —             | —                    | —              | PASS      | —       | PASS      | 不要                               |
| 21  | `skill:readFile`            | `{ skillName, relativePath }`          | object形式（一致） | —             | —                    | —              | PASS      | ✅      | PASS      | 不要                               |
| 22  | `skill:writeFile`           | `{ skillName, relativePath, content }` | object形式（一致） | —             | —                    | —              | PASS      | ✅      | PASS      | 不要                               |
| 23  | `skill:createFile`          | `{ skillName, relativePath, content }` | object形式（一致） | —             | —                    | —              | PASS      | ✅      | PASS      | 不要                               |
| 24  | `skill:deleteFile`          | `{ skillName, relativePath }`          | object形式（一致） | —             | —                    | —              | PASS      | ✅      | PASS      | 不要                               |
| 25  | `skill:listBackups`         | `{ skillName }`                        | object形式（一致） | —             | —                    | —              | PASS      | ✅      | PASS      | 不要                               |
| 26  | `skill:restoreBackup`       | `{ skillName, backupId }`              | object形式（一致） | —             | —                    | —              | PASS      | ✅      | PASS      | 不要                               |

### ファントムチャネル（正本/実装に定義がないが task 仕様に記載）

| #   | チャネル名（task仕様記載） | 記載元                | 正本仕様                      | channels.ts                            | 判定        | 修正要否                             |
| --- | -------------------------- | --------------------- | ----------------------------- | -------------------------------------- | ----------- | ------------------------------------ |
| P1  | `skill:detail`             | task-030 セクション11 | `skill:get-detail` として定義 | `SKILL_GET_DETAIL: "skill:get-detail"` | **DRIFT**   | task-030を`skill:get-detail`に修正   |
| P2  | `skill:readMarkdown`       | task-030 セクション11 | 定義なし                      | 未登録                                 | **PHANTOM** | task-030から削除するか新規定義を追加 |

## 2. 未実装チャネル差分マトリクス（30チャネル）

| #   | チャネル名                      | 定義元タスク | task-030 記載                    | task-031b 記載                        | 引数形式（仕様）       | P42要件    | P44要件    | P45要件            |
| --- | ------------------------------- | ------------ | -------------------------------- | ------------------------------------- | ---------------------- | ---------- | ---------- | ------------------ |
| 27  | `skill:importFromSource`        | task-022     | `ShareTarget`（一致）            | —                                     | `ShareTarget` (object) | 実装時適用 | object準拠 | セマンティクス確認 |
| 28  | `skill:export`                  | task-022     | `{ skillName, format? }`（一致） | —                                     | object                 | 実装時適用 | object準拠 | セマンティクス確認 |
| 29  | `skill:validateSource`          | task-022     | `ShareTarget`（一致）            | —                                     | `ShareTarget` (object) | 実装時適用 | object準拠 | セマンティクス確認 |
| 30  | `skill:fork`                    | task-9E      | —                                | —                                     | 未定義                 | 実装時適用 | 要定義     | 要定義             |
| 31  | `skill:chain:list`              | task-9D      | —                                | `void`（一致）                        | 引数なし               | —          | —          | —                  |
| 32  | `skill:chain:get`               | task-9D      | —                                | `chainId`（一致）                     | `string`               | 実装時適用 | 要確認     | セマンティクス確認 |
| 33  | `skill:chain:save`              | task-9D      | —                                | `ChainConfig`（一致）                 | object                 | 実装時適用 | object準拠 | セマンティクス確認 |
| 34  | `skill:chain:delete`            | task-9D      | —                                | `chainId`（一致）                     | `string`               | 実装時適用 | 要確認     | セマンティクス確認 |
| 35  | `skill:chain:execute`           | task-9D      | —                                | `{ chainId, params? }`（一致）        | object                 | 実装時適用 | object準拠 | セマンティクス確認 |
| 36  | `skill:schedule:list`           | task-9G      | —                                | `void`（一致）                        | 引数なし               | —          | —          | —                  |
| 37  | `skill:schedule:add`            | task-9G      | —                                | `ScheduleConfig`（一致）              | object                 | 実装時適用 | object準拠 | セマンティクス確認 |
| 38  | `skill:schedule:update`         | task-9G      | —                                | `ScheduleConfig`（一致）              | object                 | 実装時適用 | object準拠 | セマンティクス確認 |
| 39  | `skill:schedule:delete`         | task-9G      | —                                | `scheduleId`（一致）                  | `string`               | 実装時適用 | 要確認     | セマンティクス確認 |
| 40  | `skill:schedule:toggle`         | task-9G      | —                                | `{ scheduleId, enabled }`（一致）     | object                 | 実装時適用 | object準拠 | セマンティクス確認 |
| 41  | `skill:debug:start`             | task-9H      | —                                | `{ skillName, breakpoints? }`（一致） | object                 | 実装時適用 | object準拠 | セマンティクス確認 |
| 42  | `skill:debug:command`           | task-9H      | —                                | `{ sessionId, command }`（一致）      | object                 | 実装時適用 | object準拠 | セマンティクス確認 |
| 43  | `skill:debug:breakpoint:add`    | task-9H      | —                                | `{ sessionId, location }`（一致）     | object                 | 実装時適用 | object準拠 | セマンティクス確認 |
| 44  | `skill:debug:breakpoint:remove` | task-9H      | —                                | `{ sessionId, breakpointId }`（一致） | object                 | 実装時適用 | object準拠 | セマンティクス確認 |
| 45  | `skill:debug:inspect`           | task-9H      | —                                | `{ sessionId, expression }`（一致）   | object                 | 実装時適用 | object準拠 | セマンティクス確認 |
| 46  | `skill:debug:evaluate`          | task-9H      | —                                | `{ sessionId, code }`（一致）         | object                 | 実装時適用 | object準拠 | セマンティクス確認 |
| 47  | `skill:debug:event`             | task-9H      | —                                | M→R safeOn（一致）                    | M→R イベント           | —          | —          | —                  |
| 48  | `skill:docs:generate`           | task-9I      | —                                | —                                     | 未定義                 | 実装時適用 | 要定義     | 要定義             |
| 49  | `skill:docs:preview`            | task-9I      | —                                | —                                     | 未定義                 | 実装時適用 | 要定義     | 要定義             |
| 50  | `skill:docs:export`             | task-9I      | —                                | —                                     | 未定義                 | 実装時適用 | 要定義     | 要定義             |
| 51  | `skill:docs:templates`          | task-9I      | —                                | —                                     | 未定義                 | 実装時適用 | 要定義     | 要定義             |
| 52  | `skill:analytics:record`        | task-9J      | —                                | —                                     | 未定義                 | 実装時適用 | 要定義     | 要定義             |
| 53  | `skill:analytics:statistics`    | task-9J      | —                                | —                                     | 未定義                 | 実装時適用 | 要定義     | 要定義             |
| 54  | `skill:analytics:summary`       | task-9J      | —                                | —                                     | 未定義                 | 実装時適用 | 要定義     | 要定義             |
| 55  | `skill:analytics:trend`         | task-9J      | —                                | —                                     | 未定義                 | 実装時適用 | 要定義     | 要定義             |
| 56  | `skill:analytics:export`        | task-9J      | —                                | —                                     | 未定義                 | 実装時適用 | 要定義     | 要定義             |

## 3. 差分サマリー

### 修正必須項目（CRITICAL/MAJOR）

| #   | 問題ID                    | 重要度   | 対象ファイル                                         | 修正内容                                                                         |
| --- | ------------------------- | -------- | ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1   | AUDIT-001-CHANNEL-NAME    | CRITICAL | `task-030-ui-05-skill-center-view.md` セクション11   | `skill:detail` → `skill:get-detail` に修正                                       |
| 2   | AUDIT-002-PHANTOM-CHANNEL | CRITICAL | `task-030-ui-05-skill-center-view.md` セクション11   | `skill:readMarkdown` を削除するか `skill:readFile` で代替する旨を明記            |
| 3   | AUDIT-003-NAMING-DRIFT    | MAJOR    | `skill:get-detail` ハンドラ実装・Preload API・テスト | 引数名 `skillId` → `skillName` に統一（UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001） |

### 検証必須項目（MINOR）

| #   | 問題ID                      | 重要度 | 対象                            | 検証内容                                                 |
| --- | --------------------------- | ------ | ------------------------------- | -------------------------------------------------------- |
| 4   | AUDIT-004-TRIM-VALIDATION   | MINOR  | `skill:get-detail` ハンドラ実装 | `.trim()` チェックの有無を実装コードで確認               |
| 5   | AUDIT-005-EXECUTE-SEMANTICS | MINOR  | `skill:execute` ハンドラ実装    | `skillId` が実際にハッシュ値IDなのかスキル名なのかを確認 |

### 統計

| カテゴリ      | 件数                        |
| ------------- | --------------------------- |
| 全チャネル数  | 56（実装済み26 + 未実装30） |
| PASS          | 23                          |
| DRIFT         | 2（AUDIT-001, AUDIT-003）   |
| PHANTOM       | 1（AUDIT-002）              |
| 要検証        | 2（AUDIT-004, AUDIT-005）   |
| 未実装（N/A） | 30                          |
