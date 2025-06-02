import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CircleIcon, Play } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full" role="banner">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#31A9B8] text-white" aria-hidden="true">C</div>
          <span className="text-lg font-semibold">コミットコーチ</span>
        </div>
        <nav className="flex items-center gap-4" aria-label="メインナビゲーション">
          <Link href="/login" className="text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#31A9B8] focus:ring-offset-2 rounded-md px-2 py-1">
            ログイン
          </Link>
          <Link href="/register">
            <Button className="bg-[#31A9B8] hover:bg-[#2a8f9c] focus:ring-2 focus:ring-[#31A9B8] focus:ring-offset-2">新規登録</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-white to-blue-50">
          <div className="container px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-5">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800 w-fit">
                  先延ばし撃退ツール
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  AIコーチングで
                  <br />
                  タスク管理を
                  <br />
                  次のレベルへ
                </h1>
                <p className="text-gray-600 md:text-xl/relaxed lg:text-xl/relaxed xl:text-xl/relaxed">
                  GitHubリポジトリをTrello風カンバンで可視化し、AIコーチング機能でタスクコミットを支援する生産性向上ツール。
                </p>
                <div className="flex flex-col gap-3 min-[400px]:flex-row pt-2">
                  <Link href="/register">
                    <Button className="bg-[#31A9B8] hover:bg-[#2a8f9c] text-lg px-6 py-2.5 focus:ring-2 focus:ring-[#31A9B8] focus:ring-offset-2" aria-label="無料アカウントを作成">無料で始める</Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="border-[#31A9B8] text-[#31A9B8] hover:bg-[#31A9B8] hover:text-white text-lg px-6 py-2.5 focus:ring-2 focus:ring-[#31A9B8] focus:ring-offset-2" aria-label="デモアカウントでログイン">
                      <Play className="mr-2 h-4 w-4" aria-hidden="true" />
                      デモで体験
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center lg:justify-end">
                <div className="relative h-[350px] w-full max-w-[500px] overflow-hidden rounded-xl bg-white shadow-lg p-6 border border-gray-100">
                  <div className="absolute right-6 top-6 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md z-10">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#31A9B8] text-white">
                      <span className="text-lg font-medium">AI</span>
                    </div>
                  </div>
                  <div className="absolute top-1/4 left-6 max-w-[250px] rounded-lg bg-[#31A9B8] bg-opacity-10 p-4 shadow-sm z-10">
                    <p className="text-sm font-medium">「今日のタスクは進んでいますか？」</p>
                    <p className="text-xs text-gray-500 mt-1">AIコーチ 10:30</p>
                  </div>
                  <div className="absolute bottom-24 right-6 max-w-[200px] rounded-lg bg-gray-100 p-4 shadow-sm z-10">
                    <p className="text-sm">「あと2つ残っています」</p>
                    <p className="text-xs text-gray-500 mt-1">あなた 10:32</p>
                  </div>
                  <div className="absolute inset-0 z-0 opacity-5">
                    <Image 
                      src="/images/chat-background.svg" 
                      alt="チャットインターフェース背景" 
                      fill 
                      sizes="(max-width: 500px) 100vw, 500px"
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="absolute bottom-6 left-6 max-w-[280px] rounded-lg bg-[#31A9B8] bg-opacity-10 p-4 shadow-sm">
                    <p className="text-sm font-medium">「素晴らしい進捗です！次のステップを一緒に考えましょう」</p>
                    <p className="text-xs text-gray-500 mt-1">AIコーチ 10:33</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full bg-gray-50 py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center space-y-5 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">先延ばしを撃退する3つの機能</h2>
              <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-xl/relaxed">
                コミットコーチは、あなたの生産性を最大化するための強力な機能を提供します
              </p>
            </div>
            <div className="mx-auto grid gap-6 md:gap-8 py-12 md:py-16 grid-cols-1 md:grid-cols-3">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="flex flex-col items-center space-y-5 p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#31A9B8] bg-opacity-15 text-[#31A9B8]">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <h3 className="text-2xl font-bold">GitHub連携カンバン</h3>
                  <p className="text-base text-gray-600 text-center">
                    GitHubリポジトリのIssueをカンバン形式で表示。ドラッグ＆ドロップで直感的にタスク管理。
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="flex flex-col items-center space-y-5 p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#31A9B8] bg-opacity-15 text-[#31A9B8]">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <h3 className="text-2xl font-bold">AIコーチング</h3>
                  <p className="text-base text-gray-600 text-center">
                    AIがあなたのタスク進捗をモニタリング。適切なタイミングでリマインドやアドバイスを提供。
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="flex flex-col items-center space-y-5 p-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#31A9B8] bg-opacity-15 text-[#31A9B8]">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <h3 className="text-2xl font-bold">コミット管理</h3>
                  <p className="text-base text-gray-600 text-center">
                    日次コミットメントで目標達成をサポート。タスク完了率を向上させ、プロジェクト期間を短縮します。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="order-2 lg:order-1 flex flex-col justify-center space-y-5">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  先延ばしを徹底的に
                  <br />
                  撃退するAIコーチ
                </h2>
                <p className="text-gray-600 md:text-xl/relaxed lg:text-lg/relaxed xl:text-xl/relaxed">
                  コミットコーチのAIは、あなたの状況に合わせて叱咤と励ましを織り交ぜます。時には厳しく、時には優しく、あなたのタスク完了をサポートします。
                </p>
                <ul className="grid gap-4 pt-2">
                  <li className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#31A9B8] bg-opacity-15">
                      <CircleIcon className="h-5 w-5 text-[#31A9B8]" />
                    </div>
                    <span className="text-lg">細かなタスク分割と期限設定</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#31A9B8] bg-opacity-15">
                      <CircleIcon className="h-5 w-5 text-[#31A9B8]" />
                    </div>
                    <span className="text-lg">キャラクターの切り替えによる多様な叱咤激励</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#31A9B8] bg-opacity-15">
                      <CircleIcon className="h-5 w-5 text-[#31A9B8]" />
                    </div>
                    <span className="text-lg">タスク完了時の褒め言葉生成</span>
                  </li>
                </ul>
              </div>
              <div className="order-1 lg:order-2 flex items-center justify-center">
                <div className="relative h-[450px] w-full max-w-[550px] overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 p-6 shadow-lg border border-gray-100">
                  <div className="absolute left-8 top-8 flex h-12 w-12 items-center justify-center rounded-full bg-[#31A9B8] text-white shadow-md z-10">
                    <span className="text-lg font-medium">AI</span>
                  </div>
                  <div className="absolute left-8 top-28 max-w-[320px] rounded-lg bg-white p-4 shadow-md border-l-4 border-[#31A9B8] z-10">
                    <p className="text-base font-medium">「まだ終わってないんですか？締め切りまであと3時間ですよ！」</p>
                    <p className="text-xs text-gray-500 mt-2">AIコーチ 14:30</p>
                  </div>
                  <div className="absolute right-8 top-48 max-w-[220px] rounded-lg bg-gray-200 p-4 shadow-md z-10">
                    <p className="text-base">「あと少しで終わります...」</p>
                    <p className="text-xs text-gray-500 mt-2">あなた 14:32</p>
                  </div>
                  <div className="absolute left-8 bottom-28 max-w-[320px] rounded-lg bg-white p-4 shadow-md border-l-4 border-[#31A9B8] z-10">
                    <p className="text-base font-medium">「頑張ってください！完了したら次のタスクの分析を手伝いしますよ！」</p>
                    <p className="text-xs text-gray-500 mt-2">AIコーチ 14:33</p>
                  </div>
                  <div className="absolute inset-0 z-0 opacity-5">
                    <Image 
                      src="/images/coach-background.svg" 
                      alt="AIコーチング背景" 
                      fill 
                      sizes="(max-width: 550px) 100vw, 550px"
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-gray-50 py-12 border-t" role="contentinfo">
        <div className="container px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#31A9B8] text-white" aria-hidden="true">C</div>
              <span className="text-lg font-semibold">コミットコーチ</span>
            </div>
            <nav className="flex flex-wrap gap-8 text-sm text-gray-600" aria-label="フッターナビゲーション">
              <Link href="#" className="hover:text-[#31A9B8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#31A9B8] focus:ring-offset-2 rounded-md px-2 py-1">利用規約</Link>
              <Link href="#" className="hover:text-[#31A9B8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#31A9B8] focus:ring-offset-2 rounded-md px-2 py-1">プライバシーポリシー</Link>
              <Link href="#" className="hover:text-[#31A9B8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#31A9B8] focus:ring-offset-2 rounded-md px-2 py-1">お問い合わせ</Link>
            </nav>
            <p className="text-sm text-gray-500">© 2025 コミットコーチ - AIタスク管理アプリ</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
