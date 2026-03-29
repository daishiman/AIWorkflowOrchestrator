# Architecture Design — TASK-RT-04

## 方針

- UI は `ApiKeySettingsPanel` を新設し、`SkillLifecyclePanel` に補助導線として配置する。
- 状態所有は panel 内 local state に限定し、runtime workflow state へ侵食させない。
- 認証契約は `window.electronAPI.authKey` のみを使用する。

## 設計判断

- 主導線: `SettingsView`
- 補助導線: `SkillLifecyclePanel`
- 型追加: `ApiKeyStatus`
