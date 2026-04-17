# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 4                           |
| Phase名    | テスト作成                  |
| 対象機能   | TASK-SW-TODO-001            |
| 前提Phase  | Phase 3: 設計レビューゲート |
| 次Phase    | Phase 5: 実装               |
| ステータス | 未実施                      |
| 作成日     | 2026-04-16                  |

## 目的

本タスクはコメント整理（極小規模）のため、新規テストケースの必要性は低い。
ただし `shouldShowMainToolBadge` の動作が変わらないことを確認するため、
既存テストの有無を調査し、必要に応じてテストケースを設計する。

## 実行タスク

### Task 1: 既存テストの調査

`ConversationRoundStep.tsx` に関連するテストファイルを確認する。

```bash
# テストファイルの確認
find apps/desktop/src/renderer/components/skill/wizard -name "*.test.*" -o -name "*.spec.*"
```

確認項目:

- `shouldShowMainToolBadge` のテストケースが既存テストに存在するか
- `MAIN_TOOL_BADGE_ENABLED` の利用テストが存在するか
- コメント整理後も既存テストが Green を維持できるか

### Task 2: テストケース設計（必要な場合）

既存テストが `shouldShowMainToolBadge` を検証していない場合、以下のテストケースを設計する。

| TC ID | 対応AC | テストタイトル                                                      | 期待結果                            |
| ----- | ------ | ------------------------------------------------------------------- | ----------------------------------- |
| TC-01 | AC-3   | `shouldShowMainToolBadge` がバッジを表示する条件で true を返す      | `shouldShowMainToolBadge === true`  |
| TC-02 | AC-3   | `shouldShowMainToolBadge` がバッジを非表示にする条件で false を返す | `shouldShowMainToolBadge === false` |

**注意**: コメント整理のみの場合、テストの新規作成は必須ではない。
`MAIN_TOOL_BADGE_ENABLED` フラグを削除する場合（オプション A-1）は、
フラグ参照が正しく置き換えられたことを確認するテストを追加する。

### Task 3: 回帰テスト計画（AC-3）

- 既存の `ConversationRoundStep` 関連テストが全てパスすることを確認する
- コメント整理・フラグ変更後もUIの動作が変わらないことを確認する

```bash
# 既存テスト確認
pnpm --filter @repo/desktop test -- --testPathPattern="ConversationRoundStep"
```

## テストケース一覧

### 新規テストケース（必要な場合のみ）

| TC ID | 対応AC | テストタイトル                                   | 期待結果                            |
| ----- | ------ | ------------------------------------------------ | ----------------------------------- |
| TC-01 | AC-3   | `shouldShowMainToolBadge` が正しい値を返す       | バッジ表示条件に応じた true / false |
| TC-02 | AC-4   | `MAIN_TOOL_BADGE_ENABLED` 変更後に型エラーがない | typecheck 0 エラー                  |

### 回帰テストケース

| TC ID  | 対応AC | テストタイトル                                     | 期待結果       |
| ------ | ------ | -------------------------------------------------- | -------------- |
| TC-R01 | AC-3   | `ConversationRoundStep` の既存テストが全て通過する | 既存動作と同一 |

## TDD 確認コマンド

```bash
# 既存テスト確認（コメント整理前に Green であることを確認）
pnpm --filter @repo/desktop test -- --testPathPattern="ConversationRoundStep"

# 実装後の回帰確認
pnpm --filter @repo/desktop test -- --testPathPattern="ConversationRoundStep"
```

## 参照資料

- `outputs/phase-2/TASK-SW-TODO-001-design.md` — 設計書（テスト観測点）
- `outputs/phase-1/TASK-SW-TODO-001-requirements.md` — 受入条件（AC-1〜AC-4）

## 統合テスト連携

- 本タスクはコメント整理であり、外部インターフェースの変更はない
- ユニットテストで `shouldShowMainToolBadge` の動作を確認する

## 成果物

| 成果物                          | パス                                              |
| ------------------------------- | ------------------------------------------------- |
| TASK-SW-TODO-001-test-design.md | `outputs/phase-4/TASK-SW-TODO-001-test-design.md` |

## 完了条件

- [ ] 既存テストの有無が調査されている
- [ ] テストケース（TC-01〜TC-02）の必要性が判断されている
- [ ] 回帰テスト計画（TC-R01）が完了している
- [ ] TDD 確認コマンドが明記されている

## タスク100%実行確認【必須】

- [ ] Task 1（既存テストの調査）を100%実行した
- [ ] Task 2（テストケース設計）を100%実行した
- [ ] Task 3（回帰テスト計画）を100%実行した
- [ ] 成果物（TASK-SW-TODO-001-test-design.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 5: 実装](./phase-5-implementation.md)
