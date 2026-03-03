# Phase 13: 完了 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 13                        |
| Phase名    | 完了                      |
| タスクID   | UT-UI-05A-GETFILETREE-001 |
| 前提Phase  | Phase 12（ドキュメント）  |
| 後続Phase  | なし（マージ準備完了）    |
| ステータス | 未実施                    |
| 作成日     | 2026-03-03                |
| 機能名     | getfiletree-ipc           |
| Issue      | #948                      |

---

## 目的

全Phase成果物の最終確認を行い、PR作成準備を完了する。
`/ai:diff-to-pr` スキルを使用してコミット・PR作成・CI確認を行い、マージ準備を完了する。

## 背景

全ての開発フェーズが完了した後、変更をリモートリポジトリに反映する。
PR作成とCI確認により、マージ前の最終チェックを行う。

---

## 重要な注意事項

**⚠️ PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                           | 理由                                     |
| ---------------------------------- | ---------------------------------------- |
| 勝手にPRを作成する                 | レビュー前の変更がリモートに反映される   |
| ユーザー確認なしでスキルを実行する | 意図しないブランチやコミットが作成される |
| ローカル確認をスキップする         | 動作確認されていないコードがPRに含まれる |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 成果物最終確認

**目的**: 全Phase成果物が存在し、artifacts.json が最新状態であることを確認する

**実行手順**:

1. 全Phase（1-12）の成果物の存在を確認する
2. artifacts.json のステータスを全て更新する
3. 不足している成果物があれば記録する

**Phase成果物チェックリスト**:

| Phase | 仕様書                       | 成果物ディレクトリ | 存在確認 |
| ----- | ---------------------------- | ------------------ | -------- |
| 1     | phase-1-requirements.md      | outputs/phase-1/   | -        |
| 2     | phase-2-design.md            | outputs/phase-2/   | -        |
| 3     | phase-3-design-review.md     | outputs/phase-3/   | -        |
| 4     | phase-4-test-creation.md     | outputs/phase-4/   | -        |
| 5     | phase-5-implementation.md    | outputs/phase-5/   | -        |
| 6     | phase-6-test-expansion.md    | outputs/phase-6/   | -        |
| 7     | phase-7-coverage-check.md    | outputs/phase-7/   | -        |
| 8     | phase-8-refactoring.md       | outputs/phase-8/   | -        |
| 9     | phase-9-quality-assurance.md | outputs/phase-9/   | -        |
| 10    | phase-10-final-review.md     | outputs/phase-10/  | -        |
| 11    | phase-11-manual-test.md      | outputs/phase-11/  | -        |
| 12    | phase-12-documentation.md    | outputs/phase-12/  | -        |
| 13    | phase-13-pr-creation.md      | outputs/phase-13/  | -        |

**期待される成果物**:

- `outputs/phase-13/artifact-verification.md`

---

### タスク2: PR準備

**目的**: PR作成に必要な情報を整理する

**PR情報**:

| 項目           | 内容                                              |
| -------------- | ------------------------------------------------- |
| ブランチ名     | `feature/task-ui-05a-getfiletree-ipc`             |
| ベースブランチ | `main`                                            |
| PR タイトル    | `feat(desktop): skill:getFileTree IPC実装 (#948)` |

**PR 本文テンプレート**:

```markdown
## Summary

- skill:getFileTree IPCチャンネルを新規追加し、スキルのファイルツリーを取得可能にした
- Preload/Main/型定義/テストを一貫実装し、useFileTreeフックの型キャスト（as）を解消した
- P42準拠3段バリデーション・sender検証・パストラバーサル対策を実装した

## Test plan

- [ ] skillFileHandlers ユニットテストが全PASSすること
- [ ] SkillFileManager ユニットテストが全PASSすること
- [ ] useFileTree フックのテストが全PASSすること
- [ ] pnpm typecheck がパスすること
- [ ] pnpm lint がパスすること
- [ ] DevToolsから `window.electronAPI.skill.getFileTree("skillName")` が正常動作すること
- [ ] SkillEditorViewでファイルツリーが正しく表示されること

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**変更ファイル一覧**:

| #   | ファイルパス                                                           | 変更種別 |
| --- | ---------------------------------------------------------------------- | -------- |
| 1   | `apps/desktop/src/preload/channels.ts`                                 | 変更     |
| 2   | `apps/desktop/src/main/ipc/skillFileHandlers.ts`                       | 変更     |
| 3   | `apps/desktop/src/main/services/skill/SkillFileManager.ts`             | 変更     |
| 4   | `apps/desktop/src/preload/skill-api.ts`                                | 変更     |
| 5   | `apps/desktop/src/preload/types.ts`                                    | 変更     |
| 6   | `apps/desktop/src/renderer/views/SkillEditorView/hooks/useFileTree.ts` | 変更     |
| 7   | テストファイル（Phase 4-6 で作成）                                     | 新規     |

---

### タスク3: ローカル最終チェック

**目的**: PR作成前に全てのチェックがパスすることを確認する

**実行手順**:

1. shared パッケージをビルドする
2. 型チェックがパスすることを確認する
3. Lint エラーがないことを確認する
4. 全テストがパスすることを確認する

**コマンド**:

```bash
# shared パッケージビルド
pnpm --filter @repo/shared build

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint確認
pnpm --filter @repo/desktop lint

# テスト確認（変更に関連するテスト）
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillFileHandlers --reporter=verbose
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillFileManager --reporter=verbose
```

**最終チェックリスト**:

- [ ] shared ビルドが成功する
- [ ] 型チェックがパスする
- [ ] Lint エラーがない
- [ ] 全テストがパスする
- [ ] Phase 12 の5タスクが全完了していることを確認した

**期待される成果物**:

- `outputs/phase-13/local-check-result.md`

---

### タスク4: PR作成実行

**⚠️ ユーザーの明示的な許可を得てから実行すること**

**実行手順**:

1. ユーザーにPR作成の許可を求める
2. 許可が得られたら `/ai:diff-to-pr` スキルを実行する
3. PR が正常に作成されたことを確認する
4. CI/CD の実行状況を確認する

---

## 参照資料

| 資料名            | パス                                                               |
| ----------------- | ------------------------------------------------------------------ |
| Phase 12 成果物   | `outputs/phase-12/`                                                |
| artifacts.json    | `docs/30-workflows/completed-tasks/getfiletree-ipc/artifacts.json` |
| PR作成ルール      | `.claude/rules/07-git-and-tooling.md`                              |
| diff-to-pr スキル | `/ai:diff-to-pr`                                                   |

依存Phase参照: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11, Phase 12

---

## 成果物

| 成果物               | パス                                        |
| -------------------- | ------------------------------------------- |
| 成果物検証レポート   | `outputs/phase-13/artifact-verification.md` |
| ローカルチェック結果 | `outputs/phase-13/local-check-result.md`    |
| 完了レポート         | `outputs/phase-13/completion-report.md`     |

---

## 完了条件

- [ ] タスク1: 全Phase成果物の存在を確認した
- [ ] タスク1: artifacts.json のステータスを全て更新した
- [ ] タスク2: PR情報を整理し本文テンプレートを準備した
- [ ] タスク3: shared ビルドが成功した
- [ ] タスク3: 型チェックがパスした
- [ ] タスク3: Lint エラーがない
- [ ] タスク3: 全テストがパスした
- [ ] タスク3: Phase 12 の5タスク全完了を確認した
- [ ] タスク4: ユーザーの許可を得てPRを作成した（またはPR作成待ち状態）
- [ ] 完了レポート `outputs/phase-13/completion-report.md` を作成した

---

## タスク完了

UT-UI-05A-GETFILETREE-001 の全Phase（1-13）が完了。
PRがマージされた時点でタスク完全終了。
