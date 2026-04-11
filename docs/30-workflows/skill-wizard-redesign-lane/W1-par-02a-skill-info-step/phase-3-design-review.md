# Phase 3: 設計レビュー

## メタ情報

- Phase: 3
- タスクID: UT-SKILL-WIZARD-W1-par-02a
- 機能名: SkillInfoStep コンポーネント実装（Step 0）
- 作成日: 2026-04-07

## 目的

Phase 2 の設計内容を多角的にレビューし、実装前に潜在的な問題・設計上の懸念点を洗い出して解決する。

## 実行タスク

- [ ] Props 設計の妥当性をレビューする
- [ ] 型定義の配置場所を確認する
- [ ] バリデーションロジックの UX を評価する
- [ ] カテゴリタグUIのアクセシビリティを確認する
- [ ] W1-par-02b（ConversationRoundStep）との連携インターフェースを検証する
- [ ] 削除による影響範囲を再確認する

## 参照資料

| 資料名             | パス                                                         | 説明               |
| ------------------ | ------------------------------------------------------------ | ------------------ |
| Phase 2 設計書     | `phase-2-design.md`                                          | レビュー対象の設計 |
| W1-par-02b 仕様書  | `../../W1-par-02b-conversation-round-step/phase-2-design.md` | 連携先設計         |
| 既存ウィザード実装 | `apps/desktop/src/renderer/components/skill/wizard/`         | 整合性確認         |

## 実行手順

### Step 1: Props 設計レビュー

確認ポイント:

- `SkillInfoFormData` が `SkillInfoStepProps` と `ConversationRoundStepProps` の両方で共有されているか
- `onFormDataChange` のシグネチャが親コンポーネントと整合するか
- `onNext` が引数なしで十分か（追加のデータ受け渡しが不要か）

判定基準:

- `formData` は親が管理し、Step 間で共有される設計であること
- Step コンポーネント自身は状態を持たず、Props 経由で制御されること

### Step 2: 型定義配置レビュー

選択肢の検討:

| 案  | 配置場所                                    | メリット                 | デメリット              |
| --- | ------------------------------------------- | ------------------------ | ----------------------- |
| A   | `packages/shared/src/types/skillCreator.ts` | 共有型として再利用できる | 変更波が上流に波及する  |
| B   | `apps/desktop/src/renderer/components/...`  | 画面ローカルで完結       | 重複定義が発生しやすい  |
| C   | `SkillInfoStep.tsx` 内にインライン定義      | シンプル                 | Step 1 との共有に不向き |

推奨: **案 A**（共有型を正本にし、W1 はそれを消費する）

### Step 3: バリデーション UX レビュー

確認ポイント:

- Touched-state 方式（フォーカスが外れたタイミングでエラー表示）は適切か
- 「次へ」ボタンを押した際に未入力フィールドが強調されるか
- エラーメッセージの文言は分かりやすいか

懸念点と対応:

- ユーザーが入力前に「次へ」を押した場合、`purposeTouched` が false のためエラーが出ない
- 対応: `onNext` 呼び出し時に全フィールドを touched 状態にする処理を追加する

### Step 4: カテゴリタグ UI アクセシビリティレビュー

確認ポイント:

- タグボタンに `aria-pressed` 属性が付与されているか
- キーボード操作（Tab・Enter・Space）で選択可能か
- 選択状態がスクリーンリーダーに伝わるか

対応方針:

- `<button type="button" aria-pressed={isSelected}>` を使用する
- `role="group"` + `aria-label="カテゴリを選択"` でグループ化する

### Step 5: W1-par-02b 連携インターフェース検証

確認ポイント:

- `SkillInfoFormData` が `ConversationRoundStepProps.formData` として渡せるか
- `category === "external-integration"` の判定が W1-par-02b 側で完結するか
- `SkillInfoFormData` / `SkillCategory` が共有定義から参照されており `category` を `null` に戻さないよう guarding されているか
- Step 遷移ロジック（onNext / onBack）が親ウィザードで統一されているか

検証結果: `formData` を Props として流通させるだけで連携が成立することを確認する。`SkillInfoFormData` は shared の正本を使う。

### Step 6: 削除影響範囲の再確認

削除対象:

- `DescribeStep.tsx`
- `GenerationMode` 型

影響確認コマンド:

```bash
grep -r "DescribeStep\|GenerationMode" apps/ packages/ --include="*.ts" --include="*.tsx" -l
```

全参照箇所を `SkillInfoStep` / `SkillInfoFormData` に置き換えることを確認する。

## 成果物

- 設計レビュー結果（本ファイル）
- レビューで発見された問題と解決策の一覧
- 型定義配置の決定（案 A: `packages/shared/src/types/skillCreator.ts`）
- アクセシビリティ対応方針

## 完了条件

- [ ] Props 設計の妥当性が確認されている
- [ ] 型定義の配置場所が確定している（`packages/shared/src/types/skillCreator.ts`）
- [ ] バリデーション UX の懸念点が解決されている
- [ ] カテゴリタグのアクセシビリティ対応方針が決まっている
- [ ] W1-par-02b との連携インターフェースが検証されている
- [ ] 削除対象ファイル・型の影響範囲が確認されている
