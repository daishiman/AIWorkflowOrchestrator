# Phase 4: テストマトリクス (Test Matrix)

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| タスクID | TASK-P0-09                             |
| 機能名   | claude-sdk-permission-hooks-governance |
| Phase    | 4                                      |
| 作成日   | 2026-03-31                             |

---

## テスト概要

| テストファイル                         | テスト数 | カテゴリ                               |
| -------------------------------------- | -------- | -------------------------------------- |
| `SkillCreatorGovernancePolicy.test.ts` | 18       | Phase 別ポリシー + canUseTool callback |
| `GovernanceAuditSink.test.ts`          | 10       | 監査イベント蓄積 + サマリー生成        |
| `GovernanceHooksFactory.test.ts`       | 13       | Hook 生成 + 呼び出し順 + パス制限      |
| **合計** (it.each 展開込み)            | **45**   |                                        |

> `it.each` で 4 phase を展開する `getPolicyForPhase` テストは 1 つの `it` 定義で 4 テストケースを生成するため、実行時テスト数は 45 件となる。

---

## 1. Phase 別 tool allow/deny ケース

### 1.1 SkillCreatorGovernancePolicy.test.ts - PHASE_POLICIES

| #   | テストケース                            | Phase   | 期待結果                                                         |
| --- | --------------------------------------- | ------- | ---------------------------------------------------------------- |
| 1   | plan phase は read-only 中心            | plan    | permissionMode=plan, Read/Glob/Grep/Bash許可, Edit/Write拒否     |
| 2   | execute phase は限定 write              | execute | permissionMode=acceptEdits, 全ツール許可, disallowedTools 未定義 |
| 3   | verify phase は read/test 中心          | verify  | permissionMode=plan, Read許可, Edit/Write拒否                    |
| 4   | improve phase は限定 edit（Write 禁止） | improve | permissionMode=acceptEdits, Edit許可, Write拒否                  |

### 1.2 SkillCreatorGovernancePolicy.test.ts - getPolicyForPhase

| #   | テストケース                                              | Phase                       | 期待結果                |
| --- | --------------------------------------------------------- | --------------------------- | ----------------------- |
| 5-8 | `it.each` で plan/execute/verify/improve のポリシーを返す | plan/execute/verify/improve | policy.phase が一致する |

### 1.3 SkillCreatorGovernancePolicy.test.ts - createCanUseToolCallback (plan phase)

| #   | テストケース           | ツール名    | 期待結果                                                   |
| --- | ---------------------- | ----------- | ---------------------------------------------------------- |
| 9   | Read を許可する        | Read        | `{ allowed: true }`                                        |
| 10  | Edit を拒否する        | Edit        | `allowed: false`, reason に "disallowed" 含む              |
| 11  | Write を拒否する       | Write       | `allowed: false`                                           |
| 12  | 未知のツールを拒否する | UnknownTool | `allowed: false`, reason に "not in the allowed list" 含む |

### 1.4 SkillCreatorGovernancePolicy.test.ts - createCanUseToolCallback (execute phase)

| #   | テストケース                                      | 条件                  | 期待結果                     |
| --- | ------------------------------------------------- | --------------------- | ---------------------------- |
| 13  | Write を許可する（パス制限なし）                  | skillTargetDir 未指定 | `{ allowed: true }`          |
| 14  | Write を skill dir 内のみ許可する（パス制限あり） | skillTargetDir 指定   | dir 内 → 許可、dir 外 → 拒否 |

### 1.5 SkillCreatorGovernancePolicy.test.ts - createCanUseToolCallback (improve phase)

| #   | テストケース                                    | 条件         | 期待結果            |
| --- | ----------------------------------------------- | ------------ | ------------------- |
| 15  | Edit を許可する（既存ファイルの改善）           | パス制限なし | `{ allowed: true }` |
| 16  | Write を拒否する（新規ファイル作成は禁止）      | -            | `allowed: false`    |
| 17  | skillTargetDir 指定時、dir 内の Edit を許可する | dir 内パス   | `{ allowed: true }` |
| 18  | skillTargetDir 指定時、dir 外の Edit を拒否する | dir 外パス   | `allowed: false`    |
| 19  | file_path 未指定時は Edit を許可する            | toolInput 空 | `{ allowed: true }` |

### 1.6 SkillCreatorGovernancePolicy.test.ts - createCanUseToolCallback (verify phase)

| #   | テストケース    | ツール名 | 期待結果            |
| --- | --------------- | -------- | ------------------- |
| 20  | Read を許可する | Read     | `{ allowed: true }` |
| 21  | Bash を許可する | Bash     | `{ allowed: true }` |
| 22  | Edit を拒否する | Edit     | `allowed: false`    |

---

## 2. canUseTool callback ケース（skillTargetDir 内外）

上記 1.4 / 1.5 に含まれるパス制限テストで網羅。

| #   | テスト対象                      | skillTargetDir              | file_path                               | 期待結果         |
| --- | ------------------------------- | --------------------------- | --------------------------------------- | ---------------- |
| 14a | execute - dir 内 Write          | `~/.claude/skills/my-skill` | `~/.claude/skills/my-skill/SKILL.md`    | 許可             |
| 14b | execute - dir 外 Write          | `~/.claude/skills/my-skill` | `/etc/passwd`                           | 拒否             |
| 17  | improve - dir 内 Edit           | `~/.claude/skills/my-skill` | `~/.claude/skills/my-skill/SKILL.md`    | 許可             |
| 18  | improve - dir 外 Edit           | `~/.claude/skills/my-skill` | `~/.claude/skills/other-skill/SKILL.md` | 拒否             |
| 19  | improve - file_path 未指定 Edit | `~/.claude/skills/my-skill` | （未指定）                              | 許可（判定不可） |

---

## 3. Hook 呼び出し順ケース

### 3.1 GovernanceHooksFactory.test.ts

| #   | テストケース                                                       | カテゴリ         | 期待結果                                                             |
| --- | ------------------------------------------------------------------ | ---------------- | -------------------------------------------------------------------- |
| 23  | 4 種類の hook を返す                                               | hooks 生成       | onSessionStart/onPreToolUse/onPostToolUse/onSessionEnd 全て function |
| 24  | auditSink 未指定時は内部で生成する                                 | hooks 生成       | GovernanceAuditSink インスタンス                                     |
| 25  | session_start イベントを記録する                                   | onSessionStart   | events[0].eventKind === "session_start"                              |
| 26  | metadata に policy 情報が含まれる                                  | onSessionStart   | metadata.permissionMode / metadata.allowedTools                      |
| 27  | 許可されたツールは allow を返す                                    | onPreToolUse     | `{ allow: true }`                                                    |
| 28  | 禁止されたツールは deny + reason を返す                            | onPreToolUse     | `allow: false`, reason に "disallowed" 含む                          |
| 29  | allow 時は pre_tool_use イベントを記録する                         | onPreToolUse     | eventKind=pre_tool_use, decision=allow                               |
| 30  | deny 時は tool_denied イベントを記録する                           | onPreToolUse     | eventKind=tool_denied, decision=deny                                 |
| 31  | post_tool_use イベントを記録する                                   | onPostToolUse    | eventKind=post_tool_use, durationMs 記録                             |
| 32  | session_end イベントにサマリーを含める                             | onSessionEnd     | metadata.summary に phase/sessionId                                  |
| 33  | SessionStart -> PreToolUse -> PostToolUse -> SessionEnd の順で記録 | 呼び出し順序     | eventKind 配列が正順                                                 |
| 34  | skillTargetDir 内の Write を許可する                               | execute パス制限 | allow: true                                                          |
| 35  | skillTargetDir 外の Write を拒否する                               | execute パス制限 | allow: false                                                         |

---

## 4. 監査イベント蓄積・サマリーケース

### 4.1 GovernanceAuditSink.test.ts

| #   | テストケース                         | カテゴリ            | 期待結果                                        |
| --- | ------------------------------------ | ------------------- | ----------------------------------------------- |
| 36  | イベントを記録して取得できる         | record / getEvents  | events.length === 1, phase/eventKind 一致       |
| 37  | 複数イベントを順序通り蓄積する       | record / getEvents  | 順序維持、toolName 一致                         |
| 38  | denial イベントのみ返す              | getRecentDenials    | tool_denied のみ、allow はフィルタされる        |
| 39  | limit を超えた分は古い方を切り捨てる | getRecentDenials    | 最新 N 件のみ返却                               |
| 40  | tool 呼び出し統計を正確に集計する    | buildSessionSummary | totalToolCalls/deniedToolCalls/allowedToolNames |
| 41  | 空の場合はゼロ値を返す               | buildSessionSummary | totalToolCalls=0, deniedToolCalls=0             |
| 42  | phase に応じた UI payload を返す     | buildUiPayload      | phase/permissionMode/activePolicyToolCount 一致 |
| 43  | 全イベントをクリアする               | clear               | events.length === 0                             |

### 4.2 createAuditEvent ヘルパー

| #   | テストケース                           | カテゴリ         | 期待結果                           |
| --- | -------------------------------------- | ---------------- | ---------------------------------- |
| 44  | 必須フィールドを持つイベントを生成する | createAuditEvent | phase/eventKind/toolName/timestamp |
| 45  | オプションフィールドなしでも生成できる | createAuditEvent | toolName/decision は undefined     |

---

## 5. Edge Cases

| #   | テストケース                       | 対象                     | 備考                                                  |
| --- | ---------------------------------- | ------------------------ | ----------------------------------------------------- |
| 12  | 未知のツール名                     | createCanUseToolCallback | allowedTools に無いツール → "not in the allowed list" |
| 19  | file_path 未指定の Edit（improve） | createCanUseToolCallback | パス制限判定不可 → 許可（fail-open）                  |
| 14b | skillTargetDir 外への Write        | createCanUseToolCallback | `/etc/passwd` → "restricted" で拒否                   |
| 41  | イベント未登録でサマリー生成       | buildSessionSummary      | ゼロ値が返る（例外なし）                              |
| 24  | auditSink 未指定で hooks 生成      | createGovernanceHooks    | 内部で GovernanceAuditSink を自動生成                 |

---

## テストファイル配置

```
apps/desktop/src/main/services/runtime/__tests__/
  SkillCreatorGovernancePolicy.test.ts   # 22 tests (including it.each x4)
  GovernanceAuditSink.test.ts            # 10 tests
  GovernanceHooksFactory.test.ts         # 13 tests
```

## テスト実行コマンド

```bash
pnpm --filter @repo/desktop vitest run --reporter verbose \
  src/main/services/runtime/__tests__/SkillCreatorGovernancePolicy.test.ts \
  src/main/services/runtime/__tests__/GovernanceAuditSink.test.ts \
  src/main/services/runtime/__tests__/GovernanceHooksFactory.test.ts
```
