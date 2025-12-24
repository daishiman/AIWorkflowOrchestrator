# ワークスペースファイルパス表示改善 - タスク指示書

## メタ情報

| 項目             | 内容                               |
| ---------------- | ---------------------------------- |
| タスクID         | TASK-WS-FILEPATH-001               |
| タスク名         | ワークスペースファイルパス表示改善 |
| 分類             | 改善                               |
| 対象機能         | ワークスペースUI                   |
| 優先度           | 中                                 |
| 見積もり規模     | 小規模                             |
| ステータス       | 未実施                             |
| 発見元           | ユーザー要望                       |
| 発見日           | 2025-12-11                         |
| 発見エージェント | .claude/agents/product-manager.md                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ワークスペースで開いているファイルのパスが表示される際、ユーザーが管理しやすい形式で表示されていない可能性がある。開発者やユーザーがファイルを素早く特定し、管理するためには、パスの表示形式が重要である。

### 1.2 問題点・課題

- ファイルパスが省略されすぎて、どのファイルか特定しにくい場合がある
- 相対パスと絶対パスの使い分けが一貫していない
- 長いパスの場合、UIが崩れる可能性がある
- ユーザーがファイルの場所を把握しにくい

### 1.3 放置した場合の影響

- ユーザーの作業効率が低下する
- 誤ったファイルを編集するリスクが高まる
- ユーザー体験（UX）の悪化
- 開発者のデバッグ作業が困難になる

---

## 2. 何を達成するか（What）

### 2.1 目的

ワークスペースで開いているファイルのパスを、全体パスで記述しつつ、UI/UXに配慮した見やすく管理しやすい形式で表示する。

### 2.2 最終ゴール

- 全てのファイルパスが一貫した形式で表示される
- ユーザーがファイルの場所を一目で把握できる
- UIが崩れることなく、長いパスも適切に表示される
- ユーザーが容易にファイルを管理・ナビゲートできる

### 2.3 スコープ

#### 含むもの

- ファイルパス表示ロジックの改善
- UI/UXの改善（ツールチップ、省略表示など）
- パス表示の一貫性確保
- レスポンシブ対応

#### 含まないもの

- ファイル操作機能の追加
- ファイルシステムの変更
- バックエンドAPIの変更

### 2.4 成果物

- 改善されたファイルパス表示コンポーネント
- 関連するユニットテスト
- UIガイドラインの更新（必要に応じて）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- プロジェクトの開発環境がセットアップ済み
- React/TypeScriptの基本的な知識
- Electronアプリケーションの構造理解

### 3.2 依存タスク

- なし（独立したタスク）

### 3.3 必要な知識・スキル

- React/TypeScript
- Electron（デスクトップアプリの場合）
- UI/UXデザインの基本
- CSSレイアウト（Tailwind CSS）

### 3.4 推奨アプローチ

1. 現在のファイルパス表示実装を調査
2. UI/UXの改善方針を策定
3. TDDでテストを先に作成
4. コンポーネントを実装
5. スタイリングとアクセシビリティの調整

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義（現状調査）
Phase 1: 設計（UI/UX設計）
Phase 2: 設計レビューゲート
Phase 3: テスト作成（TDD: Red）
Phase 4: 実装（TDD: Green）
Phase 5: リファクタリング（TDD: Refactor）
Phase 6: 品質保証
Phase 7: 最終レビューゲート
Phase 8: 手動テスト検証
Phase 9: ドキュメント更新
```

### Phase 0: 要件定義

#### 目的

現在のファイルパス表示実装を調査し、改善要件を明確化する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:gather-requirements workspace-filepath-display
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/req-analyst.md
- **選定理由**: 要件の収集・分析に特化したエージェント
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                 | 活用方法                       |
| ------------------------ | ------------------------------ |
| .claude/skills/requirements-engineering/SKILL.md | 要件の明確化と検証可能性の確保 |
| .claude/skills/use-case-modeling/SKILL.md        | ユーザーシナリオの特定         |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物     | パス                                                                     | 内容           |
| ---------- | ------------------------------------------------------------------------ | -------------- |
| 要件定義書 | docs/30-workflows/workspace-filepath-display/task-step00-requirements.md | 改善要件の詳細 |

#### 完了条件

- [ ] 現在のファイルパス表示実装が調査済み
- [ ] 改善要件が明確に定義されている
- [ ] ユーザーシナリオが特定されている

---

### Phase 1: 設計

#### 目的

UI/UXを考慮したファイルパス表示の設計を行う。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:create-component filepath-display atom
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/ui-designer.md
- **選定理由**: UI/UX設計とアクセシビリティに特化
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                   | 活用方法                   |
| -------------------------- | -------------------------- |
| .claude/skills/design-system-architecture/SKILL.md | デザインシステムとの整合性 |
| .claude/skills/accessibility-wcag/SKILL.md         | WCAG準拠の確保             |
| .claude/skills/tailwind-css-patterns/SKILL.md      | 適切なスタイリング         |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物   | パス                                                                  | 内容               |
| -------- | --------------------------------------------------------------------- | ------------------ |
| UI設計書 | docs/30-workflows/workspace-filepath-display/task-step01-ui-design.md | コンポーネント設計 |

#### 完了条件

- [ ] コンポーネント設計が完了
- [ ] アクセシビリティ要件が定義済み
- [ ] レスポンシブ対応方針が決定

---

### Phase 2: 設計レビューゲート

#### 目的

実装前に設計の妥当性を検証する。

#### レビュー参加エージェント

| エージェント | レビュー観点         | 選定理由                 |
| ------------ | -------------------- | ------------------------ |
| .claude/agents/arch-police.md | アーキテクチャ整合性 | コンポーネント設計の検証 |
| .claude/agents/ui-designer.md | UI/UX品質            | ユーザビリティの確認     |

- **参照**: `.claude/agents/agent_list.md`

#### 完了条件

- [ ] 設計レビューがPASS
- [ ] 指摘事項が対応済み

---

### Phase 3: テスト作成 (TDD: Red)

#### 目的

ファイルパス表示コンポーネントのテストを先に作成する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:generate-unit-tests apps/desktop/src/renderer/components/atoms/FilepathDisplay/index.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/unit-tester.md
- **選定理由**: TDD原則に基づくテスト作成
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                | 活用方法                   |
| ----------------------- | -------------------------- |
| .claude/skills/tdd-principles/SKILL.md          | Red-Green-Refactorサイクル |
| .claude/skills/boundary-value-analysis/SKILL.md | 境界値テストの設計         |
| .claude/skills/vitest-advanced/SKILL.md         | Vitestでのテスト実装       |

- **参照**: `.claude/skills/skill_list.md`

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/desktop test:run
```

- [ ] テストが失敗することを確認（Red状態）

#### 完了条件

- [ ] テストケースが作成済み
- [ ] テストがRed状態であることを確認

---

### Phase 4: 実装 (TDD: Green)

#### 目的

テストを通過するための実装を行う。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:create-component filepath-display atom
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/ui-designer.md
- **選定理由**: UIコンポーネントの実装
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                       | 活用方法                       |
| ------------------------------ | ------------------------------ |
| .claude/skills/component-composition-patterns/SKILL.md | 再利用可能なコンポーネント設計 |
| .claude/skills/tailwind-css-patterns/SKILL.md          | 適切なスタイリング             |

- **参照**: `.claude/skills/skill_list.md`

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/desktop test:run
```

- [ ] テストが成功することを確認（Green状態）

#### 完了条件

- [ ] 実装が完了
- [ ] テストがGreen状態

---

### Phase 5: リファクタリング (TDD: Refactor)

#### 目的

コード品質を改善する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:refactor apps/desktop/src/renderer/components/atoms/FilepathDisplay/index.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/code-quality.md
- **選定理由**: コード品質の改善
- **参照**: `.claude/agents/agent_list.md`

#### TDD検証: 継続Green確認

```bash
pnpm --filter @repo/desktop test:run
```

- [ ] リファクタリング後もテストが成功することを確認

#### 完了条件

- [ ] コード品質が改善済み
- [ ] テストが継続してGreen状態

---

### Phase 6: 品質保証

#### 目的

品質基準を満たすことを検証する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:lint --fix
/ai:analyze-code-quality apps/desktop/src/renderer/components/atoms/FilepathDisplay
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/code-quality.md
- **選定理由**: 品質検証
- **参照**: `.claude/agents/agent_list.md`

#### 完了条件

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] テストカバレッジ基準達成

---

### Phase 7: 最終レビューゲート

#### 目的

実装の総合的な品質を検証する。

#### レビュー参加エージェント

| エージェント  | レビュー観点 | 選定理由             |
| ------------- | ------------ | -------------------- |
| .claude/agents/code-quality.md | コード品質   | 実装品質の確認       |
| .claude/agents/ui-designer.md  | UI/UX        | ユーザビリティ確認   |
| .claude/agents/unit-tester.md  | テスト品質   | テストカバレッジ確認 |

- **参照**: `.claude/agents/agent_list.md`

#### 完了条件

- [ ] 最終レビューがPASS
- [ ] 全ての指摘事項が対応済み

---

### Phase 8: 手動テスト検証

#### 目的

実際のユーザー操作でUIを確認する。

#### 手動テストケース

| No  | カテゴリ     | テスト項目       | 前提条件       | 操作手順                 | 期待結果                                 | 実行結果 | 備考 |
| --- | ------------ | ---------------- | -------------- | ------------------------ | ---------------------------------------- | -------- | ---- |
| 1   | 正常系       | 短いパスの表示   | アプリ起動済み | 短いパスのファイルを開く | パスが全て表示される                     | -        | -    |
| 2   | 正常系       | 長いパスの表示   | アプリ起動済み | 長いパスのファイルを開く | 適切に省略され、ツールチップで全パス表示 | -        | -    |
| 3   | UI/UX        | ツールチップ表示 | 長いパス表示中 | パス表示部分にホバー     | 全パスがツールチップで表示               | -        | -    |
| 4   | レスポンシブ | 画面幅縮小時     | アプリ起動済み | ウィンドウ幅を縮小       | UIが崩れずパスが適切に表示               | -        | -    |

#### 完了条件

- [ ] 全手動テストケースがPASS

---

### Phase 9: ドキュメント更新

#### 目的

実装内容をドキュメントに反映する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:update-all-docs
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/spec-writer.md
- **選定理由**: ドキュメント作成
- **参照**: `.claude/agents/agent_list.md`

#### 完了条件

- [ ] docs/00-requirements/ 配下の関連ドキュメントが更新済み
- [ ] UIガイドラインが更新済み（必要に応じて）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ファイルパスが全体パスで表示される
- [ ] 長いパスは適切に省略され、ツールチップで全パスが確認可能
- [ ] UIが崩れることなく表示される
- [ ] レスポンシブ対応が完了

### 品質要件

- [ ] 全テストがPASS
- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードカバレッジ80%以上

### ドキュメント要件

- [ ] 関連ドキュメントが更新済み
- [ ] コンポーネントの使用方法が記載済み

---

## 6. 検証方法

### テストケース

1. 短いファイルパスの表示確認
2. 長いファイルパスの省略表示確認
3. ツールチップでの全パス表示確認
4. 各種画面サイズでのレスポンシブ確認
5. アクセシビリティ（キーボードナビゲーション）確認

### 検証手順

1. 開発環境でアプリを起動
2. 各種パターンのファイルを開く
3. UI表示を目視確認
4. 自動テストを実行

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                                |
| ---------------------------- | ------ | -------- | ----------------------------------- |
| パス表示のパフォーマンス低下 | 中     | 低       | メモ化（useMemo）の活用             |
| 既存UIとの整合性問題         | 中     | 中       | デザインシステムとの整合性確認      |
| 長いパスでのレイアウト崩れ   | 高     | 中       | CSS overflow / text-ellipsis の適用 |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/00-requirements/16-ui-ux-guidelines.md` - UI/UXガイドライン
- `docs/00-requirements/04-directory-structure.md` - ディレクトリ構造

### 参考資料

- [Tailwind CSS Text Overflow](https://tailwindcss.com/docs/text-overflow)
- [React Tooltip Best Practices](https://react.dev/)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
ワークスペースで開いているファイルは全体パスを記述するようにしておいてください。
UI/UXに気をつけて、見やすくユーザーが管理しやすいパスとするようにしてください。
```

### 補足事項

- Electronアプリでのファイルパス表示を想定
- macOS/Windows両対応が必要
- ダークモード対応も考慮
