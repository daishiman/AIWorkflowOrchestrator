# TASK-9E: スキルフォーク・派生機能 -- 受け入れ基準書

## メタ情報

| 項目     | 値                       |
| -------- | ------------------------ |
| タスクID | TASK-9E                  |
| Phase    | 1（要件定義）            |
| 機能名   | TASK-9E-skill-fork       |
| 作成日   | 2026-02-28               |
| 対応要件 | FR-1〜FR-7、NFR-1〜NFR-4 |
| 状態     | 作成完了                 |

---

## 1. 基本フォーク操作

### AC-1: 基本フォーク操作（正常系）

| 項目     | 内容 |
| -------- | ---- |
| 対応要件 | FR-1 |

```gherkin
Given スキル "my-skill" が存在する
When ユーザーが sourceSkill="my-skill", newName="my-skill-fork" でフォークを実行する
Then 新スキル "my-skill-fork" のディレクトリが作成される
And SkillForkResult.success が true である
And SkillForkResult.newSkillPath が新スキルのパスを含む
```

- [ ] `SkillForkResult.success` が `true`
- [ ] `SkillForkResult.newSkillPath` がスキルディレクトリ配下の `my-skill-fork` パスである
- [ ] `SkillForkResult.copiedFiles` に SKILL.md を含む
- [ ] 新スキルディレクトリ内に SKILL.md が存在する

### AC-1a: フォーク元が存在しない場合のエラー

| 項目     | 内容 |
| -------- | ---- |
| 対応要件 | FR-1 |

```gherkin
Given スキル "non-existent-skill" が存在しない
When ユーザーが sourceSkill="non-existent-skill", newName="new-fork" でフォークを実行する
Then エラーが発生する
And エラーコードが SOURCE_NOT_FOUND（ERR_2002）である
And ファイルシステムに新スキルディレクトリは作成されない
```

- [ ] `IpcResult.success` が `false`
- [ ] エラーメッセージにフォーク元スキル名が含まれる
- [ ] 新スキルディレクトリが存在しない

---

## 2. SKILL.md 更新

### AC-2: SKILL.md の名前・説明・forked-from 更新

| 項目     | 内容 |
| -------- | ---- |
| 対応要件 | FR-2 |

```gherkin
Given スキル "my-skill" をフォークする
When newName="custom-skill", description="カスタム説明" を指定する
Then 新スキルの SKILL.md の name が "custom-skill" に更新される
And 新スキルの SKILL.md の description が "カスタム説明" に更新される
And 新スキルの SKILL.md に forked-from: "my-skill" が追加される
```

- [ ] SKILL.md の Frontmatter 内 `name` が `"custom-skill"` である
- [ ] SKILL.md の Frontmatter 内 `description` が `"カスタム説明"` である
- [ ] SKILL.md の Frontmatter 内 `forked-from` が `"my-skill"` である

### AC-2a: description 省略時の動作

| 項目     | 内容 |
| -------- | ---- |
| 対応要件 | FR-2 |

```gherkin
Given スキル "my-skill" の SKILL.md に description: "元の説明" がある
When description を省略して newName="forked-skill" でフォークする
Then 新スキルの SKILL.md の description が "元の説明" のまま維持される
And name は "forked-skill" に更新される
```

- [ ] `description` が元スキルの値を維持している
- [ ] `name` は新しい値に更新されている

### AC-2b: Frontmatter パース失敗時の警告

| 項目     | 内容 |
| -------- | ---- |
| 対応要件 | FR-2 |

```gherkin
Given スキル "broken-skill" の SKILL.md の Frontmatter が不正形式である
When フォークを実行する
Then SkillForkResult.success が true である（フォーク自体は成功）
And SkillForkResult.warnings に Frontmatter パース失敗の警告メッセージが含まれる
And SKILL.md はコピーされるが Frontmatter の更新はスキップされる
```

- [ ] `SkillForkResult.success` が `true`
- [ ] `SkillForkResult.warnings` が空でない
- [ ] SKILL.md ファイルは存在する

---

## 3. 選択的コピー

### AC-3: サブディレクトリの選択的コピー

| 項目     | 内容 |
| -------- | ---- |
| 対応要件 | FR-3 |

```gherkin
Given スキル "my-skill" に agents/, references/, scripts/, assets/ ディレクトリが存在する
When copyAgents=true, copyReferences=true, copyScripts=false, copyAssets=false でフォークする
Then agents/ と references/ のみコピーされる
And scripts/ と assets/ はコピーされない
And SkillForkResult.copiedFiles に agents/ と references/ 配下のファイルのみ含まれる
```

- [ ] 新スキルに `agents/` ディレクトリが存在する
- [ ] 新スキルに `references/` ディレクトリが存在する
- [ ] 新スキルに `scripts/` ディレクトリが存在しない
- [ ] 新スキルに `assets/` ディレクトリが存在しない
- [ ] `SkillForkResult.copiedFiles` に `scripts/` および `assets/` 配下のファイルが含まれない

### AC-3a: 全フラグ true のコピー

| 項目     | 内容 |
| -------- | ---- |
| 対応要件 | FR-3 |

```gherkin
Given スキル "my-skill" に agents/, references/, scripts/, assets/ ディレクトリが存在する
When copyAgents=true, copyReferences=true, copyScripts=true, copyAssets=true でフォークする
Then 4つ全てのサブディレクトリがコピーされる
And SkillForkResult.copiedFiles に全ファイルが含まれる
```

- [ ] 4つ全てのサブディレクトリが新スキルに存在する

### AC-3b: 全フラグ false のコピー

| 項目     | 内容 |
| -------- | ---- |
| 対応要件 | FR-3 |

```gherkin
Given スキル "my-skill" に agents/, references/, scripts/, assets/ ディレクトリが存在する
When copyAgents=false, copyReferences=false, copyScripts=false, copyAssets=false でフォークする
Then SKILL.md のみコピーされる
And サブディレクトリは一切コピーされない
```

- [ ] SKILL.md が新スキルに存在する
- [ ] 4つ全てのサブディレクトリが新スキルに存在しない

### AC-3c: 存在しないサブディレクトリのスキップ

| 項目     | 内容 |
| -------- | ---- |
| 対応要件 | FR-3 |

```gherkin
Given スキル "minimal-skill" に agents/ のみ存在し、references/ は存在しない
When copyAgents=true, copyReferences=true でフォークする
Then agents/ のみコピーされる
And references/ のコピーはスキップされる（エラーにならない）
And SkillForkResult.success が true である
```

- [ ] `SkillForkResult.success` が `true`
- [ ] `SkillForkResult.warnings` にエラーが含まれない（スキップは正常動作）

---

## 4. フォークメタデータ

### AC-4: fork-metadata.json の生成

| 項目     | 内容 |
| -------- | ---- |
| 対応要件 | FR-4 |

```gherkin
Given スキル "my-skill" をフォークする
When フォークが正常完了する
Then fork-metadata.json が新スキルディレクトリに作成される
And forkedFrom が "my-skill" である
And forkedAt が ISO 8601 形式の日時文字列である
```

- [ ] `fork-metadata.json` ファイルが新スキルディレクトリに存在する
- [ ] `forkedFrom` が `"my-skill"` である
- [ ] `forkedAt` が ISO 8601 形式（例: `"2026-02-28T12:00:00.000Z"`）である
- [ ] JSON として正しくパース可能である

### AC-4a: originalDescription の記録

| 項目     | 内容 |
| -------- | ---- |
| 対応要件 | FR-4 |

```gherkin
Given スキル "my-skill" の SKILL.md に description: "元の説明" がある
When フォークが正常完了する
Then fork-metadata.json の originalDescription が "元の説明" である
```

- [ ] `originalDescription` がフォーク元の description 値と一致する

### AC-4b: メタデータ書き込み失敗時のフォーク失敗

| 項目     | 内容 |
| -------- | ---- |
| 対応要件 | FR-4 |

```gherkin
Given fork-metadata.json の書き込みがエラーになる状況
When フォークを実行する
Then SkillForkResult.success が false である
And 作成途中のディレクトリがロールバック（削除）される
```

- [ ] `SkillForkResult.success` が `false`
- [ ] 新スキルディレクトリが存在しない（ロールバック済み）

---

## 5. 同名スキル拒否

### AC-5: 同名スキルへのフォーク拒否

| 項目     | 内容 |
| -------- | ---- |
| 対応要件 | FR-5 |

```gherkin
Given スキル "existing-skill" が既に存在する
When newName="existing-skill" でフォークを実行する
Then エラーが発生する
And エラーメッセージが "スキル \"existing-skill\" は既に存在します" を含む
And フォーク元スキルは変更されない
```

- [ ] `IpcResult.success` が `false`
- [ ] エラーメッセージに `"existing-skill"` が含まれる
- [ ] エラーコードが DUPLICATE_SKILL（ERR_2001）である
- [ ] フォーク元スキルのファイルが一切変更されていない
- [ ] 新スキルディレクトリが作成されていない

---

## 6. パストラバーサル防止

### AC-6: sourceSkill のパストラバーサル防止

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | NFR-3 |

```gherkin
Given ユーザーが sourceSkill="../malicious" でフォークを試みる
When IPC ハンドラがリクエストを受信する
Then バリデーションエラーが返される
And ファイルシステムへのアクセスは発生しない
```

- [ ] `IpcResult.success` が `false`
- [ ] エラーコードが PATH_TRAVERSAL（ERR_1002）である
- [ ] ファイルシステムの読み取り/書き込みが発生しない

### AC-6a: newName のパストラバーサル防止

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | NFR-3 |

```gherkin
Given ユーザーが newName="../../etc/evil" でフォークを試みる
When IPC ハンドラがリクエストを受信する
Then バリデーションエラーが返される
And ファイルシステムへの書き込みは発生しない
```

- [ ] `IpcResult.success` が `false`
- [ ] エラーコードが PATH_TRAVERSAL（ERR_1002）である

### AC-6b: バックスラッシュのパストラバーサル防止

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | NFR-3 |

```gherkin
Given ユーザーが sourceSkill="..\\malicious" でフォークを試みる
When IPC ハンドラがリクエストを受信する
Then バリデーションエラーが返される
```

- [ ] `IpcResult.success` が `false`
- [ ] エラーコードが PATH_TRAVERSAL（ERR_1002）である

---

## 7. ロールバック

### AC-7: 部分コピー失敗時のロールバック

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | NFR-2 |

```gherkin
Given スキル "my-skill" のフォーク処理中に agents/ のコピーでエラーが発生する
When エラーがキャッチされる
Then 作成途中の新スキルディレクトリが削除される
And SkillForkResult.success が false である
And フォーク元スキルのファイルは一切変更されない
```

- [ ] `SkillForkResult.success` が `false`
- [ ] 新スキルディレクトリが存在しない（完全に削除されている）
- [ ] フォーク元スキルの全ファイルが変更前と同一である

### AC-7a: ロールバック時のエラーメッセージ

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | NFR-2 |

```gherkin
Given フォーク処理中にコピーエラーが発生する
When ロールバック（ディレクトリ削除）が実行される
Then IpcResult.error にコピー失敗の原因が含まれる
And 内部スタックトレースは含まれない（エラーサニタイズ済み）
```

- [ ] エラーメッセージが人間に読みやすい形式である
- [ ] 内部パスやスタックトレースが含まれない

---

## 8. IPC バリデーション

### AC-8: P42準拠3段バリデーション（空文字列）

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | NFR-4 |

```gherkin
Given skill:fork ハンドラが登録されている
When sourceSkill="" （空文字列）でフォークを試みる
Then バリデーションエラー（ERR_1001）が返される
And フォーク処理は実行されない
```

- [ ] `IpcResult.success` が `false`
- [ ] エラーコードが INVALID_INPUT（ERR_1001）である

### AC-8a: P42準拠3段バリデーション（スペースのみ）

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | NFR-4 |

```gherkin
Given skill:fork ハンドラが登録されている
When newName="   " （スペースのみ）でフォークを試みる
Then バリデーションエラー（ERR_1001）が返される（.trim() === "" チェックで検出）
And フォーク処理は実行されない
```

- [ ] `IpcResult.success` が `false`
- [ ] エラーコードが INVALID_INPUT（ERR_1001）である

### AC-8b: P42準拠3段バリデーション（非文字列型）

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | NFR-4 |

```gherkin
Given skill:fork ハンドラが登録されている
When sourceSkill に数値 123 または null が送信される
Then バリデーションエラー（ERR_1001）が返される（typeof !== "string" チェックで検出）
```

- [ ] `IpcResult.success` が `false`
- [ ] エラーコードが INVALID_INPUT（ERR_1001）である

### AC-8c: IPC 送信元検証

| 項目     | 内容  |
| -------- | ----- |
| 対応要件 | NFR-4 |

```gherkin
Given skill:fork チャンネルが登録されている
When 不正な送信元（mainWindow 以外）からリクエストが送信される
Then validateIpcSender() によりリクエストが拒否される
```

- [ ] `validateIpcSender()` が呼ばれている
- [ ] 不正な送信元からのリクエストが拒否される

---

## 9. allowedTools カスタマイズ

### AC-9: allowedTools の上書き

| 項目     | 内容 |
| -------- | ---- |
| 対応要件 | FR-7 |

```gherkin
Given スキル "my-skill" の SKILL.md に allowed-tools: ["Read", "Write"] がある
When modifyAllowedTools=["Read", "Grep", "Glob"] を指定してフォークする
Then 新スキルの SKILL.md の allowed-tools が ["Read", "Grep", "Glob"] に更新される
```

- [ ] SKILL.md の Frontmatter 内 `allowed-tools` が指定値に更新されている
- [ ] フォーク元の SKILL.md は変更されていない

### AC-9a: modifyAllowedTools 省略時の動作

| 項目     | 内容 |
| -------- | ---- |
| 対応要件 | FR-7 |

```gherkin
Given スキル "my-skill" の SKILL.md に allowed-tools: ["Read", "Write"] がある
When modifyAllowedTools を省略してフォークする
Then 新スキルの SKILL.md の allowed-tools が ["Read", "Write"] のまま維持される
```

- [ ] `allowed-tools` が元スキルの値を維持している

---

## 完了条件

- [x] FR-1〜FR-7 に対応する受け入れ基準が定義されている
- [x] NFR-1〜NFR-4 に対応する受け入れ基準が定義されている
- [x] 各受け入れ基準が Gherkin 形式（Given/When/Then）で記述されている
- [x] 正常系と異常系の両方がカバーされている
- [x] エッジケースが考慮されている（空文字列、スペースのみ、非文字列型、パストラバーサル）
- [x] 検証条件がチェックリスト形式で記述されている
- [x] エラーコードが明示されている
