# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 8                                |
| Phase名    | リファクタリング（TDD Refactor） |
| 前提Phase  | Phase 7（カバレッジ確認）        |
| 後続Phase  | Phase 9（品質保証）              |
| ステータス | 未実施                           |
| 作成日     | 2026-01-22                       |
| 機能名     | React Context DI実装             |

---

## 目的

TDDのRefactor（品質改善）フェーズとして、テストを維持しながらコード品質を向上させる。

## 背景

Phase 5〜7で機能実装とテストが完了した。本Phaseでは、コードの可読性、保守性、パフォーマンスを改善するリファクタリングを行う。テストが全てパスし続けることを確認しながら進める。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: コード品質分析

**目的**: 現状のコード品質を分析し、改善点を特定する。

**実行手順**:

1. ESLintで静的解析を実行:

   ```bash
   pnpm --filter @repo/desktop lint apps/desktop/src/features/chat-history/
   ```

2. 以下の観点で分析:

   | 観点               | 確認項目                                     |
   | ------------------ | -------------------------------------------- |
   | 命名規則           | 変数・関数・型名が意図を明確に表現しているか |
   | 関数の長さ         | 関数が長すぎないか（20行以内推奨）           |
   | 重複コード         | DRY原則に違反していないか                    |
   | 型安全性           | any型を使用していないか                      |
   | エラーハンドリング | 適切にエラーを処理しているか                 |

3. 分析結果を `outputs/phase-8/code-quality-analysis.md` に記録

**期待される成果物**:

- `outputs/phase-8/code-quality-analysis.md`

---

### タスク2: 命名・構造改善

**目的**: 変数名、関数名、ファイル構造を改善する。

**実行手順**:

1. 以下の命名規則を確認・適用:

   | 種別           | 規則             | 例                        |
   | -------------- | ---------------- | ------------------------- |
   | コンポーネント | PascalCase       | `ChatHistoryProvider`     |
   | Hook           | use + PascalCase | `useChatHistory`          |
   | 型/Interface   | PascalCase       | `ChatHistoryContextValue` |
   | 定数           | UPPER_SNAKE_CASE | `DEFAULT_TITLE`           |
   | 関数           | camelCase        | `createUseCases`          |

2. 改善が必要な箇所を修正
3. テストを実行して全てパスすることを確認
4. 改善内容を `outputs/phase-8/naming-improvements.md` に記録

**期待される成果物**:

- `outputs/phase-8/naming-improvements.md`

---

### タスク3: 重複コード削除

**目的**: 重複コードを抽出し、共通化する。

**実行手順**:

1. 重複パターンを特定:
   - テストコードのセットアップ処理
   - モックの作成処理
   - エラーハンドリングパターン

2. 共通ユーティリティを作成（必要な場合）:
   - テスト用ヘルパー関数
   - 共通型定義

3. テストを実行して全てパスすることを確認
4. 重複削除内容を `outputs/phase-8/duplication-removal.md` に記録

**期待される成果物**:

- `outputs/phase-8/duplication-removal.md`

---

### タスク4: パフォーマンス最適化検討

**目的**: パフォーマンス最適化の必要性を検討する。

**実行手順**:

1. 以下の観点で検討:

   | 観点        | 確認項目                           |
   | ----------- | ---------------------------------- |
   | useMemo     | 高コスト計算をメモ化しているか     |
   | useCallback | 関数参照が安定しているか           |
   | Context分割 | 不要な再レンダリングを防いでいるか |
   | 遅延初期化  | 重い初期化を遅延させているか       |

2. 現時点での最適化は最小限に留める（YAGNI原則）
3. 将来の最適化候補を `outputs/phase-8/performance-notes.md` に記録

**期待される成果物**:

- `outputs/phase-8/performance-notes.md`

---

### タスク5: JSDoc/コメント整理

**目的**: ドキュメントコメントを整理し、コードの理解を助ける。

**実行手順**:

1. 以下のコメント規則を適用:

   | 対象           | コメント規則                    |
   | -------------- | ------------------------------- |
   | 公開関数       | JSDocで目的・引数・戻り値を記述 |
   | 複雑なロジック | inline コメントで意図を説明     |
   | TODO/FIXME     | 課題追跡のためのマーカー        |
   | 型定義         | 各プロパティの説明              |

2. 不要なコメントを削除
3. 整理内容を `outputs/phase-8/documentation-cleanup.md` に記録

**期待される成果物**:

- `outputs/phase-8/documentation-cleanup.md`

---

### タスク6: リファクタリング完了確認

**目的**: リファクタリング後にテストが全て成功することを確認する。

**実行手順**:

1. 全テストを実行:

   ```bash
   pnpm --filter @repo/desktop test -- --run apps/desktop/src/features/chat-history/
   ```

2. カバレッジを確認（目標維持）:

   ```bash
   pnpm --filter @repo/desktop test -- --coverage apps/desktop/src/features/chat-history/
   ```

3. 結果を `outputs/phase-8/refactoring-result.md` に記録

**期待される成果物**:

- `outputs/phase-8/refactoring-result.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> リファクタリング時に以下のシステム仕様を参照し、仕様準拠を確認してください。

| 参照資料             | パス                                                                             | 内容                   |
| -------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| アーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | Clean Architecture構成 |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`   | 型定義・Repository IF  |

### 前Phase成果物

| 参照資料   | パス                              | 内容            |
| ---------- | --------------------------------- | --------------- |
| ゲート判定 | `outputs/phase-7/gate-verdict.md` | Phase 7判定結果 |

---

## 成果物

| 成果物               | パス                                       | 内容         |
| -------------------- | ------------------------------------------ | ------------ |
| コード品質分析       | `outputs/phase-8/code-quality-analysis.md` | 品質分析結果 |
| 命名改善             | `outputs/phase-8/naming-improvements.md`   | 命名規則改善 |
| 重複削除             | `outputs/phase-8/duplication-removal.md`   | DRY原則適用  |
| パフォーマンスノート | `outputs/phase-8/performance-notes.md`     | 最適化候補   |
| ドキュメント整理     | `outputs/phase-8/documentation-cleanup.md` | コメント整理 |
| リファクタ結果       | `outputs/phase-8/refactoring-result.md`    | 最終確認結果 |

---

## 統合テスト連携（Phase 8は必須）

リファクタ後の統合テスト継続成功を確認:

- 統合テストが全て成功すること
- カバレッジ目標を維持していること
- テスト実行時間が大幅に増加していないこと

---

## 完了条件

- [ ] タスク1: コード品質分析完了
- [ ] タスク2: 命名・構造改善完了
- [ ] タスク3: 重複コード削除完了
- [ ] タスク4: パフォーマンス最適化検討完了
- [ ] タスク5: JSDoc/コメント整理完了
- [ ] タスク6: リファクタリング完了確認（全テスト成功）
- [ ] 全成果物が `outputs/phase-8/` に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証（Phase 8）

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --run apps/desktop/src/features/chat-history/
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/react-context-di/phase-9-quality.md`
