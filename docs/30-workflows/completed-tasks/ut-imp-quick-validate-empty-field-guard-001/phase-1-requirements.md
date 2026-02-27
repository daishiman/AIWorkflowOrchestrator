# Phase 1: 要件定義 — name/description 空フィールドガード追加

## メタ情報

| 項目               | 値                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------- |
| タスクID           | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001                                            |
| Phase              | 1 — 要件定義                                                                           |
| 機能名             | quick_validate.js name/description 空フィールドガード                                  |
| 作成日             | 2026-02-27                                                                             |
| 前提Phase          | なし                                                                                   |
| 目的               | frontmatter の name/description フィールドに対する堅牢なバリデーションの要件を定義する |
| 成果物ディレクトリ | `docs/30-workflows/completed-tasks/ut-imp-quick-validate-empty-field-guard-001/`       |

## 目的

`quick_validate.js` の `validateSkill()` 関数（L140-193）で、`frontmatter.name` / `frontmatter.description` が空文字・未定義・非文字列型のとき `.toLowerCase()` / `.includes()` / `.length` の呼び出しでランタイム例外が発生するバグを修正するための要件を定義する。

## 実行タスク

- 機能要件定義: FR-1〜FR-3 を仕様化する
- 非機能要件定義: NFR-1〜NFR-5 を仕様化する
- 受け入れ基準定義: AC-1〜AC-15 を検証可能な形で定義する
- 影響範囲特定: 修正対象・非対象・既存機能への影響を明示する

## 参照資料

| 種別         | 資料名                                    | パス                                                                                |
| ------------ | ----------------------------------------- | ----------------------------------------------------------------------------------- |
| ルール       | P42: .trim() バリデーション漏れ           | `.claude/rules/06-known-pitfalls.md#P42`                                            |
| 仕様         | claude-code-skills-structure.md           | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md` |
| 仕様         | claude-code-skills-process.md             | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-process.md`   |
| 仕様         | error-handling.md（Validation Error分類） | `.claude/skills/aiworkflow-requirements/references/error-handling.md`               |
| 仕様         | security-input-validation.md（型強制）    | `.claude/skills/aiworkflow-requirements/references/security-input-validation.md`    |
| 対象コード   | quick_validate.js                         | `.claude/skills/skill-creator/scripts/quick_validate.js`                            |
| 既存テスト   | quick_validate.test.js                    | `.claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js`             |
| テンプレート | phase-templates.md                        | `.claude/skills/task-specification-creator/references/phase-templates.md`           |
| Issue        | #913                                      | GitHub Issue                                                                        |

## 実行手順

### 1. 現状分析

#### 1.1 バグの再現条件

`validateSkill()` 関数の以下の箇所で、`frontmatter.name` / `frontmatter.description` に非文字列値が設定された場合にランタイム例外が発生する:

**name フィールド（L140-155）:**

```javascript
// 現在のコード
if (!frontmatter.name) {
  result.addError("name フィールドが存在しません");
} else {
  const name = frontmatter.name;
  if (name.length > 64) {
    /* ... */
  } // 数値: undefined > 64 → false（例外なし、誤判定）
  else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) {
    /* ... */
  } // 数値: toString()で変換されて予期しない結果
  else if (name !== skillName) {
    /* ... */
  }
}
```

- `!frontmatter.name` は falsy チェックのみ。数値 `123`、boolean `true`、オブジェクト `{}` は falsy ではないため else 分岐に入る
- `name.length` は数値・boolean・オブジェクトに対して `undefined` を返し、`undefined > 64` は `false` → 誤って通過
- 正規表現 `.test()` は引数を文字列に変換するため例外は出ないが、意図しない判定になる

**description フィールド（L158-193）:**

```javascript
// 現在のコード
if (!frontmatter.description) {
  result.addError("description フィールドが存在しません");
} else {
  const desc = frontmatter.description;
  if (desc.length > 1024) {
    /* ... */
  }
  if (desc.includes("<") || desc.includes(">")) {
    /* ... */
  } // ← 非文字列で TypeError
  if (!desc.includes("Anchors:") && !desc.includes("•")) {
    /* ... */
  } // ← 非文字列で TypeError
  if (!desc.toLowerCase().includes("use when")) {
    /* ... */
  } // ← 非文字列で TypeError
}
```

- 数値 `123` が description に設定された場合: `(123).includes` は `TypeError: desc.includes is not a function`
- boolean `true` が description に設定された場合: 同様に `TypeError`
- `.toLowerCase()` も Number / Boolean プロトタイプに存在しないため `TypeError`

#### 1.2 既存テストの状態

TC-EC-004（`quick_validate.test.js` L746-756）が「動作を記録する」形式でこの問題を記録済み。現在は「クラッシュまたはエラー」を許容する緩いアサーション:

```javascript
expect(output).toMatch(/name.*存在しません|Error|エラー|not a function/);
```

修正後は「検証エラーとして明示的に返る」ことを厳密に検証するテストに変更が必要。

### 2. 機能要件

#### FR-1: name フィールドの型安全バリデーション

| ID    | 要件                                                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------- |
| FR-1a | `frontmatter.name` が `undefined` / `null` の場合、検証エラー「name フィールドが存在しません」を返す                                  |
| FR-1b | `frontmatter.name` が空文字 `""` の場合、検証エラー「name フィールドが存在しません」を返す                                            |
| FR-1c | `frontmatter.name` がスペースのみ文字列（例: `"   "`）の場合、検証エラー「name フィールドが空です」を返す                             |
| FR-1d | `frontmatter.name` が非文字列型（数値、boolean、オブジェクト、配列）の場合、検証エラー「name フィールドが文字列ではありません」を返す |
| FR-1e | 上記いずれの場合もランタイム例外（TypeError 等）を発生させない                                                                        |

#### FR-2: description フィールドの型安全バリデーション

| ID    | 要件                                                                                                                                                |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-2a | `frontmatter.description` が `undefined` / `null` の場合、検証エラー「description フィールドが存在しません」を返す                                  |
| FR-2b | `frontmatter.description` が空文字 `""` の場合、検証エラー「description フィールドが存在しません」を返す                                            |
| FR-2c | `frontmatter.description` がスペースのみ文字列（例: `"   "`）の場合、検証エラー「description フィールドが空です」を返す                             |
| FR-2d | `frontmatter.description` が非文字列型（数値、boolean、オブジェクト、配列）の場合、検証エラー「description フィールドが文字列ではありません」を返す |
| FR-2e | 上記いずれの場合もランタイム例外（TypeError 等）を発生させない                                                                                      |

#### FR-3: 既存バリデーションの維持

| ID    | 要件                                                                                             |
| ----- | ------------------------------------------------------------------------------------------------ |
| FR-3a | 正常な文字列 name に対する既存の検証（ハイフンケース、64文字制限、ディレクトリ名一致）を維持する |
| FR-3b | 正常な文字列 description に対する既存の検証（1024文字制限、角括弧、Anchors、Trigger）を維持する  |
| FR-3c | 既存のテストケース（TC-N-_, TC-E-_, TC-B-\*）がすべて PASS する                                  |

### 3. 非機能要件

| ID    | カテゴリ         | 要件                                                                                                    |
| ----- | ---------------- | ------------------------------------------------------------------------------------------------------- |
| NFR-1 | 後方互換性       | 既存の検証ロジックの動作を変更しない（エラーメッセージの完全一致は不要、フォーマット踏襲）              |
| NFR-2 | パフォーマンス   | 追加のバリデーションによる実行時間増加は無視できるレベル（1ms 未満）                                    |
| NFR-3 | 保守性           | P42 準拠の3段バリデーションパターンを使用し、コードの一貫性を維持                                       |
| NFR-4 | テスト回帰       | 既存の全テストケース（TC-N-_, TC-E-_, TC-B-_, TC-OP-_, TC-WC-_, TC-RG-_, TC-EC-_, TC-IT-_）が PASS する |
| NFR-5 | エラーメッセージ | 既存の「〜が存在しません」フォーマットに加え、型エラー・空白エラー用の新メッセージを追加                |

### 4. 受け入れ基準

- [ ] AC-1: `frontmatter.name` が `undefined` の場合、例外なく検証エラーが返る
- [ ] AC-2: `frontmatter.name` が `null` の場合、例外なく検証エラーが返る
- [ ] AC-3: `frontmatter.name` が空文字 `""` の場合、例外なく検証エラーが返る
- [ ] AC-4: `frontmatter.name` がスペースのみ `"   "` の場合、例外なく検証エラーが返る
- [ ] AC-5: `frontmatter.name` が数値 `123` の場合、例外なく検証エラーが返る
- [ ] AC-6: `frontmatter.name` が boolean `true` の場合、例外なく検証エラーが返る
- [ ] AC-7: `frontmatter.name` がオブジェクト `{}` の場合、例外なく検証エラーが返る
- [ ] AC-8: `frontmatter.description` が `undefined` の場合、例外なく検証エラーが返る
- [ ] AC-9: `frontmatter.description` が空文字 `""` の場合、例外なく検証エラーが返る
- [ ] AC-10: `frontmatter.description` がスペースのみ `"   "` の場合、例外なく検証エラーが返る
- [ ] AC-11: `frontmatter.description` が数値 `123` の場合、例外なく検証エラーが返る
- [ ] AC-12: `frontmatter.description` が boolean `true` の場合、例外なく検証エラーが返る
- [ ] AC-13: 正常な name/description を持つスキルの検証結果が修正前後で同一
- [ ] AC-14: 既存テストが全件 PASS
- [ ] AC-15: 終了コード 4（検証失敗）が返る（例外による終了コード 1 ではない）

### 5. 影響範囲

| 対象                   | 影響                       | 備考                                        |
| ---------------------- | -------------------------- | ------------------------------------------- |
| quick_validate.js      | 直接修正                   | validateSkill() 内の name/description 検証  |
| quick_validate.test.js | テスト追加・TC-EC-004 更新 | エッジケーステストの厳密化                  |
| fixtures/              | フィクスチャ追加の可能性   | 非文字列型の frontmatter を持つフィクスチャ |
| utils.js               | 変更なし                   | parseFrontmatter() は変更不要               |
| 他のスキルスクリプト   | 変更なし                   | validate_structure.js 等は別ロジック        |

### 6. 非該当事項

以下の領域はこのタスクの対象外:

| 領域                  | 理由                                              |
| --------------------- | ------------------------------------------------- |
| Electron Main Process | Node.js スクリプトの修正であり、Electron は非該当 |
| IPC / Preload         | IPC チャンネルは使用しない                        |
| Renderer / React UI   | UIコンポーネントは非該当                          |
| packages/shared       | 共有型定義への変更なし                            |
| Zustand Store         | 状態管理は非該当                                  |

## 統合テスト連携

このタスクは独立した Node.js スクリプトの修正であり、他のモジュールとの統合テストは不要。
ただし、以下のリグレッションテストで既存スキルとの互換性を確認:

- TC-RG-001: `skill-creator` スキルの検証
- TC-RG-002: `task-specification-creator` スキルの検証
- TC-RG-003: `aiworkflow-requirements` スキルの検証

## 多角的チェック観点

| 観点               | 確認事項                                           | 該当 |
| ------------------ | -------------------------------------------------- | ---- |
| セキュリティ       | 入力サニタイズ: 非文字列型の安全な処理             | Yes  |
| API設計            | エラーメッセージの一貫性: 既存フォーマット踏襲     | Yes  |
| エラーハンドリング | ランタイム例外の防止: TypeError を検証エラーに変換 | Yes  |
| 後方互換性         | 既存テスト全件 PASS                                | Yes  |
| パフォーマンス     | typeof チェック追加のオーバーヘッドは無視可能      | Yes  |
| Electron 層        | 非該当（Node.js スクリプト）                       | No   |
| IPC                | 非該当                                             | No   |
| 状態管理           | 非該当                                             | No   |

## 成果物

| 成果物     | パス                                        |
| ---------- | ------------------------------------------- |
| 要件定義書 | `phase-1-requirements.md`（本ドキュメント） |

## 完了条件

- [ ] 機能要件（FR-1, FR-2, FR-3）が全て定義されている
- [ ] 非機能要件（NFR-1 〜 NFR-5）が全て定義されている
- [ ] 受け入れ基準（AC-1 〜 AC-15）が全て定義されている
- [ ] 影響範囲が特定されている
- [ ] 非該当事項が明記されている
- [ ] バグの再現条件と原因がコードレベルで説明されている

## 次の Phase

Phase 2（設計）へ進む。

- 修正箇所の詳細設計
- 3段バリデーションの実装方針
- テストケース設計（エッジケース一覧）
