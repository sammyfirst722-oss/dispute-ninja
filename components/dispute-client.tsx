'use client'

import React, { useState, useEffect } from 'react'
import {
  Shield,
  Sparkles,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Lock,
  ArrowRight,
  Copy,
  Check,
  Download,
  ExternalLink,
  HelpCircle,
  Clock,
  CreditCard,
  Phone,
  Zap,
  Star,
  CheckCircle,
  Scale,
  Mail,
  Send,
  Smartphone,
  MapPin,
  Globe,
} from 'lucide-react'
import { isPlayBillingAvailable, isAndroidApp, purchaseWithPlayBilling } from '@/lib/play-billing'

type DisputeCategory = 'debt' | 'medical' | 'credit' | 'deposit'
type Language = 'en' | 'es'

const CREDIT_BUREAU_LINKS = {
  en: [
    {
      name: 'TransUnion Online Dispute',
      bureau: 'TransUnion',
      badge: '1-Tap Link',
      url: 'https://dispute.transunion.com',
      color: 'from-blue-600 to-cyan-600',
      border: 'border-blue-500/40',
      text: 'text-blue-400',
      desc: 'Official direct portal. Best for auto loans, credit cards, and collection accounts.',
    },
    {
      name: 'Experian Dispute Center',
      bureau: 'Experian',
      badge: '1-Tap Link',
      url: 'https://www.experian.com/disputes/main.html',
      color: 'from-indigo-600 to-blue-600',
      border: 'border-indigo-500/40',
      text: 'text-indigo-400',
      desc: 'Official direct portal. Best for late payment marks, charge-offs, and public records.',
    },
    {
      name: 'Equifax Dispute Portal',
      bureau: 'Equifax',
      badge: '1-Tap Link',
      url: 'https://www.equifax.com/personal/disputes/',
      color: 'from-rose-600 to-red-600',
      border: 'border-rose-500/40',
      text: 'text-rose-400',
      desc: 'Official direct portal. Best for medical debt, mortgages, and personal loans.',
    },
    {
      name: 'CFPB Federal Consumer Complaint',
      bureau: 'CFPB (Federal Government)',
      badge: 'Official Federal Portal',
      url: 'https://www.consumerfinance.gov/complaint/',
      color: 'from-emerald-600 to-teal-600',
      border: 'border-emerald-500/40',
      text: 'text-emerald-400',
      desc: 'File a complaint with federal regulators if a collector or hospital ignores your 30-day dispute.',
    },
    {
      name: 'Innovis Consumer Dispute',
      bureau: 'Innovis (4th Bureau)',
      badge: '1-Tap Link',
      url: 'https://www.innovis.com/personal/dispute',
      color: 'from-amber-600 to-orange-600',
      border: 'border-amber-500/40',
      text: 'text-amber-400',
      desc: 'The 4th major national bureau used by large banks and screening agencies.',
    },
  ],
  es: [
    {
      name: 'Disputa en Línea TransUnion',
      bureau: 'TransUnion',
      badge: 'Enlace 1-Toque',
      url: 'https://dispute.transunion.com',
      color: 'from-blue-600 to-cyan-600',
      border: 'border-blue-500/40',
      text: 'text-blue-400',
      desc: 'Portal oficial directo. Ideal para préstamos de auto, tarjetas de crédito y agencias de cobro.',
    },
    {
      name: 'Centro de Disputas Experian',
      bureau: 'Experian',
      badge: 'Enlace 1-Toque',
      url: 'https://www.experian.com/disputes/main.html',
      color: 'from-indigo-600 to-blue-600',
      border: 'border-indigo-500/40',
      text: 'text-indigo-400',
      desc: 'Portal oficial directo. Ideal para marcas de pago tardío, cuentas castigadas y registros públicos.',
    },
    {
      name: 'Portal de Disputas Equifax',
      bureau: 'Equifax',
      badge: 'Enlace 1-Toque',
      url: 'https://www.equifax.com/personal/disputes/',
      color: 'from-rose-600 to-red-600',
      border: 'border-rose-500/40',
      text: 'text-rose-400',
      desc: 'Portal oficial directo. Ideal para deudas médicas, hipotecas y préstamos personales.',
    },
    {
      name: 'Queja Federal ante el CFPB',
      bureau: 'CFPB (Gobierno Federal EE. UU.)',
      badge: 'Portal Federal Oficial',
      url: 'https://www.consumerfinance.gov/es/quejas/',
      color: 'from-emerald-600 to-teal-600',
      border: 'border-emerald-500/40',
      text: 'text-emerald-400',
      desc: 'Presente una queja formal ante reguladores federales si el cobrador o el hospital ignora su disputa de 30 días.',
    },
    {
      name: 'Disputa de Consumidor Innovis',
      bureau: 'Innovis (4º Buró Nacional)',
      badge: 'Enlace 1-Toque',
      url: 'https://www.innovis.com/personal/dispute',
      color: 'from-amber-600 to-orange-600',
      border: 'border-amber-500/40',
      text: 'text-amber-400',
      desc: 'El 4º buró de crédito nacional utilizado por grandes bancos y arrendadores.',
    },
  ]
}

export function DisputeClient() {
  const [lang, setLang] = useState<Language>('en')
  const [disputeType, setDisputeType] = useState<DisputeCategory>('debt')
  const [creditorName, setCreditorName] = useState('')
  const [disputedAmount, setDisputedAmount] = useState('')
  const [billText, setBillText] = useState('')
  const [userName, setUserName] = useState('')

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [fullLetter, setFullLetter] = useState('')
  const [copied, setCopied] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [hasPlayBilling, setHasPlayBilling] = useState(false)

  // Bureau direct copy feedback
  const [copiedBureau, setCopiedBureau] = useState<string | null>(null)

  // Proof of payment, kept in memory so later requests can be re-checked by the server
  const [paidSessionId, setPaidSessionId] = useState<string | null>(null)
  const [playPurchase, setPlayPurchase] = useState<{ sku: string; purchaseToken: string } | null>(null)
  const [unlockError, setUnlockError] = useState('')

  const entitlementPayload = (): Record<string, unknown> =>
    paidSessionId ? { sessionId: paidSessionId } : playPurchase ? { playPurchase } : {}

  // Ask the server for the letter. It only answers if Stripe or Google Play confirm the payment.
  const loadLetter = async (
    entitlement: Record<string, unknown>,
    fields: { disputeType: string; creditorName: string; disputedAmount: string; userName?: string; lang: string }
  ): Promise<boolean> => {
    const es = fields.lang === 'es'
    try {
      const r = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, ...entitlement }),
      })
      const d = await r.json().catch(() => ({}))
      if (r.ok && d.letter) {
        setFullLetter(d.letter)
        setIsUnlocked(true)
        setUnlockError('')
        return true
      }
      setUnlockError(
        r.status === 402
          ? (es ? 'No pudimos confirmar su pago. Si ya pagó, escríbanos y lo resolvemos.' : 'We could not confirm your payment. If you already paid, please contact us and we will fix it.')
          : (es ? 'No se pudo cargar su carta. Intente de nuevo.' : 'Your letter could not be loaded. Please try again.')
      )
    } catch {
      setUnlockError(es ? 'No se pudo cargar su carta. Intente de nuevo.' : 'Your letter could not be loaded. Please try again.')
    }
    return false
  }

  // Kit bought through Google Play: the server checks the purchase, then sends the file.
  const downloadKit = async (purchase: { sku: string; purchaseToken: string }) => {
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
    } catch {
      setUnlockError(lang === 'es' ? 'No se pudo descargar el paquete. Intente de nuevo.' : 'The kit could not be downloaded. Please try again.')
    }
  }


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasPlayBilling(isPlayBillingAvailable())
      const params = new URLSearchParams(window.location.search)
      const urlLang = params.get('lang')
      if (urlLang === 'es' || urlLang === 'en') {
        setLang(urlLang as Language)
        try { localStorage.setItem('disputeninja-lang', urlLang) } catch {}
      } else {
        try {
          const saved = localStorage.getItem('disputeninja-lang')
          if (saved === 'es' || saved === 'en') setLang(saved as Language)
        } catch {}
      }

      const sessionId = params.get('session_id')
      if (params.get('unlocked') === 'kit' && sessionId) {
        // Kit download: the server checks payment before it sends the file.
        window.location.href = `/api/kit?session_id=${encodeURIComponent(sessionId)}`
      }
      if (params.get('unlocked') === 'true' && sessionId) {
        const type = (params.get('type') || 'debt') as DisputeCategory
        const cred = params.get('creditor') || 'Creditor'
        const amt = params.get('amount') || '500'
        setDisputeType(type)
        setCreditorName(cred)
        setDisputedAmount(amt)
        setPaidSessionId(sessionId)
        // Unlocks only if the server confirms with Stripe that this session was paid.
        loadLetter({ sessionId }, { disputeType: type, creditorName: cred, disputedAmount: amt, userName: 'Valued Consumer', lang: urlLang || 'en' })
      }
    }
  }, [])

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang)
    try {
      localStorage.setItem('disputeninja-lang', newLang)
    } catch {}
    if (isUnlocked) {
      // Re-fetch in the newly selected language (the server re-checks payment)
      loadLetter(entitlementPayload(), { disputeType, creditorName, disputedAmount, userName: userName || 'Consumer', lang: newLang })
    }
  }

  // Dynamic field labels & placeholders based on selected crisis and language
  const crisisConfig: Record<DisputeCategory, {
    title: string
    sub: string
    icon: string
    badge: string
    nameLabel: string
    namePlaceholder: string
    amountLabel: string
    amountPlaceholder: string
    textLabel: string
    textPlaceholder: string
    exampleName: string
    exampleAmount: string
    exampleText: string
  }> = {
    debt: {
      title: lang === 'es' ? 'Frenar Cobradores' : 'Stop Debt Collectors',
      sub: lang === 'es' ? 'Congele llamadas de cobro y exija prueba legal de deuda' : 'Freeze collection calls & make them prove you owe it',
      icon: '🛑',
      badge: 'FDCPA § 809 Legal Protection',
      nameLabel: lang === 'es' ? 'Nombre de la Agencia de Cobro o Comprador de Deuda' : 'Collection Agency / Debt Buyer Name',
      namePlaceholder: 'e.g. Midland Credit Management, Portfolio Recovery, LVNV Funding',
      amountLabel: lang === 'es' ? 'Monto que reclaman ($)' : 'Amount They Claim You Owe ($)',
      amountPlaceholder: 'e.g. 1450',
      textLabel: lang === 'es' ? '¿Qué sucedió? (Pegue la carta de cobro o descríbalo en sus palabras)' : 'What happened? (Paste notice or describe in your own words)',
      textPlaceholder: lang === 'es' 
        ? 'Ejemplo: Midland Credit me llama varias veces al día exigiendo $1,450 de una tarjeta de hace 4 años. Se niegan a enviarme el contrato original firmado...' 
        : 'Example: Midland Credit is calling me multiple times a day demanding $1,450 for an old credit card from 4 years ago. They refused to send me the original signed contract or itemized fee list...',
      exampleName: 'Midland Credit Management',
      exampleAmount: '1450',
      exampleText: lang === 'es'
        ? 'Agencia de cobranzas llama repetidamente exigiendo $1,450 por un supuesto saldo de tarjeta de 2022. Han añadido intereses inexplicables y se niegan a proporcionar prueba por escrito de la titularidad de la deuda.'
        : 'Collection agency calling repeatedly demanding $1,450 for an alleged credit card balance from 2022. They have added unexplained interest charges and refuse to provide written proof of debt ownership or original billing records.'
    },
    medical: {
      title: lang === 'es' ? 'Pelear Facturas Médicas' : 'Fight Medical Bills',
      sub: lang === 'es' ? 'Audite cobros sorpresa de hospital, salas de emergencia y errores' : 'Audit surprise hospital fees, ER charges & billing errors',
      icon: '🏥',
      badge: 'Federal No Surprises Act Backed',
      nameLabel: lang === 'es' ? 'Nombre del Hospital / Clínica / Proveedor' : 'Hospital / Clinic / Provider Name',
      namePlaceholder: 'e.g. Regional Medical Center, Quest Diagnostics, Labcorp',
      amountLabel: lang === 'es' ? 'Monto Total de la Factura Disputada ($)' : 'Total Disputed Bill Amount ($)',
      amountPlaceholder: 'e.g. 2800',
      textLabel: lang === 'es' ? '¿Qué sucedió? (Pegue los cargos del hospital o descríbalo en sus palabras)' : 'What happened? (Paste bill line items or describe in your words)',
      textPlaceholder: lang === 'es'
        ? 'Ejemplo: Fui a la sala de emergencias por puntos y recibí una factura sorpresa de $2,800. Cobraron $1,500 de tarifa de instalación que nunca me informaron...'
        : 'Example: I went to the ER for stitches and got a surprise $2,800 bill. Insurance only covered $300. The hospital charged a $1,500 facility fee that was never disclosed to me...',
      exampleName: 'Regional Community Hospital',
      exampleAmount: '2800',
      exampleText: lang === 'es'
        ? 'Recibí una factura sorpresa de $2,800 por atención en sala de emergencias dentro de mi red de seguro. Incluye un cargo de médico fuera de red de $1,200 y tarifa de instalación no desglosada sin presupuesto de buena fe previo.'
        : 'Received a surprise $2,800 emergency room bill after an in-network visit. The bill includes an out-of-network doctor charge of $1,200 and an unbundled emergency room facility fee of $1,600 without upfront Good Faith Estimate disclosure.'
    },
    credit: {
      title: lang === 'es' ? 'Borrar Errores de Buró' : 'Remove Credit Errors',
      sub: lang === 'es' ? 'Obligue a los burós a borrar marcas negativas no verificadas' : 'Force credit bureaus to delete unverified negative marks',
      icon: '💳',
      badge: 'FCRA § 609 / § 611 30-Day Demand',
      nameLabel: lang === 'es' ? 'Buró de Crédito o Acreedor Reportado' : 'Credit Bureau or Reporting Creditor',
      namePlaceholder: 'e.g. Experian, Equifax, TransUnion, or reporting creditor',
      amountLabel: lang === 'es' ? 'Saldo Disputado o Cuenta Castigada ($)' : 'Disputed Balance or Charge-off ($)',
      amountPlaceholder: 'e.g. 850',
      textLabel: lang === 'es' ? '¿Qué dato es incorrecto? (Descríbalo o pegue los datos del reporte)' : 'What is inaccurate? (Describe the error or paste report details)',
      textPlaceholder: lang === 'es'
        ? 'Ejemplo: Equifax reporta una cuenta con 90 días de atraso de 2021 que ya fue pagada en su totalidad. Afecta mi puntaje crediticio y no la han corregido...'
        : 'Example: Equifax is reporting an account as 90 days past due from 2021 that was already paid in full. It is dragging down my credit score and the bureau has not corrected it...',
      exampleName: 'Experian & Equifax',
      exampleAmount: '850',
      exampleText: lang === 'es'
        ? 'El reporte de crédito muestra un supuesto retraso de 60 días y saldo castigado de $850 de una cuenta liquidada y cerrada en 2023. Exijo verificación documental completa y eliminación inmediata bajo FCRA § 611.'
        : 'Credit report shows an erroneous 60-day late payment and charged-off balance of $850 for an account that was settled and closed in 2023. Demanding full verification and immediate removal under FCRA § 611.'
    },
    deposit: {
      title: lang === 'es' ? 'Recuperar Depósito' : 'Get Security Deposit Back',
      sub: lang === 'es' ? 'Obligue al arrendador a devolver deducciones ilegales de alquiler' : 'Force landlords to return illegally withheld move-out fees',
      icon: '🏠',
      badge: 'State Tenancy Law Treble Damages',
      nameLabel: lang === 'es' ? 'Nombre del Arrendador o Administración' : 'Landlord or Property Management Name',
      namePlaceholder: 'e.g. Greystar Management, Invitation Homes, ABC Apartments',
      amountLabel: lang === 'es' ? 'Monto del Depósito Retenido ($)' : 'Withheld Deposit Amount ($)',
      amountPlaceholder: 'e.g. 1200',
      textLabel: lang === 'es' ? '¿Qué dedujeron injustamente? (Describa o pegue la lista de deducciones)' : 'What did they unfairly deduct? (Describe or paste deduction list)',
      textPlaceholder: lang === 'es'
        ? 'Ejemplo: Me mudé después de 2 años dejando el apartamento limpio. El arrendador retuvo $1,200 por desgaste ordinario de pintura y limpieza de alfombra sin recibos...'
        : 'Example: Moved out after 2 years leaving the apartment clean. Landlord withheld $1,200 for normal paint wear and tear and routine carpet cleaning without providing actual receipts...',
      exampleName: 'Grandview Property Management',
      exampleAmount: '1200',
      exampleText: lang === 'es'
        ? 'El arrendador retuvo $1,200 del depósito de garantía por pintura y limpieza correspondientes a desgaste normal de habitación sin proporcionar recibos detallados de reparaciones dentro del plazo legal de 30 días.'
        : 'Landlord withheld $1,200 from security deposit for normal wear and tear painting and cleaning without providing itemized repair receipts within the statutory 30-day move-out deadline.'
    }
  }

  const handleAnalyze = async () => {
    if (!billText || billText.length < 10) return
    setIsAnalyzing(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billText, disputeType, creditorName, disputedAmount, lang }),
      })
      const data = await res.json()
      setAnalysisResult(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleUnlock = async (productType: 'letter' | 'kit' = 'letter') => {
    setIsCheckingOut(true)
    setUnlockError('')
    try {
      // 1. Google Play In-App Billing for the Android app
      if (isPlayBillingAvailable()) {
        const sku = productType === 'kit' ? 'disputeninja_kit' : 'disputeninja_letter'
        const price = productType === 'kit' ? '19.00' : '9.99'
        const label = productType === 'kit'
          ? (lang === 'es' ? 'Paquete Completo de Disputa' : 'Dispute Action Kit')
          : (lang === 'es' ? 'Carta Formal de Demanda Legal' : 'Dispute Demand Letter')

        const playResult = await purchaseWithPlayBilling(sku, price, label)
        if (playResult.success && playResult.purchaseToken) {
          const purchase = { sku, purchaseToken: playResult.purchaseToken }
          setPlayPurchase(purchase)
          if (productType === 'kit') {
            await downloadKit(purchase)
          } else {
            await loadLetter({ playPurchase: purchase }, { disputeType, creditorName, disputedAmount, userName: userName || 'Valued Consumer', lang })
          }
        } else {
          setUnlockError(playResult.error || (lang === 'es' ? 'No se completó la compra.' : 'The purchase was not completed.'))
        }
        setIsCheckingOut(false)
        return
      }

      // 2. Stripe web checkout
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disputeType, creditorName, disputedAmount, productType, isTwa: isAndroidApp() }),
      })
      const data = await res.json().catch(() => ({}))
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setUnlockError(data.error || (lang === 'es' ? 'No se pudo iniciar el pago. Intente de nuevo.' : 'Checkout could not start. Please try again.'))
        setIsCheckingOut(false)
      }
    } catch (err) {
      console.error(err)
      setUnlockError(lang === 'es' ? 'No se pudo iniciar el pago. Intente de nuevo.' : 'Checkout could not start. Please try again.')
      setIsCheckingOut(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullLetter || analysisResult?.letterPreview || billText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDirectBureauDispute = (bureauName: string, url: string) => {
    const textToCopy = fullLetter || analysisResult?.letterPreview || billText || `Dispute for ${creditorName} regarding $${disputedAmount} balance under FCRA § 611.`
    navigator.clipboard.writeText(textToCopy)
    setCopiedBureau(bureauName)
    setTimeout(() => setCopiedBureau(null), 3000)
    window.open(url, '_blank')
  }

  // Quick 1-click sample filler
  const handleLoadSample = (key: DisputeCategory) => {
    const config = crisisConfig[key]
    setDisputeType(key)
    setCreditorName(config.exampleName)
    setDisputedAmount(config.exampleAmount)
    setBillText(config.exampleText)
    setAnalysisResult(null)
  }

  const curConfig = crisisConfig[disputeType]
  const bureauList = CREDIT_BUREAU_LINKS[lang] || CREDIT_BUREAU_LINKS.en

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 sm:space-y-10">
      {/* Language Switcher Bar */}
      <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center gap-2 px-2 text-xs font-semibold text-slate-300">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">{lang === 'es' ? 'Idioma de la Plataforma:' : 'Select Language:'}</span>
        </div>
        <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              lang === 'en'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🇺🇸 English
          </button>
          <button
            type="button"
            onClick={() => handleLanguageChange('es')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              lang === 'es'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🇲🇽 Español
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold tracking-wide">
          <Shield className="w-3.5 h-3.5" />
          <span>
            {lang === 'es'
              ? 'Respaldado por Leyes Federales de EE. UU. • 100% Legal'
              : 'Backed by Federal Consumer Protection Laws • 100% Legal'}
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          {lang === 'es' ? '¿Factura Injusta o Cobradores Acosando?' : 'Got an Unfair Bill or Debt Collector?'}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-orange-400 to-amber-300 mt-1">
            {lang === 'es'
              ? 'Oblíguelos a Demostrarlo o Cancelarlo en 60 Segundos.'
              : 'Force Them to Prove It or Drop It in 60 Seconds.'}
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {lang === 'es'
            ? 'Los hospitales, arrendadores y agencias de cobro cuentan con intimidar al consumidor. En 3 simples pasos, cree la carta de disputa legal oficial respaldada por la ley federal de EE. UU. que congela cobranzas y exige una auditoría desglosada.'
            : 'Hospitals, landlords, and debt collectors count on you being intimidated. In 3 simple steps, create the official legal dispute letter backed by federal law that freezes collections and forces an itemized audit.'}
        </p>

        {/* Social Proof & Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-slate-400">
          <div className="flex items-center gap-1 text-amber-400 font-semibold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <Star className="w-3.5 h-3.5 fill-current" />
            <Star className="w-3.5 h-3.5 fill-current" />
            <Star className="w-3.5 h-3.5 fill-current" />
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-slate-200 ml-1">
              {lang === 'es' ? 'Calificación 4.9/5 (+3,200 Disputas)' : '4.9/5 Rating (3,200+ Disputed)'}
            </span>
          </div>
          <span className="hidden sm:inline text-slate-600">•</span>
          <div className="flex items-center gap-1 text-emerald-400 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{lang === 'es' ? 'Alivio Promedio: $1,420' : 'Average Consumer Relief: $1,420'}</span>
          </div>
          <span className="hidden sm:inline text-slate-600">•</span>
          <div className="flex items-center gap-1 text-slate-300 font-semibold">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>{lang === 'es' ? '100% Privado y Confidencial' : '100% Private & Confidential'}</span>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS 3-STEP EXPLAINER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/40">
          <div className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-black text-xs shrink-0">
            1
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'es' ? 'Elija su Caso' : 'Choose Your Issue'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              {lang === 'es'
                ? 'Seleccione factura médica, cobrador de deuda, error en buró o depósito.'
                : 'Select medical bill, debt collector, credit error, or security deposit.'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/40">
          <div className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-black text-xs shrink-0">
            2
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'es' ? 'Describa el Cobro' : 'Describe The Bill'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              {lang === 'es'
                ? 'Escriba la empresa y monto. O pulse un ejemplo de 1 segundo abajo.'
                : 'Type the company name and amount. Or click a 1-second sample below.'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/40">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs shrink-0">
            3
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'es' ? 'Demanda Legal Lista' : 'Get Legal Demand'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              {lang === 'es'
                ? 'La IA cita leyes federales que frenan llamadas y exigen auditoría.'
                : 'AI cites federal laws that freeze calls and force an itemized audit.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Flow */}
      {!isUnlocked ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Dispute Category Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {lang === 'es' ? '1. Seleccione su Escenario de Crisis' : '1. Select Your Crisis Scenario'}
              </label>
              <span className="text-[11px] font-semibold text-rose-400">
                {lang === 'es' ? 'Auditoría Legal Instantánea' : 'Instant Statutory Audit'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {(Object.keys(crisisConfig) as DisputeCategory[]).map((key) => {
                const item = crisisConfig[key]
                const isSelected = disputeType === key
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setDisputeType(key)
                      setAnalysisResult(null)
                    }}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-rose-500 bg-rose-500/15 text-white ring-2 ring-rose-500/30 shadow-lg shadow-rose-950/40'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{item.icon}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                    </div>
                    <div>
                      <span className="text-xs font-extrabold block text-white">{item.title}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 leading-snug">{item.sub}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick 1-Click Sample Pre-sets */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {lang === 'es'
                  ? '¿Desea ver cómo funciona primero? Pruebe un ejemplo de 1 clic:'
                  : 'Want to see how it works first? Try a 1-click example:'}
              </span>
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleLoadSample('medical')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-emerald-300 transition-colors cursor-pointer"
              >
                {lang === 'es' ? '⚡ Factura Médica ER $2,800' : '⚡ $2,800 ER Bill Example'}
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('debt')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-rose-300 transition-colors cursor-pointer"
              >
                {lang === 'es' ? '⚡ Cobrador de Deudas $1,450' : '⚡ $1,450 Debt Collector Example'}
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {curConfig.nameLabel}
              </label>
              <input
                type="text"
                placeholder={curConfig.namePlaceholder}
                value={creditorName}
                onChange={(e) => setCreditorName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {curConfig.amountLabel}
              </label>
              <input
                type="number"
                placeholder={curConfig.amountPlaceholder}
                value={disputedAmount}
                onChange={(e) => setDisputedAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
          </div>

          {/* Bill Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. {curConfig.textLabel}
              </label>
              <span className="text-[11px] text-slate-500">
                {lang === 'es' ? 'Cero retención de datos • 100% Privado' : 'Zero data retention • 100% Private'}
              </span>
            </div>
            <textarea
              rows={4}
              placeholder={curConfig.textPlaceholder}
              value={billText}
              onChange={(e) => setBillText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          {/* Action */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || billText.length < 10}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 hover:from-rose-500 hover:to-orange-500 text-white font-extrabold text-sm shadow-xl shadow-rose-950/40 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>
              {isAnalyzing
                ? (lang === 'es' ? 'Auditando cobro contra leyes federales de EE. UU....' : 'Auditing Notice Against Federal Statutes...')
                : (lang === 'es' ? 'Escanear Infracciones Legales y Vista Previa de la Carta (Gratis)' : 'Scan For Statutory Violations & Preview Dispute Letter (Free)')}
            </span>
          </button>

          {/* Free Audit Preview & Gated Unlock */}
          {analysisResult && (
            <div className="pt-6 border-t border-slate-800 space-y-5 animate-in fade-in">
              {/* Savings & Violation Banner */}
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>
                      {lang === 'es'
                        ? `Lista de Revisión: ${analysisResult.violations?.length || 0} Puntos para Revisar`
                        : `Checklist: ${analysisResult.violations?.length || 0} Things Worth Checking`}
                    </span>
                  </div>
                </div>
                <p className="text-slate-300">{analysisResult.summary}</p>
                <div className="pt-1 flex flex-wrap gap-2">
                  {analysisResult.violations?.map((v: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-rose-500/30 font-mono text-[11px] text-slate-200">
                      ✓ {v}
                    </span>
                  ))}
                </div>
                {/* 30-Day Urgency Warning */}
                <div className="flex items-center gap-2 pt-2 border-t border-rose-500/20 text-[11px] text-amber-300 font-semibold">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    {lang === 'es'
                      ? 'Recordatorio: muchos plazos de disputa son cortos. Revise las fechas de su aviso.'
                      : 'Reminder: many dispute deadlines are short. Check the dates on your notice.'}
                  </span>
                </div>
              </div>

              {/* Blurred Letter Preview */}
              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-5 font-mono text-xs text-slate-400 overflow-hidden">
                <div className="filter blur-[1.8px] select-none pointer-events-none">
                  <pre className="whitespace-pre-wrap">{analysisResult.letterPreview}</pre>
                </div>

                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      {lang === 'es' ? 'Desbloquee su Carta Formal de Demanda Legal' : 'Unlock Your Official Formal Legal Dispute Demand'}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mt-1">
                      {lang === 'es'
                        ? 'Su carta completa con citas legales, redactada para su situación y lista para copiar, imprimir y enviar.'
                        : 'Your complete letter with legal citations, written for your situation, ready to copy, print and mail.'}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg justify-center">
                    <button
                      onClick={() => handleUnlock('letter')}
                      disabled={isCheckingOut}
                      className="flex-1 px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-xl shadow-emerald-950 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      {hasPlayBilling ? <Smartphone className="w-4 h-4" /> : null}
                      <span>
                        {hasPlayBilling
                          ? (lang === 'es' ? '1-Toque Google Play • $9.99' : '1-Tap Google Play • $9.99')
                          : (lang === 'es' ? 'Desbloquear Carta de Disputa • $9.99' : 'Unlock Single Demand Letter • $9.99')}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {hasPlayBilling
                      ? (lang === 'es' ? '🔒 Protección de Compra Integrada de Google Play' : '🔒 Google Play In-App Purchase Protection')
                      : (lang === 'es' ? 'Acceso Instantáneo • Seguro vía Stripe' : 'Instant Access • Secured by Stripe')}
                  </span>
                  {unlockError && (
                    <p role="alert" className="text-xs font-semibold text-rose-300">{unlockError}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Unlocked View */
        <div className="bg-slate-900 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-black text-white">
                  {lang === 'es' ? 'Su Carta de Disputa está Desbloqueada y Lista' : 'Your Dispute Letter is Unlocked & Ready to Mail'}
                </h2>
                <span className="text-xs text-emerald-300">
                  {lang === 'es' ? 'Lista para copiar, imprimir y enviar usted mismo por correo certificado' : 'Ready to copy, print and send by certified mail yourself'}
                </span>
              </div>
            </div>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>
                {copied
                  ? (lang === 'es' ? '¡Copiado al Portapapeles!' : 'Copied to Clipboard!')
                  : (lang === 'es' ? 'Copiar Carta Completa' : 'Copy Full Letter')}
              </span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap max-h-96 overflow-y-auto">
            {fullLetter || (lang === 'es' ? 'Cargando su carta personalizada...' : 'Loading your customized letter...')}
          </div>

        </div>
      )}

      {/* 1-TAP CREDIT BUREAU DISPUTE LINKS (CREDIT KARMA ALTERNATIVE) */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>
              {lang === 'es' ? 'Centro de Disputas con Burós • 100% Gratis' : '1-Tap Bureau Dispute Hub • 100% Free'}
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            {lang === 'es' ? 'Dispute Directamente ante los Burós de Crédito' : 'Dispute Directly with the Credit Bureaus'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            {lang === 'es'
              ? 'Al igual que en Credit Karma, toque cualquier buró abajo. Copiaremos su texto de disputa legal a su portapapeles y abriremos el portal oficial directamente.'
              : 'Just like on Credit Karma, tap any bureau below. We will copy your legal dispute text to your clipboard and open the official dispute portal directly.'}
          </p>
        </div>

        {copiedBureau && (
          <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-in fade-in">
            {lang === 'es'
              ? `✓ ¡Texto de disputa copiado al portapapeles! Abriendo el portal de ${copiedBureau}...`
              : `✓ Dispute text copied to clipboard! Opening ${copiedBureau} online dispute portal...`}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {bureauList.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-3 transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black ${item.text}`}>{item.bureau}</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[10px] text-slate-400 font-semibold">
                    {item.badge}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-white">{item.name}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => handleDirectBureauDispute(item.bureau, item.url)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Copy className="w-3.5 h-3.5 text-blue-400" />
                <span>{lang === 'es' ? `Copiar y Abrir ${item.bureau}` : `Copy & Open ${item.bureau}`}</span>
                <ExternalLink className="w-3 h-3 text-slate-500 ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </div>


      {/* TRANSPARENT PRICING & INSTANT CHECKOUT SECTION */}
      <div id="pricing" className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'es' ? 'Precios Claros • Sin Suscripciones' : 'Transparent Pricing • No Subscriptions'}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            {lang === 'es' ? 'Elija su Nivel de Protección Legal' : 'Choose Your Protection & Instant Checkout'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            {lang === 'es'
              ? 'Pago único de 1 vez. Acceso instantáneo. Sin suscripciones.'
              : '1-time payment. Instant access. No subscriptions.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {/* Card 1: Single Letter */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-base font-extrabold text-white">
                    {lang === 'es' ? 'Carta Única de Demanda' : 'Single Demand Letter'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {lang === 'es' ? 'Personalizada para 1 factura específica' : 'Customized for 1 specific bill'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white">$9.99</span>
                  <span className="text-[10px] text-slate-500 block">{lang === 'es' ? 'pago único' : 'one-time'}</span>
                </div>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800/80">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{lang === 'es' ? 'Citas estatutarias (FDCPA / No Surprises Act)' : 'Statutory citations (FDCPA / No Surprises Act)'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{lang === 'es' ? 'Redactada para su situación, lista para copiar, imprimir y enviar' : 'Written for your situation, ready to copy, print and mail'}</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleUnlock('letter')}
              disabled={isCheckingOut}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              {hasPlayBilling ? <Smartphone className="w-4 h-4" /> : null}
              <span>
                {hasPlayBilling
                  ? (lang === 'es' ? '1-Toque Google Play • $9.99' : '1-Tap Google Play • $9.99')
                  : (lang === 'es' ? 'Desbloquear Carta • $9.99' : 'Unlock Single Letter • $9.99')}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>


          {/* Card 3: Complete 5-Letter Kit */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-950/40 via-slate-950 to-slate-950 border-2 border-emerald-500/50 flex flex-col justify-between space-y-4 relative shadow-xl shadow-emerald-950/30">
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
              {lang === 'es' ? 'Defensa Completa' : 'Complete Defense'}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-base font-extrabold text-white">
                    {lang === 'es' ? 'Paquete de 5 Cartas' : '5-Letter Action Kit'}
                  </h4>
                  <p className="text-xs text-emerald-300">
                    {lang === 'es' ? 'Las 5 plantillas federales oficiales' : 'All 5 federal legal templates'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400">$19</span>
                  <span className="text-[10px] text-slate-500 block">{lang === 'es' ? 'pago único' : 'one-time'}</span>
                </div>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800/80">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{lang === 'es' ? '1. Solicitud de Factura Médica Detallada' : '1. Medical Bill Itemized Audit Request'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{lang === 'es' ? '2. Carta de Disputa (Ley No Surprises)' : '2. No Surprises Act Dispute Letter'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{lang === 'es' ? '3. Validación de Deuda (FDCPA)' : '3. Debt Collector Validation Demand (FDCPA)'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{lang === 'es' ? '4. Reclamo de Depósito de Garantía' : '4. Landlord Security Deposit Demand'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{lang === 'es' ? '5. Aviso de Investigación al Buró (FCRA)' : '5. Credit Bureau Investigation Notice (FCRA)'}</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleUnlock('kit')}
              disabled={isCheckingOut}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              {hasPlayBilling ? <Smartphone className="w-4 h-4" /> : null}
              <span>
                {hasPlayBilling
                  ? (lang === 'es' ? '1-Toque Google Play • $19' : '1-Tap Google Play • $19')
                  : (lang === 'es' ? '⚡ Paquete de 5 Cartas • $19' : '⚡ 5-Letter Action Kit • $19')}
              </span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>
            {hasPlayBilling
              ? (lang === 'es' ? 'Protección Google Play In-App • Acceso Instantáneo' : 'Google Play In-App Purchase Protection • Instant Access')
              : (lang === 'es' ? 'Seguro vía Stripe SSL 256-Bit • Acceso Inmediato' : 'Secured by Stripe 256-Bit SSL • Instant Access')}
          </span>
        </div>
        {unlockError && (
          <p role="alert" className="text-center text-xs font-semibold text-rose-300">{unlockError}</p>
        )}
      </div>

      {/* "WHY DOES THIS WORK?" CONVINCING EVIDENCE SECTION */}
      <div className="rounded-3xl bg-slate-900/40 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            <span>{lang === 'es' ? 'Por Qué Realmente Funciona' : 'Why This Actually Works'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            {lang === 'es'
              ? 'Por Qué los Cobradores y Hospitales Ceden ante Esta Carta'
              : 'Why Debt Collectors & Hospitals Back Down When They Get This Letter'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            {lang === 'es'
              ? 'Los cobradores se aprovechan de que el consumidor desconoce sus derechos. Al citar leyes federales específicas, el riesgo legal se vuelve en contra de ellos.'
              : 'Billers rely on consumers being uninformed. When you cite specific federal statutes, the legal risks flip completely in your favor.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-sm">
              ⚖️
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'es' ? '1. Congelamiento Legal Obligatorio' : '1. Mandatory Legal Freeze'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'es'
                ? 'Bajo la ley federal FDCPA § 809, recibir su disputa por escrito prohíbe legalmente a los cobradores llamarle o reportarlo a burós hasta que validen la deuda.'
                : 'Under federal statute (FDCPA § 809), receiving your written dispute legally prohibits collectors from calling, mailing, or credit reporting until full validation is provided.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
              📑
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'es' ? '2. La Mayoría No Puede Demostrarlo' : '2. Most Cannot Prove It'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'es'
                ? 'Los compradores de deudas compran cuentas por 2 a 4 centavos por dólar sin contratos firmados originales. Al ser forzados a comprobarlo bajo juramento, hasta el 68% cancela la cuenta.'
                : 'Debt buyers purchase accounts for 2 to 4 cents on the dollar without original signed contracts. When forced to prove chain-of-title under oath, up to 68% close the account entirely.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
              🏥
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'es' ? '3. 80% Facturas con Errores' : '3. 80% Medical Billing Errors'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'es'
                ? 'Estudios demuestran que 8 de cada 10 facturas médicas contienen cobros inflados ilegales o cargos de instalaciones fuera de red prohibidos por la ley federal No Surprises Act.'
                : 'Medical billing studies show that 8 out of 10 hospital bills contain illegal upcoding or out-of-network facility charges barred under the federal No Surprises Act.'}
            </p>
          </div>
        </div>
      </div>

      {/* Alternative Phone Helpline Callout */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Phone className="w-3.5 h-3.5" />
            <span>{lang === 'es' ? '¿Prefiere Hablar con un Asesor?' : 'Prefer to Talk to an Advocate?'}</span>
          </div>
          <h4 className="text-base font-extrabold text-white">
            {lang === 'es' ? 'Línea de Ayuda Gratuita 24/7: (520) 357-1814' : 'Call Our Free 24/7 Dispute Hotline: (520) 357-1814'}
          </h4>
          <p className="text-xs text-slate-400 max-w-lg">
            {lang === 'es'
              ? 'Nuestro asistente de voz con IA le explicará sus derechos en español y le enviará por mensaje de texto su carta de disputa a su teléfono celular.'
              : 'Our automated AI advocate will answer your questions about your rights and text your customized dispute letter directly to your cell phone.'}
          </p>
        </div>
        <a
          href="tel:5203571814"
          className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 transition-all shadow-lg active:scale-95"
        >
          {lang === 'es' ? 'Llamar a la Línea de Ayuda' : 'Call Hotline Now'}
        </a>
      </div>

      {/* Featured Dispute Guides */}
      <div className="pt-8 border-t border-slate-900 space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider text-center">
          {lang === 'es' ? 'Guías Gratuitas de Disputa y Autodefensa Legal' : 'Free Federal Dispute & Self-Advocacy Guides'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <a href="/dispute/debt-collector-validation-letter" className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all text-left">
            <span className="text-xs font-bold text-rose-400">FDCPA § 809</span>
            <p className="text-xs font-semibold text-white mt-1">
              {lang === 'es' ? 'Validación de Cobrador de Deuda' : 'Debt Collector Validation'}
            </p>
          </a>
          <a href="/dispute/emergency-room-surprise-bill" className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all text-left">
            <span className="text-xs font-bold text-emerald-400">No Surprises Act</span>
            <p className="text-xs font-semibold text-white mt-1">
              {lang === 'es' ? 'Pelear Facturas de Emergencias' : 'Fight ER Surprise Bills'}
            </p>
          </a>
          <a href="/dispute/medical-debt-credit-report-removal" className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all text-left">
            <span className="text-xs font-bold text-amber-400">FCRA § 609</span>
            <p className="text-xs font-semibold text-white mt-1">
              {lang === 'es' ? 'Borrar Deuda Médica del Buró' : 'Credit Report Deletion Letter'}
            </p>
          </a>
          <a href="/dispute/security-deposit-demand-letter" className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all text-left">
            <span className="text-xs font-bold text-blue-400">Landlord-Tenant</span>
            <p className="text-xs font-semibold text-white mt-1">
              {lang === 'es' ? 'Recuperar Depósito de Renta' : 'Security Deposit Return'}
            </p>
          </a>
        </div>
      </div>
    </div>
  )
}
