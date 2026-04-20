# Phase 5: 実装（ポリシー文書執筆・mirror 同期・topic-map 更新）

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| Phase      | 5                                                                        |
| タスクID   | TASK-LOGS-ARCHIVE-POLICY-001                                             |
| 機能名     | LOGS.md アーカイブポリシー詳細化                                         |
| 前提Phase  | Phase 1, Phase 2, Phase 3, Phase 4                                       |
| 後続Phase  | Phase 6                                                                  |
| 作成日     | 2026-04-19                                                               |
| Issue      | [#2282](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2282) |
| ステータス | completed                                                                |

## 目的

Phase 2 の設計決定 D-1〜D-4 と Phase 3 の指摘事項 F-001〜F-005 を全て反映したポリシー文書
`logs-archive-policy.md` を執筆する。正本（`.claude/`）→ mirror（`.agents/`）への同期、
および `topic-map.md` への参照追加までを含む。Phase 4 で定義した TC-01〜TC-12 の検証が
全て PASS することを Green 条件とする。

## 前提条件確認（実装開始前に必須）

```bash
# Phase 4 で定義した Red 状態の確認（正本ファイルがまだ存在しないこと）
test -f .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md \
  && echo "ALREADY EXISTS - 事前確認が必要" \
  || echo "OK: 未作成状態"

# Phase 4 仕様書の存在確認
test -f docs/30-workflows/logs-archive-policy-001/phase-4-test-creation.md \
  && echo "OK: Phase 4 仕様書あり" \
  || echo "FAIL: Phase 4 未作成"
```

**Phase 4 の検証スクリプトが Red 状態でない場合、Phase 5 の実装を開始してはならない。**

## 実行タスク

- 正本ポリシー文書 `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` の作成
- Phase 2 の D-1〜D-4 全ての反映
- Phase 3 の F-001〜F-005 全ての反映（**F-001 legacy 共存 / F-003 判定タイミング / F-004 更新日 / F-005 エスカレーション**）
- mirror `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` への同期（**F-002 実測**）
- `topic-map.md` への参照行追加
- Phase 4 検証スクリプト（TC-01〜TC-12）の全 PASS 確認（Green）

## 参照資料

| 資料名                       | パス                                                                              | 用途                |
| ---------------------------- | --------------------------------------------------------------------------------- | ------------------- |
| Phase 2 設計書               | `docs/30-workflows/logs-archive-policy-001/phase-2-design.md`                     | D-1〜D-4 反映元     |
| Phase 3 設計レビュー         | `docs/30-workflows/logs-archive-policy-001/phase-3-design-review.md`              | F-001〜F-005 反映元 |
| Phase 4 検証手順             | `docs/30-workflows/logs-archive-policy-001/phase-4-test-creation.md`              | Green 判定基準      |
| 既存 logs-archive-2026-feb   | `.claude/skills/task-specification-creator/references/logs-archive-2026-feb.md`   | legacy 実例参照     |
| 既存 logs-archive-2026-march | `.claude/skills/task-specification-creator/references/logs-archive-2026-march.md` | legacy 実例参照     |
| topic-map.md                 | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                     | 参照追加対象        |

## 実行手順

### 0. baseline 確認（Phase 4 Red 状態の再確認）

```bash
# Phase 4 検証スクリプトを実行し、全て FAIL することを確認
POLICY=".claude/skills/aiworkflow-requirements/references/logs-archive-policy.md"
test -f "$POLICY" || echo "EXPECTED: not found (Red state)"

MIRROR=".agents/skills/aiworkflow-requirements/references/logs-archive-policy.md"
test -f "$MIRROR" || echo "EXPECTED: not found (Red state)"
```

### 1. 正本ポリシー文書の作成

**ファイルパス**: `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`

**必須の文書骨子**（Phase 2 / Phase 3 反映を全て含める）:

```markdown
# LOGS.md アーカイブポリシー

## メタ情報

| 項目           | 内容                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| タスクID       | TASK-LOGS-ARCHIVE-POLICY-001                                             |
| Issue          | [#2282](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2282) |
| 最終更新日     | 2026-04-19                                                               |
| 次回見直し日   | 2026-10-19（6 か月後）                                                   |
| 見直しサイクル | 6 か月毎                                                                 |
| ステータス     | active                                                                   |

> **F-004 対応**: 最終更新日と次回見直し日を必ずセットで記載する。

## 1. 適用範囲

- 対象:
  - `.claude/skills/*/LOGS.md`
  - `.agents/skills/*/LOGS.md`
- 除外:
  - `docs/**/LOGS.md`（本ポリシーの対象外。別途 task-workflow で管理）
  - 個人作業ログ（`.worktrees/**/LOGS.md` は worktree 廃棄時に削除）

## 2. アーカイブ閾値

以下のいずれか 1 つ以上を満たした時点でアーカイブ対象とする（OR 条件・ハイブリッド方式）。

| 閾値種別     | 値       | 判定タイミング    |
| ------------ | -------- | ----------------- |
| 行数         | 300 行超 | 毎月初 1 日に評価 |
| バイトサイズ | 30 KB 超 | 毎月初 1 日に評価 |
| 期間         | 月次     | 毎月初 1 日に評価 |

### 2.1 判定タイミングの固定（F-003 対応）

- **判定日**: 毎月 1 日（UTC）に前月分を評価
- **実行日**: 判定日と同日、またはその後 3 営業日以内にアーカイブを実行
- **月末判定は採用しない**（月末の作業タイミングが属人化するため）

## 3. archive 先パス規則

### 3.1 パス構造

- `.claude/skills/<skill-name>/LOGS.md`（現役）
- `.claude/skills/<skill-name>/logs-archive-<YYYY-MM>.md`（月次アーカイブ）
- `.agents/skills/<skill-name>/LOGS.md`（mirror 現役）
- `.agents/skills/<skill-name>/logs-archive-<YYYY-MM>.md`（mirror 月次）

### 3.2 ファイル命名規則

- 正規表現: `^logs-archive-\d{4}-(0[1-9]|1[0-2])\.md$`
- 例: `logs-archive-2026-04.md`、`logs-archive-2026-12.md`

### 3.3 legacy 表記との共存（F-001 対応）

- 既存の月名英語スペル形式（`logs-archive-2026-feb.md` / `logs-archive-2026-march.md`）は
  **legacy として残置**する。リネームは行わない。
- 2026-04 以降の新規アーカイブは **必ず YYYY-MM 数値形式** で作成する。
- legacy ファイルと新形式ファイルは同一ディレクトリで共存可能。検索・参照は
  `logs-archive-*.md` のワイルドカードで両方を捕捉する運用とする。

## 4. アーカイブ手順

1. **閾値超過の検知**: 毎月 1 日に `wc -l` / `wc -c` で閾値を評価
2. **当月末までのログ抽出**: 前月分のログエントリを LOGS.md から抽出
3. **`logs-archive-YYYY-MM.md` へ追記**: 同一ディレクトリに新規作成、既存があれば末尾追記
4. **LOGS.md から当該月分ログを削除**: 現役 LOGS.md から移動済みエントリを削除
5. **mirror sync 実行**: `.agents/skills/` 側に反映（sync 機構または手動コピー）
6. **動作確認**: `.claude/` と `.agents/` の両側で存在確認・diff 確認

## 5. 運用ルール

### 5.1 見直しサイクル

- 6 か月毎に本ポリシーを見直す
- 最終更新日・次回見直し日は冒頭メタ情報に必ず記載

### 5.2 変更時の手続き

- 本ポリシーを変更する際は CHANGELOG セクションまたはコミットメッセージに理由を記述
- 閾値変更時は変更理由・計測根拠を明記

### 5.3 エスカレーションフロー（F-005 対応）

ポリシー違反（例: アーカイブ未実施、命名規則違反、mirror 同期漏れ）が検知された場合は
以下のフローで対応する。

| 違反種別             | 一次対応                       | エスカレーション先             |
| -------------------- | ------------------------------ | ------------------------------ |
| アーカイブ未実施     | 該当 skill 担当が当月内に実施  | aiworkflow-requirements 管理者 |
| 命名規則違反         | 新規ファイルをリネームして是正 | task-specification-creator     |
| mirror 同期漏れ      | 手動コピーで即時是正           | TASK-CONFLICT-PREVENT-001 担当 |
| ポリシー文書の陳腐化 | 見直し Issue を起票            | プロジェクトオーナー           |

- 一次対応で解消できない場合は GitHub Issue を起票し、該当エスカレーション先をアサインする
- 違反が 3 回以上連続した場合は本ポリシー自体の見直しを検討する

## 6. 参照

- 既存アーカイブ実例: `.claude/skills/task-specification-creator/references/logs-archive-2026-feb.md`
- 既存アーカイブ実例: `.claude/skills/task-specification-creator/references/logs-archive-2026-march.md`
- mirror sync 機構: TASK-CONFLICT-PREVENT-001 成果物
- 前提 Issue: [#2282](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2282)

## 7. CHANGELOG

| 日付       | 変更内容                                 | 変更者   |
| ---------- | ---------------------------------------- | -------- |
| 2026-04-19 | 初版作成（TASK-LOGS-ARCHIVE-POLICY-001） | (担当者) |
```

### 2. Phase 3 指摘事項（F-001〜F-005）の反映確認

| 指摘 ID | 対応箇所                                     | 確認ポイント                                                     |
| ------- | -------------------------------------------- | ---------------------------------------------------------------- |
| F-001   | `## 3.3 legacy 表記との共存`                 | feb/march legacy と YYYY-MM 新形式の共存方針が明記されている     |
| F-002   | `## 4.` 手順 5 + Phase 4 TC-07・TC-08        | mirror sync 実行手順と実測検証手段が記述されている               |
| F-003   | `## 2.1 判定タイミングの固定`                | 毎月 1 日（月初）判定で固定、月末判定は採用しないと明記          |
| F-004   | メタ情報テーブル（最終更新日・次回見直し日） | 2026-04-19 / 2026-10-19 がセットで記載されている                 |
| F-005   | `## 5.3 エスカレーションフロー`              | 違反種別 × 一次対応 × エスカレーション先が表形式で明記されている |

### 3. mirror sync 実行（F-002 実測）

```bash
CLAUDE_POLICY=".claude/skills/aiworkflow-requirements/references/logs-archive-policy.md"
AGENTS_DIR=".agents/skills/aiworkflow-requirements/references"
AGENTS_POLICY="$AGENTS_DIR/logs-archive-policy.md"

# Step 1: mirror sync 機構が対象とするか確認（TASK-CONFLICT-PREVENT-001 の sync 設定を参照）
# sync 対象に references/ が含まれる場合は自動で反映される
# 含まれない場合は下記の手動コピー手順にフォールバック

# Step 2: mirror ディレクトリが存在することを確認
mkdir -p "$AGENTS_DIR"

# Step 3: sync 機構実行 or 手動コピー
#   - sync 機構が利用可能な場合: TASK-CONFLICT-PREVENT-001 のスクリプトを実行
#   - フォールバック（手動コピー）:
cp "$CLAUDE_POLICY" "$AGENTS_POLICY"

# Step 4: 同期確認
diff -q "$CLAUDE_POLICY" "$AGENTS_POLICY" \
  && echo "OK: mirror synced" || echo "FAIL: mirror diff"
```

**F-002 のフォールバック運用ルール**:

- sync 機構で自動反映できた場合は、その事実を本ポリシー文書の CHANGELOG に記録する
- 手動コピーにフォールバックした場合は、TASK-CONFLICT-PREVENT-001 担当にエスカレーション（F-005）

### 4. topic-map.md への参照追加（D-4 対応）

`.claude/skills/aiworkflow-requirements/indexes/topic-map.md` に以下の 1 行を追加する。

```markdown
- [logs-archive-policy.md](../references/logs-archive-policy.md) — LOGS.md アーカイブ閾値・パス規則・手順の正本ポリシー
```

追加位置は既存の `patterns-*.md` や `phase-*-guide.md` 参照ブロックに準拠し、
アルファベット順またはトピック分類順で挿入する。

### 5. Phase 4 検証スクリプト実行（Green 確認）

Phase 4 で定義した TC-01〜TC-12 を順次実行する。

```bash
POLICY=".claude/skills/aiworkflow-requirements/references/logs-archive-policy.md"
MIRROR=".agents/skills/aiworkflow-requirements/references/logs-archive-policy.md"
TOPIC_MAP=".claude/skills/aiworkflow-requirements/indexes/topic-map.md"

# TC-01〜TC-04: 必須セクション・閾値・命名・手順
for section in "## 1. 適用範囲" "## 2. アーカイブ閾値" "## 3. archive 先パス規則" "## 4. アーカイブ手順" "## 5. 運用ルール" "## 6. 参照"; do
  grep -qF "$section" "$POLICY" && echo "PASS: $section" || echo "FAIL: $section"
done

# TC-05: 命名正規表現
grep -qE '\^logs-archive' "$POLICY" && echo "PASS: regex" || echo "FAIL: regex"

# TC-06: F-001 legacy 共存
grep -qE "(legacy|レガシー)" "$POLICY" && echo "PASS: F-001" || echo "FAIL: F-001"

# TC-07・TC-08: mirror sync
test -f "$MIRROR" && echo "PASS: TC-07" || echo "FAIL: TC-07"
diff -q "$POLICY" "$MIRROR" && echo "PASS: TC-08" || echo "FAIL: TC-08"

# TC-09: topic-map.md
grep -qF "logs-archive-policy" "$TOPIC_MAP" && echo "PASS: TC-09" || echo "FAIL: TC-09"

# TC-10: F-003 判定タイミング
grep -qE "(月初|月末|毎月.*1.*日)" "$POLICY" && echo "PASS: TC-10" || echo "FAIL: TC-10"

# TC-11: F-004 更新日
grep -qE "最終更新日.*2026-04-19" "$POLICY" && echo "PASS: TC-11a" || echo "FAIL: TC-11a"
grep -qE "次回見直し日.*2026-10-19" "$POLICY" && echo "PASS: TC-11b" || echo "FAIL: TC-11b"

# TC-12: F-005 エスカレーション
grep -qE "エスカレーション" "$POLICY" && echo "PASS: TC-12" || echo "FAIL: TC-12"
```

**全て PASS した時点で Green 状態**。1 件でも FAIL があれば該当セクションを修正し再実行する。

### 6. 最終整合性チェック

```bash
# 既存 logs-archive-*.md との命名衝突がないこと
ls .claude/skills/task-specification-creator/references/logs-archive-*.md

# mirror 対称性
diff -r .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md \
        .agents/skills/aiworkflow-requirements/references/logs-archive-policy.md

# 不変条件 4 項目の最終確認
#   1. 命名規則の不変性（正規表現記載）
#   2. 閾値の一貫性（300 行 / 30 KB / 月次）
#   3. mirror 対称性（diff=0）
#   4. references 配置 + topic-map 参照
```

## 受け入れ基準（AC）

| ID   | 受け入れ基準                                                                                                         | 検証方法                       |
| ---- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| AC-1 | 正本 `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` が作成されている                     | `ls` による存在確認            |
| AC-2 | Phase 2 の D-1〜D-4（閾値・パス規則・配置・topic-map 追加）が全て文書に反映されている                                | セクション別 grep 確認         |
| AC-3 | Phase 3 の F-001（legacy 共存）が文書内 `## 3.3` で明記されている                                                    | `grep legacy` で確認           |
| AC-4 | Phase 3 の F-003（月初判定固定）が文書内 `## 2.1` で明記されている                                                   | `grep 月初` で確認             |
| AC-5 | Phase 3 の F-004（最終更新日 2026-04-19 / 次回見直し日 2026-10-19）が冒頭メタに記載されている                        | メタ情報テーブル確認           |
| AC-6 | Phase 3 の F-005（エスカレーションフロー）が文書内 `## 5.3` で明記されている                                         | `grep エスカレーション` で確認 |
| AC-7 | mirror `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` が同一内容で存在（**F-002 実測**） | `diff` で差分ゼロ確認          |
| AC-8 | `topic-map.md` に `logs-archive-policy` への参照行が追加されている                                                   | `grep` で追加確認              |
| AC-9 | Phase 4 の TC-01〜TC-12 が全て PASS する                                                                             | 検証スクリプト実行結果         |

## スコープ

### 含むもの

- 正本ポリシー文書の新規作成
- mirror 文書の同期作成（F-002 実測付き）
- topic-map.md 参照追加
- Phase 3 指摘事項 F-001・F-003・F-004・F-005 の文書反映
- Phase 4 検証スクリプトの全 PASS 達成（Green）

### 含まないもの

- 過去 LOGS.md への遡及アーカイブ適用（別タスク）
- アーカイブ自動化スクリプトの実装（別タスク）
- CI への検証スクリプト統合（別タスク）
- 既存 `logs-archive-2026-feb.md` 等 legacy ファイルのリネーム（明示的に行わない）
- mirror sync 機構そのものの改修（TASK-CONFLICT-PREVENT-001 範囲）

## リスクと対策

| リスク                                               | 影響 | 発生確率 | 対策                                                                         |
| ---------------------------------------------------- | ---- | -------- | ---------------------------------------------------------------------------- |
| mirror sync 機構が `references/` を対象外で同期失敗  | 中   | 中       | 手動コピーにフォールバック、TASK-CONFLICT-PREVENT-001 担当にエスカレーション |
| 既存 legacy ファイルとの共存方針が読み手に誤解される | 低   | 低       | `## 3.3` 節で「リネームしない」「共存可能」を明示                            |
| 閾値値が実運用と乖離                                 | 中   | 中       | 6 か月後の見直し条項を `## 5.1` に明記（F-004 で担保）                       |
| topic-map.md の既存構造と整合しない位置に追加        | 低   | 低       | 既存 `patterns-*.md` / `phase-*-guide.md` ブロックに準拠して挿入             |
| Phase 4 検証で FAIL が発生し Green に至らない        | 中   | 中       | FAIL TC を特定、該当セクションを修正、再実行                                 |
| ポリシー違反時のエスカレーション先不在で運用が停滞   | 低   | 低       | `## 5.3` に違反種別別にエスカレーション先を明記（F-005）                     |

## 多角的チェック観点

| 観点               | チェック内容                                                       |
| ------------------ | ------------------------------------------------------------------ |
| 前提条件確認       | Phase 4 Red 状態を実装前に確認したか                               |
| 設計反映完全性     | D-1〜D-4 の全決定事項が文書に反映されているか                      |
| Phase 3 指摘網羅   | F-001〜F-005 の全指摘が適切なセクションに反映されているか          |
| 正本/mirror 対称性 | `.claude/` と `.agents/` の両側で同一内容か（diff 差分ゼロ）       |
| 既存資産整合       | legacy ファイル（feb/march）とリネーム・削除なしに共存できているか |
| 参照整合           | topic-map.md への追加形式が既存エントリと整合しているか            |
| Green 達成         | Phase 4 の TC-01〜TC-12 が全 PASS しているか                       |
| 運用可能性         | エスカレーションフローが実行可能なレベルで具体的か                 |

## 統合テスト連携【必須】

| 判定項目       | 基準                       | 結果 |
| -------------- | -------------------------- | ---- |
| TC-01〜TC-12   | 全件 PASS                  | PASS |
| mirror sync    | 正本 / mirror 差分ゼロ     | PASS |
| topic-map 参照 | 追加済みかつ grep 検出可能 | PASS |

## 成果物

| 成果物              | パス                                                                       | 説明                                      |
| ------------------- | -------------------------------------------------------------------------- | ----------------------------------------- |
| 正本ポリシー文書    | `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` | D-1〜D-4 / F-001〜F-005 を反映した正本    |
| mirror ポリシー文書 | `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` | 正本と同一内容の mirror（F-002 実測済み） |
| topic-map.md 更新   | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`              | `logs-archive-policy` への参照行追加      |

## 完了条件

- [ ] 正本ポリシー文書 `logs-archive-policy.md` が作成済み
- [ ] 必須 6 セクション（適用範囲 / 閾値 / パス規則 / 手順 / 運用ルール / 参照）が全て存在
- [ ] D-1（ハイブリッド閾値 300 行 / 30 KB / 月次）が反映済み
- [ ] D-2（`logs-archive-YYYY-MM.md` 命名規則）が反映済み
- [ ] D-3（references/ 配下配置）が反映済み
- [ ] D-4（topic-map.md 参照追加）が反映済み
- [ ] F-001（legacy 共存方針）が `## 3.3` で明記されている
- [ ] F-002（mirror sync 実測）が完了、`.agents/` 側に同一内容が存在
- [ ] F-003（月初判定固定）が `## 2.1` で明記されている
- [ ] F-004（最終更新日 2026-04-19 / 次回見直し日 2026-10-19）がメタ情報に記載
- [ ] F-005（エスカレーションフロー）が `## 5.3` で明記されている
- [ ] Phase 4 TC-01〜TC-12 が全て PASS（Green 確認済み）
- [ ] 既存 legacy ファイル（feb/march）がリネーム・削除されていないこと
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 4 Red 状態の事前確認
2. 正本ポリシー文書の骨子作成（必須 6 セクション）
3. D-1〜D-4 の反映確認
4. F-001 legacy 共存方針の追記
5. F-003 判定タイミング（月初固定）の追記
6. F-004 最終更新日・次回見直し日のメタ情報記載
7. F-005 エスカレーションフローの追記
8. mirror ディレクトリ作成 + sync 実行（F-002 実測）
9. topic-map.md への参照行追加
10. Phase 4 TC-01〜TC-12 の実行・Green 確認
11. 最終整合性チェック（diff / ls / 不変条件）
12. CHANGELOG エントリ追記

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phaseへの引き継ぎ

### Phase 6（テスト拡充）で利用

- 本 Phase で作成した正本・mirror ポリシー文書を起点に、他 skill（task-specification-creator 等）の LOGS.md への適用確認を展開する
- Phase 4 検証スクリプトを CI ワークフローに組み込むか検討（別タスク化も可）
- 6 か月後（2026-10-19）の見直しタイミングで本ポリシー文書の CHANGELOG を更新する

### 運用上の注意

- legacy ファイル（feb/march）はリネームせず残置。新規アーカイブは必ず YYYY-MM 数値形式で作成
- mirror sync 失敗時は手動コピーにフォールバックし、TASK-CONFLICT-PREVENT-001 担当にエスカレーション
- ポリシー違反検知時は `## 5.3` のエスカレーションフローに従う
- 閾値の変更が必要な場合は CHANGELOG に計測根拠とともに記録する
