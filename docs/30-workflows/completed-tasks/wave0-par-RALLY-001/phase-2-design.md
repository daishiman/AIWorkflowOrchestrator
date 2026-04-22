# Phase 2: 設計

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 2                                       |
| タスクID   | TASK-RALLY-001                          |
| 機能名     | skill-lifecycle-panel-dead-code-removal |
| 前提Phase  | Phase 1                                 |
| 後続Phase  | Phase 3                                 |
| 作成日     | 2026-04-21                              |
| ステータス | completed                               |

## 目的

dead code の削除対象を確定し、削除手順と検証方法を設計する。

## 実行タスク

- タスク1: 削除対象の構造を state / effect / handler に分解する
- タスク2: 削除順序とロールバック条件を設計する
- タスク3: 検証コマンドと依存整合チェックを設計する

## 変更箇所

**対象ファイル**: `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

### 削除対象1: state 宣言（L482〜485 付近）

```typescript
// 削除対象
const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
const [textAnswer, setTextAnswer] = useState("");
const [secretAnswer, setSecretAnswer] = useState("");
const [confirmAnswer, setConfirmAnswer] = useState<boolean | null>(null);
```

### 削除対象2: `useEffect`（L607〜631）※Phase 1 調査で追加

```typescript
// 削除対象（useEffect 全体）
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

このuseEffectは削除対象の4つのstate setter のみを呼ぶ。state が削除されれば setter の参照もコンパイルエラーとなるため、state と同時に削除する必要がある。

### 削除対象3: `_handleSubmitWorkflowInput` 関数（L793〜833）

```typescript
// 削除対象（関数定義全体 41行）
const _handleSubmitWorkflowInput = async () => {
  // ... 内部実装全体（L793〜833）
};
```

### 削除前の事前確認手順

1. `grep -rn "_handleSubmitWorkflowInput" apps/ packages/` を実行し、参照が `SkillLifecyclePanel.tsx` 内の関数定義のみであることを確認する
2. 参照が見つかった場合は削除せず、コメントで `@deprecated` マークを付けて Issue を作成する（rally-phase-3-review.md リスク4対応）
3. state 宣言が JSX 内で直接使われていないかを全行確認する

## 設計の根拠

`_handleSubmitWorkflowInput` は現在の入力送信フロー（`ConversationalInterview` コンポーネントの `submitAnswer`）では一切使用されていない。4つの state 宣言の **読み取り参照** はこの関数内のみ（L811/813/815/817/829-832）。また、L607〜631 の `useEffect` がこれら4つの state へ書き込み（set）するのみのため、state と共に削除すべき companion dead code である（Phase 1 調査で追加確認）。dead code 全体（70行）を削除することで、後続タスク（RALLY-005〜RALLY-008）が `SkillLifecyclePanel.tsx` を修正する際の読み間違いリスクを排除できる。

## 検証方法

削除後に以下を実行し、いずれもエラーなしで完了することを確認する。

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop test
```

## 統合テスト連携

- Phase 4 のテスト仕様書は本Phaseの検証コマンドを正本として引き継ぐ
- Phase 7 の coverage 確認では AC 群と削除対象3グループの対応表を維持する

## 参照資料

| 資料名          | パス                                         | 用途             |
| --------------- | -------------------------------------------- | ---------------- |
| 要件定義書      | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物   |
| 受け入れ基準    | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物   |
| P50チェック結果 | `outputs/phase-1/p50-check-result.md`        | 影響範囲確認結果 |

## 成果物

| 成果物               | パス                                               | 説明                             |
| -------------------- | -------------------------------------------------- | -------------------------------- |
| 削除対象コードリスト | `outputs/phase-2/dead-code-list.md`                | 削除する行番号・コードの一覧     |
| 削除手順設計書       | `outputs/phase-2/deletion-procedure.md`            | 手順・検証方法・ロールバック手順 |
| 依存整合マトリクス   | `outputs/phase-2/dependency-consistency-matrix.md` | 削除による影響範囲の確認表       |

## 完了条件

- [ ] 削除対象のコードを行番号付きで特定した
- [ ] 削除手順（確認→削除→検証）を文書化した
- [ ] 削除によって他機能に影響がないことを設計レベルで確認した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/wave0-par-RALLY-001
```

## 次のPhase

Phase 3: 設計レビューゲート
