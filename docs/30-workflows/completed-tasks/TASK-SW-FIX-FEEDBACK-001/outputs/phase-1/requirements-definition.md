# Phase 1: 要件定義書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 1                        |
| Phase名    | 要件定義                 |
| タスクID   | TASK-SW-FIX-FEEDBACK-001 |
| 作成日     | 2026-04-14               |
| ステータス | completed                |

---

## 1. 既知論点の固定（Task 1 実行結果）

以下の論点を current facts に照らして整理した。

| 論点番号 | 内容                                                                     | 判定              | 根拠                                                                                            |
| -------- | ------------------------------------------------------------------------ | ----------------- | ----------------------------------------------------------------------------------------------- |
| 論点6    | LLMモードの生成完了後に一覧更新と選択処理が必要かどうか                  | **解消済み**      | `handleExecutePlan` 成功パスで `fetchSkills()` + `selectSkillByName()` が呼ばれていることを確認 |
| 論点8    | `fetchSkills()` 失敗時の非ブロッキング扱いを current task に含めるか     | **follow-up候補** | 現行は `await fetchSkills()` で blocking。失敗時は `generationError` をセットして early return  |
| 論点14   | `skillPath = null` のまま CompleteStep に到達した際のエラー表示の有無    | **解消済み**      | `CompleteStep.tsx` L117 に `if (skillPath === null)` アーリーリターンが実装済み                 |
| 論点20   | CompleteStep の成功ヘッダーが `skillPath` に応じて条件表示されるかどうか | **解消済み**      | null ガード通過後の通常パスにのみ `complete-step-header` が描画される実装を確認                 |

### 分類サマリー

- **解消済み**: 論点6、論点14、論点20
- **follow-up候補**: 論点8（別タスクに分離）
- **未解決**: なし

---

## 2. 対象ファイル調査（Task 2 実行結果）

### 2-1. SkillLifecyclePanel.tsx current facts

ファイル: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

**executePlan → loadVerifyDetail → fetchSkills → selectSkillByName シーケンス**

```
handleExecutePlan 成功パス（L1110-1112）:
  await loadVerifyDetail(planId);
  await fetchSkills();
  if (executeResponse.skillName) {
    selectSkillByName(executeResponse.skillName);
  }
```

確認事項:

- `fetchSkills` は `useFetchSkills()` フック経由で store アクションを呼び出す（L399）
- `selectSkillByName` は `useSelectSkillByName()` フック経由（L403）
- 成功パスで両者が必ず呼ばれる（L1110-1112）

**terminal_handoff 早期リターン**

```
handleExecutePlan 内 terminal_handoff パス（L1080-1092）:
  if (isExecuteTerminalHandoff(executeResponse)) {
    processedWorkflowOutcomePlanIdRef.current = planId;
    setHandoffGuidance(toHandoffGuidance(executeResponse.bundle));
    void fetchDisclosureInfo();
    ...
    await loadVerifyDetail(planId);
    return;  // ← early return: fetchSkills / selectSkillByName は呼ばれない
  }
```

確認事項:

- `terminal_handoff` 判定後に `return` で早期終了
- `fetchSkills` / `selectSkillByName` は呼ばれない（論点6・AC-2 の current facts として確認済み）

### 2-2. CompleteStep.tsx current facts

ファイル: `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`

**skillPath === null ガード（L117-145）**

```typescript
if (skillPath === null) {
  return (
    <div data-testid="complete-step" className="...">
      <div data-testid="complete-step-error-header" role="alert" ...>
        <h2>スキルの生成に失敗しました</h2>
        <p>スキルファイルの作成中にエラーが発生しました。</p>
      </div>
      <button data-testid="complete-step-retry-button" onClick={onRetry}>
        もう一度試す
      </button>
    </div>
  );
}
```

**成功ヘッダー条件表示（L147-164）**

```typescript
// null ガード通過後の通常パス
return (
  <div data-testid="complete-step">
    <div data-testid="complete-step-header" role="status">
      <h2>スキルの骨格を生成しました</h2>
      ...
    </div>
    ...
  </div>
);
```

**CompleteStepProps current contract（L18-36）**

```typescript
export interface CompleteStepProps {
  skillPath?: string | null; // null = 生成失敗ケース
  hasExternalIntegration?: boolean;
  externalToolName?: string | null;
  onExecuteNow?: () => void;
  onOpenInEditor?: () => void;
  onCreateAnother?: () => void;
  onQualityFeedback?: (satisfied: boolean) => void;
  onRetry?: () => void; // オプショナル（null ガードパスでも安全に描画）
  onClose?: () => void; // 後方互換
}
```

### 2-3. Existing Tests Evidence

**SkillLifecyclePanel.llm-generation.test.tsx**

| テストスイート | テスト名                                                                                                         | 対応AC |
| -------------- | ---------------------------------------------------------------------------------------------------------------- | ------ |
| U-8            | `handleExecutePlan triggers executePlan IPC` → `fetchSkills` が1回呼ばれ `selectSkillByName("new-skill")` が続く | AC-1   |
| U-13           | `terminal_handoff レスポンス受信時に fetchSkills が呼ばれず早期リターンする`                                     | AC-2   |

**CompleteStep.test.tsx**

| テストスイート  | テスト名                                           | 対応AC |
| --------------- | -------------------------------------------------- | ------ |
| TC-FEEDBACK-004 | `skillPath=nullの場合エラーメッセージが表示される` | AC-3   |
| TC-FEEDBACK-005 | `skillPath=nullの場合成功ヘッダーが表示されない`   | AC-4   |
| TC-FEEDBACK-006 | `skillPathが正常値の場合成功ヘッダーが表示される`  | AC-5   |

---

## 3. 受入条件の確定（Task 3 実行結果）

| AC   | 条件                                                                                            | 検証方法                                                                | current facts 判定  |
| ---- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------- |
| AC-1 | LLMモード成功時、`fetchSkills()` が 1 回呼ばれ、その後 `selectSkillByName()` が続く             | `SkillLifecyclePanel.llm-generation.test.tsx` U-8 で呼び出し順を検証    | **PASS** (確認済み) |
| AC-2 | `terminal_handoff` 時は `fetchSkills()` / `selectSkillByName()` が呼ばれず handoff が維持される | `SkillLifecyclePanel.llm-generation.test.tsx` U-13 で早期リターンを検証 | **PASS** (確認済み) |
| AC-3 | `skillPath = null` の場合、`CompleteStep` にエラーメッセージが表示される                        | `CompleteStep.test.tsx` TC-FEEDBACK-004 で DOM を検証                   | **PASS** (確認済み) |
| AC-4 | `skillPath = null` の場合、成功ヘッダーが表示されない                                           | `CompleteStep.test.tsx` TC-FEEDBACK-005 で成功ヘッダー非存在を検証      | **PASS** (確認済み) |
| AC-5 | `skillPath` が正常値の場合、成功ヘッダーと完了画面が表示される                                  | `CompleteStep.test.tsx` TC-FEEDBACK-006 で DOM と action cards を検証   | **PASS** (確認済み) |

---

## 4. スコープ境界（Task 4 実行結果）

### 含む

- current facts と skill 定義の parity 判定（完了）
- `SkillLifecyclePanel.tsx` / `CompleteStep.tsx` / existing tests の current facts 参照（完了）
- 論点8 を follow-up 候補として切り分ける判断（完了）
- docs-only で current contract を固定する作業

### 含まない

- `SkillCreateWizard` を中心とした旧 bugfix 物語への回帰
- parity gap がない状態での code delta（本タスクは no-op）
- IPC Handler の変更（Main Process 側は対象外）
- コミット・PR作成（Phase 13 でユーザー承認後に実施）

---

## 5. 統合テスト連携要件

- `SkillLifecyclePanel` 側の既存テスト（U-8, U-13）が AC-1 / AC-2 を満たすことを Phase 4 で確認する
- `CompleteStep` の null ガードと成功ヘッダー条件が AC-3 / AC-4 / AC-5 に対応していることを Phase 4 で確認する
- docs-only の場合は existing tests の証跡で current facts を固定する

---

## 完了確認

- [x] 論点6・8・14・20 が current facts で解消済み / follow-up候補 / 未解決に分類されている
- [x] 対象ファイルの現状調査が完了している
- [x] AC-1〜AC-5 が検証方法付きで定義されている
- [x] スコープ境界（含む/含まない）が明確に記述されている
- [x] 統合テスト連携の要件が明記されている
- [x] 本Phase内の全タスクを100%実行完了
