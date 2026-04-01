# テスト仕様書 — TASK-TRACE-SKILL-AUTH-001

作成日: 2026-04-01

---

## テストファイル

`apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx`

---

## テストケース一覧

| TC    | 種別               | 対象                                                                               | 期待結果                                                                                         | 修正前                          |
| ----- | ------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------- |
| TC-01 | 回帰テスト         | SkillLifecyclePanel.handlePrepare → detectMode / mode 更新 / auth:login 非呼び出し | `mockDetectMode` が 1 回、`skill-lifecycle-mode-label` が `直作成`、`mockAuthLogin` が呼ばれない | RED（バグ存在時）               |
| TC-02 | 正常系保護         | AccountSection → auth:login 呼び出し                                               | `mockLoginIPC` が呼ばれる                                                                        | GREEN                           |
| TC-03 | 回帰テスト         | スキル生成 → auth:login が pending でも完了                                        | `mockAuthLogin` が pending でも `skill-lifecycle-mode-label` が `直作成` になる                  | RED（バグ存在時）               |
| TC-04 | デバッグコード確認 | authSlice.login() → trace なし                                                     | `console.trace` が呼ばれない                                                                     | GREEN（デバッグコード未挿入時） |

---

## テスト実行コマンド

```bash
# TC-01〜TC-04 を実行
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# auth:login 関連テストを全て実行
pnpm --filter @repo/desktop test -- --grep "auth:login"

# 全体テスト実行
pnpm vitest run
```

---

## RED テスト確認手順（修正前）

1. `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` を実行
2. TC-01 と TC-03 が FAIL することを確認する（バグが存在する場合）
3. TC-02 と TC-04 は PASS のままであること

---

## 注意事項

- TC-01 の `prepareButton` が見つからない場合、テストはスキップされる（ボタン名が変わっている可能性あり）
- その場合は実際のボタン名に合わせてクエリを調整する

---

_Phase 4 完了: 2026-04-01_
