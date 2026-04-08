# Phase 2 責務分離セクション設計書 - UT-VERIFY-DOC-CONSOLIDATION-001

## 追記先ファイル

`interfaces-skill-verify-contract.md`（固定）

追記位置: 既存の Layer 定義セクションの末尾（`## Layer 4: 参照整合性・結合検証` の後）

---

## 責務分離比較表（設計）

| 関数名                   | 実装ファイル                        | 責務                                                      | 返却値                                      |
| ------------------------ | ----------------------------------- | --------------------------------------------------------- | ------------------------------------------- |
| `verifySkill()`          | `RuntimeSkillCreatorFacade.ts`      | `verificationEngine.verify()` を呼び出し Check 配列を返す | `RuntimeSkillCreatorVerifyCheck[]`          |
| `verifyAndImproveLoop()` | `RuntimeSkillCreatorFacade.ts`      | 検証結果の severity に基づく improve ループ制御           | `RuntimeSkillCreatorVerifyAndImproveResult` |
| `verify()`               | `SkillCreatorVerificationEngine.ts` | 19 件の Check を 4 Layer で実行し結果を収集する           | `RuntimeSkillCreatorVerifyCheck[]`          |

---

## 責務分離の原則（自然言語説明）

1. **`verifySkill()`** — Facade の公開 API として外部から呼び出され、VerificationEngine の結果をガバナンスフック付きで中継する。`onSessionStart` / `onSessionEnd` ガバナンスフックを通じて監査ログを記録する。
2. **`verifyAndImproveLoop()`** — severity 判定と improve ループ制御を担い、`verifySkill()` を内部で繰り返し呼び出す。前回の改善要約を feedback に織り込んで同一修正の反復を抑制する。
3. **`verify()`** — 検証ロジックの本体であり、`RuntimeSkillCreatorFacade.ts` の `verifySkill()` からのみ呼び出される（外部公開しない）。19 件の Check を 4 Layer で順次実行する。

---

## コード根拠の確認

- `verifySkill()`: `RuntimeSkillCreatorFacade.ts` 294行目で確認済み
  - `const checks = await this.verificationEngine.verify(skillDir);` — Engine を呼び出す中継役であることが確認できる
- `verifyAndImproveLoop()`: `RuntimeSkillCreatorFacade.ts` 352行目で確認済み
  - `checks = await this.verifySkill(skillDir);` — `verifySkill()` を内部で呼び出すことが確認できる
- `verify()`: `SkillCreatorVerificationEngine.ts` に実装、`RuntimeSkillCreatorVerifyCheck[]` を返す

---

## セクション見出し

```markdown
## verify エンジン責務分離
```

---

## 完了確認

- [x] 3関数の実装ファイルが正確（`verifySkill`/`verifyAndImproveLoop` は Facade、`verify` は Engine）
- [x] 返却値の型名が `@repo/shared` の定義と一致している
- [x] 責務の記述が実装と乖離していない
- [x] 追記先ファイルと追記位置が決定している
