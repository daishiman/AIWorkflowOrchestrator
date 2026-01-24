# TASK-2C: セキュリティパターン定義

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| タスクID   | TASK-2C                   |
| ティア     | 1（MVP）                  |
| フェーズ   | Phase 2: サービス層       |
| 優先度     | high                      |
| 複雑度     | small                     |
| 依存       | TASK-1-1                  |
| 並列可能   | TASK-2A, TASK-2B          |
| ブロック   | TASK-3-1                  |
| タグ       | backend, shared, security |
| 作成日     | 2026-01-24                |
| 更新日     | 2026-01-24                |
| ステータス | pending                   |

---

## 1. 概要

### 1.1 目的

スキル実行時のセキュリティチェックに使用する危険コマンドパターン、保護パス、許可ツールホワイトリストを `packages/shared` に定義する。これらのパターンはPreToolUseフックで使用され、危険な操作を事前にブロックする。

### 1.2 背景

- specification.md（§7.1）でセキュリティパターンが設計済み
- execution-plan.md（Appendix B）に詳細な実装仕様が記載
- スキル実行エンジン（TASK-3-1）でセキュリティチェックを行うため、事前にパターン定義が必要
- 保護対象: システムディレクトリ、シェル設定、認証情報、クラウド認証情報

### 1.3 スコープ

**対象**:

- `DANGEROUS_PATTERNS.BASH_COMMANDS` - 危険コマンドパターン定義
- `DANGEROUS_PATTERNS.PROTECTED_PATHS` - 保護パスパターン定義
- `ALLOWED_TOOLS_WHITELIST` - 許可ツールホワイトリスト定義
- セキュリティチェック用ユーティリティ関数

**対象外**:

- フック実装（TASK-3-1-Bで実装）
- 権限確認UI（TASK-7Cで実装）
- PermissionResolver（TASK-3-2で実装）

---

## 2. 入力

| 入力       | パス                                                                             | 説明                      |
| ---------- | -------------------------------------------------------------------------------- | ------------------------- |
| 仕様書     | `docs/30-workflows/skill-import-agent-system/specification.md`                   | §7.1 セキュリティ考慮事項 |
| 実行計画   | `docs/30-workflows/skill-import-agent-system/execution-plan.md`                  | Appendix B セキュリティ   |
| タスク定義 | `docs/30-workflows/skill-import-agent-system/tasks/task-2c-security-patterns.md` | タスク詳細                |

---

## 3. 出力

| 成果物             | パス                                                       | 説明                       |
| ------------------ | ---------------------------------------------------------- | -------------------------- |
| セキュリティ定数   | `packages/shared/src/constants/security.ts`                | パターン定義・関数         |
| 定数index          | `packages/shared/src/constants/index.ts`                   | エクスポート設定           |
| sharedエクスポート | `packages/shared/src/index.ts`                             | 型・定数エクスポート追加   |
| 単体テスト         | `packages/shared/src/constants/__tests__/security.test.ts` | セキュリティパターンテスト |

---

## 4. 実装する定数・関数一覧

### 4.1 危険コマンドパターン

| カテゴリ         | パターン例                                     |
| ---------------- | ---------------------------------------------- | ------- |
| 破壊的コマンド   | `rm -rf`, `rm -r`, `> /dev/`, `dd if=`, `mkfs` |
| 権限昇格         | `sudo`, `su -`, `su `                          |
| シェル操作       | `chmod 777`, `chown root`, `chattr`, `setfacl` |
| コマンド置換     | `$(`, バッククォート                           |
| 危険なシェル起動 | `/bin/sh`, `/bin/bash`, `bash -c`, `sh -c`     |
| 評価・実行       | `eval `, `exec `, `source `                    |
| スケジューラ操作 | `crontab`, `at `                               |
| フォークボム     | `:(){ :                                        | :& };:` |

### 4.2 保護パスパターン

| カテゴリ                 | パターン例                                          |
| ------------------------ | --------------------------------------------------- |
| システムディレクトリ     | `/etc/**`, `/usr/**`, `/var/**`, `/sys/**`等        |
| シェル設定ファイル       | `**/.bashrc`, `**/.zshrc`, `**/.profile`等          |
| 認証・鍵ファイル         | `~/.ssh/**`, `~/.gnupg/**`                          |
| クラウド認証情報         | `~/.aws/**`, `~/.azure/**`, `~/.kube/**`等          |
| アプリケーション認証情報 | `**/.env`, `**/.env.local`, `**/credentials.json`等 |

### 4.3 許可ツールホワイトリスト

| ツール名  | 説明                 |
| --------- | -------------------- |
| Read      | ファイル読み取り     |
| Write     | ファイル書き込み     |
| Edit      | ファイル編集         |
| Bash      | コマンド実行         |
| Glob      | ファイルパターン検索 |
| Grep      | テキスト検索         |
| LS        | ディレクトリ一覧     |
| Task      | サブタスク実行       |
| WebSearch | Web検索              |
| WebFetch  | Webコンテンツ取得    |
| TodoWrite | TODO管理             |

### 4.4 ユーティリティ関数

| 関数名                 | 引数               | 戻り値          | 説明                         |
| ---------------------- | ------------------ | --------------- | ---------------------------- |
| `isDangerousCommand`   | `command: string`  | `boolean`       | コマンドが危険かどうか判定   |
| `isProtectedPath`      | `filePath: string` | `boolean`       | パスが保護対象かどうか判定   |
| `matchGlobPattern`     | `path, pattern`    | `boolean`       | Globパターンマッチ（簡易版） |
| `validateAllowedTools` | `tools: string[]`  | `boolean`       | 許可ツールを検証             |
| `filterAllowedTools`   | `tools: string[]`  | `AllowedTool[]` | 無効なツールを除外           |

---

## 5. Phase一覧

| Phase | ファイル                                                       | 概要                   |
| ----- | -------------------------------------------------------------- | ---------------------- |
| 1     | [phase-1-requirements.md](./phase-1-requirements.md)           | 要件定義               |
| 2     | [phase-2-design.md](./phase-2-design.md)                       | 設計                   |
| 3     | [phase-3-design-review.md](./phase-3-design-review.md)         | 設計レビューゲート     |
| 4     | [phase-4-test-creation.md](./phase-4-test-creation.md)         | テスト作成（TDD: Red） |
| 5     | [phase-5-implementation.md](./phase-5-implementation.md)       | 実装（TDD: Green）     |
| 6     | [phase-6-test-enhancement.md](./phase-6-test-enhancement.md)   | テスト拡充             |
| 7     | [phase-7-test-coverage.md](./phase-7-test-coverage.md)         | テストカバレッジ確認   |
| 8     | [phase-8-refactoring.md](./phase-8-refactoring.md)             | リファクタリング       |
| 9     | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | 品質保証               |
| 10    | [phase-10-final-review.md](./phase-10-final-review.md)         | 最終レビューゲート     |
| 11    | [phase-11-manual-testing.md](./phase-11-manual-testing.md)     | 手動テスト検証         |
| 12    | [phase-12-documentation.md](./phase-12-documentation.md)       | ドキュメント更新       |
| 13    | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | PR作成                 |

---

## 6. 完了条件

### 6.1 機能要件

- [ ] `DANGEROUS_PATTERNS.BASH_COMMANDS` が全パターンを含む
- [ ] `DANGEROUS_PATTERNS.PROTECTED_PATHS` が全パターンを含む
- [ ] `ALLOWED_TOOLS_WHITELIST` が全許可ツールを含む
- [ ] `isDangerousCommand()` が正しく危険コマンドを検出する
- [ ] `isProtectedPath()` が正しく保護パスを検出する
- [ ] `matchGlobPattern()` がGlobパターンを正しくマッチする
- [ ] `validateAllowedTools()` が無効なツールを検出する
- [ ] `filterAllowedTools()` が有効なツールのみを返す

### 6.2 品質要件

- [ ] TypeScript strict モードでコンパイルエラーがない
- [ ] `pnpm --filter @repo/shared build` が成功する
- [ ] JSDoc コメントが全ての public 定数・関数に付与されている
- [ ] eslint/prettier エラーがない

### 6.3 テスト要件

- [ ] 全ユーティリティ関数の単体テストがパスする
- [ ] エッジケース（空文字列、nullパス等）がテストされている
- [ ] Line Coverage 80%以上

---

## 7. 参照資料

### 7.1 仕様書

| 資料名     | パス                                                            | セクション |
| ---------- | --------------------------------------------------------------- | ---------- |
| 機能仕様書 | `docs/30-workflows/skill-import-agent-system/specification.md`  | §7.1-7.4   |
| 実行計画   | `docs/30-workflows/skill-import-agent-system/execution-plan.md` | Appendix B |

### 7.2 システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                             | 内容                 |
| ------------------------- | -------------------------------------------------------------------------------- | -------------------- |
| セキュリティ設計原則      | `.claude/skills/aiworkflow-requirements/references/security-principles.md`       | 基本原則、最小権限等 |
| セキュリティ実装          | `.claude/skills/aiworkflow-requirements/references/security-implementation.md`   | 暗号化、認証         |
| 入力バリデーション        | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md` | 入力検証パターン     |
| Electron API セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`     | IPC、safeStorage     |

### 7.3 既存実装

| 資料名       | パス                                 | 説明             |
| ------------ | ------------------------------------ | ---------------- |
| 共通型定義   | `packages/shared/src/types/skill.ts` | TASK-1-1の成果物 |
| 既存index.ts | `packages/shared/src/index.ts`       | エクスポート設定 |

---

## 8. リスクと対策

| リスク                       | 影響度 | 対策                                     |
| ---------------------------- | ------ | ---------------------------------------- |
| パターン漏れによる脆弱性     | 高     | 仕様書の全パターンをチェックリストで確認 |
| Globパターンマッチの誤動作   | 中     | エッジケーステストを充実させる           |
| ホームディレクトリ展開の失敗 | 中     | process.env.HOME のフォールバック処理    |
| 正規表現インジェクション     | 低     | パターン文字のエスケープ処理             |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
