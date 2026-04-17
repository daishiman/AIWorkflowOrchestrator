# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 6                       |
| Phase名    | テスト拡充              |
| 対象機能   | TASK-SW-CANCEL-001      |
| 前提Phase  | Phase 5: 実装           |
| 次Phase    | Phase 7: カバレッジ確認 |
| ステータス | 未実施                  |
| 作成日     | 2026-04-16              |

## 目的

Phase 4 で作成した基本テストケース（TC-01〜TC-02）に加え、
型安全性・チャンネル値の重複なし・後続タスクとの接続を見越したテストを追加して網羅性を高める。

## 実行タスク

### Task 1: 境界条件テストの追加

AC-1〜AC-4 の境界条件を洗い出し、追加テストケースを設計する。

**境界条件一覧**:

| 境界条件                                                    | 期待動作                                                             |
| ----------------------------------------------------------- | -------------------------------------------------------------------- |
| `SKILL_CREATOR_CANCEL` の値が他のチャンネル値と重複しない   | 全チャンネル値の中で `"skill-creator:cancel"` がユニークである       |
| `SKILL_CREATOR_RUNTIME_CHANNELS` のキー数が1増加している    | 追加前の3件から4件になっている                                       |
| `IPC_CHANNELS` の型に `SKILL_CREATOR_CANCEL` が含まれている | TypeScript 型レベルで `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が参照可能 |

### Task 2: TASK-SW-CANCEL-002 との接続を見越した拡充

`IPC_CHANNELS.SKILL_CREATOR_CANCEL` が後続タスクで `safeInvoke` の引数として使用されることを
前提に、値の型・フォーマットが正しいことを確認するテストを追加する。

**追加テストケース**:

| TC ID | テストタイトル                                                    | 期待結果                                                    |
| ----- | ----------------------------------------------------------------- | ----------------------------------------------------------- |
| TC-03 | SKILL_CREATOR_CANCEL の値が "skill-creator:" プレフィックスを持つ | `SKILL_CREATOR_CANCEL.startsWith("skill-creator:")` が true |
| TC-04 | SKILL_CREATOR_RUNTIME_CHANNELS のチャンネル数が4件である          | `Object.keys(SKILL_CREATOR_RUNTIME_CHANNELS).length === 4`  |
| TC-05 | SKILL_CREATOR_CANCEL の値が他の全チャンネル値とユニークである     | 全 IPC_CHANNELS の values に重複がない                      |

### Task 3: 回帰テスト追加実行確認

Phase 5 実装後の状態で回帰テストを追加実行し、全て Green であることを確認する。

```bash
# 拡充テスト実行
pnpm --filter @repo/shared test -- --testPathPattern="channels"

# カバレッジ確認
pnpm --filter @repo/shared test -- --testPathPattern="channels" --coverage
```

## 参照資料

- `outputs/phase-4/TASK-SW-CANCEL-001-test-design.md` — 基本テストケース（TC-01〜TC-02）
- `outputs/phase-5/TASK-SW-CANCEL-001-implementation-plan.md` — 実装内容

## 統合テスト連携

- 拡充テストはユニットテストの範囲内で実施する
- TASK-SW-CANCEL-002 との統合テストは TASK-SW-CANCEL-002 のスコープで行う

## 成果物

| 成果物                                     | パス                                                         |
| ------------------------------------------ | ------------------------------------------------------------ |
| TASK-SW-CANCEL-001-extended-test-record.md | `outputs/phase-6/TASK-SW-CANCEL-001-extended-test-record.md` |

## 完了条件

- [ ] TC-03〜TC-05 の境界条件テストが追加されている
- [ ] 全テストケース（TC-01〜TC-05、TC-R01〜TC-R02）が Green である
- [ ] TASK-SW-CANCEL-001-extended-test-record.md に追加テストの記録がある

## タスク100%実行確認【必須】

- [ ] Task 1（境界条件テストの追加）を100%実行した
- [ ] Task 2（TASK-SW-CANCEL-002 接続を見越した拡充）を100%実行した
- [ ] Task 3（回帰テスト追加実行確認）を100%実行した
- [ ] 成果物（TASK-SW-CANCEL-001-extended-test-record.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
