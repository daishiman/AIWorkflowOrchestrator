# Phase 1 成果物: 要件定義書

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 1                             |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-23                    |

---

## 1. execute() 現行出力形式

### 1.1 RuntimeSkillCreatorFacade.execute()

**ファイル**: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

```typescript
async execute(
  planResult: SkillPlanResult,
  authMode: AuthMode,
  apiKey: string | null,
): Promise<RuntimeSkillCreatorExecuteResult>
```

**戻り値型** (`packages/shared/src/types/skillCreator.ts` L341-346):

```typescript
export interface RuntimeSkillCreatorExecuteResult {
  executeId: string; // UUID ベース
  skillName: string; // 生成されたスキル名
  success: boolean; // 成功/失敗
  error?: string; // エラーメッセージ（コードなし、文字列のみ）
}
```

### 1.2 内部フロー

```
RuntimeSkillCreatorFacade.execute()
  → SkillExecutor.execute()
    → LLM 呼び出し（スキルコンテンツ生成）
    → Promise<SkillExecutionResponse>
  → 結果マッピング → RuntimeSkillCreatorExecuteResult
```

### 1.3 コンテンツ取得ポイント

- **現状**: execute() は成功/失敗のみを返し、LLM が生成したコンテンツ（SKILL.md / agents / scripts / references）は戻り値に含まれない
- **改修ポイント**: SkillExecutor.execute() の内部で LLM が生成したコンテンツをキャプチャし、SkillGeneratedContent として SkillFileWriter に渡す処理を追加する
- **ストリーミング**: RuntimeSkillCreatorFacade にはストリーミング処理がない。非同期完了後の一括書き込みで十分

### 1.5 SkillExecutor → SkillGeneratedContent マッピング要件

SkillExecutor.execute() は `SkillExecutionResponse` を返す。このレスポンスから `SkillGeneratedContent` へのマッピングは Phase 5 で実装する。

**マッピング方針**:

- SkillExecutor の内部処理で LLM が生成したテキストを解析し、SKILL.md / agents / scripts / references に分類する
- マッピングの具体的なフィールド対応は、SkillExecutor の実コードを調査したうえで Phase 5 の実装者が確定する
- SkillExecutor が構造化データを返さない場合は、LLM 出力のパース処理を追加する必要がある

**設計上の制約**:

- execute() のストリーミング処理がないため、非同期完了後の一括マッピングで十分
- マッピング失敗時は `RuntimeSkillCreatorExecuteResult.error` にエラーメッセージを設定して返す

### 1.4 関連 IPC チャンネル

| チャンネル名                  | 定数名                        | 用途       |
| ----------------------------- | ----------------------------- | ---------- |
| `skill-creator:plan`          | `SKILL_CREATOR_PLAN`          | スキル計画 |
| `skill-creator:execute-plan`  | `SKILL_CREATOR_EXECUTE_PLAN`  | スキル実行 |
| `skill-creator:improve-skill` | `SKILL_CREATOR_IMPROVE_SKILL` | スキル改善 |

---

## 2. 永続化先ディレクトリ構造

### 2.1 既存スキルの構造パターン

**ベースパス**: `.claude/skills/`

**既存スキル一覧**:

- `aiworkflow-requirements/` - メイン仕様スキル
- `task-specification-creator/` - タスク仕様生成
- `skill-creator/` - スキル共創エンジン
- `github-issue-manager/` - Issue 管理
- `claude-agent-sdk/` - SDK 統合
- `ipc-preload-spec-sync-guardian/` - IPC 契約同期
- `skill-fixture-runner/` - テスト

**標準ディレクトリ構造** (aiworkflow-requirements 例):

```
.claude/skills/{skillName}/
├── SKILL.md          (必須 - スキル定義)
├── LOGS.md           (任意 - 変更ログ)
├── EVALS.json        (任意 - 評価基準)
├── agents/           (任意 - エージェント指示書)
│   ├── agent-name.md
│   └── ...
├── scripts/          (任意 - 自動化スクリプト)
│   ├── script-name.js
│   └── ...
├── references/       (任意 - 参照ドキュメント)
│   ├── doc-name.md
│   └── ...
├── indexes/          (任意 - 自動生成インデックス)
├── schemas/          (任意 - JSON スキーマ)
├── templates/        (任意 - テンプレート)
└── assets/           (任意 - アセットファイル)
```

### 2.2 新規スキルの最小必須構造

```
.claude/skills/{skillName}/
├── SKILL.md          (必須)
├── agents/           (任意 - 空でも可)
├── scripts/          (任意 - 空でも可)
└── references/       (任意 - 空でも可)
```

- SKILL.md は必須。agents / scripts / references は LLM が生成した場合のみ作成する
- 空配列（0件）の場合はサブディレクトリを作成しない

---

## 3. SkillFileWriter 要件

### 3.1 メソッドシグネチャ

```typescript
class SkillFileWriter {
  constructor(basePath: string);

  persist(
    skillName: string,
    content: SkillGeneratedContent,
    options?: { overwrite?: boolean },
  ): Promise<{ skillPath: string; files: string[] }>;
}
```

### 3.2 既存 SkillFileManager との責務分離

| 操作         | SkillFileManager（既存） | SkillFileWriter（新規） |
| ------------ | ------------------------ | ----------------------- |
| ファイル読取 | getFileTree() 等         | -                       |
| インポート   | importSkill()            | -                       |
| 削除         | removeSkill()            | -                       |
| 新規書き込み | -                        | persist()               |

- SkillFileManager: 既存スキルファイルの CRUD（Read/Import/Delete）
- SkillFileWriter: LLM 生成コンテンツの新規永続化に特化

### 3.3 既存ファイル上書き防止

- 同名スキルが既に存在する場合（`.claude/skills/{skillName}/` ディレクトリが存在する場合）
  - デフォルト: `{ code: "SKILL_ALREADY_EXISTS", message: "Skill '{skillName}' already exists" }` エラーを返す
  - `overwrite: true` 指定時: 既存ファイルを上書きする

### 3.4 アトミック書き込み

- 全ファイルの書き込みを1つのトランザクションとして扱う
- 途中で失敗した場合、書き込み済みファイルをロールバック（削除）する
- ロールバック方式: 書き込み済みファイルリストを管理し、失敗時に逆順で `fs.unlink()` を実行する
- ロールバック自体が失敗した場合はエラーログを出力し、可能な限りクリーンアップを試みる

### 3.5 パストラバーサル防止

P42 準拠3段バリデーション + パス検証:

1. **型チェック**: `typeof skillName !== "string"` → 拒否
2. **空文字列チェック**: `skillName === ""` → 拒否
3. **トリム空文字列チェック**: `skillName.trim() === ""` → 拒否
4. **危険パターン拒否**: `../` `./` `/` を含む場合 → 拒否
5. **サブディレクトリ拒否**: `skillName.includes("/")` → 拒否
6. **path.resolve 検証**: `path.resolve(basePath, skillName)` が basePath のプレフィックスであることを確認

---

## 4. SkillGeneratedContent 型要件

### 4.1 型定義

```typescript
interface SkillGeneratedContent {
  skillMd: string; // SKILL.md の全内容
  agents: Array<{ name: string; content: string }>; // agents/{name}.md
  scripts: Array<{ name: string; content: string }>; // scripts/{name}
  references: Array<{ name: string; content: string }>; // references/{name}.md
}
```

### 4.2 位置づけ

- **RuntimeSkillCreatorExecuteResult**: execute() の最終戻り値（成功/失敗のみ）
- **SkillGeneratedContent**: execute() 内部で LLM が生成したコンテンツを保持する中間データ型
- 配置先: `packages/shared/src/types/skillCreator.ts`（P32 対策: shared に配置して両方から参照）

### 4.3 バリデーション要件

- `skillMd`: 空文字列でないこと
- `agents[].name`: 空文字列・スペースのみでないこと、パストラバーサル文字を含まないこと
- `scripts[].name`: 同上
- `references[].name`: 同上
- 各配列は空（0件）でも許容する

---

## 5. AC-2 対応

| AC-2 要件                            | 対応方針                                                              |
| ------------------------------------ | --------------------------------------------------------------------- |
| .claude/skills/ 配下にファイル永続化 | SkillFileWriter.persist() が `.claude/skills/{skillName}/` に書き込む |
| SKILL.md が生成されること            | SkillGeneratedContent.skillMd を SKILL.md として書き込む              |
| サブディレクトリが生成されること     | agents/ / scripts/ / references/ を内容がある場合のみ作成             |
| セキュリティ                         | パストラバーサル防止 + 上書きガード                                   |
