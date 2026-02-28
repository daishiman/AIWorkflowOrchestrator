# Phase 7: カバレッジ確認 - TASK-9I

## メタ情報

| 項目               | 値                                                                          |
| ------------------ | --------------------------------------------------------------------------- |
| タスクID           | TASK-9I                                                                     |
| Phase              | 7（カバレッジ確認）                                                         |
| 機能名             | TASK-9I-skill-docs                                                          |
| 作成日             | 2026-02-28                                                                  |
| 前提Phase          | phase-6-test-expansion.md                                                   |
| 目的               | カバレッジ基準（Line 80%+/Branch 60%+/Function 80%+）の達成を最終確認する。 |
| 成果物ディレクトリ | docs/30-workflows/TASK-9I-skill-docs/outputs/phase-7/                       |

## 目的

Phase 6 でテスト拡充した結果を最終測定し、カバレッジ基準の達成/未達を判定する。未達の場合は Phase 6 に戻ってテスト追加を行う。

## カバレッジ基準

| 指標              | 最低基準（ゲート） | 推奨基準 |
| ----------------- | ------------------ | -------- |
| Line Coverage     | 80%                | 90%      |
| Branch Coverage   | 60%                | 70%      |
| Function Coverage | 80%                | 90%      |

## 実行タスク

- 実行方針: カバレッジ測定 → ゲート判定 → 結果記録の順に実施する。

### Task 7-1: カバレッジ最終測定

**目的**: SkillDocGenerator と IPC ハンドラーのカバレッジを測定する

**実行手順**:

1. 以下のコマンドでカバレッジを測定する:
   ```bash
   cd apps/desktop && pnpm vitest run --coverage src/main/services/skill/SkillDocGenerator.test.ts src/main/ipc/skillHandlers.docs.test.ts
   ```
2. 以下の対象ファイルのカバレッジを記録する:
   - `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`
   - `apps/desktop/src/main/ipc/skillHandlers.ts`（registerSkillDocsHandlers 部分）
3. 結果を以下のフォーマットで記録する:

```markdown
## カバレッジ測定結果

### SkillDocGenerator.ts

| 指標     | 値  | 基準 | 判定      |
| -------- | --- | ---- | --------- |
| Line     | XX% | 80%  | PASS/FAIL |
| Branch   | XX% | 60%  | PASS/FAIL |
| Function | XX% | 80%  | PASS/FAIL |

### skillHandlers.ts（docs ハンドラー部分）

| 指標     | 値  | 基準 | 判定      |
| -------- | --- | ---- | --------- |
| Line     | XX% | 80%  | PASS/FAIL |
| Branch   | XX% | 60%  | PASS/FAIL |
| Function | XX% | 80%  | PASS/FAIL |
```

### Task 7-2: ゲート判定

**目的**: カバレッジ基準の達成/未達を判定する

**判定フロー**:

```
全ファイルの全指標が最低基準を達成
  ├── YES → PASS: Phase 8 へ進む
  └── NO  → FAIL: Phase 6 に戻る
```

**FAIL 時の対応**:

1. 未達の指標と対象ファイルを特定する
2. 未カバー行/ブランチ/関数をリストアップする
3. Phase 6 に戻り、不足テストを追加する
4. 再度 Phase 7 を実行する

**PASS 時の記録**:

1. 最終カバレッジ数値を `outputs/phase-7/coverage-report.md` に記録する
2. Phase 6 → Phase 7 のイテレーション回数を記録する（初回達成 or 差し戻し後の達成）

### Task 7-3: 型テストカバレッジ確認

**目的**: `packages/shared/src/types/skill-docs.ts` の型テストカバレッジを確認する

**実行手順**:

1. 以下のコマンドを実行する:
   ```bash
   cd packages/shared && pnpm vitest run --coverage src/types/__tests__/skill-docs.test.ts
   ```
2. 型定義ファイルのカバレッジを記録する（型定義のみのファイルのため、export された型が全てテストで参照されていることを確認）

### Task 7-4: P41 準拠のインライン関数カバレッジ確認

**目的**: v8 カバレッジプロバイダが独立カウントするインライン関数のカバレッジを確認する

**確認対象**:

| ファイル             | インライン関数                                | 確認方法                                                                         |
| -------------------- | --------------------------------------------- | -------------------------------------------------------------------------------- |
| skillHandlers.ts     | `getAllowedWindows: () => [mainWindow]`       | テストで `mockValidateIpcSender.mock.calls[i][2].getAllowedWindows()` を呼び出す |
| SkillDocGenerator.ts | `sections.map(s => ...)` 等の配列コールバック | テストでマッピング結果を検証する                                                 |

**実行手順**:

1. カバレッジレポートで Function Coverage が80%未満のファイルを特定する
2. 該当ファイルのインライン関数一覧を作成する
3. 各インライン関数がテスト経由で実行されていることを確認する
4. 未実行の場合は Phase 6 に戻り、テストを追加する

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                        | 内容                 |
| ------------------ | --------------------------------------------------------------------------- | -------------------- |
| 品質基準           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | カバレッジゲート定義 |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`       | エラーパステスト要件 |

### タスク固有参照

| 参照資料                 | パス                                                             | 内容                       |
| ------------------------ | ---------------------------------------------------------------- | -------------------------- |
| Phase 5 実装（サービス） | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`      | カバレッジ対象サービス実装 |
| Phase 5 実装（IPC）      | `apps/desktop/src/main/ipc/skillHandlers.ts`                     | カバレッジ対象 IPC 実装    |
| Phase 6 カバレッジ分析   | `outputs/phase-6/coverage-report.md`                             | ギャップ分析結果           |
| Phase 6 統合テスト結果   | `outputs/phase-6/integration-test.md`                            | テスト追加結果             |
| SkillDocGenerator テスト | `apps/desktop/src/main/services/skill/SkillDocGenerator.test.ts` | 拡充済みテストコード       |
| IPC テスト               | `apps/desktop/src/main/ipc/skillHandlers.docs.test.ts`           | 拡充済みIPCテスト          |

## 統合テスト連携

| 連携先Phase | 連携内容                                                                       |
| ----------- | ------------------------------------------------------------------------------ |
| Phase 6     | 未達時にPhase 6 へ差し戻し、テスト追加を指示する                               |
| Phase 8     | カバレッジ達成後、Phase 8 リファクタリングでテストが壊れないことをゲートとする |
| Phase 9     | 最終カバレッジ数値を Phase 9 品質レポートに引き継ぐ                            |

## 多角的チェック観点

| 観点               | 適用判断                                 | 仕様参照先                                       |
| ------------------ | ---------------------------------------- | ------------------------------------------------ |
| セキュリティ       | 対象限定（セキュリティパスのカバレッジ） | aiworkflow-requirements: security-\*.md          |
| UI/UX              | 非該当（Renderer 実装はスコープ外）      | -                                                |
| アーキテクチャ     | 対象限定（レイヤー間カバレッジ）         | aiworkflow-requirements: architecture-\*.md      |
| API設計            | 対象限定（IPC ハンドラーカバレッジ）     | aiworkflow-requirements: api-ipc-agent.md        |
| データ整合性       | 非該当（DB 変更なし）                    | -                                                |
| エラーハンドリング | 必須（エラーパスカバレッジ確認）         | aiworkflow-requirements: error-handling.md       |
| パフォーマンス     | 非該当（カバレッジ測定のみ）             | -                                                |
| テスタビリティ     | 必須（カバレッジ基準ゲート判定）         | aiworkflow-requirements: quality-requirements.md |

### Electronデスクトップアプリ観点

| 層                         | 適用判断                           | 仕様参照先                                         |
| -------------------------- | ---------------------------------- | -------------------------------------------------- |
| フロントエンド（Renderer） | 非該当（スコープ外）               | -                                                  |
| バックエンド（Main）       | 必須（サービスカバレッジ確認）     | aiworkflow-requirements: arch-electron-services.md |
| IPC通信                    | 必須（ハンドラーカバレッジ確認）   | aiworkflow-requirements: api-ipc-agent.md          |
| Preload/セキュリティ       | 対象限定（P41 インライン関数確認） | aiworkflow-requirements: security-api-electron.md  |
| ローカルストレージ         | 非該当（DB変更なし）               | -                                                  |

## 成果物

| 成果物                 | パス                                  | 説明                               |
| ---------------------- | ------------------------------------- | ---------------------------------- |
| カバレッジ最終レポート | `outputs/phase-7/coverage-report.md`  | 最終カバレッジ数値とゲート判定結果 |
| 統合テスト再実行結果   | `outputs/phase-7/integration-test.md` | テスト追加後の全テスト実行結果     |

## 完了条件

- [ ] SkillDocGenerator.ts の Line Coverage が80%以上
- [ ] SkillDocGenerator.ts の Branch Coverage が60%以上
- [ ] SkillDocGenerator.ts の Function Coverage が80%以上
- [ ] skillHandlers.ts（docs ハンドラー部分）の Line Coverage が80%以上
- [ ] skillHandlers.ts（docs ハンドラー部分）の Branch Coverage が60%以上
- [ ] skillHandlers.ts（docs ハンドラー部分）の Function Coverage が80%以上
- [ ] P41 準拠のインライン関数カバレッジが確認済み
- [ ] 全テストが PASS している
- [ ] カバレッジ数値が `outputs/phase-7/coverage-report.md` に記録されている
- [ ] ゲート判定（PASS/FAIL）が記録されている

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスク（4タスク）を100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json の Phase 7 ステータスが更新されている
- [ ] Phase 末端で完了状態を明記している

## 次の Phase

- **PASS**: Phase 8（リファクタリング）へ進む
- **FAIL**: Phase 6（テスト拡充）へ戻り、不足テストを追加する
