# Phase 13: PR作成 - TASK-P0-07 ハードコードされた AGENT_NAMES の動的解決

## メタ情報

| 項目      | 値                                                      |
| --------- | ------------------------------------------------------- |
| Phase     | 13                                                      |
| Phase名   | PR作成                                                  |
| 機能名    | TASK-P0-07-hardcoded-agent-names-dynamic-resolution     |
| 作成日    | 2026-04-06                                              |
| タスクID  | TASK-P0-07                                              |
| カテゴリ  | NON_VISUAL（UI変更なし、Main Process リファクタリング） |
| 前提Phase | Phase 12: ドキュメント更新                              |
| 後続Phase | なし（本タスク完了）                                    |

---

## 目的

TASK-P0-07 の全成果物を Pull Request として作成し、CI パイプラインでの検証を完了させる。ユーザーの明示的な承認なしに commit や PR 作成を行わないことを厳守する。CI 通過後にタスクディレクトリを `completed-tasks` に移動する。

---

## 実行タスク

- タスク1: Phase 12 完了根拠の確認
- タスク2: ローカル品質チェック
- タスク3: 変更サマリー作成
- タスク4: ユーザー承認の取得
- タスク5: Blocked 状態の確認
- タスク6: /ai:diff-to-pr によるコミット・PR作成
- タスク7: CI/CD 確認
- タスク8: タスクディレクトリの移動

---

## 参照資料

| 資料名                | パス/参照先                                                                                                                                                                                                                                   | 用途                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Phase 11 テスト結果   | `outputs/phase-11/manual-test-result.md`                                                                                                                                                                                                      | 代替エビデンス確認    |
| Phase 12 ドキュメント | `outputs/phase-12/implementation-guide.md` / `outputs/phase-12/system-spec-update-summary.md` / `outputs/phase-12/documentation-changelog.md` / `outputs/phase-12/unassigned-task-detection.md` / `outputs/phase-12/skill-feedback-report.md` | 完了根拠              |
| Git操作禁止事項       | `CLAUDE.md`                                                                                                                                                                                                                                   | --no-verify禁止ルール |
| /ai:diff-to-pr スキル | `/ai:diff-to-pr`                                                                                                                                                                                                                              | PR作成ワークフロー    |

---

## 実行手順

### タスク1: Phase 12 完了根拠の確認

**目的**: PR 作成の前提条件として、Phase 12 までの全成果物が完了していることを確認する。

**チェックリスト**:

| Phase    | 完了確認 | 根拠ファイル / 確認方法                         |
| -------- | -------- | ----------------------------------------------- |
| Phase 1  | 未確認   | `phase-1-requirements.md`                       |
| Phase 2  | 未確認   | `phase-2-design.md`                             |
| Phase 3  | 未確認   | `phase-3-design-review.md`                      |
| Phase 4  | 未確認   | テストコード                                    |
| Phase 5  | 未確認   | 実装コード（manifestResourceResolver.ts）       |
| Phase 6  | 未確認   | 実装コード（RuntimeSkillCreatorFacade.ts 変更） |
| Phase 7  | 未確認   | リファクタリング結果                            |
| Phase 8  | 未確認   | 統合テスト結果                                  |
| Phase 9  | 未確認   | コードレビュー結果                              |
| Phase 10 | 未確認   | 最終レビューゲート結果                          |
| Phase 11 | 未確認   | `outputs/phase-11/manual-test-result.md`        |
| Phase 12 | 未確認   | `outputs/phase-12/` 配下の全成果物              |

Phase 12 の完了条件が全て満たされていない場合は、Phase 12 に戻って不足分を補完する。

---

### タスク2: ローカル品質チェック

**目的**: CI に送る前にローカル環境で品質チェックを実施し、CI 失敗を未然に防ぐ。

**実行コマンド**:

```bash
# TypeScript型チェック
pnpm --filter @repo/desktop typecheck

# ESLintチェック
pnpm --filter @repo/desktop lint

# 対象テスト実行
pnpm --filter @repo/desktop test RuntimeSkillCreatorFacade
pnpm --filter @repo/desktop test manifestResourceResolver

# .claude / .agents mirror parity 確認
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements

# 全テスト実行（オプション、時間に余裕がある場合）
pnpm --filter @repo/desktop test
```

**結果記録テーブル**:

| チェック項目              | コマンド                                                                                                                                                                                 | 結果   | エラー数 | 備考 |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------- | ---- |
| TypeScript型チェック      | `pnpm --filter @repo/desktop typecheck`                                                                                                                                                  | 未実施 | -        | -    |
| ESLint                    | `pnpm --filter @repo/desktop lint`                                                                                                                                                       | 未実施 | -        | -    |
| RuntimeSkillCreatorFacade | `pnpm --filter @repo/desktop test RuntimeSkillCreatorFacade`                                                                                                                             | 未実施 | -        | -    |
| manifestResourceResolver  | `pnpm --filter @repo/desktop test manifestResourceResolver`                                                                                                                              | 未実施 | -        | -    |
| Mirror parity             | `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator && diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` | 未実施 | -        | -    |

エラーが検出された場合は修正してから再実行する。全チェックが Pass するまでタスク3に進まない。

**出力先**: `outputs/phase-13/local-check-result.md`

---

### タスク3: 変更サマリー作成

**目的**: PR の本文に使用する変更サマリーを作成する。

**実行手順**:

1. `git diff main --stat` で変更ファイル一覧を取得する
2. `git diff main --shortstat` で変更行数サマリーを取得する
3. 以下の形式で `outputs/phase-13/change-summary.md` を作成する

**記載内容**:

- 概要: manifest を主正本としたエージェントリソース動的解決リファクタリング
- 変更統計: ファイル数・追加行数・削除行数
- 主要変更ファイル一覧（git diff から取得）
- 関連タスク: TASK-P0-03, TASK-P0-04, TASK-P0-05 との関係
- 未タスク: Phase 12 Task 12-4 で検出されたもの

**出力先**: `outputs/phase-13/change-summary.md`

---

### タスク4: ユーザー承認の取得

**目的**: commit / PR 作成の前にユーザーの明示的な承認を得る。

**重要**: このタスクはユーザーとの対話が必要であり、自動実行してはならない。

**承認リクエスト時に提示する情報**:

1. ローカルチェック結果（タスク2）
2. 変更サマリー（タスク3）
3. Phase 12 完了根拠（タスク1）
4. blocked の有無（タスク5参照）

**承認記録**:

| 項目        | 内容                            |
| ----------- | ------------------------------- |
| 承認日時    | （ユーザー承認後に記入）        |
| 承認者      | （ユーザー名）                  |
| 承認方法    | 対話での明示承認                |
| blocked理由 | なし / （ある場合は理由を記載） |

---

### タスク5: Blocked 状態の確認

**目的**: PR 作成をブロックする要因がないかを確認する。

**ブロック要因チェック**:

| #    | ブロック要因                                  | 状態   | 対応                                        |
| ---- | --------------------------------------------- | ------ | ------------------------------------------- |
| B-01 | ローカルチェック（typecheck/lint/test）に失敗 | 未確認 | 失敗時は Phase 4-8 に戻って修正             |
| B-02 | Phase 11 で Critical 問題が検出されている     | 未確認 | Critical 問題が残っている場合は PR 作成不可 |
| B-03 | Phase 12 の完了条件が未達成                   | 未確認 | 未達成の場合は Phase 12 に戻って補完        |
| B-04 | ユーザー承認が得られていない                  | 未確認 | 承認なしでは commit / PR 作成を行わない     |

全ブロック要因がクリアされた場合のみ、タスク6に進む。

---

### タスク6: /ai:diff-to-pr によるコミット・PR作成

**目的**: 承認後、/ai:diff-to-pr スキルを使用して変更を commit し Pull Request を作成する。

**前提**: タスク4のユーザー承認が得られていること。

**PR タイトル**:

```
refactor(runtime): TASK-P0-07 AGENT_NAMES 動的解決（manifest 優先 + 静的フォールバック）
```

**PR 作成手順**:

1. `/ai:diff-to-pr` を実行する
2. PR タイトルとして上記を使用する
3. PR 本文に以下を含める:
   - Summary: manifest を主正本としたエージェントリソース動的解決
   - 主要変更点: buildPhaseResourceRequestsFromManifest() 新規追加、Facade の plan()/improve() 動的パス変更
   - テスト: Phase 11 自動テスト結果（NON_VISUAL タスク）
   - 関連 Issue

**PR 情報を `outputs/phase-13/pr-info.md` に記録する**:

| 項目           | 内容             |
| -------------- | ---------------- |
| PR番号         | （作成後に記入） |
| PR URL         | （作成後に記入） |
| ブランチ       | （ブランチ名）   |
| ベースブランチ | main             |
| 作成日時       | （作成後に記入） |

---

### タスク7: CI/CD 確認

**目的**: PR に対する CI パイプラインの実行結果を確認する。

**確認コマンド**:

```bash
# CI実行状況の確認
gh pr checks <PR番号>

# CI失敗時の詳細確認
gh run view <run-id> --log-failed
```

**CI 確認項目**:

| #     | チェック             | 期待結果 | 実行結果 |
| ----- | -------------------- | -------- | -------- |
| CI-01 | TypeScript型チェック | Pass     | 未確認   |
| CI-02 | ESLint               | Pass     | 未確認   |
| CI-03 | Vitest テスト        | Pass     | 未確認   |
| CI-04 | ビルド               | Pass     | 未確認   |

**CI 失敗時の対応**:

1. 失敗ログを確認する
2. ローカルで再現・修正する
3. 追加コミットをプッシュする（`--no-verify` は使用禁止）
4. CI の再実行を確認する

---

### タスク8: タスクディレクトリの移動

**目的**: CI 通過後、タスクディレクトリを `completed-tasks` に移動する。

**前提**: タスク7で CI が全て Pass していること。

**実行コマンド**:

```bash
# タスクディレクトリを completed-tasks に移動
mv docs/30-workflows/TASK-P0-07-hardcoded-agent-names-dynamic-resolution \
   docs/30-workflows/completed-tasks/TASK-P0-07-hardcoded-agent-names-dynamic-resolution
```

**注意**: この移動は追加コミットとして作成し、PR に含める。

---

## 統合テスト連携

Phase 13 では新規の統合テストは実施しないが、以下を確認する:

- **CI上のテスト**: CI パイプラインに含まれるテストが全て Pass していることを確認
- **Phase 11 自動テスト結果の反映**: PR 本文に Phase 11 の自動テスト結果（RuntimeSkillCreatorFacade / manifestResourceResolver）が記載されていることを確認
- **型安全性**: CI 環境でのビルドが成功し、新規インターフェース `buildPhaseResourceRequestsFromManifest` の型エラーがないことを確認

---

## 成果物

| 成果物               | パス                                     | 説明                           |
| -------------------- | ---------------------------------------- | ------------------------------ |
| ローカルチェック結果 | `outputs/phase-13/local-check-result.md` | typecheck/lint/test の実行結果 |
| 変更サマリー         | `outputs/phase-13/change-summary.md`     | 変更ファイル・行数・概要       |
| PR情報               | `outputs/phase-13/pr-info.md`            | PR番号・URL・ブランチ情報      |

---

## 完了条件

- [ ] Phase 12 までの全成果物が完了条件を満たしている
- [ ] ローカルチェック（typecheck, lint, test）が全て Pass している
- [ ] `outputs/phase-13/local-check-result.md` にチェック結果が記録されている
- [ ] `outputs/phase-13/change-summary.md` に変更サマリーが記録されている
- [ ] blocked 要因が全てクリアされている
- [ ] ユーザーの明示的な承認が得られている
- [ ] /ai:diff-to-pr によりコミット・PR が作成されている（`--no-verify` 不使用）
- [ ] PR タイトルが `refactor(runtime): TASK-P0-07 AGENT_NAMES 動的解決（manifest 優先 + 静的フォールバック）` である
- [ ] PR が作成され、PR番号が `outputs/phase-13/pr-info.md` に記録されている
- [ ] CI パイプラインが全て Pass している
- [ ] CI 失敗がある場合は修正コミットで解消されている
- [ ] CI 通過後にタスクディレクトリが `completed-tasks` に移動されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

完了。本 Phase の完了をもって TASK-P0-07（ハードコードされた AGENT_NAMES の動的解決）は完了となる。

### 後続タスクへの引き継ぎ

- **TASK-P0-03（manifest 配置）**: manifest の phases/resources 構造が TASK-P0-07 の動的解決で使用されていることを記録。manifest 構造変更時には `buildPhaseResourceRequestsFromManifest` の変換ロジックへの影響を確認すること。
- **将来の phase 拡張（execute/verify/requirements-gathering）**: `buildPhaseResourceRequestsFromManifest` は phaseId をパラメータとして受け取るため、新規 phase の動的解決にも再利用可能。拡張時は `fallback` パラメータに対応する静的定数を追加すること。
