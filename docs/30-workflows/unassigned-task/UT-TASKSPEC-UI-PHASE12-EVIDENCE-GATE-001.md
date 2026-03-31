# UT-TASKSPEC-UI-PHASE12-EVIDENCE-GATE-001

```yaml
issue_number: 1812
task_id: UT-TASKSPEC-UI-PHASE12-EVIDENCE-GATE-001
task_name: task-specification-creator Phase 12 UI evidence hard gate 実装
category: 改善
target_feature: .claude/skills/task-specification-creator/
priority: 低
scale: 小規模
status: 未実施
source_phase: UT-UIUX-PLAYWRIGHT-E2E-001 Phase 12 skill-feedback-report
created_date: 2026-03-31
dependencies: []
```

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| ステータス | 未着手                                                                 |
| 優先度     | Low                                                                    |
| 起票日     | 2026-03-31                                                             |
| 起票元     | UT-UIUX-PLAYWRIGHT-E2E-001 Phase 12 / skill-feedback-report.md         |
| 関連タスク | UT-UIUX-PLAYWRIGHT-E2E-001, UT-UIUX-PLACEHOLDER-EVIDENCE-VALIDATOR-001 |
| Issue番号  | #1812                                                                  |

## 1. なぜこのタスクが必要か（Why）

`UT-UIUX-PLAYWRIGHT-E2E-001` の Phase 12 実施中に、以下の 2 つの問題が `skill-feedback-report.md` に記録された。

**問題1**: UI タスクの Phase 12 を PASS 扱いにする前に、`screenshot-plan.json` / `screenshot-coverage.md` / metadata JSON / screenshots ディレクトリの存在チェックを hard gate にしていなかった。成果物の実体が不足したまま close-out 文書だけが完了扱いになるリスクが顕在化した。

**問題2**: `artifacts.json` / `outputs/artifacts.json` の wording を Phase 13 へ先送りする記述が validator で弾かれなかった。「planned」「future」などの wording が残ったまま Phase 完了になる構造的な問題がある。

これらを改善しないと、今後の UI/UX タスクで同様のフォーマット違反が繰り返される。

## 2. 何を達成するか（What）

`task-specification-creator` スキルに以下の 2 つの改善を加える：

1. **Phase 12 UI evidence hard gate ルール**: UI タスクの Phase 12 close-out 前に、`screenshot-plan.json` / `screenshot-coverage.md` / `phase11-capture-metadata.json` / `screenshots/` ディレクトリが存在することを必須チェックとして SKILL.md / phase-11-12-guide.md に明記する
2. **artifacts.json wording validator ルール**: `artifacts.json` / `outputs/artifacts.json` の各エントリに `planned` / `future` / `予定` / `TBD` などのフューチャーワーディングが残っている場合は Phase 12 完了不可として SKILL.md に明記する

## 3. どのように実行するか（How）

1. `task-specification-creator` のスキルファイルを読み込む
   ```bash
   cat .claude/skills/task-specification-creator/SKILL.md
   cat .claude/skills/task-specification-creator/references/phase-11-12-guide.md
   cat .claude/skills/task-specification-creator/references/phase-12-documentation-guide.md
   ```
2. Phase 12 UI evidence hard gate ルールを `phase-11-12-guide.md` に追記する
   - 追記箇所: Phase 12 完了条件チェックリストに「UI タスクの場合は以下を追加確認」セクションを追加
   - チェック項目: `screenshot-plan.json` / `screenshot-coverage.md` / `phase11-capture-metadata.json` / `screenshots/` ディレクトリの存在
3. artifacts.json wording validator ルールを `phase-12-documentation-guide.md` に追記する
   - 追記箇所: `artifacts.json` / `outputs/artifacts.json` 作成基準セクション
   - ルール: `planned` / `future` / `予定` / `TBD` を含むエントリは Phase 12 完了不可
4. `.claude/skills/task-specification-creator/SKILL.md` の「Phase 12 ルール」セクションを更新する
5. `.agents/skills/task-specification-creator/` に同期する（mirror 更新）
   ```bash
   rsync -av .claude/skills/task-specification-creator/ .agents/skills/task-specification-creator/
   diff -qr .claude/skills/task-specification-creator/ .agents/skills/task-specification-creator/
   ```

## 3.5 苦戦箇所と解決策

| 苦戦箇所                                                   | 原因                                                                                      | 解決策                                                                                                                                             |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 12 hard gate を「UI タスクのみ」に限定する基準が不明 | 非 UI タスクには screenshot evidence が不要なため、全タスクに適用すると過剰チェックになる | Phase タスク仕様書の `target_feature` が `apps/desktop/e2e/` または `e2e/ui-ux/` を含む場合を UI タスクと定義し、その場合のみ hard gate を適用する |
| `planned` / `future` wording の検出粒度が難しい            | 日英混在で「予定」「future」「planned」など表現が多様で、全パターンを網羅することが難しい | 検出対象を固定リスト（`planned`, `future`, `予定`, `TBD`, `TODO`）で管理し、スキル更新時にリストを追記できる設計にする                             |
| mirror 同期の見落とし                                      | `.claude/skills/` の更新後に `.agents/skills/` への同期を忘れると divergence が発生する   | 更新手順の最後に `diff -qr` コマンドを必須ステップとして明記し、divergence が 0 であることを確認してから完了とする                                 |

## 4. 実行手順

1. 対象スキルファイルを確認する
   ```bash
   ls .claude/skills/task-specification-creator/references/
   ```
2. `phase-11-12-guide.md` の Phase 12 完了条件セクションを特定し、UI タスク追加チェック項目を追記する
3. `phase-12-documentation-guide.md` の artifacts.json 基準セクションにフューチャーワーディング禁止ルールを追記する
4. `SKILL.md` の関連セクションを更新する
5. `.agents/skills/task-specification-creator/` に同期する
   ```bash
   rsync -av .claude/skills/task-specification-creator/ .agents/skills/task-specification-creator/
   ```
6. divergence が 0 であることを確認する
   ```bash
   diff -qr .claude/skills/task-specification-creator/ .agents/skills/task-specification-creator/
   ```

## 5. 完了条件チェックリスト

- [ ] `phase-11-12-guide.md` に UI タスク Phase 12 evidence hard gate チェックリストが追記されている
- [ ] `phase-12-documentation-guide.md` に artifacts.json フューチャーワーディング禁止ルールが追記されている
- [ ] `.claude/skills/task-specification-creator/SKILL.md` の Phase 12 ルールセクションが更新されている
- [ ] `.agents/skills/task-specification-creator/` との divergence が 0 である（`diff -qr` で確認）
- [ ] ルール追加後、UT-UIUX-PLAYWRIGHT-E2E-001 の Phase 12 outputs でバリデーションを試して PASS することを確認する

## 6. 検証方法

```bash
# divergence 確認
diff -qr .claude/skills/task-specification-creator/ .agents/skills/task-specification-creator/

# 追記内容の確認
grep -n "screenshot-plan.json\|screenshot-coverage.md\|hard gate" \
  .claude/skills/task-specification-creator/references/phase-11-12-guide.md

grep -n "planned\|future\|TBD\|フューチャーワーディング" \
  .claude/skills/task-specification-creator/references/phase-12-documentation-guide.md
```

## 7. リスクと対策

- **リスク**: hard gate ルールを追記しても実際の Phase 12 実行時に AI がチェックを省略する
  - 対策: SKILL.md の「Phase 12 PASS 条件」箇条書きに hard gate を明示し、validator コマンドを必須ステップとして記載する
- **リスク**: フューチャーワーディング禁止リストが不完全で違反が見逃される
  - 対策: 検出リストを SKILL.md に直接記載し、タスク実行時に AI が参照できる形にする
- **リスク**: mirror 同期を手動 rsync に依存することで divergence が再発する
  - 対策: `UT-UIUX-MIRROR-SYNC-CI-001`（CI 自動検出）の実装が完了するまでの暫定措置として、スキル更新手順の最後に `diff -qr` を必須ステップとして明記する

## 8. 参照情報

- `.claude/skills/task-specification-creator/SKILL.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`
- `docs/30-workflows/ut-uiux-playwright-e2e-001/outputs/phase-12/skill-feedback-report.md` — 本タスクの起票元
- `docs/30-workflows/unassigned-task/UT-UIUX-PLACEHOLDER-EVIDENCE-VALIDATOR-001.md` — 関連するバリデーター実装タスク

## 9. 備考

本タスクは Low 優先度のスキル改善タスク。`UT-UIUX-PLACEHOLDER-EVIDENCE-VALIDATOR-001` との協調が必要で、スクリプト実装（UT-UIUX-PLACEHOLDER-EVIDENCE-VALIDATOR-001）とルール定義（本タスク）は並行作業可能。

hard gate ルールはドキュメントに追記するだけの軽量対応を先行し、スクリプトによる自動検証は `UT-UIUX-PLACEHOLDER-EVIDENCE-VALIDATOR-001` に委ねる方針とする。
