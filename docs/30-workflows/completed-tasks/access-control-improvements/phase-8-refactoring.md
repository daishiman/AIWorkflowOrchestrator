# Phase 8: リファクタリング（TDD: Refactor） - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 8                           |
| Phase名    | リファクタリング            |
| 前提Phase  | Phase 7                     |
| 後続Phase  | Phase 9                     |
| ステータス | 未実施                      |
| 作成日     | 2026-01-18                  |
| 機能名     | access-control-improvements |

---

## 目的

TDDサイクルのRefactorフェーズとして、テストが成功する状態を維持しながらコード品質を向上させる。

## 背景

Phase 5-7で実装・テスト完了した認可チェック機能について、コードの品質向上リファクタリングを実施する。

---

## 実行タスク

### タスク1: コードの重複分析

**目的**: 認可チェックコード内の重複を特定する

**実行手順**:

1. 以下のファイルを分析する:
   - `packages/shared/src/features/chat-history/chat-history-service.ts`
   - `packages/shared/src/features/chat-history/errors.ts`

2. 重複箇所をリストアップする

**期待される成果物**: 重複分析結果

---

### タスク2: 定数・メッセージの抽出

**目的**: マジックストリングを定数化する

**実行手順**:

1. エラーメッセージを定数として抽出する
2. テストがGreen状態であることを確認する

**期待される成果物**: 定数定義

---

### タスク3: verifySessionOwnershipの改善

**目的**: 認可チェックヘルパーの可読性を向上させる

**実行手順**:

1. 早期リターンパターンの適用
2. ガード節の明確化
3. テストを実行して確認する

**期待される成果物**: 改善されたverifySessionOwnership

---

### タスク4: コードスタイル統一

**目的**: コーディングスタイルをプロジェクト規約に統一する

**実行手順**:

```bash
pnpm --filter @repo/shared lint
pnpm --filter @repo/shared format
pnpm --filter @repo/shared typecheck
```

**期待される成果物**: Lint/Format/TypeCheck成功結果

---

### タスク5: リファクタリング結果の記録

**目的**: リファクタリング内容を文書化する

**期待される成果物**: `outputs/phase-8/refactoring-report.md`

---

## 参照資料

| 参照資料     | パス                                                                | 内容           |
| ------------ | ------------------------------------------------------------------- | -------------- |
| Phase 5 実装 | `packages/shared/src/features/chat-history/chat-history-service.ts` | リファクタ対象 |

---

## 成果物

| 成果物                   | パス                                    | 内容                     |
| ------------------------ | --------------------------------------- | ------------------------ |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md` | リファクタリング内容記録 |

---

## 完了条件

- [ ] コードの重複が分析されている
- [ ] マジックストリングが定数化されている
- [ ] すべてのテストがGreen状態である
- [ ] Lint/Format/TypeCheckがパスしている
- [ ] リファクタリングレポートが作成されている

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
pnpm --filter @repo/shared test:run authorization

# 全chat-historyテスト実行
pnpm --filter @repo/shared test:run chat-history

# 統合テスト実行（存在する場合）
pnpm --filter @repo/shared test:run integration
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認
- [ ] 認可テストが継続成功する
- [ ] 既存テストにリグレッションがない

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）が完了していること
- **後続**: Phase 9（品質検証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/access-control-improvements/phase-9-quality.md`
