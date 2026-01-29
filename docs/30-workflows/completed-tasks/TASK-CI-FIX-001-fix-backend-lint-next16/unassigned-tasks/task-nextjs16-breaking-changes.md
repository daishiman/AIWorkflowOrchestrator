# Next.js 16 その他の破壊的変更対応 - タスク指示書

## メタ情報

| 項目         | 内容                              |
| ------------ | --------------------------------- |
| タスクID     | TASK-CI-FIX-001-U1                |
| タスク名     | Next.js 16 その他の破壊的変更対応 |
| 分類         | 改善                              |
| 対象機能     | apps/backend（Next.js 16移行）    |
| 優先度       | 中                                |
| 見積もり規模 | 中規模                            |
| ステータス   | 未実施                            |
| 発見元       | TASK-CI-FIX-001 元タスク仕様書    |
| 発見日       | 2026-01-29                        |
| issue_number | 563                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-CI-FIX-001では`next lint`削除への対応のみを実施した。Next.js 16にはその他にも破壊的変更が含まれており、それらへの対応が必要となる可能性がある。

### 1.2 問題点・課題

Next.js 16の主な破壊的変更候補:

- **async Request API**: `cookies()`, `headers()`, `params`, `searchParams`が非同期APIに変更
- **Turbopack デフォルト化**: `next dev`がTurbopackをデフォルトで使用
- **React 19必須**: React 19が最小バージョンに
- **Node.js 18.18.0+必須**: 最小Node.jsバージョンの引き上げ

### 1.3 放置した場合の影響

- Next.jsのアップグレード時にビルドエラーやランタイムエラーが発生する可能性
- dependabot PRがマージできない状態が継続する

---

## 2. 何を達成するか（What）

### 2.1 目的

apps/backend パッケージをNext.js 16の全破壊的変更に対応させる。

### 2.2 最終ゴール

- `pnpm --filter @repo/backend build` が成功する
- `pnpm --filter @repo/backend lint` が成功する
- `pnpm --filter @repo/backend test` が全件PASS
- dependabot PR #562 がマージ可能になる

### 2.3 スコープ

#### 含むもの

- apps/backend パッケージのNext.js 16対応
- async Request API移行（該当箇所がある場合）
- package.jsonの依存関係更新

#### 含まないもの

- apps/web パッケージの対応（別タスク: TASK-CI-FIX-001-U3）
- packages/shared の変更

### 2.4 成果物

- 更新されたソースコード
- Phase 1-12 の全成果物

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-CI-FIX-001（ESLint設定移行）が完了していること

### 3.2 依存タスク

- TASK-CI-FIX-001（完了済み）

### 3.3 必要な知識

- Next.js 15→16 マイグレーションガイド
- async/await パターン（Request API移行用）
- Turbopack設定

### 3.4 推奨アプローチ

1. Next.js 16 マイグレーションガイドを確認
2. `apps/backend` で影響を受けるAPIの使用箇所を特定
3. 段階的に各破壊的変更に対応

---

## 4. 実行手順

### Phase構成

task-specification-creatorスキルを使用してPhase 1-13の仕様書を生成する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] async Request API の移行完了（該当箇所がある場合）
- [ ] ビルドが成功する
- [ ] 既存テストが全件PASS

### 品質要件

- [ ] TypeScript型チェックが成功する
- [ ] ESLintが警告・エラーなし

### ドキュメント要件

- [ ] Phase 12 成果物が作成されている

---

## 6. 検証方法

### テストケース

- `pnpm --filter @repo/backend build` の成功確認
- `pnpm --filter @repo/backend lint` の成功確認
- `pnpm --filter @repo/backend test` の全件PASS確認

### 検証手順

1. dependabot PR #562 のブランチで変更を適用
2. CI パイプラインの全ジョブがPASSすることを確認

---

## 7. リスクと対策

| リスク                        | 影響度 | 発生確率 | 対策                                     |
| ----------------------------- | ------ | -------- | ---------------------------------------- |
| async API移行による大規模変更 | 中     | 中       | codemod ツールの使用を検討               |
| Turbopack互換性問題           | 低     | 低       | `--turbo=false` フラグでオプトアウト可能 |

---

## 8. 参照情報

### 関連ドキュメント

- TASK-CI-FIX-001 実装ガイド: `docs/30-workflows/TASK-CI-FIX-001-fix-backend-lint-next16/outputs/phase-12/implementation-guide.md`
- dependabot PR: #562

### 参考資料

- Next.js 16 Migration Guide: https://nextjs.org/docs/app/building-your-application/upgrading

---

## 9. 備考

### 補足事項

- dependabot PR #562 の一部として別途対応が必要
- TASK-CI-FIX-001完了により `next lint` 問題は解決済み
