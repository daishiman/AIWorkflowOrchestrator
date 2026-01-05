# メインタスク仕様書テンプレート

このテンプレートは、Phase -1からPhase 10までの全フェーズを含むタスク実行仕様書を生成するためのもの。

---

## 配置先

```
docs/30-workflows/{{機能名}}/task-{{機能名}}.md
```

---

## テンプレート本体

```markdown
# {{機能名}} - タスク実行仕様書

## ユーザーからの元の指示
```

{{ユーザーの元の指示文をそのまま記載}}

````

## メタ情報

| 項目         | 内容                              |
| ------------ | --------------------------------- |
| タスクID     | {{タスクID}}                      |
| Worktreeパス | `.worktrees/task-{{timestamp}}`   |
| ブランチ名   | `task-{{timestamp}}`              |
| タスク名     | {{タスク名}}                      |
| 分類         | {{要件/改善/バグ修正/リファクタリング/セキュリティ/パフォーマンス}} |
| 対象機能     | {{対象機能}}                      |
| 優先度       | {{高/中/低}}                      |
| 見積もり規模 | {{大規模/中規模/小規模}}          |
| ステータス   | 未実施                            |
| 作成日       | {{YYYY-MM-DD}}                    |

---

## タスク概要

### 目的

{{このタスクで達成すべき目的を詳細に記述}}

### 背景

{{このタスクが必要になった背景・コンテキストを詳細に記述}}

### 最終ゴール

{{達成すべき具体的な最終状態}}

### 成果物一覧

| 種別         | 成果物                   | 配置先                            |
| ------------ | ------------------------ | --------------------------------- |
| 環境         | Git Worktree環境         | `.worktrees/task-{{timestamp}}`   |
| 機能         | {{機能成果物}}           | {{パス}}                          |
| ドキュメント | {{ドキュメント成果物}}   | {{パス}}                          |
| 品質         | {{テスト・品質レポート}} | {{パス}}                          |
| PR           | GitHub Pull Request      | GitHub UI                         |

---

## 参照ファイル

本仕様書のコマンド選定は以下を参照：

- `docs/00-requirements/master_system_design.md` - システム要件
- `.claude/commands/ai/command_list.md` - /ai:コマンド定義
- `.kamui/prompt/merge-prompt.txt` - Git/PRワークフロー

---

## タスク分解サマリー

| ID     | フェーズ   | サブタスク名 | 責務   | 依存 |
| ------ | ---------- | ------------ | ------ | ---- |
| T--1-1 | Phase -1   | {{名称}}     | {{責務}} | -    |
| T-00-1 | Phase 0    | {{名称}}     | {{責務}} | T--1 |
| T-01-1 | Phase 1    | {{名称}}     | {{責務}} | T-00 |
| ...    | ...        | ...          | ...    | ...  |

**総サブタスク数**: {{サブタスク数}}個

---

## 実行フロー図

```mermaid
graph TD
    START[タスク開始] --> T--1[Phase -1: 環境準備]
    T--1 --> T-00[Phase 0: 要件定義]
    T-00 --> T-01[Phase 1: 設計]
    T-01 --> T-02[Phase 2: 設計レビューゲート]
    T-02 --> T-03[Phase 3: テスト作成]
    T-03 --> T-04[Phase 4: 実装]
    T-04 --> T-05[Phase 5: リファクタリング]
    T-05 --> T-06[Phase 6: 品質保証]
    T-06 --> T-07[Phase 7: 最終レビューゲート]
    T-07 --> T-08[Phase 8: 手動テスト]
    T-08 --> T-09[Phase 9: ドキュメント更新]
    T-09 --> T-10[Phase 10: PR作成・CI確認]
    T-10 --> END[マージ準備完了]

    T-02 -->|MAJOR| T-01
    T-02 -->|MAJOR: 要件| T-00
    T-07 -->|MAJOR| T-05
    T-07 -->|MAJOR: 実装| T-04
    T-07 -->|MAJOR: テスト| T-03
    T-07 -->|MAJOR: 設計| T-01
    T-07 -->|CRITICAL| T-00
````

---

## Phase -1: 環境準備（Git Worktree作成）

### T--1-1: Git Worktree環境作成・初期化

#### 目的

タスク実装用の独立したGit Worktree環境を作成し、本体ブランチに影響を与えずに開発を進める。

#### 背景

複数タスクの並行開発や実験的な変更のため、各タスクごとに独立したWorktreeで作業を行う必要がある。

#### 責務（単一責務）

Git Worktree環境の作成と初期化のみを担当する。

#### 実行手順

```bash
# 1. タスク識別子生成
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
WORKTREE_NAME="task-${TIMESTAMP}"

# 2. Worktree作成
git worktree add .worktrees/${WORKTREE_NAME} -b ${WORKTREE_NAME}

# 3. 作業ディレクトリ移動
cd .worktrees/${WORKTREE_NAME}

# 4. 依存関係インストール
pnpm install

# 5. ビルド確認
pnpm build
```

#### 完了条件

- [ ] Git Worktreeが正常に作成されている
- [ ] 新規ブランチが作成されている
- [ ] Worktreeディレクトリへ移動済み
- [ ] 依存関係がインストールされている
- [ ] ビルドが成功する

---

## Phase 0〜Phase 10

各Phaseの詳細は `references/phase-templates.md` を参照。

---

## 使用方法

1. ユーザー要求を分析
2. タスクID・Worktree名を生成
3. `{{変数}}` を実際の値で置換
4. タスク分解サマリーを作成
5. 各Phaseの詳細を `phase-templates.md` から展開
6. `docs/30-workflows/{{機能名}}/task-{{機能名}}.md` に出力

```

---

## Phase番号対応表（仕様書 vs スキル）

| 仕様書Phase | スキルPhase | 名称                   |
| ----------- | ----------- | ---------------------- |
| Phase -1    | （なし）    | 環境準備（Git Worktree） |
| Phase 0     | Phase 1     | 要件定義               |
| Phase 1     | Phase 2     | 設計                   |
| Phase 2     | Phase 3     | 設計レビューゲート     |
| Phase 3     | Phase 4     | テスト作成             |
| Phase 4     | Phase 5     | 実装                   |
| Phase 5     | Phase 6     | リファクタリング       |
| Phase 6     | Phase 7     | 品質保証               |
| Phase 7     | Phase 8     | 最終レビューゲート     |
| Phase 8     | Phase 9     | 手動テスト             |
| Phase 9     | Phase 10    | ドキュメント更新       |
| Phase 10    | Phase 11    | PR作成                 |

**注意**: スキルではPhase -1を省略し、Phase 1から開始している。
Git Worktree環境はタスク開始時に別途準備すること。
```
