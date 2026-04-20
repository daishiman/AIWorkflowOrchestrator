# test-cases.md

## TC-06-NEW: AUTH-REGRESS-RAPID-CLICK-06 — rapid click

### 詳細仕様

| 項目              | 内容                                                                           |
| ----------------- | ------------------------------------------------------------------------------ |
| テストID          | AUTH-REGRESS-RAPID-CLICK-06                                                    |
| 保証内容          | skill-lifecycle-open-wizard-button を連打しても auth:login が 0 回呼ばれること |
| 旧 TC-06 との差分 | 旧 TC-06 は prepare フロー依存。現行は onClick={onOpenSkillWizard} 直呼び      |

#### ケース 1: 3 回連続クリック

- 前提: `window.electronAPI.auth.login = mockAuthLogin`、`onOpenSkillWizard = vi.fn()`
- 操作: `fireEvent.click(button)` を 3 回 `act` でラップして実行
- 期待: `mockAuthLogin.not.toHaveBeenCalled()`

#### ケース 2: 5 回連続クリック

- 前提: 同上
- 操作: `fireEvent.click(button)` を 5 回実行
- 期待: `mockAuthLogin.not.toHaveBeenCalled()`

## TC-07-NEW: AUTH-REGRESS-RERENDER-07 — rerender

### 詳細仕様

| 項目              | 内容                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------- |
| テストID          | AUTH-REGRESS-RERENDER-07                                                                |
| 保証内容          | props/state 変化による rerender 後も auth:login が 0 回呼ばれること                     |
| 旧 TC-07 との差分 | 旧 TC-07 は preparationState 変化依存。現行は skillName / isGenerating をトリガーに採用 |

#### ケース 1: skillName props 変更

- rerender トリガー: `skillName="skill-a"` → `skillName="skill-b"`
- 期待: `mockAuthLogin.not.toHaveBeenCalled()`

#### ケース 2: onOpenWizard props 変更

- rerender トリガー: `onOpenWizard` を新しい vi.fn() に差し替え
- 期待: `mockAuthLogin.not.toHaveBeenCalled()`

#### ケース 3: store 状態変化（isGenerating false→true）

- rerender トリガー: `mockStoreState.isGenerating = true` にして rerender
- 期待: `mockAuthLogin.not.toHaveBeenCalled()`

## TC-GUARD: AUTH-REGRESS-HANDLER-GUARANTEE — handler 保証

### 詳細仕様

| 項目     | 内容                                                             |
| -------- | ---------------------------------------------------------------- |
| テストID | AUTH-REGRESS-HANDLER-GUARANTEE                                   |
| 保証内容 | 各 handler が期待どおり呼ばれ、かつ auth:login が 0 回であること |

#### TC-GUARD-01a: onOpenSkillWizard

- 操作: `skill-lifecycle-open-wizard-button` クリック
- 期待: `mockOnOpenSkillWizard.toHaveBeenCalledTimes(1)` かつ `mockAuthLogin.not.toHaveBeenCalled()`

#### TC-GUARD-01b: onOpenWizard

- 操作: `skill-lifecycle-open-wizard` クリック
- 期待: `mockOnOpenWizard.toHaveBeenCalledTimes(1)` かつ `mockAuthLogin.not.toHaveBeenCalled()`

### 独立性の確認

TC-GUARD-01a/b は互いに独立。各 it ブロックは beforeEach で mockAuthLogin をリセットしてから実行される。
TC-GUARD は「副作用の非混入検証のみ」。handler が呼ばれることの主目的確認は TC-01a/b が担う。
