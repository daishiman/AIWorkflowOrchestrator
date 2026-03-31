# Phase 3: 設計レビューゲート (Design Review Gate)

## メタ情報

| 項目         | 値                                     |
| ------------ | -------------------------------------- |
| タスクID     | TASK-P0-09                             |
| 機能名       | claude-sdk-permission-hooks-governance |
| Phase        | 3                                      |
| 作成日       | 2026-03-31                             |
| レビュー対象 | Phase 2 governance-design.md           |

---

## レビュー観点一覧

| #   | 観点                                                  | 判定 |
| --- | ----------------------------------------------------- | ---- |
| 1   | plan phase が正当な read 操作をブロックしないか       | PASS |
| 2   | execute phase の write 制限が必須書き込みを妨げないか | PASS |
| 3   | hooks が監査のみで主処理を阻害しないか                | PASS |
| 4   | permission denial UI ペイロードが十分か               | PASS |
| 5   | 動的 skill-creator 読込に影響しないか                 | PASS |

---

## 1. plan phase の read 操作ブロック検証

### 検証対象

plan phase の policy:

- `permissionMode: "plan"`
- `allowedTools: ["Read", "Glob", "Grep", "Bash"]`
- `disallowedTools: ["Edit", "Write"]`

### 検証項目

| 操作                                       | 必要ツール | 許可 | 備考                                           |
| ------------------------------------------ | ---------- | ---- | ---------------------------------------------- |
| SKILL.md / agent prompt の読み込み         | Read       | Yes  | `allowedTools` に含まれる                      |
| skill-creator ディレクトリ構造の探索       | Glob       | Yes  | `allowedTools` に含まれる                      |
| 既存スキルのパターン検索                   | Grep       | Yes  | `allowedTools` に含まれる                      |
| workflow-manifest.json の読み込み          | Read       | Yes  | `allowedTools` に含まれる                      |
| `ls` / `cat` 等の read-only シェルコマンド | Bash       | Yes  | `permissionMode: "plan"` で read-only のみ許可 |
| ファイル作成・編集                         | Write/Edit | No   | plan phase では不要。正しくブロックされる      |

### 判定: PASS

plan phase で必要な全ての read 操作は `allowedTools` でカバーされている。`permissionMode: "plan"` により Bash も read-only コマンドに制限されるが、plan phase の用途（情報収集）としてはこれで十分である。

### リスク

- **低リスク**: Bash で `npm test` 等のテストコマンドを実行したい場合、`permissionMode: "plan"` で拒否される可能性がある。ただし plan phase でテスト実行は不要であり、これは verify phase の責務。

---

## 2. execute phase の write 制限検証

### 検証対象

execute phase の policy:

- `permissionMode: "acceptEdits"`
- `allowedTools: ["Read", "Edit", "Write", "Glob", "Grep", "Bash"]`
- `canUseTool`: Write/Edit を `~/.claude/skills/<skillName>/` に制限

### 検証項目

| 操作                                            | 必要ツール | 許可 | 備考                                                                       |
| ----------------------------------------------- | ---------- | ---- | -------------------------------------------------------------------------- |
| SKILL.md の新規作成                             | Write      | Yes  | skill target dir 内。`canUseTool` 通過                                     |
| agent prompt ファイルの作成                     | Write      | Yes  | skill target dir 内                                                        |
| scripts/ 配下のスクリプト作成                   | Write      | Yes  | skill target dir 内                                                        |
| references/ 配下のリファレンス作成              | Write      | Yes  | skill target dir 内                                                        |
| `/tmp` への一時ファイル作成                     | Write      | No   | skill target dir 外。`canUseTool` で拒否される                             |
| `~/.claude/settings.json` への書き込み          | Write      | No   | skill target dir 外。正しくブロックされる                                  |
| Bash による `mkdir -p` でスキルディレクトリ作成 | Bash       | Yes  | `permissionMode: "acceptEdits"` で許可。パス制限は Bash 側では適用されない |

### 判定: PASS

execute phase で必要な全ての書き込み操作は skill target dir 内で完結する。`canUseTool` による path 制限は `path.resolve` + prefix 比較で実装されており、path traversal（`../`）による回避も防止されている。

### 注意事項

- **Bash 経由の書き込み**: `canUseTool` は Write/Edit ツールのみに適用される。Bash 経由の `echo > file` 等は `canUseTool` ではブロックされない。ただし `permissionMode: "acceptEdits"` がこれをカバーし、SDK 側でユーザー確認が入る。
- **path traversal 対策**: `path.resolve` を使用しているため、`~/.claude/skills/test/../../../etc/passwd` のような攻撃パスは正規化後に拒否される。

---

## 3. hooks の監査専用性検証

### 検証対象

`SkillCreatorGovernanceHooks` の 4 つの hook:

- `onSessionStart`
- `onPreToolUse`
- `onPostToolUse`
- `onSessionEnd`

### 検証項目

| Hook           | 主処理への影響    | 判定 | 備考                                                                                                            |
| -------------- | ----------------- | ---- | --------------------------------------------------------------------------------------------------------------- |
| onSessionStart | なし（void 返却） | OK   | audit sink に記録するのみ。セッション開始を阻害しない                                                           |
| onPreToolUse   | allow/deny 返却   | OK   | ツール使用の許可/拒否を返すが、これは SDK 契約の一部。policy に基づく決定論的判定であり、恣意的なブロックはない |
| onPostToolUse  | なし（void 返却） | OK   | 実行結果を記録するのみ。結果の改変はしない                                                                      |
| onSessionEnd   | なし（void 返却） | OK   | サマリーを記録するのみ。セッション終了を阻害しない                                                              |

### 判定: PASS

hooks は以下の原則を満たしている:

1. **PreToolUse 以外は void 返却**: SessionStart / PostToolUse / SessionEnd は副作用なし（audit 記録のみ）
2. **PreToolUse は決定論的**: `allowedTools` / `disallowedTools` / `canUseTool` の設定に基づく static な判定であり、実行時の state に依存する動的判断はない
3. **主処理の変更なし**: hooks はツール実行の結果を改変しない。PostToolUse は結果を読み取って記録するのみ
4. **例外安全**: hooks 内で例外が発生しても、主処理のフローは影響を受けない設計（try-catch で保護）

### 補足: PreToolUse の「ブロック」について

PreToolUse が `deny` を返す場合、これは「主処理を阻害する」のではなく「policy に基づく正当なアクセス制御」である。plan phase で Edit が拒否されるのは、plan phase の設計意図そのものであり、skill-creator の動的実行主線を壊すものではない。

---

## 4. permission denial UI ペイロードの十分性検証

### 検証対象

`GovernancePermissionDenialPayload` 型:

```typescript
interface GovernancePermissionDenialPayload {
  sessionId: string;
  phase: SkillCreatorGovernancePhase;
  toolName: string;
  reason: string;
  denialKind:
    | "not_in_allowed_tools"
    | "in_disallowed_tools"
    | "scope_violation"
    | "custom_policy";
  scopeDetail?: {
    requestedPath: string;
    allowedScope: string;
  };
  timestamp: string;
}
```

### 検証項目

| 表示要件                   | 対応フィールド              | 充足 | 備考                             |
| -------------------------- | --------------------------- | ---- | -------------------------------- |
| どのツールが拒否されたか   | `toolName`                  | Yes  |                                  |
| なぜ拒否されたか           | `reason` + `denialKind`     | Yes  | 日本語の理由文 + 分類            |
| いつ拒否されたか           | `timestamp`                 | Yes  | ISO 8601                         |
| どの phase で拒否されたか  | `phase`                     | Yes  |                                  |
| スコープ違反の詳細         | `scopeDetail`               | Yes  | 要求パスと許可スコープ           |
| セッション内の denial 統計 | `GovernanceStateSnapshot`   | Yes  | `totalDenials` + `recentDenials` |
| ユーザーが対処可能な情報   | `reason` の日本語メッセージ | Yes  | 理由文に許可スコープを含める     |

### 判定: PASS

UI ペイロードは以下の情報を十分に含んでいる:

1. **即時通知**: denial 発生時に IPC push で renderer に送信
2. **分類**: `denialKind` により denial の種類を区別でき、UI 側で適切なアイコン/色分けが可能
3. **詳細情報**: スコープ違反時は具体的なパス情報を提供
4. **集約情報**: `GovernanceStateSnapshot` により、セッション全体の governance 状態を把握可能

### 改善提案（優先度: 低）

- `GovernancePermissionDenialPayload` に `suggestedAction` フィールドを追加し、ユーザーへの対処案を提示できると UX 向上。ただし Phase 1-3 のスコープ外であり、実装フェーズで検討する。

---

## 5. 動的 skill-creator 読込への影響検証

### 検証対象

- `.claude/skills/skill-creator/` の動的読込フロー
- `ManifestLoader` / `SkillCreatorSourceResolver` / `ResourceLoader` のコア動作
- `RuntimeSkillCreatorFacade` の既存 API

### 検証項目

| 検証ポイント                                  | 影響 | 備考                                                          |
| --------------------------------------------- | ---- | ------------------------------------------------------------- |
| ManifestLoader の読込ロジック変更             | なし | hooks は SDK query() option への注入のみ。Loader は変更しない |
| SkillCreatorSourceResolver の解決ロジック変更 | なし | source 解決は governance の対象外                             |
| ResourceLoader の agent/reference 読込変更    | なし | resource 読込は governance の対象外                           |
| Facade の plan/execute/improve API シグネチャ | なし | 既存 API に breaking change はない                            |
| Facade deps への追加                          | 追加 | `governanceHooksFactory` は optional。省略時はガバナンスなし  |
| skill-creator の SKILL.md / agent prompt 内容 | なし | prompt 内容への介入はゼロ                                     |
| workflow-manifest.json の読込                 | なし | manifest は provenance 記録の入力に使うのみ                   |

### 判定: PASS

governance 設計は以下の原則を守っている:

1. **AC-6 準拠**: skill-creator の固定化や hardcoded prompt への置換を行わない
2. **opt-in 設計**: `governanceHooksFactory` は optional deps。未設定時は既存の動作が完全に維持される
3. **レイヤー分離**: governance は SDK query() option 層で動作し、skill-creator の読込/解決/実行の各レイヤーには一切介入しない
4. **provenance は読み取り専用**: manifest hash / source root は SessionStart で記録するのみ。manifest の内容を変更したり、読込先を固定したりはしない

---

## 総合判定

| 観点                       | 判定 | 懸念事項                                                                                   |
| -------------------------- | ---- | ------------------------------------------------------------------------------------------ |
| 過剰制約（false positive） | なし | 各 phase で必要な操作は全て許可されている                                                  |
| 過少制約（false negative） | 低   | Bash 経由の間接的な書き込みは `canUseTool` ではカバーされないが、`permissionMode` でカバー |
| 主処理への副作用           | なし | hooks は監査記録のみ（PreToolUse の deny は policy 準拠）                                  |
| 動的実行の阻害             | なし | opt-in 設計 + レイヤー分離により影響ゼロ                                                   |
| UI 情報の十分性            | 十分 | denial の分類・詳細・集約の全てが提供される                                                |

### 結論

Phase 2 の governance 設計は、動的 skill-creator 実行を維持したまま、phase 別の安全境界と監査を適切に導入している。過剰制約・過少制約・主処理阻害のいずれにも該当せず、Phase 4（テスト作成）への移行を承認する。

---

## Phase 4 へのインプット

Phase 4 では以下のテストケースを優先的に作成すること:

1. **Policy テスト**: 各 phase の `allowedTools` / `disallowedTools` / `canUseTool` が正しく判定されること
2. **path traversal テスト**: `../` を含むパスが `canUseTool` で拒否されること
3. **hooks テスト**: 各 hook が audit sink に正しいイベントを記録すること
4. **opt-in テスト**: `governanceHooksFactory` 未設定時に既存動作が維持されること
5. **denial payload テスト**: deny 時に `GovernancePermissionDenialPayload` が正しく生成されること
