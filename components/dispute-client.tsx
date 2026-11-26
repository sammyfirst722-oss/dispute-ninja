'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Info,
  Lock,
  Phone,
  Printer,
  RotateCcw,
  Scale,
  Shield,
  Smartphone,
  Trash2,
  X,
} from 'lucide-react'
import { isAndroidApp, isPlayBillingAvailable, purchaseWithPlayBilling } from '@/lib/play-billing'

type DisputeCategory = 'debt' | 'medical' | 'credit' | 'deposit'
type Language = 'en' | 'es'
type ProductType = 'letter' | 'kit'

interface StatuteSource {
  code: string
  title: string
  url: string
}

interface FieldCheck {
  field: string
  message: string
}

interface AnalysisResult {
  summary: string
  violations: string[]
  statutes?: StatuteSource[]
  fieldChecks?: FieldCheck[]
  inputsUsed?: {
    disputeType: string
    creditorName: string
    disputedAmount: string
    userName: string
    accountNum: string
    noticeDate: string
  }
  letterPreview: string
}

interface DraftState {
  disputeType: DisputeCategory
  creditorName: string
  disputedAmount: string
  billText: string
  userName: string
  accountNum: string
  noticeDate: string
}

interface BureauItem {
  name: string
  bureau: string
  group: 'major' | 'other'
  badge: string
  url: string
  desc: string
}

const DRAFT_KEY = 'disputeninja-draft-v1'
const LANG_KEY = 'disputeninja-lang'

const EMPTY_DRAFT: DraftState = {
  disputeType: 'debt',
  creditorName: '',
  disputedAmount: '',
  billText: '',
  userName: '',
  accountNum: '',
  noticeDate: '',
}

const CREDIT_BUREAU_LINKS: Record<Language, BureauItem[]> = {
  en: [
    {
      name: 'TransUnion Online Dispute',
      bureau: 'TransUnion',
      group: 'major',
      badge: 'Official portal',
      url: 'https://dispute.transunion.com',
      desc: 'For auto loans, credit cards, and collection accounts listed on TransUnion.',
    },
    {
      name: 'Experian Dispute Center',
      bureau: 'Experian',
      group: 'major',
      badge: 'Official portal',
      url: 'https://www.experian.com/disputes/main.html',
      desc: 'For late payment marks, charge-offs, and account errors listed on Experian.',
    },
    {
      name: 'Equifax Dispute Portal',
      bureau: 'Equifax',
      group: 'major',
      badge: 'Official portal',
      url: 'https://www.equifax.com/personal/disputes/',
      desc: 'For medical debt, mortgages, and personal loans listed on Equifax.',
    },
    {
      name: 'Innovis Consumer Dispute',
      bureau: 'Innovis',
      group: 'other',
      badge: '4th credit bureau',
      url: 'https://www.innovis.com/personal/dispute',
      desc: 'Fourth national consumer bureau used by many lenders and tenant screeners.',
    },
    {
      name: 'CFPB Federal Consumer Complaint',
      bureau: 'CFPB',
      group: 'other',
      badge: 'U.S. government',
      url: 'https://www.consumerfinance.gov/complaint/',
      desc: 'File a federal complaint if a collector, bureau, or hospital ignores your dispute.',
    },
  ],
  es: [
    {
      name: 'Disputa en Línea TransUnion',
      bureau: 'TransUnion',
      group: 'major',
      badge: 'Portal oficial',
      url: 'https://dispute.transunion.com',
      desc: 'Para préstamos de auto, tarjetas de crédito y agencias de cobro en TransUnion.',
    },
    {
      name: 'Centro de Disputas Experian',
      bureau: 'Experian',
      group: 'major',
      badge: 'Portal oficial',
      url: 'https://www.experian.com/disputes/main.html',
      desc: 'Para marcas de pago tardío y cuentas castigadas en Experian.',
    },
    {
      name: 'Portal de Disputas Equifax',
      bureau: 'Equifax',
      group: 'major',
      badge: 'Portal oficial',
      url: 'https://www.equifax.com/personal/disputes/',
      desc: 'Para deudas médicas, hipotecas y préstamos personales en Equifax.',
    },
    {
      name: 'Disputa de Consumidor Innovis',
      bureau: 'Innovis',
      group: 'other',
      badge: '4º buró de crédito',
      url: 'https://www.innovis.com/personal/dispute',
      desc: 'Cuarto buró nacional utilizado por bancos y arrendadores.',
    },
    {
      name: 'Queja Federal ante el CFPB',
      bureau: 'CFPB',
      group: 'other',
      badge: 'Gobierno de EE. UU.',
      url: 'https://www.consumerfinance.gov/es/quejas/',
      desc: 'Presente una queja federal si un cobrador, buró u hospital ignora su disputa.',
    },
  ],
}

function makeIdempotencyKey(productType: ProductType): string {
  const rand =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`
  return `dn_${productType}_${rand}`.slice(0, 64)
}

function attachDialogLightDismiss(dialog: HTMLDialogElement | null): () => void {
  if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return () => {}
  const outside = (e: PointerEvent) => {
    const r = dialog.getBoundingClientRect()
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom
  }
  let pressedOutside = false
  const onDown = (e: PointerEvent) => {
    pressedOutside = outside(e)
  }
  const onUp = (e: PointerEvent) => {
    if (pressedOutside && outside(e)) dialog.close()
  }
  dialog.addEventListener('pointerdown', onDown)
  dialog.addEventListener('pointerup', onUp)
  return () => {
    dialog.removeEventListener('pointerdown', onDown)
    dialog.removeEventListener('pointerup', onUp)
  }
}

export function DisputeClient() {
  const formHeadingId = useId()
  const checkoutTitleId = useId()
  const bureauTitleId = useId()

  const [lang, setLang] = useState<Language>('en')
  const [disputeType, setDisputeType] = useState<DisputeCategory>('debt')
  const [creditorName, setCreditorName] = useState('')
  const [disputedAmount, setDisputedAmount] = useState('')
  const [billText, setBillText] = useState('')
  const [userName, setUserName] = useState('')
  const [accountNum, setAccountNum] = useState('')
  const [noticeDate, setNoticeDate] = useState('')
  const [draftHydrated, setDraftHydrated] = useState(false)
  const [draftSavedNote, setDraftSavedNote] = useState('')

  // Undo toast for clearing draft (A10: reversible action acts immediately + 8s undo)
  const [undoDraft, setUndoDraft] = useState<DraftState | null>(null)
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Field validation (A4, A5, A12 — validate on blur if edited + on submit, clear on input)
  const [fieldErrors, setFieldErrors] = useState<{
    creditorName?: string
    disputedAmount?: string
    billText?: string
  }>({})
  const [touched, setTouched] = useState<{
    creditorName?: boolean
    disputedAmount?: boolean
    billText?: boolean
  }>({})

  // Step 2: analysis & preview
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const analyzeAbortRef = useRef<AbortController | null>(null)

  // Step 3: payment & unlocked letter
  const [hasPlayBilling, setHasPlayBilling] = useState(false)
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false)
  const [paymentBanner, setPaymentBanner] = useState<{ kind: 'info' | 'success' | 'error'; text: string } | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const checkoutInFlightRef = useRef(false)
  const idempotencyRef = useRef<{ signature: string; key: string } | null>(null)

  const [isUnlocked, setIsUnlocked] = useState(false)
  const [originalLetter, setOriginalLetter] = useState('')
  const [editableLetter, setEditableLetter] = useState('')
  const [copiedLetter, setCopiedLetter] = useState(false)

  // Proof of payment in memory
  const [paidSessionId, setPaidSessionId] = useState<string | null>(null)
  const [playPurchase, setPlayPurchase] = useState<{ sku: string; purchaseToken: string } | null>(null)
  const [unlockError, setUnlockError] = useState('')

  // Confirmation dialogs (native <dialog> — A10, A17, A18)
  const checkoutDialogRef = useRef<HTMLDialogElement>(null)
  const [pendingProduct, setPendingProduct] = useState<ProductType>('letter')
  const [factsChecked, setFactsChecked] = useState(false)
  const [factsCheckError, setFactsCheckError] = useState('')

  const bureauDialogRef = useRef<HTMLDialogElement>(null)
  const [pendingBureau, setPendingBureau] = useState<BureauItem | null>(null)
  const [bureauStatus, setBureauStatus] = useState('')

  // Single polite screen-reader announcer
  const [liveStatus, setLiveStatus] = useState('')

  // Refs for focus routing
  const creditorInputRef = useRef<HTMLInputElement>(null)
  const amountInputRef = useRef<HTMLInputElement>(null)
  const billTextRef = useRef<HTMLTextAreaElement>(null)
  const userNameInputRef = useRef<HTMLInputElement>(null)
  const accountInputRef = useRef<HTMLInputElement>(null)
  const step2HeadingRef = useRef<HTMLHeadingElement>(null)
  const unlockedHeadingRef = useRef<HTMLHeadingElement>(null)

  const es = lang === 'es'

  const announce = (msg: string) => {
    setLiveStatus('')
    setTimeout(() => setLiveStatus(msg), 40)
  }

  const entitlementPayload = (): Record<string, unknown> =>
    paidSessionId ? { sessionId: paidSessionId } : playPurchase ? { playPurchase } : {}

  // Sync <html lang> when user toggles EN/ES (WCAG 3.1.1)
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Attach pointer-position light-dismiss fallback to both native modal dialogs
  useEffect(() => {
    const cleanA = attachDialogLightDismiss(checkoutDialogRef.current)
    const cleanB = attachDialogLightDismiss(bureauDialogRef.current)
    return () => {
      cleanA()
      cleanB()
    }
  }, [])

  // Ask the server for the letter. It only answers if Stripe or Google Play confirms payment.
  const loadLetter = async (
    entitlement: Record<string, unknown>,
    fields: {
      disputeType: string
      creditorName: string
      disputedAmount: string
      userName?: string
      accountNum?: string
      lang: string
    }
  ): Promise<boolean> => {
    const isEs = fields.lang === 'es'
    setIsVerifyingPayment(true)
    try {
      const r = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, ...entitlement }),
      })
      const d = await r.json().catch(() => ({}))
      if (r.ok && d.letter) {
        setOriginalLetter(d.letter)
        setEditableLetter(d.letter)
        setIsUnlocked(true)
        setUnlockError('')
        setPaymentBanner({
          kind: 'success',
          text: isEs
            ? 'Pago confirmado. Su carta está lista para revisar, editar, imprimir o copiar.'
            : 'Payment confirmed. Your letter is ready to review, edit, print, or copy.',
        })
        setTimeout(() => unlockedHeadingRef.current?.focus(), 60)
        return true
      }
      setUnlockError(
        r.status === 402
          ? isEs
            ? 'No pudimos confirmar su pago. Si ya pagó, escríbanos a sammyfirst722@gmail.com y lo resolvemos.'
            : 'We could not confirm your payment. If you already paid, email sammyfirst722@gmail.com and we will fix it.'
          : isEs
            ? 'No se pudo cargar su carta ahora. Su pago no se perdió — intente de nuevo.'
            : 'Your letter could not be loaded right now. Please try again.'
      )
    } catch {
      setUnlockError(
        isEs
          ? 'Error de conexión al verificar el pago. Revise su internet e intente de nuevo.'
          : 'Connection error while verifying payment. Check your internet and try again.'
      )
    } finally {
      setIsVerifyingPayment(false)
    }
    return false
  }

  // Kit bought through Google Play: server verifies purchase, then sends zip file.
  const downloadKit = async (purchase: { sku: string; purchaseToken: string }) => {
    setIsVerifyingPayment(true)
    try {
      const r = await fetch('/api/kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playPurchase: purchase }),
      })
      if (!r.ok) throw new Error('kit')
      const blob = await r.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'debt-dispute-action-kit.zip'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setPaymentBanner({
        kind: 'success',
        text: es
          ? 'Pago confirmado. Se inició la descarga del Paquete de 5 Cartas (ZIP).'
          : 'Payment confirmed. Your 5-Letter Dispute Kit (ZIP) download has started.',
      })
    } catch {
      setUnlockError(
        es
          ? 'No se pudo descargar el paquete. Intente de nuevo o escríbanos a sammyfirst722@gmail.com.'
          : 'The kit could not be downloaded. Try again or email sammyfirst722@gmail.com.'
      )
    } finally {
      setIsVerifyingPayment(false)
    }
  }

  // Hydrate language, saved draft, and Stripe return state on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    setHasPlayBilling(isPlayBillingAvailable())

    const params = new URLSearchParams(window.location.search)
    const urlLang = params.get('lang')
    let activeLang: Language = 'en'
    if (urlLang === 'es' || urlLang === 'en') {
      activeLang = urlLang
      setLang(urlLang)
      try {
        localStorage.setItem(LANG_KEY, urlLang)
      } catch {}
    } else {
      try {
        const savedLang = localStorage.getItem(LANG_KEY)
        if (savedLang === 'es' || savedLang === 'en') {
          activeLang = savedLang
          setLang(savedLang)
        }
      } catch {}
    }

    // Restore saved draft so reload/Back never wipes work (A3)
    try {
      const rawDraft = localStorage.getItem(DRAFT_KEY)
      if (rawDraft) {
        const d = JSON.parse(rawDraft) as Partial<DraftState>
        if (d.disputeType && ['debt', 'medical', 'credit', 'deposit'].includes(d.disputeType)) {
          setDisputeType(d.disputeType)
        }
        if (typeof d.creditorName === 'string') setCreditorName(d.creditorName)
        if (typeof d.disputedAmount === 'string') setDisputedAmount(d.disputedAmount)
        if (typeof d.billText === 'string') setBillText(d.billText)
        if (typeof d.userName === 'string') setUserName(d.userName)
        if (typeof d.accountNum === 'string') setAccountNum(d.accountNum)
        if (typeof d.noticeDate === 'string') setNoticeDate(d.noticeDate)
      }
    } catch {}
    setDraftHydrated(true)

    // Handle Stripe cancel return (A18)
    if (params.get('canceled') === 'true') {
      setPaymentBanner({
        kind: 'info',
        text:
          activeLang === 'es'
            ? 'Pago cancelado — no se realizó ningún cobro. Su borrador sigue guardado abajo.'
            : 'Checkout was canceled — no charge was made. Your draft is still saved below.',
      })
    }

    // Handle Stripe return: verify with server before saying paid (A18)
    const sessionId = params.get('session_id')
    if (params.get('unlocked') === 'kit' && sessionId) {
      setIsVerifyingPayment(true)
      setPaymentBanner({
        kind: 'info',
        text:
          activeLang === 'es'
            ? 'Verificando pago del Paquete de 5 Cartas con Stripe...'
            : 'Verifying your 5-Letter Dispute Kit payment with Stripe...',
      })
      fetch(`/api/kit?session_id=${encodeURIComponent(sessionId)}`)
        .then(async (res) => {
          if (!res.ok) throw new Error('unverified')
          const blob = await res.blob()
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'debt-dispute-action-kit.zip'
          document.body.appendChild(a)
          a.click()
          a.remove()
          URL.revokeObjectURL(url)
          setPaymentBanner({
            kind: 'success',
            text:
              activeLang === 'es'
                ? 'Pago confirmado. Su Paquete de 5 Cartas (ZIP) se descargó.'
                : 'Payment confirmed. Your 5-Letter Dispute Kit (ZIP) has downloaded.',
          })
        })
        .catch(() => {
          setPaymentBanner({
            kind: 'error',
            text:
              activeLang === 'es'
                ? 'No pudimos confirmar el pago del paquete. Si ya pagó, recargue o escríbanos a sammyfirst722@gmail.com.'
                : 'We could not confirm your kit payment. If you already paid, try reloading or email sammyfirst722@gmail.com.',
          })
        })
        .finally(() => setIsVerifyingPayment(false))
    }

    if (params.get('unlocked') === 'true' && sessionId) {
      const type = (params.get('type') || 'debt') as DisputeCategory
      const cred = params.get('creditor') || ''
      const amt = params.get('amount') || ''
      const nameParam = params.get('name') || ''
      const accountParam = params.get('account') || ''
      setDisputeType(type)
      if (cred) setCreditorName(cred)
      if (amt) setDisputedAmount(amt)
      if (nameParam) setUserName(nameParam)
      if (accountParam) setAccountNum(accountParam)
      setPaidSessionId(sessionId)
      loadLetter(
        { sessionId },
        {
          disputeType: type,
          creditorName: cred || 'Creditor',
          disputedAmount: amt || '0.00',
          userName: nameParam || 'Consumer',
          accountNum: accountParam || undefined,
          lang: activeLang,
        }
      )
    }
  }, [])

  // Auto-save draft locally whenever inputs change (A3)
  useEffect(() => {
    if (!draftHydrated) return
    const payload: DraftState = {
      disputeType,
      creditorName,
      disputedAmount,
      billText,
      userName,
      accountNum,
      noticeDate,
    }
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload))
      if (creditorName || disputedAmount || billText || userName || accountNum || noticeDate) {
        setDraftSavedNote(es ? 'Borrador guardado en este dispositivo' : 'Draft saved on this device')
      } else {
        setDraftSavedNote('')
      }
    } catch {}
  }, [draftHydrated, disputeType, creditorName, disputedAmount, billText, userName, accountNum, noticeDate, es])

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang)
    try {
      localStorage.setItem(LANG_KEY, newLang)
    } catch {}
    announce(newLang === 'es' ? 'Idioma cambiado a español' : 'Language switched to English')
    if (isUnlocked) {
      loadLetter(entitlementPayload(), {
        disputeType,
        creditorName,
        disputedAmount,
        userName: userName || 'Consumer',
        accountNum: accountNum || undefined,
        lang: newLang,
      })
    }
  }

  // Standardized plain-language config for all 4 dispute types (A4, A13)
  const disputeConfig: Record<
    DisputeCategory,
    {
      title: string
      sub: string
      lawTag: string
      nameLabel: string
      nameHint: string
      namePlaceholder: string
      amountLabel: string
      amountPlaceholder: string
      textLabel: string
      textHint: string
      textPlaceholder: string
      sampleChip: string
      exampleName: string
      exampleAmount: string
      exampleText: string
    }
  > = {
    debt: {
      title: es ? 'Cobrador de deudas' : 'Debt collector',
      sub: es ? 'Pida prueba escrita de la deuda y detenga llamadas' : 'Ask for written proof of the debt and stop calls',
      lawTag: 'FDCPA · 15 U.S.C. § 1692g',
      nameLabel: es ? 'Nombre de la agencia de cobro' : 'Collection agency or debt buyer name',
      nameHint: es ? 'Copie el nombre exacto de su carta o llamada.' : 'Copy the exact name from your letter or voicemail.',
      namePlaceholder: 'Midland Credit Management',
      amountLabel: es ? 'Monto que reclaman (USD)' : 'Amount they say you owe (USD)',
      amountPlaceholder: '1450.00',
      textLabel: es ? '¿Qué pasó con este cobro?' : 'What happened with this debt?',
      textHint: es
        ? 'Escriba al menos 10 caracteres. Incluya fechas o por qué cree que es incorrecto.'
        : 'Write at least 10 characters. Include dates or why you dispute the charge.',
      textPlaceholder: es
        ? 'Midland Credit me llama pidiendo $1,450 por una tarjeta de 2022 y no me envía el contrato original.'
        : 'Midland Credit is calling about a $1,450 balance from 2022 and has not sent written proof.',
      sampleChip: es ? 'Cobrador ($1,450)' : 'Debt collector ($1,450)',
      exampleName: 'Midland Credit Management',
      exampleAmount: '1450',
      exampleText: es
        ? 'La agencia llama varias veces pidiendo $1,450 por un supuesto saldo de tarjeta de 2022. Añadieron intereses sin explicación y no han enviado prueba escrita.'
        : 'Collection agency calling repeatedly demanding $1,450 for an alleged 2022 credit card balance. They added unexplained fees and have not sent written proof of the debt.',
    },
    medical: {
      title: es ? 'Factura médica' : 'Medical bill',
      sub: es ? 'Pida factura detallada y dispute cobros sorpresa' : 'Ask for an itemized bill and challenge surprise fees',
      lawTag: 'No Surprises Act · 42 U.S.C. § 300gg-111',
      nameLabel: es ? 'Nombre del hospital o clínica' : 'Hospital, clinic, or provider name',
      nameHint: es ? 'Use el nombre que aparece en la parte superior de su factura.' : 'Use the provider name printed at the top of your bill.',
      namePlaceholder: 'Regional Community Hospital',
      amountLabel: es ? 'Monto total en disputa (USD)' : 'Disputed bill amount (USD)',
      amountPlaceholder: '2800.00',
      textLabel: es ? '¿Qué cobro parece incorrecto?' : 'What looks wrong on the bill?',
      textHint: es
        ? 'Escriba al menos 10 caracteres. Mencione si fue en red o cobro sorpresa.'
        : 'Write at least 10 characters. Mention ER visits, surprise out-of-network fees, or duplicate charges.',
      textPlaceholder: es
        ? 'Fui a emergencias dentro de mi red y me cobraron $2,800 con tarifa de instalación sin aviso previo.'
        : 'Visited an in-network ER and received a $2,800 surprise bill with an out-of-network doctor fee.',
      sampleChip: es ? 'Factura ER ($2,800)' : 'ER bill ($2,800)',
      exampleName: 'Regional Community Hospital',
      exampleAmount: '2800',
      exampleText: es
        ? 'Recibí una factura sorpresa de $2,800 tras visitar una sala de emergencias dentro de mi red. Incluye $1,200 de un médico fuera de red sin aviso previo ni estimado de buena fe.'
        : 'Received a surprise $2,800 bill after an in-network emergency room visit. It includes a $1,200 out-of-network doctor fee and a $1,600 facility fee with no written Good Faith Estimate.',
    },
    credit: {
      title: es ? 'Error de buró de crédito' : 'Credit report error',
      sub: es ? 'Pida al buró verificar o borrar datos erróneos en 30 días' : 'Ask credit bureaus to verify or delete wrong items',
      lawTag: 'FCRA · 15 U.S.C. § 1681i',
      nameLabel: es ? 'Buró de crédito o acreedor reportado' : 'Credit bureau or reporting company',
      nameHint: es ? 'Por ejemplo: Experian, Equifax, TransUnion o el acreedor.' : 'Example: Experian, Equifax, TransUnion, or the listed creditor.',
      namePlaceholder: 'Equifax / Example Bank',
      amountLabel: es ? 'Saldo en disputa (USD)' : 'Disputed balance (USD)',
      amountPlaceholder: '850.00',
      textLabel: es ? '¿Qué dato está equivocado en su reporte?' : 'What is wrong on your credit report?',
      textHint: es
        ? 'Escriba al menos 10 caracteres. Indique qué cuenta, fecha o saldo es incorrecto.'
        : 'Write at least 10 characters. Mention the wrong balance, paid-off status, or wrong late date.',
      textPlaceholder: es
        ? 'Equifax muestra un retraso de 60 días y saldo de $850 en una cuenta que ya pagué y cerré en 2023.'
        : 'Equifax shows a 60-day late payment and $850 balance on an account paid in full in 2023.',
      sampleChip: es ? 'Error de crédito ($850)' : 'Credit error ($850)',
      exampleName: 'Equifax Information Services',
      exampleAmount: '850',
      exampleText: es
        ? 'Mi reporte de crédito muestra un retraso de 60 días y un saldo castigado de $850 por una cuenta que fue liquidada y cerrada en 2023.'
        : 'My credit report shows an incorrect 60-day late mark and $850 charged-off balance for an account that was paid and closed in 2023.',
    },
    deposit: {
      title: es ? 'Depósito de renta' : 'Security deposit',
      sub: es ? 'Pida recibos y devolución de descuentos injustos' : 'Ask your landlord for receipts or your deposit back',
      lawTag: es ? 'Ley estatal de inquilinos' : 'State landlord-tenant law',
      nameLabel: es ? 'Nombre del arrendador o administración' : 'Landlord or property manager name',
      nameHint: es ? 'Use el nombre que figura en su contrato de renta.' : 'Use the name listed on your lease agreement.',
      namePlaceholder: 'Grandview Property Management',
      amountLabel: es ? 'Depósito retenido (USD)' : 'Withheld deposit amount (USD)',
      amountPlaceholder: '1200.00',
      textLabel: es ? '¿Qué descontaron sin razón?' : 'What did the landlord unfairly deduct?',
      textHint: es
        ? 'Escriba al menos 10 caracteres. Indique fecha de mudanza y si faltan recibos.'
        : 'Write at least 10 characters. Mention move-out date, normal wear and tear, or missing receipts.',
      textPlaceholder: es
        ? 'Dejé el departamento limpio tras 2 años y retuvieron $1,200 por pintura normal sin enviar recibos.'
        : 'Moved out after 2 years leaving the unit clean. Landlord kept $1,200 for normal paint wear with no receipts.',
      sampleChip: es ? 'Depósito ($1,200)' : 'Security deposit ($1,200)',
      exampleName: 'Grandview Property Management',
      exampleAmount: '1200',
      exampleText: es
        ? 'El arrendador retuvo $1,200 de mi depósito por pintura y limpieza de desgaste normal sin enviar recibos detallados dentro del plazo legal.'
        : 'Landlord withheld $1,200 from my security deposit for routine paint and carpet wear without sending itemized repair receipts by the state deadline.',
    },
  }

  const curConfig = disputeConfig[disputeType]
  const bureauList = CREDIT_BUREAU_LINKS[lang] || CREDIT_BUREAU_LINKS.en
  const majorBureaus = bureauList.filter((b) => b.group === 'major')
  const otherBureaus = bureauList.filter((b) => b.group === 'other')

  // Field validation helpers (A4, A5, A12)
  const validateField = (name: 'creditorName' | 'disputedAmount' | 'billText', value: string): string | undefined => {
    const trimmed = value.trim()
    if (name === 'creditorName') {
      if (!trimmed) {
        return es
          ? 'Escriba el nombre de la empresa o cobrador (o toque un ejemplo arriba).'
          : 'Enter the company or collector name (or tap a sample above).'
      }
      return undefined
    }
    if (name === 'disputedAmount') {
      const cleaned = trimmed.replace(/[$,\s]/g, '')
      if (!cleaned) {
        return es
          ? 'Escriba el monto en disputa, por ejemplo 1450 o 280.50.'
          : 'Enter the disputed dollar amount, for example 1450 or 280.50.'
      }
      if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(cleaned)) {
        return es
          ? 'Use solo números y punto decimal (ejemplo: 1450.00).'
          : 'Use numbers and an optional decimal only (example: 1450.00).'
      }
      return undefined
    }
    if (name === 'billText') {
      if (trimmed.length < 10) {
        return es
          ? `Faltan ${10 - trimmed.length} caracteres: explique brevemente qué pasó con la factura.`
          : `Add ${10 - trimmed.length} more characters explaining what happened with the bill.`
      }
      return undefined
    }
    return undefined
  }

  const handleFieldBlur = (name: 'creditorName' | 'disputedAmount' | 'billText', value: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    const err = validateField(name, value)
    setFieldErrors((prev) => ({ ...prev, [name]: err }))
  }

  const handleAnalyzeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors = {
      creditorName: validateField('creditorName', creditorName),
      disputedAmount: validateField('disputedAmount', disputedAmount),
      billText: validateField('billText', billText),
    }
    setTouched({ creditorName: true, disputedAmount: true, billText: true })
    setFieldErrors(nextErrors)

    if (nextErrors.creditorName) {
      creditorInputRef.current?.focus()
      announce(nextErrors.creditorName)
      return
    }
    if (nextErrors.disputedAmount) {
      amountInputRef.current?.focus()
      announce(nextErrors.disputedAmount)
      return
    }
    if (nextErrors.billText) {
      billTextRef.current?.focus()
      announce(nextErrors.billText)
      return
    }

    // Cancel any previous in-flight request cleanly
    analyzeAbortRef.current?.abort()
    const controller = new AbortController()
    analyzeAbortRef.current = controller

    setIsAnalyzing(true)
    setAnalyzeError('')
    const normalizedAmount = disputedAmount.trim().replace(/[$,\s]/g, '')

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          billText: billText.trim(),
          disputeType,
          creditorName: creditorName.trim(),
          disputedAmount: normalizedAmount,
          userName: userName.trim(),
          accountNum: accountNum.trim(),
          noticeDate: noticeDate.trim(),
          lang,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setAnalyzeError(
          data.error ||
            (es
              ? 'No pudimos crear su vista previa. Sus datos siguen guardados — intente de nuevo.'
              : 'Could not build your preview right now. Your input is still saved — please try again.')
        )
        return
      }
      setAnalysisResult(data)
      announce(
        es
          ? 'Paso 2 listo: lista de revisión y vista previa de la carta cargadas.'
          : 'Step 2 ready: your checklist and letter preview are loaded.'
      )
      setTimeout(() => step2HeadingRef.current?.focus(), 60)
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setAnalyzeError(es ? 'Solicitud cancelada. Sus datos siguen guardados.' : 'Request canceled. Your input is still saved.')
      } else {
        setAnalyzeError(
          es
            ? 'Sin conexión al servidor. Revise su internet e intente de nuevo — sus datos siguen guardados.'
            : 'Could not reach the server. Check your internet and try again — your draft is still saved.'
        )
      }
    } finally {
      setIsAnalyzing(false)
      analyzeAbortRef.current = null
    }
  }

  const handleCancelAnalyze = () => {
    analyzeAbortRef.current?.abort()
  }

  // Worked example 1-tap loader (for ALL 4 dispute types — A4)
  const handleLoadSample = (key: DisputeCategory) => {
    const cfg = disputeConfig[key]
    setDisputeType(key)
    setCreditorName(cfg.exampleName)
    setDisputedAmount(cfg.exampleAmount)
    setBillText(cfg.exampleText)
    setFieldErrors({})
    setAnalyzeError('')
    setAnalysisResult(null)
    announce(es ? `Ejemplo cargado: ${cfg.title}` : `Sample loaded: ${cfg.title}`)
  }

  // Clear draft immediately with 8-second Undo toast (A10)
  const handleClearDraft = () => {
    const snapshot: DraftState = {
      disputeType,
      creditorName,
      disputedAmount,
      billText,
      userName,
      accountNum,
      noticeDate,
    }
    setUndoDraft(snapshot)
    setDisputeType(EMPTY_DRAFT.disputeType)
    setCreditorName('')
    setDisputedAmount('')
    setBillText('')
    setUserName('')
    setAccountNum('')
    setNoticeDate('')
    setFieldErrors({})
    setTouched({})
    setAnalysisResult(null)
    setAnalyzeError('')
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {}
    announce(es ? 'Borrador borrado. Puede deshacer durante 8 segundos.' : 'Draft cleared. You can undo for 8 seconds.')
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    undoTimerRef.current = setTimeout(() => setUndoDraft(null), 8000)
  }

  const handleUndoClearDraft = () => {
    if (!undoDraft) return
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    setDisputeType(undoDraft.disputeType)
    setCreditorName(undoDraft.creditorName)
    setDisputedAmount(undoDraft.disputedAmount)
    setBillText(undoDraft.billText)
    setUserName(undoDraft.userName)
    setAccountNum(undoDraft.accountNum)
    setNoticeDate(undoDraft.noticeDate)
    setUndoDraft(null)
    announce(es ? 'Borrador restaurado.' : 'Draft restored.')
  }

  // Open consequential checkout confirmation dialog (A10, A11, A18)
  const openCheckoutConfirm = (productType: ProductType) => {
    setPendingProduct(productType)
    setFactsChecked(false)
    setFactsCheckError('')
    setUnlockError('')
    const dlg = checkoutDialogRef.current
    if (dlg && !dlg.open) dlg.showModal()
  }

  // Execute payment with double-tap guard + stable idempotency key across retries (A18)
  const executeConfirmedCheckout = async () => {
    if (!factsChecked) {
      setFactsCheckError(
        es
          ? 'Confirme la casilla de revisión antes de continuar al pago.'
          : 'Check the review box before continuing to checkout.'
      )
      return
    }
    if (checkoutInFlightRef.current) return
    checkoutInFlightRef.current = true
    setIsCheckingOut(true)
    setUnlockError('')

    const productType = pendingProduct
    const normalizedAmount = disputedAmount.trim().replace(/[$,\s]/g, '') || '0'
    const sig = `${productType}|${disputeType}|${creditorName.trim()}|${normalizedAmount}|${userName.trim()}|${accountNum.trim()}`
    if (!idempotencyRef.current || idempotencyRef.current.signature !== sig) {
      idempotencyRef.current = { signature: sig, key: makeIdempotencyKey(productType) }
    }
    const idempotencyKey = idempotencyRef.current.key

    try {
      // 1. Google Play In-App Billing for Android TWA
      if (isPlayBillingAvailable()) {
        const sku = productType === 'kit' ? 'disputeninja_kit' : 'disputeninja_letter'
        const price = productType === 'kit' ? '19.00' : '9.99'
        const label =
          productType === 'kit'
            ? es
              ? 'Paquete de 5 Cartas de Disputa'
              : '5-Letter Dispute Kit'
            : es
              ? 'Carta Única de Disputa'
              : 'Single Dispute Letter'

        checkoutDialogRef.current?.close()
        const playResult = await purchaseWithPlayBilling(sku, price, label)
        if (playResult.success && playResult.purchaseToken) {
          const purchase = { sku, purchaseToken: playResult.purchaseToken }
          setPlayPurchase(purchase)
          if (productType === 'kit') {
            await downloadKit(purchase)
          } else {
            await loadLetter(
              { playPurchase: purchase },
              {
                disputeType,
                creditorName: creditorName.trim() || 'Creditor',
                disputedAmount: normalizedAmount,
                userName: userName.trim() || 'Consumer',
                accountNum: accountNum.trim() || undefined,
                lang,
              }
            )
          }
        } else {
          setUnlockError(
            playResult.error || (es ? 'No se completó la compra en Google Play.' : 'Google Play purchase was not completed.')
          )
        }
        return
      }

      // 2. Stripe web checkout with idempotency key
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          disputeType,
          creditorName: creditorName.trim() || 'Creditor',
          disputedAmount: normalizedAmount,
          userName: userName.trim(),
          accountNum: accountNum.trim(),
          productType,
          lang,
          idempotencyKey,
          isTwa: isAndroidApp(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.checkoutUrl) {
        checkoutDialogRef.current?.close()
        window.location.href = data.checkoutUrl
        return
      }
      setUnlockError(
        data.error ||
          (es
            ? 'No se pudo iniciar Stripe Checkout. Intente de nuevo en unos segundos.'
            : 'Could not start Stripe Checkout. Please try again in a moment.')
      )
    } catch {
      setUnlockError(
        es
          ? 'Error de red al abrir el pago. No se realizó ningún cobro — intente de nuevo.'
          : 'Network error starting checkout. No charge was made — please try again.'
      )
    } finally {
      checkoutInFlightRef.current = false
      setIsCheckingOut(false)
    }
  }

  // Copy helper with clipboard fallback
  const copyTextSafe = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }

  const handleCopyLetter = async () => {
    const ok = await copyTextSafe(editableLetter || analysisResult?.letterPreview || billText)
    if (ok) {
      setCopiedLetter(true)
      announce(es ? 'Carta copiada al portapapeles.' : 'Letter copied to clipboard.')
      setTimeout(() => setCopiedLetter(false), 2500)
    } else {
      announce(es ? 'No se pudo copiar automáticamente. Seleccione el texto y copie.' : 'Could not copy automatically. Select the text in the box and copy it.')
    }
  }

  const handleDownloadLetterTxt = () => {
    const content = editableLetter || originalLetter
    if (!content) return
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dispute-letter-${disputeType}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    announce(es ? 'Archivo de texto descargado.' : 'Text file downloaded.')
  }

  // Bureau external-action preview modal (A10: preview recipient, content, consequence before leaving app)
  const bureauPreviewText =
    editableLetter ||
    analysisResult?.letterPreview ||
    billText.trim() ||
    (es
      ? `Disputa sobre cuenta con ${creditorName || '[Nombre de la empresa]'} por $${disputedAmount || '[Monto]'} bajo FCRA § 611.`
      : `Written dispute regarding ${creditorName || '[Company Name]'} for $${disputedAmount || '[Amount]'} under FCRA § 611.`)

  const openBureauPreview = (item: BureauItem) => {
    setPendingBureau(item)
    const dlg = bureauDialogRef.current
    if (dlg && !dlg.open) dlg.showModal()
  }

  const confirmOpenBureau = async () => {
    if (!pendingBureau) return
    const copied = await copyTextSafe(bureauPreviewText)
    const msg = copied
      ? es
        ? `Texto copiado. Abriendo el sitio oficial de ${pendingBureau.bureau} en una nueva pestaña.`
        : `Text copied. Opening ${pendingBureau.bureau} in a new tab.`
      : es
        ? `Abriendo ${pendingBureau.bureau} en una nueva pestaña.`
        : `Opening ${pendingBureau.bureau} in a new tab.`
    setBureauStatus(msg)
    announce(msg)
    window.open(pendingBureau.url, '_blank', 'noopener,noreferrer')
    bureauDialogRef.current?.close()
  }

  const jumpToField = (field: string) => {
    const map: Record<string, React.RefObject<HTMLElement | null>> = {
      creditorName: creditorInputRef,
      disputedAmount: amountInputRef,
      billText: billTextRef,
      userName: userNameInputRef,
      accountNum: accountInputRef,
    }
    const target = map[field]?.current
    if (target) {
      target.scrollIntoView({ behavior: 'auto', block: 'center' })
      target.focus()
    }
  }

  const activeStep: 1 | 2 | 3 = isUnlocked ? 3 : analysisResult ? 2 : 1
  const hasAnyDraftInput = Boolean(creditorName || disputedAmount || billText || userName || accountNum || noticeDate)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* Centralized polite screen-reader announcer */}
      <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {liveStatus}
      </div>

      {/* Top row: clear language switcher + draft status */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-200 max-w-full">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>{es ? 'Idioma:' : 'Language:'}</span>
          </span>
          <div className="inline-flex flex-wrap rounded-xl bg-slate-900 border border-slate-600 p-1 gap-1 max-w-full" role="group" aria-label={es ? 'Seleccionar idioma' : 'Choose language'}>
            <button
              type="button"
              aria-pressed={lang === 'en'}
              onClick={() => handleLanguageChange('en')}
              className={`min-h-[44px] px-3.5 rounded-lg text-sm font-bold cursor-pointer dn-pressable ${
                lang === 'en' ? 'bg-emerald-500 text-slate-950' : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              English
            </button>
            <button
              type="button"
              aria-pressed={lang === 'es'}
              onClick={() => handleLanguageChange('es')}
              className={`min-h-[44px] px-3.5 rounded-lg text-sm font-bold cursor-pointer dn-pressable ${
                lang === 'es' ? 'bg-emerald-500 text-slate-950' : 'text-slate-200 hover:bg-slate-800'
              }`}
            >
              Español
            </button>
          </div>
        </div>

        {draftSavedNote && !isUnlocked && (
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-emerald-300 font-medium inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{draftSavedNote}</span>
            </span>
            {hasAnyDraftInput && (
              <button
                type="button"
                onClick={handleClearDraft}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl border border-slate-600 bg-slate-900 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white cursor-pointer dn-pressable"
              >
                <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{es ? 'Borrar borrador' : 'Clear draft'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Non-blocking Undo toast after Clear Draft (A10) */}
      {undoDraft && (
        <div
          role="status"
          aria-live="polite"
          className="no-print rounded-2xl border border-amber-400/60 bg-slate-900 px-4 py-3 flex flex-wrap items-center justify-between gap-3"
        >
          <span className="text-sm font-semibold text-amber-200">
            {es ? 'Borrador borrado de este dispositivo.' : 'Draft cleared from this device.'}
          </span>
          <button
            type="button"
            onClick={handleUndoClearDraft}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-black text-sm cursor-pointer dn-pressable"
          >
            <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{es ? 'Deshacer borrado' : 'Undo clear draft'}</span>
          </button>
        </div>
      )}

      {/* Payment verification / canceled / confirmed status banner (A18) */}
      {(isVerifyingPayment || paymentBanner) && (
        <div
          role={paymentBanner?.kind === 'error' ? 'alert' : 'status'}
          aria-live={paymentBanner?.kind === 'error' ? 'assertive' : 'polite'}
          className={`no-print rounded-2xl border px-4 py-3.5 text-sm font-semibold flex items-start gap-3 ${
            paymentBanner?.kind === 'error'
              ? 'border-rose-400 bg-rose-950/60 text-rose-100'
              : paymentBanner?.kind === 'success'
                ? 'border-emerald-400 bg-emerald-950/60 text-emerald-100'
                : 'border-sky-400 bg-slate-900 text-sky-100'
          }`}
        >
          {paymentBanner?.kind === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" aria-hidden="true" />
          ) : paymentBanner?.kind === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <Info className="w-5 h-5 text-sky-300 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <div className="flex-1">
            {isVerifyingPayment
              ? es
                ? 'Verificando pago con el servidor...'
                : 'Verifying payment with the server...'
              : paymentBanner?.text}
          </div>
          {!isVerifyingPayment && paymentBanner && (
            <button
              type="button"
              onClick={() => setPaymentBanner(null)}
              className="inline-flex items-center gap-1 min-h-[44px] px-3 rounded-lg border border-slate-600 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              <span>{es ? 'Cerrar' : 'Dismiss'}</span>
            </button>
          )}
        </div>
      )}

      {/* Hero: Plain 6th-grade purpose + next step + upfront tool limits (A1, A2, A11) */}
      <section className="space-y-4 no-print">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
          {es
            ? 'Escriba una carta de disputa para una factura o deuda injusta'
            : 'Write a dispute letter for an unfair bill or debt'}
        </h1>
        <p className="text-base text-slate-200 max-w-2xl">
          {es
            ? 'Elija su tipo de disputa, escriba los datos de su aviso y revise una lista gratuita con vista previa antes de pagar.'
            : 'Pick your dispute type, enter the facts from your notice, and review a free checklist and letter preview before paying anything.'}
        </p>

        {/* Upfront expectation + concrete limitation notice (A11) */}
        <div className="rounded-2xl border border-slate-700 bg-slate-900/90 p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-300 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-slate-200 leading-relaxed">
            <strong className="text-white">
              {es ? 'Qué hace y qué no hace:' : 'What this tool does and cannot do:'}
            </strong>{' '}
            {es
              ? 'Crea una plantilla de carta de autoayuda y una lista general usando leyes federales. No lee su factura completa, no revisa reglas locales de su corte y no es asesoría legal. Revise cada nombre, fecha y monto antes de enviarla.'
              : 'It builds a self-help letter template and checklist using federal consumer laws. It cannot read your full bill, check local court rules, or give legal advice. Always check every name, date, and dollar amount before mailing.'}
          </p>
        </div>

        {/* 3-step structure indicator (A3) */}
        <nav aria-label={es ? 'Pasos de la disputa' : 'Dispute steps'}>
          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              { step: 1 as const, label: es ? 'Paso 1 de 3: Sus datos' : 'Step 1 of 3: Enter details' },
              { step: 2 as const, label: es ? 'Paso 2 de 3: Revisar y vista previa' : 'Step 2 of 3: Check & preview' },
              { step: 3 as const, label: es ? 'Paso 3 de 3: Desbloquear y enviar' : 'Step 3 of 3: Unlock & send' },
            ].map((item) => {
              const isCurrent = activeStep === item.step
              const isDone = activeStep > item.step
              return (
                <li
                  key={item.step}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`rounded-xl border px-3.5 py-2.5 text-sm font-bold flex items-center gap-2 ${
                    isCurrent
                      ? 'border-emerald-400 bg-emerald-500/15 text-white'
                      : isDone
                        ? 'border-slate-600 bg-slate-900 text-emerald-300'
                        : 'border-slate-800 bg-slate-950 text-slate-300'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                  ) : (
                    <span
                      aria-hidden="true"
                      className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black shrink-0 ${
                        isCurrent ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-200'
                      }`}
                    >
                      {item.step}
                    </span>
                  )}
                  <span>{item.label}</span>
                </li>
              )
            })}
          </ol>
        </nav>
      </section>

      {/* UNLOCKED WORKSPACE (Step 3 completed) */}
      {isUnlocked ? (
        <section className="rounded-3xl bg-slate-900 border-2 border-emerald-400/70 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 no-print">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-emerald-300 text-sm font-bold">
                <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>{es ? 'Paso 3 de 3 — Pago confirmado' : 'Step 3 of 3 — Payment confirmed'}</span>
              </div>
              <h2 ref={unlockedHeadingRef} tabIndex={-1} className="text-2xl font-black text-white outline-none">
                {es ? 'Su carta de disputa está lista' : 'Your dispute letter is ready'}
              </h2>
              <p className="text-sm text-slate-200">
                {es
                  ? 'Revise cada nombre, fecha y monto abajo. Puede editar el texto directamente antes de copiar, imprimir o descargar.'
                  : 'Check every name, date, and dollar amount below. You can edit the text directly before copying, printing, or downloading.'}
              </p>
            </div>
          </div>

          {/* Action buttons with visible text labels & >=48px touch targets (A14, A16) */}
          <div className="flex flex-wrap gap-2.5 no-print">
            <button
              type="button"
              onClick={handleCopyLetter}
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm cursor-pointer dn-pressable"
            >
              {copiedLetter ? <Check className="w-4 h-4 shrink-0" aria-hidden="true" /> : <ClipboardCopy className="w-4 h-4 shrink-0" aria-hidden="true" />}
              <span>{copiedLetter ? (es ? 'Carta copiada' : 'Letter copied') : es ? 'Copiar carta' : 'Copy letter'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-xl border border-slate-500 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm cursor-pointer dn-pressable"
            >
              <Printer className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{es ? 'Imprimir carta' : 'Print letter'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadLetterTxt}
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-xl border border-slate-500 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm cursor-pointer dn-pressable"
            >
              <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{es ? 'Descargar .txt' : 'Download .txt'}</span>
            </button>

            {editableLetter !== originalLetter && (
              <button
                type="button"
                onClick={() => {
                  setEditableLetter(originalLetter)
                  announce(es ? 'Carta restaurada al texto original.' : 'Letter reset to original text.')
                }}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-4 rounded-xl border border-amber-400/70 bg-slate-950 hover:bg-slate-800 text-amber-200 font-bold text-sm cursor-pointer dn-pressable"
              >
                <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{es ? 'Deshacer ediciones' : 'Reset edits'}</span>
              </button>
            )}
          </div>

          {/* Editable letter box (easy correction — A11) */}
          <div className="space-y-2">
            <label htmlFor="unlocked-letter-editor" className="block text-sm font-bold text-white no-print">
              {es ? 'Texto de su carta (editable)' : 'Your letter text (editable)'}
            </label>
            <textarea
              id="unlocked-letter-editor"
              rows={18}
              value={editableLetter}
              onChange={(e) => setEditableLetter(e.target.value)}
              className="w-full rounded-2xl bg-slate-950 border border-slate-500 p-4 font-mono text-sm text-slate-100 leading-relaxed resize-y no-print"
            />
            <pre className="hidden print:block print-letter-only whitespace-pre-wrap font-serif">
              {editableLetter}
            </pre>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-200 space-y-1 no-print">
            <p className="font-bold text-white">{es ? 'Próximo paso para enviarla:' : 'Next step to mail it:'}</p>
            <p>
              {es
                ? 'Imprima la carta, fírmela y envíela usted mismo por Correo Certificado de USPS con acuse de recibo. Guarde una copia y el recibo postal.'
                : 'Print the letter, sign it, and mail it yourself by USPS Certified Mail with Return Receipt Requested. Keep a copy and your mailing receipt.'}
            </p>
          </div>
        </section>
      ) : (
        /* STEP 1 FORM + STEP 2 CHECKLIST & PREVIEW */
        <div className="space-y-8 no-print">
          <form
            onSubmit={handleAnalyzeSubmit}
            noValidate
            aria-labelledby={formHeadingId}
            className="rounded-3xl bg-slate-900 border border-slate-700 p-5 sm:p-8 space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id={formHeadingId} className="text-xl font-black text-white">
                {es ? 'Paso 1: Elija el tipo de disputa y escriba los datos' : 'Step 1: Pick your dispute type and enter details'}
              </h2>
              <span className="text-xs sm:text-sm font-semibold text-emerald-300">
                {es ? 'Vista previa gratis' : 'Free checklist & preview'}
              </span>
            </div>

            {/* 4 Mutually exclusive options as native radios inside fieldset/legend (modern-web-guidance: forms, A8) */}
            <fieldset className="space-y-2.5">
              <legend className="text-sm font-bold text-white">
                {es ? 'Tipo de disputa' : 'Dispute type'}
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {(Object.keys(disputeConfig) as DisputeCategory[]).map((key) => {
                  const item = disputeConfig[key]
                  const isSelected = disputeType === key
                  const radioId = `dispute-type-${key}`
                  return (
                    <label
                      key={key}
                      htmlFor={radioId}
                      className={`relative p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between gap-2 cursor-pointer min-h-[88px] dn-pressable ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-500/15 text-white'
                          : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            id={radioId}
                            type="radio"
                            name="disputeType"
                            value={key}
                            checked={isSelected}
                            onChange={() => {
                              setDisputeType(key)
                              setAnalysisResult(null)
                              setAnalyzeError('')
                            }}
                            className="w-5 h-5 accent-emerald-400 shrink-0 cursor-pointer"
                          />
                          <span className="text-sm font-extrabold text-white">{item.title}</span>
                        </div>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-400 text-slate-950 text-[11px] font-black shrink-0">
                            <Check className="w-3 h-3" aria-hidden="true" />
                            <span>{es ? 'Elegido' : 'Selected'}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-300 leading-snug">{item.sub}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            {/* Worked examples for all 4 dispute types (A4: worked-example effect) */}
            <div className="rounded-2xl bg-slate-950 border border-slate-700 p-4 space-y-2.5">
              <p className="text-sm font-bold text-slate-100">
                {es ? '¿Primera vez? Pruebe un ejemplo completo con 1 toque:' : 'First time here? Load a worked example with 1 tap:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(disputeConfig) as DisputeCategory[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleLoadSample(key)}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-600 text-xs sm:text-sm font-bold text-sky-200 cursor-pointer dn-pressable"
                  >
                    {disputeConfig[key].sampleChip}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary form fields — hints placed ABOVE inputs so autofill popovers don't cover them (modern-web-guidance: accessibility) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label htmlFor="creditor-name" className="block text-sm font-bold text-white">
                  {curConfig.nameLabel} <span className="text-rose-300" aria-hidden="true">*</span>
                </label>
                <p id="creditor-name-hint" className="text-xs text-slate-300">
                  {curConfig.nameHint}
                </p>
                <input
                  ref={creditorInputRef}
                  id="creditor-name"
                  name="creditorName"
                  type="text"
                  required
                  enterKeyHint="next"
                  placeholder={curConfig.namePlaceholder}
                  value={creditorName}
                  aria-invalid={Boolean(fieldErrors.creditorName)}
                  aria-describedby={
                    fieldErrors.creditorName ? 'creditor-name-hint creditor-name-error' : 'creditor-name-hint'
                  }
                  onBlur={(e) => handleFieldBlur('creditorName', e.target.value)}
                  onChange={(e) => {
                    setCreditorName(e.target.value)
                    if (touched.creditorName && fieldErrors.creditorName) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        creditorName: validateField('creditorName', e.target.value),
                      }))
                    }
                  }}
                  className={`w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-950 border text-white placeholder:text-slate-400 ${
                    fieldErrors.creditorName ? 'border-rose-400' : 'border-slate-500'
                  }`}
                />
                {fieldErrors.creditorName && (
                  <p id="creditor-name-error" role="alert" className="text-sm font-semibold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{fieldErrors.creditorName}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="disputed-amount" className="block text-sm font-bold text-white">
                  {curConfig.amountLabel} <span className="text-rose-300" aria-hidden="true">*</span>
                </label>
                <p id="disputed-amount-hint" className="text-xs text-slate-300">
                  {es ? 'Solo números (ejemplo: 1450 o 280.50).' : 'Numbers only (example: 1450 or 280.50).'}
                </p>
                <input
                  ref={amountInputRef}
                  id="disputed-amount"
                  name="disputedAmount"
                  type="text"
                  inputMode="decimal"
                  required
                  enterKeyHint="next"
                  placeholder={curConfig.amountPlaceholder}
                  value={disputedAmount}
                  aria-invalid={Boolean(fieldErrors.disputedAmount)}
                  aria-describedby={
                    fieldErrors.disputedAmount ? 'disputed-amount-hint disputed-amount-error' : 'disputed-amount-hint'
                  }
                  onBlur={(e) => handleFieldBlur('disputedAmount', e.target.value)}
                  onChange={(e) => {
                    setDisputedAmount(e.target.value)
                    if (touched.disputedAmount && fieldErrors.disputedAmount) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        disputedAmount: validateField('disputedAmount', e.target.value),
                      }))
                    }
                  }}
                  className={`w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-950 border text-white font-mono placeholder:text-slate-400 ${
                    fieldErrors.disputedAmount ? 'border-rose-400' : 'border-slate-500'
                  }`}
                />
                {fieldErrors.disputedAmount && (
                  <p id="disputed-amount-error" role="alert" className="text-sm font-semibold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{fieldErrors.disputedAmount}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="user-name" className="block text-sm font-bold text-white">
                {es ? 'Su nombre completo (opcional)' : 'Your full name (optional)'}
              </label>
              <p id="user-name-hint" className="text-xs text-slate-300">
                {es
                  ? 'Se coloca en la línea de firma de la carta. Si lo deja vacío, podrá escribirlo después.'
                  : 'Used on the letter signature line. Leave blank if you prefer to write it in after printing.'}
              </p>
              <input
                ref={userNameInputRef}
                id="user-name"
                name="userName"
                type="text"
                autoComplete="name"
                enterKeyHint="next"
                placeholder={es ? 'Ej. María López' : 'Example: Jordan Taylor'}
                value={userName}
                aria-describedby="user-name-hint"
                onChange={(e) => setUserName(e.target.value)}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-500 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <label htmlFor="bill-text" className="block text-sm font-bold text-white">
                  {curConfig.textLabel} <span className="text-rose-300" aria-hidden="true">*</span>
                </label>
                <span className="text-xs text-slate-300">
                  {es ? 'No guardamos sus datos en servidores' : 'Not stored on our servers'}
                </span>
              </div>
              <p id="bill-text-hint" className="text-xs text-slate-300">
                {curConfig.textHint}
              </p>
              <textarea
                ref={billTextRef}
                id="bill-text"
                name="billText"
                rows={4}
                required
                minLength={10}
                placeholder={curConfig.textPlaceholder}
                value={billText}
                aria-invalid={Boolean(fieldErrors.billText)}
                aria-describedby={fieldErrors.billText ? 'bill-text-hint bill-text-error' : 'bill-text-hint'}
                onBlur={(e) => handleFieldBlur('billText', e.target.value)}
                onChange={(e) => {
                  setBillText(e.target.value)
                  if (touched.billText && fieldErrors.billText) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      billText: validateField('billText', e.target.value),
                    }))
                  }
                }}
                className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-white placeholder:text-slate-400 resize-y ${
                  fieldErrors.billText ? 'border-rose-400' : 'border-slate-500'
                }`}
              />
              {fieldErrors.billText && (
                <p id="bill-text-error" role="alert" className="text-sm font-semibold text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{fieldErrors.billText}</span>
                </p>
              )}
            </div>

            {/* Progressive disclosure (1 level deep, front-loaded meaning — A3) */}
            <details className="rounded-2xl border border-slate-700 bg-slate-950 p-4">
              <summary className="min-h-[44px] flex items-center justify-between gap-2 text-sm font-bold text-sky-200 cursor-pointer list-none">
                <span>
                  {es
                    ? 'Opcional: Agregar número de cuenta y fecha del aviso'
                    : 'Optional: Add account number and notice date'}
                </span>
                <span className="text-xs text-slate-300 font-normal">
                  {es ? 'Abrir / cerrar' : 'Expand / collapse'}
                </span>
              </summary>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="space-y-1.5">
                  <label htmlFor="account-num" className="block text-sm font-bold text-white">
                    {es ? 'Número de cuenta o factura' : 'Account or invoice number'}
                  </label>
                  <p id="account-num-hint" className="text-xs text-slate-300">
                    {es ? 'Ejemplo: ACC-48219 (solo los últimos 4 dígitos bastan).' : 'Example: ACC-48219 (last 4 digits are enough).'}
                  </p>
                  <input
                    ref={accountInputRef}
                    id="account-num"
                    name="accountNum"
                    type="text"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder="ACC-48219"
                    value={accountNum}
                    aria-describedby="account-num-hint"
                    onChange={(e) => setAccountNum(e.target.value)}
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-500 text-white font-mono placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="notice-date" className="block text-sm font-bold text-white">
                    {es ? 'Fecha del aviso o factura' : 'Date on the bill or notice'}
                  </label>
                  <p id="notice-date-hint" className="text-xs text-slate-300">
                    {es ? 'Le ayuda a revisar plazos de 30 días.' : 'Helps you track 30-day dispute deadlines.'}
                  </p>
                  <input
                    id="notice-date"
                    name="noticeDate"
                    type="date"
                    value={noticeDate}
                    aria-describedby="notice-date-hint"
                    onChange={(e) => setNoticeDate(e.target.value)}
                    className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-500 text-white"
                  />
                </div>
              </div>
            </details>

            {/* Primary CTA — focal point of Step 1; NEVER disabled to block validation (modern-web-guidance: forms, A2, A6) */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isAnalyzing}
                className="flex-1 min-h-[52px] px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-base shadow-lg cursor-pointer disabled:opacity-60 inline-flex items-center justify-center gap-2 dn-pressable"
              >
                <FileText className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>
                  {isAnalyzing
                    ? es
                      ? 'Creando lista y vista previa...'
                      : 'Building checklist and preview...'
                    : es
                      ? 'Ver lista de revisión y vista previa (Gratis)'
                      : 'Build Free Checklist & Letter Preview'}
                </span>
                {!isAnalyzing && <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />}
              </button>

              {isAnalyzing && (
                <button
                  type="button"
                  onClick={handleCancelAnalyze}
                  className="min-h-[52px] px-5 rounded-2xl border border-slate-500 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm cursor-pointer dn-pressable"
                >
                  {es ? 'Cancelar' : 'Cancel'}
                </button>
              )}
            </div>

            {isAnalyzing && (
              <div className="space-y-1.5">
                <progress
                  aria-label={es ? 'Cargando vista previa' : 'Building preview'}
                  className="w-full h-2 rounded overflow-hidden accent-emerald-400"
                />
                <p className="text-xs text-slate-300">
                  {es ? 'Preparando lista general y vista previa de la carta...' : 'Preparing your general checklist and letter preview...'}
                </p>
              </div>
            )}

            {/* Actionable error state — never clears input (A12, A22) */}
            {analyzeError && (
              <div role="alert" className="rounded-2xl border border-rose-400 bg-rose-950/60 p-4 text-sm text-rose-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{analyzeError}</span>
                </div>
                <button
                  type="submit"
                  className="min-h-[44px] px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-sm cursor-pointer"
                >
                  {es ? 'Reintentar' : 'Try again'}
                </button>
              </div>
            )}
          </form>

          {/* STEP 2: Designed empty state BEFORE preview OR full checklist + inspectable sources + preview (A3, A11, A22) */}
          {!analysisResult ? (
            <section className="rounded-3xl bg-slate-900/70 border border-dashed border-slate-600 p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-black text-white">
                {es ? 'Paso 2: Su lista de revisión y vista previa aparecerán aquí' : 'Step 2: Your checklist and letter preview will appear here'}
              </h2>
              <p className="text-sm text-slate-200 max-w-2xl">
                {es
                  ? 'Después de completar el Paso 1, verá: (1) una lista de puntos clave para revisar, (2) enlaces directos a las leyes federales oficiales y (3) la vista previa de su carta antes de decidir si desea desbloquearla.'
                  : 'After you complete Step 1, this area shows: (1) a plain checklist of things to verify, (2) clickable links to official federal statutes, and (3) a preview of your letter before you decide whether to unlock it.'}
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => handleLoadSample(disputeType)}
                  className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border border-slate-500 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold cursor-pointer dn-pressable"
                >
                  <BookOpen className="w-4 h-4 text-emerald-300 shrink-0" aria-hidden="true" />
                  <span>
                    {es ? `Cargar ejemplo de ${curConfig.title}` : `Load ${curConfig.title} worked example`}
                  </span>
                </button>
              </div>
            </section>
          ) : (
            <section className="rounded-3xl bg-slate-900 border border-emerald-500/50 p-5 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    {es ? 'Paso 2 de 3 — Revisión gratuita' : 'Step 2 of 3 — Free review'}
                  </span>
                  <h2 ref={step2HeadingRef} tabIndex={-1} className="text-2xl font-black text-white mt-1 outline-none">
                    {es ? 'Revise sus datos y lista de verificación' : 'Review your facts, sources, and preview'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => jumpToField('creditorName')}
                  className="min-h-[44px] px-4 rounded-xl border border-slate-500 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold cursor-pointer dn-pressable"
                >
                  {es ? 'Editar datos' : 'Edit details'}
                </button>
              </div>

              {/* Persistent summary of Step 1 facts so user never carries facts in memory (A3) */}
              <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 rounded-2xl bg-slate-950 border border-slate-700 p-4 text-sm">
                <div>
                  <dt className="text-xs font-semibold text-slate-300">{es ? 'Tipo' : 'Dispute type'}</dt>
                  <dd className="font-bold text-white mt-0.5">{curConfig.title}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-300">{es ? 'Empresa' : 'Company'}</dt>
                  <dd className="font-bold text-white mt-0.5 break-words">{creditorName || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-300">{es ? 'Monto' : 'Amount'}</dt>
                  <dd className="font-bold text-white font-mono mt-0.5">${disputedAmount || '0.00'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-slate-300">{es ? 'Su nombre' : 'Your name'}</dt>
                  <dd className="font-bold text-white mt-0.5 break-words">
                    {userName || (es ? 'Por agregar al imprimir' : 'Add before signing')}
                  </dd>
                </div>
              </dl>

              {/* Per-field uncertainty / missing-info flags (A11: specific per-field flags, no fake %) */}
              {analysisResult.fieldChecks && analysisResult.fieldChecks.length > 0 && (
                <div className="rounded-2xl border border-amber-400/60 bg-amber-950/30 p-4 space-y-2.5">
                  <h3 className="text-sm font-black text-amber-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{es ? 'Campos para revisar antes de enviar' : 'Fields to check before sending'}</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-amber-100">
                    {analysisResult.fieldChecks.map((fc, idx) => (
                      <li key={idx} className="flex flex-wrap items-center justify-between gap-2">
                        <span>{fc.message}</span>
                        <button
                          type="button"
                          onClick={() => jumpToField(fc.field)}
                          className="min-h-[44px] px-3 rounded-lg border border-amber-300/60 bg-slate-900 hover:bg-slate-800 text-amber-200 text-xs font-bold cursor-pointer"
                        >
                          {es ? 'Completar campo' : 'Fix field'}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Honest general checklist (never fake "detected violations") */}
              <div className="rounded-2xl bg-slate-950 border border-slate-700 p-5 space-y-3">
                <h3 className="text-base font-black text-white">
                  {es ? 'Puntos clave para revisar en sus documentos' : 'Checklist: things worth checking on your notice'}
                </h3>
                <p className="text-sm text-slate-200">{analysisResult.summary}</p>
                <ul className="space-y-2.5 pt-1">
                  {analysisResult.violations.map((v, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" aria-hidden="true" />
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Inspectable legal sources (A11: verifiable clickable sources) */}
              {analysisResult.statutes && analysisResult.statutes.length > 0 && (
                <div className="rounded-2xl bg-slate-950 border border-slate-700 p-5 space-y-3">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-sky-300 shrink-0" aria-hidden="true" />
                    <span>{es ? 'Fuentes legales oficiales (verificar usted mismo)' : 'Official law sources (verify directly)'}</span>
                  </h3>
                  <ul className="space-y-2">
                    {analysisResult.statutes.map((src) => (
                      <li key={src.url}>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 min-h-[44px] text-sm font-semibold text-sky-300 hover:text-sky-200 underline underline-offset-4"
                        >
                          <span>
                            {src.code}: {src.title}
                          </span>
                          <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Letter Preview + Clear Unlock CTA */}
              <div className="rounded-2xl bg-slate-950 border border-slate-600 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-black text-white">
                    {es ? 'Vista previa de la carta' : 'Letter preview'}
                  </h3>
                  <span className="text-xs font-semibold text-slate-300">
                    {es ? 'Plantilla de autoayuda — usted la imprime y envía' : 'Self-help template — you print and mail it'}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-slate-200 bg-slate-900 border border-slate-700 rounded-xl p-4 overflow-x-auto">
                  {analysisResult.letterPreview}
                </pre>

                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => openCheckoutConfirm('letter')}
                    disabled={isCheckingOut}
                    className="flex-1 min-h-[52px] px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base cursor-pointer inline-flex items-center justify-center gap-2 dn-pressable"
                  >
                    {hasPlayBilling ? <Smartphone className="w-5 h-5 shrink-0" aria-hidden="true" /> : <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />}
                    <span>
                      {es ? 'Desbloquear Carta Única — $9.99' : 'Unlock Single Dispute Letter — $9.99'}
                    </span>
                    <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openCheckoutConfirm('kit')}
                    disabled={isCheckingOut}
                    className="min-h-[52px] px-5 py-3 rounded-xl border border-emerald-400/70 bg-slate-900 hover:bg-slate-800 text-emerald-200 font-bold text-sm cursor-pointer inline-flex items-center justify-center gap-2 dn-pressable"
                  >
                    <span>{es ? 'O ver Paquete de 5 Cartas — $19' : 'Or get 5-Letter Dispute Kit — $19'}</span>
                  </button>
                </div>

                {unlockError && (
                  <p role="alert" className="text-sm font-semibold text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{unlockError}</span>
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      )}

      {/* PRICING: Clean 2-option side-by-side comparison, no pre-checked upsells, active choice only (A20) */}
      <section id="pricing" className="rounded-3xl bg-slate-900 border border-slate-700 p-5 sm:p-8 space-y-6 no-print">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-white">
            {es ? 'Precios claros — pago único, sin suscripciones' : 'Clear pricing — one-time payment, no subscriptions'}
          </h2>
          <p className="text-sm text-slate-200">
            {es
              ? 'Compare las 2 opciones. Confirmará los detalles antes de ir al pago.'
              : 'Compare the 2 options. You will review and confirm the exact total before checkout opens.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1 */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-600 flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-white">
                    {es ? 'Carta Única de Disputa' : 'Single Dispute Letter'}
                  </h3>
                  <p className="text-sm text-slate-300">
                    {es ? 'Ideal si solo tiene 1 factura o cobrador' : 'Best when you have 1 bill or collector'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-black text-white">$9.99</span>
                  <span className="block text-xs text-slate-300">{es ? 'pago único' : 'one-time'}</span>
                </div>
              </div>
              <ul className="text-sm text-slate-200 space-y-2 pt-3 border-t border-slate-800">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" aria-hidden="true" />
                  <span>{es ? 'Completada con los datos de su disputa' : 'Filled in with the dispute details you entered'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" aria-hidden="true" />
                  <span>{es ? 'Editable en pantalla, lista para copiar, imprimir o descargar' : 'Editable on screen, ready to copy, print, or download'}</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => openCheckoutConfirm('letter')}
              disabled={isCheckingOut}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-slate-400 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm cursor-pointer inline-flex items-center justify-center gap-2 dn-pressable"
            >
              <span>{es ? 'Elegir Carta Única — $9.99' : 'Choose Single Letter — $9.99'}</span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          </div>

          {/* Option 2 */}
          <div className="p-6 rounded-2xl bg-slate-950 border-2 border-emerald-400 flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-white">
                    {es ? 'Paquete de 5 Cartas de Disputa' : '5-Letter Dispute Kit'}
                  </h3>
                  <p className="text-sm text-emerald-200">
                    {es ? 'Ideal si pelea varias cuentas o facturas' : 'Best if you are handling multiple bills or bureaus'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-black text-emerald-300">$19</span>
                  <span className="block text-xs text-slate-300">{es ? 'pago único' : 'one-time'}</span>
                </div>
              </div>
              <ul className="text-sm text-slate-200 space-y-1.5 pt-3 border-t border-slate-800">
                {[
                  es ? '1. Solicitud de factura médica detallada' : '1. Medical bill itemized request',
                  es ? '2. Disputa de cobro sorpresa (No Surprises Act)' : '2. No Surprises Act medical dispute',
                  es ? '3. Validación de deuda para cobradores (FDCPA)' : '3. Debt collector validation letter (FDCPA)',
                  es ? '4. Demanda de depósito de renta' : '4. Security deposit return letter',
                  es ? '5. Aviso de investigación a burós de crédito (FCRA)' : '5. Credit bureau dispute notice (FCRA)',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" aria-hidden="true" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => openCheckoutConfirm('kit')}
              disabled={isCheckingOut}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm cursor-pointer inline-flex items-center justify-center gap-2 dn-pressable"
            >
              <span>{es ? 'Elegir Paquete de 5 Cartas — $19' : 'Choose 5-Letter Kit — $19'}</span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300">
          {es
            ? 'Plantillas digitales de autoayuda — no imprimimos ni enviamos cartas por correo y no damos asesoría legal ni garantizamos resultados.'
            : 'Digital self-help templates only — we do not print or mail letters for you, we do not give legal advice, and we cannot promise any outcome.'}
        </p>
      </section>

      {/* FREE CREDIT BUREAU HUB — Grouped by meaning + preview before leaving app (A3, A10) */}
      <section className="rounded-3xl bg-slate-900 border border-slate-700 p-5 sm:p-8 space-y-6 no-print">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-black text-white">
            {es ? 'Dispute gratis en los portales oficiales de burós' : 'Free official credit bureau & regulator portals'}
          </h2>
          <p className="text-sm text-slate-200">
            {es
              ? 'Toque un portal para revisar el texto que se copiará antes de abrir el sitio oficial en una nueva pestaña.'
              : 'Pick a portal to preview the text that will be copied before opening the official site in a new tab.'}
          </p>
        </div>

        {bureauStatus && (
          <div role="status" aria-live="polite" className="rounded-xl border border-emerald-400/60 bg-emerald-950/50 px-4 py-3 text-sm font-semibold text-emerald-100">
            {bureauStatus}
          </div>
        )}

        <div className="space-y-5">
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              {es ? '3 burós principales de crédito' : '3 major credit bureaus'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {majorBureaus.map((item) => (
                <div
                  key={item.bureau}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-700 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-sky-300">{item.badge}</span>
                    <h4 className="text-base font-extrabold text-white">{item.name}</h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openBureauPreview(item)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-500 bg-slate-900 hover:bg-slate-800 text-sm font-bold text-white cursor-pointer inline-flex items-center justify-center gap-2 dn-pressable"
                  >
                    <span>{es ? `Abrir ${item.bureau}` : `Open ${item.bureau}`}</span>
                    <ExternalLink className="w-4 h-4 shrink-0 text-sky-300" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              {es ? '4º buró y regulador federal' : '4th credit bureau & federal regulator'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {otherBureaus.map((item) => (
                <div
                  key={item.bureau}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-700 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-emerald-300">{item.badge}</span>
                    <h4 className="text-base font-extrabold text-white">{item.name}</h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openBureauPreview(item)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-500 bg-slate-900 hover:bg-slate-800 text-sm font-bold text-white cursor-pointer inline-flex items-center justify-center gap-2 dn-pressable"
                  >
                    <span>{es ? `Abrir ${item.bureau}` : `Open ${item.bureau}`}</span>
                    <ExternalLink className="w-4 h-4 shrink-0 text-emerald-300" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FREE GUIDES & STATE RIGHTS LINKS */}
      <section className="rounded-3xl bg-slate-900/70 border border-slate-800 p-5 sm:p-8 space-y-5 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-black text-white">
            {es ? 'Guías gratuitas y límites de tiempo por estado' : 'Free dispute guides & state time limits'}
          </h2>
          <Link
            href="/debt-rights"
            className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl border border-slate-600 bg-slate-950 hover:bg-slate-800 text-sm font-bold text-sky-300"
          >
            <span>{es ? 'Ver todos los estados' : 'Look up your state'}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              href: '/dispute/debt-collector-validation-letter',
              tag: 'FDCPA § 809',
              title: es ? 'Validación de cobrador de deuda' : 'Debt collector validation guide',
            },
            {
              href: '/dispute/emergency-room-surprise-bill',
              tag: 'No Surprises Act',
              title: es ? 'Pelear facturas médicas sorpresa' : 'ER surprise medical bill guide',
            },
            {
              href: '/dispute/medical-debt-credit-report-removal',
              tag: 'FCRA § 611',
              title: es ? 'Disputar errores en burós de crédito' : 'Credit report error guide',
            },
            {
              href: '/dispute/security-deposit-demand-letter',
              tag: es ? 'Inquilinos' : 'Tenant rights',
              title: es ? 'Recuperar depósito de renta' : 'Security deposit return guide',
            },
          ].map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="min-h-[76px] p-4 rounded-2xl bg-slate-950 border border-slate-700 hover:border-emerald-400 flex flex-col justify-between gap-1.5 dn-pressable"
            >
              <span className="text-xs font-bold text-emerald-300">{g.tag}</span>
              <span className="text-sm font-bold text-white">{g.title}</span>
            </Link>
          ))}
        </div>

        {/* Calm phone hotline card */}
        <div className="rounded-2xl bg-slate-950 border border-slate-700 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-bold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>{es ? 'Línea automatizada 24/7: (520) 357-1814' : '24/7 Automated Phone Helper: (520) 357-1814'}</span>
            </p>
            <p className="text-xs sm:text-sm text-slate-300">
              {es
                ? 'Asistente telefónico automatizado con información general (no es un abogado).'
                : 'Automated voice helper with general consumer rights info (not a lawyer).'}
            </p>
          </div>
          <a
            href="tel:5203571814"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-xl border border-emerald-400/70 bg-slate-900 hover:bg-slate-800 text-emerald-200 font-bold text-sm shrink-0 dn-pressable"
          >
            <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{es ? 'Llamar ahora' : 'Call hotline'}</span>
          </a>
        </div>
      </section>

      {/* NATIVE <dialog> 1: Consequential Checkout Confirmation (A10, A11, A17, A18) */}
      <dialog
        ref={checkoutDialogRef}
        aria-labelledby={checkoutTitleId}
        {...({ closedby: 'any' } as Record<string, string>)}
        onClose={() => {
          if (checkoutDialogRef.current) checkoutDialogRef.current.returnValue = ''
        }}
      >
        <div className="w-full rounded-2xl bg-slate-900 border border-slate-500 p-6 shadow-2xl space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 id={checkoutTitleId} className="text-xl font-black text-white">
                {pendingProduct === 'kit'
                  ? es
                    ? 'Confirmar compra: Paquete de 5 Cartas ($19)'
                    : 'Confirm purchase: 5-Letter Dispute Kit ($19)'
                  : es
                    ? 'Confirmar compra: Carta Única ($9.99)'
                    : 'Confirm purchase: Single Dispute Letter ($9.99)'}
              </h1>
              <p className="text-sm text-slate-200 mt-1">
                {hasPlayBilling
                  ? es
                    ? 'Pago único procesado por Google Play.'
                    : 'One-time charge processed by Google Play.'
                  : es
                    ? 'Pago único procesado en Stripe Checkout. Sin suscripción.'
                    : 'One-time charge processed on Stripe Checkout. No subscription.'}
              </p>
            </div>
            <form method="dialog">
              <button
                type="submit"
                value="cancel"
                className="inline-flex items-center gap-1 min-h-[44px] px-3 rounded-xl border border-slate-600 bg-slate-800 text-sm font-bold text-white hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
                <span>{es ? 'Cerrar' : 'Close'}</span>
              </button>
            </form>
          </div>

          {/* Exact recipient, content, and consequence preview (A10) */}
          <dl className="rounded-xl bg-slate-950 border border-slate-700 p-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-300">{es ? 'Producto:' : 'Item:'}</dt>
              <dd className="font-bold text-white text-right">
                {pendingProduct === 'kit'
                  ? es
                    ? 'Paquete de 5 Cartas (ZIP)'
                    : '5-Letter Dispute Kit (ZIP download)'
                  : es
                    ? `Carta Única (${curConfig.title})`
                    : `Single Letter (${curConfig.title})`}
              </dd>
            </div>
            {pendingProduct === 'letter' && (
              <>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-300">{es ? 'Empresa:' : 'Company:'}</dt>
                  <dd className="font-bold text-white text-right">{creditorName.trim() || (es ? 'Por agregar' : 'Not entered')}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-300">{es ? 'Monto:' : 'Amount:'}</dt>
                  <dd className="font-bold text-white font-mono text-right">${disputedAmount.trim() || '0.00'}</dd>
                </div>
              </>
            )}
            <div className="flex justify-between gap-4 pt-2 border-t border-slate-800">
              <dt className="text-slate-200 font-bold">{es ? 'Total único:' : 'One-time total:'}</dt>
              <dd className="font-black text-emerald-300">{pendingProduct === 'kit' ? '$19.00' : '$9.99'}</dd>
            </div>
          </dl>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {es
              ? 'Recibirá una plantilla digital en pantalla o descarga. Nosotros no enviamos cartas por correo postal y esto no es asesoría legal.'
              : 'You will receive a digital template on screen or as a download. We do not print or mail letters for you, and this is not legal advice.'}
          </p>

          {/* Cognitive forcing check step for costly legal/money action (A11) */}
          <div className="rounded-xl border border-slate-600 bg-slate-950 p-3.5 space-y-2">
            <label htmlFor="confirm-facts-check" className="flex items-start gap-3 cursor-pointer">
              <input
                id="confirm-facts-check"
                type="checkbox"
                checked={factsChecked}
                onChange={(e) => {
                  setFactsChecked(e.target.checked)
                  if (e.target.checked) setFactsCheckError('')
                }}
                className="w-5 h-5 mt-0.5 accent-emerald-400 shrink-0 cursor-pointer"
              />
              <span className="text-sm text-slate-100 leading-snug">
                {es
                  ? 'Revisé el nombre de la empresa, el monto y los detalles, y entiendo que es una plantilla de autoayuda, no asesoría legal.'
                  : 'I checked the company name, dollar amount, and details, and I understand this is a self-help template, not legal advice.'}
              </span>
            </label>
            {factsCheckError && (
              <p role="alert" className="text-sm font-semibold text-rose-300">
                {factsCheckError}
              </p>
            )}
          </div>

          {unlockError && (
            <p role="alert" className="text-sm font-semibold text-rose-300">
              {unlockError}
            </p>
          )}

          {/* Safe Cancel action receives autoFocus; confirm button names exact action & amount (A10, modern-web-guidance: dialog) */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5">
            <form method="dialog" className="sm:w-auto">
              <button
                type="submit"
                value="cancel"
                autoFocus
                className="w-full min-h-[48px] px-5 rounded-xl border border-slate-500 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm cursor-pointer"
              >
                {es ? 'Cancelar' : 'Cancel'}
              </button>
            </form>
            <button
              type="button"
              onClick={executeConfirmedCheckout}
              disabled={isCheckingOut}
              className="min-h-[48px] px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm cursor-pointer disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              <span>
                {isCheckingOut
                  ? es
                    ? 'Abriendo pago seguro...'
                    : 'Opening secure checkout...'
                  : pendingProduct === 'kit'
                    ? es
                      ? 'Continuar al pago de $19'
                      : 'Continue to $19 checkout'
                    : es
                      ? 'Continuar al pago de $9.99'
                      : 'Continue to $9.99 checkout'}
              </span>
            </button>
          </div>
        </div>
      </dialog>

      {/* NATIVE <dialog> 2: External Credit Bureau Action Preview (A10: preview before leaving app) */}
      <dialog
        ref={bureauDialogRef}
        aria-labelledby={bureauTitleId}
        {...({ closedby: 'any' } as Record<string, string>)}
        onClose={() => {
          if (bureauDialogRef.current) bureauDialogRef.current.returnValue = ''
        }}
      >
        <div className="w-full rounded-2xl bg-slate-900 border border-slate-500 p-6 shadow-2xl space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 id={bureauTitleId} className="text-xl font-black text-white">
                {pendingBureau
                  ? es
                    ? `Abrir portal oficial de ${pendingBureau.bureau}`
                    : `Open official ${pendingBureau.bureau} portal`
                  : ''}
              </h1>
              <p className="text-sm text-slate-200 mt-1 break-all">
                {es ? 'Destino:' : 'Destination:'} <span className="font-mono text-sky-300">{pendingBureau?.url}</span>
              </p>
            </div>
            <form method="dialog">
              <button
                type="submit"
                value="cancel"
                className="inline-flex items-center gap-1 min-h-[44px] px-3 rounded-xl border border-slate-600 bg-slate-800 text-sm font-bold text-white hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
                <span>{es ? 'Cerrar' : 'Close'}</span>
              </button>
            </form>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-bold text-white">
              {es ? 'Texto que se copiará a su portapapeles:' : 'Text that will be copied to your clipboard:'}
            </p>
            <pre className="whitespace-pre-wrap font-mono text-xs text-slate-200 bg-slate-950 border border-slate-700 rounded-xl p-3.5 max-h-48 overflow-y-auto">
              {bureauPreviewText}
            </pre>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5">
            <form method="dialog">
              <button
                type="submit"
                value="cancel"
                autoFocus
                className="w-full min-h-[48px] px-5 rounded-xl border border-slate-500 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm cursor-pointer"
              >
                {es ? 'Cancelar' : 'Cancel'}
              </button>
            </form>
            <button
              type="button"
              onClick={confirmOpenBureau}
              className="min-h-[48px] px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <ClipboardCopy className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>
                {pendingBureau
                  ? es
                    ? `Copiar y abrir ${pendingBureau.bureau}`
                    : `Copy text & open ${pendingBureau.bureau}`
                  : ''}
              </span>
              <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}
