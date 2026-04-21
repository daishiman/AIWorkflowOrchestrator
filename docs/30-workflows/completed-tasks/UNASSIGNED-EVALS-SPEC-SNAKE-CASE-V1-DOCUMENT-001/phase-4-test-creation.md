# Phase 4: テスト作成（検証シナリオ設計）

## メタ情報

| 項目       | 内容                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| Phase      | 4                                                                                                      |
| タスクID   | UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001                                                       |
| ステータス | completed                                                                                              |
| 作成日     | 2026-04-21                                                                                             |
| タスク種別 | docs-only / NON_VISUAL                                                                                 |
| 入力       | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` §3（現行 snake_case v1 定義） |
| 前Phase    | 3: 設計レビュー                                                                                        |
| 次Phase    | 5: 実装（evals-schema-spec.md への追記）                                                               |

---

## 目的

docs-only タスクのため、従来の unit test ではなく**ドキュメント整合性の検証シナリオ**を設計する。
Phase 5 の追記実施後に AC-1〜AC-5 を確認できる検証コマンド・手順を事前に定義し、
Phase 6 の回帰確認での実行に備える。

本フェーズの成果物は検証シナリオ仕様書（`outputs/phase-4/test-scenarios.md`）と
コマンドスイート（`outputs/phase-4/command-suite.md`）の 2 点である。

---

## Step 0: 事前確認（既存ファイル状態の baseline）

Phase 5（追記）を実施する前に、現在の `evals-schema-spec.md` §3 の状態を baseline として記録する。

```bash
# 現行 §3 の内容確認
grep -n "levels\|average_satisfaction\|levels\.\|3\." \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md

# §3 セクション全体の行数確認
awk '/^## 3\./,/^## 4\./' \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md | wc -l

# dual root の現行 parity 確認（追記前）
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
```

確認ポイント:

- `levels.{N}` のツリー構造定義が §3 に**存在しない**ことを確認（baseline）
- `average_satisfaction` の型・範囲・意味定義が**存在しない**ことを確認（baseline）
- `.claude/skills` と `.agents/skills` が追記前時点で一致していることを確認

---

## 実行タスク

### SC-01: `levels.{N}` 構造が §3 に追記されているか検証するシナリオ

**目的**: Phase 5 の追記後、`levels` が静的オブジェクトとして定義され、未保持スキルの扱いも §3 に存在することを確認する

**検証コマンド**:

```bash
# §3 に levels 関連記述が存在するか確認
rg -n "levels\.\{N\}|levels\.N|levels\.{" \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md

# レベル番号キーと requirements が levels 文脈で記述されているか確認
rg -n -A 4 "levels|min_usage_count|min_success_rate|unlocked" \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
```

**PASS 条件**:

- `levels.{N}` のツリー構造がテーブル形式または定義ブロックで記述されている
- レベル番号キーまたは一般化表現が明示されている
- `requirements.min_usage_count` と `requirements.min_success_rate` が明示されている
- `levels` を保持しないスキルがあることが記述されている
- §3 内（`## 3.` 〜 `## 4.` の間）に記述が存在する

**FAIL 条件**:

- `levels.{N}` の定義が §3 に一切存在しない
- `key` / `value` フィールドの型・意味が記述されていない

---

### SC-02: `average_satisfaction` フィールドが型・範囲・意味を含む形で記述されているか検証

**目的**: Phase 5 の追記後、`average_satisfaction` フィールドが意味・型・観測値を備えた定義として §3 に存在することを確認する

**検証コマンド**:

```bash
# average_satisfaction の記述確認
rg -n "average_satisfaction" \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md

# 型・観測値記述の確認
rg -n -B 1 -A 3 "average_satisfaction" \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
```

**PASS 条件**:

- `average_satisfaction` が §3 内でフィールド定義として記述されている
- 型（`number` 等）が明記されている
- 観測値として `0` や `4.5` があり得ること、固定値域は断定しないことが定義されている
- 意味（satisfaction スコアの意味論）が記述されている
- v1 固有であることが明記されている（v2 に対応フィールドなし）

**FAIL 条件**:

- 型・範囲・意味のいずれかが欠けている
- v1 固有である旨の記述がない

---

### SC-03: v2 との対照表（§3 テーブル）が拡張されているか検証

**目的**: §3 の camelCase v2 ⇄ snake_case v1 対照テーブルが、`levels.{N}` と `average_satisfaction` を含む形に拡張されていることを確認する

**検証コマンド**:

```bash
# §3 のテーブル行数確認（追記前後の比較用）
awk '/^## 3\./,/^## 4\./' \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md \
  | grep "^|" | wc -l

# levels の対照表エントリ確認
rg -n "levelHistory.*levels\|levels.*levelHistory" \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md

# average_satisfaction の対照表エントリ確認
rg -n "average_satisfaction" \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
```

**PASS 条件**:

- `levelHistory` ⇄ `levels` の対照行が §3 テーブルに存在する
- `average_satisfaction` の対照行（v2 対応なし）が §3 テーブルに存在する
- §3.3 として「v1 固有フィールド定義」セクションが新設されている（または v1 固有であることが明示されている）

**FAIL 条件**:

- 既存の対照テーブルが更新されず、`levels.{N}` / `average_satisfaction` の記述がない

---

### SC-04: `.claude/skills` と `.agents/skills` の bit-for-bit parity 確認

**目的**: Phase 5 の `.claude/skills` 正本更新後に `.agents/skills` への mirror が完了し、両 root が一致していることを確認する

**検証コマンド**:

```bash
# dual root 完全一致確認（差分ゼロが PASS）
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements

# evals-schema-spec.md の個別ファイル差分確認
diff \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md \
  .agents/skills/aiworkflow-requirements/references/evals-schema-spec.md

# 両 root の更新日時確認
ls -la .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
ls -la .agents/skills/aiworkflow-requirements/references/evals-schema-spec.md
```

**PASS 条件**:

- `diff -qr` の出力が空（差分なし）
- `diff` で `evals-schema-spec.md` の差分が 0 行

**FAIL 条件**:

- `.claude/skills` と `.agents/skills` の内容が一致しない
- mirror 同期が未実施

---

### SC-05: JSON parse 検証（対象 EVALS.json が存在する場合）

**目的**: `evals-schema-spec.md` の追記に起因する既存 EVALS.json の破損がないことを確認する（docs-only タスクのため、実際の EVALS.json への変更はないが、念のため parse 可能性を確認する）

**検証コマンド**:

```bash
# aiworkflow-requirements スキルの EVALS.json parse 確認
node -e "
  const fs = require('fs');
  const paths = [
    '.claude/skills/aiworkflow-requirements/EVALS.json',
    '.agents/skills/aiworkflow-requirements/EVALS.json',
  ];
  paths.forEach(p => {
    try {
      JSON.parse(fs.readFileSync(p, 'utf-8'));
      console.log('PASS:', p);
    } catch (e) {
      console.error('FAIL:', p, e.message);
    }
  });
" 2>/dev/null || echo "EVALS.json が存在しないか、node が利用できない場合はスキップ"

# 全スキルの EVALS.json 一括確認
find .claude/skills -name "EVALS.json" -exec node -e "
  try {
    JSON.parse(require('fs').readFileSync('{}', 'utf-8'));
    console.log('PASS: {}');
  } catch(e) {
    console.error('FAIL: {} -', e.message);
  }
" \;
```

**PASS 条件**:

- 対象 EVALS.json が全て JSON parse 成功
- docs-only タスクのため EVALS.json 自体に変更がないことを `git diff` で確認

**FAIL 条件**:

- JSON parse エラーが発生している（docs 追記の影響外のため、別タスクで対応）

---

## 参照資料

| 参照資料                 | パス                                                                                                  | 内容                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------------- |
| evals-schema-spec.md     | `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md`                              | 追記対象の正本（§3 が主要対象）        |
| consumer-audit-report.md | `docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md` | consumer 全集合・フィールド突合        |
| evals-field-map.md       | `docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`       | フィールド別詳細（snake_case v1 含む） |
| dual-root-parity.md      | `docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md`      | dual root 一致検証の基準               |
| schema-change-guide.md   | `docs/30-workflows/completed-tasks/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md`   | 変更手順・3 カテゴリ手動検証           |

---

## 実行手順

1. 本 Phase で定義した SC-01〜SC-05 の検証シナリオを `outputs/phase-4/test-scenarios.md` に記録する
2. 検証コマンドスイートを `outputs/phase-4/command-suite.md` に整理する（コピー＆実行可能な形式）
3. Step 0 の baseline 確認を実施し、現行状態を `outputs/phase-4/test-scenarios.md` に記録する
4. Phase 5 の実施後に SC-01〜SC-05 を順番に実行する（Phase 6 で実施）

---

## 統合テスト連携

docs-only タスクの統合テスト連携アクション:

- SC-04（dual root parity）は `schema-change-guide.md` §5.2 の「dual root 一致検証」カテゴリと対応する
- SC-05（JSON parse）は `schema-change-guide.md` §5.2 の「JSON パース検証」カテゴリと対応する
- SC-01〜SC-03 は `schema-change-guide.md` §5.2 の「静的参照検証」カテゴリの docs 版として位置付ける
- Phase 5 の追記完了後に Phase 6 で全 SC を実際に実行し、結果を記録する

---

## 多角的チェック観点（AIが判断）

| 観点                    | チェック内容                                                              |
| ----------------------- | ------------------------------------------------------------------------- |
| AC-1 充足確認           | SC-01 が `levels.{N}` のツリー構造定義を一意に検証できるか                |
| AC-2 充足確認           | SC-02 が型・範囲・意味の 3 要素全てを網羅しているか                       |
| AC-3 充足確認           | SC-03 が対照表の拡張（追加行数・新セクション）を検証できるか              |
| AC-4 充足確認           | 断定なし / 両立スタイルの記述が §3.3 で維持されているか（SC-03 内で確認） |
| AC-5 充足確認           | SC-04 の `diff -qr` ゼロ差分確認が dual root 同期の証明として十分か       |
| コマンドの再現性        | 検証コマンドが追記実施後いつでも同じ結果を返すか（冪等性）                |
| baseline との比較可能性 | Step 0 の baseline 記録が Phase 6 での回帰確認に活用できるか              |

---

## サブタスク管理

| サブタスクID | 内容                                                  | ステータス |
| ------------ | ----------------------------------------------------- | ---------- |
| ST-4-01      | SC-01 検証シナリオ設計（`levels.{N}` 構造確認）       | 未実施     |
| ST-4-02      | SC-02 検証シナリオ設計（`average_satisfaction` 確認） | 未実施     |
| ST-4-03      | SC-03 検証シナリオ設計（v2 対照表拡張確認）           | 未実施     |
| ST-4-04      | SC-04 検証シナリオ設計（dual root parity 確認）       | 未実施     |
| ST-4-05      | SC-05 検証シナリオ設計（JSON parse 確認）             | 未実施     |
| ST-4-06      | Step 0 baseline 確認実施・記録                        | 未実施     |
| ST-4-07      | `outputs/phase-4/test-scenarios.md` 作成              | 未実施     |
| ST-4-08      | `outputs/phase-4/command-suite.md` 作成               | 未実施     |

---

## 成果物

| 成果物             | パス                                | 内容                                              |
| ------------------ | ----------------------------------- | ------------------------------------------------- |
| 検証シナリオ仕様書 | `outputs/phase-4/test-scenarios.md` | SC-01〜SC-05 の詳細定義・PASS/FAIL 条件・baseline |
| コマンドスイート   | `outputs/phase-4/command-suite.md`  | 実行可能な検証コマンド集（コピー＆実行形式）      |

---

## 完了条件

- [ ] SC-01〜SC-05 の検証シナリオが `outputs/phase-4/test-scenarios.md` に定義されている
- [ ] 各 SC に PASS 条件・FAIL 条件が明記されている
- [ ] 検証コマンドスイートが `outputs/phase-4/command-suite.md` に整理されている
- [ ] Step 0 の baseline（追記前の §3 状態）が `outputs/phase-4/test-scenarios.md` に記録されている
- [ ] SC-04 の `diff -qr` コマンドが baseline 時点でゼロ差分であることを確認している

---

## タスク100%実行確認【必須】

1. SC-01〜SC-05 の全シナリオが設計されているか
2. 各シナリオに実行可能な検証コマンドが付属しているか
3. PASS 条件・FAIL 条件が AC-1〜AC-5 と対応しているか
4. Step 0 の baseline 確認を実施し記録したか
5. 成果物（`test-scenarios.md` / `command-suite.md`）が生成されているか

---

## 次Phase

Phase 5（実装: `evals-schema-spec.md` への追記）へ進む。
SC-01〜SC-05 の PASS 条件を満たす追記内容を `evals-schema-spec.md` §3 に反映し、
`.agents/skills` への mirror を実施する。
