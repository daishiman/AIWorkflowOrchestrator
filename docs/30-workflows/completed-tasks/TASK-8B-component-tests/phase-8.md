# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 8                            |
| タスク | TASK-8B コンポーネントテスト |
| 機能名 | skill-import-agent-system    |
| 作成日 | 2026-02-01                   |

## 目的

テストコードの品質を改善する。テストの動作を変えずに、重複排除、共通ヘルパー抽出、命名改善を行う。

## 実行タスク

- テストコード重複排除: 4テストファイル間の共通パターン抽出
- テストヘルパー統合: テストデータファクトリの共通モジュール化
- 命名改善: テストケース名の統一・明確化
- コードスメル修正: 不要なimport、未使用変数の除去

## 参照資料

| 資料名             | パス                                 | 説明          |
| ------------------ | ------------------------------------ | ------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | Phase 7成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス                                                                        | 内容           |
| -------- | --------------------------------------------------------------------------- | -------------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | コード品質基準 |

## 実行手順

### ステップ1: テストコードの分析

4テストファイル間で以下のパターンを特定:

| 分析対象             | 確認ポイント                                                    |
| -------------------- | --------------------------------------------------------------- |
| Store モックパターン | `vi.mock` + `mockReturnValue` が全ファイルで重複していないか    |
| テストデータ         | `SkillMetadata`, `PermissionRequest` 等の定義が重複していないか |
| ユーティリティ       | `userEvent.setup()` パターンが統一されているか                  |
| beforeEach処理       | `clearAllMocks` パターンが統一されているか                      |

### ステップ2: 共通テストヘルパーの抽出

重複が見つかった場合、以下のヘルパーを検討:

```typescript
// apps/desktop/src/renderer/components/skill/__tests__/helpers.ts（検討）

// テストデータファクトリ
export function createMockSkillMetadata(overrides?: Partial<SkillMetadata>): SkillMetadata { ... }
export function createMockPermissionRequest(overrides?: Partial<SkillPermissionRequest>): SkillPermissionRequest { ... }
export function createMockStreamMessage(type: string, content: any): SkillStreamMessage { ... }

// デフォルトStore状態
export function createDefaultSkillStoreState(overrides?: Partial<SkillSliceState>): SkillSliceState { ... }
```

**判断基準**: 3つ以上のテストファイルで同一パターンが使用されている場合のみ抽出する。無理な抽象化は行わない。

### ステップ3: テストケース名の統一

| 改善対象              | 改善前例                      | 改善後例                                     |
| --------------------- | ----------------------------- | -------------------------------------------- |
| 日本語・英語混在      | `should render with no skill` | 全テストで統一（英語 or 日本語に統一）       |
| 曖昧な名前            | `should work correctly`       | `should call selectSkill("name") on click`   |
| Given/When/Then不明確 | `test button`                 | `should disable cancel button during import` |

### ステップ4: リファクタリング後のテスト実行

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test -- --run src/renderer/components/skill/__tests__/

# カバレッジが維持されていることを確認
pnpm --filter @repo/desktop test -- --run --coverage src/renderer/components/skill/__tests__/
```

## 統合テスト連携【必須】

リファクタリング後の統合テスト継続成功を確認:

```bash
pnpm --filter @repo/desktop test -- --run src/renderer/components/skill/__tests__/
```

## 多角的チェック観点（AIが判断）

| 観点             | 適用判断                          | 確認項目                                         |
| ---------------- | --------------------------------- | ------------------------------------------------ |
| UI/UX            | テストリファクタリング → **適用** | リファクタリングがUI検証品質を維持しているか     |
| アクセシビリティ | a11yテスト維持 → **適用**         | a11yテストがリファクタリング後も正しく機能するか |
| セキュリティ     | テストコードのみ → **適用外**     | -                                                |
| パフォーマンス   | テスト実行速度 → **限定的適用**   | リファクタリング後もテスト実行時間が10秒以内か   |

### Electronデスクトップアプリ観点

| 観点                       | 適用判断                          | 確認項目                                       |
| -------------------------- | --------------------------------- | ---------------------------------------------- |
| フロントエンド（Renderer） | UIコンポーネントテスト → **適用** | Renderer Process内のテスト品質が向上しているか |
| バックエンド（Main）       | テスト対象外 → **適用外**         | -                                              |
| IPC通信                    | Storeレベルでモック → **適用外**  | -                                              |
| Preload/セキュリティ       | テスト対象外 → **適用外**         | -                                              |
| ローカルストレージ         | テスト対象外 → **適用外**         | -                                              |

## 成果物

| 成果物               | パス                                                              | 説明               |
| -------------------- | ----------------------------------------------------------------- | ------------------ |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md`                              | 変更内容の記録     |
| テストファイル       | `apps/desktop/src/renderer/components/skill/__tests__/*.test.tsx` | リファクタリング後 |

## 完了条件

- [ ] 全テストが継続成功している（テスト数が減少していない）
- [ ] カバレッジが維持されている（Phase 7と同等以上）
- [ ] テストコードの重複が削減されている
- [ ] テストケース名が統一されている
- [ ] 不要なimport/変数が除去されている
- [ ] リファクタリングログが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
pnpm --filter @repo/desktop test -- --run src/renderer/components/skill/__tests__/

# 確認項目
# - [ ] リファクタリング後もテストが全て成功することを確認
# - [ ] カバレッジが低下していないことを確認
```

## サブタスク管理

1. テストコード分析（重複パターンの特定）
2. 共通ヘルパー抽出の判断・実装
3. テストケース名の統一
4. コードスメル修正
5. 全テスト再実行と成功確認
6. カバレッジ維持確認
7. 成果物の作成・配置

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/TASK-8B-component-tests --phase 8
```

## 次のPhase

Phase 9: 品質保証
