# Phase 7: テストカバレッジ確認

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 7                                 |
| タスクID | TASK-FIX-6-1-STATE-CENTRALIZATION |
| 機能名   | state-centralization              |
| 作成日   | 2026-02-09                        |
| 分類     | リファクタリング                  |

## 目的

Phase 6で拡充したテスト結果を検証し、カバレッジ基準を満たすことを確認する。
未達の場合はPhase 6に戻りテストを追加する。

## 実行タスク

- **Task 7-1**: カバレッジ再測定 - 全テストのカバレッジを測定
- **Task 7-2**: ゲート判定 - カバレッジ基準との比較
- **Task 7-3**: ギャップ分析 - 未達の場合、不足箇所の特定
- **Task 7-4**: 結果レポート作成 - カバレッジレポートの生成

## 参照資料

| 資料名              | パス                                                                                    | 説明          |
| ------------------- | --------------------------------------------------------------------------------------- | ------------- |
| Phase 6テスト       | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` | Phase 6成果物 |
| setupSkillListeners | `apps/desktop/src/renderer/store/__tests__/setupSkillListeners.test.ts`                 | Phase 6成果物 |
| カバレッジ基準      | `.claude/rules/02-code-quality.md`                                                      | 品質基準      |

## カバレッジ基準

### ユニットテストカバレッジ

| 指標              | 最低基準 | 推奨基準 | 判定 |
| ----------------- | -------- | -------- | ---- |
| Line Coverage     | 80%      | 90%      | -    |
| Branch Coverage   | 60%      | 70%      | -    |
| Function Coverage | 80%      | 90%      | -    |

### 結合テストカバレッジ

| 指標                         | 目標 | 判定 |
| ---------------------------- | ---- | ---- |
| APIエンドポイント            | 100% | -    |
| モジュール間インターフェース | 100% | -    |
| 正常系シナリオ               | 100% | -    |
| 異常系シナリオ               | 80%+ | -    |
| 外部連携ポイント             | 100% | -    |

## 実行手順

### ステップ1: カバレッジ測定（Task 7-1）

以下のコマンドを実行してカバレッジを測定する:

```bash
# 対象ファイルのカバレッジ測定
pnpm --filter @repo/desktop test:run --coverage \
  apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts \
  apps/desktop/src/renderer/store/__tests__/setupSkillListeners.test.ts

# 詳細レポート生成
pnpm --filter @repo/desktop test:coverage --reporter=html --reporter=text
```

### ステップ2: 対象ファイルの確認

カバレッジ測定対象ファイル:

| ファイル                                                 | 種別 | 説明            |
| -------------------------------------------------------- | ---- | --------------- |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`   | 実装 | 統合後のSlice   |
| `apps/desktop/src/renderer/store/setupSkillListeners.ts` | 実装 | IPCリスナー設定 |

### ステップ3: ゲート判定（Task 7-2）

カバレッジ結果を以下の判定基準で評価する:

```markdown
## カバレッジ判定結果

### agentSlice.ts

| 指標              | 測定値 | 最低基準 | 判定     |
| ----------------- | ------ | -------- | -------- |
| Line Coverage     | {{%}}  | 80%      | {{判定}} |
| Branch Coverage   | {{%}}  | 60%      | {{判定}} |
| Function Coverage | {{%}}  | 80%      | {{判定}} |

### setupSkillListeners.ts

| 指標              | 測定値 | 最低基準 | 判定     |
| ----------------- | ------ | -------- | -------- |
| Line Coverage     | {{%}}  | 80%      | {{判定}} |
| Branch Coverage   | {{%}}  | 60%      | {{判定}} |
| Function Coverage | {{%}}  | 80%      | {{判定}} |

### 総合判定

| 判定 | 対応                    |
| ---- | ----------------------- |
| PASS | Phase 8へ進行           |
| FAIL | Phase 6へ戻りテスト追加 |
```

### ステップ4: ギャップ分析（Task 7-3）

カバレッジが未達の場合、以下の手順でギャップを分析する:

#### 4.1 未カバー行の特定

```bash
# HTMLレポートを開いて未カバー行を確認
open coverage/lcov-report/index.html
```

#### 4.2 未カバー行のカテゴリ分類

| カテゴリ           | 内容                    | 対応方針               |
| ------------------ | ----------------------- | ---------------------- |
| エラーハンドリング | catch節、エラー分岐     | エラーケーステスト追加 |
| 境界条件           | null/undefined チェック | 境界値テスト追加       |
| 条件分岐           | if/else、switch文       | 条件網羅テスト追加     |
| 非同期処理         | Promise.catch、finally  | 非同期エラーテスト追加 |
| 早期リターン       | return文による早期終了  | ガード条件テスト追加   |

#### 4.3 追加テストの優先順位

1. **高優先度**: エラーハンドリング（ユーザー影響大）
2. **中優先度**: 境界条件（バグ発生リスク高）
3. **低優先度**: 正常系の細かい分岐

### ステップ5: 結果レポート作成（Task 7-4）

以下のフォーマットでレポートを作成する:

```markdown
# カバレッジレポート - TASK-FIX-6-1-STATE-CENTRALIZATION

## 測定日時

{{YYYY-MM-DD HH:mm:ss}}

## 測定対象

- agentSlice.ts（スキル状態統合後）
- setupSkillListeners.ts（IPCリスナー設定）

## カバレッジ結果

### ユニットテストカバレッジ

| ファイル               | Lines | Branches | Functions | 判定 |
| ---------------------- | ----- | -------- | --------- | ---- |
| agentSlice.ts          | {{%}} | {{%}}    | {{%}}     | -    |
| setupSkillListeners.ts | {{%}} | {{%}}    | {{%}}     | -    |
| **合計**               | {{%}} | {{%}}    | {{%}}     | -    |

### テストケース一覧

| テストID      | 内容                      | 結果 |
| ------------- | ------------------------- | ---- |
| TS-6-1-01〜56 | Phase 4基本テスト         | PASS |
| TS-6-1-57〜63 | 境界値テスト              | PASS |
| TS-6-1-64〜73 | エラーケーステスト        | PASS |
| TS-6-1-74〜80 | 並行処理テスト            | PASS |
| TS-6-1-81〜88 | setupSkillListenersテスト | PASS |

### 未カバー箇所（該当する場合）

| ファイル | 行番号 | 内容 | 対応 |
| -------- | ------ | ---- | ---- |
| -        | -      | -    | -    |

## 総合判定

**{{PASS/FAIL}}**

### 次のアクション

- PASS: Phase 8（リファクタリング）へ進行
- FAIL: Phase 6へ戻り、以下のテストを追加
  - {{追加テスト項目}}
```

## 統合テスト連携【必須】

統合テストの再実行とゲート判定:

| 判定項目               | 基準 | 結果       |
| ---------------------- | ---- | ---------- |
| ユニットテストLine     | 80%+ | {{RESULT}} |
| ユニットテストBranch   | 60%+ | {{RESULT}} |
| ユニットテストFunction | 80%+ | {{RESULT}} |
| 統合テスト正常系       | 100% | {{RESULT}} |
| 統合テスト異常系       | 80%+ | {{RESULT}} |

## 判定フロー

```
カバレッジ測定
    ↓
全基準達成？ ─ Yes → Phase 8へ
    │
   No
    ↓
ギャップ分析
    ↓
Phase 6へ戻る
    ↓
テスト追加
    ↓
再度Phase 7実行
```

## 成果物

| 成果物             | パス                                  | 説明               |
| ------------------ | ------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`  | 再測定結果         |
| 統合テスト結果     | `outputs/phase-7/integration-test.md` | 統合テスト実行結果 |

## 完了条件

- [ ] カバレッジ測定が完了している
- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 全テストケース（TS-6-1-01〜TS-6-1-88）がPASSしている
- [ ] カバレッジレポートが `outputs/phase-7/` に出力されている
- [ ] 統合テスト結果が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 未達時の対応

カバレッジ基準を満たさない場合:

1. `outputs/phase-7/coverage-report.md` に未達の詳細を記録
2. Phase 6に戻り、不足テストを追加
3. 再度Phase 7を実行
4. このサイクルを基準達成まで繰り返す

## チェックコマンド

```bash
# 1. テスト実行
pnpm --filter @repo/desktop test:run \
  apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts \
  apps/desktop/src/renderer/store/__tests__/setupSkillListeners.test.ts

# 2. カバレッジ確認
pnpm --filter @repo/desktop test:coverage

# 3. 型チェック
pnpm --filter @repo/desktop typecheck

# 4. Lint
pnpm --filter @repo/desktop lint
```

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）

**注意**: Phase 8への進行条件

- 全カバレッジ基準を満たしていること
- 全テストがPASSしていること
- 型チェック・Lintエラーがないこと
