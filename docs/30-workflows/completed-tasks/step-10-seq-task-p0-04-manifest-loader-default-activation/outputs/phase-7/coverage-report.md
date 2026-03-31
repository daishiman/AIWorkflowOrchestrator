# Phase 7 成果物: カバレッジレポート

## AC-1〜AC-7 対応表

| AC   | 内容                                                        | テストケース        | コード実装                                                | 判定 |
| ---- | ----------------------------------------------------------- | ------------------- | --------------------------------------------------------- | ---- |
| AC-1 | 3コンポーネントが自動インスタンス化される                   | TC-01, TC-02        | コンストラクタ `?? new ...`                               | PASS |
| AC-2 | sourceResolver が自動インスタンス化される                   | TC-01, TC-02        | `deps.sourceResolver ?? new SkillCreatorSourceResolver()` | PASS |
| AC-3 | resourcePlanner/resolvedResourceReader が自動インスタンス化 | TC-01, TC-02        | 同上                                                      | PASS |
| AC-4 | dynamic resource pipeline を常に試行する                    | TC-01               | `resolveOperationResources()` を常時試行                  | PASS |
| AC-5 | explicitRoot なしで manifest 自動発見                       | TC-03               | `loadWorkflowManifest` candidates ループ                  | PASS |
| AC-6 | manifest 未発見時 static loader fallback                    | TC-04, TC-06, TC-07 | `!dynamicPipelineSucceeded && this.resourceLoader`        | PASS |
| AC-7 | 外部注入コンポーネントが自動インスタンスより優先            | TC-02               | DI override パターン                                      | PASS |

## init path カバレッジ

| 分岐                                     | カバー状況 | テストケース                 |
| ---------------------------------------- | ---------- | ---------------------------- |
| 3コンポーネント全て非注入                | ✓          | TC-01, TC-03, TC-06          |
| sourceResolver のみ注入                  | ✓          | TC-02 (prototype spy で確認) |
| 3コンポーネント全て注入                  | ✓          | TC-02 (custom resolver)      |
| resourceLoader あり（非3コンポーネント） | ✓          | TC-04, TC-07                 |

## fallback path カバレッジ

| パス                                | カバー状況 | テストケース |
| ----------------------------------- | ---------- | ------------ |
| manifest 発見 → dynamic 成功        | ✓          | TC-03        |
| manifest 未発見 → static fallback   | ✓          | TC-04, TC-07 |
| static loader なし → degraded error | ✓          | TC-06        |
| corrupt manifest → silently skip    | ✓          | TC-07        |
| concurrent plan() → 独立完了        | ✓          | TC-08        |

## テストファイルとカバレッジ対象の関係

| テストファイル                  | カバー AC  | テスト数 |
| ------------------------------- | ---------- | -------- |
| default-activation.test.ts      | AC-1〜AC-7 | 7        |
| plan.test.ts                    | AC-4, AC-6 | 21       |
| test.ts (DI wiring)             | AC-1, AC-7 | 22       |
| plan-resource-selection.test.ts | AC-5, AC-7 | 1        |

**総テスト数: 417 (26 ファイル)**
