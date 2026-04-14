# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| Phase      | 2                                                              |
| タスクID   | TASK-SW-FIX-FEEDBACK-001                                       |
| 機能名     | スキル一覧リアルタイム反映・skillPath nullガード・成功表示修正 |
| 前提Phase  | Phase 1（要件定義完了）                                        |
| 後続Phase  | Phase 3                                                        |
| 作成日     | 2026-04-12                                                     |
| ステータス | pending                                                        |

## 目的

`fetchSkills()`追加箇所・`skillPath` nullガードのロジック・エラー表示UIの具体的な設計を行い、
Phase 3（設計レビュー）に進む可否を判断できる状態にする。

## 変更対象ファイル一覧

| 対象ファイル                                                         | 変更種別 | 変更概要                                                   |
| -------------------------------------------------------------------- | -------- | ---------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`   | 修正     | `handleExecutePlan`成功パス末尾に`await fetchSkills()`追加 |
| `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` | 修正     | `skillPath` nullガード・成功ヘッダー条件表示               |

## 設計1: `fetchSkills()`呼び出し追加（SkillCreateWizard.tsx）

### 追加箇所

`handleExecutePlan`関数内の成功パス末尾（`setCurrentStep('complete')`の直前または直後）に追加する。

```typescript
// 変更前（概念的な現状）
const handleExecutePlan = async () => {
  // ... LLM実行ロジック ...
  if (success) {
    setSkillPath(generatedPath);
    setCurrentStep("complete");
    // fetchSkills() が呼ばれていない ← 問題8の原因
  }
};

// 変更後（設計）
const handleExecutePlan = async () => {
  // ... LLM実行ロジック ...
  if (success) {
    setSkillPath(generatedPath);
    await fetchSkills(); // ← 追加（スキル一覧をリフレッシュ）
    setCurrentStep("complete");
  }
};
```

### 設計判断

- `fetchSkills()`は`await`で呼び出す（一覧取得完了後に画面遷移するため）
- エラーハンドリング：`fetchSkills()`が失敗してもスキル生成自体は成功済みなので、
  ステップ遷移は行う（一覧更新失敗はログのみ）
- templateモード側は変更しない（既存動作を維持）

## 設計2: `skillPath` nullガード（CompleteStep.tsx）

### nullガードのロジック設計

`skillPath`プロパティが`null`の場合と正常値の場合で表示を分岐する。

```typescript
// 変更前（概念的な現状）
export const CompleteStep = ({ skillPath }: CompleteStepProps) => {
  return (
    <div>
      <h2>✓ スキルの骨格を生成しました</h2> {/* skillPathがnullでも表示される ← 問題20 */}
      {skillPath && <SkillPathDisplay path={skillPath} />}
      {/* skillPath=nullのエラー表示なし ← 問題14 */}
    </div>
  );
};

// 変更後（設計）
export const CompleteStep = ({ skillPath }: CompleteStepProps) => {
  if (skillPath === null) {
    // エラーケース（問題14・20の修正）
    return (
      <div>
        <h2>スキルの生成に失敗しました</h2>
        <p>スキルファイルの作成中にエラーが発生しました。</p>
        <button onClick={/* リトライ誘導 */}>もう一度試す</button>
      </div>
    );
  }

  // 正常ケース（skillPath !== null のみ成功ヘッダーを表示）
  return (
    <div>
      <h2>✓ スキルの骨格を生成しました</h2> {/* skillPath !== null の場合のみ表示 */}
      <SkillPathDisplay path={skillPath} />
    </div>
  );
};
```

### エラー表示UIの設計

| 項目           | 設計内容                                                         |
| -------------- | ---------------------------------------------------------------- |
| エラーヘッダー | 「スキルの生成に失敗しました」                                   |
| エラー説明文   | 「スキルファイルの作成中にエラーが発生しました。」               |
| アクション     | 「もう一度試す」ボタン（Step 2への戻り誘導 or ウィザード再起動） |
| スタイル       | 既存のエラー表示スタイルに準拠（Tailwind CSS）                   |

### 成功ヘッダー表示条件の変更

| 条件                 | 表示内容                                            |
| -------------------- | --------------------------------------------------- |
| `skillPath !== null` | 「✓ スキルの骨格を生成しました」ヘッダー + 完了画面 |
| `skillPath === null` | エラーメッセージ + リトライ誘導ボタン               |

## 設計判断・トレードオフ

| 判断事項                    | 採用案                             | 理由                                                  |
| --------------------------- | ---------------------------------- | ----------------------------------------------------- |
| `fetchSkills()`のawait有無  | `await`あり                        | 一覧取得完了後に画面遷移するほうがUX上自然            |
| `fetchSkills()`失敗時の扱い | ログのみ（遷移は行う）             | スキル生成自体は成功済みなので遷移を妨げない          |
| nullガードの実装方式        | アーリーリターン（条件分岐）       | コードが読みやすく、成功/失敗ケースが明確に分離される |
| リトライ誘導のアクション    | Step 2への戻り or ウィザード再起動 | Phase実行時に既存のナビゲーションAPIを確認して確定    |
| エラー文言                  | シンプルな日本語メッセージ         | 既存の他エラー表示と一貫したスタイルを維持            |

## 参照資料

| 資料名                       | パス                                                                 | 用途                      |
| ---------------------------- | -------------------------------------------------------------------- | ------------------------- |
| Phase 1 成果物               | `outputs/phase-1/`                                                   | 要件との整合確認          |
| ウィザードオーケストレーター | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`   | fetchSkills追加箇所の確認 |
| 完了画面コンポーネント       | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` | nullガード実装箇所の確認  |

## 成果物

| 成果物               | パス                                     | 説明                                     |
| -------------------- | ---------------------------------------- | ---------------------------------------- |
| 設計仕様書           | `outputs/phase-2/design-spec.md`         | 変更内容・設計根拠の詳細                 |
| 変更対象ファイル一覧 | `outputs/phase-2/change-target-files.md` | 具体的な変更対象とdiff設計               |
| nullガード設計書     | `outputs/phase-2/null-guard-design.md`   | CompleteStep.tsxのnullガードロジック詳細 |

## 完了条件

- [ ] 変更対象ファイルが全件特定されていること
- [ ] `fetchSkills()`追加箇所が具体的に設計されていること
- [ ] `skillPath` nullガードのロジックが設計されていること
- [ ] エラー表示UIの設計が完成していること
- [ ] 既存仕様との矛盾がないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビュー
