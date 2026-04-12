# 設計書

## タスクID: UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001

## 削除方針 vs 書き換え方針の最終決定

**採用: 削除方針**

| 観点       | 削除方針                                       | 書き換え方針                             |
| ---------- | ---------------------------------------------- | ---------------------------------------- |
| シンプルさ | 参照行ごと削除するだけで完結                   | 現行 testid 調査・適切な対応先選定が必要 |
| テスト価値 | `describe.skip` 状態のためテスト価値はほぼゼロ | 現行UIに合わせれば将来有用になるが工数増 |
| 影響範囲   | 最小限（参照行のみ削除）                       | テスト意図の理解が必要で工数増加         |
| リスク     | 低（削除により型エラー・参照エラーが消える）   | 書き換え先の testid が正しいか確認が必要 |

## describe.skip ブロックの扱い方針

| 方針項目                     | 決定内容                                             |
| ---------------------------- | ---------------------------------------------------- |
| `describe.skip` の解除       | 解除しない（本タスクのスコープ外）                   |
| `describe.skip` ブロック自体 | 削除しない（将来の復活・書き換えを妨げない）         |
| `it` / `test` ブロック       | 旧 testid 参照行を削除するが、テストケース構造は維持 |
| 型エラーが発生する場合の対処 | 参照行の削除により型エラーが解消されることを確認     |

## 変更対象ファイルと変更内容

### ファイル1: `SkillLifecyclePanel.llm-generation.test.tsx`

`const input = screen.getByTestId("skill-lifecycle-request-input")` 行と
それに続く `fireEvent.change(input, ...)` 行を削除する。

対象 describe.skip ブロックと変更箇所:

- U-1: 行 351-354（`const input` + `fireEvent.change` 4行）
- U-2: 行 381-382（`const input` + `fireEvent.change` 2行）
- U-4: 行 422-423（`const input` + `fireEvent.change` 2行）
- U-6: 行 474-475（`const input` + `fireEvent.change` 2行）
- U-10 (it-1): 行 558-559（`const input` + `fireEvent.change` 2行）
- U-10 (it-2): 行 584-585（`const input` + `fireEvent.change` 2行）
- U-12: 行 627-628（`const input` + `fireEvent.change` 2行）
- U-8b: 行 1070-1071（`const input` + `fireEvent.change`）＋行 1088（追加の `fireEvent.change(input, ...)`）
- U-18b: 行 1400-1403（`const input` + `fireEvent.change`）＋行 1419（追加の `fireEvent.change(input, ...)`）
- U-19b: 行 1441-1444（`const input` + `fireEvent.change`）＋行 1450-1452（3行の `fireEvent.change(input, ...)`）
- U-21: 行 1509-1513（`const input` + `fireEvent.change` 複数行）

### ファイル2: `SkillLifecyclePanel.auth-regression.test.tsx`

`fillCreateRequest` 関数の本体（行 172-174）を削除する。
この関数は describe.skip ブロックからのみ呼ばれている。
関数宣言は残し、本体を空にする。

## 変更しないもの

- `SkillLifecyclePanel.test.tsx` の `queryByTestId("skill-lifecycle-request-input")`（存在しないことを確認する正常なテスト）
- `describe.skip` ブロック自体の構造
- アクティブなテストケース（describe.skip 外）

## 検証コマンド設計

```bash
# 1. 旧 testid 参照が全件削除されたことの確認（0件であること）
grep -rn "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# 2. describe.skip ブロックが維持されていることの確認
grep -n "describe.skip" apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
grep -n "describe.skip" apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# 3. テスト実行（アクティブテストが PASS すること）
pnpm --filter @repo/desktop test:run

# 4. 型チェック
pnpm --filter @repo/desktop typecheck
```

---

_作成日: 2026-04-11_
