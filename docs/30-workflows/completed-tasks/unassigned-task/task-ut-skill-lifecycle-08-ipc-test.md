# TASK-SKILL-LIFECYCLE-08 IPC 統合テスト作成 - タスク指示書

## メタ情報

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | UT-SKILL-LIFECYCLE-08-IPC-TEST                       |
| タスク名     | TASK-SKILL-LIFECYCLE-08 IPC チャンネル統合テスト作成 |
| 分類         | テスト拡充                                           |
| 対象機能     | スキル公開・共有・互換性統合                         |
| 優先度       | 中                                                   |
| 見積もり規模 | 中規模                                               |
| ステータス   | 未実施                                               |
| 発見元       | Phase 12（TASK-SKILL-LIFECYCLE-08）                  |
| 発見日       | 2026-03-17                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

公開・配布系 IPC 11 チャンネルは仕様化済みだが、実行可能な統合テストが未整備。

### 1.2 問題点・課題

P42（3段バリデーション）/ P60（IpcResponse）/ P61（interface依存）の回帰検知ができない。

### 1.3 放置した場合の影響

公開フローで契約破壊が発生しても検出が遅れ、UI/Preload/Main の整合崩壊に直結する。

---

## 2. 何を達成するか（What）

### 2.1 目的

11 IPC チャンネルの request/response/error path を統合テストで固定する。

### 2.2 最終ゴール

公開・配布チャンネル全件に対して成功系/失敗系/バリデーション系テストが自動実行可能。

### 2.3 スコープ

#### 含むもの

- `skill:publishing:*` 7チャンネル統合テスト
- `skill:distribution:*` 4チャンネル統合テスト
- timeout / validation / security の異常系

#### 含まないもの

- UI 画面テスト
- 実データ移行テスト

### 2.4 成果物

- IPC統合テストファイル
- テストデータファクトリ
- 失敗時のエラーコード表

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-SKILL-LIFECYCLE-08-TYPE-IMPL 完了
- ハンドラ/チャネル定義実装済み

### 3.2 依存タスク

- UT-SKILL-LIFECYCLE-08-TYPE-IMPL

### 3.3 必要な知識

- Electron IPC テスト
- vitest mock 設計
- P42/P60/P61 契約

### 3.4 推奨アプローチ

チャネル単位で test matrix を作り、正常系→入力不正→権限拒否→タイムアウトの順で実装する。

### 3.5 親タスクの苦戦箇所（継承）

> 出典: TASK-SKILL-LIFECYCLE-08 lessons-learned-current.md / UT-06-003 / 06-known-pitfalls.md

#### P60: IPC テスト応答形式の不一致（最重要）

| 項目   | 内容                                                                                                                                                                                                      |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスク | テスト設計時に `{ code: "VALIDATION_ERROR" }` のフラットな形式を期待するが、実装は `{ success: false, error: { code: "VALIDATION_ERROR" } }` のラッパー形式を返す。全テストのアサーション修正が必要になる |
| 回避策 | Phase 2 設計書に IPC レスポンス wrapper 形式（`{ success, data?, error? }`）を明示的に定義し、テスト設計時にこの定義を参照してアサーションを wrapper 形式で記述する                                       |

#### P42: 文字列引数の .trim() バリデーション漏れ

| 項目   | 内容                                                                                                                  |
| ------ | --------------------------------------------------------------------------------------------------------------------- |
| リスク | `typeof === "string"` と `=== ""` のみチェックすると、スペースのみの入力（`"   "`）がバリデーションを通過する         |
| 回避策 | 全文字列引数に `.trim() === ""` チェックを追加して3段バリデーション（型チェック → 空文字列 → トリム空文字列）を標準化 |

#### P61: DIP 違反の遅発検出

| 項目   | 内容                                                                                                     |
| ------ | -------------------------------------------------------------------------------------------------------- |
| リスク | IPC ハンドラ登録関数が具象クラスを引数に取る DIP 違反が Phase 10 まで検出されない                        |
| 回避策 | テストで「引数型が Port/Interface であること」を検証する。具象クラスのモック差し替えが困難になるのが兆候 |

#### P62: track() クロージャ間の DI スコープ問題

| 項目   | 内容                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------ |
| リスク | `track()` クロージャ内部でインスタンス化した依存オブジェクトが他のクロージャからアクセスできない |
| 回避策 | 複数クロージャ間で共有するインスタンスは最外スコープで生成し、各クロージャに渡す                 |

#### 5分解決カード

1. テスト設計前に既存 IPC ハンドラのレスポンス形式を `grep -rn "success:" apps/desktop/src/main/handlers/` で確認する。
2. 全バリデーションテストに P42 3段バリデーション（型→空→trim空）を含める。
3. ハンドラ登録関数の引数型がインターフェースであることをテストで検証する（P61 準拠）。
4. DI スコープは `track()` クロージャの最外スコープに統一する（P62 準拠）。
5. `pnpm --filter @repo/desktop test:run -- --coverage` でカバレッジ 80% を確認する。

---

## 4. 実行手順

### Phase構成

Phase A（テスト設計）→ Phase B（実装）→ Phase C（回帰ゲート化）

### Phase A: テスト設計

#### 目的

11チャンネルの観点漏れをなくす。

#### 手順

1. Phase 4/6 の test-spec を統合する
2. チャンネルごとに success/error ケースを定義する
3. カバレッジ基準を明記する

#### 成果物

IPC test matrix

#### 完了条件

11チャンネル全件にケースが割り当てられている

### Phase B: テスト実装

#### 目的

統合テストを実行可能にする。

#### 手順

1. Main IPC handler 登録テストを追加する
2. Preload 経由の invoke 契約テストを追加する
3. 異常系（validation, timeout, permission）を追加する

#### 成果物

統合テストコード

#### 完了条件

テストがローカルで安定実行できる

### Phase C: 回帰ゲート化

#### 目的

CI で回帰を防ぐ。

#### 手順

1. test:desktop に組み込む
2. failure message を明確化する
3. system spec のテスト節を更新する

#### 成果物

回帰ガード運用

#### 完了条件

CI で継続実行される

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 11 IPC チャンネルの統合テストが存在する
- [ ] 正常系/異常系の両方が網羅される

### 品質要件

- [ ] `pnpm --filter @repo/desktop test:run` が PASS
- [ ] 対象領域のカバレッジが 80% 以上

### ドキュメント要件

- [ ] テスト観点を system spec へ反映

---

## 6. 検証方法

### テストケース

- register/update/deprecate/remove/getDependents
- import/export/fork/share
- invalid payload / unauthorized / timeout

### 検証手順

1. `pnpm --filter @repo/desktop test:run`
2. `pnpm --filter @repo/desktop test:coverage`
3. `pnpm --filter @repo/desktop typecheck`

---

## 7. リスクと対策

| リスク              | 影響度 | 発生確率 | 対策                           |
| ------------------- | ------ | -------- | ------------------------------ |
| テスト実装コスト増  | 中     | 中       | matrix 先行で重複ケースを削減  |
| flaky test 発生     | 中     | 中       | timeout と mock clock を標準化 |
| mock 過剰で契約ずれ | 高     | 低       | preload-main の接続試験を残す  |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility/outputs/phase-4/publishing-test-spec.md`
- `docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility/outputs/phase-6/error-handling-extended-spec.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`
- `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`（PublishReadiness 公開判定マトリクス・セキュリティチェック）
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`（P60/P42/P61/P62 苦戦箇所）
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-safety-gate-permission-fallback.md`（SafetyGate DI 教訓）

### 参考資料

- `apps/desktop/src/main/ipc/__tests__/`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
Phase 12 未タスク検出: IPC 11チャンネルは仕様化済みだが統合テスト未実装。
```

### 補足事項

P42/P60/P61 の回帰検知を最優先とする。
