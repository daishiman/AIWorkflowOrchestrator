# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 |
| Phase      | 13                                      |
| 名称       | PR作成                                  |
| 前提Phase  | Phase 12（ドキュメント — 全タスク完了） |
| 次Phase    | なし（最終Phase）                       |
| ステータス | pending                                 |

## 目的

Phase 1〜12 の全成果物を最終確認し、PR作成の準備を行う。ユーザーの明示的な許可を得た上でPRを作成する。

## 参照資料

| 資料                                    | パス / リンク                                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Phase 12 ドキュメント                   | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-12-documentation.md`                   |
| Phase 12 実装ガイド                     | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/outputs/phase-12/implementation-guide.md`    |
| Phase 12 documentation-changelog        | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/outputs/phase-12/documentation-changelog.md` |
| Phase 12 未タスクレポート               | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/outputs/phase-12/unassigned-task-report.md`  |
| Phase 2 設計                            | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-2-design.md`                           |
| Phase 5 実装                            | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-5-implementation.md`                   |
| Phase 6 テスト拡充                      | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-6-test-expansion.md`                   |
| Phase 7 カバレッジ確認                  | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-7-coverage-check.md`                   |
| Phase 8 リファクタリング                | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-8-refactoring.md`                      |
| Phase 9 品質検証                        | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-9-quality-assurance.md`                |
| Phase 10 最終レビュー                   | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-10-final-review.md`                    |
| Phase 11 手動テスト                     | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-11-manual-test.md`                     |
| Git & ツーリングルール（PR 作成ルール） | `.claude/rules/07-git-and-tooling.md`                                                                   |
| index.md（Phase一覧）                   | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/index.md`                                    |
| artifacts.json                          | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/artifacts.json`                              |

## 実行タスク

- 実行タスク一覧: 本Phaseで定義したTaskを上から順に実施する

### Task 1: 全 Phase ステータス確認

`artifacts.json` の全 Phase ステータスが `completed` であることを確認する。

| Phase | 名称             | 期待ステータス |
| ----- | ---------------- | -------------- |
| 1     | 要件定義         | completed      |
| 2     | 設計             | completed      |
| 3     | 設計レビュー     | completed      |
| 4     | テスト作成       | completed      |
| 5     | 実装             | completed      |
| 6     | テスト拡充       | completed      |
| 7     | カバレッジ確認   | completed      |
| 8     | リファクタリング | completed      |
| 9     | 品質検証         | completed      |
| 10    | 最終レビュー     | completed      |
| 11    | 手動テスト       | completed      |
| 12    | ドキュメント     | completed      |
| 13    | PR作成           | in_progress    |

### Task 2: 成果物の最終確認チェックリスト

#### 2.1 コード成果物

| #   | 成果物                                               | 確認内容                                        | 確認  |
| --- | ---------------------------------------------------- | ----------------------------------------------- | ----- |
| 1   | `scripts/check-shared-module-sync.ts`                | ファイルが存在し、5段階チェックが実装されている | - [ ] |
| 2   | `scripts/__tests__/check-shared-module-sync.test.ts` | テストファイルが存在し、全テストが PASS する    | - [ ] |
| 3   | `.github/workflows/ci.yml`                           | `check-module-sync` ジョブが追加されている      | - [ ] |

#### 2.2 ドキュメント成果物

| #   | 成果物                  | 確認内容                                    | 確認  |
| --- | ----------------------- | ------------------------------------------- | ----- |
| 1   | 実装ガイド              | Part 1（概念説明）+ Part 2（実装詳細）あり  | - [ ] |
| 2   | documentation-changelog | 全 Step の完了結果が記録されている          | - [ ] |
| 3   | 未タスクレポート        | 検出結果が記録されている（0件でも作成済み） | - [ ] |
| 4   | LOGS.md（2ファイル）    | 両方更新済み                                | - [ ] |
| 5   | SKILL.md（2ファイル）   | 変更履歴が更新済み                          | - [ ] |
| 6   | topic-map.md            | 再生成済み                                  | - [ ] |

#### 2.3 Phase 出力成果物

| Phase | 出力ディレクトリ   | 成果物                                                                         | 確認  |
| ----- | ------------------ | ------------------------------------------------------------------------------ | ----- |
| 5     | `outputs/phase-5`  | test-results-green.md                                                          | - [ ] |
| 6     | `outputs/phase-6`  | test-expansion-results.md                                                      | - [ ] |
| 7     | `outputs/phase-7`  | coverage-report.md                                                             | - [ ] |
| 8     | `outputs/phase-8`  | refactoring-report.md                                                          | - [ ] |
| 9     | `outputs/phase-9`  | quality-report.md                                                              | - [ ] |
| 10    | `outputs/phase-10` | review-report.md                                                               | - [ ] |
| 11    | `outputs/phase-11` | manual-test-report.md                                                          | - [ ] |
| 12    | `outputs/phase-12` | implementation-guide.md, documentation-changelog.md, unassigned-task-report.md | - [ ] |

### Task 3: 最終品質チェック

PR作成前の最終品質チェックを実行する。

```bash
# Lint
pnpm lint

# 型チェック
pnpm typecheck

# テスト
pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts

# チェックスクリプト実行
pnpm tsx scripts/check-shared-module-sync.ts
```

| #   | チェック                         | 期待結果    |
| --- | -------------------------------- | ----------- |
| 1   | `pnpm lint` が PASS する         | exit code 0 |
| 2   | `pnpm typecheck` が PASS する    | exit code 0 |
| 3   | 全テストが PASS する             | FAIL 0 件   |
| 4   | チェックスクリプトが正常終了する | exit code 0 |

### Task 4: index.md の更新

`index.md` の Phase 一覧テーブルの全 Phase ステータスを `completed` に更新する。

### Task 5: artifacts.json の最終更新

`artifacts.json` の Phase 13 ステータスを `completed` に更新し、`lastUpdated` を現在日時に設定する。

### Task 6: PR 作成準備

> **ユーザーの明示的な許可を待つ**: PR 作成はユーザーが許可するまで実行しない。

#### PR タイトル

```
feat(ci): @repo/shared モジュール解決3層整合CIガード追加 (#845)
```

#### PR 本文テンプレート

```markdown
## Summary

- `exports` / `typesVersions` / `paths` / `vitest alias` の4設定間整合性を5段階チェックで検証するCIガードスクリプト `scripts/check-shared-module-sync.ts` を追加
- `.github/workflows/ci.yml` に `check-module-sync` ジョブを追加し、PRステージで不整合を早期検出
- TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 で発生した228件のTS2307エラーの再発を防止

## Test plan

- [ ] `pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts` — 全テスト PASS
- [ ] `pnpm tsx scripts/check-shared-module-sync.ts` — exit code 0（整合状態）
- [ ] `exports` に架空サブパスを追加 → exit code 1（不整合検出）
- [ ] 架空サブパスを元に戻す → exit code 0（復帰確認）
- [ ] `pnpm lint` — PASS
- [ ] `pnpm typecheck` — PASS

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

#### PR 作成コマンド（ユーザー許可後に実行）

```bash
gh pr create --title "feat(ci): @repo/shared モジュール解決3層整合CIガード追加 (#845)" --body "$(cat <<'EOF'
## Summary

- `exports` / `typesVersions` / `paths` / `vitest alias` の4設定間整合性を5段階チェックで検証するCIガードスクリプト `scripts/check-shared-module-sync.ts` を追加
- `.github/workflows/ci.yml` に `check-module-sync` ジョブを追加し、PRステージで不整合を早期検出
- TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 で発生した228件のTS2307エラーの再発を防止

## Test plan

- [ ] `pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts` — 全テスト PASS
- [ ] `pnpm tsx scripts/check-shared-module-sync.ts` — exit code 0（整合状態）
- [ ] `exports` に架空サブパスを追加 → exit code 1（不整合検出）
- [ ] 架空サブパスを元に戻す → exit code 0（復帰確認）
- [ ] `pnpm lint` — PASS
- [ ] `pnpm typecheck` — PASS

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## 実行手順

1. `artifacts.json` で全 Phase (1-12) が `completed` であることを確認する（Task 1）
2. 成果物の最終確認チェックリストを実施する（Task 2）
3. 最終品質チェックを実行する（Task 3）
4. `index.md` の Phase ステータスを更新する（Task 4）
5. `artifacts.json` の Phase 13 ステータスを `completed` に更新する（Task 5）
6. ユーザーに PR 作成の許可を求める（Task 6）
7. 許可を得た後、PR を作成する

---

## 成果物

| #   | 成果物                  | パス                                                                       |
| --- | ----------------------- | -------------------------------------------------------------------------- |
| 1   | 更新済み index.md       | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/index.md`       |
| 2   | 更新済み artifacts.json | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/artifacts.json` |
| 3   | PR（ユーザー許可後）    | GitHub PR URL                                                              |

---

## 完了条件

- [ ] 全 Phase (1-12) が `artifacts.json` で `completed` ステータスである
- [ ] コード成果物（スクリプト、テスト、CIワークフロー）が全て存在する
- [ ] ドキュメント成果物（実装ガイド、changelog、未タスクレポート、LOGS.md、SKILL.md、topic-map.md）が全て存在する
- [ ] Phase 出力成果物（outputs/phase-5 〜 phase-12）が全て存在する
- [ ] 最終品質チェック（lint、typecheck、テスト、スクリプト実行）が全て PASS している
- [ ] `index.md` の全 Phase ステータスが `completed` に更新されている
- [ ] `artifacts.json` の Phase 13 ステータスが `completed` に更新されている
- [ ] `artifacts.json` の `lastUpdated` が現在日時に更新されている
- [ ] ユーザーの許可を得た上で PR が作成されている（または PR 作成準備が完了している）

## 次Phase

なし（最終Phase）。タスク TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 は本 Phase の完了をもって完了する。
