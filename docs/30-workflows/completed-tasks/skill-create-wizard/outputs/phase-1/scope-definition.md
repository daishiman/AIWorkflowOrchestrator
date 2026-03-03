# TASK-10A-C: スコープ定義

## スコープ内

### UIコンポーネント

- SkillCreateWizard メインコンポーネント
- wizard/StepIndicator（ステップ進捗）
- wizard/DescribeStep（説明入力）
- wizard/ConfigureStep（設定）
- wizard/GenerateStep（生成中表示）
- wizard/CompleteStep（完了表示）
- wizard/index.ts（バレルエクスポート）

### IPC/Preload

- channels.ts に SKILL_CREATE チャネル追加
- skill-api.ts に create() メソッド追加
- skillHandlers.ts に skill:create ハンドラー追加

### テスト

- 5つのサブコンポーネントのユニットテスト
- SkillCreateWizard 統合テスト

## スコープ外

- SkillManagementPanel との統合（TASK-10A-D）
- SkillCreatorService の内部実装変更（TASK-9B）
- SkillManagementPanel からのウィザード起動UI（TASK-10A-A）
- types.ts の ElectronAPI インターフェース変更（skill は既に SkillAPI を参照済み）
