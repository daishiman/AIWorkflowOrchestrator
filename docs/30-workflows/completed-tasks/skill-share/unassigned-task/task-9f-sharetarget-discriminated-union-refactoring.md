# TASK-9F ShareTarget 型改善 - タスク指示書

## メタ情報

| 項目         | 内容                                    |
| ------------ | --------------------------------------- |
| タスクID     | UT-9F-DISCRIMINATED-UNION-001           |
| タスク名     | `ShareTarget` の Discriminated Union 化 |
| 分類         | リファクタリング                        |
| 対象機能     | TASK-9F スキル共有・インポート機能      |
| 優先度       | 低                                      |
| 見積もり規模 | 中規模                                  |
| ステータス   | 未実施                                  |
| 発見元       | Phase 10 MINOR-06                       |
| 発見日       | 2026-02-27                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

要件/設計では union 前提だったが、実装は optional フラット型で完了した。

### 1.2 問題点・課題

`type` ごとに必須項目が型で保証されず、呼び出し側の補完性と可読性が低い。

### 1.3 放置した場合の影響

将来拡張時に型安全性が低下し、ランタイムバリデーション依存が強くなる。

---

## 2. 何を達成するか（What）

### 2.1 目的

`ShareTarget` を `type` 識別子付き union に変更し、型絞り込みを有効化する。

### 2.2 最終ゴール

- `ShareTargetGitHub` / `Gist` / `URL` / `Local` の4型を導入
- switch 分岐で型絞り込みが機能

### 2.3 スコープ

#### 含むもの

- shared 型定義の再設計
- Main/Preload/テストの型追従

#### 含まないもの

- 実行時バリデーションの削除

### 2.4 成果物

- `packages/shared/src/types/skill-share.ts` 更新
- 型追従修正一式

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- shared 型変更が desktop 側へ波及することを認識する

### 3.2 依存タスク

- 依存なし

### 3.3 必要な知識

- TypeScript Discriminated Union
- P32（shared/preload 同期）

### 3.4 推奨アプローチ

型変更を先に実施し、コンパイルエラーを追って各層を順次修正する。

---

## 4. 実行手順

### Phase構成

- Phase A: 型定義刷新
- Phase B: 実装追従
- Phase C: 回帰検証

### Phase A: 型定義刷新

#### 目的

`ShareTarget` を union へ置換する。

#### 手順

1. 4つの個別型を定義する。
2. `type ShareTarget = ...` を union 化する。

#### 成果物

`skill-share.ts` 更新。

#### 完了条件

shared 型が union 前提でビルド可能。

### Phase B: 実装追従

#### 目的

型変更に合わせて Main/Preload を更新する。

#### 手順

1. `SkillShareManager` の分岐を型安全に修正する。
2. `skillHandlers.share` と preload 型参照を修正する。
3. テストの型注釈を更新する。

#### 成果物

型追従コミット相当の差分。

#### 完了条件

型エラーが解消される。

### Phase C: 回帰検証

#### 目的

動作保証を確認する。

#### 手順

1. 該当テスト実行。
2. typecheck 実行。

#### 成果物

検証ログ。

#### 完了条件

テスト/型チェックともに PASS。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `ShareTarget` が Discriminated Union になっている
- [ ] `type` ごとの必須項目が型で保証される

### 品質要件

- [ ] Main/Preload/shared の型同期が取れている
- [ ] 既存テストが PASS

### ドキュメント要件

- [ ] interfaces/task-workflow へ型方針変更を記録

---

## 6. 検証方法

### テストケース

- 4種 source.type の型チェック
- 既存 import/export/validate フロー回帰

### 検証手順

1. `pnpm --filter @repo/shared typecheck`
2. `pnpm --filter @repo/desktop typecheck`
3. `pnpm --filter @repo/desktop test:run -- src/main/ipc/__tests__/skillHandlers.share.test.ts`

---

## 7. リスクと対策

| リスク                 | 影響度 | 発生確率 | 対策                                  |
| ---------------------- | ------ | -------- | ------------------------------------- |
| 型変更の波及範囲が広い | 中     | 中       | 型エラー駆動で段階修正する            |
| 実行時検証との二重管理 | 低     | 中       | 型は開発時保証、実行時はP42で役割分離 |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-share/outputs/phase-1/requirements-definition.md`
- `docs/30-workflows/skill-share/outputs/phase-10/final-review-result.md`

### 参考資料

- `.claude/rules/06-known-pitfalls.md#P32`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

`MINOR-06: ShareTarget Discriminated Union 未適用`

### 補足事項

型安全性向上が主目的であり、機能追加タスクではない。
