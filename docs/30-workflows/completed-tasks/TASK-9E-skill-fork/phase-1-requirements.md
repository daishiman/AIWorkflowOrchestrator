# Phase 1: 要件定義

## メタ情報

| 項目     | 値                 |
| -------- | ------------------ |
| Phase    | 1                  |
| 機能名   | TASK-9E-skill-fork |
| タスクID | TASK-9E            |
| 作成日   | 2026-02-28         |

## 目的

スキルフォーク・派生機能の機能要件・非機能要件を抽出し、受け入れ基準を定義する。既存スキルをベースに新しいスキルを作成する機能の要件を明文化する。

## 実行タスク

- Task 1: 機能要件（FR）の抽出・定義
- Task 2: 非機能要件（NFR）の抽出・定義
- Task 3: 受け入れ基準の定義（Gherkin形式）
- Task 4: インターフェース仕様の整理（型定義・IPCチャネル・既存機能との棲み分け）

## 参照資料

| 資料名                 | パス                                                                                               | 説明                           |
| ---------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------ |
| フォーク仕様           | `docs/30-workflows/skill-import-agent-system/specification.md` §19                                 | フォーク・派生機能仕様         |
| 設計判断               | `docs/30-workflows/skill-import-agent-system/technical-decisions.md` §20                           | フォーク機能の設計判断         |
| タスク仕様             | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-023f-task-9e-skill-fork.md` | TASK-9E 実装仕様               |
| IPC仕様                | `aiworkflow-requirements: api-ipc-agent.md`                                                        | IPC チャネル仕様               |
| スキルインターフェース | `aiworkflow-requirements: interfaces-agent-sdk-skill.md`                                           | スキル型定義仕様               |
| セキュリティ仕様       | `aiworkflow-requirements: security-electron-ipc.md`                                                | IPC セキュリティバリデーション |

## aiworkflow-requirements 抽出結果（Task 4 連携）

| 仕様書                                    | 抽出した必須情報                                                             | TASK-9E 要件への反映                                                                                |
| ----------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `api-ipc-agent.md`                        | IPC 統一レスポンス `IpcResult<T>`、P42準拠3段バリデーション                  | FR-6 を `IpcResult<SkillForkResult>` で定義し、型/空文字/trim の3段検証を必須化                     |
| `architecture-overview.md`                | Main/IPC/Preload の責務境界と公開経路                                        | FR-1/FR-6 を層別に分離し、責務混在を禁止                                                            |
| `architecture-implementation-patterns.md` | IPC 実装時の既知落とし穴（P42/P44/P45）                                      | NFR-2 の品質条件としてドリフト防止を追加                                                            |
| `interfaces-agent-sdk-skill.md`           | 既存に `skill-creator:fork` が存在し、SkillCreator 系APIと責務分離されている | TASK-9E は `skill-api.ts` 側の `skill:fork` を追加対象として定義し、Phase 12 で仕様差分を正本へ反映 |
| `security-electron-ipc.md`                | `validateIpcSender`、エラーサニタイズ、チャンネルホワイトリスト管理          | FR-6/NFR-2 のセキュリティ要件に sender 検証と sanitizeError を明記                                  |
| `security-api-electron.md`                | Preload API 公開時の `safeInvoke` 経由と限定公開                             | Preload 層要件に `forkSkill()` + `IPC_CHANNELS.SKILL_FORK` を追加                                   |
| `error-handling.md`                       | エラー分類（バリデーション/FS/予期せぬ例外）とレスポンス一貫性               | FR/NFR の異常系要件でエラー分類を固定し、完了条件に検証項目として追加                               |
| `ipc-contract-checklist.md`               | P44/P45対策としてハンドラ/Preload/型定義の3点同期                            | Phase 10/12 のレビュー・仕様更新で契約ドリフト監査を必須化                                          |
| `quality-requirements.md`                 | テストカバレッジ閾値の数値基準                                               | NFR-3 に数値基準を固定し、受け入れ基準に反映                                                        |
| `testing-component-patterns.md`           | テストケース設計の抜け漏れ防止観点                                           | AC テーブルに正常系/異常系/統合の観点を固定                                                         |

## 実行手順

### ステップ1: 機能要件（FR）の抽出・定義

specification.md §19 および task-023f-task-9e-skill-fork.md から機能要件を抽出する。

#### FR-1: スキルフォーク実行

| 項目     | 内容                                                                     |
| -------- | ------------------------------------------------------------------------ |
| 入力     | `SkillForkOptions`（sourceSkill, newName, description, コピーフラグ4種） |
| 出力     | `SkillForkResult`（success, newSkillPath, copiedFiles, warnings）        |
| 前提条件 | フォーク元スキルが存在すること                                           |
| 正常系   | 元スキルのディレクトリ構造をコピーし、新スキルとして作成する             |
| 異常系   | フォーク元が存在しない場合、バリデーションエラーを返す                   |

#### FR-2: SKILL.md 名前・説明の自動更新

| 項目     | 内容                                                                     |
| -------- | ------------------------------------------------------------------------ |
| 入力     | コピーされた SKILL.md の内容、SkillForkOptions の newName と description |
| 出力     | Frontmatter が更新された SKILL.md                                        |
| 前提条件 | フォーク元の SKILL.md が正しい Frontmatter 形式であること                |
| 正常系   | name フィールドを newName に、description を指定値に、forked-from を追加 |
| 異常系   | Frontmatter のパースに失敗した場合、warnings に記録して続行              |

#### FR-3: サブディレクトリの選択的コピー

| 項目     | 内容                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| 入力     | SkillForkOptions のコピーフラグ（copyAgents, copyReferences, copyScripts, copyAssets） |
| 出力     | コピーされたファイル一覧（copiedFiles）                                                |
| 前提条件 | 対象サブディレクトリが存在すること（存在しない場合はスキップ）                         |
| 正常系   | フラグが true のサブディレクトリのみコピーする                                         |
| 異常系   | 個別ファイルのコピーに失敗した場合、warnings に記録して続行                            |

#### FR-4: フォークメタデータの記録

| 項目     | 内容                                                                   |
| -------- | ---------------------------------------------------------------------- |
| 入力     | フォーク元スキル名、フォーク日時、元の説明文                           |
| 出力     | `fork-metadata.json` ファイル（SkillForkMetadata 型）                  |
| 前提条件 | 新スキルのディレクトリが作成済みであること                             |
| 正常系   | forkedFrom, forkedAt（ISO 8601）, originalDescription を記録           |
| 異常系   | メタデータ書き込みに失敗した場合、エラーとしてフォーク全体を失敗にする |

#### FR-5: 同名スキルチェック

| 項目     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| 入力     | SkillForkOptions の newName                                             |
| 出力     | エラー（同名スキルが存在する場合）                                      |
| 前提条件 | スキルディレクトリへのアクセス権があること                              |
| 正常系   | 同名スキルが存在しない場合、フォーク処理を続行                          |
| 異常系   | 同名スキルが存在する場合、`スキル "${newName}" は既に存在します` エラー |

#### FR-6: IPC 経由でのフォーク実行

| 項目     | 内容                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| 入力     | Renderer から `skill:fork` チャネル経由で SkillForkOptions を送信                     |
| 出力     | `{ success: true, data: SkillForkResult }` または `{ success: false, error: string }` |
| 前提条件 | Main Process の SkillForker サービスが初期化済みであること                            |
| 正常系   | Preload の safeInvoke 経由で Main Process のハンドラが呼ばれる                        |
| 異常系   | バリデーションエラー時、サニタイズされたエラーメッセージを返す                        |

#### FR-7: allowedTools のカスタマイズ

| 項目     | 内容                                                           |
| -------- | -------------------------------------------------------------- |
| 入力     | SkillForkOptions の modifyAllowedTools（文字列配列、省略可能） |
| 出力     | SKILL.md の allowed-tools フィールドが更新された状態           |
| 前提条件 | modifyAllowedTools が指定されている場合のみ適用                |
| 正常系   | SKILL.md の Frontmatter 内 allowed-tools を指定値で上書き      |
| 異常系   | 不正な値が含まれる場合、warnings に記録                        |

### ステップ2: 非機能要件（NFR）の抽出・定義

#### NFR-1: フォーク処理のパフォーマンス

| 項目   | 基準値                                                     |
| ------ | ---------------------------------------------------------- |
| 指標   | フォーク完了時間                                           |
| 基準   | 100ファイル以下のスキルを3秒以内にフォーク完了             |
| 計測点 | SkillForker.fork() の呼び出しから SkillForkResult 返却まで |

#### NFR-2: エラーハンドリングとロールバック

| 項目     | 基準値                                                                         |
| -------- | ------------------------------------------------------------------------------ |
| 指標     | 部分コピー失敗時の安全性                                                       |
| 基準     | コピー途中でエラーが発生した場合、作成途中のディレクトリを削除して原状回復する |
| 回復方針 | フォーク先ディレクトリ全体を削除（フォーク元は一切変更しない）                 |

#### NFR-3: セキュリティ

| 項目 | 基準値                                                                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------ |
| 指標 | パストラバーサル防止                                                                                         |
| 基準 | sourceSkill, newName にパストラバーサル文字列（`../`, `..\\`）を含む場合、バリデーションエラーとして拒否する |
| 追加 | シンボリックリンク解決後のパスがスキルディレクトリ内に収まることを検証                                       |

#### NFR-4: IPC 契約の整合性

| 項目 | 基準値                                                                                                                      |
| ---- | --------------------------------------------------------------------------------------------------------------------------- |
| 指標 | P42/P44/P45 準拠                                                                                                            |
| 基準 | 全文字列引数に3段バリデーション（型チェック → 空文字列 → トリム空文字列）を適用。引数名はセマンティクスに一致する命名を使用 |

### ステップ3: 受け入れ基準の定義

#### AC-1: 基本フォーク操作

```gherkin
Given スキル "my-skill" が存在する
When ユーザーが sourceSkill="my-skill", newName="my-skill-fork" でフォークを実行する
Then 新スキル "my-skill-fork" のディレクトリが作成される
And SkillForkResult.success が true である
And SkillForkResult.newSkillPath が新スキルのパスを含む
```

#### AC-2: SKILL.md の更新

```gherkin
Given スキル "my-skill" をフォークする
When newName="custom-skill", description="カスタム説明" を指定する
Then 新スキルの SKILL.md の name が "custom-skill" に更新される
And 新スキルの SKILL.md の description が "カスタム説明" に更新される
And 新スキルの SKILL.md に forked-from: "my-skill" が追加される
```

#### AC-3: 選択的コピー

```gherkin
Given スキル "my-skill" に agents/, references/, scripts/, assets/ ディレクトリが存在する
When copyAgents=true, copyReferences=true, copyScripts=false, copyAssets=false でフォークする
Then agents/ と references/ のみコピーされる
And scripts/ と assets/ はコピーされない
And SkillForkResult.copiedFiles に agents/ と references/ 配下のファイルのみ含まれる
```

#### AC-4: フォークメタデータ記録

```gherkin
Given スキル "my-skill" をフォークする
When フォークが正常完了する
Then fork-metadata.json が新スキルディレクトリに作成される
And forkedFrom が "my-skill" である
And forkedAt が ISO 8601 形式の日時文字列である
```

#### AC-5: 同名スキルへのフォーク拒否

```gherkin
Given スキル "existing-skill" が既に存在する
When newName="existing-skill" でフォークを実行する
Then エラーが発生する
And エラーメッセージが "スキル \"existing-skill\" は既に存在します" を含む
And フォーク元スキルは変更されない
```

#### AC-6: パストラバーサル防止

```gherkin
Given ユーザーが sourceSkill="../malicious" でフォークを試みる
When IPC ハンドラがリクエストを受信する
Then バリデーションエラーが返される
And ファイルシステムへのアクセスは発生しない
```

#### AC-7: 部分コピー失敗時のロールバック

```gherkin
Given スキル "my-skill" のフォーク処理中に agents/ のコピーでエラーが発生する
When エラーがキャッチされる
Then 作成途中の新スキルディレクトリが削除される
And SkillForkResult.success が false である
And フォーク元スキルのファイルは一切変更されない
```

### ステップ4: インターフェース仕様の整理

#### 型定義

**配置先**: `packages/shared/src/types/skill-fork.ts`

```typescript
export interface SkillForkOptions {
  sourceSkill: string; // フォーク元のスキル名
  newName: string; // 新スキル名
  description?: string; // 新スキルの説明（省略時は元の説明を維持）
  copyAgents: boolean; // agents/ ディレクトリをコピーするか
  copyReferences: boolean; // references/ ディレクトリをコピーするか
  copyScripts: boolean; // scripts/ ディレクトリをコピーするか
  copyAssets: boolean; // assets/ ディレクトリをコピーするか
  modifyAllowedTools?: string[]; // allowed-tools の上書き値（省略時は元の値を維持）
}

export interface SkillForkResult {
  success: boolean;
  newSkillPath: string;
  copiedFiles: string[];
  warnings?: string[];
}

export interface SkillForkMetadata {
  forkedFrom: string;
  forkedAt: string; // ISO 8601
  originalDescription?: string;
}
```

#### IPC チャネル仕様

| チャネル名   | 方向            | 引数型             | 返却型                       | 用途               |
| ------------ | --------------- | ------------------ | ---------------------------- | ------------------ |
| `skill:fork` | Renderer → Main | `SkillForkOptions` | `IpcResult<SkillForkResult>` | スキルフォーク実行 |

#### 既存機能との棲み分け

| 機能               | チャネル名               | 用途                                  |
| ------------------ | ------------------------ | ------------------------------------- |
| スキルインポート   | `skill:import`           | 外部スキルのインポート（名前指定）    |
| スキル削除         | `skill:remove`           | 既存スキルの削除                      |
| スキル共有         | `skill:importFromSource` | 外部ソースからのインポート（TASK-9F） |
| **スキルフォーク** | **`skill:fork`**         | **既存スキルのコピー+メタデータ記録** |

`skill:fork` は `skill:import` と明確に異なる: インポートは外部からの取得、フォークは既存スキルのローカルコピー+カスタマイズ。

## 統合テスト連携【必須】

接続要件（IPC/データフロー）を要件に明記する:

| 接続要件カテゴリ   | 記載内容                                                                   |
| ------------------ | -------------------------------------------------------------------------- |
| IPC接続            | `skill:fork` チャネル（Renderer → Main）、safeInvoke 経由                  |
| データフロー       | Renderer → Preload（safeInvoke） → Main（SkillForker.fork()） → FileSystem |
| エラーハンドリング | Main Process でのバリデーションエラー → サニタイズ → IpcResult で返却      |
| セキュリティ       | validateIpcSender() による送信元検証、P42準拠3段バリデーション             |

## アーキテクチャ層別要件

| 層                         | 要件                                                                          |
| -------------------------- | ----------------------------------------------------------------------------- |
| フロントエンド（Renderer） | ForkSkillDialog コンポーネント（UI仕様は別タスクで定義済み）                  |
| バックエンド（Main）       | SkillForker サービス（fork, modifySkillMd, copyDirectory, writeForkMetadata） |
| IPC通信                    | `skill:fork` ハンドラ（P42準拠3段バリデーション、validateIpcSender）          |
| Preload                    | skill-api.ts に forkSkill メソッド追加、channels.ts に SKILL_FORK 定数追加    |
| セキュリティ               | パストラバーサル防止、エラーサニタイズ、送信元ウィンドウ検証                  |
| Shared                     | SkillForkOptions / SkillForkResult / SkillForkMetadata 型定義                 |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断 | 仕様参照先                                          |
| ------------------ | -------- | --------------------------------------------------- |
| セキュリティ       | 適用     | `aiworkflow-requirements: security-electron-ipc.md` |
| アーキテクチャ     | 適用     | `aiworkflow-requirements: architecture-overview.md` |
| API設計            | 適用     | `aiworkflow-requirements: api-ipc-agent.md`         |
| エラーハンドリング | 適用     | `aiworkflow-requirements: error-handling.md`        |
| パフォーマンス     | 適用     | NFR-1 フォーク処理時間基準                          |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断 | 仕様参照先                                          |
| -------------------- | -------- | --------------------------------------------------- |
| バックエンド（Main） | 適用     | `aiworkflow-requirements: architecture-overview.md` |
| IPC通信              | 適用     | `aiworkflow-requirements: api-ipc-agent.md`         |
| Preload/セキュリティ | 適用     | `aiworkflow-requirements: security-api-electron.md` |

## 成果物

| 成果物       | パス                                         | 説明             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

## 完了条件

- [ ] FR-1〜FR-7 の全機能要件が抽出されている
- [ ] NFR-1〜NFR-4 の全非機能要件が定義されている
- [ ] AC-1〜AC-7 の受け入れ基準がGherkin形式で記述されている
- [ ] 型定義（SkillForkOptions / SkillForkResult / SkillForkMetadata）が整理されている
- [ ] IPC チャネル仕様（skill:fork）が定義されている
- [ ] 既存機能との棲み分けが明確化されている
- [ ] 接続要件（IPC/データフロー）が明記されている
- [ ] アーキテクチャ層別の要件が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（specification.md §19, technical-decisions.md §20）
2. Task 1: 機能要件（FR-1〜FR-7）の抽出・定義
3. Task 2: 非機能要件（NFR-1〜NFR-4）の抽出・定義
4. Task 3: 受け入れ基準（AC-1〜AC-7）の定義
5. Task 4: インターフェース仕様の整理
6. 統合テスト連携の実施
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-9E-skill-fork --phase 1
```

## 次のPhase

Phase 2: 設計
