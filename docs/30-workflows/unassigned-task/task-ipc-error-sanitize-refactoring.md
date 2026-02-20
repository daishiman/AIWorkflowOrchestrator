# IPCエラーサニタイズ共通ユーティリティ化 - タスク指示書

## メタ情報

```yaml
issue_number: 830
```

## メタ情報

| 項目         | 内容                                    |
| ------------ | --------------------------------------- |
| タスクID     | UT-9A-B-002                             |
| タスク名     | IPCエラーサニタイズ共通ユーティリティ化 |
| 分類         | リファクタリング                        |
| 対象機能     | IPC エラーハンドリング                  |
| 優先度       | 中                                      |
| 見積もり規模 | 中規模                                  |
| ステータス   | 未実施                                  |
| 発見元       | Phase 12（TASK-9A-B実装経験）           |
| 発見日       | 2026-02-19                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

- TASK-9A-Bで `isKnownSkillFileError` 型ガードと `sanitizeErrorMessage` パターンを確立
- このパターンは既知エラーを安全に返し、未知エラーからの情報漏洩を防止する
- 現在このパターンは `skillFileHandlers.ts` にローカル実装されている
- 他のIPCハンドラー（skillCreatorHandlers.ts, aiHandlers.ts等）では類似パターンが個別実装されているか、実装されていない

### 1.2 問題点・課題

- エラーサニタイズロジックがハンドラーファイルごとに散在している
- 新規IPCハンドラー追加時にサニタイズパターンを再実装する必要がある
- ハンドラー間でエラーレスポンス形式が不統一になるリスク
- 未知エラーから内部情報（ファイルパス、スタックトレース、環境変数）が漏洩するリスク

### 1.3 放置した場合の影響

- セキュリティ: 新規ハンドラーでエラーサニタイズ漏れが発生し、内部情報が Renderer に漏洩
- 保守性: 各ハンドラーで異なるエラーハンドリングパターンが蓄積し、修正時の影響範囲が拡大
- 一貫性: エラーレスポンス形式のばらつきにより Renderer 側のエラー処理が複雑化

---

## 2. 何を達成するか（What）

### 2.1 目的

IPCエラーサニタイズパターンを共通ユーティリティモジュールとして抽出し、全IPCハンドラーから再利用可能にする

### 2.2 最終ゴール

- 共通エラーサニタイズモジュール `apps/desktop/src/main/ipc/utils/errorSanitizer.ts` の作成
- `createKnownErrorGuard()` ファクトリ関数による、ドメイン別型ガードの生成機能
- `sanitizeIpcError()` 関数による、統一されたエラーレスポンス生成
- 既存ハンドラーのリファクタリング（skillFileHandlers.ts を皮切りに）

### 2.3 スコープ

#### 含むもの

- 共通エラーサニタイズモジュールの新規作成
- `createKnownErrorGuard<T extends Error>(...errorClasses)` ファクトリ関数
- `sanitizeIpcError(error: unknown, knownErrorGuard)` ラッパー関数
- skillFileHandlers.ts のローカル実装を共通モジュールに移行
- 他のハンドラー（skillCreatorHandlers.ts等）への適用検討
- テスト作成

#### 含まないもの

- Renderer側のエラーハンドリング変更
- エラーロギング基盤の変更（electron-log連携は別タスク）
- エラーコード体系の導入（02-code-quality.mdのエラーカテゴリとの整合は将来タスク）

### 2.4 成果物

- `apps/desktop/src/main/ipc/utils/errorSanitizer.ts`（共通モジュール）
- `apps/desktop/src/main/ipc/utils/__tests__/errorSanitizer.test.ts`（テスト）
- 各ハンドラーの修正（共通モジュール使用に移行）
- Phase 1-12ワークフロー成果物

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9A-B（スキルファイルIPCハンドラー）が完了していること ✅
- skillFileHandlers.ts のエラーサニタイズパターンが安定動作していること ✅

### 3.2 依存タスク

- TASK-9A-B（完了済み）
- UT-9A-B-001（IPC入力バリデーション標準化）とは独立して実行可能

### 3.3 必要な知識

- TypeScript の型ガード関数（`error is T` パターン）
- TypeScript のジェネリクスとユニオン型
- Electron IPC のエラーハンドリングパターン
- セキュリティ観点でのエラー情報サニタイズ原則（04-electron-security.md）

### 3.4 推奨アプローチ

#### ステップ1: 現状調査

```bash
grep -rn "catch\|error\|sanitize" apps/desktop/src/main/ipc/*.ts
```

#### ステップ2: 共通モジュール設計

```typescript
// apps/desktop/src/main/ipc/utils/errorSanitizer.ts

export function createKnownErrorGuard<T extends Error>(
  ...errorClasses: Array<new (...args: any[]) => T>
): (error: unknown) => error is T {
  return (error: unknown): error is T =>
    errorClasses.some((cls) => error instanceof cls);
}

export function sanitizeIpcError(
  error: unknown,
  isKnownError: (error: unknown) => error is Error,
): { success: false; error: string } {
  if (isKnownError(error)) {
    return { success: false, error: error.message };
  }
  return { success: false, error: "Internal error" };
}
```

#### ステップ3: skillFileHandlers.ts リファクタリング

```typescript
import { createKnownErrorGuard, sanitizeIpcError } from './utils/errorSanitizer';

const isKnownSkillFileError = createKnownErrorGuard(
  SkillNotFoundError, ReadonlySkillError, PathTraversalError,
  FileExistsError, FileNotFoundError
);

// 各ハンドラー内
} catch (error) {
  return sanitizeIpcError(error, isKnownSkillFileError);
}
```

### 3.5 実装課題と解決策（TASK-9A-Bからの学び）

| 課題                                   | 原因                                                                    | 解決策                                                                    | 教訓                                                               |
| -------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| isKnownSkillFileError型ガードのDRY違反 | 6ハンドラーの各catchブロックに同じinstanceofチェックを個別記述          | 型ガード関数に集約し、catchブロックは1行のif文に簡素化                    | ドメイン固有エラー判定は型ガード関数に集約する                     |
| Union型の型推論確認                    | `error is A \| B \| C \| D \| E` で `.message` が正しく推論されるか不安 | TypeScript 5.xでは全てError基底クラスなので `.message` は安全に推論される | Union型の型ガードでも基底クラスのプロパティは安全にアクセス可能    |
| 未知エラーのサニタイズレベル           | ファイルパス・スタックトレース・環境変数含む可能性                      | 未知エラーは一律 "Internal error" に統一（情報漏洩防止を最優先）          | セキュリティとデバッグ性のトレードオフは「セキュリティ優先」で判断 |
| エラークラスの追加時の拡張性           | 新しいエラークラス追加時に型ガードの更新を忘れるリスク                  | ファクトリ関数でエラークラス配列を受け取る設計に変更                      | ファクトリパターンでOpen-Closed原則を実現                          |

### 3.6 システム仕様書参照テーブル

| 仕様書                                  | 参照セクション                        | 用途                          |
| --------------------------------------- | ------------------------------------- | ----------------------------- |
| security-electron-ipc.md                | エラーサニタイズ原則                  | エラー情報漏洩防止の原則確認  |
| architecture-implementation-patterns.md | isKnownSkillFileError型ガードパターン | 型ガードパターンの正本参照    |
| error-handling.md                       | エラーカテゴリ体系                    | エラーコード範囲との整合確認  |
| lessons-learned.md                      | TASK-9A-B苦戦箇所7                    | isKnownSkillFileError設計経緯 |

---

## 4. 実行手順

### Phase構成

| Phase | 名称                         | 目的                                        |
| ----- | ---------------------------- | ------------------------------------------- |
| 1     | 要件定義                     | 全IPCハンドラーのエラーハンドリング現状調査 |
| 2     | 設計                         | 共通エラーサニタイズモジュール設計          |
| 3     | 設計レビュー                 | レビューゲート                              |
| 4     | テスト作成                   | エラーサニタイズテストケース設計・作成      |
| 5     | 実装                         | 共通モジュール作成・skillFileHandlers移行   |
| 6-7   | テスト拡充・カバレッジ       | カバレッジ90%以上目標                       |
| 8-9   | リファクタリング・品質検証   | 他ハンドラーへの適用                        |
| 10-13 | レビュー・ドキュメント・完了 | 最終レビュー・PR                            |

### Phase 1: 要件定義

#### 目的

全IPCハンドラーのエラーハンドリング現状を調査し、共通化可能な箇所を特定

#### 手順

1. `grep -rn "catch" apps/desktop/src/main/ipc/*.ts` で全 catch ブロックを列挙
2. 各 catch ブロックのエラーハンドリングパターンを分類（既知エラー判定あり/なし、サニタイズあり/なし）
3. 共通化対象ハンドラーの優先順位付け

#### 成果物

- エラーハンドリング現状調査レポート

#### 完了条件

- [ ] 全IPCハンドラーの catch ブロックが調査済み
- [ ] 共通化対象が特定されている

### Phase 4-5: テスト作成・実装

#### 目的

共通エラーサニタイズモジュールの作成とskillFileHandlersからの移行

#### 手順

1. `createKnownErrorGuard` のテストを先に書く（Red）
2. `sanitizeIpcError` のテストを先に書く（Red）
3. 共通モジュール実装（Green）
4. skillFileHandlers.ts をリファクタリング（Refactor）
5. 全テスト実行で回帰なし確認

#### 成果物

- `apps/desktop/src/main/ipc/utils/errorSanitizer.ts`
- `apps/desktop/src/main/ipc/utils/__tests__/errorSanitizer.test.ts`
- skillFileHandlers.ts の修正

#### 完了条件

- [ ] 共通モジュールが作成されている
- [ ] skillFileHandlers.ts が共通モジュールを使用している
- [ ] 既存65テストが全PASS（回帰なし）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `createKnownErrorGuard` ファクトリ関数が動作する
- [ ] `sanitizeIpcError` が既知エラーのメッセージを返す
- [ ] `sanitizeIpcError` が未知エラーを "Internal error" に統一する
- [ ] skillFileHandlers.ts が共通モジュールを使用している

### 品質要件

- [ ] Line Coverage 90%以上（共通モジュール）
- [ ] Branch Coverage 70%以上
- [ ] Function Coverage 90%以上
- [ ] ESLintエラー0件
- [ ] TypeScript型チェックエラー0件
- [ ] 既存テスト全PASS（回帰なし）

### ドキュメント要件

- [ ] 実装ガイド（Part 1: 概念説明 + Part 2: 技術詳細）
- [ ] システム仕様書更新
- [ ] documentation-changelog.md

---

## 6. 検証方法

### テストケース

| #   | シナリオ                         | 入力                                      | 期待結果                                    |
| --- | -------------------------------- | ----------------------------------------- | ------------------------------------------- |
| 1   | 既知エラー（SkillNotFoundError） | new SkillNotFoundError("test")            | { success: false, error: "test" }           |
| 2   | 既知エラー（PathTraversalError） | new PathTraversalError("../")             | { success: false, error: "../" }            |
| 3   | 未知エラー（TypeError）          | new TypeError("unexpected")               | { success: false, error: "Internal error" } |
| 4   | 未知エラー（文字列）             | "string error"                            | { success: false, error: "Internal error" } |
| 5   | 未知エラー（null）               | null                                      | { success: false, error: "Internal error" } |
| 6   | ファクトリ: 空配列               | createKnownErrorGuard()                   | 常にfalseを返す型ガード                     |
| 7   | ファクトリ: 単一クラス           | createKnownErrorGuard(SkillNotFoundError) | SkillNotFoundErrorのみtrue                  |

### 検証手順

1. `pnpm --filter @repo/desktop exec vitest run src/main/ipc/utils/__tests__/errorSanitizer.test.ts`
2. `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillFileHandlers*.test.ts` で回帰テスト
3. `pnpm lint && pnpm typecheck`

---

## 7. リスクと対策

| リスク                            | 影響度 | 発生確率 | 対策                                                        |
| --------------------------------- | ------ | -------- | ----------------------------------------------------------- |
| skillFileHandlers既存テストの回帰 | 高     | 中       | リファクタリング前後でテスト差分を確認。1ハンドラーずつ移行 |
| ジェネリクス型推論の複雑化        | 低     | 中       | TypeScript Playgroundで型推論を事前検証                     |
| 他チームメンバーの学習コスト      | 低     | 低       | 実装ガイドPart 1で概念説明、Part 2でAPIリファレンスを提供   |

---

## 8. 参照情報

### 関連ドキュメント

- [security-electron-ipc.md](../../.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md) - エラーサニタイズ原則
- [architecture-implementation-patterns.md](../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md) - isKnownSkillFileError型ガードパターン
- [error-handling.md](../../.claude/skills/aiworkflow-requirements/references/error-handling.md) - エラーカテゴリ体系
- [lessons-learned.md](../../.claude/skills/aiworkflow-requirements/references/lessons-learned.md) - TASK-9A-B苦戦箇所

### 関連Pitfall

- P42: 文字列引数の.trim()バリデーション漏れ（関連: バリデーションとサニタイズの連携）
- P20: テスト環境でのログ出力汚染（エラーログのテスト考慮）

### 参考完了タスク

- TASK-9A-B（IPC ファイルハンドラー追加）- エラーサニタイズパターンの原型
- TASK-9B-H（SkillCreator IPC）- 別ドメインのIPCハンドラー実装例

---

## 9. 備考

### 補足事項

- `skillFileHandlers.ts` の `isKnownSkillFileError` は参考実装として使用すること
- ファクトリパターン (`createKnownErrorGuard`) はOpen-Closed原則に基づく設計
- 将来的にはエラーコード体系（02-code-quality.md のエラーカテゴリ）との統合も検討対象
- electron-logとの連携（未知エラーのログ記録）は別タスクとする
