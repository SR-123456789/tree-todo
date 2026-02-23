1. 目的

無限階層（tree構造）でタスクを管理できる個人向けToDoアプリを提供する。

思考の分解

構造化

実行タスクの明確化

MVPはローカル完結。
将来的にバックエンド移行可能な設計にする。

2. 想定ユーザー

学生（研究・就活・課題管理）

個人開発者

構造思考型ユーザー

チーム機能は実装しない。

3. システム構成
   3.1 フロントエンド

Next.js (App Router)

TypeScript

Zustand（状態管理）

TailwindCSS

dnd-kit（ドラッグ操作）

3.2 データ保存

MVP：

localStorage

将来：

Repository層を差し替えるだけで

Supabase

Firebase

REST API
へ移行可能

4. ページ構成
   4.1 ルートページ /
   目的

プロジェクト一覧表示

機能

プロジェクト作成

編集

削除

未完了タスク数表示

/project/[id] に遷移

4.2 ツリーページ /project/[id]
目的

プロジェクト内タスクを無限階層表示

機能

タスク作成

サブタスク作成

編集

削除

完了チェック

ドラッグ移動（階層変更可）

展開・折りたたみ

5. データモデル
   5.1 Project
   export interface Project {
   id: string
   title: string
   createdAt: string
   updatedAt: string
   }
   5.2 Task
   export interface Task {
   id: string
   projectId: string
   parentId: string | null
   title: string
   isCompleted: boolean
   order: number
   isExpanded: boolean
   createdAt: string
   updatedAt: string
   }
6. Repository設計（重要）

将来バックエンド移行するための抽象層。

6.1 インターフェース
export interface ProjectRepository {
getAll(): Promise<Project[]>
create(title: string): Promise<Project>
update(id: string, title: string): Promise<void>
delete(id: string): Promise<void>
}

export interface TaskRepository {
getByProject(projectId: string): Promise<Task[]>
create(task: Task): Promise<Task>
update(task: Task): Promise<void>
delete(id: string): Promise<void>
}
6.2 LocalStorage実装
class LocalProjectRepository implements ProjectRepository {
...
}

class LocalTaskRepository implements TaskRepository {
...
}

将来：

class SupabaseProjectRepository implements ProjectRepository {
...
}

に差し替えるだけ。

UI層はRepositoryしか知らない設計にする。

7. 状態管理設計（Zustand）
   interface AppState {
   projects: Project[]
   tasks: Task[]

loadProjects: () => Promise<void>
loadTasks: (projectId: string) => Promise<void>

addProject: (title: string) => Promise<void>
addTask: (projectId: string, parentId: string | null) => Promise<void>

updateTask: (task: Task) => Promise<void>
moveTask: (taskId: string, newParentId: string | null) => Promise<void>
deleteTask: (taskId: string) => Promise<void>
} 8. ツリー構築ロジック

フラット配列をツリーに変換する関数を実装。

function buildTree(tasks: Task[]): TreeNode[]

TreeNode:

interface TreeNode {
task: Task
children: TreeNode[]
} 9. 非機能要件

キーボード操作対応

1000タスクでも動作

ダークモード対応

レスポンシブ

10. 完成定義（Definition of Done）

プロジェクト作成可能

無限階層タスク作成可能

ドラッグで階層移動可能

リロードしても保持される

Repository差し替え可能

11. 今回やらないこと

認証

チーム共有

AI分解

通知

ガントチャート

12. ディレクトリ構成案
    /app
    /project/[id]/page.tsx
    page.tsx

/domain
project.ts
task.ts

/repositories
project.repository.ts
task.repository.ts
local/

/store
useAppStore.ts

/utils
buildTree.ts 13. 将来拡張

AIタスク分解

依存関係管理

プロジェクト共有リンク

Supabase移行
