# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                       |
| -------- | ------------------------ |
| Phase    | 6                        |
| 機能名   | TASK-9E-skill-fork       |
| タスク名 | スキルフォーク・派生機能 |
| 作成日   | 2026-02-28               |
| 前Phase  | Phase 5: 実装            |
| 次Phase  | Phase 7: カバレッジ確認  |

## 目的

Phase 5 の実装に対してテストを拡充し、ユニットテストカバレッジ目標（Line 80%+, Branch 60%+, Function 80%+）を達成する。エッジケース、エラーハンドリング、複数回連続フォーク等のシナリオを追加する。

## 実行タスク

- カバレッジ分析: Phase 5 実装後のカバレッジを測定し、不足領域を特定する
- エッジケーステスト追加: コピーフラグ組み合わせ、SKILL.md パース失敗、クリーンアップテストを追加する
- 連続フォークテスト追加: 同一スキルの複数回フォーク動作を確認する
- modifyAllowedTools テスト追加: allowedTools 更新の詳細テストを追加する

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テストカバレッジ基準

| 指標                       | 目標 |
| -------------------------- | ---- |
| IPC チャネルエンドポイント | 100% |
| 正常系シナリオ             | 100% |
| 異常系シナリオ             | 80%+ |

## 参照資料

| 資料名                   | パス                                                                                               | 説明                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Phase 5 実装成果物       | `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-5/implementation-summary.md`   | 依存実装の確認対象                      |
| Phase 5 実装コード       | `apps/desktop/src/main/services/skill/SkillForker.ts`                                              | テスト対象の本体                        |
| Phase 5 IPC ハンドラー   | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                       | `skill:fork` バリデーション分岐の確認元 |
| テスト品質基準           | `aiworkflow-requirements: quality-requirements.md`                                                 | カバレッジ目標値の根拠                  |
| コンポーネントテスト指針 | `aiworkflow-requirements: testing-component-patterns.md`                                           | テスト拡充パターン                      |
| IPC契約チェックリスト    | `aiworkflow-requirements: ipc-contract-checklist.md`                                               | P44/P45 契約整合性チェック              |
| TASK-9E 正本タスク仕様   | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-023f-task-9e-skill-fork.md` | 実装要件の正本                          |

## 実行手順

### ステップ1: カバレッジ測定

```bash
# カバレッジ測定（apps/desktop ディレクトリから実行 — P40対策）
cd apps/desktop && pnpm vitest run --coverage src/main/services/skill/__tests__/SkillForker.test.ts src/main/ipc/__tests__/skillHandlers.fork.test.ts
```

### ステップ2: ギャップ分析

- 未到達の行/分岐/関数を特定する
- 特に以下の領域でカバレッジ不足がないか確認する:
  - copyDirectory() の再帰処理分岐
  - modifySkillMd() の各フィールド更新パターン
  - fork() のエラーハンドリングパス
  - IPC ハンドラのバリデーション分岐

### ステップ3: 拡充テスト作成

#### 3-1. コピーフラグ組み合わせテスト

| テストケース                                           | 検証内容                                                 |
| ------------------------------------------------------ | -------------------------------------------------------- |
| copyAgents=false 時に agents/ がコピーされない         | agents/ ディレクトリが存在しても、フォーク先に含まれない |
| copyScripts=false 時に scripts/ がコピーされない       | scripts/ ディレクトリがフォーク先に含まれない            |
| copyAssets=false 時に assets/ がコピーされない         | assets/ ディレクトリがフォーク先に含まれない             |
| copyReferences=false 時に references/ がコピーされない | references/ ディレクトリがフォーク先に含まれない         |
| 全フラグ false でも SKILL.md はコピーされる            | SKILL.md は常にフォーク先に存在する                      |

#### 3-2. SKILL.md パース失敗時のエラーハンドリングテスト

| テストケース                          | 検証内容                                |
| ------------------------------------- | --------------------------------------- |
| SKILL.md に name フィールドがない場合 | パースエラーではなく、name が追加される |
| SKILL.md が不正な YAML の場合         | 適切なエラーメッセージが返される        |
| SKILL.md がバイナリデータの場合       | 適切なエラーメッセージが返される        |

#### 3-3. フォーク途中のクリーンアップテスト

| テストケース                                                     | 検証内容                                                                   |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| copyDirectory() でエラー時にフォーク先がクリーンアップされる     | 途中で FS エラーが発生した場合、不完全なフォーク先ディレクトリが削除される |
| writeForkMetadata() でエラー時にフォーク先がクリーンアップされる | メタデータ書き込み失敗時も、不完全なフォーク先が削除される                 |

#### 3-4. 複数回連続フォークテスト

| テストケース                                 | 検証内容                                                   |
| -------------------------------------------- | ---------------------------------------------------------- |
| 同一スキルを異なる名前で複数回フォークできる | skill-a → skill-b, skill-a → skill-c が独立して作成される  |
| フォーク元の変更がフォーク先に影響しない     | フォーク後にフォーク元を変更しても、フォーク先は変化しない |

#### 3-5. modifyAllowedTools テスト

| テストケース                                        | 検証内容                                        |
| --------------------------------------------------- | ----------------------------------------------- |
| modifyAllowedTools で既存 tools を上書きする        | 指定された tools リストで SKILL.md が更新される |
| modifyAllowedTools が空配列の場合                   | allowedTools セクションが空になる               |
| modifyAllowedTools 未指定の場合は元のまま保持される | allowedTools セクションが変更されない           |

### ステップ4: テスト再実行

```bash
# 全テスト再実行（apps/desktop ディレクトリから実行 — P40対策）
cd apps/desktop && pnpm vitest run --coverage src/main/services/skill/__tests__/SkillForker.test.ts src/main/ipc/__tests__/skillHandlers.fork.test.ts
```

## 統合テスト連携【必須】

| テストカテゴリ     | 検証項目                                                          | 目標 |
| ------------------ | ----------------------------------------------------------------- | ---- |
| IPC接続テスト      | skill:fork チャネルの全バリデーションパス                         | 100% |
| データフローテスト | fork → modifySkillMd → copyDirectory → writeForkMetadata の全パス | 100% |
| エラーハンドリング | FS エラー、パースエラー、バリデーションエラーの全分岐             | 80%+ |

## 多角的チェック観点

| 観点               | 適用判断 | 確認内容                                       |
| ------------------ | -------- | ---------------------------------------------- |
| セキュリティ       | 適用     | パストラバーサル攻撃を試みるスキル名でのテスト |
| エラーハンドリング | 適用     | クリーンアップ処理の確実な実行テスト           |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断 | 確認内容                         |
| -------------------- | -------- | -------------------------------- |
| バックエンド（Main） | 適用     | SkillForker のエッジケーステスト |
| IPC通信              | 適用     | バリデーション分岐の網羅的テスト |

## 成果物

| 成果物                | パス                                                                                     | 説明                  |
| --------------------- | ---------------------------------------------------------------------------------------- | --------------------- |
| カバレッジレポート    | `docs/30-workflows/completed-tasks/TASK-9E-skill-fork/outputs/phase-6/test-expansion.md` | カバレッジ分析結果    |
| 拡充テストコード      | `apps/desktop/src/main/services/skill/__tests__/SkillForker.test.ts`                     | 追加テストケース      |
| 拡充 IPC テストコード | `apps/desktop/src/main/ipc/__tests__/skillHandlers.fork.test.ts`                         | 追加 IPC テストケース |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] コピーフラグ組み合わせテスト（5件以上）が追加されている
- [ ] SKILL.md パース失敗テスト（3件以上）が追加されている
- [ ] クリーンアップテスト（2件以上）が追加されている
- [ ] 複数回連続フォークテスト（2件以上）が追加されている
- [ ] modifyAllowedTools テスト（3件以上）が追加されている
- [ ] 全テストが PASS している
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 5 実装コード）
2. カバレッジ測定とギャップ分析
3. コピーフラグ組み合わせテスト追加
4. SKILL.md パース失敗テスト追加
5. クリーンアップテスト追加
6. 複数回連続フォークテスト追加
7. modifyAllowedTools テスト追加
8. カバレッジ再測定と目標達成確認
9. 成果物の配置と完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-9E-skill-fork --phase 6
```

## 次のPhase

Phase 7: テストカバレッジ確認
