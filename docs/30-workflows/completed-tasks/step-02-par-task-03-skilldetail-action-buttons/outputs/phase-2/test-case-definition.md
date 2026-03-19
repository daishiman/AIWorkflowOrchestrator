# Phase 2 テストケース定義: SkillDetailPanel アクションボタン

## 概要

Phase 4 で実装するテストケース TC-01〜TC-08 の詳細定義。

---

## テストケース一覧

| TC    | カテゴリ         | 観点                          | 期待動作                                                                                     |
| ----- | ---------------- | ----------------------------- | -------------------------------------------------------------------------------------------- |
| TC-01 | 表示制御         | isImported=true 時表示        | `action-buttons-zone` / `edit-skill-button` / `analyze-skill-button` が DOM に存在する       |
| TC-02 | 表示制御         | isImported=false 時非表示     | `action-buttons-zone` が DOM に存在しない                                                    |
| TC-03 | インタラクション | 編集ボタンクリック            | `onEdit("test-skill")` が1回呼び出される                                                     |
| TC-04 | インタラクション | 分析ボタンクリック            | `onAnalyze("test-skill")` が1回呼び出される                                                  |
| TC-05 | キーボード       | Escape キー                   | `onClose` が呼び出され、アクションボタンの動作は変わらない                                   |
| TC-06 | 遷移フロー       | handleEditSkill 遷移          | `setCurrentSkillName` + `setCurrentView("skill-editor")` + `handleCloseDetail` が実行される  |
| TC-07 | 遷移フロー       | handleAnalyzeSkill 遷移       | `setCurrentSkillName` + `setCurrentView("skillAnalysis")` + `handleCloseDetail` が実行される |
| TC-08 | Props 省略       | onEdit/onAnalyze が undefined | アクションボタンゾーンが DOM に存在しない                                                    |

---

## 詳細定義

### TC-01: isImported=true 時にアクションボタンが表示される

**対象コンポーネント**: `SkillDetailPanel`

**前提条件**:

- `isImported={true}`
- `onEdit={vi.fn()}`
- `onAnalyze={vi.fn()}`
- `skillName="test-skill"`
- `isOpen={true}`

**テストステップ**:

1. コンポーネントをレンダー
2. `data-testid="action-buttons-zone"` を取得
3. `data-testid="edit-skill-button"` を取得
4. `data-testid="analyze-skill-button"` を取得

**期待結果**:

- `action-buttons-zone` が DOM に存在する
- `edit-skill-button` が DOM に存在し、テキスト「エディタで開く」を含む
- `analyze-skill-button` が DOM に存在し、テキスト「分析する」を含む

---

### TC-02: isImported=false 時にアクションボタンが非表示になる

**対象コンポーネント**: `SkillDetailPanel`

**前提条件**:

- `isImported={false}`
- `onEdit={vi.fn()}`
- `onAnalyze={vi.fn()}`
- `skillName="test-skill"`
- `isOpen={true}`

**テストステップ**:

1. コンポーネントをレンダー
2. `data-testid="action-buttons-zone"` を取得

**期待結果**:

- `action-buttons-zone` が DOM に存在しない（`queryByTestId` が null を返す）

---

### TC-03: 編集ボタンクリックで onEdit が呼び出される

**対象コンポーネント**: `SkillDetailPanel`

**前提条件**:

- `isImported={true}`
- `onEdit={vi.fn()}`
- `onAnalyze={vi.fn()}`
- `skillName="test-skill"`
- `isOpen={true}`

**テストステップ**:

1. コンポーネントをレンダー
2. `edit-skill-button` を取得
3. ボタンをクリック

**期待結果**:

- `onEdit` が1回呼び出される
- `onEdit` の引数が `"test-skill"` である
- `onAnalyze` は呼び出されない

---

### TC-04: 分析ボタンクリックで onAnalyze が呼び出される

**対象コンポーネント**: `SkillDetailPanel`

**前提条件**:

- `isImported={true}`
- `onEdit={vi.fn()}`
- `onAnalyze={vi.fn()}`
- `skillName="test-skill"`
- `isOpen={true}`

**テストステップ**:

1. コンポーネントをレンダー
2. `analyze-skill-button` を取得
3. ボタンをクリック

**期待結果**:

- `onAnalyze` が1回呼び出される
- `onAnalyze` の引数が `"test-skill"` である
- `onEdit` は呼び出されない

---

### TC-05: Escape キーで onClose が呼び出される

**対象コンポーネント**: `SkillDetailPanel`

**前提条件**:

- `isImported={true}`
- `onEdit={vi.fn()}`
- `onAnalyze={vi.fn()}`
- `onClose={vi.fn()}`
- `skillName="test-skill"`
- `isOpen={true}`

**テストステップ**:

1. コンポーネントをレンダー
2. `action-buttons-zone` が存在することを確認
3. Escape キーを発火（`fireEvent.keyDown(document, { key: "Escape" })`）

**期待結果**:

- `onClose` が1回呼び出される
- `onEdit` / `onAnalyze` は呼び出されない

**補足**: happy-dom 環境のため `fireEvent` を使用する（P39 対策）。

---

### TC-06: handleEditSkill が正しい遷移フローを実行する

**対象コンポーネント**: `SkillCenterView`（または `useSkillCenter` フック）

**前提条件**:

- `setCurrentSkillName={vi.fn()}`
- `setCurrentView={vi.fn()}`
- `handleCloseDetail={vi.fn()}`

**テストステップ**:

1. `handleEditSkill("test-skill")` を呼び出す

**期待結果**:

1. `setCurrentSkillName("test-skill")` が呼び出される
2. `setCurrentView("skill-editor")` が呼び出される
3. `handleCloseDetail()` が呼び出される
4. 上記3つが順序通りに実行される

---

### TC-07: handleAnalyzeSkill が正しい遷移フローを実行する

**対象コンポーネント**: `SkillCenterView`（または `useSkillCenter` フック）

**前提条件**:

- `setCurrentSkillName={vi.fn()}`
- `setCurrentView={vi.fn()}`
- `handleCloseDetail={vi.fn()}`

**テストステップ**:

1. `handleAnalyzeSkill("test-skill")` を呼び出す

**期待結果**:

1. `setCurrentSkillName("test-skill")` が呼び出される
2. `setCurrentView("skillAnalysis")` が呼び出される
3. `handleCloseDetail()` が呼び出される
4. 上記3つが順序通りに実行される

---

### TC-08: onEdit/onAnalyze が未渡しの場合にアクションボタンゾーンが非表示になる

**対象コンポーネント**: `SkillDetailPanel`

**前提条件**:

- `isImported={true}`
- `onEdit` を渡さない（undefined）
- `onAnalyze` を渡さない（undefined）
- `skillName="test-skill"`
- `isOpen={true}`

**テストステップ**:

1. コンポーネントをレンダー（`onEdit` / `onAnalyze` を省略）
2. `data-testid="action-buttons-zone"` を取得

**期待結果**:

- `action-buttons-zone` が DOM に存在しない（`queryByTestId` が null を返す）

**補足**: この TC により、後方互換性（既存の呼び出し元への影響なし）を保証する。

---

## テスト環境・ユーティリティ

- テストランナー: Vitest
- レンダリング: `@testing-library/react`
- DOM 環境: happy-dom
- イベント発火: `fireEvent`（P39 対策で `userEvent` は不使用）
- モック: `vi.fn()`

## 依存ファイル

- `apps/desktop/src/renderer/views/SkillCenterView/SkillDetailPanel.tsx`
- `apps/desktop/src/renderer/views/SkillCenterView/useSkillCenter.ts`
- 既存テストファイル: `SkillDetailPanel.test.tsx`（存在する場合はインポートパスを参照して記述する）
