# Phase 5: 実装

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 5                                        |
| タスクID   | TASK-CRON-CONVERTER-WEEKDAYS-GUARD-001   |
| 機能名     | cronConverter weekdays=[] ガード処理追加 |
| 前提Phase  | Phase 4                                  |
| 後続Phase  | Phase 6                                  |
| 作成日     | 2026-04-12                               |
| ステータス | completed                                |

## 目的

Phase 4 で定義した Red テストを Green へ移行する最小実装を行う。

## 実装手順

### Step 1: InvalidConfigError の定義

既存のエラークラス定義ファイルを確認する。存在しない場合は `cronConverter.ts` 内に定義する。

```typescript
export class InvalidConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidConfigError";
  }
}
```

### Step 2: visualConfigToCron() へのガード追加

`frequency === "weekly"` の処理ブロック内に以下を追加する:

```typescript
if (config.weekdays.length === 0) {
  throw new InvalidConfigError(
    "weekdays must not be empty when frequency is 'weekly'",
  );
}
```

**挿入タイミング**: `weekdays` 配列を join する処理の直前。

### Step 3: JSDoc の更新

```typescript
/**
 * VisualCronConfig を cron 式文字列に変換する
 * @param config - ビジュアル設定オブジェクト
 * @returns cron 式文字列
 * @throws {InvalidConfigError} frequency が "weekly" のとき weekdays が空配列の場合
 */
```

### Step 4: テスト実行

```bash
pnpm --filter @repo/desktop test:run -- apps/desktop/src/renderer/utils/__tests__/cronConverter.test.ts
```

全テストが Green になることを確認する。

## 新規・修正ファイルパス

| ファイル                                           | 変更種別 | 変更内容                                            |
| -------------------------------------------------- | -------- | --------------------------------------------------- |
| `apps/desktop/src/renderer/utils/cronConverter.ts` | 修正     | InvalidConfigError 定義追加・ガード追加・JSDoc 更新 |

## 参照資料

| 資料名           | パス                                               | 用途           |
| ---------------- | -------------------------------------------------- | -------------- |
| Red テスト結果   | `outputs/phase-4/red-test-result.md`               | Phase 4 成果物 |
| エラークラス設計 | `outputs/phase-2/error-class-design.md`            | Phase 2 成果物 |
| cronConverter.ts | `apps/desktop/src/renderer/utils/cronConverter.ts` | 実装対象       |

## 成果物

| 成果物           | パス                                        | 説明             |
| ---------------- | ------------------------------------------- | ---------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装内容の要約   |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更対象ファイル |

## コード成果物

| ファイル                                           | 種別 | 説明                   |
| -------------------------------------------------- | ---- | ---------------------- |
| `apps/desktop/src/renderer/utils/cronConverter.ts` | 実装 | ガード追加・JSDoc 更新 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `InvalidConfigError` が定義されていること
- [ ] `visualConfigToCron()` に weekdays=[] のガードが追加されていること
- [ ] JSDoc に `@throws {InvalidConfigError}` が追加されていること
- [ ] Phase 4 の全テストが Green になっていること
- [ ] 矛盾・漏れがないこと
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 4 成果物確認
2. InvalidConfigError 定義追加
3. ガード処理追加
4. JSDoc 更新
5. テスト実行・Green 確認
6. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 6: テスト拡充
