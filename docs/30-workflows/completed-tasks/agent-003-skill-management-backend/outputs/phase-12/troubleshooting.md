# スキル管理 トラブルシューティングガイド

## よくある問題

### スキルが検出されない

**症状**: スキャンしてもスキルが表示されない

**原因**:

1. SKILL.md ファイルがない
2. パスが間違っている
3. 読み取り権限がない
4. SKILL.mdのフォーマットが不正

**解決策**:

1. ディレクトリにSKILL.mdファイルが存在するか確認
   ```bash
   ls -la /path/to/skills/*/SKILL.md
   ```
2. 指定パスが正しいか確認
3. ファイルの読み取り権限を確認
   ```bash
   chmod 644 /path/to/skills/*/SKILL.md
   ```
4. SKILL.mdのフロントマターが正しいか確認（`---`で囲まれているか）

---

### フロントマターが解析されない

**症状**: name, slug, descriptionがundefinedになる

**原因**:

1. フロントマターの形式が不正
2. `---`で正しく囲まれていない
3. YAML構文エラー

**解決策**:

1. フロントマターが`---`で開始・終了しているか確認
2. YAML構文をチェック（コロンの後にスペースがあるか等）
3. 特殊文字を含む場合はクォートで囲む

**正しい例**:

```markdown
---
name: My Skill
slug: my-skill
description: "説明文: 特殊文字を含む場合はクォート"
---
```

---

### Anchorsが解析されない

**症状**: anchorsが空配列になる

**原因**:

1. Anchorsセクションの形式が不正
2. 区切り文字（`/`）が正しくない
3. `適用:`、`目的:`のラベルがない

**解決策**:
正しい形式を使用:

```markdown
## Anchors

• アンカー名 / 適用: 適用対象 / 目的: 目的説明
```

**NGパターン**:

```markdown
- アンカー名 - 適用: 対象 - 目的: 説明 # スラッシュでなくハイフン
- アンカー名 / 適用 対象 / 目的 説明 # コロンがない
```

---

### インポートが失敗する

**症状**: インポート操作がエラーになる

**原因**:

1. スキルIDが無効
2. スキルが見つからない
3. ストレージ書き込みエラー

**解決策**:

1. スキルIDが正しいか確認（slugと一致しているか）
2. 先にスキャンを実行してスキルが検出されているか確認
3. アプリを再起動して再試行

---

### 永続化されない

**症状**: アプリ再起動後にインポート状態が失われる

**原因**:

1. electron-store の設定エラー
2. ファイル書き込み権限がない
3. ストレージファイルが破損

**解決策**:

1. アプリのデータディレクトリを確認
   - macOS: `~/Library/Application Support/aiworkflow-orchestrator/`
   - Windows: `%APPDATA%/aiworkflow-orchestrator/`
   - Linux: `~/.config/aiworkflow-orchestrator/`
2. 書き込み権限を確認
3. 設定ファイルを削除して再起動

---

### セキュリティエラー

**症状**: PATH_TRAVERSAL_DETECTEDエラーが表示される

**原因**:

- パスに `..` が含まれている
- 不正なパスが指定された

**解決策**:

- 絶対パスを使用する
- パスに `..` を含めない

**NGパターン**:

```typescript
// NG
scanAvailableSkills("../../../etc/passwd");
scanAvailableSkills("/path/to/skills/../../../");

// OK
scanAvailableSkills("/Users/user/skills");
```

---

### AUTH_ERRORが発生する

**症状**: IPC呼び出しがAUTH_ERRORで失敗する

**原因**:

1. DevToolsから直接ipcRendererを呼び出している
2. 不正なオリジンからの呼び出し

**解決策**:

1. 正規のRendererプロセスからpreloadスクリプト経由で呼び出す
2. DevToolsからの直接呼び出しは設計上拒否される

---

### キャッシュが更新されない

**症状**: スキルを追加してもスキャン結果に反映されない

**原因**:

- スキャン結果がキャッシュされている

**解決策**:

1. キャッシュをクリアする
   ```typescript
   await skillService.clearCache();
   ```
2. または、キャッシュのTTL（5分）を待つ

---

## デバッグ方法

### ログの確認

開発モードでは、Main Processのコンソールにログが出力されます。

```bash
pnpm --filter @repo/desktop dev
```

### テストの実行

特定のテストケースを実行して問題を特定:

```bash
# 全テスト
pnpm --filter @repo/desktop test

# 特定ファイル
pnpm --filter @repo/desktop test -- SkillParser.test.ts

# 特定テスト
pnpm --filter @repo/desktop test -- -t "should parse frontmatter"
```

## サポート

問題が解決しない場合は、以下の情報と共にIssueを作成してください:

1. エラーメッセージの全文
2. 再現手順
3. 環境情報（OS、Node.js、Electronバージョン）
4. SKILL.mdファイルの内容（機密情報を除く）
