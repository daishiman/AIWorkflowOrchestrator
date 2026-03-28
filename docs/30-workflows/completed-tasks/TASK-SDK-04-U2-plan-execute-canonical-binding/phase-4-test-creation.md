# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 4                                             |
| Phase名    | テスト作成                                    |
| 対象機能   | TASK-SDK-04-U2-plan-execute-canonical-binding |
| 前提Phase  | Phase 3: 設計レビュー                         |
| 次Phase    | Phase 5: 実装                                 |
| ステータス | completed                                     |
| 作成日     | 2026-03-27                                    |

## 目的

drift 再発を検出する renderer test を先に定義し、approved snapshot と draft input の差を可視化する。

## 実行タスク

### Task 1: 正常系テスト

- plan review 完了後、approved snapshot が execute に渡る
- textarea 編集後も execute payload が変わらない

### Task 2: 失敗系テスト

- approved snapshot がなければ execute しない
- cancel で snapshot がクリアされる

### Task 3: 回帰テスト

- plan を使わない既存 execute flow を維持する
- terminal handoff 系の既存 expectation を壊さない

## 参照資料

| 資料名       | パス                                                                                               | 説明                     |
| ------------ | -------------------------------------------------------------------------------------------------- | ------------------------ |
| 設計レビュー | `phase-3-design-review.md`                                                                         | gate 結果                |
| 設計成果物   | `outputs/phase-2/design-document.md`                                                               | state ownership と観測点 |
| 既存テスト   | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | 追加先                   |

## 統合テスト連携

- Phase 10 の最終レビューで AC-1〜AC-5 との対応表を再利用する
- review -> edit -> execute の一連フローを 1 ケースにまとめる

## 成果物

| 成果物       | パス                                     | 説明             |
| ------------ | ---------------------------------------- | ---------------- |
| テスト仕様書 | `outputs/phase-4/test-specifications.md` | テストケース一覧 |

## 完了条件

- [ ] drift 再発ケースが定義されている
- [ ] cancel / 回帰ケースが定義されている
- [ ] AC-1〜AC-5 とテストが対応している
- [ ] 実装前に fail-first 観点が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
