# Phase 5: 実装

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| Phase      | 5                                                              |
| タスクID   | TASK-SW-FIX-FEEDBACK-001                                       |
| 機能名     | スキル一覧リアルタイム反映・skillPath nullガード・成功表示修正 |
| 前提Phase  | Phase 4（テスト作成完了・Red確認済み）                         |
| 後続Phase  | Phase 6                                                        |
| 作成日     | 2026-04-12                                                     |
| ステータス | pending                                                        |

## 目的

Phase 2で設計した変更を2ファイルに対して実施し、TC-FEEDBACK-001〜007をGreenにする。

## 実装計画

### 新規作成ファイル

なし

### 修正ファイル一覧

| ファイルパス                                                         | 変更内容                                                   |
| -------------------------------------------------------------------- | ---------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`   | `handleExecutePlan`成功パス末尾に`await fetchSkills()`追加 |
| `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` | `skillPath` nullガード・成功ヘッダー条件表示・エラーUI追加 |

## 実装手順

### Step 1: SkillCreateWizard.tsx — fetchSkills()追加

`handleExecutePlan`関数内の成功パスを特定し、`setCurrentStep('complete')`の直前に
`await fetchSkills()`を追加する。

確認事項：

- `fetchSkills`が同コンポーネントスコープ内で定義・参照可能であること
- `await`で呼び出すこと（同期的に一覧更新を待つ）
- `fetchSkills()`が失敗した場合はcatchでログ出力のみ行い、ステップ遷移は継続する

```typescript
// 実装パターン（概念的）
const handleExecutePlan = async () => {
  try {
    // ... 既存のLLM実行ロジック ...
    if (generatedPath) {
      setSkillPath(generatedPath);
      await fetchSkills(); // ← 追加
      setCurrentStep("complete");
    }
  } catch (error) {
    // 既存のエラーハンドリング
  }
};
```

### Step 2: CompleteStep.tsx — nullガード・成功ヘッダー条件表示

`CompleteStep`コンポーネントの先頭に`skillPath === null`のアーリーリターンを追加し、
エラーメッセージとリトライ誘導ボタンを表示する。

確認事項：

- `skillPath`プロパティの型が`string | null`であること
- リトライボタンのonClickハンドラをprops経由または既存のナビゲーションで実装すること
- 既存の成功表示部分（`skillPath !== null`時）は変更しないこと

```typescript
// 実装パターン（概念的）
export const CompleteStep = ({ skillPath, onRetry }: CompleteStepProps) => {
  // nullガード（アーリーリターン）
  if (skillPath === null) {
    return (
      <div className="...">
        <h2>スキルの生成に失敗しました</h2>
        <p>スキルファイルの作成中にエラーが発生しました。</p>
        <button onClick={onRetry}>もう一度試す</button>
      </div>
    );
  }

  // 正常ケース（既存の成功表示・変更なし）
  return (
    <div>
      <h2>✓ スキルの骨格を生成しました</h2>
      {/* 既存の完了画面コンテンツ */}
    </div>
  );
};
```

## 実装完了チェックリスト

- [ ] `SkillCreateWizard.tsx`の`handleExecutePlan`成功パスに`await fetchSkills()`が追加されていること
- [ ] `CompleteStep.tsx`に`skillPath === null`のアーリーリターンが追加されていること
- [ ] `skillPath === null`時にエラーメッセージが表示されること
- [ ] `skillPath !== null`時に成功ヘッダーが表示されること
- [ ] TC-FEEDBACK-001〜007が全件Green（PASS）になること
- [ ] templateモードの既存動作に回帰がないこと

## 参照資料

| 資料名               | パス                                      | 用途             |
| -------------------- | ----------------------------------------- | ---------------- |
| Phase 4 テストケース | `outputs/phase-4/test-cases.md`           | 実装検証基準     |
| Phase 2 変更対象一覧 | `outputs/phase-2/change-target-files.md`  | 変更ファイル確認 |
| Phase 3 レビュー結果 | `outputs/phase-3/design-review-report.md` | 設計確定内容確認 |

## 成果物

| 成果物     | パス                                       | 説明                       |
| ---------- | ------------------------------------------ | -------------------------- |
| 実装記録書 | `outputs/phase-5/implementation-record.md` | 変更内容・Before/After記録 |

## 完了条件

- [ ] 修正ファイル一覧の全件が変更完了していること
- [ ] TC-FEEDBACK-001〜007がGreen（PASS）であること
- [ ] 既存テストへの回帰影響がゼロであること
- [ ] 実装記録書（Before/After）が作成されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 6: テスト拡充
