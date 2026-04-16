# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 3                   |
| Phase名    | 設計レビューゲート  |
| 対象機能   | TASK-SW-STRUCT-001  |
| 前提Phase  | Phase 2: 設計       |
| 次Phase    | Phase 4: テスト作成 |
| ステータス | 未実施              |
| 作成日     | 2026-04-15          |

## 目的

Phase 2 の設計内容を多角的にレビューし、実装前に設計上の問題・矛盾・リスクを検出する。
`StructurePlanJson` インターフェースとの整合性、後続タスク TASK-SW-STRUCT-002 への影響、
`loadAgent` 削除の妥当性を重点的に確認する。

## 実行タスク

### Task 1: 設計整合性チェック（AC 対応確認）

| AC   | 設計での対応                                                                           | 評価 |
| ---- | -------------------------------------------------------------------------------------- | ---- |
| AC-1 | `structurePlan.purpose` に `options.description` を代入する設計が明記されている        | TBD  |
| AC-2 | `structurePlan.agents` に `["extract-purpose", "plan-structure"]` を設定する設計がある | TBD  |
| AC-3 | `structurePlan.features` が空配列で維持されることが設計に明記されている                | TBD  |
| AC-4 | `try/catch` によるフォールバック（null 返却）設計が維持されている                      | TBD  |
| AC-5 | `runCollaborativeWorkflow` への変更がなく、既存テストへの影響なしと確認されている      | TBD  |

### Task 2: TASK-SW-STRUCT-002 との接続設計確認

- TASK-SW-STRUCT-002 は本タスク完了後の `structurePlan` を `generate_skill_md.js` に渡す
- 本タスクで設定する `purpose: options.description` が TASK-SW-STRUCT-002 の接続設計と整合するか確認
- `agents: ["extract-purpose", "plan-structure"]` がエージェント名として正しいか確認

### Task 3: リスク評価

| ID   | リスク                                                           | 影響度 | 対策                                                                  |
| ---- | ---------------------------------------------------------------- | ------ | --------------------------------------------------------------------- |
| R-01 | `loadAgent` 呼び出し削除によりエージェントファイル検証がなくなる | 低     | TASK-SW-STRUCT-002 での接続時に別途検証を追加する（別タスクスコープ） |
| R-02 | `purpose: options.description` が将来の LLM 統合と乖離する       | 低     | コメントに「LLM統合は別タスク」と明記し、技術的負債として管理する     |
| R-03 | `try/catch` が実質的に不要になる（失敗する処理がない）           | 低     | 将来の処理追加に備えて維持する。コメントで意図を明記する              |

### Task 4: simpler alternative 検討

より単純な代替案を検討する。

**代替案**: `runCreateWorkflow` を完全に削除し、呼び出し側でインラインに `StructurePlanJson` を生成する

- メリット: メソッド分割の恩恵が現時点では薄い
- デメリット: TASK-SW-STRUCT-002 の接続設計との整合性が崩れる。将来の LLM 統合時に再分割が必要になる

**判断**: 現設計（メソッドを維持）を採用する。TASK-SW-STRUCT-002 との接続の責務分離が明確なため。

### Task 5: MINOR 追跡テーブル

| MINOR ID  | 指摘内容                                           | 解決予定Phase | 解決確認Phase | 備考                         |
| --------- | -------------------------------------------------- | ------------- | ------------- | ---------------------------- |
| TECH-M-01 | `purpose: options.description` は LLM 統合で変わる | 別タスク      | 別タスク      | LLM統合タスクで対応          |
| TECH-M-02 | `try/catch` が実質 no-op になる                    | Phase 5       | Phase 9/10    | コメントで意図を明記して維持 |

## ゲート判定

**判定**: TBD（実施時に PASS / MINOR / MAJOR を判定する）

Phase 4 開始条件: ゲート判定が PASS または MINOR の場合のみ進行する。
MAJOR 判定の場合は Phase 2 へ差し戻す。

Phase 13 blocked 条件: ユーザー承認がない限り commit / push / PR を実行しない。

## 参照資料

- `outputs/phase-2/design.md` — レビュー対象（設計書）
- `outputs/phase-1/requirements.md` — AC 確認基準

## 統合テスト連携

- IPC 契約の変更がないことを設計レビューで確認する
- TASK-SW-STRUCT-002 との接続の型整合性（`StructurePlanJson` の内容）を確認する

## 成果物

| 成果物    | パス                        |
| --------- | --------------------------- |
| review.md | `outputs/phase-3/review.md` |

## 完了条件

- [ ] 全 AC（AC-1〜AC-5）が設計でカバーされていることを確認した
- [ ] TASK-SW-STRUCT-002 との接続整合性を確認した
- [ ] リスク台帳（R-01〜R-03）が作成されている
- [ ] simpler alternative の検討結果が記録されている
- [ ] MINOR 追跡テーブルが作成されている
- [ ] ゲート判定が下されている

## タスク100%実行確認【必須】

- [ ] Task 1（設計整合性チェック）を100%実行した
- [ ] Task 2（TASK-SW-STRUCT-002 との接続設計確認）を100%実行した
- [ ] Task 3（リスク評価）を100%実行した
- [ ] Task 4（simpler alternative 検討）を100%実行した
- [ ] Task 5（MINOR 追跡テーブル）を100%実行した
- [ ] 成果物（review.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 4: テスト作成](./phase-4-test-creation.md)
