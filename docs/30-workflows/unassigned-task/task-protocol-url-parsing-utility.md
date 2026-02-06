# カスタムプロトコルURLパース標準ユーティリティ - タスク指示書

## メタ情報

```yaml
issue_number: 733
```

## メタ情報

| 項目         | 内容                                               |
| ------------ | -------------------------------------------------- |
| タスクID     | UT-PROTOCOL-URL-001                                |
| タスク名     | カスタムプロトコルURLパース標準ユーティリティ整備  |
| 分類         | リファクタリング / ユーティリティ                  |
| 対象機能     | カスタムプロトコル処理全般                         |
| 優先度       | 中                                                 |
| 見積もり規模 | 小規模                                             |
| ステータス   | 未実施                                             |
| 発見元       | Phase 12（TASK-AUTH-CALLBACK-001実装時の苦戦箇所） |
| 発見日       | 2026-02-06                                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-AUTH-CALLBACK-001（OAuth PKCE移行）の実装中、`new URL("aiworkflow://auth/callback")` を使用した際にRFC 3986のauthorityコンポーネント規則により、予期しないパース結果が発生した。

カスタムプロトコル（`aiworkflow://`, `myapp://`等）では、`new URL()` は意図通りに動作しない。現在は `customProtocol.ts` に `extractProtocolPath()` 関数が存在するが、この知見がプロジェクト全体で共有されていない。

### 1.2 問題点・課題

| 問題             | 詳細                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------- |
| パース結果の誤り | `url.hostname === "auth"`, `url.pathname === "/callback"`（`/auth/callback` が期待値） |
| 知見の分散       | `extractProtocolPath()` が `main/protocol/` に閉じており、他の開発者に知られていない   |
| 重複実装のリスク | 将来的に別のカスタムプロトコル処理で同じ問題に遭遇する可能性                           |

### 1.3 放置した場合の影響

- 新規開発者が同じ `new URL()` の落とし穴に遭遇し、デバッグ時間を浪費する
- 一貫性のないパース処理がコードベースに増殖する
- カスタムプロトコル関連のバグが再発する可能性

---

## 2. 何を達成するか（What）

### 2.1 目的

カスタムプロトコルURLの安全なパースユーティリティを共有パッケージに移動し、プロジェクト全体で利用可能にする。

### 2.2 最終ゴール

- `packages/shared/src/utils/protocolUrl.ts` に標準ユーティリティを配置
- JSDoc + TypeDoc形式のドキュメント付き
- 90%以上のテストカバレッジ
- 既存の `customProtocol.ts` がこのユーティリティを使用

### 2.3 スコープ

#### 含むもの

- `extractProtocolPath()` 関数の共有パッケージへの移動
- `parseProtocolUrl()` 関数の新規作成（path + query params を構造化して返す）
- ユニットテストの作成
- JSDocドキュメントの作成

#### 含まないもの

- カスタムプロトコル登録処理の変更
- OAuth認証フロー自体の変更
- 既存テストの大規模修正

### 2.4 成果物

| 成果物                 | パス                                            |
| ---------------------- | ----------------------------------------------- |
| ユーティリティ実装     | `packages/shared/src/utils/protocolUrl.ts`      |
| ユニットテスト         | `packages/shared/src/utils/protocolUrl.test.ts` |
| 型定義（必要に応じて） | `packages/shared/types/protocol.ts`             |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-AUTH-CALLBACK-001が完了していること
- `customProtocol.ts` の `extractProtocolPath()` 関数が正常動作していること

### 3.2 依存タスク

| タスクID               | 内容           | ステータス |
| ---------------------- | -------------- | ---------- |
| TASK-AUTH-CALLBACK-001 | OAuth PKCE移行 | **完了**   |

### 3.3 必要な知識

- RFC 3986 URI構文（特にauthorityコンポーネント）
- Electronカスタムプロトコル処理
- TypeScript ユーティリティ関数設計

### 3.4 推奨アプローチ

1. 既存の `extractProtocolPath()` を分析し、汎用化
2. 追加ユーティリティ `parseProtocolUrl()` を設計（戻り値: `{ path: string, params: URLSearchParams }`）
3. TDD方式でテストファースト実装
4. 既存コードを新ユーティリティに移行

### 3.5 実装課題と解決策（TASK-AUTH-CALLBACK-001からの学び）

| 課題                                   | 解決策                                                         |
| -------------------------------------- | -------------------------------------------------------------- |
| `new URL()` がhostnameとしてパスを解釈 | プレフィックス除去 + `?` による分離で手動パース                |
| `#` フラグメントの扱い                 | `url.indexOf('#')` で位置検出し、別途 `URLSearchParams` で処理 |
| Base64URL文字列内の `=` エスケープ     | `decodeURIComponent()` を適用してからパース                    |

**参照**: `.claude/skills/aiworkflow-requirements/references/security-implementation.md` セクション「実装時の苦戦した箇所」

---

## 4. 実行手順

### Phase構成

| Phase | 名称         | 概要                             |
| ----- | ------------ | -------------------------------- |
| 1     | 要件定義     | 既存コード分析、API設計          |
| 2     | 設計         | インターフェース定義             |
| 3     | 設計レビュー | API設計の妥当性検証              |
| 4     | テスト作成   | ユニットテスト作成               |
| 5     | 実装         | ユーティリティ実装               |
| 6-9   | 品質保証     | カバレッジ確認、リファクタリング |
| 10    | 最終レビュー | 品質検証                         |
| 11    | 手動テスト   | 統合動作確認                     |
| 12    | ドキュメント | JSDoc、README更新                |

### Phase 4: テスト作成

#### 目的

TDDに従い、先にテストケースを設計

#### 手順

1. 正常系テスト: 各種カスタムプロトコルURL（`aiworkflow://`, `myapp://`等）
2. 異常系テスト: 無効なURL、空文字、null
3. 境界値テスト: クエリパラメータあり/なし、フラグメントあり/なし
4. エッジケース: Base64URL文字列を含むパラメータ

#### テストケース例

```typescript
describe("extractProtocolPath", () => {
  it("should extract path from custom protocol URL", () => {
    expect(extractProtocolPath("aiworkflow://auth/callback")).toBe(
      "auth/callback",
    );
  });

  it("should handle query parameters", () => {
    expect(extractProtocolPath("aiworkflow://auth/callback?code=xxx")).toBe(
      "auth/callback",
    );
  });

  it("should handle fragment", () => {
    expect(
      extractProtocolPath("aiworkflow://auth/callback#access_token=xxx"),
    ).toBe("auth/callback");
  });
});
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `extractProtocolPath()` が共有パッケージに存在する
- [ ] `parseProtocolUrl()` が構造化された結果を返す
- [ ] 既存の `customProtocol.ts` が新ユーティリティを使用している

### 品質要件

- [ ] ユニットテストカバレッジ 90% 以上
- [ ] TypeScript strict モードでエラーなし
- [ ] ESLint エラーなし

### ドキュメント要件

- [ ] JSDocコメントが全関数に付与されている
- [ ] 使用例がJSDocに含まれている
- [ ] `.claude/skills/aiworkflow-requirements/references/` に関連仕様追加（該当する場合）

---

## 6. 検証方法

### テストケース

| テストID | 入力                                  | 期待結果                                             |
| -------- | ------------------------------------- | ---------------------------------------------------- |
| T1       | `aiworkflow://auth/callback`          | `{ path: 'auth/callback', params: {} }`              |
| T2       | `aiworkflow://auth/callback?code=abc` | `{ path: 'auth/callback', params: { code: 'abc' } }` |
| T3       | `aiworkflow://` (パスなし)            | `{ path: '', params: {} }`                           |
| T4       | `invalid-url`                         | エラー or null                                       |

### 検証手順

1. `pnpm --filter @repo/shared test` でユニットテスト実行
2. `pnpm --filter @repo/desktop dev` で開発モード起動
3. OAuth認証フローを実行し、カスタムプロトコルコールバックが正常動作することを確認

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                                   |
| -------------------------- | ------ | -------- | -------------------------------------- |
| 既存コードへの影響         | 中     | 低       | 移行時にエイリアスを残し、段階的に削除 |
| 新しいプロトコル形式の出現 | 低     | 低       | 汎用的な設計で対応可能にする           |
| パフォーマンスへの影響     | 低     | 低       | シンプルな文字列操作のため影響なし     |

---

## 8. 参照情報

### 関連ドキュメント

- [security-implementation.md](/.claude/skills/aiworkflow-requirements/references/security-implementation.md) - TASK-AUTH-CALLBACK-001苦戦箇所
- [06-known-pitfalls.md](/.claude/rules/06-known-pitfalls.md) - P14: カスタムプロトコルURLパース
- [patterns.md](/.claude/skills/skill-creator/references/patterns.md) - 失敗パターン「カスタムプロトコルURLの `new URL()` パース誤り」

### 参考資料

- [RFC 3986 - URI Generic Syntax](https://datatracker.ietf.org/doc/html/rfc3986) - Section 3.2 Authority
- [Electron Custom Protocols](https://www.electronjs.org/docs/latest/api/protocol)

---

## 9. 備考

### 発見時の原文

TASK-AUTH-CALLBACK-001 Phase 12実装ガイドより：

```
課題: `new URL("aiworkflow://auth/callback")` がauthorityコンポーネントとして解析される
影響: `url.pathname` が `/callback` のみ（`/auth/callback` ではない）
根本原因: RFC 3986のauthority規則: `scheme://authority/path` の構造に従い `auth` がhostname扱い
解決策: `extractProtocolPath()` で文字列操作（`url.slice(prefix.length)`）を使用
```

### 補足事項

- この問題は Electron アプリに限らず、Node.js でカスタムスキームを扱うすべてのケースで発生する
- `electron://`, `vscode://`, `slack://` 等、他の有名なカスタムプロトコルでも同様の問題が起きうる
