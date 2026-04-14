# Phase 6: テスト拡充記録（境界ケース evidence）

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 6                        |
| Phase名    | テスト拡充               |
| タスクID   | TASK-SW-FIX-FEEDBACK-001 |
| 作成日     | 2026-04-14               |
| ステータス | completed                |

---

## 1. SkillLifecyclePanel 境界確認（Task 1 実行結果）

### 境界ケース一覧

| ケース                                                   | 確認方法                                                                        | 結果 |
| -------------------------------------------------------- | ------------------------------------------------------------------------------- | ---- |
| `terminal_handoff` 時に `fetchSkills` が呼ばれない       | U-13 で `expect(mockFetchSkills).not.toHaveBeenCalled()` を確認                 | PASS |
| `terminal_handoff` 時に `selectSkillByName` が呼ばれない | U-13 で `expect(mockSelectSkillByName).not.toHaveBeenCalled()` を確認           | PASS |
| 成功パスで `fetchSkills` が1回呼ばれる                   | U-8 で `expect(mockFetchSkills).toHaveBeenCalledTimes(1)` を確認                | PASS |
| 成功パスで `selectSkillByName` が続く                    | U-8 で `expect(mockSelectSkillByName).toHaveBeenCalledWith("new-skill")` を確認 | PASS |
| `generationError` が存在する場合の UI                    | U-7 で `generationError` が画面に表示されることを確認                           | PASS |
| `executePlan` 失敗時に `fetchSkills` が呼ばれない        | U-14 で `expect(mockFetchSkills).not.toHaveBeenCalled()` を確認                 | PASS |

### コード参照

- `SkillLifecyclePanel.tsx` L1080-1092: terminal_handoff early return
- `SkillLifecyclePanel.tsx` L1110-1116: success path での fetchSkills / selectSkillByName
- `SkillLifecyclePanel.tsx` L1093-1098: errorResponse early return（fetchSkills 未呼び出し）

---

## 2. CompleteStep 境界確認（Task 2 実行結果）

### 境界ケース一覧

| ケース                                                                                         | evidence                                                                                                   | 結果 |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---- |
| `onRetry` 未指定でも `skillPath=null` のエラー UI が安全に描画                                 | TC-FEEDBACK-011: `expect(() => renderCompleteStep({ skillPath: null, onRetry: undefined })).not.toThrow()` | PASS |
| `skillPath = ""` は null ではないため success path として扱われる                              | TC-FEEDBACK-009: 空文字で成功ヘッダーが表示されること確認                                                  | PASS |
| `skillPath = null` の場合アクションカードが表示されない                                        | TC-FEEDBACK-004b: `expect(screen.queryByTestId("complete-step-action-execute")).not.toBeInTheDocument()`   | PASS |
| `onRetry` 指定時は `skillPath=null` のエラー UI で retry ボタンクリックで `onRetry` が呼ばれる | TC-FEEDBACK-011c: `expect(onRetry).toHaveBeenCalledTimes(1)`                                               | PASS |
| `skillPath=null` の場合 `complete-step-error-header` の `data-testid` が存在する               | TC-FEEDBACK-011b: testid 確認                                                                              | PASS |

### コード参照

- `CompleteStep.tsx` L117: `if (skillPath === null)` — **厳密等値 (`===`)** で null のみを失敗ケースとして扱う
- `CompleteStep.tsx` L136-144: `<button onClick={onRetry}>` — `onRetry?.()` により null-safe
- `CompleteStep.tsx` L163-173: `{skillPath && (...)}` — 空文字でも truthy でないため path 表示なし（成功 UI は表示）

### 境界値の分類

| 値                 | 扱い       | 表示されるUI                           |
| ------------------ | ---------- | -------------------------------------- |
| `null`             | 失敗ケース | エラーUI のみ                          |
| `undefined`        | 正常パス   | 成功ヘッダー表示（skillPath 表示なし） |
| `""`（空文字）     | 正常パス   | 成功ヘッダー表示（skillPath 表示なし） |
| `"/path/to/skill"` | 正常パス   | 成功ヘッダー + スキルパス表示          |

---

## 3. 回帰確認（Task 3 実行結果）

### SkillLifecyclePanel 全既存テストの状態

| テストスイート    | 状態 | 備考                                          |
| ----------------- | ---- | --------------------------------------------- |
| U-3               | PASS | isGenerating=true で execute ボタン無効       |
| U-5               | PASS | integrated_api で「生成計画」セクション表示   |
| U-7               | PASS | generationError 表示                          |
| U-8               | PASS | executePlan → fetchSkills → selectSkillByName |
| U-9               | PASS | キャンセルで clearGenerationState             |
| U-13              | PASS | terminal_handoff early return                 |
| U-13b             | PASS | workflow snapshot summary 表示                |
| U-13c             | PASS | workflow user input submission                |
| U-14              | PASS | executePlan failure → generationError         |
| U-15              | PASS | executePlan empty data → default error        |
| U-16              | PASS | verify detail 表示                            |
| U-17              | PASS | reverify button                               |
| U-17b             | PASS | runtime improve surface                       |
| U-18              | PASS | verify detail fail status                     |
| U-19              | PASS | verify detail pass status                     |
| U-20              | PASS | verify detail fetch failure with retry        |
| TASK-RT-05 series | PASS | multi_select question host                    |

- **issue 8 の非ブロッキング化はこの Phase に含めない（follow-up 確認）**

### Phase 4 evidence との回帰確認

| TC番号          | Phase 4 evidence | Phase 6 境界ケース後 | 変化 |
| --------------- | ---------------- | -------------------- | ---- |
| TC-FEEDBACK-001 | PASS             | PASS                 | なし |
| TC-FEEDBACK-002 | PASS             | PASS                 | なし |
| TC-FEEDBACK-003 | PASS             | PASS                 | なし |
| TC-FEEDBACK-004 | PASS             | PASS                 | なし |
| TC-FEEDBACK-005 | PASS             | PASS                 | なし |

---

## 完了確認

- [x] SkillLifecyclePanel の境界ケースが整理されている
- [x] CompleteStep の境界ケースが整理されている
- [x] current facts に反するテスト拡張をしていない（no-op 維持）
- [x] issue 8 が follow-up 候補として維持されている
- [x] 本Phase内の全タスクを100%実行完了
