# Phase 9: 品質検証

## メタ情報

| 項目          | 内容                                                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 9                                                                                                                           |
| 機能名        | WorkspaceChatPanelへのインラインモデルセレクタ配置 (TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION)                           |
| 作成日        | 2026-03-21                                                                                                                  |
| 更新日        | 2026-03-23                                                                                                                  |
| 担当          | -                                                                                                                           |
| ステータス    | 完了                                                                                                                        |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-8-refactoring.md` |

## 目的

Lint・TypeScript型チェック・全テスト実行を行い、実装が品質基準を満たしていることを確認する。この Phase で発見された問題は修正してから Phase 10 へ進む。

## 実行タスク

### タスク1: Lint 実行

```bash
# プロジェクトルートから実行
pnpm --filter @repo/desktop lint

# または apps/desktop から
cd apps/desktop && pnpm lint
```

**確認項目**:

- ESLint エラーが 0 件であること
- 警告は可能な限り解消する（修正できない警告はコメントで理由を明記）

### タスク2: TypeScript 型チェック

```bash
# プロジェクトルートから実行
pnpm --filter @repo/desktop typecheck

# または apps/desktop から
cd apps/desktop && pnpm typecheck
```

**確認項目**:

- TypeScript エラーが 0 件であること
- `any` 型の使用がないこと
- `@ts-ignore` / `@ts-expect-error` を使用している場合は理由コメントがあること

### タスク3: 全テスト実行

```bash
# apps/desktopディレクトリから実行（P40対策）
cd apps/desktop

# WorkspaceView関連テスト（Phase 4/5/6 で作成したテストを含む）
pnpm vitest run src/renderer/views/WorkspaceView/

# apps/desktop 全テスト（リグレッションチェック）
pnpm vitest run
```

**確認項目**:

- Phase 4/5/6 で作成した全テスト（I-1〜I-6、E-1〜E-5）が PASS であること
- 既存テストがすべて PASS のままであること（リグレッションなし）

### タスク4: アクセシビリティチェック

```bash
# InlineModelSelectorのARIAラベル確認
grep -n "aria-" apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx
grep -n "aria-" apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx
```

**確認項目**:

- InlineModelSelector（compact）にARIAラベルが付与されていること
- ストリーミング中のdisabled状態がHTML `disabled` 属性で正しく伝達されていること
- GuidanceBlockにARIAロールが適切に設定されていること

### タスク5: 品質検証結果の記録

| チェック項目                     | 結果 | 備考 |
| -------------------------------- | ---- | ---- |
| Lint（エラー件数）               | -    | -    |
| TypeScript型チェック             | -    | -    |
| 新規テスト（I-1〜I-6, E-1〜E-5） | -    | -    |
| 既存テスト（リグレッション）     | -    | -    |
| アクセシビリティチェック         | -    | -    |

（Phase 9 実行時に記入）

## 参照資料

### コード品質ルール

| 資料名             | パス                                    |
| ------------------ | --------------------------------------- |
| コーディング規約   | `.claude/rules/02-code-quality.md`      |
| セキュリティルール | `.claude/rules/04-electron-security.md` |

### 前Phase成果物

| 資料名                   | パス                                                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Phase 8 リファクタリング | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-8-refactoring.md` |

### 既知の落とし穴

| 落とし穴ID | 説明                                   | 対策                                        |
| ---------- | -------------------------------------- | ------------------------------------------- |
| P40        | テスト実行ディレクトリ依存（モノレポ） | `cd apps/desktop && pnpm vitest run` で実行 |

## 実行手順

1. **タスク1の実施**: Lint を実行し、エラーを解消する
2. **タスク2の実施**: TypeScript 型チェックを実行し、エラーを解消する
3. **タスク3の実施**: 全テストを実行し、全て PASS であることを確認する
4. **タスク4の実施**: アクセシビリティチェックを実行する
5. **タスク5の実施**: 結果を記録する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                                                                    | 説明         |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------ |
| Phase 9 仕様書（本ファイル） | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-9-quality.md` | 品質検証結果 |

## サブタスク管理

Phase実行開始時に、TaskCreateツールで以下のサブタスクを作成すること:

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION --phase 9
```

## 完了条件

- [ ] Lint エラーが 0 件であることを確認した
- [ ] TypeScript 型チェックエラーが 0 件であることを確認した
- [ ] I-1 〜 I-6、E-1 〜 E-5 の全テストが PASS であることを確認した
- [ ] 既存テストのリグレッションがないことを確認した
- [ ] アクセシビリティチェックで ARIAラベルが適切に設定されていることを確認した
- [ ] タスク5の結果テーブルを記入した

## 次のPhase

Phase 10: 最終レビュー（`phase-10-final-review.md`）
