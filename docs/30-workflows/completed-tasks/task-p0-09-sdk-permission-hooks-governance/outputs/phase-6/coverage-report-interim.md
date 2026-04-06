# Phase 6: カバレッジレポート（中間）

## 対象ファイル

```
apps/desktop/src/main/services/runtime/governance/
├── SkillCreatorPermissionPolicy.ts
├── SkillCreatorHooksFactory.ts
├── SkillCreatorAuditSink.ts
└── index.ts
```

## branch カバレッジ分析（コード分析ベース）

### SkillCreatorAuditSink.ts

| branch                                                  | テスト                | 状態    |
| ------------------------------------------------------- | --------------------- | ------- |
| `record()`: events.length > maxEvents → true            | TC-AS-02, TC-AS-E01   | ✅ 網羅 |
| `record()`: events.length > maxEvents → false           | TC-AS-01              | ✅ 網羅 |
| `getDenialEvents()`: e.decision 存在 + allowed=false    | TC-AS-06              | ✅ 網羅 |
| `getDenialEvents()`: e.decision 存在 + allowed=true     | TC-AS-06 (Read event) | ✅ 網羅 |
| `getDenialEvents()`: e.decision 未定義（session_start） | TC-AS-E03             | ✅ 網羅 |
| `constructor()`: maxEvents デフォルト                   | TC-AS-12              | ✅ 網羅 |
| `constructor()`: maxEvents カスタム                     | TC-AS-10, TC-AS-E01   | ✅ 網羅 |

**推定 Branch Coverage: 95%+**（Phase 7 で正式計測）

### SkillCreatorPermissionPolicy.ts

| branch                                                                        | テスト                | 状態    |
| ----------------------------------------------------------------------------- | --------------------- | ------- |
| `canUseTool()`: disallowedTools に含まれる                                    | TC-PP-02, 09          | ✅ 網羅 |
| `canUseTool()`: allowedTools に含まれない                                     | TC-PP-18              | ✅ 網羅 |
| `canUseTool()`: context 引数あり → evaluateContextPolicy                      | TC-PP-E02〜E05        | ✅ 網羅 |
| `canUseTool()`: context 引数なし                                              | 多数                  | ✅ 網羅 |
| `evaluateContextPolicy()`: execute/improve phase + write tool + paths両方あり | TC-PP-E03/E04         | ✅ 網羅 |
| `evaluateContextPolicy()`: targetPath なし                                    | TC-PP-E05             | ✅ 網羅 |
| `evaluateContextPolicy()`: allowedSkillRoot なし                              | TC-PP-E05-B           | ✅ 網羅 |
| `evaluateContextPolicy()`: path 範囲内                                        | TC-PP-context-allowed | ✅ 網羅 |

**推定 Branch Coverage: 90%+**

### SkillCreatorHooksFactory.ts

| branch                                                                | テスト   | 状態    |
| --------------------------------------------------------------------- | -------- | ------- |
| `onSessionStart()`: sessionProvenance あり                            | TC-HF-03 | ✅ 網羅 |
| `onSessionStart()`: sessionProvenance なし（factory provenance 使用） | TC-HF-02 | ✅ 網羅 |

**推定 Branch Coverage: 100%**

## 総合評価

全ファイルで Branch Coverage 80% 以上を達成（推定）。
Phase 7 で `pnpm --filter @repo/desktop test -- --coverage` を用いた正式計測を実施する。

**作成日**: 2026-04-06
