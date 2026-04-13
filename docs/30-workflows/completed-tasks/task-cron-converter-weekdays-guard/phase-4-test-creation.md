# Phase 4: テスト作成

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 4                                        |
| タスクID   | TASK-CRON-CONVERTER-WEEKDAYS-GUARD-001   |
| 機能名     | cronConverter weekdays=[] ガード処理追加 |
| 前提Phase  | Phase 3                                  |
| 後続Phase  | Phase 5                                  |
| 作成日     | 2026-04-12                               |
| ステータス | completed                                |

## 目的

実装前に Red（失敗）状態のテストを定義し、TDD サイクルの起点を固める。

## テスト対象

| テスト対象                                   | テスト種別     | 目的                             |
| -------------------------------------------- | -------------- | -------------------------------- |
| `visualConfigToCron()` の weekdays=[] ガード | ユニットテスト | InvalidConfigError スロー確認    |
| `visualConfigToCron()` の weekdays 正常系    | ユニットテスト | 既存動作の回帰確認               |
| `InvalidConfigError` クラス                  | ユニットテスト | エラークラスの型・メッセージ確認 |

## テストケース定義

### AC-01: weekdays=[] エラー

```typescript
describe("visualConfigToCron - weekdays=[] ガード", () => {
  it("frequency='weekly' かつ weekdays=[] の場合、InvalidConfigError をスローすること", () => {
    expect(() =>
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [],
        hour: 9,
        minute: 0,
      }),
    ).toThrow(InvalidConfigError);
  });

  it("InvalidConfigError に適切なメッセージが含まれること", () => {
    expect(() =>
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [],
        hour: 9,
        minute: 0,
      }),
    ).toThrow("weekdays must not be empty when frequency is 'weekly'");
  });
});
```

### AC-02〜04: 正常系

```typescript
describe("visualConfigToCron - weekdays 正常系", () => {
  it("weekdays=[0] の場合、'0 9 * * 0' を返すこと", () => {
    expect(
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [0],
        hour: 9,
        minute: 0,
      }),
    ).toBe("0 9 * * 0");
  });

  it("weekdays=[1,2,3,4,5] の場合、'0 9 * * 1,2,3,4,5' を返すこと", () => {
    expect(
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [1, 2, 3, 4, 5],
        hour: 9,
        minute: 0,
      }),
    ).toBe("0 9 * * 1,2,3,4,5");
  });

  it("weekdays=[0,1,2,3,4,5,6] の場合、'0 9 * * 0,1,2,3,4,5,6' を返すこと", () => {
    expect(
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [0, 1, 2, 3, 4, 5, 6],
        hour: 9,
        minute: 0,
      }),
    ).toBe("0 9 * * 0,1,2,3,4,5,6");
  });
});
```

### 回帰テスト: frequency !== "weekly"

```typescript
describe("visualConfigToCron - 回帰テスト", () => {
  it("frequency='daily' の場合、weekdays が空でもエラーにならないこと", () => {
    expect(() =>
      visualConfigToCron({
        frequency: "daily",
        weekdays: [],
        hour: 9,
        minute: 0,
      }),
    ).not.toThrow();
  });
});
```

### InvalidConfigError クラステスト

```typescript
describe("InvalidConfigError", () => {
  it("name が 'InvalidConfigError' であること", () => {
    const err = new InvalidConfigError("test message");
    expect(err.name).toBe("InvalidConfigError");
  });

  it("Error のインスタンスであること", () => {
    const err = new InvalidConfigError("test message");
    expect(err).toBeInstanceOf(Error);
  });
});
```

## 実行手順

1. Phase 3 ゲート判定（PASS）を確認する。
2. 既存のテストファイル `apps/desktop/src/renderer/utils/__tests__/cronConverter.test.ts` を確認する（存在しない場合は新規作成）。
3. テストケースを追加する。
4. `pnpm --filter @repo/desktop test:run -- apps/desktop/src/renderer/utils/__tests__/cronConverter.test.ts` を実行し、全テストが Red（失敗）であることを確認する。
5. テスト仕様書と Red 確認結果を `outputs/phase-4/` に出力する。

## 参照資料

| 資料名           | パス                                               | 用途           |
| ---------------- | -------------------------------------------------- | -------------- |
| ゲート判定       | `outputs/phase-3/gate-decision.md`                 | Phase 3 成果物 |
| テスト戦略       | `outputs/phase-2/test-strategy.md`                 | Phase 2 成果物 |
| cronConverter.ts | `apps/desktop/src/renderer/utils/cronConverter.ts` | 実装確認       |

## 成果物

| 成果物         | パス                                    | 説明                 |
| -------------- | --------------------------------------- | -------------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md` | テストケース一覧     |
| Red テスト結果 | `outputs/phase-4/red-test-result.md`    | 実装前の失敗確認記録 |

## コード成果物

| ファイル                                                          | 種別   | 説明             |
| ----------------------------------------------------------------- | ------ | ---------------- |
| `apps/desktop/src/renderer/utils/__tests__/cronConverter.test.ts` | テスト | Red テストの追加 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] weekdays=[] エラーテストが定義されていること
- [ ] 正常系テスト（AC-02〜04）が定義されていること
- [ ] 回帰テスト（daily の場合）が定義されていること
- [ ] `InvalidConfigError` クラステストが定義されていること
- [ ] 全テストが Red（失敗）状態であることが確認されていること
- [ ] 矛盾・漏れがないこと
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 3 成果物確認
2. 既存テストファイル確認
3. テストケース実装（Red 状態）
4. Red 確認実行
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 5: 実装
