# Phase 1 出力: 受け入れ基準

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 1              |
| タスクID   | TASK-RALLY-001 |
| 作成日     | 2026-04-21     |
| ステータス | complete       |

---

## 概要

本ドキュメントは TASK-RALLY-001（SkillLifecyclePanel dead code削除）の実装完了を判定するための受け入れ基準を定義する。

Phase 1 調査の結果、設計書（phase-1-requirements.md）記載の AC-1〜AC-5 に加え、新たに **AC-2b** を追加した。追加の根拠は「Phase 1 調査で発見した L607-631 の useEffect（設計書未記載のgap）」による。

---

## 受け入れ基準一覧

| ID    | タイトル                                           | 優先度               | ステータス |
| ----- | -------------------------------------------------- | -------------------- | ---------- |
| AC-1  | `_handleSubmitWorkflowInput` 関数定義の削除        | 必須                 | pending    |
| AC-2  | 旧入力 state 宣言（L482-485）の削除                | 必須                 | pending    |
| AC-2b | 旧入力 state 管理 useEffect（L607-631）の削除      | 必須（Phase 1 追加） | pending    |
| AC-3  | `pnpm typecheck` がエラーなしで通過する            | 必須                 | pending    |
| AC-4  | `pnpm lint` がエラーなしで通過する                 | 必須                 | pending    |
| AC-5  | `grep -rn "_handleSubmitWorkflowInput"` の結果が空 | 必須                 | pending    |

---

## 各受け入れ基準の詳細

### AC-1: `_handleSubmitWorkflowInput` 関数定義の削除

**判定条件**:
`SkillLifecyclePanel.tsx` から `const _handleSubmitWorkflowInput = async () => {` で始まる関数定義（L793-833、41行）が完全に削除されていること。

**検証コマンド**:

```bash
grep -n "_handleSubmitWorkflowInput" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
# 期待結果: 出力なし（空）
```

**削除対象範囲**:

- 開始: `const _handleSubmitWorkflowInput = async () => {`（元L793）
- 終了: `};`（元L833）
- 行数: 41行

**注意点**:

- 削除後に直後の `useEffect`（元L834-838）が正しく残存していることを確認すること

---

### AC-2: 旧入力 state 宣言（L482-485）の削除

**判定条件**:
以下の4つの state 宣言が `SkillLifecyclePanel.tsx` から完全に削除されていること。

```typescript
const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
const [textAnswer, setTextAnswer] = useState("");
const [secretAnswer, setSecretAnswer] = useState("");
const [confirmAnswer, setConfirmAnswer] = useState<boolean | null>(null);
```

**検証コマンド**:

```bash
grep -n "selectedOptionId\|textAnswer\|secretAnswer\|confirmAnswer" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
# 期待結果: 出力なし（空）
```

**注意点**:

- AC-2b（useEffect）および AC-1（\_handleSubmitWorkflowInput）を先に削除しないと、TypeScript がこれらの参照に対してエラーを報告する
- 削除順序は AC-1 → AC-2b → AC-2 の順が推奨される

---

### AC-2b: 旧入力 state 管理 useEffect（L607-631）の削除（Phase 1 追加）

**判定条件**:
`workflowSnapshot` の変化に応じて削除対象4stateのみを更新する useEffect（元L607-631）が完全に削除されていること。

**背景**:
このuseEffectは設計書（phase-1-requirements.md）に記載されていなかったが、Phase 1 の実調査で発見された。処理内容が削除対象state（`selectedOptionId` / `textAnswer` / `secretAnswer` / `confirmAnswer`）のset操作のみで構成されており、他の機能への副作用はない。

**削除対象コード**:

```typescript
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

**検証方法**:

- AC-3（typecheck）および AC-4（lint）の通過をもって間接的に確認する
- 上記コードブロックが削除されていることを目視確認する

---

### AC-3: `pnpm typecheck` がエラーなしで通過する

**判定条件**:
削除後に以下のコマンドがエラー（exit code 非0）なしで完了すること。

**検証コマンド**:

```bash
pnpm --filter @repo/desktop typecheck
# または
pnpm typecheck
# 期待結果: エラーなし（exit code 0）
```

**主な確認ポイント**:

- 削除した state 変数への参照が残っていないこと
- 削除した `_handleSubmitWorkflowInput` への参照が残っていないこと
- import が不要になった型定義がある場合は合わせて削除すること（`SkillCreatorUserInputSubmission` 等）

---

### AC-4: `pnpm lint` がエラーなしで通過する

**判定条件**:
削除後に以下のコマンドがエラー（exit code 非0）なしで完了すること。unused variable 警告も含めてエラーがないこと。

**検証コマンド**:

```bash
pnpm --filter @repo/desktop lint
# または
pnpm lint
# 期待結果: エラーなし・警告なし（exit code 0）
```

**主な確認ポイント**:

- `no-unused-vars` ルールに引っかかる変数がないこと
- `@typescript-eslint/no-unused-vars` ルールに引っかかる変数がないこと
- 削除に伴い不要になった import が残っていないこと

---

### AC-5: `grep -rn "_handleSubmitWorkflowInput"` の結果が空になる

**判定条件**:
`apps/` および `packages/` 配下のソースコードファイルに `_handleSubmitWorkflowInput` の参照が一切存在しないこと。

**検証コマンド**:

```bash
grep -rn "_handleSubmitWorkflowInput" apps/ packages/
# 期待結果: 出力なし（空）
```

**注意点**:

- coverage report や HTML ファイルへの参照は許容される（ソースコードファイルのみが対象）
- `--include="*.ts" --include="*.tsx"` オプションを追加することで、より厳密に確認できる

```bash
grep -rn "_handleSubmitWorkflowInput" apps/ packages/ \
  --include="*.ts" --include="*.tsx"
# 期待結果: 出力なし（空）
```

---

## 削除推奨順序

TypeScript コンパイルエラーを避けるため、以下の順序での削除を推奨する：

1. **AC-1**: `_handleSubmitWorkflowInput` 関数定義（L793-833）を削除
   - state の READ が消える
2. **AC-2b**: useEffect（L607-631）を削除
   - state への SET が消える（useEffectからのset）
3. **AC-2**: state 宣言（L482-485）を削除
   - state 宣言本体が消える（この時点で参照が0になっているはず）
4. **AC-3/4/5**: 検証コマンドを実行して全て通過することを確認

---

## 完了判定チェックリスト

- [ ] AC-1: `_handleSubmitWorkflowInput` 関数定義が削除されている
- [ ] AC-2: state 宣言 4件（L482-485）が削除されている
- [ ] AC-2b: useEffect（L607-631）が削除されている（Phase 1 追加）
- [ ] AC-3: `pnpm typecheck` がエラーなしで通過した
- [ ] AC-4: `pnpm lint` がエラーなしで通過した
- [ ] AC-5: `grep -rn "_handleSubmitWorkflowInput"` の結果が空である
