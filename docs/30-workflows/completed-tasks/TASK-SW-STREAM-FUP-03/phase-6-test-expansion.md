# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 6                                   |
| Phase名    | テスト拡充                          |
| 対象機能   | TASK-SW-STREAM-FUP-03               |
| 前提Phase  | Phase 5: 実装（TDD Green 確認済み） |
| 次Phase    | Phase 7: カバレッジ確認             |
| ステータス | 未実施                              |
| 作成日     | 2026-04-17                          |

## 目的

fail path・回帰ガード・エッジケースのテストを追加し、堅牢性を高める。

## 追加テストケース

### Suite 6: onProgress 未指定時の安全動作

```typescript
describe("TASK-SW-STREAM-FUP-03: onProgress 未指定時の安全動作", () => {
  it("TC-15: collaborative モードで onProgress 未指定でもエラーが発生しない", async () => {
    // onProgress を渡さずに createSkill({ mode: "collaborative" }) を呼び出す
    // エラーが throw されないことを検証
  });

  it("TC-16: orchestrate モードで onProgress 未指定でもエラーが発生しない", async () => {});
  it("TC-17: update モードで onProgress 未指定でもエラーが発生しない", async () => {});
  it("TC-18: improve-prompt モードで onProgress 未指定でもエラーが発生しない", async () => {});
});
```

### Suite 7: percentage 単調増加ガード

```typescript
describe("TASK-SW-STREAM-FUP-03: percentage 単調増加ガード", () => {
  it("TC-19: orchestrate モードの percentage が単調増加する（engine-selection → done）", async () => {
    // 全コールバックの percentage 値を配列に収集し、隣接要素が非減少であることを検証
  });

  it("TC-20: update モードの percentage が単調増加する", async () => {});
  it("TC-21: improve-prompt モードの percentage が単調増加する", async () => {});
});
```

### Suite 8: 全モード done フェーズ確認

```typescript
describe("TASK-SW-STREAM-FUP-03: 全モードで done が最後に通知される", () => {
  it("TC-22: collaborative モードで最後のフェーズが done(100%) である", async () => {
    // 最終コールバックが { phase: "done", percentage: 100 } であることを検証
  });

  it("TC-23: orchestrate モードで最後のフェーズが done(100%) である", async () => {
    // 最終コールバックが { phase: "done", percentage: 100 } であることを検証
  });

  it("TC-24: update モードで最後のフェーズが done(100%) である", async () => {
    // 最終コールバックが { phase: "done", percentage: 100 } であることを検証
  });

  it("TC-25: improve-prompt モードで最後のフェーズが done(100%) である", async () => {
    // 最終コールバックが { phase: "done", percentage: 100 } であることを検証
  });
});
```

## 境界値テスト

| テスト                               | 確認内容                                 |
| ------------------------------------ | ---------------------------------------- |
| percentage の最大値が 100 を超えない | 全モード全フェーズで `percentage <= 100` |
| percentage の最小値が 0 以上         | 全モード全フェーズで `percentage >= 0`   |
| phase 文字列が空文字でない           | 全フェーズで `phase.length > 0`          |
| message 文字列が空文字でない         | 全フェーズで `message.length > 0`        |

## 実行タスク

既存成果物と前後 Phase の差分を照合する。

- 受入条件と実装結果の整合を確認する。
- 必要な修正を後続 Phase へ引き継ぐ。

## 参照資料

- `artifacts.json`
- `outputs/artifacts.json`
- 関連する前後 Phase の成果物

## 統合テスト連携

- 検証結果は後続 Phase の品質ゲートへ引き継ぐ。
- 自動テスト結果と矛盾しないことを確認する。

## 成果物

| 成果物                                        | パス                                                            |
| --------------------------------------------- | --------------------------------------------------------------- |
| TASK-SW-STREAM-FUP-03-extended-test-record.md | `outputs/phase-6/TASK-SW-STREAM-FUP-03-extended-test-record.md` |

## 完了条件

- [ ] Suite 6〜8 の全テストケースを実装した
- [ ] 境界値テストを実装した
- [ ] 全テスト（既存14件 + 新規TC-01〜25）が PASS する
- [ ] 成果物が生成されている

## タスク100%実行確認【必須】

- [ ] Suite 6（onProgress未指定）テストを追加した
- [ ] Suite 7（percentage単調増加）テストを追加した
- [ ] Suite 8（全モードdone）テストを追加した
- [ ] 全テスト PASS を確認した
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
