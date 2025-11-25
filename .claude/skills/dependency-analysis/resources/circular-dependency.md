# 循環依存の検出と解消

## 循環依存とは

モジュールA → B → C → A のように、依存関係が循環している状態。

```
    A ──────────▶ B
    ▲             │
    │             │
    │             ▼
    └──────────── C
```

## 問題点

### 技術的問題

1. **初期化順序の不定**: どちらを先にロードすべきか不明
2. **未定義参照**: ロード時にundefinedが発生
3. **ホットリロード失敗**: 変更検知の無限ループ
4. **バンドルサイズ増大**: Tree-shakingが効かない

### 設計的問題

1. **責務の混乱**: モジュール間の境界が曖昧
2. **テスト困難**: 単独でのテストが困難
3. **変更の波及**: 一箇所の変更が広範囲に影響

## 検出方法

### madge による検出

```bash
# 循環依存のみを表示
madge src/ --circular

# 出力例
# Circular dependencies found!
# 1) src/services/auth.ts > src/utils/token.ts > src/services/auth.ts
```

### dependency-cruiser による検出

```bash
# 循環依存ルールを設定
depcruise src --include-only "^src" --validate .dependency-cruiser.js
```

### 手動検出スクリプト

```javascript
// check-circular.mjs
import { readdir, readFile, stat } from 'fs/promises';
import { join, dirname, resolve } from 'path';

class CircularDetector {
  constructor() {
    this.graph = new Map();
    this.visiting = new Set();
    this.visited = new Set();
    this.cycles = [];
  }

  addDependency(from, to) {
    if (!this.graph.has(from)) {
      this.graph.set(from, []);
    }
    this.graph.get(from).push(to);
  }

  detectCycles() {
    for (const node of this.graph.keys()) {
      if (!this.visited.has(node)) {
        this.dfs(node, []);
      }
    }
    return this.cycles;
  }

  dfs(node, path) {
    if (this.visiting.has(node)) {
      const cycleStart = path.indexOf(node);
      this.cycles.push(path.slice(cycleStart).concat(node));
      return;
    }

    if (this.visited.has(node)) return;

    this.visiting.add(node);
    path.push(node);

    const deps = this.graph.get(node) || [];
    for (const dep of deps) {
      this.dfs(dep, [...path]);
    }

    this.visiting.delete(node);
    this.visited.add(node);
  }
}
```

## 解消パターン

### 1. 依存性逆転（Dependency Inversion）

```typescript
// ❌ Before: 循環依存
// auth.ts
import { generateToken } from './token';
export function login() { /* ... */ }

// token.ts
import { getCurrentUser } from './auth';
export function generateToken() { /* ... */ }
```

```typescript
// ✅ After: インターフェースで分離
// interfaces/auth.ts
export interface IAuthService {
  getCurrentUser(): User;
}

// token.ts
import { IAuthService } from './interfaces/auth';
export class TokenService {
  constructor(private auth: IAuthService) {}
  generateToken() { /* ... */ }
}

// auth.ts
import { IAuthService } from './interfaces/auth';
export class AuthService implements IAuthService {
  getCurrentUser(): User { /* ... */ }
}
```

### 2. 共通モジュールの抽出

```typescript
// ❌ Before: 循環依存
// user.ts
import { Order } from './order';
export class User { orders: Order[]; }

// order.ts
import { User } from './user';
export class Order { user: User; }
```

```typescript
// ✅ After: 共通エンティティを抽出
// types/entities.ts
export interface IUser { id: string; }
export interface IOrder { id: string; userId: string; }

// user.ts
import { IUser, IOrder } from './types/entities';
export class User implements IUser { /* ... */ }

// order.ts
import { IOrder } from './types/entities';
export class Order implements IOrder { /* ... */ }
```

### 3. イベント駆動への変更

```typescript
// ❌ Before: 直接呼び出し
// payment.ts
import { notifyUser } from './notification';
export function processPayment() {
  // 支払い処理
  notifyUser('Payment complete');
}

// notification.ts
import { getPaymentStatus } from './payment';
export function notifyUser(msg: string) { /* ... */ }
```

```typescript
// ✅ After: イベント駆動
// events.ts
export const eventBus = new EventEmitter();

// payment.ts
import { eventBus } from './events';
export function processPayment() {
  // 支払い処理
  eventBus.emit('payment:complete', { /* ... */ });
}

// notification.ts
import { eventBus } from './events';
eventBus.on('payment:complete', (data) => {
  notifyUser('Payment complete');
});
```

### 4. 遅延ロード（Lazy Loading）

```typescript
// ❌ Before: トップレベルimport
import { heavy } from './heavy-module';

// ✅ After: 動的import
export async function useHeavyFeature() {
  const { heavy } = await import('./heavy-module');
  return heavy();
}
```

## CI/CD での検証

```yaml
# .github/workflows/check-deps.yml
name: Dependency Check
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install -g madge
      - run: madge src/ --circular --warning
        # 循環依存があれば失敗
```

## チェックリスト

- [ ] 循環依存検出ツールをCI/CDに組み込んでいるか
- [ ] 新しい依存追加時に循環をチェックしているか
- [ ] 既存の循環依存の解消計画があるか
- [ ] インターフェースによる分離を検討したか
