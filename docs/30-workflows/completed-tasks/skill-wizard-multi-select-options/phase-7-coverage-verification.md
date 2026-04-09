# Phase 7: カバレッジ確認 - スキルウィザード複数選択対応

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 7                                 |
| 機能名 | skill-wizard-multi-select-options |
| 作成日 | 2026-04-08                        |
| 前提   | Phase 6（テスト拡充）完了済み     |

## 目的

Phase 4〜6 で作成・拡充したテスト群のカバレッジを測定し、
複数選択対応の変更コード（concern）に対して十分な検証密度があることを確認する。

カバレッジ目標を下回った場合は、不足している観点を特定して追加テストを作成する。

---

## 1. カバレッジ確認コマンド

### 基本コマンド

```bash
pnpm --filter @repo/desktop exec vitest run --coverage
```

### 特定ファイルのみ対象にする場合

```bash
# ConversationRoundStep のみ
pnpm --filter @repo/desktop exec vitest run --coverage \
  --reporter=verbose \
  src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx

# ApplySummaryCard のみ
pnpm --filter @repo/desktop exec vitest run --coverage \
  --reporter=verbose \
  src/renderer/components/skill/wizard/__tests__/ApplySummaryCard.test.tsx

# SkillCreateWizard のみ
pnpm --filter @repo/desktop exec vitest run --coverage \
  --reporter=verbose \
  src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
```

### カバレッジレポートをHTML形式で出力する場合

```bash
pnpm --filter @repo/desktop exec vitest run --coverage --reporter=html
# coverage/index.html をブラウザで開いて確認
```

---

## 2. カバレッジ目標

| 対象ファイル                                | ライン (line) | ブランチ (branch) | 備考                                              |
| ------------------------------------------- | ------------- | ----------------- | ------------------------------------------------- |
| `ConversationRoundStep.tsx`                 | 80% 以上      | 60% 以上          | トグルロジック・Q3特殊処理が主要分岐              |
| `ApplySummaryCard.tsx`                      | 80% 以上      | 60% 以上          | 未回答判定・警告表示が主要分岐                    |
| `SkillCreateWizard.tsx`（wizard関連部分）   | 80% 以上      | 60% 以上          | `resolveExternalIntegration` の先頭値参照が分岐点 |
| `packages/shared/.../skillCreator.ts`（型） | 対象外        | 対象外            | 型定義のみのため実行コードなし                    |

**補足**: ブランチカバレッジ 60% は最低ラインであり、可能であれば 75% 以上を目指す。
特に `handleOptionSelect` のトグルロジック（追加/解除の2分岐）と
Q3 の `scheduleConfig` 制御（展開/折りたたみの2分岐）は必ずカバーすること。

---

## 3. カバレッジ確認観点（concern × command × dependency edge）

### 3-1. concern（確認すべき変更コードの関心領域）

| concern ID | 関心領域                                              | 対象コード箇所                                                                                         |
| ---------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| C-01       | トグル追加分岐                                        | `handleOptionSelect`: `!isSelected` のとき `[...current, option]`                                      |
| C-02       | トグル解除分岐                                        | `handleOptionSelect`: `isSelected` のとき `current.filter(o => o !== option)`                          |
| C-03       | Q3 定期実行展開分岐                                   | `hasSchedule = nextSelectedOptions.includes("定期実行")` が `true` のとき `scheduleConfig` を設定      |
| C-04       | Q3 定期実行折りたたみ分岐                             | `hasSchedule` が `false` のとき `scheduleConfig = undefined`、`scheduleTouched = false`                |
| C-05       | `isQuestionAnswered` 判定                             | `selectedOptions.length > 0` と `freeText.trim().length > 0` と `scheduleConfig !== undefined` の3分岐 |
| C-06       | `createQuestionAnswer` 選択肢一致分岐                 | `options.includes(defaultValue)` が `true` のとき `selectedOptions: [defaultValue]`                    |
| C-07       | `createQuestionAnswer` 選択肢不一致分岐               | `options.includes(defaultValue)` が `false` のとき `freeText: defaultValue`                            |
| C-08       | `createQuestionAnswer` null 分岐                      | `defaultValue` が `null` のとき `selectedOptions: []`                                                  |
| C-09       | `getUnansweredDefaults` 未回答判定                    | `selectedOptions.length === 0 && freeText === ""` の判定                                               |
| C-10       | `isQ5Unanswered` 判定                                 | Q5 の `selectedOptions.length === 0` による未回答判定                                                  |
| C-11       | `resolveExternalIntegration` 先頭値参照               | `selectedOptions[0] ?? ""` の先頭値取得・トリム処理                                                    |
| C-12       | `handleCronChange` selectedOptions フォールバック     | 「定期実行」が `selectedOptions` に含まれない場合の自動追加                                            |
| C-13       | `handleTimezoneChange` selectedOptions フォールバック | 同上（タイムゾーン変更時）                                                                             |

---

### 3-2. command（各 concern をカバーするテストコマンドの対応表）

| concern ID | カバーするテストID（Phase 4〜6）  | テストの概要                                          |
| ---------- | --------------------------------- | ----------------------------------------------------- |
| C-01       | AC-01, RG-01（1ボタン追加）       | 未選択ボタンをクリック → `selectedOptions` に追加     |
| C-02       | AC-02, FP-02, RG-01               | 選択済みボタンをクリック → `selectedOptions` から除去 |
| C-03       | AC-04, FP-04, FP-06, RG-04        | 「定期実行」選択 → ScheduleConfigInput 展開           |
| C-04       | AC-05, FP-05, FP-07               | 「定期実行」解除 → ScheduleConfigInput 折りたたみ     |
| C-05       | AC-03, FP-01, FP-03, RG-03, RG-04 | 3条件すべてのパスを個別に確認                         |
| C-06       | AC-07, RG-02                      | SmartDefault が選択肢に含まれる値を返すケース         |
| C-07       | AC-08                             | SmartDefault が選択肢に含まれない値を返すケース       |
| C-08       | AC-03, FP-01                      | SmartDefault が null のケース（初期状態）             |
| C-09       | FP-08, FP-09, RG-06               | 未回答/回答済みの境界判定                             |
| C-10       | FP-10                             | Q5 未回答時の警告表示                                 |
| C-11       | AC-13, FP-11, FP-12               | `selectedOptions[0]` の先頭値参照                     |
| C-12       | （実装時のコメント確認）          | cron 入力中に「定期実行」自動追加                     |
| C-13       | （実装時のコメント確認）          | タイムゾーン変更中に「定期実行」自動追加              |

---

### 3-3. dependency edge（依存関係の境界・統合点）

以下の「境界を越えるデータフロー」が正しく検証されていることを確認する。

| edge ID | 境界                                                                                   | 確認観点                                                                       |
| ------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| E-01    | `ConversationRoundStep` → `onAnswersChange` コールバック                               | `selectedOptions[]` が正しい内容で親（`SkillCreateWizard`）に渡ること          |
| E-02    | `SkillCreateWizard.DEFAULT_ANSWERS` → `ConversationRoundStep`                          | 初期 `selectedOptions: []` が各問に渡ること                                    |
| E-03    | `SmartDefaultResult`（`string\|null`）→ `QuestionAnswer.selectedOptions`（`string[]`） | `createQuestionAnswer` で正しく変換されること                                  |
| E-04    | `ConversationAnswers.q5` → `resolveExternalIntegration`                                | `selectedOptions[0]` が正しく参照され、外部統合判定に使われること              |
| E-05    | `QuestionAnswer.scheduleConfig` → ScheduleConfigInput 表示                             | `scheduleConfig` の有無が DOM に正しく反映されること                           |
| E-06    | `ConversationAnswers` → `ApplySummaryCard` 未回答判定                                  | `selectedOptions.length === 0` が `getUnansweredDefaults` の結果に影響すること |

---

## 4. カバレッジレポートの読み方と判定基準

### 4-1. vitest カバレッジ出力の確認箇所

```
------------------------------------------------------|---------|----------|---------|---------|
File                                                  | % Stmts | % Branch | % Funcs | % Lines |
------------------------------------------------------|---------|----------|---------|---------|
 wizard/ConversationRoundStep.tsx                     |   84.2  |   63.4   |   90.0  |   84.2  |
 wizard/ApplySummaryCard.tsx                          |   88.0  |   71.2   |   85.7  |   88.0  |
 skill/SkillCreateWizard.tsx                          |   82.1  |   61.8   |   80.0  |   82.1  |
------------------------------------------------------|---------|----------|---------|---------|
```

**判定基準**:

- ライン(Lines/Stmts): **80% 以上** → 合格
- ブランチ(Branch): **60% 以上** → 合格
- いずれかが下回った場合 → 「5. カバレッジ不足時の対処」を実施

### 4-2. ブランチカバレッジが低い原因として多いパターン

1. **三項演算子の一方のアームがテストされていない**
   - 例: `hasSchedule ? DEFAULT_SCHEDULE_CONFIG : undefined` で `false` 側のみテスト

2. **オプショナルチェーン (`?.`) の `undefined` パスが未テスト**
   - 例: `selectedOptions[0] ?? ""` で `selectedOptions` が空のケースが未テスト

3. **`&&` による条件付きレンダリングの両側が未テスト**
   - 例: `selectedOptions.length > 0 && <span>選択済み</span>` で `false` ケースが未テスト

---

## 5. カバレッジ不足時の対処

### 5-1. 不足している concern を特定する手順

```bash
# HTML レポートを出力してブラウザで確認
pnpm --filter @repo/desktop exec vitest run --coverage --reporter=html

# カバーされていない行（赤色表示）を確認
# → 上記「3-1. concern 一覧」のどの concern ID に対応するか特定する
```

### 5-2. 対処方針

| 状況                                                        | 対処                                                             |
| ----------------------------------------------------------- | ---------------------------------------------------------------- |
| concern C-01〜C-13 のいずれかがカバーされていない           | 対応する Phase 6 テスト（FP/RG/A11Y）を追加または修正            |
| dependency edge E-01〜E-06 のいずれかが未テスト             | Phase 6 のテストに統合アサーションを追加                         |
| カバレッジは目標値以上だが特定の分岐が未テスト              | `.only` を使って対象テストを絞り込み、不足分岐を補完テストで追加 |
| 内部ヘルパー関数（`createQuestionAnswer` 等）が低カバレッジ | 直接エクスポートされていれば個別ユニットテストを追加             |

---

## 6. 確認チェックリスト

Phase 7 完了の判定として以下をすべて満たすこと。

| チェック項目                                                                               | 確認コマンド / 方法                                      |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `ConversationRoundStep.tsx` のライン >= 80%、ブランチ >= 60%                               | `pnpm --filter @repo/desktop exec vitest run --coverage` |
| `ApplySummaryCard.tsx` のライン >= 80%、ブランチ >= 60%                                    | 同上                                                     |
| `SkillCreateWizard.tsx` のライン >= 80%、ブランチ >= 60%                                   | 同上                                                     |
| concern C-01〜C-13 がすべて少なくとも1件のテストでカバーされている                         | HTML レポートまたは上記 concern × command 対応表で確認   |
| dependency edge E-01〜E-06 がすべて少なくとも1件のテストでカバーされている                 | 同上                                                     |
| Phase 4〜6 の全テスト（Happy Path / フェイルパス / 回帰ガード / アクセシビリティ）が Green | `pnpm --filter @repo/desktop exec vitest run`            |
| TypeScript コンパイルエラーが 0 件                                                         | `pnpm --filter @repo/desktop typecheck`                  |
| ESLint エラーが 0 件                                                                       | `pnpm --filter @repo/desktop lint`                       |

---

## 7. Phase 8（リファクタリング）への引き継ぎ事項

Phase 7 完了後、以下の情報を Phase 8 仕様書に記載すること。

1. **カバレッジレポートの数値（実測値）**: `ConversationRoundStep` / `ApplySummaryCard` / `SkillCreateWizard` の実測ライン・ブランチカバレッジ
2. **未カバー箇所の残留理由**: 意図的にテストしていない箇所がある場合はその理由を記載（例: E2E で確認する想定、テスト困難なエラーハンドラ等）
3. **リファクタリング対象の候補**: カバレッジ確認中に発見した複雑度の高い箇所やコードの重複
