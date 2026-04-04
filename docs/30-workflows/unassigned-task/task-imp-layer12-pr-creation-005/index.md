# task-imp-layer12-pr-creation-005: Phase 13 PR作成 for imp-layer12-spec-definition-004

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | task-imp-layer12-pr-creation-005                    |
| タスク名     | Phase 13 PR作成 for imp-layer12-spec-definition-004 |
| 分類         | docs（ドキュメント改善）                            |
| 対象機能     | aiworkflow-requirements / FR-04 verify 契約         |
| 優先度       | 高                                                  |
| 見積もり規模 | 小                                                  |
| ステータス   | 未実施                                              |
| 発見元       | Phase 12完了後のPhase 13未着手状態                  |
| ブランチ     | `docs/task-imp-layer12-spec-definition-004`         |
| タスク分類   | docs-only task（コード変更なし）                    |
| 作成日       | 2026-04-04                                          |

## 目的

`docs/task-imp-layer12-spec-definition-004` ブランチで完了した Phase 1-12 の成果物（check ID 体系仕様書 19 件 + Phase 12 ドキュメント一式）を Pull Request としてマージする。未コミット変更のコミット → PR 作成 → CI 確認 → タスクディレクトリの completed-tasks 移動を行い、タスクを完全に完了させる。

## 背景と依存関係

| 条件                                                    | ステータス                   |
| ------------------------------------------------------- | ---------------------------- |
| Phase 1-12 完了（32/32 PASS）                           | met                          |
| ブランチ `docs/task-imp-layer12-spec-definition-004`    | 存在する                     |
| Phase 12 成果物 6 ファイルが `outputs/phase-12/` に存在 | met                          |
| 未コミット変更が残っている                              | コミットが本タスクの前提作業 |
| ユーザーの明示的 PR 作成許可                            | Phase 13 着手前に確認必須    |

## 実行方針

1. 未コミット変更をすべてコミットしてからPR作成に進む。
2. Phase 12 の 32/32 PASS を根拠に PR 作成の許可確認を行う。
3. ユーザーの許可を得てから `/ai:diff-to-pr` または手動 PR フローを実行する。
4. CI 通過確認後にタスクディレクトリを `completed-tasks/` へ移動する。

## スコープ

### 含むもの

- 未コミット変更のコミット（変更ファイル一覧の確認含む）
- PR 作成（タイトル・本文・Issue リンク）
- CI 通過確認
- タスクディレクトリの `completed-tasks/` 移動
- `outputs/phase-13/pr-info.md` の作成

### 含まないもの

- `SkillCreatorVerificationEngine.ts` のコード変更
- aiworkflow-requirements 仕様への追加変更
- Phase 1-12 成果物の修正

## 受け入れ基準

| ID   | 基準                                                                                     | 検証方法         |
| ---- | ---------------------------------------------------------------------------------------- | ---------------- |
| AC-1 | 未コミット変更がすべてコミットされている                                                 | `git status`     |
| AC-2 | PR が作成されている（PR URL が `pr-info.md` に記録されている）                           | `gh pr view`     |
| AC-3 | CI がすべて通過している                                                                  | `gh pr checks`   |
| AC-4 | `outputs/phase-13/pr-info.md` が作成されている                                           | ファイル存在確認 |
| AC-5 | タスクディレクトリが `completed-tasks/imp-layer12-spec-definition-004/` に移動されている | ディレクトリ確認 |

## 苦戦箇所（実行前に必ず確認）

苦戦箇所の詳細は `lessons-learned.md` を参照。

1. **Phase 5 grep パターン設計の教訓**: 拡張ガイドライン例示の `L2-008` が grep で誤検知され、存在しない check ID の混入と判定された。テーブル行スコープの grep パターンでは「例示値」を除外する設計が必要。
2. **Phase 12 `validate-phase-output` の Phase 11 警告**: docs-only/NON_VISUAL タスクでも Phase 11 の補助証跡 3 点セット（manual-test-checklist / screenshot-plan / placeholder PNG）を最初から用意する。
3. **`artifacts.json` の件数不一致**: Phase 12 成果物が当初 5 件として登録されたが、`phase12-task-spec-compliance-check.md` を追加したため 6 件に増え、root と outputs の両 `artifacts.json` を同期し直す必要が生じた。PR 作成前に 2 ファイルの整合を再確認すること。
4. **`implementation-guide.md` の validator 要件不足**: Part 2 が浅く、TypeScript 型定義・API シグネチャ・使用例・エラーハンドリング・エッジケースが不足していたため `validate-phase12-implementation-guide.js` が fail した。PR 作成前に validator を再実行して PASS を確認すること。

## Phase 構成

| Phase | 名称   | カテゴリ | 概要                     |
| ----- | ------ | -------- | ------------------------ |
| 13    | PR作成 | 完了     | コミット・PR作成・CI確認 |

## 依存関係

```
Phase 12（PASS 確認済み）→ 未コミット変更のコミット → Phase 13 PR作成
```

## 参照資料

| 資料名                      | パス                                                                                    |
| --------------------------- | --------------------------------------------------------------------------------------- |
| 元タスク仕様書 index.md     | `docs/30-workflows/imp-layer12-spec-definition-004/index.md`                            |
| Phase 12 成果物             | `docs/30-workflows/imp-layer12-spec-definition-004/outputs/phase-12/`                   |
| Phase 13 仕様書（元タスク） | `docs/30-workflows/imp-layer12-spec-definition-004/phase-13-pr-creation.md`             |
| artifacts.json（root）      | `docs/30-workflows/imp-layer12-spec-definition-004/artifacts.json`                      |
| artifacts.json（outputs）   | `docs/30-workflows/imp-layer12-spec-definition-004/outputs/artifacts.json`              |
| 苦戦箇所詳細                | `docs/30-workflows/unassigned-task/task-imp-layer12-pr-creation-005/lessons-learned.md` |
| ai:diff-to-pr スキル        | `.claude/skills/` 配下の `ai:diff-to-pr`                                                |

## Phase 仕様書リンク

| Phase | 名称   | ファイル                                           |
| ----- | ------ | -------------------------------------------------- |
| 13    | PR作成 | [phase-13-pr-creation.md](phase-13-pr-creation.md) |

## artifacts.json 整合確認チェックリスト

PR 作成前に以下を確認する:

- [ ] `docs/30-workflows/imp-layer12-spec-definition-004/artifacts.json` の Phase 12 artifacts が 6 件（苦戦箇所 3 の対応）
- [ ] `docs/30-workflows/imp-layer12-spec-definition-004/outputs/artifacts.json` の Phase 12 artifacts が 6 件（同上）
- [ ] `validate-phase12-implementation-guide.js` が PASS している（苦戦箇所 4 の対応）
- [ ] `validate-phase-output.js docs/30-workflows/imp-layer12-spec-definition-004` が 32/32 PASS のままである
