# Phase 2 - タスク2: electron-store設定仕様

## 作成日

2026-01-22

---

## 1. 現在の設定

### ipc/index.ts での設定

```typescript
interface SkillStoreSchema {
  importedSkillIds: string[];
}

const skillStore = new Store<SkillStoreSchema>({
  name: "skills",
  defaults: {
    importedSkillIds: [],
  },
});
```

### 設定項目の確認

| 設定項目             | 現在の値                   | 説明                            |
| -------------------- | -------------------------- | ------------------------------- |
| `name`               | `"skills"`                 | ストアファイル名（skills.json） |
| `cwd`                | 未設定（デフォルト）       | Application Supportディレクトリ |
| `defaults`           | `{ importedSkillIds: [] }` | デフォルト値                    |
| `schema`             | 未設定                     | バリデーションなし              |
| `encryptionKey`      | 未設定                     | 暗号化なし                      |
| `clearInvalidConfig` | 未設定（false）            | 無効な設定のクリア              |
| `watch`              | 未設定（false）            | ファイル変更監視                |

---

## 2. electron-store公式API

### 主要オプション（参照: electron-store v11）

| オプション                      | 型      | デフォルト              | 説明                                   |
| ------------------------------- | ------- | ----------------------- | -------------------------------------- |
| `name`                          | string  | `"config"`              | ストアファイル名（拡張子なし）         |
| `cwd`                           | string  | app.getPath('userData') | ストアファイルの保存先ディレクトリ     |
| `defaults`                      | object  | -                       | デフォルト値                           |
| `schema`                        | object  | -                       | JSON Schemaによるバリデーション        |
| `encryptionKey`                 | string  | -                       | 暗号化キー（設定するとデータを暗号化） |
| `clearInvalidConfig`            | boolean | false                   | 無効な設定を自動クリア                 |
| `watch`                         | boolean | false                   | ファイル変更を監視                     |
| `accessPropertiesByDotNotation` | boolean | true                    | ドット記法でのアクセス                 |

### ファイルパスの決定ロジック

```typescript
// electron-storeのデフォルトパス解決
const storePath = path.join(
  app.getPath("userData"), // ~/Library/Application Support/{app.name}/
  `${name}.json`, // skills.json
);
```

### 開発環境での挙動

- 開発モード（`electron-vite dev`）: `app.name` は `package.json` の `name` を使用
- 本番ビルド: `electron-builder.yml` の `productName` を使用

**現在の開発環境パス**:

```
~/Library/Application Support/@repo/desktop/skills.json
```

**本番ビルドでの想定パス**:

```
~/Library/Application Support/AI Workflow Orchestrator/skills.json
```

---

## 3. 設定評価

### 現在の設定の妥当性

| 項目             | 評価    | 理由                        |
| ---------------- | ------- | --------------------------- |
| `name: "skills"` | ✅ 適切 | スキル管理用として明確      |
| `defaults`       | ✅ 適切 | 空配列のデフォルト値は妥当  |
| `cwd` 未設定     | ⚠️ 注意 | 開発/本番で異なるパスになる |
| `schema` 未設定  | ⚠️ 推奨 | バリデーションがあると安全  |

### 推奨される追加設定

```typescript
const skillStore = new Store<SkillStoreSchema>({
  name: "skills",
  defaults: {
    importedSkillIds: [],
  },
  // 推奨: スキーマバリデーション
  schema: {
    importedSkillIds: {
      type: "array",
      items: { type: "string" },
      default: [],
    },
  },
  // 推奨: 無効な設定のクリア
  clearInvalidConfig: true,
});
```

---

## 4. 変更不要の判断

### 結論: 現在の設定は正常

Phase 1の調査結果から、設定自体に問題はないことが確認されている：

1. **ストアファイルは正常に作成されている**: `~/Library/Application Support/@repo/desktop/skills.json`
2. **データ構造は正しい**: `{"importedSkillIds": []}`
3. **キー名は一致している**: `importedSkillIds`

### 問題は設定ではなく検証不足

- ユニットテストがモックを使用しているため、実際のelectron-storeとの統合が未検証
- 設定変更ではなく、統合テストの追加で対応すべき

---

## 5. 補足: 将来の改善候補

### 5.1 スキーマバリデーションの追加（任意）

```typescript
schema: {
  importedSkillIds: {
    type: "array",
    items: { type: "string" },
    default: [],
  },
},
```

**メリット**:

- 不正なデータ形式を早期に検出
- 型安全性の向上

**デメリット**:

- 既存データとの互換性リスク
- 追加の依存関係（ajv）

### 5.2 開発/本番パスの統一（任意）

```typescript
const skillStore = new Store<SkillStoreSchema>({
  name: "skills",
  cwd: app.isPackaged
    ? undefined // 本番: デフォルト
    : path.join(process.cwd(), ".dev-data"), // 開発: プロジェクト内
  defaults: { importedSkillIds: [] },
});
```

**メリット**:

- 開発環境でのデータ追跡が容易
- 本番データとの分離

**デメリット**:

- 開発→本番でのデータ移行が必要
- 設定の複雑化

---

## 6. 本Phaseでの決定事項

| 項目         | 決定   | 理由                 |
| ------------ | ------ | -------------------- |
| 設定変更     | 不要   | 現在の設定は正常     |
| スキーマ追加 | 見送り | 本タスクのスコープ外 |
| パス統一     | 見送り | 本タスクのスコープ外 |

**本タスクの焦点**: 統合テストの追加による検証強化

---

## 7. 完了条件

- [x] electron-storeの設定項目を確認している
- [x] 現在の設定の妥当性を評価している
- [x] 設定変更の必要性を判断している（不要と判断）
- [x] 将来の改善候補を文書化している
