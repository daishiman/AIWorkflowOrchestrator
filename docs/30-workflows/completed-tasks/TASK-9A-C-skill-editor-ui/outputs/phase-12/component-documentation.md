# TASK-9A-C コンポーネントドキュメント

## SkillEditor

### Props

| Prop      | 型              | 必須 | 説明           |
| --------- | --------------- | ---- | -------------- |
| `skill`   | `ImportedSkill` | 必須 | 編集対象スキル |
| `onClose` | `() => void`    | 必須 | 閉じる処理     |

### 主要イベント

| イベント             | 説明                 |
| -------------------- | -------------------- |
| `onSelect(filePath)` | 編集対象ファイル切替 |
| `onChange(content)`  | エディタ内容変更     |
| `onSave()`           | 保存処理実行         |

### 利用IPC

| チャネル          | 操作             |
| ----------------- | ---------------- |
| `skill:readFile`  | ファイル読み込み |
| `skill:writeFile` | ファイル保存     |

## SkillCodeEditor

### Props

| Prop       | 型                        | 必須 | 説明                   |
| ---------- | ------------------------- | ---- | ---------------------- |
| `value`    | `string`                  | 必須 | 表示・編集対象テキスト |
| `onChange` | `(value: string) => void` | 必須 | 入力変更通知           |
| `language` | `string`                  | 任意 | シンタックスヒント用   |

## 使用例

```tsx
<SkillEditor skill={selectedSkill} onClose={() => setIsEditorOpen(false)} />
```
