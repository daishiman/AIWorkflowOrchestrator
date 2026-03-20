# UT-FIX-APP-INLINE-SELECTOR-001 App.tsx useAppStore 直接使用を個別セレクタに統一 - タスク指示書

## メタ情報

```yaml
task_id: UT-FIX-APP-INLINE-SELECTOR-001
task_name: App.tsx useAppStore 直接使用を個別セレクタに統一
category: リファクタリング
target_feature: App.tsx（Zustand Store 呼び出し）
priority: 中
scale: 小規模
status: 未実施
source_phase: Phase 10/11 最終レビュー・手動テスト
created_date: 2026-03-20
dependencies: [TASK-04]
```

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | UT-FIX-APP-INLINE-SELECTOR-001                   |
| タスク名     | App.tsx useAppStore 直接使用を個別セレクタに統一 |
| 分類         | リファクタリング                                 |
| 対象機能     | App.tsx（Zustand Store 呼び出し）                |
| 優先度       | 中                                               |
| 見積もり規模 | 小規模                                           |
| ステータス   | 未実施                                           |
| 発見元       | Phase 10/11 最終レビュー・手動テスト             |
| 発見日       | 2026-03-20                                       |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 10/11 レビューにて `App.tsx` が `useAppStore` を直接使用しており、プロジェクトの個別セレクタパターン（P31 対策）に準拠していないことが検出された。

### 1.2 問題点・課題

- `useAppStore()` の合成Hook戻り値を `useEffect` の依存配列に含めると、毎回新しいオブジェクトが返るため無限ループが発生するリスクがある（P31 パターン）。
- 個別セレクタ（`useXxx()` 形式）への統一はプロジェクト標準であり、`App.tsx` が例外になっている。
- コードの一貫性が損なわれ、後続開発者が誤ったパターンを参照するリスクがある。

### 1.3 放置した場合の影響

- P31（Zustand Store Hooks 無限ループ）が `App.tsx` で再現するリスクがある。
- `App.tsx` を参照した新規コードが合成Hook パターンを踏襲してしまう。

## 2. 何を達成するか（What）

### 2.1 目的

`App.tsx` の `useAppStore` 直接使用を個別セレクタ（`useXxx()` 形式）に置き換え、プロジェクト標準に準拠させる。

### 2.2 最終ゴール

1. `App.tsx` が `useAppStore` を直接呼び出す箇所がなくなっている。
2. 全ての状態取得が個別セレクタ経由になっている。
3. `useEffect` の依存配列が Zustand アクション参照で安定している。

### 2.3 スコープ

#### 含むもの

- `App.tsx` の `useAppStore` 直接使用箇所の特定と個別セレクタへの置換
- 関連テストの更新（必要な場合）

#### 含まないもの

- 個別セレクタ自体の新規作成（既存セレクタを使用する想定）
- 他ファイルの同種リファクタリング

### 2.4 成果物

- 実装差分（`App.tsx` のセレクタ使用パターン変更）

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop/src/renderer/App.tsx` が存在すること
- 使用する個別セレクタが既に定義されていること

### 3.2 依存タスク

- TASK-04（完了）
- UT-STORE-HOOKS-REFACTOR-001（完了、個別セレクタ定義済み）

### 3.3 必要な知識

- Zustand 個別セレクタパターン（`useXxx()` 形式）
- P31（Zustand Store Hooks 無限ループ）の防止策
- P48（useShallow 未適用による派生セレクタ無限ループ）の防止策

### 3.4 推奨アプローチ

1. `App.tsx` の `useAppStore` 使用箇所を `grep -n "useAppStore" apps/desktop/src/renderer/App.tsx` で特定する。
2. 各使用箇所について、対応する個別セレクタ（`useXxx()` 形式）を確認する。
3. `useAppStore` 呼び出しを個別セレクタに置き換える。
4. 配列を返すセレクタには `useShallow` を適用する（P48 対策）。

## 4. 実行手順

### Phase 構成

- Phase A: 使用箇所の特定と個別セレクタへの置換
- Phase B: テスト確認
- Phase C: 仕様同期

### Phase A: 使用箇所の特定と個別セレクタへの置換

#### 目的

`App.tsx` の `useAppStore` 直接使用を個別セレクタに置換する。

#### 手順

1. `grep -n "useAppStore" apps/desktop/src/renderer/App.tsx` で使用箇所を特定する。
2. 各使用箇所について、対応する個別セレクタを Store の定義から確認する。
3. `useAppStore` 呼び出しを個別セレクタに置き換える。
4. 配列を返すセレクタには `useShallow` を適用する。

#### 成果物

- `App.tsx` の差分

#### 完了条件

- `App.tsx` に `useAppStore` 直接呼び出しが残存しない

### Phase B: テスト確認

#### 目的

リファクタリング後も動作が変わらないことを確認する。

#### 手順

1. `pnpm --filter @repo/desktop exec vitest run src/renderer/App` を実行する。
2. 全テストが PASS することを確認する。

#### 成果物

- テスト実行結果

#### 完了条件

- 全テスト PASS

### Phase C: 仕様同期

#### 目的

未タスク台帳と仕様書を同期する。

#### 手順

1. `task-workflow.md` の残課題テーブルに本タスクを登録する。
2. `arch-state-management.md` に参照リンクを追加する。

#### 成果物

- 更新済み仕様書

#### 完了条件

- 台帳への登録完了

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `App.tsx` に `useAppStore` 直接呼び出しが残存しない
- [ ] 全ての状態取得が個別セレクタ経由になっている

### 品質要件

- [ ] 全関連テストが PASS
- [ ] TypeScript 型チェックが PASS
- [ ] 配列を返すセレクタに `useShallow` が適用されている

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に配置済み
- [ ] `task-workflow.md` 残課題テーブルに登録済み
- [ ] `arch-state-management.md` に参照リンク追加済み

## 6. 検証方法

### テストケース

- Case 1: `grep -n "useAppStore" apps/desktop/src/renderer/App.tsx` が0件を返す
- Case 2: 全関連テストが PASS

### 検証手順

```bash
grep -n "useAppStore" apps/desktop/src/renderer/App.tsx
pnpm --filter @repo/desktop exec vitest run src/renderer/App
pnpm --filter @repo/desktop typecheck
```

## 7. リスクと対策

| リスク                                    | 影響度 | 発生確率 | 対策                                              |
| ----------------------------------------- | ------ | -------- | ------------------------------------------------- |
| 対応する個別セレクタが未定義              | 中     | 低       | 事前に Store 定義を確認し、未定義なら作成する     |
| 置換後に useEffect 依存配列の構成が変わる | 中     | 中       | 依存配列が安定しているか（P31）を lint で確認する |
| 配列セレクタへの useShallow 適用漏れ      | 中     | 中       | P48 準拠チェックリストで確認する                  |

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/renderer/App.tsx`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

### 参考資料

- `.claude/rules/03-state-management.md`（個別セレクタパターン）
- `.claude/rules/06-known-pitfalls.md`（P31: Zustand Store Hooks 無限ループ、P48: useShallow 未適用）
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### task-workflow への登録候補

```
| UT-FIX-APP-INLINE-SELECTOR-001 | App.tsx useAppStore 直接使用を個別セレクタに統一 | リファクタリング | 中 | 未実施 | docs/30-workflows/unassigned-task/task-04-app-inline-selector-refactor.md |
```

### 関連仕様書への参照リンク追加候補

- `arch-state-management.md` の「個別セレクタパターン」セクションに本ファイルへのリンクを追加する。

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
UT-FIX-APP-INLINE-SELECTOR-001: App.tsx の useAppStore 直接使用を個別セレクタに統一
```

### 補足事項

P31（Zustand Store Hooks 無限ループ）の予防的修正として優先度「中」とする。
現状は無限ループが発生していない可能性があるが、将来の `useEffect` 依存配列追加時のリスク排除のため対応する。

## 実装時の注意（苦戦箇所からの教訓）

> TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 で得た教訓。同様の課題を簡潔に解決するための参考情報。

### P21/P35: store 個別セレクタ追加時のテストモック連鎖更新

- `store/index.ts` に個別セレクタを新規追加すると、そのセレクタを import する全テストファイルの `vi.mock` にモックを追加する必要がある
- 事前に `grep -rn "vi.mock.*store" apps/desktop/src/` で影響範囲を調査すること
- 各テストファイルで `beforeEach` でモックをリセットすることを忘れないこと
- 参照: `.claude/rules/06-known-pitfalls.md` P21, P35

### P40: テスト実行ディレクトリ依存

- モノレポ環境では `cd apps/desktop && pnpm exec vitest run src/...` で実行すること
- プロジェクトルートからの実行ではテストが見つからない場合がある
- 参照: `.claude/rules/06-known-pitfalls.md` P40
