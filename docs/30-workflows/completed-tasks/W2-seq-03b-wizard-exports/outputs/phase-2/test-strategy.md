# テスト戦略

タスクID: UT-SKILL-WIZARD-W2-seq-03b

## テスト方針の概要

wizard/index.ts のエクスポート変更はランタイム動作ではなくパブリック API の整理であるため、
テストは「コンパイル検証」と「既存テストの通過確認」を中心に行う。

## カテゴリ別テスト方針

### 削除対象エクスポート（6件）

| 方針         | 内容                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| 型チェック   | `tsc --noEmit` で削除後のコンパイルエラーがないことを確認                 |
| 参照チェック | index.ts 経由で DescribeStep 等を import しているファイルがないことを確認 |
| テスト影響   | DescribeStep.test.tsx は直接インポートのため影響なし。テスト自体は維持    |

### 追加対象エクスポート（4件）

| 方針                 | 内容                                                                    |
| -------------------- | ----------------------------------------------------------------------- |
| エクスポート存在確認 | index.ts から named import できることを型チェックで確認                 |
| 既存テスト通過       | SkillInfoStep.test.tsx, ConversationRoundStep.test.tsx が PASS すること |
| 型エクスポート確認   | `SkillInfoStepProps` を型として import できること                       |

### 維持対象エクスポート（6グループ）

| 方針               | 内容                                                                 |
| ------------------ | -------------------------------------------------------------------- |
| 回帰テスト         | 各コンポーネントの既存テストが変更前後で PASS すること               |
| テストファイル対象 | StepIndicator.test.tsx, GenerateStep.test.tsx, CompleteStep.test.tsx |

## 実行コマンド

```bash
# 型チェック
pnpm --filter @repo/desktop tsc --noEmit

# wizard 配下の単体テスト
pnpm --filter @repo/desktop test -- --testPathPattern="wizard"

# SkillCreateWizard 統合テスト
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreateWizard"
```

## 合格基準

- 型チェック: エラー 0 件
- wizard テスト: 全ファイル PASS
- SkillCreateWizard テスト: 全ファイル PASS
