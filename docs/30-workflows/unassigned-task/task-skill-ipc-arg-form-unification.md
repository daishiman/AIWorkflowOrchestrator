# skill:ハンドラIPC引数形式統一（オブジェクト型 vs 直接引数型） - タスク指示書

## メタ情報

```yaml
issue_number: 891
```

## メタ情報

| 項目         | 内容                                                          |
| ------------ | ------------------------------------------------------------- |
| タスクID     | UT-FIX-SKILL-IPC-ARG-FORM-UNIFICATION-001                     |
| タスク名     | skill:ハンドラIPC引数形式統一（オブジェクト型 vs 直接引数型） |
| 分類         | リファクタリング                                              |
| 対象機能     | skill:ハンドラ群（skillHandlers.ts）                          |
| 優先度       | 低                                                            |
| 見積もり規模 | 中規模                                                        |
| ステータス   | 未実施                                                        |
| 発見元       | Phase 12（UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 苦戦箇所4） |
| 発見日       | 2026-02-24                                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-FIX-SKILL-VALIDATION-CONSISTENCY-001で6ハンドラのバリデーション統一を実施した際、引数形式が2種類あることが判明した:

- **オブジェクト型**（4ハンドラ）: `args: { skillId: string }` -- skill:get-detail, skill:execute, skill:analyze, skill:improve
- **直接引数型**（2ハンドラ）: `executionId: string` -- skill:abort, skill:get-status

この形式差異により、共通バリデーション関数の抽出が困難で、各ハンドラにインラインでバリデーションを記述する必要があった（YAGNI判断）。

### 1.2 問題点・課題

- 引数形式が不統一のため、新規ハンドラ追加時にどちらの形式を採用するか不明確
- 共通バリデーション関数（validateStringArg等）の抽出ができない
- テストの記述パターンもオブジェクト型と直接引数型で異なる

### 1.3 放置した場合の影響

- 新規ハンドラ追加のたびに形式選択の判断コスト発生
- バリデーションロジックの重複が拡大
- テストパターンの二重管理が継続

---

## 2. 何を達成するか（What）

### 2.1 目的

skill:ハンドラの引数形式をオブジェクト型に統一し、共通バリデーション関数を抽出する。

### 2.2 最終ゴール

- 全ハンドラがオブジェクト型引数を使用
- 共通バリデーション関数 `validateRequiredString(args, fieldName)` を抽出
- テストパターンの統一

### 2.3 スコープ

#### 含むもの

- skill:abort, skill:get-status の引数形式変更（直接型 → オブジェクト型）
- 共通バリデーション関数の抽出（`ipc-validation-utils.ts`）
- Preload API（`skill-api.ts`）の呼び出し形式更新
- テストファイルの更新

#### 含まないもの

- 他のIPCハンドラ（aiHandlers等）の引数形式変更
- 引数名ドリフト修正（P45は別タスク UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001）
- エラー応答パターン統一（別タスク UT-FIX-SKILL-IPC-ERROR-RESPONSE-001）

### 2.4 成果物

- 修正済み `apps/desktop/src/main/ipc/skillHandlers.ts`
- 新規 `apps/desktop/src/main/ipc/ipc-validation-utils.ts`（共通バリデーション）
- 修正済み `apps/desktop/src/preload/skill-api.ts`
- 修正済みテストファイル（`skillHandlers.*.test.ts`）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 完了済み（P42準拠バリデーション適用済み）
- 現在の6ハンドラ全てにP42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）が適用済み

### 3.2 依存タスク

なし（独立実行可能）。UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001との同時実行も可能だが、本タスク（引数形式統一）を先に行うことを推奨。命名統一時に形式も統一されていると変更箇所が明確になるため。

### 3.3 必要な知識

- Electron IPC `ipcMain.handle` の引数渡し仕様（第2引数にPreload側から渡されたデータが入る）
- `safeInvoke` / `safeInvokeUnwrap` の使い分け（Preload層の呼び出しパターン）
- P42準拠3段バリデーションパターン（型チェック → 空文字列 → トリム空文字列）
- P23/P32準拠の3箇所同時更新パターン（ハンドラ・Preload API・テスト）

### 3.4 推奨アプローチ

1. Preload側（`skill-api.ts`）の現在の呼び出し形式を確認
2. skill:abort と skill:get-status のPreload呼び出しを `{ executionId }` オブジェクト形式に変更
3. Handler側の引数受け取りをオブジェクト型に変更
4. 共通バリデーション関数を `ipc-validation-utils.ts` に抽出
5. 全ハンドラのバリデーションを共通関数に置き換え
6. テストを更新

### 3.5 実装課題と解決策（UT-FIX-SKILL-VALIDATION-CONSISTENCY-001からの教訓）

| #   | 苦戦箇所                                                                                                                                   | 解決策                                                                          | 本タスクへの適用                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | **引数形式の分類に時間がかかった**: `grep -n "ipcMain.handle" skillHandlers.ts` で全ハンドラを列挙し、各引数パターンを分類する必要があった | 事前に引数形式テーブルを作成してから修正着手                                    | 本タスクでは既にテーブル化済み。2ハンドラ（abort/get-status）の変更のみ |
| 2   | **YAGNI判断の根拠**: 引数形式が2種類あるため共通関数を作らない判断をした。しかし引数形式統一後は抽出が可能                                 | 引数形式統一を先に行い、統一後に共通関数を抽出するという2段階アプローチ         | 本タスクがまさにその統一タスク。完了後に共通関数抽出を実施              |
| 3   | **P23/P32準拠の3箇所同時更新**: Handler・Preload API・テストを同一コミットで修正する必要がある                                             | skill:remove修正（UT-FIX-SKILL-REMOVE-INTERFACE-001）で検証済みのパターンを踏襲 | abort/get-statusのPreload API変更時も同様に3箇所同時更新を厳守          |

参照ドキュメント:

- `architecture-implementation-patterns.md` S18 -- P42準拠バリデーション一括移行パターン
- `lessons-learned.md` -- UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 苦戦箇所4（引数形式の違い）
- `06-known-pitfalls.md` P42, P44, P45

---

## 4. 実行手順

### Phase構成

本タスクは中規模リファクタリングのため、Phase 4-12 構成で実施する。

### Phase 4: テスト作成

#### 目的

引数形式変更後の期待動作をテストで定義する。

#### 手順

1. skill:abort のテストを修正し、引数を `{ executionId: "exec-123" }` オブジェクト形式で渡すテストケースを追加
2. skill:get-status のテストを修正し、同様にオブジェクト形式のテストケースを追加
3. 共通バリデーション関数 `validateRequiredString` のユニットテストを作成
4. 全ハンドラが共通バリデーション関数を使用するテストを設計

#### 成果物

- `skillHandlers.validation.test.ts` の修正
- `ipc-validation-utils.test.ts` の新規作成

#### 完了条件

- オブジェクト形式引数のテストケースが全ハンドラ分記述されていること
- 共通バリデーション関数のテストケースが設計されていること

### Phase 5: 実装

#### 目的

引数形式統一と共通バリデーション関数の抽出を行う。

#### 手順

1. `ipc-validation-utils.ts` に `validateRequiredString(args: unknown, fieldName: string): string` を実装
2. skill:abort のHandler引数を `args: { executionId: string }` に変更
3. skill:get-status のHandler引数を `args: { executionId: string }` に変更
4. Preload側（`skill-api.ts`）の `abort` / `getStatus` 呼び出しをオブジェクト形式に変更
5. 全6ハンドラのバリデーションを `validateRequiredString` に置き換え
6. P23/P32準拠で3箇所（Handler・Preload API・テスト）を同一コミットで修正

#### 成果物

- 修正済み `skillHandlers.ts`
- 新規 `ipc-validation-utils.ts`
- 修正済み `skill-api.ts`

#### 完了条件

- 全6ハンドラがオブジェクト型引数を使用していること
- 共通バリデーション関数が全ハンドラで使用されていること
- Preload側の呼び出し形式が更新されていること

### Phase 6-9: テスト拡充・カバレッジ確認・リファクタリング・品質検証

#### 目的

カバレッジ基準の充足と品質検証を行う。

#### 手順

1. カバレッジ計測を実施し、Line 80%+, Branch 60%+ を確認
2. 不足箇所のテストを追加
3. ESLint・TypeScript型チェック・全テスト実行

#### 完了条件

- カバレッジ基準を充足していること
- 全品質検証がPASSすること

### Phase 10-12: 最終レビュー・手動テスト・ドキュメント

#### 目的

品質保証とドキュメント更新を行う。

#### 手順

1. 最終レビュー（多角的品質・整合性検証）
2. 手動テスト（Electron実行環境でスキル実行確認）
3. Phase 12 実装ガイド・システム仕様書更新

#### 完了条件

- Phase 12 チェックリスト全項目完了

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] skill:abort の引数形式がオブジェクト型（`{ executionId: string }`）に変更されていること
- [ ] skill:get-status の引数形式がオブジェクト型（`{ executionId: string }`）に変更されていること
- [ ] 共通バリデーション関数 `validateRequiredString` が `ipc-validation-utils.ts` に抽出されていること
- [ ] 全6ハンドラが共通バリデーション関数を使用していること
- [ ] Preload API（`skill-api.ts`）の呼び出し形式がオブジェクト型に更新されていること

### 品質要件

- [ ] 全テストPASS
- [ ] カバレッジ基準充足（Line 80%+, Branch 60%+, Function 80%+）
- [ ] ESLint エラーなし
- [ ] TypeScript 型チェックエラーなし

### ドキュメント要件

- [ ] Phase 12 実装ガイド（Part 1 + Part 2）作成完了
- [ ] システム仕様書更新完了（LOGS.md 2ファイル、SKILL.md 2ファイル、topic-map.md）
- [ ] documentation-changelog.md 作成完了

---

## 6. 検証方法

### テストケース

- skill:abort にオブジェクト形式 `{ executionId: "exec-123" }` で引数を渡し、正常に実行ID取得できること
- skill:get-status にオブジェクト形式 `{ executionId: "exec-123" }` で引数を渡し、正常にステータス取得できること
- 共通バリデーション関数が以下を正しく検出すること:
  - 引数が `undefined` の場合 → VALIDATION_ERROR
  - 引数のフィールドが文字列でない場合 → VALIDATION_ERROR
  - 引数のフィールドが空文字列の場合 → VALIDATION_ERROR
  - 引数のフィールドがスペースのみの場合 → VALIDATION_ERROR（P42準拠）
- 全6ハンドラが共通バリデーション関数経由でバリデーションを実行すること
- Preload APIの呼び出し形式が更新されていること
- 既存テストが全てPASSすること

### 検証手順

1. `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers` でハンドラテスト全PASS確認
2. `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/ipc-validation-utils` で共通関数テストPASS確認
3. `pnpm typecheck` で型チェックPASS確認
4. `pnpm lint` でESLintエラーなし確認
5. カバレッジレポートで基準充足を確認

---

## 7. リスクと対策

| リスク                                               | 影響度 | 発生確率 | 対策                                                                                                                                       |
| ---------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Preload側の呼び出し形式変更によるRenderer側への波及  | 中     | 低       | safeInvokeがオブジェクト形式を透過的に渡すことを事前確認。Renderer側は `abort(executionId)` のまま、Preload内部で `{ executionId }` に変換 |
| 既存テストの大規模修正                               | 低     | 低       | 2ハンドラのみの変更のため限定的。describe.eachテストの入力パターン修正のみ                                                                 |
| 共通関数抽出によるバリデーションロジックの暗黙的変更 | 中     | 低       | 抽出前後でバリデーション結果が同一であることをテストで検証。P42準拠3段バリデーションが維持されることを確認                                 |
| P23/P32準拠の3箇所同時更新の漏れ                     | 中     | 中       | UT-FIX-SKILL-REMOVE-INTERFACE-001で検証済みのパターンを踏襲。チェックリスト（Handler・Preload・テスト）で確認                              |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` -- S18: P42準拠バリデーション一括移行パターン
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` -- UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 苦戦箇所4（引数形式の違い）
- `.claude/rules/06-known-pitfalls.md` -- P42（.trim()バリデーション漏れ）、P44（IPCインターフェース不整合）、P45（引数命名の契約ドリフト）
- `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` -- IPC契約ドリフト防止チェックリスト
- `docs/30-workflows/completed-tasks/skill-validation-consistency/outputs/phase-12/documentation-changelog.md` -- IPC契約検証結果

### 参考資料

- `docs/30-workflows/completed-tasks/task-skill-validation-consistency.md` -- 直近の完了タスク（バリデーション統一）
- `docs/30-workflows/unassigned-task/task-skill-getdetail-naming-drift.md` -- 関連未タスク（P45引数名ドリフト修正）
- `docs/30-workflows/unassigned-task/task-skill-ipc-response-consistency.md` -- 関連未タスク（レスポンス形式統一）

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 Phase 12 苦戦箇所4:
「引数形式の違い（オブジェクト型 vs 直接引数型）」
— skill:abort と skill:get-status は直接引数型（executionId: string）を使用しているため、
オブジェクト型ハンドラと共通バリデーション関数を共有できなかった。
YAGNI原則に基づき現タスクでは共通関数抽出を見送り、
将来の引数形式統一タスクとして分離した。
```

### 補足事項

- 本タスクはUT-FIX-SKILL-VALIDATION-CONSISTENCY-001の苦戦箇所4（引数形式の違い）から派生したタスク
- UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001（P45引数名ドリフト修正）と同時実行可能だが、引数形式統一を先に行うことを推奨（命名統一時に形式も統一されていると変更箇所が明確）
- YAGNI原則に基づき、UT-FIX-SKILL-VALIDATION-CONSISTENCY-001では共通関数抽出を見送っていた。本タスクで引数形式を統一した後に初めて抽出が可能になる
- 共通バリデーション関数の設計方針: `validateRequiredString(args: unknown, fieldName: string): string` — 成功時はトリム済み文字列を返し、失敗時はバリデーションエラーをスローする
