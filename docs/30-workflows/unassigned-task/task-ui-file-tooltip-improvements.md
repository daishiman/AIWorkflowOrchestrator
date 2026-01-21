# ファイルホバー時ツールチップ表示機能 - タスク指示書

## メタ情報

```yaml
issue_number: 379
```

## メタ情報

| 項目             | 内容                                       |
| ---------------- | ------------------------------------------ |
| タスクID         | TASK-UI-TOOLTIP-001                        |
| タスク名         | ファイルホバー時のツールチップ表示機能追加 |
| 分類             | 改善                                       |
| 対象機能         | ファイルツリー・ファイル選択UI             |
| 優先度           | 中                                         |
| 見積もり規模     | 小規模                                     |
| ステータス       | 未実施                                     |
| 発見元           | ユーザーフィードバック                     |
| 発見日           | 2025-12-23                                 |
| 発見エージェント | ユーザー                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在のファイルツリーおよびファイル選択UIでは、ファイル名が長い場合や深い階層にあるファイルの場合、以下の問題が発生しています：

- ファイル名が省略表示され、フルパスが分からない
- どのディレクトリに属しているか即座に判断できない
- ファイル選択時に正しいファイルかどうか確認が困難

### 1.2 問題点・課題

**現状の問題**:

1. **ファイル名の視認性不足**: 長いファイル名が`...`で省略される
2. **パス情報の欠如**: ファイルの絶対パス・相対パスが分からない
3. **操作効率の低下**: ファイル確認のために別操作（クリック等）が必要
4. **誤操作リスク**: 類似ファイル名で誤ったファイルを選択する可能性

**影響を受けるUI**:

- ファイルツリー（サイドバー）
- ファイル選択ダイアログ
- ワークフロー設定のファイルパス入力
- プラグイン設定のファイル選択

### 1.3 放置した場合の影響

- **ユーザビリティ低下**: ファイル操作のたびにストレスを感じる
- **作業効率の悪化**: ファイル確認に余分な時間がかかる
- **誤操作の増加**: 間違ったファイルを選択してエラーが発生
- **アクセシビリティ問題**: 視覚的にパスを確認する手段がない

---

## 2. 何を達成するか（What）

### 2.1 目的

ファイルツリーおよびファイル選択UI上で、ファイルにマウスホバーした際に、
ファイル名とフルパスをツールチップで表示し、ユーザビリティを向上させる。

### 2.2 最終ゴール

ユーザーがファイルにカーソルを合わせるだけで、以下の情報がツールチップで即座に表示される状態：

- ファイル名（フル表示）
- 絶対パスまたはプロジェクトルートからの相対パス
- ファイルサイズ（オプション）
- 最終更新日時（オプション）

### 2.3 スコープ

#### 含むもの

- ファイルツリーコンポーネントへのツールチップ追加
- ファイル選択ダイアログへのツールチップ追加
- ツールチップの表示遅延設定（ホバー後0.5秒など）
- ツールチップのスタイリング（ダークモード対応）
- パス表示形式の選択（絶対パス/相対パス）
- ツールチップコンポーネントの作成・テスト

#### 含まないもの

- ディレクトリに対するツールチップ（Phase 1で検討）
- ファイルプレビュー機能（別タスク）
- ファイル検索機能の改善（別タスク）
- コンテキストメニューの追加（別タスク）

### 2.4 成果物

| 成果物                    | 配置先                                                           | 内容                           |
| ------------------------- | ---------------------------------------------------------------- | ------------------------------ |
| Tooltipコンポーネント     | `apps/desktop/src/renderer/components/ui/Tooltip.tsx`            | 汎用ツールチップコンポーネント |
| FileTooltipコンポーネント | `apps/desktop/src/renderer/components/FileTree/FileTooltip.tsx`  | ファイル専用ツールチップ       |
| FileTreeアイテム改善      | `apps/desktop/src/renderer/components/FileTree/FileTreeItem.tsx` | ツールチップ統合               |
| ユニットテスト            | `apps/desktop/src/renderer/components/ui/Tooltip.test.tsx`       | Tooltipコンポーネントテスト    |
| E2Eテスト                 | `apps/desktop/e2e/file-tooltip.spec.ts`                          | ツールチップ表示のE2Eテスト    |
| ドキュメント              | `docs/00-requirements/16-ui-ux-guidelines.md`                    | UI/UXガイドラインへの追記      |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- ファイルツリーコンポーネントが実装済みであること
- Reactコンポーネントの基本的な知識
- Tailwind CSS の使用経験
- Electron環境でのReact開発の理解

### 3.2 依存タスク

なし（独立したUI改善タスク）

### 3.3 必要な知識・スキル

**技術スタック**:

- React 18.x（hooks、コンポーネント設計）
- TypeScript 5.x（型安全なProps設計）
- Tailwind CSS（スタイリング）
- Vitest（ユニットテスト）
- Playwright（E2Eテスト）

**設計パターン**:

- Compound Component Pattern（ツールチップの柔軟な使用）
- Custom Hooks（useTooltip）
- アクセシビリティ（ARIA属性）

### 3.4 推奨アプローチ

**Phase 1: Tooltipコンポーネント設計**

- 汎用的なTooltipコンポーネントを作成（再利用可能）
- Headless UI / Radix UIのTooltipを参考にする
- ポジション調整（上下左右自動判定）

**Phase 2: FileTreeへの統合**

- FileTreeItemコンポーネントにツールチップを追加
- ホバー時にファイル情報を取得するhooks作成
- パフォーマンス最適化（遅延ロード）

**Phase 3: スタイリング**

- ダークモード対応
- アニメーション（フェードイン/アウト）
- Z-index調整（最前面表示）

---

## 4. 実行手順

### Phase構成

```
Phase -1: Git Worktree環境準備
Phase 0: 要件定義
Phase 1: UI設計
Phase 2: 設計レビューゲート
Phase 3: テスト作成（TDD: Red）
Phase 4: 実装（TDD: Green）
Phase 5: リファクタリング（TDD: Refactor）
Phase 6: 品質保証
Phase 7: 最終レビューゲート
Phase 8: 手動テスト検証
Phase 9: ドキュメント更新
Phase 10: PR作成・CI確認
```

---

## Phase -1: 環境準備（Git Worktree作成）

### T--1-1: Git Worktree環境作成・初期化

#### 目的

タスク実装用の独立したGit Worktree環境を作成し、本体ブランチに影響を与えずに開発を進める。

#### 実行手順

```bash
# 1. タスク識別子の生成
TASK_ID="task-$(date +%s)-$(openssl rand -hex 4)"
echo "Generated Task ID: $TASK_ID"

# 2. Git Worktreeの作成
WORKTREE_PATH=".worktrees/$TASK_ID"
git worktree add "$WORKTREE_PATH" -b "feature/file-tooltip-ui"

# 3. Worktreeディレクトリへ移動
cd "$WORKTREE_PATH"
pwd

# 4. 依存関係インストール
pnpm install

# 5. ビルド確認
pnpm --filter @repo/desktop build
```

#### 完了条件

- [ ] Git Worktreeが正常に作成されている
- [ ] 新規ブランチ `feature/file-tooltip-ui` が作成されている
- [ ] Worktreeディレクトリへ移動済み
- [ ] 依存関係がインストールされている
- [ ] ビルドが成功する

---

## Phase 0: 要件定義

### T-00-1: ツールチップ表示要件定義

#### 目的

ファイルホバー時のツールチップ表示仕様を明確化する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:define-requirements
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/ui-designer.md
- **選定理由**: UI/UX設計の専門家。ユーザビリティ向上施策の要件定義に最適
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                       | 活用方法                                           |
| ---------------------------------------------- | -------------------------------------------------- |
| .claude/skills/accessibility-wcag/SKILL.md     | ARIA属性・キーボード操作のアクセシビリティ要件定義 |
| .claude/skills/progressive-disclosure/SKILL.md | 情報の段階的開示（ホバー→詳細表示）の設計          |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物     | パス                                                | 内容                 |
| ---------- | --------------------------------------------------- | -------------------- |
| 要件定義書 | `docs/30-workflows/file-tooltip-ui/requirements.md` | ツールチップ表示仕様 |

#### 完了条件

- [ ] 表示する情報項目が定義されている（ファイル名、パス、サイズ等）
- [ ] 表示タイミング・遅延時間が定義されている
- [ ] ツールチップのポジショニング方針が定義されている
- [ ] アクセシビリティ要件が明記されている
- [ ] ダークモード対応方針が定義されている

---

## Phase 1: UI設計

### T-01-1: Tooltipコンポーネント設計

#### 目的

汎用的なTooltipコンポーネントの構造とAPIを設計する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:design-ui
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/ui-designer.md
- **選定理由**: コンポーネントAPI設計・再利用性を考慮した設計が得意
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                      | 活用方法                                   |
| --------------------------------------------- | ------------------------------------------ |
| .claude/skills/custom-hooks-patterns/SKILL.md | useTooltipカスタムフックの設計             |
| .claude/skills/type-safety-patterns/SKILL.md  | TypeScript型定義の設計（Props、State）     |
| .claude/skills/accessibility-wcag/SKILL.md    | ARIA属性の設計（role, aria-describedby等） |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物               | パス                                                    | 内容                                  |
| -------------------- | ------------------------------------------------------- | ------------------------------------- |
| コンポーネント設計書 | `docs/30-workflows/file-tooltip-ui/component-design.md` | Tooltip/FileTooltipコンポーネント設計 |
| 型定義設計           | `docs/30-workflows/file-tooltip-ui/type-definitions.md` | Props・State・Hooks型定義             |

#### 完了条件

- [ ] Tooltipコンポーネントのプロパティ定義が完了
- [ ] useTooltipフックの仕様が定義されている
- [ ] ポジショニングロジック（上下左右自動判定）が設計されている
- [ ] アクセシビリティ対応が設計に含まれている
- [ ] ダークモード対応が設計に含まれている

---

## Phase 2: 設計レビューゲート

### T-02-1: UI設計レビュー

#### 目的

実装前にUI設計の妥当性を検証し、ユーザビリティ・アクセシビリティの問題を早期発見する。

#### レビュー参加エージェント

| エージェント                      | レビュー観点         | 選定理由                                   |
| --------------------------------- | -------------------- | ------------------------------------------ |
| .claude/agents/ui-designer.md     | UI/UX設計の妥当性    | コンポーネント設計・ユーザビリティの専門家 |
| .claude/agents/frontend-tester.md | テスタビリティ       | テスト容易性の確認                         |
| .claude/agents/arch-police.md     | アーキテクチャ整合性 | 既存UIコンポーネントとの整合性確認         |

- **参照**: `.claude/agents/agent_list.md`

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:review-design
```

- **参照**: `.claude/commands/ai/command_list.md`

#### レビューチェックリスト

**UI/UX設計** (.claude/agents/ui-designer.md)

- [ ] ツールチップ表示タイミングは適切か（0.5秒遅延等）
- [ ] 表示内容は過不足ないか
- [ ] ポジション調整ロジックは適切か
- [ ] ダークモード対応が考慮されているか

**アクセシビリティ** (.claude/agents/ui-designer.md)

- [ ] ARIA属性が適切に設計されているか
- [ ] キーボード操作でも情報取得可能か
- [ ] スクリーンリーダー対応が考慮されているか

**テスタビリティ** (.claude/agents/frontend-tester.md)

- [ ] ユニットテストが書きやすい設計か
- [ ] E2Eテストで検証可能か
- [ ] モック化が容易か

**アーキテクチャ整合性** (.claude/agents/arch-police.md)

- [ ] 既存のUIコンポーネントとの一貫性があるか
- [ ] Atomic Design原則に従っているか
- [ ] 再利用性が高い設計か

#### 完了条件

- [ ] 全レビュー観点で問題なし（PASS）または軽微な指摘のみ（MINOR）
- [ ] 指摘事項があれば対応済み

---

## Phase 3: テスト作成（TDD: Red）

### T-03-1: Tooltipコンポーネントユニットテスト作成

#### 目的

期待される動作を検証するテストを実装より先に作成する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:generate-unit-tests
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/frontend-tester.md
- **選定理由**: Reactコンポーネントのテスト設計・実装の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                        | 活用方法                      |
| ----------------------------------------------- | ----------------------------- |
| .claude/skills/tdd-principles/SKILL.md          | TDDサイクルに基づくテスト設計 |
| .claude/skills/test-doubles/SKILL.md            | モック・スタブの活用          |
| .claude/skills/boundary-value-analysis/SKILL.md | 境界値テストケース設計        |

- **参照**: `.claude/skills/skill_list.md`

#### テストケース

**Tooltipコンポーネント**:

- [ ] ホバー時にツールチップが表示される
- [ ] ホバー解除時にツールチップが非表示になる
- [ ] 表示遅延時間が正しく動作する
- [ ] ポジション調整が正しく動作する（上下左右）
- [ ] ダークモード時にスタイルが切り替わる

**FileTooltipコンポーネント**:

- [ ] ファイル名が正しく表示される
- [ ] パスが正しく表示される
- [ ] 長いパスが適切に省略される

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/desktop test
```

- [ ] テストが失敗することを確認（Red状態）

#### 完了条件

- [ ] Tooltipコンポーネントのテストが作成されている
- [ ] FileTooltipコンポーネントのテストが作成されている
- [ ] テストを実行してRed状態を確認済み

---

### T-03-2: E2Eテスト作成

#### 目的

実際のユーザー操作（ホバー）を再現するE2Eテストを作成する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:generate-e2e-tests
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/e2e-tester.md
- **選定理由**: Playwright E2Eテストの専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                   | 活用方法                     |
| ------------------------------------------ | ---------------------------- |
| .claude/skills/playwright-testing/SKILL.md | E2Eテストシナリオ設計・実装  |
| .claude/skills/accessibility-wcag/SKILL.md | アクセシビリティテストケース |

- **参照**: `.claude/skills/skill_list.md`

#### テストケース

**ファイルツリーでのホバー**:

- [ ] ファイルにホバーするとツールチップが表示される
- [ ] ツールチップにファイル名が含まれる
- [ ] ツールチップにパスが含まれる
- [ ] ホバー解除でツールチップが消える

**ファイル選択ダイアログでのホバー**:

- [ ] ダイアログ内のファイルでもツールチップが表示される
- [ ] パス表示が正しい

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/desktop test:e2e
```

- [ ] E2Eテストが失敗することを確認（Red状態）

#### 完了条件

- [ ] E2Eテストが作成されている
- [ ] テストを実行してRed状態を確認済み

---

## Phase 4: 実装（TDD: Green）

### T-04-1: Tooltipコンポーネント実装

#### 目的

汎用的なTooltipコンポーネントを実装し、ユニットテストを通す。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:implement-ui
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/ui-designer.md
- **選定理由**: Reactコンポーネント実装の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                      | 活用方法             |
| --------------------------------------------- | -------------------- |
| .claude/skills/custom-hooks-patterns/SKILL.md | useTooltipフック実装 |
| .claude/skills/state-lifting/SKILL.md         | ツールチップ状態管理 |
| .claude/skills/accessibility-wcag/SKILL.md    | ARIA属性実装         |

- **参照**: `.claude/skills/skill_list.md`

#### 実装内容

**1. Tooltipコンポーネント作成**

- ファイル: `apps/desktop/src/renderer/components/ui/Tooltip.tsx`
- Props: `content`, `children`, `position`, `delay`
- ポジション自動調整機能

**2. useTooltipフック作成**

- ファイル: `apps/desktop/src/renderer/components/ui/useTooltip.ts`
- ホバー状態管理
- 遅延タイマー管理
- ポジション計算

**3. スタイリング**

- Tailwind CSSでダークモード対応
- アニメーション（opacity, transform）

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/desktop test
```

- [ ] Tooltipコンポーネントのテストが成功する（Green状態）

#### 完了条件

- [ ] Tooltipコンポーネントが実装されている
- [ ] useTooltipフックが実装されている
- [ ] ユニットテストが全て成功する

---

### T-04-2: FileTooltipコンポーネント実装

#### 目的

ファイル専用のツールチップコンポーネントを実装する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:implement-ui
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/ui-designer.md
- **選定理由**: ファイル情報表示UIの実装に最適
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                     | 活用方法           |
| -------------------------------------------- | ------------------ |
| .claude/skills/type-safety-patterns/SKILL.md | ファイル情報型定義 |

- **参照**: `.claude/skills/skill_list.md`

#### 実装内容

**1. FileTooltipコンポーネント作成**

- ファイル: `apps/desktop/src/renderer/components/FileTree/FileTooltip.tsx`
- Props: `filePath`, `fileName`, `fileSize`, `lastModified`
- Tooltipコンポーネントをラップ

**2. ファイル情報取得ロジック**

- IPC経由でファイル情報を取得（メインプロセス）
- キャッシュ機能（パフォーマンス最適化）

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/desktop test
```

- [ ] FileTooltipコンポーネントのテストが成功する（Green状態）

#### 完了条件

- [ ] FileTooltipコンポーネントが実装されている
- [ ] ファイル情報取得ロジックが実装されている
- [ ] ユニットテストが全て成功する

---

### T-04-3: FileTreeItem統合

#### 目的

既存のFileTreeItemコンポーネントにツールチップ機能を統合する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:implement-ui
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/ui-designer.md
- **選定理由**: 既存コンポーネントへの機能追加の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 実装内容

**1. FileTreeItemにツールチップ追加**

- ファイル: `apps/desktop/src/renderer/components/FileTree/FileTreeItem.tsx`
- FileTooltipでラップ
- ホバーイベント処理

**2. ファイル選択ダイアログにも適用**

- 該当コンポーネントを特定して統合

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:e2e
```

- [ ] 全テストが成功する（Green状態）
- [ ] E2Eテストが成功する

#### 完了条件

- [ ] FileTreeItemにツールチップが統合されている
- [ ] ファイル選択ダイアログにツールチップが統合されている
- [ ] 全テストが成功する

---

## Phase 5: リファクタリング（TDD: Refactor）

### T-05-1: コード品質改善

#### 目的

動作を変えずにコード品質を改善する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:refactor-code
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/code-quality.md
- **選定理由**: コード品質・可読性改善の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                       | 活用方法                                 |
| ---------------------------------------------- | ---------------------------------------- |
| .claude/skills/clean-code-practices/SKILL.md   | 命名改善・重複排除                       |
| .claude/skills/refactoring-techniques/SKILL.md | Extract Function等のリファクタリング技法 |

- **参照**: `.claude/skills/skill_list.md`

#### リファクタリング項目

- [ ] 重複コードの抽出・共通化
- [ ] 変数名・関数名の改善
- [ ] コメント追加（必要箇所のみ）
- [ ] Magic Numberの定数化
- [ ] 型定義の改善

#### TDD検証: 継続Green確認

```bash
pnpm --filter @repo/desktop test
```

- [ ] リファクタリング後もテストが成功することを確認

#### 完了条件

- [ ] リファクタリングが完了している
- [ ] テストが継続して成功する
- [ ] ESLintエラーなし

---

## Phase 6: 品質保証

### T-06-1: 品質チェック実行

#### 目的

定義された品質基準をすべて満たすことを検証する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:run-quality-checks
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/code-quality.md
- **選定理由**: 品質検証・メトリクス確認の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                     | 活用方法                 |
| -------------------------------------------- | ------------------------ |
| .claude/skills/code-smell-detection/SKILL.md | コード臭の検出           |
| .claude/skills/accessibility-wcag/SKILL.md   | アクセシビリティ基準確認 |

- **参照**: `.claude/skills/skill_list.md`

#### 品質ゲート

**機能検証**:

- [ ] 全ユニットテスト成功
- [ ] 全E2Eテスト成功

**コード品質**:

- [ ] ESLint エラー: 0件
- [ ] TypeScript エラー: 0件
- [ ] コードフォーマット適用済み

**テスト網羅性**:

- [ ] Tooltipコンポーネント カバレッジ: 90%以上
- [ ] FileTooltipコンポーネント カバレッジ: 90%以上

**アクセシビリティ**:

- [ ] ARIA属性が適切に設定されている
- [ ] キーボードナビゲーション対応

#### 完了条件

- [ ] 全品質ゲートをクリアしている

---

## Phase 7: 最終レビューゲート

### T-07-1: 実装最終レビュー

#### 目的

実装完了後、全体的な品質・整合性を検証する。

#### レビュー参加エージェント

| エージェント                      | レビュー観点 | 選定理由                               |
| --------------------------------- | ------------ | -------------------------------------- |
| .claude/agents/code-quality.md    | コード品質   | 可読性・保守性の最終確認               |
| .claude/agents/ui-designer.md     | UI/UX実装    | デザイン実装の妥当性確認               |
| .claude/agents/frontend-tester.md | テスト品質   | テストカバレッジ・テストケースの妥当性 |

- **参照**: `.claude/agents/agent_list.md`

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:final-review
```

- **参照**: `.claude/commands/ai/command_list.md`

#### レビューチェックリスト

**コード品質** (.claude/agents/code-quality.md)

- [ ] コーディング規約への準拠
- [ ] 可読性・保守性の確保
- [ ] 適切なエラーハンドリング
- [ ] 過度な複雑性がない

**UI/UX実装** (.claude/agents/ui-designer.md)

- [ ] 設計通りに実装されている
- [ ] ユーザビリティが高い
- [ ] ダークモード対応が適切
- [ ] アニメーションがスムーズ

**テスト品質** (.claude/agents/frontend-tester.md)

- [ ] テストカバレッジが十分
- [ ] 境界値・異常系のテストがある
- [ ] E2Eテストが実際のユーザー操作を再現している

#### 完了条件

- [ ] 全レビュー観点で問題なし（PASS）

---

## Phase 8: 手動テスト検証

### T-08-1: UI/UXテスト実施

#### 目的

自動テストでは検証できないユーザー体験を手動で確認する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:generate-test-plan
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/frontend-tester.md
- **選定理由**: 手動テストケース設計の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 手動テストケース

| No  | カテゴリ         | テスト項目             | 前提条件               | 操作手順                                                        | 期待結果                                           | 実行結果 | 備考 |
| --- | ---------------- | ---------------------- | ---------------------- | --------------------------------------------------------------- | -------------------------------------------------- | -------- | ---- |
| 1   | UI/UX            | ファイルツリーホバー   | アプリ起動済み         | 1. ファイルツリーでファイルにカーソルを合わせる<br>2. 0.5秒待つ | ツールチップが表示され、ファイル名とパスが含まれる |          |      |
| 2   | UI/UX            | ホバー解除             | ツールチップ表示中     | カーソルをファイルから離す                                      | ツールチップが消える                               |          |      |
| 3   | UI/UX            | 長いパス表示           | 深い階層のファイル存在 | 深い階層のファイルにホバー                                      | 長いパスが適切に表示される（省略または折り返し）   |          |      |
| 4   | UI/UX            | ダークモード           | ダークモード有効       | ファイルにホバー                                                | ダークモード用スタイルのツールチップが表示される   |          |      |
| 5   | UI/UX            | ライトモード           | ライトモード有効       | ファイルにホバー                                                | ライトモード用スタイルのツールチップが表示される   |          |      |
| 6   | UI/UX            | ファイル選択ダイアログ | ダイアログ表示中       | ダイアログ内のファイルにホバー                                  | ツールチップが表示される                           |          |      |
| 7   | アクセシビリティ | スクリーンリーダー     | VoiceOver有効          | ファイルにフォーカス                                            | ファイル名とパスが読み上げられる                   |          |      |
| 8   | パフォーマンス   | 大量ファイル           | 100+ファイル表示中     | 複数ファイルに連続ホバー                                        | ツールチップ表示が遅延しない                       |          |      |

#### 完了条件

- [ ] 全テストケースが実行済み
- [ ] 全テストケースがPASS
- [ ] 発見された不具合が修正済み

---

## Phase 9: ドキュメント更新・未完了タスク記録

### T-09-1: システムドキュメント更新

#### 更新対象ドキュメント

- `docs/00-requirements/16-ui-ux-guidelines.md` - ツールチップコンポーネントのガイドライン追加

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```
/ai:update-all-docs
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/manual-writer.md
- **選定理由**: UI/UXガイドラインドキュメント作成の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 更新内容

- ツールチップコンポーネントの使用ガイドライン
- ホバー時UI表示の標準仕様
- アクセシビリティ対応のベストプラクティス

#### 完了条件

- [ ] UI/UXガイドラインが更新されている
- [ ] ツールチップコンポーネントの使用方法が記載されている

---

## Phase 10: PR作成・CI確認・マージ準備

### T-10-1: 差分確認・コミット作成

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:commit-and-pr
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/prompt-eng.md
- **選定理由**: コミットメッセージの自動生成が得意
- **参照**: `.claude/agents/agent_list.md`

#### 実行手順

```bash
# 1. 差分確認
git status
git diff

# 2. コミット作成
git add .
git commit -m "$(cat <<'EOF'
feat(ui): ファイルホバー時のツールチップ表示機能を追加

- Tooltipコンポーネント実装（汎用）
- FileTooltipコンポーネント実装（ファイル専用）
- useTooltipカスタムフック実装
- FileTreeItemへのツールチップ統合
- ダークモード対応
- アクセシビリティ対応（ARIA属性）
- ユニットテスト・E2Eテスト追加

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

#### 完了条件

- [ ] Conventional Commits形式でコミット作成済み
- [ ] Claude Code署名が含まれている

---

### T-10-2: PR作成

#### 実行手順

```bash
# 1. ブランチプッシュ
git push -u origin feature/file-tooltip-ui

# 2. PR作成
gh pr create --title "feat(ui): ファイルホバー時のツールチップ表示機能を追加" --body "$(cat <<'EOF'
## 概要

ファイルツリーおよびファイル選択UI上で、ファイルにマウスホバーした際に、
ファイル名とフルパスをツールチップで表示する機能を追加しました。

## 変更内容

- Tooltipコンポーネント実装（汎用的な再利用可能コンポーネント）
- FileTooltipコンポーネント実装（ファイル情報専用）
- useTooltipカスタムフック実装（状態管理・ポジション計算）
- FileTreeItemへのツールチップ統合
- ダークモード対応（Tailwind CSS）
- アクセシビリティ対応（ARIA属性、スクリーンリーダー対応）
- ユニットテスト追加（Tooltipコンポーネント）
- E2Eテスト追加（ホバー操作の自動テスト）

## 変更タイプ

- [x] ✨ 新機能 (new feature)
- [ ] 🐛 バグ修正 (bug fix)
- [ ] 🔨 リファクタリング (refactoring)
- [ ] 📝 ドキュメント (documentation)
- [ ] 🧪 テスト (test)
- [ ] 🔧 設定変更 (configuration)
- [ ] 🚀 CI/CD (continuous integration)

## テスト

- [x] ユニットテスト実行 (`pnpm test`)
- [x] 型チェック実行 (`pnpm typecheck`)
- [x] ESLint チェック実行 (`pnpm lint`)
- [x] ビルド確認 (`pnpm build`)
- [x] E2Eテスト実行 (`pnpm test:e2e`)
- [x] 手動テスト実施

## 破壊的変更

- [ ] この PR には破壊的変更が含まれます

## チェックリスト

- [x] コードが既存のスタイルに従っている
- [x] 必要に応じてドキュメントを更新した
- [x] 新規・変更機能にテストを追加した
- [x] すべてのテストがローカルで成功する
- [x] Pre-commit hooks が成功する

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)" --base main
```

#### 完了条件

- [ ] PRが作成されている
- [ ] PR本文が適切に記載されている

---

### T-10-3: PR補足コメント追加

#### 実行手順

````bash
PR_NUMBER=$(gh pr view --json number -q .number)

gh pr comment "${PR_NUMBER}" --body "$(cat <<'EOF'
## 📝 実装の詳細

### コンポーネント構成

**Tooltipコンポーネント（汎用）**:
- ポジション自動調整（上下左右・画面端検出）
- 表示遅延タイマー（デフォルト500ms）
- ダークモード自動切り替え
- ARIA属性対応（role="tooltip", aria-describedby）

**FileTooltipコンポーネント（ファイル専用）**:
- ファイル名・パス表示
- オプション情報（サイズ・更新日時）
- Tooltipコンポーネントをラップ

**useTooltipフック**:
- ホバー状態管理（useState）
- 遅延タイマー管理（useEffect）
- ポジション計算（getBoundingClientRect）
- クリーンアップ処理

### 技術的決定事項

1. **Headless UI vs 自作**
   - 決定: 自作
   - 理由: 軽量化、カスタマイズ性、学習コスト低減

2. **ポジショニング**
   - 決定: JavaScriptで動的計算
   - 理由: 画面端での自動調整が必要

3. **パフォーマンス最適化**
   - ファイル情報キャッシュ（メモ化）
   - 遅延表示（即座に表示しない）
   - イベントハンドラーのdebounce

## ⚠️ レビュー時の注意点

1. **パフォーマンス影響**
   - 大量ファイル（100+）でのホバー時の遅延を確認
   - メモリリーク（タイマークリーンアップ）の確認

2. **アクセシビリティ**
   - VoiceOverでの読み上げ確認
   - キーボードフォーカス時の情報表示確認

3. **エッジケース**
   - 画面端でのポジション調整
   - 長いパス（200文字以上）の表示
   - 特殊文字を含むファイル名

## 🔍 テスト方法

### 手動テスト手順

1. アプリ起動
   ```bash
   pnpm --filter @repo/desktop preview
````

2. ファイルツリーでファイルにホバー
   - ツールチップが0.5秒後に表示されることを確認
   - ファイル名とパスが表示されることを確認

3. ダークモード切り替え
   - ツールチップのスタイルが切り替わることを確認

4. ファイル選択ダイアログで確認
   - ダイアログ内のファイルでもツールチップが表示されることを確認

### 自動テスト実行

```bash
# ユニットテスト
pnpm --filter @repo/desktop test

# E2Eテスト
pnpm --filter @repo/desktop test:e2e
```

## 📚 参考資料

- [Radix UI Tooltip](https://www.radix-ui.com/docs/primitives/components/tooltip)
- [Headless UI](https://headlessui.com/)
- [WCAG 2.1 - Tooltips](https://www.w3.org/WAI/WCAG21/Understanding/)
- [React ARIA - useTooltip](https://react-spectrum.adobe.com/react-aria/useTooltip.html)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"

````

#### 完了条件
- [ ] PR補足コメントが投稿されている

---

### T-10-4: CI/CD完了確認

#### 実行手順

```bash
# CI完了待機
for i in {1..10}; do
  gh pr checks ${PR_NUMBER}
  if gh pr checks ${PR_NUMBER} 2>&1 | grep -qE "(pending|in_progress)"; then
    echo "CI実行中... 30秒後に再確認"
    sleep 30
  else
    echo "CI完了"
    break
  fi
done
````

#### 完了条件

- [ ] CI/CDが全て完了している（pending/in_progressなし）
- [ ] 全チェックがpassである

---

### T-10-5: ユーザーへマージ可能通知

#### 通知内容

````
✅ PR作成完了・CI確認完了

📝 PR情報:
- PR番号: #XXX
- PR URL: https://github.com/.../pull/XXX

✅ CI/CD ステータス: 全てPASS

🎯 次のステップ（ユーザー実施）:
1. GitHub Web UIでPRを開く
2. 変更内容を最終確認
3. 「Squash and merge」をクリック
4. 「Delete branch」にチェック

📌 マージ後の同期:
```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator
git checkout main
git pull origin main
git worktree remove .worktrees/task-XXX
git fetch --prune
````

````

#### 完了条件
- [ ] ユーザーにマージ準備完了を通知済み
- [ ] PRのURL・番号を提示済み
- [ ] マージ手順を説明済み

---

## 5. 完了条件チェックリスト

### 機能要件
- [ ] ファイルツリーでファイルホバー時にツールチップが表示される
- [ ] ツールチップにファイル名が表示される
- [ ] ツールチップにファイルパスが表示される
- [ ] ファイル選択ダイアログでもツールチップが表示される
- [ ] ホバー解除時にツールチップが消える
- [ ] 表示遅延（0.5秒）が動作する

### 品質要件
- [ ] 全ユニットテストPASS
- [ ] 全E2EテストPASS
- [ ] コードカバレッジ90%以上
- [ ] ESLintエラー0件
- [ ] TypeScriptエラー0件
- [ ] アクセシビリティ対応済み（ARIA属性）
- [ ] ダークモード対応済み

### ドキュメント要件
- [ ] UI/UXガイドラインが更新されている
- [ ] コンポーネント使用方法が記載されている

---

## 6. 検証方法

### テストケース

**ユニットテスト**:
```bash
pnpm --filter @repo/desktop test Tooltip
pnpm --filter @repo/desktop test FileTooltip
````

**E2Eテスト**:

```bash
pnpm --filter @repo/desktop test:e2e file-tooltip
```

### 検証手順

1. **機能検証**
   - ファイルツリーで複数ファイルにホバー
   - ツールチップが正しく表示されることを確認
   - パス情報が正確であることを確認

2. **スタイル検証**
   - ダークモード/ライトモード切り替え
   - ツールチップのスタイルが適切に切り替わることを確認

3. **パフォーマンス検証**
   - 大量ファイル（100+）で動作確認
   - ホバー時の遅延がないことを確認

4. **アクセシビリティ検証**
   - VoiceOverでファイル情報が読み上げられることを確認

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                     |
| ------------------------------------ | ------ | -------- | ---------------------------------------- |
| パフォーマンス劣化（大量ファイル時） | 中     | 中       | ファイル情報のキャッシュ・遅延ロード実装 |
| ツールチップが画面外に表示される     | 中     | 高       | ポジション自動調整ロジック実装           |
| 他UIとのz-index競合                  | 低     | 低       | z-index値の適切な設定（9999等）          |
| 既存コンポーネントへの影響           | 中     | 低       | 回帰テストの実施・段階的ロールアウト     |
| アクセシビリティ対応漏れ             | 高     | 中       | WCAG 2.1基準に基づくレビュー・テスト     |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/00-requirements/16-ui-ux-guidelines.md` - UI/UXガイドライン
- `docs/00-requirements/master_system_design.md` - システム全体設計
- `.claude/agents/agent_list.md` - エージェント定義
- `.claude/skills/skill_list.md` - スキル定義

### 参考資料

- [Radix UI Tooltip](https://www.radix-ui.com/docs/primitives/components/tooltip) - ツールチップ実装の参考
- [WCAG 2.1 - Content on Hover or Focus](https://www.w3.org/WAI/WCAG21/Understanding/content-on-hover-or-focus.html) - アクセシビリティ基準
- [React ARIA - useTooltip](https://react-spectrum.adobe.com/react-aria/useTooltip.html) - アクセシブルなツールチップ実装
- [Tailwind CSS - Dark Mode](https://tailwindcss.com/docs/dark-mode) - ダークモード実装

---

## 9. 備考

### 実装のヒント

**ツールチップポジション計算**:

```typescript
const calculatePosition = (triggerRect: DOMRect, tooltipRect: DOMRect) => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // デフォルト: 上部中央
  let top = triggerRect.top - tooltipRect.height - 8;
  let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;

  // 画面上端を超える場合は下部に表示
  if (top < 0) {
    top = triggerRect.bottom + 8;
  }

  // 画面右端を超える場合は左寄せ
  if (left + tooltipRect.width > viewportWidth) {
    left = viewportWidth - tooltipRect.width - 8;
  }

  // 画面左端を超える場合は右寄せ
  if (left < 0) {
    left = 8;
  }

  return { top, left };
};
```

### パフォーマンス最適化

**ファイル情報のメモ化**:

```typescript
const useFileInfo = (filePath: string) => {
  return useMemo(() => {
    // IPC経由でファイル情報取得
    return window.electronAPI.fs.getFileInfo(filePath);
  }, [filePath]);
};
```

### アクセシビリティ実装

**ARIA属性**:

```tsx
<div
  role="button"
  aria-describedby="file-tooltip"
  onMouseEnter={handleMouseEnter}
  onMouseLeave={handleMouseLeave}
>
  {fileName}
</div>

<div
  id="file-tooltip"
  role="tooltip"
  hidden={!isVisible}
>
  {fileInfo}
</div>
```
