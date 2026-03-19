# Phase 11/12 実行ガイダンス

> 読み込み条件:
> Phase 11 または Phase 12 を開始する時。

## split guide

| file | 使う場面 | 内容 |
| --- | --- | --- |
| [phase-11-screenshot-guide.md](phase-11-screenshot-guide.md) | manual test、UI evidence、docs walkthrough | Phase 11 の execution detail |
| [phase-12-documentation-guide.md](phase-12-documentation-guide.md) | implementation guide、spec sync、feedback | Phase 12 の 5 task |
| [spec-update-workflow.md](spec-update-workflow.md) | Task 12-2 | Step 1 / Step 2 index |
| [spec-update-validation-matrix.md](spec-update-validation-matrix.md) | final validation | validator と pass 基準 |

## 使い分け

```
1. 関連する自動テストを全て実行して確認
   ↓
2. テストカテゴリを特定（機能/エラーハンドリング/アクセシビリティ/統合）
   ↓
3. 各カテゴリのテスト項目を実行・記録
   ↓
4. UI/UX変更タスクの場合: 画面カバレッジマトリクスを作成
   4-1. git diff で変更コンポーネント一覧を洗い出す
   4-2. 各コンポーネントの全UI状態（表示/インタラクション/テーマ）を列挙
   4-3. 該当しない状態にN/A理由を記録（暗黙スキップ禁止）
   4-4. 撮影計画 `screenshot-plan.md` または capture script の対象一覧を作成
   4-5. ユーザーが明示的に「スクリーンショットで検証」と要求した場合は、UI差分が主目的でなくても関連UIを対象に screenshot + Appleレビューを実施する（`NON_VISUAL` 単独は不可）
   ↓
5. UI/UX変更タスクの場合: 撮影計画に基づいてスクリーンショットを撮影
   5-1. ルートベース撮影（ページ全体）
   5-2. コンポーネント単位撮影（--selector で要素指定）
   5-3. インタラクション状態撮影（--action + --action-target）
   5-4. ダークモード撮影（--dark）
   ↓
6. UI/UX変更タスクの場合: 画面カバレッジレポートを作成
   6-1. コンポーネント/表示状態/インタラクション/テーマ各カバレッジ算出
   6-2. 必須項目（優先度[A][B]）100%を確認（未達の場合は追加撮影、推奨[C]・任意[D]はN/A記録で代替可）
   6-3. `validate-phase11-screenshot-coverage.js` でTC証跡の紐付けを検証
   ↓
7. UI/UX変更タスクの場合: 各スクリーンショットのUI/UX品質を評価
   7-1. 仕様照合チェックリスト（レイアウト/カラーパレット/8pxグリッド/テーマ/エラーUI）で評価
   7-2. Apple HIG準拠・WCAG AA準拠の観点で品質問題を発見
   7-3. 発見した問題を discovered-issues.md に記録（重要度: 高/中/低）
   ↓
8. UI/UX品質問題が発見された場合: 修正→再撮影→再評価のサイクル
   8-1. 重要度「高」の問題は Phase 11 内で修正（CSS/レイアウト調整等）
   8-2. 修正後に該当箇所を再撮影し、品質基準をクリアしたことを確認
   8-3. 修正困難な問題は discovered-issues.md に記録し、未タスク候補とする
   ↓
9. 結果を outputs/phase-11/manual-test-result.md に出力
   ↓
10. 発見課題（修正済み・未修正）を outputs/phase-11/discovered-issues.md に出力
```
### Phase 11

- docs-only task: navigation、archive discoverability、mirror parity を確認する。
- UI task: 上記に加えて screenshot と Apple UI/UX 視覚検証を行う。
- representative evidence は workflow 配下 `outputs/phase-11/` に置く。

### Phase 12

補足:
- App shell 全体だと初期化ノイズが強い場合、**対象コンポーネント専用 harness** を作って撮影してよい。
- ただし harness は本番コンポーネント / Store / 公開 contract をそのまま使い、差し替えた mock 境界を `manual-test-result.md` に明記する。
- App shell ナビゲーションが不安定で目的 view に到達しにくい場合は、**同一 view を直描画する harness route** を優先し、撮影対象を必要最小の導線へ絞る。
- `renderView` 拡張タスクでは、**画面到達（route）** と **分岐保証（unit test）** を分離する。screenshot は route-based evidence、`App.renderView.*` 系は `vitest` で保証し、同一コマンドに混在させない。
- 再撮影時は `outputs/phase-11/screenshots/phase11-capture-metadata.json` などの生成時刻と `manual-test-result.md` の実施概要を同期する。
- current workflow が `spec_created` / docs-heavy でも、upstream UI surface の統合再確認やユーザー要求がある場合は、current workflow 配下 `outputs/phase-11/screenshots/` に representative screenshots を残す。
- representative screenshot は shell 全景を既定にせず、責務や状態を表す selector / 実文言を待って要素単位で撮影する。`data-testid` が用意できる場合はそれを正本にする。
- docs-only 判定で初回に `N/A` としていても、後続再監査で画面確認が必要になった場合は `SCREENSHOT` へ昇格し、`TC-ID ↔ png` と coverage を current workflow 正本へ再同期する。
- docs-heavy task で user が screenshot を要求し、current build 再撮影が環境依存で過剰または不可能でも、same-day upstream evidence を current workflow へ集約し、review board 1件を current workflow で新規 capture する代替経路を許可する。source evidence / review board / Apple review の関係は `manual-test-result.md` と `command-transcript.md` に明記する。
- skill root が複数ある repository では、user が指定した root を正本として扱い、Phase 12 完了前に mirror root との drift を `diff -qr` 等で確認する。
- Task 12-1〜12-5 を順に閉じる。
- `artifacts.json`、`outputs/artifacts.json`、phase 本文、`index.md` を同一ターンで同期する。
- `current` / `baseline` の二層判定を changelog と quality report に残す。

## 注意事項

### スクリーンショット撮影コマンド（UI/UX変更タスク）

#### A. 撮影計画ベースの一括撮影（推奨）

```bash
# Step 1: dev serverを起動（別ターミナル or バックグラウンド）
cd apps/desktop && npx vite --config vite.e2e.config.ts &

# Step 2: `screenshot-plan.md` または capture script 対象一覧に従って全状態を撮影
node .claude/skills/task-specification-creator/scripts/capture-screenshots.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --plan outputs/phase-11/screenshot-plan.json

# Step 3: カバレッジレポートを確認
cat docs/30-workflows/{{FEATURE_NAME}}/outputs/phase-11/screenshot-coverage.md

# dev server停止
kill %1 2>/dev/null
```

#### B. 個別撮影コマンド（補助）

`capture-screenshots.js` の主要オプション（`--help` で全量確認）:

| 撮影モード | 追加オプション |
| --- | --- |
| ルートベース（ページ全体） | `--routes <path> --state after` |
| コンポーネント単位 | `--routes <path> --selector "[data-testid='...']"` |
| インタラクション状態 | `--action click --action-target "[data-testid='...']"` |
| ダークモード | `--dark` を追加 |
| ドライラン | `--plan <json> --dry-run` |

#### C. 再撮影前 preflight（必須）

`pnpm --filter @repo/desktop preview` → 別ターミナルで `curl -I http://127.0.0.1:4173/...` で疎通確認。build/疎通失敗時は再撮影を継続せず未タスク化する。worktree 間で参照元が揺れる場合は `out/renderer` を static server で配信し metadata と同期する。docs-heavy task で UI 差分がない場合は same-day upstream screenshot を集約する代替経路を許可（build failure 内容・source 由来を記録）。

#### D. 再撮影後 cleanup（必須）

`ps -ef | rg "capture-.*phase11|vite"` で残留プロセスを確認し停止する。cleanup しないとポート競合や判定ドリフトの原因になる。

> **before撮影に関する注意**: Phase 11 の時点で実装は完了済みのため、main ブランチに切り替えて before 撮影を行うのは非現実的である。before 撮影が必要な場合は、**Phase 5（実装）開始前に main ブランチのスクリーンショットを事前に撮影しておく**こと。Phase 11 では after 撮影のみを実施する。

> **Phase 2 へのフィードバック（将来改善）**: UI状態マトリクスの根本的な入力源はPhase 2（設計）である。Phase 2テンプレートに「UI状態マトリクス」セクションを追加し、設計時にコンポーネント x 表示状態の組み合わせを定義しておくことで、Phase 11の撮影計画作成を大幅に効率化できる。

### スクリーンショット網羅性検証コマンド（UI/UX変更タスク）

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}}
```

#### コマンド実行経路の固定（再監査時必須）

```bash
# 1) エイリアス前提を排除（存在しなくても継続）
which verify-all-specs || true
which validate-phase-output || true
which verify-unassigned-links || true

# 2) スクリプト実体を確認
rg --files .claude/skills/task-specification-creator/scripts \
  | rg 'verify-all-specs|validate-phase-output|validate-phase11-screenshot-coverage|verify-unassigned-links|audit-unassigned-tasks'
```

補足:
- `not found` の場合はグローバルCLIではなく、`node .claude/skills/task-specification-creator/scripts/<script>.js` で実行する。
- Phase 12成果物には「実際に使った最終コマンド」を記録し、次回再監査で同じ経路を再利用する。

補足:
- `manual-test-result.md` のテスト結果サマリー表で、**各TCに最低1枚の `.png` 証跡**を紐付ける
- `outputs/phase-11/manual-test-checklist.md` を必ず作成し、TC-ID ごとの実施可否を記録する
- `outputs/phase-11/screenshot-plan.json`（または同等の capture plan）を残し、TC-ID と撮影対象を明示する
- 非視覚TCのみ例外許可する場合は `--allow-non-visual-tc TC-xx` を使用する
- `manual-test-result.md` の先頭列は `テストケース`（推奨）または `TC-ID`/`TC` を使用する（`validate-phase11-screenshot-coverage.js` 互換）
- `phase-11-manual-test.md` には `## テストケース` と `## 画面カバレッジマトリクス` の2セクションを必ず持たせ、TC-IDと証跡ファイルを明記する（代替ソース警告の防止、見出し文字列は完全一致）
- `phase-11-manual-test.md` の `## 画面カバレッジマトリクス` 表にも `テストケース` 列を持たせる（validator warning 防止）
- UI再撮影後は残留プロセスを確認し、次工程へ持ち越さない
- `VIS-xx` や mobile / comparison 用の補助 screenshot は `TC-xx` 証跡と別枠で管理する。`validate-phase11-screenshot-coverage` では warning 許容とし、TC 本体の不足と混同しない

#### TC-ID / 非視覚確認の分離（再監査時必須）

- screenshot coverage の `TC-*` は visual evidence 専用にし、ESC / dismiss / focus trap / keyboard spot check は `NV-*` または automated test として別枠管理する
- Phase 10 checklist と `outputs/phase-4/test-cases.md` で同じ `TC-ID` が別シナリオを指していないか、capture 前に `rg -n "TC-11-"` で突合する
- `TC-ID` を流用したまま Phase 12 へ進めない。衝突が見つかったら screenshot plan / manual-test / final-review / Phase 12 narrative を同一ターンで是正する
### テスト結果レポート形式

```markdown
## テストカテゴリ別結果

### 機能テスト（正常系）

| テストケース | 機能 | 期待結果 | 結果 | 備考 |
| ---------- | ---- | -------- | ---- | ---- |
| TC-001 | {{機能名}} | {{期待される動作}} | PASS | |

### エラーハンドリングテスト（異常系）

| テストケース | 状況 | 期待結果 | 結果 | 備考 |
| ---------- | ---- | -------- | ---- | ---- |
| TC-101 | {{異常状況}} | {{期待されるエラー}} | PASS | |

### アクセシビリティテスト

| テストケース | 要件 | 結果 | WCAG違反 |
| ---------- | ---- | ---- | -------- |
| TC-201 | キーボードナビゲーション | PASS | なし |

### 統合テスト連携

| テスト項目 | 結果 | 課題有無 |
| ---------- | ---- | -------- |
| IPC接続 | PASS | なし |

### スクリーンショットエビデンス（UI/UX変更時）

| テストケース | 撮影ファイル       | 仕様照合結果 | 備考 |
| ------------ | ------------------ | ------------ | ---- |
| TC-001 | `TC-001-after.png` | 一致         |      |

> **命名ルール**: 撮影ファイル名は実際の画面状態と意味を一致させる。  
> 例: 未保存離脱ダイアログの証跡は `*-unsaved-dialog-*.png` のように状態名を含める。

### 仕様照合結果サマリー

| 確認項目           | 結果             |
| ------------------ | ---------------- |
| レイアウト一致     | PASS/FAIL        |
| カラーパレット準拠 | PASS/FAIL        |
| 8pxグリッド準拠    | PASS/FAIL        |
| ダークモード確認   | PASS/FAIL/対象外 |
| エラー状態UI       | PASS/FAIL/対象外 |
```

---

## Phase 12: ドキュメント更新

### 必須タスク（5タスク - 全て完了必須）

#### Task 1: 実装ガイド作成【必須・2パート構成】

| パート | 対象読者 | 内容 |
| ------ | -------- | ---- |
| **Part 1** | **初学者・中学生レベル** | **概念的説明（日常の例え話、専門用語なし）** |
| Part 2 | 開発者・技術者 | 技術的詳細（スキーマ・API・使用例） |

**Part 1（中学生レベル）記述ルール**:
- 日常生活での例え話を**必ず**含め、`たとえば` を最低1回明示する
- 専門用語は使わない（使う場合は即座に説明）
- 図表より文章での説明を優先
- 「なぜ必要か」を先に説明してから「何をするか」を説明
- 作成後に `references/phase12-checklist-definition.md` と `validate-phase12-implementation-guide.js` で内容要件を確認する

**Part 1 テンプレート**:
```markdown
### X.X [機能名]とは何か

#### 日常生活での例え

[日常の具体的なシーン]に似ています。

例えば、[身近な例]のようなものです。

#### この機能でできること

| 機能 | 説明 | 例 |
|------|------|-----|
| 機能A | 簡単な説明 | 具体例 |
```

📖 **詳細**: `references/technical-documentation-guide.md`
📖 **実体確認**: `references/phase12-checklist-definition.md`

---

#### Task 2: システム仕様書更新【必須・2ステップ】

> **重要**: 詳細は `references/spec-update-workflow.md` を参照

**Step 1: タスク完了記録【必須・全タスク】**

```
□ 該当する仕様書に「## 完了タスク」セクションを追加
□ 「## 関連ドキュメント」に実装ガイドリンクを追加
```

**Step 2: システム仕様更新【条件付き】**

更新判断基準:

| 更新必要 | 更新不要 |
| -------- | -------- |
| 新規インターフェース/型追加 | 内部実装の詳細変更のみ |
| 既存インターフェース変更 | リファクタリング（IF不変） |
| 新規定数/設定値追加 | バグ修正（仕様変更なし） |
| 外部連携インターフェース追加 | テスト追加のみ |

---

#### Task 3: ドキュメント更新履歴作成

```bash
# 自動生成スクリプト（推奨）
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}}
```

生成後、手動で補完:
- システム仕様更新内容または「更新なし」の判断根拠
- ソースコード変更の概要

#### Task 3.5: 実行証跡整合ガード【必須】

Phase 12 は「成果物ファイルが存在する」だけでは完了扱いにしない。以下3点を同時に満たすこと:

1. `outputs/phase-12/` の必須5成果物が実在する
2. `artifacts.json` の `phases.12.status` が `completed` である
3. `phase-12-documentation.md` の `ステータス=completed` と完了チェックリストが実体証跡と同期している

差分監査の合否判定は `audit-unassigned-tasks --diff-from HEAD` の `currentViolations.total` を使用し、`baselineViolations.total` は監視値として別記録する。

---

#### Task 4: 未タスク検出レポート作成【0件でも出力必須】

| ソース | 確認項目 |
| ------ | -------- |
| Phase 11テスト結果 | FAILテスト |
| 発見課題 | 重要度「高」課題 |
| アクセシビリティ | WCAG違反 |

**0件の場合の出力形式**:

```markdown
## 検出結果サマリー

| ソース | 検出数 |
| ------ | ------ |
| テスト結果 | 0件 |
| 発見課題 | 0件 |
| アクセシビリティ | 0件 |
| **合計** | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

---

#### Task 5: スキルフィードバックレポート作成【改善点なしでも出力必須】

| 観点 | 確認内容 |
| --- | --- |
| テンプレート改善 | Phaseテンプレートの不足・曖昧な判定条件 |
| ワークフロー改善 | 自動検証化できるチェックポイント |
| ドキュメント改善 | 横断ガイドライン化すべき知見 |

**出力**: `outputs/phase-12/skill-feedback-report.md`

Task 5 の基本対象は `aiworkflow-requirements` と `task-specification-creator` だが、ユーザーがスキル改善を明示した場合、または Task 5 で再利用パターンを抽出して `skill-creator` 自体を更新した場合は、`skill-creator` も同じレポートへ含める。

---

## Phase 12 完了条件チェックリスト

- [ ] 実装ガイド（Part 1: **中学生レベル概念説明**）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] `validate-phase12-implementation-guide.js --workflow <workflow-path>` が PASS であることを確認した
- [ ] 【Step 1-A】システム仕様書に「完了タスク」セクションを追加した
- [ ] 【Step 1-A】関連ドキュメントセクションに実装ガイドリンクを追加した
- [ ] 【Step 1-A】LOGS.md **2ファイル両方**（aiworkflow-requirements + task-specification-creator）を更新した
- [ ] 【Step 1-A】`skill-creator` を改善した場合、`.claude/skills/skill-creator/LOGS.md` も更新した
- [ ] 【Step 1-A】SKILL.md **2ファイル両方**の変更履歴テーブルにバージョンを追記した ⚠️ **P23: 漏れやすい**
- [ ] 【Step 1-A】`skill-creator` を改善した場合、`.claude/skills/skill-creator/SKILL.md` の変更履歴も更新した
- [ ] 【Step 1-A】変更履歴へ追記した Version が既存行と重複していないことを確認した（同日追補時は最大値 + 0.0.1 で採番）
- [ ] `node .claude/skills/skill-creator/scripts/quick_validate.js` で3スキル全てが Error 0件であることを確認した（Warning の分類は `spec-update-workflow.md` Step 1-G.3.1 を参照）
- [ ] `quick_validate.js` の Warning を Step 1-G.3.1 で分類し、`spec-update-summary.md` に「要監視 / 要対応」を記録した
- [ ] Task 5 で `skill-creator` を更新した場合、その変更内容を `skill-feedback-report.md` / `documentation-changelog.md` / `spec-update-summary.md` に同値で記録した
- [ ] 【Step 1-C】`grep -rn "TASK_ID" references/` で関連タスクテーブルを全件確認した
- [ ] 【Step 1-D】topic-map.md再生成を実行した（下記コマンド参照）
- [ ] 【Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した
- [ ] 【Step 2】システム仕様を更新した場合、`spec-update-summary.md` と `documentation-changelog.md` の両方が「更新あり」で一致していることを確認した（片方のみ更新禁止）
- [ ] 【Step 2】今回の実装で苦戦した箇所をシステム仕様書（`lessons-learned.md` または関連 `interfaces-*.md`）に記録した
- [ ] `outputs/phase-12/spec-update-summary.md` を作成し、Step 1-A〜3の実施結果を記録した
- [ ] `outputs/phase-12` の必須5成果物実体と `artifacts.json` の `phases.12.status=completed` が同期している
- [ ] `phase-12-documentation.md` の `ステータス=completed` と完了チェックリストが成果物実体・検証結果と同期している
- [ ] completed workflow の `phase-12-documentation.md` に `仕様策定のみ` / `実行予定` / `保留として記録` などの planned wording が残っていない
- [ ] 未タスク検出レポートが出力されている【0件でも必須】
- [ ] 初回判定が 0 件でも、親タスクの苦戦箇所を cross-cutting guard として formalize する必要が判明した場合は、`unassigned-task-detection.md` / `spec-update-summary.md` / `documentation-changelog.md` を 0→1 へ再同期した
- [ ] スキルフィードバックレポートが出力されている【改善点なしでも必須】
- [ ] 未タスク検出時、**関連ファイル調査**（同様パターンの他ファイル）を実施した ⚠️ **P24: 漏れやすい**
- [ ] 未タスク検出時、**3ステップ全完了**（①指示書作成 → ②task-workflow.md登録 → ③関連仕様書リンク）
- [ ] 未タスク検出時、**指示書の物理ファイル存在を確認**（`ls docs/30-workflows/unassigned-task/` で作成済みファイルを検証）
- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行し、`task-workflow.md` 内の未タスクリンク参照切れが0件であることを確認
- [ ] `artifacts.json` と `outputs/artifacts.json` の両方を同期し、completed成果物の参照切れが0件であることを確認
- [ ] `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/{{FEATURE_NAME}} --regenerate` を実行し、`index.md` の Phase 状態が `artifacts.json` と一致していることを確認
- [ ] `phase-12-documentation.md` が completed でも `index.md` が未実施表示のまま残っていないことを確認
- [ ] `artifacts.json` / `index.md` が completed でも `phase-1..11` 本文仕様書に `ステータス=pending` が残っていないことを確認
- [ ] 完了済み未タスク指示書が `unassigned-task/` に残置されていない（完了時は `completed-tasks/unassigned-task/` へ移管）
- [ ] **未実施**タスク指示書（未着手/未実施/進行中）が `completed-tasks/unassigned-task/` に混在していない（存在する場合は `docs/30-workflows/unassigned-task/` へ是正）
- [ ] `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file <今回対象ファイル>` を実行し、`currentViolations.total = 0` を確認した
- [ ] `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json` を実行し、baseline監視結果（全体違反件数）を記録した
- [ ] `audit-unassigned-tasks.js --json --diff-from HEAD` を実行し、合否判定を `currentViolations.total` で記録した（baselineは別記録）
- [ ] artifacts.jsonが更新されている
- [ ] .claude/rules/ の技術的負債テーブルが最新（負債解消時は「完了」に更新）
- [ ] 【品質】ESLintキャッシュをクリアしてlintを再実行した（下記コマンド参照）
- [ ] 【品質】コメントフォーマット（JSDoc形式）が統一されている
- [ ] 未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されていること（親タスクのtasks/ではない） ⚠️ **P3派生: TASK-9B-Iで再発**
- [ ] テスト数が実際の `it()` ブロック数と一致すること（Phase 4 の想定値ではなく実測値を使用） ⚠️ **TASK-9B-I教訓**
- [ ] SDK 型定義変更時は、カスタム declare module ファイルの有無を確認し、不要なら削除を未タスク化すること
- [ ] UI/UX変更タスクの場合: Phase 11のスクリーンショットがコミットに含まれる状態であること
- [ ] UI/UX変更タスクの場合: 再撮影前に preview preflight（build成功 + `127.0.0.1:4173` 疎通）を記録し、失敗時は未タスク化したこと
- [ ] UI/UX変更タスクの場合: 再撮影後に `stat` 実時刻と `manual-test-result.md`（必要に応じて `screenshot-coverage.md`）の更新時刻が一致していること
- [ ] UI/UX変更タスクの場合: `validate-phase11-screenshot-coverage.js --workflow <workflow-path>` が PASS であることを Phase 12成果物に記録した
- [ ] `phase-12-documentation.md` の Task 1-5 / Step 1-A〜3 / 完了条件チェックが、実績に合わせて `[x]` へ同期されている
- [ ] Step 2 で domain spec を更新した場合、少なくとも 1 つの正本仕様書に `実装内容（要点）` / `苦戦箇所（再利用形式）` / `同種課題の5分解決カード`、またはそれと等価な lessons 参照が記録されている
- [ ] 既存未タスクを参照する場合、リンク先が **未実施なら** `docs/30-workflows/unassigned-task/`、**完了済みなら** `docs/30-workflows/completed-tasks/**/unassigned-task/` になっていることを確認した
- [ ] `unassigned-task-detection.md` に既存未タスクを流用した理由と、物理配置確認結果（`ls docs/30-workflows/unassigned-task/`）を記録した
- [ ] PRコメントに `## 📖 実装ガイド（全文）` が存在し、Part 1/Part 2 の両方を含むことを `gh api .../issues/<PR_NUMBER>/comments` で確認した
- [ ] PR本文/PRコメントへ掲載する画像リンクが `raw.githubusercontent.com/<repo>/<commit>/<path>` の絶対URLであること（相対パスのまま投稿しない）
- [ ] スクリーンショットコメント更新時に、実装ガイド全文コメントを編集・上書きしていないこと
- [ ] Phase 13（`/ai:diff-to-pr`）で参照する `TARGET_WORKFLOW_DIR` が今回差分のworkflowを指すことを確認した
- [ ] PR本文（`.github/pull_request_template.md` 準拠）の `## その他` に Phase 12 実装ガイド反映元パスと要点を記載する準備ができている
- [ ] **本Phase内の全タスクを100%実行完了**

### Phase 12 自動化コマンド

```bash
# topic-map.md再生成（Step 1-D）
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --regenerate

# 実装ガイド内容要件（Task 1）
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --json

# 未実施タスク誤配置チェック（completed-only area に未着手/未実施が混在していないか）
rg -n "^\\| ステータス\\s*\\|.*未着手|^\\| ステータス\\s*\\|.*未実施|^\\| ステータス\\s*\\|.*進行中" \
  docs/30-workflows/completed-tasks -g "*.md"

# 対象監査（今回変更分合否: current）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/unassigned-task/{{TASK_FILE}}.md

# standalone 完了指示書の current 監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/completed-tasks/{{TASK_FILE}}.md

# 差分監査（git差分を current 判定）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD

# 全体監査（baseline監視）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json

# TODO/FIXMEスキャン（補助）
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/main/ipc \
  --output docs/30-workflows/{{FEATURE_NAME}}/outputs/phase-12/.tmp-unassigned-candidates.json

# ESLintキャッシュクリア（Hooksでエラーが残る場合）
rm -rf node_modules/.cache/eslint-*
pnpm lint --cache=false

# 未使用importの自動修正
pnpm lint --fix

# SKILL検証（全3スキル一括。判定基準は spec-update-workflow.md Step 1-G.3.1 参照）
# 結果: ✓=Pass, ⚠=Warning(許容/要監視/要対応で分類), ✗=Error(修正必須)
for skill in skill-creator task-specification-creator aiworkflow-requirements; do
  echo "=== $skill ===" && \
  node .claude/skills/skill-creator/scripts/quick_validate.js ".claude/skills/$skill"
done
```

### Phase 12 漏れやすいポイント（06-known-pitfalls.md 参照）

| ID | ポイント | 対策 |
| -- | -------- | ---- |
| P1 | LOGS.md 2ファイル更新漏れ | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P3 | 未タスク管理の3ステップ不完全 | 指示書作成 + テーブル登録 + 仕様書リンク |
| P23 | SKILL.md 変更履歴の更新漏れ | LOGS.md とは別に SKILL.md も更新 |
| P48 | 全体監査FAILを今回差分FAILと誤認 | baseline/current を分離して記録 |

## 基本原則

1. UI task で screenshot を省略しない。
2. docs-only task では screenshot を要求せず、manual walkthrough と mirror parity を証跡化する。
3. user が root を明示した場合はその root を canonical として扱う。
4. completed workflow では planned wording を残さない。

## 変更履歴

| Date | Changes |
| --- | --- |
| 2026-03-18 | 完了タスク記録を圧縮し500行以下に縮小 |
| 2026-03-12 | Phase 11 と Phase 12 の detail を別ファイルへ分離 |
