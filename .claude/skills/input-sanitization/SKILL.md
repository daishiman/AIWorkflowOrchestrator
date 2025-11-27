---
name: input-sanitization
description: |
  ユーザー入力のサニタイズとセキュリティ対策を専門とするスキル。
  XSS、SQLインジェクション、コマンドインジェクションなどの攻撃を防止し、
  安全なデータ処理を実現します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/input-sanitization/resources/command-injection-prevention.md`: execFileによるシェルコマンド実行と許可リスト検証パターン
  - `.claude/skills/input-sanitization/resources/file-upload-security.md`: MIMEタイプ検証、パストラバーサル対策、サイズ制限実装
  - `.claude/skills/input-sanitization/resources/sql-injection-prevention.md`: パラメータ化クエリとORMによるSQLインジェクション防止
  - `.claude/skills/input-sanitization/resources/xss-prevention.md`: HTMLエスケープ、CSP、DOMベースXSS対策の実装パターン
  - `.claude/skills/input-sanitization/scripts/scan-vulnerabilities.mjs`: コードベースのXSS/SQLインジェクション脆弱性スキャン
  - `.claude/skills/input-sanitization/templates/sanitization-utils.ts`: 入力検証とサニタイズユーティリティ関数テンプレート

  専門分野:
  - XSS防止: HTMLエスケープ、CSP、サニタイザー
  - SQLインジェクション対策: パラメータ化クエリ、ORM活用
  - コマンドインジェクション防止: シェルエスケープ、入力検証
  - ファイルアップロード: MIMEタイプ検証、パス検証

  使用タイミング:
  - ユーザー入力を処理するAPIエンドポイント設計時
  - HTMLコンテンツを動的に生成する際
  - データベースクエリを構築する際
  - ファイルアップロード機能を実装する際

  Use proactively when handling user input, designing API endpoints,
version: 1.0.0
---

# Input Sanitization

## 概要

このスキルは、ユーザー入力のサニタイズとセキュリティ対策のベストプラクティスを提供します。
XSS、SQL インジェクション、コマンドインジェクションなどの一般的な攻撃ベクトルから
アプリケーションを保護するための具体的なパターンと実装方法を解説します。

**主要な価値**:

- 一般的な攻撃ベクトルからの保護
- セキュアコーディングパターンの標準化
- OWASP Top 10 への対応

**対象ユーザー**:

- スキーマ定義を行うエージェント（@schema-def）
- API エンドポイントを設計する開発者
- セキュリティを重視するチーム

## リソース構造

```
input-sanitization/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── xss-prevention.md                      # XSS対策
│   ├── sql-injection-prevention.md            # SQLインジェクション対策
│   ├── command-injection-prevention.md        # コマンドインジェクション対策
│   └── file-upload-security.md                # ファイルアップロードセキュリティ
├── scripts/
│   └── scan-vulnerabilities.mjs               # 脆弱性スキャンスクリプト
└── templates/
    └── sanitization-utils.ts                  # サニタイズユーティリティ
```

## コマンドリファレンス

### リソース読み取り

```bash
# XSS対策
cat .claude/skills/input-sanitization/resources/xss-prevention.md

# SQLインジェクション対策
cat .claude/skills/input-sanitization/resources/sql-injection-prevention.md

# コマンドインジェクション対策
cat .claude/skills/input-sanitization/resources/command-injection-prevention.md

# ファイルアップロードセキュリティ
cat .claude/skills/input-sanitization/resources/file-upload-security.md
```

### スクリプト実行

```bash
# 脆弱性スキャン
node .claude/skills/input-sanitization/scripts/scan-vulnerabilities.mjs <directory>
```

### テンプレート参照

```bash
# サニタイズユーティリティ
cat .claude/skills/input-sanitization/templates/sanitization-utils.ts
```

## いつ使うか

### シナリオ 1: Web フォームの実装

**状況**: ユーザー入力を受け付けるフォームを実装する

**適用条件**:

- [ ] ユーザーからテキスト入力を受け付ける
- [ ] 入力データをデータベースに保存する
- [ ] 入力データを画面に表示する可能性がある

**期待される成果**: XSS と SQL インジェクションを防止した安全なフォーム

### シナリオ 2: API エンドポイントの設計

**状況**: 外部からのリクエストを受け付ける API を設計する

**適用条件**:

- [ ] リクエストボディを処理する
- [ ] クエリパラメータを使用する
- [ ] パスパラメータを使用する

**期待される成果**: 入力検証とサニタイズが適切に実装された API

### シナリオ 3: ファイルアップロード機能

**状況**: ユーザーがファイルをアップロードできる機能を実装する

**適用条件**:

- [ ] ユーザーがファイルを選択してアップロードする
- [ ] ファイルをサーバーに保存する
- [ ] ファイルを他のユーザーに提供する可能性がある

**期待される成果**: 安全なファイルアップロード機能

## 基本概念

### 入力検証 vs サニタイズ

```typescript
// 入力検証（Validation）: 入力が期待される形式かチェック
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// サニタイズ（Sanitization）: 入力から危険な要素を除去/エスケープ
function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// 両方を組み合わせる
function processUserInput(email: string): string {
  // 1. 検証
  if (!validateEmail(email)) {
    throw new Error("Invalid email format");
  }
  // 2. サニタイズ（表示用）
  return sanitizeHtml(email);
}
```

### XSS 対策の基本

```typescript
// ❌ 危険: 直接HTMLに挿入
element.innerHTML = userInput;

// ✅ 安全: テキストとして挿入
element.textContent = userInput;

// ✅ 安全: エスケープしてから挿入
element.innerHTML = escapeHtml(userInput);

// Reactでの対応
// ❌ 危険
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ 安全: 自動エスケープ
<div>{userInput}</div>
```

### SQL インジェクション対策

```typescript
// ❌ 危険: 文字列連結
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// ✅ 安全: パラメータ化クエリ
const query = "SELECT * FROM users WHERE id = $1";
const result = await db.query(query, [userId]);

// ✅ 安全: ORMを使用
const user = await prisma.user.findUnique({
  where: { id: userId },
});
```

### コマンドインジェクション対策

```typescript
import { execFile } from "child_process";

// ❌ 危険: exec + 文字列連結
exec(`ls -la ${userInput}`);

// ✅ 安全: execFile + 引数配列
execFile("ls", ["-la", userInput], (error, stdout) => {
  // 処理
});

// ✅ より安全: 許可リストで検証
const allowedCommands = ["list", "status", "help"];
if (!allowedCommands.includes(userInput)) {
  throw new Error("Invalid command");
}
```

## 判断基準チェックリスト

### 入力処理時

- [ ] 入力の型と形式を検証しているか？
- [ ] 入力の長さを制限しているか？
- [ ] 特殊文字を適切にエスケープしているか？
- [ ] 許可リスト（ホワイトリスト）アプローチを使用しているか？

### データベース操作時

- [ ] パラメータ化クエリまたは ORM を使用しているか？
- [ ] 入力値を直接 SQL に連結していないか？
- [ ] 適切な権限のデータベースユーザーを使用しているか？

### ファイル操作時

- [ ] ファイル名をサニタイズしているか？
- [ ] パストラバーサル攻撃を防いでいるか？
- [ ] MIME タイプを検証しているか？
- [ ] ファイルサイズを制限しているか？

## セキュリティ原則

### 多層防御（Defense in Depth）

```
[ユーザー入力]
    ↓
[クライアント検証] ← 補助的（バイパス可能）
    ↓
[サーバー検証] ← 必須（信頼できる境界）
    ↓
[サニタイズ] ← 出力コンテキストに応じて
    ↓
[データベース/ファイルシステム]
```

### 最小権限の原則

- データベース接続には最小限の権限を付与
- ファイルシステムアクセスは必要なディレクトリのみ
- 外部コマンド実行は可能な限り避ける

## 関連スキル

- `.claude/skills/zod-validation/SKILL.md` - Zod バリデーション
- `.claude/skills/type-safety-patterns/SKILL.md` - 型安全性パターン
- `.claude/skills/error-message-design/SKILL.md` - エラーメッセージ設計

## 変更履歴

| バージョン | 日付       | 変更内容                                  |
| ---------- | ---------- | ----------------------------------------- |
| 1.0.0      | 2025-11-25 | 初版リリース - 入力サニタイズの基本を網羅 |
