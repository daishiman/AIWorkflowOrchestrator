# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| 機能名   | terminal-handoff-adapter-placement        |
| Phase    | 8 - リファクタリング                      |
| 作成日   | 2026-03-22                                |
| 前Phase  | Phase 7（カバレッジ確認）                 |
| 次Phase  | Phase 9（品質検証）                       |
| タスクID | UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001 |

## 目的

Phase 5 で実装し、Phase 7 でカバレッジ基準を達成したコードに対して、TDD サイクルの Refactor ステップとしてコード品質を改善する。全てのリファクタリングはテストが継続して PASS することを前提に行う。

## 前提条件

- Phase 7 のカバレッジ基準を全て達成済み
- 既存テストが全 PASS している状態
- 本タスクは UI 変更を伴わない（HandoffBlock.tsx の型 import のみ変更）

## リファクタリング対象候補

### 候補 1: sanitize 関数の共通化

**対象ファイル**:

- `apps/desktop/src/main/adapters/handoff/toHandoffGuidance.ts`
- `apps/desktop/src/main/runtime/TerminalHandoffBuilder.ts`（既存）

**確認事項**:

- toHandoffGuidance 内の sanitize 処理と TerminalHandoffBuilder の `sanitizePrompt` が重複していないか確認
- 重複がある場合、共通ユーティリティ関数として抽出を検討

**判断基準**:

- 同一ロジックが 2 箇所以上に存在する場合 → 共通化を実施
- 類似だが微妙に異なるロジックの場合 → コメントで差異を明記し、共通化は未タスク化

### 候補 2: kind 別 build 関数の命名・構造統一

**対象ファイル**:

- `apps/desktop/src/main/adapters/handoff/toHandoffGuidance.ts`

**確認事項**:

- kind 別の変換関数（approval / error / info 等）が統一的な命名規則に従っているか
- 関数シグネチャが統一されているか（引数の順序・型・戻り値）
- switch/case や Record パターンの一貫性

**改善方針**:

- 命名: `buildXxxGuidance` または `toXxxGuidance` で統一
- 戻り値型: 全関数が `HandoffGuidance` を返すことを型レベルで保証
- Record パターン: `Record<HandoffKind, BuildFunction>` でユニオン型網羅を活用

### 候補 3: 不要な import の整理

**対象ファイル**:

- `apps/desktop/src/main/adapters/handoff/toHandoffGuidance.ts`
- `apps/desktop/src/main/adapters/handoff/index.ts`（存在する場合）

**確認事項**:

- 未使用の import が残っていないか
- import の順序が規約に従っているか（外部 → 内部 → 型）
- barrel export（index.ts）が適切に構成されているか

### 候補 4: コード品質改善

**対象ファイル**:

- `apps/desktop/src/main/adapters/handoff/toHandoffGuidance.ts`

**改善項目**:

- 型推論の活用: 明示的な型注釈が不要な箇所は省略（TypeScript の推論に委ねる）
- const assertion の適用: リテラル型が適切な箇所に `as const` を適用
- readonly の適用: 変更されないプロパティに `readonly` 修飾子を追加
- early return パターン: ネストが深い箇所を early return で平坦化
- JSDoc コメント: 公開関数に Purpose / Params / Returns を記載

## 実行手順

### Task 1: リファクタリング対象の評価

1. 候補 1-4 を順に確認し、実施可否を判断する
2. 各候補に対して以下を記録:
   - 実施する / しない
   - 理由
   - 影響範囲

### Task 2: リファクタリング実施

1. 各変更の前にテストが PASS していることを確認:

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/handoff/__tests__/toHandoffGuidance.test.ts
```

2. 変更を 1 つずつ適用し、その都度テストを実行:

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/handoff/__tests__/toHandoffGuidance.test.ts
```

3. テストが FAIL した場合、直前の変更を即座に取り消す

### Task 3: sanitize 関数の共通化判定（候補 1 の詳細手順）

1. 重複確認:

```bash
grep -n "sanitize" apps/desktop/src/main/adapters/handoff/toHandoffGuidance.ts
grep -n "sanitize" apps/desktop/src/main/runtime/TerminalHandoffBuilder.ts
```

2. 共通化する場合の配置先検討:
   - `apps/desktop/src/main/adapters/handoff/sanitize.ts`（handoff 固有の場合）
   - `apps/desktop/src/main/utils/sanitize.ts`（汎用の場合）

3. 共通化しない場合の理由を記録

### Task 4: 統合テスト連携確認

1. リファクタリング後、既存の TerminalHandoffBuilder テストが影響を受けていないことを確認:

```bash
cd apps/desktop && pnpm vitest run --reporter=verbose 2>&1 | grep -i "handoff"
```

2. 確認項目:
   - [ ] toHandoffGuidance テストが全 PASS
   - [ ] TerminalHandoffBuilder テストが全 PASS（影響なし）
   - [ ] sanitize 関数を共通化した場合、両方のテストで使用されていること
   - [ ] import パスの変更が正しく反映されていること

### Task 5: カバレッジ再確認

リファクタリングによってカバレッジが低下していないことを確認:

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/handoff/__tests__/ --coverage
```

- [ ] Line Coverage が Phase 7 の結果から低下していない
- [ ] Branch Coverage が Phase 7 の結果から低下していない
- [ ] Function Coverage が Phase 7 の結果から低下していない

## リファクタリング原則

- **Red-Green-Refactor**: テストが GREEN の状態でのみリファクタリングを実施
- **小さなステップ**: 1 つの変更ごとにテストを実行し、PASS を確認
- **振る舞いの保持**: 外部から見た振る舞いを一切変更しない
- **YAGNI**: 「将来必要になるかもしれない」変更は行わない
- **SOLID**: 単一責務・開放閉鎖・依存性逆転の各原則に沿って改善

## 成果物

| 成果物                   | パス                                      |
| ------------------------ | ----------------------------------------- |
| リファクタリング後コード | `apps/desktop/src/main/adapters/handoff/` |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                                       | 仕様参照先                                          |
| -------------- | ---------------------------------------------- | --------------------------------------------------- |
| アーキテクチャ | リファクタリング対象が正しい層に配置されている | `aiworkflow-requirements: architecture-overview.md` |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                                   | 仕様参照先                                          |
| -------------------- | ------------------------------------------ | --------------------------------------------------- |
| バックエンド（Main） | adapter リファクタリングは Main Process 層 | `aiworkflow-requirements: architecture-overview.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. リファクタリング候補の評価
3. リファクタリング実行
4. テスト継続成功確認
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/terminal-handoff-adapter-placement --phase 8
```

## 完了条件

- [ ] リファクタリング対象候補 1-4 の全てについて実施可否を判断した
- [ ] 実施した全てのリファクタリングについてテストが PASS した
- [ ] sanitize 関数の重複有無を確認し、判断結果を記録した
- [ ] kind 別 build 関数の命名・構造が統一されている（該当する場合）
- [ ] 不要な import が除去されている
- [ ] 型推論・const assertion・readonly が適切に適用されている（該当する場合）
- [ ] カバレッジが Phase 7 の結果から低下していない
- [ ] 統合テスト連携確認が全項目 PASS した
- [ ] 既存 TerminalHandoffBuilder テストに影響がないことを確認した
- [ ] **本Phase内の全タスクを100%実行完了**

## 次Phase

Phase 9: 品質検証（`phase-9-quality.md`）
