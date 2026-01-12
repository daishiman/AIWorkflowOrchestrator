# 型定義設計書

## メタ情報

| 項目   | 内容                                 |
| ------ | ------------------------------------ |
| Phase  | 2                                    |
| タスク | タスク1: 型定義の設計                |
| 作成日 | 2026-01-11                           |
| 配置先 | `packages/shared/src/types/agent.ts` |

---

## 1. スキル関連型

### 1.1 Anchor型

スキルに紐づくアンカー情報（参照元）を表現する。

```typescript
/**
 * スキルアンカー情報
 * SKILL.mdのdescription内のAnchors:セクションから抽出
 */
export interface Anchor {
  /** アンカー名（書籍名、ルール名、API仕様名等） */
  source: string;
  /** 適用範囲（どの部分に適用するか） */
  application: string;
  /** 目的（なぜこのアンカーを参照するか） */
  purpose: string;
}
```

### 1.2 EnvironmentConfig型

スキルの実行環境設定を表現する（将来拡張用）。

```typescript
/**
 * スキル環境設定
 * SKILL.md本文のEnvironmentセクションから抽出（将来実装）
 */
export interface EnvironmentConfig {
  /** 実行環境タイプ */
  type: "html" | "markdown" | "code";
  /** 自動リフレッシュ有効化 */
  autoRefresh?: boolean;
  /** デバウンス時間（ミリ秒） */
  debounce?: number;
}
```

### 1.3 Skill型

スキルの完全なメタデータを表現する。

```typescript
/**
 * スキルメタデータ
 * SKILL.mdから解析された情報を格納
 */
export interface Skill {
  /** 一意識別子（パスから生成したSHA-256の先頭16文字） */
  id: string;

  /** スキル名（SKILL.md frontmatterのnameフィールド） */
  name: string;

  /** スラッグ（ディレクトリ名、URLセーフ） */
  slug: string;

  /** スキル説明（SKILL.md frontmatterのdescriptionフィールド） */
  description: string;

  /** SKILL.mdへの絶対パス */
  path: string;

  /** トリガーキーワード配列（description内のTrigger:セクションから抽出） */
  triggers: string[];

  /** アンカー配列（description内のAnchors:セクションから抽出） */
  anchors: Anchor[];

  /** カテゴリ（tagsから推論、任意） */
  category?: string;

  /** 実行環境設定（任意、将来拡張） */
  environment?: EnvironmentConfig;

  /** ライセンス（SKILL.md frontmatterから） */
  license?: string;

  /** 許可ツール（SKILL.md frontmatterのallowed-toolsから） */
  allowedTools?: string[];

  /** タグ（SKILL.md frontmatterから） */
  tags?: string[];

  /** 依存スキル（SKILL.md frontmatterのdependenciesから） */
  dependencies?: string[];

  /** 最終更新日時（ファイルのmtime） */
  lastModified: Date;
}
```

---

## 2. スキャン結果型

### 2.1 SkillScanError型

```typescript
/**
 * スキルスキャン時のエラー情報
 * 部分的失敗を許容するため、エラーを収集して返す
 */
export interface SkillScanError {
  /** 解析失敗したファイルのパス */
  path: string;

  /** エラーメッセージ */
  error: string;

  /** エラーコード */
  code: "PARSE_ERROR" | "READ_ERROR" | "INVALID_FORMAT";
}
```

### 2.2 SkillScanResult型

```typescript
/**
 * スキルスキャン結果
 * 成功したスキルとエラー情報を両方返す
 */
export interface SkillScanResult {
  /** 正常に解析されたスキル配列 */
  skills: Skill[];

  /** 解析失敗したスキルのエラー情報 */
  errors: SkillScanError[];

  /** スキャン実行日時 */
  scannedAt: Date;
}
```

---

## 3. 操作結果型

### 3.1 ImportResult型

```typescript
/**
 * スキルインポート結果
 */
export interface ImportResult {
  /** 操作成功フラグ */
  success: boolean;

  /** インポートされたスキル数 */
  importedCount: number;

  /** 発生したエラーメッセージ配列 */
  errors: string[];
}
```

### 3.2 RemoveResult型

```typescript
/**
 * スキル削除結果
 */
export interface RemoveResult {
  /** 操作成功フラグ */
  success: boolean;

  /** 実際に削除されたかどうか（存在しなかった場合はfalse） */
  removed: boolean;
}
```

---

## 4. エラー型

### 4.1 IPCError型

```typescript
/**
 * IPC通信共通エラー
 * Main Process→Rendererへのエラーレスポンス形式
 */
export interface IPCError {
  /** エラーコード */
  code:
    | "VALIDATION_ERROR" // 入力バリデーションエラー
    | "NOT_FOUND" // リソースが見つからない
    | "AUTH_ERROR" // 認証エラー（IPC sender検証失敗）
    | "INTERNAL_ERROR" // 内部エラー
    | "PATH_TRAVERSAL"; // パストラバーサル検出

  /** ユーザー向けエラーメッセージ */
  message: string;

  /** デバッグ情報（開発時のみ） */
  details?: unknown;
}
```

---

## 5. 型エクスポート

```typescript
// packages/shared/src/types/agent.ts

export type {
  Anchor,
  EnvironmentConfig,
  Skill,
  SkillScanError,
  SkillScanResult,
  ImportResult,
  RemoveResult,
  IPCError,
};
```

---

## 6. 型の使用例

### スキルスキャン

```typescript
import { SkillScanResult, Skill } from "@repo/shared/types/agent";

const result: SkillScanResult =
  await window.electronAPI.agent.scanAvailableSkills();

result.skills.forEach((skill: Skill) => {
  console.log(`${skill.name}: ${skill.triggers.join(", ")}`);
});

if (result.errors.length > 0) {
  console.warn("Some skills failed to parse:", result.errors);
}
```

### スキルインポート

```typescript
import { ImportResult } from "@repo/shared/types/agent";

const result: ImportResult = await window.electronAPI.agent.importSkills([
  "skill-id-1",
  "skill-id-2",
]);

if (result.success) {
  console.log(`Imported ${result.importedCount} skills`);
} else {
  console.error("Import failed:", result.errors);
}
```
