# テスト仕様書 - ConversionLogger サービス

## 文書情報

| 項目     | 内容            |
| -------- | --------------- |
| タスクID | CONV-05-01      |
| 機能名   | logging-service |
| Phase    | 4               |
| 作成日   | 2026-01-07      |
| 作成者   | Claude Code     |

---

## 1. テスト目的

ConversionLoggerサービスの機能要件（FR-001〜FR-009）および非機能要件（NFR-001〜NFR-004）を検証する。TDD（テスト駆動開発）のRed-Green-Refactorサイクルに従い、実装前にすべてのテストを作成する。

---

## 2. テスト対象

### 2.1 テスト対象クラス

| クラス/ファイル                      | 説明                           |
| ------------------------------------ | ------------------------------ |
| `ConversionLogger`                   | ログ記録サービスの主要クラス   |
| `types.ts` (Zodスキーマ)             | 型定義とバリデーションスキーマ |
| `IConversionLogger` インターフェース | サービスインターフェース       |
| `ILogRepository` インターフェース    | リポジトリインターフェース     |

### 2.2 テスト対象メソッド

| メソッド    | 説明                              | 優先度 |
| ----------- | --------------------------------- | ------ |
| `info()`    | INFOログ記録                      | Must   |
| `warn()`    | WARNログ記録                      | Must   |
| `error()`   | ERRORログ記録（スタックトレース） | Must   |
| `batch()`   | バッチログ記録                    | Should |
| `flush()`   | 手動フラッシュ                    | Must   |
| `dispose()` | リソース解放                      | Must   |

---

## 3. テストダブル設計

### 3.1 モック対象

| インターフェース | 種別 | 理由                                     |
| ---------------- | ---- | ---------------------------------------- |
| `ILogRepository` | Mock | DB操作の副作用を排除、呼び出し検証が必要 |

### 3.2 モック実装

```typescript
import { vi } from "vitest";
import type { Result } from "@repo/shared/result";
import type { ConversionLog, ILogRepository } from "../types";

/**
 * LogRepositoryモックファクトリ
 */
export function createMockLogRepository(): ILogRepository {
  return {
    bulkInsert: vi.fn().mockResolvedValue({ success: true, data: undefined }),
    findByFileId: vi.fn().mockResolvedValue({ success: true, data: [] }),
    findByLevel: vi.fn().mockResolvedValue({ success: true, data: [] }),
    findByDateRange: vi.fn().mockResolvedValue({ success: true, data: [] }),
  };
}

/**
 * エラーを返すモックファクトリ
 */
export function createFailingMockLogRepository(): ILogRepository {
  return {
    bulkInsert: vi.fn().mockResolvedValue({
      success: false,
      error: new Error("Database connection failed"),
    }),
    findByFileId: vi.fn().mockResolvedValue({ success: true, data: [] }),
    findByLevel: vi.fn().mockResolvedValue({ success: true, data: [] }),
    findByDateRange: vi.fn().mockResolvedValue({ success: true, data: [] }),
  };
}
```

### 3.3 テストダブル選定理由

| ダブル種別 | 選定対象       | 理由                                         |
| ---------- | -------------- | -------------------------------------------- |
| Mock       | ILogRepository | 振る舞い検証（bulkInsert呼び出し回数・引数） |
| Spy        | タイマー関数   | setInterval/clearIntervalの呼び出し検証      |
| Fake       | なし           | 複雑な代替実装は不要                         |
| Stub       | なし           | 状態検証のみの依存関係なし                   |

---

## 4. テストシナリオ設計

### 4.1 正常系テスト

| シナリオID | シナリオ名                 | 対応AC | 検証内容                                |
| ---------- | -------------------------- | ------ | --------------------------------------- |
| UT-001     | INFOログ正常記録           | AC-001 | info()でlevel="info"のログ生成          |
| UT-002     | WARNログ正常記録           | AC-002 | warn()でlevel="warn"のログ生成          |
| UT-003     | ERRORログ（スタック付き）  | AC-003 | error()でerrorStackが設定される         |
| UT-004     | ERRORログ（スタックなし）  | AC-004 | error()でerrorStackがundefined          |
| UT-005     | バッファ蓄積               | AC-005 | ログがバッファに蓄積される              |
| UT-006     | サイズベース自動フラッシュ | AC-006 | bufferSize到達でbulkInsert呼び出し      |
| UT-007     | 時間ベース自動フラッシュ   | AC-007 | flushIntervalMs経過でbulkInsert         |
| UT-008     | バッチログ記録             | AC-008 | batch()で複数ログ一括記録               |
| UT-009     | 手動フラッシュ             | AC-009 | flush()でバッファ内容を保存             |
| UT-010     | 空バッファフラッシュ       | AC-010 | 空バッファでもエラーなし                |
| UT-011     | リソース解放               | AC-011 | dispose()でタイマー停止・最終フラッシュ |

### 4.2 異常系テスト

| シナリオID | シナリオ名                 | 対応AC | 検証内容                         |
| ---------- | -------------------------- | ------ | -------------------------------- |
| UT-012     | Repository障害時エラー伝播 | AC-012 | bulkInsert失敗時にResult.err返却 |
| UT-013     | 入力バリデーションエラー   | -      | 不正入力でZodエラー              |
| UT-014     | 連続dispose呼び出し        | -      | 2回目のdisposeは無効（冪等性）   |

### 4.3 境界値テスト

| シナリオID | シナリオ名           | パラメータ      | 境界値                |
| ---------- | -------------------- | --------------- | --------------------- |
| BV-001     | bufferSize=0         | bufferSize      | 0（即時フラッシュ）   |
| BV-002     | bufferSize=1         | bufferSize      | 1（毎回フラッシュ）   |
| BV-003     | bufferSize=100       | bufferSize      | 100（デフォルト上限） |
| BV-004     | bufferSize=101       | bufferSize      | 101（上限+1）         |
| BV-005     | flushIntervalMs=0    | flushIntervalMs | 0（タイマー無効）     |
| BV-006     | flushIntervalMs=1    | flushIntervalMs | 1（最小間隔）         |
| BV-007     | flushIntervalMs=5000 | flushIntervalMs | 5000（デフォルト）    |
| BV-008     | バッチサイズ=0       | batch logs      | 0件（空配列）         |
| BV-009     | バッチサイズ=1000    | batch logs      | 1000件（大量データ）  |

---

## 5. テストファイル構成

```
packages/shared/src/services/logging/__tests__/
├── conversion-logger.test.ts      # メインユニットテスト
├── conversion-logger.buffer.test.ts    # バッファリングテスト
├── conversion-logger.timer.test.ts     # タイマーテスト
├── mocks/
│   └── log-repository.mock.ts     # モック定義
└── fixtures/
    └── log-fixtures.ts            # テストデータ
```

---

## 6. テスト環境

### 6.1 テストフレームワーク

| ツール     | バージョン | 用途           |
| ---------- | ---------- | -------------- |
| Vitest     | ^2.0.0     | テストランナー |
| @vitest/ui | ^2.0.0     | テストUI       |

### 6.2 テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/shared test:run

# ウォッチモード
pnpm --filter @repo/shared test

# カバレッジ付き
pnpm --filter @repo/shared test:coverage
```

---

## 7. テスト品質基準

### 7.1 カバレッジ目標

| メトリクス     | 目標値 | 説明                      |
| -------------- | ------ | ------------------------- |
| 行カバレッジ   | 80%+   | コード行のカバレッジ      |
| 分岐カバレッジ | 75%+   | 条件分岐のカバレッジ      |
| 関数カバレッジ | 90%+   | 関数/メソッドのカバレッジ |

### 7.2 テスト原則

- **1テスト1アサーション原則**: 各テストは1つの振る舞いを検証
- **AAAパターン**: Arrange-Act-Assert構造を遵守
- **独立性**: テスト間の依存を排除
- **再現性**: 何度実行しても同じ結果

---

## 8. TDD Red状態確認

Phase 4完了時点では、すべてのテストが**失敗状態（Red）**であることを確認する。

```bash
# テスト実行（すべて失敗することを確認）
pnpm --filter @repo/shared test:run

# 期待結果: Tests failed
# - 実装がないためすべてのテストが失敗する
# - これがTDDのRed状態
```

---

## 9. 承認

| 役割         | 判定     | 日付       |
| ------------ | -------- | ---------- |
| テスト設計者 | Complete | 2026-01-07 |
