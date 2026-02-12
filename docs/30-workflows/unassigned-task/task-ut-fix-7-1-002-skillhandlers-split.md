# skillHandlers.ts機能別分割 - タスク指示書

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | UT-FIX-7-1-002                                 |
| タスク名     | skillHandlers.ts機能別分割                     |
| 分類         | リファクタリング                               |
| 対象機能     | Skill System / IPC Handlers                    |
| 優先度       | 低                                             |
| 見積もり規模 | 中規模（2-4時間）                              |
| ステータス   | 未実施                                         |
| issue_number | 776                                            |
| 発見元       | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION Phase 12 |
| 発見日       | 2026-02-12                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-7-1（executeSkillのSkillExecutor委譲実装）の実装過程で、`skillHandlers.ts`（454行）が複数の責務を担っていることが確認された。このファイルは単一責務原則（SRP）に違反しており、保守性と可読性の改善余地がある。

### 1.2 問題点・課題

`skillHandlers.ts` は以下の複数の責務を1ファイルで担っている:

| 責務                    | 行範囲（概算） | 説明                                          |
| ----------------------- | -------------- | --------------------------------------------- |
| SkillExecutor生成・管理 | 29-44行        | モジュールレベル変数でインスタンス管理        |
| 基本スキル操作ハンドラ  | 46-186行       | list/scan/getImported/import/remove/getDetail |
| スキル実行ハンドラ      | 188-261行      | execute/abort/getStatus                       |
| スキル改善ハンドラ      | 264-430行      | analyze/improve/optimize/variants/evaluate    |
| ハンドラ解除            | 436-454行      | unregisterSkillHandlers                       |

- **ファイルサイズ**: 454行は IPC ハンドラファイルとしては大きく、変更時の影響範囲把握が困難
- **テストの複雑化**: 全ハンドラが1ファイルに集約されているため、テストファイルも肥大化する
- **責務の混在**: スキル改善（TASK-9C）のサービスインスタンス生成が registerSkillHandlers 内で行われており、DI の一貫性が低い

### 1.3 放置した場合の影響

- 新しいスキル関連ハンドラ追加時にファイルがさらに肥大化する
- 変更時の影響範囲が不明確になり、回帰バグのリスクが増加
- テストファイルの肥大化により、テストの保守コストが増加

---

## 2. 何を達成するか（What）

### 2.1 目的

`skillHandlers.ts` を責務別に分割し、単一責務原則に準拠させる。

### 2.2 最終ゴール

- 機能別に3-4ファイルに分割されている
- 各ファイルが単一責務を担っている
- 既存のテストが全てPASSする
- `registerSkillHandlers` のエントリポイントは維持される

### 2.3 スコープ

#### 含むもの

- `skillHandlers.ts` の機能別ファイル分割
- 分割後の各ファイルのテスト整理
- エントリポイント（`registerSkillHandlers`/`unregisterSkillHandlers`）の維持

#### 含まないもの

- IPC ハンドラのロジック変更
- 新規機能の追加
- 他の IPC ハンドラファイルのリファクタリング
- DI パターンの変更（別タスクで対応）

### 2.4 成果物

| 成果物                       | 説明                                                           |
| ---------------------------- | -------------------------------------------------------------- |
| skillHandlers.ts（エントリ） | 各サブモジュールを統合するエントリポイント                     |
| skillCrudHandlers.ts         | 基本操作ハンドラ（list/scan/import/remove/getDetail）          |
| skillExecuteHandlers.ts      | 実行関連ハンドラ（execute/abort/getStatus）                    |
| skillImproveHandlers.ts      | 改善関連ハンドラ（analyze/improve/optimize/variants/evaluate） |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION が完了していること
- `skillHandlers.ts` の現行テストが全てPASSしていること

### 3.2 依存タスク

| タスクID                              | 関係 | 状況 |
| ------------------------------------- | ---- | ---- |
| TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION | 先行 | 完了 |

### 3.3 必要な知識

| 知識領域             | 参照先                                                                 |
| -------------------- | ---------------------------------------------------------------------- |
| IPC セキュリティ原則 | `.claude/rules/04-electron-security.md`                                |
| IPC チャンネル設計   | `references/security-skill-ipc.md`                                     |
| 単一責務原則         | `.claude/rules/01-architecture.md`                                     |
| テストファイル構成   | 既存テストファイル（`__tests__/skillHandlers.*.ts`）                   |
| 実装教訓             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |

### 3.4 推奨アプローチ

```
分割前:
apps/desktop/src/main/ipc/
  skillHandlers.ts              (454行)
  __tests__/
    skillHandlers.test.ts
    skillHandlers.execute.test.ts
    skillHandlers.delegate.test.ts
    skillHandlers.integration.test.ts
    skillIpc.integration.test.ts

分割後:
apps/desktop/src/main/ipc/
  skillHandlers.ts              (エントリ - 約30行)
  skillCrudHandlers.ts          (基本操作 - 約160行)
  skillExecuteHandlers.ts       (実行関連 - 約100行)
  skillImproveHandlers.ts       (改善関連 - 約200行)
  __tests__/
    （既存テストは変更せずそのまま動作することを確認）
```

### 3.5 TASK-FIX-7-1からの実装課題と教訓

TASK-FIX-7-1（executeSkillのSkillExecutor委譲実装）で得られた教訓を以下に記録する。本タスク実施時に参照すること。

#### 課題1: テストモックの大規模修正（lessons-learned.md 苦戦箇所2から）

| 項目                 | 内容                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**             | SkillExecutorのSetter Injection追加に伴い、既存5テストファイル全てにmockSkillExecutorを追加する必要があった                                       |
| **影響範囲**         | skillHandlers.test.ts, skillHandlers.execute.test.ts, skillHandlers.delegate.test.ts, skillIpc.integration.test.ts, SkillService.delegate.test.ts |
| **解決策**           | 各テストファイルにmockSkillExecutorを定義し、beforeEachでリセット                                                                                 |
| **本タスクへの影響** | skillHandlers.ts分割時に各テストファイルのimportパス修正とモック構成の見直しが必要。分割前に全テストファイルのモック依存関係を調査すること        |

#### 課題2: DI パターンの一貫性（lessons-learned.md 苦戦箇所1から）

| 項目                 | 内容                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **課題**             | skillHandlers.ts内でSkillExecutorの生成とSkillServiceへのSetter Injectionが行われている（行29-44）                                  |
| **原因**             | SkillExecutorはBrowserWindowを必要とし、registerSkillHandlers実行時点でのみ生成可能                                                 |
| **本タスクへの影響** | ファイル分割時にSkillExecutor生成・DI設定をどのファイルに配置するか設計判断が必要。推奨: skillHandlers.ts（エントリポイント）に残す |

#### 課題3: モジュールレベル変数の管理

| 項目                 | 内容                                                                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| **課題**             | `_skillExecutorInstance` がモジュールレベル変数として管理されている                                            |
| **本タスクへの影響** | 分割後の各サブモジュール間でインスタンス共有が必要。エントリポイントファイルで管理し、引数で渡すパターンを推奨 |

---

## 4. 実行手順

### Phase構成

Phase 1-13の標準ワークフローに従う。

### Phase 1: 要件定義

#### 目的

分割方針と各ファイルの責務を明確化する。

#### 手順

1. 現在のハンドラ一覧と責務を整理
2. 分割先ファイルと各ハンドラの対応を決定
3. 共有インスタンス（`_skillExecutorInstance` 等）の管理方針を決定

#### 完了条件

- [ ] ハンドラ一覧と分割先が決定されている
- [ ] 共有インスタンス管理方針が決定されている

### Phase 5: 実装

#### 目的

ファイル分割の実施。

#### 手順

1. `skillCrudHandlers.ts` を作成し、基本操作ハンドラを移動
2. `skillExecuteHandlers.ts` を作成し、実行関連ハンドラを移動
3. `skillImproveHandlers.ts` を作成し、改善関連ハンドラを移動
4. `skillHandlers.ts` を各サブモジュールの呼び出しに変更
5. `unregisterSkillHandlers` も同様に分割
6. 既存テスト実行で回帰がないことを確認
7. `pnpm typecheck` と `pnpm lint` で品質確認

#### 完了条件

- [ ] 4ファイルに分割されている
- [ ] 既存テストが全てPASS
- [ ] 型チェック・LintがPASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `skillHandlers.ts` がエントリポイントとして各サブモジュールを統合している
- [ ] 基本操作・実行・改善のハンドラが個別ファイルに分割されている
- [ ] `registerSkillHandlers` / `unregisterSkillHandlers` の外部インターフェースが維持されている
- [ ] `apps/desktop/src/main/ipc/index.ts` の import が変更不要であること

### 品質要件

- [ ] 既存テストが全てPASS
- [ ] 型チェック（`pnpm typecheck`）がPASS
- [ ] Lintチェック（`pnpm lint`）がPASS

### ドキュメント要件

- [ ] 各ファイルにJSDocコメントが記載されている
- [ ] CHANGELOGへの記録

---

## 6. 検証方法

### テストケース

| TC-ID  | 検証項目                                       | 期待結果              |
| ------ | ---------------------------------------------- | --------------------- |
| TC-001 | 既存テスト全てPASS                             | 全テストPASS          |
| TC-002 | `registerSkillHandlers` のエントリポイント維持 | import先変更不要      |
| TC-003 | 各分割ファイルが単一責務                       | 1ファイル1カテゴリ    |
| TC-004 | TypeScriptコンパイルエラーがない               | `pnpm typecheck` PASS |

### 検証手順

```bash
# テスト実行
pnpm --filter @repo/desktop test -- --grep "skillHandler"

# 型チェック
pnpm typecheck

# Lintチェック
pnpm lint

# import変更なしの確認
grep -rn "skillHandlers" apps/desktop/src/main/ipc/index.ts
```

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                                             |
| ---------------------------- | ------ | -------- | ------------------------------------------------ |
| 分割後のimportパスの修正漏れ | 中     | 中       | `pnpm typecheck` で検出                          |
| 共有インスタンスの参照切れ   | 高     | 低       | モジュールレベル変数の管理方針を事前に決定       |
| テストファイルの修正         | 中     | 中       | 外部インターフェースを維持し、テスト修正を最小化 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント       | パス                                                       |
| ------------------ | ---------------------------------------------------------- |
| skillHandlers.ts   | `apps/desktop/src/main/ipc/skillHandlers.ts`               |
| IPC ハンドラ登録   | `apps/desktop/src/main/ipc/index.ts`                       |
| TASK-FIX-7-1成果物 | `docs/30-workflows/TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION/` |

### システム仕様書

| 仕様書         | パス                                                 | 参照理由                 |
| -------------- | ---------------------------------------------------- | ------------------------ |
| IPC設計        | `references/api-ipc-system.md`                       | IPC ハンドラ設計指針     |
| アーキテクチャ | `references/architecture-overview.md`                | ファイル構成の方針       |
| 実装パターン   | `references/architecture-implementation-patterns.md` | リファクタリングパターン |
| 実装教訓       | `references/lessons-learned.md`                      | 苦戦箇所と解決策         |

### 関連タスク

| タスクID                              | 関係 | 説明                      |
| ------------------------------------- | ---- | ------------------------- |
| TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION | 先行 | executeSkill委譲実装      |
| UT-FIX-7-1-003                        | 並行 | IPCレスポンスパターン統一 |

---

## 9. 備考

### 発見元の原文

```
TASK-FIX-7-1 Phase 12にて検出:
skillHandlers.ts（454行）が複数の責務を担っている。
ハンドラ登録、SkillExecutor生成、IPC応答構築が混在しており、
単一責務原則に基づき機能別分割を推奨する。
```

### 補足事項

- UT-FIX-7-1-003（IPCレスポンスパターン統一）と同時実施することで効率化が期待できる
- 外部インターフェース（`registerSkillHandlers`/`unregisterSkillHandlers`）を維持するため、呼び出し元の変更は不要
- 分割時に各サブモジュールへの `mainWindow` や `skillService` の引数渡し方針を事前に決定すること
