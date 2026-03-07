# UT-IMP-PERSIST-HYDRATE-GUARD-ROLLOUT-001 - persist hydrate ガード横展開タスク

## メタ情報

| 項目         | 内容                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| タスクID     | UT-IMP-PERSIST-HYDRATE-GUARD-ROLLOUT-001                               |
| タスク名     | persist hydrate ガードパターンを全 Store の Set/Map/カスタム型に横展開 |
| 分類         | 改善（防御的プログラミング）                                           |
| 対象機能     | Zustand persist ミドルウェアのデータ復元                               |
| 優先度       | 中                                                                     |
| 見積もり規模 | 小〜中規模                                                             |
| ステータス   | 未実施                                                                 |
| 発見元       | TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001 Phase 12              |
| 発見日       | 2026-03-07                                                             |
| 依存タスク   | TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001（防御パターンの原型） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001 で `customStorage` の `expandedFolders`（`Set<string>` ↔ `string[]`）に iterable guard を実装した。しかし、同じパターンの脆弱性が以下に潜在している可能性がある：

- `customStorage` に将来追加される新しい `Set` / `Map` 型の状態
- 他ファイルで `persist` ミドルウェアを使用している Zustand Store
- `localStorage` から直接読み書きしている箇所

### 1.2 問題点

- `expandedFolders` 以外の persist 対象に同じ破損リスクが存在する
- `customStorage` の getItem/setItem が `expandedFolders` 固有のガードになっており、汎用化されていない
- 新しい `Set` / `Map` 型の状態を追加する際にガードを忘れるリスクがある

### 1.3 放置した場合の影響

- 新しい `Set` / `Map` 型の状態追加時に同じ `object is not iterable` エラーが再発
- `customStorage` のガードロジックが肥大化し、保守性が低下

---

## 2. 何を達成するか（What）

### 2.1 目的

persist hydrate ガードを汎用化し、全ての Set/Map/カスタム型の状態に自動適用される仕組みを構築する。

### 2.2 スコープ

#### 含むもの

- `customStorage` の getItem/setItem を汎用ガード関数でリファクタリング
- Renderer 全体の `persist` 使用箇所を監査
- 汎用ガード関数のテスト追加
- 将来の Set/Map 追加時のガイドライン作成

#### 含まないもの

- Main Process の persist（存在しない想定）
- `electron-store`（Main Process のストレージ — 別の仕組み）

### 2.3 成果物

- リファクタリングされた `customStorage`（汎用ガード関数）
- 監査結果（persist 使用箇所一覧）
- テストコード
- 開発者向けガイドライン（新しい persist 対象追加時の手順）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop/src/renderer/store/index.ts` の `customStorage` 実装を理解
- Zustand `persist` ミドルウェアの動作を理解

### 3.2 推奨アプローチ

1. `grep -rn "persist" apps/desktop/src/renderer/` で persist 使用箇所を全て列挙
2. `customStorage` の getItem/setItem を以下の汎用関数に置換：
   - `hydrateSet(raw: unknown): Set<string>` — 安全に Set を復元
   - `hydrateArray(raw: unknown): string[]` — 安全に Array を復元
   - `serializeSet(set: Set<string>): string[]` — Set を JSON 安全に変換
3. 各関数に破損入力テストを追加
4. 開発者向け README に「新しい persist 対象追加時の手順」を記載

### 3.3 実装時の苦戦箇所と解決策（親タスクからの教訓）

| #   | 課題                                                        | 発見経緯                                                          | 解決策                                                                            | 教訓（標準ルール）                                              |
| --- | ----------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1   | `new Set(...)` に非配列を渡すと `object is not iterable`    | localStorage の破損値で発生                                       | `Array.isArray` を前提条件にする                                                  | persist 復元時は「型検証→フィルタ→安全既定値」の3段を必須化する |
| 2   | setItem で `instanceof Set` と `Array.isArray` の両方が必要 | hydrate 前のデータが Set、hydrate 後のデータが Array の場合がある | `instanceof Set` → `Array.from()`、`Array.isArray` → `.filter(string)` の二段対応 | シリアライズ時は入力の型を信頼せず、複数型に対応する            |
| 3   | `console.warn` の出力がテストを汚染する可能性               | テスト実行時に warning が表示される                               | 破損検出は全環境で可視化すべきなので、テスト汚染は許容する                        | persist 問題の warning は `NODE_ENV` ガードしない               |
| 4   | `useCanGoBack` の `viewHistory` も破損リスクがある          | `Array.isArray(state.viewHistory)` ガードを追加した               | persist 対象の全フィールドにガードを入れる                                        | ストアの全永続化フィールドに型検証を適用する                    |

---

## 4. 実行手順

### Phase 1: 監査

1. `grep -rn "persist" apps/desktop/src/renderer/` で使用箇所を列挙
2. 各箇所の永続化フィールドの型を確認
3. Set/Map/カスタム型を使用しているフィールドをリスト化

### Phase 2: 汎用ガード関数設計

1. `hydrateSet<T>(raw: unknown, validator: (v: unknown) => v is T): Set<T>` を設計
2. `hydrateArray<T>(raw: unknown, validator: (v: unknown) => v is T): T[]` を設計
3. `serializeSet<T>(set: Set<T> | unknown): T[]` を設計

### Phase 3: テスト作成（TDD）

1. 各ガード関数に破損入力5パターンのテスト
2. `customStorage` 統合テスト
3. 既存テストの非破壊確認

### Phase 4: 実装

1. ガード関数を `apps/desktop/src/renderer/store/persistGuards.ts` に作成
2. `customStorage` をリファクタリングしてガード関数を使用
3. 新しい persist 対象にもガードを適用

### Phase 5: 検証

1. 全テスト PASS
2. カバレッジ基準達成

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] persist 使用箇所の監査結果一覧が作成されている
- [ ] 汎用ガード関数（hydrateSet / hydrateArray / serializeSet）が実装されている
- [ ] `customStorage` がリファクタリングされて汎用ガード関数を使用している
- [ ] 将来の persist 対象追加時のガイドラインが作成されている

### 品質要件

- [ ] 各ガード関数に破損入力5パターン以上のテストがある
- [ ] 全テスト PASS
- [ ] カバレッジ基準達成（Line >= 80%, Branch >= 60%）
- [ ] TypeCheck PASS

### ドキュメント要件

- [ ] `task-workflow.md` に完了記録が追加されている
- [ ] `arch-state-management.md` の persist 復旧契約セクションが更新されている
- [ ] `lessons-learned.md` に教訓が追記されている

---

## 6. 検証方法

```bash
# テスト実行（P40準拠）
cd apps/desktop && pnpm vitest run src/renderer/store/

# persist 使用箇所の監査
grep -rn "persist" apps/desktop/src/renderer/ | grep -v node_modules | grep -v ".test."

# 型チェック
pnpm --filter @repo/desktop typecheck
```

---

## 7. リスクと対策

| リスク                                      | 影響度 | 発生確率 | 対策                                                      |
| ------------------------------------------- | ------ | -------- | --------------------------------------------------------- |
| 汎用化で既存の customStorage の動作が変わる | 高     | 低       | 既存テスト全 PASS を確認してからリファクタリング          |
| ガード関数の型定義が複雑になりすぎる        | 低     | 中       | ジェネリクスは1段階まで、複雑な場合はオーバーロードで対応 |
| persist 対象の追加を忘れる                  | 中     | 中       | ガイドラインに「persist 対象追加チェックリスト」を含める  |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/07-TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001/` — 親タスク
- `apps/desktop/src/renderer/store/index.ts` — customStorage 実装
- `apps/desktop/src/renderer/store/__tests__/customStorage.test.ts` — 既存テスト

### システム仕様書参照

- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` — persist 復旧契約（DD-01〜DD-05）
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` — persist iterable hardening 教訓
- `.claude/skills/aiworkflow-requirements/references/error-handling.md` — エラーハンドリング

### 既知の落とし穴

- `.claude/rules/06-known-pitfalls.md` — P19（型キャスト検証バイパス）、P48（non-null assertion）

---

## 9. 備考

### 実装方針

- `persistGuards.ts` は純粋関数のみで構成（副作用なし、テスト容易）
- `console.warn` は破損検出のために全環境で出力（テスト環境でもガードしない）
- 将来 `Map` 型を persist する場合は `hydrateMap` を追加する設計余地を残す
