# UT-UIUX-PLACEHOLDER-EVIDENCE-VALIDATOR-001

```yaml
issue_number: 1800
task_id: UT-UIUX-PLACEHOLDER-EVIDENCE-VALIDATOR-001
task_name: Phase 11/12 placeholder-only evidence 自動バリデーター実装
category: 改善
target_feature: scripts/validate-phase-evidence.js
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-UIUX-FEEDBACK-001 苦戦箇所
created_date: 2026-03-31
dependencies: []
```

## メタ情報

| 項目       | 値                                                                                       |
| ---------- | ---------------------------------------------------------------------------------------- |
| ステータス | 未着手                                                                                   |
| 優先度     | Low                                                                                      |
| 起票日     | 2026-03-31                                                                               |
| 起票元     | TASK-UIUX-FEEDBACK-001 苦戦箇所 / ブランチ状況分析                                       |
| 関連タスク | TASK-UIUX-FEEDBACK-001, UT-P0-06-CANONICAL-SYNC-001, UT-UIUX-PLAYWRIGHT-E2E-COMPLETE-001 |
| Issue番号  | #TBD                                                                                     |

## 1. なぜこのタスクが必要か（Why）

TASK-UIUX-FEEDBACK-001 の開発中に、Phase 11/12 の成果物（`outputs/phase-11/`, `outputs/phase-12/`）が「placeholder-only evidence」のまま Phase 完了扱いになる問題が発覚した。

`task-workflow-phases.md` には placeholder-only evidence の禁止ルールが追記されているものの、その強制は人手によるレビューに依存しており、チェック漏れが構造的に発生しやすい。また、`scaffold-placeholder.png` のような命名の placeholder ファイルが成果物ディレクトリに残留しても検出機構がないため、false green なまま Phase 完了レポートが生成されるリスクがある。

自動バリデーションスクリプトを導入することで、placeholder-only 状態での Phase 完了を機械的にブロックし、今後の UI/UX タスクで同様の問題が再発しないようにする必要がある。

## 2. 何を達成するか（What）

以下の成果物を実装・整備する：

1. **バリデーションスクリプト** `scripts/validate-phase-evidence.js`
   - `outputs/phase-11/` 配下に `status: "not_run"` の JSON が存在する場合は FAIL
   - `outputs/phase-11/screenshots/` に `scaffold-placeholder.png` のみ存在する場合は FAIL
   - `outputs/phase-12/` の成果物ファイルに実測日付（`YYYY-MM-DD` 形式）が含まれていない場合は WARN

2. **Phase 12 チェックリスト統合**
   - `phase-12-documentation.md` テンプレートにバリデーション実行を必須ステップとして追加

3. **pnpm スクリプト登録**
   - `pnpm run validate:evidence` でスクリプトを実行できるよう `package.json` に追加

## 3. どのように実行するか（How）

1. `scripts/validate-phase-evidence.js` を新規作成する
   - CLI 引数 `--task <TASK-ID>` を受け取り、対応する `outputs/` パスを解決する
   - artifacts.json の `status: "not_run"` チェックを実装する
   - `screenshots/` ディレクトリに placeholder ファイルのみが存在するかを検出する
   - 実測日付パターン（`YYYY-MM-DD`）を Markdown ファイル内で検索する
2. placeholder ファイルの命名規則を統一し、pattern matching ルールを確定する
3. 実測日付の判定基準を統一する（Markdown コメント or テーブルセル）
4. `package.json` の `scripts` に `"validate:evidence": "node scripts/validate-phase-evidence.js"` を追加する
5. `phase-12-documentation.md` テンプレートにバリデーション実行ステップを追記する

## 3.5 苦戦箇所と解決策

| 苦戦箇所                                         | 原因                                                                                                                               | 解決策                                                                                                                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| placeholder ファイルの命名規則が統一されていない | `scaffold-placeholder.png` など命名が慣習に依存しており、pattern matching の網羅性が保証できない                                   | `placeholder` / `scaffold-placeholder` / `dummy` を含むファイル名を検出対象とし、許容リスト（allowlist）方式ではなく否認リスト（denylist）方式で実装する |
| 2 種類のバリデーション（JSON + ファイル内容）    | artifacts.json の `status` フィールドチェックと、実ファイルの中身チェックは検索対象・ロジックが異なる                              | バリデーターを `checkArtifactsJson()` と `checkScreenshotsDir()` の 2 関数に分割し、それぞれの結果を統合して最終判定する                                 |
| 「実測日付」の判定基準が未統一                   | `<!-- date: 2026-03-31 -->` コメントと `\| 実施日 \| 2026-03-31 \|` テーブル形式の両パターンが混在しており、どちらを正とするか不明 | `YYYY-MM-DD` 形式の正規表現（`/\d{4}-\d{2}-\d{2}/`）を共通パターンとして採用し、コメント・テーブルどちらにマッチしても PASS とする仕様に統一する         |

## 4. 実行手順

1. 対象ディレクトリ構造を確認する

   ```bash
   ls docs/30-workflows/step-*/outputs/phase-11/
   ls docs/30-workflows/step-*/outputs/phase-12/
   ```

2. `scripts/validate-phase-evidence.js` を作成する

   ```bash
   # 引数解析・パス解決
   # checkArtifactsJson(): artifacts.json の status: "not_run" 検出
   # checkScreenshotsDir(): placeholder ファイルのみ存在を検出
   # checkPhase12Dates(): 実測日付パターン検索
   node scripts/validate-phase-evidence.js --help
   ```

3. placeholder 検出パターンを確定する
   - denylist: `scaffold-placeholder`, `placeholder`, `dummy` を含むファイル名
   - allowlist 除外: `README.md`, `.gitkeep`

4. `package.json` にスクリプトを登録する

   ```json
   "validate:evidence": "node scripts/validate-phase-evidence.js"
   ```

5. Phase 12 テンプレートを更新する
   - 対象: `docs/30-workflows/unassigned-task/` 配下の phase-12 テンプレート
   - 追加ステップ: `pnpm run validate:evidence --task <TASK-ID>` の実行を必須ステップとして明記

6. TASK-UIUX-FEEDBACK-001 の outputs を使って動作確認する（手順 6 参照）

## 5. 完了条件チェックリスト

- [ ] `scripts/validate-phase-evidence.js` が存在する
- [ ] `pnpm run validate:evidence --task TASK-UIUX-FEEDBACK-001` が実行できる
- [ ] `status: "not_run"` の artifacts.json が存在する場合に FAIL メッセージが出力される
- [ ] `scaffold-placeholder.png` のみが screenshots ディレクトリに存在する場合に FAIL メッセージが出力される
- [ ] `outputs/phase-12/` に実測日付がない場合に WARN メッセージが出力される
- [ ] 実測 evidence 配置後に PASS が出力される
- [ ] `phase-12-documentation.md` テンプレートにバリデーション実行ステップが追加されている
- [ ] placeholder 検出の denylist パターンがコード内にコメントで明記されている
- [ ] 実測日付の判定基準（正規表現パターン）がコード内にコメントで明記されている

## 6. 検証方法

```bash
# placeholder-only 状態で FAIL が出ることを確認
node scripts/validate-phase-evidence.js --task TASK-UIUX-FEEDBACK-001

# 実測 evidence 配置後に PASS することを確認
# outputs/phase-11/screenshots/ に実スクリーンショットを配置後
node scripts/validate-phase-evidence.js --task TASK-UIUX-FEEDBACK-001

# pnpm 経由での実行確認
pnpm run validate:evidence --task TASK-UIUX-FEEDBACK-001

# Phase 12 テンプレートへのステップ追加確認
grep -n "validate:evidence\|validate-phase-evidence" \
  docs/30-workflows/unassigned-task/phase-12-documentation.md
```

## 7. リスクと対策

- **リスク**: denylist パターンが不完全で、新たな命名の placeholder ファイルが検出されない
  - 対策: denylist に加えて、ファイルサイズが 0 または数バイトのファイルも WARN 対象とする補助チェックを追加する
- **リスク**: `--task` 引数と outputs パスのマッピングが正しく解決されない
  - 対策: タスク ID から outputs パスへの解決ロジックを単体テストで検証し、マッピングテーブルを設ける
- **リスク**: Phase 12 テンプレートが複数存在し、更新漏れが発生する
  - 対策: `grep -r "phase-12" docs/` でテンプレートを網羅的に検索してから更新する

## 8. 参照情報

- `docs/30-workflows/step-09-par-task-uiux-feedback-001/outputs/phase-11/artifacts.json`（placeholder-only 状態の具体例）
- `docs/30-workflows/step-09-par-task-uiux-feedback-001/outputs/phase-11/screenshots/scaffold-placeholder.png`
- `docs/30-workflows/unassigned-task/UT-P0-06-CANONICAL-SYNC-001.md`（false green 解消パターンの参照元）
- `docs/30-workflows/unassigned-task/UT-UIUX-PLAYWRIGHT-E2E-COMPLETE-001.md`（関連する E2E evidence 整備タスク）
- `.agents/skills/aiworkflow-requirements/references/task-workflow-phases.md`（placeholder-only evidence 禁止ルールの定義元）

## 9. 備考

本タスクは品質保証系（Low）。TASK-UIUX-FEEDBACK-001 の Phase 12 クローズ後に着手することを推奨する。

スクリプト実装に際しては Node.js 標準ライブラリ（`fs`, `path`）のみを使用し、外部依存を増やさない方針とする。

placeholder ファイル denylist の管理は `scripts/validate-phase-evidence.js` 内の定数配列で行い、追加・変更を容易にする。将来的には設定ファイル（`evidence-validator.config.json`）への外部化も検討する。
