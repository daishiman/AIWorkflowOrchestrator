# Phase 1 要件定義書: TASK-P0-01 verify 実行エンジン Layer 1/2

## 1. 文書情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-P0-01                                     |
| 対象       | SkillCreatorVerificationEngine Layer 1/2       |
| ステータス | 実装済み（本文書は既存実装に基づく事後文書化） |
| 作成日     | 2026-04-04                                     |

## 2. 機能要件（Functional Requirements）

### FR-001: スキルディレクトリ構造の検証

SkillCreatorVerificationEngine は、指定されたスキルディレクトリに対して Layer 1（構造検証）を実行し、必須ファイル・ディレクトリの存在を確認する。

- SKILL.md の存在確認（L1-001, error）
- agents/ ディレクトリの存在確認（L1-002, error）
- agents/ 配下にファイルが1つ以上存在すること（L1-003, error）
- references/ ディレクトリの存在確認（L1-004, warning）
- output-schema.json の存在確認（L1-005, warning）

### FR-002: SKILL.md コンテンツの検証

Layer 2 にて SKILL.md の内部構造を検証する。

- H1 見出し（スキル名）の存在（L2-001, error）
- 概要セクション（`## 概要`）の存在（L2-002, error）
- Trigger セクション（`## Trigger`）の存在（L2-003, error）
- Anchors セクション（`## Anchors`）の存在（L2-004, warning）

### FR-003: エージェント定義ファイルの検証

Layer 2 にて agents/ 配下の .md ファイルのコンテンツを検証する。

- 各エージェントファイルに H1 見出しが存在すること（L2-005, error）
- 各エージェントファイルに責務セクション（`## 責務`）が存在すること（L2-006, warning）

### FR-004: output-schema.json の JSON 有効性検証

Layer 2 にて output-schema.json が有効な JSON であることを検証する（L2-007, error）。

### FR-005: チェック結果の構造化出力

各チェック結果は `RuntimeSkillCreatorVerifyCheck` 型で返却される。

```typescript
interface RuntimeSkillCreatorVerifyCheck {
  id: string; // "L1-001" 形式
  layer: "layer1" | "layer2" | "layer3" | "layer4";
  severity: "info" | "warning" | "error"; // info = PASS
  summary: string; // 人間可読な要約
  evidenceSummary?: string; // 証跡（パス等）
}
```

### FR-006: Facade 経由の検証実行

RuntimeSkillCreatorFacade の `verifySkill(skillDir)` メソッドにより、VerificationEngine に検証を委譲する。Engine 未注入時は空配列を返却する（graceful degradation）。

### FR-007: verify -> improve -> re-verify 閉ループ

`verifyAndImproveLoop()` により、検証失敗時に自動改善を試行し re-verify を実行する閉ループを提供する。最大試行回数（maxImproveRetry）に達した場合はループを停止する。

## 3. 非機能要件（Non-Functional Requirements）

### NFR-001: エラー耐性

- 存在しないディレクトリを指定した場合、例外をスローせず error severity のチェック結果を返却する
- ファイル読取失敗時は null 安全に処理し、適切な error チェック結果を生成する
- fs 操作は全て try-catch でラップし、graceful failure を保証する

### NFR-002: 冪等性

- 同一ディレクトリに対する複数回の `verify()` 呼び出しは、ファイルシステムに変更がない限り同一の結果を返す
- Engine はステートレスであり、呼び出し間で内部状態を保持しない

### NFR-003: パス安全性

- 日本語・スペースを含むパスを正しく処理する
- path traversal（`../`）による references/ ディレクトリ外参照を検出し reject する（L4-002）

### NFR-004: 拡張性

- Check ID は `L{N}-{NNN}` 形式の命名規則に従い、新規 Layer・チェック追加が容易
- 各 Layer のバリデーション関数はモジュールスコープで独立しており、単独テスト可能

### NFR-005: 型安全性

- 全チェック結果は `RuntimeSkillCreatorVerifyCheck` 型に準拠
- severity は `"info" | "warning" | "error"` のリテラル型ユニオン
- layer は `"layer1" | "layer2" | "layer3" | "layer4"` のリテラル型ユニオン

## 4. 受入基準（Acceptance Criteria）

### AC-1: Layer 1 完全検証

完全なスキルディレクトリ（SKILL.md, agents/配下にファイルあり, references/, output-schema.json）に対して verify() を実行した場合、L1-001 ~ L1-005 の全チェックが severity="info" を返す。

### AC-2: Layer 1 構造欠落検出

空ディレクトリに対して verify() を実行した場合、L1-001 が error、L1-002 が error、L1-004 が warning、L1-005 が warning を返す。

### AC-3: Layer 2 SKILL.md コンテンツ検証

H1 見出し・概要・Trigger・Anchors の全セクションを含む SKILL.md に対して、L2-001 ~ L2-004 の全チェックが severity="info" を返す。

### AC-4: Layer 2 SKILL.md 欠落セクション検出

H1 見出しのない SKILL.md に対して L2-001 が error を返す。概要セクションがない場合は L2-002 が error を返す。

### AC-5: Layer 2 エージェント検証

H1 見出しと責務セクションを持つエージェントファイルに対して L2-005 が info、L2-006 が info を返す。H1 見出しがないエージェントには L2-005 が error を返す。

### AC-6: Layer 2 JSON 有効性検証

有効な JSON の output-schema.json に対して L2-007 が info を返す。無効な JSON（空文字列、切り詰められた JSON）に対して L2-007 が error を返す。

### AC-7: Facade 注入パターン

VerificationEngine を注入した Facade の `verifySkill()` は Layer 1/2 のチェック結果を含む配列を返す。Engine 未注入時は空配列を返す。

### AC-8: エラー耐性

存在しないディレクトリパスを指定しても例外をスローせず、error severity のチェック結果配列を返す。

### AC-9: 日本語パス対応

日本語・スペースを含むディレクトリパスでも正しくチェックが実行され、適切な結果が返る。

### AC-10: 冪等性保証

同一ディレクトリに対する連続2回の verify() 呼び出しが同一の severity 結果を返す。

## 5. Layer 1 チェック仕様

| Check ID | 検証対象           | 判定基準           | PASS severity | FAIL severity |
| -------- | ------------------ | ------------------ | ------------- | ------------- |
| L1-001   | SKILL.md           | ファイルが存在する | info          | error         |
| L1-002   | agents/            | ディレクトリ存在   | info          | error         |
| L1-003   | agents/ 内容       | ファイル数 > 0     | info          | error         |
| L1-004   | references/        | ディレクトリ存在   | info          | warning       |
| L1-005   | output-schema.json | ファイルが存在する | info          | warning       |

### L1-001: SKILL.md 存在確認

- **判定**: `fs.stat(path.join(skillDir, "SKILL.md"))` でファイルが存在するか
- **PASS**: severity="info", summary="SKILL.md exists"
- **FAIL**: severity="error", summary="SKILL.md is missing"
- **evidenceSummary**: `path: {skillMdPath}`

### L1-002: agents/ ディレクトリ存在確認

- **判定**: `fs.stat(path.join(skillDir, "agents"))` でディレクトリが存在するか
- **PASS**: severity="info", summary="agents/ directory exists"
- **FAIL**: severity="error", summary="agents/ directory is missing"

### L1-003: agents/ ファイル存在確認

- **前提条件**: L1-002 が PASS の場合のみ内容チェック実行
- **判定**: `fs.readdir(agentsDir)` の entries 数 > 0
- **PASS**: severity="info", summary="agents/ contains {N} file(s)"
- **FAIL**: severity="error", summary="agents/ directory is empty"
- **agents/ 不在時**: severity="error", summary="agents/ directory does not exist, cannot check contents"

### L1-004: references/ ディレクトリ存在確認

- **判定**: ディレクトリが存在するか
- **PASS**: severity="info"
- **FAIL**: severity="warning"（推奨要件）

### L1-005: output-schema.json 存在確認

- **判定**: ファイルが存在するか
- **PASS**: severity="info"
- **FAIL**: severity="warning"（推奨要件）

## 6. Layer 2 チェック仕様

| Check ID | 検証対象                | 判定基準                   | PASS severity | FAIL severity |
| -------- | ----------------------- | -------------------------- | ------------- | ------------- |
| L2-001   | SKILL.md H1 見出し      | `^#\s+.+` にマッチ         | info          | error         |
| L2-002   | SKILL.md 概要セクション | `## 概要` 見出しが存在     | info          | error         |
| L2-003   | SKILL.md Trigger        | `## Trigger` 見出しが存在  | info          | error         |
| L2-004   | SKILL.md Anchors        | `## Anchors` 見出しが存在  | info          | warning       |
| L2-005   | agent H1 見出し         | 各 .md に H1 が存在        | info          | error         |
| L2-006   | agent 責務セクション    | 各 .md に `## 責務` が存在 | info          | warning       |
| L2-007   | output-schema.json      | JSON.parse() が成功        | info          | error         |

### L2-001 ~ L2-004: SKILL.md コンテンツ検証

- SKILL.md が読取不可の場合、L2-001 ~ L2-004 は全て severity="error" を返す
- Markdown セクション検出は `^##\s+{heading}\s*$` の正規表現パターンを使用

### L2-005 ~ L2-006: エージェントファイル検証

- agents/ 内の .md ファイルのみを対象（.json 等の非 .md ファイルは対象外）
- agents/ が空、または .md ファイルがない場合は L2-005/L2-006 を emit しない

### L2-007: output-schema.json JSON 有効性

- output-schema.json が存在しない場合は L2-007 を emit しない
- 空文字列、切り詰められた JSON は error を返す
