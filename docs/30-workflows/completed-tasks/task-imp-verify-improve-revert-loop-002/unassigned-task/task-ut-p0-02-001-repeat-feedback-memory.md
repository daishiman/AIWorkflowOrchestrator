# task-ut-p0-02-001-repeat-feedback-memory - タスク指示書

## メタ情報

| 項目         | 内容                                               |
| ------------ | -------------------------------------------------- |
| タスクID     | task-ut-p0-02-001-repeat-feedback-memory           |
| タスク名     | verify→improve ループの feedback memory 構造化改善 |
| 分類         | 改善                                               |
| 対象機能     | RuntimeSkillCreatorFacade.verifyAndImproveLoop()   |
| 優先度       | 中                                                 |
| 見積もり規模 | 小規模                                             |
| ステータス   | 未実施                                             |
| GitHub Issue | #1773                                              |
| 発見元       | TASK-P0-02 Phase 3 MR-01（Phase 12 で部分吸収）    |
| 発見日       | 2026-03-30                                         |

---

## Section 1: なぜこのタスクが必要か（Why）

### 背景

`RuntimeSkillCreatorFacade.verifyAndImproveLoop()` 内で、improve 試行間のコンテキスト引き継ぎに使用している `previousImproveSummary` は**文字列型**として定義されており、直前 1 回分の改善要約しか保持しない。

```typescript
// 現在の実装（簡略）
let previousImproveSummary = "";

// improve 後
previousImproveSummary = improveResult.summary ?? "";
const feedback = buildImproveFeedback(failedChecks, previousImproveSummary);
```

`maxImproveRetry` が 3 の場合、ループの各試行で保持できる履歴は以下のとおりである。

| 試行回数 | 参照できる過去履歴 |
| -------- | ------------------ |
| 試行 1   | なし（初回）       |
| 試行 2   | 試行 1 の要約のみ  |
| 試行 3   | 試行 2 の要約のみ  |

試行 3 は試行 1 に何を試みたかを知ることができない。

### 問題点

- 同一の失敗チェックに対して、試行 1 と試行 3 が同じ修正提案を行うリスクがある。
- LLM はフィードバックとして渡された直前 1 回の要約しか参照できないため、3 回ループを有効に活用できない。
- 改善提案の多様性が損なわれ、結果的にスキルの verify 通過率が低下する。

### 放置した場合の影響

- LLM が同じ修正を繰り返すことでループが実質 1 回分の試行にしかならない。
- `maxImproveRetry` を増加させても改善効果が頭打ちになる。
- スキル改善率（verify 通過率）の低下につながる。

---

## Section 2: 何を達成するか（What）

### 目的

feedback memory を構造化し、全試行の失敗履歴を次回 improve の入力に含めることで、LLM が過去の試みを把握した上で新しい改善策を提案できるようにする。

### 最終ゴール

- 3 回ループ実行時に、試行 N において試行 1〜N-1 の失敗チェックと改善要約を参照できること。
- LLM への feedback プロンプトに「過去の試行で試みた内容」が明示されること。
- 重複提案を防止し、各試行で異なるアプローチが取られること。

### スコープ

**含むもの:**

- `ImproveFeedbackHistory` 型の定義
- `verifyAndImproveLoop()` 内の feedback 蓄積ロジック実装
- `buildImproveFeedback()` 関数の引数・実装更新
- 上記に対応するユニットテストの追加

**含まないもの:**

- `maxImproveRetry` の値変更
- UI（SkillCreator 画面）への試行履歴の表示
- LLM プロンプトテンプレート全体の見直し

---

## Section 3: どのように実行するか（How）

### 前提条件

- TASK-P0-02 Phase 1〜12 が完了済みであること。
- 既存テストが 449 件全 PASS の状態であること。

### 推奨アプローチ

#### ステップ 1: `ImproveFeedbackHistory` 型定義

```typescript
/** verify→improve ループの 1 試行分の履歴 */
export interface ImproveFeedbackHistory {
  /** 試行番号（1始まり） */
  attempt: number;
  /** verify で失敗したチェック項目のリスト */
  failedChecks: string[];
  /** improve が生成した改善要約 */
  improveSummary: string;
}
```

#### ステップ 2: `verifyAndImproveLoop()` 内の変数置き換え

`previousImproveSummary: string` を `history: ImproveFeedbackHistory[]` に置き換え、improve 完了後にエントリを配列へ追加する。

```typescript
// 変更後
const history: ImproveFeedbackHistory[] = [];

// improve 後
history.push({
  attempt: currentAttempt,
  failedChecks: failedChecks.map((c) => c.name),
  improveSummary: improveResult.summary ?? "",
});
const feedback = buildImproveFeedback(failedChecks, history);
```

#### ステップ 3: `buildImproveFeedback()` の更新

引数を `previousImproveSummary: string` から `history: ImproveFeedbackHistory[]` に変更し、全試行を整形してフィードバック文字列に含める。既存シグネチャとの互換性を保つ場合はオーバーロードで拡張する。

#### ステップ 4: テスト追加

3 回ループシナリオで、試行 2 のフィードバックに試行 1 の要約が含まれること、試行 3 のフィードバックに試行 1・2 の要約が含まれることを検証するテストを追加する。

---

## Section 4: 実行手順

### Phase 1: 型定義・設計

1. 要件確認（本仕様書の Section 1〜3 を再読）
2. `ImproveFeedbackHistory` インタフェースを設計・定義
3. 設計レビュー（`buildImproveFeedback` の引数変更がどの呼び出し元に影響するか確認）

### Phase 2: 実装

1. `ImproveFeedbackHistory` 型を適切なモジュールに追加
2. `verifyAndImproveLoop()` 内の `previousImproveSummary` を `history: ImproveFeedbackHistory[]` に置き換え
3. `buildImproveFeedback()` を更新してヒストリ配列を受け取り全試行を整形する
4. 既存の呼び出し元が破損しないことを確認（コンパイルエラーがないこと）

### Phase 3: テスト・品質保証

1. `buildImproveFeedback` に対する新規ユニットテストを追加
   - 初回（history が空）は従来通りの動作
   - 試行 2 で試行 1 の要約が含まれること
   - 試行 3 で試行 1・2 の要約が含まれること
2. 既存テスト 449 件の回帰確認（全 PASS）

### Phase 4: ドキュメント更新

1. `docs/30-workflows/task-imp-verify-improve-revert-loop-002/outputs/phase-12/implementation-guide.md`（Part 2）の API シグネチャ記載を更新
2. 型定義更新内容を記録

---

## Section 5: 完了条件チェックリスト

### 機能要件

- [ ] `ImproveFeedbackHistory` 型が定義されている
- [ ] `verifyAndImproveLoop()` が全試行の feedback を蓄積する（`ImproveFeedbackHistory[]` で管理）
- [ ] `buildImproveFeedback()` が全試行ヒストリを整形して LLM に渡す
- [ ] `maxImproveRetry=3` の 3 回ループで試行 1 の要約が試行 2・3 のフィードバックに含まれる

### 品質要件

- [ ] 既存テスト 449 件が全 PASS
- [ ] `buildImproveFeedback` の新規テスト追加（ヒストリ蓄積ケース：初回・試行 2・試行 3）

### ドキュメント要件

- [ ] `implementation-guide.md`（Part 2）の `buildImproveFeedback` API シグネチャが更新されている

---

## Section 6: 検証方法

### テストケース

| #   | シナリオ                                                                                       | 期待結果                                                     |
| --- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| T-1 | `history = []` で `buildImproveFeedback` を呼び出す                                            | 従来通りの動作（ヒストリ部分なし）                           |
| T-2 | `history = [{ attempt: 1, failedChecks: [...], improveSummary: "summary-1" }]` で呼び出す      | 返却文字列に `"summary-1"` が含まれる                        |
| T-3 | `history = [{ attempt: 1, ... }, { attempt: 2, ..., improveSummary: "summary-2" }]` で呼び出す | 返却文字列に `"summary-1"` と `"summary-2"` の両方が含まれる |
| T-4 | `maxImproveRetry=3` のループ全体を実行し、試行 3 の feedback を取得する                        | 試行 1・2 の要約が両方含まれる                               |

### 手動確認観点

- LLM に渡るプロンプト（feedback 文字列）に「過去の試行履歴」セクションが追記されていること。
- 試行回数が増えても feedback 文字列が過度に長くならないこと（コンテキスト超過の兆候がないこと）。

---

## Section 7: リスクと対策

| リスク                                                    | 影響度 | 発生確率 | 対策                                                                                                                   |
| --------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `buildImproveFeedback` API の変更による既存テストの破損   | 中     | 中       | 既存シグネチャを保ちオーバーロードで拡張する。段階的に移行する。                                                       |
| ヒストリが長くなりすぎて LLM のコンテキスト超過が発生する | 中     | 低       | 最大 N 件の直近ヒストリに制限するオプション（例: `maxHistorySize`）を設ける。デフォルトは `maxImproveRetry` 値と同一。 |
| 型定義の配置先がモジュール間で不整合になる                | 低     | 低       | `packages/shared` または `RuntimeSkillCreatorFacade` と同一モジュール内に配置し、インポートパスを一元化する。          |

---

## Section 8: 参照情報

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
  - `verifyAndImproveLoop()` メソッド（`previousImproveSummary` 変数の現在の定義）
- `apps/desktop/src/main/services/runtime/formatVerifyChecksAsFeedback.ts`
  - `buildImproveFeedback()` 関数の現在の実装
- `docs/30-workflows/task-imp-verify-improve-revert-loop-002/outputs/phase-12/implementation-guide.md`
  - Part 2: API シグネチャ記載（更新対象）
- `docs/30-workflows/task-imp-verify-improve-revert-loop-002/outputs/phase-3/design-review.md`
  - MR-01 原文（苦戦箇所の記録元）

---

## Section 9: 備考

### レビュー指摘の原文（MR-01）

> 同一修正の繰り返し回避 - verify→improve→re-verify ループで、改善提案が同じ内容だと無限ループになるリスク。直前の improve 要約を次回 feedback に追記することで一定程度緩和。3 回ループ時の最適化は将来改善候補。

（出典: `docs/30-workflows/task-imp-verify-improve-revert-loop-002/outputs/phase-3/design-review.md` MR-01）

### 苦戦箇所記録

| ID          | 苦戦箇所                                                                                | 将来の解決指針                                                                           |
| ----------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| L-P0-02-001 | feedback memory を文字列で蓄積すると複数回試行時に LLM が同じ修正を繰り返す可能性がある | `ImproveFeedbackHistory[]` で全試行を構造化し、`buildImproveFeedback()` に渡すことで解決 |

### 発生元タスクとの関係

| 項目             | 内容                                                             |
| ---------------- | ---------------------------------------------------------------- |
| 発生元タスク     | `task-imp-verify-improve-revert-loop-002`（TASK-P0-02）          |
| 部分吸収フェーズ | Phase 12（直前 1 回分の summary をフィードバックに追記する実装） |
| 残課題           | 3 回ループ時の全試行ヒストリ参照（本タスクで対応）               |
