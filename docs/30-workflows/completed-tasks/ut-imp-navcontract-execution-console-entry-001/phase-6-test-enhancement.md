# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                             |
| ------ | ---------------------------------------------- |
| Phase  | 6                                              |
| 機能名 | ut-imp-navcontract-execution-console-entry-001 |
| 作成日 | 2026-03-24                                     |

## 目的

Phase 5 実装後のカバレッジ不足箇所を特定し、追加テストを作成する。

## 実行タスク

1. ショートカット境界値テスト追加 — Cmd+9 の executionConsole 解決を検証（TC-E1）
2. 未割当キーテスト追加 — Cmd+0 が null を返すことを検証（TC-E2）
3. Icon レンダリングテスト追加 — `play-circle` アイコンの SVG レンダリングを検証（TC-E3）

## 参照資料

| 資料名       | パス                                                        |
| ------------ | ----------------------------------------------------------- |
| Phase 4 TC   | `phase-4-test-cases.md`                                     |
| Phase 5 実装 | `phase-5-implementation.md`                                 |
| navContract  | `apps/desktop/src/renderer/navigation/navContract.ts`       |
| Icon         | `apps/desktop/src/renderer/components/atoms/Icon/index.tsx` |

## 追加テストケース

### TC-E1: executionConsole のショートカット解決（境界値）

```typescript
it("Cmd+9 を executionConsole に解決する", () => {
  expect(
    getViewFromNavigationShortcut(createEvent({ key: "9", metaKey: true })),
  ).toBe("executionConsole");
  expect(
    getViewFromNavigationShortcut(createEvent({ key: "9", ctrlKey: true })),
  ).toBe("executionConsole");
});
```

### TC-E2: 未割当キーが null を返す

```typescript
it("Cmd+0 は割当外のため null を返す", () => {
  expect(
    getViewFromNavigationShortcut(createEvent({ key: "0", metaKey: true })),
  ).toBeNull();
});
```

### TC-E3: Icon play-circle が iconMap に存在する

```typescript
// Icon.test.tsx に追加
it("play-circle アイコンがレンダリングされる", () => {
  render(<Icon name="play-circle" />);
  const svg = document.querySelector("svg");
  expect(svg).toBeTruthy();
});
```

## 実行手順

1. TC-E1〜TC-E3 のテストコードを対応するテストファイルに追加
2. テスト実行で全 PASS を確認

```bash
cd apps/desktop && pnpm vitest run src/renderer/navigation/navContract.test.ts src/renderer/components/atoms/Icon/Icon.test.tsx
```

## 統合テスト連携

追加テスト TC-E1〜TC-E3 は、GlobalNavStrip の統合テスト観点をカバーする:

| テストケース | 統合テスト観点                                                   |
| ------------ | ---------------------------------------------------------------- |
| TC-E1        | ショートカットキー Cmd+9 → executionConsole ビュー遷移の単体検証 |
| TC-E2        | 未割当キー（Cmd+0）のガード — 不正遷移が発生しないことの検証     |
| TC-E3        | Icon コンポーネントの play-circle レンダリング — ナビ表示の前提  |

## 多角的チェック観点

| 観点     | 確認事項                                                           |
| -------- | ------------------------------------------------------------------ |
| P40 準拠 | テストは `apps/desktop/` ディレクトリから実行する                  |
| P39 準拠 | happy-dom 環境では `userEvent` ではなく `fireEvent` を使用する     |
| 境界値   | ショートカット番号の最大値（"9"）と未割当値（"0"）をテストしている |
| 回帰防止 | 既存テストに影響を与えていないことを確認する                       |

## 成果物

| 成果物             | パス                                                            | 備考              |
| ------------------ | --------------------------------------------------------------- | ----------------- |
| navContract テスト | `apps/desktop/src/renderer/navigation/navContract.test.ts`      | TC-E1, TC-E2 追加 |
| Icon テスト        | `apps/desktop/src/renderer/components/atoms/Icon/Icon.test.tsx` | TC-E3 追加        |

> コード成果物はソースツリー上で直接編集する。`outputs/` ディレクトリには配置しない。

## 完了条件

- [ ] TC-E1〜TC-E3 の追加テストが作成されている
- [ ] 全テスト PASS

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次の Phase

Phase 7: カバレッジ確認
