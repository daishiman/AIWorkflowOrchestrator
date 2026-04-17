# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 6                       |
| Phase名    | テスト拡充              |
| 対象機能   | TASK-SW-STREAM-001      |
| 前提Phase  | Phase 5: 実装           |
| 次Phase    | Phase 7: カバレッジ確認 |
| ステータス | 未実施                  |
| 作成日     | 2026-04-16              |

## 目的

Phase 4 で作成した基本テストケース（TC-01〜TC-06）に加え、境界条件・コールバック未指定ケース・
呼び出し順序・呼び出し回数の検証テストを追加して網羅性を高める。

## 実行タスク

### Task 1: 境界条件テストの追加

コールバック呼び出しに関する境界条件を洗い出し、追加テストケースを設計する。

**境界条件一覧**:

| 境界条件                                   | 期待動作                                                                                     |
| ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `onProgress` に `undefined` を明示的に渡す | エラーなし、通常通り処理が完了する                                                           |
| `onProgress` 内で例外がスローされる        | 例外が `createSkill()` に伝播する（または保護される）                                        |
| コールバックが合計5回呼び出される          | `planning` → `generating-skill` → `generating-agents` → `validating` → `done` の順で呼ばれる |
| `collaborative` モードでコールバックを渡す | `planning` 〜 `validating` は呼ばれない（`done` のみ呼ばれる、または一切呼ばれない）         |

### Task 2: TASK-SW-STREAM-002 との接続を見越した拡充

`onProgress` のコールバック引数が TASK-SW-STREAM-002 で `sendSkillCreatorProgress` に
渡されることを前提に、コールバック引数の型・フォーマットが正しいことを確認するテストを追加する。

**追加テストケース**:

| TC ID | テストタイトル                                        | 期待結果                                                     |
| ----- | ----------------------------------------------------- | ------------------------------------------------------------ |
| TC-07 | コールバックが計5回呼び出される                       | `onProgress.mock.calls.length === 5`                         |
| TC-08 | コールバックの呼び出し順が planning → done の順である | `calls[0].phase === "planning"`, `calls[4].phase === "done"` |
| TC-09 | 各コールバックの percentage が昇順である              | 10 → 40 → 70 → 90 → 100 の順                                 |
| TC-10 | 各コールバックの message が文字列型である             | `typeof message === "string"`                                |

### Task 3: 回帰テスト追加実行確認

Phase 5 実装後の状態で回帰テストを追加実行し、全て Green であることを確認する。

```bash
# 拡充テスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"

# カバレッジ確認
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --coverage
```

## 参照資料

- `outputs/phase-4/TASK-SW-STREAM-001-test-design.md` — 基本テストケース（TC-01〜TC-06）
- `outputs/phase-5/TASK-SW-STREAM-001-implementation-plan.md` — 実装内容

## 統合テスト連携

- 拡充テストはユニットテストの範囲内で実施する
- TASK-SW-STREAM-002 との統合テストは TASK-SW-STREAM-002 のスコープで行う

## 成果物

| 成果物                                     | パス                                                         |
| ------------------------------------------ | ------------------------------------------------------------ |
| TASK-SW-STREAM-001-extended-test-record.md | `outputs/phase-6/TASK-SW-STREAM-001-extended-test-record.md` |

## 完了条件

- [ ] TC-07〜TC-10 の境界条件・順序検証テストが追加されている
- [ ] 全テストケース（TC-01〜TC-10、TC-R01〜TC-R02）が Green である
- [ ] TASK-SW-STREAM-001-extended-test-record.md に追加テストの記録がある

## タスク100%実行確認【必須】

- [ ] Task 1（境界条件テストの追加）を100%実行した
- [ ] Task 2（TASK-SW-STREAM-002 接続を見越した拡充）を100%実行した
- [ ] Task 3（回帰テスト追加実行確認）を100%実行した
- [ ] 成果物（TASK-SW-STREAM-001-extended-test-record.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
