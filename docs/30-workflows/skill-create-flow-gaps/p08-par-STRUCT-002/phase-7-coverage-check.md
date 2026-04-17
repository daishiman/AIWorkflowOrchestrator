# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 7                         |
| Phase名    | カバレッジ確認            |
| 対象機能   | TASK-SW-STRUCT-002        |
| 前提Phase  | Phase 6: テスト拡充       |
| 次Phase    | Phase 8: リファクタリング |
| ステータス | 未実施                    |
| 作成日     | 2026-04-16                |

## 目的

Phase 6 で追加したテストを含め、`generateSkillMd` の実装箇所に対するカバレッジが
目標基準を満たしていることを確認する。未カバー分岐があれば Phase 6 に戻ってテストを追加する。

## 実行タスク

### Task 1: カバレッジ測定

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService" --coverage
```

### Task 2: AC 対応表確認

| AC   | 対応テスト                        | カバレッジ状態 |
| ---- | --------------------------------- | -------------- |
| AC-1 | TC-01                             | TBD            |
| AC-2 | TC-01, TC-02, TC-11, TC-12        | TBD            |
| AC-3 | TC-03, TC-04, TC-05, TC-09, TC-10 | TBD            |
| AC-4 | TC-R01, TC-R02, TC-R03            | TBD            |
| AC-5 | TC-02, TC-06                      | TBD            |

### Task 3: branch coverage 確認

`generateSkillMd` の主要分岐:

| 分岐                                                         | カバーテスト                 |
| ------------------------------------------------------------ | ---------------------------- |
| `structurePlan` が非 null → `generateSkillMd` 呼び出し       | TC-01〜TC-02, TC-06〜TC-12   |
| `structurePlan` が null かつ create モード → warn + fallback | TC-03                        |
| `structurePlan` が null かつ非 create モード → fallback      | （orchestrate モードで確認） |
| `generate_skill_md.js` 失敗 → `shouldUseFallback = true`     | TC-04, TC-09                 |
| SKILL.md 未生成 → `shouldUseFallback = true`                 | TC-05                        |
| `shouldUseFallback = true` → `ensureSkillMdExists`           | TC-04, TC-05, TC-09          |
| 例外発生 → `ensureSkillMdExists`                             | TC-10                        |
| `normalizedPurpose` が空 → 短縮形 triggerDescription         | TC-06                        |
| `triggers` が空 → `[skillName]` フォールバック               | TC-07                        |
| `anchors` が未定義 → `[]`                                    | TC-08                        |

### Task 4: カバレッジ目標達成確認

| 指標              | 最低基準 | 推奨基準 | 実測値 |
| ----------------- | -------- | -------- | ------ |
| Line Coverage     | 80%      | 90%      | TBD    |
| Branch Coverage   | 60%      | 70%      | TBD    |
| Function Coverage | 80%      | 90%      | TBD    |

目標未達の場合は Phase 6 に戻りテストを追加する。

## 参照資料

- `outputs/phase-6/TASK-SW-STRUCT-002-extended-test-record.md` — テストケース一覧

## 統合テスト連携

- ユニットテストのカバレッジを確認する
- `generate_skill_md.js` スクリプト自体のカバレッジは本タスクのスコープ外

## 成果物

| 成果物                                | パス                                                    |
| ------------------------------------- | ------------------------------------------------------- |
| TASK-SW-STRUCT-002-coverage-report.md | `outputs/phase-7/TASK-SW-STRUCT-002-coverage-report.md` |

## 完了条件

- [ ] カバレッジ測定コマンドを実行した
- [ ] AC 対応表が全件埋まっている
- [ ] branch coverage の主要分岐が全てカバーされている
- [ ] branch coverage が最低基準（60%）以上である
- [ ] 目標未達の場合は Phase 6 へ戻る判断を記録している

## タスク100%実行確認【必須】

- [ ] Task 1（カバレッジ測定）を100%実行した
- [ ] Task 2（AC 対応表確認）を100%実行した
- [ ] Task 3（branch coverage 確認）を100%実行した
- [ ] Task 4（カバレッジ目標達成確認）を100%実行した
- [ ] 成果物（TASK-SW-STRUCT-002-coverage-report.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
