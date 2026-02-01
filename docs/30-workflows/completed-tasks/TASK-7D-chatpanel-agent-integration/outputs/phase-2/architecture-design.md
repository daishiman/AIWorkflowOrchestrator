# アーキテクチャ設計書

## データフロー図

```
[skillSlice] → selectedSkillName → [ChatPanel] → skillName → [SkillStreamingView]
[skillSlice] → streamingMessages → [ChatPanel] → messages → [SkillStreamingView]
[skillSlice] → skillExecutionStatus → [ChatPanel] → status → [SkillStreamingView]
[skillSlice] → isExecuting → [ChatPanel] → 条件付きレンダリング
[skillSlice] → pendingPermission → [PermissionDialog] (Store-direct)
[SkillSelector] → onImportRequest → [ChatPanel] → importDialogSkill → [SkillImportDialog]
```

## 統合ポイント/契約

| 統合ポイント                   | 契約定義                                                   |
| ------------------------------ | ---------------------------------------------------------- |
| skillSlice → ChatPanel         | useAppStore()でselectedSkillName/streamingMessages等を取得 |
| SkillSelector → ChatPanel      | onImportRequest(skill: SkillMetadata)コールバック          |
| ChatPanel → SkillStreamingView | Props: skillName, messages, status                         |
| skillSlice → PermissionDialog  | Store-direct: pendingPermissionをuseAppStore()で監視       |

## 既存パターンとの整合性

| パターン      | 使用箇所            | 整合性                     |
| ------------- | ------------------- | -------------------------- |
| Store-direct  | PermissionDialog    | TASK-7Cと同一パターン      |
| useSkillStore | SkillSelector       | 既存フック使用（変更不要） |
| shallow比較   | ChatPanel Store取得 | 必要な状態のみ購読         |
| forwardRef    | ChatPanel           | 既存パターン維持           |
| React.memo    | SkillStreamingView  | パフォーマンス最適化       |

## アーキテクチャ層別設計

| 層                         | 設計観点                                 |
| -------------------------- | ---------------------------------------- |
| フロントエンド（Renderer） | コンポーネント階層、条件付きレンダリング |
| 状態管理                   | skillSliceセレクター、shallow比較        |
