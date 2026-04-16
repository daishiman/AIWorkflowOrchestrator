# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 6                       |
| Phase名    | テスト拡充              |
| 対象機能   | TASK-SW-STRUCT-001      |
| 前提Phase  | Phase 5: 実装           |
| 次Phase    | Phase 7: カバレッジ確認 |
| ステータス | 未実施                  |
| 作成日     | 2026-04-15              |

## 目的

Phase 4 で作成した基本テストケース（TC-01〜TC-04）に加え、境界条件・フォールバック回帰・
エッジケースのテストを追加して網羅性を高める。

## 実行タスク

### Task 1: 境界条件テストの追加

AC-1〜AC-4 の境界条件を洗い出し、追加テストケースを設計する。

**境界条件一覧**:

| 境界条件                                 | 期待動作                                         |
| ---------------------------------------- | ------------------------------------------------ |
| `options.description` が空文字列         | `purpose` が空文字列になる（エラーにならない）   |
| `options.description` が非常に長い文字列 | `purpose` にそのまま設定される                   |
| `options.name` が空文字列                | `skillName` が空文字列になる（エラーにならない） |

### Task 2: TASK-SW-STRUCT-002 との接続を見越した拡充

`structurePlan` の内容が TASK-SW-STRUCT-002 で `generate_skill_md.js` に渡されることを
前提に、`purpose` / `agents` の型・フォーマットが正しいことを確認するテストを追加する。

**追加テストケース**:

| TC ID | テストタイトル                                      | 期待結果                        |
| ----- | --------------------------------------------------- | ------------------------------- |
| TC-05 | description が空文字列でも createSkill() が成功する | 例外なし、`purpose === ""`      |
| TC-06 | agents の要素数が正しい（2件）                      | `agents.length === 2`           |
| TC-07 | agents の各要素が文字列型である                     | `typeof agents[0] === "string"` |
| TC-08 | skillName が options.name と一致する                | `skillName === options.name`    |

### Task 3: 回帰テスト追加実行確認

Phase 5 実装後の状態で回帰テストを追加実行し、全て Green であることを確認する。

```bash
# 拡充テスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"

# カバレッジ確認
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --coverage
```

## 参照資料

- `outputs/phase-4/test-design.md` — 基本テストケース（TC-01〜TC-04）
- `outputs/phase-5/implementation-plan.md` — 実装内容

## 統合テスト連携

- 拡充テストはユニットテストの範囲内で実施する
- TASK-SW-STRUCT-002 との統合テストは TASK-SW-STRUCT-002 のスコープで行う

## 成果物

| 成果物                  | パス                                      |
| ----------------------- | ----------------------------------------- |
| extended-test-record.md | `outputs/phase-6/extended-test-record.md` |

## 完了条件

- [ ] TC-05〜TC-08 の境界条件テストが追加されている
- [ ] 全テストケース（TC-01〜TC-08、TC-R01〜TC-R02）が Green である
- [ ] extended-test-record.md に追加テストの記録がある

## タスク100%実行確認【必須】

- [ ] Task 1（境界条件テストの追加）を100%実行した
- [ ] Task 2（TASK-SW-STRUCT-002 接続を見越した拡充）を100%実行した
- [ ] Task 3（回帰テスト追加実行確認）を100%実行した
- [ ] 成果物（extended-test-record.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
