# ChatPanel 統合レイアウト設計書

## 設計日: 2026-01-30

## 全体構成

```
ChatPanel（flex flex-col h-full）
├── ヘッダー（flex items-center gap-4 px-4 py-2 border-b）
│   ├── ModelSelector（既存、プレースホルダー）
│   └── SkillSelector（className 任意）
├── メッセージ領域（flex-1 overflow-y-auto）
│   ├── MessageList（既存、プレースホルダー）
│   └── SkillStreamingView（条件付き表示）
│       表示条件: isExecuting && selectedSkillName
├── 入力領域
│   └── ChatInput（既存、プレースホルダー）
└── ダイアログ群
    ├── SkillImportDialog（importDialogSkill state で制御）
    └── PermissionDialog（Store-direct、常時マウント）
```

## 状態管理

### useAppStore からの取得

```typescript
const selectedSkillName = useAppStore((s) => s.selectedSkillName);
const streamingMessages = useAppStore((s) => s.streamingMessages);
const isExecuting = useAppStore((s) => s.isExecuting);
const skillExecutionStatus = useAppStore((s) => s.skillExecutionStatus);
const fetchSkills = useAppStore((s) => s.fetchSkills);
```

### ローカル state

```typescript
const [importDialogSkill, setImportDialogSkill] =
  useState<SkillMetadata | null>(null);
```

### useEffect

```typescript
useEffect(() => {
  fetchSkills();
}, [fetchSkills]);
```

## SkillSelector 接続

- `onImportRequest` は SkillSelector 内部で処理されるが、ChatPanel 側で SkillImportDialog 表示制御が必要
- SkillSelector が外部に onImportRequest コールバックを提供していない場合は、別のメカニズムで対応する

## SkillImportDialog 接続

```typescript
{importDialogSkill && (
  <SkillImportDialog
    skill={importDialogSkill}
    isOpen={true}
    onClose={() => setImportDialogSkill(null)}
  />
)}
```

## PermissionDialog 接続

```typescript
<PermissionDialog />  // 常時マウント、Store-direct
```
