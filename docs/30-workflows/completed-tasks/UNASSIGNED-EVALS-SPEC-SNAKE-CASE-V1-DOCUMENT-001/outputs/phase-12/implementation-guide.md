# implementation-guide.md — snake_case v1 EVALS スキーマ正本追記

> タスクID: UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001  
> 作成日: 2026-04-21

---

UI/UX変更なしのため Phase 11 スクリーンショット不要

## Part 1: 中学生レベル概念説明

### なぜ必要か

たとえば、学校の成績表に「5段階評価」や「満足度」の欄があるのに、その欄が何を意味するか先生向けマニュアルに書かれていない状態に近いです。

スキルの「成績表」ファイル（EVALS.json）には、スキルがどんなレベルかを記録する `levels` という項目と、使った人がどのくらい満足したかを記録する `average_satisfaction` という項目があります。

しかしこれらの項目の「正式な説明」（仕様書）には、どんな形のデータが入るか、どんな意味があるかが書かれていませんでした。

このタスクでは、その「正式な説明」に欠けていた情報を追記しました。

### 何をしたか

### 今回作ったもの

1. **`levels` の誤記修正**: 「配列（リスト形式）」と書かれていたのを、実際の形に合わせて「番号キーを持つオブジェクト（辞書形式）」に修正しました
2. **`levels` の詳細定義追加**: 各レベルに `name`（名前）や `requirements`（昇格条件）などが入ることを定義しました
3. **`average_satisfaction` の定義追加**: 型（小数）・観測された値（0 や 4.5）・意味（満足度スコア）を正式に記録しました

---

## Part 2: 技術詳細

### 変更ファイル

- `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`（正本）
- `.agents/skills/aiworkflow-requirements/references/evals-schema-spec.md`（mirror 自動同期）

### 追記内容

#### §3 対照テーブル修正

| 変更前                        | 変更後                                                    |
| ----------------------------- | --------------------------------------------------------- |
| `levels` 行の備考「配列構造」 | 「静的オブジェクト（レベル番号文字列キー）— 詳細は §3.4」 |

#### §3.3 新設: v1 固有フィールド完全定義

`metrics.average_satisfaction`:

- 型: `number`（浮動小数点）
- 観測値: `0`（skill-creator）、`4.5`（aiworkflow-requirements）
- 値域: 固定値域は断定しない
- v1 固有（v2 に対応フィールドなし）
- 非保持スキル: `skill-fixture-runner` はフィールドなし

#### §3.4 新設: `levels` フィールドの構造

`LevelEntry` 型:

```ts
type LegacyAverageSatisfaction = number;

type LegacyLevelEntry = {
  name: string;
  description?: string;
  unlocked?: boolean;
  requirements: {
    min_usage_count: number;
    min_success_rate: number;
  };
};
```

| フィールド                      | 型             | 必須/任意 |
| ------------------------------- | -------------- | --------- |
| `name`                          | string         | required  |
| `description`                   | string         | optional  |
| `unlocked`                      | boolean        | optional  |
| `requirements.min_usage_count`  | number         | required  |
| `requirements.min_success_rate` | number（0..1） | required  |

非保持スキル: `skill-fixture-runner` はキー自体が存在しない。

### APIシグネチャ

```bash
rg -n "average_satisfaction|^### 3\\.3|^### 3\\.4" \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md

diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
```

### 使用例

```bash
rg -n "average_satisfaction|^### 3\\.3|^### 3\\.4" \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md

diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
```

- 1つ目は `average_satisfaction` と §3.3 / §3.4 の存在確認
- 2つ目は canonical / mirror の parity 確認

### エラーハンドリング

- `description` / `unlocked` が存在しないスキルは正常（optional 定義済み）
- `average_satisfaction = 0` は「未評価」相当として扱われる可能性があるが、固定の意味定義は本タスクでは行わない
- validator がないため、追記した定義の構造整合は手動検証に依存（既知制約）

### エッジケース

- `skill-fixture-runner` では `average_satisfaction` も `levels` も非保持であり、キー不存在を正とする
- `description` / `unlocked` は `aiworkflow-requirements` のみ保持する optional 項目として扱う

### 設定項目と定数一覧

変更対象: docs のみ。コード・設定ファイル・EVALS.json への変更なし。

### テスト構成

- link / canonical path 確認: completed-task canonical path を参照
- schema section 確認: §3.3 / §3.4 の存在を `rg` で検証
- parity 確認: `.claude` / `.agents` を `diff -qr` で検証

## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要。
