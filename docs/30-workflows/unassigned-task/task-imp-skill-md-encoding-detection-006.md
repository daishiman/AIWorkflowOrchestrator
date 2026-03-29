# SKILL.md エンコーディング自動検出対応

## メタ情報

```yaml
issue_number: 1739
```

## メタ情報

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| タスクID     | task-imp-skill-md-encoding-detection-006      |
| タスク名     | SKILL.md エンコーディング自動検出対応         |
| 分類         | 改善（imp）                                   |
| 対象機能     | SkillCreatorVerificationEngine / Layer 1 検証 |
| 優先度       | 低（P2）                                      |
| 見積もり規模 | 小                                            |
| ステータス   | 未実施                                        |
| 発見元       | Phase 12                                      |
| 発見日       | 2026-03-29                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 背景

`SkillCreatorVerificationEngine` は SKILL.md を読み込む際に `fs.readFile(p, "utf-8")` を使用しており、
UTF-8 エンコーディングを暗黙の前提としている。

```typescript
// SkillCreatorVerificationEngine.ts（現行実装）
async function readFileContent(p: string): Promise<string | null> {
  try {
    return await fs.readFile(p, "utf-8");
  } catch {
    return null;
  }
}
```

UTF-8 以外のエンコーディング（UTF-16 LE/BE、Shift_JIS、EUC-JP 等）で保存された SKILL.md を
渡された場合、Node.js の `fs.readFile` は例外をスローせず文字化けしたコンテンツを返す。
その結果、L1/L2 の検証が文字化けした不正なコンテンツを対象に実行されることになる。

### 問題点・課題

- エンコーディング不一致時に検証が「成功しているように見える」が、実際には無効なコンテンツを検証している
- 日本語テキストを多用するこのプロジェクトでは、Shift_JIS で保存された SKILL.md が混入する可能性がある
  （特に Windows 環境で作成されたファイル）
- UTF-16 の BOM（Byte Order Mark）が含まれるファイルでは H1 見出しの検出が失敗する場合がある
- エンコーディング問題が発生しても、検証エンジンは `null` ではなく文字化け文字列を返すため、
  呼び出し側でエラーを検知できない

### 放置した場合の影響

| 影響領域                | 影響                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------- |
| L1/L2 検証の信頼性      | 文字化けコンテンツを検証するため、L2 の全セクション検査が意味をなさない                |
| エラー検出の遅延        | エンコーディング問題がサイレントに通過し、デバッグが困難になる                         |
| 日本語 SKILL.md         | Windows 環境で Shift_JIS 保存されたファイルで問題が顕在化する可能性がある              |
| UTF-16 BOM 付きファイル | BOM 文字が H1 見出しの先頭に付加され、`^#\s+.+` のパターンマッチが失敗する可能性がある |

---

## 2. 何を達成するか（What）

### 目的

`SkillCreatorVerificationEngine` の Layer 1 検証において、SKILL.md のエンコーディングを
読み込み時に確認し、UTF-8 以外のエンコーディングや BOM 付き UTF-8 に対して適切な
`warning` または `error` を返す仕組みを導入する。

### 最終ゴール

- UTF-8 以外のエンコーディングの SKILL.md を渡された場合に、Layer 1 チェックとして
  `warning` または `error` が返る（現行はサイレントに文字化けコンテンツを返す）
- UTF-8 BOM 付きファイルを渡された場合に、BOM を除去して正しく検証が続行されるか、
  または `warning` が返る
- 正常な UTF-8 ファイルは現行と同じ動作をする
- 新規チェック ID（例: L1-006）として check ID 体系に組み込まれる

### スコープ

**含むもの:**

- `SkillCreatorVerificationEngine.ts` の `readFileContent` 関数または Layer 1 バリデーターへの
  エンコーディング確認ロジックの追加
- 新規 L1-006 チェックの定義（SKILL.md エンコーディング検証）
- L1-006 のテスト追加

**含まないもの:**

- 外部エンコーディング検出ライブラリの導入（まず Node.js ビルトイン手段での対応を検討する）
- Shift_JIS / EUC-JP への自動変換・リカバリー（変換は呼び出し側の責務とする）
- agents/ 配下のエージェント仕様書のエンコーディング検証（SKILL.md のみを対象とする）

### 成果物

| 種別 | 成果物                                   | 配置先                                                                                    |
| ---- | ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| 修正 | `SkillCreatorVerificationEngine.ts`      | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                |
| 更新 | `SkillCreatorVerificationEngine.test.ts` | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` |

---

## 3. どのように実行するか（How）

### 前提条件

- `SkillCreatorVerificationEngine.ts` の `readFileContent` および `validateLayer1` の実装を把握している
- Node.js の `fs.readFile` でバイナリ読み込み（`encoding` 指定なし）が可能であることを理解している

### 推奨アプローチ

**ステップ 1: バイナリ読み込みによる BOM 検出**

```typescript
async function detectEncoding(
  p: string,
): Promise<"utf-8" | "utf-16le" | "utf-16be" | "utf-8-bom" | "unknown"> {
  try {
    const buf = await fs.readFile(p); // バイナリ読み込み
    // UTF-16 LE BOM: FF FE
    if (buf[0] === 0xff && buf[1] === 0xfe) return "utf-16le";
    // UTF-16 BE BOM: FE FF
    if (buf[0] === 0xfe && buf[1] === 0xff) return "utf-16be";
    // UTF-8 BOM: EF BB BF
    if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf)
      return "utf-8-bom";
    return "utf-8";
  } catch {
    return "unknown";
  }
}
```

**ステップ 2: Layer 1 への L1-006 チェック追加**

```typescript
// validateLayer1 内に追加
const encoding = await detectEncoding(skillMdPath);
if (encoding === "utf-16le" || encoding === "utf-16be") {
  checks.push(
    createCheck(
      "L1-006",
      "layer1",
      "error",
      `SKILL.md has unsupported encoding: ${encoding}`,
      `path: ${skillMdPath}, encoding: ${encoding}`,
    ),
  );
} else if (encoding === "utf-8-bom") {
  checks.push(
    createCheck(
      "L1-006",
      "layer1",
      "warning",
      "SKILL.md has UTF-8 BOM, which may cause issues",
      `path: ${skillMdPath}, encoding: utf-8-bom`,
    ),
  );
} else {
  checks.push(
    createCheck(
      "L1-006",
      "layer1",
      "info",
      "SKILL.md encoding is UTF-8",
      `path: ${skillMdPath}`,
    ),
  );
}
```

**ステップ 3: BOM 除去オプション**

UTF-8 BOM 付きファイルの検証継続を優先する場合、`readFileContent` で BOM を除去してから
後続の L2 検証に渡す実装も検討する。

### 外部ライブラリの検討

簡易 BOM 検出は Node.js ビルトインのみで実装可能なため、当面は外部ライブラリ不要。
Shift_JIS の文字コード推定が必要になった場合は `chardet` 等の導入を別タスクで検討する。

---

## 4. 実行手順（Phase 構成）

### Phase 1: 現状調査と設計

- `SkillCreatorVerificationEngine.ts` の `readFileContent` と `validateLayer1` の実装を精読する
- Node.js の BOM 検出アプローチ（バイナリ読み込み + バイト列確認）の実現可能性を確認する
- L1-006 の severity 設計を決定する
  - UTF-16: `error`（検証続行不可）
  - UTF-8 BOM: `warning`（BOM 除去後に続行可能）
- `task-imp-l2-section-name-flexible-005`（L2-002/L2-003 別名対応）との実装順序を決定する

### Phase 2: エンコーディング検出の実装

- `detectEncoding` 関数を `SkillCreatorVerificationEngine.ts` に追加する
- `validateLayer1` に L1-006 チェックを追加する
- UTF-8 BOM の場合、`readFileContent` で BOM を除去して Layer 2 に渡すか否かを設計決定に従って実装する

### Phase 3: テストの追加

- 正常な UTF-8 ファイルで L1-006 が `info` を返すテストを追加する
- UTF-16 LE ファイル（FF FE BOM）で L1-006 が `error` を返すテストを追加する
- UTF-8 BOM 付きファイルで L1-006 が `warning` を返すテストを追加する
- 既存の L1 テストが引き続き通ることを確認する

### Phase 4: 検証・コミット

- `pnpm --filter @repo/desktop test` を実行し、全テストが通ることを確認する
- 型チェック（`pnpm typecheck`）を実行する
- check ID の更新を `task-imp-layer12-spec-definition-004` の対応と連携する（必要に応じて）
- 変更をコミットする

---

## 5. 完了条件チェックリスト

- [ ] 正常な UTF-8 の SKILL.md に対して L1-006 が `info` を返す
- [ ] UTF-16 LE（FF FE BOM）の SKILL.md に対して L1-006 が `error` を返す
- [ ] UTF-16 BE（FE FF BOM）の SKILL.md に対して L1-006 が `error` を返す
- [ ] UTF-8 BOM 付き（EF BB BF）の SKILL.md に対して L1-006 が `warning` を返す
- [ ] 既存の L1-001〜L1-005 のテストが引き続き通る
- [ ] `detectEncoding` 関数が外部依存なし（Node.js ビルトインのみ）で実装されている
- [ ] 全テストが通る（`pnpm --filter @repo/desktop test`）
- [ ] 型チェックが通る（`pnpm typecheck`）

---

## 6. 検証方法

### 確認手順

```bash
# 現行の readFileContent 実装を確認
grep -n "readFile\|utf-8\|encoding" \
  apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts

# テスト用の UTF-16 ファイルを作成して検証（手動確認）
# Node.js での BOM バイト確認例:
node -e "
const fs = require('fs');
const buf = fs.readFileSync('/path/to/SKILL.md');
console.log('BOM bytes:', buf[0].toString(16), buf[1].toString(16), buf[2].toString(16));
"

# テスト実行
pnpm --filter @repo/desktop test -- --reporter=verbose SkillCreatorVerificationEngine
```

### テストケース

| #   | テストケース         | 入力ファイルの先頭バイト | 対象チェック | 期待 severity |
| --- | -------------------- | ------------------------ | ------------ | ------------- |
| 1   | 正常 UTF-8           | （BOM なし）             | L1-006       | `info`        |
| 2   | UTF-16 LE            | `FF FE`                  | L1-006       | `error`       |
| 3   | UTF-16 BE            | `FE FF`                  | L1-006       | `error`       |
| 4   | UTF-8 BOM 付き       | `EF BB BF`               | L1-006       | `warning`     |
| 5   | ファイルが存在しない | （読み込み不可）         | L1-006       | `error`       |

---

## 7. リスクと対策

| リスク                                        | 影響度 | 発生確率 | 対策                                                                                                 |
| --------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------------------------------- |
| Shift_JIS の検出が BOM なしでは困難           | 中     | 低       | 本タスクのスコープを BOM ベースの検出に限定し、Shift_JIS の推定は別タスクで対処する                  |
| BOM 除去後の L2 検証パスの複雑化              | 中     | 中       | UTF-8 BOM は `warning` のみとし、BOM 除去は Phase 1 の設計決定で明示的に判断する                     |
| L1-006 追加により既存チェック ID 体系が変わる | 低     | 低       | task-imp-layer12-spec-definition-004 と連携して check ID 体系の仕様書も更新する                      |
| テスト用バイナリファイルのリポジトリ汚染      | 低     | 中       | テスト内で `Buffer.from([0xff, 0xfe, ...])` を使ってインメモリで生成し、バイナリファイルを追加しない |
| Node.js バージョンによる挙動差異              | 低     | 低       | `.nvmrc` で固定されているバージョンで動作確認を行う                                                  |

---

## 8. 参照情報

### ソースコード

- `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` — `readFileContent`（行 38）・`validateLayer1`（行 61）が対象箇所
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` — 更新対象のテストファイル

### 仕様書・記録

- `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/` — TASK-P0-01 の成果物（本タスクが TASK-P0-01 スコープ外として記録された根拠）
- `docs/30-workflows/unassigned-task/task-imp-layer12-spec-definition-004.md` — Layer 1/2 check ID 体系追記タスク（L1-006 追加時に連携）
- `docs/30-workflows/unassigned-task/task-imp-l2-section-name-flexible-005.md` — L2 セクション名柔軟化タスク（並行実施可能）

### 関連技術情報

- Node.js `fs.readFile` のエンコーディング未指定時の動作: バイナリ Buffer を返す
- UTF BOM のバイト列:
  - UTF-8 BOM: `EF BB BF`（3 バイト）
  - UTF-16 LE BOM: `FF FE`（2 バイト）
  - UTF-16 BE BOM: `FE FF`（2 バイト）
- Electron の Node.js バージョンは `.nvmrc` または `package.json` の `engines` フィールドを参照すること

### 関連タスク

- TASK-P0-01: `SkillCreatorVerificationEngine` Layer 1/2 実装（本タスクの前提）
- task-imp-layer12-spec-definition-004: FR-04 verify 契約への check ID 体系追記（L1-006 追加時に連携が必要）
- task-imp-l2-section-name-flexible-005: L2 セクション名柔軟化（並行実施可能）

---

## 9. 備考

### 補足事項

- 本タスクは TASK-P0-01 のスコープから意図的に除外された。エンコーディング問題は実際に遭遇した
  事象ではなく、将来的なリスクとして予防的に記録されたものである。
- 現時点でこのプロジェクトの SKILL.md は全て UTF-8 で保存されている可能性が高いため、
  優先度は低（P2）としている。Windows 環境での開発者参加や、外部からのスキルインポート機能が
  追加された場合に優先度が上がる可能性がある。
- BOM の検出は純粋な Node.js ビルトインで実現可能なため、外部ライブラリの追加は避ける。
  統計的な文字コード推定（Shift_JIS / EUC-JP の判別）が必要になった場合は、
  別タスクとして `chardet` 等のライブラリ導入を検討する。
- テスト実装では、バイナリファイルをリポジトリに追加せずに済むよう、
  `Buffer.from([0xff, 0xfe, 0x23, 0x20, ...])` のようにテストコード内でバイナリを生成し、
  一時ファイルとして書き出す方法を推奨する。
- `task-imp-quick-validate-bom-utf8-001` という類似タスクが既に存在する場合は、
  本タスクとのスコープ重複を事前に確認してから着手すること。
