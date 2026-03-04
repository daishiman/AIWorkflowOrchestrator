# 三点突合チェックリスト — Phase 12 成果物整合検証

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001 |
| Phase      | 5                                          |
| 作成日     | 2026-03-03                                 |
| ステータス | completed                                  |
| 担当タスク | Task 5-3（三点突合チェックリスト実装）     |

---

## 1. 三点の定義

| 点  | 成果物                       | 表す内容                             | 情報の性質     |
| --- | ---------------------------- | ------------------------------------ | -------------- |
| 点1 | `phase-12-documentation.md`  | 更新対象テーブル（何を更新すべきか） | 「計画・目標」 |
| 点2 | `documentation-changelog.md` | Step 2判定（何を更新したか・判定）   | 「実績・証跡」 |
| 点3 | `spec-update-summary.md`     | 更新対象一覧（実際に何を更新したか） | 「実施内容」   |

---

## 2. チェックポイント一覧（5点）

### CP-1: タスクID一致

| 項目     | 内容                                                           |
| -------- | -------------------------------------------------------------- |
| 確認対象 | 点1・点2・点3の3ファイル                                       |
| 確認内容 | 3ファイル全てに同一タスクIDが記載されていること                |
| 判定基準 | 3ファイルから抽出したタスクIDが完全一致 → PASS / 不一致 → FAIL |

**機械検証コマンド:**

```bash
# 3ファイルからタスクIDを抽出し一致確認
WORKFLOW_DIR="docs/30-workflows/<FEATURE_NAME>"
for f in \
  "${WORKFLOW_DIR}/phase-12-documentation.md" \
  "${WORKFLOW_DIR}/outputs/phase-12/documentation-changelog.md" \
  "${WORKFLOW_DIR}/outputs/phase-12/spec-update-summary.md"; do
  echo "$(basename $f): $(rg -o 'UT-IMP-[A-Z0-9-]+' "$f" | head -1)"
done
```

**PASS条件**: 3行の出力が全て同一のタスクID

---

### CP-2: 更新仕様書リスト一致

| 項目     | 内容                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| 確認対象 | 点2（documentation-changelog.md）と点3（spec-update-summary.md）                   |
| 確認内容 | 点2のStep 2で更新した仕様書が、点3の更新対象一覧に全て含まれていること（包含関係） |
| 判定基準 | 点2の仕様書 ⊆ 点3の仕様書 → PASS / 点2の仕様書が点3に存在しない → FAIL             |

**機械検証コマンド:**

```bash
WORKFLOW_DIR="docs/30-workflows/<FEATURE_NAME>"

# 点2: changelog から Step 2 更新仕様書を抽出
rg -n 'references/' "${WORKFLOW_DIR}/outputs/phase-12/documentation-changelog.md"

# 点3: summary から更新対象仕様書を抽出
rg -n '^\|.*references/' "${WORKFLOW_DIR}/outputs/phase-12/spec-update-summary.md"

# 手動照合: 点2の全仕様書が点3に含まれることを確認
```

**PASS条件**: 点2の全仕様書名が点3に存在する（点3が点2を上回ることは許容）

---

### CP-3: Step 2判定整合

| 項目     | 内容                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------- |
| 確認対象 | 点1（phase-12-documentation.md）と点2（documentation-changelog.md）と点3（spec-update-summary.md） |
| 確認内容 | Step 2 要否判定が3ファイル間で一貫していること                                                     |
| 判定基準 | ルール(1)〜(3)全て充足 → PASS / いずれか不一致 → FAIL                                              |

**ルール(1): Step 2 要否の一貫性確認**

```bash
WORKFLOW_DIR="docs/30-workflows/<FEATURE_NAME>"

# 点1確認: arch/api/interfaces/security が含まれるか
rg -n 'arch-|api-|interfaces-|security-' \
  "${WORKFLOW_DIR}/phase-12-documentation.md"
# マッチあり → Step 2「完了」を期待 / マッチなし → Step 2「該当なし」を期待

# 点2確認: Step 2 判定行を取得
rg -n '^\| 2\s+\|' \
  "${WORKFLOW_DIR}/outputs/phase-12/documentation-changelog.md"
# 判定値が「完了」または「該当なし」であること
```

**PASS条件**:

- 点1にarch/api/interfaces/securityが含まれる → 点2のStep 2行が「完了」
- 点1に含まれない → 点2のStep 2行が「該当なし」または「N/A」

**ルール(2): 更新対象の包含関係確認**（CP-2と同一チェック）

**ルール(3): 反映内容の実質確認**

```bash
WORKFLOW_DIR="docs/30-workflows/<FEATURE_NAME>"

# 点3の仕様反映先テーブルで空欄・形式的記述を検出
rg -n '^\|.*-\s*\|$|^\|.*記録済み\s*\|$' \
  "${WORKFLOW_DIR}/outputs/phase-12/spec-update-summary.md"
# マッチ0行が期待値（空欄・「-」・「記録済み」のみの行がない）
```

**PASS条件**: マッチ行数が0（全仕様書に実質的な反映内容が記載されている）

---

### CP-4: Step完了記録整合

| 項目     | 内容                                                              |
| -------- | ----------------------------------------------------------------- |
| 確認対象 | 点2（documentation-changelog.md）と点3（spec-update-summary.md）  |
| 確認内容 | 点2のStep 2判定値と点3 §3.3のStep 2判定記述が完全一致していること |
| 判定基準 | 判定値一致 → PASS / 不一致 → FAIL                                 |

**機械検証コマンド:**

```bash
WORKFLOW_DIR="docs/30-workflows/<FEATURE_NAME>"

# 点2の Step 2判定値
rg -n '^\| 2\s+\|' "${WORKFLOW_DIR}/outputs/phase-12/documentation-changelog.md"

# 点3 §3.3 の Step 2判定記述
rg -n 'Step 2.*要否|Step判定同期|更新対象同期' \
  "${WORKFLOW_DIR}/outputs/phase-12/spec-update-summary.md"
```

**PASS条件**: 点2と点3のStep 2判定値が完全一致（どちらも「完了」またはどちらも「該当なし」）

---

### CP-5: SubAgent数整合

| 項目     | 内容                                                        |
| -------- | ----------------------------------------------------------- |
| 確認対象 | 点3（spec-update-summary.md）とspec-sync-subagent-report.md |
| 確認内容 | summary §3のSubAgent数とreport §2のSubAgent数が一致すること |
| 判定基準 | 行数一致 かつ SubAgent名が全て一致 → PASS / 不一致 → FAIL   |

**機械検証コマンド:**

```bash
WORKFLOW_DIR="docs/30-workflows/<FEATURE_NAME>"

# summary の SubAgent 行数
echo "summary: $(rg -c '^\| SubAgent-' "${WORKFLOW_DIR}/outputs/phase-12/spec-update-summary.md")"

# report の SubAgent 行数
echo "report: $(rg -c '^\| SubAgent-' "${WORKFLOW_DIR}/outputs/phase-12/spec-sync-subagent-report.md")"
```

**PASS条件**: 両方の行数が一致し、SubAgent名リストが完全一致

---

## 3. 総合判定基準

| 判定      | 条件                                          | 対応                                                         |
| --------- | --------------------------------------------- | ------------------------------------------------------------ |
| **PASS**  | CP-1〜CP-5が全てPASS                          | 三点整合。Phase 12完了可                                     |
| **DRIFT** | CP-1〜CP-5のいずれかでFAIL                    | 不一致点を特定し、該当成果物を修正してから再確認             |
| **N/A**   | 点1にarch/api/interfaces/securityが含まれない | Step 2対象なし（ドキュメントのみタスク）。N/A理由を点2に明記 |

---

## 4. 実行タイミング

| タイミング            | 実行者           | 目的                                  |
| --------------------- | ---------------- | ------------------------------------- |
| Phase 12 Task 2開始前 | SubAgent-S2-A    | 点1を確認し、Step 2要否を確定する     |
| Task 2実施中          | SubAgent-S2-B    | 点2を更新し、Step 2判定を記録する     |
| Task 2完了後          | SubAgent-S2-C    | 点3を確認し、三点突合の最終判定を行う |
| Phase 12完了直前      | 実行エージェント | 三点突合の最終確認（PASS/DRIFT/N/A）  |

---

## 5. 変更履歴

| バージョン | 日付       | 内容                           |
| ---------- | ---------- | ------------------------------ |
| 1.0.0      | 2026-03-03 | 三点突合チェックリスト初版作成 |
