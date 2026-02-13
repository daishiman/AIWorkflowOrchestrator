# Phase 6: テスト拡充

## メタ情報

| 項目     | 内容                                          |
| -------- | --------------------------------------------- |
| タスクID | UT-9B-H-003                                   |
| Phase    | 6                                             |
| タスク名 | SkillCreator IPCセキュリティ強化 - テスト拡充 |
| Issue    | #796                                          |
| 作成日   | 2026-02-12                                    |
| 優先度   | 高 (security)                                 |
| 前Phase  | Phase 5: 実装                                 |

## 目的

Phase 4 で作成した基本テストに加え、境界値・異常系・組合せテストを追加し、セキュリティ関数のカバレッジを推奨基準（Line 90%, Branch 70%, Function 90%）以上に引き上げる。

## 実行タスク

- Task 1: 境界値テスト追加: validatePath と sanitizeErrorMessage の境界条件を拡充する。
- Task 2: 組合せテスト追加: セキュリティ検証の優先順序を確認する。
- Task 3: schemaName境界値追加: ホワイトリスト検証の抜け漏れを防ぐ。
- Task 4: カバレッジ強化: Phase 7 の基準を満たすテスト群へ拡張する。

### Task 1: 境界値テスト追加（validatePath）

**対象ファイル**: `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts`

**追加テストケース**:

```typescript
describe("validatePath - 境界値テスト", () => {
  test("空文字列パス → 拒否", () => {
    // inputPath が '' の場合、basePath そのものに解決されるため
    // resolvedTarget === resolvedBase となり、basePath + path.sep で始まらない
    // → 拒否される
  });

  test('相対パス "./valid" → 許可ディレクトリ内なら検証通過', () => {
    // basePath 内のサブディレクトリを指す相対パス
    // → resolvedTarget が resolvedBase + path.sep で始まるため通過
  });

  test("絶対パスで許可ディレクトリ内 → 検証通過", () => {
    // inputPath が basePath 配下の絶対パス
    // → 通過
  });

  test('二重エンコードパス "%2e%2e%2f" → 拒否', () => {
    // URL エンコードされたパストラバーサル
    // path.resolve が展開しない場合でも、ホワイトリストに含まれないため拒否
  });

  test("シンボリックリンクを模したパス → 正規化後に検証", () => {
    // path.resolve がシンボリックリンクを追従するか確認
  });

  test("許可ディレクトリと同名プレフィックスのパス → 拒否", () => {
    // basePath: /app/skills
    // inputPath: /app/skills-evil/malicious
    // → startsWith(resolvedBase + path.sep) により拒否
  });

  test("basePath 自体を指すパス → 許可 or 拒否の判断", () => {
    // inputPath が basePath そのもの
    // → resolvedTarget === resolvedBase の場合の挙動を検証
  });
});
```

### Task 2: 境界値テスト追加（sanitizeErrorMessage）

**追加テストケース**:

```typescript
describe("sanitizeErrorMessage - 境界値テスト", () => {
  test("非常に長いエラーメッセージ（10000文字）→ 確実に処理", () => {
    // 極端に長いメッセージでもクラッシュしないこと
    // メモリ消費が妥当であること
  });

  test("エラーメッセージが空文字列 → デフォルトメッセージ", () => {
    // new Error('') の場合
    // → 'スキル作成処理でエラーが発生しました' を返却
  });

  test("ネストされた Error オブジェクト（cause プロパティ）→ 安全にハンドリング", () => {
    // new Error('outer', { cause: new Error('inner with /secret/path') })
    // → cause 内のパスが漏洩しないこと
  });

  test('null を渡した場合 → "スキル作成処理でエラーが発生しました"', () => {
    // null は Error instance ではない
  });

  test('undefined を渡した場合 → "スキル作成処理でエラーが発生しました"', () => {
    // undefined は Error instance ではない
  });

  test('数値を渡した場合 → "スキル作成処理でエラーが発生しました"', () => {
    // 数値は Error instance ではない
  });

  test('複数のパスパターンを含むメッセージ → 全て "[path]" に置換', () => {
    // 'File /usr/local/bin/app not found, tried C:\\Users\\admin\\file'
    // → 'File [path] not found, tried [path]'
  });

  test("複数のトークン/キーを含むメッセージ → 全てマスキング", () => {
    // 'token=abc123 key=def456 password=ghi789'
    // → 'token=*** key=*** password=***'
  });
});
```

### Task 3: 組合せテスト追加

**追加テストケース**:

```typescript
describe("セキュリティ検証の優先順序テスト", () => {
  test("Sender 検証失敗 + パストラバーサル → Sender 検証が先に失敗", () => {
    // validateIpcSender が false を返す場合
    // → パストラバーサル検証に到達する前に "Unauthorized IPC sender" エラー
  });

  test("型バリデーション失敗 + schemaName 検証 → 型バリデーションが先に失敗", () => {
    // args.schemaName が number 型の場合
    // → typeof チェックで先に拒否される
  });

  test("パストラバーサル + sanitizeError → パストラバーサルエラーがサニタイズされないこと", () => {
    // パストラバーサルエラーは明確なセキュリティメッセージを返す
    // sanitizeErrorMessage を経由せず直接 "無効なパスが指定されました: ..." を返却
  });

  test("全検証 PASS → サービス層に到達すること", () => {
    // 正常系: 全セキュリティ検証を通過した場合
    // → SkillCreatorService のメソッドが呼び出されること
  });
});
```

### Task 4: schemaName 境界値テスト追加

**追加テストケース**:

```typescript
describe("ALLOWED_SCHEMA_NAMES - 境界値テスト", () => {
  test('大文字小文字: "Task-Spec" → 拒否（大文字小文字区別）', () => {
    // ALLOWED_SCHEMA_NAMES は小文字のみ
    // → "Task-Spec" は不一致で拒否
  });

  test('SQL インジェクション風: "\'; DROP TABLE" → 拒否', () => {
    // ホワイトリストに存在しないため拒否
  });

  test('パス区切り文字含む: "task-spec/../evil" → 拒否', () => {
    // ホワイトリストに存在しないため拒否
  });

  test('先頭/末尾に空白: " task-spec " → 拒否', () => {
    // 厳密一致のため空白付きは拒否
  });

  test('空文字列: "" → 拒否', () => {
    // ホワイトリストに存在しないため拒否
  });

  test('許可されたスキーマ名: "task-spec" → 通過', () => {
    // ホワイトリストに存在するため通過
  });

  test('許可されたスキーマ名: "skill-spec" → 通過', () => {
    // ホワイトリストに存在するため通過
  });

  test('許可されたスキーマ名: "mode" → 通過', () => {
    // ホワイトリストに存在するため通過
  });

  test('Unicode 文字を含む: "task-spec\u200B" → 拒否', () => {
    // ゼロ幅スペース等不可視文字が含まれている場合も拒否
  });
});
```

## 参照資料

| 資料                      | パス / 場所                                                                                  |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| Phase 4 テスト仕様        | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-4-test-creation.md`  |
| Phase 5 実装仕様          | `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/phase-5-implementation.md` |
| IPC セキュリティ仕様      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                 |
| API/Electron セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                 |
| エラーハンドリング仕様    | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                        |
| Skill Creator IPC型定義   | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                         |
| カバレッジ基準            | `.claude/rules/02-code-quality.md` のカバレッジ基準セクション                                |
| テスト設計の注意          | `.claude/rules/02-code-quality.md` のテスト設計の注意セクション                              |
| Pitfall P9                | `.claude/rules/06-known-pitfalls.md` のモジュールスコープ変数テスト間リーク                  |

## 統合テスト連携

| 層                   | テスト内容                                                           |
| -------------------- | -------------------------------------------------------------------- |
| バックエンド（Main） | 境界値・異常系で各セキュリティ関数が正しく動作すること               |
| IPC通信              | セキュリティ検証の優先順序が正しいこと（Sender → 型 → ドメイン検証） |
| 組合せ               | 複数のセキュリティ層が正しく連携すること                             |

## 多角的チェック観点

| 観点         | 仕様参照先               | 確認項目                                            |
| ------------ | ------------------------ | --------------------------------------------------- |
| テスト品質   | 02-code-quality.md       | 境界値・異常系・組合せを網羅的にテスト              |
| テスト独立性 | 02-code-quality.md       | テスト間で状態を共有しない（beforeEach でリセット） |
| カバレッジ   | 02-code-quality.md       | Line 90%+, Branch 70%+, Function 90%+               |
| セキュリティ | security-electron-ipc.md | 攻撃パターンのバリエーションが十分であること        |

## 既知の Pitfall 対策

| Pitfall                                    | 対策                                                        |
| ------------------------------------------ | ----------------------------------------------------------- |
| P9: モジュールスコープ変数のテスト間リーク | 各テストで mockSkillCreatorService を beforeEach でリセット |
| P13: タイマーテストの無限ループ            | 本タスクではタイマーを使用しないため該当なし                |
| P20: テスト環境でのログ出力汚染            | console.log/warn をモックして出力を抑制                     |

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準（セキュリティコード） |
| ----------------- | -------- | ------------------------------ |
| Line Coverage     | 80%      | 90%                            |
| Branch Coverage   | 60%      | 70%                            |
| Function Coverage | 80%      | 90%                            |

セキュリティ関連コードは推奨基準を目標とする。

## 成果物

| 成果物             | パス                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| 拡充テストファイル | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts` |

## 完了条件

- [ ] 境界値テスト（validatePath）が全て実装されている
- [ ] 境界値テスト（sanitizeErrorMessage）が全て実装されている
- [ ] 組合せテスト（セキュリティ検証の優先順序）が全て実装されている
- [ ] schemaName 境界値テストが全て実装されている
- [ ] 全テストが PASS する
- [ ] テスト間で状態共有がないこと（beforeEach でリセット済み）

## 次Phase

Phase 7: カバレッジ確認 → `phase-7-coverage-check.md`
