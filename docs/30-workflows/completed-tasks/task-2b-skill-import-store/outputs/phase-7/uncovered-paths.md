# Phase 7 未カバーパス一覧

## メタ情報

| 項目     | 内容             |
| -------- | ---------------- |
| Phase    | 7                |
| 作成日   | 2026-01-24       |
| 分析対象 | SkillImportStore |

---

## 1. 未カバー行・分岐一覧

### 1.1 結果

**未カバー箇所はありません。**

すべての公開API、分岐、エラーパスがテストでカバーされています。

---

## 2. 分析詳細

### 2.1 行カバレッジ

| ファイル箇所                           | カバー状態    |
| -------------------------------------- | ------------- |
| 型定義 (14-52行)                       | N/A（型のみ） |
| 定数定義 (54-64行)                     | ✅ 使用       |
| validateSkillName (68-75行)            | ✅ 全行       |
| SkillImportStore.constructor (87-99行) | ✅ 全行       |
| runMigrations (105-122行)              | ✅ 全行       |
| getImported (131-139行)                | ✅ 全行       |
| addImport (144-161行)                  | ✅ 全行       |
| removeImport (166-183行)               | ✅ 全行       |
| exists (188-191行)                     | ✅ 全行       |
| updateLastUsed (196-204行)             | ✅ 全行       |
| getSettings (213-216行)                | ✅ 全行       |
| updateSettings (221-231行)             | ✅ 全行       |
| rememberPermission (240-252行)         | ✅ 全行       |
| getRememberedPermission (257-263行)    | ✅ 全行       |
| setCache (272-279行)                   | ✅ 全行       |
| getCache (284-287行)                   | ✅ 全行       |
| invalidateCache (292-300行)            | ✅ 全行       |
| reset (309-314行)                      | ✅ 全行       |
| internalStore getter (319-321行)       | ✅ 全行       |
| getSkillImportStore (331-336行)        | ✅ 全行       |
| resetSkillImportStore (341-343行)      | ✅ 使用       |

### 2.2 分岐カバレッジ

| 分岐箇所                                     | カバー状態 |
| -------------------------------------------- | ---------- |
| validateSkillName: if (!name \|\| ...)       | ✅ 両方向  |
| validateSkillName: 三項演算子                | ✅ 両方向  |
| runMigrations: try-catch                     | ✅ 両方向  |
| runMigrations: if (currentVersion < 1)       | ✅ 両方向  |
| runMigrations: if (!has("importedSkills"))   | ✅ 両方向  |
| runMigrations: if (!has("skillSettings"))    | ✅ 両方向  |
| getImported: try-catch                       | ✅ 両方向  |
| addImport: if (!skillSettings[skillName])    | ✅ 両方向  |
| removeImport: if (!(skillName in...))        | ✅ 両方向  |
| updateLastUsed: if (!(skillName in...))      | ✅ 両方向  |
| getSettings: ?? (nullish coalescing)         | ✅ 両方向  |
| updateSettings: ?? (nullish coalescing)      | ✅ 両方向  |
| rememberPermission: ?? (nullish coalescing)  | ✅ 両方向  |
| getRememberedPermission: ?. (optional chain) | ✅ 両方向  |
| getCache: ?? (nullish coalescing)            | ✅ 両方向  |
| invalidateCache: if (skillName)              | ✅ 両方向  |
| getSkillImportStore: if (!instance)          | ✅ 両方向  |

---

## 3. 優先度分類

| 優先度 | 対象               | 件数 |
| ------ | ------------------ | ---- |
| 高     | メイン機能         | 0件  |
| 中     | エラーハンドリング | 0件  |
| 低     | ユーティリティ     | 0件  |

---

## 4. 結論

未カバー箇所がないため、追加テストは不要です。
