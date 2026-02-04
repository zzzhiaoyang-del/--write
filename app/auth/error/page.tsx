export default function AuthError() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md rounded-lg border bg-card p-6 text-center">
        <h1 className="mb-2 text-2xl font-bold text-destructive">认证错误</h1>
        <p className="mb-4 text-muted-foreground">
          登录过程中出现错误，请重试。
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          返回首页
        </a>
      </div>
    </div>
  )
}
