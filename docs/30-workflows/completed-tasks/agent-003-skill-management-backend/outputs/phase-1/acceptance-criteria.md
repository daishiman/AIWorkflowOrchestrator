# 受け入れ基準定義書

## メタ情報

| 項目   | 内容                        |
| ------ | --------------------------- |
| Phase  | 1                           |
| タスク | タスク3: 受け入れ基準の定義 |
| 作成日 | 2026-01-11                  |
| 形式   | Given-When-Then             |

---

## Feature: スキル管理バックエンド

### Scenario 1: 利用可能なスキル一覧を取得できる

```gherkin
Scenario: 利用可能なスキル一覧を取得できる
  Given アプリケーションが起動している
  And .claude/skills/ ディレクトリに10個のスキルが存在する
  When Rendererがagent:scan-available-skillsを呼び出す
  Then 10個のスキルメタデータが返される
  And 各スキルにはid, name, description, path, triggersが含まれる
  And 応答時間は3秒以内である
```

### Scenario 2: スキルをインポートできる

```gherkin
Scenario: スキルをインポートできる
  Given 利用可能なスキル一覧が取得済みである
  And スキルIDの配列を指定する
  When Rendererがagent:import-skills { skillIds }を呼び出す
  Then 指定したスキルがインポートされる
  And インポート設定がelectron-storeに永続化される
  And 成功したスキルの数が返される
```

### Scenario 3: インポート済みスキル一覧を取得できる

```gherkin
Scenario: インポート済みスキル一覧を取得できる
  Given 3つのスキルがインポート済みである
  When Rendererがagent:get-imported-skillsを呼び出す
  Then インポート済みの3つのスキルのみ返される
  And 各スキルの完全な情報が含まれる
```

### Scenario 4: インポート済みスキルを削除できる

```gherkin
Scenario: インポート済みスキルを削除できる
  Given スキルがインポート済みである
  When Rendererがagent:remove-skill { skillId }を呼び出す
  Then スキルがインポート一覧から削除される
  And 設定が永続化される
  And 削除成功のレスポンスが返される
```

### Scenario 5: スキル詳細を取得できる

```gherkin
Scenario: スキル詳細を取得できる
  Given スキルがインポート済みである
  When Rendererがagent:get-skill-detail { skillId }を呼び出す
  Then 指定したスキルの詳細情報が返される
  And anchorsの配列が含まれる
  And triggersの配列が含まれる
```

### Scenario 6: SKILL.mdがないディレクトリは除外される

```gherkin
Scenario: SKILL.mdがないディレクトリは除外される
  Given .claude/skills/に無効なディレクトリがある（SKILL.mdなし）
  When 利用可能スキル一覧を取得する
  Then 無効なディレクトリは結果に含まれない
  And エラーは発生しない
```

### Scenario 7: アプリ再起動後もインポート設定が維持される

```gherkin
Scenario: アプリ再起動後もインポート設定が維持される
  Given 5つのスキルがインポート済みである
  When アプリケーションを再起動する
  And インポート済みスキル一覧を取得する
  Then 同じ5つのスキルが返される
```

### Scenario 8: スキルパスを設定できる

```gherkin
Scenario: スキルパスを設定できる
  Given 設定画面でスキルパスを変更する
  When 利用可能スキル一覧を取得する
  Then 指定されたパスからスキルが読み込まれる
```

### Scenario 9: パストラバーサル攻撃を防止する

```gherkin
Scenario: パストラバーサル攻撃を防止する
  Given 悪意のあるパス（../../../etc/passwd）が指定された
  When スキル詳細を取得しようとする
  Then エラーが返される
  And ファイルアクセスは行われない
  And エラーコードは'VALIDATION_ERROR'である
```

### Scenario 10: IPC sender検証でDevToolsからの呼び出しを拒否する

```gherkin
Scenario: IPC sender検証でDevToolsからの呼び出しを拒否する
  Given DevToolsコンソールからIPC呼び出しを試行する
  When agent:scan-available-skillsを呼び出す
  Then 認証エラーが返される
  And エラーコードは'AUTH_ERROR'である
```

---

## 検証マトリクス

| シナリオ                | 自動テスト | 手動テスト | 優先度 |
| ----------------------- | ---------- | ---------- | ------ |
| 1. スキル一覧取得       | ✓          | ✓          | 高     |
| 2. スキルインポート     | ✓          | ✓          | 高     |
| 3. インポート済み取得   | ✓          | ✓          | 高     |
| 4. スキル削除           | ✓          | ✓          | 高     |
| 5. スキル詳細取得       | ✓          | ✓          | 高     |
| 6. 無効ディレクトリ除外 | ✓          | -          | 中     |
| 7. 永続化               | ✓          | ✓          | 高     |
| 8. パス設定             | ✓          | ✓          | 中     |
| 9. パストラバーサル防止 | ✓          | -          | 高     |
| 10. IPC sender検証      | ✓          | ✓          | 高     |

---

## 備考

- シナリオ9-10はセキュリティ要件のため、必ずテストでカバーする
- 手動テストはPhase 11で実施する
- パフォーマンス要件（3秒以内）はPhase 9で検証する
