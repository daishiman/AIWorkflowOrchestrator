# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 8                     |
| 機能名 | custom-environment-ui |
| 作成日 | 2026-01-13            |

## 目的

コードの品質を向上させ、保守性・可読性を改善する（TDDのRefactorフェーズ）。

## 実行タスク

- コード整理: 重複除去、命名改善、構造改善
- パフォーマンス最適化: 不要な再レンダリング防止、メモ化
- アクセシビリティ改善: ARIA属性、キーボードナビゲーション

## 参照資料

| 資料名                 | パス                                                                         | 説明         |
| ---------------------- | ---------------------------------------------------------------------------- | ------------ |
| UIコンポーネントガイド | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | UI設計基準   |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | 設計パターン |

---

## リファクタリング対象

### 1. コンポーネント構造

| 対象                   | リファクタリング内容               |
| ---------------------- | ---------------------------------- |
| SplitLayout            | カスタムフック抽出（useSplitDrag） |
| HTMLPreviewEnvironment | CSP生成ロジックの分離              |
| ExecutionEnvironment   | 環境コンポーネントの遅延ロード     |
| AgentExecutionView     | プレビュー表示ロジックのフック化   |

### 2. パフォーマンス最適化

```typescript
// メモ化の適用例

// Before
const sanitizedContent = sanitizeHTML(content);

// After
const sanitizedContent = useMemo(() => sanitizeHTML(content), [content]);

// コールバックのメモ化
const handleRatioChange = useCallback(
  (ratio: number) => {
    setSplitRatio(ratio);
    localStorage.setItem("splitRatio", String(ratio));
  },
  [setSplitRatio],
);
```

### 3. カスタムフック抽出

```typescript
// useSplitDrag.ts
export const useSplitDrag = (options: SplitDragOptions) => {
  const [ratio, setRatio] = useState(options.initialRatio);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    // 比率計算
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    options.onRatioChange?.(ratio);
  }, [ratio, options.onRatioChange]);

  return { ratio, handleMouseDown, handleMouseMove, handleMouseUp };
};
```

### 4. アクセシビリティ改善

```typescript
// SplitLayout - アクセシビリティ強化
<div
  role="separator"
  aria-orientation="vertical"
  aria-valuenow={ratio}
  aria-valuemin={minRatio}
  aria-valuemax={maxRatio}
  tabIndex={0}
  onKeyDown={handleKeyDown}
  className="split-divider"
>
  <span className="sr-only">
    分割比率を調整: 現在{ratio}%、矢印キーで変更
  </span>
</div>
```

---

## リファクタリングチェックリスト

| 項目                             | 確認 |
| -------------------------------- | ---- |
| 重複コードがない                 | □    |
| 関数は単一責任を持つ             | □    |
| 適切なメモ化が適用されている     | □    |
| ARIA属性が設定されている         | □    |
| キーボード操作が可能             | □    |
| エラーバウンダリが設定されている | □    |
| 既存テストが引き続きパスする     | □    |

---

## 統合テスト連携【必須】

リファクタリング後も統合ポイントが正しく動作することを確認する:

| 統合ポイント           | リファクタリング後の確認事項            |
| ---------------------- | --------------------------------------- |
| agentSlice拡張         | アクションの動作が変わっていない        |
| SplitLayout↔親         | onRatioChangeの呼び出しタイミングが正確 |
| ExecutionEnvironment   | 遅延ロード後も正しくレンダリング        |
| HTMLPreviewEnvironment | CSP生成ロジック分離後も安全性維持       |

---

## 成果物

| 成果物                 | パス                                    | 説明           |
| ---------------------- | --------------------------------------- | -------------- |
| リファクタリングログ   | `outputs/phase-8/refactoring-log.md`    | 変更履歴       |
| カスタムフック         | `outputs/phase-8/custom-hooks/`         | 抽出したフック |
| パフォーマンスレポート | `outputs/phase-8/performance-report.md` | 最適化結果     |

---

## 完了条件

- [ ] 重複コードが除去されている
- [ ] カスタムフックが適切に抽出されている
- [ ] パフォーマンス最適化が適用されている
- [ ] アクセシビリティが改善されている
- [ ] すべての既存テストがパスする
- [ ] 統合ポイントの動作が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. コードレビュー（重複・改善点の特定）
2. カスタムフックの抽出（useSplitDrag等）
3. メモ化の適用（useMemo, useCallback）
4. アクセシビリティ改善（ARIA属性追加）
5. エラーバウンダリの設定
6. 既存テストの確認
7. 統合ポイントの動作確認
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# テスト確認（リファクタリング後）
pnpm --filter @repo/desktop test

# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/custom-environment-ui --phase 8
```

## 次のPhase

Phase 9: 品質チェック
