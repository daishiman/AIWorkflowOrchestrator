# ApiKeySettingsPanel の完全廃止 - タスク指示書

## メタ情報

| 項目         | 内容                                               |
| ------------ | -------------------------------------------------- |
| タスクID     | TASK-RT-04-APIKEYPANEL-REMOVAL-001                 |
| タスク名     | ApiKeySettingsPanel の完全廃止                     |
| 分類         | 改善                                               |
| 対象機能     | Skill Lifecycle / AuthKey UI                       |
| 優先度       | 低                                                 |
| 見積もり規模 | 小規模                                             |
| ステータス   | 未実施                                             |
| 発見元       | TECH-M-01（rt-04-authkey-component-dedup Phase 3） |
| 発見日       | 2026-04-06                                         |
| Issue番号    | #1903                                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`ApiKeySettingsPanel` は `AuthKeySection` への委譲ラッパーに変更済みであり、
現在は重複 UI の互換維持のために残っている。

### 1.2 問題点・課題

委譲ラッパーが残ることで、導線の単一化が完了せず、
将来的な UI 変更時にメンテナンス対象が増える。

### 1.3 放置した場合の影響

- 呼び出し元の統一が遅れ、UI/仕様の重複が残る
- テストやドキュメントの更新対象が増え続ける

---

## 2. 何を達成するか（What）

### 2.1 目的

`ApiKeySettingsPanel` を廃止し、`AuthKeySection` へ導線を一本化する。

### 2.2 最終ゴール

- `ApiKeySettingsPanel` の参照がすべて削除される
- `AuthKeySection` を直接使用する形に置き換えられている

### 2.3 スコープ

#### 含むもの

- `ApiKeySettingsPanel` の参照箇所の棚卸し
- `AuthKeySection` への直接参照へ置き換え
- 不要ファイルの削除とテスト更新

#### 含まないもの

- `auth-key:*` IPC の仕様変更
- `AuthKeySection` の UI 仕様変更

### 2.4 成果物

- 参照置換済みの UI コンポーネント
- `ApiKeySettingsPanel.tsx` の削除
- テストの更新

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `AuthKeySection` が本導線として利用可能であること
- 参照元が把握済みであること

### 3.2 依存タスク

- なし（単独実行可能）

### 3.3 必要な知識

- Renderer コンポーネントの導線設計
- 参照置換とテスト更新の手順

### 3.4 推奨アプローチ

1. `rg "ApiKeySettingsPanel" apps/desktop/src/renderer` で参照箇所を洗い出す
2. 参照を `AuthKeySection` へ移行する
3. 影響するテストを更新する
4. `ApiKeySettingsPanel.tsx` を削除する

---

## 4. 実行手順

### Phase構成

| Phase | 内容       | 目安 |
| ----- | ---------- | ---- |
| 1     | 調査       | 0.5h |
| 2     | 実装       | 1h   |
| 3     | テスト確認 | 0.5h |

### Phase 1: 調査

1. `rg -n "ApiKeySettingsPanel" apps/desktop/src/renderer` を実行する
2. 参照ファイル一覧を確定する

### Phase 2: 実装

1. `ApiKeySettingsPanel` の参照を `AuthKeySection` へ置き換える
2. `ApiKeySettingsPanel.tsx` を削除する
3. 関連テストを更新する

### Phase 3: テスト確認

1. 影響範囲のテストを実行し PASS を確認する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `ApiKeySettingsPanel` の参照がゼロ
- [ ] `AuthKeySection` への直接参照に置換済み

### 品質要件

- [ ] 影響範囲のテストが PASS
- [ ] 型チェックでエラーがない

### ドキュメント要件

- [ ] Phase 12 close-out で completed ledger を更新する

---

## 6. 検証方法

| テストID | 内容                      | 確認コマンド                                             |
| -------- | ------------------------- | -------------------------------------------------------- |
| RV-01    | 参照箇所ゼロの確認        | `rg -n "ApiKeySettingsPanel" apps/desktop/src/renderer`  |
| RV-02    | 影響範囲のテスト実行 PASS | `pnpm --filter @repo/desktop test -- --run <対象テスト>` |

---

## 7. リスクと対策

| リスク                                                                       | 影響度 | 発生確率 | 対策                                                                                                  |
| ---------------------------------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------------------------- |
| `vi.mock` hoisting 制約によりテストがビルドエラーになる                      | 中     | 中       | factory 関数内で `vi.fn()` を直接定義し、factory 外の変数参照を避ける                                 |
| `renderHook` での `isSubmittingRef` 排他制御が期待通りに動作しない           | 中     | 低       | `useRef` を用いた排他制御パターンをテスト側でも `act()` でラップして確認する                          |
| `refresh()` 戻り値型の設計ドリフトにより型エラーが発生する                   | 中     | 中       | Phase 8 で更新漏れになっている TypeScript interface を `AuthKeySection/index.tsx` と照合し、統一する  |
| worktree 環境で esbuild バイナリバージョンが不一致になり Vitest が起動しない | 高     | 中       | worktree 作成後に `pnpm install` を実行し、`ESBUILD_BINARY_PATH` 環境変数が必要な場合は明示設定する   |
| `outputs/phase-1〜5/` ディレクトリが空のまま Close-out できない              | 低     | 高       | 前半フェーズの記録ファイルは Phase 12 close-out 前に空欄でも `N/A` で補完し、ディレクトリを実体化する |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/rt-04-authkey-component-dedup/` — 本タスクの親 workflow
- `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx` — 置き換え先コンポーネント
- `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx` — 廃止対象コンポーネント
- `apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts` — AuthKeySection が依存するフック

### 参考資料

- Vitest `vi.mock` hoisting 制約: [Vitest 公式ドキュメント](https://vitest.dev/api/vi.html#vi-mock)

---

## 9. 備考

### 苦戦箇所（rt-04-authkey-component-dedup Phase 3 での経験）

本タスクを実施する際には、以下の苦戦箇所を事前に把握しておくこと。

#### a. `vi.mock` hoisting 制約（ApiKeySettingsPanel テスト）

- **問題**: `vi.mock()` はファイル先頭に hoist されるため、factory 関数の外で定義した変数（`const mockFn = vi.fn()` など）を factory 内で参照すると `ReferenceError` になる。
- **対策**: factory 関数内で `vi.fn()` を直接定義する。外部変数を参照する場合は `vi.hoisted()` を使う。

```typescript
// NG: factory 外の変数を参照
const mockSetApiKey = vi.fn();
vi.mock("../hooks/useAuthKeyManagement", () => ({
  useAuthKeyManagement: () => ({ setApiKey: mockSetApiKey }), // hoisting 違反
}));

// OK: factory 内で直接定義
vi.mock("../hooks/useAuthKeyManagement", () => ({
  useAuthKeyManagement: () => ({ setApiKey: vi.fn() }),
}));
```

#### b. `renderHook` での `ref` 挙動（`isSubmittingRef` 排他制御）

- **問題**: `useRef` による排他制御は `renderHook` の結果として直接 assert できない。非同期処理中に `isSubmittingRef.current = true` をセットするパターンは、テスト内で競合状態を作りやすい。
- **対策**: `act()` でラップした上で、submit 連打をシミュレートするテストを書き、後続呼び出しが無視されることを件数で検証する。

#### c. `refresh()` 戻り値型の設計ドリフト

- **問題**: Phase 2 設計では `refresh(): void` だったが、Phase 8 のリファクタリング時に `Promise<void>` へ変更された際に TypeScript interface の更新が漏れ、型エラーが後から発覚した。
- **対策**: 実装着手前に `AuthKeySection/index.tsx` と `useAuthKeyManagement.ts` の関数シグネチャを照合し、interface と実装が一致しているかを確認する。

#### d. esbuild binary version mismatch（worktree 環境）

- **問題**: worktree を新規作成した直後は node_modules の esbuild ホストバイナリとバイナリ実行ファイルのバージョンが不一致になり、`pnpm vitest run` が即座に停止することがある。
- **対策**: worktree 作成後は必ず `pnpm install` を実行する。それでも解消しない場合は `ESBUILD_BINARY_PATH` 環境変数に正しいバイナリパスを指定する。

```bash
# 回避策
pnpm install
# または
ESBUILD_BINARY_PATH=$(pnpm exec esbuild --version 2>/dev/null | xargs -I{} which esbuild) pnpm vitest run
```

#### e. `outputs/phase-1〜5/` ディレクトリが空

- **問題**: このタスクの worktree では `outputs/phase-1/` から `outputs/phase-5/` のディレクトリが作成されているが、中身のファイルが未作成のまま残っている場合がある。Phase 12 close-out 時にバリデーターが空ディレクトリをエラーとして検出する。
- **対策**: Phase 12 close-out 前に各 Phase の記録ファイル（`scope-definition.md` / `design.md` など）を最低限 `N/A` または実績値で補完する。`outputs/artifacts.json` の phase ステータスも合わせて更新する。

### 補足事項

- `ApiKeySettingsPanel.tsx` を削除する前に、`rg -n "ApiKeySettingsPanel"` で参照箇所がゼロになっていることを必ず確認すること。
- 削除後に型チェック (`pnpm --filter @repo/desktop typecheck`) を実行し、型エラーがないことを確認すること。
