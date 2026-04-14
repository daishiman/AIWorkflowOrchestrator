# Phase 2 成果物: 検証アルゴリズム設計書

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| Phase  | 2                                  |
| タスク | タスク2: 検証アルゴリズム設計      |
| 機能名 | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| 作成日 | 2026-04-14                         |

---

## 1. 前処理: コメントストリップ

### 1.1 stripComments(content: string) -> string

全パーサーの前処理として、ソースコードからコメントを除去する。

**アルゴリズム**:

```
入力: TypeScript ソースコード文字列
出力: コメント除去済み文字列

1. ブロックコメント除去:
   content = content.replace(/\/\*[\s\S]*?\*\//g, '')

2. 行コメント除去:
   content = content.replace(/\/\/.*$/gm, '')

3. 戻り値: content
```

**注意事項**:

- 文字列リテラル内の `//` や `/* */` を誤って除去するリスクがあるが、チャネル定義文字列に `//` を含むケースは現行コードベースに存在しないため許容する
- 正確な対応が必要になった場合は Phase 8 のリファクタリングで対応する

---

## 2. パーサーアルゴリズム

### 2.1 parseSharedChannels(content: string) -> Set<string>

**目的**: shared channels.ts から全チャネル値を抽出する

**アルゴリズム**:

```
入力: shared/channels.ts のファイル内容
出力: Set<string> (チャネル値の集合)

1. stripped = stripComments(content)

2. チャネル値パターンの抽出:
   pattern = /["']([a-z][a-z0-9-]*:[a-z][a-z0-9:-]*)["']/g
   channels = Set()

3. for each match in pattern.exec(stripped):
     channels.add(match[1])

4. 戻り値: channels
```

**正規表現の解説**:

- `[a-z][a-z0-9-]*` -- ドメイン部分 (例: `skill`, `skill-creator`)
- `:` -- 区切り文字
- `[a-z][a-z0-9:-]*` -- オペレーション部分 (例: `list`, `get-detail`, `permission:request`)

**抽出例**:

| 入力行                                    | 抽出値                       |
| ----------------------------------------- | ---------------------------- |
| `EXPORT_SESSION: "chat:exportSession",`   | `chat:exportSession`         |
| `= "skill-creator:output-ready" as const` | `skill-creator:output-ready` |
| `SKILL_LIST: "skill:list",`               | `skill:list`                 |

### 2.2 parsePreloadWhitelist(content: string) -> ParsedPreload

**目的**: preload channels.ts からホワイトリストとチャネル定義を抽出する

**アルゴリズム**:

```
入力: preload/channels.ts のファイル内容
出力: { invoke: Set<string>, on: Set<string>, defined: Set<string> }

Phase A: IPC_CHANNELS オブジェクトからチャネルマップ構築

1. stripped = stripComments(content)

2. IPC_CHANNELS ブロックの抽出:
   ipcBlock = extractObjectBlock(stripped, "IPC_CHANNELS")

3. チャネルマップ構築:
   channelMap = Map<string, string>()  // KEY -> "value"
   for each line in ipcBlock:
     match = line.match(/(\w+)\s*:\s*["']([^"']+)["']/)
     if match:
       channelMap.set(match[1], match[2])

4. spread 参照の解決:
   // ...SKILL_CREATOR_SESSION_CHANNELS 等は shared から解決
   // shared パーサー結果を使用してチャネル値を追加

Phase B: ホワイトリスト抽出

5. invoke_block = extractArrayBlock(stripped, "ALLOWED_INVOKE_CHANNELS")
6. on_block = extractArrayBlock(stripped, "ALLOWED_ON_CHANNELS")

7. invoke = Set<string>()
   for each entry in invoke_block:
     // IPC_CHANNELS.XXX パターン
     match = entry.match(/IPC_CHANNELS\.(\w+)/)
     if match && channelMap.has(match[1]):
       invoke.add(channelMap.get(match[1]))
     // 文字列リテラルパターン
     match = entry.match(/["']([^"']+)["']/)
     if match:
       invoke.add(match[1])

8. on = Set<string>()  // 同様のロジック

9. defined = Set(channelMap.values())

10. 戻り値: { invoke, on, defined }
```

**extractObjectBlock() の仕様**:

```
入力: content, objectName
出力: オブジェクト定義のボディ文字列

1. startPattern = new RegExp(`(?:export\\s+)?const\\s+${objectName}\\s*=\\s*\\{`)
2. start = startPattern の位置を検索
3. ブレース深度カウントで対応する } まで抽出
4. 戻り値: { ... } の内容
```

**extractArrayBlock() の仕様**:

```
入力: content, arrayName
出力: 配列定義のボディ文字列

1. startPattern = new RegExp(`(?:export\\s+)?const\\s+${arrayName}[^=]*=\\s*\\[`)
2. start = startPattern の位置を検索
3. ブラケット深度カウントで対応する ] まで抽出
4. 戻り値: [ ... ] の内容
```

### 2.3 parseMainHandlers(dirPath: string) -> Set<string>

**目的**: main/ipc/ 配下の全ハンドラファイルから登録チャネルを抽出する

**アルゴリズム**:

```
入力: main/ipc/ ディレクトリパス
出力: Set<string> (登録チャネル名の集合)

1. files = collectTsFiles(dirPath)
   // *.ts を再帰収集、*.test.ts / *.spec.ts / __tests__/ / __mocks__/ を除外

2. handlers = Set<string>()

3. for each file in files:
     content = readFile(file)
     stripped = stripComments(content)

     // 文字列リテラルパターン
     pattern = /ipcMain\.(?:handle|on)\s*\(\s*["']([^"']+)["']/g
     for each match in pattern.exec(stripped):
       handlers.add(match[1])

     // 定数参照パターン (IPC_CHANNELS.XXX)
     constPattern = /ipcMain\.(?:handle|on)\s*\(\s*([A-Z_]+(?:\.[A-Z_]+)*)/g
     for each match in constPattern.exec(stripped):
       // チャネルマップで解決（解決できない場合は警告）
       resolved = resolveConstRef(match[1], channelMap)
       if resolved:
         handlers.add(resolved)

4. 戻り値: handlers
```

**resolveConstRef() の仕様**:

```
入力: 定数参照文字列 (例: "IPC_CHANNELS.SKILL_LIST"), チャネルマップ
出力: 解決されたチャネル値 (例: "skill:list") または null

1. parts = ref.split(".")
2. key = parts[parts.length - 1]  // 末尾のキー
3. return channelMap.get(key) ?? channelMap.get(ref) ?? null
```

### 2.4 parseRendererUsage(dirPath: string) -> Set<string>

**目的**: preload 配下の safeInvoke/safeOn 呼び出しからチャネルを抽出する

**アルゴリズム**:

```
入力: preload/ ディレクトリパス
出力: Set<string> (使用チャネル名の集合)

1. files = collectTsFiles(dirPath)
   // *.ts を再帰収集、__tests__/ を除外

2. channels = Set<string>()

3. for each file in files:
     content = readFile(file)
     stripped = stripComments(content)

     // safeInvoke/safeOn パターン
     pattern = /safe(?:Invoke|On)(?:<[^>]*>)?\s*\(\s*(?:["']([^"']+)["']|IPC_CHANNELS\.(\w+))/g
     for each match in pattern.exec(stripped):
       if match[1]:  // 文字列リテラル
         channels.add(match[1])
       if match[2]:  // IPC_CHANNELS.XXX
         resolved = channelMap.get(match[2])
         if resolved:
           channels.add(resolved)

4. 戻り値: channels
```

---

## 3. バリデーションアルゴリズム

### 3.1 validateSharedToPreload (Rule-1)

```
入力:
  shared: Set<string>        -- shared で定義されたチャネル
  preload: ParsedPreload     -- preload のホワイトリスト

アルゴリズム:
  preloadAll = preload.invoke ∪ preload.on
  missing = []
  for each ch in shared:
    if ch not in preloadAll:
      missing.push(ch)

出力:
  {
    rule: "Rule-1",
    status: missing.length === 0 ? "pass" : "fail",
    missing: missing,
    description: "shared で定義されたチャネルが preload ホワイトリストに未登録"
  }
```

### 3.2 validatePreloadToMain (Rule-2)

```
入力:
  preload: ParsedPreload     -- preload のホワイトリスト
  main: Set<string>          -- main で登録されたハンドラ

アルゴリズム:
  missing = []
  for each ch in preload.invoke:
    if ch not in main:
      missing.push(ch)

出力:
  {
    rule: "Rule-2",
    status: missing.length === 0 ? "pass" : "fail",
    missing: missing,
    description: "preload invoke ホワイトリストのチャネルが main ハンドラに未実装"
  }
```

### 3.3 validateRendererToShared (Rule-3)

```
入力:
  renderer: Set<string>      -- renderer (preload) で使用されたチャネル
  shared: Set<string>        -- shared で定義されたチャネル
  preload: ParsedPreload     -- preload の定義

アルゴリズム:
  knownChannels = shared ∪ preload.defined
  missing = []
  for each ch in renderer:
    if ch not in knownChannels:
      missing.push(ch)

出力:
  {
    rule: "Rule-3",
    status: missing.length === 0 ? "pass" : "fail",
    missing: missing,
    description: "renderer で使用されたチャネルが shared/preload に未定義"
  }
```

---

## 4. チャネルマップ構築アルゴリズム

preload の `IPC_CHANNELS` には shared からのスプレッド (`...SKILL_CREATOR_SESSION_CHANNELS`) と直接定義が混在する。これを解決するために、2パスのチャネルマップ構築を行う。

### 4.1 第1パス: 直接定義の抽出

```
preload IPC_CHANNELS オブジェクト内:
  KEY: "value" パターン → channelMap[KEY] = "value"
```

### 4.2 第2パス: shared 解決

```
shared パーサーの結果 (Set<string>) を使用:
  spread 参照 (...XXX_CHANNELS) → shared 内の該当グループの全値を channelMap に追加

APPROVAL_CHANNELS.APPROVAL_RESPOND 形式の参照:
  shared の APPROVAL_CHANNELS から APPROVAL_RESPOND の値を解決
```

### 4.3 統合チャネルマップ

```javascript
function buildChannelMap(sharedContent, preloadContent) {
  // shared からグループ別チャネルマップを構築
  const sharedGroups = parseSharedGroups(sharedContent);
  // 例: { APPROVAL_CHANNELS: { APPROVAL_RESPOND: "approval:respond", ... }, ... }

  // preload の IPC_CHANNELS から直接定義を抽出
  const preloadDirect = parseDirectDefinitions(preloadContent);
  // 例: { ANALYTICS_SEND: "analytics:send", FILE_GET_TREE: "file:get-tree", ... }

  // 統合
  const map = new Map();
  for (const [key, value] of Object.entries(preloadDirect)) {
    map.set(key, value);
  }
  for (const [groupName, group] of Object.entries(sharedGroups)) {
    for (const [key, value] of Object.entries(group)) {
      if (!map.has(key)) {
        map.set(key, value);
      }
    }
  }
  return map;
}
```

---

## 5. ファイル走査アルゴリズム

### 5.1 collectTsFiles(dirPath: string) -> string[]

```
入力: ディレクトリパス
出力: TypeScript ファイルパスの配列

1. entries = fs.readdirSync(dirPath, { withFileTypes: true })
2. results = []
3. for each entry in entries:
     if entry.isDirectory():
       if entry.name not in ["__tests__", "__mocks__", "node_modules"]:
         results.push(...collectTsFiles(entry.path))
     elif entry.isFile():
       if entry.name.endsWith(".ts") or entry.name.endsWith(".tsx"):
         if not entry.name.endsWith(".test.ts")
            and not entry.name.endsWith(".test.tsx")
            and not entry.name.endsWith(".spec.ts")
            and not entry.name.endsWith(".d.ts"):
           results.push(entry.path)
4. 戻り値: results
```

---

## 6. エッジケース対応

| ケース                               | 対応方針                                                 |
| ------------------------------------ | -------------------------------------------------------- |
| 複数行にまたがるチャネル定義         | 正規表現は単一行マッチ; 値は必ず同一行にあるため問題なし |
| テンプレートリテラル `` `channel` `` | 現行コードに存在しないため非対応                         |
| 動的チャネル名 `\`${prefix}:${op}\`` | 現行コードに存在しないため非対応                         |
| import 経由の定数参照                | shared -> preload の import は既知パターンで解決         |
| re-export チェーン                   | 現行は1段階のみ; 深い re-export は非対応                 |
| 空の shared channels.ts              | 0チャネルとして処理; 全ルールが pass                     |
| main handler が0件                   | Rule-2 で preload invoke 全件が missing 扱い             |

---

## 7. 計算量分析

| 処理                  | 計算量                            | 実測予想                   |
| --------------------- | --------------------------------- | -------------------------- |
| parseSharedChannels   | O(n) n=行数                       | < 1ms (235行)              |
| parsePreloadWhitelist | O(n) n=行数                       | < 5ms (783行)              |
| parseMainHandlers     | O(f \* n) f=ファイル数 n=平均行数 | < 50ms (55ファイル, 22k行) |
| parseRendererUsage    | O(f \* n)                         | < 10ms (19ファイル)        |
| validate (3ルール)    | O(m) m=チャネル数                 | < 1ms                      |
| formatReport          | O(r) r=結果数                     | < 1ms                      |
| **合計**              |                                   | **< 100ms**                |

NFR-1 の 30 秒制限に対して十分な余裕がある。
