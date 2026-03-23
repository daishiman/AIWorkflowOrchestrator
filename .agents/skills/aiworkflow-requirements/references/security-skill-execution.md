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

## Permission Store（権限永続化）

**実装タスク**: TASK-3-1-E（2026-01-26完了）
**実装場所**: `apps/desktop/src/main/services/skill/PermissionStore.ts`
**型定義**: `packages/shared/src/types/permission-store.ts`

### 概要

ユーザーが「この選択を記憶する（rememberChoice）」を選択した場合のツール許可状態をelectron-storeで永続化するサービスです。

### アーキテクチャ

**処理フロー**:

| ステップ | コンポーネント        | 処理内容                                         | 計算量 |
| -------- | --------------------- | ------------------------------------------------ | ------ |
| 1        | Skill Request         | スキル実行リクエスト受信                         | -      |
| 2        | isToolAllowed()       | In-Memory Mapでツール許可状態を確認              | O(1)   |
| 3a       | （許可済みの場合）    | Execute: ツール実行へ進む                        | -      |
| 3b       | （未許可の場合）      | Show Dialog: 許可ダイアログを表示                | -      |
| 4        | electron-store        | 永続化層でIn-Memory Mapと同期                    | -      |

**データフロー**:

- Skill Request → isToolAllowed() → In-Memory Map（O(1) lookup）
- In-Memory Map ↔ electron-store（永続化・同期）
- isToolAllowed()の結果 → Yes: Execute / No: Show Dialog

### データスキーマ

**PermissionStoreSchema**:

| フィールド     | 型                   | 説明                           |
| -------------- | -------------------- | ------------------------------ |
| version        | number               | スキーマバージョン（現在: 1）  |
| allowedTools   | AllowedToolEntry[]   | 許可済みツール一覧             |
| updatedAt      | string               | 最終更新日時（ISO 8601形式）   |

**AllowedToolEntry**:

| フィールド | 型     | 説明                       |
| ---------- | ------ | -------------------------- |
| toolName   | string | ツール識別子               |
| allowedAt  | string | 許可日時（ISO 8601形式）   |

### API

| メソッド                  | 戻り値               | 計算量 | 説明                         |
| ------------------------- | -------------------- | ------ | ---------------------------- |
| `isToolAllowed(tool)`     | `boolean`            | O(1)   | ツールが許可済みか判定       |
| `allowTool(tool)`         | `void`               | O(1)   | ツールを許可リストに追加     |
| `revokeTool(tool)`        | `boolean`            | O(1)   | ツールを許可リストから削除   |
| `getAllowedTools()`       | `string[]`           | O(n)   | 許可ツール名一覧を取得       |
| `getAllowedToolEntries()` | `AllowedToolEntry[]` | O(n)   | 許可ツール詳細一覧を取得     |
| `clearAll()`              | `number`             | O(n)   | 全許可をクリア（削除数返却） |

### ストレージ

| OS      | パス                                                              |
| ------- | ----------------------------------------------------------------- |
| macOS   | ~/Library/Application Support/@repo-desktop/permission-store.json |
| Windows | %APPDATA%/@repo-desktop/permission-store.json                     |
| Linux   | ~/.config/@repo-desktop/permission-store.json                     |

### セキュリティ考慮事項

| 項目               | 対策                                              |
| ------------------ | ------------------------------------------------- |
| 不正アクセス防止   | Main Process専用、IPCチャンネルでRenderer間接操作 |
| データ機密性       | ツール名とタイムスタンプのみ保存（機密情報なし）  |
| データ破損対策     | 読み込みエラー時はデフォルト値で初期化            |
| 入力検証           | toolNameはALLOWED_TOOLS_WHITELISTで検証可能       |
| シングルトン保証   | getInstance()によるインスタンス管理               |

### テストカバレッジ

| メトリクス        | 値     |
| ----------------- | ------ |
| Line Coverage     | 96%+   |
| Function Coverage | 100%   |
| テスト数          | 86件   |

---

## Permission Store V2（UT-06-002）

**実装タスク**: UT-06-002（2026-03-23完了）
**実装場所**: `apps/desktop/src/main/services/skill/PermissionStore.ts`
**型定義**: `packages/shared/src/types/permission-store.ts`

### 概要

V1 の AllowedToolEntry を拡張し、有効期限（expiresAt）・スキルスコープ（skillName）・期限ポリシー（expiryPolicy）を追加。セッション単位の権限管理と期限切れエントリの自動クリーンアップ（lazy eviction）を実現する。

### V2 型定義

**ExpiryPolicy**:

| 値 | 有効期限 | expiresAt |
| --- | --- | --- |
| `session` | アプリ終了まで | `undefined`（セッション終了時に revokeSessionEntries で削除） |
| `time_24h` | 24 時間 | `allowedAt + 86_400_000` |
| `time_7d` | 7 日間 | `allowedAt + 604_800_000` |
| `permanent` | 無期限 | `undefined`（削除されない限り有効） |

**AllowedToolEntryV2**（AllowedToolEntry を extends）:

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| toolName | string | Yes | ツール識別子（V1 継承） |
| allowedAt | string | Yes | 許可日時 ISO 8601（V1 継承） |
| expiresAt | number | No | 有効期限 UNIX ミリ秒 |
| skillName | string | No | スキルスコープ（未指定=全スキル） |
| expiryPolicy | ExpiryPolicy | No | 期限ポリシー |

**PermissionStoreSchemaV2**:

| フィールド | 型 | 説明 |
| --- | --- | --- |
| version | number | スキーマバージョン（2） |
| allowedTools | AllowedToolEntryV2[] | V2 許可ツール一覧 |
| updatedAt | string | 最終更新日時 ISO 8601 |

### V2 API

| メソッド | 戻り値 | 説明 |
| --- | --- | --- |
| `isToolAllowed(toolName, skillName?)` | `boolean` | 6 分岐フローでツール許可判定（lazy eviction 付き） |
| `allowToolV2(entry)` | `void` | V2 エントリ登録（session/permanent の expiresAt 強制リセット） |
| `revokeSessionEntries(sessionId)` | `{ revokedCount: number }` | session スコープエントリのみ選択削除 |
| `getAllowedToolEntriesV2()` | `AllowedToolEntryV2[]` | 期限切れ自動クリーンアップ付き一覧取得 |

### isToolAllowed 6 分岐フロー

| 分岐 | 条件 | 結果 |
| --- | --- | --- |
| 1 | エントリなし | `false` |
| 2 | expiresAt 未定義 | skillName チェックへ |
| 3 | 期限切れ（Date.now() > expiresAt） | エントリ削除 → `false` |
| 4 | 有効期限内 | skillName チェックへ |
| 5 | skillName 不一致 | `false` |
| 6 | 全条件パス | `true` |

### V1→V2 マイグレーション

起動時に `initializeCache()` で V1 エントリを検出し、`expiryPolicy: undefined`（permanent 相当）・`skillName: undefined`（全スキル）として V2 形式に自動変換する。version フィールドが 1 → 2 に更新される。

### IPC チャネル

| チャネル | 方向 | 引数 | 戻り値 |
| --- | --- | --- | --- |
| `permission:clear-session` | R→M | `{ sessionId: string }` | `ClearSessionResponse` |

P42 準拠 3 段バリデーション: `typeof sessionId !== "string"` → `sessionId === ""` → `sessionId.trim() === ""`

---

## Permission フォールバック セキュリティ（UT-06-005）

#### fail-closed 原則の適用

Permission 拒否・timeout・不明エラー時は、デフォルトで abort に遷移する。

| シナリオ | 対応 | セキュリティ根拠 |
| --- | --- | --- |
| Permission 明示拒否 | abort（reason: "denied"） | 不正なツール実行を防止 |
| タイムアウト（30秒） | abort（reason: "timeout"） | 応答不能状態でのリソース占有を防止 |
| 最大リトライ到達（3回） | abort（reason: "max_retries"） | 無限リトライによるリソース枯渇を防止 |
| 不明エラー | abort（reason: "unknown"） | 未知の状態での実行継続を防止 |

#### UT-06-005-A 実行時統合のセキュリティ契約

| 観点 | 契約 |
| --- | --- |
| Hook 接続 | `PreToolUse` は `handlePermissionCheck()` を必ず経由する |
| timeout 経路 | `PermissionTimeoutError` を `executeAbortFlow("timeout")` に変換して fail-closed を維持 |
| fallback 例外 | `processPermissionFallback()` 内例外は `executeAbortFlow("unknown")` にフォールバック |
| skip 経路 | `executeSkipFlow()` は当該ツールのみ停止し、ExecutionState は `running` を維持 |

#### revokeSessionEntries によるセッション権限クリーンアップ

abort 時に `permissionStore.revokeSessionEntries(executionId)` を呼び出し、当該実行セッションで付与された一時許可を取り消す。abort されたスキルの rememberChoice 許可が残存し、後続の実行で意図しない自動許可が発生することを防止する。

#### retry 上限のセキュリティ根拠

リトライ最大回数を3回に制限する理由:
1. 無限リトライによる計算リソースの枯渇を防止
2. 繰り返しの Permission 要求によるユーザー体験の劣化を防止
3. 攻撃者がリトライ機構を悪用して大量の Permission ダイアログを生成することを防止

---

## 公開判定セキュリティ（TASK-SKILL-LIFECYCLE-08 / spec_created）

TASK-SKILL-LIFECYCLE-08 では公開前判定を `PublishReadiness` として設計した。  
`ToolRiskLevel` と `SafetyGateStatus` を入力に、fail-closed で公開可否を決める。

### 判定マトリクス（代表）

| riskLevel | gateStatus | qualityTrend | 判定 | セキュリティ方針 |
| --- | --- | --- | --- | --- |
| low | approved | improving/stable | `auto-approved` | 自動公開可 |
| medium | approved | improving/stable | `review-required` | 人手レビュー必須 |
| high | approved | improving/stable | `manual-approval-required` | 管理者承認必須 |
| critical | approved | any | `blocked` | fail-closed（公開不可） |
| any | rejected | any | `blocked` | SafetyGate 優先 |
| any | pending | any | `review-required` | 承認完了まで保留 |

### 不変条件

- `riskLevel === "critical"` は常に `blocked`。
- `gateStatus === "rejected"` は品質指標に関わらず `blocked`。
- `manual-approval-required` は `high` 以上を含むケースでのみ許容。

### PublishReadiness と SkillVisibility 遷移の接続

`PublishReadiness` の判定結果は `SkillVisibility` の遷移可否を制御する。

| PublishReadiness | local → team | team → public | セキュリティ根拠 |
| --- | --- | --- | --- |
| `auto-approved` | 許可 | 許可 | 全指標が基準を充足 |
| `review-required` | 許可（レビュー後） | 保留（レビュー完了待ち） | 人手検証が必要 |
| `manual-approval-required` | 保留（承認待ち） | 保留（承認待ち） | high リスクツールを含む |
| `blocked` | 拒否 | 拒否 | critical リスクまたは SafetyGate rejected |

IPC チャンネル: `skill:publishing:check-readiness` → `PublishReadiness` を返却。
型定義: `packages/shared/src/types/publish-eligibility.ts`

### 実装移行の未タスク

- `UT-SKILL-LIFECYCLE-08-TYPE-IMPL`
- `UT-SKILL-LIFECYCLE-08-IPC-TEST`

---

## 関連ドキュメント

- [セキュリティ実装概要](./security-implementation.md)
- [APIセキュリティ・Electronセキュリティ](./security-api-electron.md)
- [入力バリデーション](./security-input-validation.md)
- [Agent SDK インターフェース](./interfaces-agent-sdk.md)
- [設定画面 UI/UX](./ui-ux-settings.md) - PermissionSettings UI

---

## ToolRiskLevel 参照（TASK-SKILL-LIFECYCLE-06）

スキル実行時のツール権限判定には、以下の型定義を使用する。

- 型定義ファイル: `packages/shared/src/constants/security.ts`
- 主要型: `ToolRiskLevel`（"critical" | "high" | "medium" | "low"）
- 設定マップ: `TOOL_RISK_CONFIG`（各レベルの allowApproveOnce / allowPermanent / autoDenyDefault を定義）

Critical ツールは `autoDenyDefault: true` のため、PermissionDialog を表示せずに自動拒否する。
詳細は TASK-SKILL-LIFECYCLE-06 の設計書（docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-2/）を参照。

---

## 変更履歴

| バージョン | 日付       | 変更内容                                         |
| ---------- | ---------- | ------------------------------------------------ |
| v1.7.0     | 2026-03-23 | UT-06-002 反映: Permission Store V2 セクション追加（AllowedToolEntryV2 / ExpiryPolicy / isToolAllowed 6分岐 / V1→V2 マイグレーション / permission:clear-session IPC） |
| v1.6.0     | 2026-03-17 | UT-06-005-A 反映: PreToolUse Hook への fallback 統合契約、Permission timeout 30秒化、PermissionTimeoutError→abort("timeout") の fail-closed 経路を追記 |
| v1.5.0     | 2026-03-17 | DefaultSafetyGate 具象クラス実装完了（UT-06-003）: SafetyGatePort → DefaultSafetyGate 具象化フロー、protectedPaths 設定、DI パターンを [arch-electron-services-details-part2.md](./arch-electron-services-details-part2.md) に記録 |
| v1.4.0     | 2026-03-16 | ToolRiskLevel参照追加: TASK-SKILL-LIFECYCLE-06設計成果物への参照リンク |
| v1.3.0     | 2026-02-01 | toolMetadataモジュール参照追加: ALLOWED_TOOLS_WHITELIST vs toolMetadata対応表、差異理由、ui-ux-agent-execution.mdリンク |
| 1.2.0      | 2026-01-26 | 仕様ガイドライン準拠: コード例を表形式・文章に変換 |
| 1.1.0      | 2026-01-26 | Permission Store機能追加（TASK-3-1-E）           |
| 1.0.0      | 2026-01-24 | 初版作成（TASK-2C完了に伴い新規作成）            |
