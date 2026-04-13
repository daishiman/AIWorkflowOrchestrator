# Phase 2: 設計

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 2                                         |
| タスクID   | TASK-CRON-SEMANTIC-VALIDATION-001         |
| 機能名     | cronExpression 意味論的バリデーション改善 |
| 前提Phase  | Phase 1                                   |
| 後続Phase  | Phase 3                                   |
| ステータス | completed                                 |
| 作成日     | 2026-04-12                                |

---

## 目的

意味論的バリデーション追加のための設計を確定する。バリデーションフロー・実装方式・公開契約・UI影響確認の4つの設計観点を固定する。

---

## 実行タスク

1. **バリデーションフロー設計**: 3段階チェック（構文 → 値域 → 意味論）の処理フローを設計する
2. **実装方式設計**: 純 TypeScript の手動実装で十分かを確定する
3. **関数シグネチャ設計**: `validateCronSemantics` の入出力と公開契約を設計する
4. **エラーメッセージ設計**: 日本語のエラーメッセージを設計する
5. **UI影響設計**: ScheduleDialog / ConversationRoundStep への伝播方法を確認する
6. **ブラウザ対応設計**: Renderer 側（ブラウザ環境）での動作保証を設計する

---

## 参照資料

| 参照資料              | パス                                                                            | 説明                 |
| --------------------- | ------------------------------------------------------------------------------- | -------------------- |
| 要件定義書            | `outputs/phase-1/requirements-definition.md`                                    | Phase 1 成果物       |
| 受け入れ基準          | `outputs/phase-1/acceptance-criteria.md`                                        | AC-1〜AC-5           |
| P50チェック結果       | `outputs/phase-1/p50-check-result.md`                                           | 既実装コード調査結果 |
| トレーサビリティ行列  | `outputs/phase-1/traceability-matrix.md`                                        | Phase 1 成果物       |
| 現行バリデーション    | `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`                    | 変更対象             |
| ScheduleDialog        | `apps/desktop/src/renderer/views/ScheduleManager/components/ScheduleDialog.tsx` | 既存UIの確認         |
| ConversationRoundStep | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`   | 既存UIの確認         |

---

## 実行手順

### 1. バリデーションフロー設計

現行の2段階チェックを3段階に拡張する:

```
[入力: cron式文字列]
      ↓
[Stage 1: 構文チェック]
  - 空文字チェック
  - 5フィールド分割チェック
  → NG: "cron式は5フィールド必要です" を返す
      ↓
[Stage 2: 値域チェック]
  - 各フィールドの数値範囲チェック（FIELD_RANGES を使用）
  → NG: "cron式の形式が正しくありません" を返す
      ↓
[Stage 3: 意味論チェック（新規追加）]
  - 日・月・曜日が単純な形式のときだけ判定する
  - 月と日の組み合わせが実在する日付か確認する
  - 2月29日は有効、2月30日・2月31日といった不可能な日付のみを拒否する
  → NG: "指定した日付は存在しません（例: 2月31日）" を返す
      ↓
[正常: null を返す]
```

### 2. 実装方式設計

**採用方針**: 外部依存を追加せず、純 TypeScript の手動実装で固定する。

```typescript
const MAX_DAYS_PER_MONTH: Record<number, number> = {
  1: 31,
  2: 29,
  3: 31,
  4: 30,
  5: 31,
  6: 30,
  7: 31,
  8: 31,
  9: 30,
  10: 31,
  11: 30,
  12: 31,
};

function validateCronSemantics(fields: string[]): string | null {
  const dayField = fields[2];
  const monthField = fields[3];
  const weekdayField = fields[4];

  // すべて単純な数値かつ weekday が * の場合だけ、存在しない日付を判定する。
  if (
    !/^\d+$/.test(dayField) ||
    !/^\d+$/.test(monthField) ||
    weekdayField !== "*"
  ) {
    return null;
  }

  const day = Number(dayField);
  const month = Number(monthField);
  const maxDays = MAX_DAYS_PER_MONTH[month];
  if (!maxDays || day > maxDays) {
    return "指定した日付は存在しません（例: 2月31日）";
  }

  return null;
}
```

- メリット: ブラウザ安全、依存追加なし、既存の `string | null` 契約を維持できる
- デメリット: 範囲・列挙・ステップ・weekday 指定を含む複合式は既存の構文/値域チェックに委ねる

### 3. 関数シグネチャ設計

```typescript
/**
 * cron 式の意味論的バリデーションを行う。
 * 単純な日付指定に限り、存在しない日付を拒否する。
 *
 * @param fields - 5フィールドに分割済みの cron 式
 * @returns エラーメッセージ文字列、または有効なら null
 */
function validateCronSemantics(fields: string[]): string | null;

/**
 * cron 式の 5 フィールド構文、値域、意味論を順に検証する。
 */
export function validateCronExpression(value: string): string | null;
```

`validateCronExpression` は Stage 1〜3 を順番に呼び出し、最初のエラーを返す。公開契約は `string | null` のまま変更しない。

### 4. エラーメッセージ設計

| エラー種別     | 日本語メッセージ                            |
| -------------- | ------------------------------------------- |
| 存在しない日付 | `指定した日付は存在しません（例: 2月31日）` |

### 5. UI影響設計

- `ScheduleDialog` は既に `validateCronExpression` の戻り値で保存可否と alert を制御しているため、ソース変更は不要
- `ConversationRoundStep` は `validateSkillWizardScheduleConfig` 経由で同じ validator を参照しているため、ソース変更は不要
- UI の直接変更は行わず、ScheduleDialog / ConversationRoundStep が新しいメッセージをそのまま表示する前提で扱う

### 6. ブラウザ対応設計

- `validateCronSemantics` は Renderer（ブラウザ）環境で実行されるため、Node.js 専用 API を使用しない
- 外部ライブラリを追加しないため、バンドルサイズ増加は発生しない
- 追加するのは純粋な同期関数のみであり、既存の入力フローに遅延を持ち込まない

---

## 統合テスト連携【必須】

- Stage 1〜3 が順番に動作し、最初のエラーのみ返すことを確認する
- ScheduleDialog / ConversationRoundStep のエラー表示が `validateCronExpression` の戻り値と連動することを確認する
- ブラウザ環境（Electron Renderer）での動作を確認する
- 統合ログは `outputs/phase-2/` に保存する

---

## 成果物

| 成果物                   | パス                                          | 説明                                            |
| ------------------------ | --------------------------------------------- | ----------------------------------------------- |
| バリデーションフロー設計 | `outputs/phase-2/validation-flow-design.md`   | 3段階バリデーション処理フロー                   |
| 実装方式設計             | `outputs/phase-2/library-selection-design.md` | 純TS実装の採用根拠                              |
| 関数シグネチャ設計       | `outputs/phase-2/type-definition-design.md`   | validateCronSemantics / validateCronExpression  |
| UI影響設計               | `outputs/phase-2/ui-integration-design.md`    | ScheduleDialog / ConversationRoundStep への影響 |

---

## 完了条件

- [ ] バリデーションフロー（3段階）を図と文章で設計した
- [ ] 純TS実装の採用根拠を文書化した
- [ ] `validateCronSemantics` と `validateCronExpression` の契約を設計した
- [ ] エラーメッセージ（日本語）を定義した
- [ ] ScheduleDialog / ConversationRoundStep の影響範囲を設計した
- [ ] ブラウザ対応（Renderer 環境）を考慮した設計であることを確認した
- [ ] 本Phase内の全タスクを100%実行完了

---

## サブタスク管理

1. Phase 1 成果物の確認
2. バリデーションフロー設計
3. ライブラリ選定設計
4. 型定義・エラーメッセージ設計
5. 関数シグネチャ設計
6. UI統合設計
7. ブラウザ対応確認
8. 成果物の出力
9. 完了条件の判定

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-CRON-SEMANTIC-VALIDATION-001
```

---

## 次のPhase

Phase 3: 設計レビューゲート
