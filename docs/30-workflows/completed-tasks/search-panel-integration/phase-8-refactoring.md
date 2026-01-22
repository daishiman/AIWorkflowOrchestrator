# Phase 8: リファクタリング - 検索パネル EditorView 統合

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| フェーズ   | Phase 8                        |
| 名称       | リファクタリング               |
| 目的       | TDD Refactor: コード品質の改善 |
| 前提Phase  | Phase 7: カバレッジ確認        |
| 次Phase    | Phase 9: 品質保証              |
| ステータス | 未実施                         |

---

## 目的

TDD の Refactor フェーズとして、テストを維持しながらコード品質を改善する。重複の排除、可読性の向上、パフォーマンスの最適化を行う。

---

## 実行タスク

### Task 1: コード品質分析

**目的**: リファクタリング対象を特定する

**実行内容**:

1. 静的解析の実行

```bash
# ESLint 詳細レポート
pnpm --filter @repo/desktop lint --format json > lint-report.json

# TypeScript 厳格モードチェック
pnpm --filter @repo/desktop tsc --noEmit --strict
```

2. コード品質指標の確認

| 指標             | 対象ファイル             | 状態 |
| ---------------- | ------------------------ | ---- |
| 関数の複雑度     | TextAreaEditorAdapter.ts | [ ]  |
| 行数             | 各ファイル               | [ ]  |
| 重複コード       | 統合フック間             | [ ]  |
| 命名規則         | 全ファイル               | [ ]  |
| コメントの適切性 | 複雑なロジック           | [ ]  |

**完了条件**:

- [ ] リファクタリング対象が特定されている
- [ ] 優先度が設定されている

### Task 2: TextAreaEditorAdapter のリファクタリング

**目的**: アダプターのコード品質を改善する

**実行内容**:

1. メソッドの責務分離
   - 長いメソッドを適切に分割
   - ヘルパーメソッドの抽出

2. エラーハンドリングの統一
   - null チェックの一元化
   - エラーメッセージの標準化

3. 型安全性の強化
   - 厳密な型定義
   - 型ガードの追加

例: リファクタリング後の構造

```typescript
class TextAreaEditorAdapter implements EditorInstance {
  // プライベートヘルパーメソッド
  private getPositionFromLineColumn(line: number, column: number): number {
    // 位置計算ロジック
  }

  private getLineColumnFromPosition(position: number): {
    line: number;
    column: number;
  } {
    // 逆変換ロジック
  }

  // 公開メソッドはヘルパーを使用
  scrollToLine(line: number, column?: number): void {
    const position = this.getPositionFromLineColumn(line, column ?? 1);
    this.scrollToPosition(position);
  }
}
```

**完了条件**:

- [ ] メソッドの責務が明確に分離されている
- [ ] テストが全て合格する
- [ ] 型エラーが 0 件

### Task 3: 統合フックのリファクタリング

**目的**: フックの共通ロジックを抽出する

**実行内容**:

1. 共通ロジックの抽出
   - プラットフォーム判定ロジック（isMac）
   - キーボードイベント処理

2. カスタムフックの最適化
   - 不要な再レンダリングの防止
   - メモ化の適用

例: 共通ロジックの抽出

```typescript
// utils/platform.ts
export function isMacPlatform(): boolean {
  return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
}

export function getCmdKey(event: KeyboardEvent): boolean {
  return isMacPlatform() ? event.metaKey : event.ctrlKey;
}
```

**完了条件**:

- [ ] 共通ロジックが抽出されている
- [ ] フックが最適化されている
- [ ] テストが全て合格する

### Task 4: EditorView 統合コードのリファクタリング

**目的**: EditorView の検索統合コードを整理する

**実行内容**:

1. コンポーネントの責務分離
   - 検索関連ロジックの分離
   - 状態管理の整理

2. 可読性の向上
   - 適切なコメントの追加
   - 変数名・関数名の改善

3. パフォーマンスの最適化
   - useMemo/useCallback の適切な使用
   - 不要な再レンダリングの防止

**完了条件**:

- [ ] コードの可読性が向上している
- [ ] パフォーマンスが最適化されている
- [ ] テストが全て合格する

### Task 5: リファクタリング後のテスト確認

**目的**: リファクタリングによる機能退行がないことを確認する

**実行内容**:

1. 全テストの実行

```bash
# 全テスト実行
pnpm --filter @repo/desktop test:run

# カバレッジ確認
pnpm --filter @repo/desktop test:coverage
```

2. 品質チェック

```bash
# TypeScript 型チェック
pnpm --filter @repo/desktop tsc --noEmit

# ESLint
pnpm --filter @repo/desktop lint
```

3. 確認項目

| 確認項目                   | 状態 |
| -------------------------- | ---- |
| 全テスト合格               | [ ]  |
| カバレッジ維持（低下なし） | [ ]  |
| TypeScript エラー 0 件     | [ ]  |
| ESLint 警告 0 件           | [ ]  |
| 機能が正常動作             | [ ]  |

**完了条件**:

- [ ] 全テストが合格する
- [ ] カバレッジが維持されている
- [ ] 品質チェックが全て合格する

---

## 参照資料

### Phase 5/6/7 成果物

| 参照資料              | パス                                                                 |
| --------------------- | -------------------------------------------------------------------- |
| TextAreaEditorAdapter | `apps/desktop/src/features/search/adapters/TextAreaEditorAdapter.ts` |
| 統合フック            | `apps/desktop/src/renderer/views/EditorView/hooks/`                  |
| カバレッジレポート    | `outputs/phase-7/coverage-report.md`                                 |

---

## 成果物

| 成果物                           | パス                                 |
| -------------------------------- | ------------------------------------ |
| リファクタリング後のコード       | 各対象ファイル                       |
| 共通ユーティリティ（新規作成時） | `apps/desktop/src/utils/platform.ts` |
| リファクタリングログ             | `outputs/phase-8/refactoring-log.md` |

---

## 完了条件

- [ ] コード品質が改善されている
- [ ] 重複コードが排除されている
- [ ] 可読性が向上している
- [ ] 全テストが合格する
- [ ] カバレッジが維持されている

---

## 次のPhaseへの引き継ぎ

Phase 9（品質保証）では、本Phaseでリファクタリングしたコードに対して:

- 静的解析の最終確認
- セキュリティ確認
- アクセシビリティ最終確認
- パフォーマンス確認
