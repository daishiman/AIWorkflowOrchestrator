# Phase 4: テスト作成（検証スクリプト・検証手順）

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| Phase      | 4                                                                        |
| タスクID   | TASK-LOGS-ARCHIVE-POLICY-001                                             |
| 機能名     | LOGS.md アーカイブポリシー詳細化                                         |
| 前提Phase  | Phase 1, Phase 2, Phase 3                                                |
| 後続Phase  | Phase 5                                                                  |
| 作成日     | 2026-04-19                                                               |
| Issue      | [#2282](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2282) |
| ステータス | completed                                                                |

## 目的

本タスクは文書のみの成果物（ポリシー文書の執筆）であるため、ここで言う「テスト」は
実行可能なユニットテストではなく **検証スクリプト / 検証手順** を指す。
Phase 5 でポリシー文書を執筆・同期した際に、以下を機械的に検証できる状態を確立する。

1. ポリシー文書の必須セクション（6 種）が全て存在することの検証
2. archive ファイル命名規則（`logs-archive-YYYY-MM.md`）の正規表現検証
3. mirror sync 対象に `.claude/skills/aiworkflow-requirements/references/` が含まれることの検証（**F-002 対応**）
4. `topic-map.md` への参照追加が行われたことの検証
5. 既存 legacy 表記（`feb`/`march`）と新規 YYYY-MM 数値形式の共存可否判定（F-001 検出用）

Phase 5 実装直後に本 Phase の検証スクリプトを実行し、全て PASS することを Green 条件とする。

## 実行タスク

- 検証スクリプト群（bash/rg ベース）の作成
- TC-01〜TC-08 の検証ケースをチェックリスト化
- TDD Red 相当の事前確認（Phase 5 実装前に検証が FAIL することの確認）
- F-002（mirror sync 対象の実測検証）の手順整備
- 既存 logs-archive-\*.md 資産との命名衝突事前チェック手順

## 参照資料

| 資料名                       | パス                                                                              | 用途                         |
| ---------------------------- | --------------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 要件定義             | `docs/30-workflows/logs-archive-policy-001/phase-1-requirements.md`               | 計測データ・既存パターン把握 |
| Phase 2 設計書               | `docs/30-workflows/logs-archive-policy-001/phase-2-design.md`                     | D-1〜D-4・必須セクション参照 |
| Phase 3 設計レビュー         | `docs/30-workflows/logs-archive-policy-001/phase-3-design-review.md`              | F-001〜F-005 指摘事項        |
| 既存 logs-archive-2026-feb   | `.claude/skills/task-specification-creator/references/logs-archive-2026-feb.md`   | legacy 表記サンプル          |
| 既存 logs-archive-2026-march | `.claude/skills/task-specification-creator/references/logs-archive-2026-march.md` | legacy 表記サンプル          |
| topic-map.md                 | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                     | 参照追加対象                 |

## 検証ケース一覧

### セクション存在検証（正常系）

| TC ID | 検証名                  | 検証内容                                                                                                                                                         | AC   |
| ----- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| TC-01 | 必須 6 セクションの存在 | `## 1. 適用範囲` / `## 2. アーカイブ閾値` / `## 3. archive 先パス規則` / `## 4. アーカイブ手順` / `## 5. 運用ルール` / `## 6. 参照` が正本文書に全て存在すること | AC-1 |
| TC-02 | 閾値 3 種の明記         | 「300 行」「30 KB」「月次」の 3 閾値が `## 2.` 配下で明記されていること                                                                                          | AC-2 |
| TC-03 | 命名規則の明記          | `logs-archive-YYYY-MM.md` 文字列が `## 3.` 配下で明記されていること                                                                                              | AC-2 |
| TC-04 | 手順 6 ステップの存在   | `## 4.` 配下に 1〜6 の番号付きステップが存在すること                                                                                                             | AC-3 |

### 命名規則・正規表現検証

| TC ID | 検証名                             | 検証内容                                                                                  | AC   |
| ----- | ---------------------------------- | ----------------------------------------------------------------------------------------- | ---- |
| TC-05 | 命名正規表現のマッチ               | ポリシー文書中の正規表現 `^logs-archive-\d{4}-(0[1-9]\|1[0-2])\.md$` が記載されていること | AC-2 |
| TC-06 | legacy 共存方針の記載（**F-001**） | legacy 表記（feb/march）と新規 YYYY-MM 数値形式の共存方針が明記されていること             | AC-4 |

### mirror sync 検証（**F-002 対応**）

| TC ID | 検証名                  | 検証内容                                                                                                   | AC   |
| ----- | ----------------------- | ---------------------------------------------------------------------------------------------------------- | ---- |
| TC-07 | mirror 先ファイルの存在 | Phase 5 実装後に `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` が存在すること | AC-5 |
| TC-08 | mirror 内容の一致       | `.claude/` と `.agents/` の両ポリシー文書が `diff` で差分ゼロであること                                    | AC-5 |

### topic-map.md 参照検証

| TC ID | 検証名                | 検証内容                                                                                                    | AC   |
| ----- | --------------------- | ----------------------------------------------------------------------------------------------------------- | ---- |
| TC-09 | topic-map.md への追記 | `logs-archive-policy` 文字列が `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` に存在すること | AC-6 |

### その他（F-003〜F-005 文書記述検証）

| TC ID | 検証名                                | 検証内容                                                                                     | AC   |
| ----- | ------------------------------------- | -------------------------------------------------------------------------------------------- | ---- |
| TC-10 | 判定タイミングの明示（**F-003**）     | 月初/月末判定タイミングがポリシー文書内で固定記述されていること                              | AC-4 |
| TC-11 | 最終更新日・次回見直し日（**F-004**） | メタ情報セクションに「最終更新日 2026-04-19」「次回見直し日 2026-10-19」が記載されていること | AC-4 |
| TC-12 | エスカレーションフロー（**F-005**）   | ポリシー違反時のエスカレーション先（人間レビュー / AI エージェント）が明記されていること     | AC-4 |

## 実行手順

### 0. 事前確認（Phase 5 未実施状態）

Phase 5 実装前に下記を実行し **FAIL する** ことを確認する（TDD Red 相当）。

```bash
# 正本ファイルがまだ存在しないことを確認
test -f .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md && echo "EXISTS" || echo "NOT_EXISTS"
# 期待: NOT_EXISTS

# mirror ファイルもまだ存在しないことを確認
test -f .agents/skills/aiworkflow-requirements/references/logs-archive-policy.md && echo "EXISTS" || echo "NOT_EXISTS"
# 期待: NOT_EXISTS

# topic-map.md への参照未追加を確認
grep -c "logs-archive-policy" .claude/skills/aiworkflow-requirements/indexes/topic-map.md || echo "0"
# 期待: 0
```

### 1. 必須セクション検証スクリプト（TC-01〜TC-04）

```bash
POLICY=".claude/skills/aiworkflow-requirements/references/logs-archive-policy.md"

# TC-01: 必須 6 セクションの存在
for section in "## 1. 適用範囲" "## 2. アーカイブ閾値" "## 3. archive 先パス規則" "## 4. アーカイブ手順" "## 5. 運用ルール" "## 6. 参照"; do
  grep -qF "$section" "$POLICY" && echo "OK: $section" || echo "FAIL: $section"
done

# TC-02: 閾値 3 種の明記
for threshold in "300 行" "30 KB" "月次"; do
  grep -qF "$threshold" "$POLICY" && echo "OK: $threshold" || echo "FAIL: $threshold"
done

# TC-03: 命名規則の明記
grep -qF "logs-archive-YYYY-MM.md" "$POLICY" && echo "OK: naming" || echo "FAIL: naming"

# TC-04: 手順 6 ステップの存在
awk '/^## 4\./,/^## 5\./' "$POLICY" | grep -cE "^[1-6]\." | awk '{if($1>=6) print "OK: steps"; else print "FAIL: steps"}'
```

### 2. 命名規則正規表現検証（TC-05・TC-06）

```bash
POLICY=".claude/skills/aiworkflow-requirements/references/logs-archive-policy.md"

# TC-05: 命名正規表現の記載
grep -qE '\^logs-archive-\\d\{4\}-\(0\[1-9\]\|1\[0-2\]\)\\\.md\$' "$POLICY" \
  && echo "OK: regex" || echo "FAIL: regex"

# TC-06: F-001 legacy 共存方針
grep -qE "(legacy|レガシー).*(feb|march|月名)" "$POLICY" \
  && echo "OK: F-001 legacy 共存" || echo "FAIL: F-001"
```

### 3. mirror sync 検証（TC-07・TC-08、**F-002 対応**）

```bash
CLAUDE_POLICY=".claude/skills/aiworkflow-requirements/references/logs-archive-policy.md"
AGENTS_POLICY=".agents/skills/aiworkflow-requirements/references/logs-archive-policy.md"

# F-002 前段: mirror sync 機構が references/ 配下を対象としているかの実測
# TASK-CONFLICT-PREVENT-001 の sync スクリプト／設定を参照
ls .agents/skills/aiworkflow-requirements/references/ 2>/dev/null \
  && echo "OK: references sync path exists" \
  || echo "WARN: references path missing on agents side"

# TC-07: mirror 先ファイルの存在
test -f "$AGENTS_POLICY" && echo "OK: mirror exists" || echo "FAIL: mirror missing"

# TC-08: 内容の一致
diff -q "$CLAUDE_POLICY" "$AGENTS_POLICY" \
  && echo "OK: mirror diff=0" || echo "FAIL: mirror diff found"
```

**F-002 のフォールバック手順**: sync 機構が `references/` 配下を対象外とする場合、
Phase 5 実装時に手動コピー手順を文書化し、本 TC-07・TC-08 はその手動コピー後に PASS することを確認する。

### 4. topic-map.md 参照検証（TC-09）

```bash
TOPIC_MAP=".claude/skills/aiworkflow-requirements/indexes/topic-map.md"
grep -qF "logs-archive-policy" "$TOPIC_MAP" \
  && echo "OK: topic-map reference" || echo "FAIL: topic-map missing"
```

### 5. 文書記述検証（TC-10〜TC-12、F-003〜F-005 対応）

```bash
POLICY=".claude/skills/aiworkflow-requirements/references/logs-archive-policy.md"

# TC-10: F-003 判定タイミング
grep -qE "(月初|月末)" "$POLICY" && echo "OK: F-003 timing" || echo "FAIL: F-003"

# TC-11: F-004 最終更新日・次回見直し日
grep -qE "最終更新日.*2026-04-19" "$POLICY" && echo "OK: F-004 updated-at" || echo "FAIL: F-004 updated-at"
grep -qE "次回見直し日.*2026-10-19" "$POLICY" && echo "OK: F-004 next-review" || echo "FAIL: F-004 next-review"

# TC-12: F-005 エスカレーションフロー
grep -qE "(エスカレーション|ポリシー違反)" "$POLICY" && echo "OK: F-005" || echo "FAIL: F-005"
```

### 6. 既存 logs-archive-\*.md 命名衝突事前チェック

```bash
# 新規命名規則 logs-archive-YYYY-MM.md が既存と衝突しないことを確認
ls .claude/skills/task-specification-creator/references/logs-archive-*.md 2>/dev/null | while read f; do
  base=$(basename "$f")
  if [[ "$base" =~ ^logs-archive-[0-9]{4}-(0[1-9]|1[0-2])\.md$ ]]; then
    echo "NEW FORMAT: $base"
  else
    echo "LEGACY: $base"
  fi
done
# 期待: logs-archive-2026-feb.md / logs-archive-2026-march.md は LEGACY、
#       新規ファイル（Phase 5 以降）は NEW FORMAT と判定される
```

## 受け入れ基準（AC）

| ID   | 受け入れ基準                                                          | 検証方法                 |
| ---- | --------------------------------------------------------------------- | ------------------------ |
| AC-1 | TC-01 により必須 6 セクションの存在確認スクリプトが定義されている     | 検証スクリプトの存在確認 |
| AC-2 | TC-02〜TC-05 により閾値・命名規則の検証スクリプトが定義されている     | 検証スクリプトの存在確認 |
| AC-3 | TC-04 によりアーカイブ手順 6 ステップの検証が定義されている           | 検証スクリプトの存在確認 |
| AC-4 | TC-06・TC-10〜TC-12 により F-001・F-003〜F-005 の検証が定義されている | 検証スクリプトの存在確認 |
| AC-5 | TC-07・TC-08 により mirror sync 検証（F-002）が定義されている         | 検証スクリプトの存在確認 |
| AC-6 | TC-09 により topic-map.md 参照追加の検証が定義されている              | 検証スクリプトの存在確認 |
| AC-7 | Phase 5 実装前に全検証が FAIL することを事前確認している（Red 相当）  | 事前確認手順の記述を確認 |

## 統合テスト連携【必須】

| 判定項目           | 基準                             | 結果 |
| ------------------ | -------------------------------- | ---- |
| TC-01〜TC-12       | 全件定義済み                     | PASS |
| F-001〜F-005 対応  | 各テストケースへ割り当て済み     | PASS |
| Phase 5 Green 前提 | Red → Green の切替条件が明記済み | PASS |

## スコープ

### 含むもの

- ポリシー文書の必須セクション検証手順
- 命名規則正規表現検証
- mirror sync 実測検証（F-002）
- topic-map.md 参照検証
- F-001・F-003〜F-005 の文書記述検証
- Phase 5 実装前の Red 状態確認手順

### 含まないもの

- ポリシー文書本体の執筆（Phase 5 で実施）
- mirror sync 機構そのものの実装変更（別タスク）
- CI への検証スクリプト統合（別タスク）
- アーカイブ自動化スクリプトのテスト（別タスク）

## リスクと対策

| リスク                                                | 影響 | 対策                                                                      |
| ----------------------------------------------------- | ---- | ------------------------------------------------------------------------- |
| mirror sync 機構が `references/` を sync 対象外とする | 中   | F-002 検証で FAIL を検知し、Phase 5 で手動コピー手順にフォールバック      |
| 既存 legacy 表記ファイルを誤って FAIL 判定する        | 低   | TC-06 で legacy 共存方針の記載のみを検証し、既存ファイルは対象外とする    |
| 正規表現エスケープミスによる誤検出                    | 低   | TC-05 で正規表現そのものの記載を確認、実ファイル検査は Phase 6 以降で実施 |
| grep 実行環境差異による誤 PASS                        | 低   | 実行環境（macOS / Linux）両方で検証する注記を文書に記載                   |

## 多角的チェック観点

| 観点             | チェック内容                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| TDD Red 原則     | Phase 5 実装前に全検証が FAIL することを確認できているか                                              |
| Phase 3 指摘網羅 | F-001（TC-06）、F-002（TC-07・TC-08）、F-003（TC-10）、F-004（TC-11）、F-005（TC-12）が全て検証可能か |
| 正本/mirror 対称 | `.claude/` と `.agents/` の両側で検証スクリプトが適用可能か                                           |
| 既存資産互換     | 既存 `logs-archive-2026-feb.md` 等との共存が検証可能か                                                |
| 自動化親和性     | 検証スクリプトが将来的に CI に組み込める形式か                                                        |

## 成果物

| 成果物             | パス                                                                 | 説明                          |
| ------------------ | -------------------------------------------------------------------- | ----------------------------- |
| Phase 4 仕様書     | `docs/30-workflows/logs-archive-policy-001/phase-4-test-creation.md` | 本ドキュメント                |
| 検証スクリプト雛形 | 本 Phase 内の bash ブロック（Phase 5 で実際に実行）                  | TC-01〜TC-12 の検証コマンド集 |

## 完了条件

- [ ] TC-01〜TC-12 の検証ケースが全て記述されている
- [ ] F-001〜F-005 のうち F-002 が Phase 4 の TC-07・TC-08 で扱われている
- [ ] F-001・F-003・F-004・F-005 の文書記述検証（TC-06・TC-10〜TC-12）が定義されている
- [ ] Phase 5 実装前の Red 相当事前確認手順が記述されている
- [ ] 既存 legacy 表記との共存判定手順が記述されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 5 実装前の Red 状態事前確認手順記述
2. 必須セクション検証スクリプト雛形作成（TC-01〜TC-04）
3. 命名規則正規表現検証スクリプト雛形作成（TC-05・TC-06）
4. mirror sync 検証スクリプト雛形作成（TC-07・TC-08、F-002 対応）
5. topic-map.md 参照検証スクリプト雛形作成（TC-09）
6. F-003〜F-005 文書記述検証スクリプト雛形作成（TC-10〜TC-12）
7. 既存 logs-archive-\*.md 命名衝突事前チェック手順記述
8. 受け入れ基準・リスク対策整理

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phaseへの引き継ぎ

### Phase 5（実装）で利用

- 本 Phase で定義した TC-01〜TC-12 を、Phase 5 実装完了直後に実行し全 PASS を確認する
- 特に TC-07・TC-08（mirror sync）が FAIL した場合は、Phase 5 内で手動コピー手順にフォールバックする
- F-001・F-003〜F-005 対応は Phase 5 の文書執筆時に反映する（本 Phase は検証定義のみ）

### 検証スクリプト運用上の注意

- 検証はポリシー文書執筆直後に一回通せば十分（CI 化は別タスク）
- mirror sync 失敗時はフォールバック手順を Phase 5 成果物に追記する
- 命名規則正規表現は `logs-archive-YYYY-MM.md` 固定。legacy（feb/march）は本検証の対象外
