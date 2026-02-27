# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 8                                         |
| Phase名    | リファクタリング（TDD: Refactor）         |
| タスクID   | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 |
| 前提Phase  | Phase 7（カバレッジ確認）                 |
| 後続Phase  | Phase 9（品質保証）                       |
| ステータス | 未着手                                    |
| 作成日     | 2026-02-27                                |
| 機能名     | skill-ipc-response-consistency            |

---

## 目的

TDD の Refactor フェーズとして、契約統一後のコードを整理し、重複ロジック削減・命名改善・可読性向上を行う。テスト通過を維持しながらコード品質を向上させる。

## 背景

Phase 5 の契約統一実装は「まず動かす」ことを優先している。各ハンドラで P42準拠3段バリデーションやエラーサニタイズが繰り返し記述されている可能性があり、Phase 8 ではこれらの重複を整理しつつ、テストが Green のまま維持されることを確認する。ただし、過度な抽象化は避け、可読性を優先する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 重複ロジック整理

**目的**: skillHandlers.ts 内の重複するバリデーション・エラーハンドリングロジックを共通化検討する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` を読み込む
2. 全14 `skill:` ハンドラーの P42準拠3段バリデーションパターンを分析する
3. 以下の観点で重複度を評価する

**分析観点**:

| 観点                         | 確認内容                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| 3段バリデーションの重複      | 各ハンドラーで `typeof + === "" + .trim() === ""` が繰り返されていないか             |
| `validateIpcSender` パターン | 全ハンドラーで同一の sender 検証パターンが使われているか                             |
| エラーサニタイズ処理の重複   | `sanitizeErrorMessage` の catch パターンが全ハンドラーで同一か                       |
| レスポンス形式の一貫性       | 契約プロファイル（ラッパー返却/直接返却/例外返却）に沿った return が統一されているか |

**判断基準**:

| 判断       | 条件                                                           |
| ---------- | -------------------------------------------------------------- |
| 抽出する   | 3行以上の完全に同一のコードブロックが4箇所以上ある場合         |
| 抽出しない | 各ハンドラーの処理が微妙に異なり、抽出すると可読性が下がる場合 |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers*.test.ts --reporter=verbose
```

**期待される成果物**:

- `outputs/phase-8/duplicate-logic-analysis.md`

---

### タスク2: 命名改善（P45対策）

**目的**: P45（命名ドリフト）対策として、引数名・変数名の一貫性を確認・修正する

**実行手順**:

1. `grep -rn "skillId" apps/desktop/src/main/ipc/skillHandlers.ts` で命名不一致箇所を検出する
2. `skillName` / `skillId` の使い分けがセマンティクスと一致しているか確認する
3. 不一致があれば修正する
4. 関連するテストファイルの命名も同期する

**命名規則チェックリスト**:

| チェック項目 | 基準                                      |
| ------------ | ----------------------------------------- |
| 型名         | PascalCase（例: `SkillReadFileArgs`）     |
| 関数名       | camelCase（例: `readFile`）               |
| 定数名       | UPPER_SNAKE_CASE（例: `SKILL_READ_FILE`） |
| boolean変数  | `is`/`has`/`can`/`should` プレフィックス  |
| IPC引数名    | 実際の値のセマンティクスと一致            |

**検出コマンド**:

```bash
# 命名ドリフト検出
grep -rn "skillId" apps/desktop/src/main/ipc/skillHandlers.ts
grep -rn "skillId" apps/desktop/src/preload/skill-api.ts
```

**期待される成果物**:

- `outputs/phase-8/naming-improvement.md`

---

### タスク3: Preload API コード整理

**目的**: skill-api.ts の可読性向上

**実行手順**:

1. `apps/desktop/src/preload/skill-api.ts` を読み込む
2. `safeInvoke` / `safeInvokeUnwrap` の選択根拠が契約プロファイルと一致しているか確認する
3. 不要な型アサーション（`as` キャスト）が残っていないか確認する
4. チャンネル名が全て `IPC_CHANNELS` 定数経由で参照されているか確認する

**確認観点**:

| 観点                                   | 確認内容                                                  |
| -------------------------------------- | --------------------------------------------------------- |
| `safeInvoke` / `safeInvokeUnwrap` 選択 | AR-2 に基づき、契約プロファイルに応じた選択がされているか |
| 型アサーション                         | `as unknown as X` のような不要なキャストが残っていないか  |
| ハードコード文字列                     | P27対策: `IPC_CHANNELS` 定数経由の参照のみか              |
| 引数型と戻り値型の一致                 | `preload/types.ts` の定義と実装が一致しているか           |

**ハードコード文字列検出コマンド**:

```bash
grep -rn "safeInvoke\|safeOn" apps/desktop/src/preload/skill-api.ts | grep -v "IPC_CHANNELS"
```

**期待される成果物**:

- `outputs/phase-8/preload-api-cleanup.md`

---

### タスク4: テスト Green 維持確認

**目的**: リファクタリング後も全テストが Green のまま維持されていることを最終確認する

**実行手順**:

1. Main IPC ハンドラーテストを実行する
2. Preload API テストを実行する
3. TypeScript 型チェックを実行する

**確認コマンド**:

```bash
# Main IPC テスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers*.test.ts --reporter=verbose

# Preload API テスト
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api*.test.ts --reporter=verbose

# 型チェック
pnpm typecheck
```

**TDD検証チェック**:

- [ ] リファクタリング後もテストが成功することを確認

**期待される成果物**:

- `outputs/phase-8/test-green-confirmation.md`

---

## SubAgent 分担

| SubAgent   | 担当 |
| ---------- | ---- |
| SubAgent-A | タスク1（重複ロジック整理）+ タスク2（命名改善） |
| SubAgent-B | タスク3（Preload API コード整理） |
| SubAgent-C | タスク4（テスト Green 維持確認）+ 成果物集約 |

## 参照資料

| 参照資料       | パス                                                         | 内容                 |
| -------------- | ------------------------------------------------------------ | -------------------- |
| Phase 1 要件書 | `outputs/phase-1/requirements.md`                            | 契約要件の再確認     |
| Phase 2 設計書 | `outputs/phase-2/design-document.md`                         | 契約設計の再確認     |
| Phase 5 実装   | `apps/desktop/src/main/ipc/skillHandlers.ts`                 | リファクタリング対象 |
| Phase 6 テスト成果物 | `apps/desktop/src/main/ipc/__tests__/skillHandlers*.test.ts` | 回帰対象の主要テスト |
| Phase 6 テスト成果物 | `apps/desktop/src/preload/__tests__/skill-api*.test.ts`      | 回帰対象の主要テスト |
| Phase 7 カバレッジ結果 | `outputs/phase-7/coverage-report.md`                      | 閾値達成状況の確認   |
| Preload API    | `apps/desktop/src/preload/skill-api.ts`                      | 整理対象             |
| Preload型定義  | `apps/desktop/src/preload/types.ts`                          | 型定義               |
| テストファイル | `apps/desktop/src/main/ipc/__tests__/skillHandlers*.test.ts` | テストコード         |
| Preload テスト | `apps/desktop/src/preload/__tests__/skill-api*.test.ts`      | Preload テストコード |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                        | 内容             |
| ---------------- | ------------------------------------------------------------------------------------------- | ---------------- |
| P45対策          | `.claude/rules/06-known-pitfalls.md`                                                        | 命名ドリフト防止 |
| 実装パターン集   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S18パターン      |
| セキュリティ原則 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ |
| コード品質基準   | `.claude/rules/02-code-quality.md`                                                          | 品質ルール       |

---

## 成果物

| 成果物           | パス                                          | 内容                 |
| ---------------- | --------------------------------------------- | -------------------- |
| 重複ロジック分析 | `outputs/phase-8/duplicate-logic-analysis.md` | 共通化判断と実施結果 |
| 命名改善         | `outputs/phase-8/naming-improvement.md`       | P45対策の確認結果    |
| Preload API整理  | `outputs/phase-8/preload-api-cleanup.md`      | Preload API改善内容  |
| テストGreen確認  | `outputs/phase-8/test-green-confirmation.md`  | テスト通過確認結果   |

---

## 統合テスト連携

> リファクタ後の統合テスト継続成功を確認する

| 確認項目             | 基準                               |
| -------------------- | ---------------------------------- |
| 全ユニットテスト     | 100% パス                          |
| 14ハンドラーのテスト | 全テストケースPASS                 |
| セキュリティテスト   | sender検証・バリデーション全件PASS |
| カバレッジ維持       | リファクタ前と同等以上             |

---

## TDD検証

### TDD サイクル確認

```bash
# リファクタリング中は継続的にテスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers*.test.ts
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api*.test.ts
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## 完了条件

- [ ] 重複ロジックが判断基準に沿って整理されている（過度な抽象化なし）
- [ ] 命名が一貫している（P45対策確認済み）
- [ ] 不要な型アサーションが除去されている
- [ ] `safeInvoke` / `safeInvokeUnwrap` の選択が契約プロファイルと一致している
- [ ] 全テストが Green のまま維持されている
- [ ] `pnpm typecheck` が成功している

---

## サブタスク管理

| #   | タスク名               | ステータス | 備考 |
| --- | ---------------------- | ---------- | ---- |
| 1   | 重複ロジック整理       | 未着手     |      |
| 2   | 命名改善（P45対策）    | 未着手     |      |
| 3   | Preload API コード整理 | 未着手     |      |
| 4   | テスト Green 維持確認  | 未着手     |      |

---

## タスク100%実行確認【必須】チェックリスト

- [ ] タスク1: 重複ロジック整理 — 分析完了、判断記録済み
- [ ] タスク2: 命名改善 — P45対策確認・修正完了
- [ ] タスク3: Preload API コード整理 — 可読性改善完了
- [ ] タスク4: テスト Green 維持確認 — 全テストPASS、型チェック成功

---

## Phase実行記録

| 項目         | 内容 |
| ------------ | ---- |
| 実行開始日時 |      |
| 実行完了日時 |      |
| 実行者       |      |
| 特記事項     |      |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（4タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（4ファイル）が全て生成されていることを確認
- [ ] テストが継続してGreen状態であることを確認

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-ipc-response-consistency/phase-9-quality-assurance.md`
