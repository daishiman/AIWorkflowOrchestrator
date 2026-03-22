# Phase 8: リファクタリング

## メタ情報

| 項目          | 内容                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------ |
| Phase番号     | 8                                                                                                |
| 機能名        | LLM設定永続化修正 (TASK-FIX-LLM-CONFIG-PERSISTENCE)                                              |
| 作成日        | 2026-03-20                                                                                       |
| 担当          | -                                                                                                |
| ステータス    | 未着手                                                                                           |
| 前Phase成果物 | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-7-coverage-check.md` |

## 目的

Phase 5 の実装をより安全・明確・保守しやすいコードに改善する。テストはすべてGREENのままで、コードの可読性と型安全性を向上させる。

## 実行タスク

### タスク1: コードレビュー観点

以下の観点でPhase 5 で実装したコードを見直す。

#### 1-1: 型安全性の向上

- `migrate` 関数の `persistedState: unknown` の型ナロイングが `in` 演算子を使っているか確認する（P49対策）

```typescript
// P49: as キャストを避け、in演算子でナロイング
// 悪い例
const safe = persistedState as object;

// 良い例（P49準拠）
const safe =
  persistedState != null && typeof persistedState === "object"
    ? persistedState
    : {};
```

#### 1-2: 関数の責務分離

- `validateAndSyncPersistedConfig` が単一責務になっているか確認する
- バリデーションロジックと同期ロジックが混在していないか確認する

#### 1-3: 命名の明確化

- `validateAndSyncPersistedConfig` の引数名が実際の値のセマンティクスと一致しているか確認する（P45対策）
- 変数名・関数名がその役割を明確に表現しているか確認する

#### 1-4: 重複コードの排除

- partialize関数の修正箇所と、型定義（`PersistedState`）で同じフィールドが重複していないか確認する
- 重複がある場合は定数か型から導出する形にリファクタリングする

#### 1-5: コメントの追加（必要な箇所のみ）

- P62対策のコメントを `validateAndSyncPersistedConfig` 内の `null` クリア箇所に追加する
- migrate関数のversion番号変更理由をコメントで明示する（「selectedProviderId, selectedModelId追加のため」）

### タスク2: リファクタリングの実施

タスク1で発見した問題点を修正する。

**前提**: テストがGREENであることを確認しながら小さく変更する。1回の変更ごとにテストを実行する。

```bash
# リファクタリング後のテスト実行（apps/desktopから）
cd apps/desktop
pnpm vitest run src/renderer/store/
```

### タスク3: TypeScript型チェック

```bash
# リファクタリング後の型チェック
cd apps/desktop
pnpm typecheck
```

### タスク4: Lint確認

```bash
# リファクタリング後のLint
cd apps/desktop
pnpm lint
```

## 参照資料

### コード品質ルール

| 資料名           | パス                               |
| ---------------- | ---------------------------------- |
| TypeScript型安全 | `.claude/rules/02-code-quality.md` |

### 既知の落とし穴

| 落とし穴ID | 説明                                     | 対策                                         |
| ---------- | ---------------------------------------- | -------------------------------------------- |
| P45        | IPC 引数命名の契約ドリフト               | 引数名がセマンティクスと一致しているか確認   |
| P49        | type predicate 内での `as` キャスト      | `in` 演算子でナロイング                      |
| P19        | 型キャスト（as）による実行時検証バイパス | `unknown` 型で受け取り、実行時バリデーション |

## 実行手順

1. **タスク1の実施**: コードレビューを行い、改善点をリストアップする
2. **タスク2の実施**: 発見した問題点を1つずつ修正し、その都度テストを実行する
3. **タスク3の実施**: TypeScript型チェックを実行する
4. **タスク4の実施**: Lintを実行する
5. **最終確認**: 全テストがGREENであることを確認する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                                             | 説明                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------- |
| Phase 8 仕様書（本ファイル） | `docs/30-workflows/completed-tasks/03-TASK-FIX-LLM-CONFIG-PERSISTENCE/phase-8-refactoring.md`    | リファクタリング計画書 |
| リファクタリング済みコード   | `apps/desktop/src/renderer/store/index.ts`, `apps/desktop/src/renderer/store/slices/llmSlice.ts` | 改善されたコード       |

## 完了条件

- [ ] タスク1のコードレビューを実施し、改善点をリストアップした
- [ ] P49対策（`as` キャストではなく `in` 演算子）が適用されている
- [ ] P45対策（引数名のセマンティクス一致）が確認された
- [ ] migrate関数にversionアップ理由のコメントが追加された
- [ ] validateAndSyncPersistedConfigのnullクリア箇所にP62対策コメントが追加された
- [ ] リファクタリング後のすべてのテストがGREENである
- [ ] TypeScript型チェックが通った
- [ ] Lintが通った

## 次Phase

Phase 9: 品質検証（`phase-9-quality-assurance.md`）
