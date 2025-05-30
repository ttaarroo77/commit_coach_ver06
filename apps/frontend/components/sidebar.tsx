// apps/frontend/components/sidebar.tsx


"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Folder, LogOut, User } from "lucide-react" // アイコンをインポート

export const Sidebar = () => {
  const pathname = usePathname()

  const navItemBaseStyle =
    "flex h-9 w-full items-center rounded-md px-3 text-sm font-medium " +
    "hover:bg-muted hover:text-foreground"
  
  const activeNavItemStyle = "bg-muted font-semibold"

  const navItems = [
    {
      href: "/projects",
      label: "プロジェクト一覧",
      icon: <Folder className="mr-2 h-4 w-4" />,
      isActive: pathname === "/projects" || pathname?.startsWith("/projects/"),
    },
  ]

  return (
    <div className="flex h-screen w-56 flex-col border-r bg-white">
      {/* ヘッダー */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/projects" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#31A9B8] text-white">
            C
          </div>
          <span className="font-semibold">コミットコーチ</span>
        </Link>
      </div>

      {/* メインナビゲーション */}
      <nav className="flex flex-1 flex-col overflow-auto px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${navItemBaseStyle} ${item.isActive ? activeNavItemStyle : ""}`}
              data-active={item.isActive}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        {/* マイページとログアウトボタン (ナビゲーション下部に配置) */}
        <div className="mt-auto space-y-1 mb-2 px-3">
          <Link
            href="/mypage"
            className={`${navItemBaseStyle} ${pathname === "/mypage" ? activeNavItemStyle : ""}`}
            data-active={pathname === "/mypage"}
          >
            <User className="mr-2 h-4 w-4" />
            <span>マイページ</span>
          </Link>
          <Link
            href="/logout"
            className={`${navItemBaseStyle} text-red-500 hover:text-red-600 hover:bg-red-50`}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>ログアウト</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}

