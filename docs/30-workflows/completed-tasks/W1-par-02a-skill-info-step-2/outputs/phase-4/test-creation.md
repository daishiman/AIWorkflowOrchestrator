# Phase 4 成果物: テスト作成（TDD Red）

## タスクID: UT-SKILL-WIZARD-W1-SKILL-INFO-STEP-001

## テストマトリクス（TC-01〜TC-09）

| TC    | 対象             | 入力                                     | 期待出力 / 動作                                            |
| ----- | ---------------- | ---------------------------------------- | ---------------------------------------------------------- |
| TC-01 | レンダリング確認 | `formData` に初期値を渡す                | 3フィールドと「次へ」ボタンが描画される                    |
| TC-02 | スキル名変更     | スキル名フィールドを変更                 | `onFormDataChange` が新しい `SkillInfoFormData` で呼ばれる |
| TC-03 | 目的変更         | 目的フィールドを変更                     | `onFormDataChange` が新しい `SkillInfoFormData` で呼ばれる |
| TC-04 | カテゴリ変更     | カテゴリボタンを選択                     | `onFormDataChange` が新しい `SkillInfoFormData` で呼ばれる |
| TC-05 | 選択肢列挙確認   | コンポーネントをレンダリング             | `SkillCategory` の全値がボタンとして存在する               |
| TC-06 | props 型整合     | `formData` に `SkillInfoFormData` を渡す | TypeScript の型エラーなくコンパイルできる                  |
| TC-07 | 現在値の表示確認 | `formData.skillName = "my-skill"` を渡す | スキル名フィールドに `"my-skill"` が表示されている         |
| TC-08 | Next の活性条件  | 目的が 10 文字未満またはカテゴリ未選択   | 「次へ」ボタンが無効のままになる                           |
| TC-09 | Next の送信      | 目的が 10 文字以上かつカテゴリ選択済み   | 「次へ」クリックで `onNext` が呼ばれる                     |

## テストファイルパス

```
apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx
```

## テストフレームワーク

- **テストランナー**: Vitest
- **DOM 環境**: happy-dom（vitest.config.ts に設定済み）
- **コンポーネントテスト**: React Testing Library（`@testing-library/react`）
- **イベント発火**: `fireEvent`（happy-dom 環境で `userEvent` 禁止）

## TDD 実行確認

- Red → Green: Phase 5 実装完了後に全テストが PASS になることを確認
- 作成ファイル: `SkillInfoStep.test.tsx` に TC-01〜TC-09 を実装済み
