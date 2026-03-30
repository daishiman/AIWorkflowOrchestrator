# Phase 4 成果物: テスト仕様書

## テストファイル

`apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.default-activation.test.ts`

---

## テストケース一覧

### TC-01: AC-1/2/3/4 — 注入なしでも dynamic resource pipeline が試行される

| 項目   | 内容                                                                                                |
| ------ | --------------------------------------------------------------------------------------------------- |
| ID     | TC-01                                                                                               |
| AC     | AC-1, AC-2, AC-3, AC-4                                                                              |
| 観点   | 注入なしで Facade を生成した場合でも、dynamic pipeline 解決が開始される                             |
| 手法   | plan() を呼び出し、dynamic pipeline 経由の分岐に入ることを確認（sourceResolver.resolve が呼ばれる） |
| 期待値 | `SkillCreatorSourceResolver.prototype.resolve` がモック可能なことを確認。呼ばれたら AC-1〜4 が通過  |

### TC-02: AC-1/2/3 — 外部注入コンポーネントが自動インスタンスより優先される

| 項目   | 内容                                                                             |
| ------ | -------------------------------------------------------------------------------- |
| ID     | TC-02                                                                            |
| AC     | AC-1, AC-2, AC-3                                                                 |
| 観点   | 外部から注入された sourceResolver が使われる（自動インスタンスで上書きされない） |
| 手法   | 外部 mock を注入し、その mock の resolve が呼ばれることを確認                    |
| 期待値 | 注入した mock の `resolve` が呼ばれる                                            |

### TC-03: AC-5 — loadWorkflowManifest が candidates から manifest を自動発見

| 項目   | 内容                                                                                                      |
| ------ | --------------------------------------------------------------------------------------------------------- |
| ID     | TC-03                                                                                                     |
| AC     | AC-5                                                                                                      |
| 観点   | explicitRoot がない場合でも source resolver candidates から manifest を発見                               |
| 手法   | temp directory に workflow-manifest.json を作成し、AIWORKFLOW_SKILL_CREATOR_PATH を設定して plan() を呼ぶ |
| 期待値 | LLM に渡されるシステムプロンプトに manifest で指定されたリソース内容が含まれる                            |

### TC-04: AC-6 — manifest 未発見時に static loader fallback が動作する

| 項目   | 内容                                                                             |
| ------ | -------------------------------------------------------------------------------- |
| ID     | TC-04                                                                            |
| AC     | AC-6                                                                             |
| 観点   | manifest が見つからない場合、resourceLoader.loadAgent が呼ばれる                 |
| 手法   | manifest なし + resourceLoader mock 注入で plan() を呼ぶ                         |
| 期待値 | `resourceLoader.loadAgent` が PLAN_PROMPT_CONSTANTS.AGENT_NAMES の数だけ呼ばれる |

### TC-05: AC-7 — explicitRoot あり + manifest あり → dynamic pipeline 経由（既存動作維持）

| 項目   | 内容                                                                                     |
| ------ | ---------------------------------------------------------------------------------------- |
| ID     | TC-05                                                                                    |
| AC     | AC-5, AC-7                                                                               |
| 観点   | resourceLoader + 3コンポーネント + manifest がある場合は dynamic pipeline を使う（回帰） |
| 手法   | 既存の plan-resource-selection.test.ts のパターンと同様                                  |
| 期待値 | dynamic pipeline 経由でリソースが取得され、LLM に渡される                                |

### TC-06: fallback — resourceLoader も manifest もない場合は degraded error

| 項目   | 内容                                                                            |
| ------ | ------------------------------------------------------------------------------- |
| ID     | TC-06                                                                           |
| AC     | AC-6                                                                            |
| 観点   | resourceLoader も manifest もない場合は空プロンプトで続行せず、明示的に失敗する |
| 手法   | llmAdapter あり + resourceLoader なし + manifest なし で plan() を呼ぶ          |
| 期待値 | `resource_loader_unavailable` を返し、LLM は呼ばれない                          |

---

## AC-1〜AC-7 対応表

| AC   | テストケース      |
| ---- | ----------------- |
| AC-1 | TC-01, TC-02      |
| AC-2 | TC-01, TC-02      |
| AC-3 | TC-01, TC-02      |
| AC-4 | TC-01             |
| AC-5 | TC-03, TC-05      |
| AC-6 | TC-04, TC-06      |
| AC-7 | TC-05（回帰確認） |

---

## fail-first 観点

実装前（Phase 5 前）の期待:

- TC-01: `SkillCreatorSourceResolver.prototype.resolve` が呼ばれない（dynamic pipeline 未活性化のため）
- TC-03: manifest が発見されない（`loadWorkflowManifest()` が explicitRoot なしで動作しないため）
- TC-04: `loadAgent` が呼ばれる（現在は static loader を使う）← 現在も通過する可能性あり

Phase 5 実装後の期待:

- TC-01: `resolve` が呼ばれる（自動インスタンス化で dynamic pipeline 有効）
- TC-03: manifest が発見される（candidates 探索が追加される）
- TC-04: fallback chain で `loadAgent` が引き続き呼ばれる（変更なし）
