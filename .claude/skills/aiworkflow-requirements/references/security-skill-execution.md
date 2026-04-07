# スキル実行セキュリティ

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

**親ドキュメント**: [security-implementation.md](./security-implementation.md)

## 概要

Claude Codeスキル実行時のセキュリティチェックに使用する危険コマンドパターン、保護パス、許可ツールホワイトリストの定義と検証関数の仕様。

**実装タスク**: TASK-2C（2026-01-24完了）
**実装場所**: `packages/shared/src/constants/security.ts`
**エクスポートパス**: `@repo/shared/constants`

---

## エクスポート一覧

| カテゴリ         | エクスポート名          | 型                  | 用途                             |
| ---------------- | ----------------------- | ------------------- | -------------------------------- |
| 危険パターン定数 | DANGEROUS_PATTERNS      | Object              | 危険コマンド・保護パスの定義     |
|                  | ALLOWED_TOOLS_WHITELIST | readonly string[]   | 許可ツールリスト（11ツール）     |
| 検証関数         | isDangerousCommand      | (cmd) => boolean    | 危険コマンド判定（単語境界対応） |
|                  | isProtectedPath         | (path) => boolean   | 保護パス判定（Glob対応）         |
|                  | matchGlobPattern        | (path, pat) => bool | Globパターンマッチ               |
| ツール検証関数   | validateAllowedTools    | (tools) => boolean  | ツールリスト全検証               |
|                  | filterAllowedTools      | (tools) => Tool[]   | 許可ツールフィルタ               |
| 型定義           | AllowedTool             | type                | 許可ツールリテラル型             |

---

## DANGEROUS_PATTERNS

### BASH_COMMANDS（24パターン）

危険なBashコマンドのパターンリスト。PreToolUseフックでのコマンド検証に使用。

| カテゴリ         | パターン                                       | リスクレベル |
| ---------------- | ---------------------------------------------- | ------------ | -------- | -------- |
| 破壊的コマンド   | `rm -rf`, `rm -r`, `> /dev/`, `dd if=`, `mkfs` | Critical     |
| 権限昇格         | `sudo`, `su -`, `su `                          | Critical     |
| シェル操作       | `chmod 777`, `chown root`                      | High         |
| コマンド置換     | `$(`, `` ` ``                                  | High         |
| 危険なシェル起動 | `/bin/sh`, `/bin/bash`, `bash -c`              | High         |
| 評価・実行       | `eval `, `exec `, `source `                    | High         |
| スケジューラ     | `crontab`, `at `                               | Medium       |
| フォークボム     | `:(){ :                                        | :& };:`      | Critical |
| ネットワーク     | `curl                                          | sh`, `wget   | sh`      | Critical |

**検出方式**: 単語境界考慮の正規表現マッチング

**単語境界処理ロジック**:

| 処理ステップ       | 説明                                                   |
| ------------------ | ------------------------------------------------------ |
| パターン判定       | コマンドパターンにスペースが含まれるか確認             |
| スペース含む場合   | パターンをそのまま正規表現として使用                   |
| スペースなしの場合 | `\b`（単語境界）をパターン先頭に付加                   |
| マッチング実行     | 生成した正規表現でコマンド文字列をテスト               |
| 結果               | マッチすればtrue（危険）、マッチしなければfalse（安全）|

### PROTECTED_PATHS（25パターン）

保護すべきファイルパスのGlobパターンリスト。Write/Editツールでのパス検証に使用。

| カテゴリ             | パターン                                      | 保護理由                |
| -------------------- | --------------------------------------------- | ----------------------- |
| システムディレクトリ | `/etc/**`, `/usr/**`, `/var/**`               | システム設定保護        |
| ブートディレクトリ   | `/boot/**`, `/sbin/**`, `/bin/**`             | OS起動保護              |
| シェル設定ファイル   | `**/.bashrc`, `**/.zshrc`, `**/.profile`      | シェル環境保護          |
| Git設定              | `**/.gitconfig`                               | Git認証情報保護         |
| SSH鍵                | `~/.ssh/**`                                   | SSH認証情報保護         |
| GPG鍵                | `~/.gnupg/**`                                 | 暗号鍵保護              |
| クラウド認証情報     | `~/.aws/**`, `~/.kube/**`, `~/.gcloud/**`     | クラウドアクセス保護    |
| アプリケーション認証 | `**/.env`, `**/.env.*`, `**/credentials.json` | API鍵・シークレット保護 |
| パスワードストア     | `~/.password-store/**`                        | パスワード保護          |
| npmトークン          | `**/.npmrc`                                   | パッケージ公開権限保護  |

**Globパターン対応**:

| パターン | 意味                     | 例                           |
| -------- | ------------------------ | ---------------------------- |
| `**`     | 任意の深さのパスにマッチ | `/etc/**` → `/etc/passwd`    |
| `*`      | 単一階層にマッチ         | `*.env` → `production.env`   |
| `~`      | ホームディレクトリに展開 | `~/.ssh` → `/home/user/.ssh` |

---

## ALLOWED_TOOLS_WHITELIST

スキル実行時に許可されるツールのホワイトリスト。

| ツール名  | 用途                 | リスクレベル |
| --------- | -------------------- | ------------ |
| Read      | ファイル読み取り     | Low          |
| Write     | ファイル書き込み     | Medium       |
| Edit      | ファイル編集         | Medium       |
| Bash      | コマンド実行         | High         |
| Glob      | ファイルパターン検索 | Low          |
| Grep      | テキスト検索         | Low          |
| LS        | ディレクトリ一覧     | Low          |
| Task      | サブタスク実行       | Medium       |
| WebSearch | Web検索              | Low          |
| WebFetch  | Webコンテンツ取得    | Medium       |
| TodoWrite | TODOリスト書き込み   | Low          |

**型定義**:

AllowedTool型はALLOWED_TOOLS_WHITELISTの要素をリテラル型として定義します。結果として "Read" | "Write" | "Edit" | "Bash" | "Glob" | "Grep" | "LS" | "Task" | "WebSearch" | "WebFetch" | "TodoWrite" のユニオン型となります。

### toolMetadataモジュール（PermissionDialog表示用）

ALLOWED_TOOLS_WHITELISTに加えて、PermissionDialogでのリスクレベルバッジ表示用に `toolMetadata.ts` モジュールが存在する。

**ファイル**: `apps/desktop/src/renderer/components/skill/toolMetadata.ts`

**目的**: PermissionDialogでツール使用許可を求める際に、リスクレベルバッジとセキュリティ影響テキストを表示する。

#### ALLOWED_TOOLS_WHITELIST vs toolMetadata対応

| 対象         | ツール数 | 目的                                   |
| ------------ | -------- | -------------------------------------- |
| WHITELIST    | 11       | スキル実行時のセキュリティ制御         |
| toolMetadata | 12       | PermissionDialog UIでのリスクレベル表示 |

**差異理由**:
- toolMetadataに存在しWHITELISTにないツール（NotebookEdit, Skill, AskUser）: Renderer UIで表示されうるがスキル実行制御の対象外
- WHITELISTに存在しtoolMetadataにないツール（LS, TodoWrite）: Renderer UIでの使用頻度が低く、未定義時はDEFAULT_METADATA（Medium）にフォールバック

**詳細仕様**: [ui-ux-agent-execution.md](./ui-ux-agent-execution.md)（toolMetadataモジュール仕様・ツールカバレッジマッピング）

---

## API リファレンス

### isDangerousCommand(command: string): boolean

コマンド文字列に危険なパターンが含まれているか判定。

**動作例**:

| 入力コマンド            | 戻り値 | 理由                       |
| ----------------------- | ------ | -------------------------- |
| `rm -rf /`              | true   | 破壊的コマンド             |
| `sudo apt-get update`   | true   | 権限昇格                   |
| `ls -la`                | false  | 安全なコマンド             |
| `cat file.txt`          | false  | 単語境界考慮でatを誤検出しない |
| （空文字列）            | false  | 空文字列は安全扱い         |

**特徴**:

- 単語境界を考慮（`cat`の`at`を誤検出しない）
- 空文字列は`false`を返す

### isProtectedPath(filePath: string): boolean

パスが保護対象かどうか判定。

**動作例**:

| 入力パス               | 戻り値 | 理由                 |
| ---------------------- | ------ | -------------------- |
| `/etc/passwd`          | true   | システムファイル     |
| `~/.ssh/id_rsa`        | true   | SSH鍵                |
| `/home/user/.bashrc`   | true   | シェル設定           |
| `/tmp/test.txt`        | false  | 一時ファイル         |
| （空文字列）           | false  | 空文字列は非保護扱い |

**特徴**:

- Globパターン（`**`, `*`, `~`）をサポート
- `~`はホームディレクトリ（`process.env.HOME`）に展開

### matchGlobPattern(path: string, pattern: string): boolean

パスがGlobパターンにマッチするか判定。

**動作例**:

| パス                   | パターン      | 戻り値 |
| ---------------------- | ------------- | ------ |
| `/etc/passwd`          | `/etc/**`     | true   |
| `/home/user/.bashrc`   | `**/.bashrc`  | true   |
| `/tmp/test`            | `/etc/**`     | false  |

### validateAllowedTools(tools: readonly string[]): boolean

ツールリストが全て許可リストに含まれるか検証。

**動作例**:

| 入力ツールリスト       | 戻り値 | 理由               |
| ---------------------- | ------ | ------------------ |
| ["Read", "Write"]      | true   | 全て許可ツール     |
| ["Read", "Unknown"]    | false  | 未知のツールを含む |
| []                     | true   | 空配列は許可       |

### filterAllowedTools(tools: readonly string[]): AllowedTool[]

許可されたツールのみをフィルタリング。

**動作例**:

| 入力ツールリスト             | 戻り値            |
| ---------------------------- | ----------------- |
| ["Read", "Invalid", "Write"] | ["Read", "Write"] |
| ["Unknown"]                  | []                |

---

## 使用例

### PreToolUseフックでの使用

PreToolUseフックでは、ツール名と引数に基づいてセキュリティチェックを実行します。

**処理フロー**:

| ステップ | ツール名          | チェック内容                                          | ブロック条件                   |
| -------- | ----------------- | ----------------------------------------------------- | ------------------------------ |
| 1        | Bash              | isDangerousCommandでコマンド引数を検証                | 危険パターン検出時             |
| 2        | Write / Edit      | isProtectedPathでファイルパス引数を検証               | 保護パス検出時                 |
| 3        | その他            | 追加チェックなし                                      | -                              |

**エラー処理**: ブロック条件に該当した場合、"Dangerous command blocked" または "Protected path blocked" エラーをスローして操作を拒否します。

### スキル定義の検証

スキル定義時のallowedTools検証処理では、validateAllowedToolsとfilterAllowedToolsを組み合わせて使用します。

**処理フロー**:

| ステップ | 処理内容                                         | 結果                     |
| -------- | ------------------------------------------------ | ------------------------ |
| 1        | validateAllowedToolsで全ツールの有効性を確認     | true: 検証完了 / false: 次へ |
| 2        | 検証失敗時、filterAllowedToolsで有効ツールを抽出 | 有効ツールリストを取得   |
| 3        | 警告ログ出力（無効ツールが除外された旨）         | コンソール出力           |
| 4        | スキル定義のallowedToolsを有効ツールで上書き     | スキル定義更新           |

---

## Skill Lifecycle 実行境界（TASK-SKILL-LIFECYCLE-03）

`SkillLifecyclePanel` は単一 UI だが、権限境界は既存の skill execute 契約に従う。

| ステップ | 内部 role | 実行 API | セキュリティ要件 |
| --- | --- | --- | --- |
| request 解析 | Planner | `skillCreator.detectMode` | mode 判定のみ。ファイル操作なし |
| 作成 | Create | `skill.create` | 既存 store 経由。validation / list refresh を維持 |
| 実行 | Executor | `skill.execute` | preflight / permission / allowedTools 制御を維持 |
| 改善提案 | Improver | `skillCreator.improveSkill` | autoApply false を既定にし、即時変更を避ける |
| 詳細改善 | Analysis | `skill.analyze` / `skill.applyImprovements` | 詳細適用は既存 analysis 権限境界に委譲 |

### UI 非露出原則

- `SubAgent` / `Codex` は内部 role として説明だけ行い、権限選択 UI にしない。
- ユーザーは `作成する / 実行する / 改善提案を取得` の 3 操作だけを理解すればよい。

---

## テストカバレッジ

| メトリクス        | 値     |
| ----------------- | ------ |
| Line Coverage     | 98.4%  |
| Branch Coverage   | 95.45% |
| Function Coverage | 100%   |
| テスト数          | 102件  |

**テストファイル**:

- `packages/shared/src/constants/__tests__/security.test.ts` (89テスト)
- `packages/shared/src/constants/__tests__/manual-import.test.ts` (13テスト)

---



---

## 続き

後半コンテンツは分割ファイルを参照:
- [security-skill-execution-permission.md](security-skill-execution-permission.md) — Permission Store V1/V2/フォールバック
