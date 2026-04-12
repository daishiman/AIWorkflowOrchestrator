# Phase 2 設計決定事項サマリー

## 採用パターン: Vite E2E alias + `window.__trackEventCalls`

### 理由

- `SkillCreateWizard.tsx` は `trackEvent` を静的 import しているため、実行後の `window` 差し替えでは追従しない
- `vite.e2e.config.ts` で alias を設定することで、production code を触らずに記録を差し込める
- `window.__trackEventCalls` に統一することで、テスト側の取得 API を `page.evaluate` だけにできる
- onboarding overlay は `window.electronAPI.store.get` の E2E 注入で抑制する

### 設計決定

| 項目               | 決定内容                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| スタブ注入パターン | Vite E2E alias（絶対パス指定）                                                                  |
| 記録形式           | `window.__trackEventCalls` 配列                                                                 |
| 初期化タイミング   | `page.addInitScript`（`page.goto()` より前、trackEvent capture + onboarding store mock を注入） |
| 型整合             | `import type { SkillWizardEvents }` で循環回避                                                  |

### 確認済み事項

- スキルセンターへの遷移は dashboard → skillCenter → skillManagement → create の流れで到達可能
- `skill-management-create-button` は `SkillManagementPanel` の `data-testid` として利用可能
- ConversationRoundStep の生成ボタンは `今すぐ生成する` をクリックする
