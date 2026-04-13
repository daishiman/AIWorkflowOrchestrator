# Phase 2: 設計

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 2                                       |
| Phase名    | 設計                                    |
| 前提Phase  | Phase 1                                 |
| 後続Phase  | Phase 3                                 |
| ステータス | 未実施                                  |
| 作成日     | 2026-04-13                              |
| 機能名     | TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 |

---

## 目的

Phase 1 で確定した要件に基づき、`monthly` 分岐の `dayOfMonth` ガード処理の実装方針と
テスト設計を確定する。`weekly` ガードとの対称性を保つ設計とする。

## 背景

`weekly` 分岐のガードは以下のパターンで実装されている:

```typescript
case "weekly": {
  if ((weekdays ?? []).length === 0) {
    return "";
  }
  const sorted = [...new Set(weekdays)].sort((a, b) => a - b);
  return `${minute} ${hour} * * ${sorted.join(",")}`;
}
```

`monthly` 分岐にも同様の早期リターンパターンを適用する。

## 多角的設計方針

- 論理分析系: ガード条件が不正値を取りこぼさないかを確認する
- 構造分解系: `monthly` 分岐の責務を最小の早期リターンに分ける
- メタ・抽象系: 「月次設定は 1-31 の整数」という前提をコードに明示する
- 発想・拡張系: `NaN` や小数を 1 つの式でまとめて拒否する
- システム系: UI バリデーションが壊れても converter が安全側に倒れる
- 戦略・価値系: 最小差分で最大の安全性を確保する
- 問題解決系: 重複したガード条件を増やさず、根本原因を 1 箇所で止める

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ガード処理実装設計

**目的**: 実装する変更差分を設計として確定する

**実行手順**:

1. `apps/desktop/src/renderer/utils/cronConverter.ts` の `monthly` 分岐の現状コードを確認する
2. 以下の実装設計を確定する:

   **修正前**:

   ```typescript
   case "monthly":
     return `${minute} ${hour} ${dayOfMonth} * *`;
   ```

   **修正後**:

   ```typescript
   case "monthly": {
     if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
       return "";
     }
     return `${minute} ${hour} ${dayOfMonth} * *`;
   }
   ```

3. `Number.isInteger(dayOfMonth)` を先頭に置く理由を記録する
4. ブロック構文（`{}` で囲む）を使用する理由（`weekly` との対称性）を記録する

**期待される成果物**:

- `outputs/phase-2/implementation-design.md`（ガード処理設計書）

---

### タスク2: JSDoc 更新設計

**目的**: AC-7 に対応するJSDoc更新内容を設計する

**実行手順**:

1. `cronConverter.ts` の `visualConfigToCron` 関数の現状 JSDoc を確認する
2. 以下の更新設計を確定する:

   **追記内容**:

   ```typescript
   /**
    * @returns cron 式文字列。
    *   - `frequency="weekly"` かつ `weekdays=[]` の場合は空文字 `""` を返す。
    *   - `frequency="monthly"` かつ `dayOfMonth` が非整数、または範囲外（< 1 または > 31）の場合は空文字 `""` を返す。
    *
    * @remarks
    * 空曜日・不正な日付は有効な cron 式に変換できないため、ガード処理では例外を投げず空文字を返す。
    * 呼び出し元は既存のバリデーションで空文字を無効入力として扱う。
    */
   ```

3. 既存 JSDoc の変更箇所を特定する

**期待される成果物**:

- `outputs/phase-2/jsdoc-design.md`（JSDoc更新設計書）

---

### タスク3: テスト設計

**目的**: Phase 4 で作成するテストケースを設計する（TDD Red フェーズの準備）

**実行手順**:

1. `cronConverter.edge.test.ts` の既存テスト構造を確認する
2. 追加するテストケース TC-11〜TC-15 を設計する:

   | TC番号 | 入力                                 | 期待値         | 対応AC |
   | ------ | ------------------------------------ | -------------- | ------ |
   | TC-11  | `frequency="monthly", dayOfMonth=0`  | `""`           | AC-1   |
   | TC-12  | `frequency="monthly", dayOfMonth=32` | `""`           | AC-2   |
   | TC-13  | `frequency="monthly", dayOfMonth=-1` | `""`           | AC-3   |
   | TC-14  | `frequency="monthly", dayOfMonth=1`  | `"0 9 1 * *"`  | AC-4   |
   | TC-15  | `frequency="monthly", dayOfMonth=31` | `"0 9 31 * *"` | AC-5   |

3. テストブロックの追加位置（ファイル末尾）を確定する
4. テスト記述形式（`describe` / `it` の構成）を設計する

**期待される成果物**:

- `outputs/phase-2/test-design.md`（テスト設計書）

---

### タスク4: 変更影響範囲分析

**目的**: この変更による影響範囲を確認し、意図しない副作用がないことを確認する

**実行手順**:

1. `cronConverter.ts` の `visualConfigToCron` 関数を呼び出している箇所を `grep` で確認する
2. `monthly` 分岐への変更が既存の正常ケース（`dayOfMonth=1〜31`）に影響しないことを確認する
3. 影響範囲分析結果を記録する

**期待される成果物**:

- `outputs/phase-2/impact-analysis.md`（影響範囲分析書）

---

## 参照資料

| 参照資料         | パス                                                                         | 内容             |
| ---------------- | ---------------------------------------------------------------------------- | ---------------- |
| 対象実装ファイル | `apps/desktop/src/renderer/utils/cronConverter.ts`                           | 現状実装確認     |
| テストファイル   | `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts`                | テスト構造確認   |
| 型定義           | `apps/desktop/src/renderer/types/visualCronConfig.ts`                        | dayOfMonth型定義 |
| Phase 1成果物    | `docs/30-workflows/TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001/outputs/phase-1/` | 要件・AC参照     |

---

## 成果物

| 成果物         | パス                                       | 内容             |
| -------------- | ------------------------------------------ | ---------------- |
| 実装設計書     | `outputs/phase-2/implementation-design.md` | ガード処理設計   |
| JSDoc設計書    | `outputs/phase-2/jsdoc-design.md`          | JSDoc更新設計    |
| テスト設計書   | `outputs/phase-2/test-design.md`           | TC-11〜TC-15設計 |
| 影響範囲分析書 | `outputs/phase-2/impact-analysis.md`       | 変更影響範囲     |

---

## 統合テスト連携

- Phase 4 の TDD Red フェーズで TC-11〜TC-15 を実装する
- Phase 5 の TDD Green フェーズで実装後、全テスト Green を確認する

---

## 完了条件

- [ ] ガード処理の実装方針が確定している（修正前/修正後コードが明示されている）
- [ ] `Number.isInteger(dayOfMonth)` による非整数値ガードの要否が決定されている
- [ ] JSDoc 更新内容が確定している
- [ ] TC-11〜TC-15 のテストケース設計が完了している
- [ ] 変更影響範囲が分析されている
- [ ] `outputs/phase-2/` 配下の全成果物が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜4）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## Phase実行記録（完了後に記録）

```markdown
## Phase 2 実行記録

### 実行タスク

- タスク1: ガード処理実装設計 - [結果]
- タスク2: JSDoc更新設計 - [結果]
- タスク3: テスト設計 - [結果]
- タスク4: 変更影響範囲分析 - [結果]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001/phase-3-design-review.md`
