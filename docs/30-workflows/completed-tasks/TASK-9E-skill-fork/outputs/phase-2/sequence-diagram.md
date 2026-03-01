# Phase 2 成果物: シーケンス図 -- フォークプロセスフロー（正常系・異常系）

## メタ情報

| 項目     | 値                 |
| -------- | ------------------ |
| Phase    | 2                  |
| 機能名   | TASK-9E-skill-fork |
| タスクID | TASK-9E            |
| 作成日   | 2026-02-28         |

---

## 1. 正常系シーケンス図

### 1.1 全体フロー（Mermaid）

```mermaid
sequenceDiagram
    participant R as Renderer<br/>(ForkSkillDialog)
    participant P as Preload<br/>(skill-api.ts)
    participant M as Main Process<br/>(skillHandlers.ts)
    participant S as SkillService
    participant F as SkillForker
    participant FS as FileSystem

    R->>P: forkSkill(options: SkillForkOptions)
    P->>M: safeInvoke(SKILL_FORK, options)

    Note over M: Step 1: 送信元検証
    M->>M: validateIpcSender(event, SKILL_FORK)
    Note over M: Step 2: P42準拠3段バリデーション
    M->>M: sourceSkill/newName/description 検証
    M->>M: copyFlags/modifyAllowedTools 検証

    Note over M: Step 3: フォーク実行
    M->>S: forkSkill(options)
    S->>F: fork(options)

    Note over F: パストラバーサル検証
    F->>F: validatePath(sourceSkill)
    F->>F: validatePath(newName)

    Note over F: 存在確認
    F->>FS: exists(sourcePath)
    FS-->>F: true
    F->>FS: exists(destPath)
    FS-->>F: false

    Note over F: ディレクトリ作成
    F->>FS: mkdir(destPath, { recursive: true })
    FS-->>F: OK

    rect rgb(220, 240, 255)
        Note over F,FS: try/catch ロールバック保護区間

        Note over F: SKILL.md コピー+更新
        F->>FS: readFile(sourcePath/SKILL.md)
        FS-->>F: content
        F->>F: modifySkillMd(content, options)
        F->>FS: writeFile(destPath/SKILL.md, modified)
        FS-->>F: OK

        Note over F: サブディレクトリコピー (copyAgents=true)
        F->>FS: cp(src/agents, dest/agents, { recursive: true })
        FS-->>F: OK

        Note over F: サブディレクトリコピー (copyReferences=true)
        F->>FS: cp(src/references, dest/references, { recursive: true })
        FS-->>F: OK

        Note over F: メタデータ書き込み
        F->>FS: writeFile(dest/fork-metadata.json, metadata)
        FS-->>F: OK
    end

    F-->>S: SkillForkResult
    S-->>M: SkillForkResult
    M-->>P: { success: true, data: SkillForkResult }
    P-->>R: IpcResult<SkillForkResult>
```

### 1.2 正常系の処理ステップ詳細

| ステップ | 処理                      | 入力                        | 出力                      | 失敗時の対応   |
| -------- | ------------------------- | --------------------------- | ------------------------- | -------------- |
| 1        | 送信元検証                | IpcMainInvokeEvent          | validation.valid          | throw          |
| 2        | P42 3段バリデーション     | args (unknown)              | SkillForkOptions (型安全) | throw          |
| 3        | パストラバーサル検証      | sourceSkill, newName        | void                      | throw(1003)    |
| 4        | フォーク元存在確認        | sourcePath                  | boolean (true)            | throw(1001)    |
| 5        | 同名スキル不存在確認      | destPath                    | boolean (false)           | throw(1002)    |
| 6        | ディレクトリ作成          | destPath                    | void                      | throw(4004)    |
| 7        | SKILL.md 読み取り         | sourcePath/SKILL.md         | content (string)          | rollback(4001) |
| 8        | SKILL.md 更新             | content, SkillForkOptions   | modifiedContent (string)  | rollback       |
| 9        | SKILL.md 書き込み         | destPath/SKILL.md           | void                      | rollback       |
| 10       | agents/ コピー (条件付き) | src/agents, dest/agents     | copiedFiles (string[])    | rollback(4002) |
| 11       | references/ コピー        | src/refs, dest/refs         | copiedFiles (string[])    | rollback(4002) |
| 12       | scripts/ コピー           | src/scripts, dest/scripts   | copiedFiles (string[])    | rollback(4002) |
| 13       | assets/ コピー            | src/assets, dest/assets     | copiedFiles (string[])    | rollback(4002) |
| 14       | メタデータ書き込み        | destPath, SkillForkMetadata | void                      | rollback(4003) |
| 15       | SkillForkResult 返却      | -                           | SkillForkResult           | -              |

---

## 2. 異常系フロー（ロールバック）

### 2.1 ロールバックシーケンス図（Mermaid）

```mermaid
sequenceDiagram
    participant M as Main Process
    participant F as SkillForker
    participant FS as FileSystem

    M->>F: fork(options)

    Note over F: パストラバーサル検証 OK
    Note over F: 存在確認 OK

    F->>FS: mkdir(destPath)
    FS-->>F: OK

    rect rgb(255, 230, 230)
        Note over F,FS: try ブロック開始

        F->>FS: readFile(sourcePath/SKILL.md)
        FS-->>F: content
        F->>F: modifySkillMd(content, options)
        F->>FS: writeFile(destPath/SKILL.md)
        FS-->>F: OK

        F->>FS: cp(src/agents, dest/agents)
        FS-->>F: ERROR: EACCES (permission denied)

        Note over F,FS: catch ブロック: ロールバック実行

        F->>FS: rm(destPath, { recursive: true, force: true })
        FS-->>F: OK
        Note over F: ロールバック完了
    end

    F-->>M: throw SkillForkError(4002)
    M-->>M: sanitizeErrorMessage(error)
    M-->>M: return { success: false, error: "..." }
```

### 2.2 ロールバック処理の擬似コード

```typescript
async fork(options: SkillForkOptions): Promise<SkillForkResult> {
  // 1-4: バリデーション（ロールバック不要）
  this.validatePath(options.sourceSkill);
  this.validatePath(options.newName);

  const sourcePath = path.join(this.skillsDir, options.sourceSkill);
  const destPath = path.join(this.skillsDir, options.newName);

  if (!(await this.exists(sourcePath))) {
    throw new SkillForkError(
      `フォーク元スキル "${options.sourceSkill}" が見つかりません`,
      1001,
    );
  }
  if (await this.exists(destPath)) {
    throw new SkillForkError(
      `スキル "${options.newName}" は既に存在します`,
      1002,
    );
  }

  // 5: ディレクトリ作成
  try {
    await fs.mkdir(destPath, { recursive: true });
  } catch (error) {
    throw new SkillForkError(
      "ディレクトリの作成に失敗しました",
      4004,
      true,
    );
  }

  // 6-14: ロールバック保護区間
  try {
    // SKILL.md のコピー+更新
    const skillMdContent = await fs.readFile(
      path.join(sourcePath, "SKILL.md"),
      "utf-8",
    );
    const modifiedContent = this.modifySkillMd(skillMdContent, options);
    await fs.writeFile(
      path.join(destPath, "SKILL.md"),
      modifiedContent,
      "utf-8",
    );

    // サブディレクトリの選択的コピー
    const copiedFiles: string[] = ["SKILL.md"];
    const warnings: string[] = [];

    const copyTargets = [
      { flag: options.copyAgents, dir: "agents" },
      { flag: options.copyReferences, dir: "references" },
      { flag: options.copyScripts, dir: "scripts" },
      { flag: options.copyAssets, dir: "assets" },
    ];

    for (const { flag, dir } of copyTargets) {
      if (flag) {
        const srcDir = path.join(sourcePath, dir);
        if (await this.exists(srcDir)) {
          const files = await this.copyDirectory(sourcePath, destPath, dir);
          copiedFiles.push(...files);
        }
        // 存在しない場合はスキップ
      }
    }

    // メタデータ書き込み
    const metadata: SkillForkMetadata = {
      forkedFrom: options.sourceSkill,
      forkedAt: new Date().toISOString(),
      originalDescription: undefined, // SKILL.md から取得して設定
    };
    await this.writeForkMetadata(destPath, metadata);
    copiedFiles.push("fork-metadata.json");

    return {
      success: true,
      newSkillPath: destPath,
      copiedFiles,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    // ロールバック: 作成途中のディレクトリを削除
    await this.rollback(destPath);

    if (error instanceof SkillForkError) {
      throw error;
    }
    throw new SkillForkError(
      "フォーク処理中にエラーが発生しました",
      4002,
      true,
    );
  }
}
```

### 2.3 ロールバック対象と非対象の明確化

| 状態                                   | ロールバック | 理由                                  |
| -------------------------------------- | ------------ | ------------------------------------- |
| バリデーションエラー（1001-1004）      | 不要         | FS操作がまだ開始されていない          |
| mkdir 失敗（4004）                     | 不要         | ディレクトリが作成されていない        |
| SKILL.md 読み取り/書き込み失敗（4001） | 実行         | destPath ディレクトリが作成済み       |
| ディレクトリコピー失敗（4002）         | 実行         | destPath に部分的なファイルが存在する |
| メタデータ書き込み失敗（4003）         | 実行         | destPath に部分的なファイルが存在する |

---

## 3. 異常系パターン別シーケンス

### 3.1 バリデーションエラー（ロールバック不要）

```mermaid
sequenceDiagram
    participant R as Renderer
    participant P as Preload
    participant M as Main Process

    R->>P: forkSkill({ sourceSkill: "", ... })
    P->>M: safeInvoke(SKILL_FORK, args)

    Note over M: P42 3段バリデーション
    M->>M: sourceSkill.trim() === "" を検出

    M-->>P: throw VALIDATION_ERROR
    P-->>R: エラー応答
```

### 3.2 フォーク元不存在エラー（ロールバック不要）

```mermaid
sequenceDiagram
    participant M as Main Process
    participant F as SkillForker
    participant FS as FileSystem

    M->>F: fork(options)
    F->>F: validatePath(sourceSkill) OK
    F->>FS: exists(sourcePath)
    FS-->>F: false

    F-->>M: throw SkillForkError(1001)
    Note over M: sanitizeErrorMessage で<br/>サニタイズ後に返却
    M-->>M: { success: false, error: "..." }
```

### 3.3 同名スキル存在エラー（ロールバック不要）

```mermaid
sequenceDiagram
    participant M as Main Process
    participant F as SkillForker
    participant FS as FileSystem

    M->>F: fork(options)
    F->>F: validatePath OK
    F->>FS: exists(sourcePath)
    FS-->>F: true
    F->>FS: exists(destPath)
    FS-->>F: true

    F-->>M: throw SkillForkError(1002)
    M-->>M: { success: false, error: "..." }
```

### 3.4 パストラバーサル検出（ロールバック不要）

```mermaid
sequenceDiagram
    participant M as Main Process
    participant F as SkillForker

    M->>F: fork({ sourceSkill: "../malicious", ... })
    F->>F: validatePath("../malicious")
    Note over F: path.resolve が skillsDir 外を参照

    F-->>M: throw SkillForkError(1003)
    M-->>M: { success: false, error: "不正なスキル名です" }
```

### 3.5 メタデータ書き込み失敗（ロールバック実行）

```mermaid
sequenceDiagram
    participant F as SkillForker
    participant FS as FileSystem

    Note over F: mkdir, SKILL.md コピー,<br/>サブディレクトリコピー 全て OK

    F->>FS: writeFile(dest/fork-metadata.json)
    FS-->>F: ERROR: ENOSPC (disk full)

    rect rgb(255, 230, 230)
        Note over F,FS: catch: ロールバック実行
        F->>FS: rm(destPath, { recursive: true, force: true })
        FS-->>F: OK
    end

    F-->>F: throw SkillForkError(4003, true)
```

---

## 4. SKILL.md Frontmatter 更新フロー

### 4.1 Frontmatter 更新シーケンス（Mermaid）

```mermaid
sequenceDiagram
    participant F as SkillForker
    participant FM as Frontmatter Parser

    F->>FM: parseFrontmatter(content)
    Note over FM: --- で囲まれた YAML を抽出
    FM-->>F: { frontmatter, body }

    Note over F: name フィールドを更新
    F->>F: frontmatter.name = options.newName

    Note over F: description の更新（指定時のみ）
    alt options.description が指定されている場合
        F->>F: frontmatter.description = options.description
    end

    Note over F: forked-from の追加
    F->>F: frontmatter["forked-from"] = options.sourceSkill

    Note over F: allowed-tools の更新（指定時のみ）
    alt options.modifyAllowedTools が指定されている場合
        F->>F: frontmatter["allowed-tools"] = options.modifyAllowedTools
    end

    F->>FM: serializeFrontmatter(frontmatter, body)
    FM-->>F: updatedContent
```

### 4.2 Frontmatter 更新前後の例

**更新前（フォーク元 SKILL.md）:**

```yaml
---
name: aiworkflow-requirements
description: AIワークフローオーケストレーターの要件定義スキル
allowed-tools:
  - Read
  - Glob
  - Grep
---
# AIWorkflow Requirements Skill

このスキルは...
```

**更新後（フォーク先 SKILL.md）:**

```yaml
---
name: my-custom-skill
description: カスタマイズした要件定義スキル
forked-from: aiworkflow-requirements
allowed-tools:
  - Read
  - Glob
  - Grep
  - Write
  - Bash
---
# AIWorkflow Requirements Skill

このスキルは...
```

---

## 5. ファイルシステム操作のフロー図

### 5.1 ディレクトリ構造の変化（Mermaid）

```mermaid
flowchart LR
    subgraph フォーク前
        A[skills/] --> B[aiworkflow-requirements/]
        B --> C[SKILL.md]
        B --> D[agents/]
        B --> E[references/]
        B --> F[scripts/]
        B --> G[assets/]
    end

    subgraph フォーク後
        H[skills/] --> I[aiworkflow-requirements/<br/>変更なし]
        H --> J[my-custom-skill/<br/>新規作成]
        J --> K[SKILL.md<br/>name/desc/forked-from 更新済み]
        J --> L[agents/<br/>コピー済み]
        J --> M[references/<br/>コピー済み]
        J --> N[fork-metadata.json<br/>新規作成]
    end

    A -.->|フォーク操作| J
```

### 5.2 copyDirectory の再帰コピーフロー

```mermaid
flowchart TD
    A[copyDirectory: src, dest, subDir] --> B{srcDir が存在するか?}
    B -->|はい| C[fs.cp で再帰コピー]
    B -->|いいえ| D[空配列を返す<br/>スキップ]

    C --> E[コピー後のファイル一覧を取得]
    E --> F[相対パス一覧を返す]

    C -->|エラー| G[SkillForkError 4002 をスロー]

    style G fill:#ff6b6b,color:#fff
    style D fill:#ffd43b,color:#333
    style F fill:#51cf66,color:#fff
```

---

## 6. IPC データフロー全体図

```mermaid
flowchart TD
    subgraph Renderer
        UI[ForkSkillDialog]
    end

    subgraph Preload
        API[skill-api.ts<br/>forkSkill]
        CH[channels.ts<br/>SKILL_FORK]
    end

    subgraph Main Process
        IPC[skillHandlers.ts<br/>skill:fork ハンドラ]
        VAL[validateIpcSender]
        P42[P42 3段バリデーション]
        SS[SkillService<br/>forkSkill]
        SF[SkillForker<br/>fork]
        SAN[sanitizeErrorMessage]
    end

    subgraph FileSystem
        FS_R[readFile]
        FS_W[writeFile]
        FS_M[mkdir]
        FS_C[cp]
        FS_D[rm]
    end

    UI -->|forkSkill| API
    API -->|safeInvoke| IPC
    IPC --> VAL
    VAL --> P42
    P42 --> SS
    SS --> SF
    SF --> FS_M
    SF --> FS_R
    SF --> FS_W
    SF --> FS_C
    SF -.->|エラー時| FS_D
    SF -.->|エラー時| SAN

    IPC -->|成功| API
    IPC -->|失敗| SAN
    SAN -->|サニタイズ済み| API
    API --> UI

    style FS_D fill:#ff6b6b,color:#fff
    style SAN fill:#ffd43b,color:#333
```

---

## 7. バリデーション階層フロー

```mermaid
flowchart TD
    A[Renderer からのリクエスト] --> B[Step 1: チャネルホワイトリスト<br/>ALLOWED_INVOKE_CHANNELS]
    B --> C[Step 2: 送信元検証<br/>validateIpcSender]
    C --> D[Step 3: オブジェクト形式検証<br/>typeof args !== 'object']
    D --> E[Step 4: P42 3段バリデーション<br/>型 -> 空文字列 -> trim]
    E --> F[Step 5: パストラバーサル検証<br/>validatePath]
    F --> G[Step 6: ビジネスバリデーション<br/>exists 確認]
    G --> H[フォーク処理実行]

    B -->|拒否| X[エラー返却]
    C -->|拒否| X
    D -->|拒否| X
    E -->|拒否| X
    F -->|拒否| X
    G -->|拒否| X

    style X fill:#ff6b6b,color:#fff
    style H fill:#51cf66,color:#fff
```

---

## 8. 統合ポイント/契約のまとめ

| 統合ポイント                | 送信側                     | 受信側           | 契約                                                                        |
| --------------------------- | -------------------------- | ---------------- | --------------------------------------------------------------------------- |
| Renderer -> Preload         | ForkSkillDialog            | skill-api.ts     | `forkSkill(options: SkillForkOptions): Promise<IpcResult<SkillForkResult>>` |
| Preload -> Main             | skill-api.ts               | skillHandlers.ts | `safeInvoke(IPC_CHANNELS.SKILL_FORK, options)`                              |
| Main -> SkillService        | skillHandlers.ts           | SkillService     | `forkSkill(options: SkillForkOptions): Promise<SkillForkResult>`            |
| SkillService -> SkillForker | SkillService               | SkillForker      | `fork(options: SkillForkOptions): Promise<SkillForkResult>`                 |
| SkillForker -> FileSystem   | SkillForker                | fs/promises      | mkdir, readFile, writeFile, cp, rm                                          |
| エラーハンドリング          | SkillForker / SkillService | skillHandlers.ts | `sanitizeErrorMessage()` -> `{ success: false, error: string }`             |
