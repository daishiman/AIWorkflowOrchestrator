# 状態管理設計書

## Store状態取得パターン

```typescript
// ChatPanel内でのStore取得
const {
  selectedSkillName, // string | null
  streamingMessages, // SkillStreamMessage[]
  isExecuting, // boolean
  skillExecutionStatus, // SkillExecutionStatus | null
  fetchSkills, // () => Promise<void>
} = useAppStore();
```

## ローカルState

```typescript
const [importDialogSkill, setImportDialogSkill] =
  useState<SkillMetadata | null>(null);
```

## 初期化フロー

```typescript
useEffect(() => {
  fetchSkills();
}, [fetchSkills]);
```

## イベントハンドラ

| ハンドラ                | トリガー                          | 処理                        |
| ----------------------- | --------------------------------- | --------------------------- |
| handleImportRequest     | SkillSelector.onImportRequest     | setImportDialogSkill(skill) |
| handleImportDialogClose | SkillImportDialog.onClose         | setImportDialogSkill(null)  |
| (Store-direct)          | PermissionDialog内部              | respondToSkillPermission()  |
| (Store-direct)          | SkillStreamingView.abortExecution | abortExecution()            |

## forwardRef / useImperativeHandle

```typescript
export interface ChatPanelHandle {
  handleImportRequest: (skill: SkillMetadata) => void;
}

useImperativeHandle(ref, () => ({
  handleImportRequest: (skill: SkillMetadata) => setImportDialogSkill(skill),
}));
```

## 子コンポーネントのStore使用パターン

| コンポーネント     | Store Hook      | パターン           |
| ------------------ | --------------- | ------------------ |
| SkillSelector      | useSkillStore() | セレクターフック   |
| SkillImportDialog  | useAppStore()   | 直接参照           |
| PermissionDialog   | useAppStore()   | Store-direct       |
| SkillStreamingView | useAppStore()   | abortExecutionのみ |
