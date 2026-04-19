# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 13                                        |
| タスクID   | TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 |
| 機能名     | gitattributes-merge-union-reeval          |
| 前提Phase  | Phase 12                                  |
| 後続Phase  | -                                         |
| 作成日     | 2026-04-19                                |
| ステータス | blocked                                   |

## 目的

ユーザーの明示承認がある場合に限り、ローカル確認結果と変更サマリーを整理し、PR 情報の draft を作成できる状態にする。本 Phase はユーザー承認がない限り `blocked` のまま閉じる骨格 Phase である。

## 背景

このワークフローでは commit / push / PR 作成はユーザー指示があるまで禁止である。本タスクは `.gitattributes` と `.claude/scripts/setup-merge-drivers.sh` の設定変更タスクであり、コード差分は含まれないが、Git の挙動変更を伴うため PR レビュー時には Phase 11 の手動シミュレーション結果と Phase 12 の実装ガイドを必ず添付する。`--no-verify` の使用は禁止（CLAUDE.md 準拠）。

## 実行タスク

### タスク0: ローカル確認

**目的**: PR 提出前に作業ディレクトリの状態を確認し、想定外の差分が混入していないことを保証する。

**実行手順**:

1. `git status` で変更対象が `.gitattributes` と `docs/30-workflows/gitattributes-merge-union-reeval-001/**` のみであることを確認する。
2. `git diff -- .gitattributes` で意図したパターン精緻化のみが含まれていることを確認する。
3. `pnpm typecheck` は対象外（設定ファイルのみ）であることを `local-check-result.md` に明記する。
4. `pnpm lint` も対象外（TypeScript / TSX 未変更）であることを併記する。
5. `git check-attr merge` を代表 3 ファイル（構造化・append-only・indexes）で実行し、ログを添付する。

**期待される成果物**:

- `outputs/phase-13/local-check-result.md`

### タスク1: 変更サマリー作成

**目的**: PR 本文用の変更要旨を整理する。

**実行手順**:

1. 変更ファイル一覧を `change-summary.md` に整理する。
   - 修正: `.gitattributes`
   - 修正（必要な場合のみ）: `.claude/scripts/setup-merge-drivers.sh`
   - 追加: `docs/30-workflows/gitattributes-merge-union-reeval-001/**`
2. before / after の `merge=union` 適用範囲を 1 表で示す。
3. リスク（マージ挙動変更）と検証根拠（Phase 11 MT-01〜MT-05）を併記する。

**期待される成果物**:

- `outputs/phase-13/change-summary.md`

### タスク2: PR 本文 draft 作成

**目的**: ユーザー承認後すぐに PR 化できる draft を整える。

**実行手順**:

1. PR タイトルを以下に固定する。
   - `refactor(gitattributes): TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 references/*.md merge=union 長期リスク再評価・Phase12完了`
2. PR 本文に以下のセクションを含める。
   - **背景**: `merge=union` を `references/*.md` に一律適用することで構造化ドキュメントが破損する長期リスク
   - **変更内容**: `.gitattributes` のパターン精緻化、append-only / 構造化の分類整理
   - **テスト結果**: Phase 11 MT-01〜MT-05 の実測サマリー
   - **関連 Issue**: #2281
   - **Co-Authored-By**: `Claude Opus 4.7 <noreply@anthropic.com>`
3. `pr-info.md` に上記 draft を保存する（実 PR 化はユーザー承認後）。

**期待される成果物**:

- `outputs/phase-13/pr-info.md`

### タスク3: PR 作成ガイド

**目的**: ユーザー承認後の PR 作成手順を曖昧さなく残す。

**実行手順**:

1. `gh pr create` のコマンド例を `pr-info.md` 末尾に記載する（HEREDOC 形式で本文を渡す例）。
2. `--no-verify` 禁止（CLAUDE.md 準拠）を明示し、pre-commit / pre-push フックが失敗した場合の対処（修正して NEW commit）を併記する。
3. ベースブランチを `main` とすることを明記する。

**期待される成果物**:

- `outputs/phase-13/pr-info.md`（タスク2 と同一ファイルへ追記）

### タスク4: PR 作成後の post-merge 確認手順

**目的**: マージ後に必要な後続アクションを残し、Step 1-A の同期漏れを防ぐ。

**実行手順**:

1. CI 結果（GitHub Actions）の確認手順を `pr-info.md` 末尾に追記する。
2. 関連タスク（TASK-CONFLICT-PREVENT-001）の Step 1-A への参照追記が反映されたことを `gh issue view` 等で確認する手順を併記する。
3. mirror parity 後検証（`.claude/` と `.agents/` 双方の LOGS.md 反映）の確認手順を残す。

**期待される成果物**:

- `outputs/phase-13/pr-info.md`（タスク2 / 3 と同一ファイルへ追記）

## 参照資料

| 参照資料                  | パス                                                                             | 内容                |
| ------------------------- | -------------------------------------------------------------------------------- | ------------------- |
| Phase 13 テンプレート     | `.claude/skills/task-specification-creator/references/phase-template-phase13.md` | blocked Phase 骨格  |
| Phase 11 手動テスト結果   | `outputs/phase-11/manual-test-result.md`                                         | NON_VISUAL evidence |
| Phase 12 実装ガイド       | `outputs/phase-12/implementation-guide.md`                                       | PR 説明補強         |
| Phase 12 準拠チェック     | `outputs/phase-12/phase12-task-spec-compliance-check.md`                         | close-out 根拠      |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                                        | PR 前提の判定根拠   |
| `.gitattributes`          | `.gitattributes`                                                                 | 主変更対象          |
| プロジェクト規約          | `CLAUDE.md`                                                                      | `--no-verify` 禁止  |
| 元 Issue                  | <https://github.com/daishiman/AIWorkflowOrchestrator/issues/2281>                | 関連 Issue リンク先 |

## 成果物

| 成果物           | パス                                     | 内容                                           |
| ---------------- | ---------------------------------------- | ---------------------------------------------- |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | git status / diff / check-attr ログ            |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | 変更ファイル一覧 + before/after 表             |
| PR 情報          | `outputs/phase-13/pr-info.md`            | PR title / 本文 draft / gh コマンド例 / 後検証 |

## 統合テスト連携【必須】

| 判定項目                                                           | 基準 | 結果    |
| ------------------------------------------------------------------ | ---- | ------- |
| ステータスが `blocked` であり PR を実行していない                  | 完了 | pending |
| `local-check-result.md` に対象外チェック（typecheck/lint）が明記   | 完了 | pending |
| PR タイトルが指定文言と一致している                                | 完了 | pending |
| `--no-verify` 禁止が PR ガイドに明記されている                     | 完了 | pending |
| post-merge 後検証手順（CI / 関連タスク同期 / mirror parity）が残る | 完了 | pending |

## 完了条件

- [ ] ステータスが `blocked` のままユーザー承認待ちで保持されている
- [ ] `local-check-result.md` に `git status` / `git diff` / `git check-attr` 結果が記録されている
- [ ] `change-summary.md` に変更ファイル一覧と before / after 表が記録されている
- [ ] `pr-info.md` に指定の PR タイトルと本文 draft（背景 / 変更内容 / テスト結果 / 関連 Issue / Co-Authored-By）が含まれている
- [ ] `pr-info.md` に `gh pr create` のコマンド例と `--no-verify` 禁止注意が含まれている
- [ ] `pr-info.md` に post-merge 確認手順（CI / 関連タスク Step 1-A 同期 / mirror parity）が含まれている
- [ ] PR 作成・push は実施していない
