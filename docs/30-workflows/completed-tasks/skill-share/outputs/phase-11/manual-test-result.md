# Phase 11: 手動テスト仕様書

## メタ情報

| 項目       | 内容             |
| ---------- | ---------------- |
| タスクID   | TASK-9F          |
| Phase      | 11               |
| 成果物     | 手動テスト仕様書 |
| 作成日     | 2026-02-27       |
| 機能名     | skill-share      |
| ステータス | 完了             |

---

## テスト環境

- Electron アプリを開発モードで起動: `pnpm --filter @repo/desktop dev`
- DevTools コンソール（Cmd+Option+I）で `window.electronAPI.skill` 経由で API を呼び出す
- テスト用 GitHub リポジトリ/Gist を事前に用意する

---

## 1. GitHub インポート（4 シナリオ）

### MT-GH-01: GitHub リポジトリから正常にインポートできる

| 項目     | 内容                                                          |
| -------- | ------------------------------------------------------------- |
| テストID | MT-GH-01                                                      |
| 前提     | テスト用パブリックリポジトリ（SKILL.md を含む）が存在すること |
| 手順     | DevTools コンソールで以下を実行:                              |

```javascript
const result = await window.electronAPI.skill.importFromSource({
  type: "github",
  repo: "owner/test-skill-repo",
  branch: "main",
  path: "/",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: true, data: { success: true, skillName: "test-skill-repo", skillPath: "/tmp/skill-share/test-skill-repo", source: { type: "github", ... }, importedAt: "2026-..." } }` |
| 確認方法 | `result.success === true` かつ `result.data.skillName` がリポジトリ名と一致すること |

### MT-GH-02: 存在しないリポジトリを指定した場合にエラーを返す

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-GH-02                         |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const result = await window.electronAPI.skill.importFromSource({
  type: "github",
  repo: "nonexistent-owner-xyz/nonexistent-repo-abc",
  branch: "main",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { code: 3001, category: "external", message: "...", isRetryable: false } }` |
| 確認方法 | `result.success === false` かつ `result.error.category === "external"` であること |

### MT-GH-03: SKILL.md がないリポジトリを指定した場合にエラーを返す

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| テストID | MT-GH-03                                              |
| 前提     | SKILL.md を含まないパブリックリポジトリが存在すること |
| 手順     | DevTools コンソールで以下を実行:                      |

```javascript
const result = await window.electronAPI.skill.importFromSource({
  type: "github",
  repo: "owner/repo-without-skillmd",
  branch: "main",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { code: 2003, category: "business", message: "SKILL.md not found in repository" } }` |
| 確認方法 | `result.success === false` かつ `result.error.code === 2003` であること |

### MT-GH-04: 不正な source.type を指定した場合にバリデーションエラーを返す

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-GH-04                         |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const result = await window.electronAPI.skill.importFromSource({
  type: "ftp",
  repo: "owner/repo",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { code: "VALIDATION_ERROR", message: "source.type must be one of: github, gist, url, local" } }` |
| 確認方法 | `result.success === false` かつ `result.error.code === "VALIDATION_ERROR"` であること |

---

## 2. Gist インポート（4 シナリオ）

### MT-GIST-01: Gist から正常にインポートできる

| 項目     | 内容                                          |
| -------- | --------------------------------------------- |
| テストID | MT-GIST-01                                    |
| 前提     | SKILL.md を含むパブリック Gist が存在すること |
| 手順     | DevTools コンソールで以下を実行:              |

```javascript
const result = await window.electronAPI.skill.importFromSource({
  type: "gist",
  gistId: "YOUR_TEST_GIST_ID",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: true, data: { success: true, skillName: "gist-YOUR_TEST_GIST_ID", skillPath: "/tmp/skill-share/gist-...", ... } }` |
| 確認方法 | `result.success === true` かつ `result.data.skillName` に gistId が含まれること |

### MT-GIST-02: 存在しない Gist ID を指定した場合にエラーを返す

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-GIST-02                       |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const result = await window.electronAPI.skill.importFromSource({
  type: "gist",
  gistId: "nonexistent_gist_id_000000",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { category: "external", ... } }` |
| 確認方法 | `result.success === false` であること |

### MT-GIST-03: SKILL.md を含まない Gist を指定した場合にエラーを返す

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| テストID | MT-GIST-03                              |
| 前提     | SKILL.md を含まない Gist が存在すること |
| 手順     | DevTools コンソールで以下を実行:        |

```javascript
const result = await window.electronAPI.skill.importFromSource({
  type: "gist",
  gistId: "GIST_WITHOUT_SKILLMD",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { code: 2003, message: "SKILL.md not found in Gist" } }` |
| 確認方法 | `result.success === false` かつ `result.error.code === 2003` であること |

### MT-GIST-04: gistId が空文字列の場合にバリデーションエラーを返す

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-GIST-04                       |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const result = await window.electronAPI.skill.importFromSource({
  type: "gist",
  gistId: "",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | エラーレスポンス（Gist API からのエラーまたはバリデーションエラー） |
| 確認方法 | `result.success === false` であること |

---

## 3. ローカルインポート（4 シナリオ）

### MT-LOCAL-01: ローカルディレクトリから正常にインポートできる

| 項目     | 内容                                                                  |
| -------- | --------------------------------------------------------------------- |
| テストID | MT-LOCAL-01                                                           |
| 前提     | `/tmp/test-local-skill/` に SKILL.md を含むディレクトリが存在すること |
| 手順     | 事前準備後、DevTools コンソールで以下を実行:                          |

```bash
# 事前準備（ターミナルで実行）
mkdir -p /tmp/test-local-skill
echo "# Test Local Skill\nA local skill for testing" > /tmp/test-local-skill/SKILL.md
```

```javascript
const result = await window.electronAPI.skill.importFromSource({
  type: "local",
  localPath: "/tmp/test-local-skill",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: true, data: { success: true, skillName: "test-local-skill", skillPath: "/tmp/skill-share/test-local-skill", ... } }` |
| 確認方法 | `result.success === true` かつ `result.data.skillName === "test-local-skill"` であること |

### MT-LOCAL-02: 存在しないディレクトリを指定した場合にエラーを返す

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-LOCAL-02                      |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const result = await window.electronAPI.skill.importFromSource({
  type: "local",
  localPath: "/nonexistent/path/to/skill",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { code: 4002, category: "infrastructure", ... } }` |
| 確認方法 | `result.success === false` かつ `result.error.code === 4002` であること |

### MT-LOCAL-03: パストラバーサルを含むパスを指定した場合にバリデーションエラーを返す

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-LOCAL-03                      |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const result = await window.electronAPI.skill.importFromSource({
  type: "local",
  localPath: "/tmp/../../etc/passwd",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { code: 1003, category: "validation", message: "Path traversal detected in localPath" } }` |
| 確認方法 | `result.success === false` かつ `result.error.code === 1003` であること |

### MT-LOCAL-04: SKILL.md が存在しないディレクトリを指定した場合にエラーを返す

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| テストID | MT-LOCAL-04                                              |
| 前提     | `/tmp/no-skillmd-dir/` が存在し、SKILL.md を含まないこと |
| 手順     | 事前準備後、DevTools コンソールで以下を実行:             |

```bash
# 事前準備
mkdir -p /tmp/no-skillmd-dir
echo "readme" > /tmp/no-skillmd-dir/README.md
```

```javascript
const result = await window.electronAPI.skill.importFromSource({
  type: "local",
  localPath: "/tmp/no-skillmd-dir",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { code: 2003, message: "SKILL.md not found in local directory" } }` |
| 確認方法 | `result.success === false` かつ `result.error.code === 2003` であること |

---

## 4. URL インポート（4 シナリオ）

### MT-URL-01: URL から正常にインポートできる

| 項目     | 内容                                            |
| -------- | ----------------------------------------------- |
| テストID | MT-URL-01                                       |
| 前提     | 有効な SKILL.md を返す HTTPS URL が存在すること |
| 手順     | DevTools コンソールで以下を実行:                |

```javascript
const result = await window.electronAPI.skill.importFromSource({
  type: "url",
  url: "https://raw.githubusercontent.com/owner/repo/main/SKILL.md",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: true, data: { success: true, skillName: "...", skillPath: "/tmp/skill-share/...", ... } }` |
| 確認方法 | `result.success === true` であること |

### MT-URL-02: 到達不能な URL を指定した場合にエラーを返す

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-URL-02                        |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const result = await window.electronAPI.skill.importFromSource({
  type: "url",
  url: "https://nonexistent-domain-xyz123.example.com/SKILL.md",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { code: 3002, category: "external", isRetryable: true, ... } }` |
| 確認方法 | `result.success === false` かつ `result.error.isRetryable === true` であること |

### MT-URL-03: 404 を返す URL を指定した場合にエラーを返す

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-URL-03                        |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const result = await window.electronAPI.skill.importFromSource({
  type: "url",
  url: "https://httpstat.us/404",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { code: 3001, category: "external", message: "HTTP 404: ..." } }` |
| 確認方法 | `result.success === false` かつ `result.error.code === 3001` であること |

### MT-URL-04: SKILL.md 形式でないコンテンツの URL を指定した場合にエラーを返す

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-URL-04                        |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const result = await window.electronAPI.skill.importFromSource({
  type: "url",
  url: "https://www.google.com",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { code: 1002, category: "validation", message: "Invalid SKILL.md format: ..." } }` |
| 確認方法 | `result.success === false` かつ `result.error.code === 1002` であること |

---

## 5. Gist エクスポート（4 シナリオ）

### MT-EXP-GIST-01: スキルを Gist に正常にエクスポートできる

| 項目     | 内容                                                          |
| -------- | ------------------------------------------------------------- |
| テストID | MT-EXP-GIST-01                                                |
| 前提     | インポート済みスキルが存在し、GitHub PAT が設定済みであること |
| 手順     | DevTools コンソールで以下を実行:                              |

```javascript
const result = await window.electronAPI.skill.exportSkill("my-skill", {
  type: "gist",
  gistId: "",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: true, data: { success: true, destination: { type: "gist" }, exportedFiles: [...], shareUrl: "https://gist.github.com/..." } }` |
| 確認方法 | `result.success === true` かつ `result.data.shareUrl` が有効な Gist URL であること。ブラウザで shareUrl にアクセスして内容を確認 |

### MT-EXP-GIST-02: 存在しないスキル名を指定した場合にエラーを返す

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-EXP-GIST-02                   |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const result = await window.electronAPI.skill.exportSkill(
  "nonexistent-skill-xyz",
  { type: "gist", gistId: "" },
);
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { category: "business", ... } }` |
| 確認方法 | `result.success === false` であること |

### MT-EXP-GIST-03: skillName が空文字列の場合にバリデーションエラーを返す

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-EXP-GIST-03                   |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const result = await window.electronAPI.skill.exportSkill("", {
  type: "gist",
  gistId: "",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { code: "VALIDATION_ERROR", message: "args.skillName must not be empty" } }` |
| 確認方法 | `result.success === false` かつ `result.error.code === "VALIDATION_ERROR"` であること |

### MT-EXP-GIST-04: skillName がスペースのみの場合にバリデーションエラーを返す（P42 対策確認）

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-EXP-GIST-04                   |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const result = await window.electronAPI.skill.exportSkill("   ", {
  type: "gist",
  gistId: "",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { code: "VALIDATION_ERROR", message: "args.skillName must not be whitespace only" } }` |
| 確認方法 | `result.success === false` かつメッセージに "whitespace" が含まれること |

---

## 6. ローカルエクスポート（4 シナリオ）

### MT-EXP-LOCAL-01: スキルをローカルディレクトリに正常にエクスポートできる

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| テストID | MT-EXP-LOCAL-01                    |
| 前提     | インポート済みスキルが存在すること |
| 手順     | DevTools コンソールで以下を実行:   |

```javascript
const result = await window.electronAPI.skill.exportSkill("my-skill", {
  type: "local",
  localPath: "/tmp/exported-skill",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: true, data: { success: true, destination: { type: "local", localPath: "/tmp/exported-skill" }, exportedFiles: [...] } }` |
| 確認方法 | `result.success === true` であること。ターミナルで `ls /tmp/exported-skill/` を実行し、SKILL.md が存在すること |

### MT-EXP-LOCAL-02: 書き込み権限のないディレクトリを指定した場合にエラーを返す

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-EXP-LOCAL-02                  |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const result = await window.electronAPI.skill.exportSkill("my-skill", {
  type: "local",
  localPath: "/root/no-permission",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { code: 4003, category: "infrastructure", message: "Permission denied: ..." } }` |
| 確認方法 | `result.success === false` かつ `result.error.code === 4003` であること |

### MT-EXP-LOCAL-03: destination.type が許可値以外の場合にバリデーションエラーを返す

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-EXP-LOCAL-03                  |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const result = await window.electronAPI.skill.exportSkill("my-skill", {
  type: "s3",
  bucket: "my-bucket",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { code: "VALIDATION_ERROR", message: "args.destination.type must be one of: gist, local" } }` |
| 確認方法 | `result.success === false` かつ `result.error.code === "VALIDATION_ERROR"` であること |

### MT-EXP-LOCAL-04: 存在しないスキルをローカルエクスポートした場合にエラーを返す

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-EXP-LOCAL-04                  |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const result = await window.electronAPI.skill.exportSkill(
  "skill-that-does-not-exist",
  { type: "local", localPath: "/tmp/export-test" },
);
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { ... } }` |
| 確認方法 | `result.success === false` であること |

---

## 7. ソース検証テスト（4 シナリオ）

### MT-VAL-01: 有効なローカルソースの検証が成功する

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| テストID | MT-VAL-01                                                 |
| 前提     | `/tmp/test-local-skill/` に有効な SKILL.md が存在すること |
| 手順     | DevTools コンソールで以下を実行:                          |

```javascript
const result = await window.electronAPI.skill.validateSource({
  type: "local",
  localPath: "/tmp/test-local-skill",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: true, data: { isReachable: true, hasSkillMd: true, errors: [] } }` |
| 確認方法 | `result.data.isReachable === true` かつ `result.data.hasSkillMd === true` かつ `result.data.errors.length === 0` |

### MT-VAL-02: SKILL.md がないディレクトリの検証で hasSkillMd が false になる

| 項目     | 内容                                              |
| -------- | ------------------------------------------------- |
| テストID | MT-VAL-02                                         |
| 前提     | `/tmp/no-skillmd-dir/` が SKILL.md を含まないこと |
| 手順     | DevTools コンソールで以下を実行:                  |

```javascript
const result = await window.electronAPI.skill.validateSource({
  type: "local",
  localPath: "/tmp/no-skillmd-dir",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: true, data: { isReachable: true, hasSkillMd: false, errors: ["SKILL.md not found in directory"] } }` |
| 確認方法 | `result.data.hasSkillMd === false` かつ errors に "SKILL.md not found" が含まれること |

### MT-VAL-03: 存在しないパスの検証で isReachable が false になる

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-VAL-03                        |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const result = await window.electronAPI.skill.validateSource({
  type: "local",
  localPath: "/nonexistent/path",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: true, data: { isReachable: false, hasSkillMd: false, errors: ["..."] } }` |
| 確認方法 | `result.data.isReachable === false` であること |

### MT-VAL-04: source.type が未指定の場合にバリデーションエラーを返す

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-VAL-04                        |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const result = await window.electronAPI.skill.validateSource({
  localPath: "/tmp/some-path",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { code: "VALIDATION_ERROR", message: "source.type must be a string" } }` |
| 確認方法 | `result.success === false` かつ `result.error.code === "VALIDATION_ERROR"` であること |

---

## 8. セキュリティテスト（4 シナリオ）

### MT-SEC-01: パストラバーサル攻撃が拒否される

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-SEC-01                        |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const result = await window.electronAPI.skill.importFromSource({
  type: "local",
  localPath: "/tmp/../../../etc/passwd",
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { code: 1003, category: "validation", message: "Path traversal detected in localPath" } }` |
| 確認方法 | `result.error.code === 1003` かつ `/etc/passwd` にアクセスされていないこと |

### MT-SEC-02: null オブジェクトの source が拒否される

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-SEC-02                        |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const result = await window.electronAPI.skill.importFromSource(null);
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { code: "VALIDATION_ERROR", message: "source must be a non-null object" } }` |
| 確認方法 | `result.success === false` であること |

### MT-SEC-03: 配列入力が拒否される（プロトタイプ汚染対策）

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-SEC-03                        |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const result = await window.electronAPI.skill.validateSource([
  "github",
  "owner/repo",
]);
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { code: "VALIDATION_ERROR", message: "source must be a non-null object" } }` |
| 確認方法 | `result.success === false` であること |

### MT-SEC-04: 超長文字列入力が拒否される（DoS 対策）

| 項目     | 内容                             |
| -------- | -------------------------------- |
| テストID | MT-SEC-04                        |
| 前提     | なし                             |
| 手順     | DevTools コンソールで以下を実行: |

```javascript
const longString = "a".repeat(10000);
const result = await window.electronAPI.skill.importFromSource({
  type: "github",
  repo: longString,
});
console.log(JSON.stringify(result, null, 2));
```

| 期待結果 | `{ success: false, error: { code: "VALIDATION_ERROR", message: "source.repo must be less than 10000 characters" } }` |
| 確認方法 | `result.success === false` かつ `result.error.code === "VALIDATION_ERROR"` であること |

---

## テストシナリオ一覧

| カテゴリ             | シナリオ数 | テストID                               |
| -------------------- | ---------- | -------------------------------------- |
| GitHub インポート    | 4          | MT-GH-01, MT-GH-02, MT-GH-03, MT-GH-04 |
| Gist インポート      | 4          | MT-GIST-01 ~ MT-GIST-04                |
| ローカルインポート   | 4          | MT-LOCAL-01 ~ MT-LOCAL-04              |
| URL インポート       | 4          | MT-URL-01 ~ MT-URL-04                  |
| Gist エクスポート    | 4          | MT-EXP-GIST-01 ~ MT-EXP-GIST-04        |
| ローカルエクスポート | 4          | MT-EXP-LOCAL-01 ~ MT-EXP-LOCAL-04      |
| ソース検証           | 4          | MT-VAL-01 ~ MT-VAL-04                  |
| セキュリティ         | 4          | MT-SEC-01 ~ MT-SEC-04                  |
| **合計**             | **32**     |                                        |

---

## 追加確認事項

### P28 対策: 旧 API 確認

手動テスト実施時に DevTools コンソールで以下も確認すること:

```javascript
// 旧 API が存在しないことを確認
console.log("skillAPI direct:", typeof window.skillAPI); // "undefined" であること
console.log(
  "electronAPI.skill.importFromSource:",
  typeof window.electronAPI.skill.importFromSource,
); // "function" であること
console.log(
  "electronAPI.skill.exportSkill:",
  typeof window.electronAPI.skill.exportSkill,
); // "function" であること
console.log(
  "electronAPI.skill.validateSource:",
  typeof window.electronAPI.skill.validateSource,
); // "function" であること
```
