# Phase 8: リファクタリング（TDD: Refactor） - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 8                                      |
| Phase名    | リファクタリング                       |
| 前提Phase  | Phase 7                                |
| 後続Phase  | Phase 9                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-02-10                             |
| 機能名     | ut-fix-5-4-agent-sdk-api-type-mismatch |

---

## 目的

動作を変えずにコード品質を改善する。

## 背景

Phase 5で `abort()` メソッドの型定義を `Promise<void>` に修正した後、テストが成功している状態（Green）を維持しながら、コードの可読性・保守性を向上させる。

---

## 実行タスク

### タスク1: コードスメル検出

**目的**: 問題のあるコードパターンの特定と修正

**実行手順**:

1. 型アサーション（`as`）の不必要な使用箇所を検出する
2. 重複する型定義パターンを検出する
3. `Promise<void>` 型の一貫性を確認する

**確認観点**:

```typescript
// 悪い例（型アサーション）
const result = something as Promise<void>;

// 良い例（適切な型推論）
const result: Promise<void> = something;
```

**期待される成果物**:

- コードスメル検出レポート

---

### タスク2: 命名改善

**目的**: 変数・関数・型名の改善

**実行手順**:

1. `abort` 関連の命名が一貫しているか確認する
2. 戻り値の型を表す変数名が適切か確認する
3. テストケースの命名が説明的か確認する

**命名規則確認**:

| 対象     | 現在の命名パターン            | 確認項目                     |
| -------- | ----------------------------- | ---------------------------- |
| メソッド | `abort()`                     | 動詞で始まっているか         |
| 戻り値型 | `Promise<void>`               | 非同期処理であることが明確か |
| テスト   | `should return Promise<void>` | 期待動作が説明されているか   |

**期待される成果物**:

- 命名改善済みコード（必要な場合）

---

### タスク3: 重複排除

**目的**: 重複コードの統合

**実行手順**:

1. `apps/desktop/src/preload/types.ts` と `packages/shared/src/agent/types.ts` の型定義重複を確認する
2. 正本（shared）からの参照パターンが適切か確認する
3. 不要な型定義の重複がないか確認する

**重複確認対象**:

```bash
# 重複パターン検出
grep -rn "abort.*Promise<void>" apps/desktop/src/preload/
grep -rn "abort.*Promise<void>" packages/shared/src/agent/
```

**期待される成果物**:

- 重複排除済みコード（必要な場合）

---

### タスク4: 構造整理

**目的**: コード構造の改善

**実行手順**:

1. AgentSDKAPI インターフェースの整合性を確認する
2. 型定義の依存関係が適切か確認する
3. export/import パターンの一貫性を確認する

**期待される成果物**:

- 構造整理済みコード（必要な場合）

---

## 参照資料

| 参照資料           | パス                                 | 内容          |
| ------------------ | ------------------------------------ | ------------- |
| 型定義（preload）  | `apps/desktop/src/preload/types.ts`  | Phase 5成果物 |
| 型定義（shared）   | `packages/shared/src/agent/types.ts` | Phase 5成果物 |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | Phase 7成果物 |
| 型安全ルール       | `.claude/rules/02-code-quality.md`   | 型安全原則    |

---

## 成果物

| 成果物               | パス                                    | 説明           |
| -------------------- | --------------------------------------- | -------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-report.md` | 改善内容記録   |
| リファクタ済みコード | `apps/desktop/src/preload/types.ts`     | 改善済みコード |
| リファクタ済みコード | `packages/shared/src/agent/types.ts`    | 改善済みコード |

---

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test
pnpm --filter @repo/shared test

# 型チェック
pnpm typecheck
```

---

## 完了条件

- [ ] テストが継続成功
- [ ] コード品質が改善されている
- [ ] 重複が排除されている
- [ ] 型アサーション（`as`）の不必要な使用がない
- [ ] 2箇所の型定義が一貫している
- [ ] 統合テストが継続成功
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test
pnpm --filter @repo/shared test

# 型チェック
pnpm typecheck

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
# - [ ] 型エラーがないことを確認
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH/phase-9-quality-assurance.md`
