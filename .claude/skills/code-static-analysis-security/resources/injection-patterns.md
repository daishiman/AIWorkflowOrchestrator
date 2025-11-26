# インジェクション脆弱性検出パターン

## SQLインジェクション

### 検出パターン

**文字列連結**:
```javascript
// ❌ 危険
const query = `SELECT * FROM users WHERE id = ${userId}`;
const query = "DELETE FROM posts WHERE id = " + postId;
db.query(`UPDATE users SET name = '${userName}'`);
```

**検出正規表現**:
```regex
/(query|exec|raw)\s*\(\s*['"`].*\$\{/
/(query|exec)\s*\(\s*['"`].*\+\s*\w+/
```

### 安全なパターン

```javascript
// ✅ パラメータ化クエリ
db.query('SELECT * FROM users WHERE id = $1', [userId]);
db.query('SELECT * FROM users WHERE id = ?', [userId]);
```

---

## コマンドインジェクション

### 検出パターン

**文字列連結コマンド**:
```javascript
// ❌ 危険
exec(`ls -la ${userInput}`);
execSync(`rm -rf ${directory}`);
spawn('sh', ['-c', `cat ${filename}`]);
```

**検出正規表現**:
```regex
/exec(Sync)?\s*\(\s*['"`].*\$\{/
/spawn\s*\(\s*['"`]sh['"`]\s*,.*\$\{/
```

### 安全なパターン

```javascript
// ✅ 引数配列
spawn('ls', ['-la', userInput]);
execFile('cat', [filename]);
```

---

## LDAPインジェクション

### 検出パターン

```javascript
// ❌ 危険
const filter = `(uid=${username})`;
```

### 安全なパターン

```javascript
// ✅ エスケープ
function escapeLDAP(str) {
  return str.replace(/[*()\\\0]/g, (char) => {
    return '\\' + char.charCodeAt(0).toString(16).padStart(2, '0');
  });
}
```

---

## NoSQLインジェクション

### 検出パターン

```javascript
// ❌ 危険
db.collection.find({ username: req.body.username });

// 攻撃: { "username": { "$ne": null } }
```

### 安全なパターン

```javascript
// ✅ 型検証
const username = String(req.body.username);
db.collection.find({ username });
```

---

## 参考文献

- **OWASP Injection Cheat Sheet**: https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html
- **CWE-89**: SQL Injection
- **CWE-78**: OS Command Injection
