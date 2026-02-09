# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 7                                  |
| 機能名 | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| 作成日 | 2026-02-08                         |

## 目的

Phase 6で拡充したテスト結果を検証し、カバレッジ基準を満たすことを確認する。未達の場合はPhase 6に戻る。

## 参照資料

| 資料名             | パス                                  | 説明          |
| ------------------ | ------------------------------------- | ------------- |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`  | Phase 6成果物 |
| テスト拡充結果     | `apps/desktop/src/preload/__tests__/` | Phase 6成果物 |

## 実行タスク

### Task 1: カバレッジ計測の実行

#### 目的

Phase 6で拡充したテスト全体のカバレッジを計測し、数値を確認する。

#### 手順

1. 以下のコマンドでカバレッジ付きテストを実行する:

```bash
pnpm --filter @repo/desktop test:coverage
```

2. カバレッジレポートの出力先を確認する:
   - HTML: `apps/desktop/coverage/index.html`
   - JSON: `apps/desktop/coverage/coverage-summary.json`
3. 各指標（Line, Branch, Function）を記録する

### Task 2: カバレッジ基準の判定

#### カバレッジゲート

| 指標     | 基準 | 計測結果   | 判定          |
| -------- | ---- | ---------- | ------------- |
| Line     | 80%+ | {{RESULT}} | {{PASS/FAIL}} |
| Branch   | 60%+ | {{RESULT}} | {{PASS/FAIL}} |
| Function | 80%+ | {{RESULT}} | {{PASS/FAIL}} |

#### 判定基準

- **全指標PASS**: Phase 8へ進む
- **いずれかFAIL**: Phase 6へ戻り、不足テストを追加する

### Task 3: カバレッジ不足箇所の特定

#### 目的

カバレッジが不足している箇所を特定し、Phase 6への差し戻し時の指針とする。

#### 手順

1. カバレッジレポートからカバレッジ率の低いファイルを抽出する
2. 未カバー行・未カバー分岐を特定する
3. 以下の表にまとめる:

| ファイル                              | Line  | Branch | Function | 不足箇所の概要 |
| ------------------------------------- | ----- | ------ | -------- | -------------- |
| `preload/skill-api.ts`                | {{%}} | {{%}}  | {{%}}    | {{概要}}       |
| `renderer/hooks/useSkillExecution.ts` | {{%}} | {{%}}  | {{%}}    | {{概要}}       |
| `renderer/store/slices/skillSlice.ts` | {{%}} | {{%}}  | {{%}}    | {{概要}}       |

### Task 4: 対象ファイル別カバレッジ詳細

#### 目的

統一SkillAPI関連の主要ファイルのカバレッジを個別に検証する。

#### 対象ファイル一覧

| ファイル                                                | カバレッジ目標 | 現在値     |
| ------------------------------------------------------- | -------------- | ---------- |
| `apps/desktop/src/preload/skill-api.ts`                 | Line 80%+      | {{RESULT}} |
| `apps/desktop/src/renderer/hooks/useSkillExecution.ts`  | Line 80%+      | {{RESULT}} |
| `apps/desktop/src/renderer/hooks/useSkillPermission.ts` | Line 80%+      | {{RESULT}} |
| `apps/desktop/src/renderer/store/slices/skillSlice.ts`  | Line 80%+      | {{RESULT}} |

### Task 5: 統合テスト実行結果の確認

#### 目的

Phase 6で追加したIPCチャンネル統合テストの結果を検証する。

#### 手順

```bash
pnpm --filter @repo/desktop test
```

| テストスイート                      | テスト数 | PASS    | FAIL    | 結果       |
| ----------------------------------- | -------- | ------- | ------- | ---------- |
| skill-api.test.ts（基本API）        | {{NUM}}  | {{NUM}} | {{NUM}} | {{RESULT}} |
| skill-api.test.ts（境界値・異常系） | {{NUM}}  | {{NUM}} | {{NUM}} | {{RESULT}} |
| skill-api.test.ts（統合テスト）     | {{NUM}}  | {{NUM}} | {{NUM}} | {{RESULT}} |
| useSkillExecution.test.ts           | {{NUM}}  | {{NUM}} | {{NUM}} | {{RESULT}} |
| useSkillPermission.test.ts          | {{NUM}}  | {{NUM}} | {{NUM}} | {{RESULT}} |
| skillSlice.test.ts                  | {{NUM}}  | {{NUM}} | {{NUM}} | {{RESULT}} |

### Task 6: 差し戻し判定

#### 目的

カバレッジ基準未達の場合、Phase 6に戻る判断を行う。

#### 判定フロー

```
全指標 >= 基準値？
├── YES → Phase 8へ進む
└── NO  → Phase 6へ戻る
         └── 不足箇所特定（Task 3の結果を使用）
         └── 追加テスト項目を明確化
```

## 統合テスト連携【必須】

```bash
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:coverage
```

| 判定項目               | 基準 | 結果       |
| ---------------------- | ---- | ---------- |
| ユニットテストLine     | 80%+ | {{RESULT}} |
| ユニットテストBranch   | 60%+ | {{RESULT}} |
| ユニットテストFunction | 80%+ | {{RESULT}} |

## 成果物

| 成果物             | パス                                 | 説明               |
| ------------------ | ------------------------------------ | ------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | カバレッジ検証結果 |

## 完了条件

- [ ] カバレッジ計測が実行されている
- [ ] Line カバレッジが80%以上である
- [ ] Branch カバレッジが60%以上である
- [ ] Function カバレッジが80%以上である
- [ ] 対象ファイル別カバレッジが記録されている
- [ ] カバレッジ不足箇所が特定・記録されている（不足がある場合）
- [ ] 統合テストが全てPASSしている
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- **カバレッジ基準達成**: Phase 8: リファクタリング（TDD: Refactor）
- **カバレッジ基準未達**: Phase 6: テスト拡充（差し戻し）
