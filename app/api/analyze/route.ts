import { NextRequest, NextResponse } from 'next/server'
import { cleanAmount, cleanText } from '@/lib/payments'

// This is a free, general checklist and template preview. It does NOT read or judge the user's bill,
// so it must never claim that it "found" or "detected" violations.
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

export interface StatuteSource {
  code: string
  title: string
  url: string
}

const STATUTE_SOURCES: Record<string, { en: StatuteSource[]; es: StatuteSource[] }> = {
  debt: {
    en: [
      {
        code: '15 U.S.C. § 1692g',
        title: 'Fair Debt Collection Practices Act — Validation of debts (Cornell LII)',
        url: 'https://www.law.cornell.edu/uscode/text/15/1692g',
      },
      {
        code: '15 U.S.C. § 1692c',
        title: 'FDCPA — Communication in connection with debt collection (Cornell LII)',
        url: 'https://www.law.cornell.edu/uscode/text/15/1692c',
      },
      {
        code: 'CFPB Guide',
        title: 'CFPB Debt Collection consumer rights & complaint portal',
        url: 'https://www.consumerfinance.gov/consumer-tools/debt-collection/',
      },
    ],
    es: [
      {
        code: '15 U.S.C. § 1692g',
        title: 'Ley FDCPA — Validación escrita de deudas (Cornell LII)',
        url: 'https://www.law.cornell.edu/uscode/text/15/1692g',
      },
      {
        code: '15 U.S.C. § 1692c',
        title: 'Ley FDCPA — Límites a llamadas de cobro (Cornell LII)',
        url: 'https://www.law.cornell.edu/uscode/text/15/1692c',
      },
      {
        code: 'Guía CFPB',
        title: 'CFPB — Recursos sobre cobranza de deudas en español',
        url: 'https://www.consumerfinance.gov/es/herramientas-del-consumidor/cobro-de-deudas/',
      },
    ],
  },
  medical: {
    en: [
      {
        code: '42 U.S.C. § 300gg-111',
        title: 'No Surprises Act — Preventing surprise medical bills (Cornell LII)',
        url: 'https://www.law.cornell.edu/uscode/text/42/300gg-111',
      },
      {
        code: '45 C.F.R. Part 149',
        title: 'Federal rules on surprise billing & Good Faith Estimates (eCFR)',
        url: 'https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-B/part-149',
      },
      {
        code: 'CMS Help',
        title: 'CMS No Surprises Act help & billing dispute portal',
        url: 'https://www.cms.gov/nosurprises',
      },
    ],
    es: [
      {
        code: '42 U.S.C. § 300gg-111',
        title: 'Ley No Surprises Act — Cobros médicos sorpresa (Cornell LII)',
        url: 'https://www.law.cornell.edu/uscode/text/42/300gg-111',
      },
      {
        code: 'CMS No Surprises',
        title: 'Centro federal CMS — Protección contra facturas médicas sorpresa',
        url: 'https://www.cms.gov/nosurprises',
      },
    ],
  },
  credit: {
    en: [
      {
        code: '15 U.S.C. § 1681i',
        title: 'Fair Credit Reporting Act — Procedure in case of disputed accuracy (Cornell LII)',
        url: 'https://www.law.cornell.edu/uscode/text/15/1681i',
      },
      {
        code: '15 U.S.C. § 1681g',
        title: 'FCRA — Disclosures to consumers (Cornell LII)',
        url: 'https://www.law.cornell.edu/uscode/text/15/1681g',
      },
      {
        code: 'AnnualCreditReport.com',
        title: 'Official free credit reports authorized by federal law',
        url: 'https://www.annualcreditreport.com/',
      },
    ],
    es: [
      {
        code: '15 U.S.C. § 1681i',
        title: 'Ley FCRA — Investigación de errores en reportes de crédito (Cornell LII)',
        url: 'https://www.law.cornell.edu/uscode/text/15/1681i',
      },
      {
        code: 'AnnualCreditReport.com',
        title: 'Sitio oficial de reportes de crédito gratuitos por ley federal',
        url: 'https://www.annualcreditreport.com/',
      },
    ],
  },
  deposit: {
    en: [
      {
        code: 'USA.gov Tenant Rights',
        title: 'Find your state landlord-tenant agency & deposit deadline rules',
        url: 'https://www.usa.gov/tenant-rights',
      },
      {
        code: 'USA.gov Consumer Offices',
        title: 'State Attorney General & consumer protection directory',
        url: 'https://www.usa.gov/state-consumer',
      },
    ],
    es: [
      {
        code: 'USA.gov Inquilinos',
        title: 'Derechos de inquilinos y agencias estatales de vivienda',
        url: 'https://www.usa.gov/es/derechos-inquilinos',
      },
      {
        code: 'USA.gov Consumidor',
        title: 'Directorio de oficinas estatales de protección al consumidor',
        url: 'https://www.usa.gov/es/agencias-estatales-consumidor',
      },
    ],
  },
}

const GENERAL = {
  en: [
    'Write down what happened, with dates, amounts, and names',
    'Ask for key facts in writing and keep copies',
    'Check the deadlines printed on your notice',
  ],
  es: [
    'Escriba lo que sucedió, con fechas, montos y nombres',
    'Pida por escrito los datos clave y guarde copias',
    'Revise los plazos impresos en su aviso',
  ],
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const billText = cleanText(body.billText, 20000)
    const disputeType = cleanText(body.disputeType, 20, 'debt')
    const creditorName = cleanText(body.creditorName, 120)
    const disputedAmount = cleanAmount(body.disputedAmount, '')
    const userName = cleanText(body.userName, 120)
    const accountNum = cleanText(body.accountNum, 60)
    const noticeDate = cleanText(body.noticeDate, 30)
    const es = body.lang === 'es'

    if (billText.length < 10) {
      return NextResponse.json(
        {
          error: es
            ? 'Escriba al menos 10 caracteres explicando qué pasó con la factura o cobro.'
            : 'Please write at least 10 characters describing what happened with the bill or notice.',
        },
        { status: 400 }
      )
    }

    const list = CHECKLISTS[disputeType] || GENERAL
    const violations = es ? list.es : list.en
    const sourcesObj = STATUTE_SOURCES[disputeType] || STATUTE_SOURCES.debt
    const statutes = es ? sourcesObj.es : sourcesObj.en
    const who = creditorName || (es ? 'la empresa o cobrador' : 'the company or collector')

    // Flag missing/defaulted fields so the user verifies them before sending (A11: per-field uncertainty, no fake %)
    const fieldChecks: { field: string; message: string }[] = []
    if (!creditorName) {
      fieldChecks.push({
        field: 'creditorName',
        message: es
          ? 'Falta el nombre de la empresa — agréguelo para que aparezca en el encabezado de la carta.'
          : 'Company name is blank — add it so the letter is addressed to the right recipient.',
      })
    }
    if (!disputedAmount || disputedAmount === '0' || disputedAmount === '0.00') {
      fieldChecks.push({
        field: 'disputedAmount',
        message: es
          ? 'Falta el monto en disputa — verifique la cantidad exacta en su factura antes de enviar.'
          : 'Disputed dollar amount is blank — check the exact amount on your notice before sending.',
      })
    }
    if (!userName) {
      fieldChecks.push({
        field: 'userName',
        message: es
          ? 'Falta su nombre — deberá escribir su nombre antes de imprimir y firmar la carta.'
          : 'Your name is blank — add it now or fill in the signature line before mailing.',
      })
    }
    if (!accountNum) {
      fieldChecks.push({
        field: 'accountNum',
        message: es
          ? 'Sin número de cuenta — la carta usará un marcador [Número de Cuenta] para que usted lo complete.'
          : 'Account number is blank — the letter will include an [Account #] placeholder to fill in before mailing.',
      })
    }

    const formattedAmount = disputedAmount || '0.00'
    const formattedAccount = accountNum || '[ADD ACCOUNT OR INVOICE #]'
    const formattedName = userName || '[YOUR FULL NAME]'

    return NextResponse.json({
      summary: es
        ? `Lista general de revisión para su disputa con ${who}. Esta herramienta no lee su factura ni da asesoría legal — verifique cada punto con sus documentos.`
        : `General checklist for your dispute with ${who}. This tool does not read your bill or give legal advice — verify each point against your own documents.`,
      violations,
      statutes,
      fieldChecks,
      inputsUsed: {
        disputeType,
        creditorName: creditorName || '',
        disputedAmount: formattedAmount,
        userName: userName || '',
        accountNum: accountNum || '',
        noticeDate: noticeDate || '',
      },
      letterPreview: `RE: FORMAL NOTICE OF DISPUTE AND REQUEST FOR VERIFICATION
Date: ${new Date().toLocaleDateString('en-US')}
To: ${creditorName || '[COMPANY / BILLING DEPARTMENT]'}
From: ${formattedName}
Account Reference: ${formattedAccount}${noticeDate ? `\nNotice Date: ${noticeDate}` : ''}
Disputed Amount: $${formattedAmount}

Dear Billing or Dispute Department,

Please accept this formal written dispute regarding the claimed balance of $${formattedAmount}. I am requesting written verification and an itemized accounting under applicable consumer protection law...

[Full letter with statutory citations unlocks after checkout — $9.99 one-time]`,
    })
  } catch (err) {
    console.error('Analyze error:', err)
    return NextResponse.json(
      { error: 'We could not build your checklist right now. Your draft is still saved — please try again.' },
      { status: 500 }
    )
  }
}
