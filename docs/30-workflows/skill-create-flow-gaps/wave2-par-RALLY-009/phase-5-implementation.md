# Phase 5: 実装

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| Phase      | 5                                |
| 機能名     | TASK-RALLY-009                   |
| タスク名   | getSkillCreatorApi()型ガード強化 |
| 前提Phase  | Phase 4                          |
| 後続Phase  | Phase 6                          |
| 作成日     | 2026-04-21                       |
| ステータス | pending                          |

## 目的

Phase 2の設計に従い型ガード関数を実装し、TC-1〜TC-7をGreen状態へ移行する。

## 実行タスク（直列）

1. `SkillCreatorRuntimeApi`と`SessionResumeApi`の型定義を確認し、必須メソッド一覧を把握する
2. `isSkillCreatorRuntimeApi`型ガード関数を実装する
3. `isSessionResumeApi`型ガード関数を実装する
4. `getSkillCreatorApi()`を型ガードを使う形に書き換える
5. `getSessionResumeApi()`を型ガードを使う形に書き換える
6. `apps/desktop/src/preload/skill-creator-api.ts`の型定義・エクスポートに不整合がある場合は修正する
7. `pnpm lint`を実行してエラーがないことを確認する
8. `pnpm typecheck`を実行してエラーがないことを確認する

## 実装時の注意点

- 型ガード内で検証するメソッド名は実際の型定義（`SkillCreatorRuntimeApi`・`SessionResumeApi`）と完全に一致させる
- 過剰な検証（全プロパティを検証する）は避け、「呼び出し側が実際に使う必須メソッド」のみを検証する
- `window`への`as unknown as ...`キャストは候補オブジェクト取得の1回のみに限定し、型ガード後は安全な型を使用する
- RALLY-004で整理された型定義（deprecatedフィールド含む）と整合する

## 参照資料

| 資料名                     | パス                                                                 | 用途                 |
| -------------------------- | -------------------------------------------------------------------- | -------------------- |
| テスト仕様書               | `outputs/phase-4/test-specification.md`                              | Phase 4成果物        |
| Red結果                    | `outputs/phase-4/red-test-result.md`                                 | Phase 4成果物        |
| アーキテクチャ設計         | `outputs/phase-2/design-spec.md`                                     | Phase 2成果物        |
| 対象ファイル（呼び出し元） | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 実装対象             |
| 対象ファイル（型定義）     | `apps/desktop/src/preload/skill-creator-api.ts`                      | 型定義確認・修正対象 |

## 成果物

| 成果物           | パス                                        | 説明               |
| ---------------- | ------------------------------------------- | ------------------ |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装内容と差分要約 |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更対象ファイル   |
| 契約差分         | `outputs/phase-5/contract-diff.md`          | 変更前後の差分記録 |

## 完了条件

- [ ] `isSkillCreatorRuntimeApi`型ガード関数が実装されていること
- [ ] `isSessionResumeApi`型ガード関数が実装されていること
- [ ] `getSkillCreatorApi()`が型ガードを使用し、`as`キャストに依存していないこと
- [ ] `getSessionResumeApi()`が型ガードを使用し、`as`キャストに依存していないこと
- [ ] `window.skillCreatorAPI`がundefinedの場合にnullが返ること
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
