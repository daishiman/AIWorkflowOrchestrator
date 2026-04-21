# Phase 2 出力: 削除対象コードリスト

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

## 削除グループ一覧

### グループ 1: State 宣言（4行）

| 行番号 | コード                                                                            |
| ------ | --------------------------------------------------------------------------------- |
| L482   | `const [selectedOptionId, setSelectedOptionId] = useState<string \| null>(null);` |
| L483   | `const [textAnswer, setTextAnswer] = useState("");`                               |
| L484   | `const [secretAnswer, setSecretAnswer] = useState("");`                           |
| L485   | `const [confirmAnswer, setConfirmAnswer] = useState<boolean \| null>(null);`      |

**行数合計**: 4行

**補足**:

- これら4つの state は `_handleSubmitWorkflowInput` 関数内でのみ READ（読み取り）される
- `useState` インポート自体は他の多数の state で使用されているため、インポート行は削除不要
- JSX 内での直接使用なし（事前確認 grep で確認済み）

---

### グループ 2: useEffect（25行）

| 行番号 | 内容                                                                   |
| ------ | ---------------------------------------------------------------------- |
| L607   | `useEffect(() => {`                                                    |
| L608   | `  const requestState = workflowSnapshot?.awaitingUserInput;`          |
| L609   | `  if (!requestState) {`                                               |
| L610   | `    setSelectedOptionId(null);`                                       |
| L611   | `    setTextAnswer("");`                                               |
| L612   | `    setSecretAnswer("");`                                             |
| L613   | `    setConfirmAnswer(null);`                                          |
| L614   | `    return;`                                                          |
| L615   | `  }`                                                                  |
| L616   | `  if (requestState.kind === "single_select") {`                       |
| L617   | `    setSelectedOptionId(`                                             |
| L618   | `      (current) => current ?? requestState.options?.[0]?.id ?? null,` |
| L619   | `    );`                                                               |
| L620   | `    return;`                                                          |
| L621   | `  }`                                                                  |
| L622   | `  if (requestState.kind === "confirm") {`                             |
| L623   | `    setConfirmAnswer((current) => current ?? true);`                  |
| L624   | `    return;`                                                          |
| L625   | `  }`                                                                  |
| L626   | `  setSelectedOptionId(null);`                                         |
| L627   | `  setConfirmAnswer(null);`                                            |
| L628   | `}, [workflowSnapshot]);`                                              |
| —      | （空行・閉じ括弧含む概算）                                             |

**行数合計（概算）**: 25行（L607〜L631）

**補足**:

- このuseEffectはグループ1の4つの state への WRITE（書き込み）のみを行う
- 他のロジック（副作用・API呼び出し・DOM操作など）を一切持たない
- グループ1の state 削除に伴い、このuseEffectも不要となる

---

### グループ 3: `_handleSubmitWorkflowInput` 関数（41行）

| 行番号     | 内容                                               |
| ---------- | -------------------------------------------------- |
| L793       | `const _handleSubmitWorkflowInput = async () => {` |
| L794〜L833 | 関数本体（内部実装全体）                           |
| L833       | `};`                                               |

**行数合計**: 41行（L793〜L833）

**補足**:

- アンダースコアプレフィックス（`_`）がつき、unused であることが命名から示唆されていた
- `ConversationalInterview` コンポーネントの `submitAnswer` が現行の入力送信フローを担っており、この関数は代替済み
- カバレッジレポートにて FNDA:0（実行回数ゼロ）が確認済み
- 関数内でグループ1の state を READ している唯一の箇所

---

## 削除サマリー

| グループ | 対象                              | 行範囲     | 行数     |
| -------- | --------------------------------- | ---------- | -------- |
| 1        | State 宣言 4件                    | L482〜L485 | 4行      |
| 2        | useEffect                         | L607〜L631 | 25行     |
| 3        | `_handleSubmitWorkflowInput` 関数 | L793〜L833 | 41行     |
| **合計** | —                                 | —          | **70行** |

---

## 依存関係概要

```
グループ3 (_handleSubmitWorkflowInput)
  └── READ → グループ1 (selectedOptionId, textAnswer, secretAnswer, confirmAnswer)
                  ↑
              WRITE ── グループ2 (useEffect)
```

3グループは相互に依存しており、いずれか1グループでも残存するとTypeScriptの「変数が使用されていない」警告（またはESLintエラー）が発生する可能性がある。3グループをまとめて削除することが必要。
