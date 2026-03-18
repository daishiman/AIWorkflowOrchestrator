# testing-component-patterns-advanced.md デッドリンク修正 - タスク指示書

## メタ情報

| 項目         | 内容                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| タスクID     | UT-TASK06-005                                                                   |
| タスク名     | testing-component-patterns-advanced.md デッドリンク修正（ui-ux-atoms-specs.md） |
| 分類         | ドキュメント修正                                                                |
| 対象機能     | テストパターン仕様書 / Atoms コンポーネント仕様参照                             |
| 優先度       | 低                                                                              |
| 見積もり規模 | 極小                                                                            |
| ステータス   | 未実施                                                                          |
| 発見元       | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 Phase 12 validate-structure.js 実行  |
| 発見日       | 2026-03-17                                                                      |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`validate-structure.js` 実行により、`testing-component-patterns-advanced.md` の L102 が `ui-ux-atoms-specs.md` を参照しているが、該当ファイルが `references/` ディレクトリに存在しないことが発覚した。

### 1.2 問題点・課題

- `references/ui-ux-atoms-specs.md` が存在しないためデッドリンクになっている。
- Progressive Disclosure でリソースを辿る際にリンク先に到達できない。

### 1.3 放置した場合の影響

- 新規開発者が Atoms コンポーネント仕様を探す際に到達不能になる。
- `validate-structure.js` が毎回エラーを報告し続け、真の構造問題が埋もれる。

## 2. 何を達成するか（What）

### 2.1 目的

`testing-component-patterns-advanced.md` L102 のデッドリンクを解消し、リンク切れのない状態にする。

### 2.2 最終ゴール

- `validate-structure.js` のデッドリンク検出がゼロになる。
- Atoms コンポーネントに関する仕様へ正しく辿れる参照が確立される。

### 2.3 スコープ

#### 含むもの

- `testing-component-patterns-advanced.md` L102 のリンク修正（選択肢A または B）。
- `topic-map.md` の再生成。

#### 含まないもの

- Atoms コンポーネントの実装変更。
- テストパターン仕様書の内容（リンク以外）の改変。

### 2.4 成果物

- デッドリンクが修正された `testing-component-patterns-advanced.md`。
- 再生成された `topic-map.md`。

### 2.5 選択肢

| 選択肢 | 内容                                                                 | 採用条件                                               |
| ------ | -------------------------------------------------------------------- | ------------------------------------------------------ |
| A      | 既存の正しいファイル（`ui-ux-components.md` 等）へリンク先を修正する | `ui-ux-components.md` に Atoms 仕様が含まれている場合  |
| B      | `ui-ux-atoms-specs.md` を新規作成する                                | Atoms 固有の仕様が十分な量あり独立ファイルが適切な場合 |

## 3. どのように実行するか（How）

### 3.1 前提条件

`.claude/skills/aiworkflow-requirements/references/` へのアクセス権限があること。

### 3.2 依存タスク

なし（独立タスク）

### 3.3 必要な知識

- Markdown リンク構文
- `validate-structure.js` の実行方法

### 3.4 推奨アプローチ

1. 全参照箇所を特定してスコープを確定する。
2. 既存ファイルで代替可能か確認する（選択肢A 優先）。
3. 修正後に検証スクリプトでデッドリンクがゼロになることを確認する。

## 4. 実行手順

1. 全参照箇所を特定する:

   ```bash
   grep -rn "ui-ux-atoms-specs" .claude/skills/aiworkflow-requirements/
   ```

2. 代替ファイルを確認する:

   ```bash
   ls .claude/skills/aiworkflow-requirements/references/ | grep "ui-ux"
   grep -n "atoms\|Atoms" .claude/skills/aiworkflow-requirements/references/ui-ux-components.md | head -20
   ```

3. 選択肢Aの場合: `testing-component-patterns-advanced.md` L102 のリンク先を正しいファイル名に修正する。
   選択肢Bの場合: `ui-ux-atoms-specs.md` を新規作成し、Atoms コンポーネントの仕様を記述する。

4. `topic-map.md` を再生成する:

   ```bash
   node scripts/generate-index.js
   ```

5. デッドリンクがないことを確認する:
   ```bash
   node scripts/validate-structure.js
   ```

### 4.1 苦戦箇所・注意点

- **発見コマンド**: デッドリンクを網羅的に検出する簡潔な手順:
  ```bash
  grep -roh '\[.*\]([-a-z0-9_]*\.md)' references/ | sed 's/.*(\(.*\))/\1/' | sort -u | while read f; do [ ! -f "references/$f" ] && echo "DEAD: $f"; done
  ```
- 通常の Phase 12 チェックでは検出されにくく、`validate-structure.js` または上記コマンドの手動実行が必要。

## 5. 完了条件チェックリスト

- [ ] `grep -rn "ui-ux-atoms-specs" .claude/skills/aiworkflow-requirements/` の全参照箇所が修正されている
- [ ] `validate-structure.js` でデッドリンクエラーが報告されない
- [ ] `topic-map.md` が再生成されている
- [ ] 修正されたリンクから Atoms コンポーネント仕様へ正しく到達できる

## 6. 検証方法

```bash
# デッドリンクのゼロ確認
node scripts/validate-structure.js

# 参照残存確認（0件になること）
grep -rn "ui-ux-atoms-specs" .claude/skills/aiworkflow-requirements/

# topic-map 再生成確認
git diff --stat -- .claude/skills/aiworkflow-requirements/indexes/
```

## 7. リスクと対策

| リスク                                                           | 影響度 | 発生確率 | 対策                                          |
| ---------------------------------------------------------------- | ------ | -------- | --------------------------------------------- |
| 選択肢A で参照先の ui-ux-components.md に Atoms 仕様が存在しない | 中     | 低       | ファイル内容を確認してから選択肢を決定する    |
| 選択肢B で新規ファイルの内容が不十分                             | 低     | 低       | 最低限リンク元が求める Atoms 仕様の章を含める |
| topic-map.md 再生成漏れ                                          | 中     | 中       | P2 対策: 仕様書変更後は必ず再生成を実行する   |

## 8. 参照情報

- `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-06-main-chat-settings-runtime-sync/` （発見元タスク）
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns-advanced.md`（修正対象 L102）
- `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`（代替候補）

## 9. 備考

関連パターン: P10（正規表現の見出しレベル誤検出）、P2（topic-map.md 再生成忘れ）、P3（未タスク管理の3ステップ不完全）。
TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 Phase 12 で検出され登録。
