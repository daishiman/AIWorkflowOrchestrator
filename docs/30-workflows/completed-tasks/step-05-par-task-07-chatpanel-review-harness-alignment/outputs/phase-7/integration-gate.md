# Phase 7: インテグレーションゲート

## メタ情報

| 項目               | 値                                              |
| ------------------ | ----------------------------------------------- |
| タスクID           | TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 |
| 作成日             | 2026-03-23                                      |
| Phase              | 7 — カバレッジ確認                              |
| 対象コンポーネント | ChatPanel.tsx                                   |

---

## 1. Smoke テスト一覧

Phase 7 完了前に再実行すべき smoke テスト。カバレッジ計測とは別に実行する。

### ST-01: ChatPanel 基本レンダー smoke

| 項目         | 内容                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| ST-ID        | ST-01                                                                          |
| 目的         | ChatPanel が idle 状態でクラッシュなくレンダーされること                       |
| 実行コマンド | `cd apps/desktop && pnpm vitest run src/renderer/components/chat/ -t "render"` |
| 合格条件     | 全テストが PASS、コンソールに React エラーなし                                 |

### ST-02: Store 接続 smoke

| 項目         | 内容                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| ST-ID        | ST-02                                                                         |
| 目的         | ChatPanel が Store action を正しく取得できること                              |
| 実行コマンド | `cd apps/desktop && pnpm vitest run src/renderer/components/chat/ -t "Store"` |
| 合格条件     | TC-01〜TC-03 が PASS                                                          |

### ST-03: IPC 接続 smoke

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| ST-ID        | ST-03                                                                       |
| 目的         | ChatPanel が IPC call を正しく実行できること                                |
| 実行コマンド | `cd apps/desktop && pnpm vitest run src/renderer/components/chat/ -t "IPC"` |
| 合格条件     | TC-04、TC-07 が PASS（MINOR-A 確認後）                                      |

### ST-04: no-op 不在 smoke

| 項目         | 内容                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| ST-ID        | ST-04                                                                        |
| 目的         | ChatPanel.tsx に no-op コールバックが存在しないこと                          |
| 実行コマンド | `grep -n "() => {}" apps/desktop/src/renderer/components/chat/ChatPanel.tsx` |
| 合格条件     | 出力が空（0 件）                                                             |

### ST-05: TypeScript 型チェック smoke

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| ST-ID        | ST-05                                                  |
| 目的         | ChatPanel.tsx の変更が型エラーを引き起こしていないこと |
| 実行コマンド | `cd apps/desktop && pnpm typecheck`                    |
| 合格条件     | エラーなし（0 errors）                                 |

---

## 2. Integration テストの合格条件

### 全テスト PASS の確認

```bash
# Phase 4-6 の全テストを一括実行
cd apps/desktop && pnpm vitest run src/renderer/components/chat/

# 期待される出力
# Test Files  X passed (X)
# Tests       XX passed (XX)
# Duration    X.Xs
```

| 確認項目     | 合格条件                                    |
| ------------ | ------------------------------------------- |
| TC-01〜TC-09 | 全 PASS                                     |
| TC-10〜TC-16 | 全 PASS                                     |
| EC-01〜EC-06 | 全 PASS                                     |
| ST-01〜ST-05 | 全 PASS                                     |
| カバレッジ   | Line >= 80%、Branch >= 60%、Function >= 80% |

### テスト失敗時の対応フロー

```
テスト失敗
  ├─ TC-01〜TC-04（GAP 関連）が失敗
  │   └─ Phase 5 実装に戻り、該当 GAP の置換を確認
  ├─ TC-12 / EC-04（no-op 検出）が失敗
  │   └─ Phase 5 実装に戻り、no-op を完全に除去
  ├─ TC-15（レンダー回数）がタイムアウト
  │   └─ P31 無限ループが再発。useAppStore() の直接使用箇所を検索して個別セレクタに変更
  ├─ TC-16（IPC 重複登録）が失敗
  │   └─ P5 二重登録が発生。useEffect のクリーンアップ処理を追加
  └─ EC-06（全 state smoke）が失敗
      └─ 特定 state でクラッシュ。該当 state の UI 分岐をデバッグ
```

---

## 3. Phase 9 への残存リスク（residual risk）

Phase 7 を PASS したとしても、以下の残存リスクが Phase 9（品質検証）に持ち越される可能性がある。

### RR-01: MINOR-A 未確認（openTerminal IPC）

| リスクID | RR-01                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| 内容     | `openTerminal` IPC チャンネルの存在確認（MINOR-A）が未完了の場合、GAP-04 が実装保留のまま Phase 9 に到達する |
| 影響     | TC-04 / TC-07 / EC-02 が実装保留となり、手動テスト（Phase 11）でのみ確認される                               |
| 対応     | Phase 9 の lint/typecheck には影響なし。Phase 11 の手動テストで GAP-04 の動作を確認する                      |
| 軽減策   | `grep -rn "openTerminal" apps/desktop/src/` を Phase 8 開始前に実行して判定を確定させる                      |

### RR-02: P41 カバレッジプロバイダ差異

| リスクID | RR-02                                                                                           |
| -------- | ----------------------------------------------------------------------------------------------- |
| 内容     | v8 カバレッジプロバイダと istanbul プロバイダでインライン arrow function のカウント方法が異なる |
| 影響     | CI と ローカルでカバレッジ数値が乖離する場合がある                                              |
| 対応     | `vitest.config.ts` の `coverage.provider` 設定を確認し、CI と同一のプロバイダを使用する         |
| 軽減策   | `coverage.provider: "v8"` を明示的に指定して計測する                                            |

### RR-03: Preload 型定義との乖離（P23 パターン）

| リスクID | RR-03                                                                                                                              |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 内容     | `window.electronAPI.openTerminal` の型定義が Preload の `types.ts` に存在しない場合、typecheck は通るが実行時に `undefined` になる |
| 影響     | Phase 9 の typecheck では検出されず、Phase 11 の手動テストで初めて顕在化する                                                       |
| 対応     | Phase 5 実装前に `grep -rn "openTerminal" apps/desktop/src/preload/types.ts` で型定義の存在を確認する（P32 対策）                  |
| 軽減策   | TypeScript の `strict: true` 設定下では `window.electronAPI` のプロパティ未定義はコンパイルエラーになる                            |

### RR-04: P48 non-null assertion の残存

| リスクID | RR-04                                                                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------------- |
| 内容     | IPC レスポンスを受け取る箇所（GAP-04 の `openTerminal` 戻り値等）で non-null assertion が使われる可能性                    |
| 影響     | TypeCheck は PASS するが、IPC エラー時に実行時クラッシュが発生する                                                         |
| 対応     | Phase 8（リファクタリング）で `grep -n '!' apps/desktop/src/renderer/components/chat/ChatPanel.tsx` を実行してスキャンする |

---

## 4. Phase 9 への引き継ぎ事項

Phase 7 PASS 後、Phase 9（品質検証）で以下を追加確認する:

```bash
# Phase 9 品質検証コマンド一覧

# 1. Lint
cd apps/desktop && pnpm lint

# 2. TypeCheck
cd apps/desktop && pnpm typecheck

# 3. 全テスト実行（ChatPanel だけでなくプロジェクト全体）
cd apps/desktop && pnpm vitest run

# 4. no-op 残存確認（プロジェクト全体）
grep -rn "() => {}" apps/desktop/src/renderer/components/chat/ChatPanel.tsx

# 5. JSDoc 追加確認
grep -n "@role review-harness" apps/desktop/src/renderer/components/chat/ChatPanel.tsx
```

---

## 5. Integration ゲート判定サマリ

| ゲート            | 条件                 | 判定        |
| ----------------- | -------------------- | ----------- |
| Smoke テスト      | ST-01〜ST-05 全 PASS | PASS / FAIL |
| Unit テスト       | TC-01〜TC-16 全 PASS | PASS / FAIL |
| Edge Case テスト  | EC-01〜EC-06 全 PASS | PASS / FAIL |
| Line Coverage     | >= 80%               | PASS / FAIL |
| Branch Coverage   | >= 60%               | PASS / FAIL |
| Function Coverage | >= 80%               | PASS / FAIL |

**全ゲートが PASS の場合のみ Phase 8（リファクタリング）へ進む。**
いずれかが FAIL の場合は、該当 Phase（5/6）に戻りテストを修正する。
