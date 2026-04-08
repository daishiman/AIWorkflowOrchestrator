# システム仕様更新サマリー（Phase 12）

## タスク情報

- タスクID: UT-SKILL-WIZARD-W2-seq-03b
- 対象: wizard/index.ts エクスポート更新
- 実施日: 2026-04-08

## タスクステータス更新

| タスクID                   | 名称                             | ステータス    |
| -------------------------- | -------------------------------- | ------------- |
| UT-SKILL-WIZARD-W2-seq-03b | wizard/index.ts エクスポート更新 | **completed** |

## 依存関係の解消

### 関連タスクの依存関係

本タスク（W2-seq-03b）の完了により、以下の関連タスクの依存関係が全て解消された。

| 関連タスクID | 名称                             | 依存解消状況                      |
| ------------ | -------------------------------- | --------------------------------- |
| W1-par-02a   | SkillInfoStep 実装               | 解消済み（W2-seq-03a で先行実装） |
| W1-par-02b   | StepIndicator 実装               | 解消済み（エクスポート維持確認）  |
| W1-par-02c   | GenerateStep / CompleteStep 実装 | 解消済み（エクスポート維持確認）  |

## 仕様変更サマリー

### wizard パブリック API の変更

| エクスポート       | 変更前 | 変更後                |
| ------------------ | ------ | --------------------- |
| DescribeStep       | 公開   | 非公開（@deprecated） |
| DescribeStepProps  | 公開   | 非公開                |
| SkillInfoStep      | 公開   | 公開（維持）          |
| SkillInfoStepProps | 非公開 | **公開（追加）**      |
| StepIndicator      | 公開   | 公開（維持）          |
| GenerateStep       | 公開   | 公開（維持）          |
| CompleteStep       | 公開   | 公開（維持）          |

## 次のステップ

- `DescribeStep.tsx` の物理削除: W2 以降の別タスクとして計画
