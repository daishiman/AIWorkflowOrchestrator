# [#971] "[UT-IMP-PHASE12-CAPTURE-SCRIPT-NAVIGATION-STABILITY-GUARD-001] Phase 12 キャプチャスクリプト遷移安定化ガード"

## メタ情報

```yaml
task_id: UT-IMP-PHASE12-CAPTURE-SCRIPT-NAVIGATION-STABILITY-GUARD-001
task_name: Phase 12 キャプチャスクリプト遷移安定化ガード
category: 改善
target_feature: Playwright キャプチャスクリプトの起動待機・遷移待機安定化
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001 Phase 11/12 再確認
created_date: 2026-03-04
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-phase12-capture-script-navigation-stability-guard-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

workflow02 の screenshot 再取得で `page.goto` が 30秒タイムアウトし、再実行で `domcontentloaded` + 補助待機を追加して復旧した。

### 1.2 問題点・課題

- `waitUntil: load` 固定では開発サーバ状態によりタイムアウトしやすい
- 待機戦略がスクリプトごとに不統一で、再発防止が文書化されていない
- 失敗時のデバッグ情報が不足し、原因切り分けに時間がかかる

### 1.3 放置した場合の影響

- UI証跡再取得が断続的に失敗し、Phase 11 の再現性が落ちる
- Phase 12 の証跡確定が遅延する
- 画面検証を並列化しづらくなる

---

## 2. 何を達成するか（What）

### 2.1 目的

キャプチャスクリプトの遷移待機戦略を標準化し、タイムアウト再発を防止する。

### 2.2 最終ゴール

1. `goto` の待機方針（`domcontentloaded` + フォールバック待機）が標準化される
2. タイムアウト時の診断ログ（URL/待機段階/失敗箇所）が取得できる
3. 同様スクリプトへ適用可能なテンプレート手順が整備される

### 2.3 スコープ

#### 含むもの

- screenshot スクリプトの遷移待機方針標準化
- 失敗時診断ログの最小標準化
- Phase 11/12 文書への反映

#### 含まないもの

- Playwright 全E2E基盤の刷新
- 各画面のテストシナリオ拡張

### 2.4 成果物

- 待機方針ガイド（スクリプト標準）
- 診断ログ標準項目
- 反映済み仕様文書

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop/scripts/capture-*.mjs` が Playwright を利用している
- Vite 起動待機ヘルパーが存在する

### 3.2 依存タスク

- なし

### 3.3 必要な知識

- Playwright `goto` / `waitForLoadState`
- Vite 開発サーバ起動同期
- Phase 11 screenshot coverage 検証

### 3.4 推奨アプローチ

1. `goto` を `waitUntil: "domcontentloaded"` 基準へ寄せる
2. `networkidle` は補助待機として fail-soft で扱う
3. 失敗時に最低限の診断情報を出力する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                  | 発見経緯                                                          | 解決策                                                                                        | 教訓                                                       |
| ------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `page.goto` が 30秒でタイムアウトした | screenshot 再取得の初回実行で `/advanced/skill-center` 遷移が失敗 | `goto(..., { waitUntil: "domcontentloaded", timeout: 90000 })` + `networkidle` 補助待機に変更 | UI証跡スクリプトは `load` 固定を避け、段階待機を標準化する |
| 失敗時に切り分け情報が不足した        | 初回失敗ログがタイムアウト例外のみ                                | 待機段階ごとのログ出力と診断JSONを標準成果物に含める                                          | 再実行前提ではなく、1回目失敗で原因を残せる設計にする      |

---

## 4. 実行手順

### Phase構成

- Phase A: 待機戦略定義
- Phase B: スクリプト標準化
- Phase C: 検証と文書反映

### Phase A: 待機戦略定義

#### 目的

遷移タイムアウトを防ぐ実行方針を定義する。

#### 手順

1. `goto` の標準引数を定義する
2. 補助待機（`networkidle`）の扱いを規定する
3. タイムアウト値基準を決める

#### 成果物

- 待機戦略仕様

#### 完了条件

- 標準待機方針が 1パターンに統一されている

### Phase B: スクリプト標準化

#### 目的

実装差分を最小で再現性高く揃える。

#### 手順

1. 対象スクリプトへ待機方針を適用する
2. 失敗時診断ログを追加する
3. 診断JSON出力を確認する

#### 成果物

- 更新済み screenshot スクリプト

#### 完了条件

- 同条件で再実行して遷移タイムアウトが再発しない

### Phase C: 検証と文書反映

#### 目的

再発防止ルールを仕様として固定する。

#### 手順

1. screenshot スクリプトを再実行する
2. `validate-phase11-screenshot-coverage` を実行する
3. `task-workflow.md` / `lessons-learned.md` へ反映する

#### 成果物

- 実行ログ
- 更新済み仕様文書

#### 完了条件

- screenshot 再取得と coverage が PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `goto` 待機方針が標準化されている
- [ ] 補助待機の fail-soft 方針が明記されている
- [ ] 診断ログ項目が定義されている

### 品質要件

- [ ] 遷移タイムアウト再発率が低減される設計になっている
- [ ] 再実行時の再現性が確保されている
- [ ] 失敗時の原因切り分け情報が残る

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルに登録されている
- [ ] `lessons-learned.md` の関連未タスクに導線がある

---

## 6. 検証方法

### テストケース

- Case 1: screenshot スクリプトが単発で完走する
- Case 2: coverage validator が PASS する
- Case 3: 診断JSONが出力される

### 検証手順

```bash
pnpm --filter @repo/desktop exec node scripts/capture-skill-import-idempotency-guard-screenshots.mjs
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001
ls docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-11/screenshots
```

---

## 7. リスクと対策

| リスク                                     | 影響度 | 発生確率 | 対策                                                                           |
| ------------------------------------------ | ------ | -------- | ------------------------------------------------------------------------------ |
| 待機条件が環境差で再び崩れる               | 中     | 中       | `domcontentloaded` を基準にし、`networkidle` は補助扱いに限定する              |
| タイムアウト値の過剰延長で失敗検知が遅れる | 低     | 中       | タイムアウト値は上限を決め、診断ログで失敗箇所を可視化する                     |
| スクリプト更新が文書に反映されない         | 中     | 中       | Phase 12 で `task-workflow` / `lessons` / `spec-update-summary` を同時更新する |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/scripts/capture-skill-import-idempotency-guard-screenshots.mjs`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`

### 参考資料

- `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-11/screenshots/import-call-diagnostics.json`
- `docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001/outputs/phase-12/documentation-changelog.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
スクリーンショット再取得で page.goto のタイムアウトが発生し、待機戦略の調整が必要になった。
```

### 補足事項

- 本タスクは workflow02 の再発防止を起点とするが、他の capture スクリプトにも横展開可能。
