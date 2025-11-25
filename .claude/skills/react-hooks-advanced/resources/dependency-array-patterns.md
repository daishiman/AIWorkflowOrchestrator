# 依存配列パターン

## 概要

useEffect、useCallback、useMemoの依存配列を正しく管理するためのパターンとガイドラインです。

## 基本原則

### 1. 完全性の原則

すべての外部変数（コンポーネントスコープから参照する変数）を依存配列に含める。

```typescript
// ❌ 悪い例: userIdが欠落
useEffect(() => {
  fetchUser(userId);
}, []);

// ✅ 良い例: すべての依存を含む
useEffect(() => {
  fetchUser(userId);
}, [userId]);
```

### 2. ESLint exhaustive-deps準拠

`eslint-plugin-react-hooks`のexhaustive-depsルールに従う。

```json
{
  "rules": {
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## 依存配列のパターン

### パターン1: 依存配列なし（毎回実行）

```typescript
useEffect(() => {
  console.log('Every render');
}); // 依存配列なし = 毎回実行
```

**使用ケース**: ほぼなし（通常は避ける）

### パターン2: 空配列（マウント時のみ）

```typescript
useEffect(() => {
  // マウント時の初期化
  const subscription = api.subscribe();

  return () => {
    // アンマウント時のクリーンアップ
    subscription.unsubscribe();
  };
}, []); // 空配列 = マウント時のみ
```

**使用ケース**:
- 購読の開始/停止
- イベントリスナーの登録/解除
- 初期データのフェッチ（変化しない条件の場合）

**注意**: 空配列使用時は意図をコメントで明記

```typescript
useEffect(() => {
  initializeAnalytics();
  // 依存配列が空なのは意図的: 初期化は一度だけ行う
}, []);
```

### パターン3: 依存ありの配列

```typescript
useEffect(() => {
  fetchUserData(userId);
}, [userId]); // userIdが変わったら再実行
```

**使用ケース**: 大部分のuseEffect

## 依存配列の最適化パターン

### パターンA: 関数を依存から除外

```typescript
// ❌ 悪い例: 毎回新しい関数が作られ無限ループ
const fetchData = () => api.get(endpoint);
useEffect(() => {
  fetchData();
}, [fetchData]);

// ✅ 良い例1: useCallbackでメモ化
const fetchData = useCallback(() => {
  api.get(endpoint);
}, [endpoint]);
useEffect(() => {
  fetchData();
}, [fetchData]);

// ✅ 良い例2: 関数をuseEffect内に移動
useEffect(() => {
  const fetchData = () => api.get(endpoint);
  fetchData();
}, [endpoint]);
```

### パターンB: オブジェクトの依存

```typescript
// ❌ 悪い例: オブジェクトは毎回新しい参照
const options = { limit: 10, offset };
useEffect(() => {
  fetch(options);
}, [options]); // 毎回実行される

// ✅ 良い例1: プリミティブ値を依存に
useEffect(() => {
  fetch({ limit: 10, offset });
}, [offset]);

// ✅ 良い例2: useMemoでメモ化
const options = useMemo(() => ({ limit: 10, offset }), [offset]);
useEffect(() => {
  fetch(options);
}, [options]);
```

### パターンC: Refを使った参照

```typescript
// 再レンダリングを起こさない値はrefで保持
const callbackRef = useRef(callback);
callbackRef.current = callback;

useEffect(() => {
  const handler = () => callbackRef.current();
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []); // refは依存に含めない
```

## トラブルシューティング

### 問題1: 無限ループ

**症状**: useEffectが無限に実行される

**原因チェックリスト**:
- [ ] 依存配列に毎回新しいオブジェクト/配列がある
- [ ] useEffectが依存を更新している
- [ ] 依存配列の関数がメモ化されていない

**解決策**:
```typescript
// 原因: useEffect内で状態を更新し、その状態が依存に
useEffect(() => {
  setData(transform(data)); // dataを更新
}, [data]); // dataが依存 → 無限ループ

// 解決: 関数型更新を使用
useEffect(() => {
  setData(prev => transform(prev));
}, []); // 依存なし
```

### 問題2: 古いクロージャ

**症状**: useEffect内で古い値を参照してしまう

**原因**: 依存配列から値が漏れている

```typescript
// ❌ 悪い例: countが古い
useEffect(() => {
  const id = setInterval(() => {
    console.log(count); // 常に初期値
  }, 1000);
  return () => clearInterval(id);
}, []); // countが依存から漏れている

// ✅ 良い例: refを使用
const countRef = useRef(count);
countRef.current = count;
useEffect(() => {
  const id = setInterval(() => {
    console.log(countRef.current); // 最新の値
  }, 1000);
  return () => clearInterval(id);
}, []);
```

### 問題3: 過剰な再実行

**症状**: useEffectが必要以上に実行される

**解決策**:
```typescript
// 条件付き実行
useEffect(() => {
  if (shouldFetch) {
    fetchData();
  }
}, [shouldFetch]);

// または早期リターン
useEffect(() => {
  if (!userId) return;
  fetchUser(userId);
}, [userId]);
```

## ベストプラクティスまとめ

1. **ESLintに従う**: exhaustive-depsの警告を無視しない
2. **プリミティブ優先**: 可能ならプリミティブ値を依存に
3. **関数は内部に**: useEffect内で関数を定義
4. **コメントで意図**: 空配列の場合は必ず意図を明記
5. **refで回避**: 再レンダリング不要な値はrefを使用
