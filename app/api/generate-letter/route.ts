import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { disputeType, creditorName, disputedAmount, userName = 'Consumer', accountNum = 'PENDING-001' } = await req.json()
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    let fullLetter = ''

    if (disputeType === 'medical') {
      fullLetter = `CERTIFIED MAIL - RETURN RECEIPT REQUESTED
Date: ${today}

To: ${creditorName || 'Hospital Billing & Patient Financial Services'}
Patient Name: ${userName}
Account / Invoice Number: ${accountNum}
Disputed Amount: $${disputedAmount || '0.00'}

SUBJECT: FORMAL BILLING DISPUTE AND DEMAND FOR ITEMIZED AUDIT PURSUANT TO THE NO SURPRISES ACT (P.L. 116-260)

Dear Billing Supervisor,

I am writing to formally dispute the outstanding charges of $${disputedAmount} billed under the above-referenced account. I am disputing this debt in its entirety until a certified, unbundled itemized statement with all corresponding CPT, HCPCS, and Revenue Codes is provided.

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
    } else if (disputeType === 'debt') {
      fullLetter = `CERTIFIED MAIL - RETURN RECEIPT REQUESTED
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

${userName}`
    } else if (disputeType === 'credit') {
      fullLetter = `CERTIFIED MAIL - RETURN RECEIPT REQUESTED
Date: ${today}

To: ${creditorName || 'Credit Bureau (Experian / Equifax / TransUnion)'}
Consumer Name: ${userName}
Account / Dispute Reference: ${accountNum}
Disputed Item / Amount: ${disputedAmount || '0.00'}

SUBJECT: FORMAL SECTION 609 DISPUTE & DEMAND FOR VERIFICATION (15 U.S.C. § 1681g / ? 1681i)

Dear Dispute Resolution Department,

I am writing pursuant to the Fair Credit Reporting Act (FCRA), 15 U.S.C. § 1681g (Section 609) and 15 U.S.C. § 1681i (Section 611), to formally dispute unverified derogatory information on my consumer credit profile regarding ${creditorName || 'the reported furnisher'}.

DEMAND FOR VERIFIABLE WRITTEN DOCUMENTATION:
Under federal law, consumer reporting agencies are statutorily required to verify disputed items with authentic documentation from the furnisher, including:
1. The original credit agreement or contract bearing my verified signature.
2. Complete accounting ledger proving the accuracy of the alleged balance of ${disputedAmount}.
3. Proof that the data furnisher maintains certified chain-of-title documentation authorizing reporting under Metro-2 standards.

STATUTORY 30-DAY TIMELINE:
Under 15 U.S.C. § 1681i(a)(1), you have exactly thirty (30) calendar days from receipt of this certified communication to complete your investigation. If you are unable to verify this account with original documentation within 30 days, federal law mandates that you immediately DELETE this derogatory entry from my credit file.

Sincerely,

${userName}`
    } else {
      fullLetter = `CERTIFIED MAIL - RETURN RECEIPT REQUESTED
Date: ${today}

To: ${creditorName || 'Property Management / Landlord'}
Rental Property Address: [Rental Property Address]
Tenant Name: ${userName}
Security Deposit Disputed: $${disputedAmount || '0.00'}

SUBJECT: FORMAL DEMAND FOR RETURN OF SECURITY DEPOSIT PURSUANT TO STATE TENANCY LAW

Dear Landlord / Property Manager,

Please accept this letter as formal demand for the full return of my security deposit in the amount of $${disputedAmount}.

The deductions withheld from my security deposit are unlawful and disputed for the following reasons:
1. Normal Wear and Tear: Under state landlord-tenant statutes, landlords may not deduct funds for normal wear and tear resulting from ordinary habitation.
2. Failure of Timely Written Itemization: Landlords are statutorily required to deliver an itemized list of damages accompanied by authentic contractor receipts or invoices within the statutory deadline.
3. Bad Faith Penalty: Failure to adhere to these statutory deadlines constitutes bad faith withholding under state law, exposing the landlord to statutory damages of up to 2x to 3x the deposit amount plus attorney fees in small claims court.

DEMAND:
Please issue a cashier's check or digital payment for $${disputedAmount} within ten (10) calendar days of receipt of this notice. If full payment is not received within this period, I will immediately file an action in Small Claims Court for statutory damages, court costs, and interest.

Sincerely,

${userName}`
    }

    return NextResponse.json({ letter: fullLetter })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
