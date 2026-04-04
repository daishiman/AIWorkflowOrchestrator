# Phase 4: テストマトリクス (Test Matrix)

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| タスクID | TASK-P0-09                             |
| Phase    | 4                                      |
| 機能名   | claude-sdk-permission-hooks-governance |
| 作成日   | 2026-03-31                             |

---

## 1. テストファイル一覧

### ユニットテスト (3 ファイル / 56 テスト)

| #   | テストファイル                                                                                     | テスト数 | 対象モジュール               |
| --- | -------------------------------------------------------------------------------------------------- | -------- | ---------------------------- |
| 1   | `apps/desktop/src/main/services/runtime/__tests__/governance/SkillCreatorPermissionPolicy.test.ts` | 29       | SkillCreatorPermissionPolicy |
| 2   | `apps/desktop/src/main/services/runtime/__tests__/governance/SkillCreatorHooksFactory.test.ts`     | 16       | SkillCreatorHooksFactory     |
| 3   | `apps/desktop/src/main/services/runtime/__tests__/governance/SkillCreatorAuditSink.test.ts`        | 11       | SkillCreatorAuditSink        |

### 統合テスト (1 ファイル / 8 テスト)

| #   | テストファイル                                                            | テスト数 | 対象                                              |
| --- | ------------------------------------------------------------------------- | -------- | ------------------------------------------------- |
| 4   | `apps/desktop/src/preload/__tests__/skill-creator-api.governance.test.ts` | 8        | Preload API + IPC channel + governance state 取得 |

**合計: 4 ファイル / 64 テスト**

---

## 2. Phase 別 Allow / Deny テストケース

### 2.1 plan phase

| ケースID | テスト内容                          | tool   | 期待結果 | カバーする AC |
| -------- | ----------------------------------- | ------ | -------- | ------------- |
| P-01     | Read は allowed                     | Read   | allow    | AC-1, AC-2    |
| P-02     | Glob は allowed                     | Glob   | allow    | AC-1, AC-2    |
| P-03     | Grep は allowed                     | Grep   | allow    | AC-1, AC-2    |
| P-04     | Write は denied (disallowedTools)   | Write  | deny     | AC-1, AC-2    |
| P-05     | Edit は denied (disallowedTools)    | Edit   | deny     | AC-1, AC-2    |
| P-06     | NotebookEdit は denied              | NbEdit | deny     | AC-2          |
| P-07     | permissionMode は "default"         | -      | default  | AC-1          |
| P-08     | context 付き Write も disallow 優先 | Write  | deny     | AC-2          |

### 2.2 execute phase

| ケースID | テスト内容                           | tool   | 期待結果 | カバーする AC |
| -------- | ------------------------------------ | ------ | -------- | ------------- |
| E-01     | Read は allowed                      | Read   | allow    | AC-1, AC-2    |
| E-02     | Write は allowed                     | Write  | allow    | AC-1, AC-2    |
| E-03     | Edit は allowed                      | Edit   | allow    | AC-1, AC-2    |
| E-04     | Bash は allowed                      | Bash   | allow    | AC-1, AC-2    |
| E-05     | NotebookEdit は denied               | NbEdit | deny     | AC-2          |
| E-06     | permissionMode は "acceptEdits"      | -      | aEdits   | AC-1          |
| E-07     | skill root 内 Write は allowed (ctx) | Write  | allow    | AC-2, AC-5    |
| E-08     | skill root 外 Write は denied (ctx)  | Write  | deny     | AC-2, AC-5    |

### 2.3 verify phase

| ケースID | テスト内容                        | tool   | 期待結果 | カバーする AC |
| -------- | --------------------------------- | ------ | -------- | ------------- |
| V-01     | Read は allowed                   | Read   | allow    | AC-1, AC-2    |
| V-02     | Bash は allowed (テスト実行用)    | Bash   | allow    | AC-1, AC-2    |
| V-03     | Write は denied (disallowedTools) | Write  | deny     | AC-1, AC-2    |
| V-04     | Edit は denied (disallowedTools)  | Edit   | deny     | AC-1, AC-2    |
| V-05     | NotebookEdit は denied            | NbEdit | deny     | AC-2          |
| V-06     | permissionMode は "default"       | -      | default  | AC-1          |

### 2.4 improve phase

| ケースID | テスト内容                         | tool   | 期待結果 | カバーする AC |
| -------- | ---------------------------------- | ------ | -------- | ------------- |
| I-01     | Read は allowed                    | Read   | allow    | AC-1, AC-2    |
| I-02     | Edit は allowed                    | Edit   | allow    | AC-1, AC-2    |
| I-03     | Write は denied (disallowedTools)  | Write  | deny     | AC-1, AC-2    |
| I-04     | NotebookEdit は denied             | NbEdit | deny     | AC-2          |
| I-05     | permissionMode は "acceptEdits"    | -      | aEdits   | AC-1          |
| I-06     | skill root 外 Edit は denied (ctx) | Edit   | deny     | AC-2          |

---

## 3. canUseTool callback テストケース

| ケースID | テスト内容                                               | 期待結果          | カバーする AC |
| -------- | -------------------------------------------------------- | ----------------- | ------------- |
| C-01     | disallowedTools に含まれる tool は即座に deny            | deny + reason     | AC-2          |
| C-02     | allowedTools に含まれない未知 tool は deny               | deny + reason     | AC-2          |
| C-03     | allowedTools に含まれる tool は allow                    | allow             | AC-2          |
| C-04     | execute で path_scoped: skill dir 内 → allow             | allow             | AC-2, AC-5    |
| C-05     | execute で path_scoped: skill dir 外 → deny              | deny + reason     | AC-2, AC-5    |
| C-06     | improve で path_scoped: 対象外パス → deny                | deny + reason     | AC-2          |
| C-07     | context なしの場合は基本判定のみ適用                     | allow (基本判定)  | AC-2          |
| C-08     | denied の場合は reason が非空文字列                      | reason != ""      | AC-4          |
| C-09     | plan で context 付き Write も disallowedTools 優先で拒否 | deny (disallowed) | AC-2          |

---

## 4. Hook 実行順テストケース

| ケースID | テスト内容                                                          | 期待される順序                                            | カバーする AC |
| -------- | ------------------------------------------------------------------- | --------------------------------------------------------- | ------------- |
| H-01     | 単一 tool: SessionStart → PreToolUse → PostToolUse → SessionEnd     | [session_start, pre_tool_use, post_tool_use, session_end] | AC-3          |
| H-02     | 複数 tool: SessionStart → [PreToolUse → PostToolUse]\* → SessionEnd | [session_start, pre*, post*, pre*, post*, session_end]    | AC-3          |
| H-03     | SessionStart 時に provenance が記録される                           | event.provenance != null                                  | AC-3, AC-5    |
| H-04     | session 固有 provenance がファクトリ provenance を上書きする        | session provenance が優先                                 | AC-5          |
| H-05     | PreToolUse で denied の場合も audit に記録される                    | denialEvents.length >= 1                                  | AC-3, AC-4    |
| H-06     | PostToolUse でエラー情報が metadata に含まれる                      | metadata.error != null                                    | AC-3          |
| H-07     | SessionEnd で summary が metadata に含まれる                        | metadata.summary != null                                  | AC-3          |

---

## 5. AuditSink テストケース

| ケースID | テスト内容                             | 期待結果                 | カバーする AC |
| -------- | -------------------------------------- | ------------------------ | ------------- |
| A-01     | record → getEvents で取得可能          | events.length == 1       | AC-3          |
| A-02     | 複数 record で順序保持                 | events[0] < events[1]    | AC-3          |
| A-03     | getEvents は read-only コピー          | 元配列に影響なし         | AC-3          |
| A-04     | recordEvent で timestamp 自動生成      | timestamp != null        | AC-3          |
| A-05     | recordEvent で provenance 含めて記録   | provenance != null       | AC-3, AC-5    |
| A-06     | recordEvent で decision 含めて記録     | decision.allowed defined | AC-3, AC-4    |
| A-07     | getRecentEvents(N) で直近 N 件取得     | recent.length == N       | AC-3          |
| A-08     | getEventsBySession で session フィルタ | session filtered         | AC-3          |
| A-09     | getDenialEvents で denied のみ取得     | denials only             | AC-3, AC-4    |
| A-10     | maxEvents 超過で古い event を破棄      | size == maxEvents        | AC-3          |
| A-11     | clear で全イベントクリア               | size == 0                | AC-3          |

---

## 6. 統合テストケース (preload / IPC)

| ケースID | テスト内容                                                               | 期待結果                    | カバーする AC |
| -------- | ------------------------------------------------------------------------ | --------------------------- | ------------- |
| IG-01    | respondToApproval が shared approval:respond channel を使用              | channel == approval:respond | AC-4          |
| IG-02    | respondToApproval が reject action も shared channel で処理              | same channel                | AC-4          |
| IG-03    | approval:respond が ALLOWED_INVOKE_CHANNELS に含まれる                   | included                    | AC-4          |
| IG-04    | getDisclosureInfo が shared disclosure channel を使用                    | channel == disclosure       | AC-4          |
| IG-05    | execution:get-disclosure-info が ALLOWED_INVOKE_CHANNELS に含まれる      | included                    | AC-4          |
| IG-06    | disclosure fetch 失敗時もエラーを envelope で返す                        | success == false            | AC-4          |
| IG-07    | skill-creator: で approval/disclosure 専用 channel が存在しない          | leakedChannels == []        | AC-6          |
| IG-08    | SKILL_CREATOR_GET_GOVERNANCE_STATE が ALLOWED_INVOKE_CHANNELS に含まれる | included                    | AC-4          |

---

## 7. テストカバレッジサマリ

| AC   | テストケース数 | 網羅状況                                                |
| ---- | -------------- | ------------------------------------------------------- |
| AC-1 | 18             | 4 phase x permissionMode + allowedTools/disallowedTools |
| AC-2 | 25             | canUseTool + context-aware + disallowed 判定            |
| AC-3 | 20             | Hook 実行順 + AuditSink 全操作                          |
| AC-4 | 12             | denial 記録 + UI payload + IPC channel                  |
| AC-5 | 6              | provenance 記録 + path_scoped 判定                      |
| AC-6 | 2              | 静的 channel 不在 + 動的読込維持                        |

---

## 8. 完了チェック

- [x] phase 別 allow/deny テストケースが全 4 phase で列挙されている
- [x] canUseTool callback のテストケースが定義されている
- [x] Hook 実行順（SessionStart→PreToolUse→PostToolUse→SessionEnd）テストが定義されている
- [x] AuditSink の record/retrieval/maxEvents/clear テストが定義されている
- [x] 統合テスト（IPC/preload）のテストケースが定義されている
- [x] AC-1〜AC-6 全てに対応するテストケースが存在する
