# Phase 6 成果物: テスト拡充記録

## 追加テストケース

### TC-07: corrupt manifest → static loader fallback

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| ファイル | `RuntimeSkillCreatorFacade.default-activation.test.ts`   |
| 観点     | manifest JSON が不正な場合に silently 無視して fallback  |
| 設定     | AIWORKFLOW_SKILL_CREATOR_PATH → temp dir（corrupt JSON） |
| 前提     | sourceResolver mock（空 candidates）                     |
| 期待値   | `resourceLoader.loadAgent` が 3 回呼ばれる               |
| 結果     | ✓ PASS                                                   |

**学習事項**: `REPO_SKILL_CREATOR_PATH`（`.claude/skills/skill-creator`）は常時候補に含まれる。実際のエージェントファイルが存在するため、sourceResolver を mock しないと dynamic pipeline が成功してしまう。corrupt manifest テストでは必ず `sourceResolver.prototype.resolve` を mock すること。

### TC-08: concurrent plan() calls

| 項目     | 内容                                                   |
| -------- | ------------------------------------------------------ |
| ファイル | `RuntimeSkillCreatorFacade.default-activation.test.ts` |
| 観点     | 複数の plan() が同時実行されても独立して完了する       |
| 設定     | `Promise.all([plan("spec A"), plan("spec B")])`        |
| 期待値   | 両結果が valid、`sendChat` が 2 回呼ばれる             |
| 結果     | ✓ PASS                                                 |

**学習事項**: plan() 内で参照される `llmAdapter` はメソッド開始時にキャプチャされるため concurrent access でも安全。

## 既存テスト変更

### plan.test.ts

| 変更 | 内容                                                                |
| ---- | ------------------------------------------------------------------- |
| 追加 | `beforeEach` に `SkillCreatorSourceResolver.prototype.resolve` mock |
| 追加 | 「resourceLoader 未注入テスト」に `sendChat.mockResolvedValue` 設定 |
| 修正 | TC-8 の microtask flush 回数を 5 → 10 に変更                        |

### test.ts（既存 setLLMAdapter DI wiring）

| 変更 | 内容                                                                |
| ---- | ------------------------------------------------------------------- |
| 追加 | `import { SkillCreatorSourceResolver }` の追加                      |
| 追加 | `beforeEach` に `SkillCreatorSourceResolver.prototype.resolve` mock |

## 境界ケース分析

| シナリオ            | 動作            | テストケース |
| ------------------- | --------------- | ------------ |
| corrupt manifest    | silently skip   | TC-07        |
| 空 candidates       | static fallback | TC-04, TC-07 |
| resourceLoader なし | degraded error  | TC-06        |
| concurrent plan()   | 独立完了        | TC-08        |
| 外部注入優先        | custom resolver | TC-02        |
