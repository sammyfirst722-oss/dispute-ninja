// Automated Human-to-AI-Workflow (A1-A25) audit & screenshot verifier for DisputeNinja.
const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const { chromium } = require('C:/Users/sammy/overnight/app3-finance/node_modules/playwright')

const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'tools', 'shots')
fs.mkdirSync(OUT, { recursive: true })

const PORT = 3457
const BASE = `http://127.0.0.1:${PORT}`

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch {}
    await new Promise((r) => setTimeout(r, 300))
  }
  throw new Error(`Server did not respond at ${url} within ${timeoutMs}ms`)
}

function startNextServer() {
  const nextBin = path.join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next')
  const child = spawn(process.execPath, [nextBin, 'start', '-p', String(PORT), '-H', '127.0.0.1'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'production' },
  })
  return child
}

;(async () => {
  const server = startNextServer()
  let browser
  const report = { errors: [], checks: {} }

  try {
    await waitForServer(`${BASE}/`)
    browser = await chromium.launch()

    const openPage = async (w, h, opts = {}) => {
      const ctx = await browser.newContext({
        viewport: { width: w, height: h },
        deviceScaleFactor: 1,
        reducedMotion: opts.reducedMotion || 'no-preference',
      })
      const page = await ctx.newPage()
      page.setDefaultTimeout(10000)
      page.on('pageerror', (e) => report.errors.push(`pageerror(${w}x${h}): ${e.message}`))
      page.on('response', (res) => {
        if (res.status() >= 400) {
          const u = res.url()
          if (u.includes('/_vercel/insights/')) return // Expected on localhost outside Vercel edge
          report.errors.push(`http${res.status()}(${w}x${h}): ${u}`)
        }
      })
      page.on('console', (c) => {
        if (c.type() === 'error') {
          const text = c.text()
          if (text.includes('404 (Not Found)')) return // Covered with exact URL in response listener above
          report.errors.push(`console(${w}x${h}): ${text}`)
        }
      })
      return { ctx, page }
    }

    // 1. Mobile 412x915 core workflow: empty state, validation focus routing, sample -> Step 2 -> sources -> dialogs -> Undo
    {
      const { ctx, page } = await openPage(412, 915)
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await page.screenshot({ path: path.join(OUT, '01_home_mobile.png'), fullPage: false })

      // Check zero horizontal overflow + touch targets + no pulsing animations
      report.checks.mobileHome = await page.evaluate(() => {
        const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth
        const pulsing = document.querySelectorAll('.animate-pulse').length
        const submitBtn = document.querySelector('main form button[type="submit"]')
        const submitRect = submitBtn ? submitBtn.getBoundingClientRect() : null
        const langBtns = Array.from(document.querySelectorAll('[role="group"] button')).map((b) => {
          const r = b.getBoundingClientRect()
          return { text: b.textContent?.trim(), w: Math.round(r.width), h: Math.round(r.height) }
        })
        const headerLinks = Array.from(document.querySelectorAll('header a, header button')).map((el) => {
          const r = el.getBoundingClientRect()
          return { text: el.textContent?.trim(), w: Math.round(r.width), h: Math.round(r.height) }
        })
        return {
          overflow,
          pulsing,
          h1: document.querySelector('h1')?.textContent?.trim(),
          submitSize: submitRect ? { w: Math.round(submitRect.width), h: Math.round(submitRect.height) } : null,
          langBtns,
          minHeaderHeight: Math.min(...headerLinks.map((x) => x.h)),
        }
      })

      // Test empty submit -> inline validation error + focus routed to first invalid input (A4, A5, A12)
      await page.click('main form button[type="submit"]')
      report.checks.validationFocus = await page.evaluate(() => ({
        activeId: document.activeElement?.id,
        creditorInvalid: document.getElementById('creditor-name')?.getAttribute('aria-invalid'),
        errorCount: document.querySelectorAll('main form [role="alert"]').length,
      }))

      // Load worked example -> submit -> verify Step 2 checklist, sources, field checks, and focus moved to Step 2 heading
      await page.click('button:has-text("Debt collector ($1,450)")')
      await page.click('main form button[type="submit"]')
      await page.waitForSelector('text=Official law sources')
      await page.screenshot({ path: path.join(OUT, '02_step2_preview_mobile.png'), fullPage: false })

      report.checks.step2 = await page.evaluate(() => {
        const sourceLinks = Array.from(document.querySelectorAll('a[href*="law.cornell.edu"], a[href*="consumerfinance.gov"]')).length
        const fieldChecksVisible = document.body.innerText.includes('Fields to check before sending')
        const step2Active = document.querySelector('li[aria-current="step"]')?.textContent?.trim()
        return { sourceLinks, fieldChecksVisible, step2Active }
      })

      // Open Checkout Confirmation native <dialog>, test cognitive-forcing check, Escape closes and returns focus (A10, A11, A17)
      const unlockBtn = page.locator('button:has-text("Unlock Single Dispute Letter — $9.99")')
      await unlockBtn.click()
      await page.waitForSelector('dialog[open] h1:has-text("Confirm purchase")')
      await page.screenshot({ path: path.join(OUT, '03_checkout_dialog_mobile.png'), fullPage: false })

      // Try continuing without checking review box -> inline alert shown
      await page.click('dialog[open] button:has-text("Continue to $9.99 checkout")')
      const forcingError = await page.locator('dialog[open] [role="alert"]').textContent()
      // Press Escape -> dialog closes & focus returns to unlock button
      await page.keyboard.press('Escape')
      await page.waitForTimeout(100)
      const afterEsc = await page.evaluate(() => ({
        openDialogs: document.querySelectorAll('dialog[open]').length,
        focusedText: document.activeElement?.textContent?.trim(),
      }))
      report.checks.checkoutDialog = { forcingError: forcingError?.trim(), ...afterEsc }

      // Test Bureau preview native <dialog> (A10)
      await page.click('button:has-text("Open TransUnion")')
      await page.waitForSelector('dialog[open] h1:has-text("Open official TransUnion portal")')
      await page.screenshot({ path: path.join(OUT, '04_bureau_dialog_mobile.png'), fullPage: false })
      await page.keyboard.press('Escape')

      // Test Clear draft + 8-second Undo restores values (A10)
      await page.click('button:has-text("Clear draft")')
      await page.waitForSelector('button:has-text("Undo clear draft")')
      const clearedVal = await page.inputValue('#creditor-name')
      await page.click('button:has-text("Undo clear draft")')
      const restoredVal = await page.inputValue('#creditor-name')
      report.checks.clearUndo = { clearedVal, restoredVal }

      await ctx.close()
    }

    // 2. Narrow 320x640 + Reduced Motion + Large Text reflow test (A19, A21)
    {
      const { ctx, page } = await openPage(320, 640, { reducedMotion: 'reduce' })
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await page.click('header button:has-text("Display")')
      await page.waitForSelector('dialog[open] #display-prefs-title')
      await page.click('label:has-text("Large text")')
      await page.click('dialog[open] button:has-text("Done")')
      await page.waitForTimeout(150)
      await page.screenshot({ path: path.join(OUT, '05_320px_large_reduced.png'), fullPage: false })

      report.checks.narrow320 = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        textSize: document.documentElement.dataset.textSize,
        reducedMotionPref: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      }))

      await ctx.close()
    }

    // 2b. Desktop 1280x800 at 200% text zoom (WCAG 1.4.4 Resize Text)
    {
      const { ctx, page } = await openPage(1280, 800)
      await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
      await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
      await page.waitForTimeout(100)
      report.checks.zoom200Desktop = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      }))
      await ctx.close()
    }

    // 3. Desktop 1280x800: State Rights search + empty state + Guide page contrast & copy button
    {
      const { ctx, page } = await openPage(1280, 800)

      // /debt-rights search & empty state (A22)
      await page.goto(`${BASE}/debt-rights`, { waitUntil: 'networkidle' })
      await page.fill('#state-search-input', 'zzzz-nonexistent')
      await page.waitForSelector('text=No states matched')
      await page.screenshot({ path: path.join(OUT, '06_states_empty_search.png'), fullPage: false })
      await page.click('button:has-text("Clear search")')
      await page.fill('#state-search-input', 'Arizona')
      const azVisible = await page.locator('a:has-text("Arizona")').isVisible()
      report.checks.stateSearch = { azVisible }

      // /debt-rights/arizona table & calculator
      await page.goto(`${BASE}/debt-rights/arizona`, { waitUntil: 'networkidle' })
      await page.fill('#default-date', '2018-01-15')
      await page.waitForSelector('text=May be past limit')
      await page.screenshot({ path: path.join(OUT, '07_state_arizona.png'), fullPage: false })

      // /dispute/emergency-room-surprise-bill contrast + visible Copy label + no sticky bottom bar
      await page.goto(`${BASE}/dispute/emergency-room-surprise-bill`, { waitUntil: 'networkidle' })
      await page.screenshot({ path: path.join(OUT, '08_guide_er_bill.png'), fullPage: false })
      report.checks.guidePage = await page.evaluate(() => {
        const copyBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent?.includes('Copy sample'))
        const copyRect = copyBtn ? copyBtn.getBoundingClientRect() : null
        const pre = document.querySelector('pre')
        const preStyle = pre ? getComputedStyle(pre) : null
        const fixedBars = Array.from(document.querySelectorAll('*')).filter((el) => getComputedStyle(el).position === 'fixed' && !el.classList.contains('skip-link')).length
        const hasEstimatedSavings = document.body.innerText.includes('Estimated Savings')
        return {
          copyLabel: copyBtn?.textContent?.trim(),
          copySize: copyRect ? { w: Math.round(copyRect.width), h: Math.round(copyRect.height) } : null,
          preBg: preStyle?.backgroundColor,
          preColor: preStyle?.color,
          fixedBars,
          hasEstimatedSavings,
        }
      })

      await ctx.close()
    }

    console.log(JSON.stringify(report, null, 2))
    if (report.errors.length > 0) {
      process.exitCode = 1
    }
  } finally {
    if (browser) await browser.close()
    server.kill()
  }
})()
