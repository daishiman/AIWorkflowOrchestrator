---
description: |
  再利用可能なReactカスタムフックを設計・実装する専門コマンド。

  ロジックの抽出、設計パターンの適用、テスト戦略の策定を通じて、
  保守性が高く型安全なカスタムフックを作成します。

  🤖 起動エージェント:
  - `.claude/agents/state-manager.md`: React状態管理専門エージェント（Phase 1で起動）

  📚 利用可能スキル（state-managerエージェントが必要時に参照）:
  **Phase 1（分析時）:** custom-hooks-patterns（必須）, react-hooks-advanced
  **Phase 2（設計時）:** custom-hooks-patterns（必須）, state-lifting
  **Phase 3（実装時）:** custom-hooks-patterns（必須）, react-hooks-advanced
  **Phase 4（テスト時）:** custom-hooks-patterns（必須）

  ⚙️ このコマンドの設定:
  - argument-hint: オプション引数1つ（未指定時はインタラクティブ）
  - allowed-tools: エージェント起動と最小限のファイル操作用
    • Task: state-managerエージェント起動用
    • Read: 既存フック・コンポーネント分析用
    • Write(src/hooks/**|src/features/*/hooks/**): カスタムフック作成用（パス制限）
    • Edit: 既存フック改善用
    • Grep: パターン検索用
  - model: sonnet（標準的な実装タスク）

  🎯 プロジェクト固有の考慮:
  - TDD準拠: テスト作成 → 実装 → リファクタリング
  - ハイブリッド構造: 機能固有（features/[機能名]/hooks/）または共通（src/hooks/）
  - 型安全性: TypeScript strict モード、@ts-ignore禁止
  - カバレッジ: ユニットテスト60%以上を目標

  トリガーキーワード: custom hook, use〜, カスタムフック, ロジック抽出, 再利用
argument-hint: "[hook-name]"
allowed-tools:
  - Task
  - Read
  - Write(src/hooks/**|src/features/*/hooks/**)
  - Edit
  - Grep
model: sonnet
---

# Reactカスタムフック作成コマンド

このコマンドは、React カスタムフックの設計・実装を自動化します。

## 実行フロー

### Phase 0: 準備と引数確認

**入力**:
- `$ARGUMENTS`: フック名（オプション、`use〜`形式推奨）
- インタラクティブ: 未指定時にフック名と目的を確認

**確認項目**:
- [ ] フック名は`use`で始まるか？
- [ ] 実装目的は明確か？
- [ ] 配置先ディレクトリは決定されているか？（機能固有 or 共通）

---

### Phase 1: state-managerエージェント起動

**エージェント起動**:
```
`.claude/agents/state-manager.md` を起動:
- 目的: カスタムフック「${hook-name}」の設計・実装
- 要求成果物:
  1. フック抽出基準評価（custom-hooks-patterns/resources/extraction-criteria.md参照）
  2. インターフェース設計（入力引数、戻り値、型定義）
  3. 実装（状態管理、副作用、ハンドラ定義）
  4. テスト戦略設計（TDD準拠、Vitest使用）
  5. 配置パス決定（ハイブリッド構造に準拠）
```

**エージェントの実行内容**:
1. **Phase 1（分析）**: 既存コード分析、抽出基準評価
2. **Phase 2（設計）**: インターフェース設計、状態配置決定
3. **Phase 3（実装）**: カスタムフック実装、型安全性確保
4. **Phase 4（テスト）**: テスト戦略設計、TDDサイクル準備

**期待する出力**:
- カスタムフックファイル（`use${HookName}.ts`）
- 配置パス（`src/hooks/` または `src/features/[機能名]/hooks/`）
- テスト戦略ドキュメント（テストケース定義、モック戦略）
- 使用例ドキュメント（API説明、型定義）

---

### Phase 2: 検証と完了報告

**検証項目**:
- [ ] カスタムフックファイルが作成されたか？
- [ ] 型定義は完全か（TypeScript strict mode準拠）？
- [ ] テスト戦略は明確か（TDDサイクル対応）？
- [ ] 使用例ドキュメントは十分か？
- [ ] ハイブリッド構造の依存関係ルールを守っているか？

**完了報告**:
- 作成されたファイルパスの一覧
- テスト戦略の概要
- Next Steps（テスト実装、統合作業等）

---

## ハイブリッドアーキテクチャへの配置

### 配置判断基準

**機能固有フック（`src/features/[機能名]/hooks/`）**:
- その機能でのみ使用される
- 機能固有のビジネスロジックを含む
- 例: `useYouTubeSummarize`, `useMeetingTranscribe`

**共通フック（`src/hooks/`）**:
- 複数機能で再利用される
- 汎用的なロジック（UI、データフェッチ、ユーティリティ）
- 例: `useDebounce`, `useLocalStorage`, `useFetch`

### 依存関係ルール

```
app/ → features/ → shared/infrastructure/ → shared/core/
```

**カスタムフックが依存可能**:
- ✅ shared/core（エンティティ、インターフェース）
- ✅ shared/infrastructure（AI、DB、Discord等の共通サービス）
- ✅ 他のカスタムフック（同レベルまたは下位層）
- ❌ 上位層への依存（app層への依存は禁止）

---

## TDD準拠ワークフロー

### 推奨フロー（Red-Green-Refactor）

1. **Red**: テスト作成（`__tests__/use${HookName}.test.ts`）
   - 期待する振る舞いを定義
   - Vitestでテストを実行 → 失敗を確認

2. **Green**: 最小限の実装
   - テストをパスする最小限のコード
   - 型安全性を確保

3. **Refactor**: リファクタリング
   - コードを改善
   - テストは維持（グリーンのまま）

### テスト配置

```
src/features/youtube-summarize/
├── hooks/
│   └── useYouTubeSummarize.ts
└── __tests__/
    └── useYouTubeSummarize.test.ts
```

---

## トラブルシューティング

### Q: フック名を指定しなかった場合は？
A: インタラクティブモードで確認します。フック名と目的を対話的に収集します。

### Q: 既存フックの改善は？
A: 既存フックのパスを指定すると、state-managerが分析・改善提案を行います。

### Q: テスト実装は？
A: このコマンドはテスト戦略の設計まで。実装は`/ai:generate-unit-tests`または`.claude/agents/unit-tester.md`に委譲します。

---

## 成果物例

```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

/**
 * 値の変更を遅延させるカスタムフック
 * @param value - 遅延させる値
 * @param delay - 遅延時間（ミリ秒）
 * @returns 遅延された値
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

```typescript
// __tests__/useDebounce.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });

    await waitFor(() => expect(result.current).toBe('updated'), {
      timeout: 600,
    });
  });
});
```

---

## 関連コマンド

- `/ai:generate-unit-tests`: テスト実装
- `/ai:setup-state-management`: 状態管理セットアップ
- `/ai:refactor`: カスタムフックへのロジック抽出
