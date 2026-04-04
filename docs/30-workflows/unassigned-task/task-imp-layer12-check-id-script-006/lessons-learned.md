# lessons-learned: check ID 突き合わせスクリプト化

> 発見元タスク: task-imp-layer12-spec-definition-004（Phase 12）
> 発見日: 2026-04-04

---

## 問題の要約

`task-imp-layer12-spec-definition-004` の Phase 5 検証スクリプト実行時、仕様書内の**例示値として記載された check ID**（例: `L2-008`）が grep パターンにヒットし、「存在しない check ID が混入している」と誤判定した。

---

## 根本原因の分析

### 現象

```bash
# 仕様書から check ID を抽出
grep -oE "L[1-4]-[0-9]{3}" interfaces-skill-verify-contract.md | sort -u
```

上記コマンドを実行すると、以下のような出力が得られた。

```
L1-001
L1-002
L1-003
L1-004
L1-005
L2-001
...
L2-007
L2-008   # ← 実際には存在しない（拡張ガイドラインの例示値）
L3-001
...
```

`L2-008` は「Layer 2 に check ID を追加する場合は `L2-008` から」という**例示として記載されたもの**であり、実際の check ID ではない。しかしファイル全体を対象とした `grep -oE "L[1-4]-[0-9]{3}"` はドキュメント内のすべての一致文字列を返すため、例示値も抽出してしまう。

### 根本原因

**grep のスコープがファイル全体であり、「テーブル行」と「その他のテキスト（例示・説明文）」を区別しないこと**。

具体的には以下の 2 つの構造が区別されない。

| 種別       | 例                                                        | check ID か                    |
| ---------- | --------------------------------------------------------- | ------------------------------ |
| テーブル行 | `\| L2-007 \| output-schema.json が有効な JSON か確認 \|` | ✅ 正規の check ID             |
| 例示文     | `L2-008` から連番                                         | ❌ 例示値（check ID ではない） |

### 影響範囲

- `diff /tmp/impl-check-ids.txt /tmp/spec-check-ids.txt` が「L2-008 が仕様書にあるが実装にない」という誤 FAIL を返す
- check ID が将来 30 件超に増えると例示値も増加し、手動での除外が困難になる

---

## 再発防止策

### 対策1: テーブル行に限定した grep パターン

Markdown テーブル行は `| L2-001 |` のように先頭が `|` で始まる。この特性を利用して、テーブル行のみを対象とすることで例示値を除外できる。

```bash
# テーブル行のみから check ID を抽出（例示値を除外）
grep -E "^\| L[1-4]-[0-9]{3} \|" interfaces-skill-verify-contract.md \
  | grep -oE "L[1-4]-[0-9]{3}" | sort -u
```

**パターンの意味**:

- `^\|` — 行頭が `|`（Markdown テーブル行の特徴）
- `L[1-4]-[0-9]{3}` — check ID の前後にスペースがある（テーブルセルのフォーマット）
- `\|` — 次のセル区切り `|` が続く

このパターンにより、以下の行はヒットしない。

```markdown
1. 該当 Layer の現在の最大連番 + 1 を新しい check ID とする（例: Layer 2 に追加なら L2-008）
```

### 対策2: スクリプト化による恒久的な解決

手動の grep コマンドではパターンの選択ミスが再発しやすい。スクリプト化によって以下を保証する。

- テーブル行スコープのパターンをスクリプト内に固定する
- ハードコードなしで check ID 数が増加しても動作する設計とする
- PASS/FAIL の判定ロジックをスクリプト内に封じ込める

### 対策3: スクリプトに例示値除外テストを含める

スクリプトのユニットテストに、以下のテストケースを含める。

```javascript
// 拡張ガイドライン内の例示値が抽出されないことを確認
it("should not extract example check IDs from guidelines section", () => {
  const content = `
## Layer 拡張ガイドライン
1. 該当 Layer の現在の最大連番 + 1 を新しい check ID とする（例: Layer 2 に追加なら L2-008）
  `;
  const ids = extractCheckIdsFromTable(content);
  expect(ids).not.toContain("L2-008");
});
```

---

## 教訓のまとめ

| 教訓                                                   | 詳細                                                                   |
| ------------------------------------------------------ | ---------------------------------------------------------------------- |
| grep のスコープをテーブル行に限定する                  | ファイル全体を対象にすると例示値・説明文の check ID パターンが混入する |
| 例示値を含む仕様書では検証スクリプトを必須化           | 手動 grep では例示値の混入リスクが高く、自動化して再発を防ぐ           |
| スクリプトに「例示値が混入しないこと」のテストを入れる | テストがないと将来の仕様書改訂で再発する可能性がある                   |
| check ID 数が増えたときの備えを設計段階で組み込む      | ハードコードした ID リストではなく、ファイルから動的抽出する設計とする |

---

## 参照

- 元タスク仕様書: `docs/30-workflows/imp-layer12-spec-definition-004/`
- check ID 定義: `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md`
- 実装: `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`
