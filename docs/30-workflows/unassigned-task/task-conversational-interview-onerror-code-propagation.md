# ConversationalInterview onError エラーコード伝搬 - タスク指示書

## メタ情報

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | TASK-IPC-ER-03                                   |
| タスク名     | ConversationalInterview onError エラーコード伝搬 |
| 分類         | 改善                                             |
| 対象機能     | ConversationalInterview / IPC エラーハンドリング |
| 優先度       | 低                                               |
| 見積もり規模 | 小規模                                           |
| ステータス   | 未実施                                           |
| 発見元       | Phase 6 (TASK-UI-02 ConversationPanel 孤立解消)  |
| 発見日       | 2026-04-06                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`ConversationalInterview` コンポーネントは、ユーザーの回答を IPC 経由でメインプロセスに送信する。
送信が失敗した場合（タイムアウト、ネットワーク切断、認証エラーなど）、`onError` コールバックを呼び出して
親コンポーネントにエラーを通知する設計になっている。

しかし現在の実装では、`onError` に渡す値は以下の 2 種類の固定文字列のみである:

- `"回答の構築に失敗しました"` — submission ビルドに失敗した場合（L214）
- `"回答の送信に失敗しました"` — `onSubmit` が reject した場合（L225）

IPC レイヤーから throw されたエラーオブジェクト（`Error` インスタンス）の `message`・`code`・`cause`
などは捨てられており、親コンポーネントがエラーの種類に応じた処理（リトライ戦略の変更、認証エラー時の
再ログイン誘導など）を行えない。

### 1.2 問題点・課題

1. **エラーコード非伝達**: `catch` ブロックで捕捉した `unknown` 型エラーのコード情報が `onError` に渡らない。
2. **固定文字列**: ユーザー向けメッセージも日本語固定で、エラー種別を区別できない。
3. **テスト gap**: `ConversationalInterview.ipc-edge.test.tsx` の `IPC-ER-03` は
   `it.todo()` で残されており、エラーコード伝搬が実装されるまでカバレッジに穴がある。

具体的な現状コード（`apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` L219-L226）:

```typescript
try {
  await onSubmit(submission);
  setRestoredPendingRequest(null);
  resetInputValues();
} catch {
  interview.rollbackLastUserMessage();
  onError?.("回答の送信に失敗しました"); // エラー情報を完全に捨てている
}
```

### 1.3 放置した場合の影響

- タイムアウト・ネットワーク断・認証エラーなどが区別できないため、親コンポーネントは
  適切なリトライ UI やエラーメッセージを提示できない。
- 将来 IPC エラーコードに基づいた挙動分岐（例: 認証失敗 → 再ログイン案内）を追加する際に
  インターフェース変更が必要となり、影響範囲が拡大する。
- `IPC-ER-03` テストが永久に `it.todo()` のまま残り、エラーハンドリングの品質担保ができない。

---

## 2. 何を達成するか（What）

### 2.1 目的

`ConversationalInterview` の `onError` コールバックシグネチャを拡張し、
IPC レイヤーから伝搬されたエラーオブジェクト（またはエラーコード）を
親コンポーネントに渡せるようにする。

### 2.2 最終ゴール

- `onError` のシグネチャが `(message: string, errorCode?: string) => void` または
  `(error: ConversationalInterviewError) => void` に変更されている。
- `catch` ブロックでエラーオブジェクトを解析し、適切なエラーコードを抽出して `onError` に渡す。
- `IPC-ER-03` テスト (`it.todo`) が通常の `it` に昇格し、パスする。

### 2.3 スコープ

#### 含むもの

- `ConversationalInterviewProps.onError` のシグネチャ変更
- `submitAnswer` の `catch` ブロックでのエラー解析ロジック追加
- `ConversationalInterview.ipc-edge.test.tsx` の `IPC-ER-03` テスト実装
- 既存 `IPC-TO-02` / `IPC-ER-01` テストの `onError` 呼び出し検証の更新（後方互換確認）

#### 含まないもの

- エラーコードの種類や体系の新規定義（既存 IPC エラーの `code` フィールドを流用する）
- 親コンポーネント（`SkillLifecyclePanel` 等）でのエラーコード別処理の実装
- エラーメッセージの i18n 対応
- IPC サーバー側（メインプロセス）のエラーコード体系変更

### 2.4 成果物

- 変更ファイル:
  - `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`
  - `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.ipc-edge.test.tsx`
- `onError` シグネチャを使用している親コンポーネントへの変更（型エラーがある場合のみ）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` の現状コードを把握していること。
- IPC エラーオブジェクトの構造（`Error` に `code` プロパティが付与されているか、
  または `message` 文字列からコードを判別するか）を事前調査していること。
- Vitest / React Testing Library の基本操作ができること。

### 3.2 依存タスク

なし（単独で着手可能）。

### 3.3 必要な知識

- TypeScript の型安全なエラーハンドリングパターン（`unknown` 型の narrowing）
- React コンポーネントの props インターフェース設計
- Vitest / `@testing-library/react` によるテスト実装
- IPC レイヤーのエラー伝達パターン（`safeInvoke` の戻り値や throw 形式）

### 3.4 推奨アプローチ

**ステップ A: IPC エラー形式の調査**

`SkillCreatorIpcBridge` などのブリッジ実装と `safeInvoke` の実装を確認し、
エラー時に `throw` されるオブジェクトに `code` プロパティが含まれるか確認する。

**ステップ B: シグネチャ設計**

シンプルな拡張案として以下を推奨する:

```typescript
// 案1: オプション引数でエラーコードを追加（後方互換性あり）
onError?: (message: string, errorCode?: string) => void;

// 案2: 構造化エラーオブジェクト（より拡張性が高い）
export type ConversationalInterviewError = {
  message: string;
  errorCode?: string;
  cause?: unknown;
};
onError?: (error: ConversationalInterviewError) => void;
```

案1は既存の `onError` 呼び出し箇所の変更が最小限に抑えられるため、優先度が低い本タスクでは推奨。

**ステップ C: catch ブロックの修正**

```typescript
} catch (err) {
  interview.rollbackLastUserMessage();
  const errorCode = err instanceof Error && "code" in err
    ? String((err as Error & { code: unknown }).code)
    : undefined;
  onError?.("回答の送信に失敗しました", errorCode);
}
```

**ステップ D: テスト実装**

`IPC-ER-03` を `it.todo` から通常 `it` に変更し、エラーオブジェクトに `code` プロパティを
持たせた `mockRejectedValue` でテストを実装する。

---

## 4. 実行手順

### Phase 構成

Phase 1: IPC エラー形式調査・シグネチャ設計
→ Phase 2: onError シグネチャ変更・catch ブロック修正
→ Phase 3: テスト実装・型チェック・品質確認

---

### Phase 1: IPC エラー形式調査・シグネチャ設計

#### 目的

実際の IPC エラーオブジェクトに `code` プロパティが存在するか確認し、
`onError` の新シグネチャを確定する。

#### 手順

1. 以下のファイルを読み、`onSubmit` に渡される IPC 呼び出しがエラー時にどのようなオブジェクトを
   throw するか確認する。
   - `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`
   - `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
2. `safeInvoke` の実装（`apps/desktop/src/preload/` 配下）を確認し、エラー時の
   オブジェクト形式（`Error` サブクラス、`code` フィールドの有無）を記録する。
3. 調査結果をもとに `onError` の新シグネチャを決定する（案1 or 案2、または別案）。

#### 成果物

- エラーオブジェクト形式のメモ（コードコメントに記録してもよい）
- 採用するシグネチャの決定

#### 完了条件

- IPC エラー時に `code` などの識別フィールドが取得可能か否かが明確になっている
- 新しい `onError` シグネチャが確定している

---

### Phase 2: onError シグネチャ変更・catch ブロック修正

#### 目的

`ConversationalInterview.tsx` の `onError` props とエラーハンドリングロジックを更新する。

#### 手順

1. `ConversationalInterviewProps.onError` のシグネチャを Phase 1 で決定した形式に変更する。
2. `submitAnswer` 関数内の `catch` ブロックを修正し、`err` オブジェクトから
   エラーコードを抽出して `onError` に渡す。
3. `onError?.("回答の構築に失敗しました")` （L214）も同様に修正する（構築失敗の場合は
   エラーコードが不要なため `undefined` を渡してよい）。
4. TypeScript 型チェックが通ることを確認する:
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```
5. 型エラーが発生した親コンポーネント側の `onError` ハンドラも修正する。

#### 成果物

- 修正済み `ConversationalInterview.tsx`
- 型エラーが解消された親コンポーネント（変更が必要な場合）

#### 完了条件

- `pnpm --filter @repo/desktop typecheck` がエラーなく完了する
- `onError` に固定文字列以外の情報（エラーコードまたは構造化オブジェクト）が渡せる

---

### Phase 3: テスト実装・品質確認

#### 目的

`IPC-ER-03` テストを実装し、エラーコード伝搬の動作を自動テストで担保する。

#### 手順

1. `ConversationalInterview.ipc-edge.test.tsx` の `IPC-ER-03` を `it.todo` から
   通常 `it` に変更し、以下の検証を実装する:
   - `code: "PERMISSION_DENIED"` を持つ `Error` を reject する `onSubmit` mock を用意する
   - `waitFor` で `mockOnError` が `"PERMISSION_DENIED"` を含む引数で呼ばれることを検証する
2. 既存テスト（`IPC-TO-02`・`IPC-ER-01`）の `mockOnError` 検証を新シグネチャに合わせて更新する。
3. テストを実行し全件 PASS することを確認する:
   ```bash
   pnpm --filter @repo/desktop test -- --run ConversationalInterview.ipc-edge
   ```
4. ESLint チェックを実行する:
   ```bash
   pnpm --filter @repo/desktop lint
   ```

#### 成果物

- 実装済み `IPC-ER-03` テスト（`it.todo` → 通常 `it`）
- 全テスト PASS の確認

#### 完了条件

- `ConversationalInterview.ipc-edge.test.tsx` の全テスト（IPC-TO-01〜03、IPC-ER-01〜03）が PASS
- `it.todo` が 1 件もない
- `pnpm --filter @repo/desktop lint` がエラーなく完了

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `onError` コールバックでエラーコード（またはエラーオブジェクト）が受け取れる
- [ ] `catch` ブロックで `err` オブジェクトを解析してエラーコードを抽出している
- [ ] 固定文字列のみを渡す実装が解消されている

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなく完了する
- [ ] `pnpm --filter @repo/desktop lint` がエラーなく完了する
- [ ] `IPC-ER-03` テストが `it.todo` でなく通常 `it` として PASS している
- [ ] `IPC-TO-02`・`IPC-ER-01` の既存テストが引き続き PASS している

### ドキュメント要件

- [ ] `task-workflow.md` の TASK-IPC-ER-03 ステータスを「完了」に更新する
- [ ] 本タスク仕様書のステータスを「完了」に変更する

---

## 6. 検証方法

### テストケース

| テスト ID | シナリオ                                        | 期待結果                                                |
| --------- | ----------------------------------------------- | ------------------------------------------------------- |
| IPC-ER-03 | `code: "PERMISSION_DENIED"` エラーで reject     | `onError` が `"PERMISSION_DENIED"` を含む引数で呼ばれる |
| IPC-ER-03 | `code: "TIMEOUT"` エラーで reject               | `onError` が `"TIMEOUT"` を含む引数で呼ばれる           |
| IPC-ER-01 | 任意のエラーで reject                           | `onError` が 1 回呼ばれ、送信ボタンが再活性化される     |
| IPC-TO-02 | timeout エラーで reject（既存テストの後方互換） | `onError` が呼ばれる（引数構造の変更に対応）            |

### 検証手順

1. 下記コマンドでテストを実行し、全件 PASS を確認する:
   ```bash
   pnpm --filter @repo/desktop test -- --run ConversationalInterview.ipc-edge
   ```
2. 型チェックを実行し、エラーが 0 件であることを確認する:
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```
3. lint を実行し、エラーが 0 件であることを確認する:
   ```bash
   pnpm --filter @repo/desktop lint
   ```

---

## 7. リスクと対策

| リスク                                                                       | 影響度 | 発生確率 | 対策                                                                                                 |
| ---------------------------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------------------------------- |
| `onError` シグネチャ変更により既存の親コンポーネントで型エラーが多発する     | 中     | 中       | 案1（オプション引数追加）を採用し後方互換を維持する。型エラーが多い場合は段階的に対応する。          |
| IPC エラーオブジェクトに `code` フィールドが存在しない場合がある             | 低     | 中       | Phase 1 で事前調査し、`code` がない場合は `err.message` を fallback として使用する設計にする。       |
| エラーコードが文字列で統一されておらず、型定義が困難                         | 低     | 低       | `string` 型で受け取り、将来的なリテラル型絞り込みは別タスクとする。                                  |
| `catch` ブロックで `unknown` 型の `err` を `Error` に narrowing する際の漏れ | 低     | 低       | `err instanceof Error` チェックを必ず通し、それ以外は `undefined` を返すガード節を明示的に記述する。 |

---

## 8. 参照情報

### 関連ドキュメント

- 対象コンポーネント:
  `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`
- 対象テストファイル:
  `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.ipc-edge.test.tsx`
- IPC ブリッジ実装:
  `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`
- IPC ハンドラ:
  `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`

### 参考資料

- TypeScript `unknown` 型のエラーハンドリングパターン:
  https://www.typescriptlang.org/docs/handbook/2/narrowing.html

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
IPC-ER-03: 現在の実装では onError に詳細エラーコードは伝達されない (TODO: 要改善)

it.todo(
  "IPC-ER-03: passes error code to onError for permission errors
   (not yet implemented — always passes generic string)",
);

// ConversationalInterview.tsx L223-L226:
} catch {
  interview.rollbackLastUserMessage();
  onError?.("回答の送信に失敗しました");  // エラー情報を完全に捨てている
}
```

### 補足事項

**TASK-UI-02 での苦戦箇所（将来の実装者への参考情報）**

Phase 6 (TASK-UI-02) で `ConversationalInterview.ipc-edge.test.tsx` を実装した際、
以下の点で実装が困難だったため `IPC-ER-03` は `it.todo` として残すことになった:

1. **IPC エラー種別の判別ロジックが複雑**:
   タイムアウト・ネットワークエラー・認証エラーなど複数のエラー種別が存在するが、
   現状の `catch {}` ブロックではエラーオブジェクトが参照されないため、
   どのエラー種別が発生したかを `onError` コールバックで判別できない。

2. **onError シグネチャが `string` 固定**:
   現状の `onError?: (message: string) => void` シグネチャでは、
   エラーコードを別引数で渡すか、構造化オブジェクトを渡すかを決める必要があるが、
   それ自体がインターフェース設計の議論を伴うため、Phase 6 のスコープ外とした。

3. **IPC レイヤーのエラー形式が未調査**:
   `SkillCreatorIpcBridge` が `throw` するエラーオブジェクトに `code` フィールドが
   含まれるかどうか不明なため、テストの期待値を確定できなかった。
   本タスクの Phase 1 でこの調査を行うことが前提となる。

本タスクは小規模だが、IPC エラーハンドリング改善の起点となる。
実装後は `SkillLifecyclePanel` などの親コンポーネントが `errorCode` に応じた
ユーザー向けメッセージ切り替えを実装できるようになる。
