# Phase 8 成果物: リファクタリング計画

## 概要

Phase 5 のクリーンアップで実施済みの内容を整理し、残存リスクと保守性向上の状態を記録する。

## 実施済みリファクタリング（Phase 5 完了分）

### SubAgent-A: describe.skip 除去・import 整理

| 項目                     | 状態    | 詳細                                                 |
| ------------------------ | ------- | ---------------------------------------------------- |
| `describe.skip` 11件削除 | ✅ 完了 | U-1/U-2/U-4/U-6/U-8b/U-10/U-11/U-12/U-18b/U-19b/U-21 |
| `describe.skip` 1件昇格  | ✅ 完了 | U-20b を `describe` に昇格                           |
| import 文への影響        | なし    | 廃止 API モックは宣言のみで import 変更不要          |

### SubAgent-B: 廃止済み API 依存モック除去

| 項目                                         | 状態    | 詳細                      |
| -------------------------------------------- | ------- | ------------------------- |
| `const mockDetectMode = vi.fn();`            | ✅ 削除 | アクティブテストで未使用  |
| `const mockPlanSkill = vi.fn();`             | ✅ 削除 | アクティブテストで未使用  |
| `detectMode: mockDetectMode,` in beforeEach  | ✅ 削除 | window.skillCreatorAPI 内 |
| `planSkill: mockPlanSkill,` in beforeEach    | ✅ 削除 | window.skillCreatorAPI 内 |
| `mockDetectMode.mockResolvedValue(...)` 1行  | ✅ 削除 | beforeEach 内             |
| `mockPlanSkill.mockResolvedValue({...})` 9行 | ✅ 削除 | beforeEach 内             |

### SubAgent-C: TypeScript 型整合確認

| 項目                                  | 状態   | 詳細                                         |
| ------------------------------------- | ------ | -------------------------------------------- |
| `detectMode?` / `planSkill?` への影響 | なし   | optional プロパティなので undefined で型安全 |
| TypeScript 型エラー                   | ✅ 0件 | `pnpm typecheck` で確認済み                  |
| unused import エラー                  | ✅ 0件 | 型チェック PASS                              |

### SubAgent-D: 統合判定

| 観点     | 判定 | 備考                                          |
| -------- | ---- | --------------------------------------------- |
| 矛盾     | なし | 仕様と実施内容が一致                          |
| 漏れ     | なし | 6行削除・1件昇格・11件削除すべて実施済み      |
| 整合性   | あり | テストコードと SkillLifecyclePanel.tsx が整合 |
| 依存関係 | あり | Phase 4 → Phase 5 の入出力整合                |

## 残存リスク評価

| リスク                            | 影響度 | 発生頻度 | 対処                                       |
| --------------------------------- | ------ | -------- | ------------------------------------------ |
| `mockExecutePlan` の型 any 警告   | 低     | 既存     | Phase 5 前から存在する既存警告。スコープ外 |
| act() 未ラップ警告（U-20b 内）    | 低     | 既存     | テスト PASS には影響しない既存警告         |
| `window.skillCreatorAPI` の型 any | 低     | 既存     | テスト全体の設計課題。本タスクスコープ外   |

## 完了条件チェック

- ✅ `describe.skip` が0件
- ✅ 廃止済み API モック宣言（`planSkill` / `detectMode`）が0件
- ✅ 不要な import 文が0件
- ✅ 矛盾なし・漏れなし・整合あり・依存整合あり
