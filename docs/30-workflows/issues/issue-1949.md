# [#1949] [TASK-RT-04-APIKEYPANEL-REMOVAL-001] ApiKeySettingsPanelの完全廃止

## 概要

`ApiKeySettingsPanel` は `AuthKeySection` への委譲ラッパーに変更済みであり、現在は重複UIの互換維持のために残っている。
委譲ラッパーが残ることで導線の単一化が完了せず、将来的なUI変更時にメンテナンス対象が増える。

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | TASK-RT-04-APIKEYPANEL-REMOVAL-001                  |
| 分類         | 改善（リファクタリング）                            |
| 対象機能     | Skill Lifecycle / AuthKey UI                        |
| 優先度       | 低                                                  |
| 見積もり規模 | 小規模（Phase 1: 0.5h, Phase 2: 1h, Phase 3: 0.5h） |
| ステータス   | 未実施                                              |
| 発見元       | TECH-M-01（rt-04-authkey-component-dedup Phase 3）  |
| 発見日       | 2026-04-06                                          |
| 親Issue      | #1903                                               |

## 目的

`ApiKeySettingsPanel` を廃止し、`AuthKeySection` へ導線を一本化する。

## 最終ゴール

- `ApiKeySettingsPanel` の参照がすべて削除される
- `AuthKeySection` を直接使用する形に置き換えられている

## スコープ

### 含むもの

- `ApiKeySettingsPanel` の参照箇所の棚卸し
- `AuthKeySection` への直接参照へ置き換え
- 不要ファイルの削除とテスト更新

### 含まないもの

- `auth-key:*` IPC の仕様変更
- `AuthKeySection` の UI 仕様変更

## 実施手順

### Phase 1: 調査（0.5h）

1. `rg -n "ApiKeySettingsPanel" apps/desktop/src/renderer` を実行する
2. 参照ファイル一覧を確定する

### Phase 2: 実装（1h）

1. `ApiKeySettingsPanel` の参照を `AuthKeySection` へ置き換える
2. `ApiKeySettingsPanel.tsx` を削除する
3. 関連テストを更新する

### Phase 3: テスト確認（0.5h）

1. 影響範囲のテストを実行し PASS を確認する

## 完了条件チェックリスト

### 機能要件

- [ ] `ApiKeySettingsPanel` の参照がゼロ
- [ ] `AuthKeySection` への直接参照に置換済み

### 品質要件

- [ ] 影響範囲のテストが PASS
- [ ] 型チェックでエラーがない

### ドキュメント要件

- [ ] Phase 12 close-out で completed ledger を更新する

## 検証方法

| テストID | 内容                      | 確認コマンド                                             |
| -------- | ------------------------- | -------------------------------------------------------- |
| RV-01    | 参照箇所ゼロの確認        | `rg -n "ApiKeySettingsPanel" apps/desktop/src/renderer`  |
| RV-02    | 影響範囲のテスト実行 PASS | `pnpm --filter @repo/desktop test -- --run <対象テスト>` |

## 依存タスク

なし（単独実行可能）

## 関連ファイル

- `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx` — 廃止対象コンポーネント
- `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx` — 置き換え先コンポーネント
- `apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts` — AuthKeySection が依存するフック
- `docs/30-workflows/rt-04-authkey-component-dedup/` — 本タスクの親 workflow

## リスクと対策

| リスク                                                                       | 影響度 | 発生確率 | 対策                                                                                                 |
| ---------------------------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `vi.mock` hoisting 制約によりテストがビルドエラーになる                      | 中     | 中       | factory 関数内で `vi.fn()` を直接定義し、factory 外の変数参照を避ける                                |
| `refresh()` 戻り値型の設計ドリフトにより型エラーが発生する                   | 中     | 中       | Phase 8 で更新漏れになっている TypeScript interface を `AuthKeySection/index.tsx` と照合し、統一する |
| worktree 環境で esbuild バイナリバージョンが不一致になり Vitest が起動しない | 高     | 中       | worktree 作成後に `pnpm install` を実行する                                                          |

## 備考

`ApiKeySettingsPanel.tsx` を削除する前に、`rg -n "ApiKeySettingsPanel"` で参照箇所がゼロになっていることを必ず確認すること。
削除後に型チェック (`pnpm --filter @repo/desktop typecheck`) を実行し、型エラーがないことを確認すること。
