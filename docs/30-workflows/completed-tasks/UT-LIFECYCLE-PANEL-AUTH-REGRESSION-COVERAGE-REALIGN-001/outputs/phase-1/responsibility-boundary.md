# responsibility-boundary.md

## 責務境界テーブル

| 導線                             | 実装位置                                                   | 責務区分 | テスト種別 | 判定根拠                                                                                            |
| -------------------------------- | ---------------------------------------------------------- | -------- | ---------- | --------------------------------------------------------------------------------------------------- |
| onOpenSkillWizard 呼び出し時     | SkillLifecyclePanel.tsx:1770 `onClick={onOpenSkillWizard}` | 単体     | 単体テスト | モック境界内のコールバック。wizard 内部実装に依存しない。prop として渡された vi.fn() を直接呼ぶだけ |
| onOpenWizard 呼び出し時          | SkillLifecyclePanel.tsx:1411 `onClick={onOpenWizard}`      | 単体     | 単体テスト | モック境界内のコールバック。wizard 内部実装に依存しない                                             |
| handleSessionStartNew 呼び出し時 | SkillLifecyclePanel.tsx:942 `handleSessionStartNew`        | 単体     | 単体テスト | SkillLifecyclePanel 内部関数。ipc モックで検証可能。最終的に `onOpenWizard?.()` を呼ぶ              |
| rapid click 時の非発火           | skill-lifecycle-open-wizard-button への連打                | 単体     | 単体テスト | コンポーネント内のイベントハンドラ重複発火防止は単体で検証可能                                      |
| rerender 時の非発火              | props/state 変化による rerender                            | 単体     | 単体テスト | useEffect 依存配列の副作用は単体で検証可能                                                          |
| wizard 起動先での auth 非混入    | wizard コンポーネント内部                                  | 統合     | 統合テスト | wizard コンポーネントの内部実装に依存するため統合テスト                                             |
| session resume フロー全体        | SessionResumePrompt との連携                               | 統合     | 統合テスト | SessionResumePrompt との連携を含むため統合テスト                                                    |
| authModeSlice.setMode() の契約   | authModeSlice.ts                                           | 単体     | 単体テスト | Redux スライスのアクション。コンポーネント単体で検証可能（TC-08 が担保）                            |

## モック境界の定義

「モック境界内」とは `SkillLifecyclePanel` が直接保持・呼び出す関数・状態を指す。
具体的には `vi.mock("../../../store", ...)` と `window.electronAPI` / `window.skillCreatorAPI` の mock で完結する範囲。

## handleSessionStartNew の境界判定詳細

`handleSessionStartNew` は `getSessionResumeApi()` を通じた `deleteSession` 呼び出し後に `onOpenWizard?.()` を呼ぶ。
`deleteSession` は `window.skillCreatorAPI.deleteSession` に対応するため、mock で制御可能。
`onOpenWizard` はコールバック prop なのでモック境界内。→ **単体テスト**で検証可能と判定。
