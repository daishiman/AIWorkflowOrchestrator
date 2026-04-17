# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 3                   |
| Phase名    | 設計レビューゲート  |
| 対象機能   | TASK-SW-CANCEL-001  |
| 前提Phase  | Phase 2: 設計       |
| 次Phase    | Phase 4: テスト作成 |
| ステータス | 未実施              |
| 作成日     | 2026-04-16          |

## 目的

Phase 2 の設計内容を多角的にレビューし、実装前に設計上の問題・矛盾・リスクを検出する。
チャンネル値の命名規則への適合性、Preload 側スプレッドによる自動有効化の妥当性、
後続タスク TASK-SW-CANCEL-002 への影響を重点的に確認する。

## 実行タスク

### Task 1: 設計整合性チェック（AC 対応確認）

| AC   | 設計での対応                                                                                                      | 評価 |
| ---- | ----------------------------------------------------------------------------------------------------------------- | ---- |
| AC-1 | `SKILL_CREATOR_CANCEL: "skill-creator:cancel"` を `SKILL_CREATOR_RUNTIME_CHANNELS` に追加する設計が明記されている | TBD  |
| AC-2 | Preload 側スプレッドによる自動有効化の確認が設計に明記されている                                                  | TBD  |
| AC-3 | TypeScript の `as const` アサーションにより型安全性が保たれることが確認されている                                 | TBD  |
| AC-4 | 既存チャンネルへの変更がなく、既存テストへの影響なしと確認されている                                              | TBD  |

### Task 2: TASK-SW-CANCEL-002 との接続設計確認

- TASK-SW-CANCEL-002 は本タスク完了後の `IPC_CHANNELS.SKILL_CREATOR_CANCEL` を使用して
  Preload API に `cancelGeneration` メソッドを追加する
- 本タスクで定義する `"skill-creator:cancel"` の値が TASK-SW-CANCEL-002 の設計と整合するか確認
- `SKILL_CREATOR_CANCEL` が `IPC_CHANNELS` に含まれる（スプレッドによる自動包含）ことを確認

### Task 3: リスク評価

| ID   | リスク                                                                                | 影響度 | 対策                                                                        |
| ---- | ------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------- |
| R-01 | チャンネル値 `"skill-creator:cancel"` が既存チャンネルと重複する可能性                | 低     | `channels.ts` の全チャンネル値を確認して重複がないことを検証する            |
| R-02 | `SKILL_CREATOR_RUNTIME_CHANNELS` への追加が他のスプレッド箇所に予期しない影響を与える | 低     | `channels.ts` の `IPC_CHANNELS` スプレッド構造を確認する                    |
| R-03 | 後続タスクなしでチャンネルが定義されると未使用警告が発生する可能性                    | 低     | TypeScript の型チェックのみで検証し、未使用でも型エラーにならないことを確認 |

### Task 4: simpler alternative 検討

より単純な代替案を検討する。

**代替案**: `SKILL_CREATOR_RUNTIME_CHANNELS` に追加せず、単独の定数として定義する

- メリット: RUNTIME チャンネルグループの意図（runtime系）との不一致が生じない場合
- デメリット: Preload 側スプレッドで自動有効化されず、別途 `apps/desktop/src/preload/channels.ts` の
  変更が必要になる。後続タスクの工数が増える

**判断**: 現設計（`SKILL_CREATOR_RUNTIME_CHANNELS` に追加）を採用する。
キャンセルはランタイム中に発生する操作であり、`SKILL_CREATOR_RUNTIME_CHANNELS` への追加が意味的に正しい。
また Preload 側スプレッドによる自動有効化が本タスクの AC-2 を満たすために必要。

### Task 5: MINOR 追跡テーブル

| MINOR ID  | 指摘内容                                              | 解決予定Phase | 解決確認Phase | 備考                      |
| --------- | ----------------------------------------------------- | ------------- | ------------- | ------------------------- |
| TECH-M-01 | `SKILL_CREATOR_CANCEL` チャンネルのハンドラーが未実装 | 別タスク      | 別タスク      | TASK-SW-CANCEL-003 で対応 |
| TECH-M-02 | Preload API の `cancelGeneration` メソッドが未実装    | 別タスク      | 別タスク      | TASK-SW-CANCEL-002 で対応 |

## ゲート判定

**判定**: TBD（実施時に PASS / MINOR / MAJOR を判定する）

Phase 4 開始条件: ゲート判定が PASS または MINOR の場合のみ進行する。
MAJOR 判定の場合は Phase 2 へ差し戻す。

Phase 13 blocked 条件: ユーザー承認がない限り commit / push / PR を実行しない。

## 参照資料

- `outputs/phase-2/TASK-SW-CANCEL-001-design.md` — レビュー対象（設計書）
- `outputs/phase-1/TASK-SW-CANCEL-001-requirements.md` — AC 確認基準

## 統合テスト連携

- 既存 IPC 契約への破壊的変更がないことを設計レビューで確認する
- TASK-SW-CANCEL-002 との接続の型整合性（`IPC_CHANNELS.SKILL_CREATOR_CANCEL` の存在）を確認する

## 成果物

| 成果物                       | パス                                           |
| ---------------------------- | ---------------------------------------------- |
| TASK-SW-CANCEL-001-review.md | `outputs/phase-3/TASK-SW-CANCEL-001-review.md` |

## 完了条件

- [ ] 全 AC（AC-1〜AC-4）が設計でカバーされていることを確認した
- [ ] TASK-SW-CANCEL-002 との接続整合性を確認した
- [ ] リスク台帳（R-01〜R-03）が作成されている
- [ ] simpler alternative の検討結果が記録されている
- [ ] MINOR 追跡テーブルが作成されている
- [ ] ゲート判定が下されている

## タスク100%実行確認【必須】

- [ ] Task 1（設計整合性チェック）を100%実行した
- [ ] Task 2（TASK-SW-CANCEL-002 との接続設計確認）を100%実行した
- [ ] Task 3（リスク評価）を100%実行した
- [ ] Task 4（simpler alternative 検討）を100%実行した
- [ ] Task 5（MINOR 追跡テーブル）を100%実行した
- [ ] 成果物（TASK-SW-CANCEL-001-review.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 4: テスト作成](./phase-4-test-creation.md)
