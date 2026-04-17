# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 8                       |
| Phase名    | リファクタリング        |
| 対象機能   | TASK-SW-STRUCT-002      |
| 前提Phase  | Phase 7: カバレッジ確認 |
| 次Phase    | Phase 9: 品質保証       |
| ステータス | 未実施                  |
| 作成日     | 2026-04-16              |

## 目的

Phase 5 で実装した `generateSkillMd` と SKILL.md 生成フロー変更コードを、
最小複雑性・可読性・将来の LLM 統合への準備という観点で再調整する。
テストが全て Green であることを維持しながらコードを整理する。

## 実行タスク

### Task 1: コード品質チェック

実装コードを以下の観点で確認する。

| 観点                       | チェック内容                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| 命名の明確性               | `generateSkillMd` / `shouldUseFallback` / `fallbackReason` の命名が意図を正確に表しているか |
| フォールバックフラグの整理 | `shouldUseFallback` フラグのスコープと初期化が適切か                                        |
| コメントの適切性           | 「AC-3: null フォールバック」「non-fatal」等のコメントが適切な位置にあるか                  |
| `logger` の意図            | console.error/warn の使い分けが適切か（warn: 予期される分岐、error: 予期しない失敗）        |
| tmp ファイル管理           | `finally` での cleanup が適切に実装されているか                                             |

### Task 2: 命名と構造の整理

`generateSkillMd` の実装後コードを確認し、以下を整理する。

- `normalizedPurpose` の正規化処理が `triggerDescription` 生成の前に配置されているか
- `triggerKeywords` のフォールバック（`structurePlan.triggers?.length` チェック）が明確か
- `shouldUseFallback` フラグの2段階チェック（実行失敗 / ファイル未生成）の流れが読みやすいか
- `fallbackReason` / `fallbackMeta` の条件分岐が冗長でないか

### Task 3: リファクタリング後のテスト全件確認

```bash
# 全テスト Green 確認
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreatorService"
```

リファクタリング後も全テストが Green であることを確認する。

### Task 4: 技術的負債の記録

| 負債ID | 内容                                                                     | 対応タスク                 |
| ------ | ------------------------------------------------------------------------ | -------------------------- | ---------------------- | ---------------------- |
| TD-001 | `logger` は console.error/warn の最小実装であり本番品質ではない          | 将来の Logger 統合タスク   |
| TD-002 | `purpose` → `triggerDescription` 変換は LLM 統合で変わる可能性           | LLM統合タスク（別）        |
| TD-003 | `generate_skill_md.js` の引数仕様変更時に `generateSkillMd` の更新が必要 | スクリプト変更タスク（別） |
| TD-004 | `anchors` の型が `Anchor[]` になったが `plan` への変換は `               |                            | []` で簡略化されている | 型安全強化タスク（別） |

## 参照資料

- `outputs/phase-7/TASK-SW-STRUCT-002-coverage-report.md` — カバレッジ確認結果
- `outputs/phase-5/TASK-SW-STRUCT-002-implementation-plan.md` — 実装内容

## 統合テスト連携

- リファクタリング後も `createSkill()` の外部契約が変わらないことを確認する

## 成果物

| 成果物                                   | パス                                                       |
| ---------------------------------------- | ---------------------------------------------------------- |
| TASK-SW-STRUCT-002-refactoring-record.md | `outputs/phase-8/TASK-SW-STRUCT-002-refactoring-record.md` |

## 完了条件

- [ ] コード品質チェック（Task 1）が完了している
- [ ] 命名と構造の整理（Task 2）が完了している
- [ ] リファクタリング後の全テストが Green である
- [ ] 技術的負債が記録されている

## タスク100%実行確認【必須】

- [ ] Task 1（コード品質チェック）を100%実行した
- [ ] Task 2（命名と構造の整理）を100%実行した
- [ ] Task 3（リファクタリング後のテスト全件確認）を100%実行した
- [ ] Task 4（技術的負債の記録）を100%実行した
- [ ] 成果物（TASK-SW-STRUCT-002-refactoring-record.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 9: 品質保証](./phase-9-quality-assurance.md)
