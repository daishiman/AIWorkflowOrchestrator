# Phase 5: 実装

## メタ情報

| 項目       | 値                                                |
| ---------- | ------------------------------------------------- |
| Phase      | 5                                                 |
| 機能名     | TASK-RALLY-008                                    |
| タスク名   | processWorkflowOutcomeのfire-and-forget不整合修正 |
| 前提Phase  | Phase 4                                           |
| 後続Phase  | Phase 6                                           |
| 作成日     | 2026-04-21                                        |
| ステータス | pending                                           |

## 目的

Phase 2の設計に従い`SkillLifecyclePanel.tsx`を最小差分で修正し、TC-1〜TC-5をGreen状態へ移行する。

## 実行タスク（直列）

1. `processWorkflowOutcome`の全呼び出し箇所をgrepで特定する
2. 各呼び出し箇所を分類する（既にawait付き / fire-and-forget / その他）
3. fire-and-forget箇所を`async run()`パターンに書き換える
4. `try/catch`を追加し`setWorkflowError`でエラーを反映する
5. 変更箇所に「正規の呼び出しパターン」コメントを追加する
6. `pnpm lint`を実行してエラーがないことを確認する
7. `pnpm typecheck`を実行してエラーがないことを確認する

## 実装時の注意点

- `processWorkflowOutcome`が同期関数（`void`型）である場合は`await`を追加せず`.catch()`を使う
- useEffect内の`async run()`パターンのクリーンアップ（アンマウント後のstate更新防止）が必要かどうかを既存コードのパターンに合わせて判断する
- RALLY-006で修正された依存配列との整合を確認する

## 参照資料

| 資料名             | パス                                                                 | 用途          |
| ------------------ | -------------------------------------------------------------------- | ------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                              | Phase 4成果物 |
| Red結果            | `outputs/phase-4/red-test-result.md`                                 | Phase 4成果物 |
| アーキテクチャ設計 | `outputs/phase-2/design-spec.md`                                     | Phase 2成果物 |
| 対象ファイル       | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 実装対象      |

## 成果物

| 成果物           | パス                                        | 説明               |
| ---------------- | ------------------------------------------- | ------------------ |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装内容と差分要約 |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更対象ファイル   |
| 契約差分         | `outputs/phase-5/contract-diff.md`          | 変更前後の差分記録 |

## 完了条件

- [ ] fire-and-forget箇所が`async run() + try/catch`パターンに変更されていること
- [ ] `setWorkflowError`によるエラー反映が実装されていること
- [ ] `void processWorkflowOutcome(...)`の形式が残存していないこと
- [ ] `pnpm lint`がエラーなしで通過すること
- [ ] `pnpm typecheck`がエラーなしで通過すること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 6: テスト拡充
