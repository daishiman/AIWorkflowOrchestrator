# 実装ガイド: Zustand Store Hooks 無限ループ修正

## タスクID

UT-STORE-HOOKS-REFACTOR-001

## 更新日

2026-02-11

---

# Part 1: 概念的説明（中学生でも分かる説明）

## 1. 無限ループって何？

### 日常生活での例え

想像してください。あなたは「扉を開けなきゃ」と思っているロボットです。

1. ロボットが扉を開けます
2. 開けた瞬間、「扉が開いた！もう一度開けなきゃ！」と思います
3. また扉を開けます
4. 開けた瞬間、「扉が開いた！もう一度開けなきゃ！」と思います
5. これが永遠に続く...

これが「無限ループ」です。同じ動作を止まることなく繰り返し続けてしまう状態です。

### アプリでの症状

設定画面を開くと、画面がぐるぐる回り続けて止まらない。これは、アプリが「設定を読み込む」→「読み込んだから、また設定を読み込む」を無限に繰り返していたためです。

## 2. なぜ起きたの？

### 問題の原因（身近な例え）

図書館で本を借りるとき、司書さんが「本の情報」と「借りる手続きの説明」をまとめた紙をくれるとします。

**問題のある方法（以前のやり方）:**

司書さんが毎回、新しい紙を作って渡してきます。内容は同じでも、紙自体が毎回新しいので、あなたは「新しい紙だ！読み直さなきゃ！」と思ってしまいます。

これがアプリで起きていました。「設定情報」と「設定を変える機能」をまとめたパッケージを毎回新しく作って渡していたので、アプリは「新しいパッケージだ！また使わなきゃ！」と思って無限ループしていました。

## 3. どう直したの？

### 解決策（身近な例え）

**改善後の方法:**

司書さんに「本の情報だけください」「借りる手続きの説明だけください」と別々にお願いします。すると、司書さんは同じ棚から同じ情報を毎回渡してくれます。紙が新しくなることはないので、「これはさっきと同じだ、読み直す必要はない」と分かります。

アプリでも同じです。「設定情報」と「設定を変える機能」を別々に取得するようにしました。そうすることで、アプリは「これはさっきと同じだ、もう一度使う必要はない」と判断できるようになりました。

## 4. 何が良くなったの？

| 以前                                 | 今                           |
| ------------------------------------ | ---------------------------- |
| 設定画面がぐるぐる回り続ける         | すぐに設定画面が表示される   |
| LLM/スキル選択が無限に繰り返される   | 一度だけ正しく実行される     |
| ESLintの警告を無視する必要があった   | 警告を無視せずに正しく書ける |
| おまじないのようなコードが必要だった | シンプルで分かりやすいコード |

---

# Part 2: 技術者向け実装詳細

## 1. 問題の根本原因

### 1.1 合成Hookの参照不安定性

```typescript
// 問題のあったコード
export const useAuthModeStore = () =>
  useAppStore((state) => ({
    mode: state.mode,
    status: state.status,
    setMode: state.setMode,
    initializeAuthMode: state.initializeAuthMode,
  }));
```

このHookは呼び出されるたびに **新しいオブジェクトを生成** します。JavaScriptでは、内容が同じでもオブジェクトの参照は異なります。

```typescript
// 検証
{} === {} // false（新しいオブジェクトは常に異なる参照）
```

### 1.2 useEffectの依存配列との相互作用

```typescript
const { initializeAuthMode } = useAuthModeStore();

// ❌ 無限ループ発生
useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]);
```

1. `useAuthModeStore()`が新しいオブジェクトを返す
2. `initializeAuthMode`の参照が変わる
3. `useEffect`が「依存配列が変わった」と判断して再実行
4. `initializeAuthMode()`で状態が更新される
5. 再レンダリングが発生
6. 1に戻る（無限ループ）

## 2. 解決策

### 2.1 個別セレクタパターン（推奨・長期解決策）

```typescript
// store/index.ts に追加された個別セレクタ

// 状態セレクタ（単一の値を返す）
export const useAuthMode = () => useAppStore((state) => state.mode);
export const useAuthModeStatus = () => useAppStore((state) => state.status);
export const useAuthModeLoading = () => useAppStore((state) => state.isLoading);

// アクションセレクタ（Zustandのアクション参照は安定している）
export const useSetAuthMode = () => useAppStore((state) => state.setMode);
export const useInitializeAuthMode = () =>
  useAppStore((state) => state.initializeAuthMode);
```

### 2.2 なぜ個別セレクタで解決するのか

Zustandの仕様:

- **アクション関数の参照は不変**: Store作成時に一度だけ生成され、以降は同じ参照を返す
- **状態セレクタは値のみ返す**: プリミティブ値や既存オブジェクトの参照を返すため、不要な再生成がない

```typescript
// ✅ 無限ループなし
const initializeAuthMode = useInitializeAuthMode();

useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]); // 参照が安定しているため安全
```

### 2.3 useRefガードパターン（短期解決策・非推奨）

```typescript
// 短期的な回避策（新規コードでは使用しないこと）
const { initializeAuthMode } = useAuthModeStore();
const initRef = useRef(false);

useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    initializeAuthMode();
  }
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

**デメリット:**

- ESLint警告の抑制が必要
- 意図が分かりにくい
- 技術的負債になる

## 3. 修正対象ファイル一覧

### 3.1 個別セレクタ追加（store/index.ts）

| セレクタ種別             | 追加数 |
| ------------------------ | ------ |
| AuthModeSlice 状態       | 7      |
| AuthModeSlice アクション | 10     |
| LLMSlice 状態            | 6      |
| LLMSlice アクション      | 8      |
| LLMSlice 計算            | 2      |
| AgentSlice 状態          | 12     |
| AgentSlice アクション    | 8      |
| **合計**                 | **53** |

### 3.2 リファクタリング済みコンポーネント

| ファイル                              | 変更内容                                 |
| ------------------------------------- | ---------------------------------------- |
| `views/SettingsView/index.tsx`        | `useAuthModeStore()` → 5個の個別セレクタ |
| `components/llm/LLMSelectorPanel.tsx` | `useLLMStore()` → 10個の個別セレクタ     |

### 3.3 テストファイル

| ファイル                              | テスト数 |
| ------------------------------------- | -------- |
| `authModeSlice.selectors.test.ts`     | 49       |
| `llmSlice.selectors.test.ts`          | 45       |
| `agentSlice.selectors.test.ts`        | 48       |
| `store.selectors.integration.test.ts` | 14       |
| `store.selectors.edge-cases.test.ts`  | 25       |
| **合計**                              | **181**  |

## 4. 合成Hookの非推奨化

合成Hookは後方互換性のために維持しますが、`@deprecated`タグを追加しました。

```typescript
/**
 * @deprecated UT-STORE-HOOKS-REFACTOR-001: 無限ループ防止のため個別セレクタを使用してください。
 *
 * 推奨される個別セレクタ:
 * - 状態: useAuthMode, useAuthModeStatus, useAuthModeLoading, ...
 * - アクション: useSetAuthMode, useInitializeAuthMode, ...
 *
 * @see 06-known-pitfalls.md#P31
 */
export const useAuthModeStore = () => useAppStore((state) => ({ ... }));
```

## 5. 移行パターン

### 5.1 Before（合成Hook使用）

```typescript
import { useAuthModeStore } from "../../store";

const { mode, status, isLoading, setMode, initializeAuthMode } =
  useAuthModeStore();

const initRef = useRef(false);
useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    initializeAuthMode();
  }
}, []);
```

### 5.2 After（個別セレクタ使用）

```typescript
import {
  useAuthMode,
  useAuthModeStatus,
  useAuthModeLoading,
  useSetAuthMode,
  useInitializeAuthMode,
} from "../../store";

const mode = useAuthMode();
const status = useAuthModeStatus();
const isLoading = useAuthModeLoading();
const setMode = useSetAuthMode();
const initializeAuthMode = useInitializeAuthMode();

useEffect(() => {
  initializeAuthMode();
}, [initializeAuthMode]); // 安全に依存配列に含められる
```

## 6. テスト追加ポイント

### 6.1 関数参照安定性テスト

```typescript
it("アクションセレクタの参照が再レンダリング後も安定していること", () => {
  const { result, rerender } = renderHook(() => useSetAuthMode());

  const firstReference = result.current;
  rerender();
  const secondReference = result.current;

  expect(firstReference).toBe(secondReference); // 同一参照
});
```

### 6.2 無限ループ防止テスト

```typescript
it("アクションセレクタを依存配列に含めても無限ループしないこと", () => {
  let renderCount = 0;
  const MAX_RENDERS = 10;

  const TestComponent = () => {
    renderCount++;
    if (renderCount > MAX_RENDERS) throw new Error("無限ループ検出");

    const setMode = useSetAuthMode();
    useEffect(() => {
      // このuseEffectがアクション参照の変更で無限に呼ばれないこと
    }, [setMode]);

    return null;
  };

  render(<TestComponent />);
  expect(renderCount).toBeLessThan(MAX_RENDERS);
});
```

## 7. 参照資料

| 資料                     | パス                                                  |
| ------------------------ | ----------------------------------------------------- |
| Zustand公式ガイド        | https://docs.pmnd.rs/zustand/guides/prevent-rerenders |
| 状態管理ルール           | `.claude/rules/03-state-management.md`                |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md#P31`              |
| アーキテクチャ設計書     | `outputs/phase-2/architecture-design.md`              |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md`               |
