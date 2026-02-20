# Phase 13: PR作成 — SkillEditor コンポーネント実装

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 13                                       |
| 機能名 | TASK-9A-C SkillEditor コンポーネント実装 |
| 作成日 | 2026-02-19                               |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に `/ai:diff-to-pr` を実行
- CI確認: CIが通過したことを確認
- タスクディレクトリ移動: completed-tasks への移動

## 参照資料

### Phase成果物

| 資料名       | パス                                          | 説明           |
| ------------ | --------------------------------------------- | -------------- |
| 設計書       | `phase-2-design.md`                           | Phase 2 成果物 |
| 実装仕様     | `phase-5-implementation.md`                   | Phase 5 成果物 |
| テスト拡充   | `phase-6-test-expansion.md`                   | Phase 6 成果物 |
| カバレッジ   | `phase-7-coverage-verification.md`            | Phase 7 成果物 |
| リファクタ   | `phase-8-refactoring.md`                      | Phase 8 成果物 |
| 品質保証     | `phase-9-quality-assurance.md`                | Phase 9 成果物 |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

### システム仕様（aiworkflow-requirements）

| 資料名                 | パス                                                                              | 説明                       |
| ---------------------- | --------------------------------------------------------------------------------- | -------------------------- |
| アーキテクチャ概要     | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      | 全体アーキテクチャ         |
| UIコンポーネント       | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | コンポーネント設計指針     |
| セキュリティAPI        | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | Electron IPC セキュリティ  |
| スキルインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | スキル関連インターフェース |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**確認依頼テンプレート**:

```markdown
## ローカル動作確認のお願い

以下の機能をローカル環境でご確認ください：

1. **ファイルツリー表示**
   - SkillEditor を開き、スキルのファイル構造がツリー形式で表示される
   - フォルダの展開/折畳が正常に動作する

2. **ファイル読込・編集**
   - ファイルをクリックするとエディタ領域に内容が表示される
   - テキストを編集すると「未保存」インジケーターが表示される

3. **保存・閉じる**
   - 保存ボタン（またはCmd+S）でファイルが保存される
   - 閉じるボタンで SkillEditor が閉じられる

確認が完了しましたらお知らせください。
```

### 2. 変更サマリーの提示と許可確認【必須】

**変更サマリーテンプレート**:

```markdown
## 変更サマリー

### 新規ファイル

- `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`
  - SkillEditor メインコンポーネント（ファイルツリー + エディタ）
- `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx`
  - コードエディタコンポーネント（テキスト編集・保存・未保存表示）

### 修正ファイル

- （Phase 5 実装時に確定）

### テスト追加

- SkillEditor.test.tsx（Xテスト）
- SkillCodeEditor.test.tsx（Xテスト）

### ドキュメント

- 実装ガイド（Part 1 + Part 2）
- コンポーネントドキュメント
- システム仕様書更新

PRを作成してよろしいでしょうか？
```

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### 4. 実行結果の確認

- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合:

```bash
# ブランチ作成（未作成の場合）
git checkout -b feature/TASK-9A-C-skill-editor-ui

# 変更をステージング
git add apps/desktop/src/renderer/components/skill/SkillEditor.tsx
git add apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx
# ... 他の変更ファイル（テスト、ドキュメント含む）

# コミット
git commit -m "feat(skill): SkillEditor コンポーネント実装 (TASK-9A-C)

- SkillEditor: ファイルツリー + エディタの2カラムレイアウト
- SkillCodeEditor: テキスト編集・保存・未保存インジケーター
- Cmd+S ショートカット対応
- IPC連携（readFile/writeFile）

Co-Authored-By: Claude <noreply@anthropic.com>"

# プッシュ
git push -u origin feature/TASK-9A-C-skill-editor-ui

# PR作成
gh pr create --title "feat(skill): SkillEditor コンポーネント実装 (TASK-9A-C)" --body "..."
```

## PR本文テンプレート

```markdown
## Summary

- SkillEditor: スキルファイルを編集するUIコンポーネントを実装（ファイルツリー + コードエディタの2カラムレイアウト）
- SkillCodeEditor: テキスト編集、未保存インジケーター、保存機能（Cmd+S対応）を実装
- IPC連携: readFile/writeFile チャネルを通じた Main Process との通信を実装

## Test plan

- [ ] SkillEditor 単体テスト: ファイルツリー表示、ファイル選択、エディタ連携
- [ ] SkillCodeEditor テスト: テキスト編集、未保存表示、保存、閉じる
- [ ] IPC統合テスト: readFile/writeFile チャネルの疎通確認
- [ ] 手動テスト: 30ケース実行（機能・UI/UX・アクセシビリティ・統合・リグレッション）

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

## 多角的チェック観点

### 一般品質観点（8観点）

| 観点               | 適用判断                                             | 仕様参照先                                            |
| ------------------ | ---------------------------------------------------- | ----------------------------------------------------- |
| セキュリティ       | PR に機密情報（APIキー・トークン）が含まれていない   | `aiworkflow-requirements: security-api-electron.md`   |
| UI/UX              | 変更サマリーがユーザーに理解しやすい                 | `aiworkflow-requirements: ui-ux-components.md`        |
| アーキテクチャ     | コミット粒度がレビューしやすい                       | `aiworkflow-requirements: architecture-overview.md`   |
| API設計            | IPC チャネル変更が PR 本文に記載されている           | `aiworkflow-requirements: api-ipc-agent.md`           |
| データ整合性       | 全テストファイルがコミットに含まれている             | `aiworkflow-requirements: database-*.md`              |
| エラーハンドリング | エラーケースのテスト結果が PR 本文に記載されている   | `aiworkflow-requirements: error-handling.md`          |
| パフォーマンス     | CI パイプラインが正常に完了している                  | `aiworkflow-requirements: architecture-overview.md`   |
| アクセシビリティ   | アクセシビリティテスト結果が PR 本文に記載されている | `aiworkflow-requirements: ui-ux-design-principles.md` |

### Electronデスクトップアプリ観点（5層）

| 層                         | 適用判断                                                 | 仕様参照先                                                                   |
| -------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------- |
| フロントエンド（Renderer） | コンポーネント変更がPRに含まれ、テスト結果が添付         | `aiworkflow-requirements: ui-ux-components.md`                               |
| バックエンド（Main）       | IPC ハンドラ変更がPRに含まれ、テスト結果が添付           | `aiworkflow-requirements: architecture-overview.md`                          |
| IPC通信                    | チャネル追加・変更がPR本文に明記されている               | `aiworkflow-requirements: api-ipc-agent.md`, `interfaces-agent-sdk-skill.md` |
| Preload/セキュリティ       | セキュリティ関連変更がレビュー対象として明記されている   | `aiworkflow-requirements: security-api-electron.md`                          |
| ローカルストレージ         | データ永続化の変更がある場合、テスト結果が添付されている | `aiworkflow-requirements: database-*.md`                                     |

## 成果物

| 成果物 | パス                          | 説明       |
| ------ | ----------------------------- | ---------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL情報 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/TASK-9A-C-skill-editor-ui/ docs/30-workflows/completed-tasks/TASK-9A-C-skill-editor-ui/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep TASK-9A-C

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): TASK-9A-C-skill-editor-uiをcompleted-tasksに移動"
git push
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. ユーザーにローカル動作確認依頼
2. 変更サマリー提示
3. PR作成許可の取得
4. `/ai:diff-to-pr` 実行（または手動PR作成）
5. CI通過確認
6. タスクディレクトリ移動（completed-tasks）
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-9A-C-skill-editor-ui --phase 13
```

---

## 次のPhase

なし（ワークフロー完了）
