# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 1                                         |
| 機能名     | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 |
| タスク名   | workflow close-out parity guard           |
| 前提Phase  | -                                         |
| 後続Phase  | Phase 2                                   |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

## 目的

Phase 12 close-out 時の三者 SSOT（`index.md` / root `artifacts.json` / `outputs/artifacts.json`）が drift することを機械検証で防止する境界・観測対象・受入条件を固定する。

## 背景

親タスク UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001 の Phase 12 再監査で、`outputs/artifacts.json` が `completed` を主張していても root 側が `pending` のまま残った。close-out 判定の SSOT が壊れ、「何が真の完了か」を人が目視で復元する必要が生じた。本タスクは同型事故を validator で阻止する。

## Step 0: P50チェック（前提確認）

```bash
# 既存の close-out 関連スクリプトの棚卸し
ls -1 .claude/skills/task-specification-creator/scripts/ | grep -E "complete-phase|validate|verify|generate-index"

# 既存 workflow 群で parity drift の baseline を観測
for dir in docs/30-workflows/*/; do
  if [ -f "$dir/artifacts.json" ] && [ -f "$dir/outputs/artifacts.json" ]; then
    diff -q "$dir/artifacts.json" "$dir/outputs/artifacts.json" || echo "DRIFT: $dir"
  fi
done

# phase-12-completion-checklist.md の関連行確認
rg -n "artifacts.json|index.md" .claude/skills/task-specification-creator/references/phase-12-completion-checklist.md
```

確認事項:

- [ ] `complete-phase.js` / `generate-index.js` / `validate-phase-output.js` / `verify-all-specs.js` が存在する
- [ ] 既存 workflow 群の drift 件数を baseline として記録する
- [ ] `phase-12-completion-checklist.md` に現状の手動チェック項目が残っていることを確認する

## SubAgentチーム編成

| SubAgent   | 関心ごと          | 主担当                                                                  |
| ---------- | ----------------- | ----------------------------------------------------------------------- |
| SubAgent-A | SSOT 構造棚卸し   | 三者ファイルの内部 schema / status フィールド抽出ルールの特定           |
| SubAgent-B | parity 判定ルール | per-phase × per-source 比較ルールの定義（phase本文 frontmatter も含む） |
| SubAgent-C | 受入条件          | AC-1〜AC-7 を検証可能な粒度で定義                                       |
| SubAgent-D | 統合監査          | 矛盾・漏れ・整合・依存判定                                              |

## 実行タスク

1. **三者 SSOT 構造棚卸し**: `index.md` frontmatter + Phase 表 / `artifacts.json` / `outputs/artifacts.json` / `phase-N-*.md` frontmatter の status 格納位置を確定する
2. **drift 観測の実測**: `docs/30-workflows/` 配下の既存 workflow について root/outputs の `artifacts.json` を比較し、drift 件数を baseline として記録する
3. **受入条件定義**: AC-1〜AC-7 を検証可能な形で定義する（validator 終了コード、drift 報告フォーマット、checklist 連携）
4. **失敗モード列挙**: parity guard が取りこぼすと困るパターンを明示する
5. **非目標の確定**: 本タスクで扱わない範囲（遡及修正、テンプレート刷新）を明文化する

## 参照資料

### 実装・コード

| 資料名                      | パス                                                                                     | 用途                         |
| --------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------- |
| 既存 validator              | `.claude/skills/task-specification-creator/scripts/validate-phase-output.js`             | 現行検証項目の棚卸し         |
| 全仕様検証                  | `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`                  | 統合ゲートの挿入位置特定     |
| Phase 完了処理              | `.claude/skills/task-specification-creator/scripts/complete-phase.js`                    | 三者同値更新の拡張対象       |
| index.md 再生成             | `.claude/skills/task-specification-creator/scripts/generate-index.js`                    | index.md の真実源確認        |
| 発見元 unassigned-task spec | `docs/30-workflows/unassigned-task/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001.md`         | Why/What/How の出発点        |
| 前身 workflow 実例          | `docs/30-workflows/completed-tasks/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001/` | drift が発生した現場ファイル |

### システム仕様（aiworkflow-requirements）

| 資料名                  | パス                                                                                   | 用途               |
| ----------------------- | -------------------------------------------------------------------------------------- | ------------------ |
| task-workflow           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                   | current facts 反映 |
| task-workflow-phases    | `.claude/skills/aiworkflow-requirements/references/task-workflow-phases.md`            | Phase 契約         |
| lessons-learned current | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md` | 教訓反映先         |

### skill 側 reference

| 資料名                           | パス                                                                                    | 用途              |
| -------------------------------- | --------------------------------------------------------------------------------------- | ----------------- |
| phase-12-completion-checklist.md | `.claude/skills/task-specification-creator/references/phase-12-completion-checklist.md` | ゲート組込み対象  |
| patterns-phase12-sync.md         | `.claude/skills/task-specification-creator/references/patterns-phase12-sync.md`         | パターン10 自動化 |
| phase-12-documentation-guide.md  | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`  | 文書化手順        |

## 実行手順

1. P50 チェックを実行し既存スクリプトと現状の parity drift を確認する
2. `index.md` frontmatter + Phase 表・`artifacts.json` phases[N].status・`outputs/artifacts.json` phases[N].status・`phase-N-*.md` frontmatter の status 格納位置を棚卸しする
3. drift の型（完全不一致 / 部分不一致 / 表示のみ不一致）を分類する
4. baseline 観測結果を `outputs/phase-1/drift-inventory.md` に記録する
5. AC-1〜AC-7 を `outputs/phase-1/acceptance-criteria.md` に記述する
6. 要件本文と非目標を `outputs/phase-1/requirements.md` に確定させる

## 要件定義

### 観測対象（三者 + α）

| ID  | ソース                   | 格納位置                    | status 取り出し規則      |
| --- | ------------------------ | --------------------------- | ------------------------ | ---------- | ------------------ |
| S1  | `index.md`               | Phase 表の「ステータス」列  | 行ヘッダ `               | {N}        | ` 行から列読み取り |
| S2  | `artifacts.json` (root)  | `phases.{N}.status`         | JSON パースで直接取得    |
| S3  | `outputs/artifacts.json` | `phases.{N}.status`         | JSON パースで直接取得    |
| S4  | `phase-{N}-*.md` (本文)  | frontmatter `ステータス` 行 | 「メタ情報」テーブルの ` | ステータス | ` 行から抽出       |

### parity ルール

- **同一 Phase N に対し、S1 / S2 / S3 / S4 の status は完全一致しなければならない。**
- 一致定義: 文字列完全一致（例: `completed` / `in_progress` / `pending` / `blocked`）。表記ゆれ（日本語「完了」「進行中」「保留」「停止」）は許容しない。
- 例外: `index.md` の Phase 表で表記が `-` のみの場合は「未使用」扱いとし、他ソースが `pending` なら一致とみなす（運用上の空欄許容）。

### drift 観測 baseline

- baseline は Phase 1 開始時に観測し `drift-inventory.md` に記録する
- 既存 workflow を修正する範囲ではない（本タスクは guard 導入のみ）

### エラー分類コード（validator 戻り値設計）

| コード                 | 説明                                                                        | 終了コード想定 |
| ---------------------- | --------------------------------------------------------------------------- | -------------- |
| `PARITY_DRIFT`         | S1〜S4 のうち少なくとも 2 ソース間で status 不一致                          | 1              |
| `MISSING_SOURCE`       | S1〜S3 のいずれかが欠損（ファイル不在 / JSON 破損）                         | 2              |
| `INVALID_STATUS_VALUE` | status 値が許可列挙外（`pending`/`in_progress`/`completed`/`blocked` 以外） | 3              |
| `PARITY_OK`            | 全ソース一致                                                                | 0              |

## 受け入れ基準

- **AC-1**: `validate-closeout-parity.js --workflow <dir>` が三者 + phase 本文の status を比較し、全一致で `exit 0`・drift で `exit 1` を返すこと
- **AC-2**: drift 時のレポートが「phase 番号 / ソース / 期待値 / 実測値」の 4 項で構造化出力されること（`--json` オプションで JSON 出力可能）
- **AC-3**: `verify-all-specs.js` が parity validator を組込み、drift > 0 で PASS 判定を抑止すること
- **AC-4**: `complete-phase.js` が単一コマンド実行で S1〜S3 を同値更新すること（手動で片側更新を強要しない）
- **AC-5**: `phase-12-completion-checklist.md` に parity validator 実行コマンドが含まれ、PASS 判定の必須条件として記述されること
- **AC-6**: `task-specification-creator` と `aiworkflow-requirements` の両 skill の reference / LOGS / SKILL.md に本 guard の current facts が反映されること（`.agents/` ミラー含む）
- **AC-7**: 既存完了 workflow を遡及修正しない前提が明文化され、`drift-inventory.md` が baseline として保存されること

## 失敗モード（ネガティブ要件）

| 失敗モード                                                        | 受入可否 | 対策                                                              |
| ----------------------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| phase-{N}-\*.md 本文 frontmatter を無視して S1〜S3 のみ比較する   | 不可     | S4 を必ず比較対象に含める（`INVALID_STATUS_VALUE` でfail）        |
| 遡及で既存完了 workflow を一斉修正しようとする                    | 不可     | drift-inventory は観測のみ、修正は別タスク化                      |
| 手動チェックリスト削除のみで validator 未実装のまま運用に出す     | 不可     | AC-1 / AC-3 の validator 実在を必須 gate にする                   |
| validator の exit code が 0 を返すが JSON レポートは drift を報告 | 不可     | exit code と JSON の双方で一致させる契約テストを Phase 4 に含める |

## 統合テスト連携

- SubAgent-A: 三者ファイル fixture（正常 / drift / 欠損 / 不正値）を設計する
- SubAgent-B: parity 判定の per-phase × per-source 比較テストを設計する
- SubAgent-C: AC-1〜AC-7 の検証順序を確定する
- SubAgent-D: `phase-12-completion-checklist.md` 連携テストを設計する

## 多角的チェック観点（AIが判断）

| 観点         | チェック内容                                                                 |
| ------------ | ---------------------------------------------------------------------------- |
| 因果         | drift 発生経路（S1のみ更新 / S2のみ更新 / S3のみ更新）を全て網羅できているか |
| 責務境界     | validator が実体更新しない（read-only）契約が守られているか                  |
| 状態所有権   | `complete-phase.js` が S1〜S3 の書き手として唯一であるか                     |
| 価値とコスト | 既存 workflow 遡及修正を含めずに guard だけで価値が出るか                    |
| 運用性       | Phase 12 compliance で validator 失敗時の復旧手順が明確か                    |

## 非目標（明示的に含まない）

- 既存完了 workflow の drift 遡及修正（別タスク化）
- Phase 定義そのものの変更（13 Phase 構造は維持）
- workflow テンプレート刷新
- `generate-index.js` の index.md 出力フォーマット変更（status 列の読み取り規則固定のみ）

## 成果物

- `outputs/phase-1/requirements.md`: 要件定義書
- `outputs/phase-1/acceptance-criteria.md`: AC-1〜AC-7 受け入れ基準
- `outputs/phase-1/drift-inventory.md`: 既存 workflow の drift baseline 実測

## 完了条件

- [ ] S1〜S4 の status 格納位置とその取り出し規則が確定している
- [ ] 既存 workflow の drift baseline が記録されている
- [ ] AC-1〜AC-7 が検証可能な粒度で定義されている
- [ ] エラー分類コード 4 種類が確定している
- [ ] 非目標が明文化されている
- [ ] Phase 1-3 完了前に Phase 4 へ進まないゲートが設定されている

## タスク100%実行確認【必須】

- [ ] Step 0: P50 チェック完了
- [ ] 三者 SSOT 構造棚卸し完了
- [ ] drift baseline 記録完了
- [ ] AC-1〜AC-7 定義完了
- [ ] エラー分類コード定義完了
- [ ] 非目標明文化完了
- [ ] 成果物ファイル出力完了

## 次Phase

Phase 2（設計）へ進む。**Phase 1-3 完了前に Phase 4 へ進むことを禁止する。**
