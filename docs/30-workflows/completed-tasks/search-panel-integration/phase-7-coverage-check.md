# Phase 7: カバレッジ確認 - 検索パネル EditorView 統合

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| フェーズ   | Phase 7                        |
| 名称       | カバレッジ確認                 |
| 目的       | テストカバレッジ目標の達成検証 |
| 前提Phase  | Phase 6: テスト拡充            |
| 次Phase    | Phase 8: リファクタリング      |
| ステータス | 未実施                         |

---

## 目的

Phase 6 で追加したテストを含め、カバレッジ目標（Line 80%+, Branch 60%+, Function 80%+）を達成していることを検証する。未達の場合は追加テストを作成する。

---

## 実行タスク

### Task 1: カバレッジレポートの取得

**目的**: 現在のカバレッジ状況を把握する

**実行内容**:

1. カバレッジレポートの生成

```bash
# ユニットテスト + カバレッジ
pnpm --filter @repo/desktop test:coverage

# または
pnpm --filter @repo/desktop vitest run --coverage
```

2. カバレッジレポートの確認

```bash
# HTML レポートを開く
open coverage/index.html
```

**完了条件**:

- [ ] カバレッジレポートが生成されている
- [ ] 対象ファイルのカバレッジが確認できる

### Task 2: カバレッジ目標との比較

**目的**: カバレッジ目標を達成しているかを判定する

**実行内容**:

1. 対象ファイル別カバレッジ確認

| ファイル                      | Line | Branch | Function | 判定 |
| ----------------------------- | ---- | ------ | -------- | ---- |
| TextAreaEditorAdapter.ts      | %    | %      | %        | [ ]  |
| useEditorInstance.ts          | %    | %      | %        | [ ]  |
| useWorkspaceSearch.ts         | %    | %      | %        | [ ]  |
| useSearchKeyboardShortcuts.ts | %    | %      | %        | [ ]  |
| EditorView/index.tsx          | %    | %      | %        | [ ]  |

2. 目標との比較

| 指標              | 目標 | 現状 | 判定 |
| ----------------- | ---- | ---- | ---- |
| Line Coverage     | 80%  | %    | [ ]  |
| Branch Coverage   | 60%  | %    | [ ]  |
| Function Coverage | 80%  | %    | [ ]  |

**完了条件**:

- [ ] 全対象ファイルのカバレッジが記録されている
- [ ] 目標との比較結果が明確になっている

### Task 3: カバレッジ未達領域の特定

**目的**: カバレッジが不足している領域を特定する

**実行内容**:

1. 未カバー行の特定
   - カバレッジレポートの赤い行（未実行行）を確認
   - 条件分岐でカバーされていないブランチを特定

2. 未カバー領域の分類

| 分類               | 対応方針                   |
| ------------------ | -------------------------- |
| エラーハンドリング | 異常系テストを追加         |
| 条件分岐           | 各条件のテストケースを追加 |
| エッジケース       | 境界値テストを追加         |
| デッドコード       | コード削除を検討           |

**完了条件**:

- [ ] 未カバー領域が特定されている
- [ ] 各領域の対応方針が決定されている

### Task 4: 追加テストの作成（未達の場合）

**目的**: カバレッジ目標達成のための追加テストを作成する

**実行内容**:

カバレッジが未達の場合のみ実行:

1. 未カバー領域に対するテストを作成
2. テスト実行してカバレッジを再確認

```bash
# テスト実行 + カバレッジ再確認
pnpm --filter @repo/desktop test:coverage
```

**完了条件**:

- [ ] 追加テストが作成されている（未達の場合）
- [ ] カバレッジ目標を達成している

### Task 5: 統合テストの再実行とゲート判定

**目的**: 全テストが合格することを確認しゲート判定を行う

**実行内容**:

1. 全テストの実行

```bash
# 全テスト実行
pnpm --filter @repo/desktop test:run

# TypeScript 型チェック
pnpm --filter @repo/desktop tsc --noEmit

# ESLint
pnpm --filter @repo/desktop lint
```

2. ゲート判定

| 判定基準                 | 状態 | 重要度   |
| ------------------------ | ---- | -------- |
| Line Coverage >= 80%     | [ ]  | CRITICAL |
| Branch Coverage >= 60%   | [ ]  | MAJOR    |
| Function Coverage >= 80% | [ ]  | MAJOR    |
| 全テスト合格             | [ ]  | CRITICAL |
| TypeScript エラー 0 件   | [ ]  | CRITICAL |
| ESLint 警告 0 件         | [ ]  | MAJOR    |

3. 判定結果

| 判定  | 条件                             | 次アクション             |
| ----- | -------------------------------- | ------------------------ |
| PASS  | CRITICAL 全て OK、MAJOR 90% 以上 | Phase 8 へ進む           |
| MINOR | CRITICAL 全て OK、MAJOR 70-90%   | 軽微な修正後継続         |
| MAJOR | カバレッジ CRITICAL に問題       | Phase 6 へ戻り追加テスト |

**完了条件**:

- [ ] ゲート判定が PASS または MINOR である
- [ ] 判定結果が `outputs/phase-7/coverage-report.md` に記録されている

---

## 参照資料

### Phase 6 成果物

| 参照資料           | パス                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| エッジケーステスト | `apps/desktop/src/features/search/__tests__/integration/EdgeCases.test.tsx`     |
| 異常系テスト       | `apps/desktop/src/features/search/__tests__/integration/ErrorHandling.test.tsx` |

---

## 成果物

| 成果物               | パス                                                      |
| -------------------- | --------------------------------------------------------- |
| カバレッジレポート   | `coverage/`                                               |
| カバレッジ確認結果   | `outputs/phase-7/coverage-report.md`                      |
| 追加テスト（必要時） | `apps/desktop/src/features/search/__tests__/integration/` |

---

## 完了条件

- [ ] カバレッジレポートが生成されている
- [ ] Line Coverage >= 80% を達成している
- [ ] Branch Coverage >= 60% を達成している
- [ ] Function Coverage >= 80% を達成している
- [ ] 全テストが合格している
- [ ] ゲート判定が PASS または MINOR である

---

## 次のPhaseへの引き継ぎ

Phase 8（リファクタリング）では、本Phaseでカバレッジが確認された実装に対して:

- コード品質の改善
- 重複の排除
- 可読性の向上
- パフォーマンスの最適化
