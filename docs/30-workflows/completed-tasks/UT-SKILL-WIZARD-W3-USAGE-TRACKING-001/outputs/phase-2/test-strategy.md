# Phase 2 成果物: テスト戦略

## trackEvent.ts スタブ全分岐テスト戦略

モック設定:

```typescript
vi.mock("../../utils/trackEvent", () => ({
  trackEvent: vi.fn(),
}));
```

dev/prod 分岐テスト:

- dev: `vi.spyOn(console, 'info')` で `console.info` 呼び出しを確認
- prod: `vi.stubEnv('NODE_ENV', 'production')` 後に `console.info` 非呼び出しを確認

## SkillCreateWizard.tsx テストケース（7件）

| ケース    | 検証内容                                                                             |
| --------- | ------------------------------------------------------------------------------------ |
| TC-SCW-01 | マウント時 `skill_wizard_open` が `source: 'direct'` で発火                          |
| TC-SCW-02 | `source='lifecycle_panel'` で `skill_wizard_open` が正しく発火                       |
| TC-SCW-03 | Step 0 完了時 `skill_wizard_step_complete` `{ step: 0, stepName: 'スキル情報入力' }` |
| TC-SCW-04 | Step 1 完了時 `skill_wizard_step_complete` `{ step: 1, stepName: '詳細設定' }`       |
| TC-SCW-05 | Step 2 完了時 `skill_wizard_step_complete` `{ step: 2, stepName: '生成' }`           |
| TC-SCW-06 | Step 3 未到達アンマウント時 `skill_wizard_abandon` 発火                              |
| TC-SCW-07 | Step 3 到達後アンマウント時 `skill_wizard_abandon` 非発火                            |

## CompleteStep.tsx テストケース（4件）

| ケース   | 検証内容                                                                    |
| -------- | --------------------------------------------------------------------------- |
| TC-CS-01 | 今すぐ実行するクリック時 `skill_wizard_next_action` `{ action: 'execute' }` |
| TC-CS-02 | エディタで開くクリック時 `skill_wizard_next_action` `{ action: 'edit' }`    |
| TC-CS-03 | 別のスキルを作るクリック時 `skill_wizard_next_action` `{ action: 'close' }` |
| TC-CS-04 | 閉じるボタンクリック時 `skill_wizard_next_action` 非発火                    |

## NON_VISUAL 証跡取得方針

- コマンド: `pnpm --filter @repo/desktop test:run -- --coverage`
- 証跡: vitest verbose 出力テキスト
- Phase 11 では screenshot 不要
