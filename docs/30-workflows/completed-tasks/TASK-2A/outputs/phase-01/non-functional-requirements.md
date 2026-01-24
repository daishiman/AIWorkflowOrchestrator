# 非機能要件定義書

## メタ情報

| 項目     | 内容              |
| -------- | ----------------- |
| タスクID | TASK-2A           |
| フェーズ | Phase 1: 要件定義 |
| 作成日   | 2026-01-24        |
| 機能名   | SkillScanner 実装 |

---

## 1. 非機能要件一覧

| 要件ID  | カテゴリ     | 要件                                               | 優先度 |
| ------- | ------------ | -------------------------------------------------- | ------ |
| NFR-001 | 性能         | 100スキルのスキャンが3秒以内に完了すること         | 必須   |
| NFR-002 | 信頼性       | 不正な SKILL.md があってもスキャンが中断しないこと | 必須   |
| NFR-003 | 保守性       | 新しいサブディレクトリタイプを容易に追加できる構造 | 推奨   |
| NFR-004 | テスト性     | モック可能なファイルシステム抽象化                 | 必須   |
| NFR-005 | セキュリティ | パストラバーサル攻撃への耐性                       | 必須   |

---

## 2. 非機能要件詳細

### NFR-001: 性能要件

**要件**: 100スキルのスキャンが3秒以内に完了すること

**測定条件**:

- 各スキルに平均5個のサブディレクトリファイルが存在
- ディスクI/O はSSD環境を想定
- Node.js 20+ 環境

**実現方法**:

1. サブディレクトリスキャンを `Promise.all` で並列実行
2. ファイル読み込みは必要最小限（SKILL.md + Markdown説明抽出のみ）
3. 大きなファイルの内容は読み込まない

**検証方法**:

- 100スキルのフィクスチャを用意してパフォーマンステストを実行
- `console.time` / `console.timeEnd` で計測

---

### NFR-002: 信頼性要件

**要件**: 不正な SKILL.md があってもスキャンが中断しないこと

**対象となる異常ケース**:

| ケース                       | 期待動作              |
| ---------------------------- | --------------------- |
| SKILL.md が存在しない        | スキップしてログ出力  |
| SKILL.md が空ファイル        | スキップしてログ出力  |
| Frontmatter が不正な YAML    | スキップしてログ出力  |
| name フィールドが存在しない  | スキップ（null 返却） |
| ディレクトリ読み取り権限なし | スキップしてログ出力  |
| シンボリックリンクループ     | スキップしてログ出力  |

**実現方法**:

1. 各スキルのパース処理を try-catch で囲む
2. エラー発生時は `console.warn` でログ出力
3. エラーがあったスキルはスキップして次へ進む

**検証方法**:

- 異常ケースのフィクスチャを用意してテスト
- 正常なスキルとの混在環境でテスト

---

### NFR-003: 保守性要件

**要件**: 新しいサブディレクトリタイプを容易に追加できる構造

**対象サブディレクトリ（現状）**:

- agents/, references/, scripts/, assets/, schemas/, indexes/

**将来の拡張例**:

- workflows/, templates/, hooks/

**実現方法**:

1. サブディレクトリ名を定数配列で管理
2. スキャン処理は汎用的な `scanSubDirectory` メソッドで統一
3. 新ディレクトリ追加は配列への追加のみで完了

```typescript
const SUB_DIRECTORIES = [
  "agents",
  "references",
  "scripts",
  "assets",
  "schemas",
  "indexes",
] as const;
```

**検証方法**:

- コードレビューで構造を確認
- 新ディレクトリ追加の手順を文書化

---

### NFR-004: テスト性要件

**要件**: モック可能なファイルシステム抽象化

**背景**:

- ユニットテストでは実際のファイルシステムに依存したくない
- テストの高速化と環境非依存性を確保

**実現方法**:

#### 方式1: フィクスチャベーステスト（採用）

```typescript
// __fixtures__/ ディレクトリにテスト用スキル構造を配置
const scanner = new SkillScanner({
  aiworkflowDir: path.join(__dirname, "__fixtures__", "aiworkflow-skills"),
  claudeDir: path.join(__dirname, "__fixtures__", "claude-skills"),
});
```

#### 方式2: ファイルシステム抽象化インターフェース（将来対応）

```typescript
interface IFileSystem {
  readdir(path: string): Promise<Dirent[]>;
  readFile(path: string): Promise<string>;
  stat(path: string): Promise<Stats>;
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  exists(path: string): Promise<boolean>;
}
```

**検証方法**:

- フィクスチャを使用したユニットテストの実行
- テストカバレッジの確認

---

### NFR-005: セキュリティ要件

**要件**: パストラバーサル攻撃への耐性

**脅威シナリオ**:

- 悪意のあるスキル名（`../../../etc/passwd`）による想定外パスへのアクセス
- シンボリックリンクによる想定外ファイルへのアクセス

**対策**:

1. **パス正規化と検証**

   ```typescript
   const normalizedPath = path.resolve(skillPath);
   if (
     !normalizedPath.startsWith(this.aiworkflowDir) &&
     !normalizedPath.startsWith(this.claudeDir)
   ) {
     throw new Error("Invalid skill path");
   }
   ```

2. **シンボリックリンクの制限**
   - ディレクトリ走査時は `withFileTypes: true` を使用
   - シンボリックリンクは辿らない（`isDirectory()` で判定）

3. **ファイル名の検証**
   - ディレクトリ名に `..` や `/` を含む場合はスキップ

**検証方法**:

- パストラバーサルを試みるテストケースの作成
- セキュリティレビューの実施

---

## 3. 品質指標

| 指標             | 目標値           | 測定方法               |
| ---------------- | ---------------- | ---------------------- |
| テストカバレッジ | Line 80%以上     | Vitest カバレッジ      |
| テストカバレッジ | Branch 60%以上   | Vitest カバレッジ      |
| Lint エラー      | 0件              | ESLint                 |
| 型エラー         | 0件              | TypeScript Compiler    |
| 循環複雑度       | 10以下（各関数） | ESLint complexity rule |

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-24 | 初版作成 |
