# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 8                                      |
| Phase名    | リファクタリング（TDD: Refactor）      |
| 前提Phase  | Phase 7（テストカバレッジ確認）        |
| 後続Phase  | Phase 9（品質保証）                    |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-25                             |
| 機能名     | TASK-3-2-skillexecutor-ipc-integration |

---

## 目的

TDDのRefactorフェーズとして、テストを維持しながらコードの品質を改善する。

## 背景

Phase 5〜7で実装とテストが完了した。本Phaseでは、コードの可読性・保守性・パフォーマンスを改善する。テストがあるため、リファクタリング後も動作が保証される。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コード品質分析

**目的**: リファクタリング対象を特定する

**実行手順**:

1. 静的解析を実行する

   ```bash
   pnpm --filter @repo/desktop lint
   pnpm --filter @repo/desktop typecheck
   ```

2. コード品質の問題を特定する

   | ファイル | 問題 | 優先度 |
   | -------- | ---- | ------ |
   |          |      |        |

3. リファクタリング計画を作成する

**期待される成果物**:

- `outputs/phase-8/refactoring-plan.md`

---

### タスク2: Preload APIリファクタリング

**目的**: skillAPIの実装を改善する

**実行手順**:

1. コードの重複を排除する
   - 共通のエラーハンドリングパターンを抽出
   - 型定義の整理

2. 命名の改善
   - 変数名・関数名が意図を明確に表しているか確認
   - 一貫性のある命名規則を適用

3. コメント・ドキュメントの追加
   - 公開APIにJSDocを追加
   - 複雑なロジックに説明コメントを追加

4. テストがパスすることを確認する

   ```bash
   pnpm --filter @repo/desktop test -- --grep "skillAPI"
   ```

**期待される成果物**:

- `apps/desktop/src/preload/skill-api.ts`（リファクタリング後）

---

### タスク3: React Hookリファクタリング

**目的**: useSkillExecutionの実装を改善する

**実行手順**:

1. 状態管理の最適化
   - 不要な再レンダリングの防止（useCallback、useMemo）
   - 状態の正規化

2. カスタムフックの分離（必要な場合）
   - 単一責任の原則に従って分離

3. エラーハンドリングの改善
   - エラー境界との連携
   - より詳細なエラー情報の提供

4. テストがパスすることを確認する

   ```bash
   pnpm --filter @repo/desktop test -- --grep "useSkillExecution"
   ```

**期待される成果物**:

- `apps/desktop/src/renderer/hooks/useSkillExecution.ts`（リファクタリング後）

---

### タスク4: UIコンポーネントリファクタリング

**目的**: SkillStreamDisplayの実装を改善する

**実行手順**:

1. コンポーネントの分割
   - 再利用可能な小さなコンポーネントに分割
   - 適切な責務分離

2. パフォーマンス最適化
   - React.memoの適用（必要な場合）
   - 仮想化（大量メッセージ対応）の検討

3. アクセシビリティの改善
   - ARIA属性の追加
   - キーボードナビゲーションの改善

4. スタイリングの整理
   - CSS/Tailwindクラスの整理
   - 一貫性のあるスタイリング

5. テストがパスすることを確認する

   ```bash
   pnpm --filter @repo/desktop test -- --grep "SkillStreamDisplay"
   ```

**期待される成果物**:

- `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`（リファクタリング後）

---

### タスク5: 全体テスト実行

**目的**: リファクタリング後も全てのテストがパスすることを確認する

**実行手順**:

1. 全テストを実行する

   ```bash
   pnpm --filter @repo/desktop test -- --grep "skillAPI|useSkillExecution|SkillStreamDisplay|Skill Stream Integration"
   ```

2. 全テストがパスすることを確認する

3. リファクタリング結果を記録する

**期待される成果物**:

- `outputs/phase-8/refactoring-results.md`

---

## 参照資料

| 参照資料         | パス           | 内容                 |
| ---------------- | -------------- | -------------------- |
| Phase 5実装      | 実装ファイル   | リファクタリング対象 |
| Phase 6〜7テスト | テストファイル | 動作保証             |
| コーディング規約 | `CLAUDE.md`    | プロジェクト規約     |

---

## 成果物

| 成果物                   | パス                                                                    | 内容               |
| ------------------------ | ----------------------------------------------------------------------- | ------------------ |
| リファクタリング計画     | `outputs/phase-8/refactoring-plan.md`                                   | 改善計画           |
| Preload API（改善）      | `apps/desktop/src/preload/skill-api.ts`                                 | リファクタリング後 |
| React Hook（改善）       | `apps/desktop/src/renderer/hooks/useSkillExecution.ts`                  | リファクタリング後 |
| UIコンポーネント（改善） | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx` | リファクタリング後 |
| リファクタリング結果     | `outputs/phase-8/refactoring-results.md`                                | 改善結果           |

---

## 完了条件

- [ ] コード品質分析が完了し、リファクタリング計画が作成されている
- [ ] Preload APIのリファクタリングが完了している
- [ ] React Hookのリファクタリングが完了している
- [ ] UIコンポーネントのリファクタリングが完了している
- [ ] 全てのテストがパスしている
- [ ] 全ての成果物が出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --grep "skillAPI|useSkillExecution|SkillStreamDisplay"
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 依存関係

- **前提**: Phase 7（テストカバレッジ確認）が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-2-skillexecutor-ipc-integration/phase-9-quality-assurance.md`
