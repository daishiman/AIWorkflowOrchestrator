# Phase 13: PR テンプレート

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 |
| Phase      | 13                                        |
| ステータス | 完了                                      |
| 実行日     | 2026-02-27                                |

---

## PR タイトル

```
fix(ipc): skill IPCレスポンス形式統一とエラーサニタイズ追加
```

---

## PR 本文

```markdown
## Summary

- skill: IPC 14チャンネルのエラーハンドリングに sanitizeErrorMessage を追加し、内部情報（パス、IP、スタックトレース）の漏洩を防止
- optimize系3チャンネルのバリデーションエラーを return 方式から throw 方式に統一し、全チャンネルで一貫したエラーハンドリングを実現
- 契約テスト105件を追加し、全14チャンネルの契約プロファイル（A/B/C）準拠を自動検証

## Changes

### skillHandlers.ts

- `sanitizeErrorMessage` 関数追加（7種類のサニタイズパターン）
- 全10個の catch ブロックで `sanitizeErrorMessage` を適用
- `skill:optimize`, `skill:optimize:variants`, `skill:optimize:evaluate` のバリデーションを throw 方式に統一
- 全 catch ブロックに `log.error` を追加

### テスト

- `skillHandlers.contract.test.ts` 追加（54テスト）
- `skill-api.contract.test.ts` 追加（51テスト）
- 既存テスト `SH-SC-09` の期待値を新デフォルトメッセージに更新

## Test plan

- [x] skillHandlers テスト 240件全PASS
- [x] skill-api テスト 214件全PASS
- [x] Lint エラー 0
- [x] TypeCheck エラー 0
- [x] AR-1〜AR-7 制約準拠確認
- [ ] DevTools で `window.electronAPI.skill` が object であることを確認
- [ ] DevTools で `window.skillAPI` が undefined であることを確認
```

---

## ラベル

- `fix`
- `ipc`
- `security`

## レビュアー

- 自動割り当て
