# Phase 6: テスト拡張（エッジケース・回帰ガード）

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 6                                      |
| Phase名    | テスト拡張（エッジケース・回帰ガード） |
| 前提Phase  | Phase 5（実装）                        |
| 後続Phase  | Phase 7（カバレッジ確認）              |
| ステータス | 完了                                   |
| 作成日     | 2026-04-06                             |
| タスクID   | TASK-FIX-IPC-SKILL-NAME-001            |

## 目的

Phase 4で定義したテスト群を実装済みコードへ適用し、Bug 1・Bug 2の回帰と境界値、さらに公開経路の衝突解消までを含む防御的テスト網を完成させる。最小のテスト追加で再発防止を固める。

## 背景・動機

Phase 4で実装したテストは正常系（ハッピーパス）が中心であった。本Phaseでは以下の観点で追加テストを作成する。

- **Bug 1**: ハンドラ登録・解除のライフサイクル境界（二重登録・再登録シナリオ）
- **Bug 2**: `toWizardSkillName()` の変換ロジックが想定外の入力（記号のみ・先頭末尾ハイフン・50文字超え・数字のみ）でも正しく動作すること
- **回帰ガード**: 修正前から動作していた英小文字・数字・ハイフン入力が変換後も変化しないこと

## テスト対象ファイル

| テストファイル                                                              | 対象実装ファイル                                       |
| --------------------------------------------------------------------------- | ------------------------------------------------------ |
| `apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts` | `apps/desktop/src/main/ipc/creatorHandlers.ts`         |
| `apps/desktop/src/main/services/skill/__tests__/SkillService.test.ts`       | `apps/desktop/src/main/services/skill/SkillService.ts` |

---

## Bug 1 回帰ガード: IPCハンドラ重複登録

### テストファイル

`apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts`

### テストケース一覧

| ID         | 観点                                                     | 期待                                                     |
| ---------- | -------------------------------------------------------- | -------------------------------------------------------- |
| `T-IPC-13` | 単独登録時の `skill-creator:get-adapter-status` 登録回数 | `ipcMain.handle()` の登録呼び出しが1回だけであること     |
| `T-IPC-14` | 解除後の再登録                                           | `unregister` 後に再登録でき、登録回数が累計2回になること |

> 旧仕様の「2回目で例外が投げられる」ケースは削除済み。現在は重複ブロックがないため、回帰ガードは call-count ベースで確認する。

---

## Bug 2 境界値テスト: `toWizardSkillName()` と公開経路の一意化

### テストファイル

`apps/desktop/src/main/services/skill/__tests__/SkillService.test.ts`

### テストケース一覧

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

> `SS-TWSN-04/09/11` は既存形状の維持、`SS-TWSN-01/05/10` は `new-skill` フォールバック、`SS-CSW-01` は公開経路での一意化をそれぞれ担う。

---

## テスト実行コマンド

```bash
# Bug 1 テスト（creatorHandlers）のみ実行
pnpm --filter @repo/desktop test:run -- src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts

# Bug 2 テスト（SkillService）のみ実行
pnpm --filter @repo/desktop test:run -- src/main/services/skill/__tests__/SkillService.test.ts

# 両方まとめて実行
pnpm --filter @repo/desktop test:run -- src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts src/main/services/skill/__tests__/SkillService.test.ts

# ウォッチモードで開発しながら実行
pnpm --filter @repo/desktop test:watch -- src/main/services/skill/__tests__/SkillService.test.ts
```

---

## 完了基準（Phase 6 ゲート）

| 確認項目                                | 基準                   |
| --------------------------------------- | ---------------------- |
| T-IPC-13〜14 が全て PASS                | Bug 1 回帰ガード完了   |
| SS-TWSN-01〜11 が全て PASS              | Bug 2 境界値テスト完了 |
| SS-CSW-01 が PASS                       | 公開経路の一意化完了   |
| 既存テスト（Phase 4 分）が引き続き PASS | 回帰なし確認           |

全項目 PASS でPhase 7（カバレッジ確認）に進む。

## 成果物

- `apps/desktop/src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts` への追記（T-IPC-13〜14）
- `apps/desktop/src/main/services/skill/__tests__/SkillService.test.ts` への追記（SS-TWSN-01〜11、SS-CSW-01）
