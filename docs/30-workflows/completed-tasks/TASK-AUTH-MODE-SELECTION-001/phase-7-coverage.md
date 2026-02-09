# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                                                    |
| -------- | ----------------------------------------------------- |
| タスクID | TASK-AUTH-MODE-SELECTION-001                          |
| 機能名   | auth-mode-selection                                   |
| Phase    | 7 - カバレッジ確認                                    |
| Issue    | #750                                                  |
| 作成日   | 2026-02-08                                            |
| 前Phase  | [Phase 6: テスト拡充](./phase-6-test-expansion.md)    |
| 次Phase  | [Phase 8: リファクタリング](./phase-8-refactoring.md) |

## 目的

カバレッジ基準の充足を確認し、未達の場合はPhase 6に戻って追加テストを実施する。

## 依存関係

- **前提成果物**:
  - Phase 5で実装されたすべてのソースコード
  - Phase 6で拡充されたテストコード
- **参照**:
  - `.claude/rules/02-code-quality.md` - カバレッジ基準

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 実行手順

### Step 1: カバレッジ測定実行

```bash
# desktopパッケージのカバレッジ測定
pnpm --filter @repo/desktop test:coverage

# 特定ファイルのカバレッジ測定（デバッグ用）
pnpm --filter @repo/desktop test:coverage -- --coverage.include="**/auth/**"
```

### Step 2: カバレッジレポート確認

カバレッジレポートは以下の場所に出力される：

- HTML: `apps/desktop/coverage/index.html`
- JSON: `apps/desktop/coverage/coverage-final.json`
- LCOV: `apps/desktop/coverage/lcov.info`

### Step 3: 対象ファイル別カバレッジ確認

| ファイル                                    | Line | Branch | Function | 判定 |
| ------------------------------------------- | ---- | ------ | -------- | ---- |
| `services/auth/AuthModeService.ts`          |      |        |          |      |
| `services/auth/SubscriptionAuthProvider.ts` |      |        |          |      |
| `ipc/authModeHandlers.ts`                   |      |        |          |      |
| `store/slices/authModeSlice.ts`             |      |        |          |      |
| `components/settings/AuthModeSelector.tsx`  |      |        |          |      |

## 判定基準

### 基準達成（Phase 8へ進む）

すべての対象ファイルが以下を満たす場合：

- Line Coverage >= 80%
- Branch Coverage >= 60%
- Function Coverage >= 80%

### 基準未達（Phase 6へ戻る）

上記基準を1つでも満たさないファイルがある場合：

1. カバレッジレポートから未カバー箇所を特定
2. 不足テストケースをリストアップ
3. Phase 6に戻ってテスト追加

## 未カバー箇所分析テンプレート

### 未カバーライン分析

```markdown
## ファイル: {ファイル名}

### 未カバーライン

- L{行番号}: {コード内容}
  - 理由: {なぜカバーされていないか}
  - 追加テスト: {追加すべきテストケース}

### 未カバーブランチ

- L{行番号}: {条件式}
  - 未テストケース: {テストされていない条件}
  - 追加テスト: {追加すべきテストケース}
```

## カバレッジ改善のヒント

### よくある未カバーパターン

1. **エラーハンドリング分岐**
   - catch節がテストされていない
   - 対策: エラーをスローするモックを作成

2. **早期リターン条件**
   - ガード節がテストされていない
   - 対策: 境界値テストを追加

3. **オプショナル引数のデフォルト値**
   - デフォルト値使用パスがテストされていない
   - 対策: 引数なし呼び出しテストを追加

4. **コールバック内のロジック**
   - イベントハンドラ内部がテストされていない
   - 対策: イベント発火をシミュレート

5. **非同期エラーパス**
   - Promise reject時の処理がテストされていない
   - 対策: mockRejectedValueを使用

## 統合テスト連携【必須】

統合テスト結果を含むカバレッジ確認:

| テストカテゴリ | カバレッジ確認対象                           | 目標 |
| -------------- | -------------------------------------------- | ---- |
| ユニットテスト | AuthModeService, SubscriptionAuthProvider 等 | 80%+ |
| IPCテスト      | authModeHandlers 全チャンネル                | 100% |
| 統合テスト     | Renderer → Main → Store の往復フロー         | 100% |
| E2Eテスト      | 認証方式切り替えシナリオ                     | 実装 |

### 統合テスト固有のカバレッジ確認

```bash
# IPC関連のカバレッジを個別確認
pnpm --filter @repo/desktop test:coverage -- --coverage.include="**/ipc/**"

# 認証関連のカバレッジを個別確認
pnpm --filter @repo/desktop test:coverage -- --coverage.include="**/auth/**"
```

## 成果物

| ファイルパス                                                                | 説明                   |
| --------------------------------------------------------------------------- | ---------------------- |
| `apps/desktop/coverage/index.html`                                          | HTMLカバレッジレポート |
| `apps/desktop/coverage/coverage-final.json`                                 | JSONカバレッジデータ   |
| `docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/outputs/coverage-report.md` | カバレッジ結果サマリ   |

## カバレッジ結果サマリ記録

```markdown
## カバレッジ測定結果

測定日時: YYYY-MM-DD HH:MM

### 全体サマリ

| 指標     | 値  | 基準 | 判定 |
| -------- | --- | ---- | ---- |
| Line     |     | 80%  |      |
| Branch   |     | 60%  |      |
| Function |     | 80%  |      |

### ファイル別詳細

（上記テーブルを埋める）

### 判定結果

- [ ] PASS: Phase 8へ進む
- [ ] FAIL: Phase 6へ戻る

### 未達の場合の追加タスク

1. {追加テスト1}
2. {追加テスト2}
```

## 完了条件

- [ ] カバレッジ測定が実行されている
- [ ] 全対象ファイルのカバレッジが記録されている
- [ ] 判定結果が明確である
- [ ] 未達の場合、追加タスクがリストアップされている

## 次のPhase

### 基準達成の場合

Phase 8: リファクタリングへ進む

- コード品質改善
- 命名規則統一
- 責務分離

### 基準未達の場合

Phase 6: テスト拡充へ戻る

- 未カバー箇所のテスト追加
- 再度カバレッジ測定
