# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 3                   |
| Phase名    | 設計レビューゲート  |
| 対象機能   | TASK-SW-CANCEL-002  |
| 前提Phase  | Phase 2: 設計       |
| 次Phase    | Phase 4: テスト作成 |
| ステータス | 未実施              |
| 作成日     | 2026-04-16          |

## 目的

Phase 2 の設計内容を多角的にレビューし、実装前に設計上の問題・矛盾・リスクを検出する。
`SkillCreatorAPI` インターフェースへの追加、`ALLOWED_INVOKE_CHANNELS` 追加、
IPC 4層整合性の整合性を重点的に確認する。

## 実行タスク

### Task 1: 設計整合性チェック（AC 対応確認）

| AC   | 設計での対応                                                                                                 | 評価 |
| ---- | ------------------------------------------------------------------------------------------------------------ | ---- |
| AC-1 | `SkillCreatorAPI` インターフェースに `cancelGeneration: () => Promise<IpcResult<void>>` を追加する設計がある | TBD  |
| AC-2 | 実装に `safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL)` を使用する設計が明記されている                        | TBD  |
| AC-3 | `ALLOWED_INVOKE_CHANNELS` に `SKILL_CREATOR_CANCEL` を追加する設計が明記されている                           | TBD  |
| AC-4 | `types.ts` への型自動伝播により型エラーなく呼び出せることが設計で確認されている                              | TBD  |
| AC-5 | 既存メソッドへの変更がなく、既存テストへの影響なしと確認されている                                           | TBD  |

### Task 2: TASK-SW-CANCEL-001 依存関係確認

- TASK-SW-CANCEL-001 で `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が定義されていることを確認
- TASK-SW-CANCEL-001 で Main プロセス側のハンドラーが実装されていることを確認
- 本タスクの設計が TASK-SW-CANCEL-001 の完了を前提としていることを明記しているか確認

### Task 3: リスク評価

| ID   | リスク                                                                     | 影響度 | 対策                                                                   |
| ---- | -------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------- |
| R-01 | `ALLOWED_INVOKE_CHANNELS` への追加漏れによる実行時セキュリティエラー       | 高     | Phase 4 のテストで `safeInvoke` 経由の呼び出しが成功することを確認する |
| R-02 | `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が CANCEL-001 で未定義の場合の型エラー | 中     | Step 0（P50チェック）で CANCEL-001 の実装を確認してから実装に進む      |
| R-03 | 既存 Preload API テストとのインターフェース不整合                          | 低     | インターフェースへの追加のみで既存メソッドを変更しないため影響なし     |

### Task 4: simpler alternative 検討

より単純な代替案を検討する。

**代替案**: `cancelGeneration` ではなく `cancel` という短縮名を使用する

- メリット: 記述が短い
- デメリット: Main 側の IPC チャンネル名（`SKILL_CREATOR_CANCEL`）および他の Preload メソッド命名規則（動詞+目的語形式）との一貫性が失われる

**判断**: `cancelGeneration` を採用する。動詞+目的語形式で他のメソッド（`generateSkill` 等）と一貫性がある。

### Task 5: MINOR 追跡テーブル

| MINOR ID  | 指摘内容                                                                             | 解決予定Phase | 解決確認Phase | 備考                         |
| --------- | ------------------------------------------------------------------------------------ | ------------- | ------------- | ---------------------------- |
| TECH-M-01 | `cancelGeneration` の戻り値 `IpcResult<void>` のエラーハンドリングはRenderer側の責務 | 別タスク      | 別タスク      | Renderer UI 実装タスクで対応 |
| TECH-M-02 | キャンセル後の状態管理（生成中フラグのリセット等）は Renderer 側の責務               | 別タスク      | 別タスク      | UI 実装タスクで対応          |

## ゲート判定

**判定**: TBD（実施時に PASS / MINOR / MAJOR を判定する）

Phase 4 開始条件: ゲート判定が PASS または MINOR の場合のみ進行する。
MAJOR 判定の場合は Phase 2 へ差し戻す。

Phase 13 blocked 条件: ユーザー承認がない限り commit / push / PR を実行しない。

## 参照資料

- `outputs/phase-2/TASK-SW-CANCEL-002-design.md` — レビュー対象（設計書）
- `outputs/phase-1/TASK-SW-CANCEL-002-requirements.md` — AC 確認基準

## 統合テスト連携

- IPC 4層整合性（Renderer → Preload → Main IPC → Main Service）が設計で確認されていることを確認する
- `ALLOWED_INVOKE_CHANNELS` への追加が `safeInvoke` のセキュリティチェックを通過させることを確認する

## 成果物

| 成果物                       | パス                                           |
| ---------------------------- | ---------------------------------------------- |
| TASK-SW-CANCEL-002-review.md | `outputs/phase-3/TASK-SW-CANCEL-002-review.md` |

## 完了条件

- [ ] 全 AC（AC-1〜AC-5）が設計でカバーされていることを確認した
- [ ] TASK-SW-CANCEL-001 との依存関係を確認した
- [ ] リスク台帳（R-01〜R-03）が作成されている
- [ ] simpler alternative の検討結果が記録されている
- [ ] MINOR 追跡テーブルが作成されている
- [ ] ゲート判定が下されている

## タスク100%実行確認【必須】

- [ ] Task 1（設計整合性チェック）を100%実行した
- [ ] Task 2（TASK-SW-CANCEL-001 依存関係確認）を100%実行した
- [ ] Task 3（リスク評価）を100%実行した
- [ ] Task 4（simpler alternative 検討）を100%実行した
- [ ] Task 5（MINOR 追跡テーブル）を100%実行した
- [ ] 成果物（TASK-SW-CANCEL-002-review.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 4: テスト作成](./phase-4-test-creation.md)
