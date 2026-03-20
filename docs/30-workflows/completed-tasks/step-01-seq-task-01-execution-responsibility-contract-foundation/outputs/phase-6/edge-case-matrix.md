# Phase 6: 境界ケース一覧 (Edge Case Matrix)

## メタ情報

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| タスクID | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| Phase    | 6                                                         |
| 作成日   | 2026-03-20                                                |

## 境界ケース定義

| ケースID | 入力条件                                       | 期待動作                                                                     | 関連 Concern | 関連 Pitfall |
| -------- | ---------------------------------------------- | ---------------------------------------------------------------------------- | ------------ | ------------ |
| E-1      | API Key が空文字列（`""`）                     | capability = none / state = blocked                                          | Concern A    | P42          |
| E-2      | API Key がスペースのみ（`"   "`）              | capability = none / state = blocked（P42 対策: trim 後に空文字列と判定）     | Concern A    | P42          |
| E-3      | API Key が不正形式（UUID でない文字列）        | Phase 2 設計書に従う。RR-1 として Phase 9 へ持ち越し                         | Concern A    | -            |
| E-4      | AuthMode 変更中（遷移中状態）                  | loading indicator 表示 / CTA 無効化（クリック不可）                          | Concern C    | -            |
| E-5      | IPC timeout（Main が応答しない）               | state = unavailable を表示 / silent fallback しない                          | Concern B    | -            |
| E-6      | IPC timeout 後に応答が届いた場合               | 遅延レスポンスを反映 / 二重更新を防ぐ                                        | Concern B    | P5           |
| E-7      | capability = both の状態で API Key を削除      | both -> terminalSurface に capability が劣化。CTA が即時更新される           | Concern A/C  | -            |
| E-8      | capability = both の状態で subscription を失う | both -> integratedRuntime に capability が劣化。secondary CTA が非表示になる | Concern A/C  | -            |

## ケース別テスト設計

### E-1 / E-2: API Key 空値バリデーション

```typescript
// テスト設計
describe("capability判定 - API Key空値", () => {
  it("E-1: 空文字列のAPI Keyでcapability=noneを返す", () => {
    const result = resolver.resolve("api-key", "");
    expect(result.capability).toBe("none");
  });

  it("E-2: スペースのみのAPI Keyでcapability=noneを返す", () => {
    const result = resolver.resolve("api-key", "   ");
    expect(result.capability).toBe("none");
  });
});
```

### E-4: AuthMode 遷移中状態

```typescript
// テスト設計
describe("遷移中状態", () => {
  it("E-4: AuthMode変更中はCTAが無効化される", () => {
    // AuthMode変更イベント発火
    // 遷移中フラグがtrueになる
    // CTAのonClickが呼び出し不可になる
    // 変更完了後にCTAが再有効化される
  });
});
```

### E-7 / E-8: capability 劣化

```typescript
// テスト設計
describe("capability劣化", () => {
  it("E-7: both→terminalSurface（API Key削除時）", () => {
    // 初期: both
    // API Key削除
    // capability = terminalSurface
    // primary CTA = "ターミナルで実行"に変化
  });

  it("E-8: both→integratedRuntime（subscription喪失時）", () => {
    // 初期: both
    // subscription無効化
    // capability = integratedRuntime
    // secondary CTA（ターミナルで実行）が非表示に
  });
});
```

## Phase 7 coverage gate への入力

| ケースID | Phase 7 coverage gate に含めるか | 理由                                                 |
| -------- | -------------------------------- | ---------------------------------------------------- |
| E-1      | 含める                           | API Key 空値は基本境界ケース                         |
| E-2      | 含める                           | P42 準拠必須のバリデーション                         |
| E-3      | Phase 9 へ持ち越し               | 期待動作が Phase 2 で未確定（RR-1）                  |
| E-4      | 含める                           | 遷移中の CTA 無効化は UX 必須                        |
| E-5      | Phase 9 へ持ち越し               | IPC timeout の mock 実装が未作成（RR-2）             |
| E-6      | Phase 9 へ持ち越し               | 遅延レスポンスのテストが timeout mock に依存（RR-2） |
| E-7      | 含める                           | capability 劣化は統合シナリオ S-3 と連動             |
| E-8      | 含める                           | capability 劣化の逆方向パターン                      |
