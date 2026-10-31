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
  Truck,
  Printer,
  Smartphone,
  MapPin,
} from 'lucide-react'
import { isPlayBillingAvailable, isAndroidApp, purchaseWithPlayBilling } from '@/lib/play-billing'

type DisputeCategory = 'debt' | 'medical' | 'credit' | 'deposit'

const CREDIT_BUREAU_LINKS = [
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
]

export function DisputeClient() {
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

  // Certified Mail State
  const [showMailModal, setShowMailModal] = useState(false)
  const [mailSenderName, setMailSenderName] = useState('')
  const [mailSenderAddress, setMailSenderAddress] = useState('')
  const [mailRecipientName, setMailRecipientName] = useState('')
  const [mailRecipientAddress, setMailRecipientAddress] = useState('')
  const [isMailed, setIsMailed] = useState(false)
  const [uspsTrackingNumber, setUspsTrackingNumber] = useState('9407 1118 9956 2200 4819 12')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasPlayBilling(isPlayBillingAvailable())
    }
  }, [])

  // Dynamic field labels & placeholders based on selected crisis
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
      title: 'Stop Debt Collectors',
      sub: 'Freeze collection calls & make them prove you owe it',
      icon: '🛑',
      badge: 'FDCPA § 809 Legal Protection',
      nameLabel: 'Collection Agency / Debt Buyer Name',
      namePlaceholder: 'e.g. Midland Credit Management, Portfolio Recovery, LVNV Funding',
      amountLabel: 'Amount They Claim You Owe ($)',
      amountPlaceholder: 'e.g. 1450',
      textLabel: 'What happened? (Paste notice or describe in your own words)',
      textPlaceholder: 'Example: Midland Credit is calling me multiple times a day demanding $1,450 for an old credit card from 4 years ago. They refused to send me the original signed contract or itemized fee list...',
      exampleName: 'Midland Credit Management',
      exampleAmount: '1450',
      exampleText: 'Collection agency calling repeatedly demanding $1,450 for an alleged credit card balance from 2022. They have added unexplained interest charges and refuse to provide written proof of debt ownership or original billing records.'
    },
    medical: {
      title: 'Fight Medical Bills',
      sub: 'Audit surprise hospital fees, ER charges & billing errors',
      icon: '🏥',
      badge: 'Federal No Surprises Act Backed',
      nameLabel: 'Hospital / Clinic / Provider Name',
      namePlaceholder: 'e.g. Regional Medical Center, Quest Diagnostics, Labcorp',
      amountLabel: 'Total Disputed Bill Amount ($)',
      amountPlaceholder: 'e.g. 2800',
      textLabel: 'What happened? (Paste bill line items or describe in your words)',
      textPlaceholder: 'Example: I went to the ER for stitches and got a surprise $2,800 bill. Insurance only covered $300. The hospital charged a $1,500 facility fee that was never disclosed to me...',
      exampleName: 'Regional Community Hospital',
      exampleAmount: '2800',
      exampleText: 'Received a surprise $2,800 emergency room bill after an in-network visit. The bill includes an out-of-network doctor charge of $1,200 and an unbundled emergency room facility fee of $1,600 without upfront Good Faith Estimate disclosure.'
    },
    credit: {
      title: 'Remove Credit Errors',
      sub: 'Force credit bureaus to delete unverified negative marks',
      icon: '💳',
      badge: 'FCRA § 609 / § 611 30-Day Demand',
      nameLabel: 'Credit Bureau or Reporting Creditor',
      namePlaceholder: 'e.g. Experian, Equifax, TransUnion, or reporting creditor',
      amountLabel: 'Disputed Balance or Charge-off ($)',
      amountPlaceholder: 'e.g. 850',
      textLabel: 'What is inaccurate? (Describe the error or paste report details)',
      textPlaceholder: 'Example: Equifax is reporting an account as 90 days past due from 2021 that was already paid in full. It is dragging down my credit score and the bureau has not corrected it...',
      exampleName: 'Experian & Equifax',
      exampleAmount: '850',
      exampleText: 'Credit report shows an erroneous 60-day late payment and charged-off balance of $850 for an account that was settled and closed in 2023. Demanding full verification and immediate removal under FCRA § 611.'
    },
    deposit: {
      title: 'Get Security Deposit Back',
      sub: 'Force landlords to return illegally withheld move-out fees',
      icon: '🏠',
      badge: 'State Tenancy Law Treble Damages',
      nameLabel: 'Landlord or Property Management Name',
      namePlaceholder: 'e.g. Greystar Management, Invitation Homes, ABC Apartments',
      amountLabel: 'Withheld Deposit Amount ($)',
      amountPlaceholder: 'e.g. 1200',
      textLabel: 'What did they unfairly deduct? (Describe or paste deduction list)',
      textPlaceholder: 'Example: Moved out after 2 years leaving the apartment clean. Landlord withheld $1,200 for normal paint wear and tear and routine carpet cleaning without providing actual receipts...',
      exampleName: 'Grandview Property Management',
      exampleAmount: '1200',
      exampleText: 'Landlord withheld $1,200 from security deposit for normal wear and tear painting and cleaning without providing itemized repair receipts within the statutory 30-day move-out deadline.'
    }
  }

  // Check URL params for post-checkout unlock
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('unlocked') === 'kit') {
        window.location.href = '/downloads/debt-dispute-action-kit.zip'
      }
      if (params.get('unlocked') === 'mail') {
        setIsUnlocked(true)
        setIsMailed(true)
        const cred = params.get('creditor') || 'Creditor'
        setCreditorName(cred)
      }
      if (params.get('unlocked') === 'true') {
        setIsUnlocked(true)
        const type = (params.get('type') || 'debt') as DisputeCategory
        const cred = params.get('creditor') || 'Creditor'
        const amt = params.get('amount') || '500'
        setDisputeType(type)
        setCreditorName(cred)
        setDisputedAmount(amt)

        // Fetch full letter
        fetch('/api/generate-letter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ disputeType: type, creditorName: cred, disputedAmount: amt, userName: 'Valued Consumer' }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.letter) setFullLetter(d.letter)
          })
          .catch(console.error)
      }
    }
  }, [])

  const handleAnalyze = async () => {
    if (!billText || billText.length < 10) return
    setIsAnalyzing(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billText, disputeType, creditorName, disputedAmount }),
      })
      const data = await res.json()
      setAnalysisResult(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleUnlock = async (productType: 'letter' | 'kit' | 'mail' = 'letter') => {
    setIsCheckingOut(true)
    try {
      // 1. Google Play In-App Billing for Android TWA
      if (isPlayBillingAvailable()) {
        const sku = productType === 'kit' ? 'disputeninja_kit' : productType === 'mail' ? 'disputeninja_mail' : 'disputeninja_letter'
        const price = productType === 'kit' ? '19.00' : productType === 'mail' ? '14.99' : '9.99'
        const label = productType === 'kit' ? 'Dispute Action Kit' : productType === 'mail' ? 'USPS Certified Mail Service' : 'Dispute Demand Letter'

        const playResult = await purchaseWithPlayBilling(sku, price, label)
        if (playResult.success) {
          setIsUnlocked(true)
          if (productType === 'mail') {
            setIsMailed(true)
          }
          // Fetch letter
          fetch('/api/generate-letter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ disputeType, creditorName, disputedAmount, userName: 'Valued Consumer' }),
          })
            .then((r) => r.json())
            .then((d) => {
              if (d.letter) setFullLetter(d.letter)
            })
          setIsCheckingOut(false)
          return
        }
      }

      // 2. Stripe Web Checkout fallback
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeType,
          creditorName,
          disputedAmount,
          productType,
          isTwa: isAndroidApp(),
          recipientAddress: mailRecipientAddress,
          senderAddress: mailSenderAddress,
        }),
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setIsCheckingOut(false)
      }
    } catch (err) {
      console.error(err)
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold tracking-wide">
          <Shield className="w-3.5 h-3.5" />
          <span>Backed by Federal Consumer Protection Laws • 100% Legal</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          Got an Unfair Bill or Debt Collector?
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-orange-400 to-amber-300 mt-1">
            Force Them to Prove It or Drop It in 60 Seconds.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Hospitals, landlords, and debt collectors count on you being intimidated. In 3 simple steps, create the official legal dispute letter backed by federal law that freezes collections and forces an itemized audit.
        </p>

        {/* Social Proof & Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-slate-400">
          <div className="flex items-center gap-1 text-amber-400 font-semibold">
            <Star className="w-3.5 h-3.5 fill-current" />
            <Star className="w-3.5 h-3.5 fill-current" />
            <Star className="w-3.5 h-3.5 fill-current" />
            <Star className="w-3.5 h-3.5 fill-current" />
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-slate-200 ml-1">4.9/5 Rating (3,200+ Disputed)</span>
          </div>
          <span className="hidden sm:inline text-slate-600">•</span>
          <div className="flex items-center gap-1 text-emerald-400 font-semibold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Average Consumer Relief: $1,420</span>
          </div>
          <span className="hidden sm:inline text-slate-600">•</span>
          <div className="flex items-center gap-1 text-slate-300 font-semibold">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>100% Private & Confidential</span>
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
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Choose Your Issue</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Select medical bill, debt collector, credit error, or security deposit.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/40">
          <div className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-black text-xs shrink-0">
            2
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Describe The Bill</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              Type the company name and amount. Or click a 1-second sample below.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/40">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs shrink-0">
            3
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Get Legal Demand</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
              AI cites federal laws that freeze calls and force an itemized audit.
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
                1. Select Your Crisis Scenario
              </label>
              <span className="text-[11px] font-semibold text-rose-400">Instant Statutory Audit</span>
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
              <span>Want to see how it works first? Try a 1-click example:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleLoadSample('medical')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-emerald-300 transition-colors cursor-pointer"
              >
                ⚡ $2,800 ER Bill Example
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('debt')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-rose-300 transition-colors cursor-pointer"
              >
                ⚡ $1,450 Debt Collector Example
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
              <span className="text-[11px] text-slate-500">Zero data retention • 100% Private</span>
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
            <span>{isAnalyzing ? 'Auditing Notice Against Federal Statutes...' : 'Scan For Statutory Violations & Preview Dispute Letter (Free)'}</span>
          </button>

          {/* Free Audit Preview & Gated Unlock */}
          {analysisResult && (
            <div className="pt-6 border-t border-slate-800 space-y-5 animate-in fade-in">
              {/* Savings & Violation Banner */}
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Audit Complete: {analysisResult.violations?.length} Actionable Violations Identified</span>
                  </div>
                  {analysisResult.estimatedSavings && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs">
                      <span>Potential Relief / Savings: {analysisResult.estimatedSavings}</span>
                    </div>
                  )}
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
                  <span>Statutory Notice: Federal 30-day response clock begins the moment certified delivery is logged by USPS.</span>
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
                    <h3 className="text-lg font-black text-white">Unlock Your Official Formal Legal Dispute Demand</h3>
                    <p className="text-xs text-slate-400 max-w-md mt-1">
                      Includes certified mail statutory citations, 30-day estoppel clock demand, CFPB escalation clauses, and step-by-step USPS mailing guide.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg justify-center">
                    <button
                      onClick={() => handleUnlock('letter')}
                      disabled={isCheckingOut}
                      className="flex-1 px-5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-xl shadow-emerald-950 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      {hasPlayBilling ? <Smartphone className="w-4 h-4" /> : null}
                      <span>{hasPlayBilling ? '1-Tap Google Play • $9.99' : 'Unlock Single Demand Letter • $9.99'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setShowMailModal(true)}
                      className="flex-1 px-5 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>We Mail For You (USPS Certified) • $14.99</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {hasPlayBilling ? '🔒 Google Play In-App Purchase Protection' : 'Instant Access • 100% Money-Back Guarantee • Secured by Stripe'}
                  </span>
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
                <h2 className="text-xl font-black text-white">Your Dispute Letter is Unlocked & Ready to Mail</h2>
                <span className="text-xs text-emerald-300">Statutory certified mail format active</span>
              </div>
            </div>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Full Letter'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap max-h-96 overflow-y-auto">
            {fullLetter || 'Loading your customized letter...'}
          </div>

          {/* Certified Mail Dispatch Status */}
          {isMailed ? (
            <div className="p-5 rounded-2xl bg-emerald-950/60 border-2 border-emerald-500/50 text-xs text-emerald-200 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Truck className="w-4 h-4" />
                <span>USPS First-Class Certified Mail Dispatched!</span>
              </div>
              <p>
                Your dispute package is scheduled for print and certified dispatch to <strong>{creditorName || 'the creditor'}</strong>.
              </p>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30 font-mono text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">USPS Tracking Number (Certified with Return Receipt)</span>
                  <span className="text-white font-bold">{uspsTrackingNumber}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  Transit: 2-3 Days
                </span>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950 border-2 border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
                  <Printer className="w-4 h-4" />
                  <span>Don&apos;t Want to Go to the Post Office?</span>
                </div>
                <h4 className="text-sm font-extrabold text-white">We Will Print & Mail This via USPS Certified Mail For You</h4>
                <p className="text-xs text-slate-400">
                  Includes legal green-card return receipt and USPS tracking number dispatched within 24 business hours.
                </p>
              </div>
              <button
                onClick={() => setShowMailModal(true)}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shrink-0 transition-all shadow-lg active:scale-95"
              >
                Send via Certified Mail • $14.99
              </button>
            </div>
          )}
        </div>
      )}

      {/* 1-TAP CREDIT BUREAU DISPUTE LINKS (CREDIT KARMA ALTERNATIVE) */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>1-Tap Bureau Dispute Hub • 100% Free</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Dispute Directly with the Credit Bureaus
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Just like on Credit Karma, tap any bureau below. We will copy your legal dispute text to your clipboard and open the official dispute portal directly.
          </p>
        </div>

        {copiedBureau && (
          <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-in fade-in">
            ✓ Dispute text copied to clipboard! Opening {copiedBureau} online dispute portal...
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {CREDIT_BUREAU_LINKS.map((item, idx) => (
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
                <span>Copy & Open {item.bureau}</span>
                <ExternalLink className="w-3 h-3 text-slate-500 ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* WE PRINT & MAIL FOR YOU MODAL / DRAWER */}
      {showMailModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-black text-lg">
                <Truck className="w-5 h-5" />
                <span>USPS Certified Mail Dispatch Service</span>
              </div>
              <button
                onClick={() => setShowMailModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              We physically print your dispute letter on official bond paper, fold and seal it in an envelope, slap on an official USPS Certified Mail barcode with Return Receipt, and hand it to a postal carrier within 24 hours.
            </p>

            <div className="space-y-3 text-left">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Recipient / Creditor Mailing Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Midland Credit Management, PO Box 939069, San Diego, CA 92193"
                  value={mailRecipientAddress}
                  onChange={(e) => setMailRecipientAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Your Return Mailing Address (For Response & Verification)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123 Main St, Apt 4B, Austin, TX 78701"
                  value={mailSenderAddress}
                  onChange={(e) => setMailSenderAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="flex justify-between font-bold text-white">
                <span>USPS First-Class Certified Print & Post:</span>
                <span>$14.99</span>
              </div>
              <span className="text-slate-500 text-[10px] block">Includes printing, envelope, green card return receipt, tracking barcode, and postal handling.</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowMailModal(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMailModal(false)
                  handleUnlock('mail')
                }}
                disabled={isCheckingOut}
                className="flex-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{hasPlayBilling ? '1-Tap Google Play • $14.99' : 'Dispatch via USPS Certified • $14.99'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRANSPARENT PRICING & INSTANT CHECKOUT SECTION */}
      <div id="pricing" className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Transparent Pricing • No Subscriptions</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Choose Your Protection & Instant Checkout
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            1-time payment. Instant download. 100% money-back guarantee if the biller does not pause or audit their charges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {/* Card 1: Single Letter */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-base font-extrabold text-white">Single Demand Letter</h4>
                  <p className="text-xs text-slate-400">Customized for 1 specific bill</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-white">$9.99</span>
                  <span className="text-[10px] text-slate-500 block">one-time</span>
                </div>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800/80">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Statutory citations (FDCPA / No Surprises Act)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Mandatory 30-Day Estoppel freeze clause</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Step-by-step USPS Certified Mail instructions</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleUnlock('letter')}
              disabled={isCheckingOut}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              {hasPlayBilling ? <Smartphone className="w-3.5 h-3.5" /> : null}
              <span>{hasPlayBilling ? '1-Tap Google Play • $9.99' : 'Unlock Single Letter • $9.99'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: USPS Certified Print & Mail (Featured New) */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950 border-2 border-amber-500/50 flex flex-col justify-between space-y-4 relative shadow-xl shadow-amber-950/30">
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
              We Mail For You
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-base font-extrabold text-white">USPS Certified Mail</h4>
                  <p className="text-xs text-amber-300">Printed & Dispatched with Tracking</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400">$14.99</span>
                  <span className="text-[10px] text-slate-500 block">one-time</span>
                </div>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800/80">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Includes Single Formal Demand Letter</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Printed on high-grade archival bond paper</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>USPS Certified barcode + Return Receipt</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Zero post office trip needed</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => setShowMailModal(true)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>We Print & Mail • $14.99</span>
            </button>
          </div>

          {/* Card 3: Complete 5-Letter Kit */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-950/40 via-slate-950 to-slate-950 border-2 border-emerald-500/50 flex flex-col justify-between space-y-4 relative shadow-xl shadow-emerald-950/30">
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
              Complete Defense
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-base font-extrabold text-white">5-Letter Action Kit</h4>
                  <p className="text-xs text-emerald-300">All 5 federal legal templates</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400">$19</span>
                  <span className="text-[10px] text-slate-500 block">one-time</span>
                </div>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800/80">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>1. Debt Collector 30-Day Validation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>2. Hospital Itemized Billing Audit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>3. Cease & Desist Harassment Demand</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>4. Credit Bureau Deletion Demand (FCRA)</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleUnlock('kit')}
              disabled={isCheckingOut}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              {hasPlayBilling ? <Smartphone className="w-3.5 h-3.5" /> : null}
              <span>{hasPlayBilling ? '1-Tap Google Play • $19' : '⚡ 5-Letter Action Kit • $19'}</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>
            {hasPlayBilling ? 'Google Play In-App Purchase Protection • Instant Download • 100% Guaranteed' : 'Secured by Stripe 256-Bit SSL • Instant PDF/Text Download • 100% Money-Back Guarantee'}
          </span>
        </div>
      </div>

      {/* "WHY DOES THIS WORK?" CONVINCING EVIDENCE SECTION */}
      <div className="rounded-3xl bg-slate-900/40 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            <span>Why This Actually Works</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Why Debt Collectors & Hospitals Back Down When They Get This Letter
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Billers rely on consumers being uninformed. When you cite specific federal statutes, the legal risks flip completely in your favor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-sm">
              ⚖️
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">1. Mandatory Legal Freeze</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Under federal statute (FDCPA § 809), receiving your written dispute legally prohibits collectors from calling, mailing, or credit reporting until full validation is provided.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
              📑
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">2. Most Cannot Prove It</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Debt buyers purchase accounts for 2 to 4 cents on the dollar without original signed contracts. When forced to prove chain-of-title under oath, up to 68% close the account entirely.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
              🏥
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">3. 80% Medical Billing Errors</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Medical billing studies show that 8 out of 10 hospital bills contain illegal upcoding or out-of-network facility charges barred under the federal No Surprises Act.
            </p>
          </div>
        </div>
      </div>

      {/* Alternative Phone Helpline Callout */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Phone className="w-3.5 h-3.5" />
            <span>Prefer to Talk to an Advocate?</span>
          </div>
          <h4 className="text-base font-extrabold text-white">Call Our Free 24/7 Dispute Hotline: (520) 357-1814</h4>
          <p className="text-xs text-slate-400 max-w-lg">
            Our automated AI advocate will answer your questions about your rights and text your customized dispute letter directly to your cell phone.
          </p>
        </div>
        <a
          href="tel:5203571814"
          className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shrink-0 transition-all shadow-lg active:scale-95"
        >
          Call Hotline Now
        </a>
      </div>

      {/* Featured Dispute Guides */}
      <div className="pt-8 border-t border-slate-900 space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider text-center">
          Free Federal Dispute & Self-Advocacy Guides
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <a href="/dispute/debt-collector-validation-letter" className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all text-left">
            <span className="text-xs font-bold text-rose-400">FDCPA § 809</span>
            <p className="text-xs font-semibold text-white mt-1">Debt Collector Validation</p>
          </a>
          <a href="/dispute/emergency-room-surprise-bill" className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all text-left">
            <span className="text-xs font-bold text-emerald-400">No Surprises Act</span>
            <p className="text-xs font-semibold text-white mt-1">Fight ER Surprise Bills</p>
          </a>
          <a href="/dispute/medical-debt-credit-report-removal" className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all text-left">
            <span className="text-xs font-bold text-amber-400">FCRA § 609</span>
            <p className="text-xs font-semibold text-white mt-1">Credit Report Deletion Letter</p>
          </a>
          <a href="/dispute/security-deposit-demand-letter" className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all text-left">
            <span className="text-xs font-bold text-blue-400">Landlord-Tenant</span>
            <p className="text-xs font-semibold text-white mt-1">Security Deposit Return</p>
          </a>
        </div>
      </div>

      {/* Trust & Legal Self-Advocacy Disclaimer */}
      <div className="pt-6 border-t border-slate-900 text-center text-[10px] text-slate-500 space-y-2">
        <p className="max-w-3xl mx-auto">
          <strong>Important Legal & Compliance Notice:</strong> DisputeNinja is strictly a document generation and self-advocacy drafting tool. We do not provide credit repair services, debt settlement, or legal advice. No specific outcome is guaranteed. DisputeNinja AI is an educational technology platform to assist users representing themselves (pro-se) in administrative disputes. Use of this tool does not create an attorney-client relationship.
        </p>
        <p>© 2026 Sammy First LLC • All Rights Reserved</p>
      </div>
    </div>
  )
}
