# Phase 4: テスト仕様書

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase      | 4                        |
| タスクID   | TASK-5-1                 |
| タスク名   | SkillAPI 実装（Preload） |
| 作成日     | 2026-01-27               |
| ステータス | 完了                     |

---

## 1. テスト戦略

### 1.1 テスト種別

| 種別           | 目的                       | ファイル                        |
| -------------- | -------------------------- | ------------------------------- |
| ユニットテスト | 各メソッドの動作検証       | `skill-api.test.ts`             |
| 権限テスト     | 権限関連メソッドの動作検証 | `skill-api.permission.test.ts`  |
| チャネルテスト | IPCチャネル定義の検証      | `channels.skill-import.test.ts` |

### 1.2 テストフレームワーク

- **フレームワーク**: Vitest
- **モック**: `vi.fn()`, `vi.mock()`, `vi.stubGlobal()`
- **アサーション**: Vitest built-in (`expect`)

### 1.3 テストカバレッジ目標

| 指標           | 目標値  |
| -------------- | ------- |
| 行カバレッジ   | 80%以上 |
| 分岐カバレッジ | 75%以上 |
| 関数カバレッジ | 90%以上 |

---

## 2. モック設計

### 2.1 ipcRenderer モック

```typescript
vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
}));
```

### 2.2 window.skillAPI モック

```typescript
const mockSkillAPI = {
  execute: vi.fn(),
  onStream: vi.fn(),
  abort: vi.fn(),
  getExecutionStatus: vi.fn(),
  onPermissionRequest: vi.fn(),
  sendPermissionResponse: vi.fn(),
};

beforeEach(() => {
  vi.stubGlobal("skillAPI", mockSkillAPI);
  vi.clearAllMocks();
});
```

### 2.3 チャネル定義モック

```typescript
// 実際のチャネル定義を使用（モック不要）
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "../channels";
```

---

## 3. テスト対象API

### 3.1 invoke系メソッド（R→M）

| メソッド                 | チャネル                    | テスト観点                     |
| ------------------------ | --------------------------- | ------------------------------ |
| `execute`                | `skill:execute`             | リクエスト送信、レスポンス受信 |
| `abort`                  | `skill:abort`               | 中断成功/失敗                  |
| `getExecutionStatus`     | `skill:get-status`          | 状態取得、null返却             |
| `sendPermissionResponse` | `skill:permission:response` | 応答送信                       |

### 3.2 on系メソッド（M→R）

| メソッド              | チャネル                   | テスト観点                             |
| --------------------- | -------------------------- | -------------------------------------- |
| `onStream`            | `skill:stream`             | 購読登録、コールバック、クリーンアップ |
| `onPermissionRequest` | `skill:permission:request` | 権限リクエスト受信、クリーンアップ     |

---

## 4. テストカテゴリ

### 4.1 正常系テスト

- APIメソッドの基本動作
- 期待されるレスポンスの検証
- コールバック呼び出しの検証

### 4.2 異常系テスト

- IPCエラーハンドリング
- 不正な入力の処理
- 存在しないリソースへのアクセス

### 4.3 境界値テスト

- 空のメッセージ
- 非常に長いコンテンツ
- 特殊文字を含むデータ

### 4.4 セキュリティテスト

- ホワイトリスト検証
- 不正チャネルアクセスの拒否

---

## 5. テストファイル配置

```
apps/desktop/src/preload/__tests__/
├── skill-api.test.ts             # 基本APIテスト (624行)
├── skill-api.permission.test.ts  # 権限APIテスト (783行)
└── channels.skill-import.test.ts # チャネル定義テスト (408行)
```

---

## 6. テスト実行

### 6.1 単体テスト実行

```bash
# SkillAPI テストのみ
pnpm --filter @repo/desktop test -- skill-api

# 全テスト
pnpm --filter @repo/desktop test
```

### 6.2 カバレッジ付き実行

```bash
pnpm --filter @repo/desktop test -- --coverage
```

---

## 7. 既存テスト確認結果

### 7.1 skill-api.test.ts（624行）

| セクション                  | テスト数 | 状態    |
| --------------------------- | -------- | ------- |
| IPC Channels                | 7        | ✅ 存在 |
| skillAPI.onStream           | 4        | ✅ 存在 |
| skillAPI.abort              | 4        | ✅ 存在 |
| skillAPI.getExecutionStatus | 2        | ✅ 存在 |
| skillAPI.execute            | 2        | ✅ 存在 |
| Edge Cases (onStream)       | 5        | ✅ 存在 |
| Edge Cases (abort)          | 4        | ✅ 存在 |
| Error Handling              | 3        | ✅ 存在 |
| API Object Availability     | 5        | ✅ 存在 |

### 7.2 skill-api.permission.test.ts（783行）

| セクション                      | テスト数 | 状態    |
| ------------------------------- | -------- | ------- |
| Permission IPC Channels         | 4        | ✅ 存在 |
| onPermissionRequest             | 5        | ✅ 存在 |
| sendPermissionResponse          | 6        | ✅ 存在 |
| Permission Data Types           | 4        | ✅ 存在 |
| Permission Methods Availability | 2        | ✅ 存在 |
| IPC Integration Simulation      | 3        | ✅ 存在 |
| Permission Edge Cases           | 7        | ✅ 存在 |

---

## 8. 完了条件確認

| 条件                                                  | 状態    |
| ----------------------------------------------------- | ------- |
| 受け入れ基準ごとにユニットテストがある                | ✅ 完了 |
| 統合テストシナリオが全カテゴリで定義されている        | ✅ 完了 |
| テストカバレッジ目標が設定されている（80%）           | ✅ 完了 |
| 境界値テストが含まれている                            | ✅ 完了 |
| セキュリティテスト（safeInvoke/safeOn）が含まれている | ✅ 完了 |
| 本Phase内の全タスクを100%実行完了                     | ✅ 完了 |

---

## 9. 次のステップ

Phase 5: 実装（TDD: Green）へ進行

- 既存実装の動作確認
- テスト実行による Green 状態確認
