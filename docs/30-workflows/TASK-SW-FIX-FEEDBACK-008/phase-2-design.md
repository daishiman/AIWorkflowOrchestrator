# Phase 2: 設計

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 2                        |
| Phase名    | 設計                     |
| 対象機能   | TASK-SW-FIX-FEEDBACK-008 |
| 前提Phase  | Phase 1: 要件定義        |
| 次Phase    | Phase 3: 設計レビュー    |
| ステータス | completed                |
| 作成日     | 2026-04-15               |

## 目的

`fetchSkills()` 非ブロッキング化の最小修正設計を確定する。
`processWorkflowOutcome` と `handleExecutePlan` の 2 箇所における
`try-catch` から `.catch()` パターンへの変換設計を行う。

## 実行タスク

### Task 1: トポロジー確認

- `SkillLifecyclePanel.tsx` 内の `handleExecutePlan`（L769-784）と `processWorkflowOutcome`（L1110-1113）における `fetchSkills()` 呼び出しの制御フローを確認する
- 両箇所で同一のパターン（`try { await fetchSkills() } catch { ... return true }`）が使用されていることを記録する
- `selectSkillByName` が `fetchSkills()` 成功後にのみ到達可能であることを確認する

### Task 2: 実装パターンの選択

- **変換パターン**: `try-catch` + `return true` → `.catch()` コールバックパターン
- **変換前**:
  ```typescript
  try {
    await fetchSkills();
  } catch (error) {
    setGenerationError(
      error instanceof Error
        ? error.message
        : "スキル一覧の取得に失敗しました。",
    );
    return true;
  }
  if (executeResult.skillName) {
    selectSkillByName(executeResult.skillName);
  }
  ```
- **変換後**:
  ```typescript
  // fetchSkills の失敗はスキル選択を妨げない（non-blocking）
  await fetchSkills().catch((error) => {
    console.warn(
      "[SkillLifecyclePanel] fetchSkills failed (non-blocking):",
      error,
    );
  });
  if (executeResult.skillName) {
    selectSkillByName(executeResult.skillName);
  }
  ```
- `setGenerationError` は `fetchSkills()` 失敗時に設定しない（AC-3 に準拠）
- エラーは `console.warn` のみで記録する

### Task 3: バリデーションパスの確認

- **正常系**: `fetchSkills()` が成功 → `selectSkillByName` が実行される（従来と同じ）
- **異常系**: `fetchSkills()` が throw → `.catch()` でエラーを `console.warn` 記録 → `selectSkillByName` が実行される（修正による改善）
- 両経路で `generationError` が設定されないことを確認する（fetchSkills 失敗分）
- 既存の `generationError` 設定ロジック（fetchSkills 以外の部分）への影響がないことを確認する

### Task 4: 修正箇所の特定

| 箇所                   | 関数名                   | 行番号     | 修正内容                             |
| ---------------------- | ------------------------ | ---------- | ------------------------------------ |
| handleExecutePlan      | `handleExecutePlan`      | L769-784   | try-catch を .catch() パターンへ変換 |
| processWorkflowOutcome | `processWorkflowOutcome` | L1110-1113 | try-catch を .catch() パターンへ変換 |

## 参照資料

| 資料名             | パス                                                                                               | 説明                     |
| ------------------ | -------------------------------------------------------------------------------------------------- | ------------------------ |
| 要件定義           | `phase-1-requirements.md`                                                                          | AC-1〜AC-5               |
| 対象コンポーネント | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | L769-784 / L1110-1113    |
| 対象テスト         | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | 既存テスト U-8/U-13 確認 |

## 統合テスト連携

- `.catch()` パターンへの変換後も `selectSkillByName` の呼び出しがモックで検証可能な設計とする
- `fetchSkills` の reject をモックして `selectSkillByName` の実行を確認するテストケースを Phase 4 で定義できる設計とする

## 成果物

| 成果物 | パス                                 | 説明                                           |
| ------ | ------------------------------------ | ---------------------------------------------- |
| 設計書 | `outputs/phase-2/design-document.md` | 修正パターン・バリデーションパス・修正箇所一覧 |

## 完了条件

- [x] `processWorkflowOutcome` と `handleExecutePlan` の 2 箇所の修正設計が独立して記述されている
- [x] `try-catch` から `.catch()` パターンへの変換設計が確定している
- [x] `fetchSkills()` 失敗時に `generationError` を設定しない設計が確定している
- [x] 正常系・異常系の両バリデーションパスが確認されている
- [x] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [x] 本 Phase 内の全タスクを 100% 実行完了
- [x] 各タスクの成果物が生成されている
- [x] artifacts.json が更新されている
- [x] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次Phase

→ [Phase 3: 設計レビュー](./phase-3-design-review.md)
