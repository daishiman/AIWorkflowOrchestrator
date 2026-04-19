# NON_VISUAL / 監査タスク用 Phase Template

> 親骨格: [phase-template-core.md](phase-template-core.md)
> Phase 12 詳細: [phase-template-phase12.md](phase-template-phase12.md) / [phase-12-documentation-guide.md](phase-12-documentation-guide.md)
> 由来: TASK-EVALS-CONSUMER-AUDIT-001（docs-only / NON_VISUAL / 監査）Phase 12 skill-feedback-report §3 PROPOSAL-TSC-01

---

## 適用対象

以下の **いずれか** に該当するタスクに適用する（複数該当可）。

| 条件 | 判定例 |
| --- | --- |
| `taskType: NON_VISUAL` | UI/UX変更なし。Renderer コンポーネント変更なし |
| `implementation_mode: verify_existing` | 既実装コードのカバレッジ確認・差分確認のみ |
| docs-only | `.claude/` / `.agents/` / `docs/` のみ変更、コード変更なし |
| 監査タスク（audit） | consumer 監査・仕様整合性監査・正本突合など。`Phase 4-6` の本質が「検索・整理・差分抽出」 |
| `spec_created` を `completed` の代替として採用 | AC 解除運用・CLOSED Issue 由来の後付け仕様書 |

- 上記に該当しないタスクは **本テンプレの適用対象外**。実装タスクの骨格（[phase-template-core.md](phase-template-core.md) + [phase-template-phase8-10.md](phase-template-phase8-10.md)）をそのまま使用する。
- UI task と監査 task の両要素を持つ場合は、`taskType` を `VISUAL` として実装タスク骨格を優先し、本テンプレは「参考」として読む。

---

## 背景: なぜ監査タスク用テンプレが必要か

- `phase-template-core.md` / `phase-template-phase8-10.md` は **実装タスク前提**（`RED/GREEN` / `カバレッジ` / `line budget` / `mirror parity` / `fail path`）で設計されている。
- 監査タスクでは Phase 4〜8 の責務が「検索・整理・差分抽出・ガイド生成」に置き換わり、実装タスク骨格を機械適用すると責務が空転する。
- TASK-EVALS-CONSUMER-AUDIT-001 Phase 3 設計書 §1 冒頭で「テンプレートの機械適用ではなく、監査タスク特性に合わせて再解釈」と明示しなければ、Phase 4-6 の成果物契約が不整合となるリスクがあった。
- 本テンプレは Phase 1〜13 の責務を **実装タスク → 監査タスク** のマッピング表で再定義し、再解釈コストを 0 化することを目的とする。

---

## Phase 再解釈マップ（実装タスク vs 監査タスク）

| Phase | 実装タスクでの責務 | 監査タスクでの再解釈 | primary 成果物（監査） |
| ----- | ------------------ | --------------------- | ---------------------- |
| Phase 1 | 要件定義・AC 固定 | 監査スコープ定義・inventory 抽出・正本候補列挙 | `phase-1-requirements.md` |
| Phase 2 | 設計（target topology） | 監査 lane / 対象 root の設計（dual root `.claude` + `.agents` の扱い） | `phase-2-design.md` |
| Phase 3 | 設計レビュー（MINOR/MAJOR） | 監査再解釈方針の固定（Phase 4-6 の責務変更を宣言） | `phase-3-phase-design.md` |
| **Phase 4** | **テスト設計（RED）** | **raw evidence 収集**（rg/grep/ast 検索ログの一次記録） | `outputs/phase-4/raw-evidence.md` |
| **Phase 5** | **実装（GREEN）** | **consumer 整理 + field map 生成**（正本/実装コードの整合リスト化） | `outputs/phase-5/consumer-audit-report.md`、`evals-field-map.md` |
| **Phase 6** | **テスト拡張（カバレッジ）** | **dual root 差分抽出**（`.claude` vs `.agents` の parity 可視化） | `outputs/phase-6/dual-root-parity.md` |
| **Phase 7** | **カバレッジ検証** | **漏れ再検索**（Phase 4 で取り逃した領域の second sweep） | `outputs/phase-7/coverage-gap-report.md` |
| **Phase 8** | **リファクタ** | **schema 変更手順ガイド生成**（正本を更新するための手順書） | `outputs/phase-8/schema-change-guide.md` |
| **Phase 9** | **品質保証（validator/lint/test）** | **正本突合**（aiworkflow-requirements references/ と監査成果物の coverage 検証） | `outputs/phase-9/spec-alignment-report.md` |
| Phase 10 | 最終レビュー（PASS/MINOR/MAJOR） | 同左。監査結果の最終判定 | `outputs/phase-10/final-review-result.md` |
| **Phase 11** | **手動テスト（screenshot 含む）** | **再現コマンド手動実行**（UI 変更なしのため screenshot 不要） | `outputs/phase-11/manual-test-result.md` + `reproduction-verification.md` |
| Phase 12 | close-out documentation（必須 6 成果物） | 同左 + canonical N 成果物参照 | `outputs/phase-12/*.md` |
| Phase 13 | PR 作成・user approval | 同左（docs-only の場合は `spec_created` を `completed` の代替として扱う） | PR description |

### 4-6 本質の再解釈ガイド（具体例）

- **Phase 4（raw evidence 収集）**:
  - 実装タスクの「TDD RED（失敗テスト）」は存在しない。代わりに `rg -n "EVALS" -g '*.ts'` 等の検索コマンドとその raw ヒット一覧を `outputs/phase-4/raw-evidence.md` に記録する。
  - 検索コマンドは「再現可能性」の観点で必ず git 管理のコマンドライン履歴として残す。
- **Phase 5（consumer 整理 + field map）**:
  - 実装タスクの「GREEN 実装」は存在しない。代わりに Phase 4 の raw evidence を `consumer-audit-report.md`（9 列表：path / root / consumer_type / operation / read_fields / write_fields / dynamic_path / notes / source_evidence）に整理する。
  - field map は `evals-field-map.md` 等のフィールド名⇄ consumer マッピングを作る。
- **Phase 6（dual root 差分抽出）**:
  - 実装タスクの「カバレッジテスト」は存在しない。代わりに `.claude/skills/` と `.agents/skills/` の同一ファイルを `diff -qr` し、parity 差分を `dual-root-parity.md` に可視化する。
  - 差分があれば「監査対象として記録」「未タスク化候補に昇格」のどちらかに分岐する。

---

## primary evidence: `manual-test-result.md` / `reproduction-verification.md` の棲み分け

| ファイル名 | 用途 | 必須度（監査タスク） |
| ---------- | ---- | -------------------- |
| `manual-test-result.md` | 監査タスクの **一次証跡集約**（テスト件数サマリ / edge case / 仕様判断根拠 / 実行記録） | **必須**（docs-only Phase 11 の正本） |
| `reproduction-verification.md` | 監査で発見した事実を **再現コマンド実行で再確認** した結果記録 | **推奨**（監査タスクの信頼性向上） |
| `{TASK-ID}-manual-test-report.md` | `NON_VISUAL + verify_existing` 組み合わせ時の canonical 名 | **必須**（[CANCEL-003-FB-2] 由来） |

- `manual-test-result.md` を 1 ファイル集約の正本とし、必要に応じて `reproduction-verification.md` を補助成果物として保持する。
- `NON_VISUAL + verify_existing` では `outputs/phase-11/{TASK-ID}-manual-test-report.md` を primary に昇格させる（[phase-template-phase12.md](phase-template-phase12.md) 末尾参照）。
- 検証コマンドは冪等性が担保されるよう記録する（引数・環境変数・実行ディレクトリ）。

---

## 完了ステータス判断: `spec_created` vs `completed`

| 条件 | 推奨ステータス | 根拠 |
| ---- | -------------- | ---- |
| docs-only で正本更新ゼロ（正本補強を未タスク化で引き継ぎ） | `spec_created` | 実装タスクとして完了していない |
| docs-only で正本更新あり（same-wave で完了） | `completed` | 本タスク内で正本と実態が一致 |
| 監査タスクで AC-N 解除運用を目的とし、Issue は CLOSED 維持 | `spec_created`（推奨） | 仕様書としての存続意義を明示 |
| 監査タスクで後続実装タスクが別で存在する | `spec_created` | code wave を別タスクで実施 |

- `completed-tasks/<workflow>/` 配下にあることを理由に `completed` へ自動的に上げない（[phase-12-documentation-guide.md](phase-12-documentation-guide.md) Task 12-6 の identifier-consistency-check と整合）。
- `spec_created` 採用時は `system-spec-update-summary.md` メタ情報に判断根拠を1行で明記する。

---

## canonical N 成果物 vs 必須 6 成果物の区別

### 必須 6 成果物（Phase 12 固定）

| canonical 名 | Task | 用途 |
| ------------ | ---- | ---- |
| `implementation-guide.md` | Task 12-1 | 中学生レベル説明 + 技術詳細 |
| `system-spec-update-summary.md` | Task 12-2 | Step 1 / Step 2 の結果 |
| `documentation-changelog.md` | Task 12-3 | 変更 file と validator 結果 |
| `unassigned-task-detection.md` | Task 12-4 | 未タスク検出（0件でも出力） |
| `skill-feedback-report.md` | Task 12-5 | スキル改善提案（改善点なしでも出力） |
| `phase12-task-spec-compliance-check.md` | Task 12-6 | Task 12-1〜12-5 の集約 |

### canonical N 成果物（各 workflow 固有、Phase 5/6/8 のパス参照）

- Phase 5 の `consumer-audit-report.md`、Phase 6 の `dual-root-parity.md`、Phase 8 の `schema-change-guide.md` など、**workflow 固有**の成果物。
- Phase 12 では **コピーせず、パス参照のみ** で引用する。[phase-template-phase12.md](phase-template-phase12.md) §「canonical vs 必須 6 成果物の分離」を参照（重複禁止 = P12-R2 対策）。

---

## 既知の落とし穴（PR12-R1 / R2 / R3 系）

| ID | 落とし穴 | 回避策 |
| -- | -------- | ------ |
| PR12-R1 | Phase 11 で screenshot を撮影しようとして CAPTURE_BLOCKED を誤記録 | `UI/UX変更なしのため Phase 11 スクリーンショット不要` を固定フレーズで `implementation-guide.md` / `system-spec-update-summary.md` に記載 |
| PR12-R2 | canonical N 成果物を Phase 12 へコピーして重複生成 | Phase 5/6/8 のパス参照のみ（[phase-template-phase12.md](phase-template-phase12.md) §分離参照） |
| PR12-R3 | 未タスク配置先を誤る（`unassigned-task/` vs `completed-tasks/<wf>/unassigned-task/`） | [phase-template-phase12.md](phase-template-phase12.md) §未タスク配置先決定フロー図を参照 |
| PR12-R4 | `spec_created` ステータスを `completed` に誤昇格 | 本テンプレ §完了ステータス判断を参照 |
| PR12-R5 | MINOR 0 件の場合に追跡テーブルを省略 | [phase-template-phase12.md](phase-template-phase12.md) §Phase 10 MINOR 追跡テーブルの「0 件でも N/A 理由を残す」ルール |

---

## Phase 別チェックリスト（監査タスク版）

### Phase 1

- [ ] `taskType: NON_VISUAL` / `implementation_mode: verify_existing` / docs-only を meta に明記
- [ ] 監査スコープ（対象ファイル群・root 区分）を inventory として列挙
- [ ] AC-N に「監査対象の具体的成果物（field map / consumer audit 等）」を含める
- [ ] CLOSED Issue 由来の場合は `issue_closed_reason` / `spec_purpose` を記録

### Phase 3

- [ ] 設計書 §1 冒頭で「Phase 4-6 の再解釈方針」を明示（Phase 4 = raw evidence、Phase 5 = consumer 整理、Phase 6 = dual root diff）
- [ ] Phase 11 が「再現コマンド実行 → 0 差分確認」に特化する旨を宣言

### Phase 4-6

- [ ] Phase 4 `raw-evidence.md` に検索コマンド＋結果セットを 1:1 で記録
- [ ] Phase 5 `consumer-audit-report.md` を 9 列表で作成
- [ ] Phase 6 `dual-root-parity.md` で `.claude` / `.agents` 差分を可視化

### Phase 9

- [ ] 正本 coverage に穴があれば `partial` 判定 + `needs-review`（NR-N）として記録
- [ ] 正本追補は本タスク内で実施するか未タスク化するかを §7 で意思決定

### Phase 11

- [ ] `manual-test-result.md` を 1 ファイル集約の正本として作成
- [ ] 再現コマンドを「コマンド / 前提条件 / 期待結果 / 実結果」で記録
- [ ] screenshot ディレクトリを作成しない（`screenshots/.gitkeep` 削除）
- [ ] `UI/UX変更なしのため Phase 11 スクリーンショット不要` を固定フレーズで明記

### Phase 12

- [ ] 必須 6 成果物を `outputs/phase-12/` に配置
- [ ] canonical N 成果物は Phase 5/6/8 へのパス参照のみ（コピー禁止）
- [ ] 未タスク配置先を決定フロー図（[phase-template-phase12.md](phase-template-phase12.md) 参照）に従って確定
- [ ] `spec_created` を採用する場合は根拠を `system-spec-update-summary.md` に明記

---

## 参照先

- [phase-template-core.md](phase-template-core.md) — Phase 1〜3 の骨格
- [phase-template-phase8-10.md](phase-template-phase8-10.md) — 実装タスクの Phase 8-10（監査では再解釈が必要）
- [phase-template-phase11.md](phase-template-phase11.md) — Phase 11 骨格（NON_VISUAL 分岐あり）
- [phase-template-phase11-detail.md](phase-template-phase11-detail.md) — docs-only task 証跡集約（EC-NNN / SD-NNN）
- [phase-template-phase12.md](phase-template-phase12.md) — Phase 12 骨格（必須 6 成果物・未タスク配置・canonical 分離）
- [phase-12-documentation-guide.md](phase-12-documentation-guide.md) — Task 12-1〜12-6 詳細
- [phase-11-12-guide.md](phase-11-12-guide.md) — Phase 11/12 通しガイド
- [unassigned-task-detection-guide.md](unassigned-task-detection-guide.md) — 未タスク検出パターン

---

## 変更履歴

| 日付 | 変更内容 |
| ---- | -------- |
| 2026-04-19 | 初版作成。TASK-EVALS-CONSUMER-AUDIT-001 PROPOSAL-TSC-01 を反映。Phase 再解釈マップ / primary evidence 棲み分け / 完了ステータス判断 / canonical vs 必須 6 成果物の区別 / PR12-R1〜R5 落とし穴を集約。 |
