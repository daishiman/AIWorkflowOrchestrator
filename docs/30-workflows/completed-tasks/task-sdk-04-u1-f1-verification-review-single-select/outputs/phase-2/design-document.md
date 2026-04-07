# Phase 2: 設計書

## タスクID: TASK-SDK-04-U1-F1

---

## 1. kind 変更設計（Before/After）

### Before（変更前）

```typescript
function createVerificationReviewRequest(
  planId: string,
  message: string,
  requestedAt = nowIso(),
): SkillCreatorAwaitingUserInput {
  return {
    requestId: buildRequestId(planId, "verification_review", requestedAt),
    reason: "verification_review",
    title: "検証レビュー",
    prompt: buildVerificationReviewPrompt(message),
    kind: "free_text",
    placeholder: "承認/改善/却下の理由を入力してください",
    allowSkip: false,
    requestedAt,
  };
}
```

### After（変更後 / 実装済み）

```typescript
function createVerificationReviewRequest(
  planId: string,
  message: string,
  requestedAt = nowIso(),
): SkillCreatorAwaitingUserInput {
  return {
    requestId: buildRequestId(planId, "verification_review", requestedAt),
    reason: "verification_review",
    title: "検証レビュー",
    prompt: buildVerificationReviewPrompt(message),
    kind: "single_select",
    options: [
      { id: "approve", label: "承認してhandoffへ進む" },
      { id: "improve", label: "改善して再検証する" },
      { id: "reject", label: "差し戻して再計画する" },
    ],
    allowSkip: false,
    requestedAt,
  };
}
```

**変更内容**:

- `kind`: `"free_text"` → `"single_select"`
- `options`: 3選択肢を追加（approve/improve/reject）
- `placeholder`: 削除（single_select では不要）

---

## 2. 影響範囲分析

| 呼び出し元                            | 変更内容               | 備考                                     |
| ------------------------------------- | ---------------------- | ---------------------------------------- |
| `recordExecutionFailure()`            | 関数本体変更で自動反映 | 呼び出し元コードの変更は不要             |
| `recordVerifyFailure()`               | 関数本体変更で自動反映 | 呼び出し元コードの変更は不要             |
| renderer（single_select 処理）        | 変更なし               | 既存の single_select handling で動作する |
| `applyVerificationReviewTransition()` | 変更なし               | selectedOptionId ベースで既に動作済み    |

---

## 3. 30種の思考法による分析

### カテゴリ1: 論理分析系

| 思考法         | 適用結果                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------ |
| 批判的思考     | free_text のままでは `selectedOptionId` が送れない。single_select への変更は必然                 |
| 演繹思考       | renderer は kind に応じてフォームを出し分ける→ free_text では選択肢なし→ 変更必要                |
| 帰納的思考     | plan_review が single_select で動作している実績から、verification_review も同様に動作すると推測  |
| アブダクション | `applyVerificationReviewTransition()` が selectedOptionId を期待しているという事実から設計を逆算 |
| 垂直思考       | 変更は `createVerificationReviewRequest()` 1関数のみ。最小変更で最大効果                         |

### カテゴリ2: 構造分解系

| 思考法       | 適用結果                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------- |
| 要素分解     | 問題 = (request kind mismatch) + (test textValue残留)。独立した2つの修正                 |
| MECE         | 変更対象: Engine.ts（実装）+ test.ts（テスト）。重複・漏れなし                           |
| 2軸思考      | 影響×リスク: Engine変更（影響大・リスク低）/ test変更（影響小・リスク低）                |
| プロセス思考 | request生成→renderer表示→user選択→submission→transition。全フローで single_select が機能 |

### カテゴリ3: メタ・抽象系

| 思考法             | 適用結果                                                                        |
| ------------------ | ------------------------------------------------------------------------------- |
| メタ思考           | 設計の問題は「request種別とtransition期待値の乖離」。修正は契約の整合を取ること |
| 抽象化思考         | kind変更は「インターフェース契約の修正」であり、実装詳細（options内容）は独立   |
| ダブル・ループ思考 | なぜ free_text のままだったか？→ TASK-SDK-04-U1 で transition 実装時に同期漏れ  |

### カテゴリ4: 発想・拡張系

| 思考法               | 適用結果                                                                           |
| -------------------- | ---------------------------------------------------------------------------------- |
| ブレインストーミング | 選択肢数は3で十分か？→ approve/improve/reject で全遷移を網羅。追加不要             |
| 水平思考             | free_text を残しつつ single_select を追加する折衷案 → 複雑性増加のため採用しない   |
| 逆説思考             | 「textValue が消えると困る」→ NFR-3で未知option を no-op fallback として許容で対応 |
| 類推思考             | plan_review（既存single_select）との類推で設計を確認。同じパターンで問題なし       |
| if思考               | もし single_select に変更しなければ → UI で選択肢が表示されず到達不能のまま        |
| 素人思考             | 「受付の人に『どうしますか？』と聞かれているのに、回答用紙が自由記述になっていた」 |

### カテゴリ5: システム系

| 思考法       | 適用結果                                                                             |
| ------------ | ------------------------------------------------------------------------------------ |
| システム思考 | Engine→IPC→Renderer→User→submission→Engine の閉ループ。変更は Engine内で閉じる       |
| 因果関係分析 | free_text → 選択肢非表示 → selectedOptionId未送信 → transition不達                   |
| 因果ループ   | 正のフィードバック：single_select変更→選択肢表示→selectedOptionId送信→transition到達 |

### カテゴリ6: 戦略・価値系

| 思考法           | 適用結果                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------ |
| トレードオフ思考 | 折衷案（free_text+single_select）は複雑性増加。最小変更（single_selectのみ）を採択         |
| プラスサム思考   | テスト改善も同時実施→品質向上とコード明確化を両立                                          |
| 価値提案思考     | ユーザー（reviewer）が選択肢を見て判断できる → UX改善                                      |
| 戦略的思考       | 小規模変更で verification review フローを完全に機能させる。将来の Task05 UI 拡張の基盤にも |

### カテゴリ7: 問題解決系

| 思考法   | 適用結果                                                                            |
| -------- | ----------------------------------------------------------------------------------- |
| why思考  | なぜ選択肢が表示されない？→ kind=free_text → なぜfree_text？→ 実装時の同期漏れ      |
| 改善思考 | テストの `textValue` 残留も同時に改善                                               |
| 仮説思考 | 仮説「kind変更のみで全フローが動く」→ renderer は既存 single_select handling を持つ |
| 論点思考 | 核心的論点は「request種別とtransition期待値の乖離の解消」                           |
| KJ法     | 問題群を整理→「kind不一致」「textValue残留」「TC-NEW欠如」の3グループ               |

### synthesis（統合結論）

30種の思考法を7カテゴリで適用した結果、以下に収束:

1. **最小変更**: `createVerificationReviewRequest()` の kind を `single_select` に変更するのみ
2. **折衷案採用しない**: free_text を残す折衷案は複雑性増加のため不採用
3. **テスト整合**: `textValue` 削除 + TC-NEW-1〜3 + TC-ADD-1〜5 の追加
4. **後方互換**: NFR-3 の no-op fallback は維持

---

## 4. アーキテクチャ確認

| 観点           | 確認内容                                                             | 結論 |
| -------------- | -------------------------------------------------------------------- | ---- |
| アーキテクチャ | Main Process 内で閉じた変更。IPC 契約・Preload・Renderer に影響なし  | OK   |
| 型安全性       | `SkillCreatorUserInputKind` に `single_select` が定義済み            | OK   |
| 後方互換性     | `placeholder` フィールドは single_select では不要（型でも optional） | OK   |
