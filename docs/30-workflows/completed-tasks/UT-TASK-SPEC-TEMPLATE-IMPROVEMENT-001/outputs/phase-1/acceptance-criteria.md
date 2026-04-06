# 受け入れ基準: UT-TASK-SPEC-TEMPLATE-IMPROVEMENT-001

## 作成日

2026-04-06

## 受け入れ基準一覧

### AC-01: Part-aware extractSection による使用例検出

**テストシナリオ**:

- Part 2 内に非番号・非Part の `##` 見出し (`## APIの概要` など) が存在する
- その後ろに `### 使用例` と bash/ts コードブロックがある

**期待結果**: validator が `ok: true` を返す

**検証方法**: `pnpm vitest run -- validate-phase12-implementation-guide` で新規 TC-01 テストが PASS

---

### AC-02: 使用例欠落時のエラー報告

**テストシナリオ**:

- Part 2 内に `### 使用例` 見出しが存在しない

**期待結果**: validator が `ok: false` を返し、`errors` に `/使用例/` を含む

**検証方法**: 既存テスト "Part 2 に使用例が無ければ FAIL" が PASS

---

### AC-03: 正常なガイドの PASS

**テストシナリオ**:

- 全必須セクション（Part 1, Part 2, 型定義, 使用例, エラーハンドリング, エッジケース, 設定項目）が存在する

**期待結果**: validator が `ok: true` を返す

**検証方法**: 既存テスト "必須要件を満たすガイドは PASS" が PASS

---

### AC-04: changelog テンプレートに 5 必須フィールド

**テストシナリオ**:

- `documentation-changelog-template.md` を読み込む

**期待結果**:

- `| 変更者` を含む
- `| 関連 Issue / PR` を含む
- `| validator 実行結果` を含む
- `| current / baseline` を含む
- `| artifacts 同期結果` を含む
- 品質チェックリストに `メタ情報テーブルの 5 必須フィールドが全て記録されているか` を含む

**検証方法**: 既存テスト "documentation changelog テンプレートに 5 必須フィールドがある" が PASS

---

### AC-05: 既存テストへの回帰なし

**期待結果**: 全既存テストが引き続き PASS する

**検証方法**: `pnpm vitest run -- validate-phase12-implementation-guide` で全件 PASS
