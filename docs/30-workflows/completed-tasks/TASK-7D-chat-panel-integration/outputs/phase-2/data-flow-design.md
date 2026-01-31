# データフロー設計書

## 設計日: 2026-01-30

## Store → ChatPanel → SkillStreamingView

```
useAppStore() → {
  selectedSkillName     → SkillStreamingView.skillName
  streamingMessages     → SkillStreamingView.messages
  isExecuting           → SkillStreamingView 表示条件
  skillExecutionStatus  → SkillStreamingView.status
  fetchSkills           → useEffect 初回呼び出し
}
```

## SkillSelector → ChatPanel イベントフロー

```
SkillSelector (内部で useSkillStore を使用)
  → SkillSelector 内部で未インポートスキルクリック
  → ChatPanel は SkillImportDialog の表示を SkillSelector 外部から制御
```

注意: SkillSelector は onImportRequest を外部 Props として提供していないため、ChatPanel 統合時に SkillImportDialog の表示制御を別途検討する必要がある。

## SkillStreamingView → Store イベントフロー

```
中止ボタン onClick
  → useAppStore().abortExecution()
  → Store: isExecuting = false, skillExecutionStatus = "cancelled"
  → SkillStreamingView: StatusBadge が「キャンセル」に更新
```

## useEffect 初期化フロー

```
ChatPanel マウント時
  → fetchSkills() 呼び出し
  → IPC: window.electronAPI.skill.list() + getImported()
  → Store: availableSkillsMetadata/importedSkills 更新
  → SkillSelector: ドロップダウンに反映
```

## PermissionDialog 自動表示フロー

```
Main Process → IPC: permission_request
  → Store._handlePermissionRequest(req)
  → Store: pendingPermission = req, skillExecutionStatus = "permission_pending"
  → PermissionDialog: 自動表示（pendingPermission !== null）
  → ユーザー操作: 許可/拒否
  → Store.respondToSkillPermission(approved, remember)
  → IPC: sendPermissionResponse
  → Store: pendingPermission = null
```
