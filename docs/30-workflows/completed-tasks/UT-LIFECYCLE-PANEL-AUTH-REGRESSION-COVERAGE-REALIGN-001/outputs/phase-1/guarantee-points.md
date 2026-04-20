# guarantee-points.md

## 保証点定義

### GP-01: rapid click 時の auth:login 非発火

| 項目           | 内容                                                                               |
| -------------- | ---------------------------------------------------------------------------------- |
| 導線           | skill-lifecycle-open-wizard-button への連打                                        |
| 実装位置       | SkillLifecyclePanel.tsx:1770 `onClick={onOpenSkillWizard}`                         |
| 発火条件の分析 | ボタン onClick は `onOpenSkillWizard` prop を直接呼ぶだけ。auth:login への経路なし |
| 検証方法       | `fireEvent.click()` 複数回実行後に `mockAuthLogin.not.toHaveBeenCalled()`          |
| モック戦略     | `window.electronAPI.auth.login = mockAuthLogin` として beforeEach でセット         |
| 単体テスト可否 | 可能                                                                               |

### GP-02: rerender 時の auth:login 非発火

| 項目           | 内容                                                                                                           |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| 導線           | props / state 変化による rerender                                                                              |
| 実装位置       | 各 useEffect の依存配列                                                                                        |
| 発火条件の分析 | useEffect 依存配列に auth:login 発火トリガーは存在しない。skillName / isGenerating 変化は store state 更新のみ |
| 検証方法       | `rerender()` 後に `mockAuthLogin.not.toHaveBeenCalled()`                                                       |
| モック戦略     | `window.electronAPI.auth.login = mockAuthLogin` として beforeEach でセット                                     |
| 単体テスト可否 | 可能                                                                                                           |

### GP-03: onOpenSkillWizard 呼び出し時の auth:login 非発火

| 項目           | 内容                                                                                                      |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| 導線           | skill-lifecycle-open-wizard-button クリック                                                               |
| 実装位置       | SkillLifecyclePanel.tsx:1770                                                                              |
| 発火条件の分析 | `onOpenSkillWizard` prop を直接呼ぶだけ。auth:login への経路なし                                          |
| 検証方法       | クリック後に `mockOnOpenSkillWizard.toHaveBeenCalledTimes(1)` かつ `mockAuthLogin.not.toHaveBeenCalled()` |
| モック戦略     | `onOpenSkillWizard = vi.fn()`, `window.electronAPI.auth.login = mockAuthLogin`                            |
| 単体テスト可否 | 可能                                                                                                      |

### GP-04: onOpenWizard 呼び出し時の auth:login 非発火

| 項目           | 内容                                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| 導線           | skill-lifecycle-open-wizard ボタン（詳細ウィザード）クリック                                         |
| 実装位置       | SkillLifecyclePanel.tsx:1411                                                                         |
| 発火条件の分析 | `onOpenWizard` prop を直接呼ぶだけ。auth:login への経路なし                                          |
| 検証方法       | クリック後に `mockOnOpenWizard.toHaveBeenCalledTimes(1)` かつ `mockAuthLogin.not.toHaveBeenCalled()` |
| モック戦略     | `onOpenWizard = vi.fn()`, `window.electronAPI.auth.login = mockAuthLogin`                            |
| 単体テスト可否 | 可能                                                                                                 |

### GP-05: handleSessionStartNew 呼び出し時の auth:login 非発火

| 項目           | 内容                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------- |
| 導線           | SessionResumePrompt の「新規開始」ボタン → handleSessionStartNew()                              |
| 実装位置       | SkillLifecyclePanel.tsx:942                                                                     |
| 発火条件の分析 | deleteSession 後に `onOpenWizard?.()` を呼ぶ。auth:login への経路なし                           |
| 検証方法       | handleSessionStartNew 呼び出し後に `mockAuthLogin.not.toHaveBeenCalled()`                       |
| モック戦略     | `window.skillCreatorAPI.deleteSession = vi.fn()`, `onOpenWizard = vi.fn()`, auth.login をモック |
| 単体テスト可否 | 可能（SessionResumePrompt 経由でなく直接呼び出しも可）                                          |
