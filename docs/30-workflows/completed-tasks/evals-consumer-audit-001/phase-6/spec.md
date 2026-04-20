# Phase 6: Dual Root 差分抽出 - タスク仕様書

## メタ情報

| 項目             | 内容                                                          |
| ---------------- | ------------------------------------------------------------- |
| phase_id         | 6                                                             |
| task_id          | TASK-EVALS-CONSUMER-AUDIT-001                                 |
| Phase名          | Dual Root 差分抽出（.claude vs .agents）                      |
| 前提Phase        | Phase 4（`raw-find-evals.txt` が確定）                        |
| 後続Phase        | Phase 7（漏れ再検索）／Phase 8（schema-change-guide）         |
| ステータス       | 未実施                                                        |
| 作成日           | 2026-04-19                                                    |
| 機能名           | evals-consumer-audit                                          |
| depends_on       | Phase 4（`outputs/phase-4/raw-find-evals.txt`）               |
| 並列関係         | Phase 5 と W2 内で並列実行可能                                |
| taskType         | NON_VISUAL / 調査タスク（コード実装なし）                     |
| 内部並列可否     | **スキル単位で完全並列可**（各スキルの diff は独立）          |
| 対応品質ゲート   | QG-5（全スキルが表に列挙・差分が 0/許容/要対応に三分類）      |
| 所属ウェーブ     | W2                                                            |
| 出力ディレクトリ | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/` |

---

## 1. 目的（Why）

`.claude/skills/*/EVALS.json` と `.agents/skills/*/EVALS.json` のスキル単位での差分を可視化し、**dual root ドリフト**の現状をスナップショットとして固定する。本 Phase は正本判定を行わず、差分の「量」と「性質」を記録するのみ（Phase 2 §3.1 の「断定しない」方針に従う）。

具体的な目的:

- 両 root に存在する EVALS.json の内容 diff をスキル単位で取得する。
- 片 root にのみ存在する EVALS.json を「片方欠損」として明示する。
- 差分を「0（完全一致）／許容（運用メトリクスの揺らぎのみ）／要対応（構造差）」の 3 分類に振り分ける。
- 要対応と判定した差分は Phase 12 の `unassigned-task-detection.md` 候補として記録する。

---

## 2. 入力（前 Phase 成果物・参照資料）

| 入力                              | パス                                                                                        | 用途                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| EVALS.json 全パス一覧             | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-find-evals.txt`             | スキル単位 diff の対象集合               |
| Phase 2 dual root 扱い方針        | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-2-scope-architecture.md` §3.1 | 正本判定は行わない方針                   |
| Phase 3 Phase 6 設計              | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-3-phase-design.md` §1 Phase 6 | 3 分類基準、並列可否                     |
| `.claude/skills/` 配下 EVALS.json | `.claude/skills/*/EVALS.json`                                                               | diff 左辺                                |
| `.agents/skills/` 配下 EVALS.json | `.agents/skills/*/EVALS.json`                                                               | diff 右辺                                |
| Phase 5 成果物（参考）            | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md`       | 差分が consumer の挙動に与える影響評価用 |

Phase 5 の完成を待つ必要はないが、Phase 5 と並列実行した場合、最終突合（3 分類の根拠付け）のみ Phase 5 完了後に実施する。

---

## 3. 実行手順

### Step 0: 対象スキル集合の抽出

Phase 4 の `raw-find-evals.txt` から、`.claude/skills/` と `.agents/skills/` 配下のスキルディレクトリ名を列挙する。

```bash
# .claude 側のスキルディレクトリ集合
grep '^\.claude/skills/' docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-find-evals.txt \
  | awk -F/ '{print $3}' | sort -u \
  > docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/skills-claude.txt

# .agents 側のスキルディレクトリ集合
grep '^\.agents/skills/' docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-find-evals.txt \
  | awk -F/ '{print $3}' | sort -u \
  > docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/skills-agents.txt

# 和集合（全スキル）
sort -u docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/skills-claude.txt \
        docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/skills-agents.txt \
  > docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/skills-union.txt
```

### Step 1: 片方欠損スキルの検出

```bash
comm -23 docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/skills-claude.txt \
         docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/skills-agents.txt \
  > docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/only-in-claude.txt

comm -13 docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/skills-claude.txt \
         docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/skills-agents.txt \
  > docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/only-in-agents.txt
```

- `only-in-claude.txt` に記載されたスキルは `.claude` のみに EVALS.json が存在。
- `only-in-agents.txt` に記載されたスキルは `.agents` のみに EVALS.json が存在。
- これらは全て `dual-root-parity.md` で「片方欠損」として明示し、Phase 12 の未タスク候補にする。

### Step 2: 両 root 存在スキルの diff 実行（スキル単位で並列可）

両 root に存在するスキルに対して diff を実行する。**スキル単位で独立並列可**。

```bash
# 両 root に存在するスキル集合
comm -12 docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/skills-claude.txt \
         docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/skills-agents.txt \
  > docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/skills-both.txt

# 各スキルごとに diff を取り、結果を per-skill ファイルに保存
: > docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/raw-diff.txt
mkdir -p docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/per-skill

while IFS= read -r s; do
  out="docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/per-skill/${s}.diff"
  {
    echo "# skill: $s"
    echo "# left:  .claude/skills/$s/EVALS.json"
    echo "# right: .agents/skills/$s/EVALS.json"
    echo "# executed_at: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    diff -u ".claude/skills/$s/EVALS.json" ".agents/skills/$s/EVALS.json" || true
  } > "$out"

  # 統合 raw-diff にも追記
  {
    echo "===== $s ====="
    cat "$out"
    echo
  } >> docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/raw-diff.txt
done < docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/skills-both.txt
```

### Step 3: 差分を 3 分類に振り分け

Phase 3 §1 Phase 6 の分類基準に従う。

| 分類   | 定義                                                                                                                                    | 対応           |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 0      | バイナリ diff が空（`diff` の exit code 0）                                                                                             | そのまま記録   |
| 許容   | `lastUpdated` / `metrics.totalUsageCount` / `metrics.successCount` / `metrics.lastEvaluated` など、運用メトリクスの数値／時刻揺らぎのみ | 注記して記録   |
| 要対応 | スキーマ構造差（キーの有無・型の違い・levelCriteria 構造差）                                                                            | 未タスク候補化 |

各 per-skill diff を読み、判定結果を `dual-root-parity.md` の表に記録する。

### Step 4: `dual-root-parity.md` の作成

以下の章立てで作成する。

1. メタ情報（生成日時・対象スキル数・分類別件数）
2. サマリ表
   | スキル | `.claude` 存在 | `.agents` 存在 | 分類 | 差分の概要 |
   | --------------------------- | -------------- | -------------- | ---------------- | ----------------------- |
   | task-specification-creator | ✓ | ✓ | 0 / 許容 / 要対応 | 例: lastUpdated のみ差分 |
3. 詳細セクション（スキルごとに分類判定の根拠）
4. 片方欠損スキル一覧（`only-in-claude.txt` / `only-in-agents.txt` から転記）
5. 要対応差分の未タスク候補リスト（Phase 12 へ引き渡し）
6. 正本判定を行わなかった旨の注記（Phase 2 §3.1 準拠）
7. フィクスチャ root の扱い（`apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json` は dual root 対称性判定に含めない旨を明記）

### Step 5: Phase 5 consumer-audit-report.md との突合（Phase 5 完了後）

Phase 5 が完了したら、要対応と判定した差分について「どの consumer が影響を受けるか」を `dual-root-parity.md` の該当セクションに追記する（`readers` / `writers` / `validators` を consumer-audit-report から参照）。

---

## 4. 成果物（ファイルパス・フォーマット・スキーマ）

| 成果物                             | パス                                                                                | フォーマット | スキーマ                                     |
| ---------------------------------- | ----------------------------------------------------------------------------------- | ------------ | -------------------------------------------- |
| ★最終成果物 3: dual-root-parity.md | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md`    | Markdown     | §3 Step 4 の章立て                           |
| スキル集合ファイル                 | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/skills-claude.txt`      | text         | 1 行 1 スキル名（sort 済み）                 |
| 同上                               | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/skills-agents.txt`      | text         | 同上                                         |
| 同上                               | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/skills-union.txt`       | text         | 和集合                                       |
| 同上                               | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/skills-both.txt`        | text         | 積集合                                       |
| 片方欠損リスト                     | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/only-in-claude.txt`     | text         | 差集合                                       |
| 同上                               | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/only-in-agents.txt`     | text         | 差集合                                       |
| スキル単位 diff                    | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/per-skill/<skill>.diff` | text         | 先頭 4 行にメタコメント、以降 `diff -u` 出力 |
| 統合 diff                          | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/raw-diff.txt`           | text         | スキル区切り `===== <skill> =====` 付き連結  |

---

## 5. 完了条件チェックリスト

- [ ] `skills-claude.txt` / `skills-agents.txt` / `skills-union.txt` / `skills-both.txt` が生成されている
- [ ] `only-in-claude.txt` / `only-in-agents.txt` が生成されている（空でもファイル自体は存在）
- [ ] `skills-both.txt` の全スキルについて `per-skill/<skill>.diff` が生成されている
- [ ] `raw-diff.txt` にスキル区切り付きで全 diff が連結されている
- [ ] `dual-root-parity.md` が生成され、Phase 2 §3.1 の「正本判定を行わない」方針が明記されている
- [ ] `dual-root-parity.md` のサマリ表が `skills-union.txt` の全スキルを網羅している
- [ ] 各スキルに対して「0 / 許容 / 要対応」の分類が付与されている
- [ ] 要対応差分は未タスク候補としてリスト化されている
- [ ] 片方欠損スキルは `dual-root-parity.md` の専用セクションに転記されている
- [ ] フィクスチャ root が対称性判定の対象外である旨が明記されている
- [ ] QG-5 を満たす（全スキルが表に列挙され、3 分類が付与）

---

## 6. 検証方法（自己検証コマンド）

### 6.1 スキル数の網羅確認

```bash
# サマリ表に列挙されたスキル数 ≧ skills-union.txt の行数
expected=$(wc -l < docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/skills-union.txt)
listed=$(grep -cE '^\| [a-zA-Z]' docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md)
echo "expected=$expected listed=$listed"
test "$listed" -ge "$expected" && echo "OK" || echo "INSUFFICIENT"
```

### 6.2 per-skill diff ファイルの存在

```bash
while IFS= read -r s; do
  f="docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/per-skill/${s}.diff"
  [ -f "$f" ] && echo "OK: $s" || echo "MISSING: $s"
done < docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/skills-both.txt
```

### 6.3 3 分類のいずれかが全スキルに付与されている

```bash
# dual-root-parity.md に "0" "許容" "要対応" のいずれかがスキル行に出現するか
grep -cE '\| (0|許容|要対応|片方欠損) *\|' docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md
```

### 6.4 フィクスチャ root の除外確認

```bash
grep -q '__fixtures__' docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md \
  && grep -A2 '__fixtures__' docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md \
  || echo 'NOTE: fixture 言及がない。Step 4 の章立て 7 を追記してください'
```

### 6.5 正本判定を行わない方針の明示

```bash
grep -q '正本判定' docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md \
  && echo 'OK: 正本判定方針が明示されている' \
  || echo 'MISSING: Phase 2 §3.1 の方針注記が不足'
```

---

## 7. リスクと対策

| ID     | リスク                                                              | 対策                                                                                                    |
| ------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| P6-R-1 | 新スキルが片方のみに追加されていて対称性が崩れている（RISK-2 対応） | Step 1 で `only-in-*.txt` を生成し、`dual-root-parity.md` に専用セクションで明示                        |
| P6-R-2 | 運用メトリクスの揺らぎ（`lastUpdated` 等）を構造差と誤判定          | 分類基準を Step 3 の表で固定し、「許容」の定義を明文化                                                  |
| P6-R-3 | スキル単位並列実行で `raw-diff.txt` の連結順が非決定的になる        | `skills-both.txt` を sort 済みで使い、直列で `>>` 追記する（Step 2 の while ループを 1 プロセスで実行） |
| P6-R-4 | 本 Phase で正本判定を断定してしまい後続タスクと衝突                 | `dual-root-parity.md` 本文に「正本判定を行わない」注記を Step 4 章立て 6 で必ず含める                   |
| P6-R-5 | `diff` 出力が巨大で 1000 行超過（NFR-8 違反）                       | `per-skill/` 配下にスキル単位で分割保存し、`raw-diff.txt` が肥大化した場合は先頭のみ保持                |
| P6-R-6 | 要対応差分を未タスク候補化し忘れ、Phase 12 で漏れる                 | Step 4 の章立て 5（未タスク候補リスト）を必須セクションとし、0 件でも「0 件」と明記                     |
| P6-R-7 | フィクスチャ EVALS.json を dual root に含めてしまう                 | §3 Step 0 で対象集合を `.claude/skills/` と `.agents/skills/` に限定し、フィクスチャは除外              |

---

## 8. 前後 Phase との依存

- **前提**:
  - Phase 4 の `raw-find-evals.txt` が確定していること（スキル集合抽出の入力）。
  - Phase 2 §3.1（dual root 断定禁止）と Phase 3 §1 Phase 6 の分類基準が確定していること。
- **並列**: Phase 5 と W2 内で並列実行可能。ただし「要対応差分が consumer に与える影響」の追記のみ Phase 5 完了後に直列で行う（§3 Step 5）。
- **後続**:
  - **Phase 7**: `only-in-*.txt` と要対応差分を Phase 7 の漏れ再検索時の再確認対象とする。
  - **Phase 8**: `dual-root-parity.md` を入力とし、schema-change-guide の「dual root 同期手順」を作成する。
  - **Phase 12**: 要対応差分・片方欠損スキルを `unassigned-task-detection.md` の候補として引き渡す。

`dual-root-parity.md` は AC-4 の直接根拠であり、AC-6 解除判定（Phase 10）の必須条件のひとつ。
