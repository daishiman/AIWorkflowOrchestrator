# UT-P0-04-MICROTASK-FLUSH-STABILIZATION-001: microtask flush ヘルパー共通化による非同期テスト安定化

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-P0-04-MICROTASK-FLUSH-STABILIZATION-001                   |
| タスク名     | microtask flush ヘルパー共通化による非同期テスト安定化       |
| 分類         | 改善/テスト品質                                              |
| 対象機能     | RuntimeSkillCreatorFacade テストスイート                     |
| 優先度       | 低                                                           |
| 見積もり規模 | 小規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | TASK-P0-04 Phase 12（unassigned-task-detection.md / N/A-01） |
| 発見日       | 2026-03-30                                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-P0-04（ManifestLoader default activation）の実装で、`RuntimeSkillCreatorFacade.plan()` の async flow が増加した。
具体的には `sourceResolver.resolve()`, `resourcePlanner.plan()`, `readPlannedResources()` の3つの await が追加されたため、
テストで使用する `Promise.resolve()` フラッシュ回数を 5 回から 10 回に増加させる対処療法を行った。

```typescript
// plan.test.ts の現状（脆弱なパターン）
for (let i = 0; i < 10; i++) await Promise.resolve(); // await 追加のたびに回数調整が必要
```

### 1.2 問題点・課題

- `Promise.resolve()` の反復フラッシュは、実装の await 数に強く依存する
- 実装側で非同期処理が1つ増えるたびにテストのフラッシュ回数を手動で増やす必要がある
- フラッシュ回数が不足すると、テストが「なぜか」タイムアウトする難解なデバッグになる
- 逆にフラッシュ過多は非同期タイミングのずれによる誤検出を引き起こす可能性がある
- `plan.test.ts`, `improve.test.ts`, `default-activation.test.ts` の3ファイルで同様のパターンが散在

### 1.3 放置した場合の影響

- 将来 `plan()` / `improve()` の非同期フローに変更が加わると、テストが理由不明で失敗する
- フラッシュ回数の増減は diff に現れるが、「なぜ変更したか」が不明瞭になる
- テストの脆弱性が蓄積し、CI の信頼性が低下する

---

## 2. 何を達成するか（What）

### 2.1 目的

`Promise.resolve()` の手動フラッシュを廃止し、「特定の mock 関数が呼ばれるまでポーリングする」ヘルパーに置き換えることで、
実装の非同期フロー変更に対してテストが自動的に対応できるようにする。

### 2.2 最終ゴール

- `waitForCall(mockFn, options?)` のようなヘルパーを `__tests__/test-helpers.ts` に実装
- `plan.test.ts`・`improve.test.ts`・`default-activation.test.ts` がこのヘルパーを使用
- 手動フラッシュコード（`for (let i = 0; i < N; i++) await Promise.resolve()`）がテストから消える
- 実装側の await 追加・削除に対してテストの修正が不要になる

### 2.3 スコープ

#### 含むもの

- `RuntimeSkillCreatorFacade` のテストファイル群における手動フラッシュ置換
- `waitForCall` ヘルパーの実装（`__tests__/test-helpers.ts`）
- フラッシュパターン除去後の回帰テスト確認

#### 含まないもの

- 他ファイル・他テストスイートへのヘルパー適用（スコープ外、別タスクで検討）
- Facade 本体の実装変更

### 2.4 成果物

- `apps/desktop/src/main/services/runtime/__tests__/test-helpers.ts`（新規または既存への追記）
- 更新済みテストファイル3本（フラッシュループ削除済み）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `RuntimeSkillCreatorFacade` の型とインターフェースを理解していること
- Vitest の `vi.spyOn` / `vi.fn()` の基本動作を理解していること
- async/await とマイクロタスクキューの仕組みを理解していること

### 3.2 依存タスク

なし（独立タスク）

### 3.3 必要な知識

- **マイクロタスクキュー**: `Promise.resolve()` は `queueMicrotask()` に相当し、現在のコールスタックの後に1マイクロタスクだけ実行する。N 回繰り返すことで N 段階の await を "flush" できるが、実装の await 数と正確に一致させる必要がある。
- **ポーリングヘルパー**: `while (!mockFn.mock.calls.length) await Promise.resolve()` のパターンで、「mock が呼ばれるまで待つ」ことができる。無限ループ防止のためにタイムアウト（最大フラッシュ回数）を設ける。
- **`vi.waitFor()`**: Vitest 0.34 以降では `vi.waitFor(() => expect(mockFn).toHaveBeenCalled())` で同等のことができる可能性がある。バージョン確認後に採用を検討。

### 3.4 推奨アプローチ

まず Vitest のバージョンを確認し、`vi.waitFor()` が利用可能なら活用する。利用不可の場合は以下のカスタムヘルパーを実装する：

```typescript
// test-helpers.ts（参考実装）
export async function waitForCall(
  mockFn: ReturnType<typeof vi.fn>,
  maxFlushes = 20,
): Promise<void> {
  for (let i = 0; i < maxFlushes; i++) {
    if (mockFn.mock.calls.length > 0) return;
    await Promise.resolve();
  }
  throw new Error(
    `waitForCall: mock was not called after ${maxFlushes} flushes`,
  );
}
```

---

## 4. 実行手順

### Phase構成

1. Phase 1: 調査・設計
2. Phase 2: ヘルパー実装
3. Phase 3: テストファイル更新
4. Phase 4: 検証

### Phase 1: 調査・設計

#### 目的

現状のフラッシュパターンを全て特定し、ヘルパーの設計を確定する。

#### 手順

1. `grep -r "Promise.resolve()" apps/desktop/src/main/services/runtime/__tests__/` で全フラッシュ箇所を特定
2. 利用している Vitest バージョンを確認（`pnpm list vitest`）
3. `vi.waitFor()` の利用可否を確認
4. ヘルパーの API 設計を確定（引数・戻り値・タイムアウト仕様）

#### 成果物

フラッシュ箇所一覧、ヘルパー API 設計メモ

#### 完了条件

全フラッシュ箇所が特定され、ヘルパーの仕様が確定していること

---

### Phase 2: ヘルパー実装

#### 目的

`waitForCall` ヘルパーを `test-helpers.ts` に実装する。

#### 手順

1. `apps/desktop/src/main/services/runtime/__tests__/test-helpers.ts` を作成または更新
2. `waitForCall(mockFn, maxFlushes?)` を実装
3. エラーメッセージに mock 関数名が表示されるよう工夫
4. ヘルパー自体の単体テストを追加（任意）

#### 成果物

`test-helpers.ts`（`waitForCall` エクスポート済み）

#### 完了条件

`waitForCall` が正常動作し、呼ばれていない場合は明確なエラーを投げること

---

### Phase 3: テストファイル更新

#### 目的

手動フラッシュループを `waitForCall` に置換する。

#### 手順

1. `plan.test.ts` のフラッシュループを `waitForCall` で置換
2. `improve.test.ts` のフラッシュループを `waitForCall` で置換
3. `default-activation.test.ts` のフラッシュループを `waitForCall` で置換
4. `pnpm --filter @repo/desktop test` でテスト全通過を確認

#### 成果物

更新済みテストファイル3本

#### 完了条件

手動フラッシュループが全て消え、テストが全 PASS すること

---

### Phase 4: 検証

#### 目的

回帰がないことを確認する。

#### 手順

1. `pnpm --filter @repo/desktop test` で全テスト実行
2. RuntimeSkillCreatorFacade 関連テストがすべて PASS することを確認
3. CI と同等のコマンドで検証

#### 成果物

テスト実行結果

#### 完了条件

全テスト PASS、フラッシュループが残っていないこと

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `waitForCall` ヘルパーが実装されている
- [ ] `plan.test.ts` の手動フラッシュループが消えている
- [ ] `improve.test.ts` の手動フラッシュループが消えている
- [ ] `default-activation.test.ts` の手動フラッシュループが消えている

### 品質要件

- [ ] 全テストが PASS している
- [ ] `waitForCall` が呼ばれない場合に明確なエラーメッセージを投げる
- [ ] フラッシュ上限（maxFlushes）が適切に設定されている

### ドキュメント要件

- [ ] `test-helpers.ts` に JSDoc コメントがある（任意）

---

## 6. 検証方法

### テストケース

- `waitForCall` が mock 呼出前に正常に待機すること
- `waitForCall` が上限回数を超えた場合に例外を投げること
- 既存テストの全テストケースが PASS すること

### 検証手順

```bash
pnpm --filter @repo/desktop test -- --reporter verbose RuntimeSkillCreatorFacade
```

---

## 7. リスクと対策

| リスク                                                      | 影響度 | 発生確率 | 対策                                                              |
| ----------------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------- |
| Vitest の `vi.waitFor()` が利用可能で、ヘルパーが不要になる | 低     | 中       | Phase 1 で確認後、`vi.waitFor()` を優先採用                       |
| `waitForCall` の上限回数が低すぎて、時折テストが失敗する    | 中     | 低       | デフォルト 20 フラッシュ（実際の await 数の 2 倍以上）に設定      |
| mock 対象の関数名が特定しにくく、ヘルパーの移行が難しい     | 低     | 低       | `sendChat`, `resourceLoader.loadAgent` など呼出終端の mock を選ぶ |

---

## 8. 参照情報

### 関連ドキュメント

- `outputs/phase-12/unassigned-task-detection.md`（N/A-01 として記録）
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.default-activation.test.ts`

### 参考資料

- Vitest docs: `vi.waitFor()` — https://vitest.dev/api/vi#vi-waitfor

---

## 9. 備考

### 苦戦箇所（TASK-P0-04 での経験）

**問題**: TASK-P0-04 で `plan()` に3つの await を追加した際、既存の `plan.test.ts` が全てパス しなくなった。
原因は `Promise.resolve()` フラッシュが 5 回では不足していたことで、10 回に増やすことで解決したが、
「なぜ 10 回か」という根拠が曖昧で将来また同じ問題が起きる可能性がある。

**学び**: フラッシュ回数の手動調整は技術的負債。「mock が呼ばれるまでポーリング」という意味論的なパターンが正解。

### 補足事項

このタスクは PR マージをブロックしないため LOW 優先度だが、RuntimeSkillCreatorFacade の async pipeline に変更が加わる次回タスクの前に実施することを推奨する。
