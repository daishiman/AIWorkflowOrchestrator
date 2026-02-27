# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase番号  | 13                                                  |
| Phase名    | PR作成                                              |
| 目的       | 全Phase成果物を確認し、PRを作成してCIパスを確認する |
| 前提Phase  | Phase 12（ドキュメント更新）                        |
| 後続Phase  | なし（タスク完了）                                  |
| ステータス | 未実施                                              |
| 作成日     | 2026-02-27                                          |
| 機能名     | skill-share                                         |

---

## 目的

TASK-9F「スキル共有・インポート機能」の全変更をコミットし、PRを作成してCIの通過を確認する。PRのマージはユーザーがGitHub UIで手動実行する。

---

## 実行タスク

- PR作成前チェック: lint・typecheck・テスト・Phase 12全タスク完了を確認
- ブランチ・コミット準備: ブランチ名確認、変更ファイル確認、コミットメッセージ作成
- PR作成: `/ai:diff-to-pr` スキルでPR作成
- CI確認: CIパイプラインの全ジョブが通過することを確認
- タスク完了処理: ディレクトリ移動、artifacts.json更新

---

## 参照資料

| 参照資料                 | パス                                                         | 内容                   |
| ------------------------ | ------------------------------------------------------------ | ---------------------- |
| Phase 1 要件定義         | `docs/30-workflows/skill-share/phase-1-requirements.md`      | 実装完了判定の基準     |
| Phase 2 設計             | `docs/30-workflows/skill-share/phase-2-design.md`            | 設計整合性の確認       |
| Phase 5 実装仕様         | `docs/30-workflows/skill-share/phase-5-implementation.md`    | 実装内容の最終確認     |
| Phase 6 テスト拡充       | `docs/30-workflows/skill-share/phase-6-test-expansion.md`    | 統合テスト拡張の証跡   |
| Phase 7 カバレッジ確認   | `docs/30-workflows/skill-share/phase-7-coverage-check.md`    | カバレッジ達成状況     |
| Phase 8 リファクタリング | `docs/30-workflows/skill-share/phase-8-refactoring.md`       | 品質改善の実施記録     |
| Phase 9 品質保証         | `docs/30-workflows/skill-share/phase-9-quality-assurance.md` | 品質ゲート結果         |
| Phase 10 最終レビュー    | `docs/30-workflows/skill-share/phase-10-final-review.md`     | リリース可否判定       |
| Phase 11 手動テスト      | `docs/30-workflows/skill-share/phase-11-manual-test.md`      | 手動検証結果           |
| 実装コード（新規）       | `apps/desktop/src/main/services/skill/SkillShareManager.ts`  | メインの実装ファイル   |
| 共有型定義（新規）       | `packages/shared/src/types/skill-share.ts`                   | 型定義ファイル         |
| 型定義インデックス       | `packages/shared/src/types/index.ts`                         | re-export更新          |
| IPCハンドラ              | `apps/desktop/src/main/ipc/skillHandlers.share.ts`           | ハンドラ登録           |
| Preloadチャネル          | `apps/desktop/src/preload/channels.ts`                       | チャネル定数           |
| Preload API              | `apps/desktop/src/preload/skill-api.ts`                      | Renderer向けAPI        |
| Preload型定義            | `apps/desktop/src/preload/types.ts`                          | Preload層型定義        |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`                   | 変更内容のドキュメント |
| 全Phase成果物            | `outputs/phase-*/`                                           | 全成果物               |

---

## システム仕様（aiworkflow-requirements）

| 仕様書                          | 確認内容                                                       |
| ------------------------------- | -------------------------------------------------------------- |
| `task-workflow.md`              | TASK-9Fの完了ステータスが記録されていること                    |
| `api-ipc-agent.md`              | 新規3チャネル契約が仕様と一致していること                      |
| `interfaces-agent-sdk-skill.md` | ShareTarget/ImportResult/ExportResult型が同期されていること    |
| `security-skill-ipc.md`         | Sender/P42バリデーション要件が反映済みであること               |
| `quality-requirements.md`       | 品質ゲート（テスト/型/カバレッジ）達成が仕様と一致していること |

---

## 実行手順

### Task 1: PR作成前チェック

以下の全項目がパスすることを確認する。1つでも失敗する場合はPR作成に進まない。

| #   | チェック項目            | コマンド                             | 合格基準                         |
| --- | ----------------------- | ------------------------------------ | -------------------------------- |
| 1   | ESLint                  | `pnpm lint`                          | エラー0件                        |
| 2   | TypeScript型チェック    | `pnpm typecheck`                     | エラー0件                        |
| 3   | 全テスト                | `pnpm --filter @repo/desktop test`   | 全テストパス                     |
| 4   | shared パッケージビルド | `pnpm --filter @repo/shared build`   | ビルド成功                       |
| 5   | Phase 12全タスク完了    | Phase 12の完了条件チェックリスト確認 | 全項目チェック済み               |
| 6   | `--no-verify` 未使用    | git log確認                          | `--no-verify` が使用されていない |

### Task 2: ブランチ・コミット準備

#### ブランチ名

```
feature/task-9f-skill-share
```

#### 変更ファイル一覧確認

```bash
git diff --stat main...HEAD
```

**期待される変更ファイル**:

| カテゴリ     | ファイル                                                         | 変更種別  |
| ------------ | ---------------------------------------------------------------- | --------- |
| 新規実装     | `apps/desktop/src/main/services/skill/SkillShareManager.ts`      | 新規      |
| 新規型定義   | `packages/shared/src/types/skill-share.ts`                       | 新規      |
| 型定義更新   | `packages/shared/src/types/index.ts`                             | 修正      |
| IPCハンドラ  | `apps/desktop/src/main/ipc/skillHandlers.share.ts`               | 修正      |
| チャネル定数 | `apps/desktop/src/preload/channels.ts`                           | 修正      |
| Preload API  | `apps/desktop/src/preload/skill-api.ts`                          | 修正      |
| Preload型    | `apps/desktop/src/preload/types.ts`                              | 修正      |
| テスト       | `apps/desktop/src/main/services/skill/SkillShareManager.test.ts` | 新規      |
| 仕様書       | `docs/30-workflows/skill-share/**`                               | 新規/修正 |
| システム仕様 | `.claude/skills/aiworkflow-requirements/references/**`           | 修正      |

#### コミットメッセージ

Conventional Commits形式を使用する。

```
feat(skill): スキル共有・インポート/エクスポート機能実装

- GitHub/Gist/URL/ローカルからのスキルインポート機能を追加
- Gist/ローカルへのスキルエクスポート機能を追加
- ソースバリデーション機能を追加
- 3つの新規IPCチャネル（skill:importFromSource, skill:export, skill:validateSource）を追加
- P42準拠の3段バリデーションを全ハンドラに適用
- パストラバーサル防止のセキュリティチェックを実装
```

### Task 3: PR作成

`/ai:diff-to-pr` スキルを使用してPRを作成する。

#### PR情報

| 項目           | 内容                                                     |
| -------------- | -------------------------------------------------------- |
| タイトル       | `feat(skill): スキル共有・インポート機能実装 (#TASK-9F)` |
| ベースブランチ | `main`                                                   |
| ヘッドブランチ | `feature/task-9f-skill-share`                            |

#### PR本文テンプレート

```markdown
## Summary

- GitHub/Gist/URL/ローカルからのスキルインポートとGist/ローカルへのエクスポート機能を実装
- SkillShareManagerクラスを新規作成し、3つのIPCチャネルを追加
- P42準拠の3段バリデーション・パストラバーサル防止・エラーサニタイズを全ハンドラに適用

## Test Plan

- [ ] SkillShareManager単体テストが全パス
- [ ] IPCハンドラのバリデーションテストが全パス
- [ ] `pnpm lint` エラー0件
- [ ] `pnpm typecheck` エラー0件
- [ ] Phase 11手動テスト全シナリオ（32件）通過

## Breaking Changes

なし

## Related Issues

- TASK-9F: スキル共有・インポート機能実装
```

**重要**: PR作成はユーザー確認後に実行する。自動でPRを作成しない。

### Task 4: CI確認

PRを作成後、以下のCIジョブが全て通過することを確認する。

| #   | CIジョブ             | 合格基準     |
| --- | -------------------- | ------------ |
| 1   | ESLint               | パス         |
| 2   | TypeScript型チェック | パス         |
| 3   | 単体テスト           | 全テストパス |
| 4   | ビルド               | ビルド成功   |

```bash
# CI結果確認
gh run list --limit 1
gh run view <run-id>
```

### Task 5: タスク完了処理

CI通過後に以下を実行する。

#### 5-1. タスクディレクトリの移動

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/skill-share/ docs/30-workflows/completed-tasks/skill-share/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep skill-share
```

#### 5-2. artifacts.json更新

`artifacts.json` の `status` を `"completed"` に更新する。

```json
{
  "status": "completed",
  "phases": {
    "13": {
      "status": "completed",
      "artifacts": ["outputs/phase-13/pr-info.md"]
    }
  }
}
```

#### 5-3. 元タスク指示書の削除（該当する場合）

元のタスク指示書が `docs/30-workflows/unassigned-task/` に存在する場合は削除する。
Phase 12で新規作成した未タスク指示書は削除しない。

```bash
# 元タスク指示書の削除（該当する場合のみ）
rm docs/30-workflows/unassigned-task/task-9f-skill-share.md 2>/dev/null || echo "元タスク指示書なし"

# Phase 12で作成した新規未タスク指示書が存在することを確認
ls docs/30-workflows/unassigned-task/ | grep -v task-9f-skill-share || echo "新規未タスクなし"
```

#### 5-4. 完了コミット

```bash
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-9F skill-shareをcompleted-tasksに移動"
git push
```

---

## 成果物

| 成果物 | パス                          | 内容                             |
| ------ | ----------------------------- | -------------------------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL、CIジョブ結果、マージ状態 |

### PR情報テンプレート

```markdown
# Phase 13: PR情報

## PR

- URL: {{PR URL}}
- タイトル: feat(skill): スキル共有・インポート機能実装 (#TASK-9F)
- ベースブランチ: main
- ヘッドブランチ: feature/task-9f-skill-share

## CI結果

| ジョブ     | ステータス    |
| ---------- | ------------- |
| ESLint     | {{PASS/FAIL}} |
| TypeScript | {{PASS/FAIL}} |
| テスト     | {{PASS/FAIL}} |
| ビルド     | {{PASS/FAIL}} |

## タスク完了処理

- ディレクトリ移動: {{完了/未完了}}
- artifacts.json更新: {{完了/未完了}}
- 元タスク指示書削除: {{完了/該当なし}}
```

---

## 完了条件

- [ ] PR作成前チェック（lint, typecheck, テスト, Phase 12完了確認）が全てパスしている
- [ ] ブランチ名が `feature/task-9f-skill-share` である
- [ ] コミットメッセージがConventional Commits形式で作成されている
- [ ] PRが作成されている（ユーザー確認後）
- [ ] CIの全ジョブが通過している
- [ ] タスクディレクトリが `docs/30-workflows/completed-tasks/skill-share/` に移動されている
- [ ] `artifacts.json` の `status` が `"completed"` に更新されている
- [ ] 元タスク指示書が削除されている（該当する場合）
- [ ] Phase 12で作成した新規未タスク指示書が存在している（該当する場合）
- [ ] `outputs/phase-13/pr-info.md` が作成されている
- [ ] `--no-verify` が使用されていない

---

## スキル100%実行確認【必須】

- [ ] 本Phase内の全タスク（Task 1〜5）を100%実行完了
- [ ] PR作成はユーザー確認後に実行したことを確認
- [ ] CIの全ジョブ結果を確認済み
- [ ] タスク完了処理（ディレクトリ移動、artifacts.json更新、指示書管理）を完了

---

## 次のPhase

Phase 13が完了したら、TASK-9F「スキル共有・インポート機能実装」は完了です。

タスクディレクトリは `docs/30-workflows/completed-tasks/skill-share/` に移動されます。

---

## 備考

- PR作成は `/ai:diff-to-pr` スキルの使用を推奨するが、手動で `gh pr create` を実行しても可
- PRのマージはユーザーがGitHub UIで手動実行する。自動マージは行わない
- CIが失敗した場合は、失敗したジョブの原因を特定し修正してから再実行する。`--no-verify` での回避は禁止
- タスクディレクトリの移動はCIパス後に行う。CI失敗中は移動しない
