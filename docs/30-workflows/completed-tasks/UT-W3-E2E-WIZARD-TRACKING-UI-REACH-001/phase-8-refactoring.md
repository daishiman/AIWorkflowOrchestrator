# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 8                                                        |
| Phase名    | リファクタリング                                         |
| タスクID   | UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001                   |
| 機能名     | スキルウィザード trackEvent の E2E UI 到達確認テスト追加 |
| タスク種別 | E2E テスト追加（NON_VISUAL から E2E 昇格）               |
| 前提Phase  | Phase 7                                                  |
| 後続Phase  | Phase 9                                                  |
| ステータス | 完了                                                     |
| 作成日     | 2026-04-12                                               |

---

## 目的

Phase 4〜7 で作成した E2E テストコードおよびヘルパーの重複・命名揺れを除去し、
保守性・可読性を向上させる。

変更内容は「対象/Before/After/理由」テーブル形式で記録し、変更の追跡可能性を確保する。

---

## 背景

Phase 4〜7 での実装では、正確性を優先してテストケース・スタブを記述した。
リファクタリングフェーズでは以下の観点でコード品質を向上させる：

1. テストヘルパー関数の重複除去（`wizard-tracking-stub.ts` 内の共通処理を関数化）
2. `wizard-tracking-stub.ts` の型安全性向上（`as unknown as X` 型アサーションの排除）
3. 命名揺れ修正（`trackEvent`/`TrackEventEntry`/`SkillWizardEvents` 等の統一）
4. `skill-wizard-tracking.spec.ts` のテストケース記述スタイルの統一

---

## 実行タスク

> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `outputs/phase-8/` へ記録する。

### タスク1: テストヘルパー関数の重複除去

**目的**: `skill-wizard-tracking.spec.ts` および `wizard-tracking-stub.ts` 内の重複処理を特定・統合する

**実行手順**:

1. `apps/desktop/e2e/skill-wizard-tracking.spec.ts` を通読し、複数テストケースで繰り返されているセットアップ処理を特定する
2. `apps/desktop/e2e/helpers/wizard-tracking-stub.ts` を通読し、重複している関数・定数を特定する
3. 共通ヘルパー関数として抽出可能な箇所を特定する
4. 特定結果を `outputs/phase-8/refactoring-log.md` に「対象/Before/After/理由」テーブル形式で記録する

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md`（重複除去セクション）

---

### タスク2: `wizard-tracking-stub.ts` の型安全性向上

**目的**: E2E スタブが本番型定義と型整合するよう、型アサーションを排除し適切な型注釈を付与する

**実行手順**:

1. `wizard-tracking-stub.ts` 内の `as unknown as X` 型アサーションを全件特定する
2. 本番コードの型定義（`packages/shared/` または `apps/desktop/src/` 配下）を参照し、適切な型に置換する
3. `TrackEventEntry` と `SkillWizardEvents` を適用できる箇所を特定する
4. 修正案を `outputs/phase-8/refactoring-log.md` の Before/After 列に記録する

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md`（型安全性改善セクション追記）

---

### タスク3: 命名揺れ修正

**目的**: `trackEvent` に関連するシンボル・変数名の表記を統一する

**実行手順**:

1. `skill-wizard-tracking.spec.ts` と `wizard-tracking-stub.ts` 内の `trackEvent` 関連シンボルを全件抽出する
2. 本番コード（`SkillWizard` コンポーネント）の命名規則を確認する
3. 命名揺れ（例: `trackEventCalls`、`TrackEventEntry`、`SkillWizardEvents`）を本番コードの規則に揃える修正案を作成する
4. 修正案を `outputs/phase-8/refactoring-log.md` に追記する

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md`（命名揺れ修正セクション追記）

---

### タスク4: 変更内容の適用と確認

**目的**: ドラフトした修正案を実際のファイルに適用し、変更後もテストが通ることを確認する

**実行手順**:

1. `outputs/phase-8/refactoring-log.md` の修正案を確認する
2. 変更量・破壊的変更の有無を確認してから適用する
3. 変更適用後に `pnpm --filter @repo/desktop test:e2e` を実行し、全テストが引き続き PASS することを確認する
4. `pnpm --filter @repo/desktop typecheck` を実行し、型エラーがないことを確認する
5. 確認完了を `outputs/phase-8/refactoring-log.md` に記録する

**期待される成果物**:

- 変更適用済みの対象ファイル（`skill-wizard-tracking.spec.ts` / `wizard-tracking-stub.ts`）
- `outputs/phase-8/refactoring-log.md`（適用完了の記録）

---

## 参照資料

| 参照資料               | パス                                                          | 内容                                 |
| ---------------------- | ------------------------------------------------------------- | ------------------------------------ |
| E2E テスト実装ファイル | `apps/desktop/e2e/skill-wizard-tracking.spec.ts`              | リファクタリング対象（テストケース） |
| E2E スタブヘルパー     | `apps/desktop/e2e/helpers/wizard-tracking-stub.ts`            | リファクタリング対象（スタブ定義）   |
| Phase 1 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`                      | AC-1〜AC-9（リファクタ後も充足）     |
| Vite E2E 設定          | `apps/desktop/vite.e2e.config.ts`                             | E2E alias 設定                       |
| 本番型定義             | `packages/shared/src/types/` または `apps/desktop/src/types/` | スタブの型整合確認に使用             |

---

## 統合テスト連携

- 変更適用後に `pnpm --filter @repo/desktop test:e2e` を実行し、全テストケース（TC-03/05/06/08/09/11/12 相当）が PASS することを確認する
- リファクタリングによってテストの動作が変わっていないことを確認する

---

## 成果物

| 成果物               | パス                                 | 内容                                         |
| -------------------- | ------------------------------------ | -------------------------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | 対象/Before/After/理由テーブル形式の変更記録 |

**`outputs/phase-8/refactoring-log.md` のフォーマット**:

```markdown
# Phase 8 リファクタリング記録

## リファクタリング概要

- 対象ファイル数: N 件
- 変更箇所数: N 箇所
- 変更種別: 重複除去 / 型安全性向上 / 命名揺れ修正

## 変更詳細

| 対象ファイル                  | 対象箇所                            | Before                   | After | 理由         |
| ----------------------------- | ----------------------------------- | ------------------------ | ----- | ------------ |
| skill-wizard-tracking.spec.ts | describe ブロックのセットアップ     | ...                      | ...   | 重複除去     |
| wizard-tracking-stub.ts       | TrackEventEntry の重複定義          | TrackEventEntry を共通化 | ...   | 型安全性向上 |
| trackEvent.e2e-stub.ts        | window.\_\_trackEventCalls への記録 | 記録処理を共通化         | ...   | 重複除去     |

## AC-1〜AC-9 再確認

| AC番号 | 基準 | リファクタ後の充足状況 |
| ------ | ---- | ---------------------- |
| AC-1   | ...  | PASS                   |
| ...    | ...  | ...                    |
```

---

## 完了条件

- [ ] テストヘルパー関数の重複除去が完了していること
- [ ] `wizard-tracking-stub.ts` の型安全性向上（`as unknown as X` 型アサーションの排除）が完了していること
- [ ] 命名揺れ修正（`trackEvent` 統一）が完了していること
- [ ] 変更内容が `outputs/phase-8/refactoring-log.md` に「対象/Before/After/理由」テーブル形式で記録されていること
- [ ] リファクタリング後も `pnpm --filter @repo/desktop test:e2e` の全テストが PASS していること
- [ ] リファクタリング後も Phase 1 の AC-1〜AC-9 が全て充足されていること
- [ ] 本Phase内の全タスクを100%実行完了

---

## タスク100%実行確認【必須】

- [ ] タスク1（テストヘルパー関数の重複除去）を100%完了し、完了を明記した
- [ ] タスク2（型安全性向上）を100%完了し、完了を明記した
- [ ] タスク3（命名揺れ修正）を100%完了し、完了を明記した
- [ ] タスク4（変更内容の適用と確認）を100%完了し、完了を明記した
- [ ] 成果物 `outputs/phase-8/refactoring-log.md` が生成されていることを確認した

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9（品質保証）へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 8 実行記録

### 実行タスク

- テストヘルパー関数の重複除去: [結果]
- wizard-tracking-stub.ts の型安全性向上: [結果]
- 命名揺れ修正: [結果]
- 変更内容の適用と確認: [結果]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001/phase-9-quality-assurance.md`
