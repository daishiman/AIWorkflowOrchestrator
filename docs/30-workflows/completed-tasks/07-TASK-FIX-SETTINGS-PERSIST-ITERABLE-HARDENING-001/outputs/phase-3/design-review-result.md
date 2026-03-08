# Phase 3: 設計レビュー結果

## タスクID

TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001

## レビュー日

2026-03-07

## レビュー対象

Phase 2 設計成果物（DD-01〜DD-05）

---

## 主要レビュー観点

| #   | 観点         | 判定 | 根拠                                                                                                                                                                                                             |
| --- | ------------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 復旧方針     | PASS | 破損データはフィールド単位で正規化する設計。expandedFolders は空 Set、viewHistory は `[view]` へ復旧。アプリ全体のリセットではなく、影響範囲を最小化した局所復旧であり適切                                       |
| 2   | 責務分離     | PASS | hydrate 正規化（customStorage の getItem/setItem）と navigation 更新正規化（navigationSlice の setCurrentView/goBack/canGoBack）が別関数で管理されている。各ガードの配置が責務に沿っており、変更影響範囲が限定的 |
| 3   | テスト再現性 | PASS | 破損 fixture（null / undefined / number / string / object）が定義済み。8 テストケースが設計されており、各 DD に対応する検証が網羅されている                                                                      |
| 4   | UX           | PASS | Settings 遷移時に crash ではなく復旧後の画面へ到達する。goBack は「戻れない」として安全に扱い、ユーザーに不自然な挙動を見せない                                                                                  |

---

## 追加レビュー観点

### DD-05: useCanGoBack セレクタガード追加

- 判定: 良好
- 理由: Phase 2 設計段階で canGoBack の派生セレクタにもガードが必要であることを発見し、DD-05 として追加した。viewHistory が破損した状態で UI 側が `canGoBack === true` を返すと、goBack 呼び出し時に予期しない挙動が発生する。セレクタレベルでの防御は適切な設計判断である

### DD-01: 要素レベル string フィルタリング

- 判定: 適切
- 理由: `Array.isArray()` だけでなく、各要素が `string` であることを `.filter(v => typeof v === "string")` で検証する防御的設計。JSON パース後のデータは要素レベルで型が保証されないため、この追加検証は合理的である

### console.warn の配置方針

- 判定: 合理的
- 理由: customStorage（hydrate 時）のみに `console.warn` を配置し、navigationSlice 側には配置しない方針は適切。hydrate は起動時 1 回のみ実行されるため warn が大量出力されるリスクはない。navigationSlice 側は操作ごとに呼ばれる可能性があり、warn 出力は過剰となる

---

## 要件カバレッジ検証

| 要件                                  | 対応 DD             | カバー状況                                                |
| ------------------------------------- | ------------------- | --------------------------------------------------------- |
| FR-01: viewHistory 配列ガード         | DD-03, DD-04, DD-05 | setCurrentView / goBack / canGoBack の 3 箇所でガード     |
| FR-02: expandedFolders getItem ガード | DD-01               | Array.isArray + 要素 string フィルタで正規化              |
| FR-03: expandedFolders setItem ガード | DD-02               | instanceof Set チェック + 非 Set 時の空配列フォールバック |
| FR-04: 破損データ正規化               | DD-01〜DD-05 全体   | 各フィールドで個別の正規化ロジックを実装                  |

全要件（FR-01〜FR-04）が DD-01〜DD-05 で網羅されていることを確認した。

---

## 受入基準検証可能性

| AC                                                | 検証方法                                                                             | 検証可能性 |
| ------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------- |
| AC-01: viewHistory が非配列時に crash しない      | テストケース: navigationSlice に破損 viewHistory を注入し setCurrentView/goBack 実行 | 検証可能   |
| AC-02: expandedFolders が非 Set 時に crash しない | テストケース: customStorage.getItem に破損データを返却させ hydrate 実行              | 検証可能   |
| AC-03: 破損データから正常状態へ復旧する           | テストケース: 各破損パターン後にアプリ状態が正常値であることを assert                | 検証可能   |
| AC-04: 正常データへの影響がない                   | テストケース: 正常な配列/Set を渡した場合にそのまま通過することを assert             | 検証可能   |
| AC-05: 既存テストが全て PASS する                 | CI / `pnpm --filter @repo/desktop test` の実行で確認                                 | 検証可能   |

---

## リスク評価

| リスク                           | 影響度 | 発生確率 | 対策                                                                                                                 |
| -------------------------------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------- |
| 既存テストとの競合               | 低     | 低       | navigationSlice.test.ts への追加は既存テストと独立。customStorage.test.ts は新規作成のため競合なし                   |
| パフォーマンス影響               | 低     | 低       | Array.isArray / instanceof Set は O(1) 操作。要素フィルタは expandedFolders の要素数に依存するが、実用上問題ない規模 |
| P48（useShallow 未適用）パターン | なし   | -        | useCanGoBack は boolean を返すプリミティブセレクタであり、useShallow は不要                                          |
