# TASK-9E: スキルフォーク・派生機能 -- 要件定義書

## メタ情報

| 項目       | 値                                                                  |
| ---------- | ------------------------------------------------------------------- |
| タスクID   | TASK-9E                                                             |
| Phase      | 1（要件定義）                                                       |
| 機能名     | TASK-9E-skill-fork                                                  |
| 作成日     | 2026-02-28                                                          |
| 依存タスク | TASK-9B（SkillService / SkillFileManager）                          |
| 対象範囲   | バックエンドサービス・IPC契約・型定義（UIコンポーネントは別タスク） |
| 状態       | 作成完了                                                            |

---

## 1. 機能概要

既存スキルをベースに新しいスキルを作成する「フォーク」機能を実装する。
フォーク元のディレクトリ構造をコピーし、SKILL.md の名前・説明を自動更新し、フォーク履歴をメタデータとして記録する。サブディレクトリ（agents, references, scripts, assets）の選択的コピーと allowedTools のカスタマイズに対応する。

| 操作         | 説明                                      |
| ------------ | ----------------------------------------- |
| skill:import | 外部スキルの取り込み（名前指定）          |
| skill:fork   | 既存スキルのローカルコピー+メタデータ記録 |

---

## 2. 機能要件（FR）

### FR-1: スキルフォーク実行

| 項目     | 内容                                                                     |
| -------- | ------------------------------------------------------------------------ |
| 入力     | `SkillForkOptions`（sourceSkill, newName, description, コピーフラグ4種） |
| 出力     | `SkillForkResult`（success, newSkillPath, copiedFiles, warnings）        |
| 前提条件 | フォーク元スキルが存在すること                                           |
| 正常系   | 元スキルのディレクトリ構造をコピーし、新スキルとして作成する             |
| 異常系   | フォーク元が存在しない場合、バリデーションエラーを返す                   |

### FR-2: SKILL.md 名前・説明の自動更新

| 項目     | 内容                                                                     |
| -------- | ------------------------------------------------------------------------ |
| 入力     | コピーされた SKILL.md の内容、SkillForkOptions の newName と description |
| 出力     | Frontmatter が更新された SKILL.md                                        |
| 前提条件 | フォーク元の SKILL.md が正しい Frontmatter 形式であること                |
| 正常系   | name フィールドを newName に、description を指定値に、forked-from を追加 |
| 異常系   | Frontmatter のパースに失敗した場合、warnings に記録して続行              |

### FR-3: サブディレクトリの選択的コピー

| 項目     | 内容                                                                                   |
| -------- | -------------------------------------------------------------------------------------- |
| 入力     | SkillForkOptions のコピーフラグ（copyAgents, copyReferences, copyScripts, copyAssets） |
| 出力     | コピーされたファイル一覧（copiedFiles）                                                |
| 前提条件 | 対象サブディレクトリが存在すること（存在しない場合はスキップ）                         |
| 正常系   | フラグが true のサブディレクトリのみコピーする                                         |
| 異常系   | 個別ファイルのコピーに失敗した場合、warnings に記録して続行                            |

### FR-4: フォークメタデータの記録

| 項目     | 内容                                                                   |
| -------- | ---------------------------------------------------------------------- |
| 入力     | フォーク元スキル名、フォーク日時、元の説明文                           |
| 出力     | `fork-metadata.json` ファイル（SkillForkMetadata 型）                  |
| 前提条件 | 新スキルのディレクトリが作成済みであること                             |
| 正常系   | forkedFrom, forkedAt（ISO 8601）, originalDescription を記録           |
| 異常系   | メタデータ書き込みに失敗した場合、エラーとしてフォーク全体を失敗にする |

### FR-5: 同名スキルチェック

| 項目     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| 入力     | SkillForkOptions の newName                                             |
| 出力     | エラー（同名スキルが存在する場合）                                      |
| 前提条件 | スキルディレクトリへのアクセス権があること                              |
| 正常系   | 同名スキルが存在しない場合、フォーク処理を続行                          |
| 異常系   | 同名スキルが存在する場合、`スキル "${newName}" は既に存在します` エラー |

### FR-6: IPC 経由でのフォーク実行

| 項目     | 内容                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| 入力     | Renderer から `skill:fork` チャネル経由で SkillForkOptions を送信                     |
| 出力     | `{ success: true, data: SkillForkResult }` または `{ success: false, error: string }` |
| 前提条件 | Main Process の SkillForker サービスが初期化済みであること                            |
| 正常系   | Preload の safeInvoke 経由で Main Process のハンドラが呼ばれる                        |
| 異常系   | バリデーションエラー時、サニタイズされたエラーメッセージを返す                        |

### FR-7: allowedTools のカスタマイズ

| 項目     | 内容                                                           |
| -------- | -------------------------------------------------------------- |
| 入力     | SkillForkOptions の modifyAllowedTools（文字列配列、省略可能） |
| 出力     | SKILL.md の allowed-tools フィールドが更新された状態           |
| 前提条件 | modifyAllowedTools が指定されている場合のみ適用                |
| 正常系   | SKILL.md の Frontmatter 内 allowed-tools を指定値で上書き      |
| 異常系   | 不正な値が含まれる場合、warnings に記録                        |

---

## 3. 非機能要件（NFR）

### NFR-1: フォーク処理のパフォーマンス

| 項目   | 基準値                                                     |
| ------ | ---------------------------------------------------------- |
| 指標   | フォーク完了時間                                           |
| 基準   | 100ファイル以下のスキルを3秒以内にフォーク完了             |
| 計測点 | SkillForker.fork() の呼び出しから SkillForkResult 返却まで |

### NFR-2: エラーハンドリングとロールバック

| 項目     | 基準値                                                                         |
| -------- | ------------------------------------------------------------------------------ |
| 指標     | 部分コピー失敗時の安全性                                                       |
| 基準     | コピー途中でエラーが発生した場合、作成途中のディレクトリを削除して原状回復する |
| 回復方針 | フォーク先ディレクトリ全体を削除（フォーク元は一切変更しない）                 |

### NFR-3: セキュリティ（パストラバーサル防止）

| 項目 | 基準値                                                                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------ |
| 指標 | パストラバーサル防止                                                                                         |
| 基準 | sourceSkill, newName にパストラバーサル文字列（`../`, `..\\`）を含む場合、バリデーションエラーとして拒否する |
| 追加 | シンボリックリンク解決後のパスがスキルディレクトリ内に収まることを検証                                       |

### NFR-4: IPC 契約の整合性（P42/P44/P45準拠）

| 項目 | 基準値                                                                                                                      |
| ---- | --------------------------------------------------------------------------------------------------------------------------- |
| 指標 | P42/P44/P45 準拠                                                                                                            |
| 基準 | 全文字列引数に3段バリデーション（型チェック → 空文字列 → トリム空文字列）を適用。引数名はセマンティクスに一致する命名を使用 |
| 検証 | ハンドラの引数形式と Preload 側の呼び出し形式が完全一致していること                                                         |

---

## 4. IPC チャネル定義

### 4.1 チャネル一覧

| チャネル名   | メソッド | 方向            | 説明               |
| ------------ | -------- | --------------- | ------------------ |
| `skill:fork` | `handle` | Renderer → Main | スキルフォーク実行 |

### 4.2 チャネル詳細

#### skill:fork

| 項目             | 内容                                                                                                                                                            |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 引数型           | `SkillForkOptions`                                                                                                                                              |
| 戻り値型         | `IpcResult<SkillForkResult>`                                                                                                                                    |
| 正常系レスポンス | `{ success: true, data: SkillForkResult }`                                                                                                                      |
| 異常系レスポンス | `{ success: false, error: string }`                                                                                                                             |
| バリデーション   | P42準拠3段バリデーション（sourceSkill, newName に対して: `typeof !== "string"` → `=== ""` → `.trim() === ""`）、パストラバーサルチェック、`validateIpcSender()` |
| エラー分類       | バリデーションエラー（1000-1999）: 不正引数、同名スキル存在 / ファイルシステムエラー（4000-4999）: コピー失敗 / 内部エラー（5000-5999）: 予期せぬ例外           |

---

## 5. 型定義

**配置先**: `packages/shared/src/types/skill-fork.ts`

### 5.1 SkillForkOptions

```typescript
/** スキルフォークのオプション */
export interface SkillForkOptions {
  /** フォーク元のスキル名 */
  sourceSkill: string;
  /** 新スキル名 */
  newName: string;
  /** 新スキルの説明（省略時は元の説明を維持） */
  description?: string;
  /** agents/ ディレクトリをコピーするか */
  copyAgents: boolean;
  /** references/ ディレクトリをコピーするか */
  copyReferences: boolean;
  /** scripts/ ディレクトリをコピーするか */
  copyScripts: boolean;
  /** assets/ ディレクトリをコピーするか */
  copyAssets: boolean;
  /** allowed-tools の上書き値（省略時は元の値を維持） */
  modifyAllowedTools?: string[];
}
```

### 5.2 SkillForkResult

```typescript
/** スキルフォークの結果 */
export interface SkillForkResult {
  /** フォークが成功したかどうか */
  success: boolean;
  /** 新スキルのパス */
  newSkillPath: string;
  /** コピーされたファイルのパス一覧 */
  copiedFiles: string[];
  /** 警告メッセージ一覧（Frontmatterパース失敗、個別ファイルコピー失敗等） */
  warnings?: string[];
}
```

### 5.3 SkillForkMetadata

```typescript
/** フォークメタデータ（fork-metadata.json に記録） */
export interface SkillForkMetadata {
  /** フォーク元のスキル名 */
  forkedFrom: string;
  /** フォーク日時（ISO 8601） */
  forkedAt: string;
  /** フォーク元の説明文 */
  originalDescription?: string;
}
```

---

## 6. 接続要件（統合テスト連携）

| 接続要件カテゴリ   | 記載内容                                                                   |
| ------------------ | -------------------------------------------------------------------------- |
| IPC接続            | `skill:fork` チャネル（Renderer → Main）、safeInvoke 経由                  |
| データフロー       | Renderer → Preload（safeInvoke） → Main（SkillForker.fork()） → FileSystem |
| エラーハンドリング | Main Process でのバリデーションエラー → サニタイズ → IpcResult で返却      |
| セキュリティ       | validateIpcSender() による送信元検証、P42準拠3段バリデーション             |

---

## 7. アーキテクチャ層別要件

| 層                         | 要件                                                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| フロントエンド（Renderer） | ForkSkillDialog コンポーネント（UIは別タスクのスコープ。本タスクではIPC呼び出しのみ関与）                        |
| バックエンド（Main）       | SkillForker サービス（fork, modifySkillMd, copyDirectory, writeForkMetadata）                                    |
| IPC通信                    | `skill:fork` ハンドラ（P42準拠3段バリデーション、validateIpcSender、パストラバーサルチェック）                   |
| Preload                    | skill-api.ts に forkSkill メソッド追加、channels.ts に SKILL_FORK 定数追加                                       |
| セキュリティ               | パストラバーサル防止、エラーサニタイズ（内部情報非漏洩）、送信元ウィンドウ検証                                   |
| Shared                     | SkillForkOptions / SkillForkResult / SkillForkMetadata 型定義を `packages/shared/src/types/skill-fork.ts` に配置 |

---

## 8. データフロー

```
Renderer
  | Preload (skill-api.ts#forkSkill)
  v
IPC (skill:fork)
  | validateIpcSender() + P42バリデーション + パストラバーサルチェック
  v
Main Process
  |
  +-- SkillForker
  |     +-- fork(options: SkillForkOptions): Promise<SkillForkResult>
  |     |     +-- 1. validateInputs()       ... 入力バリデーション
  |     |     +-- 2. checkDuplicateName()    ... 同名スキルチェック（FR-5）
  |     |     +-- 3. copySkillDirectory()    ... ディレクトリコピー（FR-1, FR-3）
  |     |     +-- 4. modifySkillMd()         ... SKILL.md更新（FR-2, FR-7）
  |     |     +-- 5. writeForkMetadata()     ... fork-metadata.json作成（FR-4）
  |     |     +-- 6. rollbackOnError()       ... エラー時ロールバック（NFR-2）
  |     |
  |     +-- modifySkillMd()
  |     +-- copyDirectory()
  |     +-- writeForkMetadata()
  |
  +-- SkillFileManager (既存)
        +-- スキルディレクトリパスの解決
        +-- スキル存在確認
```

---

## 9. 多角的チェック観点

| 観点               | 確認事項                                                          |
| ------------------ | ----------------------------------------------------------------- |
| セキュリティ       | パストラバーサル防止、IPC送信元検証、エラーサニタイズ             |
| アーキテクチャ     | Main/IPC/Preload の責務境界遵守、Shared 型定義の配置              |
| API設計            | IpcResult<SkillForkResult> レスポンス形式、P42準拠バリデーション  |
| エラーハンドリング | ロールバック機構、warnings による部分失敗の伝達、エラー分類コード |
| パフォーマンス     | 100ファイル以下のスキルを3秒以内にフォーク完了                    |
| テスタビリティ     | DI設計によるモック可能性、ファイルシステム操作の抽象化            |

---

## 10. エラーコード対応表

| エラーコード | 名称             | 発生条件                                     |
| ------------ | ---------------- | -------------------------------------------- |
| ERR_1001     | INVALID_INPUT    | 不正な引数形式（型チェック/空文字列/トリム） |
| ERR_1002     | PATH_TRAVERSAL   | パストラバーサル文字列の検出                 |
| ERR_2001     | DUPLICATE_SKILL  | 同名スキルが既に存在する                     |
| ERR_2002     | SOURCE_NOT_FOUND | フォーク元スキルが存在しない                 |
| ERR_4001     | FS_COPY_ERROR    | ファイルコピー中のエラー                     |
| ERR_4002     | FS_WRITE_ERROR   | メタデータ書き込みエラー                     |
| ERR_5001     | INTERNAL_ERROR   | 予期せぬ内部エラー                           |

---

## 11. 既存機能との棲み分け

| 機能               | チャネル名               | 用途                                  |
| ------------------ | ------------------------ | ------------------------------------- |
| スキルインポート   | `skill:import`           | 外部スキルのインポート（名前指定）    |
| スキル削除         | `skill:remove`           | 既存スキルの削除                      |
| スキル共有         | `skill:importFromSource` | 外部ソースからのインポート（TASK-9F） |
| **スキルフォーク** | **`skill:fork`**         | **既存スキルのコピー+メタデータ記録** |

`skill:fork` は `skill:import` と明確に異なる: インポートは外部からの取得、フォークは既存スキルのローカルコピー+カスタマイズ。フォークではフォーク元の情報（fork-metadata.json）が記録され、SKILL.md の forked-from フィールドによりフォーク関係が追跡可能となる。

---

## 完了条件

- [x] FR-1〜FR-7 の全機能要件が定義されている
- [x] NFR-1〜NFR-4 の全非機能要件が定義されている
- [x] IPC チャネル仕様（skill:fork）の引数型・戻り値型・バリデーションが定義されている
- [x] 型定義（SkillForkOptions / SkillForkResult / SkillForkMetadata）が定義されている
- [x] 接続要件（IPC/データフロー）が明記されている
- [x] アーキテクチャ層別の要件が整理されている
- [x] 既存機能との棲み分けが明確化されている
- [x] エラーコード対応表が定義されている
- [x] 多角的チェック観点が定義されている
- [x] データフローが定義されている
