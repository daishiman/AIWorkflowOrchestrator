# Phase 12 実装ガイド

## Part 1（初学者・中学生向け）

### なぜ必要か

スキルの設定は `SKILL.md` だけでなく、`agents/` や `references/` の複数ファイルに分かれています。  
毎回エディタを開き直して手で管理すると、保存漏れや誤編集が起きやすいため、1つの画面で安全に編集できる仕組みが必要でした。

### 日常の例え

これは「教科ごとに分かれたノートを1つの本棚で管理する」イメージです。  
どのノートを開くかを左の一覧で選び、書き換えたら保存し、もし間違えたら「下書きコピー（バックアップ）」から戻せます。

### この機能でできること

| 機能           | 説明                                 | 例                             |
| -------------- | ------------------------------------ | ------------------------------ |
| ファイルを開く | スキル内のファイルを選んで中身を見る | `SKILL.md` を開く              |
| 編集して保存   | 内容を書き換えて保存する             | 説明文を更新する               |
| 間違いから復元 | 以前の保存内容に戻せる               | バックアップから復元           |
| 安全モード     | 公式スキルは読み取り専用で壊さない   | `~/.claude/skills/` は保存不可 |

## Part 2（開発者向け）

### 1. IPCチャンネル6種と型

`SkillEditor` は Renderer から `window.electronAPI.skill` のみを使用します。

```ts
readFile(skillName: string, relativePath: string): Promise<string>
writeFile(skillName: string, relativePath: string, content: string): Promise<void>
createFile(skillName: string, relativePath: string, content: string): Promise<void>
deleteFile(skillName: string, relativePath: string): Promise<void>
listBackups(skillName: string): Promise<BackupInfo[]>
restoreBackup(skillName: string, backupPath: string): Promise<void>
```

対応チャネル:

- `skill:readFile`
- `skill:writeFile`
- `skill:createFile`
- `skill:deleteFile`
- `skill:listBackups`
- `skill:restoreBackup`

### 2. Preload API使用例（safeInvokeUnwrap経由）

```ts
readFile: (skillName, relativePath) =>
  safeInvokeUnwrap<string>(IPC_CHANNELS.SKILL_READ_FILE, {
    skillName,
    relativePath,
  });
```

Main側は `{ success, data | error }` 形式で返し、Preloadで unwrap して Renderer には直接値を返します。

### 3. SkillFileManager のバックアップ/復元

- `writeFile`: 既存ファイルがあれば `*.backup.<timestamp>` を自動作成してから保存
- `deleteFile`: 削除前に `*.deleted.<timestamp>` を作成
- `listBackups`: `backup/deleted` の接尾辞パターンを走査して一覧化
- `restoreBackup`: バックアップファイル名から元パスを復元して再書き込み

### 4. ディレクトリ制御（読み書き可/不可）

- `~/.aiworkflow/skills/<skillName>`: 読み書き可
- `~/.claude/skills/<skillName>`: 読み取り専用

`SkillFileManager.findSkillDir()` で判定し、readonly の場合は `ReadonlySkillError` を返します。

### 5. エラーハンドリングと境界条件

- ENOENT: `FileNotFoundError` / `SkillNotFoundError` へ変換
- EACCES相当: readonly 判定で事前に拒否
- パストラバーサル: `validatePath()`（`path.resolve` + base配下判定）で防止
- Rendererでも `relativePath.includes("..")` を入力時に拒否
- 既知エラーはメッセージを返却、未知エラーは `Internal error` で秘匿

### 6. SkillEditor UI構造

- 左: ファイルツリー（カテゴリ別: root/agents/references/...）
- 中央: `SkillCodeEditor`（textarea, Tabで2スペース）
- 右: バックアップパネル（表示切替）
- ダイアログ: 未保存変更時の「保存して続行 / 破棄 / キャンセル」

補助ユーティリティ:

- `buildFileTree(skill)`（pure）
- `getLanguage(filename)`（pure）

### 7. 品質結果

- UI新規テスト: 15/15 PASS
- 既存回帰: 164/164 PASS
- セキュリティ回帰: 89/89 PASS
- Coverage: Lines 81.56 / Branches 72.84 / Functions 91.66

## 実装で苦戦した箇所と簡潔解決

| 苦戦箇所                                      | 原因                                                 | 解決                                                                                     |
| --------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Part 1/Part 2の粒度不足                       | 実装事実だけ先に書いて読者層ごとの要件が薄くなった   | Part 1は「理由→例え→機能表」、Part 2は「型/API/エラー/境界条件」を固定テンプレ化         |
| `audit-unassigned-tasks --target-file` の誤読 | baselineも同時出力される仕様を「対象だけ表示」と誤認 | 合否は `currentViolations.total` 固定、`baselineViolations.total` は監視値として分離記録 |
| 未タスク仕様書のメタ情報重複                  | YAMLメタと表メタを別セクション化して二重定義         | `## メタ情報` を1回に統一し、YAML + 表を同一セクションで管理                             |
