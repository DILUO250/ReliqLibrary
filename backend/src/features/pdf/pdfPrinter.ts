/**
 * 服务端 PDF 打印引擎（backend/src/features/pdf/，模块无关，未来楼层/空间导出复用）。
 *
 * 设计原则（plans/paper-engine-promote-shared.md §导出请求路径）：
 * - 前端纸面渲染器 = 唯一权威渲染源（SSOT），后端零重复实现：
 *   无头浏览器只做一件事——加载前端的无 UI 打印路由，等"分页完成"信号，printToPDF。
 * - printToPDF + preferCSSPageSize：页尺寸由前端 @page { size: A4; margin: 0 } 注入
 *   （shared/paper/printPageStyle.ts），与屏幕纸面/浏览器打印共用同一套对齐机制。
 * - 浏览器懒加载单例 + 串行任务队列：并发导出不抢资源；断连自动重启。
 * - 本机浏览器探测链（Chrome → Edge），不下载 Chromium；可用 PDF_BROWSER_PATH 覆盖。
 */
import { existsSync } from 'node:fs'
import puppeteer, { type Browser } from 'puppeteer-core'
import { PDF_BROWSER_PATH } from '../../config/index.js'

const BROWSER_CANDIDATES: readonly string[] = [
  // Windows 标准安装位（顺序：Chrome 在前——高保真首选）
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  `${process.env.LOCALAPPDATA ?? ''}\\Google\\Chrome\\Application\\chrome.exe`,
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  `${process.env.LOCALAPPDATA ?? ''}\\Microsoft\\Edge\\Application\\msedge.exe`,
]

function findBrowserExecutable(): string {
  if (PDF_BROWSER_PATH) {
    if (!existsSync(PDF_BROWSER_PATH)) {
      throw new Error(`PDF_BROWSER_PATH 指向的浏览器不存在：${PDF_BROWSER_PATH}`)
    }
    return PDF_BROWSER_PATH
  }
  const found = BROWSER_CANDIDATES.find((p) => p && existsSync(p))
  if (!found) {
    throw new Error('未找到本机 Chrome/Edge，无法生成 PDF。请安装浏览器，或用环境变量 PDF_BROWSER_PATH 指定浏览器路径。')
  }
  return found
}

let browser: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (browser?.connected) return browser
  if (browser) {
    try {
      await browser.close()
    } catch {
      /* 旧实例已死，静默 */
    }
    browser = null
  }
  const executablePath = findBrowserExecutable()
  browser = await puppeteer.launch({
    args: ['--disable-gpu', '--headless=new', '--hide-scrollbars'],
    executablePath,
  })
  return browser
}

// 串行队列：导出任务不并发（单实例浏览器顺序出 PDF）
let queueTail: Promise<unknown> = Promise.resolve()

async function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queueTail.then(task, task)
  // 失败不阻断后续任务
  queueTail = run.catch(() => undefined)
  return run
}

export interface PrintResult {
  /** 打印路由回报的纸面页数（window.__PAPER_META.pageCount；缺失时为 null） */
  pageCount: number | null
}

/**
 * 加载 url，等待 window.__PAPER_READY === true（前端打印路由的"分页完成"信号），
 * 然后按前端注入的 @page 设定打印到 outPath。
 */
export async function printUrlToPdf(
  url: string,
  outPath: string,
  options?: { readyTimeoutMs?: number },
): Promise<PrintResult> {
  return enqueue(async () => {
    const target = await getBrowser()
    const page = await target.newPage()
    try {
      // A4 @ 96dpi 视口：窄屏等比缩放不会触发，屏幕轨度量与打印一致
      await page.setViewport({ width: 794, height: 1123 })
      try {
        await page.goto(url, { waitUntil: 'load', timeout: 30_000 })
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        if (msg.includes('ERR_CONNECTION_REFUSED')) {
          throw new Error(
            `前端渲染服务不可达（${url}）。服务端导出依赖前端 dev server 在线：请先运行 npm run dev:frontend，或用环境变量 FRONTEND_URL 指向正确的前端地址。`,
          )
        }
        throw new Error(`加载打印页面失败：${msg}`)
      }
      // 就绪信号与页数用字符串表达式求值：后端 tsconfig 无 DOM lib，
      // 浏览器上下文里的 window.__PAPER_* 无法（也不应）被静态类型化。
      let pageCount: number | null = null
      try {
        await page.waitForFunction('window.__PAPER_READY === true', {
          timeout: options?.readyTimeoutMs ?? 90_000,
          polling: 250,
        })
        pageCount = (await page.evaluate('window.__PAPER_META?.pageCount ?? null')) as number | null
      } catch {
        throw new Error('打印页面在超时时间内未发出分页完成信号（window.__PAPER_READY）。请检查前端 /print 路由渲染状态。')
      }
      await page.pdf({
        path: outPath,
        printBackground: true,
        preferCSSPageSize: true,
      })
      return { pageCount }
    } finally {
      await page.close().catch(() => undefined)
    }
  })
}
