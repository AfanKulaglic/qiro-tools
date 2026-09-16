import puppeteer from 'puppeteer-core'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 160)))
await page.goto('https://qiro-tools.vercel.app/admin', { waitUntil: 'networkidle2', timeout: 60000 })

const login = await page.evaluate(() => {
  const card = document.querySelector('.glass')
  const btn = document.querySelector('form button[type=submit]')
  if (!card || !btn) return { ok: false, card: !!card, btn: !!btn }
  const cs = getComputedStyle(card)
  const bs = getComputedStyle(btn)
  return {
    ok: true,
    cardClass: card.className,
    cardRadius: cs.borderRadius,
    cardBackdrop: cs.backdropFilter || cs.webkitBackdropFilter,
    btnBg: bs.backgroundImage.slice(0, 60),
    btnWeight: bs.fontWeight,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    fonts: getComputedStyle(document.querySelector('h1')).fontFamily.slice(0, 40),
  }
})
console.log('LOGIN SCREEN:', JSON.stringify(login, null, 1))

// sign in and inspect dashboard styling
await page.type('#admin-user', 'afan')
await page.type('#admin-pass', '080513')
await page.click('form button[type=submit]')
await new Promise((r) => setTimeout(r, 2000))

const tabsInfo = await page.evaluate(() => {
  const labels = [...document.querySelectorAll('button')].map((b) => b.innerText.trim()).filter(Boolean)
  const banner = [...document.querySelectorAll('div')].find((d) => /permission denied/i.test(d.innerText) && d.innerText.length < 200)
  return { buttons: labels, bannerText: banner ? banner.innerText.slice(0, 120) : null }
})
console.log('BUTTONS:', JSON.stringify(tabsInfo, null, 1))

const dash = await page.evaluate(() => {
  const tabs = [...document.querySelectorAll('button')].filter((b) =>
    ['Overview', 'Users & usage', 'Activity log', 'Pro grants', 'Short links'].includes(b.innerText.trim()),
  )
  const activeTab = tabs.find((t) => getComputedStyle(t).backgroundImage !== 'none')
  const cards = [...document.querySelectorAll('.glass')]
  return {
    tabCount: tabs.length,
    activeTabGradient: activeTab ? getComputedStyle(activeTab).backgroundImage.slice(0, 60) : null,
    cardCount: cards.length,
    firstCardText: cards[0]?.innerText.replace(/\n/g, ' | ').slice(0, 60),
    hasShield: !!document.querySelector('svg'),
    headingsFont: getComputedStyle(document.querySelector('h1')).fontFamily.slice(0, 30),
  }
})
console.log('DASHBOARD:', JSON.stringify(dash, null, 1))

await page.screenshot({ path: 'admin-shot.png', fullPage: false })
console.log('screenshot saved: admin-shot.png')
await browser.close()