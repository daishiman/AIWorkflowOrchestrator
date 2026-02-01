# Phase 8: リファクタリング（TDD: Refactor）- タスク仕様書

## メタ情報

| 項目      | 内容                                        |
| --------- | ------------------------------------------- |
| Phase     | 8                                           |
| Phase名   | リファクタリング                            |
| カテゴリ  | TDD-Refactor                                |
| 機能名    | TASK-7D-chatpanel-agent-integration         |
| 作成日    | 2026-01-31                                  |
| 前提Phase | Phase 1, Phase 2, Phase 5, Phase 6, Phase 7 |
| 後続Phase | Phase 9                                     |

## 目的

動作を変えずにコード品質を改善する。ChatPanel統合とSkillStreamingViewの実装を見直し、重複排除、命名改善、構造整理を行う。

## 実行タスク

### タスク1: コードスメル検出

**目的**: 問題のあるコードパターンを特定する。

**手順**:

1. ChatPanel.tsxの責務が適切に分離されているか確認する
2. SkillStreamingView.tsxのサブコンポーネント（StatusBadge, StreamMessageItem, ToolExecutionHistory）の分離が適切か確認する
3. 重複コードがないか確認する（特にStore取得パターン）
4. マジックナンバーやハードコードされた文字列がないか確認する

### タスク2: リファクタリング実施

**目的**: 特定したコードスメルを修正する。

**手順**:

1. 共通パターンの抽出（該当する場合）
2. 定数・設定値の分離（色マッピング、ラベル定義等）
3. コンポーネントの責務分離の改善（必要に応じてサブコンポーネント抽出）
4. 命名の改善（変数名、関数名が意図を明確に表しているか）

### タスク3: リファクタリング後のテスト確認

**目的**: リファクタリング後も全テストがPASSすることを確認する。

**手順**:

1. 全テスト実行:
   ```bash
   pnpm --filter @repo/desktop test
   ```
2. 型チェック:
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```
3. Lint:
   ```bash
   pnpm lint
   ```

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
pnpm --filter @repo/desktop test
```

## 成果物

| 成果物               | パス                                 | 種別     |
| -------------------- | ------------------------------------ | -------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | document |

## 完了条件

- [ ] コードスメルが検出・記録されている
- [ ] リファクタリングが実施されている（または不要と判断された場合はその理由を記録）
- [ ] 全テストが継続成功している
- [ ] TypeScript型チェックがエラーゼロ
- [ ] ESLint/PrettierがPASS
- [ ] 本Phase内の全タスクを100%実行完了

## TDD検証

```bash
pnpm --filter @repo/desktop test
# - [ ] リファクタリング後もテストが成功することを確認
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. タスク1: コードスメル検出
2. タスク2: リファクタリング実施
3. タスク3: リファクタリング後のテスト確認
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7D-chatpanel-agent-integration --phase 8
```

## 次のPhase

Phase 9: 品質保証 → [phase-9-quality.md](phase-9-quality.md)
