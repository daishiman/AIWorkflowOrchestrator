# UT-TASK06-007-EXT-002: エイリアス / 再export / 動的定数のチャンネル解決強化 - タスク指示書

## メタ情報

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | UT-TASK06-007-EXT-002                                             |
| タスク名     | エイリアス / 再export / 動的定数のチャンネル解決強化              |
| 分類         | 機能拡張                                                          |
| 対象機能     | `check-ipc-contracts.ts` / `resolveChannelMap` / `resolveChannel` |
| 優先度       | 低                                                                |
| 見積もり規模 | 小規模                                                            |
| ステータス   | 未実施                                                            |
| 発見元       | 2026-03-19 再監査                                                 |
| 発見日       | 2026-03-19                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

2026-03-19 の再監査で、`check-ipc-contracts.ts` は以下まで対応済みであることを確認した。

- `safeInvoke<T>` / `safeOn<T>` の generic 呼び出し
- 複数行の preload 呼び出し
- `IPC_CHANNELS` 以外の const object 収集
- `IPC_CHANNELS.FOO` のような参照に加え、`CHANNELS.FOO` や `CHAT_EDIT_CHANNELS.BAR` などの full ref 解決

その一方で、別名代入、再export 経由、computed key、template literal 連結など、静的な object literal を超える解決経路は未対応のままである。

### 1.2 問題点・課題

- `const X = IPC_CHANNELS; ipcMain.handle(X.FOO, ...)` のような alias chain を解決できない
- `export { IPC_CHANNELS as MAIN_CHANNELS }` のような再export 名を追跡できない
- `CHANNELS[prefix + suffix]` や `` `${prefix}:foo` `` のような動的組み立てを仕様上どう扱うか未定義
- どこまでを「静的解決対象」とするかが文書化されておらず、P45 の期待が過大になりやすい

### 1.3 放置した場合の影響

- 実装者が residual noise の理由をコード読解で都度判断する必要がある
- 実装能力と仕様文言がずれ、今後のタスク分解やレビューで誤解を生む
- 追加のチャンネル定義方式が導入された際に、偽陽性か仕様外かを判定しにくい

---

## 2. 何を達成するか（What）

### 2.1 目的

`resolveChannelMap` / `resolveChannel` が扱う「静的解決可能な範囲」を明確化し、alias / 再export / 動的定数について、

1. 実装で解決する範囲
2. 仕様で非対応と明示する範囲

を切り分ける。

### 2.2 最終ゴール

以下のいずれかを完了すること。

- alias / 再export の一部を静的解決できるように実装する
- もしくは「object literal / full ref までを保証し、それ以外は仕様外」と docs と tests に明文化する

### 2.3 スコープ

#### 含むもの

- `const Alias = IPC_CHANNELS` のような単純 alias 解決の可否判断
- `export { IPC_CHANNELS as MAIN_CHANNELS }` など再export 経路の追跡要否判断
- dynamic key / template literal / computed property を仕様外として扱うかの明文化
- fixture / test / spec の更新

#### 含まないもの

- タプル配列パターン抽出（UT-TASK06-007-EXT-001）
- `ipcMain.on` / `safeOn` のイベント整合検出（UT-TASK06-007-EXT-003）
- スクリプト分割（UT-TASK06-007-EXT-004）
- R-02 の語義精密化（UT-TASK06-007-EXT-005）

### 2.4 成果物

- `check-ipc-contracts.ts` の residual resolution 改善、または仕様境界の固定
- alias / re-export / dynamic constant 用の fixture テスト
- `ipc-contract-checklist.md` などへの仕様追記

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-TASK06-007 の再監査反映が完了していること
- 現在の基準値が固定されていること
  - handlers: 216
  - preloads: 189
  - drifts: 197
  - orphans: 119
- `pnpm --filter @repo/desktop typecheck` と対象テストが PASS していること

### 3.2 依存タスク

- UT-TASK06-007（完了済み）
- UT-TASK06-007-EXT-001 / EXT-003 / EXT-005 と論理的に関連するが、直接依存ではない

### 3.3 必要な知識

- TypeScript の import / export / alias パターン
- 正規表現ベース解析の限界と AST 導入コスト
- Vitest による fixture ベース単体テスト

### 3.4 推奨アプローチ

**オプション A: 単純 alias / 再export のみ静的解決する**

- `const Alias = IPC_CHANNELS`
- `export { IPC_CHANNELS as MAIN_CHANNELS }`
- `import { IPC_CHANNELS as MAIN_CHANNELS } from ...`

この範囲だけを追跡し、computed key や dynamic string は非対応に据え置く。

**オプション B: 実装は増やさず仕様境界を固定する**

- object literal / full ref / direct ref のみ保証
- alias / 再export / dynamic constant は仕様外として docs と tests に明記

現状の優先度では、まずオプション B で期待値を締め、その後必要ならオプション A を追加するのが妥当。

---

## 4. 実行手順

### Phase 構成

Phase 1: 残余ケース調査 → Phase 2: 方針決定 → Phase 3: 実装または仕様固定 → Phase 4: テスト・品質検証

### Phase 1: 残余ケース調査

#### 目的

現在の未解決パターンを alias / 再export / dynamic constant に分類する。

#### 手順

1. `rg -n "as [A-Z_]+|export \\{|\\[[^\\]]+\\]" apps/desktop/src apps/desktop/preload packages/shared/src/types --glob '*.ts'` で候補を抽出する
2. `check-ipc-contracts.ts` の `resolveChannelMap` / `resolveChannel` を読み、何が静的に解けるか整理する
3. residual drift から「本当に仕様外か」「対応すべきか」をケース分解する

#### 成果物

residual channel resolution ケース一覧

#### 完了条件

- 代表ケースが alias / 再export / dynamic constant に分類されている

### Phase 2: 方針決定

#### 目的

「実装で拾う範囲」と「仕様で切る範囲」を決める。

#### 手順

1. 単純 alias / 再export を regex 拡張で扱えるか評価する
2. AST 導入が必要か、コストに見合うか判断する
3. docs 上の保証範囲を 1 文で定義する

#### 成果物

対応方針メモ

#### 完了条件

- 実装対象と仕様外対象が重複なく定義されている

### Phase 3: 実装または仕様固定

#### 目的

選んだ方針に従い、実装または仕様を更新する。

#### 手順

1. 実装する場合は、alias / 再export の最小パターンだけを追加する
2. 実装しない場合は、`ipc-contract-checklist.md` / architecture reference / workflow docs に非対応境界を記載する
3. false claim が発生しないよう、P45 を「将来拡張」に戻す

#### 成果物

コード差分または仕様差分

#### 完了条件

- 実装能力とドキュメントの主張が一致している

### Phase 4: テスト・品質検証

#### 目的

残余スコープの境界がテストとドキュメントで再現可能になっていることを確認する。

#### 手順

1. alias / re-export / dynamic constant fixture を追加または整理する
2. `pnpm --filter @repo/desktop exec vitest run scripts/__tests__/check-ipc-contracts.test.ts`
3. `pnpm --filter @repo/desktop typecheck`
4. 必要に応じて `pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only --format json` で summary を再確認する

#### 成果物

テストログ、summary、仕様更新ログ

#### 完了条件

- テストが PASS
- 文書上の保証範囲と実装が矛盾しない

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] alias / 再export / dynamic constant の残余ケースが分類されている
- [ ] 実装で対応する範囲と非対応範囲が明文化されている
- [ ] false claim なしで P45 の位置づけが説明できる

### 品質要件

- [ ] 対象テストが追加または更新されている
- [ ] `typecheck` と対象テストが PASS している
- [ ] residual summary を再実行して基準値との差異が説明できる

### ドキュメント要件

- [ ] `ipc-contract-checklist.md` に将来拡張として反映されている
- [ ] architecture reference / backlog / completed workflow の記述が一致している

---

## 6. 検証方法

### テストケース

1. `const Alias = IPC_CHANNELS; ipcMain.handle(Alias.FOO, handler)` を fixture 化し、対応方針通りの結果になること
2. `export { IPC_CHANNELS as MAIN_CHANNELS }` を経由した参照が、対応方針通りの結果になること
3. `CHANNELS[prefix + suffix]` や `` `${prefix}:foo` `` が仕様外として扱われる場合、その理由が docs に記載されていること

### 検証手順

```bash
# 1. 対象テスト
pnpm --filter @repo/desktop exec vitest run scripts/__tests__/check-ipc-contracts.test.ts

# 2. 型チェック
pnpm --filter @repo/desktop typecheck

# 3. サマリー確認
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only --format json
```

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                                                    |
| -------------------------------------- | ------ | -------- | ----------------------------------------------------------------------- |
| regex 拡張で誤検知が増える             | 中     | 中       | alias / re-export の単純ケースに限定し、dynamic case は仕様外に据え置く |
| AST 導入でスクリプトが過剰に肥大化する | 中     | 低       | 小規模タスクでは AST を避け、必要なら EXT-004 と合わせて設計する        |
| P45 を「対応済み」と誤解する           | 高     | 中       | docs に「部分対応」「残余は将来拡張」と明記する                         |

---

## 8. 参照情報

### 関連ドキュメント

- [`ipc-contract-checklist.md` 将来拡張セクション](../../../.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md)
- [`architecture-implementation-patterns-reference-ipc-drift-detection.md`](../../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-drift-detection.md)
- [`task-workflow-backlog.md`](../../../.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md)
- 関連既知の落とし穴: [P44](../../../.claude/rules/06-known-pitfalls.md#p44), [P45](../../../.claude/rules/06-known-pitfalls.md#p45)

### 参考資料

- 親タスク: `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/`
- 関連未タスク:
  - `docs/30-workflows/unassigned-task/ut-task06-007-ext-001-tuple-array-handler-extraction.md`
  - `docs/30-workflows/unassigned-task/ut-task06-007-ext-003-ipc-on-pattern-enhancement.md`
  - `docs/30-workflows/unassigned-task/ut-task06-007-ext-005-r02-semantic-precision.md`

---

## 9. 備考

### レビュー指摘の要約

2026-03-19 の再監査により、旧 EXT-002 が対象としていた「複数 const object 解決」は既に実装済みであることを確認した。以後の EXT-002 は residual scope である alias / 再export / dynamic constant に限定する。

### 補足事項

- `CHANNELS` / `CHAT_EDIT_CHANNELS` / `IPC_CHANNELS` の複数 const object 解決は親タスクの再監査で対応済み
- この未タスクは「未実装の残余境界」を扱うものであり、旧仕様の焼き直しではない
