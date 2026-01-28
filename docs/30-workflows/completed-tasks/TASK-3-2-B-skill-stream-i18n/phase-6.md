# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                |
| ------ | ----------------- |
| Phase  | 6                 |
| 機能名 | skill-stream-i18n |
| 作成日 | 2026-01-28        |

---

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。

---

## 実行タスク

### Task 1: カバレッジ分析

```bash
pnpm --filter @repo/desktop test:coverage
```

**分析対象ファイル**:

- `apps/desktop/src/renderer/i18n/config.ts`
- `apps/desktop/src/renderer/utils/formatTime.ts`
- `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`

### Task 2: formatRelativeTime追加テスト

**追加テストケース**:

| テストケース              | 検証内容                     | 優先度 |
| ------------------------- | ---------------------------- | ------ |
| エッジケース - 0秒        | diff = 0                     | 高     |
| エッジケース - 59秒       | diff = 59s（秒→分の境界）    | 高     |
| エッジケース - 60秒       | diff = 60s（分に切り替わる） | 高     |
| エッジケース - 59分       | diff = 59m（分→時間の境界）  | 高     |
| エッジケース - 23時間     | diff = 23h（時間→日の境界）  | 高     |
| 不正入力 - NaN            | timestamp = NaN              | 中     |
| 不正入力 - null/undefined | timestamp = null             | 中     |
| 未対応ロケール            | locale = "fr"                | 中     |

### Task 3: SkillStreamDisplay追加テスト

**追加テストケース**:

| テストケース                   | 検証内容                                 | 優先度 |
| ------------------------------ | ---------------------------------------- | ------ |
| ロケール切替後の再レンダリング | 言語変更時にUIが更新される               | 高     |
| 翻訳キー未定義時               | フォールバック動作                       | 中     |
| 複数メッセージのタイムスタンプ | 各メッセージに正しいlocaleが適用される   | 高     |
| コピーボタン連続クリック       | フィードバックテキストが正しく表示される | 中     |
| ステータス遷移時の翻訳         | idle→running→completed全てで正しい翻訳   | 高     |

### Task 4: 統合テスト作成

**ファイル**: `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.i18n.integration.test.tsx`

**テストケース**:

| テストケース                     | 検証内容                                                 |
| -------------------------------- | -------------------------------------------------------- |
| アプリ全体の言語切替             | i18n.changeLanguage('en')後のUI更新                      |
| コンポーネント間のロケール一貫性 | SkillStreamDisplayとformatRelativeTimeが同じlocaleを使用 |
| プロバイダーなしのエラー         | I18nextProvider外での使用時のエラーハンドリング          |

---

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 目標 |
| ----------------- | -------- | -------- | ---- |
| Line Coverage     | 80%      | 90%      | 100% |
| Branch Coverage   | 60%      | 70%      | 80%  |
| Function Coverage | 80%      | 90%      | 100% |

---

## 統合テスト連携【必須】

| テストカテゴリ           | 検証項目                         | 目標 |
| ------------------------ | -------------------------------- | ---- |
| 言語切替テスト           | i18n.changeLanguage後のUI更新    | 100% |
| コンポーネント連携テスト | locale伝播の正確性               | 100% |
| エラーハンドリング       | 翻訳キー未定義時のフォールバック | 80%+ |

---

## 参照資料

| 資料名       | パス                                    | 説明          |
| ------------ | --------------------------------------- | ------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | Phase 4成果物 |
| 実装コード   | Phase 5成果物                           | 実装ファイル  |

---

## 成果物

| 成果物             | パス                                        | 説明               |
| ------------------ | ------------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`        | カバレッジ分析結果 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`       | 統合テスト実行結果 |
| 追加テストファイル | `apps/desktop/src/renderer/**/*.test.ts(x)` | 追加テストコード   |

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] formatRelativeTimeのエッジケーステストが追加されている
- [ ] SkillStreamDisplayの追加テストが追加されている
- [ ] 統合テストが作成されている
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 7: テストカバレッジ確認
