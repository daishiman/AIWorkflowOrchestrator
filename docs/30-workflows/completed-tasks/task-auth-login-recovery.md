# ログイン機能復旧 - タスク指示書

## メタ情報

| 項目         | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| タスクID     | TASK-AUTH-RECOVERY-001                                      |
| タスク名     | ログイン機能復旧（AuthGuard表示・OAuth認証フロー）          |
| 分類         | バグ修正                                                    |
| 対象機能     | 認証システム（AuthGuard、OAuth認証、カスタムプロトコル）    |
| 優先度       | **🔴 高（Critical）**                                       |
| 見積もり規模 | 中規模                                                      |
| ステータス   | 未実施                                                      |
| 発見元       | TASK-DT-001（フォルダ一括選択機能）Phase 8 手動テスト準備中 |
| 発見日       | 2025-12-20                                                  |
| 発見者       | ユーザー手動テスト時                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

**現在の問題状況**:

- アプリ起動時、未認証状態でもログイン画面（AuthGuard）が表示されない
- いきなりダッシュボード（設定メニュー）に遷移してしまう
- Google/GitHub/Discordの「〇〇で続ける」ボタンが表示されない、または機能しない
- OAuth認証フローが開始されず、ブラウザで認証画面が開かない

**原因の調査結果**:

1. **ワークツリー破損**: `.worktrees/task-1766023279741-f4ea87/` ディレクトリが破損
   - `apps` ディレクトリが存在しない
   - `AuthGuard` コンポーネントがコピーされていない
   - `.claude` と `docs` のみ存在する異常な状態

2. **App.tsx での import エラー**:
   - `import { AuthGuard } from "./components/AuthGuard"` しているが、実際のファイルが存在しない
   - TypeScript エラーは出ていないが、実行時に AuthGuard が undefined になっている可能性

3. **手動テスト準備時の一時対応が原因**:
   - フォルダ一括選択機能（TASK-DT-001）の手動テスト（T-08-1）準備時に AuthGuard をコメントアウト
   - その後、再有効化したが、ワークツリーの状態が破損していたため機能しなかった

### 1.2 問題点・課題

| 問題                         | 影響                                                 |
| ---------------------------- | ---------------------------------------------------- |
| ログイン画面が表示されない   | 未認証ユーザーがアプリの全機能にアクセスできてしまう |
| OAuth認証フローが動作しない  | 新規ユーザーがアカウント登録・ログインできない       |
| AuthGuard コンポーネント不在 | 認証チェックが完全にバイパスされている               |
| ワークツリー破損             | 開発・テストが正常に実施できない                     |

### 1.3 放置した場合の影響

**セキュリティリスク**:

- 未認証ユーザーがアプリの全機能にアクセス可能（認証認可の完全バイパス）
- ユーザーデータ・APIキー等の機密情報が保護されない

**ビジネスリスク**:

- 新規ユーザーがログインできず、アプリを使用開始できない
- 既存ユーザーがセッション切れ後に再ログインできない
- アプリケーションとして基本的な機能が欠落

**開発リスク**:

- ワークツリーが破損しているため、並行開発ができない
- 手動テストが正常に実施できない
- 品質保証プロセスが完了できない

---

## 2. 何を達成するか（What）

### 2.1 目的

1. **ワークツリーの修復**: 破損したワークツリーを再作成または修復
2. **AuthGuard の復旧**: AuthGuard コンポーネントが正常に動作するようにする
3. **OAuth認証フローの復旧**: Google/GitHub/Discord でのログインが正常に動作するようにする
4. **認証状態チェックの正常化**: 未認証時にログイン画面、認証済み時にダッシュボードを表示

### 2.2 最終ゴール

**機能的ゴール**:

- [ ] アプリ起動時、未認証状態でAuthGuardのログイン画面が表示される
- [ ] 「Googleで続ける」ボタンをクリックすると、ブラウザでGoogle OAuth認証画面が開く
- [ ] 「GitHubで続ける」ボタンをクリックすると、ブラウザでGitHub OAuth認証画面が開く
- [ ] 「Discordで続ける」ボタンをクリックすると、ブラウザでDiscord OAuth認証画面が開く
- [ ] ブラウザで認証許可後、Electronアプリに戻り、ダッシュボードが表示される
- [ ] ログイン済みの場合、アプリ起動時に直接ダッシュボードが表示される

**技術的ゴール**:

- [ ] ワークツリーが正常な状態に復旧している
- [ ] AuthGuard コンポーネントが存在し、正しく import できる
- [ ] カスタムプロトコル（aiworkflow://）の認証コールバックが処理される
- [ ] 開発環境・本番環境の両方で認証が機能する

### 2.3 スコープ

#### 含むもの

- ワークツリーの再作成または修復
- AuthGuard コンポーネントの復旧
- OAuth認証フロー（Google/GitHub/Discord）の動作確認
- カスタムプロトコルコールバックの処理確認
- 認証状態管理の動作確認
- ログイン・ログアウトの動作確認

#### 含まないもの

- 新しい OAuth プロバイダーの追加
- 認証UI/UXの改善（既存の動作復旧のみ）
- パスワード認証の実装（OAuth のみ）
- 多要素認証（MFA）の実装
- ログイン履歴・監査ログの実装

### 2.4 成果物

| 種別             | 成果物                   | 配置先                                                          |
| ---------------- | ------------------------ | --------------------------------------------------------------- |
| 環境             | 修復されたワークツリー   | `.worktrees/task-1766023279741-f4ea87/` または メインリポジトリ |
| 調査ドキュメント | ログイン機能調査レポート | docs/30-workflows/login-recovery/step01-investigation.md        |
| 設計ドキュメント | 復旧設計書               | docs/30-workflows/login-recovery/step02-recovery-design.md      |
| コンポーネント   | AuthGuard コンポーネント | apps/desktop/src/renderer/components/AuthGuard/                 |
| テストコード     | AuthGuard 回帰テスト     | apps/desktop/src/renderer/components/AuthGuard/\*.test.tsx      |
| 品質レポート     | 品質保証レポート         | docs/30-workflows/login-recovery/step06-quality-report.md       |
| 手動テスト記録   | 手動テスト結果           | docs/30-workflows/login-recovery/step08-manual-test.md          |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] メインリポジトリが正常な状態である
- [ ] Supabase認証が設定されている（環境変数: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY）
- [ ] OAuth アプリケーション（Google/GitHub/Discord）がSupabaseに登録済み
- [ ] pnpm がインストールされている
- [ ] Node.js v22以上がインストールされている

### 3.2 依存タスク

- なし（独立したバグ修正タスク）

### 3.3 必要な知識・スキル

| 知識領域                       | 必要レベル | 備考                                 |
| ------------------------------ | ---------- | ------------------------------------ |
| Git ワークツリー               | 中級       | ワークツリーの作成・削除・修復       |
| Electron アーキテクチャ        | 中級       | Main/Renderer/Preload プロセスの理解 |
| React コンポーネント設計       | 中級       | AuthGuard の実装理解                 |
| OAuth 2.0 認証フロー           | 中級       | OAuth認証の仕組み理解                |
| Supabase Auth                  | 中級       | Supabase認証APIの使用方法            |
| TypeScript                     | 中級       | 型定義・import/export の理解         |
| カスタムプロトコル（Electron） | 初級       | aiworkflow:// プロトコルの仕組み理解 |

### 3.4 推奨アプローチ

#### アプローチ1: ワークツリー再作成（推奨）

**メリット**:

- クリーンな状態から開始できる
- 破損の影響を完全に排除できる
- mainブランチの最新状態を反映できる

**デメリット**:

- 現在の変更内容（フォルダ一括選択機能）を一時的に退避する必要がある
- ワークツリー再作成の手順が必要

**手順**:

1. 現在のワークツリーの変更内容を確認（既にコミット済み: 57d509a）
2. ワークツリーを削除（`git worktree remove`）
3. mainブランチから新しくワークツリーを作成
4. フォルダ一括選択機能のコミットをcherry-pick
5. AuthGuardが正常に存在することを確認
6. 開発サーバー起動でログイン画面が表示されることを確認

#### アプローチ2: メインリポジトリで直接作業

**メリット**:

- ワークツリーの問題を回避できる
- すぐに作業を開始できる

**デメリット**:

- 並行開発のメリットが失われる
- mainブランチが一時的に不安定になる可能性

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義（1サブタスク）
Phase 1: 環境修復・設計（2サブタスク）
Phase 2: 設計レビューゲート（1サブタスク）
Phase 3: テスト作成 - TDD Red（1サブタスク）
Phase 4: 実装 - TDD Green（1サブタスク）
Phase 5: リファクタリング - TDD Refactor（1サブタスク）
Phase 6: 品質保証（1サブタスク）
Phase 7: 最終レビューゲート（1サブタスク）
Phase 8: 手動テスト検証（1サブタスク）
Phase 9: ドキュメント更新（1サブタスク）
```

---

### Phase 0: 要件定義

#### T-00-1: ログイン機能復旧要件定義

##### 目的

ログイン機能復旧に必要な要件を明確に定義し、何を復旧すべきかの基準を設定する。

##### 背景

未認証状態でもログイン画面が表示されず、認証チェックが完全にバイパスされている。OAuth認証フローが動作せず、ユーザーがログインできない重大な問題が発生している。

##### 責務（単一責務）

ログイン機能の復旧要件を定義し、受け入れ基準を明確化する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:gather-requirements 認証システム復旧
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: @req-analyst
- **選定理由**: 要件分析の専門家であり、認証システムの要件を明確化できる
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                               | 活用方法                      |
| -------------------------------------- | ----------------------------- |
| functional-non-functional-requirements | 機能要件・非機能要件の明確化  |
| acceptance-criteria-writing            | 受け入れ基準の定義            |
| oauth2-flows                           | OAuth 2.0認証フローの要件確認 |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物                   | パス                                                    | 内容                   |
| ------------------------ | ------------------------------------------------------- | ---------------------- |
| ログイン機能復旧要件定義 | docs/30-workflows/login-recovery/step01-requirements.md | 復旧すべき機能要件一覧 |

##### 完了条件

- [ ] 復旧すべきログイン機能が明確に定義されている
- [ ] 受け入れ基準が検証可能な形で記述されている
  - AuthGuard表示条件（未認証時のみ表示）
  - OAuth認証フロー（Google/GitHub/Discord）の動作要件
  - カスタムプロトコルコールバック処理の要件
- [ ] 開発環境・本番環境での動作要件が明確
- [ ] セキュリティ要件が定義されている

##### 依存関係

- **前提**: なし
- **後続**: T-01-1（ワークツリー修復）

---

### Phase 1: 環境修復・設計

#### T-01-1: ワークツリー修復・環境復旧

##### 目的

破損したワークツリーを修復または再作成し、AuthGuardコンポーネントが正常に存在する状態にする。

##### 背景

現在のワークツリー（`.worktrees/task-1766023279741-f4ea87/`）は `apps` ディレクトリが存在せず、開発作業ができない状態。

##### 責務（単一責務）

ワークツリーを正常な状態に修復し、開発可能な環境を整える。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

**方法1: ワークツリー再作成（推奨）**

```bash
# ターミナルコマンド（Claude Codeではなく、実際のターミナルで実行）
# 1. メインリポジトリに移動
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator

# 2. 現在のワークツリー削除
git worktree remove .worktrees/task-1766023279741-f4ea87 --force

# 3. 新しいワークツリー作成
git worktree add .worktrees/task-1766023279741-f4ea87 task/task-1766023279741-f4ea87

# 4. ワークツリーに移動
cd .worktrees/task-1766023279741-f4ea87

# 5. 依存関係インストール
pnpm install

# 6. AuthGuard存在確認
ls -la apps/desktop/src/renderer/components/AuthGuard/
```

**方法2: メインリポジトリで作業（代替案）**

```bash
# メインリポジトリに移動
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator

# ブランチ切り替え
git checkout task/task-1766023279741-f4ea87

# 依存関係インストール
pnpm install

# AuthGuard存在確認
ls -la apps/desktop/src/renderer/components/AuthGuard/
```

##### 使用エージェント

- **エージェント**: @devops-eng
- **選定理由**: Git操作・開発環境構築の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名               | 活用方法              |
| ---------------------- | --------------------- |
| git-hooks-concepts     | Gitワークツリーの理解 |
| infrastructure-as-code | 開発環境の構築        |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物                 | パス                                    | 内容           |
| ---------------------- | --------------------------------------- | -------------- |
| 修復されたワークツリー | `.worktrees/task-1766023279741-f4ea87/` | 正常な開発環境 |

##### 完了条件

- [ ] `apps` ディレクトリが存在する
- [ ] `apps/desktop/src/renderer/components/AuthGuard/` が存在する
- [ ] AuthGuard 内に `index.tsx`, `AuthErrorBoundary.tsx`, `LoadingScreen.tsx` が存在する
- [ ] `pnpm install` が正常に完了する
- [ ] TypeScript エラーがない

##### 依存関係

- **前提**: T-00-1（要件定義）
- **後続**: T-01-2（復旧設計）

---

#### T-01-2: ログイン機能復旧設計

##### 目的

AuthGuard の動作確認と、OAuth認証フローが正常に動作するための修正方針を設計する。

##### 背景

ワークツリー修復後、AuthGuard が正しく import できるようになるが、まだ認証フローが動作しない可能性がある。カスタムプロトコル（aiworkflow://）の登録や認証コールバック処理に問題がある可能性を調査し、修正方針を設計する。

##### 責務（単一責務）

ログイン機能復旧のための修正方針と実装設計を策定する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:design-architecture 認証システム復旧
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: @auth-specialist
- **選定理由**: 認証システムの設計専門家、OAuth認証フローに精通
- **補助**: @electron-architect（カスタムプロトコル・IPC通信の設計）
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名               | 活用方法                     |
| ---------------------- | ---------------------------- |
| oauth2-flows           | OAuth認証フローの設計        |
| electron-packaging     | カスタムプロトコルの実装設計 |
| architectural-patterns | アーキテクチャ整合性の確保   |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物     | パス                                                       | 内容               |
| ---------- | ---------------------------------------------------------- | ------------------ |
| 復旧設計書 | docs/30-workflows/login-recovery/step02-recovery-design.md | 修正方針と実装設計 |

##### 完了条件

- [ ] AuthGuard の動作フローが設計されている
- [ ] OAuth認証開始の処理フローが設計されている
- [ ] カスタムプロトコルコールバック処理が設計されている
- [ ] 開発環境での認証テスト方法が設計されている（devInjectAuthCallback等）
- [ ] エラーハンドリング方針が設計されている

##### 依存関係

- **前提**: T-01-1（ワークツリー修復）
- **後続**: T-02-1（設計レビュー）

---

### Phase 2: 設計レビューゲート

#### T-02-1: 復旧設計レビュー

##### 目的

ログイン機能復旧設計の妥当性を検証し、実装前にセキュリティリスクや設計ミスを発見する。

##### 背景

認証システムはセキュリティクリティカルな領域であり、設計ミスは重大な脆弱性につながる可能性がある。

##### レビュー参加エージェント

| エージェント       | レビュー観点         | 選定理由                                  |
| ------------------ | -------------------- | ----------------------------------------- |
| @sec-auditor       | セキュリティ設計     | 認証セキュリティの専門家                  |
| @auth-specialist   | 認証フローの妥当性   | OAuth認証の専門家                         |
| @electron-security | Electronセキュリティ | カスタムプロトコル・IPC通信のセキュリティ |
| @arch-police       | アーキテクチャ整合性 | システム全体との整合性確認                |

- **参照**: `.claude/agents/agent_list.md`

##### レビューチェックリスト

**セキュリティ設計** (@sec-auditor)

- [ ] 認証トークンの安全な保存方法が設計されているか
- [ ] カスタムプロトコルのセキュリティリスクが評価されているか
- [ ] CSRF/XSS等の脆弱性対策が設計されているか
- [ ] セキュアストレージの適切な使用が設計されているか

**認証フローの妥当性** (@auth-specialist)

- [ ] OAuthフローが標準仕様に準拠しているか
- [ ] トークン更新（refresh）ロジックが正しく設計されているか
- [ ] エラーハンドリングが適切に設計されているか
- [ ] オフライン時の動作が考慮されているか

**Electronセキュリティ** (@electron-security)

- [ ] カスタムプロトコルの登録方法が安全か
- [ ] IPC通信のセキュリティが確保されているか
- [ ] Preload層での適切なAPIエクスポートが設計されているか
- [ ] Content Security Policy (CSP) との整合性があるか

**アーキテクチャ整合性** (@arch-police)

- [ ] 既存の認証アーキテクチャとの整合性があるか
- [ ] レイヤー間の依存関係が適切か
- [ ] 他機能への影響範囲が最小化されているか

##### レビュー結果

- **判定**: {{PASS/MINOR/MAJOR/CRITICAL}}
- **指摘事項**: {{レビュー実施時に記入}}
- **対応方針**: {{レビュー実施時に記入}}

##### 戻り先決定（MAJORの場合）

| 問題の種類     | 戻り先             |
| -------------- | ------------------ |
| 要件の問題     | T-00-1（要件定義） |
| 環境修復の問題 | T-01-1（環境修復） |
| 設計の問題     | T-01-2（復旧設計） |

##### 完了条件

- [ ] 全レビュー観点でPASSまたはMINOR判定
- [ ] MINOR指摘は対応済み
- [ ] 未完了タスクは記録済み（該当する場合）

##### 依存関係

- **前提**: T-01-2（復旧設計）
- **後続**: T-03-1（テスト作成）

---

### Phase 3: テスト作成 (TDD: Red)

#### T-03-1: AuthGuard・OAuth認証回帰テスト作成

##### 目的

AuthGuardの表示制御とOAuth認証フローが正常に動作することを検証するテストを作成する。

##### 背景

復旧実装前にテストを作成することで、動作要件を明確にし、復旧の成功を客観的に検証できるようにする。

##### 責務（単一責務）

AuthGuardとOAuth認証の回帰テストを作成し、Red状態を確認する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:generate-unit-tests apps/desktop/src/renderer/components/AuthGuard/index.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: @unit-tester
- **選定理由**: ユニットテスト作成の専門家、認証機能のテストパターンに精通
- **補助**: @frontend-tester（Reactコンポーネントテスト）
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                | 活用方法                   |
| ----------------------- | -------------------------- |
| tdd-principles          | TDDサイクルの実践          |
| test-doubles            | モック・スタブの適切な使用 |
| boundary-value-analysis | 境界値テストケースの作成   |

- **参照**: `.claude/skills/skill_list.md`

##### テストケース設計

**AuthGuard表示制御テスト**:

- [ ] 未認証状態でAuthGuard（ログイン画面）が表示される
- [ ] 認証済み状態でchildrenが表示される（ダッシュボード）
- [ ] ローディング中にLoadingScreenが表示される
- [ ] 認証エラー時にエラー画面が表示される

**OAuth認証フローテスト**:

- [ ] 「Googleで続ける」ボタンクリックでauth.loginが呼ばれる
- [ ] 「GitHubで続ける」ボタンクリックでauth.loginが呼ばれる
- [ ] 「Discordで続ける」ボタンクリックでauth.loginが呼ばれる
- [ ] 認証成功後にAUTH_STATE_CHANGEDイベントを受信して画面遷移

##### 成果物

| 成果物                   | パス                                                                         | 内容                           |
| ------------------------ | ---------------------------------------------------------------------------- | ------------------------------ |
| AuthGuard回帰テスト      | apps/desktop/src/renderer/components/AuthGuard/AuthGuard.regression.test.tsx | AuthGuardの動作確認テスト      |
| OAuth認証フローE2Eテスト | apps/desktop/e2e/auth-flow.spec.ts                                           | OAuth認証フロー全体のE2Eテスト |

##### TDD検証: Red状態確認

```bash
pnpm --filter @repo/desktop test:run AuthGuard.regression.test.tsx
```

- [ ] テストが失敗することを確認（Red状態）

##### 完了条件

- [ ] AuthGuardの表示制御テストが作成済み
- [ ] OAuth認証フローのテストが作成済み
- [ ] すべてのテストがRed状態（失敗）を確認済み

##### 依存関係

- **前提**: T-02-1（設計レビュー）
- **後続**: T-04-1（復旧実装）

---

### Phase 4: 実装 (TDD: Green)

#### T-04-1: AuthGuard・OAuth認証復旧実装

##### 目的

設計に基づいてAuthGuardの表示制御とOAuth認証フローを復旧し、テストをGreen状態にする。

##### 背景

ワークツリー修復後、AuthGuardが存在するようになるが、まだ正常に動作しない可能性がある。認証状態チェック、OAuth認証開始、コールバック処理の各部分を確認・修正する。

##### 責務（単一責務）

AuthGuardとOAuth認証の復旧実装を行い、テストを成功させる。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:debug-error "AuthGuardが表示されず、未認証でダッシュボードに遷移する"
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: @auth-specialist
- **選定理由**: 認証システムの実装専門家、OAuth/カスタムプロトコルの修正ができる
- **補助**: @electron-architect（Electron固有の実装）、@ui-designer（AuthGuard UI）
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名              | 活用方法                 |
| --------------------- | ------------------------ |
| oauth2-flows          | OAuth認証フローの実装    |
| electron-packaging    | カスタムプロトコルの実装 |
| error-boundary        | エラーハンドリングの実装 |
| custom-hooks-patterns | React hooks の適切な使用 |

- **参照**: `.claude/skills/skill_list.md`

##### 確認・修正箇所

**AuthGuard (apps/desktop/src/renderer/components/AuthGuard/index.tsx)**:

- [ ] `useAppStore((state) => state.authenticated)` で認証状態を取得
- [ ] `authenticated === false` の時にログイン画面を表示
- [ ] `authenticated === true` の時にchildrenを表示
- [ ] ローディング状態の適切な処理

**認証状態管理 (apps/desktop/src/renderer/store/slices/authSlice.ts)**:

- [ ] `initializeAuth()` が正しく実行される
- [ ] `authenticated` 状態が正しく更新される
- [ ] `AUTH_STATE_CHANGED` イベントを正しく処理する

**OAuth認証開始 (apps/desktop/src/main/ipc/authHandlers.ts)**:

- [ ] `AUTH_LOGIN` ハンドラーが正しく実装されている
- [ ] `supabase.auth.signInWithOAuth()` が正しく呼ばれる
- [ ] ブラウザでOAuth URLが開く

**認証コールバック処理 (apps/desktop/src/main/index.ts)**:

- [ ] カスタムプロトコルハンドラーが登録されている
- [ ] `handleAuthCallback()` が正しく実装されている
- [ ] トークンがSupabaseセッションに設定される
- [ ] `AUTH_STATE_CHANGED` イベントがRendererに送信される

##### 成果物

| 成果物                       | パス                                                | 内容                    |
| ---------------------------- | --------------------------------------------------- | ----------------------- |
| 復旧されたAuthGuard          | apps/desktop/src/renderer/components/AuthGuard/     | AuthGuardコンポーネント |
| 復旧された認証Slice          | apps/desktop/src/renderer/store/slices/authSlice.ts | 認証状態管理            |
| 復旧された認証ハンドラー     | apps/desktop/src/main/ipc/authHandlers.ts           | Main Process認証処理    |
| 復旧されたカスタムプロトコル | apps/desktop/src/main/protocol/customProtocol.ts    | プロトコルハンドラー    |

##### TDD検証: Green状態確認

```bash
pnpm --filter @repo/desktop test:run
```

- [ ] テストが成功することを確認（Green状態）

##### 完了条件

- [ ] AuthGuardが未認証時に表示される
- [ ] OAuth認証ボタンをクリックするとブラウザが開く
- [ ] 認証コールバックが処理される
- [ ] 認証成功後にダッシュボードが表示される
- [ ] すべてのテストがGreen状態（成功）

##### 依存関係

- **前提**: T-03-1（テスト作成）
- **後続**: T-05-1（リファクタリング）

---

### Phase 5: リファクタリング (TDD: Refactor)

#### T-05-1: コード品質改善

##### 目的

復旧実装のコード品質を改善し、保守性を向上させる。

##### 背景

復旧実装はテストを通すための最小実装であり、コード品質の改善が必要。

##### 責務（単一責務）

復旧コードの品質改善を行い、テストが継続して成功することを確認する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:refactor apps/desktop/src/renderer/components/AuthGuard/index.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: @code-quality
- **選定理由**: コード品質改善の専門家、リファクタリング手法に精通
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名               | 活用方法                       |
| ---------------------- | ------------------------------ |
| clean-code-practices   | クリーンコード原則の適用       |
| refactoring-techniques | リファクタリングパターンの適用 |
| solid-principles       | SOLID原則の確保                |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物                     | パス                                                                    | 内容               |
| -------------------------- | ----------------------------------------------------------------------- | ------------------ |
| リファクタリング済みコード | apps/desktop/src/renderer/components/AuthGuard/, apps/desktop/src/main/ | 品質改善済みコード |

##### TDD検証: 継続Green確認

```bash
pnpm --filter @repo/desktop test:run
```

- [ ] リファクタリング後もテストが成功することを確認

##### 完了条件

- [ ] Cyclomatic Complexity < 10
- [ ] コード重複の排除
- [ ] 命名の明確化
- [ ] テストが継続して成功

##### 依存関係

- **前提**: T-04-1（復旧実装）
- **後続**: T-06-1（品質保証）

---

### Phase 6: 品質保証

#### T-06-1: ログイン機能品質保証

##### 目的

復旧したログイン機能が品質基準を満たすことを検証する。

##### 背景

品質ゲートを通過しなければ最終レビューに進めない。

##### 責務（単一責務）

品質基準に基づいて全検証を実施し、品質ゲート通過を確認する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:run-all-tests --coverage
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: @unit-tester
- **選定理由**: テスト実行・品質検証の専門家
- **補助**: @sec-auditor（セキュリティ検証）
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                     | 活用方法                 |
| ---------------------------- | ------------------------ |
| tdd-principles               | TDD品質基準の確認        |
| dependency-security-scanning | 脆弱性スキャン           |
| code-style-guides            | コード品質メトリクス確認 |

- **参照**: `.claude/skills/skill_list.md`

##### 品質ゲートチェックリスト

**機能検証**:

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功
- [ ] 全E2Eテスト成功（該当する場合）

**コード品質**:

- [ ] ESLintエラー: 0件
- [ ] TypeScriptエラー: 0件
- [ ] Prettier適用済み

**テスト網羅性**:

- [ ] テストカバレッジ ≥ 80%
- [ ] AuthGuardコンポーネント カバレッジ ≥ 90%

**セキュリティ**:

- [ ] `pnpm audit` 実行完了
- [ ] 重大な脆弱性（Critical/High）: 0件

##### 成果物

| 成果物           | パス                                                      | 内容                 |
| ---------------- | --------------------------------------------------------- | -------------------- |
| 品質保証レポート | docs/30-workflows/login-recovery/step06-quality-report.md | 品質検証結果レポート |

##### 完了条件

- [ ] すべての品質ゲート項目をクリア
- [ ] 品質レポートが作成済み

##### 依存関係

- **前提**: T-05-1（リファクタリング）
- **後続**: T-07-1（最終レビュー）

---

### Phase 7: 最終レビューゲート

#### T-07-1: ログイン機能最終レビュー

##### 目的

実装完了後の全体品質・整合性を複数の専門エージェントで検証する。

##### 背景

品質保証の自動検証だけでは検出できない設計判断やベストプラクティス違反、セキュリティリスクを確認する。

##### レビュー参加エージェント

| エージェント       | レビュー観点               | 選定理由                         |
| ------------------ | -------------------------- | -------------------------------- |
| @code-quality      | コード品質                 | Clean Code原則の確認             |
| @auth-specialist   | 認証実装の妥当性           | OAuth実装パターンの確認          |
| @sec-auditor       | セキュリティ実装           | 脆弱性・セキュアコーディング確認 |
| @electron-security | Electron固有のセキュリティ | IPC/プロトコルのセキュリティ確認 |

- **参照**: `.claude/agents/agent_list.md`

##### レビューチェックリスト

**コード品質** (@code-quality)

- [ ] コーディング規約への準拠
- [ ] 可読性・保守性の確保
- [ ] 適切なエラーハンドリング
- [ ] 過度な複雑性の有無

**認証実装の妥当性** (@auth-specialist)

- [ ] OAuth 2.0仕様への準拠
- [ ] トークン管理の適切性
- [ ] セッション管理の正しさ
- [ ] リフレッシュトークン処理の安全性

**セキュリティ実装** (@sec-auditor)

- [ ] トークンの安全な保存
- [ ] 機密情報のログ出力防止
- [ ] CSRF対策の実装
- [ ] 入力検証の適切性

**Electron固有のセキュリティ** (@electron-security)

- [ ] カスタムプロトコルの安全な実装
- [ ] IPC通信のバリデーション
- [ ] Preload層のAPIサーフェス最小化
- [ ] CSPとの整合性

##### レビュー結果

- **判定**: {{PASS/MINOR/MAJOR/CRITICAL}}
- **指摘事項**: {{レビュー実施時に記入}}
- **対応方針**: {{レビュー実施時に記入}}
- **未完了タスク数**: {{未完了タスク数}}件

##### 戻り先決定（MAJOR/CRITICALの場合）

| 問題の種類       | 戻り先                     |
| ---------------- | -------------------------- |
| テスト設計の問題 | T-03-1（テスト作成）       |
| 実装の問題       | T-04-1（復旧実装）         |
| コード品質の問題 | T-05-1（リファクタリング） |

##### 完了条件

- [ ] 全レビュー観点でPASSまたはMINOR判定
- [ ] MINOR指摘は対応済み
- [ ] 未完了タスクは unassigned-task に記録済み（該当する場合）

##### 依存関係

- **前提**: T-06-1（品質保証）
- **後続**: T-08-1（手動テスト）

---

### Phase 8: 手動テスト検証

#### T-08-1: ログイン機能手動テスト

##### 目的

実際のOAuth認証フロー・ユーザー体験を手動で確認し、自動テストでは検証できない実環境動作を担保する。

##### 背景

自動テストはロジックの正しさを検証するが、実際のOAuthプロバイダーとの連携、カスタムプロトコルの動作、ユーザー体験は手動確認が必要。

##### テスト分類

- 機能テスト: OAuth認証フローの動作確認
- 統合テスト: 外部OAuth プロバイダーとの連携確認
- UI/UXテスト: ログイン画面のユーザー体験確認
- リグレッションテスト: 既存機能への影響確認

##### 使用エージェント

- **エージェント**: @frontend-tester
- **選定理由**: フロントエンド機能の手動テスト専門家
- **補助**: @auth-specialist（OAuth認証フローの検証）
- **参照**: `.claude/agents/agent_list.md`

##### 手動テストケース

| No  | カテゴリ       | テスト項目                   | 前提条件           | 操作手順                              | 期待結果                                     | 実行結果 | 備考 |
| --- | -------------- | ---------------------------- | ------------------ | ------------------------------------- | -------------------------------------------- | -------- | ---- |
| 1   | UI/UXテスト    | AuthGuard表示確認            | アプリ起動直後     | アプリを起動                          | AuthGuardのログイン画面が表示される          |          |      |
| 2   | UI/UXテスト    | ログインボタン表示確認       | ログイン画面表示中 | ログイン画面を確認                    | Google/GitHub/Discordボタンが表示される      |          |      |
| 3   | 機能テスト     | Google OAuth認証開始         | 未ログイン状態     | 「Googleで続ける」ボタンをクリック    | ブラウザでGoogle認証画面が開く               |          |      |
| 4   | 機能テスト     | GitHub OAuth認証開始         | 未ログイン状態     | 「GitHubで続ける」ボタンをクリック    | ブラウザでGitHub認証画面が開く               |          |      |
| 5   | 機能テスト     | Discord OAuth認証開始        | 未ログイン状態     | 「Discordで続ける」ボタンをクリック   | ブラウザでDiscord認証画面が開く              |          |      |
| 6   | 統合テスト     | Google認証コールバック処理   | Google認証完了後   | ブラウザで認証を許可                  | アプリに戻り、ダッシュボードが表示される     |          |      |
| 7   | 統合テスト     | GitHub認証コールバック処理   | GitHub認証完了後   | ブラウザで認証を許可                  | アプリに戻り、ダッシュボードが表示される     |          |      |
| 8   | 統合テスト     | Discord認証コールバック処理  | Discord認証完了後  | ブラウザで認証を許可                  | アプリに戻り、ダッシュボードが表示される     |          |      |
| 9   | UI/UXテスト    | ログイン後のユーザー情報表示 | ログイン済み       | Settings画面を開く                    | ユーザー名・メール・アバターが正しく表示     |          |      |
| 10  | 機能テスト     | ログアウト                   | ログイン済み       | ログアウトボタンをクリック            | ログイン画面に戻る                           |          |      |
| 11  | リグレッション | 認証済み状態でのアプリ起動   | ログイン済み       | アプリを再起動                        | ログイン画面をスキップしてダッシュボード表示 |          |      |
| 12  | リグレッション | 既存機能への影響確認         | ログイン済み       | Dashboard/Editor/Chat/Graph機能を操作 | すべての機能が正常動作する                   |          |      |

##### テスト実行手順

1. Electronアプリを起動（`pnpm --filter @repo/desktop dev`）
2. AuthGuardのログイン画面が表示されることを確認（テストケース1-2）
3. 各OAuthプロバイダーでログイン開始を確認（テストケース3-5）
4. ブラウザで実際に認証を実施（テストケース6-8）
5. ログイン後の機能を確認（テストケース9-12）
6. 結果を step08-manual-test.md に記録

##### 成果物

| 成果物                 | パス                                                   | 内容               |
| ---------------------- | ------------------------------------------------------ | ------------------ |
| 手動テスト結果レポート | docs/30-workflows/login-recovery/step08-manual-test.md | 手動テスト実行結果 |

##### 完了条件

- [ ] すべてのテストケースが実行済み
- [ ] すべてのテストケースがPASS
- [ ] スクリーンショットが記録済み（該当ケース）
- [ ] 発見された不具合が修正済みまたは未完了タスクとして記録済み

##### 依存関係

- **前提**: T-07-1（最終レビュー）
- **後続**: T-09-1（ドキュメント更新）

---

### Phase 9: ドキュメント更新・未完了タスク記録

#### T-09-1: ドキュメント更新・未完了タスク記録

##### 目的

1. ログイン機能復旧内容をシステムドキュメントに反映
2. レビューで発見された未完了タスクを記録

##### 前提条件

- [ ] Phase 6の品質ゲートをすべて通過
- [ ] Phase 7の最終レビューゲートを通過
- [ ] Phase 8の手動テストが完了
- [ ] すべてのテストが成功

---

##### サブタスク 9.1: システムドキュメント更新

**更新対象ドキュメント**:

`docs/00-requirements/17-security-guidelines.md`

- OAuth認証フローの説明更新
- カスタムプロトコルのセキュリティ考慮事項追加
- 認証トークン保存方法の説明

`docs/00-requirements/08-api-design.md`

- 認証APIエンドポイントの説明更新
- 認証状態管理の説明

`docs/00-requirements/05-architecture.md`

- 認証コンポーネント構成の更新（該当する場合）

**Claude Code スラッシュコマンド**:

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:update-all-docs
```

- **参照**: `.claude/commands/ai/command_list.md`

**使用エージェント**:

- **エージェント**: @spec-writer
- **選定理由**: 技術ドキュメント作成の専門家、仕様駆動開発の実践者
- **参照**: `.claude/agents/agent_list.md`

**更新原則**:

- 概要のみ記載（詳細な実装説明は不要）
- システム構築に必要十分な情報のみ追記
- 既存ドキュメントの構造・フォーマットを維持
- Single Source of Truth原則を遵守

---

##### サブタスク 9.2: 未完了タスク・追加タスク記録

**記録対象タスク（例）**:

- 本番環境でのカスタムプロトコル動作検証
- OAuth認証エラー時のユーザーフレンドリーなエラー表示改善
- セッション有効期限切れ時の自動リフレッシュ実装
- ログイン履歴・監査ログの実装
- 多要素認証（MFA）の実装

**出力先**: `docs/30-workflows/unassigned-task/`

**ファイル命名規則**:

- `task-auth-ux-improvements.md`（UX改善系）
- `task-auth-security-enhancements.md`（セキュリティ強化系）
- `requirements-auth-mfa.md`（新機能要件系）

**使用エージェント**:

- **エージェント**: @spec-writer
- **選定理由**: 指示書作成の専門家、100人中100人が実行可能な粒度で記述できる
- **品質検証**: @req-analyst（指示書の品質確認）
- **参照**: `.claude/agents/agent_list.md`

**指示書品質基準**:

- [ ] Why（なぜ必要か）が明確
- [ ] What（何を達成するか）が具体的
- [ ] How（どのように実行するか）が詳細
- [ ] Claude Codeスラッシュコマンド（/ai:xxx形式）が記載
- [ ] 使用エージェント・スキルが選定済み
- [ ] 完了条件が検証可能
- [ ] テストケース/検証方法が記載

---

##### 完了条件

- [ ] システムドキュメントが更新済み
- [ ] 未完了タスクがすべて記録済み
- [ ] 各未完了タスクが100人中100人実行可能な粒度で記述されている

##### 依存関係

- **前提**: T-08-1（手動テスト）
- **後続**: なし（タスク完了）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 未認証状態でアプリ起動時にAuthGuardログイン画面が表示される
- [ ] 認証済み状態でアプリ起動時にダッシュボードが表示される
- [ ] Google OAuth認証フローが正常に動作する
- [ ] GitHub OAuth認証フローが正常に動作する
- [ ] Discord OAuth認証フローが正常に動作する
- [ ] 認証コールバックが正しく処理される
- [ ] ログアウト後にログイン画面に戻る

### 品質要件

- [ ] 全ユニットテスト成功
- [ ] ESLintエラー: 0件
- [ ] TypeScriptエラー: 0件
- [ ] テストカバレッジ ≥ 80%
- [ ] セキュリティ脆弱性（Critical/High）: 0件

### ドキュメント要件

- [ ] システムドキュメント更新完了
- [ ] 未完了タスク記録完了
- [ ] 手動テスト結果記録完了

---

## 6. 検証方法

### 自動テスト

```bash
# 全テスト実行
pnpm --filter @repo/desktop test:run

# カバレッジ確認
pnpm --filter @repo/desktop test:coverage

# Lint確認
pnpm --filter @repo/desktop lint

# 型チェック
pnpm --filter @repo/desktop typecheck
```

### 手動テスト

```bash
# 開発サーバー起動
pnpm --filter @repo/desktop dev

# Electronアプリが起動後、以下を確認:
# 1. AuthGuardログイン画面が表示される
# 2. 各OAuthボタンをクリックしてブラウザが開く
# 3. ブラウザで認証を許可
# 4. アプリに戻ってダッシュボードが表示される
```

---

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                                    |
| -------------------------------- | ------ | -------- | ------------------------------------------------------- |
| ワークツリー再作成時のデータ損失 | 中     | 低       | コミット済み内容を事前確認、バックアップ作成            |
| カスタムプロトコル登録失敗       | 高     | 高       | 開発環境用の代替認証フロー実装（devInjectAuthCallback） |
| OAuth プロバイダーAPI変更        | 中     | 低       | Supabaseドキュメント確認、最新仕様適用                  |
| Supabase認証設定不備             | 高     | 中       | 環境変数確認、Supabaseダッシュボードで設定確認          |
| 既存機能への影響                 | 中     | 低       | リグレッションテストの実施                              |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/00-requirements/17-security-guidelines.md` - セキュリティガイドライン
- `docs/00-requirements/08-api-design.md` - API設計
- `docs/00-requirements/16-ui-ux-guidelines.md` - 認証UI設計（16.11節）
- `.claude/agents/agent_list.md` - 使用可能なエージェント一覧
- `.claude/commands/ai/command_list.md` - 使用可能なコマンド一覧

### 参考資料

- [Electron Custom Protocol](https://www.electronjs.org/docs/latest/api/app#appsetasdefaultprotocolclientprotocol-path-args)
- [Supabase Auth with OAuth](https://supabase.com/docs/guides/auth/social-login)
- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)
- [Electron Worktree](https://git-scm.com/docs/git-worktree)

### 関連タスク

- TASK-DT-001: フォルダ一括選択機能（このタスクの手動テスト準備時にAuthGuardを無効化したことが発端）
- PR #159: feat(desktop): フォルダ一括選択機能の実装

---

## 9. 備考

### 発見された根本原因

**ワークツリー破損**:

```bash
$ ls -la /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-1766023279741-f4ea87/
total 0
drwx------@ 4 dm  staff  128 Dec 20 12:29 .
drwxr-xr-x@ 3 dm  staff   96 Dec 20 12:28 ..
drwx------@ 3 dm  staff   96 Dec 20 12:29 .claude
drwx------@ 3 dm  staff   96 Dec 20 12:28 docs
```

→ `apps` ディレクトリが存在しない異常な状態

**AuthGuard不在**:

```bash
$ ls /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-1766023279741-f4ea87/apps/desktop/src/renderer/components/AuthGuard/
ls: No such file or directory
```

→ AuthGuardコンポーネントが存在しないため、importは成功するが実行時に機能しない

**メインリポジトリには存在**:

```bash
$ ls -la /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/apps/desktop/src/renderer/components/AuthGuard/
total 120
-rw-r--r--   1 dm  staff  9543 Dec  9 22:29 AuthErrorBoundary.test.tsx
-rw-r--r--   1 dm  staff  4647 Dec 12 08:19 AuthErrorBoundary.tsx
-rw-r--r--   1 dm  staff  9304 Dec  9 13:49 AuthGuard.test.tsx
-rw-r--r--@  1 dm  staff  2926 Dec 17 10:48 index.tsx
-rw-r--r--   1 dm  staff  1175 Dec 12 08:19 LoadingScreen.tsx
-rw-r--r--   1 dm  staff  9380 Dec  9 22:29 types.test.ts
-rw-r--r--   1 dm  staff  5551 Dec 10 01:16 types.ts
```

### 技術的制約

- 開発モードではカスタムプロトコル（aiworkflow://）が自動登録されない
- macOS: `setAsDefaultProtocolClient` は開発モードで制限がある
- 開発環境用の代替認証フロー（devInjectAuthCallback）が既に実装済み（前回の修正）

### 補足事項

- フォルダ一括選択機能（TASK-DT-001）のPR #159は既に作成済み
- このログイン機能復旧タスクは別のPRとして作成することを推奨
- ワークツリー修復後、フォルダ一括選択機能の手動テスト（T-08-1）を再実施する必要がある

---

**作成日時**: 2025-12-20
**優先度**: 🔴 高（Critical） - 認証機能はアプリの基本機能であり、最優先で対応が必要
**見積もり時間**: 4-6時間（ワークツリー修復含む）
