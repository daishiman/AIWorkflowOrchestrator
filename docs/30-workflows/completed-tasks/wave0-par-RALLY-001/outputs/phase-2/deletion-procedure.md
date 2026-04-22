# Phase 2 出力: 削除手順設計書

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 2              |
| タスクID   | TASK-RALLY-001 |
| 作成日     | 2026-04-21     |
| ステータス | complete       |

## 対象ファイル

`apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

---

## 1. 事前確認コマンド

削除作業を開始する前に、以下の grep コマンドを実行して参照箇所がないことを確認する。

### 1-1. 関数参照の確認

```bash
grep -rn "_handleSubmitWorkflowInput" apps/ packages/
```

**期待結果**: `SkillLifecyclePanel.tsx` 内の関数定義1箇所のみヒット。他ファイルからの参照がないことを確認する。

**異常時の対処**: 他ファイルからの参照が見つかった場合は削除を中止し、関数定義に `@deprecated` コメントを付与してIssueを作成する。

### 1-2. State 変数参照の確認

```bash
grep -rn "selectedOptionId\|textAnswer\|secretAnswer\|confirmAnswer" apps/ packages/
```

**期待結果**: `SkillLifecyclePanel.tsx` 内の定義・useEffect・`_handleSubmitWorkflowInput` のみヒット。JSXや他コンポーネントからの参照がないことを確認する。

**異常時の対処**: JSX内や他ファイルに参照が見つかった場合は削除範囲を見直し、参照元を調査してから対処方針を決定する。

---

## 2. 削除手順

推奨順序: **State宣言 → useEffect → 関数** の順で削除する。

この順序により、削除途中であっても TypeScript コンパイラが「未使用変数」エラーを出すため、消し漏れを早期に検出できる。

### ステップ 1: State 宣言の削除（L482〜L485）

以下4行を削除する。

```typescript
// 削除対象（この4行を丸ごと削除）
const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
const [textAnswer, setTextAnswer] = useState("");
const [secretAnswer, setSecretAnswer] = useState("");
const [confirmAnswer, setConfirmAnswer] = useState<boolean | null>(null);
```

**注意**: `useState` のインポート行は削除しない。他の多数の state（例: `isExpanded`, `activeTab` 等）が `useState` を使用しているため、インポート自体は必要。

### ステップ 2: useEffect の削除（L607〜L631）

以下のブロック全体を削除する。

```typescript
// 削除対象（このuseEffect全体を削除）
useEffect(() => {
  const requestState = workflowSnapshot?.awaitingUserInput;
  if (!requestState) {
    setSelectedOptionId(null);
    setTextAnswer("");
    setSecretAnswer("");
    setConfirmAnswer(null);
    return;
  }
  if (requestState.kind === "single_select") {
    setSelectedOptionId(
      (current) => current ?? requestState.options?.[0]?.id ?? null,
    );
    return;
  }
  if (requestState.kind === "confirm") {
    setConfirmAnswer((current) => current ?? true);
    return;
  }
  setSelectedOptionId(null);
  setConfirmAnswer(null);
}, [workflowSnapshot]);
```

**注意**: `useEffect` のインポートが他の useEffect でも使用されているか確認し、使用されていない場合はインポートも削除する（通常は他でも使用されているため削除不要）。

### ステップ 3: `_handleSubmitWorkflowInput` 関数の削除（L793〜L833）

以下の関数定義全体（41行）を削除する。

```typescript
// 削除対象（この関数定義全体を削除）
const _handleSubmitWorkflowInput = async () => {
  // ... 内部実装全体（L793〜L833）
};
```

---

## 3. 削除後の検証コマンド

削除完了後、以下のコマンドをすべてエラーなしで完了することを確認する。

### 3-1. TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

**期待結果**: エラー・警告ゼロ

### 3-2. Lint チェック

```bash
pnpm --filter @repo/desktop lint
```

**期待結果**: エラー・警告ゼロ（未使用変数の ESLint エラーが出ないことを確認）

### 3-3. テスト実行

```bash
pnpm --filter @repo/desktop test
```

**期待結果**: 全テスト PASS（削除による既存テストの失敗なし）

### 3-4. 統合確認（オプション）

```bash
pnpm --filter @repo/desktop build
```

**期待結果**: ビルド成功

---

## 4. ロールバック手順

削除後に問題が発生した場合は、以下のコマンドで変更を取り消す。

### 4-1. ファイル単位のロールバック

```bash
git restore apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

### 4-2. ステージ済み変更のロールバック

```bash
git restore --staged apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
git restore apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

### 4-3. コミット後のロールバック（必要な場合）

```bash
# 直前のコミットを取り消して作業ツリーに戻す（コミットは破棄しない）
git revert HEAD --no-commit
```

---

## 5. チェックリスト

| #   | 確認項目                                                        | 担当   | 結果 |
| --- | --------------------------------------------------------------- | ------ | ---- |
| 1   | `_handleSubmitWorkflowInput` の外部参照がないことを grep で確認 | 実装者 | [ ]  |
| 2   | 4つの state 変数の外部参照がないことを grep で確認              | 実装者 | [ ]  |
| 3   | State 宣言（L482〜L485）を削除                                  | 実装者 | [ ]  |
| 4   | useEffect（L607〜L631）を削除                                   | 実装者 | [ ]  |
| 5   | `_handleSubmitWorkflowInput` 関数（L793〜L833）を削除           | 実装者 | [ ]  |
| 6   | `pnpm typecheck` がエラーなしで完了                             | 実装者 | [ ]  |
| 7   | `pnpm lint` がエラーなしで完了                                  | 実装者 | [ ]  |
| 8   | `pnpm test` が全 PASS                                           | 実装者 | [ ]  |
