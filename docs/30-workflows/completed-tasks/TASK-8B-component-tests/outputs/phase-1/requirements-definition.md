# TASK-8B 要件定義書

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 1                            |
| タスク | TASK-8B コンポーネントテスト |
| 作成日 | 2026-02-02                   |

## テスト対象コンポーネント

### 1. SkillSelector

**ファイルパス**: `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`

| 要件ID  | カテゴリ         | 要件種別 | 要件                                                   |
| ------- | ---------------- | -------- | ------------------------------------------------------ |
| SS-R-01 | レンダリング     | FR       | スキル未選択時に「なし」が表示される                   |
| SS-R-02 | レンダリング     | FR       | 選択中スキル名がボタンに表示される                     |
| SS-R-03 | レンダリング     | FR       | `isScanning=true`時に「スキャン中...」が表示される     |
| SS-I-04 | インタラクション | FR       | ボタンクリックでlistboxドロップダウンが開く            |
| SS-I-05 | インタラクション | FR       | 外側クリックでドロップダウンが閉じる                   |
| SS-I-06 | インタラクション | FR       | 「インポート済み」セクションが表示される               |
| SS-I-07 | インタラクション | FR       | 「利用可能なスキル」セクションが表示される             |
| SS-S-08 | 状態管理         | FR       | スキル選択で`selectSkillByName("name")`が呼ばれる      |
| SS-S-09 | 状態管理         | FR       | 「なし」選択で`selectSkillByName(null)`が呼ばれる      |
| SS-K-10 | キーボード操作   | NFR      | Escapeキーでドロップダウンが閉じる                     |
| SS-K-11 | キーボード操作   | NFR      | 矢印キーでフォーカスが移動する                         |
| SS-R-12 | インタラクション | FR       | 再スキャンボタンで`rescanSkills()`が呼ばれる           |
| SS-R-13 | インタラクション | FR       | スキャン中はボタンが`disabled`になる                   |
| SS-A-14 | アクセシビリティ | NFR      | `aria-haspopup="listbox"`, `aria-expanded`が設定される |
| SS-A-15 | アクセシビリティ | NFR      | クリック後`aria-expanded="true"`に更新される           |

**Store依存**: `useSkillStore()` → `availableSkills`, `importedSkills`, `selectedSkillName`, `isScanning`, `selectSkillByName`, `rescanSkills`

### 2. SkillImportDialog

**ファイルパス**: `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`

| 要件ID   | カテゴリ         | 要件種別 | 要件                                                   |
| -------- | ---------------- | -------- | ------------------------------------------------------ |
| SID-R-01 | レンダリング     | FR       | `isOpen=false`でダイアログが表示されない               |
| SID-R-02 | レンダリング     | FR       | スキル名・説明が表示される                             |
| SID-R-03 | レンダリング     | FR       | 許可ツールがバッジとして表示される                     |
| SID-R-04 | レンダリング     | FR       | サブエージェント一覧と件数が表示される                 |
| SID-R-05 | レンダリング     | FR       | 参照資料一覧と件数が表示される                         |
| SID-R-06 | レンダリング     | FR       | 空セクション（scripts: []等）は表示されない            |
| SID-I-07 | インタラクション | FR       | インポートボタンで`importSkill(skill.name)`が呼ばれる  |
| SID-I-08 | インタラクション | FR       | `isImporting=true`でインポートボタンが`disabled`になる |
| SID-I-09 | インタラクション | FR       | インポート成功後`onClose()`が呼ばれる                  |
| SID-I-10 | インタラクション | FR       | キャンセルボタンで`onClose()`が呼ばれる                |
| SID-I-11 | インタラクション | FR       | 閉じるボタン（×）で`onClose()`が呼ばれる               |
| SID-I-12 | インタラクション | FR       | インポート中はキャンセルボタンが`disabled`になる       |

**Props**: `skill: SkillMetadata`, `isOpen: boolean`, `onClose: () => void`
**Store依存**: `useAppStore()` → `importSkill`, `isImporting`, `importingSkillName`

### 3. PermissionDialog

**ファイルパス**: `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`

| 要件ID  | カテゴリ         | 要件種別 | 要件                                                                       |
| ------- | ---------------- | -------- | -------------------------------------------------------------------------- |
| PD-R-01 | レンダリング     | FR       | `pendingPermission===null`でダイアログが表示されない                       |
| PD-R-02 | レンダリング     | FR       | ツール名が表示される                                                       |
| PD-R-03 | レンダリング     | FR       | Bashコマンド引数がフォーマットされて表示される                             |
| PD-R-04 | レンダリング     | FR       | ファイルパス引数が表示される                                               |
| PD-R-05 | レンダリング     | FR       | JSON引数がフォーマットされて表示される                                     |
| PD-R-06 | レンダリング     | FR       | 理由（reason）が表示される                                                 |
| PD-I-07 | インタラクション | FR       | 拒否ボタンで`respondToSkillPermission(false, false)`が呼ばれる             |
| PD-I-08 | インタラクション | FR       | 閉じるボタンで`respondToSkillPermission(false, false)`が呼ばれる           |
| PD-I-09 | インタラクション | FR       | 1回許可ボタンで`respondToSkillPermission(true, false)`が呼ばれる           |
| PD-I-10 | インタラクション | FR       | 許可ボタン（remember未チェック）で`respondToSkillPermission(true, false)`  |
| PD-I-11 | インタラクション | FR       | 許可ボタン（rememberチェック済み）で`respondToSkillPermission(true, true)` |
| PD-I-12 | インタラクション | FR       | rerender後チェックボックスがリセットされる                                 |

**Store依存**: `useAppStore()` → `pendingPermission`, `respondToSkillPermission`
**追加依存**: `permissionDescriptions.ts`, `toolMetadata.ts`

### 4. SkillStreamingView

**ファイルパス**: `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`

| 要件ID   | カテゴリ         | 要件種別 | 要件                                                       |
| -------- | ---------------- | -------- | ---------------------------------------------------------- |
| SSV-R-01 | レンダリング     | FR       | スキル名が表示される                                       |
| SSV-R-02 | レンダリング     | FR       | assistantメッセージのテキストが表示される                  |
| SSV-R-03 | レンダリング     | FR       | パーシャルメッセージにカーソル表示がある                   |
| SSV-R-04 | レンダリング     | FR       | tool_useメッセージに「ツール使用: {toolName}」が表示される |
| SSV-R-05 | レンダリング     | FR       | tool_result成功時に「完了」が表示される                    |
| SSV-R-06 | レンダリング     | FR       | tool_result失敗時に「エラー: {error}」が表示される         |
| SSV-R-07 | レンダリング     | FR       | errorメッセージにエラー詳細が表示される                    |
| SSV-S-08 | ステータス       | FR       | `running`状態で「実行中...」バッジが表示される             |
| SSV-S-09 | ステータス       | FR       | `permission_pending`で「権限確認」バッジが表示される       |
| SSV-S-10 | ステータス       | FR       | `completed`で「完了」バッジが表示される                    |
| SSV-S-11 | ステータス       | FR       | `error`で「エラー」バッジが表示される                      |
| SSV-S-12 | ステータス       | FR       | `idle`でバッジが表示されない                               |
| SSV-I-13 | インタラクション | FR       | `running`時に停止ボタンが表示される                        |
| SSV-I-14 | インタラクション | FR       | `completed`時に停止ボタンが表示されない                    |
| SSV-I-15 | インタラクション | FR       | 停止ボタンクリックで`abortExecution()`が呼ばれる           |
| SSV-R-16 | レンダリング     | FR       | ツール実行履歴の折りたたみ表示がある                       |

**Props**: `skillName: string`, `messages: SkillStreamMessage[]`, `status: SkillExecutionStatus | null`
**Store依存**: `useAppStore()` → `abortExecution`

## 非機能要件

| NFR-ID | カテゴリ         | 基準                                |
| ------ | ---------------- | ----------------------------------- |
| NFR-01 | カバレッジ       | Line/Function/Statement 80%+        |
| NFR-02 | カバレッジ       | Branch 60%+                         |
| NFR-03 | パフォーマンス   | テスト実行時間 10秒以内             |
| NFR-04 | アクセシビリティ | WCAG 2.1 AA準拠のARIA属性検証       |
| NFR-05 | 安定性           | フレイキーテストなし（3回連続成功） |

## 使用する型定義（@repo/shared）

| 型名                   | 用途                          |
| ---------------------- | ----------------------------- |
| SkillMetadata          | SkillImportDialog Props       |
| SkillSubResource       | サブリソース一覧表示          |
| ImportedSkill          | SkillSelector インポート済み  |
| SkillExecutionStatus   | SkillStreamingView ステータス |
| SkillStreamMessage     | ストリーミングメッセージ      |
| SkillPermissionRequest | PermissionDialog 表示データ   |

## 接続要件

| 接続カテゴリ | 内容                                                |
| ------------ | --------------------------------------------------- |
| Store接続    | `useSkillStore()` / `useAppStore()` のvi.mockモック |
| IPC通信      | Storeレベルでモックのため直接モック不要             |
| 型定義       | `@repo/shared` の型に準拠したテストデータ           |
| テスト環境   | Vitest + @testing-library/react + happy-dom         |
