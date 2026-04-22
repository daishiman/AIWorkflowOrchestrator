# Phase 6: テスト拡張（異常系・追加回帰ケース）

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 6                                       |
| タスクID   | TASK-RALLY-002                          |
| 機能名     | restored-pending-request-clarification  |
| タスク名   | restoredPendingRequest合成ルール明確化  |
| 前提Phase  | Phase 5                                 |
| 後続Phase  | Phase 7                                 |
| 作成日     | 2026-04-21                              |
| ステータス | pending                                 |
| 実装モード | verify_existing                         |
| タスク種別 | renderer / NON_VISUAL / verify_existing |

## 目的

Phase 4 の targeted regression test（正常系3シナリオ）では網羅されていない異常系ケースとエッジケースの仕様を定義し、`restoredPendingRequest` 合成ロジックの境界条件における挙動を固定する。復元フローと通常フローの境界・両値が同時に非 null になる競合状態・クリア条件 `useEffect` が想定外のタイミングで発火するケースを明示的に文書化することで、RALLY-010 以降のタスクが安全に前提として依存できる状態を作る。

## 実行タスク

1. 復元フローと通常フローの境界に関するエッジケースを列挙し、各ケースの前提条件・期待挙動・verify_existing 観点での判定根拠を定義する
2. 異常系ケース（`restoredPendingRequest` と `workflowSnapshot?.awaitingUserInput` が同時に非 null・`requestId` が変化しないままクリア useEffect が再実行される場合）のテストケース仕様を定義する
3. Phase 4・Phase 5 の結果と合わせた回帰テスト全体の実行手順を定義し、全ケース PASS を確認するための実行コマンドと期待結果を記録する

## エッジケース定義

以下のエッジケースを `outputs/phase-6/expanded-test-cases.md` に詳細化する。

### EC-1: 両値が同時に非 null（競合状態）

| 項目     | 内容                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 前提条件 | `restoredPendingRequest` が `{ requestId: "restore-001", ... }` / `workflowSnapshot?.awaitingUserInput` が `{ requestId: "live-001", ... }` |
| 操作     | コンポーネントをレンダリングする                                                                                                            |
| 期待挙動 | `pendingRequest` は `restoredPendingRequest`（`requestId: "restore-001"`）を返す（null 合体演算子の左辺が優先される）                       |
| 判定根拠 | `??` 演算子は左辺が null/undefined でない場合に右辺を評価しないため、既存の合成式が競合を正しく解決している                                 |

### EC-2: restoredPendingRequest が null でクリア useEffect が発火しない場合

| 項目     | 内容                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------- |
| 前提条件 | `restoredPendingRequest` が最初から null / `workflowSnapshot?.awaitingUserInput?.requestId` が変化する              |
| 操作     | `workflowSnapshot` を更新する                                                                                       |
| 期待挙動 | クリア条件 `useEffect` が実行されるが、`setRestoredPendingRequest(null)` の呼び出しは副作用なし（既に null のため） |
| 判定根拠 | 通常フローでは `restoredPendingRequest` が null であるため、クリア呼び出しは冪等である                              |

### EC-3: requestId が変化しないまま workflowSnapshot が更新される場合

| 項目     | 内容                                                                                                                       |
| -------- | -------------------------------------------------------------------------------------------------------------------------- |
| 前提条件 | `restoredPendingRequest` が非 null / `workflowSnapshot?.awaitingUserInput?.requestId` が同一値のまま snapshot が更新される |
| 操作     | `workflowSnapshot` を同一 `requestId` で更新する                                                                           |
| 期待挙動 | クリア条件 `useEffect` は `requestId` が依存配列に入っているため再実行されない（クリアは発生しない）                       |
| 判定根拠 | `useEffect` の依存配列が `workflowSnapshot?.awaitingUserInput?.requestId` であるため、値変化なしでは再実行されない         |

### EC-4: workflowSnapshot が null から非 null に変化するタイミング（復元フロー→通常フロー切り替え境界）

| 項目     | 内容                                                                                                                                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 前提条件 | セッション復元直後: `restoredPendingRequest` が非 null / `workflowSnapshot` が null                                                                                                                                            |
| 操作     | `workflowSnapshot` が届き、`awaitingUserInput.requestId` が設定される                                                                                                                                                          |
| 期待挙動 | `workflowSnapshot` 到着前は `pendingRequest === restoredPendingRequest`（復元フロー）/ `workflowSnapshot` 到着後は useEffect がクリアを実行し `pendingRequest === workflowSnapshot?.awaitingUserInput`（通常フローへ切り替え） |
| 判定根拠 | これが RALLY-002 の核心シナリオ。復元フローから通常フローへの移行が `requestId` の変化によって制御されていることを固定する                                                                                                     |

### EC-5: restoredPendingRequest がクリアされた後に再度セッション復元が発生する場合

| 項目     | 内容                                                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 前提条件 | `restoredPendingRequest` が一度クリアされ null になっている状態で、コンポーネントが再マウントされる                           |
| 操作     | コンポーネントを再マウントし、新たな `restoredPendingRequest` が Props で渡される                                             |
| 期待挙動 | 再マウント時に `restoredPendingRequest` が非 null で渡された場合、`pendingRequest` が再び `restoredPendingRequest` を優先する |
| 判定根拠 | コンポーネントの再マウントは初期状態からの再開であり、復元フローが正しく再適用されることを確認する                            |

## 実行手順

### ステップ1: エッジケース仕様の確定

Phase 5 の `diff-check-result.md` と `verification-result.md` を参照し、EC-1〜EC-5 の前提条件が現在のコード実装と一致していることを確認する。不一致があれば前提条件の記述を修正した上で `expanded-test-cases.md` に記録する。

### ステップ2: 異常系テストケース仕様の定義

EC-1〜EC-5 のそれぞれについて、以下の形式でテストケース仕様を記述する。

```
テストケースID: TC-EC1-01
対象エッジケース: EC-1（両値が同時に非 null）
前提条件:
  - restoredPendingRequest = { requestId: "restore-001", questionText: "復元質問" }
  - workflowSnapshot = { awaitingUserInput: { requestId: "live-001", questionText: "通常質問" } }
操作:
  - コンポーネントをレンダリングする
期待結果:
  - pendingRequest.requestId === "restore-001"（restoredPendingRequest が優先される）
  - pendingRequest.questionText === "復元質問"
```

### ステップ3: 回帰テスト全体の実行

Phase 4（正常系3ケース）＋Phase 6（異常系・エッジケース5ケース）の全テストを実行し、結果を `regression-test-result.md` に記録する。

```bash
# 全 targeted regression test の実行
pnpm --filter @repo/desktop test -- --testPathPattern=ConversationalInterview

# テスト結果の詳細表示
pnpm --filter @repo/desktop test -- --testPathPattern=ConversationalInterview --reporter=verbose
```

### ステップ4: エッジケース確認結果の記録

EC-1〜EC-5 の各エッジケースについて、テスト結果（PASS/FAIL）と confirm 事項を `edge-case-result.md` に記録する。

| エッジケースID | テスト結果 | 確認事項                                           |
| -------------- | ---------- | -------------------------------------------------- |
| EC-1           | 要確認     | 競合状態で restoredPendingRequest が優先されること |
| EC-2           | 要確認     | 通常フローでのクリア呼び出し冪等性                 |
| EC-3           | 要確認     | requestId 不変時にクリアが発生しないこと           |
| EC-4           | 要確認     | 復元フロー→通常フロー切り替え境界の正確性          |
| EC-5           | 要確認     | 再マウント後の復元フロー再適用                     |

## 統合テスト連携

- エッジケース（EC-1〜EC-5）は Phase 4 の正常系 3 シナリオと重複しない異常系・境界系として定義する
- `restoredPendingRequest` クリアの副作用確認は `@repo/shared` の型統合テストとは独立して実施する
- Phase 7 のカバレッジ計測で EC テストが検出されることを前提にファイルパスと describe 命名を決定する

## 参照資料

| 資料名                     | パス                                                                     | 用途                                                  |
| -------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------- |
| Phase 4 テスト仕様         | `outputs/phase-4/test-specification.md`                                  | 正常系3シナリオとの重複排除・拡張ケースの位置付け確認 |
| Phase 4 テスト棚卸し       | `outputs/phase-4/existing-test-inventory.md`                             | 既存テストとのカバー重複確認                          |
| Phase 5 diff確認結果       | `outputs/phase-5/diff-check-result.md`                                   | エッジケース前提条件の現コード整合確認                |
| Phase 5 検証結果           | `outputs/phase-5/verification-result.md`                                 | Phase 5 時点でのテスト PASS 状態の確認                |
| Phase 2 downstream handoff | `outputs/phase-2/verification-design.md`                                 | RALLY-010 以降が依存する pendingRequest 契約の確認    |
| 対象コード                 | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` | EC-1〜EC-5 の前提条件・期待挙動の実装整合確認         |
| Phase 3 リスクレジスタ     | `outputs/phase-3/dependency-risk-register.md`                            | RISK-DR-001（seqNo 欠如）のエッジケースへの影響確認   |

## 成果物

- `outputs/phase-6/expanded-test-cases.md`（異常系・エッジケース仕様：EC-1〜EC-5 のテストケースID・前提条件・操作・期待結果・判定根拠）
- `outputs/phase-6/regression-test-result.md`（回帰テスト全体の実行結果：Phase 4 正常系3ケース＋Phase 6 異常系5ケースの PASS/FAIL・コマンド出力サマリー）
- `outputs/phase-6/edge-case-result.md`（エッジケース確認結果：EC-1〜EC-5 ごとのテスト結果・確認事項・RALLY-010 以降への影響評価）

## 完了条件

- [ ] EC-1〜EC-5 の5エッジケースの前提条件・操作・期待挙動・判定根拠が `expanded-test-cases.md` に定義されている
- [ ] 各エッジケースのテストケース仕様が具体的な値（requestId 等）を含む形で記述されている
- [ ] Phase 4 正常系3ケース＋Phase 6 異常系5ケースの全回帰テストが実行され、結果が `regression-test-result.md` に記録されている
- [ ] EC-1〜EC-5 の各エッジケースの確認結果と RALLY-010 以降への影響評価が `edge-case-result.md` に記録されている
- [ ] 全テストが PASS していることが確認されている（FAIL がある場合は原因と対処が記録されている）
- [ ] 3成果物（expanded-test-cases.md / regression-test-result.md / edge-case-result.md）が outputs/phase-6/ に定義されている
- [ ] Phase 6 完了前に Phase 7 へ進まないことを確認した

## タスク100%実行確認【必須】

- [ ] 実行タスク1（エッジケース列挙・仕様定義）完了
- [ ] 実行タスク2（異常系テストケース仕様定義）完了
- [ ] 実行タスク3（回帰テスト全体実行・結果記録）完了
- [ ] 成果物3件（expanded-test-cases.md / regression-test-result.md / edge-case-result.md）定義済み
- [ ] verify_existing 原則（新規ロジック追加なし・既存挙動固定のみ）が全成果物に反映されていることを確認した

## 次のPhase

Phase 7: コードレビュー
