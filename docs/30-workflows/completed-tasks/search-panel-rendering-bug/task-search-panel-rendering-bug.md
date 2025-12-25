# 検索パネル レンダリング不具合修正 - タスク実行仕様書

## ユーザーからの元の指示

```
@docs/30-workflows/unassigned-task/task-search-panel-rendering-bug.md   これを実装するために、次のプロンプトに従ってタスク仕様書を作成してください。タスクの実行に関しては、勝手に進めずにタスクの仕様書を作成するだけでOKです。今回やってといった内容以外に関しては、勝手に進めないようにしておいてください。 @docs/00-requirements/task-orchestration-specification.md
```

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | BUG-SEARCH-001                                  |
| Worktreeパス | `.worktrees/task-YYYYMMDD-HHMMSS-<hash>`        |
| ブランチ名   | `task-YYYYMMDD-HHMMSS-<hash>`                   |
| タスク名     | ファイル内検索パネル レンダリング不具合修正     |
| 分類         | バグ修正                                        |
| 対象機能     | UnifiedSearchPanel, FileSearchPanel, EditorView |
| 優先度       | 高                                              |
| 見積もり規模 | 小規模                                          |
| ステータス   | 未実施                                          |
| 作成日       | 2025-12-24                                      |

---

## タスク概要

### 目的

ファイル選択中にCmd+F/Cmd+Tでファイル内検索・置換パネルが表示されない問題を解消し、検索オプション・ナビゲーションを含むUIが正しく描画される状態にする。

### 背景

検索/置換機能のUI実装完了後の手動テストで、ファイル内検索・置換パネルが表示されない不具合が確認された。UnifiedSearchPanelにデバッグ表示を追加済みだが、`currentFilePath`の伝播やレンダリング条件に問題がある可能性がある。

### 最終ゴール

- ファイル選択状態でCmd+Fを押すと検索窓が表示される
- ファイル選択状態でCmd+Tを押すと検索窓・置換窓が表示される
- 検索オプションボタン（Aa, Ab, .\*）とナビゲーションボタン（↑↓）が表示される
- ワークスペース検索/ファイル名検索に影響を与えない

### 成果物一覧

| 種別         | 成果物                   | 配置先                                                                                             |
| ------------ | ------------------------ | -------------------------------------------------------------------------------------------------- |
| 環境         | Git Worktree環境         | `.worktrees/task-YYYYMMDD-HHMMSS-<hash>`                                                           |
| 機能         | 検索パネル修正コード     | `apps/desktop/src/renderer/components/organisms/SearchPanel/UnifiedSearchPanel.tsx`                |
| 機能         | 検索パネル修正コード     | `apps/desktop/src/renderer/components/organisms/SearchPanel/FileSearchPanel.tsx`                   |
| 機能         | 参照状態更新（必要時）   | `apps/desktop/src/renderer/views/EditorView/index.tsx`                                             |
| テスト       | 追加/修正したUIテスト    | `apps/desktop/src/renderer/components/organisms/SearchPanel/__tests__/UnifiedSearchPanel.test.tsx` |
| テスト       | 追加/修正したUIテスト    | `apps/desktop/src/renderer/components/organisms/SearchPanel/__tests__/FileSearchPanel.test.tsx`    |
| ドキュメント | 要件・設計・レビュー関連 | `docs/30-workflows/search-panel-rendering-bug/`                                                    |
| ドキュメント | 要件更新                 | `docs/00-requirements/19-search-panel-rendering-bugfix.md`                                         |
| PR           | GitHub Pull Request      | GitHub UI                                                                                          |

---

## 参照ファイル

本仕様書のコマンド・エージェント・スキル選定は以下を参照：

- `docs/00-requirements/master_system_design.md` - システム要件
- `.claude/commands/ai/command_list.md` - /ai:コマンド定義
- `.claude/agents/agent_list.md` - エージェント定義
- `.claude/skills/skill_list.md` - スキル定義
- `.kamui/prompt/merge-prompt.txt` - Git/PRワークフロー
- `docs/30-workflows/unassigned-task/task-search-panel-rendering-bug.md` - 元タスク指示書

---

## タスク分解サマリー

| ID     | フェーズ | サブタスク名     | 責務                            | 依存   |
| ------ | -------- | ---------------- | ------------------------------- | ------ |
| T--1-1 | Phase -1 | Worktree作成     | 独立環境の準備                  | なし   |
| T-00-1 | Phase 0  | 要件整理         | 受け入れ基準・スコープ整理      | T--1-1 |
| T-01-1 | Phase 1  | 設計整理         | 状態/レンダリング条件の設計     | T-00-1 |
| T-02-1 | Phase 2  | 設計レビュー     | 設計妥当性の確認                | T-01-1 |
| T-03-1 | Phase 3  | テスト作成       | UIテスト追加（Red）             | T-02-1 |
| T-04-1 | Phase 4  | 実装             | レンダリング不具合修正（Green） | T-03-1 |
| T-05-1 | Phase 5  | リファクタ       | 変更点の整理（Refactor）        | T-04-1 |
| T-06-1 | Phase 6  | 品質保証         | Lint/型/テスト確認              | T-05-1 |
| T-07-1 | Phase 7  | 最終レビュー     | 品質/影響範囲の最終確認         | T-06-1 |
| T-08-1 | Phase 8  | 手動テスト       | Cmd+F/Cmd+T動作確認             | T-07-1 |
| T-09-1 | Phase 9  | ドキュメント更新 | 要件・履歴記録                  | T-08-1 |
| T-10-1 | Phase 10 | コミット作成     | 変更の記録                      | T-09-1 |
| T-10-2 | Phase 10 | PR作成/CI確認    | PR発行とCI確認                  | T-10-1 |

**総サブタスク数**: 13個

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
```

---

## Phase -1: 環境準備（Git Worktree作成）

### T--1-1: Git Worktree環境作成・初期化

#### 目的

タスク実装用の独立したGit Worktree環境を作成し、本体ブランチに影響を与えずに開発を進める。

#### 背景

並行開発による衝突を避け、レビューや差分管理を明確化するためにWorktreeを使用する。

#### 責務（単一責務）

Git Worktreeの作成と初期化のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
なし（Worktree作成はシェルコマンドで実施）
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/devops-eng.md`
- **選定理由**: Git運用と環境構築の専門性が高いため
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名 | 活用方法                        |
| -------- | ------------------------------- |
| なし     | Worktree構築は標準Git手順に従う |

- **参照**: `.claude/skills/skill_list.md`

#### 実行手順

```bash
TASK_NAME="fix/search-panel-rendering-bug"
WORKTREE_DIR=".worktrees/${TASK_NAME##*/}"
git worktree add "${WORKTREE_DIR}" -b "${TASK_NAME}" main
cd "${WORKTREE_DIR}"
```

#### 成果物

| 成果物       | パス                                     | 内容                          |
| ------------ | ---------------------------------------- | ----------------------------- |
| Worktree環境 | `.worktrees/task-YYYYMMDD-HHMMSS-<hash>` | 独立ブランチ/作業ディレクトリ |

#### 完了条件

- [ ] Worktreeが作成済み
- [ ] ブランチが作成済み
- [ ] Worktreeへ移動済み

#### 依存関係

- **前提**: なし
- **後続**: T-00-1

---

## Phase 0: 要件定義

### T-00-1: 要件整理（受け入れ基準・スコープ）

#### 目的

不具合の再現条件・影響範囲・受け入れ基準を明文化する。

#### 背景

実装前に期待結果を合意し、修正範囲の逸脱を防止するため。

#### 責務（単一責務）

要件と受け入れ基準の整理のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:create-user-stories search-panel-rendering-bug
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/req-analyst.md`
- **選定理由**: バグ修正の要件と受け入れ基準の定義に最適
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名 | 活用方法                                   |
| -------- | ------------------------------------------ |
| なし     | 受け入れ基準は既存タスク指示書を基準に整理 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物           | パス                                                                       | 内容                       |
| ---------------- | -------------------------------------------------------------------------- | -------------------------- |
| 要件ドキュメント | `docs/30-workflows/search-panel-rendering-bug/task-step00-requirements.md` | 目的/スコープ/受け入れ基準 |

#### 完了条件

- [ ] 受け入れ基準が明記されている
- [ ] スコープ（含む/含まない）が明記されている
- [ ] 影響範囲が整理されている

#### 依存関係

- **前提**: T--1-1
- **後続**: T-01-1

---

## Phase 1: 設計

### T-01-1: レンダリング条件・状態フロー設計

#### 目的

FileSearchPanelが表示される条件と状態の流れを明確化する。

#### 背景

`currentFilePath`の更新経路や条件分岐が不明確なまま修正すると再発の可能性が高まるため。

#### 責務（単一責務）

状態/レンダリング条件の設計を整理する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:write-spec search-panel-rendering-bug
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/ui-designer.md`
- **選定理由**: UI構成と表示条件の設計に最適
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                        | 活用方法                        |
| ----------------------------------------------- | ------------------------------- |
| `.claude/skills/electron-architecture/SKILL.md` | Renderer側の状態/描画責務の整理 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物           | パス                                                                 | 内容                   |
| ---------------- | -------------------------------------------------------------------- | ---------------------- |
| 設計ドキュメント | `docs/30-workflows/search-panel-rendering-bug/task-step01-design.md` | 状態遷移/条件/修正方針 |

#### 完了条件

- [ ] `currentFilePath`の取得元と更新経路が明記されている
- [ ] FileSearchPanelの表示条件が明記されている
- [ ] 影響範囲（SearchPanel/EditorView）が明確

#### 依存関係

- **前提**: T-00-1
- **後続**: T-02-1

---

## Phase 2: 設計レビューゲート

### T-02-1: 設計レビュー

#### 目的

設計の妥当性と影響範囲を複数エージェントで検証する。

#### 背景

設計ミスによる手戻りを防止するため。

#### レビュー参加エージェント

| エージェント                      | レビュー観点            | 選定理由                         |
| --------------------------------- | ----------------------- | -------------------------------- |
| `.claude/agents/ui-designer.md`   | UI構成/表示条件の妥当性 | UI構造と表示ロジックの確認に最適 |
| `.claude/agents/state-manager.md` | 状態管理/更新経路       | 状態伝播の不整合検出に強い       |
| `.claude/agents/arch-police.md`   | 依存関係/責務分離       | レイヤー違反の検出               |

- **参照**: `.claude/agents/agent_list.md`

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:review-architecture renderer-search-panel
```

- **参照**: `.claude/commands/ai/command_list.md`

#### レビューチェックリスト

**UI表示条件** (`.claude/agents/ui-designer.md`)

- [ ] FileSearchPanelの表示条件が明確
- [ ] ユーザー操作フローと一致

**状態管理** (`.claude/agents/state-manager.md`)

- [ ] `currentFilePath`の更新経路が一貫
- [ ] 不要なnull判定や分岐がない

**依存関係/責務** (`.claude/agents/arch-police.md`)

- [ ] SearchPanelの責務が過剰に拡張されていない
- [ ] EditorViewとの責務境界が維持されている

#### レビュー結果

- **判定**: 未実施
- **指摘事項**: 未記入
- **対応方針**: 未記入

#### 戻り先決定（MAJORの場合）

| 問題の種類       | 戻り先  |
| ---------------- | ------- |
| 要件の問題       | Phase 0 |
| 設計の問題       | Phase 1 |
| テスト設計の問題 | Phase 3 |
| 実装の問題       | Phase 4 |

#### 完了条件

- [ ] 全レビュー観点で問題なし
- [ ] 指摘がある場合は対応方針が明確

#### 依存関係

- **前提**: T-01-1
- **後続**: T-03-1

---

## Phase 3: テスト作成 (TDD: Red)

### T-03-1: SearchPanelの表示条件テスト追加

#### 目的

FileSearchPanel/UnifiedSearchPanelの表示条件をテストで固定する。

#### 背景

再発防止のため、表示条件を自動テストで検証できる状態にする必要がある。

#### 責務（単一責務）

UIコンポーネントテストの追加のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:generate-component-tests apps/desktop/src/renderer/components/organisms/SearchPanel/UnifiedSearchPanel.tsx
/ai:generate-component-tests apps/desktop/src/renderer/components/organisms/SearchPanel/FileSearchPanel.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/frontend-tester.md`
- **選定理由**: React/Vitest/RTLのUIテスト設計に最適
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                   | 活用方法                 |
| ------------------------------------------ | ------------------------ |
| `.claude/skills/frontend-testing/SKILL.md` | RTL/Vitestのテスト設計   |
| `.claude/skills/test-doubles/SKILL.md`     | 状態・ストアのモック戦略 |
| `.claude/skills/vitest-advanced/SKILL.md`  | テスト実行とマッチャ活用 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物     | パス                                                                                               | 内容                          |
| ---------- | -------------------------------------------------------------------------------------------------- | ----------------------------- |
| テスト更新 | `apps/desktop/src/renderer/components/organisms/SearchPanel/__tests__/UnifiedSearchPanel.test.tsx` | file mode時の表示条件テスト   |
| テスト更新 | `apps/desktop/src/renderer/components/organisms/SearchPanel/__tests__/FileSearchPanel.test.tsx`    | filePathあり/なしの表示テスト |

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/desktop test:run -- SearchPanel
```

- [ ] 追加したテストが失敗することを確認（Red状態）

#### 完了条件

- [ ] 追加したテストがRedで失敗する
- [ ] 期待結果が明確なアサーションになっている

#### 依存関係

- **前提**: T-02-1
- **後続**: T-04-1

---

## Phase 4: 実装 (TDD: Green)

### T-04-1: SearchPanelレンダリング修正

#### 目的

FileSearchPanel/UnifiedSearchPanelが正しく描画されるように修正する。

#### 背景

Cmd+F/Cmd+Tで検索窓が表示されないため、主要ユースケースが成立していない。

#### 責務（単一責務）

レンダリング不具合の修正のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:debug-error "FileSearchPanel not rendering despite currentFilePath"
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/electron-ui-dev.md`
- **選定理由**: ElectronレンダラーUIの修正に適任
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                        | 活用方法             |
| ----------------------------------------------- | -------------------- |
| `.claude/skills/electron-architecture/SKILL.md` | Renderer側の責務維持 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物     | パス                                                                                | 内容                             |
| ---------- | ----------------------------------------------------------------------------------- | -------------------------------- |
| 修正コード | `apps/desktop/src/renderer/components/organisms/SearchPanel/UnifiedSearchPanel.tsx` | file mode表示条件の修正          |
| 修正コード | `apps/desktop/src/renderer/components/organisms/SearchPanel/FileSearchPanel.tsx`    | 表示/propsの整合性修正           |
| 修正コード | `apps/desktop/src/renderer/views/EditorView/index.tsx`                              | filePath更新経路の修正（必要時） |

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/desktop test:run -- SearchPanel
```

- [ ] テストが成功することを確認（Green状態）

#### 完了条件

- [ ] fileモードでFileSearchPanelが表示される
- [ ] 追加テストがGreenで成功する

#### 依存関係

- **前提**: T-03-1
- **後続**: T-05-1

---

## Phase 5: リファクタリング (TDD: Refactor)

### T-05-1: SearchPanelの条件分岐整理

#### 目的

修正後の条件分岐や状態依存を整理し、可読性を高める。

#### 背景

局所的な修正で条件分岐が肥大化すると再発リスクが上がるため。

#### 責務（単一責務）

レンダリング条件の整理・軽微なリファクタのみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:refactor apps/desktop/src/renderer/components/organisms/SearchPanel/UnifiedSearchPanel.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/code-quality.md`
- **選定理由**: 条件分岐整理とコード品質改善に最適
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                       | 活用方法             |
| ---------------------------------------------- | -------------------- |
| `.claude/skills/code-smell-detection/SKILL.md` | 条件分岐の複雑度確認 |
| `.claude/skills/solid-principles/SKILL.md`     | SRP維持              |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物               | パス                                                                                | 内容           |
| -------------------- | ----------------------------------------------------------------------------------- | -------------- |
| リファクタ済みコード | `apps/desktop/src/renderer/components/organisms/SearchPanel/UnifiedSearchPanel.tsx` | 条件分岐の整理 |

#### TDD検証: 継続Green確認

```bash
pnpm --filter @repo/desktop test:run -- SearchPanel
```

- [ ] リファクタリング後もテストが成功することを確認

#### 完了条件

- [ ] 条件分岐が読みやすく整理されている
- [ ] テストがGreenで継続している

#### 依存関係

- **前提**: T-04-1
- **後続**: T-06-1

---

## Phase 6: 品質保証

### T-06-1: Lint/型/テストの品質確認

#### 目的

変更による品質劣化や回帰がないことを確認する。

#### 背景

UI変更による副作用や型エラーを事前に検知する必要があるため。

#### 責務（単一責務）

品質ゲートの検証のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:lint
/ai:run-all-tests --coverage
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/code-quality.md`
- **選定理由**: Lint/型/テスト観点の品質管理に最適
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                   | 活用方法                |
| ------------------------------------------ | ----------------------- |
| `.claude/skills/static-analysis/SKILL.md`  | Lint/静的解析の観点整理 |
| `.claude/skills/frontend-testing/SKILL.md` | テスト結果の評価        |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物       | パス                                                                         | 内容                  |
| ------------ | ---------------------------------------------------------------------------- | --------------------- |
| 品質レポート | `docs/30-workflows/search-panel-rendering-bug/task-step06-quality-report.md` | Lint/テスト結果の記録 |

#### 完了条件

- [ ] Lintエラーがない
- [ ] 型エラーがない
- [ ] テストが成功している

#### 依存関係

- **前提**: T-05-1
- **後続**: T-07-1

---

## 品質ゲートチェックリスト

### 機能検証

- [ ] SearchPanel関連テスト成功

### コード品質

- [ ] Lintエラーなし
- [ ] 型エラーなし

### テスト網羅性

- [ ] 追加テストが意図した条件を検証している

### セキュリティ

- [ ] 既存のセキュリティ設定に影響がない

---

## Phase 7: 最終レビューゲート

### T-07-1: 最終レビュー

#### 目的

実装・テスト・品質の最終確認を行う。

#### 背景

マージ前に影響範囲と品質を確認する必要があるため。

#### レビュー参加エージェント

| エージェント                        | レビュー観点   | 選定理由                     |
| ----------------------------------- | -------------- | ---------------------------- |
| `.claude/agents/ui-designer.md`     | UI表示・操作性 | ユーザー操作視点の妥当性確認 |
| `.claude/agents/code-quality.md`    | 変更点の品質   | リファクタ後の品質評価       |
| `.claude/agents/frontend-tester.md` | テスト妥当性   | テストの網羅性確認           |

- **参照**: `.claude/agents/agent_list.md`

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:code-review-complete apps/desktop/src/renderer/components/organisms/SearchPanel
```

- **参照**: `.claude/commands/ai/command_list.md`

#### レビューチェックリスト

**UI/UX** (`.claude/agents/ui-designer.md`)

- [ ] 検索/置換パネルが期待通りに表示される
- [ ] 既存のワークスペース検索に影響なし

**品質** (`.claude/agents/code-quality.md`)

- [ ] 条件分岐が簡潔
- [ ] 不要なデバッグ表示が残っていない

**テスト** (`.claude/agents/frontend-tester.md`)

- [ ] テストが不安定になっていない
- [ ] 重要な表示条件がカバーされている

#### レビュー結果

- **判定**: 未実施
- **指摘事項**: 未記入
- **対応方針**: 未記入
- **未完了タスク数**: 0件

#### 戻り先決定（MAJOR/CRITICALの場合）

| 問題の種類   | 戻り先  |
| ------------ | ------- |
| 要件の問題   | Phase 0 |
| 設計の問題   | Phase 1 |
| テストの問題 | Phase 3 |
| 実装の問題   | Phase 4 |

#### 完了条件

- [ ] レビューでPASS判定
- [ ] 指摘対応が完了

#### 依存関係

- **前提**: T-06-1
- **後続**: T-08-1

---

## Phase 8: 手動テスト検証

### T-08-1: 検索パネル表示の手動確認

#### 目的

実際の操作で検索/置換パネルが表示されることを確認する。

#### 背景

自動テストでは確認できないUI表示と操作を担保するため。

#### テスト分類

UI/UXテスト

#### Claude Code スラッシュコマンド

```
なし（手動でテストケースを設計・実行）
```

#### 使用エージェント

- **エージェント**: `.claude/agents/frontend-tester.md`
- **選定理由**: 手動テストケースの設計とテスト実行手順の整理に適任
- **参照**: `.claude/agents/agent_list.md`
- **実行方法**: エージェントに「手動テストケースの設計」を依頼し、テストケース表を作成してもらう

#### 手動テストケース

| No  | カテゴリ | テスト項目               | 前提条件         | 操作手順    | 期待結果                 | 実行結果 | 備考 |
| --- | -------- | ------------------------ | ---------------- | ----------- | ------------------------ | -------- | ---- |
| 1   | UI       | Cmd+Fで検索窓表示        | ファイル選択済み | Cmd+Fを押す | 検索窓とオプションが表示 | 未実施   |      |
| 2   | UI       | Cmd+Tで置換窓表示        | ファイル選択済み | Cmd+Tを押す | 検索+置換窓が表示        | 未実施   |      |
| 3   | UI       | ナビゲーション表示       | 検索パネル表示中 | ↑↓を確認    | ナビゲーションが表示     | 未実施   |      |
| 4   | UI       | ワークスペース検索無影響 | 任意             | Cmd+Shift+F | 既存UIが正常表示         | 未実施   |      |

#### テスト実行手順

1. `pnpm --filter @repo/desktop dev` でアプリ起動
2. 左サイドバーでフォルダ追加
3. ファイルをクリックして選択
4. Cmd+Fを押して検索窓の表示を確認
5. Cmd+Tを押して検索・置換窓の表示を確認

#### 成果物

| 成果物         | パス                                                                      | 内容               |
| -------------- | ------------------------------------------------------------------------- | ------------------ |
| 手動テスト結果 | `docs/30-workflows/search-panel-rendering-bug/task-step08-manual-test.md` | 手動テスト結果記録 |

#### 完了条件

- [ ] 手動テストが全て実施済み
- [ ] 期待結果を満たしている

#### 依存関係

- **前提**: T-07-1
- **後続**: T-09-1

---

## Phase 9: ドキュメント更新・未完了タスク記録

### T-09-1: ドキュメント更新

#### 目的

修正内容を要件ドキュメントに反映する。

#### 前提条件

- [ ] Phase 6の品質ゲートをすべて通過
- [ ] Phase 7の最終レビューゲートを通過
- [ ] Phase 8の手動テストが完了
- [ ] すべてのテストが成功

---

#### サブタスク 9.1: システムドキュメント更新

##### 更新対象ドキュメント

- `docs/00-requirements/19-search-panel-rendering-bugfix.md`

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:update-all-docs
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/spec-writer.md`
- **選定理由**: ドキュメント品質の担保が必要
- **参照**: `.claude/agents/agent_list.md`

##### 更新原則

- 概要のみ記載（詳細実装は不要）
- 既存ドキュメント構造を維持
- Single Source of Truth原則を遵守

##### スキル同期（必要時）

```bash
python3 scripts/sync_requirements_to_skills.py
python3 scripts/update_skill_levels.py
```

---

#### サブタスク 9.2: 未完了タスク・追加タスク記録

##### 出力先

`docs/30-workflows/unassigned-task/`

##### 記録対象タスク一覧

- なし（本タスク内で完結）

##### Claude Code スラッシュコマンド

```
なし（未完了タスクなし）
```

##### 使用エージェント

- **エージェント**: `.claude/agents/spec-writer.md`
- **選定理由**: 指示書の品質統一

##### 活用スキル

| スキル名 | 活用方法                       |
| -------- | ------------------------------ |
| なし     | 未完了タスクがないため使用なし |

---

#### 完了条件

- [ ] 要件ドキュメントが更新されている
- [ ] 未完了タスクがないことを記録

---

## Phase 10: PR作成・CI確認・マージ準備

### T-10-1: 差分確認・コミット作成

#### 目的

変更内容をConventional Commits形式でコミットする。

#### 背景

変更内容を追跡可能にし、PR作成の準備を整えるため。

#### 責務（単一責務）

差分確認とコミット作成のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:commit "fix(renderer): resolve search panel rendering"
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/prompt-eng.md`
- **選定理由**: コミットメッセージの自動生成に適任
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                      | 活用方法                 |
| --------------------------------------------- | ------------------------ |
| `.claude/skills/semantic-versioning/SKILL.md` | Conventional Commits整形 |

- **参照**: `.claude/skills/skill_list.md`

#### 完了条件

- [ ] Conventional Commits形式でコミット作成済み
- [ ] Claude Code署名が含まれている

#### 依存関係

- **前提**: T-09-1
- **後続**: T-10-2

---

### T-10-2: PR作成・CI確認

#### 目的

GitHub PRを作成し、CI完了後にマージ可能を通知する。

#### 背景

レビューとマージ準備を進めるため。

#### 責務（単一責務）

PR作成とCI確認のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:create-pr main
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/devops-eng.md`
- **選定理由**: PR作成/CI確認の専門性
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                           | 活用方法         |
| -------------------------------------------------- | ---------------- |
| `.claude/skills/semantic-versioning/SKILL.md`      | PRタイトルの命名 |
| `.claude/skills/markdown-advanced-syntax/SKILL.md` | PR本文の整形     |

- **参照**: `.claude/skills/skill_list.md`

#### 完了条件

- [ ] PRが作成されている
- [ ] CIが完了し、ユーザーにマージ可能を通知

#### 依存関係

- **前提**: T-10-1
- **後続**: なし

---

## 完了条件チェックリスト

### 機能要件

- [ ] Cmd+Fで検索窓が表示される
- [ ] Cmd+Tで検索窓・置換窓が表示される
- [ ] 検索オプション/ナビゲーションが表示される
- [ ] 他の検索機能に影響がない

### 品質要件

- [ ] Lint/型/テストが成功
- [ ] UIテストが追加されている

### ドキュメント要件

- [ ] 要件ドキュメント更新
- [ ] 手動テスト記録が残っている

---

## 検証方法

### テストケース

- FileSearchPanel/UnifiedSearchPanelの表示条件テスト
- Cmd+F/Cmd+Tの手動テスト

### 検証手順

1. `pnpm --filter @repo/desktop test:run -- SearchPanel` を実行
2. `pnpm --filter @repo/desktop dev` でアプリを起動
3. ファイル選択後にCmd+F/Cmd+Tを確認

---

## リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                              |
| ---------------------- | ------ | -------- | --------------------------------- |
| 状態更新経路の見落とし | 中     | 中       | 設計レビューで更新経路を確認      |
| UIテストの不安定化     | 中     | 低       | frontend-testerでテスト設計を確認 |
| 他の検索UIへの影響     | 中     | 低       | 既存テストと手動テストで確認      |

---

## 参照情報

### 関連ドキュメント

- `docs/30-workflows/unassigned-task/task-search-panel-rendering-bug.md`
- `docs/00-requirements/task-orchestration-specification.md`

### 参考資料

- `apps/desktop/src/renderer/components/organisms/SearchPanel/UnifiedSearchPanel.tsx`
- `apps/desktop/src/renderer/components/organisms/SearchPanel/FileSearchPanel.tsx`
- `apps/desktop/src/renderer/views/EditorView/index.tsx`

---

## 備考

### デバッグ状況

UnifiedSearchPanelにデバッグ行（`DEBUG: mode=xxx, filePath=xxx`）が追加済み。修正後は不要なデバッグ表示を削除する。
