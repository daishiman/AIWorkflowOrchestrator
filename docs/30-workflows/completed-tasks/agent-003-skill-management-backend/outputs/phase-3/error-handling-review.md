# エラーハンドリングレビュー

## メタ情報

| 項目   | 内容                                |
| ------ | ----------------------------------- |
| Phase  | 3                                   |
| タスク | タスク4: エラーハンドリングレビュー |
| 作成日 | 2026-01-11                          |

---

## 1. 参照した設計

- `outputs/phase-2/security-design.md`
- `outputs/phase-2/ipc-design.md`
- `outputs/phase-2/class-design.md`

---

## 2. エラーシナリオカバレッジ

### 2.1 スキャン関連エラー

| エラーシナリオ           | 対応 | エラーコード   | 発生場所     |
| ------------------------ | ---- | -------------- | ------------ |
| SKILL.mdが存在しない     | ○    | -（スキップ）  | SkillScanner |
| SKILL.md解析失敗         | ○    | PARSE_ERROR    | SkillParser  |
| ファイル読み取りエラー   | ○    | READ_ERROR     | SkillParser  |
| YAML Frontmatter形式不正 | ○    | INVALID_FORMAT | SkillParser  |
| ディレクトリアクセス失敗 | ○    | INTERNAL_ERROR | SkillScanner |

### 2.2 スキル操作エラー

| エラーシナリオ               | 対応 | エラーコード     | 発生場所           |
| ---------------------------- | ---- | ---------------- | ------------------ |
| 無効なスキルID               | ○    | VALIDATION_ERROR | IPCハンドラー      |
| スキルが見つからない         | ○    | NOT_FOUND        | SkillService       |
| 既にインポート済み           | ○    | -（成功扱い）    | SkillImportManager |
| インポート済みでないのに削除 | ○    | -（成功扱い）    | SkillImportManager |

### 2.3 セキュリティエラー

| エラーシナリオ         | 対応 | エラーコード   | 発生場所      |
| ---------------------- | ---- | -------------- | ------------- |
| パストラバーサル検知   | ○    | PATH_TRAVERSAL | SkillScanner  |
| IPC不正呼び出し        | ○    | AUTH_ERROR     | IPCハンドラー |
| DevToolsからの呼び出し | ○    | AUTH_ERROR     | ipc-validator |
| 不正プロトコル         | ○    | AUTH_ERROR     | ipc-validator |

### 2.4 内部エラー

| エラーシナリオ       | 対応 | エラーコード   | 発生場所           |
| -------------------- | ---- | -------------- | ------------------ |
| 予期せぬ例外         | ○    | INTERNAL_ERROR | 各IPCハンドラー    |
| ストア読み書きエラー | ○    | INTERNAL_ERROR | SkillImportManager |

---

## 3. エラー伝搬パス確認

### 3.1 スキャンエラーの伝搬

```
SkillScanner.scanDirectory()
    │
    ├─ ディレクトリアクセス失敗
    │      └→ throw Error
    │          └→ SkillService.scanAvailableSkills()
    │              └→ catch → IPCError(INTERNAL_ERROR)
    │                  └→ IPCハンドラー → throw
    │                      └→ Renderer (catch)
    │
    └─ パストラバーサル検出
           └→ throw Error("Path traversal detected")
               └→ SkillService.scanAvailableSkills()
                   └→ catch → sanitizePathTraversalError()
                       └→ IPCError(PATH_TRAVERSAL)
                           └→ Renderer (catch)
```

### 3.2 パースエラーの伝搬（部分的失敗）

```
SkillParser.parse()
    │
    └─ 解析失敗
           └→ throw Error
               └→ SkillService.scanAvailableSkills()
                   └→ catch → SkillScanError に変換
                       └→ result.errors に追加（継続）
                           └→ IPCハンドラー
                               └→ SkillScanResult { skills, errors }
                                   └→ Renderer (success + errors)
```

### 3.3 入力バリデーションエラーの伝搬

```
IPCハンドラー
    │
    └─ validateSkillId() / validateSkillIds()
           └→ throw IPCError(VALIDATION_ERROR)
               └→ Renderer (catch)
```

### 3.4 IPC認証エラーの伝搬

```
IPCハンドラー
    │
    └─ validateIpcSender()
           └→ return false
               └→ throw IPCError(AUTH_ERROR)
                   └→ Renderer (catch)
```

---

## 4. エラーハンドリングパターン確認

### 4.1 部分的失敗の許容

**確認項目**: 1つのスキル解析失敗で全体が失敗しないこと

**設計確認**:

```typescript
// SkillService.scanAvailableSkills()
for (const skillPath of skillPaths) {
  try {
    const skill = await this.parser.parse(skillPath);
    skills.push(skill);
  } catch (e) {
    errors.push({
      path: skillPath,
      error: e instanceof Error ? e.message : String(e),
      code: "PARSE_ERROR",
    });
    // 継続 - 他のスキルの解析を続行
  }
}
```

**判定**: PASS - 部分的失敗を適切に処理

### 4.2 エラー情報の制限

**確認項目**: セキュリティエラーで詳細情報を漏洩しないこと

**設計確認**:

```typescript
// sanitizePathTraversalError()
return {
  code: "PATH_TRAVERSAL",
  message: "Invalid path",
  // detailsなし - 攻撃者に情報を与えない
};
```

**判定**: PASS - 情報漏洩対策は適切

### 4.3 エラーログの記録

**確認項目**: デバッグ情報がログに記録されること

**設計確認**:

```typescript
// sanitizePathTraversalError()
console.error("Path traversal detected:", error); // ログに詳細を記録
return { code: "PATH_TRAVERSAL", message: "Invalid path" };
```

**判定**: PASS - ログ記録は適切

---

## 5. エラーレスポンス形式確認

### 5.1 IPCError形式

```typescript
interface IPCError {
  code:
    | "VALIDATION_ERROR"
    | "NOT_FOUND"
    | "AUTH_ERROR"
    | "INTERNAL_ERROR"
    | "PATH_TRAVERSAL";
  message: string;
  details?: unknown; // 開発環境のみ
}
```

### 5.2 SkillScanError形式（部分的失敗用）

```typescript
interface SkillScanError {
  path: string;
  error: string;
  code: "PARSE_ERROR" | "READ_ERROR" | "INVALID_FORMAT";
}
```

---

## 6. 判定

### 総合判定: PASS

エラーハンドリング設計は十分であり、すべてのエラーシナリオがカバーされている。

### 確認済み項目

1. スキャン関連エラー: 全カバー
2. スキル操作エラー: 全カバー
3. セキュリティエラー: 全カバー
4. 内部エラー: 全カバー
5. 部分的失敗の許容: 適切
6. エラー情報制限: 適切
7. エラーログ記録: 適切
8. エラーレスポンス形式: 一貫性あり

### 追加推奨事項（任意）

1. エラーメトリクスの収集（将来拡張）
2. エラー通知機能の追加（将来拡張）
