# Phase 13: PR 作成

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 13                               |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 機能名   | w4b-2-sc-ui-runtime-connection   |
| 作成日   | 2026-03-22                       |
| 更新日   | 2026-03-24                       |

## 目的

TASK-SC-06-UI-RUNTIME-CONNECTION の成果物を PR としてまとめ、ユーザー承認後にリポジトリに提出する。全 Phase（1〜12）の完了条件を最終確認してから PR を作成する。

## 依存関係

- 前提成果物: Phase 12 ドキュメント成果物（全 Task 完了済み）

## 前提タスクとの依存関係

本 PR は以下のタスクに依存する。PR 本文に依存関係を明記する:

| 依存タスク             | PR 番号/コミット | 説明                                                   |
| ---------------------- | ---------------- | ------------------------------------------------------ |
| UT-SC-03-004           | 既マージ済み     | SkillBlueprint 型移行（RuntimeSkillCreatorPlanResult） |
| UT-SC-05-IPC-DI-WIRING | 既マージ済み     | RuntimeSkillCreatorFacade DI 配線完了                  |

マージ済みの場合は「依存タスクは main ブランチにマージ済み」と明記する。

---

## 実行タスク

### Task 1: 成果物の最終確認

#### 全 Phase の完了条件チェックリスト最終確認

```bash
# Phase 1〜12 の完了条件が全てチェック済みかをファイルで確認
grep -c "- \[x\]" docs/30-workflows/w4b-2-sc-ui-runtime-connection/phase-*.md
grep -c "- \[ \]" docs/30-workflows/w4b-2-sc-ui-runtime-connection/phase-*.md
```

未完了（`- [ ]`）が 0 件であることを確認する。

#### git diff による変更ファイル確認

```bash
# 変更ファイル一覧の確認
git diff --stat main

# または worktree のブランチとの差分
git diff --stat HEAD
```

#### 予想される変更ファイル一覧

| ファイルパス                                                                                       | 変更種別           | 説明                                                       |
| -------------------------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | 変更               | handlePrepare 拡張、handlePlanSkill/handleExecutePlan 追加 |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                             | 変更               | isGenerating 等 5 フィールド + 6 アクション追加            |
| `apps/desktop/src/renderer/store/index.ts`                                                         | 変更               | 個別セレクタ 7 個追加（P31 対策）                          |
| `apps/desktop/src/renderer/hooks/useSkillLLMGeneration.ts`                                         | 新規（オプション） | plan/execute ロジックの Hook 抽出                          |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | 新規               | LLM 生成フローのテスト                                     |

**予期しないファイルが含まれている場合**: 変更内容を確認し、意図しない変更であれば `git checkout -- <file>` で元に戻す。

### Task 2: コミットの整理

コミット単位を確認する:

```bash
git log --oneline main..HEAD
```

推奨するコミット構成:

| コミット | 内容                                                                                 |
| -------- | ------------------------------------------------------------------------------------ |
| 1        | `feat(agent-slice): isGenerating 等生成状態フィールド追加・個別セレクタ追加`         |
| 2        | `feat(skill-lifecycle-panel): handlePrepare → planSkill 接続・plan 結果表示 UI 追加` |
| 3        | `refactor(skill-llm-generation): useSkillLLMGeneration Hook 抽出（オプション）`      |
| 4        | `test(skill-lifecycle-panel): LLM 生成フロー・エラー・既存フロー非破壊テスト追加`    |

### Task 3: PR タイトル案

```
feat(skill-creator): SkillLifecyclePanel → RuntimeSkillCreatorFacade plan/execute 接続
```

- 文字数: 約 58 文字（70 文字以内の基準を満たす）
- プレフィックス: `feat` （新機能追加）
- スコープ: `skill-creator`

### Task 4: PR 本文テンプレート

```markdown
## Summary

- `SkillLifecyclePanel` の「方針を決める」ボタンから `planSkill()` / `executePlan()` を呼び出すフローを接続した
- AgentSlice に生成状態管理フィールド（isGenerating, generationProgress, generationError, currentPlanId, currentPlanResult）と個別セレクタ 7 個を追加した（P31 対策）
- 既存の `handleCreate()` / SkillCreateWizard 4 段階フローへの影響なし（後方互換性維持）

## 変更詳細

### AgentSlice 拡張（agentSlice.ts, store/index.ts）

LLM 生成フロー専用の状態を AgentSlice に追加した。全フィールドは `clearGenerationState()` で一括リセット可能。個別セレクタ設計（P31 対策）により useEffect 依存配列の無限ループリスクを排除している。

### SkillLifecyclePanel 変更（SkillLifecyclePanel.tsx）

`handlePrepare()` 内で `detectMode()` の結果が `"plan"` または `"improve"` の場合に `handlePlanSkill()` を自動呼び出す条件分岐を追加した。`handlePlanSkill()` 冒頭に `isGenerating` ガードを実装し二重呼び出しを防止している（Phase 3 R-1 対応）。

### 後方互換性

- `handleCreate()` は変更なし（skill:create IPC を直接呼び出す）
- SkillCreateWizard 4 段階フローは変更なし
- `detectMode()` が `"create"` を返す場合は従来フローを維持

## 依存関係

以下のタスクの成果物が main にマージ済みであることを確認した:

- UT-SC-03-004: SkillBlueprint 型移行（RuntimeSkillCreatorPlanResult）
- UT-SC-05-IPC-DI-WIRING: RuntimeSkillCreatorFacade DI 配線完了

## Test Plan

- [ ] `pnpm --filter @repo/desktop test` が全テスト PASS する
- [ ] `pnpm --filter @repo/desktop lint` が PASS する
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS する
- [ ] `pnpm --filter @repo/desktop dev` で Electron が起動する
- [ ] SkillLifecyclePanel で「方針を決める」をクリックし planSkill が呼ばれることを DevTools で確認する
- [ ] 「スキルを生成する」ボタンが従来通り skill:create を呼ぶことを確認する（AC-7）

## 未タスク

本 PR のスコープ外とした未タスクは以下の指示書で管理している:

- TASK-SC-07: SkillCreateWizard への planSkill 接続（Phase 3 R-2）
- TASK-SC-08: onProgress コールバックによるリアルタイムプログレス更新（Phase 3 R-3）
```

### Task 5: ユーザー承認フロー

PR 作成前に以下の情報をユーザーに提示し、承認を求める:

1. PR タイトル案
2. Summary（3 箇条書き）
3. 変更ファイル一覧（`git diff --stat main` の出力）
4. Test Plan

**承認確認事項**:

- [ ] PR タイトルが適切か
- [ ] Summary が変更内容を正確に反映しているか
- [ ] 変更ファイルに予期しないものが含まれていないか
- [ ] 未タスク（TASK-SC-07, TASK-SC-08）のスコープ分割に同意するか

### Task 6: PR 作成コマンド

ユーザー承認後に以下のコマンドで PR を作成する（`--no-verify` 禁止）:

```bash
gh pr create \
  --title "feat(skill-creator): SkillLifecyclePanel → RuntimeSkillCreatorFacade plan/execute 接続" \
  --body "$(cat <<'EOF'
## Summary

- SkillLifecyclePanel の「方針を決める」ボタンから planSkill() / executePlan() を呼び出すフローを接続した
- AgentSlice に生成状態管理フィールド（isGenerating, generationProgress 等 5 フィールド）と個別セレクタ 7 個を追加した（P31 対策）
- 既存の handleCreate() / SkillCreateWizard 4 段階フローへの影響なし（後方互換性維持）

## Test Plan

- [ ] pnpm --filter @repo/desktop test が全テスト PASS する
- [ ] pnpm --filter @repo/desktop lint が PASS する
- [ ] pnpm --filter @repo/desktop typecheck が PASS する
- [ ] SkillLifecyclePanel で「方針を決める」をクリックし planSkill が呼ばれることを確認する
- [ ] 「スキルを生成する」ボタンが従来通り skill:create を呼ぶことを確認する（AC-7）

## 依存関係

- UT-SC-03-004, UT-SC-05-IPC-DI-WIRING: main ブランチにマージ済み
EOF
)" \
  --base main
```

### Task 7: PR URL の記録

PR 作成後、以下のファイルに PR URL を記録する:

- `docs/30-workflows/w4b-2-sc-ui-runtime-connection/documentation-changelog.md`（末尾に PR URL を追記）

## 参照資料

- Phase 12 ドキュメント成果物
- `.claude/rules/07-git-and-tooling.md`（PR 作成ルール）
- `CLAUDE.md`（`--no-verify` 禁止）

## 実行手順

### ステップ1: 全 Phase 完了条件の最終確認

`grep -c "- \[ \]" docs/30-workflows/w4b-2-sc-ui-runtime-connection/phase-*.md` で未完了が 0 件であることを確認する。

### ステップ2: git diff による変更ファイル確認

`git diff --stat main` で変更ファイル一覧を確認し、予期しないファイルが含まれていないことを確認する。

### ステップ3: コミット整理

コミット単位を確認し、推奨構成に従って整理する。

### ステップ4: PR タイトル・本文の作成

PR タイトル（70 文字以内）と本文（Summary + Test Plan + 依存関係 + 未タスク）を作成する。

### ステップ5: ユーザー承認

PR タイトル・Summary・変更ファイル一覧・未タスクスコープ分割についてユーザーの承認を得る。

### ステップ6: PR 作成

`gh pr create` で PR を作成する（--no-verify 不使用）。

### ステップ7: PR URL 記録

PR URL を documentation-changelog.md に記録する。

## 統合テスト連携

Phase 13（PR 作成）では統合テストの直接実施はない。PR 作成前に以下を確認する:

- CI/CD パイプラインで全テストが PASS することを `gh pr checks` で確認
- pre-push フック（lint + typecheck + test）が正常実行されることを確認

## 多角的チェック観点

| 観点               | 確認内容                                       | 確認方法                        |
| ------------------ | ---------------------------------------------- | ------------------------------- |
| 完了条件網羅       | Phase 1〜12 の全完了条件が達成済み             | `grep -c "- \[ \]"` で 0 件確認 |
| 変更ファイル妥当性 | 予期しないファイルが含まれていない             | `git diff --stat main`          |
| PR 品質            | タイトル 70 文字以内、Summary + Test Plan 記載 | 目視確認                        |
| 依存関係明示       | 前提タスクの PR/コミットを記載                 | PR 本文確認                     |
| 未タスク管理       | スコープ外タスクが指示書化されている           | Phase 12 Task 4 確認            |

## サブタスク管理

| サブタスク             | 担当               | ステータス | 備考             |
| ---------------------- | ------------------ | ---------- | ---------------- |
| Task 1: 成果物最終確認 | メインエージェント | 未着手     | -                |
| Task 2: コミット整理   | メインエージェント | 未着手     | -                |
| Task 3: PR タイトル案  | メインエージェント | 未着手     | 70 文字以内      |
| Task 4: PR 本文作成    | メインエージェント | 未着手     | -                |
| Task 5: ユーザー承認   | ユーザー           | 未着手     | 承認待ち         |
| Task 6: PR 作成        | メインエージェント | 未着手     | --no-verify 禁止 |
| Task 7: PR URL 記録    | メインエージェント | 未着手     | -                |

## 成果物

- PR URL

## 完了条件

- [ ] 全 Phase（1〜12）の完了条件チェックリストを最終確認した（`- [ ]` が 0 件）
- [ ] `git diff --stat main` で変更ファイルを確認し、予期しないファイルがないことを確認した
- [ ] PR タイトルが 70 文字以内であることを確認した（現案: 約 58 文字）
- [ ] PR 本文に Summary（3 箇条書き）と Test Plan が含まれることを確認した
- [ ] 前提タスク（UT-SC-03-004, UT-SC-05-IPC-DI-WIRING）との依存関係を記載した
- [ ] ユーザーの承認を得た（PR タイトル・Summary・変更ファイル・未タスクスコープ分割）
- [ ] `gh pr create` で PR を作成した（`--no-verify` 不使用）
- [ ] PR URL を `documentation-changelog.md` に記録した

## タスク100%実行確認【必須】

- [ ] 上記の完了条件を全てチェックした
- [ ] 実行手順の全ステップ（ステップ1〜7）を実行した
- [ ] 多角的チェック観点の全項目を確認した
- [ ] サブタスク管理テーブルのステータスを全て更新した
- [ ] 統合テスト連携の全項目を確認した

## 次のPhase

完了
