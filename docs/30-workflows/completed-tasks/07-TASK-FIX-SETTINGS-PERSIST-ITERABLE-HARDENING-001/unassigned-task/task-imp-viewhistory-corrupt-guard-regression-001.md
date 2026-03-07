# UT-IMP-VIEWHISTORY-CORRUPT-GUARD-REGRESSION-001 - viewHistory 破損入力回帰テスト強化タスク

## メタ情報

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | UT-IMP-VIEWHISTORY-CORRUPT-GUARD-REGRESSION-001           |
| タスク名     | viewHistory の破損入力に対する回帰テスト強化              |
| 分類         | テスト強化                                                |
| 対象機能     | navigationSlice の viewHistory / useCanGoBack             |
| 優先度       | 低                                                        |
| 見積もり規模 | 小規模                                                    |
| ステータス   | 未実施                                                    |
| 発見元       | TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001 Phase 12 |
| 発見日       | 2026-03-08                                                |
| 依存タスク   | TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`useCanGoBack` セレクタに `Array.isArray(state.viewHistory)` ガードを追加した（DD-03）が、このガードの有効性を検証するテストが不足している。`navigationSlice.test.ts` には正常系のテスト（goBack, navigateTo）はあるが、`viewHistory` が破損した場合の異常系テストがない。

### 1.2 問題点

- `viewHistory` が `null` / `undefined` / `number` / `string` の場合の挙動がテストされていない
- DD-03 ガードを将来の変更で削除してもテストが検出しない
- `customStorage.test.ts` には `expandedFolders` の破損テストがあるが、`viewHistory` の破損テストは別ファイル

### 1.3 放置した場合の影響

- DD-03 ガードが回帰で削除された場合、persist 復元時に `viewHistory.length` で TypeError が発生
- 破損入力のテストカバレッジが不均一になる

---

## 2. 何を達成するか（What）

### 2.1 目的

`viewHistory` の破損入力に対する回帰テストを追加し、DD-03 ガードの有効性を検証する。

### 2.2 スコープ

#### 含むもの

- `navigationSlice.test.ts` に破損入力テスト追加
- `useCanGoBack` セレクタの異常系テスト
- `goBack` アクションの異常系テスト（viewHistory が配列でない場合）

#### 含まないもの

- `customStorage` のテスト（既に `customStorage.test.ts` で実施済み）
- `useCanGoBack` セレクタの実装変更

### 2.3 成果物

- 修正された `navigationSlice.test.ts`（破損入力テスト追加）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop/src/renderer/store/slices/navigationSlice.ts` の実装を理解
- `apps/desktop/src/renderer/store/index.ts` の `useCanGoBack` セレクタの実装を理解

### 3.2 推奨アプローチ

1. `navigationSlice.test.ts` に `describe("破損入力ガード (DD-03)")` ブロックを追加
2. `viewHistory` が以下の値の場合のテストを追加：
   - `null`
   - `undefined`
   - `42`（number）
   - `"not-an-array"`（string）
   - `{ key: "value" }`（object）

### 3.3 実装時の苦戦箇所と解決策（親タスクからの教訓）

| #   | 課題                                                     | 発見経緯                                                          | 解決策                                                                             | 教訓（標準ルール）                                                  |
| --- | -------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1   | `useCanGoBack` は Store セレクタなので単体テストが難しい | セレクタは Store に依存するため、Store 全体をモックする必要がある | `useAppStore.getState()` でストアを直接操作するか、`renderHook` でセレクタをテスト | Store セレクタのテストは `renderHook` パターンを使用する（P31参照） |
| 2   | `viewHistory` を直接破損させる方法                       | Zustand Store の内部状態を外部から書き換えるのは非推奨            | `useAppStore.setState({ viewHistory: null as any })` でテスト用に破損させる        | テスト目的の型アサーション（`as any`）は理由コメント付きで許容する  |
| 3   | happy-dom でのテスト環境制約                             | `userEvent` が使えない（P39）                                     | `fireEvent` を使用（Store セレクタのテストなのでイベント発火は不要な場合が多い）   | happy-dom環境では `fireEvent` を優先する                            |

---

## 4. 実行手順

### Phase 1: テスト設計

1. `navigationSlice.test.ts` を Read して現在のテスト構造を確認
2. 破損入力テストケースを設計

### Phase 2: テスト実装

1. `describe("破損入力ガード (DD-03)")` ブロックを追加
2. `it.each` で5パターンの破損入力をテスト
3. 各パターンで `useCanGoBack` が `false` を返すことを検証

### Phase 3: 検証

1. `cd apps/desktop && pnpm vitest run src/renderer/store/slices/navigationSlice.test.ts`
2. 全テスト PASS を確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `viewHistory` の破損入力5パターンのテストが追加されている
- [ ] 各パターンで `useCanGoBack` が `false` を返すことが検証されている

### 品質要件

- [ ] 全テスト PASS
- [ ] 既存テストが破壊されていない

---

## 6. 検証方法

```bash
# P40準拠: 対象パッケージのディレクトリから実行
cd apps/desktop && pnpm vitest run src/renderer/store/slices/navigationSlice.test.ts
```

---

## 7. リスクと対策

| リスク                                               | 影響度 | 発生確率 | 対策                                       |
| ---------------------------------------------------- | ------ | -------- | ------------------------------------------ |
| `as any` によるテスト破損値がTypeScript エラーになる | 低     | 低       | 理由コメント付きで許容                     |
| Store のモック方法が変わる                           | 低     | 低       | `useAppStore.setState` は Zustand 公式 API |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/renderer/store/slices/navigationSlice.ts` — 対象実装
- `apps/desktop/src/renderer/store/slices/navigationSlice.test.ts` — テストファイル
- `apps/desktop/src/renderer/store/index.ts` — `useCanGoBack` セレクタ
- `apps/desktop/src/renderer/store/__tests__/customStorage.test.ts` — 参照パターン

### システム仕様書参照

- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` — persist 復旧契約 DD-03
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` — persist iterable hardening 教訓

### 既知の落とし穴

- `.claude/rules/06-known-pitfalls.md` — P31（Store Hooks無限ループ）、P39（happy-dom/userEvent非互換）、P40（テスト実行ディレクトリ依存）

---

## 9. 備考

### 実装方針

- `it.each` で5パターンを簡潔にテスト
- Store セレクタのテストなので UI レンダリングは不要
- `customStorage.test.ts` の `injectCorruptedStore` ヘルパーを参照パターンとして活用
