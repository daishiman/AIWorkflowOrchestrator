# Phase 9: 品質保証 — SkillEditor コンポーネント実装

## メタ情報

| 項目       | 値                             |
| ---------- | ------------------------------ |
| Phase      | 9                              |
| タスクID   | TASK-9A-C                      |
| 機能名     | skill-editor-ui                |
| タスク名   | SkillEditor コンポーネント実装 |
| 前提Phase  | Phase 8（リファクタリング）    |
| 後続Phase  | Phase 10（最終レビュー）       |
| ステータス | pending                        |
| 作成日     | 2026-02-19                     |

## 目的

SkillEditor 関連コンポーネントの品質基準を全項目で満たすことを検証する。Lint エラー 0 件、TypeScript 型エラー 0 件、全テスト PASS、セキュリティチェック合格を確認し、Phase 10 の最終レビューに進む準備を整える。

## 実行タスク

- Task 1: ESLint 全エラー解消
- Task 2: TypeScript 型チェック エラー 0 件確認
- Task 3: 全テスト（ユニット・統合）成功確認
- Task 4: セキュリティチェック（IPC チャンネル名定数化・入力バリデーション）
- Task 5: アクセシビリティチェック（WCAG 2.1 AA 準拠）
- Task 6: コードコメント・未完了マーカー検索

## 参照資料

### タスク関連資料

| 資料名                     | パス                                    | 説明                  |
| -------------------------- | --------------------------------------- | --------------------- |
| Phase 5 実装成果物         | `outputs/phase-05/`                     | 実装コード            |
| Phase 7 カバレッジレポート | `outputs/phase-07/`                     | カバレッジ結果        |
| Phase 8 リファクタ記録     | `outputs/phase-08/refactoring-log.md`   | リファクタリング内容  |
| セキュリティルール         | `.claude/rules/04-electron-security.md` | IPC セキュリティ原則  |
| コード品質ルール           | `.claude/rules/02-code-quality.md`      | TypeScript 型安全基準 |

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                                        | 説明                      |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------- |
| UIコンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                     | コンポーネント設計基準    |
| デザインシステム     | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                  | UI/UX 基準                |
| アーキテクチャ概要   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | レイヤー構成・依存方向    |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 推奨パターン              |
| セキュリティAPI      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | Electron API セキュリティ |
| IPC セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC 通信セキュリティ原則  |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラー分類・処理基準      |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質基準定義              |

## 品質ゲート

| 品質項目               | 基準                                         | 確認方法                                                                       |
| ---------------------- | -------------------------------------------- | ------------------------------------------------------------------------------ |
| ESLint                 | エラー 0 件                                  | `pnpm lint`                                                                    |
| TypeScript 型チェック  | エラー 0 件                                  | `pnpm typecheck`                                                               |
| ユニットテスト         | 全テスト PASS                                | `cd apps/desktop && pnpm vitest run src/renderer/components/skill/`            |
| カバレッジ（Line）     | 80% 以上（推奨 90%）                         | `cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/` |
| カバレッジ（Branch）   | 60% 以上（推奨 70%）                         | 同上                                                                           |
| カバレッジ（Function） | 80% 以上（推奨 90%）                         | 同上                                                                           |
| IPC チャンネル名       | 全チャンネル名が `IPC_CHANNELS` 定数経由     | grep 検索                                                                      |
| コードコメント         | TODO/FIXME/HACK/XXX 0 件（テストコード含む） | grep 検索                                                                      |
| アクセシビリティ       | WCAG 2.1 AA 準拠                             | ARIA ラベル・キーボード操作確認                                                |

## 実行手順

### Task 1: ESLint 全エラー解消

#### 目的

対象ファイル群の ESLint エラーを 0 件にする。

#### 手順

1. 以下のコマンドで対象ファイルの Lint チェックを実行する

```bash
pnpm lint
```

2. エラーが検出された場合、以下の優先順位で修正する
   - 自動修正可能なエラー: `pnpm lint --fix` で一括修正
   - 手動修正が必要なエラー: 個別に修正
3. 修正後、再度 `pnpm lint` を実行し、エラー 0 件を確認する

#### 対象ファイル

| ファイルパス                                                         | 説明                           |
| -------------------------------------------------------------------- | ------------------------------ |
| `apps/desktop/src/renderer/components/skill/SkillEditor.tsx`         | メインコンポーネント           |
| `apps/desktop/src/renderer/components/skill/SkillCodeEditor.tsx`     | コードエディター               |
| `apps/desktop/src/renderer/components/skill/FileTree.tsx`            | ファイルツリー（存在する場合） |
| `apps/desktop/src/renderer/components/skill/useSkillFileEditor.ts`   | カスタム Hook（存在する場合）  |
| `apps/desktop/src/renderer/components/skill/utils/*.ts`              | ユーティリティ（存在する場合） |
| `apps/desktop/src/renderer/components/skill/__tests__/*.test.ts{,x}` | テストファイル                 |

### Task 2: TypeScript 型チェック エラー 0 件確認

#### 目的

プロジェクト全体の TypeScript 型チェックでエラー 0 件を確認する。

#### 手順

1. 以下のコマンドで型チェックを実行する

```bash
pnpm typecheck
```

2. エラーが検出された場合、以下の観点で修正する
   - `any` 型の使用箇所を具体的な型に置換する
   - 型アサーション（`as`）の使用を最小限にする（使用する場合は理由コメントを付与する）
   - `@ts-ignore` / `@ts-expect-error` の使用箇所がある場合、根本原因を解消する
3. 修正後、再度 `pnpm typecheck` を実行し、エラー 0 件を確認する

#### 重点確認項目

| 確認項目                                                     | 確認方法                        |
| ------------------------------------------------------------ | ------------------------------- |
| `window.electronAPI.skill.readFile` の戻り値型が正しい       | preload/types.ts との整合性確認 |
| `window.electronAPI.skill.writeFile` の引数型が正しい        | preload/types.ts との整合性確認 |
| `ImportedSkill` 型が `@repo/shared` からインポートされている | import 元の確認                 |
| `SkillSubResource` 型の使用箇所で型不整合がない              | コンポーネント Props との照合   |

### Task 3: 全テスト（ユニット・統合）成功確認

#### 目的

全テストが PASS し、カバレッジ基準を満たすことを確認する。

#### 手順

1. SkillEditor 関連テストを実行する

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/
```

2. 全テストが PASS することを確認する
3. カバレッジレポートを生成する

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/
```

4. 以下のカバレッジ基準を確認する

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

5. 基準未達の場合、Phase 6 に戻りテストを追加する

### Task 4: セキュリティチェック

#### 目的

IPC セキュリティ原則への準拠を確認する。

#### 手順

1. IPC チャンネル名がハードコード文字列ではなく `IPC_CHANNELS` 定数経由で参照されていることを確認する

```bash
# ハードコード文字列の検出（該当があれば修正が必要）
cd apps/desktop && grep -rn "safeInvoke\|safeOn" src/renderer/components/skill/ | grep -v "IPC_CHANNELS"
```

2. Renderer から Node.js API を直接使用していないことを確認する

```bash
# Node.js API 直接使用の検出（該当があれば修正が必要）
cd apps/desktop && grep -rn "require(\|fs\.\|path\.\|child_process" src/renderer/components/skill/
```

3. 入力値のバリデーション確認

| 確認項目                                           | 確認内容                                                      |
| -------------------------------------------------- | ------------------------------------------------------------- |
| ファイルパスにパストラバーサル文字列が含まれないか | `selectedFile` の値に `..` が含まれていないことを検証している |
| 保存するコンテンツのサイズ制限があるか             | 巨大ファイルの書き込み防止策が実装されている                  |
| ファイル拡張子のホワイトリストがあるか             | 許可された拡張子のみ編集可能である                            |

4. エラーメッセージに内部情報（ファイルパス、スタックトレース）が含まれていないことを確認する

### Task 5: アクセシビリティチェック（WCAG 2.1 AA 準拠）

#### 目的

キーボード操作とスクリーンリーダー対応を確認する。

#### 手順

| 確認項目                                                 | 確認方法                                                         |
| -------------------------------------------------------- | ---------------------------------------------------------------- |
| ファイルツリーの各項目に `role` 属性が付与されている     | `role="treeitem"` または `role="option"` の存在確認              |
| 保存ボタン・閉じるボタンに `aria-label` が付与されている | ボタン要素の ARIA 属性確認                                       |
| テキストエリアに `aria-label` が付与されている           | `<textarea>` 要素の ARIA 属性確認                                |
| Tab キーでフォーカス移動が可能である                     | ファイルツリー → エディター → ボタン の順序でフォーカス移動可能  |
| コントラスト比が 4.5:1 以上である                        | テキスト色（`#1D1D1F`）と背景色（`#FFFFFF`）のコントラスト比確認 |
| 「未保存」バッジが色だけでなくテキストで情報を伝えている | 色覚多様性への対応確認                                           |

### Task 6: コードコメント・未完了マーカー検索

#### 目的

未完了のマーカーコメントが残っていないことを確認する。

#### 手順

1. 以下のコマンドで TODO/FIXME/HACK/XXX コメントを検索する

```bash
cd apps/desktop && grep -rn "TODO\|FIXME\|HACK\|XXX" src/renderer/components/skill/
```

2. 該当がある場合、以下の判断基準で対応する
   - 対応済みのマーカー: コメントを削除する
   - 未対応だが本タスクスコープ外: 未タスク仕様書に記録し、コメントは残さず削除する
   - 未対応で本タスクスコープ内: Phase 5 に戻って対応する

## 統合テスト連携【必須】

| 品質項目          | 確認内容                            | 結果   |
| ----------------- | ----------------------------------- | ------ |
| ESLint            | エラー 0 件                         | 未測定 |
| TypeScript        | エラー 0 件                         | 未測定 |
| テスト            | 全テスト PASS                       | 未測定 |
| Line Coverage     | 80% 以上                            | 未測定 |
| Branch Coverage   | 60% 以上                            | 未測定 |
| Function Coverage | 80% 以上                            | 未測定 |
| IPC セキュリティ  | ハードコード文字列 0 件             | 未測定 |
| Node.js 直接使用  | 0 件                                | 未測定 |
| コードコメント    | TODO/FIXME/HACK/XXX 0 件            | 未測定 |
| アクセシビリティ  | ARIA ラベル付与・キーボード操作可能 | 未測定 |

## 多角的チェック観点

### 一般観点

| 観点               | 適用判断 | 仕様参照先                                                                                           |
| ------------------ | -------- | ---------------------------------------------------------------------------------------------------- |
| セキュリティ       | ○        | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                         |
| UI/UX              | ○        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                           |
| アーキテクチャ     | ○        | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                         |
| API設計            | ○        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`          |
| データ整合性       | △        | 品質保証フェーズではデータ構造変更なし                                                               |
| エラーハンドリング | ○        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                |
| パフォーマンス     | △        | カバレッジ計測時にパフォーマンス劣化がないことを確認                                                 |
| アクセシビリティ   | ○        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`（WCAG 2.1 AA セクション） |

### Electron デスクトップアプリ観点

| 層                         | 適用判断 | 仕様参照先                                                                   |
| -------------------------- | -------- | ---------------------------------------------------------------------------- |
| フロントエンド（Renderer） | ○        | ESLint・型チェック・アクセシビリティの検証対象                               |
| バックエンド（Main）       | △        | 品質保証フェーズでは Main 側の変更は発生しない                               |
| IPC通信                    | ○        | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` |
| Preload/セキュリティ       | ○        | `.claude/rules/04-electron-security.md`                                      |
| ローカルストレージ         | △        | 品質保証フェーズではストレージ処理は変更しない                               |

## 成果物

| 成果物       | パス                                | 説明                                           |
| ------------ | ----------------------------------- | ---------------------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 全品質項目の検証結果と測定値を記録したレポート |

## 完了条件

- [ ] ESLint エラー 0 件
- [ ] TypeScript 型チェック エラー 0 件
- [ ] 全テストが PASS
- [ ] Line Coverage 80% 以上
- [ ] Branch Coverage 60% 以上
- [ ] Function Coverage 80% 以上
- [ ] IPC チャンネル名がすべて `IPC_CHANNELS` 定数経由
- [ ] Renderer から Node.js API を直接使用していない
- [ ] TODO/FIXME/HACK/XXX コメント 0 件
- [ ] ARIA ラベルが必要な要素すべてに付与されている
- [ ] キーボード操作で全機能にアクセス可能
- [ ] `outputs/phase-9/quality-report.md` が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

| サブタスクID | タスク名                                | ステータス | 備考 |
| ------------ | --------------------------------------- | ---------- | ---- |
| 9-1          | ESLint 全エラー解消                     | pending    | -    |
| 9-2          | TypeScript 型チェック エラー 0 件確認   | pending    | -    |
| 9-3          | 全テスト（ユニット・統合）成功確認      | pending    | -    |
| 9-4          | セキュリティチェック                    | pending    | -    |
| 9-5          | アクセシビリティチェック（WCAG 2.1 AA） | pending    | -    |
| 9-6          | コードコメント・未完了マーカー検索      | pending    | -    |

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] Task 1（ESLint 全エラー解消）を実行した
- [ ] Task 2（TypeScript 型チェック エラー 0 件確認）を実行した
- [ ] Task 3（全テスト成功確認）を実行した
- [ ] Task 4（セキュリティチェック）を実行した
- [ ] Task 5（アクセシビリティチェック）を実行した
- [ ] Task 6（コードコメント・未完了マーカー検索）を実行した
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] 上記すべてのタスクが完了していることを確認した

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-9A-C-skill-editor-ui --phase 9
```

## 次の Phase

Phase 10: 最終レビューゲート
