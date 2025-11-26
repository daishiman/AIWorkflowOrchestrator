---
name: debounce-throttle-patterns
description: |
  イベント駆動システムにおける高頻度イベントの最適化パターン。
  デバウンス（連続イベントの最後のみ処理）とスロットリング（一定間隔で処理）を
  適切に使い分け、パフォーマンスとリソース効率を最大化する。

  使用タイミング:
  - ファイル監視で連続保存イベントを1回にまとめたい時
  - 高頻度APIコールを制限したい時
  - UIイベント（スクロール、リサイズ）を最適化したい時
  - イベント発火頻度とシステム応答性のトレードオフを検討する時
  - メモリ使用量を抑えながらイベント処理を行いたい時
version: 1.0.0
---

# Debounce & Throttle Patterns

## 概要

このスキルは、イベント駆動システムにおける高頻度イベントの最適化技術を提供します。デバウンスとスロットリングは、リソース効率とユーザーエクスペリエンスのバランスを取るための重要なパターンです。

---

## 核心概念

### デバウンス vs スロットリング

| 特性 | デバウンス | スロットリング |
|------|------------|----------------|
| **動作** | 最後のイベントのみ処理 | 一定間隔で処理 |
| **遅延** | イベント停止後に実行 | 最初のイベントで即座に実行可能 |
| **用途** | 入力完了待機、保存操作 | 継続的サンプリング、進捗通知 |
| **保証** | 最終状態を確実に処理 | 定期的な処理を保証 |

### 選択基準

```
連続イベントの「最終結果」のみ必要か？
├─ Yes → デバウンス
│   例: ファイル保存、検索入力、フォームバリデーション
│
└─ No → 定期的な「サンプリング」が必要か？
    ├─ Yes → スロットリング
    │   例: スクロール位置、マウス移動、ログ出力
    │
    └─ No → 最適化不要（全イベント処理）
```

---

## デバウンス実装

### 基本パターン

```typescript
/**
 * デバウンス関数
 * @param fn 実行する関数
 * @param delay 待機時間（ms）
 * @returns デバウンスされた関数
 */
function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}
```

### Leading Edge デバウンス

```typescript
/**
 * 最初のイベントで即座に実行し、その後は無視
 */
function debounceLeading<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let isLeading = true;

  return (...args: Parameters<T>) => {
    if (isLeading) {
      fn(...args);
      isLeading = false;
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      isLeading = true;
      timeoutId = null;
    }, delay);
  };
}
```

### キャンセル可能デバウンス

```typescript
interface DebouncedFunction<T extends (...args: any[]) => void> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
}

function debounceWithCancel<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
      lastArgs = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastArgs = null;
    }
  };

  debounced.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      fn(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debounced;
}
```

---

## スロットリング実装

### 基本パターン

```typescript
/**
 * スロットリング関数
 * @param fn 実行する関数
 * @param interval 実行間隔（ms）
 * @returns スロットリングされた関数
 */
function throttle<T extends (...args: any[]) => void>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastExecutionTime = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecutionTime;

    if (timeSinceLastExecution >= interval) {
      fn(...args);
      lastExecutionTime = now;
    } else if (!timeoutId) {
      // 次の実行タイミングまで待機
      timeoutId = setTimeout(() => {
        fn(...args);
        lastExecutionTime = Date.now();
        timeoutId = null;
      }, interval - timeSinceLastExecution);
    }
  };
}
```

### Trailing Edge 保証付きスロットリング

```typescript
/**
 * 最後のイベントも確実に処理するスロットリング
 */
function throttleWithTrailing<T extends (...args: any[]) => void>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastExecutionTime = 0;
  let pendingArgs: Parameters<T> | null = null;
  let timeoutId: NodeJS.Timeout | null = null;

  const execute = () => {
    if (pendingArgs) {
      fn(...pendingArgs);
      lastExecutionTime = Date.now();
      pendingArgs = null;
    }
  };

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecutionTime;

    pendingArgs = args;

    if (timeSinceLastExecution >= interval) {
      execute();
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        execute();
        timeoutId = null;
      }, interval - timeSinceLastExecution);
    }
  };
}
```

---

## ファイル監視での適用

### デバウンスの適用例

```typescript
import chokidar from 'chokidar';

const processFile = debounce((path: string) => {
  console.log(`Processing: ${path}`);
  // ファイル処理ロジック
}, 300);

const watcher = chokidar.watch('./input', {
  persistent: true,
  ignoreInitial: true,
});

watcher.on('add', processFile);
watcher.on('change', processFile);
```

### パス別デバウンス

```typescript
/**
 * ファイルパスごとに独立したデバウンスを適用
 */
function createPathDebouncer<T>(
  fn: (path: string, ...args: T[]) => void,
  delay: number
): (path: string, ...args: T[]) => void {
  const debouncers = new Map<string, (...args: T[]) => void>();

  return (path: string, ...args: T[]) => {
    if (!debouncers.has(path)) {
      debouncers.set(
        path,
        debounce((...a: T[]) => fn(path, ...a), delay)
      );
    }
    debouncers.get(path)!(...args);
  };
}

// 使用例
const processFilePath = createPathDebouncer((path: string) => {
  console.log(`Processing: ${path}`);
}, 300);

watcher.on('change', (path) => processFilePath(path));
```

---

## 推奨パラメータ

### デバウンス遅延

| ユースケース | 推奨値 | 理由 |
|-------------|--------|------|
| ファイル保存検知 | 100-300ms | 書き込み完了待機 |
| 検索入力 | 300-500ms | タイピング完了待機 |
| フォームバリデーション | 200-400ms | 入力完了待機 |
| ウィンドウリサイズ | 100-200ms | レイアウト再計算 |

### スロットリング間隔

| ユースケース | 推奨値 | 理由 |
|-------------|--------|------|
| スクロールイベント | 100-200ms | スムーズなUX |
| マウス移動 | 50-100ms | 追従性 |
| API レート制限 | 1000ms+ | サーバー負荷 |
| ログ出力 | 500-1000ms | ログ量制御 |
| 進捗通知 | 200-500ms | 適度な更新頻度 |

---

## 判断基準チェックリスト

### 設計時

- [ ] デバウンスとスロットリングのどちらが適切か判断したか？
- [ ] 遅延時間は応答性とリソース効率のバランスを考慮しているか？
- [ ] 最後のイベントが失われるリスクを評価したか？

### 実装時

- [ ] タイマーのクリーンアップ処理が実装されているか？
- [ ] メモリリーク防止策（Mapのクリーンアップ等）があるか？
- [ ] エラーハンドリングが最適化関数を通過しても機能するか？

### テスト時

- [ ] 高頻度イベントでイベントが適切にまとめられるか？
- [ ] 低頻度イベントで不必要な遅延が発生していないか？
- [ ] キャンセル・フラッシュ機能が正常に動作するか？

---

## アンチパターン

### ❌ 避けるべきパターン

```typescript
// 1. グローバル状態の共有
let globalTimeout: NodeJS.Timeout;
function badDebounce(fn: () => void) {
  clearTimeout(globalTimeout);
  globalTimeout = setTimeout(fn, 300);
}

// 2. クリーンアップ忘れ
watcher.on('change', debounce(handler, 300));
// シャットダウン時にタイマーがリークする

// 3. 過度に長い遅延
const debouncedSave = debounce(save, 5000); // 5秒は長すぎる
```

### ✅ 推奨パターン

```typescript
// 1. クロージャによる独立した状態
const debouncedHandler = debounceWithCancel(handler, 300);

// 2. 適切なクリーンアップ
process.on('SIGTERM', () => {
  debouncedHandler.flush(); // 保留中の処理を実行
  watcher.close();
});

// 3. 適切な遅延時間
const debouncedSave = debounce(save, 300); // 適切
```

---

## 関連スキル

- `.claude/skills/event-driven-file-watching/SKILL.md` - ファイル監視
- `.claude/skills/graceful-shutdown-patterns/SKILL.md` - シャットダウン処理
- `.claude/skills/context-optimization/SKILL.md` - パフォーマンス最適化

---

## リソース参照

```bash
# 実装パターン詳細
cat .claude/skills/debounce-throttle-patterns/resources/implementation-patterns.md

# パフォーマンス測定
cat .claude/skills/debounce-throttle-patterns/resources/performance-measurement.md

# TypeScriptテンプレート
cat .claude/skills/debounce-throttle-patterns/templates/debounce-throttle.ts
```
