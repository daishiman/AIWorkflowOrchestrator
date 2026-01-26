# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 6                                      |
| Phase名    | テスト拡充                             |
| 前提Phase  | Phase 5                                |
| 後続Phase  | Phase 7                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-25                             |
| 機能名     | task-3-1-e-remember-choice-persistence |

---

## 目的

Phase 4で作成した基本テストに加え、カバレッジ目標達成に向けた追加テストを作成する。

## 背景

TDDのGreenフェーズで基本機能が実装されたが、エッジケースや異常系のテストが不足している可能性がある。カバレッジ目標（Line 80%+, Branch 60%+）達成に向けてテストを拡充する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ現状確認

**目的**: 現在のテストカバレッジを確認する

**実行手順**:

1. 以下のコマンドでカバレッジを確認:
   ```bash
   pnpm --filter @repo/desktop test:coverage -- --grep "PermissionStore"
   ```
2. Line Coverage、Branch Coverage、Function Coverageを記録
3. カバレッジが低い箇所を特定

**期待される成果物**:

- カバレッジレポート（現状値と不足箇所の特定）

---

### タスク2: エッジケーステスト追加

**目的**: エッジケースに対するテストを追加する

**実行手順**:

1. 以下のエッジケースのテストを追加:
   - 空文字列のツール名
   - 特殊文字を含むツール名
   - 大量のツール登録（100件以上）
   - 同一ツールの連続許可/削除
2. テストファイルに追加
3. テストがパスすることを確認

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/PermissionStore.test.ts`（追加）

**追加テストケース例**:

```typescript
describe('PermissionStore - Edge Cases', () => {
  describe('空文字列のツール名', () => {
    it('空文字列でも許可できる（仕様確認要）', () => { ... });
  });

  describe('特殊文字を含むツール名', () => {
    it('日本語を含むツール名を許可できる', () => { ... });
    it('記号を含むツール名を許可できる', () => { ... });
  });

  describe('大量ツール登録', () => {
    it('100件のツールを登録できる', () => { ... });
    it('大量ツール登録後もisToolAllowedが高速', () => { ... });
  });
});
```

---

### タスク3: 異常系テスト追加

**目的**: 異常系・エラーケースのテストを追加する

**実行手順**:

1. 以下の異常系テストを追加:
   - 設定ファイル破損時の回復
   - ストア初期化失敗時の動作
   - 同時アクセス（並行処理）
2. モックを使用してエラー状況を再現
3. テストがパスすることを確認

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/PermissionStore.test.ts`（追加）

---

### タスク4: 統合テスト拡充

**目的**: 統合テストのカバレッジを拡充する

**実行手順**:

1. 以下の統合テストシナリオを追加:
   - 許可→アプリ再起動シミュレーション→自動許可確認
   - 複数ツール連続許可→一括削除→再許可
   - IPC経由での許可状態同期テスト
2. E2Eテストとしてシナリオをカバー

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/PermissionStore.integration.test.ts`（追加）

---

### タスク5: カバレッジ目標達成確認

**目的**: カバレッジ目標を達成していることを確認する

**実行手順**:

1. 以下のコマンドでカバレッジを再確認:
   ```bash
   pnpm --filter @repo/desktop test:coverage -- --grep "PermissionStore"
   ```
2. 以下の目標を達成していることを確認:
   - Line Coverage: 80%以上
   - Branch Coverage: 60%以上
   - Function Coverage: 80%以上
3. 未達の場合は追加テストを作成

**期待される成果物**:

- カバレッジレポート（目標達成確認）

---

## 参照資料

| 参照資料            | パス                                                                        | 内容           |
| ------------------- | --------------------------------------------------------------------------- | -------------- |
| Phase 4テストコード | `apps/desktop/src/main/services/skill/__tests__/PermissionStore.test.ts`    | 基本テスト     |
| Phase 5実装コード   | `apps/desktop/src/main/services/skill/PermissionStore.ts`                   | 実装コード     |
| 品質基準            | `.claude/skills/task-specification-creator/references/quality-standards.md` | カバレッジ基準 |

---

## 成果物

| 成果物             | パス                                                                                 | 内容             |
| ------------------ | ------------------------------------------------------------------------------------ | ---------------- |
| 拡充テスト         | `apps/desktop/src/main/services/skill/__tests__/PermissionStore.test.ts`             | エッジケース追加 |
| 統合テスト拡充     | `apps/desktop/src/main/services/skill/__tests__/PermissionStore.integration.test.ts` | シナリオ追加     |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                                                 | カバレッジ結果   |

---

## 統合テスト連携（Phase 1〜11は必須）

- 統合テストの拡充（全カテゴリのカバレッジ向上）
- データフローテストの追加
- エラーハンドリングテストの追加

---

## 完了条件

- [ ] カバレッジ現状が確認された
- [ ] エッジケーステストが追加された
- [ ] 異常系テストが追加された
- [ ] 統合テストが拡充された
- [ ] Line Coverage 80%以上を達成
- [ ] Branch Coverage 60%以上を達成
- [ ] Function Coverage 80%以上を達成

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（テストカバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/task-3-1-e-remember-choice-persistence/phase-07-coverage-verification.md`
