# Phase 5: Consumer 分類整理と Field Map 作成 - タスク仕様書

## メタ情報

| 項目             | 内容                                                                             |
| ---------------- | -------------------------------------------------------------------------------- |
| phase_id         | 5                                                                                |
| task_id          | TASK-EVALS-CONSUMER-AUDIT-001                                                    |
| Phase名          | Consumer 一覧整理 と Field Map 作成                                              |
| 前提Phase        | Phase 4（静的検索・raw evidence 固定完了）                                       |
| 後続Phase        | Phase 6（dual root 差分）／Phase 7（漏れ再検索）／Phase 8（schema-change-guide） |
| ステータス       | 未実施                                                                           |
| 作成日           | 2026-04-19                                                                       |
| 機能名           | evals-consumer-audit                                                             |
| depends_on       | Phase 4（`outputs/phase-4/raw-*.txt`・`raw-consumer-list.md`）                   |
| taskType         | NON_VISUAL / 調査・文書化タスク（コード実装なし）                                |
| 並列可否         | 内部 2 並列可（5-A consumer 分類 ∥ 5-B field map 作成）                          |
| 対応品質ゲート   | QG-3（AC-1 / AC-2 / FR-2 / FR-3）、QG-4（FR-4 / FR-5）                           |
| 所属ウェーブ     | W2（Phase 6 と並列）                                                             |
| 出力ディレクトリ | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/`                    |

---

## 1. 目的（Why）

Phase 4 で収集した raw 検索結果を「分類された consumer 一覧」と「フィールド逆引きマップ」に昇華し、本タスクの**最終成果物 1（consumer-audit-report.md）と最終成果物 2（evals-field-map.md）**を完成させる。

- Consumer を「コード／スクリプト／テスト／ドキュメント参照のみ」の 4 分類 × 2 root × フィクスチャ の軸で網羅的に整理する。
- 各 consumer の「読み込みフィールド」「書き込みフィールド」「操作（read/write/validate/document-only）」を記録する。
- EVALS スキーマの全フィールドごとに「reader / writer / validator」を逆引きできるマップを作成する。

これにより、後続の Phase 6 で dual root diff を consumer 名と突き合わせ、Phase 8 で schema-change-guide を書けるようになる。

---

## 2. 入力（前 Phase 成果物・参照資料）

| 入力                     | パス                                                                                        | 用途                                        |
| ------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Phase 4 raw（.claude）   | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-claude.txt`            | `.claude/skills/` 配下の consumer 候補      |
| Phase 4 raw（.agents）   | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-agents.txt`            | `.agents/skills/` 配下の consumer 候補      |
| Phase 4 raw（apps）      | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-apps.txt`              | TS/TSX コード／テスト consumer              |
| Phase 4 raw（dynamic）   | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-dynamic.txt`           | `path.join` 等の動的パス consumer           |
| Phase 4 raw（docs）      | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-docs.txt`              | ドキュメント参照のみ                        |
| Phase 4 raw（tests）     | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-tests.txt`             | テスト consumer の分離                      |
| Phase 4 raw（find）      | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-find-evals.txt`             | EVALS.json の全パス一覧                     |
| Phase 4 サマリ           | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-consumer-list.md`           | 解釈前の一次リスト                          |
| Phase 2 consumer 列定義  | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-2-scope-architecture.md` §3.2 | consumer 9 列定義（path/root/category/...） |
| Phase 2 field map 列定義 | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-2-scope-architecture.md` §3.3 | field map 8 列定義                          |
| 代表 EVALS スキーマ      | `.claude/skills/task-specification-creator/EVALS.json`                                      | 全フィールドの網羅確認                      |
| aiworkflow-requirements  | `.claude/skills/aiworkflow-requirements/references/`                                        | 正本仕様との表記整合（Phase 9 で本格突合）  |

---

## 3. 実行手順

本 Phase は **5-A / 5-B / 5-C の 3 サブタスク**で構成する。5-A と 5-B は並列実行可能。5-C は 5-A / 5-B 完了後に直列で実施する。

### サブタスク 5-A: consumer-audit-report.md 作成（並列可）

#### Step A-1: consumer 候補を分類

Phase 4 raw 群を読み込み、**重複排除**した上で以下の列に従って表に整理する。Phase 2 §3.2 の 9 列定義に準拠。

| 列名                 | 値の例                                                           |
| -------------------- | ---------------------------------------------------------------- |
| `path`               | `.claude/skills/task-specification-creator/scripts/log-usage.js` |
| `root`               | `.claude` / `.agents` / `apps/desktop` / `fixture`               |
| `category`           | A(code) / B(script) / C(test) / D(doc)                           |
| `operation`          | `read` / `write` / `read+write` / `validate` / `document-only`   |
| `referenced_fields`  | `["metrics.totalUsageCount", "currentLevel"]`                    |
| `updated_fields`     | `["metrics.lastEvaluated"]`                                      |
| `target_evals_paths` | `["<skill>/EVALS.json"]`                                         |
| `dynamic_path`       | `true` / `false`                                                 |
| `notes`              | 特記事項（漏れ検出のヒント等）                                   |

#### Step A-2: 4 分類ごとにセクションを構成

`consumer-audit-report.md` は以下の章立てで作成する。

1. メタ情報（生成日時・入力 Phase・整合した field map バージョン）
2. サマリ（consumer 総数・分類別内訳・root 別内訳）
3. A. コード consumer 一覧（`apps/desktop/src/**/*.ts|*.tsx`）
4. B. スクリプト consumer 一覧（`.claude/skills/*/scripts/*.js` と `.agents/skills/*/scripts/*.js`）
5. C. テスト consumer 一覧（`apps/desktop/src/__tests__/**`、フィクスチャ含む）
6. D. ドキュメント参照のみ一覧（`agents/*.md` 等）
7. 動的パス consumer 一覧（category A/B のうち dynamic_path=true を再掲）
8. 発見済み未タスク候補（Phase 12 の unassigned-task-detection に引き渡す候補）
9. AC-6 解除判定の暫定ステータス（Phase 10 で最終判定）

#### Step A-3: 各 consumer のフィールド読み書き調査

raw ヒット行だけでは read/write を判定できないため、以下のコードリーディング手順で補完する。

1. 該当ファイルを開き、`JSON.parse(fs.readFileSync(...))` / `fs.writeFileSync(..., JSON.stringify(...))` / ハンドラ境界を特定する。
2. 読み取り時に参照しているフィールドパス（例: `evals.metrics.totalUsageCount`）を `referenced_fields` に記録する。
3. 書き込み時に更新しているフィールドパスを `updated_fields` に記録する。
4. 自由記述フィールド（`qualityInsights.notes` 等）は注記を `notes` 列に記載する（RISK-7 対応）。

#### Step A-4: ファイル配置

`docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md` に保存する。

### サブタスク 5-B: evals-field-map.md 作成（並列可）

#### Step B-1: 代表スキーマの全フィールド抽出

`.claude/skills/task-specification-creator/EVALS.json` を基準に、フィールドパスをドット記法で全列挙する。少なくとも以下を網羅すること。

- `skillName`, `version`, `currentLevel`, `lastUpdated`
- `metrics.totalUsageCount`, `metrics.successCount`, `metrics.failureCount`, `metrics.successRate`, `metrics.averageDuration`, `metrics.lastEvaluated`
- `levelHistory[]`（要素構造を記載）
- `patterns.*`（キー列挙）
- `phaseMetrics.<phase_id>.*`
- `qualityInsights.*`（`notes` 等の自由記述を区別）
- `levelCriteria.*`

スキルごとの追加フィールドがあれば、`schema_origin` 列で「task-specification-creator 固有」「skill-creator 固有」等を明示する。

#### Step B-2: 逆引きマップを 8 列で作成

Phase 2 §3.3 の列定義に準拠。

| 列名             | 説明                                                                     |
| ---------------- | ------------------------------------------------------------------------ |
| `field_path`     | `metrics.successCount` 等、ドット記法                                    |
| `type`           | `string` / `number` / `array` / `object` / `freeform`                    |
| `schema_origin`  | `representative` / `<skillName> 固有`                                    |
| `readers`        | 5-A で特定した consumer のうち、このフィールドを read するもののパス集合 |
| `writers`        | 同上、write するもの                                                     |
| `validators`     | `validate-schemas.js` 等、validate するもの                              |
| `risk_on_change` | `low` / `medium` / `high`（consumer 数や validator 有無から決定）        |
| `notes`          | 自由記述フィールドの場合、型チェック困難である旨などを記載               |

#### Step B-3: ファイル配置

`docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md` に保存する。

### サブタスク 5-C: 5-A / 5-B の相互整合（直列・5-A/B 完了後）

#### Step C-1: field 名表記の統一

`consumer-audit-report.md` の `referenced_fields` / `updated_fields` に含まれるフィールドパス集合が、`evals-field-map.md` の `field_path` 集合に包含されることを確認する。

差集合がある場合、以下のいずれか:

- evals-field-map.md 側にフィールドを追加（スキル固有拡張として `schema_origin` に記載）
- consumer-audit-report.md 側の誤りを訂正

#### Step C-2: consumer パスの統一

`evals-field-map.md` の `readers` / `writers` / `validators` 列のパスが、`consumer-audit-report.md` の `path` 列に全件存在することを確認する。

#### Step C-3: AC-1 / AC-2 / AC-3 の充足確認

- AC-1: 4 分類（A/B/C/D）それぞれに 1 件以上の consumer が載るか、もしくは「該当なし」と明示。
- AC-2: 全 consumer について operation / referenced_fields / updated_fields の 3 項目が埋まっている。
- AC-3: 代表スキーマの全フィールドが field map に定義され、readers/writers が逆引きできる。

---

## 4. 成果物（ファイルパス・フォーマット・スキーマ）

| 成果物                            | パス                                                                                  | フォーマット | スキーマ                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------- |
| ★最終成果物 1: consumer 監査表    | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md` | Markdown     | §3 Step A-1 の 9 列、§3 Step A-2 の章立て                  |
| ★最終成果物 2: field 逆引きマップ | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`       | Markdown     | §3 Step B-2 の 8 列                                        |
| 整合チェックログ                  | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/cross-check-log.md`       | Markdown     | 5-C で検出した不一致の列挙（解消済みか未タスク化かを記載） |

`cross-check-log.md` は Phase 7（漏れ再検索）と Phase 10（最終レビュー）の入力にもなる。

---

## 5. 完了条件チェックリスト

- [ ] `consumer-audit-report.md` が生成され、A/B/C/D 4 分類のセクションが存在する
- [ ] 全 consumer について `path` / `root` / `category` / `operation` / `referenced_fields` / `updated_fields` / `target_evals_paths` / `dynamic_path` / `notes` の 9 列が埋まっている
- [ ] `consumer-audit-report.md` のサマリで consumer 総数・分類別内訳・root 別内訳が表示されている
- [ ] `evals-field-map.md` に代表スキーマの全フィールドが登録されている
- [ ] `evals-field-map.md` の各行に `readers` / `writers` / `validators` / `risk_on_change` が記載されている
- [ ] `cross-check-log.md` が作成され、Step C-1 / C-2 の差分が 0 もしくは未タスク化されている
- [ ] AC-1 / AC-2 / AC-3 の充足が自己確認されている
- [ ] RISK-1（動的パス）該当 consumer には `dynamic_path=true` が付与されている
- [ ] RISK-7（自由記述フィールド）に該当するフィールドは field map の `type=freeform` と `notes` に注記されている
- [ ] aiworkflow-requirements 正本との用語不整合は cross-check-log.md に候補記録されている（本格突合は Phase 9）

---

## 6. 検証方法（自己検証コマンド）

### 6.1 成果物ファイルの存在とサイズ

```bash
for f in consumer-audit-report.md evals-field-map.md cross-check-log.md; do
  path="docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/$f"
  if [ -f "$path" ]; then
    echo "OK: $f ($(wc -l < "$path") lines)"
  else
    echo "MISSING: $f"
  fi
done
```

`consumer-audit-report.md` と `evals-field-map.md` が 1000 行超過する場合は NFR-8 に従い分割を検討。

### 6.2 4 分類セクションの存在確認

```bash
for cat in 'A\. コード consumer' 'B\. スクリプト consumer' 'C\. テスト consumer' 'D\. ドキュメント参照のみ'; do
  grep -q "$cat" docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md \
    && echo "OK: $cat" || echo "MISSING: $cat"
done
```

### 6.3 全 raw ファイルのヒットが consumer-audit-report.md に反映されているか（簡易）

```bash
# raw-grep-*.txt に現れるファイルパス集合のうち、consumer-audit-report.md に記載されていないものを列挙
cat docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-claude.txt \
    docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-agents.txt \
    docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-apps.txt \
    docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-tests.txt \
    docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-dynamic.txt \
  | awk -F: '{print $1}' | sort -u \
  > /tmp/phase5-raw-paths.txt

while IFS= read -r p; do
  grep -qF "$p" docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md \
    || echo "UNLISTED: $p"
done < /tmp/phase5-raw-paths.txt
```

`UNLISTED` 行が 0 件であること（0 件でない場合は Phase 7 の漏れ再検索で最終対応）。

### 6.4 field map のフィールド数確認

```bash
# field_path 列の行数（ヘッダを除く）が代表スキーマのフィールド数以上であること
grep -cE '^\| `[a-zA-Z]' docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md
```

### 6.5 consumer の operation 空欄チェック

```bash
# operation 列が空のまま放置されていないか
grep -nE '\| +\|' docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md | head -20
```

---

## 7. リスクと対策

| ID     | リスク                                                                  | 対策                                                                                                  |
| ------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| P5-R-1 | 5-A と 5-B の並列実行で consumer パス・フィールド名の表記が食い違う     | 5-C で相互整合を実施し `cross-check-log.md` に差分解消記録を残す                                      |
| P5-R-2 | ドキュメント参照のみ（D）をコード consumer（A/B）に誤分類する           | Phase 2 §1.3 の分類軸を厳守し、`*.md` は原則 D、実行コードから require/import される例外のみ B に昇格 |
| P5-R-3 | RISK-7 の自由記述フィールドを「参照あり」と誤判定                       | field map の `type=freeform` 列で明示し、consumer 側 `notes` にも注記                                 |
| P5-R-4 | `metrics.successRate` のような派生値を writer に含めて誤カウントする    | 派生値（計算結果の write）は consumer 側 `updated_fields` 末尾に `(derived)` 注記                     |
| P5-R-5 | `apps/desktop/src/__tests__/__fixtures__/.../EVALS.json` を root 誤判定 | Phase 2 §3.1 の方針に従い `root=fixture` として扱い、dual root の対称性判定には含めない               |
| P5-R-6 | aiworkflow-requirements 正本との用語不整合                              | 本格突合は Phase 9（QG-8）に委譲し、本 Phase では候補を `cross-check-log.md` に記録のみ               |

---

## 8. 前後 Phase との依存

- **前提**:
  - Phase 4 の 6 種 raw ファイルと `raw-consumer-list.md` が全て生成されていること。
  - Phase 2 §3.2 / §3.3 の列定義と Phase 3 §1 Phase 5 設計が確定していること。
- **後続**:
  - **Phase 6**（並列）: `raw-find-evals.txt` を用いた dual root diff は Phase 5 と独立実行可能。ただし `dual-root-parity.md` 内で consumer 名を参照する箇所は、本 Phase の `consumer-audit-report.md` 完成を待って突合する。
  - **Phase 7**: 本 Phase の consumer 集合を基準に、同じ検索コマンドを再実行して漏れ 0 件を検証する。
  - **Phase 8**: 本 Phase の 2 成果物 + Phase 6 の dual-root-parity.md を統合して schema-change-guide を作成する。
  - **Phase 9**: aiworkflow-requirements references/ との整合性検証で本 Phase 成果物を参照する。

本 Phase は「最終成果物 1 / 2」を生成する中核 Phase であり、AC-6 解除判定（Phase 10）の主根拠となる。
