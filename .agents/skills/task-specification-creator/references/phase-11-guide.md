# Phase 11 テスト実行ガイド

> 元ファイル: `phase-11-12-guide.md` から分割
> 読み込み条件: Phase 11 を開始する時。

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
- 実装統合タスクで visible surface の追加がない場合は、Phase 11 を `NON_VISUAL` として設計し、`manual-test-checklist.md` / `manual-test-result.md` を正本にする。screenshot 契約を要求しないのに `UI` / `スクリーンショット` wording を残すと validator が不要な画面証跡を要求するため、仕様書本文でも non-visual 前提を明示する。

### Phase 12

補足:
- App shell 全体だと初期化ノイズが強い場合、**対象コンポーネント専用 harness** を作って撮影してよい。
- ただし harness は本番コンポーネント / Store / 公開 contract をそのまま使い、差し替えた mock 境界を `manual-test-result.md` に明記する。
- App shell ナビゲーションが不安定で目的 view に到達しにくい場合は、**同一 view を直描画する harness route** を優先し、撮影対象を必要最小の導線へ絞る。
- `renderView` 拡張タスクでは、**画面到達（route）** と **分岐保証（unit test）** を分離する。screenshot は route-based evidence、`App.renderView.*` 系は `vitest` で保証し、同一コマンドに混在させない。
- 再撮影時は `outputs/phase-11/screenshots/phase11-capture-metadata.json` などの生成時刻と `manual-test-result.md` の実施概要を同期する。
- current workflow が `spec_created` / docs-heavy でも、upstream UI surface の統合再確認やユーザー要求がある場合は、current workflow 配下 `outputs/phase-11/screenshots/` に representative screenshots を残す。
- current workflow が design task でも、Phase 11 仕様書に screenshot 契約がある場合は `manual-test-result.md` / `screenshot-coverage.md` / `screenshots/*.png` / metadata JSON を**全て** current workflow 配下へ揃える。png だけ追加して完了扱いにしない。
- representative screenshot は shell 全景を既定にせず、責務や状態を表す selector / 実文言を待って要素単位で撮影する。`data-testid` が用意できる場合はそれを正本にする。
- docs-only 判定で初回に `N/A` としていても、後続再監査で画面確認が必要になった場合は `SCREENSHOT` へ昇格し、`TC-ID ↔ png` と coverage を current workflow 正本へ再同期する。
- docs-heavy task で user が screenshot を要求し、current build 再撮影が環境依存で過剰または不可能でも、same-day upstream evidence を current workflow へ集約し、review board 1件を current workflow で新規 capture する代替経路を許可する。source evidence / review board / Apple review の関係は `manual-test-result.md` と `command-transcript.md` に明記する。
- screenshot fallback を使った場合でも、`outputs/phase-11/screenshots/phase11-capture-metadata.json` 等に **capture method / failure reason / source evidence / generated-at** を残し、`manual-test-result.md` と時刻・理由を一致させる。
- `manual-test-result.md` には、fallback 時に使った harness HTML/TSX、capture script、review board PNG、metadata JSON の**実ファイル path**を残す。
- placeholder PNG だけを置いて Phase 11 PASS にしない。UI 差分がない `NON_VISUAL` task では dummy PNG を作らず、`manual-test-result.md` と `screenshot-plan.json` に blocker / 実行コマンド / 代替 evidence を記録する。visual fallback を採る場合のみ、`TC-ID ↔ png`、`screenshot-coverage.md`、metadata JSON、fallback reason、source evidence の 5 点を current workflow に揃える。
- skill root が複数ある repository では、user が指定した root を正本として扱い、Phase 12 完了前に mirror root との drift を `diff -qr` 等で確認する。
- `spec_created` / docs-heavy task でも、Phase 12 は「計画記録」では閉じない。`.claude/skills/` 側の system spec / LOGS / lessons learned / backlog / `artifacts.json` / `outputs/artifacts.json` を **同ターンで実更新** する。
- persist / hydration task の Phase 11 では、actual storage key と validation entrypoint を仕様書へ明記し、`electron-store` など generic storage 名を推測で書かない。
- Step 2 の sync 先は generic なファイル名で推測せず、actual domain split を見て **primary target file list** を先に確定してから書き込む。
- Task 12-1〜12-6 を順に閉じる。
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

```bash
# ルートベース撮影（ページ全体）
node .claude/skills/task-specification-creator/scripts/capture-screenshots.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --routes {{変更対象のルート}} \
  --state after

# コンポーネント単位撮影（要素指定）
node .claude/skills/task-specification-creator/scripts/capture-screenshots.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --routes /settings \
  --selector "[data-testid='my-component']" \
  --state after

# インタラクション状態撮影（ボタンクリック後等）
node .claude/skills/task-specification-creator/scripts/capture-screenshots.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --routes /settings \
  --action click --action-target "[data-testid='open-modal']" \
  --state modal-open

# ダークモード撮影
node .claude/skills/task-specification-creator/scripts/capture-screenshots.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --routes {{変更対象のルート}} \
  --state after --dark

# ドライラン（出力パス確認のみ）
node .claude/skills/task-specification-creator/scripts/capture-screenshots.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --plan outputs/phase-11/screenshot-plan.json --dry-run
```

**スクリプトオプション一覧**: `capture-screenshots.js --help` または `--dry-run` で確認

#### C. 再撮影前 preflight（必須）

```bash
# 1) preview build の成否を先に確認
pnpm --filter @repo/desktop preview

# 2) 別ターミナルで疎通確認（preview起動時）
curl -I http://127.0.0.1:4173/advanced/skill-center?skipAuth=true
```

補足:
- build失敗または疎通失敗時は再撮影を継続しない。
- 失敗内容を `outputs/phase-12/unassigned-task-detection.md` に記録し、`docs/30-workflows/unassigned-task/` へ未タスク化する。
- 複数 worktree で Vite preview / dev server の参照元が揺れる場合は、`pnpm build` 後の current worktree `out/renderer` を static server（例: `python3 -m http.server 4173 --directory apps/desktop/out/renderer`）で配信し、asset hash と `phase11-capture-metadata.json` の時刻を current build と同期する。
- capture script が loopback URL（`127.0.0.1` / `localhost`）を前提にする場合は、疎通失敗時に current worktree `out/renderer` を自動配信する fallback を許可する。fallback を使った場合は `manual-test-result.md` / `phase11-capture-metadata.json` / Phase 12 レポートに「auto static serve を使った」ことを明記し、cleanup を必ず実行する。
- ただし docs-heavy / spec_created task で代表画面の再監査が目的かつ UI 実装差分がない場合は、build failure を即 blocker にせず、same-day upstream screenshot を current workflow に集約して review board を current workflow で新規 capture する代替経路を許可する。build failure の内容、source screenshot の由来、review board metadata は必ず残す。

#### D. 再撮影後 cleanup（必須）

```bash
# 1) 残留プロセス確認（例: captureスクリプト / vite）
ps -ef | rg "capture-.*phase11|vite" | rg -v rg || true

# 2) 必要に応じて停止
kill <PID...> || true
```

補足:
- 再撮影完了ログが出ても、Vite が残留するケースがある。
- cleanup しないまま次工程へ進むと、ポート競合や再監査判定ドリフトの原因になる。

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
- `ケース` や `MT-*` を visual TC の正式IDとして使わない。visual evidence は `TC-11-*` 系へ寄せ、review note や補助確認は `NV-*` 等の別枠へ分離する。
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
