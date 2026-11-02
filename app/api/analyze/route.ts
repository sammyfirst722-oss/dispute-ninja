import { NextRequest, NextResponse } from 'next/server'
import { cleanAmount, cleanText } from '@/lib/payments'

// This is a free, general checklist. It does NOT read or judge the user's bill, so it must
// never claim that it "found" or "detected" anything. (Changed 2026-11-02: the old text claimed
// a completed audit and made-up savings.)
const CHECKLISTS: Record<string, { en: string[]; es: string[] }> = {
  medical: {
    en: [
      'Ask for an itemized bill with billing codes (CPT/HCPCS) for every charge',
      'Check whether charges that are normally billed together were billed separately',
      'Check if you were given a written Good Faith Estimate before the service (No Surprises Act)',
      'Compare any facility fee with what your insurance Explanation of Benefits shows',
    ],
    es: [
      'Pida una factura detallada con códigos de facturación (CPT/HCPCS) de cada cargo',
      'Revise si cargos que normalmente se facturan juntos fueron cobrados por separado',
      'Revise si recibió un Estimado de Buena Fe por escrito antes del servicio (Ley No Surprises)',
      'Compare cualquier tarifa de instalación con su Explicación de Beneficios del seguro',
    ],
  },
  debt: {
    en: [
      'Ask the collector to prove the debt in writing (debt validation, 15 U.S.C. § 1692g)',
      'Check who owns the debt now and whether the collector can show how it got it',
      'Check the date of your last payment: very old debts may be past the legal time limit to sue',
      'Keep a log of every call and letter with dates and times',
    ],
    es: [
      'Pida al cobrador que pruebe la deuda por escrito (validación de deuda, 15 U.S.C. § 1692g)',
      'Averigüe quién es el dueño actual de la deuda y si el cobrador puede demostrarlo',
      'Revise la fecha de su último pago: las deudas muy antiguas pueden haber pasado el plazo legal para demandar',
      'Anote cada llamada y carta con fecha y hora',
    ],
  },
  deposit: {
    en: [
      'Check your lease and your state law for the deadline to return a deposit',
      'Ask for an itemized list of deductions with receipts',
      'Compare each deduction with normal wear and tear, which is usually not chargeable',
      'Keep your move-out photos and any written messages with the landlord',
    ],
    es: [
      'Revise su contrato y la ley de su estado para el plazo de devolución del depósito',
      'Pida una lista detallada de deducciones con recibos',
      'Compare cada deducción con el desgaste normal, que normalmente no se puede cobrar',
      'Guarde sus fotos de mudanza y los mensajes escritos con el arrendador',
    ],
  },
  credit: {
    en: [
      'Get your free credit reports and look for accounts or balances that are wrong',
      'Check dates: late payments and collections have time limits on how long they can be reported',
      'Dispute the specific item in writing with the credit bureau (15 U.S.C. § 1681i)',
      'Keep copies of everything you send, and mail it so you can prove delivery',
    ],
    es: [
      'Obtenga sus reportes de crédito gratuitos y busque cuentas o saldos incorrectos',
      'Revise las fechas: los pagos atrasados y cobranzas tienen límites de tiempo en el reporte',
      'Dispute el dato específico por escrito con el buró de crédito (15 U.S.C. § 1681i)',
      'Guarde copias de todo lo que envíe y envíelo de forma que pueda probar la entrega',
    ],
  },
}

const GENERAL = {
  en: [
    'Write down what happened, with dates, amounts and names',
    'Ask for key facts in writing and keep copies',
    'Know the deadlines that apply to your situation',
  ],
  es: [
    'Escriba lo que sucedió, con fechas, montos y nombres',
    'Pida por escrito los datos clave y guarde copias',
    'Conozca los plazos que aplican a su situación',
  ],
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const billText = cleanText(body.billText, 20000)
    const disputeType = cleanText(body.disputeType, 20, 'other')
    const creditorName = cleanText(body.creditorName, 120)
    const disputedAmount = cleanAmount(body.disputedAmount, '0.00')
    const es = body.lang === 'es'

    if (billText.length < 10) {
      return NextResponse.json({ error: 'Please paste more details from your bill or notice.' }, { status: 400 })
    }

    const list = CHECKLISTS[disputeType] || GENERAL
    const violations = es ? (list as any).es ?? GENERAL.es : (list as any).en ?? GENERAL.en
    const who = creditorName || (es ? 'el acreedor' : 'the creditor')

    return NextResponse.json({
      summary: es
        ? `Esta es una lista general de puntos que vale la pena revisar en su disputa con ${who}. No es un análisis de su factura ni asesoría legal.`
        : `Here is a general checklist of points worth checking in your dispute with ${who}. It is not an analysis of your bill and not legal advice.`,
      violations,
      letterPreview: `RE: FORMAL NOTICE OF DISPUTE AND REQUEST FOR VERIFICATION
Date: ${new Date().toLocaleDateString('en-US')}
To: ${creditorName || 'Billing Department'}
Account Reference: [ADDED AFTER UNLOCK]

Dear Billing Supervisor,

Please accept this formal written dispute regarding the recent invoice claiming a balance of $${disputedAmount}. I am exercising my right to request verification and an itemized accounting...

[REST OF THE LETTER IS HIDDEN UNTIL UNLOCKED - $9.99]`,
    })
  } catch (err) {
    console.error('Analyze error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
