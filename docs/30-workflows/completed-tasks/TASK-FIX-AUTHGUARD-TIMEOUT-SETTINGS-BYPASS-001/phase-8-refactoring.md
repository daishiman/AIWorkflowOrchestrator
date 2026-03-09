# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| Phase      | 8                                              |
| Phase名    | リファクタリング                               |
| カテゴリ   | fix                                            |
| ステータス | pending                                        |
| 前提Phase  | Phase 7                                        |
| 後続Phase  | Phase 9                                        |

## 目的

実装されたコードの品質を改善する。機能変更なし、テスト結果変更なしを保証しながらリファクタリングを行う。

## 実行タスク

- タスク1: 実装コードの品質観点を棚卸しして改善候補を確定する
- タスク2: 機能を変えずにリファクタリングを適用する
- タスク3: リファクタリング後の回帰をテストで確認する

### タスク1: コード品質チェック

**目的**: 実装コードの品質を評価し、改善点を特定する

**チェックリスト**:

| 観点               | 確認内容                                                          | チェック |
| ------------------ | ----------------------------------------------------------------- | -------- |
| 型安全性           | `any` 型や `as` キャストがないこと                                | □        |
| 命名規約           | boolean は `is`/`has`/`can`/`should` プレフィックス               | □        |
| 定数管理           | マジックナンバー（10000ms）が名前付き定数として定義されていること | □        |
| コンポーネント設計 | Atomic Design 準拠（atoms/molecules/organisms）                   | □        |
| CSS                | CSS 変数使用、Tailwind arbitrary values の適切な使用              | □        |
| アクセシビリティ   | ARIA ラベル、role 属性の適切な設定                                | □        |
| re-export          | `index.tsx` からの再エクスポートが更新されていること              | □        |

### タスク2: リファクタリング実施

**目的**: 特定された改善点を修正する

**候補作業**:

1. **AuthTimeoutFallback の再エクスポート追加**
   - `index.tsx` に `export { AuthTimeoutFallback }` を追加

2. **AUTH_TIMEOUT_MS の配置確認**
   - 定数がテストからもインポート可能な位置にあること
   - `useAuthState.ts` からエクスポートされていること

3. **getAuthState の引数デフォルト値検討**
   - `isTimedOut` にデフォルト値 `false` を設定して後方互換を保つ可能性を検討
   - ただし、明示的に渡すことを強制する方が型安全（推奨）

4. **App.tsx の shell 切替整理**
   - `currentView === "settings"` bypass 追加による可読性への影響を確認
   - shell 切替意図が追いにくい場合のみ、Settings だけ bypass する理由を1行コメントで補足

### タスク3: テスト回帰確認

**目的**: リファクタリング後に全テストが PASS することを確認する

**手順**:

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/AuthGuard/
```

## 参照資料

| 参照資料           | パス                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| Phase 1 要件       | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-1-requirements.md`   |
| Phase 2 設計       | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-2-design.md`         |
| Phase 5 実装       | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-5-implementation.md` |
| Phase 6 テスト拡充 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-6-test-expansion.md` |
| Phase 7 カバレッジ | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-7-coverage-check.md` |
| コード品質ルール   | `.claude/rules/02-code-quality.md`                                                                           |

### システム仕様（aiworkflow-requirements）

> リファクタリング時に以下のシステム仕様との整合性を確認してください。

| 参照資料               | パス                                                                                        | 内容                                        |
| ---------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 実装パターン集         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | コード品質パターン・Atomic Design・命名規約 |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustandセレクタ設計の最適化パターン         |

## 統合テスト連携

- リファクタリング後のテスト全PASS確認が必須

## 成果物

| 成果物                     | パス           |
| -------------------------- | -------------- |
| リファクタリング済みコード | 各対象ファイル |

## 完了条件

- [ ] コード品質チェックリストが全項目確認済みであること
- [ ] リファクタリング内容が機能変更を含まないこと
- [ ] 全テストが PASS すること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 9: 品質検証へ進む。Lint・型チェック・全テスト実行を行う。
