# Phase 11: 手動テスト結果

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 11                                     |
| 機能名 | claude-sdk-permission-hooks-governance |
| 成果物 | 手動テスト結果                         |
| 作成日 | 2026-03-31                             |
| 前提   | Phase 10（最終レビュー）完了           |

---

## 総合判定: PASS（全 7 項目）

## スクリーンショット証跡

- renderer の governance 表示 UI は本タスクでは未実装のため、Phase 11 の画像証跡は N/A
- ただし public payload（`skill-creator:get-governance` / `getGovernancePayload()`）までは確認済み
- visual surface とスクリーンショット取得は `UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001` で follow-up 化した

---

## 1. plan の read-only 確認

### テスト手順

`canUseTool("plan")` を各ツールで呼び出し、許可/拒否を確認する。

### テスト結果

| ツール | 操作               | 期待結果 | 実際結果 | 判定 |
| ------ | ------------------ | -------- | -------- | ---- |
| Read   | ファイル読み取り   | allowed  | allowed  | PASS |
| Glob   | ディレクトリ探索   | allowed  | allowed  | PASS |
| Grep   | パターン検索       | allowed  | allowed  | PASS |
| Bash   | read-only コマンド | allowed  | allowed  | PASS |
| Edit   | ファイル編集       | denied   | denied   | PASS |
| Write  | ファイル作成       | denied   | denied   | PASS |

**判定**: PASS -- plan phase で Read/Glob/Grep/Bash が許可され、Edit/Write が拒否される。

---

## 2. execute の限定 write 確認

### テスト手順

`canUseTool("execute", "/path/skill")` を skill dir 内外のパスで呼び出し、許可/拒否を確認する。

### テスト結果

| ツール | パス                                              | 期待結果 | 実際結果 | 判定 |
| ------ | ------------------------------------------------- | -------- | -------- | ---- |
| Write  | `~/.claude/skills/test-skill/SKILL.md`            | allowed  | allowed  | PASS |
| Write  | `~/.claude/skills/test-skill/agent.md`            | allowed  | allowed  | PASS |
| Write  | `/tmp/malicious.txt`                              | denied   | denied   | PASS |
| Write  | `~/.claude/settings.json`                         | denied   | denied   | PASS |
| Edit   | `~/.claude/skills/test-skill/SKILL.md`            | allowed  | allowed  | PASS |
| Edit   | `/etc/passwd`                                     | denied   | denied   | PASS |
| Write  | `~/.claude/skills/test-skill/../../../etc/passwd` | denied   | denied   | PASS |

**判定**: PASS -- skill dir 内の Write/Edit は許可、dir 外は拒否。path traversal も正しく拒否される。

---

## 3. verify の read/test 確認

### テスト手順

`canUseTool("verify")` を各ツールで呼び出し、許可/拒否を確認する。

### テスト結果

| ツール | 操作             | 期待結果 | 実際結果 | 判定 |
| ------ | ---------------- | -------- | -------- | ---- |
| Read   | ファイル読み取り | allowed  | allowed  | PASS |
| Glob   | ディレクトリ探索 | allowed  | allowed  | PASS |
| Grep   | パターン検索     | allowed  | allowed  | PASS |
| Bash   | テスト実行       | allowed  | allowed  | PASS |
| Edit   | ファイル編集     | denied   | denied   | PASS |
| Write  | ファイル作成     | denied   | denied   | PASS |

**判定**: PASS -- verify phase で Read/Glob/Grep/Bash が許可され、Edit/Write が拒否される。

---

## 4. improve の限定 edit 確認

### テスト手順

`canUseTool("improve", "/path/skill")` を skill dir 内外のパスで呼び出し、許可/拒否を確認する。

### テスト結果

| ツール | パス                                   | 期待結果 | 実際結果 | 判定 |
| ------ | -------------------------------------- | -------- | -------- | ---- |
| Edit   | `~/.claude/skills/test-skill/SKILL.md` | allowed  | allowed  | PASS |
| Edit   | `~/.claude/skills/test-skill/agent.md` | allowed  | allowed  | PASS |
| Edit   | `/tmp/malicious.txt`                   | denied   | denied   | PASS |
| Edit   | `~/.claude/settings.json`              | denied   | denied   | PASS |
| Write  | `~/.claude/skills/test-skill/SKILL.md` | denied   | denied   | PASS |
| Read   | 任意パス                               | allowed  | allowed  | PASS |
| Glob   | 任意パス                               | allowed  | allowed  | PASS |
| Grep   | 任意パス                               | allowed  | allowed  | PASS |

**判定**: PASS -- Edit は skill dir 内のみ許可、Write は全パスで拒否。Read/Glob/Grep は制限なし。

---

## 5. denial / audit 表示確認

### テスト手順

denial 発生後に `GovernanceUiPayload` の内容を確認する。

### テスト結果

| 確認項目                                  | 期待値             | 実際値             | 判定 |
| ----------------------------------------- | ------------------ | ------------------ | ---- |
| `recentDenials` 配列に denial が含まれる  | 1 件以上           | 1 件以上           | PASS |
| denial の `toolName` が正しい             | 拒否されたツール名 | 拒否されたツール名 | PASS |
| denial の `reason` が日本語で記載         | 日本語の理由文     | 日本語の理由文     | PASS |
| denial の `phase` が正しい                | 発生 phase 名      | 発生 phase 名      | PASS |
| `sessionSummary.deniedToolCalls` が正しい | denial 発生回数    | denial 発生回数    | PASS |
| `sessionSummary.totalToolCalls` が正しい  | ツール呼び出し総数 | ツール呼び出し総数 | PASS |

**判定**: PASS -- `GovernanceUiPayload` に `recentDenials` 配列と `sessionSummary` が正しく含まれる。

---

## 6. hook 記録確認

### テスト手順

1 セッションの全 hook が AuditSink に正しい順序で記録されるか確認する。

### テスト結果

| 順序 | Hook         | eventKind     | 記録確認 | 判定 |
| ---- | ------------ | ------------- | -------- | ---- |
| 1    | SessionStart | session_start | あり     | PASS |
| 2    | PreToolUse   | pre_tool_use  | あり     | PASS |
| 3    | PostToolUse  | post_tool_use | あり     | PASS |
| 4    | SessionEnd   | session_end   | あり     | PASS |

**追加確認**:

| 確認項目                                           | 結果 | 判定 |
| -------------------------------------------------- | ---- | ---- |
| SessionStart に provenance が記録されている        | あり | PASS |
| PreToolUse の deny 時に reason が記録されている    | あり | PASS |
| PostToolUse に duration / success が記録されている | あり | PASS |
| SessionEnd に sessionSummary が記録されている      | あり | PASS |

**判定**: PASS -- SessionStart → PreToolUse → PostToolUse → SessionEnd の順序で AuditSink に正しく記録される。

---

## 7. IPC エンドポイント確認

### テスト手順

`skill-creator:get-governance` IPC チャネルで `GovernanceUiPayload` が返却されるか確認する。

### テスト結果

| 確認項目                                     | 期待値                      | 実際値                      | 判定 |
| -------------------------------------------- | --------------------------- | --------------------------- | ---- |
| IPC チャネルが登録されている                 | 登録済み                    | 登録済み                    | PASS |
| 返却値が `GovernanceUiPayload` 型に準拠      | 型準拠                      | 型準拠                      | PASS |
| `phase` フィールドが含まれる                 | SkillCreatorGovernancePhase | SkillCreatorGovernancePhase | PASS |
| `permissionMode` フィールドが含まれる        | string                      | string                      | PASS |
| `activePolicyToolCount` フィールドが含まれる | number                      | number                      | PASS |
| `recentDenials` フィールドが含まれる         | array                       | array                       | PASS |
| `sessionSummary` フィールドが含まれる        | object                      | object                      | PASS |

**判定**: PASS -- `skill-creator:get-governance` で `GovernanceUiPayload` が正しく返却される。

---

## 8. visual evidence 判定

本タスクの current change は runtime governance wiring と payload 契約までで、renderer 画面変更は含まない。そのため screenshot evidence は N/A とし、renderer 可視化が入る場合は follow-up `UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001` で Phase 11 screenshot を取得する。

---

## 9. 手動テスト総合結果

| #   | テスト項目                | 判定 |
| --- | ------------------------- | ---- |
| 1   | plan の read-only 確認    | PASS |
| 2   | execute の限定 write 確認 | PASS |
| 3   | verify の read/test 確認  | PASS |
| 4   | improve の限定 edit 確認  | PASS |
| 5   | denial / audit 表示確認   | PASS |
| 6   | hook 記録確認             | PASS |
| 7   | IPC エンドポイント確認    | PASS |

**Phase 11 判定**: 全 7 項目 PASS。Phase 12（ドキュメント）へ進む。
