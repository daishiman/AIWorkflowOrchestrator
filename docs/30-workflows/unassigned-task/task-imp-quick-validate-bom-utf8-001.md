# UT-IMP-QUICK-VALIDATE-BOM-UTF8-001: quick_validate.js BOM付きUTF-8 frontmatter検出修正

## メタ情報

```yaml
issue_number: 914
```

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-IMP-QUICK-VALIDATE-BOM-UTF8-001                           |
| タスク名     | quick_validate.js BOM付きUTF-8 frontmatter検出修正           |
| 分類         | バグ修正                                                     |
| 優先度       | 低                                                           |
| 見積もり規模 | 小規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 Phase 10 MINOR #1 |
| 発見日       | 2026-02-26                                                   |
| 対象         | `.claude/skills/skill-creator/scripts/quick_validate.js`     |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

BOM付きUTF-8で保存された `SKILL.md` は先頭が `\uFEFF---` となり、`quick_validate.js` の frontmatter 開始判定に失敗する。

### 1.2 問題点・課題

- `frontmatter が見つかりません` という誤検出が発生する。
- 実際の入力不備ではなく、文字エンコーディング差分で失敗する。

### 1.3 放置した場合の影響

- Windows系エディタ由来ファイルで誤判定が継続する。
- 検証エラーの原因切り分けコストが増加する。

## 2. 何を達成するか（What）

### 2.1 目的

BOM付きUTF-8でも `quick_validate.js` が frontmatter を正しく解析できるようにする。

### 2.2 最終ゴール

- BOM付き入力で frontmatter 誤検出が発生しない。
- BOMなし入力に回帰影響がない。

### 2.3 スコープ

#### 含むもの

- `quick_validate.js` の読み込み直後に先頭BOMを除去する処理。
- BOMケースを含むテストの追加/更新。

#### 含まないもの

- UTF-16等の別エンコーディング対応。
- `quick_validate.js` 全体リファクタリング。

### 2.4 成果物

- `.claude/skills/skill-creator/scripts/quick_validate.js`
- `.claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js`

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js v18以上。
- 既存テストが実行可能。

### 3.2 依存タスク

- UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001（親タスク）

### 3.3 推奨アプローチ

- 入力文字列の先頭のみ `\uFEFF` を除去してから frontmatter 判定する。
- BOMあり/なし双方をテストで固定する。

### 3.4 実装課題と解決策（親タスクからの教訓）

| 課題                           | 解決策                                |
| ------------------------------ | ------------------------------------- |
| 文字コード差分で誤検出が起きる | 先頭BOM除去を前処理に固定する         |
| 回帰影響の見落とし             | BOMあり/なしの2ケースを同時に検証する |

## 4. 実行手順

1. `quick_validate.js` の frontmatter 読み込み処理を特定する。
2. BOM除去前処理（先頭1文字のみ）を追加する。
3. BOMケースのテストを追加/更新する。
4. 既存テストを含めて回帰実行する。

## 5. 完了条件チェックリスト

- [ ] BOM付きUTF-8入力で frontmatter 誤検出が発生しない。
- [ ] BOMなし入力の既存挙動が維持される。
- [ ] 追加/更新したテストがPASSする。
- [ ] 回帰テストがPASSする。

## 6. 検証方法

```bash
pnpm -C .claude/skills/skill-creator test -- quick_validate
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
```

## 7. リスクと対策

| リスク                              | 影響度 | 発生確率 | 対策                          |
| ----------------------------------- | ------ | -------- | ----------------------------- |
| BOM除去が本来の先頭文字を誤って除去 | 低     | 低       | 先頭一致（`^\uFEFF`）のみ置換 |
| テストケース不足で回帰を見落とす    | 中     | 低       | BOMあり/なしをペアで固定      |

## 8. 参照情報

- `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-10/minor-issues.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

## 9. 備考

本タスクは Phase 10 MINOR #1 の是正タスク。仕様書反映のみ先行済みで、コード実装は未実施。
