# スキル管理 IPC API リファレンス

## 概要

スキル管理機能のIPC APIリファレンスです。全てのAPIはElectronのMain Processで実行され、IPC経由でRendererから呼び出されます。

## 型定義

### Skill

```typescript
interface Skill {
  id: string; // 一意識別子
  name: string; // スキル名
  slug: string; // スラッグ（kebab-case）
  description: string; // 説明
  category: string; // カテゴリ
  triggers: string[]; // トリガーキーワード
  anchors: Anchor[]; // 知識のアンカー
  isImported: boolean; // インポート状態
  sourcePath: string; // SKILL.mdのパス
  content?: string; // 全文コンテンツ
  environment?: EnvironmentConfig; // 環境設定
}
```

### Anchor

```typescript
interface Anchor {
  name: string; // アンカー名
  application: string; // 適用対象
  purpose: string; // 目的
}
```

### EnvironmentConfig

```typescript
interface EnvironmentConfig {
  allowedTools?: string[]; // 許可されたツール
  model?: string; // 使用モデル
}
```

### SkillScanResult

```typescript
interface SkillScanResult {
  skills: Skill[];
  errors: SkillScanError[];
  scannedAt: Date;
}
```

### SkillScanError

```typescript
interface SkillScanError {
  path: string;
  error: string;
}
```

### ImportResult

```typescript
interface ImportResult {
  success: boolean;
  importedIds: string[];
  failedIds: string[];
  errors: Array<{ id: string; error: string }>;
}
```

### RemoveResult

```typescript
interface RemoveResult {
  success: boolean;
  removedId: string;
  error?: string;
}
```

## API

### skill:list-available

指定パス配下のスキルをスキャンします。

| 項目     | 内容                   |
| -------- | ---------------------- |
| チャネル | `skill:list-available` |
| 引数     | `basePath: string`     |
| 戻り値   | `Promise<Skill[]>`     |

#### 使用例

```typescript
const skills = await ipcRenderer.invoke(
  "skill:list-available",
  "/path/to/skills",
);
```

#### エラー

| コード                  | 説明                 |
| ----------------------- | -------------------- |
| PATH_NOT_FOUND          | パスが存在しない     |
| PATH_TRAVERSAL_DETECTED | パストラバーサル検出 |
| PERMISSION_DENIED       | 読み取り権限なし     |
| AUTH_ERROR              | IPC sender検証失敗   |

---

### skill:list-imported

インポート済みスキル一覧を取得します。

| 項目     | 内容                  |
| -------- | --------------------- |
| チャネル | `skill:list-imported` |
| 引数     | なし                  |
| 戻り値   | `Promise<Skill[]>`    |

#### 使用例

```typescript
const importedSkills = await ipcRenderer.invoke("skill:list-imported");
```

---

### skill:import

スキルをインポートします。

| 項目     | 内容                    |
| -------- | ----------------------- |
| チャネル | `skill:import`          |
| 引数     | `skillIds: string[]`    |
| 戻り値   | `Promise<ImportResult>` |

#### 使用例

```typescript
const result = await ipcRenderer.invoke("skill:import", ["skill-1", "skill-2"]);
console.log(result.importedIds); // 成功したID
console.log(result.failedIds); // 失敗したID
```

#### 動作

- 既にインポート済みのスキルはスキップ
- 存在しないスキルIDはfailedIdsに追加
- 成功したインポートは即座に永続化

---

### skill:remove

スキルのインポートを解除します。

| 項目     | 内容                    |
| -------- | ----------------------- |
| チャネル | `skill:remove`          |
| 引数     | `skillId: string`       |
| 戻り値   | `Promise<RemoveResult>` |

#### 使用例

```typescript
const result = await ipcRenderer.invoke("skill:remove", "skill-1");
if (result.success) {
  console.log("削除成功:", result.removedId);
} else {
  console.log("削除失敗:", result.error);
}
```

#### 動作

- インポートされていないスキルの削除は失敗
- 削除成功時は即座に永続化

---

### skill:get-detail

スキルの詳細を取得します。

| 項目     | 内容                     |
| -------- | ------------------------ |
| チャネル | `skill:get-detail`       |
| 引数     | `skillId: string`        |
| 戻り値   | `Promise<Skill \| null>` |

#### 使用例

```typescript
const skill = await ipcRenderer.invoke("skill:get-detail", "skill-1");
if (skill) {
  console.log("スキル名:", skill.name);
  console.log("トリガー:", skill.triggers);
  console.log("アンカー:", skill.anchors);
}
```

#### 動作

- 存在しないスキルIDはnullを返す
- キャッシュから取得（高速）

---

## セキュリティ

### IPC sender検証

全てのIPCハンドラは呼び出し元を検証します。DevToolsからの直接呼び出しは拒否されます。

### パストラバーサル防止

`skill:list-available`のbasePathは正規化・検証されます。`../`を含むパスや、ベースパス外へのアクセスは拒否されます。

### シンボリックリンク検証

スキャン時にシンボリックリンクを検証し、ベースパス外を指すリンクは除外されます。
