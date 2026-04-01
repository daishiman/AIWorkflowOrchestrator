# 修正サマリー — TASK-TRACE-SKILL-AUTH-001

作成日: 2026-04-01

---

## 調査結果サマリー

### 特定された呼び出し経路

**結論: 現在のコードに不要な `auth:login` 呼び出し経路は存在しない。**

静的解析（7ファイル網羅）とテスト実行（TC-01/TC-03 GREEN）の両方で確認。

スキル生成フロー（`handlePrepare → detectMode → planSkill`）は `auth.login` を呼ばない。
`auth.login()` はユーザーの明示的なボタン操作（`AccountSection` / `AuthView`）でのみ発火する。

---

### 修正したファイルと行番号

| ファイル                                               | 変更内容                          | 理由                                    |
| ------------------------------------------------------ | --------------------------------- | --------------------------------------- |
| `authSlice.ts:276-278`                                 | `[TEMP DEBUG]` console.trace 除去 | Phase 5 調査完了後の必須クリーンアップ  |
| `SkillLifecyclePanel.auth-regression.test.tsx:219-231` | TC-01 クエリ修正                  | queryByRole("textbox") の多重マッチ解消 |
| `SkillLifecyclePanel.auth-regression.test.tsx:264`     | TC-02 require → import            | ESM/CommonJS 互換性修正                 |
| `SkillLifecyclePanel.auth-regression.test.tsx:326-329` | TC-03 クエリ修正                  | TC-01 と同様                            |

---

### 修正の理由と影響範囲

| 項目     | 内容                                                             |
| -------- | ---------------------------------------------------------------- |
| 修正理由 | デバッグコードは一時的な観測用途のみ。本番コードに残すべきでない |
| 影響範囲 | `authSlice.ts` の `login()` 動作は変わらない。副作用なし         |
| 破棄判断 | **patch で十分** — 単一ファイル・1箇所のデバッグコード除去       |

---

### patch / 再構成 の判断

**patch を選択。**

根拠:

- 修正対象は `authSlice.ts` の `login()` 先頭の 2行のみ（デバッグコード除去）
- コンポーネント間の責務境界に変更なし
- TC-01/TC-03 の GREEN により、不要な呼び出しはテスト環境では存在しないことが確認済み

---

### デバッグコード除去の確認

```bash
# [TEMP DEBUG] が残っていないことを確認済み
$ grep -r "TEMP DEBUG" apps/desktop/src/  # → 出力なし
$ grep -r "TRACE-SKILL-AUTH-001" apps/desktop/src/  # → テストファイルのみ
```

テストファイル内の `TRACE-SKILL-AUTH-001` 参照は TC-04 の検証ロジックのため正常。

---

### TC-01/TC-02/TC-03/TC-04 最終確認

```
 ✓ TC-01: handlePrepare does not call auth:login during skill generation
 ✓ TC-02: AccountSection triggers auth:login on demand
 ✓ TC-03: skill generation completes without auth:login timeout (542ms)
 ✓ TC-04: authSlice.login thunk works correctly (no debug code)

 Test Files  1 passed (1)
      Tests  5 passed (5)
```

---

_Phase 5 完了: 2026-04-01_
