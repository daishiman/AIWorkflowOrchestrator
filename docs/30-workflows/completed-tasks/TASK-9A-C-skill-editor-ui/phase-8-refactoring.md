# Phase 8: リファクタリング（TDD: Refactor） — SkillEditor コンポーネント実装

## メタ情報

| 項目       | 値                             |
| ---------- | ------------------------------ |
| Phase      | 8                              |
| タスクID   | TASK-9A-C                      |
| 機能名     | skill-editor-ui                |
| タスク名   | SkillEditor コンポーネント実装 |
| 前提Phase  | Phase 7（カバレッジ確認）      |
| 後続Phase  | Phase 9（品質保証）            |
| ステータス | pending                        |
| 作成日     | 2026-02-19                     |

## 目的

Phase 5-7 で実装・テスト済みの SkillEditor 関連コンポーネント群のコード品質を、動作を変えずに改善する。重複排除、命名改善、SOLID 原則の適用、コンポーネント構造の整理を行い、保守性と可読性を向上させる。

## 実行タスク

- Task 1: コンポーネント構造の整理（Atomic Design 準拠）
- Task 2: 共通ユーティリティの抽出と重複排除
- Task 3: 型定義の整理と命名改善
- Task 4: エラーハンドリングパターンの統一
- Task 5: リファクタリング後の全テスト成功確認

## 参照資料

### タスク関連資料

| 資料名                     | パス                                                                                            | 説明                        |
| -------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------- |
| Phase 1 要件定義成果物     | `outputs/phase-1/`                                                                              | 要件・ユースケース・制約    |
| Phase 2 設計書             | `phase-2-design.md`                                                                             | コンポーネント設計・型設計  |
| Phase 5 実装成果物         | `outputs/phase-05/`                                                                             | 実装済みコード              |
| Phase 6 テスト拡充         | `phase-6-test-expansion.md`                                                                     | 境界値・異常系テスト方針    |
| Phase 7 カバレッジレポート | `outputs/phase-07/`                                                                             | カバレッジ結果              |
| タスク仕様書               | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-9a-c-skill-editor-ui.md` | 元仕様                      |
| アーキテクチャルール       | `.claude/rules/01-architecture.md`                                                              | Atomic Design・レイヤー方向 |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                                        | 説明                      |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | コンポーネント設計基準    |
| デザインシステム     | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | カラーパレット・余白基準  |
| アーキテクチャ概要   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | レイヤー構成・依存方向    |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 推奨パターン              |
| セキュリティAPI      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | Electron API セキュリティ |
| IPC セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC 通信セキュリティ原則  |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラー分類・処理基準      |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質基準定義              |

## 実行手順

### Task 1: コンポーネント構造の整理（Atomic Design 準拠）

#### 目的

SkillEditor 関連コンポーネントを Atomic Design 階層に従って整理し、各コンポーネントの責務を単一に保つ。

#### 確認観点

| 確認項目                                                  | 対応方針                                                                                                                                           |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| SkillCodeEditor が atoms/molecules のどちらに分類されるか | textarea ラッパーとして atoms に分類。language prop による表示切替のみを担当する                                                                   |
| FileTree が molecules/organisms のどちらに分類されるか    | ツリー構造のレンダリングを担当する molecules に分類。選択状態管理は親コンポーネントに委譲する                                                      |
| SkillEditor（メインコンポーネント）の責務が過大でないか   | organisms として状態管理（ファイル選択・読込・保存）とレイアウト構成を担当する。IPC 呼び出しロジックが肥大化している場合はカスタム Hook に抽出する |

#### 手順

1. `SkillEditor.tsx` 内にインライン定義されているサブコンポーネント（FileTree 等）がある場合、独立ファイルに分離する
2. SkillEditor の IPC 呼び出しロジック（ファイル読込・保存）が 10 行以上ある場合、`useSkillFileEditor` カスタム Hook に抽出する
3. 各コンポーネントファイルの先頭に `@description` JSDoc コメントを追加し、責務を1文で明記する

#### 期待される状態

```
apps/desktop/src/renderer/components/skill/
  SkillEditor.tsx          # organisms: レイアウト構成・状態管理
  SkillCodeEditor.tsx      # atoms: テキスト編集UI
  FileTree.tsx             # molecules: ファイルツリー表示（分離済みの場合）
  useSkillFileEditor.ts    # Hook: IPC呼び出しロジック（抽出した場合）
```

### Task 2: 共通ユーティリティの抽出と重複排除

#### 目的

`buildFileTree` と `getLanguage` ユーティリティ関数の配置を整理し、テスタビリティを確保する。

#### 確認観点

| 確認項目                                                   | 対応方針                                                           |
| ---------------------------------------------------------- | ------------------------------------------------------------------ |
| `buildFileTree` がコンポーネントファイル内に定義されている | `utils/fileTreeUtils.ts` に分離する                                |
| `getLanguage` がコンポーネントファイル内に定義されている   | `utils/languageUtils.ts` に分離する（または fileTreeUtils に統合） |
| 同一の拡張子→言語マッピングが複数箇所に存在する            | 定数オブジェクトとして1箇所に定義し、全箇所から参照する            |

#### 手順

1. `buildFileTree` 関数をコンポーネントファイルから分離し、純粋関数として `utils/` 配下に配置する
2. `getLanguage` 関数を同様に分離する
3. 拡張子→言語マッピングの定数（`EXTENSION_LANGUAGE_MAP`）を1箇所に定義する
4. 分離後、元のコンポーネントファイルから import に置き換える
5. 分離した関数のユニットテストが既存テストでカバーされていることを確認する

### Task 3: 型定義の整理と命名改善

#### 目的

コンポーネント Props 型と内部型の命名を統一し、可読性を向上させる。

#### 確認観点

| 確認項目                                                        | 対応方針                                                                                    |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Props 型名が `{コンポーネント名}Props` パターンに統一されている | 統一されていない場合はリネームする（例: `EditorProps` → `SkillCodeEditorProps`）            |
| FileTree ノードの型定義が明示されている                         | `FileTreeNode` 型を定義し、`children`, `name`, `path`, `isDirectory` フィールドを型付けする |
| boolean 変数名が `is`/`has`/`can`/`should` プレフィックスに従う | `loading` → `isLoading`、`saving` → `isSaving` のように修正する（未対応箇所がある場合）     |

#### 手順

1. 全 Props 型名を `{コンポーネント名}Props` パターンに統一する
2. FileTree のノード型が `any` や暗黙的な型の場合、明示的な `FileTreeNode` インターフェースを定義する
3. boolean 変数名を規約に従ってリネームする
4. 未使用の import を削除する

### Task 4: エラーハンドリングパターンの統一

#### 目的

IPC 呼び出し時のエラーハンドリングを統一パターンに整理する。

#### 確認観点

| 確認項目                                                     | 対応方針                                                                                     |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `console.error` で握りつぶしているエラーがある               | ユーザーに通知するためのエラー状態（`error` state）を追加し、UI にエラーメッセージを表示する |
| ファイル読込と保存のエラーハンドリングが異なるパターンである | 共通のエラーハンドリングパターン（try-catch + state 更新）に統一する                         |
| エラーメッセージがハードコード文字列である                   | エラーメッセージ定数を定義し、1箇所で管理する                                                |

#### 手順

1. エラー状態用の state（`error: string | null`）をコンポーネントまたはカスタム Hook に追加する
2. ファイル読込エラー時とファイル保存エラー時の処理を統一パターンに揃える
3. エラーメッセージ定数を定義する（例: `EDITOR_ERRORS.LOAD_FAILED`, `EDITOR_ERRORS.SAVE_FAILED`）
4. UI 上にエラーメッセージ表示領域を追加する（ツールバー下部にインラインで表示）

### Task 5: リファクタリング後の全テスト成功確認

#### 目的

リファクタリングによって既存の動作が変わっていないことを全テスト実行で確認する。

#### 手順

1. 以下のコマンドで全テストを実行する

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/
```

2. 全テストが PASS することを確認する
3. テストが FAIL した場合、リファクタリングによる非互換を修正する（テスト側ではなく実装側を修正する）

## 統合テスト連携【必須】

```bash
# リファクタリング後の全テスト実行
cd apps/desktop && pnpm vitest run src/renderer/components/skill/

# 確認項目
# - 全テストが PASS すること
# - テスト数が Phase 7 完了時と同一であること
```

## 多角的チェック観点

### 一般観点

| 観点               | 適用判断 | 仕様参照先                                                                                           |
| ------------------ | -------- | ---------------------------------------------------------------------------------------------------- |
| セキュリティ       | ○        | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                         |
| UI/UX              | ○        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                           |
| アーキテクチャ     | ○        | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                         |
| API設計            | ○        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`          |
| データ整合性       | △        | リファクタリングでデータ構造は変更しない                                                             |
| エラーハンドリング | ○        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                |
| パフォーマンス     | △        | リファクタリングで不要な再レンダリング導入を回避する                                                 |
| アクセシビリティ   | ○        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`（WCAG 2.1 AA セクション） |

### Electron デスクトップアプリ観点

| 層                         | 適用判断 | 仕様参照先                                                                   |
| -------------------------- | -------- | ---------------------------------------------------------------------------- |
| フロントエンド（Renderer） | ○        | コンポーネント構造・Atomic Design 階層の整理対象                             |
| バックエンド（Main）       | △        | リファクタリングで Main 側の変更は発生しない                                 |
| IPC通信                    | ○        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` |
| Preload/セキュリティ       | ○        | `.claude/rules/04-electron-security.md`                                      |
| ローカルストレージ         | △        | リファクタリングでストレージ処理は変更しない                                 |

## 成果物

| 成果物               | パス                                  | 説明                           |
| -------------------- | ------------------------------------- | ------------------------------ |
| リファクタリング記録 | `outputs/phase-08/refactoring-log.md` | 変更内容・理由・影響範囲の記録 |

## 完了条件

- [ ] コンポーネント構造が Atomic Design 階層に従って整理されている
- [ ] `buildFileTree` と `getLanguage` が独立したユーティリティファイルに分離されている
- [ ] Props 型名が `{コンポーネント名}Props` パターンに統一されている
- [ ] boolean 変数名が `is`/`has`/`can`/`should` プレフィックスに従っている
- [ ] エラーハンドリングが統一パターンに整理されている
- [ ] 重複コード（拡張子マッピング、エラーメッセージ）が排除されている
- [ ] 全テストが PASS している（テスト数が Phase 7 完了時と同一）
- [ ] `outputs/phase-08/refactoring-log.md` が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

| サブタスクID | タスク名                             | ステータス | 備考 |
| ------------ | ------------------------------------ | ---------- | ---- |
| 8-1          | コンポーネント構造の整理             | pending    | -    |
| 8-2          | 共通ユーティリティの抽出と重複排除   | pending    | -    |
| 8-3          | 型定義の整理と命名改善               | pending    | -    |
| 8-4          | エラーハンドリングパターンの統一     | pending    | -    |
| 8-5          | リファクタリング後の全テスト成功確認 | pending    | -    |

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] Task 1（コンポーネント構造の整理）を実行した
- [ ] Task 2（共通ユーティリティの抽出と重複排除）を実行した
- [ ] Task 3（型定義の整理と命名改善）を実行した
- [ ] Task 4（エラーハンドリングパターンの統一）を実行した
- [ ] Task 5（リファクタリング後の全テスト成功確認）を実行した
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] 上記すべてのタスクが完了していることを確認した

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-9A-C-skill-editor-ui --phase 8
```

## TDD検証

```bash
# リファクタリング後のテスト実行コマンド
cd apps/desktop && pnpm vitest run src/renderer/components/skill/

# 確認項目
# - [ ] リファクタリング後も全テストが成功することを確認
# - [ ] テスト数が Phase 7 完了時と同一であることを確認
```

## 次の Phase

Phase 9: 品質保証
