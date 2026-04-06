# Phase 4: テスト作成（回帰・境界テスト設計）

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 4                           |
| Phase名    | テスト作成                  |
| 前提Phase  | Phase 3（設計レビュー）     |
| 後続Phase  | Phase 5（実装）             |
| ステータス | 完了                        |
| 作成日     | 2026-04-06                  |
| タスクID   | TASK-FIX-IPC-SKILL-NAME-001 |

---

## 目的

Bug 1 の回帰ガードと Bug 2 の境界値テストを設計し、実装済みコードに対しても同じ観点で再利用できる形に整える。Bug 1 は `creatorHandlers` の登録回数、Bug 2 は `toWizardSkillName()` と公開経路の一意化を押さえる。

---

## Bug 1 回帰テスト仕様

### 対象ファイル

`apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts`

### 追加するテストケース

| ID         | 観点                                                     | 期待                                                     |
| ---------- | -------------------------------------------------------- | -------------------------------------------------------- |
| `T-IPC-13` | 単独登録時の `skill-creator:get-adapter-status` 登録回数 | `ipcMain.handle()` の登録呼び出しが1回だけであること     |
| `T-IPC-14` | 解除後の再登録                                           | `unregister` 後に再登録でき、登録回数が累計2回になること |

> 旧仕様の「2回目で例外が投げられる」ケースは採用しない。現在は重複ブロックが削除されているため、call-count ベースの回帰ガードに置き換える。

### 検証対象の16チャンネル

| #   | IPC_CHANNELS 定数名                      | チャンネル文字列                         |
| --- | ---------------------------------------- | ---------------------------------------- |
| 1   | `SKILL_CREATOR_PLAN`                     | `skill-creator:plan`                     |
| 2   | `SKILL_CREATOR_GET_ADAPTER_STATUS`       | `skill-creator:get-adapter-status`       |
| 3   | `SKILL_CREATOR_EXECUTE_PLAN`             | `skill-creator:execute-plan`             |
| 4   | `SKILL_CREATOR_GET_WORKFLOW_STATE`       | `skill-creator:get-workflow-state`       |
| 5   | `SKILL_CREATOR_SUBMIT_USER_INPUT`        | `skill-creator:submit-user-input`        |
| 6   | `SKILL_CREATOR_IMPROVE_SKILL`            | `skill-creator:improve-skill`            |
| 7   | `SKILL_CREATOR_APPLY_IMPROVEMENT`        | `skill-creator:apply-improvement`        |
| 8   | `SKILL_CREATOR_GET_VERIFY_DETAIL`        | `skill-creator:get-verify-detail`        |
| 9   | `SKILL_CREATOR_REVERIFY_WORKFLOW`        | `skill-creator:reverify-workflow`        |
| 10  | `SKILL_CREATOR_NORMALIZE_SDK_MESSAGES`   | `skill-creator:normalize-sdk-messages`   |
| 11  | `SKILL_CREATOR_LIST_SESSIONS`            | `skill-creator:list-sessions`            |
| 12  | `SKILL_CREATOR_GET_SESSION_DETAIL`       | `skill-creator:get-session-detail`       |
| 13  | `SKILL_CREATOR_RESUME_SESSION`           | `skill-creator:resume-session`           |
| 14  | `SKILL_CREATOR_DELETE_SESSION`           | `skill-creator:delete-session`           |
| 15  | `SKILL_CREATOR_CLEANUP_EXPIRED_SESSIONS` | `skill-creator:cleanup-expired-sessions` |
| 16  | `SKILL_CREATOR_GET_GOVERNANCE_STATE`     | `skill-creator:get-governance-state`     |

> この一覧は `registerRuntimeSkillCreatorHandlers()` が最終的に登録すべき 16 個のチャンネルの検証対象一覧。

---

## Bug 2 境界値テスト仕様

### 対象ファイル

`apps/desktop/src/main/services/skill/__tests__/SkillService.test.ts`

### 追加するテストケース

| ID           | 入力/条件                              | 期待結果                                   | 備考                                     |
| ------------ | -------------------------------------- | ------------------------------------------ | ---------------------------------------- |
| `SS-TWSN-01` | 日本語入力 `マイスキル`                | `new-skill`                                | フォールバック確認                       |
| `SS-TWSN-02` | 大文字混在 `My Skill`                  | `my-skill`                                 | 小文字化確認                             |
| `SS-TWSN-03` | アンダースコア `my_skill`              | `my-skill`                                 | 記号置換確認                             |
| `SS-TWSN-04` | 既存スキル `test-skill`                | `test-skill`                               | 後方互換確認                             |
| `SS-TWSN-05` | 空文字 `""`                            | `new-skill`                                | 空入力フォールバック                     |
| `SS-TWSN-06` | 先頭ハイフン `-skill`                  | `skill`                                    | 先頭除去                                 |
| `SS-TWSN-07` | 末尾ハイフン `skill-`                  | `skill`                                    | 末尾除去                                 |
| `SS-TWSN-08` | 52文字入力 `a`.repeat(52)              | 先頭50文字                                 | 長さ制限                                 |
| `SS-TWSN-09` | 数字のみ `123`                         | `123`                                      | 数字許可                                 |
| `SS-TWSN-10` | 特殊文字のみ `!!!`                     | `new-skill`                                | 空文字帰着                               |
| `SS-TWSN-11` | 混在入力 `My_テスト-Skill123`          | `my-skill123`                              | 統合正規化                               |
| `SS-CSW-01`  | `new-skill` が既に存在する公開作成経路 | `new-skill-2` を採用し、作成パスも一致する | `createSkillFromWizard()` の衝突解消確認 |

> `SS-TWSN-04/09/11` は後方互換の確認、`SS-TWSN-01/05/10` は `new-skill` フォールバック確認、`SS-CSW-01` は公開経路での一意化確認。

---

## 確認手順

```bash
# Bug 1 テスト
pnpm --filter @repo/desktop test:run -- src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts

# Bug 2 テスト
pnpm --filter @repo/desktop test:run -- src/main/services/skill/__tests__/SkillService.test.ts

# まとめて実行
pnpm --filter @repo/desktop test:run -- src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts src/main/services/skill/__tests__/SkillService.test.ts
```

## フェーズゲート条件

- [ ] `T-IPC-13` と `T-IPC-14` が全て PASS
- [ ] `SS-TWSN-01〜11` と `SS-CSW-01` が全て PASS
- [ ] 既存テスト（`T-IPC-01〜12`, `SS-SAS-01〜`, `SS-CC-01〜03` 等）が引き続き PASS

上記確認後、Phase 5（実装）に進む。
