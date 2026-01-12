# スキル管理バックエンド 実装ガイド

## 概要

このドキュメントは、スキル管理バックエンド機能の実装について説明します。この機能により、ユーザーはスキル（SKILL.mdファイルで定義された知識・プロンプト）をスキャン、インポート、管理できます。

## アーキテクチャ

### コンポーネント構成

```
Main Process (Electron)
├── SkillService (Facade - エントリポイント)
│   ├── SkillScanner (スキル検出・パス検証)
│   ├── SkillParser (SKILL.md解析)
│   └── SkillImportManager (インポート管理・永続化)
└── IPC Handlers (Renderer通信)
    └── skillHandlers.ts
```

### ファイル構成

```
apps/desktop/src/main/
├── services/skill/
│   ├── SkillScanner.ts        # スキル検出
│   ├── SkillParser.ts         # SKILL.md解析
│   ├── SkillImportManager.ts  # インポート管理
│   ├── SkillService.ts        # Facadeサービス
│   ├── index.ts               # エクスポート
│   └── __tests__/             # テスト
└── ipc/
    └── skillHandlers.ts       # IPCハンドラ
```

### データフロー

```
1. Renderer → IPC Channel → Main Process
2. Main Process → SkillService → Scanner/Parser/Manager
3. 結果 → IPC Channel → Renderer
```

## コンポーネント詳細

### SkillScanner

スキルディレクトリのスキャンとパス検証を担当します。

**主要メソッド**:

- `scanDirectory(basePath)`: 指定パス配下のSKILL.mdを検出
- `validatePath(path)`: パストラバーサル攻撃を防止
- `validateSymlink(path)`: シンボリックリンクの安全性を検証

**セキュリティ機能**:

- パストラバーサル攻撃の防止（`../` を含むパスを拒否）
- シンボリックリンクの検証（ベースパス外を指すリンクを拒否）

### SkillParser

SKILL.mdファイルの解析を担当します。

**主要メソッド**:

- `parse(content, filePath)`: SKILL.mdを解析してSkillオブジェクトを生成
- `parseAnchors(content)`: Anchorsセクションを解析
- `parseTriggers(content)`: Triggerセクションを解析

**解析対象**:

- YAMLフロントマター（name, slug, description等）
- Anchorsセクション（知識のアンカー）
- Triggerセクション（呼び出しトリガー）

### SkillImportManager

スキルのインポート状態管理と永続化を担当します。

**主要メソッド**:

- `importSkills(skillIds)`: スキルをインポート
- `removeSkill(skillId)`: インポートを解除
- `getImportedSkillIds()`: インポート済みID一覧を取得
- `isImported(skillId)`: インポート状態を確認

**永続化**:

- electron-storeを使用してインポート状態を保存
- アプリ再起動後も状態を維持

### SkillService (Facade)

外部からのアクセスポイントとなるFacadeパターンを実装。

**主要メソッド**:

- `scanAvailableSkills(basePath)`: スキルをスキャン
- `getImportedSkills()`: インポート済みスキルを取得
- `importSkills(skillIds)`: スキルをインポート
- `removeSkill(skillId)`: スキルを削除
- `getSkillById(skillId)`: スキル詳細を取得
- `clearCache()`: キャッシュをクリア

**キャッシュ機能**:

- スキャン結果をキャッシュして高速化
- TTLベースのキャッシュ無効化

## IPC API

### skill:list-available

指定パス配下のスキルをスキャンする。

**引数**:

- `basePath: string` - スキャン対象ディレクトリ

**戻り値**:

- `Skill[]` - 検出されたスキル一覧

### skill:list-imported

インポート済みスキル一覧を取得する。

**引数**: なし

**戻り値**:

- `Skill[]` - インポート済みスキル一覧

### skill:import

スキルをインポートする。

**引数**:

- `skillIds: string[]` - インポートするスキルID

**戻り値**:

- `ImportResult` - インポート結果

### skill:remove

スキルのインポートを解除する。

**引数**:

- `skillId: string` - 削除するスキルID

**戻り値**:

- `RemoveResult` - 削除結果

### skill:get-detail

スキルの詳細を取得する。

**引数**:

- `skillId: string` - スキルID

**戻り値**:

- `Skill | null` - スキル詳細

## 使用例

### Rendererからの呼び出し

```typescript
// スキルスキャン
const skills = await window.electronAPI.skill.listAvailable("/path/to/skills");

// インポート
const result = await window.electronAPI.skill.import(["skill-1", "skill-2"]);

// インポート済み取得
const imported = await window.electronAPI.skill.listImported();

// 詳細取得
const detail = await window.electronAPI.skill.getDetail("skill-1");

// 削除
const removeResult = await window.electronAPI.skill.remove("skill-1");
```

## セキュリティ

### パストラバーサル防止

すべてのパス操作は正規化後に検証されます。

```typescript
private validatePath(targetPath: string): void {
  const normalized = path.normalize(targetPath);
  const resolved = path.resolve(this.basePath, normalized);

  if (!resolved.startsWith(this.basePath)) {
    throw new Error("PATH_TRAVERSAL_DETECTED");
  }
}
```

### IPC sender検証

正当なRendererからの呼び出しのみ受け付けます。

```typescript
function validateIpcSender(event: IpcMainInvokeEvent): void {
  const frame = event.senderFrame;
  if (!frame || frame.url.startsWith("devtools://")) {
    throw new Error("AUTH_ERROR: Invalid sender");
  }
}
```

## テスト

### 実行方法

```bash
# 全テスト実行
pnpm --filter @repo/desktop test

# スキル関連テストのみ
pnpm --filter @repo/desktop test -- --grep "Skill"

# カバレッジ付き
pnpm --filter @repo/desktop test -- --coverage
```

### テストカバレッジ

| メトリクス        | 達成値 |
| ----------------- | ------ |
| Line Coverage     | 97.74% |
| Branch Coverage   | 94.31% |
| Function Coverage | 100%   |
