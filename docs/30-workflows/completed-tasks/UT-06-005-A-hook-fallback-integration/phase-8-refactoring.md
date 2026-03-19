# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 8                                     |
| 機能名 | UT-06-005-A-hook-fallback-integration |
| 作成日 | 2026-03-17                            |

## 目的

Phase 5-6 で実装したコードの品質を向上させる。TDD サイクルの Refactor フェーズとして、テストが PASS した状態を維持しながら重複排除、命名改善、SOLID 原則への準拠確認を行う。既存テスト 275+ ケースが全 PASS であることをリファクタリング完了後に確認する。

## 実行タスク

- 重複排除: `handlePermissionCheck` 内の try-catch パターンの整理と重複コードの排除
- 命名改善: Permission 関連メソッドの命名一貫性チェックと改善
- ナビゲーション短縮: 深いネストや長い呼び出しチェーンを短縮できる箇所の整理
- SOLID 原則確認: `handlePermissionCheck` が単一責務（SRP）を維持しているか確認
- DIP 確認: ハンドラ登録関数の依存方向が Port/Interface に向いているか確認（P61対策）
- P49 確認: type predicate 内で `as` キャストを使用していないか確認し、`in` 演算子での実行時検証に置換する
- テスト継続 PASS 確認: リファクタリング後も全テストが PASS することを確認

## 参照資料

| 資料名             | パス                                         | 説明                               |
| ------------------ | -------------------------------------------- | ---------------------------------- |
| Phase 1 要件定義   | `outputs/phase-1/requirements-definition.md` | 要件定義結果と最終判断根拠         |
| Phase 2 設計書     | `outputs/phase-2/architecture-design.md`     | 設計方針と実装境界                 |
| Phase 7 成果物     | `outputs/phase-7/coverage-result.md`         | カバレッジ測定結果（PASS確認済み） |
| Phase 5 実装成果物 | `outputs/phase-5/`                           | 実装コードと実装メモ               |
| Phase 6 成果物     | `outputs/phase-6/`                           | テスト拡充後のテスト群             |
| コード品質ルール   | `.claude/rules/02-code-quality.md`           | TypeScript型安全・コーディング規約 |
| DIP違反の落とし穴  | `.claude/rules/06-known-pitfalls.md#P61`     | IPC ハンドラの DIP 違反パターン    |

## 依存フェーズ

- Phase 5: `outputs/phase-5/implementation-summary.md`（実装結果）を前提に、リファクタリング対象を限定する
- Phase 6: `outputs/phase-6/coverage-report.md`（テスト網羅状況）を維持しつつ変更範囲を限定する
- Phase 7: `outputs/phase-7/coverage-report.md`（カバレッジ結果）を維持して品質低下を避ける
- Phase 1: `outputs/phase-1/requirements-definition.md`（要件前提）を確認して実装意図を保持する
- Phase 2: `outputs/phase-2/architecture-design.md`（設計方針）を参照して安全性を維持する

### システム仕様（aiworkflow-requirements）

| 参照資料                            | パス                                                                                         | 内容                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| Permission フォールバックフロー詳細 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | abort/skip/retry の分岐ロジックと型定義 |
| アーキテクチャ実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`  | Setter Injection・DIP パターン          |

## 実行手順

### ステップ1: 現在のコード品質確認

リファクタリング前に現在のコード状態を把握する:

```bash
# 実装ファイルの確認
wc -l apps/desktop/src/main/services/skill/SkillExecutor.ts

# handlePermissionCheck メソッドの行数確認
grep -n "handlePermissionCheck\|sendPermissionRequestWithTimeout\|PermissionTimeoutError" \
  apps/desktop/src/main/services/skill/SkillExecutor.ts
```

### ステップ2: 重複排除チェック

#### 2-1. try-catch パターンの確認

`handlePermissionCheck` の実装において、try-catch が入れ子になっている箇所を確認する:

```typescript
// Phase 2 設計では以下の構造を想定:
// 外側 try-catch: PermissionTimeoutError の捕捉
// 内側 try-catch: フォールバック処理の例外（NFR-101: fail-closed）
```

**チェック項目:**

| チェック                           | 期待状態                                                  |
| ---------------------------------- | --------------------------------------------------------- |
| 外側 try-catch の責務              | `PermissionTimeoutError` のみを捕捉し、abort フローに誘導 |
| 内側 try-catch の責務              | フォールバック処理の例外を捕捉し、fail-closed で abort へ |
| 重複したエラーハンドリングがないか | 同じエラーを複数箇所で catch していないか確認             |

#### 2-2. retry ループの整理

while ループの条件と `continue` の使い方が明瞭か確認する:

```typescript
// 推奨: ループ変数と最大回数の定数が明確
const MAX_RETRIES = PERMISSION_MAX_RETRIES; // 定数参照
let retryCount = 0;

while (retryCount <= MAX_RETRIES) {
  // ...
  // retry の場合: retryCount をインクリメントして continue
  // それ以外の場合: 関数から return または throw
}
```

#### 2-3. 重複コードの抽出候補

以下のパターンが複数箇所に現れる場合、ヘルパー抽出を検討する:

- `executeAbortFlow` の呼び出し + rethrow パターン
- PermissionFlowContext オブジェクトの構築

### ステップ3: 命名一貫性チェック

#### 3-1. メソッド命名の確認

| メソッド名                         | 確認観点                                                       |
| ---------------------------------- | -------------------------------------------------------------- |
| `handlePermissionCheck`            | 「handle + 名詞」形式で一貫しているか                          |
| `sendPermissionRequestWithTimeout` | 責務が名前から明確か（send + with timeout）                    |
| `processPermissionFallback`        | 既存メソッドとの命名スタイルが一致しているか（UT-06-005 実装） |
| `executeAbortFlow`                 | 既存メソッドとの命名スタイルが一致しているか（UT-06-005 実装） |
| `executeSkipFlow`                  | 既存メソッドとの命名スタイルが一致しているか（UT-06-005 実装） |

#### 3-2. 変数・定数命名の確認

| 変数/定数名              | 確認観点                                    |
| ------------------------ | ------------------------------------------- |
| `PERMISSION_MAX_RETRIES` | 大文字 SNAKE_CASE で定数であることが明確か  |
| `permissionTimeoutMs`    | camelCase で設定値であることが明確か        |
| `retryCount`             | boolean でないのに `is` prefix がないか確認 |
| `PermissionTimeoutError` | PascalCase でクラスであることが明確か       |

#### 3-3. P45 準拠: 引数命名のセマンティクス確認

```bash
# handlePermissionCheck の引数名が実際の値のセマンティクスと一致しているか確認
grep -A 6 "handlePermissionCheck" \
  apps/desktop/src/main/services/skill/SkillExecutor.ts
```

### ステップ4: SOLID 原則の確認

#### 4-1. SRP（単一責務原則）

`handlePermissionCheck` が以下の責務に限定されているか確認する:

- Permission 要求の送信（タイムアウト付き）
- フォールバック処理の呼び出し（委譲）
- フロー制御（proceed/skip/retry/abort の分岐）

**責務逸脱チェック:**

- IPC通信の詳細実装を含んでいないか（`sendPermissionRequestWithTimeout` に委譲されているか）
- フォールバックのビジネスロジックを直接実装していないか（`processPermissionFallback` に委譲されているか）

#### 4-2. DIP（依存性逆転原則）- P61 準拠

Phase 2 設計で `permissionStore` の存在チェックにより Permission チェックを条件付きで実行する設計であったが、具象クラスへの直接依存がないか確認する:

```bash
# 具象クラスへの直接依存を検索
grep -n "new.*Permission\|DefaultPermission\|PermissionStore(" \
  apps/desktop/src/main/services/skill/SkillExecutor.ts
```

**期待状態**: `permissionStore` はコンストラクタ注入された抽象型（Interface/Port）を参照している。

#### 4-3. OCP（開放閉鎖原則）

新しいフォールバックアクション（例: `defer`）が追加される場合に、`handlePermissionCheck` の既存コードを変更せず、`processPermissionFallback` の switch 分岐だけを変更できる構造になっているか確認する。

### ステップ5: コーディング規約チェック

```bash
# any 型の使用確認
grep -n ": any\|as any" \
  apps/desktop/src/main/services/skill/SkillExecutor.ts

# @ts-ignore/@ts-expect-error の使用確認（理由コメント必須）
grep -n "@ts-ignore\|@ts-expect-error" \
  apps/desktop/src/main/services/skill/SkillExecutor.ts

# 未使用 import の確認
grep -n "^import" apps/desktop/src/main/services/skill/SkillExecutor.ts
```

**期待状態**: `any` 型不使用、型アサーションによるバリデーション回避なし。

#### 5-1. P49 準拠チェック: type predicate 内の `as` キャスト

**P49 の教訓**: type predicate 内で `(item as Record<string, unknown>).field` のような `as` キャストを使用すると、実行時の型安全が保証されない。`in` 演算子による実行時検証に置換する必要がある。

```bash
# type predicate 内の as キャストを検索
grep -n "is.*:.*=>" apps/desktop/src/main/services/skill/SkillExecutor.ts | head -20

# as キャストの使用箇所を確認
grep -n " as Record\| as string\| as unknown" \
  apps/desktop/src/main/services/skill/SkillExecutor.ts
```

**修正パターン（P49）:**

```typescript
// ❌ P49: as キャストで実行時検証バイパス
const isValid = (item: unknown): item is Target =>
  typeof (item as Record<string, unknown>).field === "string";

// ✅ in 演算子で実行時検証 + 型ナロイング
const isValid = (item: unknown): item is Target =>
  item != null &&
  typeof item === "object" &&
  "field" in item &&
  typeof (item as Record<string, unknown>).field === "string";
```

期待状態: type predicate 内で `as` キャストを使用せず、`in` 演算子で実行時検証を行っていること。

### ステップ6: リファクタリング実施

ステップ2-5 で発見した改善点を実施する。

**リファクタリング時の原則:**

1. 一度に1箇所ずつ変更する（テストで確認しながら進める）
2. 各変更後にテストを実行して PASS を確認する
3. カバレッジが低下しないことを確認する

```bash
# リファクタリング後のテスト実行（変更のたびに実行）
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/
```

### ステップ7: 最終テスト確認

リファクタリング完了後、全テストが PASS していることを確認する:

```bash
# 全 SkillExecutor テスト実行
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/

# カバレッジが低下していないことを確認
pnpm --filter @repo/desktop exec vitest run --coverage \
  src/main/services/skill/__tests__/
```

**期待**: 275+ ケースが全 PASS、カバレッジが Phase 7 の測定値以上。

## 統合テスト連携（Phase 1〜11は必須）

Phase 8 では以下の観点で統合テストの継続成功を確認する:

- `handlePermissionCheck` のリファクタリング後も全分岐テストが PASS
- `sendPermissionRequestWithTimeout` のタイムアウトテストが PASS
- 既存 FR-001〜FR-003 のテストが PASS（既存機能への影響なし）

## 多角的チェック観点

| 観点              | 内容                                                                    | 参照先                                |
| ----------------- | ----------------------------------------------------------------------- | ------------------------------------- |
| SRP               | `handlePermissionCheck` の責務が単一であるか                            | `01-architecture.md#設計原則`         |
| DIP (P61)         | IPC ハンドラ引数が具象クラスではなくインターフェースを参照しているか    | `06-known-pitfalls.md#P61`            |
| 型安全            | `any` 型・型アサーションによるバリデーション回避がないか                | `02-code-quality.md#TypeScript型安全` |
| P49（type guard） | type predicate 内で `as` キャストを使用せず `in` 演算子で検証しているか | `06-known-pitfalls.md#P49`            |
| 命名規約          | boolean 変数に `is/has/can/should` プレフィックスがあるか               | `02-code-quality.md#コーディング規約` |
| fail-closed       | リファクタリング後も NFR-101（fail-closed）の動作が維持されているか     | `security-skill-execution.md`         |

**Electronデスクトップアプリ観点**:

| 層                   | 確認内容                                            | 仕様参照先                                 |
| -------------------- | --------------------------------------------------- | ------------------------------------------ |
| バックエンド（Main） | リファクタリング後も Main Process の全テストが PASS | `architecture-overview.md`                 |
| IPC通信              | IPC 依存のモックが引き続き正常に動作しているか      | `interfaces-agent-sdk-executor-details.md` |

## 成果物

| 成果物                 | パス                                        | 説明                                       |
| ---------------------- | ------------------------------------------- | ------------------------------------------ |
| リファクタリング記録   | `outputs/phase-8/refactoring-log.md`        | 実施した変更内容と理由の記録               |
| コード品質チェック結果 | `outputs/phase-8/code-quality-check.md`     | SOLID原則・命名規約チェック結果            |
| テスト継続PASS確認     | `outputs/phase-8/test-pass-confirmation.md` | リファクタリング後の全テスト PASS 確認結果 |

## 完了条件

- [ ] 重複した try-catch パターンが整理されている
- [ ] Permission 関連メソッドの命名が一貫している
- [ ] ナビゲーション短縮: 深いネストや長い呼び出しチェーンが整理されている
- [ ] `handlePermissionCheck` が SRP（単一責務）を維持している
- [ ] DIP 準拠の確認済み（具象クラスへの直接依存なし、P61対策）
- [ ] P49 準拠: type predicate 内で `as` キャストを使用せず `in` 演算子で実行時検証している
- [ ] `any` 型不使用・型アサーションによるバリデーション回避なし
- [ ] P45 準拠: 引数命名が実際の値のセマンティクスと一致している
- [ ] リファクタリング後も全テスト 275+ ケースが PASS
- [ ] リファクタリング後のカバレッジが Phase 7 の値以上
- [ ] 成果物が `outputs/phase-8/` に記録済み
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase 実行開始時に、以下のサブタスクを作成すること:

1. 現在のコード品質確認
2. 重複排除チェック（try-catch、retry ループ）
3. 命名一貫性チェック（メソッド・変数・定数）
4. SOLID 原則の確認（SRP・DIP・OCP）
5. コーディング規約チェック（any型・型アサーション）
6. リファクタリングの実施（必要な場合）
7. リファクタリング後のテスト実行（変更ごとに確認）
8. 最終テスト確認（275+ケース全PASS、カバレッジ維持）
9. 成果物の作成・配置
10. 完了条件の検証

## タスク100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-06-005-A-hook-fallback-integration --phase 8
```

## 次のPhase

Phase 9: 品質保証
