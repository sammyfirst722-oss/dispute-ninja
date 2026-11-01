import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const {
      disputeType,
      creditorName,
      disputedAmount,
      userName = 'Consumer',
      accountNum = 'PENDING-001',
      lang = 'en'
    } = await req.json()

    const isSpanish = lang === 'es'
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const todayEs = new Date().toLocaleDateString('es-US', { year: 'numeric', month: 'long', day: 'numeric' })

    let letterBody = ''
    let spanishExplanation = ''

    if (disputeType === 'medical') {
      letterBody = `CERTIFIED MAIL - RETURN RECEIPT REQUESTED
Date: ${today}

To: ${creditorName || 'Hospital Billing & Patient Financial Services'}
Patient Name: ${userName}
Account / Invoice Number: ${accountNum}
Disputed Amount: $${disputedAmount || '0.00'}

SUBJECT: FORMAL BILLING DISPUTE AND DEMAND FOR ITEMIZED AUDIT PURSUANT TO THE NO SURPRISES ACT (P.L. 116-260)

Dear Billing Supervisor,

I am writing to formally dispute the outstanding charges of $${disputedAmount || '0.00'} billed under the above-referenced account. I am disputing this debt in its entirety until a certified, unbundled itemized statement with all corresponding CPT, HCPCS, and Revenue Codes is provided.

SPECIFIC LEGAL GROUNDS FOR DISPUTE:
1. Federal No Surprises Act Protections: Under 45 C.F.R. § 149, balance billing for emergency services or non-consented out-of-network services rendered at an in-network facility is strictly prohibited.
2. Unbundling & Upcoding Prohibition: Under federal billing compliance standards, services commonly bundled under comprehensive procedure codes cannot be separately billed.
3. Lack of Informed Consent: At no point was a compliant Good Faith Estimate or written disclosure of out-of-network charges executed prior to service.

MANDATORY ACTIONS REQUIRED WITHIN 30 DAYS:
- Immediately suspend all collection activity, interest accrual, and reporting to credit bureaus.
- Provide a complete itemized billing statement detailing individual unit costs.
- Adjust the account balance to reflect the fair, in-network or median customary in-network rate.

Failure to resolve this dispute within statutory timeframes will result in immediate formal complaints filed with the Consumer Financial Protection Bureau (CFPB), the State Attorney General, and the Centers for Medicare & Medicaid Services (CMS).

Sincerely,

${userName}
Signature: ___________________________`

      spanishExplanation = `================================================================================
📋 GUÍA Y EXPLICACIÓN EN ESPAÑOL PARA EL CONSUMIDOR
================================================================================
Estimado(a) ${userName}:

Esta carta legal está redactada en inglés estadounidense formal porque la ley federal y los departamentos de facturación médica en EE. UU. exigen términos estatutarios específicos para procesar disputas de manera vinculante.

📌 ¿QUÉ EXIGE ESTA CARTA ANTE EL HOSPITAL / PROVEEDOR?
1. Auditoría detallada (Itemized Bill): Exige el desglose obligatorio de cada procedimiento con sus códigos CPT y tarifas individuales.
2. Protección bajo la Ley Federal No Surprises Act: Prohíbe legalmente el cobro sorpresa de médicos fuera de red en instalaciones dentro de red.
3. Suspensión inmediata de cobro: Ordena al hospital congelar el cobro e intereses y abstenerse de enviar la cuenta a burós de crédito durante los 30 días de investigación estatutaria.

📬 INSTRUCCIONES DE ENVÍO:
- Imprima esta carta y fírmela con tinta azul.
- Envíela por Correo Certificado de USPS (Certified Mail with Return Receipt Requested) para comprobar la fecha de entrega.
- Conserve una copia física y el comprobante verde de entrega para sus registros.
================================================================================\n\n`
    } else if (disputeType === 'debt') {
      letterBody = `CERTIFIED MAIL - RETURN RECEIPT REQUESTED
Date: ${today}

To: ${creditorName || 'Collection Agency'}
Account Reference: ${accountNum}
Alleged Balance: $${disputedAmount || '0.00'}

SUBJECT: DEBT VALIDATION DEMAND PURSUANT TO FDCPA (15 U.S.C. § 1692g) & NOTICE TO CEASE HARASSING COMMUNICATIONS

Dear Debt Collector,

I am writing in response to your communication regarding the alleged debt referenced above. Be advised that I dispute the validity of this alleged debt in its entirety.

Pursuant to the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692g(b), you are required to immediately CEASE all collection efforts until you obtain and mail certified verification of this debt to me.

MANDATORY VALIDATION DOCUMENTS DEMANDED:
1. The original signed agreement bearing my signature authorizing this obligation.
2. A complete, itemized accounting showing the original principal balance, and all subsequent interest, late fees, and charges added by any party.
3. Proof of chain-of-custody demonstrating your legal assignment and ownership of this alleged debt.
4. Proof that you are licensed to collect debts in my state of residence.

NOTICE OF TELEPHONE COMMUNICATIONS CEASE:
Pursuant to 15 U.S.C. § 1692c(c), do not contact me by telephone at my home, mobile, or place of employment. All future communications regarding this matter must be conducted strictly in writing via US Postal Service.

Failure to provide statutory validation within 30 days requires the immediate closure of this file and deletion of any derogatory remarks reported to Equifax, Experian, or TransUnion.

Sincerely,

${userName}
Signature: ___________________________`

      spanishExplanation = `================================================================================
📋 GUÍA Y EXPLICACIÓN EN ESPAÑOL PARA EL CONSUMIDOR
================================================================================
Estimado(a) ${userName}:

Esta carta legal está redactada en inglés formal conforme a la Ley Federal FDCPA (15 U.S.C. § 1692g) para obligar legalmente a la agencia de cobranzas a suspender todo acoso.

📌 ¿QUÉ EXIGE ESTA CARTA A LA AGENCIA DE COBRO?
1. Cese inmediato de llamadas telefónicas: Bajo la Sección 1692c(c), se les prohíbe llamarlo a su teléfono celular, casa o trabajo.
2. Validación legal obligatoria: Exige copia del contrato original firmado por usted y el cálculo detallado de cómo calcularon los $${disputedAmount || '0.00'}.
3. Prueba de propiedad de la deuda: Si compraron la deuda a un banco o tercero, deben demostrar la cadena de custodia legal.
4. Si no validan en 30 días: Por ley federal deben cerrar el archivo y eliminar todo reporte negativo en Experian, Equifax y TransUnion.

📬 INSTRUCCIONES DE ENVÍO:
- Envíela por Correo Certificado USPS con acuse de recibo.
- Si continúan llamándole después de recibir la carta, registre fecha y hora: cada llamada viola la ley federal con penalidades de hasta $1,000 por infracción.
================================================================================\n\n`
    } else if (disputeType === 'credit') {
      letterBody = `CERTIFIED MAIL - RETURN RECEIPT REQUESTED
Date: ${today}

To: ${creditorName || 'Credit Bureau (Experian / Equifax / TransUnion)'}
Consumer Name: ${userName}
Account / Dispute Reference: ${accountNum}
Disputed Item / Amount: $${disputedAmount || '0.00'}

SUBJECT: FORMAL SECTION 609 DISPUTE & DEMAND FOR VERIFICATION (15 U.S.C. § 1681g / § 1681i)

Dear Dispute Resolution Department,

I am writing pursuant to the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681g (Section 609) and 15 U.S.C. § 1681i (Section 611), to formally dispute unverified derogatory information on my consumer credit profile regarding ${creditorName || 'the reported furnisher'}.

DEMAND FOR VERIFIABLE WRITTEN DOCUMENTATION:
Under federal law, consumer reporting agencies are statutorily required to verify disputed items with authentic documentation from the furnisher, including:
1. The original credit agreement or contract bearing my verified signature.
2. Complete accounting ledger proving the accuracy of the alleged balance of $${disputedAmount || '0.00'}.
3. Proof that the data furnisher maintains certified chain-of-title documentation authorizing reporting under Metro-2 standards.

STATUTORY 30-DAY TIMELINE:
Under 15 U.S.C. § 1681i(a)(1), you have exactly thirty (30) calendar days from receipt of this certified communication to complete your investigation. If you are unable to verify this account with original documentation within 30 days, federal law mandates that you immediately DELETE this derogatory entry from my credit file.

Sincerely,

${userName}
Signature: ___________________________`

      spanishExplanation = `================================================================================
📋 GUÍA Y EXPLICACIÓN EN ESPAÑOL PARA EL CONSUMIDOR
================================================================================
Estimado(a) ${userName}:

Esta carta legal invoca las secciones 609 y 611 de la Ley Federal de Informes de Crédito Justos (FCRA, 15 U.S.C. § 1681).

📌 ¿QUÉ EXIGE ESTA CARTA A LOS BURÓS DE CRÉDITO?
1. Verificación obligatoria con documentos originales: No basta con que el buró consulte una computadora; deben exigir al acreedor el contrato firmado original.
2. Plazo fatal de 30 días: Por ley federal (15 U.S.C. § 1681i), el buró tiene exactamente 30 días para verificar o ELIMINAR por completo el reporte negativo de su historial crediticio.
3. Copia gratuita de su reporte actualizado: Al completar la investigación, deben enviarle por correo su reporte corregido sin costo.

📬 INSTRUCCIONES DE ENVÍO:
- Envíe una copia por separado a cada buró donde aparezca el error (Experian, TransUnion, Equifax).
- Adjunte fotocopia de su identificación oficial (Licencia o ID estatal) y un comprobante de domicilio reciente (recibo de luz o agua).
================================================================================\n\n`
    } else {
      letterBody = `CERTIFIED MAIL - RETURN RECEIPT REQUESTED
Date: ${today}

To: ${creditorName || 'Property Management / Landlord'}
Rental Property Address: [Rental Property Address]
Tenant Name: ${userName}
Security Deposit Disputed: $${disputedAmount || '0.00'}

SUBJECT: FORMAL DEMAND FOR RETURN OF SECURITY DEPOSIT PURSUANT TO STATE TENANCY LAW

Dear Landlord / Property Manager,

Please accept this letter as formal demand for the full return of my security deposit in the amount of $${disputedAmount || '0.00'}.

The deductions withheld from my security deposit are unlawful and disputed for the following reasons:
1. Normal Wear and Tear: Under state landlord-tenant statutes, landlords may not deduct funds for normal wear and tear resulting from ordinary habitation.
2. Failure of Timely Written Itemization: Landlords are statutorily required to deliver an itemized list of damages accompanied by authentic contractor receipts or invoices within the statutory deadline.
3. Bad Faith Penalty: Failure to adhere to these statutory deadlines constitutes bad faith withholding under state law, exposing the landlord to statutory damages of up to 2x to 3x the deposit amount plus attorney fees in small claims court.

DEMAND:
Please issue a cashier's check or digital payment for $${disputedAmount || '0.00'} within ten (10) calendar days of receipt of this notice. If full payment is not received within this period, I will immediately file an action in Small Claims Court for statutory damages, court costs, and interest.

Sincerely,

${userName}
Signature: ___________________________`

      spanishExplanation = `================================================================================
📋 GUÍA Y EXPLICACIÓN EN ESPAÑOL PARA EL CONSUMIDOR
================================================================================
Estimado(a) ${userName}:

Esta carta legal exige formalmente a su arrendador o compañía de administración la devolución íntegra de su depósito de garantía bajo las leyes de inquilinos de su estado.

📌 ¿QUÉ EXIGE ESTA CARTA A SU ARRENDADOR?
1. Devolución de $${disputedAmount || '0.00'}: Exige el reembolso de las deducciones indebidas en un plazo improrrogable de 10 días.
2. Prohibición de cobrar por desgaste natural: La ley prohíbe descontar fondos por desgaste normal de uso de la vivienda (pintura gastada, alfombra con uso ordinario).
3. Advertencia de daños triples (Treble Damages): Si el arrendador retiene fondos de mala fe o no envió facturas reales de contratistas a tiempo, la corte de reclamos menores puede condenarlo a pagar de 2 a 3 veces el monto del depósito más costos legales.

📬 INSTRUCCIONES DE ENVÍO:
- Envíela por Correo Certificado de USPS para tener prueba legal de que la recibieron.
- Si no devuelven su dinero en 10 días, puede llevar esta carta directamente a la Corte de Reclamos Menores (Small Claims Court) de su condado.
================================================================================\n\n`
    }

    const fullOutput = isSpanish ? `${spanishExplanation}${letterBody}` : letterBody

    return NextResponse.json({
      letter: fullOutput,
      letterBody,
      explanation: isSpanish ? spanishExplanation : null
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
