# TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-EXHAUSTIVE-CHECK-001 - タスク指示書

## メタ情報

```yaml
issue_number: 2035
```

## メタ情報

| 項目         | 内容                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------- |
| タスクID     | TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-EXHAUSTIVE-CHECK-001                                                           |
| タスク名     | verifyAndImproveLoop() 内 exhaustive check 導入                                                                      |
| 分類         | リファクタリング / 品質改善（follow-up）                                                                             |
| 対象機能     | RuntimeSkillCreatorFacade.verifyAndImproveLoop() の terminal_handoff / success 判定ロジック                          |
| 優先度       | 低                                                                                                                   |
| 見積もり規模 | 小規模                                                                                                               |
| ステータス   | 未実施                                                                                                               |
| 発見元       | TASK-UT-RT-01-EXHAUSTIVE-CHECK-EXECUTE-RESPONSE-001 Phase-12 unassigned-task-detection.md（baseline 既知スコープ外） |
| 発見日       | 2026-04-08                                                                                                           |
| 親タスク     | TASK-UT-RT-01-EXHAUSTIVE-CHECK-EXECUTE-RESPONSE-001                                                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-UT-RT-01-EXHAUSTIVE-CHECK-EXECUTE-RESPONSE-001` において、`RuntimeSkillCreatorFacade.executeAsync()` の `RuntimeSkillCreatorExecuteResponse` union 型判定が `switch` + `assertNever` による exhaustive check パターンへ移行された。

しかし、同ファサードの `verifyAndImproveLoop()` メソッド内には、同じ `RuntimeSkillCreatorExecuteResponse` union 型を扱う判定ロジックが残っており、依然として inline 条件式（`"type" in result && result.type === "terminal_handoff"` / `"success" in improveResult`）が使われている。

現在のスコープ外として本タスクは切り分けられていたが、`executeAsync()` に exhaustive check が導入されたことで、`verifyAndImproveLoop()` の非 exhaustive な判定が相対的に負債として顕在化した。

### 1.2 問題点・課題

- `verifyAndImproveLoop()` 内の `terminal_handoff` 判定（行 521-537 付近）は `"type" in result && result.type === "terminal_handoff"` という inline 条件式であり、union の各メンバーを discriminant で網羅的に分岐していない
- `"success" in improveResult` 判定（行 495-518 付近）も同様に inline 判定であり、新しい union メンバーが追加された際にコンパイラが漏れを検出できない
- `executeAsync()` には exhaustive check が導入された一方、`verifyAndImproveLoop()` には導入されていないため、同一クラス内でコード品質基準に不整合が生じている
- loop 制御フロー（continue / break / return）が含まれるため、switch 文の配置を誤ると loop 動作が変わるリスクがある

### 1.3 放置した場合の影響

- `RuntimeSkillCreatorExecuteResponse` union に新メンバーが追加された場合、`verifyAndImproveLoop()` は新ケースを無言でスルーし、誤った loop 継続判定またはループ終了判定が行われる可能性がある
- TypeScript コンパイラが警告を出さないまま実行時バグが混入し、verify→improve→re-verify のクローズドループが予期しない動作をするリスクがある
- `executeAsync()` の exhaustive check がコンパイルエラーで新ケースの追加を促しても、`verifyAndImproveLoop()` 側の修正漏れが静的に検出されないため、union 型拡張時に対応漏れが発生しやすい

---

## 2. 何を達成するか（What）

### 2.1 目的

`verifyAndImproveLoop()` 内の `terminal_handoff` / `success` 判定ロジックを `switch` + `assertNever` による exhaustive check パターンへ置換し、`executeAsync()` と同水準の型安全性を確保する。

### 2.2 最終ゴール

- `verifyAndImproveLoop()` 内の `terminal_handoff` / `success` の inline 判定が除去され、各 union メンバーに対応する `switch` 分岐に置き換えられた状態
- union に未知のメンバーが追加された場合に `default` ブランチで `assertNever` 型エラーが発生し、コンパイル時に漏れが検出される状態
- loop の継続（continue）・終了（return / break）判定が元の動作と等価であることがテストで確認されている状態

### 2.3 スコープ

#### 含むもの

- `RuntimeSkillCreatorFacade.ts` の `verifyAndImproveLoop()` メソッド内の terminal_handoff / success 判定を exhaustive switch に置換
- `assertNever` ヘルパー関数の適用（`executeAsync()` 変更時にすでに導入済みであれば流用、未導入であれば追加）
- `verifyAndImproveLoop()` の各 union ケースに対応するユニットテストの追加・補完

#### 含まないもの

- `executeAsync()` の変更（本タスクの親タスクで実装済み）
- `RuntimeSkillCreatorExecuteResponse` 型定義自体の変更
- Renderer 側 consumer コードの変更（外部 API 不変のため不要）
- 新しい union メンバーの追加

### 2.4 成果物

- 変更ファイル: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（`verifyAndImproveLoop()` メソッド部分）
- 追加・補完テスト: `apps/desktop/src/main/services/runtime/__tests__/` 配下の関連テストファイル

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-UT-RT-01-EXHAUSTIVE-CHECK-EXECUTE-RESPONSE-001` が完了済みであること（`executeAsync()` に exhaustive check が導入されていること）
- `assertNever` ヘルパー関数が `RuntimeSkillCreatorFacade.ts` またはその依存モジュールにすでに存在すること、または本タスクで導入すること
- `verifyAndImproveLoop()` の現行実装（loop 制御フロー含む）を理解していること

### 3.2 依存タスク

| 依存タスク                                          | 内容                                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------ |
| TASK-UT-RT-01-EXHAUSTIVE-CHECK-EXECUTE-RESPONSE-001 | 親タスク。assertNever ヘルパーと exhaustive check パターンが導入されていること |

### 3.3 必要な知識

- TypeScript discriminated union パターン
- `never` 型と `assertNever` による exhaustive check パターン
- `RuntimeSkillCreatorExecuteResponse` の 3 メンバーの discriminant（`executeAsync()` 実装済みの知見を参照）
- `verifyAndImproveLoop()` の loop 制御フロー（continue / return の意味論）
- Vitest によるユニットテスト記述

#### loop 制御フローの注意点

`verifyAndImproveLoop()` は `executeAsync()` と異なり、while ループまたは for ループが存在する。switch 文の配置場所によって loop の continue（次のイテレーションへ）/ return（ループ終了）の動作が変わるため、switch 文を配置する位置の選定が特に重要。

**判定箇所の特定が必要:**

```
verifyAndImproveLoop() 内:
  行 521-537 付近: "type" in result && result.type === "terminal_handoff" の判定
  行 495-518 付近: "success" in improveResult の判定
```

これらの判定は loop の iteration 判定と密接に絡むため、`switch` へ置換する際は元の loop 動作を保存することが最重要。

### 3.4 推奨アプローチ

1. `verifyAndImproveLoop()` の現行コードを精読し、各 inline 判定が loop の flow（continue / break / return）とどう連動しているかをコメントで整理する

2. `executeAsync()` で導入済みの `assertNever` ヘルパーを確認する。同ファイル内にあれば流用、なければ同じパターンで追加する

3. `verifyAndImproveLoop()` 内の inline 判定を switch に置換する。ループ継続/終了の判定は switch の各 case ブランチ内で明示的に記述する

   ```typescript
   // 例: improveResult の switch 化
   switch (true) {
     case "type" in improveResult && improveResult.type === "terminal_handoff":
       // terminal_handoff 処理（ループ終了）
       return ...;
     case "success" in improveResult && improveResult.success === true:
       // 成功処理（ループ継続）
       continue;
     case "success" in improveResult && improveResult.success === false:
       // 失敗処理（ループ終了 or 継続）
       ...
       break;
     default:
       assertNever(improveResult);
   }
   ```

   ただし、上記は例示であり、実際の discriminant は `executeAsync()` の実装パターンを参照して設計すること。

4. TypeScript コンパイルが通ることを確認してからテスト追加に進む

5. 既存の `verifyAndImproveLoop()` テストが全て PASS することを確認し、各 union ケースをカバーするテストを追加する

---

## 4. 実行手順

### Phase 構成

小規模タスクのため 3 Phase で構成する。

| Phase | 名称                 | 概要                                                                |
| ----- | -------------------- | ------------------------------------------------------------------- |
| 1     | コード調査・設計確認 | verifyAndImproveLoop() の現行ロジックと loop 制御フローを調査・整理 |
| 2     | 実装                 | exhaustive switch への置換。loop 動作の等価性確認                   |
| 3     | テスト追加・完了確認 | ユニットテスト追加、型チェック・lint・テスト通過確認                |

---

### Phase 1: コード調査・設計確認

#### 目的

`verifyAndImproveLoop()` の現行実装における union 型判定箇所を特定し、switch 化に向けた設計を確定する。

#### 手順

1. `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` の `verifyAndImproveLoop()` メソッド全体を精読する
2. inline 判定（`"type" in result && result.type === "terminal_handoff"` / `"success" in improveResult`）が何行目にあるかを特定する
3. 各判定が loop の continue / return / break とどう連動しているかをコメントで整理する
4. `executeAsync()` に導入済みの `assertNever` の配置場所を確認し、`verifyAndImproveLoop()` からも参照できるか確認する
5. 置換後の switch 文のインターフェース（各 case が返す値・行う処理）を設計する

#### 成果物

- 設計メモ（コード内コメントまたは Phase ドキュメント）

#### 完了条件

- `verifyAndImproveLoop()` 内の inline 判定箇所が全て特定されている
- 各判定と loop 制御フローの関係が明確になっている
- switch 化の方針（case の分岐内容・assertNever の配置箇所）が確定している

---

### Phase 2: 実装

#### 目的

`verifyAndImproveLoop()` 内の inline 判定を exhaustive switch に置換し、loop 動作の等価性を確認する。

#### 手順

1. Phase 1 の設計に従い、`verifyAndImproveLoop()` 内の inline 判定を switch 文に置換する
2. `assertNever` を `default` ブランチに配置し、未知の union メンバーがコンパイルエラーになることを設計で保証する
3. loop 継続（continue）・終了（return）判定が元の動作と等価であることを確認する（手動での動作トレース）
4. `pnpm --filter @repo/desktop typecheck` でコンパイルエラーがないことを確認する
5. `pnpm --filter @repo/desktop lint` で lint エラーがないことを確認する
6. 既存テストが全て PASS することを確認する（リグレッションなし）

#### 成果物

- 変更済み `RuntimeSkillCreatorFacade.ts`

#### 完了条件

- TypeScript コンパイルが通る
- lint エラーがない
- 既存テストが全て PASS する

---

### Phase 3: テスト追加・完了確認

#### 目的

exhaustive check パターンが `verifyAndImproveLoop()` でも正しく動作することをテストで保証し、タスクを完了させる。

#### 手順

1. 既存の `verifyAndImproveLoop()` テストファイルを確認する
2. 各 union ケースに対応するユニットテストを追加する:
   - `improveResult` が `{ success: true, ... }` → ループが継続する（または正常完了する）
   - `improveResult` が `{ success: false, ... }` の `RuntimeSkillCreatorExecuteResult` → 適切なループ終了またはエラー処理
   - `improveResult` が `{ success: false, error: { code: ... } }` の `RuntimeSkillCreatorExecuteErrorResponse` → 適切なエラー処理
   - `improveResult` が `{ type: "terminal_handoff", bundle: ... }` → ループが終了し terminal_handoff 処理が行われる
3. `pnpm --filter @repo/desktop test` でテストが全て PASS することを確認する
4. `pnpm --filter @repo/desktop typecheck` の最終確認を行う

#### 成果物

- 追加済みテストケース（既存ファイルへの追記または新規テストファイル）

#### 完了条件

- 全ての追加テストが PASS する
- TypeScript コンパイルが通る
- lint エラーがない
- `verifyAndImproveLoop()` の exhaustive check パターンが機能していることがテストで確認されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `verifyAndImproveLoop()` 内の terminal_handoff / success の inline 判定が除去されている
- [ ] `RuntimeSkillCreatorExecuteResponse` の各 union メンバーが discriminant で明示的に分岐されている
- [ ] `assertNever`（または同等の）exhaustive check パターンが `default` ブランチに組み込まれている
- [ ] 既存の `verifyAndImproveLoop()` の loop 動作（continue / return 判定）がリグレッションしていない

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通る
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしで通る
- [ ] `pnpm --filter @repo/desktop test` が全て PASS する
- [ ] 新たに追加したテストが `verifyAndImproveLoop()` の全 union ケースをカバーしている

### ドキュメント要件

- [ ] 変更内容と exhaustive check パターンの意図がコード内コメントで説明されている

---

## 6. 検証方法

### テストケース

| テストID | 入力                                                                                                                | 期待結果                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| TC-01    | improve() が `{ success: true, ... }` を返す                                                                        | loop が継続する、または正常完了処理が行われる     |
| TC-02    | improve() が `{ success: false, ... }` を返す（`RuntimeSkillCreatorExecuteResult`）                                 | 適切なループ終了またはエラー処理が行われる        |
| TC-03    | improve() が `{ success: false, error: { code: "llm_adapter_unavailable", ... } }` を返す（`ExecuteErrorResponse`） | 適切なエラー処理・ループ終了が行われる            |
| TC-04    | improve() が `{ type: "terminal_handoff", bundle: ... }` を返す                                                     | ループが終了し、terminal_handoff 処理が行われる   |
| TC-05    | `assertNever` の `default` ブランチが型レベルで機能すること（コンパイル時確認）                                     | 未知の union メンバーでコンパイルエラーが発生する |

### 検証手順

1. `pnpm --filter @repo/desktop typecheck` を実行してコンパイルエラーがないことを確認
2. `pnpm --filter @repo/desktop lint` を実行して lint エラーがないことを確認
3. `pnpm --filter @repo/desktop test` を実行して全テストが PASS することを確認
4. `verifyAndImproveLoop()` に対応するテストの各 TC が PASS していることを確認
5. `assertNever` の `default` ブランチが実際にコンパイルエラーを発生させることをローカルで一時的に確認（新しい union メンバーを型定義に追加してみる）

---

## 7. リスクと対策

| リスク                                                                                                          | 影響度 | 発生確率 | 対策                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| switch 文の配置位置を誤り、loop の continue / return が元の動作と異なる挙動になる                               | 高     | 中       | Phase 1 で loop 制御フローを詳細にトレースしてから実装に進む。Phase 2 で既存テスト全 PASS を確認してから Phase 3 に進む |
| `verifyAndImproveLoop()` は `executeAsync()` より loop 制御が複雑なため、switch 文が読みづらくなる              | 中     | 中       | switch 文の各 case に loop 制御フローの意図をコメントで明記する。readability を優先し、必要に応じて抽出関数を設ける     |
| `assertNever` が `executeAsync()` でローカルスコープに定義されており、`verifyAndImproveLoop()` から参照できない | 低     | 中       | Phase 1 でスコープを確認し、モジュールスコープへ移動するか複製するかを判断する                                          |
| 既存の `verifyAndImproveLoop()` テストカバレッジが薄く、リグレッションを検出できない                            | 中     | 低       | Phase 3 でテスト追加前に既存テストを確認し、カバレッジが薄い箇所を先に補完してから switch 化のテストを追加する          |

---

## 8. 参照情報

### 関連ドキュメント

- 対象ファイル: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- 型定義: `packages/shared/src/types/skillCreator.ts`（`RuntimeSkillCreatorExecuteResponse`）
- 親タスク指示書: `docs/30-workflows/unassigned-task/task-ut-rt-01-exhaustive-check-execute-response-001.md`
- 親タスクワークフロー: `docs/30-workflows/task-ut-rt-01-exhaustive-check-execute-response-001/`
- 発見ソース: `docs/30-workflows/task-ut-rt-01-exhaustive-check-execute-response-001/outputs/phase-12/unassigned-task-detection.md`
- 関連タスク: `docs/30-workflows/unassigned-task/TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001.md`

### 参考資料

- TypeScript Handbook: [Narrowing - Exhaustiveness checking](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking)
- `assertNever` パターン: 親タスク `TASK-UT-RT-01-EXHAUSTIVE-CHECK-EXECUTE-RESPONSE-001` の実装を参照

---

## 9. 備考

### 苦戦箇所【記入必須】

> 以下は親タスク `TASK-UT-RT-01-EXHAUSTIVE-CHECK-EXECUTE-RESPONSE-001` の Phase-12 `unassigned-task-detection.md` および本タスク仕様書のスコープ外事項から判明している将来の実装者向け知見。
> 発見ソース: `docs/30-workflows/task-ut-rt-01-exhaustive-check-execute-response-001/outputs/phase-12/unassigned-task-detection.md`

| 項目     | 内容                                                                                                                                                                                                                                                                       |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状     | `verifyAndImproveLoop()` の switch 化は `executeAsync()` より複雑。loop の continue / return が判定ロジックと一体化しており、switch 文の位置選定が難しい                                                                                                                   |
| 原因     | `verifyAndImproveLoop()` は while ループの中で `improve()` を呼び出し、その結果で「ループ継続」「ループ終了（成功）」「ループ終了（エラー）」「terminal_handoff 終了」の4パターンを判定している。switch を外側に置くと loop 制御が壊れ、内側に置くと冗長になる可能性がある |
| 対応     | Phase 1 でループの状態機械（各状態遷移）を図示またはコメントで整理してから実装に進むこと。`executeAsync()` の `classifyExecuteResult()` 類似の分類関数を `verifyAndImproveLoop()` 専用にも設けることを検討する                                                             |
| 再発防止 | loop 制御フローを含む switch 化は必ず Phase 1 の設計を経由し、既存テストで動作等価性を確認してから Phase 3 のテスト追加に進む。switch 化後は必ず loop の継続条件と終了条件をコメントで明記する                                                                             |

### レビュー指摘の原文（該当する場合）

```
親タスク TASK-UT-RT-01-EXHAUSTIVE-CHECK-EXECUTE-RESPONSE-001 仕様書（スコープ外事項）より:

> 含まないもの:
> - verifyAndImproveLoop() 内の terminal_handoff / success 判定の exhaustive check 化（別タスクで対応）

Phase-12 unassigned-task-detection.md（baseline 既知スコープ外）より:

| 候補                                         | 内容                                                                                             | 参照元                         |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------ |
| `verifyAndImproveLoop()` exhaustive check 化 | `verifyAndImproveLoop()` 内の `terminal_handoff` / `success` 判定を exhaustive switch に変更する | 本タスク仕様書のスコープ外事項 |
```

### 補足事項

- 本タスクは現時点では inline 条件式で十分に機能しており、バグではない。将来の保守性向上を目的としたリファクタリングである
- `executeAsync()` の exhaustive check が先に導入されているため、union 型に新メンバーが追加された際は `executeAsync()` のコンパイルエラーが先に発生する。本タスクはその「二次的な安全網」として位置付けられる
- 優先度が低い理由: `executeAsync()` 側の exhaustive check で新ケース追加を検出でき、その修正時に `verifyAndImproveLoop()` も合わせて修正できる。ただし、修正漏れのリスクは残る
- `TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001` と対象メソッドが重複するため、実施順序・スコープの重複がないかを事前に確認すること
