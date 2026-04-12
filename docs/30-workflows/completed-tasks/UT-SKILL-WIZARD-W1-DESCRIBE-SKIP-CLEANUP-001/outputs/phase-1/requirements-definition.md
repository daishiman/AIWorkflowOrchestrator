# 要件定義書

## タスクID: UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001

## 調査結果（P50チェック）

### 旧 testid 残存箇所の全量

```
grep -rn "skill-lifecycle-request-input" apps/desktop/src/renderer/components/skill/__tests__/
```

| ファイル                                     | 行番号 | describe.skip ブロック                                       | 内容                                                                         |
| -------------------------------------------- | ------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| SkillLifecyclePanel.llm-generation.test.tsx  | 351    | U-1                                                          | `const input = screen.getByTestId("skill-lifecycle-request-input");`         |
| SkillLifecyclePanel.llm-generation.test.tsx  | 381    | U-2                                                          | `const input = screen.getByTestId("skill-lifecycle-request-input");`         |
| SkillLifecyclePanel.llm-generation.test.tsx  | 422    | U-4                                                          | `const input = screen.getByTestId("skill-lifecycle-request-input");`         |
| SkillLifecyclePanel.llm-generation.test.tsx  | 474    | U-6                                                          | `const input = screen.getByTestId("skill-lifecycle-request-input");`         |
| SkillLifecyclePanel.llm-generation.test.tsx  | 558    | U-10 (it-1)                                                  | `const input = screen.getByTestId("skill-lifecycle-request-input");`         |
| SkillLifecyclePanel.llm-generation.test.tsx  | 584    | U-10 (it-2)                                                  | `const input = screen.getByTestId("skill-lifecycle-request-input");`         |
| SkillLifecyclePanel.llm-generation.test.tsx  | 627    | U-12                                                         | `const input = screen.getByTestId("skill-lifecycle-request-input");`         |
| SkillLifecyclePanel.llm-generation.test.tsx  | 1070   | U-8b                                                         | `const input = screen.getByTestId("skill-lifecycle-request-input");`         |
| SkillLifecyclePanel.llm-generation.test.tsx  | 1400   | U-18b                                                        | `const input = screen.getByTestId("skill-lifecycle-request-input");`         |
| SkillLifecyclePanel.llm-generation.test.tsx  | 1441   | U-19b                                                        | `const input = screen.getByTestId("skill-lifecycle-request-input");`         |
| SkillLifecyclePanel.llm-generation.test.tsx  | 1509   | U-21                                                         | `const input = screen.getByTestId("skill-lifecycle-request-input");`         |
| SkillLifecyclePanel.auth-regression.test.tsx | 172    | `fillCreateRequest` 関数（skip外に定義、skip内からのみ呼出） | `fireEvent.change(screen.getByTestId("skill-lifecycle-request-input"), ...)` |

**合計**: llm-generation に11箇所、auth-regression に1箇所（計12箇所）

### スコープ外ファイルの確認

`SkillLifecyclePanel.test.tsx` にも line 304, 385 に参照があるが、こちらは `queryByTestId` で「存在しないこと」を確認するアクティブなテストであり、**本タスクの対象外**（削除しない）。

### 現行 testid 一覧（SkillLifecyclePanel.tsx）

| testid                                 | 用途                               |
| -------------------------------------- | ---------------------------------- |
| skill-lifecycle-panel                  | パネル全体                         |
| skill-lifecycle-open-wizard            | ウィザード開くボタン（遷移ボタン） |
| skill-lifecycle-mode-label             | モードラベル                       |
| skill-lifecycle-created-name           | 作成済みスキル名                   |
| skill-lifecycle-improve-count          | 改善回数                           |
| skill-lifecycle-error                  | エラーメッセージ                   |
| skill-lifecycle-generation-progress    | 生成進捗                           |
| skill-lifecycle-workflow-summary       | ワークフロー概要                   |
| skill-lifecycle-question-host          | 質問ホスト                         |
| skill-lifecycle-provenance-summary     | プロバナンスサマリー               |
| skill-lifecycle-handoff-card           | ハンドオフカード                   |
| skill-lifecycle-disclosure-summary     | ディスクロージャーサマリー         |
| skill-lifecycle-open-wizard-button     | ウィザード開くボタン（遷移後）     |
| skill-lifecycle-execute-button         | 実行ボタン                         |
| skill-lifecycle-improve-button         | 改善ボタン                         |
| skill-lifecycle-analysis-toggle        | 分析トグル                         |
| skill-lifecycle-runtime-improve-result | ランタイム改善結果                 |
| skill-lifecycle-improve-result         | 改善結果                           |
| skill-lifecycle-analysis-view          | 分析ビュー                         |
| skill-lifecycle-session-log            | セッションログ                     |
| skill-lifecycle-approval-request       | 承認依頼                           |

**`skill-lifecycle-request-input` は現行コンポーネントに存在しない（削除済み）。**

## 機能要件

| ID    | 要件                                                                                                     |
| ----- | -------------------------------------------------------------------------------------------------------- |
| FR-01 | `SkillLifecyclePanel.llm-generation.test.tsx` 内の `skill-lifecycle-request-input` 参照が削除されている  |
| FR-02 | `SkillLifecyclePanel.auth-regression.test.tsx` 内の `skill-lifecycle-request-input` 参照が削除されている |
| FR-03 | `describe.skip` ブロックのスキップ状態が維持されている（スキップを解除しない）                           |
| FR-04 | 変更後のテストファイルが TypeScript の型チェックをパスする                                               |

## 非機能要件

| ID     | 要件                                                                 |
| ------ | -------------------------------------------------------------------- |
| NFR-01 | 変更がテストファイルのみに限定されていること（本体コードの変更なし） |
| NFR-02 | 変更による既存のアクティブテストへの回帰がないこと                   |
| NFR-03 | `describe.skip` ブロックの外のテストケースに影響しないこと           |

---

_作成日: 2026-04-11_
