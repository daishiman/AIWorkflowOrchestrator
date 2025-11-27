---
name: performance-optimization-react
description: |
  Reactアプリケーションのパフォーマンス最適化を専門とするスキル。
  ダン・アブラモフの思想に基づき、測定駆動の最適化アプローチを提供します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/performance-optimization-react/resources/re-rendering-patterns.md`: 再レンダリングパターン
  - `.claude/skills/performance-optimization-react/resources/react-memo-guide.md`: React.memo活用ガイド
  - `.claude/skills/performance-optimization-react/resources/profiler-measurement.md`: React DevTools Profiler測定方法
  - `.claude/skills/performance-optimization-react/resources/context-splitting.md`: Context分割戦略
  - `.claude/skills/performance-optimization-react/scripts/measure-performance.mjs`: パフォーマンス測定スクリプト
  - `.claude/skills/performance-optimization-react/templates/optimization-checklist.md`: 最適化チェックリスト

  専門分野:
  - 再レンダリング最適化: 不要な再レンダリングの検出と防止
  - メモ化戦略: React.memo、useMemo、useCallbackの適切な使用
  - 測定駆動最適化: React DevTools Profilerによる定量的分析
  - Context最適化: Context分割とパフォーマンス考慮設計

  使用タイミング:
  - 不要な再レンダリングを検出・防止する時
  - React.memoやメモ化の適用を判断する時
  - React DevTools Profilerで測定する時
  - Context APIのパフォーマンス問題を解決する時

  Use proactively when optimizing React performance, reducing re-renders,
  or measuring component rendering performance.
version: 1.0.0
---

# Performance Optimization React

## 概要

このスキルは、Redux開発者でありReact Core Teamメンバーであるダン・アブラモフの測定駆動最適化思想に基づき、
Reactアプリケーションのパフォーマンス最適化を体系的に実現するための知識を提供します。

**核心哲学**: 測定に基づいて最適化し、早すぎる最適化を避ける

**主要な価値**:

- 再レンダリングの原因を理解し、適切に制御する
- React DevTools Profilerによる定量的なパフォーマンス測定
- メモ化の適切な適用によるレンダリング効率化
- Context分割による不要な更新の防止

## リソース構造

```
performance-optimization-react/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── re-rendering-patterns.md               # 再レンダリングパターン
│   ├── react-memo-guide.md                    # React.memo活用ガイド
│   ├── profiler-measurement.md                # React DevTools Profiler測定方法
│   └── context-splitting.md                   # Context分割戦略
├── scripts/
│   └── measure-performance.mjs                # パフォーマンス測定スクリプト
└── templates/
    └── optimization-checklist.md              # 最適化チェックリスト
```

## コマンドリファレンス

### リソース読み取り

```bash
# 再レンダリングパターン
cat .claude/skills/performance-optimization-react/resources/re-rendering-patterns.md

# React.memo活用ガイド
cat .claude/skills/performance-optimization-react/resources/react-memo-guide.md

# React DevTools Profiler測定方法
cat .claude/skills/performance-optimization-react/resources/profiler-measurement.md

# Context分割戦略
cat .claude/skills/performance-optimization-react/resources/context-splitting.md
```

### スクリプト実行

```bash
# パフォーマンス測定
node .claude/skills/performance-optimization-react/scripts/measure-performance.mjs <component.tsx>
```

### テンプレート参照

```bash
# 最適化チェックリスト
cat .claude/skills/performance-optimization-react/templates/optimization-checklist.md
```

## いつ使うか

### シナリオ 1: 不要な再レンダリングの検出

**状況**: コンポーネントが頻繁に再レンダリングされている

**適用条件**:

- [ ] React DevTools Profilerで過剰なレンダリングを確認
- [ ] 親コンポーネントの更新が子に伝播している
- [ ] Contextの値変更で広範囲のコンポーネントが更新される

**期待される成果**: 再レンダリング原因の特定と最適化戦略

### シナリオ 2: メモ化の適切な適用

**状況**: React.memoやuseMemoの適用を検討している

**適用条件**:

- [ ] パフォーマンス問題が測定済み
- [ ] コールバック関数を子コンポーネントに渡している
- [ ] 計算コストの高い処理がある

**期待される成果**: 測定に基づいた適切なメモ化の実装

### シナリオ 3: Context最適化

**状況**: Context更新で不要なコンポーネントが再レンダリングされる

**適用条件**:

- [ ] Contextに複数の値が含まれている
- [ ] 一部の値のみが頻繁に更新される
- [ ] Context使用コンポーネント数が多い

**期待される成果**: Context分割による最適化

## 知識領域

### 1. 再レンダリングの原因と制御

**再レンダリングが発生する4つの原因**:

1. **状態の更新**: useState、useReducerによる状態変更
2. **親の再レンダリング**: 親コンポーネントが再レンダリングされると子も再レンダリング
3. **Contextの値変更**: useContextで使用しているContext値が変わる
4. **Propsの変更**: コンポーネントに渡されるPropsが変わる

**制御戦略**:

- **React.memo**: Propsが変わらない限り再レンダリングしない
- **useCallback**: コールバック関数のメモ化
- **useMemo**: 計算結果のメモ化
- **Context分割**: 頻繁に更新される値と静的な値を別Contextに分離

**詳細リソース**:
```bash
cat .claude/skills/performance-optimization-react/resources/re-rendering-patterns.md
```

### 2. React.memoの適切な使用

**React.memoを使うべき場合**:

- [ ] コンポーネントが頻繁に再レンダリングされる
- [ ] Propsの比較コストがレンダリングコストより低い
- [ ] 測定でパフォーマンス改善が確認できる

**React.memoを避けるべき場合**:

- [ ] Propsが毎回変わる（メモ化の効果なし）
- [ ] レンダリングコストが低い（最適化の必要性低い）
- [ ] 測定なしの早すぎる最適化

**比較関数のカスタマイズ**:

```typescript
const MyComponent = React.memo(
  ({ data }) => {
    // コンポーネント実装
  },
  (prevProps, nextProps) => {
    // trueを返すと再レンダリングをスキップ
    return prevProps.data.id === nextProps.data.id;
  }
);
```

**詳細リソース**:
```bash
cat .claude/skills/performance-optimization-react/resources/react-memo-guide.md
```

### 3. 測定駆動の最適化アプローチ

**React DevTools Profilerの使用手順**:

1. **測定の開始**: Profilerタブで記録開始
2. **操作の実行**: 最適化したい操作を実行
3. **結果の分析**:
   - Flamegraph: 各コンポーネントのレンダリング時間
   - Ranked: レンダリング時間の長い順にソート
   - Component: 特定コンポーネントの詳細
4. **ボトルネックの特定**: 最もレンダリング時間が長いコンポーネント
5. **最適化の実施**: React.memo、useMemo、useCallbackの適用
6. **効果の測定**: 再度測定して改善を確認

**測定指標**:

- **レンダリング時間**: コンポーネントごとの処理時間
- **レンダリング回数**: 同一操作中の再レンダリング回数
- **コミット時間**: React が DOM に変更を反映する時間

**詳細リソース**:
```bash
cat .claude/skills/performance-optimization-react/resources/profiler-measurement.md
```

### 4. Context分割とパフォーマンス

**Context分割の判断基準**:

- [ ] Contextに複数の値が含まれている
- [ ] 一部の値のみが頻繁に更新される
- [ ] Context使用コンポーネントが10個以上ある

**分割パターン**:

**パターン1: 読み取り専用と書き込み可能を分離**

```typescript
// 読み取り専用Context（静的）
const ThemeContext = createContext<Theme>(defaultTheme);

// 書き込み可能Context（動的）
const ThemeDispatchContext = createContext<ThemeDispatch>(() => {});
```

**パターン2: 更新頻度による分離**

```typescript
// 頻繁に更新される状態
const CartItemsContext = createContext<CartItem[]>([]);

// 静的な設定
const CartConfigContext = createContext<CartConfig>(defaultConfig);
```

**パターン3: ドメインによる分離**

```typescript
// ユーザー認証
const AuthContext = createContext<Auth>(null);

// アプリケーション設定
const SettingsContext = createContext<Settings>(defaultSettings);
```

**詳細リソース**:
```bash
cat .claude/skills/performance-optimization-react/resources/context-splitting.md
```

## ワークフロー

### Phase 1: パフォーマンス問題の特定

#### ステップ1: React DevTools Profilerで測定

**目的**: 定量的にパフォーマンス問題を特定

**手順**:

1. React DevTools Profilerを開く
2. 記録を開始
3. 最適化したい操作を実行
4. 記録を停止
5. Flamegraphで長時間レンダリングされるコンポーネントを特定

**判断基準**:

- [ ] レンダリング時間が100ms以上のコンポーネントがあるか？
- [ ] 同一操作中に10回以上再レンダリングされるコンポーネントがあるか？
- [ ] 不要な再レンダリングが発生しているか？

#### ステップ2: 再レンダリング原因の分析

**目的**: なぜ再レンダリングが発生しているかを理解

**確認ポイント**:

1. **親の再レンダリング**: 親コンポーネントの更新が原因か？
2. **Contextの値変更**: Context値の変更が原因か？
3. **Propsの変更**: 不要なPropsの変更があるか？
4. **状態の更新**: 状態更新のロジックに問題があるか？

**判断基準**:

- [ ] 再レンダリングの原因が特定されたか？
- [ ] 原因は複数あるか？
- [ ] 最も影響が大きい原因は何か？

### Phase 2: 最適化戦略の選択

#### ステップ3: 最適化手法の選定

**目的**: 問題に応じた最適な手法を選択

**選択マトリックス**:

| 原因 | 推奨手法 | 適用条件 |
|------|---------|---------|
| 親の再レンダリング | React.memo | Propsが変わらないことが多い |
| コールバックProps | useCallback | コールバックが子に渡される |
| 計算コスト高い | useMemo | 計算が重く、依存が少ない |
| Context頻繁更新 | Context分割 | 一部の値のみ頻繁に更新 |

**判断基準**:

- [ ] 最適化手法は問題に適合しているか？
- [ ] 実装コストは妥当か？
- [ ] 副作用やリスクはないか？

#### ステップ4: 実装の優先順位付け

**目的**: 最も効果の高い最適化から実施

**優先順位基準**:

1. **高優先度**: レンダリング時間が長い（100ms以上）
2. **中優先度**: 再レンダリング回数が多い（10回以上）
3. **低優先度**: 測定結果が境界線上（50-100ms、5-10回）

**判断基準**:

- [ ] 優先順位は定量的データに基づいているか？
- [ ] 実装の順序は適切か？

### Phase 3: 最適化の実装

#### ステップ5: React.memoの適用

**目的**: Propsが変わらない限り再レンダリングをスキップ

**実装パターン**:

```typescript
// 基本形
const MyComponent = React.memo(({ data }) => {
  return <div>{data.name}</div>;
});

// カスタム比較
const MyComponent = React.memo(
  ({ data }) => <div>{data.name}</div>,
  (prev, next) => prev.data.id === next.data.id
);
```

**判断基準**:

- [ ] Propsの比較は適切か？
- [ ] メモ化の効果は測定されたか？

#### ステップ6: useCallbackとuseMemoの適用

**目的**: コールバック関数と計算結果のメモ化

**useCallbackの適用**:

```typescript
const handleClick = useCallback(() => {
  // クリック処理
}, [/* 依存配列 */]);
```

**useMemoの適用**:

```typescript
const expensiveValue = useMemo(() => {
  // 重い計算
  return computeExpensiveValue(data);
}, [data]);
```

**判断基準**:

- [ ] 依存配列は正確か？
- [ ] メモ化の効果は測定されたか？

#### ステップ7: Context分割の実装

**目的**: Context更新による不要な再レンダリングを防止

**実装パターン**:

```typescript
// 分割前
const AppContext = createContext({
  user: null,
  theme: 'light',
  cart: []
});

// 分割後
const UserContext = createContext(null);
const ThemeContext = createContext('light');
const CartContext = createContext([]);
```

**判断基準**:

- [ ] Context分割は適切か？
- [ ] 各Contextの責務は明確か？
- [ ] 分割後のパフォーマンス改善は測定されたか？

### Phase 4: 効果の測定と検証

#### ステップ8: 最適化後の測定

**目的**: 最適化の効果を定量的に確認

**測定手順**:

1. 最適化前と同じ操作を実行
2. React DevTools Profilerで記録
3. 最適化前と比較

**比較指標**:

- **レンダリング時間の削減率**: 目標50%以上
- **再レンダリング回数の削減**: 目標70%以上
- **体感パフォーマンス**: ユーザー体験の改善

**判断基準**:

- [ ] 最適化前後で測定を実施したか？
- [ ] 目標削減率を達成したか？
- [ ] 副作用や新しい問題は発生していないか？

#### ステップ9: 最適化チェックリストの確認

**目的**: 最適化が適切に実施されたことを保証

**チェック項目**:

```bash
cat .claude/skills/performance-optimization-react/templates/optimization-checklist.md
```

- [ ] React DevTools Profilerで測定済み
- [ ] 最適化前後の比較データあり
- [ ] React.memoは測定に基づいて適用
- [ ] useCallbackとuseMemoの依存配列は正確
- [ ] Context分割は適切な粒度
- [ ] 副作用や新しい問題なし
- [ ] コードレビュー完了

## 関連スキル

このスキルは以下のスキルと密接に連携します:

- **react-hooks-advanced** (`.claude/skills/react-hooks-advanced/SKILL.md`): useCallbackとuseMemoの依存配列管理
- **custom-hooks-patterns** (`.claude/skills/custom-hooks-patterns/SKILL.md`): カスタムフック内でのメモ化戦略
- **state-lifting** (`.claude/skills/state-lifting/SKILL.md`): 状態配置とContext設計

## ベストプラクティス

### 測定駆動の最適化

**原則**: 測定なしに最適化しない

**理由**:
- 早すぎる最適化はコードを複雑にする
- 実際のボトルネックは予想と異なることが多い
- 測定により最適化の効果を確認できる

### React.memoの適用判断

**適用すべき場合**:
- [ ] 測定でパフォーマンス問題を確認済み
- [ ] Propsが変わらないことが多い
- [ ] レンダリングコストが高い

**適用を避けるべき場合**:
- [ ] 測定なしの早すぎる最適化
- [ ] Propsが毎回変わる
- [ ] レンダリングコストが低い

### Context分割の基準

**分割すべき場合**:
- [ ] 一部の値のみが頻繁に更新される
- [ ] Context使用コンポーネントが10個以上
- [ ] パフォーマンス問題が測定で確認済み

**分割を避けるべき場合**:
- [ ] すべての値が同時に更新される
- [ ] Context使用コンポーネントが少ない（5個以下）
- [ ] パフォーマンス問題がない

## トラブルシューティング

### 問題1: React.memoが効かない

**症状**: React.memoを適用しても再レンダリングされる

**原因**:
- Propsに毎回新しいオブジェクトや関数が渡されている
- 親のuseCallbackやuseMemoが適切でない

**解決策**:
1. Propsの変更を確認（React DevTools）
2. 親でuseCallbackやuseMemoを適用
3. カスタム比較関数を実装

### 問題2: useMemoが効果なし

**症状**: useMemoを適用しても処理が遅い

**原因**:
- 依存配列が毎回変わっている
- メモ化のオーバーヘッドが計算コストより高い

**解決策**:
1. 依存配列を見直す
2. 計算コストを測定
3. 本当にuseMemoが必要か再検討

### 問題3: Context分割後も遅い

**症状**: Context分割後もパフォーマンス改善がない

**原因**:
- 分割粒度が適切でない
- 頻繁に更新される値が分離されていない

**解決策**:
1. Context値の更新頻度を確認
2. さらに細かく分割
3. useContextの使用箇所を確認

## 変更履歴

### v1.0.0 (2025-11-27)
- 初版リリース
- state-manager.mdからパフォーマンス最適化知識を分離
- React DevTools Profiler測定方法を体系化
- Context分割戦略を追加
