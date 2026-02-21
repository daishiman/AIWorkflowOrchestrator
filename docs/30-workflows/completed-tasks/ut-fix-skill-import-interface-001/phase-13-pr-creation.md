# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 13                                |
| Phase名    | PR作成・CI確認                    |
| タスクID   | UT-FIX-SKILL-IMPORT-INTERFACE-001 |
| 前提Phase  | Phase 12（ドキュメント更新）      |
| 後続Phase  | なし（マージ準備完了）            |
| ステータス | 未実施                            |
| 作成日     | 2026-02-21                        |
| 機能名     | skill-import-agent-system         |

---

## 目的

全Phase完了後のPR作成準備を行い、ユーザーの明示的な許可を得てからPRを作成する。

## 背景

全ての開発フェーズが完了した後、変更をリモートリポジトリに反映する。
PR作成とCI確認により、マージ前の最終チェックを行う。

---

## 重要な注意事項

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                           | 理由                                     |
| ---------------------------------- | ---------------------------------------- |
| 勝手にPRを作成する                 | レビュー前の変更がリモートに反映される   |
| ユーザー確認なしでスキルを実行する | 意図しないブランチやコミットが作成される |
| ローカル確認をスキップする         | 動作確認されていないコードがPRに含まれる |

### セット対応

UT-FIX-SKILL-REMOVE-INTERFACE-001（skill:remove の同様の不整合修正、2026-02-20完了済み）と同一ブランチ fix/ut-fix-skill-import-interface-001-specs で作業している。skill:import と skill:remove は同一パターン（P44: IPCハンドラとPreloadのインターフェース不整合）を修正するため、両タスクの変更を含むPRとしてレビュー・マージすることで効率的である。

---

## 実行タスク

- 参照仕様確認: aiworkflow-requirements と既存実装差分を確認する
- 実装/検証手順定義: 本Phaseで実施する作業を具体化する
- 成果物反映: outputs 配下に結果を記録する

> 以下のタスクを順番に実行してください。

### タスク1: ローカル確認チェック

**目的**: PR作成前に全てのチェックがパスすることを確認する

**実行手順**:

1. shared パッケージをビルドする
2. 型チェックがパスすることを確認する
3. Lintエラーがないことを確認する
4. 関連テストが全てパスすることを確認する

**コマンド**:

```bash
# shared パッケージビルド
pnpm --filter @repo/shared build

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint確認
pnpm --filter @repo/desktop lint

# skillHandlers テスト確認
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose

# skill-api Preloadテスト確認
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api --reporter=verbose
```

**チェックリスト**:

- [ ] shared ビルドが成功する
- [ ] 型チェックがパスする
- [ ] Lintエラーがない
- [ ] skillHandlers テストが全てパスする
- [ ] skill-api テストが全てパスする

**期待される成果物**:

- `outputs/phase-13/local-check-result.md`

---

### タスク2: 変更内容の確認

**目的**: コミット対象の変更内容を確認する

**実行手順**:

1. `git status` で変更ファイルを確認する
2. `git diff` で差分を確認する
3. 意図しない変更がないか確認する
4. 機密情報が含まれていないか確認する

**確認事項**:

| 確認項目           | 確認内容                             |
| ------------------ | ------------------------------------ |
| 変更ファイル       | 想定通りのファイルのみ変更されている |
| 機密情報           | APIキー等が含まれていない            |
| 不要ファイル       | ビルド成果物等が含まれていない       |
| コードフォーマット | Prettier が適用されている            |

**想定される変更ファイル**:

| ファイル                                                    | 変更種別 |
| ----------------------------------------------------------- | -------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                | 修正     |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` | 修正     |
| `docs/30-workflows/skill-import-agent-system/**`            | 新規     |

**期待される成果物**:

- `outputs/phase-13/change-summary.md`

---

### タスク3: ユーザー確認の取得

**目的**: PR作成の許可をユーザーから取得する

**実行手順**:

1. 変更内容のサマリーを提示する
2. PR作成の許可を求める
3. 許可が得られたら次のタスクへ進む

**提示内容**:

```markdown
## PR作成確認

以下の内容でPRを作成します:

### ブランチ名

`fix/ut-fix-skill-import-interface-001-specs`

### PRタイトル

`fix(ipc): skill:import IPCインターフェース不整合修正・P44解消 (UT-FIX-SKILL-IMPORT-INTERFACE-001)`

### 変更ファイル

- apps/desktop/src/main/ipc/skillHandlers.ts（skill:importハンドラ引数形式修正）
- apps/desktop/src/main/ipc/**tests**/skillHandlers.test.ts（テスト期待値修正）
- ドキュメント（Phase 1-12 成果物）

### ローカルチェック結果

- 型チェック: PASS
- Lint: PASS
- テスト: PASS

PRを作成してよろしいですか？
```

**期待される成果物**:

- ユーザーからの許可（チャット上）

---

### タスク4: PR作成

**目的**: PRを作成する

**実行手順**:

1. ユーザーの許可を確認する
2. 利用可能なPR作成フロー（例: `gh pr create`）をユーザー確認後に実行する
3. PRが作成されたことを確認する
4. PR URLを記録する

**PR本文テンプレート**:

```markdown
## Summary

- skill:import IPCハンドラの引数形式を `{ skillIds: string[] }` → `skillName: string` に修正
- P42準拠の3段バリデーション（typeof → 空文字列 → trim空文字列）を適用
- 関連テストの期待値を修正
- P44（skill:import/remove IPCインターフェース不整合）を完全解消

## Test plan

- [ ] `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers` 全テストPASS
- [ ] `cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api` 全テストPASS
- [ ] `pnpm typecheck` エラーなし
- [ ] `pnpm --filter @repo/desktop dev` でスキルインポートが正常動作

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**期待される成果物**:

- `outputs/phase-13/pr-info.md`
- PR URL

---

### タスク5: CI確認・マージ準備完了報告

**目的**: CIがパスしマージ準備が完了したことを確認・報告する

**実行手順**:

1. GitHub上でCIの実行状況を確認する
2. 全CIジョブがパスすることを確認する
3. PRのレビュー準備が整ったことを報告する

**確認事項**:

| CI項目     | 期待結果 | 実際 |
| ---------- | -------- | ---- |
| ビルド     | PASS     | -    |
| テスト     | PASS     | -    |
| 型チェック | PASS     | -    |
| Lint       | PASS     | -    |

**タスクディレクトリ移動（マージ後に実行）**:

```bash
# マージ後に実行
mv docs/30-workflows/ut-fix-skill-import-interface-001 docs/30-workflows/completed-tasks/ut-fix-skill-import-interface
```

**期待される成果物**:

- `outputs/phase-13/ci-result.md`

---

## 参照資料

> 依存Phase成果物参照: Phase 1, Phase 2, Phase 5, Phase 6, Phase 7, Phase 8, Phase 9, Phase 10, Phase 11, Phase 12

| 参照資料           | パス                                                                       | 内容          |
| ------------------ | -------------------------------------------------------------------------- | ------------- |
| PR作成ワークフロー | `.claude/skills/task-specification-creator/references/execute-workflow.md` | PRスキル      |
| 変更ファイル       | `apps/desktop/src/main/ipc/skillHandlers.ts`（行120-138）                  | 実装コード    |
| Gitルール          | `.claude/rules/07-git-and-tooling.md`                                      | Git操作ルール |

### 参照仕様（aiworkflow-requirements）

| 仕様             | パス                                                                              | 用途                              |
| ---------------- | --------------------------------------------------------------------------------- | --------------------------------- |
| タスク管理仕様   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | 未タスク登録・完了記録の最終確認  |
| Skill API仕様    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | `skill:import` 契約反映の最終確認 |
| セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | PR前のIPCセキュリティ最終確認     |
| IPC契約チェック  | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | 仕様・実装・テスト同期の最終確認  |

---

## 成果物

| 成果物           | パス                                     | 内容         |
| ---------------- | ---------------------------------------- | ------------ |
| ローカルチェック | `outputs/phase-13/local-check-result.md` | チェック結果 |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | 変更内容     |
| PR情報           | `outputs/phase-13/pr-info.md`            | PR情報       |
| CI結果           | `outputs/phase-13/ci-result.md`          | CI状況       |

---

## 完了条件

- [ ] ローカルチェック（ビルド、テスト、型、Lint）が全てパスしている
- [ ] 変更内容が確認されている
- [ ] ユーザーからPR作成の許可が得られている
- [ ] PRが作成されている
- [ ] CIが全てパスしている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（4ファイル）が全て生成されていることを確認
- [ ] PR URLをユーザーに報告

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（マージ準備完了）

---

## タスク完了

**注意**: マージはユーザーがGitHub UI上で手動で実行してください。

```markdown
## UT-FIX-SKILL-IMPORT-INTERFACE-001: skill:import IPCハンドラインターフェース不整合修正 完了

### 成果物

- skillHandlers.ts のskill:importハンドラ引数形式を `{ skillIds: string[] }` → `skillName: string` に修正
- P42準拠3段バリデーション適用
- テスト期待値修正完了
- P44（skill:import/remove IPCインターフェース不整合）完全解消
- 実装ガイド作成完了

### PR

- URL: {{PR_URL}}
- ステータス: マージ準備完了

### 次のステップ

- GitHub UIでPRをレビュー・マージしてください
```
