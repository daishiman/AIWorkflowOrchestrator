# 依存関係図

## 1. 現状の依存関係

### 全体依存関係図

```mermaid
graph TD
    subgraph "UI Layer (未確認)"
        UI[React Components]
    end

    subgraph "Application Layer"
        SVC[ChatHistoryService<br/>chat-history-service.ts]
    end

    subgraph "Types Layer (問題: ドメイン不在)"
        TS[ChatSession<br/>types/chat-session.ts]
        TM[ChatMessage<br/>types/chat-message.ts]
        TL[LlmMetadata<br/>types/llm-metadata.ts]
    end

    subgraph "Repository Layer (問題: インフラ依存)"
        RSE[ChatSessionRepository<br/>repositories/chat-session-repository.ts]
        RME[ChatMessageRepository<br/>repositories/chat-message-repository.ts]
    end

    subgraph "Infrastructure Layer"
        DRZ[Drizzle ORM<br/>drizzle-orm]
        SQL[better-sqlite3]
        SCH[chat-history.ts<br/>db/schema/]
    end

    subgraph "Database"
        DB[(SQLite)]
    end

    UI -->|直接import| SVC
    SVC --> TS
    SVC --> TM
    SVC --> TL
    SVC --> RSE
    SVC --> RME

    RSE -->|"❌ 直接依存"| DRZ
    RSE -->|"❌ 直接依存"| SQL
    RSE --> TS

    RME -->|"❌ 直接依存"| DRZ
    RME -->|"❌ 直接依存"| SQL
    RME --> TM

    DRZ --> DB
    SQL --> DB
    SCH --> DRZ

    classDef problem fill:#ff6b6b,stroke:#333,color:#fff
    classDef warning fill:#ffd93d,stroke:#333,color:#000
    classDef ok fill:#6bcb77,stroke:#333,color:#fff

    class RSE,RME problem
    class SVC,TS,TM warning
    class DB,SCH ok
```

### 違反している依存方向

```mermaid
graph LR
    subgraph "Clean Architecture層"
        D[Domain Layer]
        A[Application Layer]
        I[Infrastructure Layer]
    end

    D -.->|"✅ 許可"| D
    A -->|"✅ 許可"| D
    I -->|"✅ 許可"| D
    I -->|"✅ 許可"| A

    subgraph "現状の違反"
        V1[Repository<br/>Application層?]
        V2[Drizzle ORM<br/>Infrastructure層]
    end

    V1 -->|"❌ 違反"| V2

    style V1 fill:#ff6b6b,stroke:#333,color:#fff
    style V2 fill:#ffd93d,stroke:#333,color:#000
```

---

## 2. ファイル間依存関係

### ChatHistoryService の依存

```mermaid
graph TD
    subgraph "chat-history-service.ts"
        CHS[ChatHistoryService]
    end

    subgraph "依存先"
        CRYPTO[crypto.randomUUID]
        RSE[ChatSessionRepository]
        RME[ChatMessageRepository]
        TS[ChatSession型]
        TM[ChatMessage型]
        TL[LlmMetadata型]
        DF[DateFormatter]
        CONST[constants]
    end

    CHS --> CRYPTO
    CHS --> RSE
    CHS --> RME
    CHS --> TS
    CHS --> TM
    CHS --> TL
    CHS --> DF
    CHS --> CONST
```

### ChatSessionRepository の依存

```mermaid
graph TD
    subgraph "chat-session-repository.ts"
        RSE[ChatSessionRepository]
    end

    subgraph "問題: Infrastructure依存"
        SQL_DRZ["sql (drizzle-orm)"]
        BSQ_TYPE["BetterSQLite3Database"]
        BSQ["better-sqlite3"]
    end

    subgraph "Types依存"
        TS[ChatSession]
        TSQ[ChatSessionSearchQuery]
        TU[UpdateChatSession]
    end

    RSE -->|"❌ Critical"| SQL_DRZ
    RSE -->|"❌ Critical"| BSQ_TYPE
    RSE -->|"❌ Critical"| BSQ
    RSE --> TS
    RSE --> TSQ
    RSE --> TU

    style SQL_DRZ fill:#ff6b6b,stroke:#333,color:#fff
    style BSQ_TYPE fill:#ff6b6b,stroke:#333,color:#fff
    style BSQ fill:#ff6b6b,stroke:#333,color:#fff
```

### ChatMessageRepository の依存

```mermaid
graph TD
    subgraph "chat-message-repository.ts"
        RME[ChatMessageRepository]
    end

    subgraph "問題: Infrastructure依存"
        SQL_DRZ["sql (drizzle-orm)"]
        BSQ_TYPE["BetterSQLite3Database"]
        BSQ["better-sqlite3"]
    end

    subgraph "Types依存"
        TM[ChatMessage]
        TMR[MessageRole]
        TMU[UpdateChatMessage]
        TMO[FindMessagesOptions]
    end

    RME -->|"❌ Critical"| SQL_DRZ
    RME -->|"❌ Critical"| BSQ_TYPE
    RME -->|"❌ Critical"| BSQ
    RME --> TM
    RME --> TMR
    RME --> TMU
    RME --> TMO

    style SQL_DRZ fill:#ff6b6b,stroke:#333,color:#fff
    style BSQ_TYPE fill:#ff6b6b,stroke:#333,color:#fff
    style BSQ fill:#ff6b6b,stroke:#333,color:#fff
```

---

## 3. Clean Architecture準拠後の依存関係（目標）

```mermaid
graph TD
    subgraph "Presentation Layer"
        UI[React Components]
        CTX[ChatHistoryContext]
        HOOK[useChatHistory Hook]
    end

    subgraph "Application Layer"
        UC1[CreateChatSessionUseCase]
        UC2[AddMessageUseCase]
        UC3[SearchSessionsUseCase]
        UC4[ExportSessionUseCase]
        DTO[DTOs]
    end

    subgraph "Domain Layer"
        ENT_S[ChatSession Entity]
        ENT_M[ChatMessage Entity]
        VO1[ChatSessionId]
        VO2[MessageContent]
        REPO_I1[IChatSessionRepository]
        REPO_I2[IChatMessageRepository]
        RESULT[Result Type]
    end

    subgraph "Infrastructure Layer"
        REPO1[DrizzleChatSessionRepository]
        REPO2[DrizzleChatMessageRepository]
        MAPPER1[ChatSessionMapper]
        MAPPER2[ChatMessageMapper]
    end

    subgraph "Database Layer"
        SCH[Drizzle Schema]
        DB[(SQLite)]
    end

    UI --> CTX
    CTX --> HOOK
    HOOK --> UC1
    HOOK --> UC2
    HOOK --> UC3
    HOOK --> UC4

    UC1 --> ENT_S
    UC1 --> REPO_I1
    UC1 --> DTO
    UC1 --> RESULT

    UC2 --> ENT_M
    UC2 --> REPO_I2
    UC2 --> DTO
    UC2 --> RESULT

    UC3 --> REPO_I1
    UC3 --> DTO
    UC3 --> RESULT

    UC4 --> REPO_I1
    UC4 --> REPO_I2
    UC4 --> DTO
    UC4 --> RESULT

    ENT_S --> VO1
    ENT_M --> VO2

    REPO1 -.->|implements| REPO_I1
    REPO2 -.->|implements| REPO_I2

    REPO1 --> MAPPER1
    REPO2 --> MAPPER2
    REPO1 --> ENT_S
    REPO2 --> ENT_M

    MAPPER1 --> SCH
    MAPPER2 --> SCH

    SCH --> DB

    classDef domain fill:#4ecdc4,stroke:#333,color:#fff
    classDef app fill:#45b7d1,stroke:#333,color:#fff
    classDef infra fill:#96ceb4,stroke:#333,color:#fff
    classDef ui fill:#dfe6e9,stroke:#333,color:#000

    class ENT_S,ENT_M,VO1,VO2,REPO_I1,REPO_I2,RESULT domain
    class UC1,UC2,UC3,UC4,DTO app
    class REPO1,REPO2,MAPPER1,MAPPER2 infra
    class UI,CTX,HOOK ui
```

---

## 4. 依存ルール

### Clean Architecture 依存ルール

| From Layer     | To Domain | To Application | To Infrastructure | To Presentation |
| -------------- | --------- | -------------- | ----------------- | --------------- |
| Domain         | ✅        | ❌             | ❌                | ❌              |
| Application    | ✅        | ✅             | ❌                | ❌              |
| Infrastructure | ✅        | ✅             | ✅                | ❌              |
| Presentation   | ❌        | ✅             | ❌                | ✅              |

### 現状の違反箇所

| From                  | To          | 違反ルール                  |
| --------------------- | ----------- | --------------------------- |
| ChatSessionRepository | drizzle-orm | Repository → Infrastructure |
| ChatMessageRepository | drizzle-orm | Repository → Infrastructure |

---

## 5. 型の依存関係

### 現状の型依存（3重複問題）

```mermaid
graph TD
    subgraph "types/ (Application型)"
        T1[ChatSession interface]
        T2[ChatMessage interface]
    end

    subgraph "db/schema/ (Persistence型)"
        S1[chatSessions table]
        S2[ChatSessionRecord]
        S3[chatMessages table]
        S4[ChatMessageRecord]
    end

    subgraph "Repository (暗黙的変換)"
        R1[mapRowToSession]
        R2[mapRowToMessage]
    end

    T1 -.->|"概念重複"| S2
    T2 -.->|"概念重複"| S4
    R1 -->|"変換"| T1
    R2 -->|"変換"| T2

    style T1 fill:#ffd93d,stroke:#333,color:#000
    style T2 fill:#ffd93d,stroke:#333,color:#000
    style S2 fill:#ffd93d,stroke:#333,color:#000
    style S4 fill:#ffd93d,stroke:#333,color:#000
```

### 目標の型依存（3層分離）

```mermaid
graph TD
    subgraph "Domain Layer"
        D1[ChatSession Entity<br/>ビジネスロジック含む]
        D2[ChatMessage Entity<br/>ビジネスロジック含む]
    end

    subgraph "Application Layer"
        A1[ChatSessionDTO<br/>データ転送用]
        A2[ChatMessageDTO<br/>データ転送用]
    end

    subgraph "Infrastructure Layer"
        I1[ChatSessionRecord<br/>DB固有]
        I2[ChatMessageRecord<br/>DB固有]
        M1[ChatSessionMapper]
        M2[ChatMessageMapper]
    end

    M1 -->|"toEntity"| D1
    M1 -->|"toDTO"| A1
    M1 -->|"toPersistence"| I1

    M2 -->|"toEntity"| D2
    M2 -->|"toDTO"| A2
    M2 -->|"toPersistence"| I2

    D1 -.->|"独立"| D1
    D2 -.->|"独立"| D2

    classDef domain fill:#4ecdc4,stroke:#333,color:#fff
    classDef app fill:#45b7d1,stroke:#333,color:#fff
    classDef infra fill:#96ceb4,stroke:#333,color:#fff

    class D1,D2 domain
    class A1,A2 app
    class I1,I2,M1,M2 infra
```

---

## 6. まとめ

### 現状の問題点

1. **Repository → Infrastructure 直接依存** (Critical)
2. **Domain層の不在** - 型定義のみで貧血モデル
3. **型定義の重複** - types/, schema/ で同じ概念が重複
4. **UI → Service 直接依存** - DIパターン未導入

### 修正後の改善点

1. **依存性逆転** - Repository InterfaceをDomain層に配置
2. **Rich Domain Model** - エンティティにビジネスロジックを集約
3. **型の3層分離** - Domain/DTO/Persistence型を明確に分離
4. **DIパターン** - React ContextでUI層の結合度を下げる
