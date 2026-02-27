# Phase 1: 受け入れ基準

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| タスクID   | TASK-9F                 |
| Phase      | 1                       |
| 成果物     | 受け入れ基準（Gherkin） |
| 作成日     | 2026-02-27              |
| 機能名     | skill-share             |
| ステータス | 完了                    |

---

## 受け入れ基準一覧

### AC-1: GitHubリポジトリからのインポート成功

**対応FR**: FR-1

```gherkin
Given パブリックリポジトリ "owner/repo" にSKILL.mdが存在する
When ShareTarget { type: "github", repo: "owner/repo" } でインポートを実行する
Then ImportResult.success が true を返す
And ~/.aiworkflow/skills/{skillName}/SKILL.md が存在する
And ImportResult.importedAt がISO 8601形式の文字列である
```

---

### AC-2: Gistからのインポート成功

**対応FR**: FR-2

```gherkin
Given パブリックGist "{gistId}" にSKILL.mdが含まれる
When ShareTarget { type: "gist", gistId: "{gistId}" } でインポートを実行する
Then ImportResult.success が true を返す
And ~/.aiworkflow/skills/{skillName}/SKILL.md が存在する
```

---

### AC-3: URLからのSKILL.mdインポート成功

**対応FR**: FR-3

```gherkin
Given HTTPS URL "{url}" がSKILL.md形式のコンテンツを返す
When ShareTarget { type: "url", url: "{url}" } でインポートを実行する
Then ImportResult.success が true を返す
And インポートされたスキルが一覧に表示される
```

---

### AC-4: ローカルからのインポート成功

**対応FR**: FR-4

```gherkin
Given ローカルパス "/path/to/skill" にSKILL.mdが存在する
When ShareTarget { type: "local", localPath: "/path/to/skill" } でインポートを実行する
Then ImportResult.success が true を返す
And ファイルが ~/.aiworkflow/skills/{skillName}/ にコピーされる
```

---

### AC-5: Gistエクスポートと共有URL取得成功

**対応FR**: FR-5

```gherkin
Given スキル "my-skill" が ~/.aiworkflow/skills/ に存在する
And GitHub PATが設定済みでgistスコープを持つ
When skillName "my-skill" と ShareTarget { type: "gist" } でエクスポートを実行する
Then ExportResult.success が true を返す
And ExportResult.shareUrl がGist URLを含む
And ExportResult.exportedFiles にSKILL.mdが含まれる
```

---

### AC-6: セキュリティ検証動作確認

**対応FR**: FR-4（異常系）
**対応NFR**: NFR-1

```gherkin
Given ShareTarget { type: "local", localPath: "../../etc/passwd" } が指定される
When インポートを実行する
Then パストラバーサル攻撃として検出される
And ImportResult.success が false を返す
And エラーコードが Validation Error 範囲（1000-1999）である
```

---

### AC-7: 3段バリデーション動作確認

**対応NFR**: NFR-1（P42準拠）

```gherkin
Given 空文字列 "" がスキル名として渡される
When インポートを実行する
Then Validation Error が返却される

Given スペースのみ "   " がスキル名として渡される
When インポートを実行する
Then Validation Error が返却される
```

---

## トレーサビリティマトリクス

| AC   | 対応FR/NFR  | 検証内容                                           |
| ---- | ----------- | -------------------------------------------------- |
| AC-1 | FR-1        | GitHubリポジトリからの正常インポート               |
| AC-2 | FR-2        | Gistからの正常インポート                           |
| AC-3 | FR-3        | URLからの正常インポート                            |
| AC-4 | FR-4        | ローカルからの正常インポート                       |
| AC-5 | FR-5        | Gistエクスポートと共有URL取得                      |
| AC-6 | FR-4, NFR-1 | パストラバーサル攻撃の検出と拒否                   |
| AC-7 | NFR-1       | P42準拠3段バリデーション（空文字列・スペースのみ） |
