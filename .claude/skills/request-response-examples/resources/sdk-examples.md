# 言語別SDKサンプル作成ガイド

## 対応言語一覧

| 言語 | HTTPライブラリ | 優先度 |
|------|--------------|--------|
| JavaScript/TypeScript | fetch, axios | 高 |
| Python | requests, httpx | 高 |
| Go | net/http | 中 |
| Ruby | net/http, faraday | 中 |
| Java | HttpClient, OkHttp | 中 |
| PHP | Guzzle | 中 |
| C# | HttpClient | 低 |
| Shell | curl | 高 |

---

## JavaScript / TypeScript

### fetch API（ブラウザ・Node.js 18+）

```typescript
// 基本的なGETリクエスト
const response = await fetch('https://api.example.com/v1/users', {
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

if (!response.ok) {
  const error = await response.json();
  throw new Error(error.detail);
}

const users = await response.json();
```

```typescript
// POSTリクエスト
const response = await fetch('https://api.example.com/v1/users', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: '山田太郎',
    email: 'yamada@example.com'
  })
});

const newUser = await response.json();
console.log(`Created user: ${newUser.id}`);
```

### axios

```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.example.com/v1',
  headers: {
    'Authorization': `Bearer ${API_KEY}`
  }
});

// GETリクエスト
const { data: users } = await client.get('/users', {
  params: { limit: 10, status: 'active' }
});

// POSTリクエスト
const { data: newUser } = await client.post('/users', {
  name: '山田太郎',
  email: 'yamada@example.com'
});

// エラーハンドリング
try {
  await client.get('/users/invalid');
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error(error.response?.data.detail);
  }
}
```

### 型付きクライアント

```typescript
// types.ts
interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

// client.ts
class APIClient {
  private baseURL: string;
  private apiKey: string;

  constructor(apiKey: string) {
    this.baseURL = 'https://api.example.com/v1';
    this.apiKey = apiKey;
  }

  async getUsers(limit = 20): Promise<PaginatedResponse<User>> {
    const response = await fetch(
      `${this.baseURL}/users?limit=${limit}`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );
    return response.json();
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await fetch(`${this.baseURL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

// 使用例
const client = new APIClient('your_api_key');
const users = await client.getUsers(10);
```

---

## Python

### requests

```python
import requests

API_BASE = 'https://api.example.com/v1'
API_KEY = 'your_api_key'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# GETリクエスト
response = requests.get(
    f'{API_BASE}/users',
    headers=headers,
    params={'limit': 10, 'status': 'active'}
)
response.raise_for_status()
users = response.json()

# POSTリクエスト
response = requests.post(
    f'{API_BASE}/users',
    headers=headers,
    json={
        'name': '山田太郎',
        'email': 'yamada@example.com'
    }
)
response.raise_for_status()
new_user = response.json()
print(f"Created user: {new_user['id']}")

# エラーハンドリング
try:
    response = requests.get(f'{API_BASE}/users/invalid', headers=headers)
    response.raise_for_status()
except requests.HTTPError as e:
    error = e.response.json()
    print(f"Error: {error['detail']}")
```

### httpx（非同期対応）

```python
import httpx

async def main():
    async with httpx.AsyncClient(
        base_url='https://api.example.com/v1',
        headers={'Authorization': f'Bearer {API_KEY}'}
    ) as client:
        # GETリクエスト
        response = await client.get('/users', params={'limit': 10})
        users = response.json()

        # POSTリクエスト
        response = await client.post('/users', json={
            'name': '山田太郎',
            'email': 'yamada@example.com'
        })
        new_user = response.json()

# asyncio.run(main())
```

### 型ヒント付きクライアント

```python
from dataclasses import dataclass
from typing import List, Optional
import requests

@dataclass
class User:
    id: str
    name: str
    email: str
    created_at: str

@dataclass
class PaginatedUsers:
    data: List[User]
    total: int
    has_more: bool

class APIClient:
    def __init__(self, api_key: str):
        self.base_url = 'https://api.example.com/v1'
        self.session = requests.Session()
        self.session.headers['Authorization'] = f'Bearer {api_key}'

    def get_users(self, limit: int = 20) -> PaginatedUsers:
        response = self.session.get(
            f'{self.base_url}/users',
            params={'limit': limit}
        )
        response.raise_for_status()
        data = response.json()
        return PaginatedUsers(
            data=[User(**u) for u in data['data']],
            total=data['pagination']['total'],
            has_more=data['pagination']['has_more']
        )

    def create_user(self, name: str, email: str) -> User:
        response = self.session.post(
            f'{self.base_url}/users',
            json={'name': name, 'email': email}
        )
        response.raise_for_status()
        return User(**response.json())

# 使用例
client = APIClient('your_api_key')
users = client.get_users(10)
```

---

## Go

### net/http

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
)

const (
    baseURL = "https://api.example.com/v1"
    apiKey  = "your_api_key"
)

type User struct {
    ID        string `json:"id"`
    Name      string `json:"name"`
    Email     string `json:"email"`
    CreatedAt string `json:"created_at"`
}

type CreateUserRequest struct {
    Name  string `json:"name"`
    Email string `json:"email"`
}

func getUsers() ([]User, error) {
    req, err := http.NewRequest("GET", baseURL+"/users", nil)
    if err != nil {
        return nil, err
    }
    req.Header.Set("Authorization", "Bearer "+apiKey)

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var result struct {
        Data []User `json:"data"`
    }
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return nil, err
    }

    return result.Data, nil
}

func createUser(name, email string) (*User, error) {
    body, _ := json.Marshal(CreateUserRequest{
        Name:  name,
        Email: email,
    })

    req, err := http.NewRequest("POST", baseURL+"/users", bytes.NewReader(body))
    if err != nil {
        return nil, err
    }
    req.Header.Set("Authorization", "Bearer "+apiKey)
    req.Header.Set("Content-Type", "application/json")

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    var user User
    if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
        return nil, err
    }

    return &user, nil
}

func main() {
    users, _ := getUsers()
    fmt.Printf("Found %d users\n", len(users))

    newUser, _ := createUser("山田太郎", "yamada@example.com")
    fmt.Printf("Created user: %s\n", newUser.ID)
}
```

---

## Shell (curl)

### 基本操作

```bash
#!/bin/bash

API_BASE="https://api.example.com/v1"
API_KEY="your_api_key"

# GETリクエスト
curl -s -X GET "${API_BASE}/users" \
  -H "Authorization: Bearer ${API_KEY}" \
  | jq '.data'

# POSTリクエスト
curl -s -X POST "${API_BASE}/users" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "山田太郎",
    "email": "yamada@example.com"
  }' | jq '.'

# PUTリクエスト
curl -s -X PUT "${API_BASE}/users/usr_abc123" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"name": "山田次郎"}' \
  | jq '.'

# DELETEリクエスト
curl -s -X DELETE "${API_BASE}/users/usr_abc123" \
  -H "Authorization: Bearer ${API_KEY}" \
  -w "\nStatus: %{http_code}\n"
```

### エラーハンドリング付き

```bash
#!/bin/bash

response=$(curl -s -w "\n%{http_code}" -X GET "${API_BASE}/users/invalid" \
  -H "Authorization: Bearer ${API_KEY}")

body=$(echo "$response" | head -n -1)
status=$(echo "$response" | tail -n 1)

if [ "$status" -ge 400 ]; then
  echo "Error: $(echo "$body" | jq -r '.detail')"
  exit 1
fi

echo "$body" | jq '.'
```

---

## コードスニペットのフォーマット

### タブ切り替え形式（ドキュメント用）

```markdown
{{< tabs >}}

{{< tab "cURL" >}}
```bash
curl -X GET "https://api.example.com/v1/users" \
  -H "Authorization: Bearer YOUR_API_KEY"
```
{{< /tab >}}

{{< tab "JavaScript" >}}
```javascript
const response = await fetch('https://api.example.com/v1/users', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
});
```
{{< /tab >}}

{{< tab "Python" >}}
```python
response = requests.get(
    'https://api.example.com/v1/users',
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)
```
{{< /tab >}}

{{< /tabs >}}
```

---

## チェックリスト

### SDKサンプル品質
- [ ] 言語の慣用的なスタイル
- [ ] エラーハンドリングを含む
- [ ] 型定義がある（該当する場合）
- [ ] 実行可能なコード
- [ ] 依存関係が明記されている
