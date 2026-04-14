# Phase 4: テスト仕様書（current facts evidence matrix）

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 4                        |
| Phase名    | テスト作成               |
| タスクID   | TASK-SW-FIX-FEEDBACK-001 |
| 作成日     | 2026-04-14               |
| ステータス | completed                |

---

## 1. 既存テスト棚卸し（Task 1 実行結果）

### SkillLifecyclePanel.llm-generation.test.tsx

ファイル存在確認: **存在する**

| テスト名 (describe/it)                                                                                                                    | ステータス | AC 対応        |
| ----------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------- |
| U-8: `handleExecutePlan triggers executePlan IPC` / `「実行する」ボタンクリックで executePlan が呼ばれ、完了後にスキル一覧が更新される`   | **PASS**   | AC-1           |
| U-13: `executePlan terminal_handoff triggers early return` / `terminal_handoff レスポンス受信時に fetchSkills が呼ばれず早期リターンする` | **PASS**   | AC-2           |
| U-14: `executePlan failure propagates error`                                                                                              | **PASS**   | エラーパス確認 |
| U-15: `executePlan empty data uses default error`                                                                                         | **PASS**   | エラーパス確認 |

- `fetchSkills` が `SkillLifecyclePanel` の current flow にあることを **確認済み**（L399, L1111）
- `handleExecutePlan` の成功パスでのみ `fetchSkills` / `selectSkillByName` が呼ばれることを **確認済み**

### CompleteStep.test.tsx

ファイル存在確認: **存在する**

| テスト名 (describe/it)                                                                                           | ステータス | AC 対応    |
| ---------------------------------------------------------------------------------------------------------------- | ---------- | ---------- |
| `skillPath nullガード` / TC-FEEDBACK-004: `skillPath=nullの場合エラーメッセージが表示される`                     | **PASS**   | AC-3       |
| `skillPath nullガード` / TC-FEEDBACK-005: `skillPath=nullの場合成功ヘッダーが表示されない`                       | **PASS**   | AC-4       |
| `skillPath nullガード` / TC-FEEDBACK-006: `skillPathが正常値の場合成功ヘッダーが表示される`                      | **PASS**   | AC-5       |
| `skillPath nullガード 拡充` / TC-FEEDBACK-009: `skillPathが空文字の場合は成功ヘッダーは表示される`               | **PASS**   | 境界ケース |
| `skillPath nullガード 拡充` / TC-FEEDBACK-011: `onRetryプロパティが未定義でも skillPath=null でクラッシュしない` | **PASS**   | 境界ケース |
| `skillPath nullガード 拡充` / TC-FEEDBACK-011c: `skillPath=null で onRetry が指定された場合クリックで呼ばれる`   | **PASS**   | retry UI   |
| `skillPath nullガード 拡充` / TC-FEEDBACK-004b: `skillPath=null の場合アクションカードが表示されない`            | **PASS**   | AC-4 補強  |

- `CompleteStep` が `skillPath === null` のみを失敗扱いにしていることを **確認済み**

---

## 2. SkillLifecyclePanel evidence 定義（Task 2 実行結果）

### TC-FEEDBACK-001: LLMモード成功時に fetchSkills が 1 回呼ばれる（AC-1）

**Evidence source**: `SkillLifecyclePanel.llm-generation.test.tsx` U-8

```typescript
// U-8 の assertion より
expect(mockFetchSkills).toHaveBeenCalledTimes(1);
expect(mockSelectSkillByName).toHaveBeenCalledWith("new-skill");
```

**current facts との対応**:

- `SkillLifecyclePanel.tsx` L1111: `await fetchSkills()`
- `SkillLifecyclePanel.tsx` L1112-1114: `if (executeResponse.skillName) { selectSkillByName(executeResponse.skillName); }`
- `fetchSkills` → `selectSkillByName` の順序が既存テストで証明済み

### TC-FEEDBACK-002: terminal_handoff 時は fetchSkills / selectSkillByName が呼ばれない（AC-2）

**Evidence source**: `SkillLifecyclePanel.llm-generation.test.tsx` U-13

```typescript
// U-13 の assertion より
expect(mockFetchSkills).not.toHaveBeenCalled();
expect(mockSelectSkillByName).not.toHaveBeenCalled();
expect(mockSetHandoffGuidance).toHaveBeenCalledTimes(1);
```

**current facts との対応**:

- `SkillLifecyclePanel.tsx` L1080-1092: `isExecuteTerminalHandoff()` → early return（fetchSkills は呼ばれない）

---

## 3. CompleteStep evidence 定義（Task 3 実行結果）

### TC-FEEDBACK-003: skillPath=null の場合エラーメッセージと retry UI が表示される（AC-3）

**Evidence source**: `CompleteStep.test.tsx` TC-FEEDBACK-004

```typescript
// TC-FEEDBACK-004 の assertion より
expect(screen.getByText(/スキルの生成に失敗しました/)).toBeInTheDocument();
expect(
  screen.getByRole("button", { name: /もう一度試す/ }),
).toBeInTheDocument();
```

**current facts との対応**:

- `CompleteStep.tsx` L117-145: `if (skillPath === null)` → エラーUI アーリーリターン

### TC-FEEDBACK-004: skillPath=null の場合成功ヘッダーが表示されない（AC-4）

**Evidence source**: `CompleteStep.test.tsx` TC-FEEDBACK-005

```typescript
// TC-FEEDBACK-005 の assertion より
expect(
  screen.queryByText(/スキルの骨格を生成しました/),
).not.toBeInTheDocument();
```

**current facts との対応**:

- `CompleteStep.tsx` L117 でアーリーリターン → L147 以降の成功ヘッダー描画コードに未到達

### TC-FEEDBACK-005: skillPath が正常値の場合成功ヘッダーが表示される（AC-5）

**Evidence source**: `CompleteStep.test.tsx` TC-FEEDBACK-006

```typescript
// TC-FEEDBACK-006 の assertion より
expect(screen.getByTestId("complete-step-header")).toBeInTheDocument();
expect(screen.getByText("スキルの骨格を生成しました")).toBeInTheDocument();
expect(
  screen.queryByText(/スキルの生成に失敗しました/),
).not.toBeInTheDocument();
```

**current facts との対応**:

- `CompleteStep.tsx` L148+: null ガード通過後の通常パスで `complete-step-header` を描画

---

## 4. current facts 確認（Task 4 実行結果）

| 確認項目                                                                           | 結果     |
| ---------------------------------------------------------------------------------- | -------- |
| `SkillLifecyclePanel` / `CompleteStep` の current facts が evidence と一致している | **PASS** |
| issue 8 が follow-up 候補として本 Phase の AC から除外されている                   | **PASS** |
| Red-first 化が必要なケースがない（parity gap なし）                                | **PASS** |

---

## TC-FEEDBACK-001〜005 evidence matrix サマリー

| TC番号          | ファイル内テスト名（evidence）                                       | 対象コンポーネント      | 期待結果                                   | 対応AC | 判定 |
| --------------- | -------------------------------------------------------------------- | ----------------------- | ------------------------------------------ | ------ | ---- |
| TC-FEEDBACK-001 | U-8: fetchSkills が 1 回、selectSkillByName が続く                   | SkillLifecyclePanel.tsx | fetchSkills / selectSkillByName が呼ばれる | AC-1   | PASS |
| TC-FEEDBACK-002 | U-13: terminal_handoff で fetchSkills が呼ばれない                   | SkillLifecyclePanel.tsx | 早期リターンし handoff が維持される        | AC-2   | PASS |
| TC-FEEDBACK-003 | TC-FEEDBACK-004: skillPath=null でエラーメッセージと retry UI が表示 | CompleteStep.tsx        | エラーUI が表示される                      | AC-3   | PASS |
| TC-FEEDBACK-004 | TC-FEEDBACK-005: skillPath=null で成功ヘッダーが表示されない         | CompleteStep.tsx        | 成功ヘッダーが非表示                       | AC-4   | PASS |
| TC-FEEDBACK-005 | TC-FEEDBACK-006: skillPath 正常値で成功ヘッダーが表示される          | CompleteStep.tsx        | 成功ヘッダーが表示される                   | AC-5   | PASS |

**全 TC PASS** — Red-first 昇格不要（parity gap なし）

---

## 完了確認

- [x] TC-FEEDBACK-001〜005 の evidence が current facts と一致している
- [x] SkillLifecyclePanel と CompleteStep の current facts が対応付けられている
- [x] issue 8 が follow-up 候補として分離されている
- [x] Red-first が必要な場合の条件が明示されている（parity gap があった場合のみ）
- [x] 本Phase内の全タスクを100%実行完了
