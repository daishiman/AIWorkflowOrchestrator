# Phase 13: PR作成 - 検索パネル EditorView 統合

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| フェーズ   | Phase 13                                |
| 名称       | PR作成                                  |
| 目的       | `/ai:diff-to-pr` でコミット・PR・CI確認 |
| 前提Phase  | Phase 12: ドキュメント更新              |
| 次Phase    | -（完了）                               |
| ステータス | 未実施                                  |

---

## 目的

全ての実装とドキュメントをコミットし、Pull Request を作成して CI/CD の完了を確認する。

---

## 実行タスク

### Task 1: ローカル確認（PR作成前必須）

**目的**: PR作成前にローカルで品質を最終確認する

**実行内容**:

```bash
# 1. ビルド確認
pnpm --filter @repo/desktop build

# 2. 全テスト実行
pnpm --filter @repo/desktop test:run

# 3. 型チェック
pnpm --filter @repo/desktop tsc --noEmit

# 4. Lint
pnpm --filter @repo/desktop lint

# 5. 実機確認（必要に応じて）
pnpm --filter @repo/desktop dev
```

**確認チェックリスト**:

| 確認項目             | 状態 |
| -------------------- | ---- |
| ビルドが成功する     | [ ]  |
| 全テストがパスする   | [ ]  |
| 型チェックがパスする | [ ]  |
| Lintエラーがない     | [ ]  |
| 実機で動作確認済み   | [ ]  |

**完了条件**:

- [ ] 全確認項目がチェック済み

### Task 2: 変更差分の確認

**目的**: コミット対象のファイルを確認する

**実行内容**:

```bash
# 変更ファイル一覧
git status

# 差分確認
git diff
git diff --staged
```

**確認チェックリスト**:

| 確認項目                           | 状態 |
| ---------------------------------- | ---- |
| 意図しないファイルが含まれていない | [ ]  |
| 機密情報が含まれていない           | [ ]  |
| 不要なデバッグコードがない         | [ ]  |
| コメントアウトされたコードがない   | [ ]  |

**完了条件**:

- [ ] 変更内容が適切であることを確認

### Task 3: コミット作成

**目的**: 適切なコミットメッセージでコミットを作成する

**実行内容**:

⚠️ **重要**: PR作成はユーザーの明示的な許可を得てから実行すること

```bash
# ステージング
git add apps/desktop/src/features/search/adapters/
git add apps/desktop/src/renderer/views/EditorView/
git add apps/desktop/src/features/search/__tests__/integration/
git add docs/30-workflows/search-panel-integration/

# コミット
git commit -m "$(cat <<'EOF'
feat(search): Phase 5 検索パネルを EditorView に統合

- TextAreaEditorAdapter を実装し EditorInstance インターフェースに適合
- useEditorInstance, useWorkspaceSearch, useSearchKeyboardShortcuts フックを実装
- EditorView に SearchPanel/WorkspaceSearchPanel を統合
- Cmd+F でファイル内検索、Cmd+Shift+F でワークスペース検索が可能に
- 統合テストを追加し、既存テスト 94 件を維持
- WCAG 2.1 AA 準拠を維持

Closes #361

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

**完了条件**:

- [ ] コミットが作成されている
- [ ] コミットメッセージが適切である

### Task 4: PR作成

**目的**: Pull Request を作成する

**実行内容**:

⚠️ **重要**: PR作成はユーザーの明示的な許可を得てから実行すること

```bash
# ブランチをプッシュ
git push -u origin task/search-panel-integration

# PR作成
gh pr create --title "feat(search): Phase 5 検索パネルを EditorView に統合" --body "$(cat <<'EOF'
## Summary

- Phase 5 で TDD 手法を用いて作成した検索パネルコンポーネントを EditorView に統合
- TextAreaEditorAdapter でアダプターパターンを採用し、将来のエディタ変更にも柔軟に対応可能
- `Cmd+F` / `Ctrl+F` でファイル内検索、`Cmd+Shift+F` / `Ctrl+Shift+F` でワークスペース検索が使用可能に

## Changes

- `apps/desktop/src/features/search/adapters/TextAreaEditorAdapter.ts` - 新規作成
- `apps/desktop/src/renderer/views/EditorView/hooks/useEditorInstance.ts` - 新規作成
- `apps/desktop/src/renderer/views/EditorView/hooks/useWorkspaceSearch.ts` - 新規作成
- `apps/desktop/src/renderer/views/EditorView/hooks/useSearchKeyboardShortcuts.ts` - 新規作成
- `apps/desktop/src/renderer/views/EditorView/index.tsx` - SearchPanel 統合
- `apps/desktop/src/features/search/__tests__/integration/` - 統合テスト追加

## Test plan

- [ ] 全ユニットテスト（94件 + 追加分）が合格
- [ ] TypeScript エラー 0 件
- [ ] ESLint 警告 0 件
- [ ] Cmd+F で SearchPanel が表示される
- [ ] Cmd+Shift+F で WorkspaceSearchPanel が表示される
- [ ] 検索・置換・ナビゲーションが正常動作
- [ ] WCAG 2.1 AA 準拠維持

Closes #361

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

**完了条件**:

- [ ] PR が作成されている
- [ ] PR の説明が適切である

### Task 5: CI/CD 完了確認

**目的**: CI/CD パイプラインが成功することを確認する

**実行内容**:

```bash
# CI ステータス確認
gh pr checks

# PR 詳細確認
gh pr view
```

**確認チェックリスト**:

| CI ジョブ            | 状態 |
| -------------------- | ---- |
| ビルド               | [ ]  |
| ユニットテスト       | [ ]  |
| 型チェック           | [ ]  |
| Lint                 | [ ]  |
| E2E テスト（あれば） | [ ]  |

**完了条件**:

- [ ] 全 CI ジョブが成功
- [ ] PR がマージ可能な状態

### Task 6: 補足コメント投稿（必要に応じて）

**目的**: レビュアー向けの補足情報を提供する

**実行内容**:

```bash
gh pr comment --body "$(cat <<'EOF'
## 実装詳細

### アーキテクチャ

```

┌─────────────────────────────────────────────────────┐
│ EditorView │
│ ┌─────────────────┐ ┌─────────────────────┐ │
│ │ SearchPanel │◀──│ TextAreaEditorAdapter│ │
│ │ (Phase 5) │ │ (EditorInstance) │ │
│ └─────────────────┘ └──────────┬──────────┘ │
│ │ │
│ ┌──────────▼──────────┐ │
│ │ TextArea (既存) │ │
│ └─────────────────────┘ │
└─────────────────────────────────────────────────────┘

```

### 品質メトリクス

- テストカバレッジ: 80%+ (Line)
- TypeScript 厳格モード: エラー 0 件
- WCAG 2.1 AA: 準拠

### 関連ドキュメント

- [タスク仕様書](docs/30-workflows/search-panel-integration/index.md)
- [実装ガイド](docs/30-workflows/search-panel-integration/outputs/phase-12/implementation-guide.md)
EOF
)"
```

**完了条件**:

- [ ] 必要な補足情報がコメントされている

---

## 参照資料

### Phase 12 成果物

| 参照資料             | パス                                          |
| -------------------- | --------------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` |

---

## 成果物

| 成果物       | パス           |
| ------------ | -------------- |
| コミット     | Git commit     |
| Pull Request | GitHub PR      |
| CI/CD 結果   | GitHub Actions |

---

## 完了条件

- [ ] ローカル確認が全て完了
- [ ] コミットが作成されている
- [ ] PR が作成されている
- [ ] CI/CD が全て成功
- [ ] PR がマージ可能な状態

---

## タスク完了

⚠️ **マージは手動で実行すること**

PR がマージ可能な状態になったら、レビュー後にユーザーが GitHub UI から手動でマージを実行する。

### 完了報告

```markdown
## タスク完了報告

| 項目       | 結果                      |
| ---------- | ------------------------- |
| タスクID   | TASK-SEARCH-INTEGRATE-001 |
| ステータス | マージ準備完了            |
| PR URL     | (GitHub PR URL)           |
| CI 結果    | 全て成功                  |
| テスト結果 | 94件 + 追加分 全合格      |
| カバレッジ | 80%+                      |

### 実装サマリー

- Phase 5 の SearchPanel/WorkspaceSearchPanel を EditorView に統合
- アダプターパターンで TextArea を EditorInstance に適合
- キーボードショートカット（Cmd+F, Cmd+Shift+F 等）を実装
- WCAG 2.1 AA 準拠を維持
```

---

## 変更履歴

| 日付       | 変更内容 |
| ---------- | -------- |
| 2026-01-22 | 初版作成 |
