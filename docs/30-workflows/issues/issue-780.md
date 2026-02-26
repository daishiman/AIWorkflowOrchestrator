# [#780] "[UT-STORE-HOOKS-ESLINT-RULE-001] 非推奨Hook使用を警告するESLintルール追加 No.779の後に実行する"

## メタ情報

```yaml
task_id: UT-STORE-HOOKS-ESLINT-RULE-001
task_name: 非推奨Hook使用を警告するESLintルール追加
category: 改善
target_feature: ESLint設定、開発ツール
priority: 中
scale: 小規模
status: 未実施
source_phase: Phase 12（UT-STORE-HOOKS-REFACTOR-001）
created_date: 2026-02-11
dependencies: []
spec_path: docs/30-workflows/completed-tasks/UT-STORE-HOOKS-REFACTOR-001/unassigned-tasks/task-ut-store-hooks-eslint-rule-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-STORE-HOOKS-REFACTOR-001で合成Hook（`useLLMStore`, `useSkillStore`, `useAuthModeStore`）を非推奨化し、個別セレクタHookへの移行を推進している。しかし、開発者が誤って非推奨Hookを使用するリスクが残存している。

### 1.2 問題点・課題

1. **開発者の認識不足**
   - 新規開発者は非推奨Hookの存在を知らずに使用する可能性
   - `@deprecated`コメントはIDEでしか警告されない
   - コードレビューでの見落としリスク

2. **非推奨警告の限界**
   - 現在の`console.warn`警告は実行時のみ
   - 開発環境でのみ表示され、ビルド時には検出不可
   - CI/CDパイプラインで検出できない

3. **対象の非推奨Hook**
   - `useLLMStore` (apps/desktop/src/renderer/store/index.ts)
   - `useSkillStore` (apps/desktop/src/renderer/store/index.ts)
   - `useAuthModeStore` (apps/desktop/src/renderer/store/index.ts)

### 1.3 放置した場合の影響

- 新規開発者が非推奨Hookを使用し、無限ループ問題が再発
- コードベースの一貫性低下
- 将来的な非推奨Hook削除が困難になる
- 技術的負債の蓄積

---

## 2. 何を達成するか（What）

### 2.1 目的

ESLintルールを追加し、非推奨Hook（`useLLMStore`, `useSkillStore`, `useAuthModeStore`）の使用をビルド時に検出・警告する。

### 2.2 最終ゴール

- ESLintが非推奨Hookの使用を警告する
- CI/CDパイプラインで非推奨Hook使用を検出できる
- 開発者が誤って非推奨Hookを使用した際に即座に気づける
- 代替Hookへの移行方法がエラーメッセージに含まれる

### 2.3 スコープ

#### 含むもの

- ESLintルールの設定追加
- 警告メッセージに代替Hookの情報を含める
- 既存コード（移行完了まで）は一時的にルールを無効化

#### 含まないもの

- カスタムESLintプラグインの開発
- 既存コードの自動修正
- 他のStore Hookへのルール適用

### 2.4 成果物

| 成果物                 | パス                           |
| ---------------------- | ------------------------------ |
| ESLint設定ファイル更新 | apps/desktop/eslint.config.mjs |
| （または）             | apps/desktop/.eslintrc.js      |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-STORE-HOOKS-REFACTOR-001が完了していること
- ESLintがプロジェクトで有効であること

### 3.2 依存タスク

| タスクID                    | 状態 | 依存内容                      |
| --------------------------- | ---- | ----------------------------- |
| UT-STORE-HOOKS-REFACTOR-001 | 完了 | 非推奨Hookの@deprecatedマーク |

### 3.3 必要な知識

- ESLint設定（`no-restricted-imports`, `no-restricted-syntax`）
- TypeScript/JavaScript ESLint構文

### 3.4 推奨アプローチ

`no-restricted-imports`ルールを使用して、特定のHookのインポートを警告する。

---

## 4. 実行手順

### Phase構成

本タスクは小規模のため、単一Phaseで実行可能。

### Phase 1: ESLintルール設定

#### Step 1: ESLint設定ファイルを特定

```bash
ls -la apps/desktop/eslint.config.* apps/desktop/.eslintrc.*
```

#### Step 2: no-restricted-importsルールを追加

```javascript
// eslint.config.mjs または .eslintrc.js
{
  rules: {
    "no-restricted-imports": [
      "warn",
      {
        paths: [
          {
            name: "@/renderer/store",
            importNames: ["useLLMStore", "useSkillStore", "useAuthModeStore"],
            message: "非推奨: 代わりに個別セレクタHook（useLLMProviders, useSelectedProviderId, useLLMActions等）を使用してください。詳細は06-known-pitfalls.md#P31を参照。"
          }
        ]
      }
    ]
  }
}
```

#### Step 3: 相対パスでのインポートも対象にする

```javascript
{
  rules: {
    "no-restricted-imports": [
      "warn",
      {
        paths: [
          {
            name: "@/renderer/store",
            importNames: ["useLLMStore", "useSkillStore", "useAuthModeStore"],
            message: "非推奨: 個別セレクタHookを使用してください。"
          },
          {
            name: "../store",
            importNames: ["useLLMStore", "useSkillStore", "useAuthModeStore"],
            message: "非推奨: 個別セレクタHookを使用してください。"
          },
          {
            name: "../../store",
            importNames: ["useLLMStore", "useSkillStore", "useAuthModeStore"],
            message: "非推奨: 個別セレクタHookを使用してください。"
          }
        ]
      }
    ]
  }
}
```

#### Step 4: 既存コードでの一時的な無効化（オプション）

既存コンポーネントが移行完了するまで、該当ファイルでルールを無効化：

```typescript
// eslint-disable-next-line no-restricted-imports
import { useLLMStore } from "@/renderer/store";
```

#### Step 5: lint実行して確認

```bash
pnpm --filter @repo/desktop lint
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ESLintルールが設定されている
- [ ] `useLLMStore`のインポートで警告が表示される
- [ ] `useSkillStore`のインポートで警告が表示される
- [ ] `useAuthModeStore`のインポートで警告が表示される
- [ ] 警告メッセージに代替Hookの情報が含まれている

### 品質要件

- [ ] ESLintが正常に動作する
- [ ] 既存のビルド・テストが通る
- [ ] CI/CDで検出できる

### ドキュメント要件

- [ ] ESLint設定の変更がコメントで説明されている
- [ ] 完了記録がLOGS.mdに追加されている

---

## 6. 検証方法

### 6.1 ローカル検証

```bash
# lint実行
pnpm --filter @repo/desktop lint

# 特定ファイルで検証
echo "import { useLLMStore } from '@/renderer/store';" > /tmp/test.ts
npx eslint /tmp/test.ts
```

### 6.2 CI検証

CIパイプラインで`pnpm lint`が実行されることを確認。

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                                  |
| -------------------------- | ------ | -------- | ------------------------------------- |
| 既存コードで大量の警告発生 | 低     | 高       | warnレベルで設定、段階的にerrorに移行 |
| ルール設定の誤りでlint失敗 | 中     | 低       | 設定追加後に即座にlint実行して確認    |
| 相対パスの漏れ             | 低     | 中       | パターンマッチングで広くカバー        |

---

## 8. 参照情報

### 関連ドキュメント

| 資料                         | パス                                                |
| ---------------------------- | --------------------------------------------------- |
| P31: 無限ループ問題          | .claude/rules/06-known-pitfalls.md                  |
| ESLint no-restricted-imports | https://eslint.org/docs/rules/no-restricted-imports |

---

## 9. 備考

### 発見元の原文

UT-STORE-HOOKS-REFACTOR-001 Phase 12 未タスク検出にて提案。

```
開発者が誤って非推奨の合成Hookを使用するのを防ぐため、
ESLintルールで警告を出すことが有効。
```

### 補足事項

- ルールレベルは最初は`warn`で開始し、UT-STORE-HOOKS-COMPONENT-MIGRATION-001完了後に`error`に変更することを推奨
- テストファイルでの使用（infiniteLoopPrevention.test.ts等）は意図的なため、テストファイルは除外設定を検討
- 将来的に非推奨Hookを完全削除する際の準備として有効
