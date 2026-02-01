# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 8                               |
| 機能名 | TASK-IMP-permission-history-001 |
| 作成日 | 2026-01-31                      |

## 目的

動作を変えずにコード品質を改善する。重複排除、命名改善、構造整理を行う。

## 実行タスク

- 重複排除: permissionHistory.ts内のユーティリティ関数とpermissionDescriptions.tsのアイコンマッピング間の重複を確認・排除
- 命名改善: 変数名・関数名の一貫性確認（既存PermissionSettings・PermissionDialogの命名規則に合わせる）
- コンポーネント構造整理: PermissionHistoryPanel/Filter/Itemの責務分離が適切か確認
- Store構造整理: permissionHistorySliceの状態構造がStore-directパターンに従っているか確認
- 型安全性強化: as型アサーションの排除、型ガードの追加

## 参照資料

| 資料名     | パス                                         | 説明           |
| ---------- | -------------------------------------------- | -------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | Phase 1成果物  |
| 設計書     | `outputs/phase-2/architecture-design.md`     | Phase 2成果物  |
| 実装コード | Phase 5で作成した各実装ファイル              | リファクタ対象 |

## 実行手順

### 1. リファクタリング候補の特定

以下の観点でリファクタリング対象を特定:

| 観点           | 確認箇所                                                              |
| -------------- | --------------------------------------------------------------------- |
| 重複コード     | permissionHistory.tsとpermissionDescriptions.ts間のアイコンマッピング |
| 命名一貫性     | 既存PermissionSettings/PermissionDialogとの命名パターン比較           |
| 責務分離       | Panel/Filter/Itemの各コンポーネントが単一責務を満たしているか         |
| 型安全性       | any型使用箇所、型アサーション箇所                                     |
| パフォーマンス | useMemoの依存配列、不要な再レンダリング                               |

### 2. リファクタリング実施

各候補に対してリファクタリングを実施。テスト成功を維持しながら段階的に改善。

### 3. テスト再実行

```bash
pnpm --filter @repo/desktop test
```

## 統合テスト連携【必須】

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test
```

リファクタリング前後でテスト結果が変化しないことを確認する。

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                         | 仕様参照先                                             |
| -------------- | -------------------------------- | ------------------------------------------------------ |
| アーキテクチャ | コード構造改善のため適用         | `aiworkflow-requirements: arch-state-management.md`    |
| セキュリティ   | safeString()使用箇所の整理確認   | `aiworkflow-requirements: security-skill-execution.md` |
| UI/UX          | コンポーネント構造改善のため適用 | `aiworkflow-requirements: ui-ux-settings.md`           |
| パフォーマンス | useMemo最適化のため適用          | -                                                      |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断               | 仕様参照先                                          |
| -------------------------- | ---------------------- | --------------------------------------------------- |
| フロントエンド（Renderer） | コンポーネント構造改善 | `aiworkflow-requirements: ui-ux-settings.md`        |
| ローカルストレージ         | 永続化コード品質改善   | `aiworkflow-requirements: arch-state-management.md` |

## 成果物

| 成果物               | パス                                 | 説明           |
| -------------------- | ------------------------------------ | -------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | 改善内容の記録 |

## 完了条件

- [ ] テストが継続成功（リファクタリング前後で結果が変化しない）
- [ ] 重複コードが排除されている
- [ ] 命名が既存パターンと一貫している
- [ ] 各コンポーネントの責務が明確に分離されている
- [ ] any型・型アサーションが排除されている
- [ ] 不要な再レンダリングがuseMemoで防止されている
- [ ] ESLint警告が0件
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-history-001 --phase 8
```

## 次のPhase

Phase 9: 品質保証
