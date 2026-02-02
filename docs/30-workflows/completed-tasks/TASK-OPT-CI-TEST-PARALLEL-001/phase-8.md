# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                      |
| ------ | ----------------------- |
| Phase  | 8                       |
| 機能名 | CI テスト並列実行最適化 |
| 作成日 | 2026-02-02              |

## 目的

動作を変えずにCI設定とVitest設定のコード品質を改善する。

## 実行タスク

### Task 1: ci.yml のリファクタリング

**改善項目**:

| 項目             | 改善内容                                 |
| ---------------- | ---------------------------------------- |
| 重複コードの排除 | 共通ステップのreusable workflowsへの抽出 |
| コメントの追加   | 各セクションの目的を明記                 |
| 変数の整理       | 環境変数・マトリクス変数の命名統一       |
| インデントの統一 | YAML構造の可読性向上                     |

**具体的な改善例**:

```yaml
# 改善前: 各ジョブで重複するセットアップ
- name: Setup pnpm
  uses: pnpm/action-setup@v4
- name: Setup Node.js
  uses: actions/setup-node@v6
  with:
    node-version: "22"
    cache: "pnpm"
# 改善後: アンカーを使用した共通化（YAMLアンカーは複雑なため、コメントで共通化意図を明記）
# NOTE: 以下のセットアップは全ジョブで共通
# 将来的にreusable workflowsへの移行を検討
```

### Task 2: Vitest設定のリファクタリング

**改善項目**:

| 項目               | 改善内容                           |
| ------------------ | ---------------------------------- |
| 環境変数の型安全性 | process.env.CIの明示的な型チェック |
| コメントの追加     | 設定値の根拠を明記                 |
| 設定値の定数化     | マジックナンバーの排除             |

**具体的な改善例**:

```typescript
// 改善前
maxForks: process.env.CI ? 4 : 2,

// 改善後
// CI環境では4並列、ローカルでは2並列
// 根拠: GitHub Actionsランナー（2コア、8GB RAM）でのI/O待ち時間活用
const CI_MAX_FORKS = 4;
const LOCAL_MAX_FORKS = 2;
maxForks: process.env.CI ? CI_MAX_FORKS : LOCAL_MAX_FORKS,
```

### Task 3: ドキュメントコメントの追加

**追加項目**:

1. ci.ymlの各ジョブの目的と依存関係
2. vitest.config.tsの各設定値の根拠
3. キャッシュキー設計の説明

## 参照資料

| 資料名           | パス                            | 説明          |
| ---------------- | ------------------------------- | ------------- |
| 変更後CI設定     | `.github/workflows/ci.yml`      | Phase 5成果物 |
| 変更後Vitest設定 | `apps/desktop/vitest.config.ts` | Phase 5成果物 |

## 統合テスト連携【必須】

**リファクタ後の統合テスト継続成功を確認**:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test:run

# CI設定の構文検証
npx yaml-lint .github/workflows/ci.yml
```

## 成果物

| 成果物             | パス                            | 説明               |
| ------------------ | ------------------------------- | ------------------ |
| リファクタ後CI設定 | `.github/workflows/ci.yml`      | 品質改善済みCI設定 |
| リファクタ後Vitest | `apps/desktop/vitest.config.ts` | 品質改善済み設定   |

## 完了条件

- [ ] ci.ymlの重複コードが整理されている
- [ ] コメントが追加され可読性が向上している
- [ ] Vitest設定の設定値が定数化されている
- [ ] テストが継続成功している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 9: 品質保証
