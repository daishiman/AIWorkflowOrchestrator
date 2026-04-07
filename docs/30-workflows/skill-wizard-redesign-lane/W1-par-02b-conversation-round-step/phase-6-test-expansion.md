# Phase 6: テスト拡充

## メタ情報

- Phase: 6
- タスクID: UT-SKILL-WIZARD-W1-par-02b
- 機能名: ConversationRoundStep コンポーネント実装（Step 1）
- 作成日: 2026-04-07

## 目的

Phase 4 で作成した基本テストに加え、エッジケース・境界値・アクセシビリティ・統合シナリオのテストを追加し、テストスイートを充実させる。

## 実行順（重複防止）

Phase 6 は「追加テストで仕様を固める」フェーズであり、カバレッジ計測と不足補完は Phase 7 に寄せる。

1. 追加テストを実装（ユニット -> 統合寄りの順）
2. `vitest` を実行して GREEN を確認
3. ここでは **カバレッジ数値の達成を目的化しない**（必要なら Phase 7 へ）

## 実行タスク

- [ ] スマートデフォルト事前入力テストを追加する
- [ ] Q3スケジュールUIのバリデーションテストを追加する
- [ ] Q5警告（サマリーカード）のテストを追加する
- [ ] onAnswersChange コールバックテストを追加する
- [ ] アクセシビリティ（役割・ラベル・キーボード）テストを追加する
- [ ] InterviewProgressBar の単体テストを追加する
- [ ] ApplySummaryCard の単体テストを追加する
- [ ] テストが全て GREEN であることを確認する

## 参照資料

| 資料名         | パス                                                                                         | 説明       |
| -------------- | -------------------------------------------------------------------------------------------- | ---------- |
| Phase 4 テスト | `phase-4-test-creation.md`                                                                   | 基本テスト |
| Phase 5 実装   | `phase-5-implementation.md`                                                                  | 実装仕様   |
| テストファイル | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 拡充対象   |

## 実行手順

### Step 1: 追加テストの配置（ファイル単位）

| 対象                  | 追加先（推奨）                             | 狙い                                               |
| --------------------- | ------------------------------------------ | -------------------------------------------------- |
| ConversationRoundStep | `__tests__/ConversationRoundStep.test.tsx` | ページング、Q3 展開、サマリー表示、親コールバック  |
| InterviewProgressBar  | `__tests__/InterviewProgressBar.test.tsx`  | 表示値とゲージ計算の最小確認                       |
| ApplySummaryCard      | `__tests__/ApplySummaryCard.test.tsx`      | 未回答抽出、key-based マッピング、Q5 警告、dismiss |

### Step 2: 追加するテスト観点（最小セット）

#### 1. スマートデフォルト（表示の整合）

- smartDefaults が与えられているとき、該当選択肢が選択状態で表示される
- smartDefaults が `null` の項目は未選択として扱われる

#### 2. Q3 スケジュール UI（出し入れ + 入力検証）

- `定期実行` 選択でスケジュール UI が表示される
- `定期実行` 以外へ切り替えると UI が非表示になる
- cron 式が未入力/不正のとき、フォーカスアウトでエラー表示（最小の検証で良い）

#### 3. サマリーカード（適用一覧 + dismiss + confirm）

- 「今すぐ生成する」でサマリーカードが表示される
- `×` で閉じる。閉じた後に再度押すと再表示される
- 「生成する」で `onGenerate("skip")` が呼ばれる

#### 4. Q5 警告（必須カテゴリのみ、ブロックしない）

- `category="external-integration"` かつ Q5 未回答: 警告が表示される
- Q5 回答済み: 警告が表示されない
- 警告があっても confirm をブロックしない（`onGenerate("skip")` は呼べる）

#### 5. onAnswersChange（最小の検証）

- 代表1問で、選択肢クリック/自由入力の変更が `onAnswersChange` に伝搬する

#### 6. アクセシビリティ（新規依存を増やさない）

- 主要操作が role/name で取得できる（`button`、`region`、入力ラベル等）
- Tab で操作可能なことを、最低 1 シナリオで確認する（詳細は Phase 11 に寄せる）

### Step 3: key-based マッピングの回帰テスト（ApplySummaryCard）

ApplySummaryCard は Phase 5 で key-based マッピングを採用するため、ここでは以下を固定する。

- `q1` の未回答が `smartDefaults.who` を参照する
- `q6` の未回答が `smartDefaults.format` を参照する

（インデックス順でたまたま通るテストは避け、`q1/q6` のように離れたキーで検証する）

### Step 4: テスト実行（全 GREEN 確認）

```bash
pnpm --filter @repo/desktop vitest run src/renderer/components/skill/wizard/__tests__/
```

## 成果物

- 拡充済みテストファイル（スマートデフォルト・スケジュールUI・Q5警告・コールバック・アクセシビリティ）
- `InterviewProgressBar.test.tsx` 単体テスト
- `ApplySummaryCard.test.tsx` 単体テスト

## 完了条件

- [ ] スマートデフォルト事前入力テストが追加されている
- [ ] Q3スケジュールUIバリデーションテストが追加されている
- [ ] Q5警告（サマリーカード）テストが追加されている
- [ ] `onAnswersChange` コールバックテストが追加されている
- [ ] `InterviewProgressBar` の単体テストが追加されている
- [ ] `ApplySummaryCard` の単体テストが追加されている
- [ ] 全テストが GREEN になっている
