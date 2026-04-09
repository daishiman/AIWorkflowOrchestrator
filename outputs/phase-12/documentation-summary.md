# Phase 12: ドキュメント更新サマリー - TASK-SC-07

## 実施日

2026-04-09

---

## 1. 実装済みパターン

### TASK-SC-07 の current facts

| 苦戦箇所                     | 問題                                                                    | 解決策                                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| P1: 生成方法の分岐           | Step 0 で template と LLM の両経路を持つため、画面状態が分かれやすい    | `generationMode` を single source of truth にして、template は `SkillInfoStep`、LLM は説明文 textarea に分岐 |
| P2: executePlan の引数不足   | `skillSpec` が必須なのに description を流用すると事故る                 | `PlanResult.skillSpec` を正本として `executePlan(planId, skillSpec)` に渡す                                  |
| P3: 失敗 snapshot の見逃し   | ack 後の失敗を `executePlan` だけでは拾えない                           | `getWorkflowState(planId)` を再読込し、`verifyResult.status === "fail"` をエラー surface に載せる            |
| P4: 進捗表示の漏れ           | progress は store にあるのに UI で見えないと操作不能になる              | `generationProgress` を `GenerateStep` に表示し、message より低優先で併用する                                |
| P5: deprecated 依存の残留    | `DescribeStep.tsx` など過去の名称が残ると読む人が迷う                   | 正本は `SkillInfoStep` であることを明記し、deprecated ファイルは互換用と説明する                             |
| P6: persistResult の復元漏れ | executePlan 後の `skillPath` が snapshot に入らないと完了画面が空になる | `WorkflowEngine` の snapshot に `persistResult` を再公開し、renderer 側で `CompleteStep` に渡す              |
| P7: キャンセル競合           | 遅延応答や cancelled ステージ残留が次回生成を壊す                       | request-id guard と `resetStreamingProgress()` で古い応答と進捗状態を破棄する                                |

---

## 2. 成果物一覧

| Phase    | 成果物                                                                                                                                                                                        | 状態 |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| phase-11 | `manual-test-result.md`, `ui-sanity-visual-review.md`, `screenshots/TC-11-01...05`                                                                                                            | ✅   |
| phase-12 | `implementation-guide.md`, `system-spec-update-summary.md`, `documentation-changelog.md`, `unassigned-task-detection.md`, `skill-feedback-report.md`, `phase12-task-spec-compliance-check.md` | ✅   |

---

## 3. 変更ファイルの要点

| ファイル                                    | 変更種別   | 内容                                                                                                                           |
| ------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `SkillCreateWizard.tsx`                     | 機能追加   | LLM / template モード分岐、`planSkill`、`executePlan`、`getWorkflowState`、request-id guard、`resetStreamingProgress()` を接続 |
| `GenerateStep.tsx`                          | UI調整     | `generationProgress` / `planResult` / `terminal_handoff` guidance を表示                                                       |
| `DescribeStep.tsx`                          | 互換維持   | deprecated のまま `GenerationMode` import を正規化                                                                             |
| `SkillCreateWizard.llm-generation.test.tsx` | テスト強化 | blank input、`skillSpec` 必須、snapshot failure、terminal handoff、キャンセル競合を追加                                        |

---

## 4. 引き継ぎメモ

- `skillSpec` は `executePlan` の必須引数として扱う。
- `generationProgress` は UI に出す。
- `getWorkflowState()` の fail snapshot は CompleteStep に進めない。
- `persistResult.skillPath` は snapshot から復元し、CompleteStep に渡す。
- request-id guard で遅延した古い応答を無視する。
- Phase 11 の既存 screenshot は、Step 0 / Step 1 / Step 3 の視覚確認根拠として参照する。
