# 三点突合クイックチェック（簡素化版）

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001              |
| Phase      | 8                                                       |
| 作成日     | 2026-03-03                                              |
| ステータス | completed                                               |
| 原本       | `outputs/phase-5/three-way-reconciliation-checklist.md` |

---

## 三点の定義

| 点  | ファイル                     | 内容     |
| --- | ---------------------------- | -------- |
| 点1 | `phase-12-documentation.md`  | 計画     |
| 点2 | `documentation-changelog.md` | 証跡     |
| 点3 | `spec-update-summary.md`     | 実施内容 |

---

## CP-1: タスクID一致

**判定**: 3ファイルから抽出したタスクIDが完全一致 → PASS

```bash
WF="docs/30-workflows/<FEATURE_NAME>"
for f in "${WF}/phase-12-documentation.md" \
         "${WF}/outputs/phase-12/documentation-changelog.md" \
         "${WF}/outputs/phase-12/spec-update-summary.md"; do
  echo "$(basename $f): $(rg -o 'UT-IMP-[A-Z0-9-]+' "$f" | head -1)"
done
```

---

## CP-2: 更新仕様書リスト一致

**判定**: 点2の全仕様書が点3に含まれる（点2 ⊆ 点3） → PASS

```bash
WF="docs/30-workflows/<FEATURE_NAME>"
rg -n 'references/' "${WF}/outputs/phase-12/documentation-changelog.md"
rg -n '^\|.*references/' "${WF}/outputs/phase-12/spec-update-summary.md"
# 手動照合: 点2の全仕様書名が点3に存在することを確認
```

---

## CP-3: Step 2判定整合

**判定**: 3ルール全て充足 → PASS

```bash
WF="docs/30-workflows/<FEATURE_NAME>"
# ルール(1): 点1にarch/api/interfaces/securityが含まれるか → Step 2要否を判定
rg -n 'arch-|api-|interfaces-|security-' "${WF}/phase-12-documentation.md"
# ルール(2): 点2のStep 2判定行を確認
rg -n '^\| 2\s+\|' "${WF}/outputs/phase-12/documentation-changelog.md"
# ルール(3): 点3の反映内容に空欄がない
rg -n '^\|.*-\s*\|$|^\|.*記録済み\s*\|$' "${WF}/outputs/phase-12/spec-update-summary.md"
# マッチ0行 → PASS
```

---

## CP-4: Step完了記録整合

**判定**: 点2と点3のStep 2判定値が完全一致 → PASS

```bash
WF="docs/30-workflows/<FEATURE_NAME>"
rg -n '^\| 2\s+\|' "${WF}/outputs/phase-12/documentation-changelog.md"
rg -n 'Step 2.*要否|Step判定同期|更新対象同期' "${WF}/outputs/phase-12/spec-update-summary.md"
```

---

## CP-5: SubAgent数整合

**判定**: summary と report の SubAgent行数が一致 かつ SubAgent名が全て一致 → PASS

```bash
WF="docs/30-workflows/<FEATURE_NAME>"
echo "summary: $(rg -c '^\| SubAgent-' "${WF}/outputs/phase-12/spec-update-summary.md")"
echo "report: $(rg -c '^\| SubAgent-' "${WF}/outputs/phase-12/spec-sync-subagent-report.md")"
```

---

## 総合判定

| 判定      | 条件                                          | 対応                               |
| --------- | --------------------------------------------- | ---------------------------------- |
| **PASS**  | CP-1〜CP-5が全てPASS                          | Phase 12完了可                     |
| **DRIFT** | いずれかでFAIL                                | 不一致点を修正してから再確認       |
| **N/A**   | 点1にarch/api/interfaces/securityが含まれない | Step 2対象なし。N/A理由を点2に明記 |

---

## 変更履歴

| バージョン | 日付       | 内容                                     |
| ---------- | ---------- | ---------------------------------------- |
| 1.0.0      | 2026-03-03 | Phase 5原本からの簡素化版作成（Phase 8） |
