# UT-06-003-UNIFICATION-TEST-GAP: skill-api.unification.test.ts expectedMethods 配列の検証漏れ修正

## メタ情報

```yaml
issue_number: 1624
```

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| タスクID   | UT-06-003-UNIFICATION-TEST-GAP                         |
| 機能名     | skill-api.unification.test.ts expectedMethods 配列補完 |
| 優先度     | 低                                                     |
| 作成日     | 2026-03-23                                             |
| 発見元     | UT-06-003-PRELOAD-API-IMPL Phase 12 / レビュー時検出   |
| ステータス | 未着手                                                 |

## 1. 目的

`skill-api.unification.test.ts` の「should have exactly 51 methods (no extra methods)」テストにおいて、`expectedMethods` 配列に `getDetail` と `update` の2メソッドが欠落している問題を修正し、全51メソッドが漏れなく検証される状態にする。

## 2. 背景・経緯

### 2.1 問題の発見経緯

UT-06-003-PRELOAD-API-IMPL の Phase 12 において、unassigned-task-detection.md では「検出件数: 0件」と報告されたが、6層レビューの2回目検証で `expectedMethods` 配列の項目数（49）とテスト期待値（51）の不一致が発見された。

### 2.2 現在の状態

- `expectedMethods` 配列: **49項目**
- テスト期待値 `expect(actualMethods.length).toBe(51)`: **51**
- コメント内訳: `+ 1 getDetail + 1 update + 1 evaluateSafety` を含む51項目の計算が記載済み
- テスト結果: **PASS**（51メソッドが実際に存在し、49項目は全て含まれているため通過する）

### 2.3 問題の本質

テストは「全メソッド数が51であること」と「expectedMethods に含まれるメソッドが全て存在すること」を個別に検証しているが、`expectedMethods` 配列が不完全なため「expectedMethods に含まれないメソッドが存在しないこと」の逆方向検証が不完全。具体的には、`getDetail` または `update` がリネーム・削除された場合にテストが検出できない。

## 3. 実行タスク

### Task 1: expectedMethods 配列の補完

**対象ファイル**: `apps/desktop/src/preload/__tests__/skill-api.unification.test.ts`

**修正箇所**: L129-179 の `expectedMethods` 配列（`it("should have exactly 51 methods (no extra methods)")` ブロック内）

**修正内容**: 以下の2項目を配列に追加する。

```typescript
const expectedMethods: (keyof SkillAPI)[] = [
  "list",
  "getImported",
  "getDetail", // 追加
  "update", // 追加
  "import",
  "remove",
  // ... 以下既存のまま
];
```

追加位置は論理的なグルーピング（基本操作系メソッドの近傍）に合わせることを推奨するが、配列の末尾でも機能的には問題ない。

### Task 2: テスト実行による修正確認

```bash
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.unification.test.ts
```

修正後もテストが PASS することを確認する。

## 4. 対象ファイル

| ファイル                                                           | 変更内容                                          |
| ------------------------------------------------------------------ | ------------------------------------------------- |
| `apps/desktop/src/preload/__tests__/skill-api.unification.test.ts` | expectedMethods 配列に `getDetail`, `update` 追加 |

## 5. 苦戦箇所

| ID      | 内容                                                                                             | 解決策                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| S-UTG-1 | Phase 12 の unassigned-task-detection.md で0件と報告されたが、6層レビューの2回目検証で発見された | 未タスク検出では「テストコードの expectedXxx 配列」と「実際のカウント値」の一致チェックを明示的に行う |

### 教訓

テストコード内で「期待値の配列」と「期待するカウント数」を別々に定義している場合、両者の整合性を自動的に検証する仕組み（例: `expect(expectedMethods.length).toBe(51)` のようなアサーション追加）を検討すべき。本件では配列の `.length` とハードコードされた `51` が乖離していた。

## 6. 完了条件

- [ ] `expectedMethods` 配列に `getDetail` と `update` の2項目が追加されている
- [ ] `expectedMethods` 配列の項目数が51になっている
- [ ] `expect(actualMethods.length).toBe(51)` のテストが PASS する
- [ ] 全 expectedMethods が actualMethods に含まれるテストが PASS する
- [ ] `pnpm --filter @repo/desktop exec vitest run src/preload/__tests__/skill-api.unification.test.ts` が全テスト PASS する

## 7. 見積もり規模

| 項目         | 値                     |
| ------------ | ---------------------- |
| 変更ファイル | 1ファイル              |
| 変更行数     | +2行                   |
| 所要時間     | 5分以内                |
| リスク       | 極小（テスト補完のみ） |

## 8. 関連タスク

| タスクID                   | 関係     | 説明                                      |
| -------------------------- | -------- | ----------------------------------------- |
| UT-06-003-PRELOAD-API-IMPL | 親タスク | evaluateSafety Preload API 実装（発見元） |
