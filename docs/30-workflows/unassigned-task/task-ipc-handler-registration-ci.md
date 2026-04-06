# IPC ハンドラ登録完全性 CI - タスク指示書

## メタ情報

```yaml
issue_number: 1963
```

## メタ情報

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| タスクID     | UT-IPC-HANDLER-CI-001                                           |
| タスク名     | ipcMain.handle() の重複・欠損を CI で自動検出する               |
| 分類         | 改善                                                            |
| 対象機能     | IPC ハンドラ登録品質保証                                        |
| 優先度       | 中                                                              |
| 見積もり規模 | 小規模                                                          |
| ステータス   | 未実施                                                          |
| 発見元       | Phase 12（fix-creator-handler-duplicate-skill-name-validation） |
| 発見日       | 2026-04-06                                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`apps/desktop/src/main/ipc/creatorHandlers.ts` の `registerRuntimeSkillCreatorHandlers()` で
`SKILL_CREATOR_GET_ADAPTER_STATUS` チャンネルが2回 `ipcMain.handle()` で登録されていた。
Electron の `ipcMain.handle()` は同一チャンネルの2回目登録で例外をスローするため、
その後に登録されるはずだった14ハンドラが全て未登録になるという連鎖障害が発生した。

このバグはコードレビューで見落とされ、実際のスキル作成操作時まで検出されなかった。

### 1.2 問題点・課題

- **検出遅延**: 重複登録は実行時例外としか現れず、Unit Test の mock 環境では検出できない
- **影響範囲の大きさ**: 1件の重複が後続14ハンドラを全滅させる連鎖障害になりうる
- **手動レビュー限界**: ハンドラ数が増えるほど目視での重複チェックは困難になる
- **CI の不在**: 現状 ipcMain.handle() 登録件数に関するスナップショットテストが存在しない

### 1.3 放置した場合の影響

- 将来の機能追加でハンドラ重複登録バグが再発し、複数機能が同時に無効化される
- バグ発見が遅れるほどデバッグコストが増大する
- ユーザーがスキル操作全般を利用できない状態が再発する

---

## 2. 何を達成するか（What）

### 2.1 目的

`ipcMain.handle()` の登録チャンネル数をスナップショットテストで固定し、
重複登録・欠損登録を CI で自動検出できるようにする。

### 2.2 最終ゴール

- CI パイプラインで `registerRuntimeSkillCreatorHandlers()` 等の登録関数を実行し、
  登録チャンネル数が期待値と一致することを検証するテストが存在する
- 重複チャンネルが追加された場合、CI がエラーで失敗する
- 新規ハンドラが追加された場合、スナップショット更新を明示的に行う必要がある

### 2.3 スコープ

#### 含むもの

- `registerRuntimeSkillCreatorHandlers()` の登録チャンネル数スナップショットテスト
- CI（GitHub Actions）への自動実行設定
- テスト失敗時のエラーメッセージの整備

#### 含まないもの

- 他の register 関数（auth, settings 等）のスナップショット化（別タスク推奨）
- `ipcMain.handle()` 以外の IPC 登録方式（`ipcMain.on()` 等）の検証

### 2.4 成果物

- `apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts`（新規）
- CI ワークフロー更新（テストが自動実行される設定）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `fix-creator-handler-duplicate-skill-name-validation` の Bug Fix が main にマージ済み
- Vitest が `apps/desktop` で正常に実行できる環境

### 3.2 依存タスク

- なし（独立タスク）

### 3.3 必要な知識

- Vitest のスナップショットテスト（`toMatchInlineSnapshot` / `toMatchSnapshot`）
- `ipcMain.handle()` の mock 方法（`vi.fn()` + spy）
- `registerRuntimeSkillCreatorHandlers()` の呼び出し方

### 3.4 推奨アプローチ

`ipcMain.handle` を spy で置き換え、登録されたチャンネル名の配列をキャプチャして
`toMatchSnapshot()` で固定する。重複がある場合は同じチャンネル名が2回現れるため
即座に検出できる。

```typescript
// 概念コード
const handles: string[] = [];
vi.spyOn(ipcMain, "handle").mockImplementation((channel) => {
  handles.push(channel);
  return ipcMain;
});
registerRuntimeSkillCreatorHandlers(mockWindow);
expect(handles).toMatchSnapshot(); // 重複があれば重複として記録される
expect(new Set(handles).size).toBe(handles.length); // 重複検出
```

---

## 4. 実行手順

### Phase構成

Phase 1（調査）→ Phase 2（テスト実装）→ Phase 3（CI確認）

### Phase 1: 登録チャンネル一覧の確認

#### 目的

`registerRuntimeSkillCreatorHandlers()` で登録される全チャンネル名を確認する。

#### 手順

1. `creatorHandlers.ts` を読み込み、`ipcMain.handle()` の第一引数一覧を抽出
2. 期待チャンネル数を確定（Bug Fix 後は重複なし）
3. 既存テストファイルとの重複を確認

#### 成果物

登録チャンネル名リスト

#### 完了条件

登録チャンネル数と名前一覧が確定している

---

### Phase 2: スナップショットテスト実装

#### 目的

登録チャンネル数・内容の自動検証テストを作成する。

#### 手順

1. `apps/desktop/src/main/ipc/__tests__/creatorHandlers.registrationSnapshot.test.ts` を新規作成
2. `ipcMain.handle` を spy で置き換え
3. `registerRuntimeSkillCreatorHandlers()` を呼び出し
4. 登録チャンネル配列のスナップショットを取得
5. 重複チェック（`Set` サイズ比較）を追加
6. `pnpm --filter @repo/desktop test` で初回スナップショット生成

#### 成果物

テストファイルとスナップショットファイル

#### 完了条件

テストがグリーンで、スナップショットが生成されている

---

### Phase 3: CI 確認

#### 目的

GitHub Actions でスナップショットテストが自動実行されることを確認する。

#### 手順

1. 既存 CI ワークフロー（`.github/workflows/`）を確認
2. テストが自動実行されるか確認（通常は `pnpm test` に含まれる）
3. 必要であれば CI ワークフローに明示的な設定を追加

#### 成果物

CI でテストが自動実行される設定

#### 完了条件

PR 時に CI でスナップショットテストが実行される

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `registerRuntimeSkillCreatorHandlers()` の登録チャンネル一覧がスナップショットで固定されている
- [ ] 重複チャンネル検出（`Set` サイズ != 配列長）のアサーションが存在する
- [ ] スナップショットファイルが生成されている

### 品質要件

- [ ] `pnpm --filter @repo/desktop test` が全パス
- [ ] CI でテストが自動実行される

### ドキュメント要件

- [ ] テストファイルに「重複検出の目的」コメントが記述されている

---

## 6. 検証方法

### テストケース

| テストID     | 内容                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------ |
| REG-SNAP-01  | `registerRuntimeSkillCreatorHandlers()` 実行後のチャンネル一覧がスナップショットと一致する |
| REG-DEDUP-01 | 登録チャンネル数に重複が存在しない                                                         |

### 検証手順

```bash
# スナップショット生成（初回）
pnpm --filter @repo/desktop test -- --updateSnapshot

# 通常実行（重複があれば失敗する）
pnpm --filter @repo/desktop test
```

---

## 7. リスクと対策

| リスク                                     | 影響度 | 発生確率 | 対策                                                            |
| ------------------------------------------ | ------ | -------- | --------------------------------------------------------------- |
| `ipcMain` の mock が既存テストと競合する   | 中     | 低       | 独立したテストファイルに分離し、`beforeEach` でリセット         |
| チャンネル追加時のスナップショット更新忘れ | 低     | 中       | PR テンプレートに「スナップショット更新確認」チェック項目を追加 |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/main/ipc/creatorHandlers.ts` — 対象の register 関数
- `docs/00-requirements/08-api-design.md` — IPC ハンドラ一意性の運用注意
- `docs/30-workflows/fix-creator-handler-duplicate-skill-name-validation/` — 発見元タスク仕様書

---

## 9. 備考

### 苦戦箇所（発見元タスクより）

重複登録の根本原因特定において、表層的には「get-adapter-status エラー」だが、
実際には「14ハンドラ全体の登録失敗」が根因だった。
1件の重複が連鎖障害を引き起こすパターンは、Electron の `ipcMain.handle()` 特有の挙動であり、
Node.js EventEmitter の「重複登録は warning で通過」とは異なる。
CI による自動検出が将来の同種バグを防ぐ最も有効な手段。

### 補足事項

`ipcMain.on()` を使用するチャンネルも同様のリスクがあるが、
まず `ipcMain.handle()` に絞って適用し、効果を確認してから拡張すること。
