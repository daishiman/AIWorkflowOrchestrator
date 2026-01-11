# IPC APIドキュメント - スキル管理UI

## 概要

本ドキュメントは、スキル管理UIで使用するIPC（Inter-Process Communication）APIの仕様を記載します。

---

## skill:list

インポート済みスキル一覧を取得する。

### Request

```typescript
// パラメータなし
window.api.invoke("skill:list");
```

### Response

```typescript
interface SkillListResponse {
  skills: Skill[];
}
```

### エラー

| Code                | Message                            | 対処             |
| ------------------- | ---------------------------------- | ---------------- |
| SKILL_DIR_NOT_FOUND | スキルディレクトリが見つかりません | パス設定を確認   |
| PARSE_ERROR         | スキルファイルのパースに失敗       | ファイル形式確認 |

### 使用例

```typescript
const skills = await window.api.invoke("skill:list");
set({ skills, isLoading: false });
```

---

## skill:available

グローバルリポジトリから利用可能なスキル一覧を取得する。

### Request

```typescript
// パラメータなし
window.api.invoke("skill:available");
```

### Response

```typescript
interface AvailableSkillsResponse {
  skills: Skill[];
}
```

### エラー

| Code           | Message                    | 対処               |
| -------------- | -------------------------- | ------------------ |
| REPO_NOT_FOUND | リポジトリが見つかりません | リポジトリ設定確認 |
| NETWORK_ERROR  | ネットワークエラー         | 接続を確認         |

### 使用例

```typescript
const availableSkills = await window.api.invoke("skill:available");
set({ availableSkills });
```

---

## skill:import

選択したスキルをインポートする。

### Request

```typescript
interface SkillImportRequest {
  skillIds: string[];
}

window.api.invoke("skill:import", { skillIds: ["skill-1", "skill-2"] });
```

### Response

```typescript
// void（成功時）
```

### エラー

| Code             | Message                          | 対処           |
| ---------------- | -------------------------------- | -------------- |
| SKILL_NOT_FOUND  | 指定されたスキルが見つかりません | スキルIDを確認 |
| ALREADY_IMPORTED | 既にインポート済みです           | 選択を確認     |
| WRITE_ERROR      | 設定の保存に失敗                 | 権限を確認     |

### 使用例

```typescript
await window.api.invoke("skill:import", { skillIds: selectedIds });
// 状態を更新
const skills = await window.api.invoke("skill:list");
set({ skills });
```

---

## skill:remove

インポート済みスキルを削除する。

### Request

```typescript
interface SkillRemoveRequest {
  skillId: string;
}

window.api.invoke("skill:remove", { skillId: "skill-1" });
```

### Response

```typescript
// void（成功時）
```

### エラー

| Code            | Message                          | 対処           |
| --------------- | -------------------------------- | -------------- |
| SKILL_NOT_FOUND | 指定されたスキルが見つかりません | スキルIDを確認 |
| WRITE_ERROR     | 設定の保存に失敗                 | 権限を確認     |

### 使用例

```typescript
await window.api.invoke("skill:remove", { skillId });
set((state) => ({
  skills: state.skills.filter((s) => s.id !== skillId),
  selectedSkill:
    state.selectedSkill?.id === skillId ? null : state.selectedSkill,
}));
```

---

## skill:search

スキルを検索する。

### Request

```typescript
interface SkillSearchRequest {
  query: string;
}

window.api.invoke("skill:search", { query: "development" });
```

### Response

```typescript
interface SkillSearchResponse {
  skills: Skill[];
}
```

### 検索対象

- スキル名（name）
- 説明（description）
- トリガー（triggers）

### 使用例

```typescript
const results = await window.api.invoke("skill:search", { query });
set({ searchResults: results });
```

---

## config:get

永続化された設定を取得する。

### Request

```typescript
window.api.invoke("config:get", "skills");
```

### Response

```typescript
// 設定値（any型）
interface SkillConfig {
  importedSkillIds: string[];
  lastUpdated?: string;
}
```

### 使用例

```typescript
const savedConfig = await window.api.invoke("config:get", "skills");
if (savedConfig?.importedSkillIds) {
  set({ importedSkillIds: savedConfig.importedSkillIds });
}
```

---

## config:set

設定を永続化する。

### Request

```typescript
interface ConfigSetRequest {
  key: string;
  value: any;
}

window.api.invoke("config:set", {
  key: "skills",
  value: { importedSkillIds: ["skill-1", "skill-2"] },
});
```

### Response

```typescript
// void（成功時）
```

### 使用例

```typescript
await window.api.invoke("config:set", {
  key: "skills",
  value: { importedSkillIds: newImportedIds },
});
```

---

## 共通型定義

### Skill

```typescript
interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  path: string;
  triggers: string[];
  anchors: Anchor[];
  category?: SkillCategory;
  lastUpdated?: string;
}
```

### Anchor

```typescript
interface Anchor {
  name: string;
  application: string;
  purpose: string;
}
```

### SkillCategory

```typescript
type SkillCategory =
  | "development"
  | "documentation"
  | "testing"
  | "deployment"
  | "automation"
  | "analysis"
  | "design"
  | "other";
```

---

## エラーハンドリングパターン

```typescript
try {
  set({ isLoading: true, error: null });
  const skills = await window.api.invoke("skill:list");
  set({ skills, isLoading: false });
} catch (error) {
  set({
    error: error instanceof Error ? error.message : "不明なエラー",
    isLoading: false,
  });
}
```

---

## 確認チェックリスト

| API             | ドキュメント | 確認    |
| --------------- | ------------ | ------- |
| skill:list      | ✅           | ✅ 完了 |
| skill:available | ✅           | ✅ 完了 |
| skill:import    | ✅           | ✅ 完了 |
| skill:remove    | ✅           | ✅ 完了 |
| skill:search    | ✅           | ✅ 完了 |
| config:get      | ✅           | ✅ 完了 |
| config:set      | ✅           | ✅ 完了 |
