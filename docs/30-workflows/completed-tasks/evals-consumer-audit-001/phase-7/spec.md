# Phase 7: 漏れ再検索・整合確認 - タスク仕様書

## メタ情報

| 項目             | 内容                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| phase_id         | 7                                                                                                  |
| task_id          | TASK-EVALS-CONSUMER-AUDIT-001                                                                      |
| Phase名          | 漏れ再検索（Coverage 相当）                                                                        |
| 前提Phase        | Phase 5（consumer-audit-report.md / evals-field-map.md 完成）／Phase 6（dual-root-parity.md 完成） |
| 後続Phase        | Phase 8（schema-change-guide 作成）                                                                |
| ステータス       | 未実施                                                                                             |
| 作成日           | 2026-04-19                                                                                         |
| 機能名           | evals-consumer-audit                                                                               |
| depends_on       | Phase 5（outputs/phase-5/\*）、Phase 6（outputs/phase-6/\*）                                       |
| taskType         | NON_VISUAL / 調査タスク（コード実装なし）                                                          |
| 並列可否         | **単独**（Phase 5 / 6 の統合確認のため）                                                           |
| 対応品質ゲート   | QG-6（未記載ヒット 0 件）                                                                          |
| 所属ウェーブ     | W3                                                                                                 |
| 出力ディレクトリ | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/`                                      |

---

## 1. 目的（Why）

Phase 4 の静的検索で見逃した動的パス生成 consumer・文字列連結 consumer を**コードリーディング**で発見し、Phase 5 の `consumer-audit-report.md` に追記する。また、Phase 4 と同じ検索コマンドを再実行して、その結果集合が Phase 5 記載集合に包含されることを検証し、**監査の漏れを 0 に収束**させる。

併せて Phase 5（consumer 分類・field map）と Phase 6（dual root 差分）の結果を統合し、要対応差分に影響を受ける consumer を特定する。

AC-6 解除判定（Phase 10）の前提となる「再現性ある consumer リスト」を確定する最後の Phase。

---

## 2. 入力（前 Phase 成果物・参照資料）

| 入力                         | パス                                                                                        | 用途                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Phase 5 consumer 監査表      | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md`       | 記載済み consumer 集合の参照                             |
| Phase 5 field map            | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`             | フィールド列挙の整合確認                                 |
| Phase 5 整合チェックログ     | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/cross-check-log.md`             | 既知の未解決差分の引継                                   |
| Phase 6 dual-root-parity     | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md`            | 要対応差分の影響 consumer 突合                           |
| Phase 6 片方欠損リスト       | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/only-in-*.txt`                  | 片方欠損スキルの consumer 存否確認                       |
| Phase 4 raw 全て             | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-*.txt`                      | 再実行時の比較対象                                       |
| Phase 2 再現コマンド         | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-2-scope-architecture.md` §7.2 | 再実行するコマンド群                                     |
| aiworkflow-requirements 正本 | `.claude/skills/aiworkflow-requirements/references/`                                        | 動的パス言及や consumer 記述の突合（本格突合は Phase 9） |

---

## 3. 実行手順

### Step 1: Phase 4 検索コマンドの再実行

Phase 4 Step 2-1〜2-6 と同じ検索コマンドを再実行し、結果を `phase-7/recheck-*.txt` に保存する。ファイル先頭にはメタコメント（command / executed_at / working_directory）を Phase 4 と同じフォーマットで記録する。

```bash
mkdir -p docs/30-workflows/evals-consumer-audit-001/outputs/phase-7

# 2-1 / 2-2 / 2-3 / 2-4 / 2-5 / 2-6 を Phase 4 と同じ引数で再実行
rg -n 'EVALS\.json|EVALS_PATH|evalsPath|EVALS_FILE' .claude/skills/ \
  -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs}' \
  | tee docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/recheck-grep-claude.txt

rg -n 'EVALS\.json|EVALS_PATH|evalsPath|EVALS_FILE' .agents/skills/ \
  -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs}' \
  | tee docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/recheck-grep-agents.txt

rg -n 'EVALS\.json|EVALS_PATH|evalsPath|EVALS_FILE' apps/ \
  -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs}' \
  | tee docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/recheck-grep-apps.txt

rg -n "join\([^)]*EVALS|\`[^\`]*EVALS\.json|'EVALS\.json'|\"EVALS\.json\"" \
  .claude/skills/ .agents/skills/ apps/ \
  -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs}' \
  | tee docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/recheck-grep-dynamic.txt
```

### Step 2: Phase 4 raw との diff 取得

Phase 4 と Phase 7 の再検索結果に差分がないことを確認する。差分がある場合、Phase 4 と Phase 7 の間に consumer が追加／削除された可能性がある。

```bash
for kind in claude agents apps dynamic; do
  diff -u \
    "docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-${kind}.txt" \
    "docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/recheck-grep-${kind}.txt" \
    > "docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/diff-${kind}.txt" || true
done
```

差分があれば `coverage-recheck.md` の専用セクションに原因調査を記録する（並行作業・新規コミット・環境差など）。

### Step 3: 動的パス consumer のコードリーディング補完（RISK-1 対応）

`recheck-grep-dynamic.txt` のヒット、および Phase 4 で候補化されなかった以下パターンをコードリーディングで補足する。

調査観点:

1. `const FILE_NAME = 'EVALS.json'; ... path.join(skillDir, FILE_NAME)` の形で `EVALS.json` リテラルが変数経由で使われているケース。
2. `readJson("EVALS")`、`loadSkillMetrics(skillName)` のようにラッパ関数で隠蔽されているケース。
3. テンプレートリテラル `` `${skillDir}/EVALS.json` `` のうち、文字列の途中に改行や連結が入るケース。
4. `SkillScanner` / `skill-fixture-runner` / `init_skill.js` など既知 consumer の呼び出し元（Phase 5 で抽出しきれていない間接利用）。

**コードリーディング手順**:

1. Phase 5 `consumer-audit-report.md` のスクリプト／コード consumer を開き、そこから require/import される関数・定数を grep で辿る。
2. 追加で発見した consumer は `phase-7/additional-consumers.md` に暫定記録する（9 列定義に従う）。
3. 暫定記録の内容を Phase 5 `consumer-audit-report.md` に追記する（Phase 5 は成果物として更新されるが、更新差分は `cross-check-log.md` と `coverage-recheck.md` に併記する）。

### Step 4: consumer 一覧と再検索結果の集合比較

Phase 5 `consumer-audit-report.md` に記載されたファイルパス集合 `A` と、Step 1 の再検索結果のファイルパス集合 `B` を比較する。`B ⊆ A` であることを検証する（未記載ヒット 0 件 = QG-6）。

```bash
# 再検索のヒットファイル集合
cat docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/recheck-grep-claude.txt \
    docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/recheck-grep-agents.txt \
    docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/recheck-grep-apps.txt \
    docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/recheck-grep-dynamic.txt \
  | awk -F: '{print $1}' | sort -u \
  > docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/recheck-paths.txt

# consumer-audit-report.md に未記載のパスを抽出
: > docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/unlisted-paths.txt
while IFS= read -r p; do
  grep -qF "$p" docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md \
    || echo "$p" >> docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/unlisted-paths.txt
done < docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/recheck-paths.txt

wc -l docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/unlisted-paths.txt
```

`unlisted-paths.txt` が 0 行であることを確認する。0 行でない場合は Step 3 のコードリーディングで追加 consumer として分類し、Phase 5 成果物へ追記する。

### Step 5: Phase 5 ↔ Phase 6 統合確認

Phase 6 `dual-root-parity.md` の「要対応差分」および「片方欠損スキル」について、Phase 5 `consumer-audit-report.md` 上の consumer との突合を行う。

観点:

1. 片方欠損スキルに対応する consumer（スクリプト / テスト）が consumer-audit-report に存在するか。存在するなら「片方 root で consumer が孤立している」旨を記録。
2. 要対応差分のあるスキルについて、evals-field-map の `readers` / `writers` / `validators` がどちら root を前提にしているかを確認。
3. 統合結果を `consumer-reaudit-report.md` にまとめる（Phase 5 成果物を書き換えず、Phase 7 視点の「再監査レポート」として独立）。

### Step 6: coverage-recheck.md（QG-6 の証跡）作成

以下の章立てで作成する。

1. メタ情報（実行日時・使用コマンド一覧）
2. Step 1 再実行結果のヒット件数（kind 別）
3. Step 2 diff 結果（Phase 4 との差分件数・原因分析）
4. Step 3 コードリーディングで追加した consumer の一覧
5. Step 4 集合比較結果（`B \ A` が 0 件であることの証跡）
6. Step 5 統合確認の要点
7. AC-8（再現コマンド再実行で同じ consumer リストが得られる）の自己宣言
8. 残存リスク・未タスク候補

---

## 4. 成果物（ファイルパス・フォーマット・スキーマ）

| 成果物                   | パス                                                                                                           | フォーマット | スキーマ                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------- |
| 再検索 raw               | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/recheck-grep-claude.txt`                           | text         | Phase 4 と同じフォーマット（先頭 3 行メタ） |
| 再検索 raw               | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/recheck-grep-agents.txt`                           | text         | 同上                                        |
| 再検索 raw               | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/recheck-grep-apps.txt`                             | text         | 同上                                        |
| 再検索 raw               | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/recheck-grep-dynamic.txt`                          | text         | 同上                                        |
| Phase 4 との diff        | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/diff-<kind>.txt` (kind=claude/agents/apps/dynamic) | text         | `diff -u` 出力                              |
| 再検索ヒットパス集合     | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/recheck-paths.txt`                                 | text         | 1 行 1 パス（sort 済み）                    |
| 未記載パスリスト         | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/unlisted-paths.txt`                                | text         | 0 行が目標                                  |
| コードリーディング追加分 | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/additional-consumers.md`                           | Markdown     | Phase 5 の 9 列定義に準拠                   |
| カバレッジ再確認レポート | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/coverage-recheck.md`                               | Markdown     | §3 Step 6 の章立て                          |
| ★統合再監査レポート      | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/consumer-reaudit-report.md`                        | Markdown     | §3 Step 5 の統合確認結果                    |

---

## 5. 完了条件チェックリスト

- [ ] Phase 4 と同じ 4 本の検索コマンドを再実行し、`recheck-grep-*.txt` が全て生成されている
- [ ] 各 recheck ファイル先頭 3 行にメタコメントが記録されている
- [ ] `diff-<kind>.txt` が 4 本生成されている（差分が 0 でも空ファイルとして作成）
- [ ] Phase 4 / Phase 7 間の差分が 0 または説明付きで記録されている
- [ ] Step 3 のコードリーディングで発見した追加 consumer が `additional-consumers.md` に Phase 5 の 9 列定義で記録されている
- [ ] 追加 consumer は Phase 5 `consumer-audit-report.md` に反映（あるいは反映差分が `cross-check-log.md` に追記）されている
- [ ] `unlisted-paths.txt` が 0 行である（= QG-6 達成）
- [ ] `consumer-reaudit-report.md` に Phase 5 × Phase 6 の統合結果（片方欠損／要対応差分と consumer の紐付け）が記載されている
- [ ] `coverage-recheck.md` に AC-8（再現性）の自己宣言が記載されている
- [ ] 残存リスク・未タスク候補は Phase 12 の `unassigned-task-detection.md` へ引き継ぐ形で列挙されている

---

## 6. 検証方法（自己検証コマンド）

### 6.1 再検索 raw と diff ファイルの生成確認

```bash
for kind in claude agents apps dynamic; do
  for prefix in recheck-grep diff; do
    f="docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/${prefix}-${kind}.txt"
    [ -f "$f" ] && echo "OK: $prefix-$kind" || echo "MISSING: $prefix-$kind"
  done
done
```

### 6.2 未記載パスが 0 行であること（QG-6）

```bash
lines=$(wc -l < docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/unlisted-paths.txt)
if [ "$lines" -eq 0 ]; then
  echo "QG-6 PASS"
else
  echo "QG-6 FAIL: $lines unlisted"
  head -20 docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/unlisted-paths.txt
fi
```

### 6.3 `consumer-reaudit-report.md` の統合確認セクション存在

```bash
for s in '片方欠損' '要対応差分' '追加consumer'; do
  grep -q "$s" docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/consumer-reaudit-report.md \
    && echo "OK: $s" || echo "MISSING: $s"
done
```

### 6.4 coverage-recheck.md の AC-8 自己宣言

```bash
grep -q 'AC-8' docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/coverage-recheck.md \
  && echo 'OK: AC-8 宣言あり' \
  || echo 'MISSING: AC-8 自己宣言が不足'
```

### 6.5 Phase 4 検索コマンドの一致確認

```bash
# recheck ファイルの先頭 "# command:" 行を Phase 4 と比較
for kind in claude agents apps dynamic; do
  p4=$(head -1 docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-${kind}.txt)
  p7=$(head -1 docs/30-workflows/evals-consumer-audit-001/outputs/phase-7/recheck-grep-${kind}.txt)
  [ "$p4" = "$p7" ] && echo "OK: $kind command matches" || echo "MISMATCH: $kind"
done
```

---

## 7. リスクと対策

| ID     | リスク                                                                                  | 対策                                                                                                                                        |
| ------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| P7-R-1 | Phase 4 と Phase 7 の間に EVALS.json 関連コミットが入ると diff が発生し、再現性が崩れる | Phase 4 / Phase 7 の間に EVALS 関連ファイルを変更しない（Phase 2 §2.3 準拠）。差分がある場合は `coverage-recheck.md` に原因と影響範囲を記録 |
| P7-R-2 | コードリーディングで動的 consumer を見落とす                                            | Step 3 の観点 1〜4 をチェックリスト化し、既知 consumer の require/import 元を grep で逆引き                                                 |
| P7-R-3 | 追加 consumer を `consumer-audit-report.md` に反映し忘れ、Phase 10 で検知される         | Step 3 で `additional-consumers.md` → Phase 5 本体への反映をチェックリストで強制                                                            |
| P7-R-4 | 片方欠損スキルに対応する consumer を誤検出する                                          | Step 5 で Phase 5 / Phase 6 の二方向突合を行い、結果を `consumer-reaudit-report.md` に根拠付きで記録                                        |
| P7-R-5 | `unlisted-paths.txt` が 0 行にならず Phase 8 に進めない                                 | 追加 consumer を Phase 5 へ反映後、Step 4 を再実行して 0 件を確認。0 件にならない場合は Phase 5 への戻りを Phase 10 の MAJOR 判定で宣言     |
| P7-R-6 | rg / grep のバージョン差で結果が非決定的                                                | raw ファイル先頭メタに `tool` と `version`（`rg --version` の先頭行）を追記することを推奨                                                   |

---

## 8. 前後 Phase との依存

- **前提**:
  - Phase 5（`consumer-audit-report.md` / `evals-field-map.md` / `cross-check-log.md`）完成。
  - Phase 6（`dual-root-parity.md` / `only-in-*.txt` / `per-skill/*.diff`）完成。
  - Phase 4 raw ファイルが未変更で残っていること（再現性比較の基準）。
- **後続**:
  - **Phase 8**: `coverage-recheck.md` の「残存リスク・未タスク候補」と `consumer-reaudit-report.md` の統合結果を入力として、schema-change-guide の「consumer 追加時の運用ルール」と「dual root 同期手順」を具体化する。
  - **Phase 9**: 追加 consumer と aiworkflow-requirements references/ の突合（QG-8）。
  - **Phase 10**: AC-6 解除判定の根拠として `coverage-recheck.md` の QG-6 達成宣言を使用。
  - **Phase 11**: 本 Phase で使用した再現コマンドを手動検証で再実行し、再現性を確認。

本 Phase 終了時点で consumer の網羅性・整合性が確定し、AC-6 解除判定（Phase 10）に進む前提が揃う。
