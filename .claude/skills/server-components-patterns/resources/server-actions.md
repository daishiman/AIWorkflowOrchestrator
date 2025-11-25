# Server Actions

## 基本概念

Server Actionsは、サーバーで実行される非同期関数です。フォーム送信やミューテーションを
クライアントコードを書かずに処理できます。

## 基本的な使い方

### 単独ファイルでの定義

```typescript
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  await db.post.create({
    data: { title, content },
  })

  revalidatePath('/posts')
  redirect('/posts')
}
```

### インラインでの定義

```typescript
// app/posts/new/page.tsx
export default function NewPostPage() {
  async function createPost(formData: FormData) {
    'use server'

    const title = formData.get('title') as string
    await db.post.create({ data: { title } })
    revalidatePath('/posts')
  }

  return (
    <form action={createPost}>
      <input name="title" required />
      <button type="submit">Create</button>
    </form>
  )
}
```

## フォーム処理

### 基本フォーム

```typescript
// components/create-post-form.tsx
import { createPost } from '@/app/actions'

export function CreatePostForm() {
  return (
    <form action={createPost}>
      <label htmlFor="title">Title</label>
      <input id="title" name="title" required />

      <label htmlFor="content">Content</label>
      <textarea id="content" name="content" required />

      <button type="submit">Create Post</button>
    </form>
  )
}
```

### useFormState によるステート管理

```typescript
// app/actions.ts
'use server'

type State = {
  message: string
  errors?: {
    title?: string[]
    content?: string[]
  }
}

export async function createPost(
  prevState: State,
  formData: FormData
): Promise<State> {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  // バリデーション
  const errors: State['errors'] = {}
  if (!title || title.length < 3) {
    errors.title = ['Title must be at least 3 characters']
  }
  if (!content || content.length < 10) {
    errors.content = ['Content must be at least 10 characters']
  }

  if (Object.keys(errors).length > 0) {
    return { message: 'Validation failed', errors }
  }

  await db.post.create({ data: { title, content } })
  revalidatePath('/posts')

  return { message: 'Post created successfully' }
}
```

```typescript
// components/create-post-form.tsx
'use client'

import { useFormState } from 'react-dom'
import { createPost } from '@/app/actions'

const initialState = { message: '', errors: {} }

export function CreatePostForm() {
  const [state, formAction] = useFormState(createPost, initialState)

  return (
    <form action={formAction}>
      <div>
        <input name="title" />
        {state.errors?.title && (
          <p className="text-red-500">{state.errors.title[0]}</p>
        )}
      </div>

      <div>
        <textarea name="content" />
        {state.errors?.content && (
          <p className="text-red-500">{state.errors.content[0]}</p>
        )}
      </div>

      <SubmitButton />

      {state.message && <p>{state.message}</p>}
    </form>
  )
}
```

### useFormStatus によるローディング状態

```typescript
// components/submit-button.tsx
'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create Post'}
    </button>
  )
}
```

## 楽観的更新

### useOptimistic の使用

```typescript
// components/like-button.tsx
'use client'

import { useOptimistic } from 'react'
import { likePost } from '@/app/actions'

export function LikeButton({ postId, likes }: { postId: string; likes: number }) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    likes,
    (state, _) => state + 1
  )

  async function handleLike() {
    addOptimisticLike(null) // 即座にUIを更新
    await likePost(postId)  // サーバーで処理
  }

  return (
    <form action={handleLike}>
      <button type="submit">
        ❤️ {optimisticLikes}
      </button>
    </form>
  )
}
```

### リストの楽観的更新

```typescript
// components/todo-list.tsx
'use client'

import { useOptimistic } from 'react'
import { addTodo, deleteTodo } from '@/app/actions'

type Todo = { id: string; text: string; pending?: boolean }

export function TodoList({ todos }: { todos: Todo[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, action: { type: 'add' | 'delete'; todo?: Todo; id?: string }) => {
      switch (action.type) {
        case 'add':
          return [...state, { ...action.todo!, pending: true }]
        case 'delete':
          return state.filter((t) => t.id !== action.id)
        default:
          return state
      }
    }
  )

  async function handleAdd(formData: FormData) {
    const text = formData.get('text') as string
    const tempId = `temp-${Date.now()}`

    addOptimisticTodo({ type: 'add', todo: { id: tempId, text } })
    await addTodo(text)
  }

  async function handleDelete(id: string) {
    addOptimisticTodo({ type: 'delete', id })
    await deleteTodo(id)
  }

  return (
    <div>
      <form action={handleAdd}>
        <input name="text" required />
        <button type="submit">Add</button>
      </form>

      <ul>
        {optimisticTodos.map((todo) => (
          <li key={todo.id} className={todo.pending ? 'opacity-50' : ''}>
            {todo.text}
            <button onClick={() => handleDelete(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## エラーハンドリング

### try-catch パターン

```typescript
// app/actions.ts
'use server'

export async function createPost(formData: FormData) {
  try {
    const title = formData.get('title') as string

    await db.post.create({ data: { title } })
    revalidatePath('/posts')

    return { success: true }
  } catch (error) {
    console.error('Failed to create post:', error)
    return { success: false, error: 'Failed to create post' }
  }
}
```

### バリデーション with Zod

```typescript
// app/actions.ts
'use server'

import { z } from 'zod'

const PostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
})

export async function createPost(formData: FormData) {
  const validatedFields = PostSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  })

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { title, content } = validatedFields.data

  await db.post.create({ data: { title, content } })
  revalidatePath('/posts')

  return { success: true }
}
```

## セキュリティ考慮事項

### 認証チェック

```typescript
'use server'

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // 認証済みユーザーのみ実行可能
  const title = formData.get('title') as string

  await db.post.create({
    data: {
      title,
      authorId: session.user.id,
    },
  })

  revalidatePath('/posts')
}
```

### 認可チェック

```typescript
'use server'

export async function deletePost(postId: string) {
  const session = await auth()

  if (!session) {
    throw new Error('Unauthorized')
  }

  const post = await db.post.findUnique({ where: { id: postId } })

  // 投稿の所有者のみ削除可能
  if (post?.authorId !== session.user.id) {
    throw new Error('Forbidden')
  }

  await db.post.delete({ where: { id: postId } })
  revalidatePath('/posts')
}
```

## チェックリスト

### Server Action 実装時

- [ ] 'use server' ディレクティブが設定されている
- [ ] 入力値のバリデーションを行っている
- [ ] 適切なエラーハンドリングがある
- [ ] 認証・認可チェックを行っている
- [ ] revalidatePath/revalidateTagで適切に再検証している

### フォーム実装時

- [ ] useFormStateでステート管理している
- [ ] useFormStatusでローディング状態を表示
- [ ] エラーメッセージをユーザーに表示
- [ ] 楽観的更新が必要な場合はuseOptimisticを使用
