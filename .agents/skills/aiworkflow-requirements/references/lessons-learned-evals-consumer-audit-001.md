# Lessons Learned — TASK-EVALS-CONSUMER-AUDIT-001

> 親仕様書: [task-workflow.md](task-workflow.md)
> 役割: 苦戦箇所知見集
> 区分: 正本（current contract）
> 対応タスク: TASK-EVALS-CONSUMER-AUDIT-001（EVALS consumer 監査 / NON_VISUAL / 監査タスク / docs-only）
> 作成日: 2026-04-19（Phase 12 close-out 由来）

---

## 概要

本ファイルは `TASK-EVALS-CONSUMER-AUDIT-001`（EVALS.json 構造体 consumer 監査）の Phase 4〜12 実行中に発生した苦戦箇所と判断根拠を記録する。NON_VISUAL 監査タスク（docs-only）の再発防止テンプレートとしても機能する。

---

## L-EVALS-001: 「正本 coverage 穴」発見過程

### 背景

Phase 9（正本突合）で `aiworkflow-requirements/references/` と監査成果物（Phase 5 / 6 / 8 の canonical 4 成果物）を突合した結果、**misaligned=0 件 / needs-review=3 件 / 許容=4 件** の `partial` 判定となった。3 件の needs-review はいずれも「正本が実態を網羅していない（記載漏れ）」タイプで、camelCase v2 / snake_case v1 の 2 方言併存・`qualityInsights.*` 11 フィールド・validator=0 件の事実が正本未記載であった。

### 苦戦ポイント

1. `references/*.md` 全体を `rg 'EVALS|currentLevel|current_level|qualityInsights|skillName'` で横断検索したが、EVALS スキーマの**構造体フィールド名**の直接記載は 0 件だった
2. `task-specification-creator/references/self-improvement-cycle.md` に構造例が存在するが、`aiworkflow-requirements/references/` から cross-reference がなく「補助」として自力発見する必要があった
3. `arch-electron-services-details-part1.md` の `OTHER_FILES` 定数表は 2 列表記（path / 役割）のみで、9 列表の consumer 実態と乖離していた

### 再発防止策

- 監査タスク冒頭で「正本検索レイヤー」（references/ / indexes/ / 補助スキル）を明示的に三重走査する
- `references/evals-schema-spec.md` を新設して EVALS スキーマを一次参照化（本タスクの成果物）
- `indexes/resource-map.md` に「EVALS schema変更前 consumer全特定（TASK-EVALS-CONSUMER-AUDIT-001）」行を追加し、逆引き経路を確保
- `indexes/keywords.json` に EVALS / currentLevel / qualityInsights 等のキーワードを手動追加し、rg フォールバックなしで発見可能にする

---

## L-EVALS-002: canonical 4 vs 必須 6 成果物の区別

### 背景

Phase 12 `phase-template-phase12.md` §「出力テンプレ」は**必須 6 成果物**（`phase12-task-spec-compliance-check.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `completed-tasks-record.md`）のみを記載しており、各 workflow 固有の canonical 成果物（Phase 5 / 6 / 8 で生成する `consumer-audit-report.md` / `evals-field-map.md` / `dual-root-parity.md` / `schema-change-guide.md` の 4 件）との関係が明示されていなかった。

### 苦戦ポイント

- Phase 12 の成果物生成時に「canonical 4 を Phase 12 の outputs/phase-12/ にコピーするのか否か」の判断が曖昧だった
- 初期設計では「Phase 12 でコピー増殖」寄りの解釈をしていたが、Phase 3 設計書 §1 冒頭で「canonical は Phase 5 / 6 / 8 のパス参照に統一し、Phase 12 ではコピーしない」方針を明示することで誤解を回避した（P12-R2 として Phase 3 設計書に記録済）

### 再発防止策

- Phase 12 spec 冒頭に「canonical N 成果物（各 workflow 固有）」と「必須 6 成果物（Phase 12 固定）」の区別を明記する（PROPOSAL-TSC-03）
- Phase 12 必須 6 成果物内から canonical 4 へはパス参照で統一、bit-for-bit 複製は禁止
- close-out 時のディレクトリ構造例:
  - `docs/30-workflows/<workflow>/outputs/phase-5/consumer-audit-report.md` ← canonical 1
  - `docs/30-workflows/<workflow>/outputs/phase-12/system-spec-update-summary.md` ← 必須 6 成果物（内部でリンク）

---

## L-EVALS-003: NON_VISUAL 監査タスク Phase-11 再解釈（screenshot 不要）

### 背景

`phase-template-phase11.md` は UI 変更時の screenshot 中心に記述されており、NON_VISUAL / 監査タスク（本タスクのように UI 変更ゼロ / 検索・整理・差分抽出のみ）に対する primary evidence 仕様が曖昧だった。

### 苦戦ポイント

- 本タスクの Phase 11 は「再現コマンド実行 → 0 差分確認」が実態で、screenshot が 0 件
- `phase-12-documentation-guide.md` の散在したメモに「UI/UX 変更なしのため Phase 11 スクリーンショット不要」の記述はあったが、それを primary evidence として固定するガイドが不足
- 本タスクでは `outputs/phase-11/manual-test-result.md` と `reproduction-verification.md` の 2 ファイルを primary evidence として固定し、screenshot-coverage.md は「N/A」で明示的に残した

### 再発防止策

- Phase 11 spec の冒頭に taskType 判定を置き、NON_VISUAL の場合は `manual-test-result.md` を primary evidence として固定する固定文言を採用する（PROPOSAL-TSC-02）
- `phase-12-documentation-guide.md` の Task 12-1 直下に「NON_VISUAL 固定文言」を集約
- screenshot-coverage.md は削除せず「N/A + 判断根拠（taskType=NON_VISUAL）」を残して監査証跡化

---

## L-EVALS-004: dual root bit-for-bit 一致の検証コマンド

### 背景

Phase 6（dual root diff）で `.claude/skills/` と `.agents/skills/` の bit-for-bit parity を検証する必要があった。既存の lessons-learned（L-WC-001 系 5 ファイル）は「ours merge 戦略 + post-merge 再生成」の方針を記載するが、検証コマンド自体は `references/` 配下に散在していなかった。

### 苦戦ポイント

- `diff -qr .claude/skills .agents/skills` が `-q` モードで差分ゼロ時に出力なし → 結果解釈が曖昧（「本当にゼロか」「エラーか」の区別がつきにくい）
- 参照先の L-WC-001 系は merge 戦略中心で「検証コマンドそのもの」の記述が希薄

### 採用した検証コマンド（本タスク Phase 6）

```bash
# 1. bit-for-bit 一致確認（差分ゼロなら exit 0 + 出力なし）
diff -qr .claude/skills .agents/skills

# 2. 差分を可視化（+ fingerprint を付与して監査証跡化）
diff -qr .claude/skills .agents/skills | tee outputs/phase-6/dual-root-diff-raw.txt
echo "exit_code: $?" >> outputs/phase-6/dual-root-diff-raw.txt

# 3. EVALS.json だけを個別に比較（drift を早期発見）
for skill in $(ls .claude/skills); do
  diff -q .claude/skills/$skill/EVALS.json .agents/skills/$skill/EVALS.json 2>&1
done
```

### 再発防止策

- `dual-root-parity.md` canonical 成果物に上記 3 コマンドを primary verification として明記（本タスクで実施済）
- `evals-schema-spec.md` §5.2 の「3 カテゴリ手動検証」に dual root 一致検証を組み込み
- 未来の monorepo skills 増加時も同じコマンドで網羅できるよう、個別ファイル列挙でなく `ls .claude/skills` でループ

---

## L-EVALS-005: docs-only タスクの `spec_created` ステータス採用根拠

### 背景

本タスクは docs-only（コード実装ゼロ / 監査成果物のみ）で、Phase 12 close-out 時のステータス判定に `completed` を使うべきか `spec_created` を使うべきかで判断が必要だった。

### 苦戦ポイント

- `phase-template-phase12.md` §「docs-only モードフラグ」規定に `spec_created` の記述はあるが、適用条件（「正本更新ゼロ（正本補強を未タスク化）」）の事例が明示されていない
- 本タスクのように「監査成果物は出すが、正本そのものは更新しない」パターンが該当するかの判断軸が曖昧

### 本タスクの判断

- `spec_created=true` を採用（`completed` の代替）
- 根拠:
  1. コード実装なし・テスト追加なし（docs-only）
  2. 正本 `references/*.md` の更新は 0 件（本 Phase では更新しない / 3 件の提案は別タスクへ委譲）
  3. canonical 4 成果物 + 必須 6 成果物は全件生成済み
  4. AC-6（TASK-CONFLICT-PREVENT-001）解除条件（PASS 4/4）を Phase 10 で満たしている
- 記録: `system-spec-update-summary.md` §2 の「完了タスク記録」テーブルに `spec_created` / `spec_purpose=監査成果物の canonical 化` を明記

### 再発防止策

- `phase-template-phase12.md` §「docs-only モードフラグ」直下に「NON_VISUAL 監査タスク / 正本更新ゼロ」パターンの事例を追加（PROPOSAL-TSC-01 内で吸収可能）
- メタ情報テーブルに `taskType` / `implementation_mode` / `completion_status` / `spec_purpose` を必須 4 フィールドとして固定
- `github-issue-manager` 側でも CLOSED Issue から spec_created を生成するモードを明文化（PROPOSAL-GIM-01）

---

## 関連ドキュメント

- Phase 5 `consumer-audit-report.md`: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md`
- Phase 5 `evals-field-map.md`: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-5/evals-field-map.md`
- Phase 6 `dual-root-parity.md`: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-6/dual-root-parity.md`
- Phase 8 `schema-change-guide.md`: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md`
- Phase 9 `spec-alignment-report.md`: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-9/spec-alignment-report.md`
- Phase 10 `ac6-release-verdict.md`: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-10/ac6-release-verdict.md`
- Phase 11 `manual-test-result.md` / `reproduction-verification.md`: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/`
- Phase 12 `system-spec-update-summary.md` / `skill-feedback-report.md` / `unassigned-task-detection.md`: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/`
- 新設: `references/evals-schema-spec.md`
- 関連 lessons: `references/lessons-learned-current-2026-04.md`（L-WC-001 系 dual root 戦略）

---

## 変更履歴

| Date       | 変更内容                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| 2026-04-19 | 初版作成。L-EVALS-001〜005（正本 coverage 穴 / canonical vs 必須 6 / Phase 11 再解釈 / dual root 検証 / spec_created 採用根拠）を記録 |
