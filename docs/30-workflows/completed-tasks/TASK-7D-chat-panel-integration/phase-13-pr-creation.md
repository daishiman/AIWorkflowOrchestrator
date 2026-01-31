# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目      | 内容                           |
| --------- | ------------------------------ |
| Phase     | 13                             |
| Phase名   | PR作成                         |
| カテゴリ  | 完了                           |
| 機能名    | TASK-7D-chat-panel-integration |
| 作成日    | 2026-01-30                     |
| 前提Phase | Phase 12                       |
| 後続Phase | なし                           |

## 目的

TASK-7D の全成果物を含む Pull Request を作成する。PR 本文にはタスクの概要、変更内容、テスト計画を記載する。

**注意: PR作成はユーザーの明示的な許可を得てから実行すること。**

## 実行タスク

### タスク1: 変更内容の確認

**目的**: PR に含まれる全変更内容を確認する。

**手順**:

1. Git の変更状況を確認する:

```bash
git status
git diff --stat main...HEAD
```

2. 変更ファイル一覧を確認する:

| 操作 | ファイル                                                                            |
| ---- | ----------------------------------------------------------------------------------- |
| 作成 | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`                 |
| 修正 | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                           |
| 修正 | `apps/desktop/src/renderer/components/skill/index.ts`                               |
| 作成 | `apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx`  |
| 作成 | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`            |
| 作成 | `docs/30-workflows/skill-import-agent-system/tasks/TASK-7D-chat-panel-integration/` |

3. 全テストが PASS であることを最終確認する:

```bash
pnpm --filter @repo/desktop vitest run
```

4. 型チェックと Lint が通ることを最終確認する:

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

**期待される成果物**:

- 変更内容確認ログ

### タスク2: PR作成（ユーザー許可後）

**目的**: GitHub PR を作成する。

**手順**:

1. ユーザーに PR 作成の許可を求める
2. 許可を得た後、以下のコマンドまたは `/ai:diff-to-pr` スキルを使用して PR を作成する:

```bash
gh pr create --title "feat(skill): TASK-7D ChatPanel統合 - SkillStreamingView実装" --body "$(cat <<'EOF'
## Summary

- ChatPanel に SkillSelector を統合し、ModelSelector の隣に配置
- SkillStreamingView コンポーネントを新規作成（ストリーミング表示）
- SkillImportDialog / PermissionDialog の ChatPanel からの表示制御を実装
- StatusBadge（5ステータス）、StreamMessageItem（4メッセージタイプ）、ToolExecutionHistory（折りたたみ）を実装

## Test plan

- [ ] ChatPanel.test.tsx - ChatPanel 統合テスト（8+ ケース）
- [ ] SkillStreamingView.test.tsx - ストリーミング表示テスト（20+ ケース）
- [ ] エッジケーステスト（空メッセージ、大量メッセージ等）
- [ ] アクセシビリティテスト（ARIA属性、キーボード操作）
- [ ] 既存テストリグレッション確認（StreamingMessage 162テスト等）
- [ ] 手動テスト（基本動作、ストリーミング、権限確認フロー）

## Related

- Depends on: TASK-7A (SkillSelector), TASK-7B (SkillImportDialog), TASK-7C (PermissionDialog)
- Blocks: TASK-8A, TASK-8B, TASK-8C

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

3. PR URL をユーザーに報告する

**期待される成果物**:

- GitHub PR（URL）

### タスク3: CI/CD 確認

**目的**: PR の CI/CD パイプラインが成功することを確認する。

**手順**:

1. PR 作成後、CI/CD の実行状況を確認する:

```bash
gh pr checks
```

2. 全チェックが PASS であることを確認する
3. FAIL がある場合は原因を特定し修正する

**期待される成果物**:

- CI/CD 実行結果ログ

### タスク4: Phase 完了処理

**目的**: TASK-7D の全 Phase 完了処理を実行する。

**手順**:

1. artifacts.json を最終更新する:

```bash
node scripts/complete-phase.js --workflow docs/30-workflows/skill-import-agent-system/tasks/TASK-7D-chat-panel-integration --phase 13 --artifacts "PR_URL:Pull Request"
```

2. 使用ログを記録する:

```bash
node scripts/log-usage.js --result success --phase "Phase 13"
```

**期待される成果物**:

- 更新された artifacts.json
- 使用ログ

## 参照資料

| 参照資料              | パス                                                               |
| --------------------- | ------------------------------------------------------------------ |
| Phase 12 成果物       | `outputs/phase-12/` ディレクトリ全体                               |
| /ai:diff-to-pr スキル | `.claude/skills/ai-diff-to-pr/`                                    |
| コマンドリファレンス  | `.claude/skills/task-specification-creator/references/commands.md` |

## 多角的観点チェック

### Renderer（フロントエンド）層

| 観点       | 確認項目                                               |
| ---------- | ------------------------------------------------------ |
| 変更網羅性 | 全変更ファイルが Git diff に含まれ漏れがないか         |
| CI/CD      | 全テスト・型チェック・Lint が PR 上で PASS しているか  |
| PR品質     | Summary/Test plan/Related が過不足なく記載されているか |

## 成果物

| 成果物         | パス             | 種別     |
| -------------- | ---------------- | -------- |
| GitHub PR      | GitHub PR URL    | document |
| artifacts.json | `artifacts.json` | document |

## 完了条件

- [ ] 全変更ファイルが確認されている
- [ ] 全テストが PASS である
- [ ] TypeScript 型チェックが通る
- [ ] ESLint が通る
- [ ] ユーザーの許可を得て PR が作成されている
- [ ] PR 本文に Summary、Test plan、Related が記載されている
- [ ] CI/CD が PASS である（または FAIL の原因が特定・修正されている）
- [ ] artifacts.json が最終更新されている
- [ ] 使用ログが記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: 変更内容の確認
3. タスク2: PR作成（ユーザー許可後）
4. タスク3: CI/CD 確認
5. タスク4: Phase 完了処理
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-7D-chat-panel-integration --phase 13
```

## 次のPhase

なし（最終Phase）
