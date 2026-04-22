# Phase 1 出力: 要件定義書

## メタ情報

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| Phase      | 1                                       |
| タスクID   | TASK-RALLY-001                          |
| 機能名     | skill-lifecycle-panel-dead-code-removal |
| 作成日     | 2026-04-21                              |
| ステータス | complete                                |

---

## 1. タスク概要・目的

### 概要

`apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` に残存する未使用ハンドラ `_handleSubmitWorkflowInput` および旧入力 state（`selectedOptionId` / `textAnswer` / `secretAnswer` / `confirmAnswer`）を安全に削除する。

### 目的

- dead code を除去することで、コードの可読性と保守性を向上させる
- 読み手が「このコードは何のために存在するのか」と混乱するリスクを排除する
- 設計分析書（rally-phase-1-analysis.md）の懸念点3「SkillLifecyclePanelのdead code残存」を解消する
- TypeScript ビルドおよび lint がクリーンな状態を保証する

### 背景

設計分析書（`docs/30-workflows/00-task-spec-design-docs/rally-phase-1-analysis.md`）の懸念点3に記載の通り、`_handleSubmitWorkflowInput` と旧入力 state は現行の入力送信フローで使用されておらず、コードの意図を不整合にしている（4条件評価: 整合性あり条件 FAIL）。

---

## 2. dead codeの特定結果

### 対象ファイル

`apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

### 削除対象 1: 旧入力 state 宣言（L482-485）

```typescript
const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
const [textAnswer, setTextAnswer] = useState("");
const [secretAnswer, setSecretAnswer] = useState("");
const [confirmAnswer, setConfirmAnswer] = useState<boolean | null>(null);
```

- 4つの state 変数はいずれも `_handleSubmitWorkflowInput` 内でのみ参照されている
- L811: `submission.selectedOptionId = selectedOptionId ?? undefined;`
- L813: `submission.textValue = textAnswer;`
- L815: `submission.secretValue = secretAnswer;`
- L817: `submission.confirmed = confirmAnswer ?? undefined;`
- 現行の入力送信フローでは使用されていない

### 削除対象 2: 旧入力 state を管理する useEffect（L607-631）— Phase 1 調査で判明した追加 gap

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

- このuseEffectの処理は **すべて** 削除対象4stateへのset操作のみで構成されている
- `workflowSnapshot` 変化に応じて削除対象4stateを更新しているが、これらstateは `_handleSubmitWorkflowInput` 内でしか読まれない
- 設計書（phase-1-requirements.md）では L482-485 と L793-833 のみ記載されており、**このuseEffectは設計書未記載のgapとして Phase 1 調査で新たに発見された**

### 削除対象 3: 未使用ハンドラ関数（L793-833）

```typescript
const _handleSubmitWorkflowInput = async () => {
  // ...41行の実装...
};
```

- 関数定義は L793-833（41行）
- `apps/` および `packages/` 配下のソースコードファイルからの外部参照なし（coverage report / HTML のみ）
- カバレッジ 0 確認済み
- アンダースコアプレフィックス（`_`）が付いていることからも、もともと未使用であることを示している

---

## 3. 設計書（rally-phase-1-analysis.md）で確認された懸念点3の詳細

設計分析書 Section 2「グループB: 古い状態の残存」の懸念点3に以下の通り記載されている：

> **懸念点3: SkillLifecyclePanelのdead code残存**
>
> `_handleSubmitWorkflowInput`（未使用ハンドラ）と旧入力 state（`selectedOptionId` / `textAnswer` / `secretAnswer` / `confirmAnswer`）が残存している。これらは現在の入力送信フローで使われておらず、読み手を混乱させる。

また、4条件評価において：

> **整合性あり条件 — FAIL**
>
> dead code（懸念点3）がコードの意図を不整合にしている。

この懸念点は TASK-RALLY-001 の解消対象であり、削除により整合性あり条件の FAIL 要因の一つが取り除かれる。

---

## 4. Phase 1 調査で判明した追加知見

### useEffect（L607-631）の発見

Phase 1 の実調査（grep実行）において、設計書（phase-1-requirements.md）には記載されていなかった **L607-631 の useEffect** が削除対象として新たに判明した。

**経緯**:

- 設計書では削除対象として「L482-485の state 宣言」と「L793-833の \_handleSubmitWorkflowInput 関数」のみ記載されていた
- 実際に対象ファイルを精査した結果、L607-631 に削除対象4stateのみを管理する useEffect が存在することが判明した
- このuseEffectは `workflowSnapshot` の変化をトリガーに削除対象4stateを更新する処理のみで構成されており、副作用は削除対象state以外に及ばない

**影響**:

- L607-631の useEffect を削除しないと、TypeScript コンパイラが `setSelectedOptionId` 等への参照エラーを報告する可能性がある
- 受け入れ基準に AC-2b（L607-631の useEffect 削除）を追加した

**安全性**:

- useEffect の依存配列は `[workflowSnapshot]` のみ
- 処理内容は削除対象4stateへの set 操作のみ
- 削除後に他の機能への影響なし（読み込み先が `_handleSubmitWorkflowInput` のみであるため）

---

## 5. 影響範囲分析

| 調査対象                                | 結果                                                                 |
| --------------------------------------- | -------------------------------------------------------------------- |
| `_handleSubmitWorkflowInput` の外部参照 | apps/ packages/ 内のソースファイルから参照なし                       |
| `selectedOptionId` の外部参照           | SkillLifecyclePanel.tsx 内のみ（L482, L610, L618, L629, L811, L829） |
| `textAnswer` の外部参照                 | SkillLifecyclePanel.tsx 内のみ（L483, L611, L813, L830）             |
| `secretAnswer` の外部参照               | SkillLifecyclePanel.tsx 内のみ（L484, L612, L815, L831）             |
| `confirmAnswer` の外部参照              | SkillLifecyclePanel.tsx 内のみ（L485, L613, L625, L630, L817, L832） |
| 削除後の typecheck                      | AC-3 で検証予定                                                      |
| 削除後の lint                           | AC-4 で検証予定                                                      |

---

## 6. 参照資料

| 資料名         | パス                                                                   | 用途                 |
| -------------- | ---------------------------------------------------------------------- | -------------------- |
| 対象ファイル   | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`   | dead code の実確認   |
| 設計分析書     | `docs/30-workflows/00-task-spec-design-docs/rally-phase-1-analysis.md` | 懸念点3の詳細        |
| 解決策設計書   | `docs/30-workflows/00-task-spec-design-docs/rally-phase-2-solution.md` | RALLY-001の設計方針  |
| Phase 1 仕様書 | `docs/30-workflows/wave0-par-RALLY-001/phase-1-requirements.md`        | 受け入れ基準の元定義 |
