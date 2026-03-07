# Phase 9: 品質チェックリスト

## 品質監査

### 防御境界

- [x] normalize が ApiKeysSection の loadProviders 1箇所に集約
- [x] 各 render branch が配列前提を持たない（providers state は常に配列型）
- [x] AuthKeySection パターンと一貫した防御スタイル

### 契約監査

- [x] `apiKey.list()` の戻り値型は preload/types.ts で定義済み
- [x] ランタイム shape 逸脱は `console.warn` で記録
- [x] TypeScript 型と実行時ガードの二重防御

### UX

- [x] shape 異常時も SettingsView は継続表示
- [x] エラーメッセージ「APIキー機能が利用できません」で原因追跡可能
- [x] silent failure ではない（`console.warn` + UI エラー表示）

### 回帰耐性

- [x] task-04（preload payload 防御）と責務が分離
- [x] 既存テストへの影響なし
- [x] 新規テストで異常系をカバー

### Lint / TypeCheck

- [ ] `pnpm lint` → PASS
- [ ] `pnpm typecheck` → PASS
- [ ] `pnpm --filter @repo/desktop vitest run` → 関連テスト PASS

## リリース前 Blocker: なし
