# [#1799] "[UT-UIUX-MIRROR-SYNC-CI-001] .claude/.agents skills mirror sync CI/CD 自動検出"

## メタ情報

```yaml
task_id: UT-UIUX-MIRROR-SYNC-CI-001
task_name: .claude/.agents skills mirror sync CI/CD 自動検出
category: 改善
target_feature: .claude/skills, .agents/skills
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-UIUX-FEEDBACK-001 苦戦箇所
created_date: 2026-03-31
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-UIUX-MIRROR-SYNC-CI-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

`.claude/skills/`（canonical）と `.agents/skills/`（mirror）の2つのディレクトリは手動 rsync で同期されており、CI/CD で divergence を自動検出する仕組みが存在しない。

現状では `git diff` を手動で確認するまで両ディレクトリの乖離に気付けない構造になっており、新規ファイルを `.claude/skills/` に追加した際に `.agents/skills/` への rsync を忘れるリスクが常在している。また、canonical/mirror のパス情報が `artifacts.json` に記録されていないため、仕様追跡の観点でも不完全な状態である。

TASK-UIUX-FEEDBACK-001 の実装時にこの問題が顕在化し、同様の divergence を将来のタスクで繰り返さないために自動化対策が必要と判断した。

## 2. 何を達成するか（What）

以下の3点を実装・整備する：

1. **GitHub Actions ワークフロー**: PR 時に `.claude/skills/` vs `.agents/skills/` の divergence を自動検出し、差分がある場合は CI を FAIL させる
2. **pre-commit フック**: ローカル開発時にも同期チェックを実施し、divergence をコミット前に検出する
3. **artifacts.json スキーマ拡張**: `canonicalPath` / `mirrorPath` の optional フィールドを追加し、canonical/mirror のパス対応を仕様として記録できるようにする
4. **同期手順ドキュメント**: README または SKILL.md に「canonical → mirror の同期手順」を記載する

## 3. どのように実行するか（How）

1. `.github/workflows/` に `skill-mirror-sync-check.yml` を作成し、`diff -qr` コマンドでテキストファイルのみを比較するステップを追加する
2. `.claude/hooks/` または `scripts/` に pre-commit 用の同期チェックスクリプトを追加し、`.husky/pre-commit` から呼び出す
3. `artifacts.json` の JSON Schema に `canonicalPath` / `mirrorPath` フィールドを optional で追加し、既存エントリへの後方互換性を保つ
4. `.claude/skills/` または プロジェクトルートの README に同期手順セクションを追記する

## 3.5 苦戦箇所と解決策

| 苦戦箇所                                    | 原因                                                                                              | 解決策                                                                                                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| rsync を postinstall に組み込むか否かの判断 | 常時 rsync はオーバーヘッドが大きく、`pnpm install` のたびに実行されると開発体験が悪化する        | postinstall には組み込まず、`pnpm run sync:skills` のような独立コマンドとして提供し、CI チェックと pre-commit フックで divergence を検出する方針とする |
| CI での binary ファイル除外                 | `diff -qr` はバイナリファイルも比較対象にするため、PNG・JPG などで誤検知が発生する                | `--exclude='*.png' --exclude='*.jpg' --exclude='*.gif' --exclude='*.ico'` を指定し、テキストファイルのみを比較対象とする                               |
| artifacts.json スキーマ変更の後方互換性     | 全タスク仕様書の artifacts.json エントリに影響するため、既存エントリが invalid になるリスクがある | `canonicalPath` / `mirrorPath` を `required` ではなく optional フィールドとして定義し、既存エントリには追記不要とする                                  |
| pre-commit フックの実行コスト               | `diff -qr` は大量ファイルがある場合に時間がかかる可能性がある                                     | スキルディレクトリのみを対象に絞り（`--exclude='.git'` 等）、チェック対象を最小化する                                                                  |

## 4. 実行手順

1. 現状の canonical/mirror 両ディレクトリの差分を確認する
   ```bash
   diff -qr .claude/skills/ .agents/skills/ \
     --exclude='*.png' --exclude='*.jpg' --exclude='*.gif' --exclude='*.ico'
   ```
2. `.github/workflows/skill-mirror-sync-check.yml` を作成する
   - トリガー: `pull_request` / `push` (main ブランチ)
   - ステップ: `diff -qr` でテキストファイルを比較し、差分があれば `exit 1`
3. pre-commit 用チェックスクリプト `scripts/check-skill-mirror-sync.sh` を作成する
   - 実行内容: `diff -qr .claude/skills/ .agents/skills/ --exclude=...`
   - 差分があれば エラーメッセージと同期コマンドの案内を表示して終了コード 1 を返す
4. `.husky/pre-commit` にスクリプト呼び出しを追加する
   ```bash
   bash scripts/check-skill-mirror-sync.sh
   ```
5. `artifacts.json` の JSON Schema ファイルを特定し、`canonicalPath` / `mirrorPath` フィールドを optional で追加する
6. 既存の代表的な artifacts.json エントリに `canonicalPath` / `mirrorPath` を試験的に追記し、スキーマ検証が通ることを確認する
7. README または `.claude/skills/SKILL.md` に同期手順セクションを追記する
   - 同期コマンド例
   - CI/pre-commit でのチェック内容の説明
8. PR を作成して CI が正常に通ることを確認する

## 5. 完了条件チェックリスト

- [ ] `.github/workflows/skill-mirror-sync-check.yml` が作成されており、PR 時に divergence を検出して CI を FAIL させることが確認できる
- [ ] `scripts/check-skill-mirror-sync.sh` が作成されており、binary ファイルを除外してテキストファイルのみを比較する
- [ ] `.husky/pre-commit` から同期チェックスクリプトが呼び出されている
- [ ] artifacts.json の JSON Schema に `canonicalPath` / `mirrorPath` が optional フィールドとして追加されている
- [ ] スキーマ変更による既存 artifacts.json エントリへの後方互換性が保たれている（既存エントリが invalid にならない）
- [ ] README または SKILL.md に「canonical → mirror の同期手順」が記載されている
- [ ] `.claude/skills/` と `.agents/skills/` が同期済みの状態で CI が GREEN になる

## 6. 検証方法

```bash
# divergence を意図的に作成して CI が失敗するか確認
echo "test" >> .claude/skills/task-specification-creator/SKILL.md
# → CI: diff -qr .claude/skills/ .agents/skills/ --exclude='*.png' ... が non-zero を返すこと

# pre-commit フックでも検出されることを確認
git add .claude/skills/task-specification-creator/SKILL.md
git commit -m "test: divergence check"
# → pre-commit フックがエラーを返し、コミットが中断されること

# 同期後は CI が通ること
cp .claude/skills/task-specification-creator/SKILL.md \
   .agents/skills/task-specification-creator/SKILL.md
# → diff -qr が exit 0 を返すこと

# artifacts.json スキーマ検証
# canonicalPath / mirrorPath を追記したエントリでスキーマ検証が通ること
# 既存エントリ（フィールドなし）もスキーマ検証が通ること
```

## 7. リスクと対策

- リスク: `.husky/pre-commit` に追加したチェックが他のフックと競合し、正常なコミットがブロックされる
  - 対策: スクリプトを独立ファイルとして切り出し、失敗時のメッセージを明確にする。`SKIP_SKILL_SYNC_CHECK=1` 環境変数でスキップ可能にする
- リスク: binary ファイルの除外漏れにより CI が誤検知する
  - 対策: `.skillmirrorignore` のような除外設定ファイルを設けて管理し、スクリプト内でファイルから読み込む形にする
- リスク: artifacts.json のスキーマ変更で既存タスク仕様書の検証が壊れる
  - 対策: `canonicalPath` / `mirrorPath` を `required` に含めず、`additionalProperties: false` の範囲外にならないよう定義する。変更前後でスキーマ検証のスモークテストを実行する
- リスク: `.claude/skills/` と `.agents/skills/` 以外のディレクトリに同様の canonical/mirror 構造が増えた場合、チェックスクリプトの管理コストが増大する
  - 対策: チェック対象ディレクトリをスクリプト内の配列変数として管理し、追加が容易な構造にする

## 8. 参照情報

- `.claude/skills/` — canonical スキルディレクトリ
- `.agents/skills/` — mirror スキルディレクトリ
- `docs/30-workflows/unassigned-task/UT-P0-06-CANONICAL-SYNC-001.md` — 関連する同期系タスク仕様書
- `TASK-UIUX-FEEDBACK-001` — 本タスクの起票元
- `.github/workflows/` — 既存 CI ワークフロー群（追加先）
- `.husky/` — 既存 git フック設定（追加先）

## 9. 備考

本タスクは CI/CD 自動化・品質保証系（Low 優先度）。単独で着手可能で、他の実装タスクをブロックしない。

`diff -qr` の binary 除外オプションは OS によって挙動が異なる場合があるため、GitHub Actions (ubuntu-latest) とローカル (macOS) の両環境で動作確認を実施すること。

artifacts.json のスキーマ拡張は本タスクのスコープを最小限にするため、`canonicalPath` / `mirrorPath` の2フィールドのみを対象とする。それ以外のスキーマ変更は別タスクとして切り出すこと。
