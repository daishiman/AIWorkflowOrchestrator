---
name: .claude/skills/code-static-analysis-security/SKILL.md
description: |
  コード静的解析によるセキュリティ脆弱性検出のベストプラクティスを提供します。
  SAST（Static Application Security Testing）ツール、パターンベース検出、
  データフロー分析によるSQLインジェクション、XSS、コマンドインジェクション、
  センシティブデータ露出、危険な関数使用の検出を行います。

  使用タイミング:
  - コードレビュー時のセキュリティチェック
  - SQLインジェクション、XSS検出時
  - センシティブデータ露出の検出時
  - 危険な関数（eval、exec等）使用チェック時

  Use this skill when performing static code analysis, detecting injection vulnerabilities,
  or validating input handling security.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/code-static-analysis-security/resources/injection-patterns.md`: SQL/XSS/コマンドインジェクションの検出パターンと正規表現
  - `.claude/skills/code-static-analysis-security/scripts/scan-sql-injection.mjs`: SQLインジェクション脆弱性の自動スキャンスクリプト
  - `.claude/skills/code-static-analysis-security/templates/sast-config-template.json`: ESLint Securityプラグイン等のSAST設定テンプレート
version: 1.0.0
related_skills:
  - .claude/skills/owasp-top-10/SKILL.md
  - .claude/skills/input-sanitization/SKILL.md
  - .claude/skills/security-testing/SKILL.md
---

# Code Static Analysis Security

## スキル概要

静的コード解析によるセキュリティ脆弱性検出の専門知識を提供します。

**専門分野**:

- インジェクション脆弱性検出（SQL、Command、LDAP等）
- XSS（クロスサイトスクリプティング）検出
- センシティブデータ露出検出
- 危険な関数使用検出
- データフロー分析（Taint Analysis）

---

## 1. SQLインジェクション検出

### 検出パターン

**文字列連結クエリ**:

```javascript
// ❌ 危険（検出対象）
const query = `SELECT * FROM users WHERE id = ${userId}`;
const query = "DELETE FROM posts WHERE id = " + postId;
db.query(`UPDATE users SET name = '${userName}'`);

// ✅ 安全（パラメータ化）
const query = "SELECT * FROM users WHERE id = $1";
db.query(query, [userId]);
```

**検出方法**:

```javascript
// Grepパターン
/(query|exec|raw)\s*\(\s*['"`].*\$\{/
/(query|exec)\s*\(\s*['"`].*\+/
```

**判断基準**:

- [ ] SQLクエリに変数が文字列連結されていないか？
- [ ] パラメータ化クエリ（$1、?等）を使用しているか？
- [ ] ORMを使用しているか（Drizzle、Prisma等）？

---

### データフロー追跡

**Source → Sink分析**:

```
Source（入力元）:
  - req.body
  - req.params
  - req.query
  - req.headers

Processing（処理）:
  - 検証・サニタイズの有無

Sink（危険な処理）:
  - db.query()
  - db.exec()
  - db.raw()
```

**例**:

```javascript
// ❌ 危険: req.params → query（検証なし）
app.get("/users/:id", (req, res) => {
  const query = `SELECT * FROM users WHERE id = ${req.params.id}`;
  db.query(query); // SQLインジェクション脆弱性
});

// ✅ 安全: 検証 + パラメータ化
app.get("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: "Invalid ID" });
  }
  db.query("SELECT * FROM users WHERE id = $1", [userId]);
});
```

**判断基準**:

- [ ] ユーザー入力からクエリまでの経路が追跡されているか？
- [ ] 入力検証が実装されているか？

---

## 2. XSS（Cross-Site Scripting）検出

### DOM操作の危険な関数

**検出対象**:

```javascript
// ❌ 危険
element.innerHTML = userInput;
document.write(userInput);
element.outerHTML = data;

// React
<div dangerouslySetInnerHTML={{ __html: userInput }} />;

// ❌ 動的スクリプト生成
eval(userInput);
new Function(userInput)();
setTimeout(userInput, 1000); // 文字列を渡す
```

**安全な代替**:

```javascript
// ✅ 安全
element.textContent = userInput; // 自動エスケープ
element.setAttribute("data-value", userInput);

// React
<div>{userInput}</div>; // 自動エスケープ
```

**検出パターン**:

```javascript
/\.innerHTML\s*=/
/dangerouslySetInnerHTML/
/document\.write/
/eval\s*\(/
/new\s+Function\s*\(/
```

**判断基準**:

- [ ] innerHTML使用時はサニタイズされているか？
- [ ] dangerouslySetInnerHTMLは最小限に抑えられているか？
- [ ] eval、new Function()は使用されていないか？

---

## 3. コマンドインジェクション検出

### 危険なNode.js関数

**検出対象**:

```javascript
const { exec, execSync, spawn } = require("child_process");

// ❌ 危険
exec(`ls -la ${userInput}`);
execSync(`rm -rf ${directory}`);

// ✅ 安全（引数配列）
spawn("ls", ["-la", userInput]);
```

**検出パターン**:

```javascript
/exec\s*\(\s*['"`].*\$\{/
/execSync\s*\(\s*['"`].*\+/
```

**判断基準**:

- [ ] exec、execSyncに変数が文字列連結されていないか？
- [ ] spawnの引数配列形式を使用しているか？
- [ ] ユーザー入力は検証・ホワイトリスト化されているか？

---

## 4. パストラバーサル検出

### ファイル操作の脆弱性

**検出対象**:

```javascript
const fs = require("fs");

// ❌ 危険
const filePath = `/uploads/${req.params.filename}`;
fs.readFileSync(filePath);

// ユーザー入力: ../../../../etc/passwd
```

**安全な実装**:

```javascript
const path = require("path");

// ✅ 安全
const uploadsDir = "/var/uploads";
const filename = path.basename(req.params.filename); // ディレクトリ削除
const filePath = path.join(uploadsDir, filename);

if (!filePath.startsWith(uploadsDir)) {
  throw new Error("Invalid file path");
}

fs.readFileSync(filePath);
```

**判断基準**:

- [ ] ファイルパスにユーザー入力が含まれる場合、path.basename()を使用しているか？
- [ ] ファイルパスが許可されたディレクトリ内か検証しているか？
- [ ] `../`パターンが拒否されているか？

---

## 5. センシティブデータ露出検出

### ハードコードされたシークレット

**検出パターン**:

```javascript
// ❌ 危険
const apiKey = "sk-1234567890abcdef";
const password = "admin123";
const secret = "my-secret-key";

// ✅ 安全
const apiKey = process.env.API_KEY;
```

**検出方法**:

```bash
# Grepパターン
grep -r "apiKey\s*=\s*['\"]" --include="*.js"
grep -r "password\s*=\s*['\"]" --include="*.ts"
```

**判断基準**:

- [ ] APIキー、パスワードが環境変数から取得されているか？
- [ ] .envファイルが.gitignoreに含まれているか？
- [ ] ハードコードされたシークレットが存在しないか？

---

### ログ出力のセンシティブデータ

**検出対象**:

```javascript
// ❌ 危険
console.log("User:", user); // passwordフィールド含む
logger.debug("Request", req.body); // パスワード含む可能性
console.log("Token:", token);

// ✅ 安全
console.log("User ID:", user.id); // IDのみ
logger.debug("Request", { userId: req.body.userId }); // 選択的
```

**判断基準**:

- [ ] ユーザーオブジェクト全体をログに出力していないか？
- [ ] トークン、パスワードがログに含まれていないか？

---

## 6. 危険な関数の検出

### 動的コード実行

**検出対象**:

```javascript
// ❌ 危険
eval(userInput);
new Function(userInput)();
setTimeout(userInput, 1000); // 文字列
setInterval(code, 1000);

// ✅ 安全
setTimeout(() => safeFunction(), 1000); // 関数
```

**判断基準**:

- [ ] eval()は使用されていないか？
- [ ] new Function()は使用されていないか？
- [ ] setTimeout/setIntervalに文字列が渡されていないか？

---

### 安全でないデシリアライズ

**検出対象**:

```javascript
// ❌ 危険
const obj = eval("(" + userInput + ")");
const data = JSON.parse(untrustedData); // プロトタイプ汚染リスク

// ✅ より安全
const data = JSON.parse(untrustedData);
delete data.__proto__;
delete data.constructor;
```

**判断基準**:

- [ ] 信頼できないデータのデシリアライズ前に検証があるか？
- [ ] プロトタイプ汚染対策があるか？

---

## 7. 静的解析ツール統合

### ESLint Security Plugins

**推奨プラグイン**:

```json
{
  "plugins": ["security", "no-secrets"],
  "extends": ["plugin:security/recommended"],
  "rules": {
    "security/detect-object-injection": "error",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-unsafe-regex": "error",
    "no-secrets/no-secrets": "error"
  }
}
```

**判断基準**:

- [ ] ESLint security pluginが導入されているか？
- [ ] セキュリティルールがエラーレベルに設定されているか？

---

### Semgrep

**実行例**:

```bash
# 自動ルールセット
semgrep --config auto .

# OWASP Top 10ルール
semgrep --config "p/owasp-top-ten" .

# カスタムルール
semgrep --config custom-rules.yaml .
```

**判断基準**:

- [ ] CI/CDでSemgrepが実行されているか？
- [ ] カスタムルールでプロジェクト固有パターンを検出しているか？

---

## リソース・スクリプト・テンプレート

### リソース

- `resources/injection-patterns.md`: インジェクション検出パターン
- `resources/xss-detection-guide.md`: XSS検出ガイド
- `resources/data-flow-analysis.md`: データフロー分析手法

### スクリプト

- `scripts/scan-sql-injection.mjs`: SQLインジェクションスキャン
- `scripts/detect-xss-vulnerabilities.mjs`: XSS検出
- `scripts/find-dangerous-functions.mjs`: 危険な関数検出

### テンプレート

- `templates/sast-config-template.json`: SAST設定テンプレート
- `templates/code-scan-report-template.md`: コードスキャンレポート

---

## 関連スキル

- `.claude/skills/owasp-top-10/SKILL.md`: A03（インジェクション）
- `.claude/skills/input-sanitization/SKILL.md`: 入力サニタイズ
- `.claude/skills/security-reporting/SKILL.md`: レポート生成

---

## 変更履歴

### v1.0.0 (2025-11-26)

- 初版リリース
- .claude/agents/sec-auditor.mdエージェントからコード静的解析知識を抽出
- SQLインジェクション、XSS、コマンドインジェクション、パストラバーサル検出を定義
