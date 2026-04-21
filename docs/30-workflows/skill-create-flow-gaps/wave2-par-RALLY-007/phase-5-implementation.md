# Phase 5: 実装

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| Phase      | 5                               |
| 機能名     | TASK-RALLY-007                  |
| タスク名   | addAssistantMessage依存配列修正 |
| 前提Phase  | Phase 4                         |
| 後続Phase  | Phase 6                         |
| 作成日     | 2026-04-21                      |
| ステータス | pending                         |

## 目的

Phase 2の設計に従い`useInterviewState.ts`を最小差分で修正し、TC-1〜TC-5をGreen状態へ移行する。

## 実行タスク（直列）

1. `useInterviewState.ts`の`addAssistantMessage`と関連する`currentStepIndex`の全使用箇所を把握する
2. `currentStepIndexRef`を追加し、`currentStepIndex`の変化を追跡するuseEffectを追加する
3. `addAssistantMessage`内の`currentStepIndex`参照を`currentStepIndexRef.current`に変更する
4. `setTotalSteps`の呼び出しを`setState(prev => ...)`パターンに変更する
5. `addAssistantMessage`のuseCallback依存配列から`currentStepIndex`を除去する
6. `pnpm lint`を実行して`exhaustive-deps`警告がないことを確認する
7. `pnpm typecheck`を実行してエラーがないことを確認する

## 実装時の注意点

- `currentStepIndexRef`の型は`React.MutableRefObject<number>`
- `useEffect`でcurrentStepIndexを追跡する際、初期値は`useRef(currentStepIndex)`の引数として設定する
- `setTotalSteps(prev => ...)`のパターンが型シグネチャ（`Dispatch<SetStateAction<number>>`）と合致するか確認する

## 参照資料

| 資料名             | パス                                                                    | 用途          |
| ------------------ | ----------------------------------------------------------------------- | ------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                                 | Phase 4成果物 |
| Red結果            | `outputs/phase-4/red-test-result.md`                                    | Phase 4成果物 |
| アーキテクチャ設計 | `outputs/phase-2/design-spec.md`                                        | Phase 2成果物 |
| 対象ファイル       | `apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts` | 実装対象      |

## 成果物

| 成果物           | パス                                        | 説明               |
| ---------------- | ------------------------------------------- | ------------------ |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装内容と差分要約 |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更対象ファイル   |
| 契約差分         | `outputs/phase-5/contract-diff.md`          | 変更前後の差分記録 |

## 完了条件

- [ ] `currentStepIndexRef`が実装され、useEffectで最新値を追跡していること
- [ ] `addAssistantMessage`内で`currentStepIndexRef.current`を使用していること
- [ ] `setTotalSteps`が`setState(prev => ...)`パターンを使用していること
- [ ] `addAssistantMessage`のuseCallback依存配列から`currentStepIndex`が除去されていること
- [ ] `pnpm lint`の`exhaustive-deps`警告がゼロであること
- [ ] `pnpm typecheck`がエラーなしで通過すること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 6: テスト拡充
