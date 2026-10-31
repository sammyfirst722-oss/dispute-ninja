export interface DisputeGuide {
  slug: string;
  title: string;
  metaDescription: string;
  badge: string;
  statute: string;
  statutoryDeadline: string;
  estimatedSavings: string;
  summary: string;
  steps: { title: string; description: string }[];
  legalGrounds: string[];
  sampleSnippet: string;
  faqs: { question: string; answer: string }[];
}

export const DISPUTE_GUIDES: DisputeGuide[] = [
  {
    slug: "emergency-room-surprise-bill",
    title: "Fight Emergency Room Surprise Bills",
    metaDescription:
      "Learn how the No Surprises Act protects you from out-of-network balance billing at in-network emergency rooms.",
    badge: "Federal Law",
    statute: "No Surprises Act — 42 U.S.C. § 300gg-111",
    statutoryDeadline: "File within 120 days of the EOB or bill date",
    estimatedSavings: "$1,000 – $10,000+ per incident",
    summary:
      "The No Surprises Act (effective Jan 1, 2022) prohibits out-of-network providers from balance billing patients for emergency services at in-network facilities, most non-emergency services at in-network facilities, and air ambulance services. You are generally liable only for in-network cost-sharing amounts.",
    steps: [
      {
        title: "Review Your Explanation of Benefits (EOB)",
        description:
          "Compare the EOB from your insurer against the provider's bill. Look for 'balance billing' charges that exceed your in-network copay/coinsurance.",
      },
      {
        title: "Send a No Surprises Act Dispute Letter",
        description:
          "Notify both the provider and insurer in writing that you believe the bill violates the No Surprises Act. Demand they apply in-network rates.",
      },
      {
        title: "File an Independent Dispute Resolution (IDR) Request",
        description:
          "If the provider and insurer cannot agree on payment, either party may initiate IDR through the HHS-approved portal. You may need to pay the arbitration fee ($25–$500) but can recover it if you prevail.",
      },
      {
        title: "Escalate to State Insurance Commissioner",
        description:
          "File a complaint with your state department of insurance if the provider continues to demand the inflated balance.",
      },
    ],
    legalGrounds: [
      "42 U.S.C. § 300gg-111 prohibits balance billing for emergency services",
      "Patient liability capped at in-network cost-sharing",
      "Good-faith estimate requirement under § 300gg-112",
      "IDR process favors providers when offer is < 120% of median in-network rate",
    ],
    sampleSnippet:
      "I dispute this out-of-network balance bill pursuant to the No Surprises Act, 42 U.S.C. § 300gg-111. The services were rendered at an in-network facility for an emergency condition. I am liable only for in-network cost-sharing. Please cease collection and rebill at the in-network rate within 30 days.",
    faqs: [
      {
        question: "Does the No Surprises Act cover ground ambulance rides?",
        answer:
          "Yes — air ambulance services are fully protected; ground ambulance protections are being phased in starting 2024–2025 depending on state readiness.",
      },
      {
        question: "What if I signed a waiver consenting to out-of-network care?",
        answer:
          "Waivers are invalid for emergency services, certain non-emergency services at in-network facilities, and services by out-of-network radiologists/anesthesiologists. Waivers are only permitted for scheduled services at in-network facilities when you voluntarily choose an out-of-network provider and meet specific disclosure requirements.",
      },
    ],
  },
  {
    slug: "debt-collector-validation-letter",
    title: "Demand Debt Validation from Collectors",
    metaDescription:
      "Use the FDCPA 30-day validation letter to force debt collectors to prove the debt is yours and stop harassment.",
    badge: "Federal Law",
    statute: "Fair Debt Collection Practices Act — 15 U.S.C. § 1692g",
    statutoryDeadline: "Send within 30 days of first contact to dispute",
    estimatedSavings: "$0–$5,000+ in eliminated fraudulent or time-barred debts",
    summary:
      "Under the FDCPA, within 5 days of first contact a debt collector must send a written validation notice. If you dispute the debt in writing within 30 days, the collector must cease collection until they provide verification of the debt, including the original creditor, amount, and proof you owe it.",
    steps: [
      {
        title: "Send a Written Validation Request",
        description:
          "Mail a certified letter (return receipt requested) within 30 days of first contact demanding verification of the debt under § 1692g.",
      },
      {
        title: "Document All Collector Contacts",
        description:
          "Log every call, letter, and text. Record dates, times, and names. FDCPA violations can support statutory damages of $100–$1,000 plus attorney fees.",
      },
      {
        title: "Review the Validation Response",
        description:
          "The collector must provide the debt amount, creditor name, and a statement that if you dispute within 30 days the debt will be considered valid. If they fail to validate, demand deletion.",
      },
      {
        title: "File an FTC/State Complaint or Lawsuit",
        description:
          "If the collector continues contacting you without validation, file a complaint with the CFPB and consider a FDCPA lawsuit in federal or state court.",
      },
    ],
    legalGrounds: [
      "15 U.S.C. § 1692g — mandatory debt validation within 30 days",
      "15 U.S.C. § 1692e — prohibition on false, deceptive, or misleading representations",
      "15 U.S.C. § 1692f — prohibition on abusive collection practices",
      "Statutory damages up to $1,000 plus actual damages and attorney fees",
    ],
    sampleSnippet:
      "I dispute this debt in full pursuant to 15 U.S.C. § 1692g. Within 30 days of your first contact, I demand written verification including the original creditor, amount, and proof this debt is mine. Cease all collection communications until validation is provided.",
    faqs: [
      {
        question: "What if the collector sues me before I dispute?",
        answer:
          "File an answer denying the debt and demand validation. If they cannot produce the assignment chain and original contract, the court should dismiss the case. Never ignore a lawsuit — respond within the deadline stated in the summons.",
      },
      {
        question: "Does the 30-day clock start when I receive the validation notice or first call?",
        answer:
          "The 30-day dispute period starts from the date you receive the written validation notice, not the first phone call. However, sending a dispute immediately upon first contact is safest.",
      },
    ],
  },
  {
    slug: "hospital-itemized-bill-audit",
    title: "Audit Hospital Bills for Errors",
    metaDescription:
      "How to request an itemized bill, spot chargemaster unbundling, duplicate charges, and negotiate down inflated hospital bills.",
    badge: "Billing Practice",
    statute: "State hospital transparency & consumer protection statutes",
    statutoryDeadline: "Request itemization within 30–60 days of billing; dispute within 120 days",
    estimatedSavings: "$500 – $50,000+ per hospital stay",
    summary:
      "Hospital bills routinely contain errors: duplicate charges, unbundled CPT codes, phantom supplies, and inflated chargemaster rates. Federal and state laws require hospitals to provide itemized bills upon request. A thorough audit can reveal overcharges of 30–300%.",
    steps: [
      {
        title: "Request a Detailed Itemized Bill",
        description:
          "Send a written request for an itemized bill with CPT/HCPCS codes, dates of service, and unit counts. Hospitals must provide this under federal transparency rules and most state laws.",
      },
      {
        title: "Cross-Reference Against Your Medical Records",
        description:
          "Match every charge to a documented service. Flag medications, supplies, and procedures you did not receive or were charged twice for.",
      },
      {
        title: "Identify Unbundling and Upcoding",
        description:
          "Unbundling occurs when a package code (e.g., a surgical bundle) is broken into individual component charges. Upcoding assigns a higher-paying code than the service warranted.",
      },
      {
        title: "Negotiate or Appeal",
        description:
          "Submit a written dispute with evidence. Request charity care, financial assistance, or a prompt-pay discount. If denied, appeal to the hospital's patient advocate and then the state insurance commissioner or attorney general.",
      },
    ],
    legalGrounds: [
      "42 U.S.C. § 1395dd — EMTALA requires medical screening and stabilization",
      "CMS hospital price transparency rules (45 C.F.R. § 180)",
      "State consumer protection statutes prohibiting deceptive billing",
      "No Surprises Act good-faith estimate requirements for non-emergency services",
    ],
    sampleSnippet:
      "I request a complete itemized bill with CPT/HCPCS codes, dates, units, and chargemaster rates for services rendered between [dates]. I dispute charges for [items] as they were not received or are duplicates. Please correct and reissue within 30 days.",
    faqs: [
      {
        question: "Can a hospital charge me for a private room if I didn't request one?",
        answer:
          "Generally no — if you were placed in a semi-private room and charged for a private room without consent, that is a correctable billing error. Document your room assignment from the admission records.",
      },
      {
        question: "What is 'unbundling' in medical billing?",
        answer:
          "Unbundling is billing separately for procedure components that should be billed under a single comprehensive code. For example, charging separate codes for incision, drainage, and closure when a single surgical package code covers all three.",
      },
    ],
  },
  {
    slug: "medical-debt-credit-report-removal",
    title: "Remove Medical Debt from Credit Reports",
    metaDescription:
      "Learn your rights under the FCRA to remove paid medical debts, debts under $500, and medical collections older than one year.",
    badge: "Federal Law",
    statute: "Fair Credit Reporting Act — 15 U.S.C. § 1681i",
    statutoryDeadline: "Dispute within 30 days of discovering the error; bureaus must respond in 30 days",
    estimatedSavings: "$0–$10,000+ in credit-score-related costs (higher interest rates, denied housing)",
    summary:
      "The FCRA and recent CFPB rules require credit bureaus to remove paid medical collections, medical debts under $500, and debts older than one year before reporting. Many consumers are eligible to have medical collections deleted entirely, improving credit scores by 50–100+ points.",
    steps: [
      {
        title: "Obtain Your Free Credit Reports",
        description:
          "Pull reports from AnnualCreditReport.com. Identify all medical collections accounts, noting the creditor, amount, date opened, and status.",
      },
      {
        title: "Verify Eligibility for Removal",
        description:
          "Check if the debt is paid, under $500, older than one year, or was reported before the 12-month waiting period expired. These all qualify for removal under current CFPB guidance.",
      },
      {
        title: "Send Dispute Letters to All Three Bureaus",
        description:
          "File separate disputes with Equifax, Experian, and TransUnion via certified mail and their online portals. Cite FCRA § 1681i accuracy requirements.",
      },
      {
        title: "Escalate if Bureaus Refuse",
        description:
          "If the bureau verifies incorrectly, file a complaint with the CFPB and consider a FCRA lawsuit. Statutory damages of $100–$1,000 plus actual damages and attorney fees are available.",
      },
    ],
    legalGrounds: [
      "15 U.S.C. § 1681i — furnishers must investigate and correct inaccurate information",
      "CFPB Rule 2023 — paid medical collections must be removed; under-$500 debts removed",
      "12-month waiting period before medical debt can be reported",
      "FCRA § 1681n — statutory damages for willful non-compliance",
    ],
    sampleSnippet:
      "I dispute the medical collection account [creditor, account #] on my credit report pursuant to 15 U.S.C. § 1681i. The debt is [paid/under $500/older than 12 months] and must be removed. Please investigate and delete this entry within 30 days.",
    faqs: [
      {
        question: "Does paying a medical collection remove it from my credit report?",
        answer:
          "Under current CFPB rules, paid medical collections must be removed entirely. Unpaid medical collections under $500 must also be removed. Older unpaid debts over $500 may remain but lose significant scoring impact.",
      },
      {
        question: "How long do I have to dispute?",
        answer:
          "There is no statutory deadline to dispute, but you must do so within the bureau's investigation window (typically 30 days). File as soon as you discover the error to minimize credit damage.",
      },
    ],
  },
  {
    slug: "security-deposit-demand-letter",
    title: "Recover Security Deposit with Demand Letter",
    metaDescription:
      "Send a legally effective security deposit demand letter citing state law and bad-faith retention penalties of 2x–3x the deposit.",
    badge: "State Law",
    statute: "State landlord-tenant security deposit statutes",
    statutoryDeadline: "Typically 14–30 days after move-out to return deposit; suit deadline 1–6 years",
    estimatedSavings: "1x deposit + 2x–3x statutory damages + attorney fees",
    summary:
      "Every state requires landlords to return security deposits within a statutory period (usually 14–30 days) with an itemized deduction list. Wrongful retention can trigger bad-faith penalties of 2x–3x the deposit amount plus attorney fees and interest.",
    steps: [
      {
        title: "Document the Property Condition",
        description:
          "Use move-in/move-out photos, videos, and inspection checklists to prove the unit was returned in acceptable condition or normal wear-and-tear only.",
      },
      {
        title: "Send a Formal Demand Letter",
        description:
          "Demand full return of the deposit plus statutory penalties within 10–14 days. Cite your state's specific statute, the deadline that passed, and your intent to sue if unpaid.",
      },
      {
        title: "File in Small Claims or District Court",
        description:
          "If the landlord ignores the demand, file suit for the deposit, statutory bad-faith damages (often 2x–3x), interest, and attorney fees. Small claims limits vary by state ($5,000–$25,000).",
      },
      {
        title: "Report to State Attorney General or Housing Agency",
        description:
          "Many states allow you to file a complaint with the attorney general or local housing authority for systematic deposit violations.",
      },
    ],
    legalGrounds: [
      "State security deposit statutes (e.g., CA Civ. Code § 1950.5, NY RPAPL § 7-103)",
      "Bad-faith retention penalties of 2x–3x the deposit in many jurisdictions",
      "Landlord must provide itemized deductions and receipts within statutory period",
      "Tenant may recover attorney fees and statutory damages in addition to deposit",
    ],
    sampleSnippet:
      "Demand for return of security deposit of $[amount] per [State] statute § [cite]. You failed to return the deposit and provide itemized deductions within [X] days of move-out on [date]. I demand full return plus statutory bad-faith damages of [2x/3x] within 14 days or I will file suit in [court] for deposit, penalties, interest, and attorney fees.",
    faqs: [
      {
        question: "Can a landlord keep the deposit for normal wear and tear?",
        answer:
          "No. Normal wear and tear (faded paint, minor carpet wear) cannot be deducted. Only actual damage beyond normal wear, unpaid rent, or cleaning costs supported by receipts are deductible.",
      },
      {
        question: "What if my landlord says they need more time?",
        answer:
          "The statutory deadline is firm. Extensions require your written consent. If the deadline passes without an itemized list, many states presume the landlord must return the full deposit and may owe penalties.",
      },
    ],
  },
  {
  "slug": "ambulance-surprise-bills-out-of-network-ground-transport",
  "title": "Ambulance Surprise Bills & Out of Network Ground Transport Dispute Guide",
  "metaDescription": "Discover how to fight unexpected ambulance charges and out-of-network ground transport costs under federal consumer protection laws. Get actionable steps, legal rights, and templates to reduce surprise medical bills and protect your wallet.",
  "badge": "Federal Law",
  "statute": "42 U.S.C. § 300gg-111 (No Surprises Act)",
  "statutoryDeadline": "Within 120 days from receipt of the bill",
  "estimatedSavings": "$500 - $10,000 depending on case complexity and coverage gaps",
  "summary": "Surprise ambulance bills and out-of-network ground transport charges have become a major financial burden for many consumers after emergency medical events. These unexpected expenses often stem from hospitals billing third-party insurers directly rather than through your primary health plan, leaving patients responsible for full costs. The No Surprises Act was enacted specifically to address this issue by requiring healthcare providers to obtain prior authorization for out-of-network services and ensuring patients receive fair payment. Understanding your rights under federal law can help you recover uncompensated costs and prevent future financial hardship.",
  "steps": [
    {
      "title": "Review Your Coverage and Verify Network Status",
      "description": "Contact your health insurance provider immediately to confirm whether the ambulance service and ground transport were in-network at the time of service. Request a detailed explanation of benefits (EOB) and check if prior authorization was properly obtained for out-of-network care."
    },
    {
      "title": "Notify the Provider of Potential Errors",
      "description": "If you suspect the charge was incorrectly billed as out-of-network, formally request that the hospital or ambulance service review their billing against your policy. Provide documentation such as your insurance card and EOB to support your claim."
    },
    {
      "title": "File a Formal Complaint and Demand Payment",
      "description": "Submit a written demand letter citing the No Surprises Act and relevant state regulations. Include all supporting documents, specify the amount owed, and set a reasonable deadline for resolution while documenting the correspondence."
    },
    {
      "title": "Escalate Through Regulatory Agencies",
      "description": "If the provider does not resolve the issue, file a complaint with your state's insurance department or the Federal Trade Commission. These agencies enforce consumer protection rules and may mediate settlements on your behalf."
    }
  ],
  "legalGrounds": [
    "No Surprises Act (42 U.S.C. § 300gg-111) requiring providers to obtain prior authorization for out-of-network emergency services",
    "State insurance mandates and consumer protection statutes prohibiting surprise billing practices"
  ],
  "sampleSnippet": "Dear [Provider Name], this letter serves as formal notice regarding the billing discrepancy for your ambulance service on [date]. Under the No Surprises Act, we require prior authorization for out-of-network emergency transportation. Please provide a detailed explanation of benefits and confirm whether this service was covered under your plan. We will pursue recovery of the overcharged amount within 30 days.",
  "faqs": [
    {
      "question": "What is the No Surprises Act and why does it matter for ambulance bills?",
      "answer": "The No Surprises Act is a federal law designed to protect consumers from unexpected medical bills. It requires healthcare providers to get prior authorization for out-of-network emergency services like ambulance and ground transport, ensuring patients aren't charged full out-of-pocket costs they could avoid."
    },
    {
      "question": "How long do I have to dispute an ambulance bill under federal law?",
      "answer": "You generally have up to 120 days from receiving the bill to file a complaint or seek reimbursement under the No Surprises Act. Prompt action increases your chances of successful recovery and ensures compliance with federal timelines."
    },
    {
      "question": "Can my insurance company pay for out-of-network ambulance services?",
      "answer": "Yes, most insurance plans cover out-of-network emergency services when proper prior authorization has been obtained. If your insurer denied coverage, you may be entitled to a partial or full refund plus interest on any late payments."
    }
  ]
}
  ,
  {
  "slug": "out-of-network-anesthesiologist-dispute-guide",
  "title": "How to Dispute Out of Network Anesthesiologist Charges at In-Network Hospitals",
  "metaDescription": "Discover your rights when an anesthesiologist works outside your hospital's network. Learn how to dispute surprise out-of-network charges, file proper claims, and recover up to $5,000 in unexpected medical costs under federal and state laws.",
  "badge": "Federal Law",
  "statute": "No Surprises Act of 2020 (42 U.S.C. § 300gg-111)",
  "statutoryDeadline": "60 days from receipt of the out-of-network claim",
  "estimatedSavings": "$500 - $5,000",
  "summary": "When you are treated at an in-network hospital but your anesthesiologist operates outside the hospital's provider network, you may face unexpected bills for services not covered under your original agreement. This guide explains your legal rights under the No Surprises Act and other consumer protection laws, provides actionable steps to dispute the charge, and outlines potential savings from recovering overcharged amounts.",
  "steps": [
    {
      "title": "Review Your Contract and Hospital Network Status",
      "description": "Check your health plan's network directory and verify whether the anesthesiologist was in-network at the time of service. Gather all documentation including the treatment record, billing statement, and any communications regarding the out-of-network status."
    },
    {
      "title": "File a Formal Dispute with Your Insurer or Hospital",
      "description": "Submit a written notice of dispute within the statutory deadline, clearly identifying the provider, date of service, amount charged, and the specific error (such as improper network classification). Attach supporting documents and request a detailed explanation of benefits."
    },
    {
      "title": "Escalate Through State Insurance Regulator If Necessary",
      "description": "If the initial dispute is unresolved, contact your state's insurance department or consumer protection agency. They can mediate the claim, enforce contractual obligations, and help recover funds owed to you."
    }
  ],
  "legalGrounds": [
    "Right to fair pricing under the No Surprises Act of 2020",
    "State insurance consumer protection statutes requiring transparent billing",
    "Contractual obligations between healthcare providers and insurers"
  ],
  "sampleSnippet": "Dear [Insurance Company], We are writing to formally dispute the $14,200 charge for Dr. Jane Doe's anesthesiology services performed on March 15, 2024, at [Hospital Name]. Under the No Surprises Act, we are entitled to the full negotiated rate for out-of-network care without additional patient responsibility. Please provide a detailed breakdown of the charges and confirm that the provider was properly classified as out-of-network at the time of service.",
  "faqs": [
    {
      "question": "What happens if my hospital has an out-of-network anesthesiologist?",
      "answer": "Your health plan must cover the full cost of the procedure regardless of whether the provider is in-network. You can file a dispute to ensure you are not being charged extra fees beyond the contracted rate."
    },
    {
      "question": "Can I get refunds for overcharges related to out-of-network anesthesiologists?",
      "answer": "Yes, if the hospital incorrectly billed you for services that should have been paid in-network rates, you may be eligible for a refund or credit. Document all communications and keep records of your dispute process."
    },
    {
      "question": "Who do I contact first when facing an out-of-network billing issue?",
      "answer": "Start by reviewing your insurance policy and checking the hospital's network status. Then file a formal dispute with your insurer or the hospital's billing department before escalating to state regulators."
    }
  ]
}
  ,
  {
  "slug": "disputing-denied-insurance-pre-authorization-retroactively",
  "title": "Disputing a Denied Insurance Pre-Authorization Retroactively: A Step-by-Step Guide",
  "metaDescription": "Discover how to challenge a retroactive denial of insurance pre-authorization. Our comprehensive guide explains legal grounds, deadlines, and provides a sample demand letter.",
  "badge": "Federal Law",
  "statute": "Employee Retirement Income Security Act (ERISA) § 502(a), 29 U.S.C. § 1132(a)",
  "statutoryDeadline": "120 days from the date of billing",
  "estimatedSavings": "$1,000 - $10,000",
  "summary": "When an insurance company denies pre-authorization for a medical service after the service has been rendered, it can leave patients with unexpected bills. Under federal law, particularly ERISA, plan administrators must provide a full and fair review of any denial. This guide outlines the steps to dispute such a denial retroactively, ensuring you understand your rights and the timeline for filing an appeal.",
  "steps": [
    {
      "title": "Step 1: Gather Documentation",
      "description": "Collect all relevant documents, including the pre-authorization request, denial letter, medical records, and any correspondence with the insurer."
    },
    {
      "title": "Step 2: Review the Denial Reason",
      "description": "Analyze the denial letter to identify the specific reason given and compare it against the plan's coverage criteria."
    },
    {
      "title": "Step 3: File an Internal Appeal",
      "description": "Submit a written appeal to the insurer within the plan's deadline, typically 180 days, citing the relevant plan provisions and supporting evidence."
    },
    {
      "title": "Step 4: Request an External Review",
      "description": "If the internal appeal is denied, request an independent external review as allowed under ERISA or state law."
    },
    {
      "title": "Step 5: Consider Legal Action",
      "description": "If all administrative remedies are exhausted, you may file a lawsuit in federal court under ERISA § 502(a) to compel coverage."
    }
  ],
  "legalGrounds": [
    "Failure to provide a full and fair review as required by ERISA",
    "Denial not based on plan terms or medical necessity",
    "Violation of fiduciary duty under ERISA",
    "Improper retroactive denial contrary to plan language"
  ],
  "sampleSnippet": "Dear Insurance Company, I am writing to formally dispute the denial of pre-authorization for my recent medical treatment. The denial appears to be retroactive and inconsistent with the plan's coverage criteria. Please reconsider and provide coverage for the services rendered.",
  "faqs": [
    {
      "question": "Can I appeal a pre-authorization denial after the service has been provided?",
      "answer": "Yes, you can file an internal appeal within the plan's specified timeframe, typically 180 days from the date of denial."
    },
    {
      "question": "What is the deadline for filing an ERISA lawsuit?",
      "answer": "Generally, you must exhaust administrative appeals first, and then file suit within one year of the final denial, but state statutes may vary."
    },
    {
      "question": "Is there a cost to request an external review?",
      "answer": "Most plans provide external review at no cost, but you should verify with your insurer."
    }
  ]
}
  ,
  {
  "slug": "lab-test-coding-errors-unnecessary-medical-tests-dispute-guide",
  "title": "Lab Test Coding Errors & Unnecessary Medical Tests Dispute Guide",
  "metaDescription": "Learn how to identify and dispute lab test coding errors and unnecessary medical tests. This guide provides actionable steps, legal grounds, and templates to recover costs and protect your healthcare rights under federal and state laws.",
  "badge": "Federal Law",
  "statute": "False Claims Act (15 U.S.C. § 1011) and Medicare Fraud Statutes",
  "statutoryDeadline": "Within 180 days of receiving the billing statement",
  "estimatedSavings": "$500 - $10,000",
  "summary": "Medical labs frequently miscode procedures, leading to overcharges or unnecessary tests that waste time and money. Patients often discover these errors after receiving bills, but many have the right to dispute them under federal anti-kickback and fraud laws. This guide outlines how to review your Explanation of Benefits, contact providers, and take legal action when coding errors or unnecessary testing occur. By understanding your rights under the False Claims Act and related statutes, you can recover improperly paid services and prevent future billing mistakes.",
  "steps": [
    {
      "title": "Review Your Billing Statement and EOB",
      "description": "Carefully examine your Explanation of Benefits (EOB) and itemized bill. Look for discrepancies between the codes billed and the services actually performed. Note any 'upcoding' (higher-level code used instead of appropriate one) or missing documentation."
    },
    {
      "title": "Contact Provider's Billing Department",
      "description": "Reach out to the medical facility or lab directly within 30 days of the charge. Submit a written request asking for clarification on the codes used and whether the service was medically necessary. Request a corrected bill if errors are found."
    },
    {
      "title": "File a Formal Complaint with CMS or OIG",
      "description": "If the provider refuses to correct the error, file a complaint with the Centers for Medicare & Medicaid Services (CMS) Office of Inspector General (OIG). You can also report potential fraud under the False Claims Act by contacting the Department of Justice's Civil Investigative Learning Unit (CILU)."
    },
    {
      "title": "Seek Legal Representation If Needed",
      "description": "Consult an attorney specializing in health care fraud or medical billing disputes. They can help negotiate settlements, pursue civil penalties, or initiate criminal investigations against negligent providers."
    }
  ],
  "legalGrounds": [
    "Violation of the False Claims Act for submitting false or misleading claims to government programs",
    "Upcoding or undercoding of medical services in violation of Medicare Fraud Statutes",
    "Breach of contract under state medical billing regulations and patient rights laws"
  ],
  "sampleSnippet": "Dear [Provider Name],\n\nWe are writing to dispute the charges on our recent billing statement dated [Date]. Our records indicate that procedure #12345 was coded as CPT code Z12345, which corresponds to a complex diagnostic imaging study not performed during our visit. We request a corrected bill reflecting the actual services rendered, which were documented as CPT code Z67890. Please provide a revised explanation of benefits within 14 days.\n\nSincerely,\n[Your Name]",
  "faqs": [
    {
      "question": "What is a lab test coding error?",
      "answer": "A lab test coding error occurs when a medical laboratory assigns an incorrect CPT or ICD-10 code to a procedure or diagnosis. This can happen due to miscommunication between the ordering physician and the lab, or failure to document the specific tests ordered. Such errors may result in overcharging or underpayment."
    },
    {
      "question": "How long do I have to dispute a billing error?",
      "answer": "Under federal law, you generally have 180 days from the date of the billing statement to dispute any errors. However, some states allow longer periods, so check your state's specific medical billing statutes for extended deadlines."
    },
    {
      "question": "Can I get compensation if my tests were unnecessary?",
      "answer": "Yes. If you can demonstrate that a test was performed without medical necessity—either because it wasn't ordered by a licensed provider or didn't meet clinical guidelines—you may be entitled to reimbursement. This falls under both the False Claims Act and state medical malpractice laws."
    },
    {
      "question": "Who should I contact first before taking legal action?",
      "answer": "Start by contacting the provider's billing department to request clarification and correction. If they refuse, then escalate to CMS/OIG or consult an attorney. Legal action should only be pursued after exhausting administrative remedies."
    }
  ]
}
  ,
  {
  "slug": "urgent-care-billed-as-emergency-room-dispute-guide",
  "title": "How to Dispute Urgent Care Centers Billed as Emergency Rooms",
  "metaDescription": "Discover your rights when an urgent care center incorrectly bills you as an emergency room. Learn how to file a dispute, recover overcharges, and protect yourself under federal law.",
  "badge": "Federal Law",
  "statute": "No Surprises Act of 2020 (42 U.S.C. § 300gg-111)",
  "statutoryDeadline": "120 days from billing",
  "estimatedSavings": "$500 - $5,000",
  "summary": "Many patients receive unexpectedly high charges when urgent care centers incorrectly bill services as emergency room procedures, violating their right to fair pricing. This guide explains your federal rights under the No Surprises Act and provides actionable steps to dispute incorrect billing, recover overpayments, and ensure transparency in medical billing practices.",
  "steps": [
    {
      "title": "Review Your Bill and Documentation",
      "description": "Carefully examine the invoice to identify discrepancies between the actual service level and the emergency room charge. Gather supporting documents such as the visit note, receipt, and any communication with the provider."
    },
    {
      "title": "File a Formal Dispute with the Provider",
      "description": "Submit a written dispute to the urgent care center within the statutory deadline, clearly stating that the billing error violates the No Surprises Act and requesting correction and refund."
    },
    {
      "title": "Escalate Through Regulatory Agencies",
      "description": "If the provider does not resolve the issue, file a complaint with your state's health department or the Federal Trade Commission to enforce your rights and potentially obtain additional compensation."
    }
  ],
  "legalGrounds": [
    "Violation of the No Surprises Act which requires providers to disclose the true cost of services before treatment begins",
    "Unfair or deceptive trade practice under the FTC Act regarding misleading billing information"
  ],
  "sampleSnippet": "Dear [Provider Name], we are writing to formally dispute the $1,200 charge on our recent visit dated March 15, 2024. According to the No Surprises Act, urgent care services should be billed at the standard urgent care rate, not the emergency room rate. Please correct this billing error and issue a refund of $850 immediately.",
  "faqs": [
    {
      "question": "What is the No Surprises Act and why does it apply to urgent care centers?",
      "answer": "The No Surprises Act prohibits healthcare providers from charging out-of-pocket prices without informing patients beforehand. It applies to urgent care centers because they often perform procedures similar to emergency rooms but may bill differently, leading to surprise costs for patients."
    },
    {
      "question": "How much time do I have to dispute a billed error?",
      "answer": "Under the No Surprises Act, you generally have 120 days from the date of the bill to file a formal dispute with the provider or regulatory agency."
    },
    {
      "question": "Can I still sue if my urgent care center refuses to refund the overcharge?",
      "answer": "Yes, if the provider fails to comply after a good-faith dispute, you may pursue legal remedies including filing a lawsuit under federal law for violation of the No Surprises Act."
    }
  ]
}
,
  {
    "slug": "quest-diagnostics-unauthorized-lab-fees",
    "title": "Dispute Quest Diagnostics Surprise Lab Bills",
    "metaDescription": "Learn how to dispute unapproved Quest Diagnostics lab bills under federal law, the No Surprises Act, and Clinical Laboratory Improvement Amendments.",
    "badge": "Federal Law",
    "statute": "No Surprises Act (42 U.S.C. § 300gg-111) & Fair Credit Billing Act",
    "statutoryDeadline": "Within 60–120 days from billing date",
    "estimatedSavings": "$200 – $3,500 per test panel",
    "summary": "Patients visiting in-network physicians frequently receive surprise out-of-network bills from Quest Diagnostics because specimens were sent out without upfront informed consent. Under the No Surprises Act and provider network contracts, unauthorized out-of-network lab fees can be legally challenged and reduced to in-network contracted rates.",
    "steps": [
      {
        "title": "Request the Original Physician Lab Order",
        "description": "Obtain the exact signed lab requisition form from your ordering physician to confirm whether you signed a voluntary out-of-network consent waiver."
      },
      {
        "title": "Cross-Reference With Your Insurance EOB",
        "description": "Compare Quest's billed amount against your insurer's Explanation of Benefits to verify allowable in-network diagnostic rates."
      },
      {
        "title": "Send Formal Demand for Network Recalculation",
        "description": "Demand in writing that Quest Diagnostics re-bill your insurer under in-network cost-sharing guidelines and suspend collection activity."
      },
      {
        "title": "File an Administrative Grievance",
        "description": "Escalate to the CMS No Surprises Help Desk and your state department of insurance if Quest continues to bill you the out-of-network balance."
      }
    ],
    "legalGrounds": [
      "No Surprises Act 42 U.S.C. § 300gg-111 prohibits balance billing for lab services originating at in-network facilities",
      "Lack of advance statutory Good Faith Estimate under 45 C.F.R. § 149.610",
      "Breach of participating provider network referral obligations"
    ],
    "sampleSnippet": "I formally dispute the unapproved out-of-network laboratory charges billed under Account #[Number]. My specimen was collected at an in-network facility without prior written consent for out-of-network testing. Under 42 U.S.C. § 300gg-111, my liability is limited strictly to in-network cost-sharing. Cease all collection activity and rebill accordingly.",
    "faqs": [
      {
        "question": "Can Quest Diagnostics send me to collections if my bill is in dispute?",
        "answer": "No. Under the Fair Credit Billing Act (15 U.S.C. § 1666) and CFPB regulations, creditors cannot report or send an account to collections while a timely written dispute is actively pending."
      },
      {
        "question": "What if my doctor sent my bloodwork to Quest without telling me?",
        "answer": "You cannot be held responsible for surprise out-of-network balance bills when the ordering provider failed to provide an advance disclosure and consent waiver required by federal law."
      }
    ]
  },
  {
    "slug": "labcorp-out-of-network-test-dispute",
    "title": "Fight Unapproved Labcorp Out-of-Network Tests",
    "metaDescription": "Step-by-step legal dispute guide for surprise Labcorp charges, unauthorized routine lab panels, and billing code errors.",
    "badge": "Federal Law",
    "statute": "No Surprises Act & 45 C.F.R. § 149.420",
    "statutoryDeadline": "Within 90 days of receiving the invoice",
    "estimatedSavings": "$150 – $2,800",
    "summary": "Labcorp bills thousands of patients annually for non-covered specialized panels that ordering physicians check as routine reflex tests. Learn how to invoke federal balance billing prohibitions and force code re-audits.",
    "steps": [
      {
        "title": "Identify Misclassified Reflex Testing",
        "description": "Check if Labcorp automatically triggered secondary specialized tests that were not explicitly ordered as medically necessary by your doctor."
      },
      {
        "title": "Submit a Formal Dispute Letter",
        "description": "Notify Labcorp in writing citing lack of informed consent and demand itemized CPT coding verification."
      },
      {
        "title": "Request Provider Appeal Assistance",
        "description": "Ask your physician's billing staff to submit a retroactive Letter of Medical Necessity to reverse insurance denials."
      }
    ],
    "legalGrounds": [
      "Federal prohibition against surprise laboratory billing at in-network provider visits",
      "Unauthorized unbundling of routine blood chemistry panels under AMA CPT guidelines"
    ],
    "sampleSnippet": "This letter serves as formal dispute of Labcorp Invoice #[Number]. The billed testing was performed without prior written authorization or disclosure of out-of-network rates. Pursuant to federal consumer billing standards, I demand a full audit and adjustment to in-network allowable rates.",
    "faqs": [
      {
        "question": "Why did Labcorp charge me if my doctor is in-network?",
        "answer": "Independent laboratories often operate outside your specific insurance tier even if your primary doctor's office is in-network. Federal law now restricts providers from balance-billing you for these surprise referrals."
      }
    ]
  },
  {
    "slug": "emergency-room-facility-fee-dispute",
    "title": "Dispute Inflated ER Hospital Facility Fees",
    "metaDescription": "How to challenge hospital Level 4 and Level 5 emergency room facility fees and reduce hospital bills by thousands.",
    "badge": "Federal Law",
    "statute": "Emergency Medical Treatment and Active Labor Act (EMTALA) & State Pricing Statutes",
    "statutoryDeadline": "Within 60 days of bill receipt",
    "estimatedSavings": "$1,200 – $6,000 per visit",
    "summary": "Hospitals routinely add arbitrary 'facility fees' (often $1,500 to $4,000+) to ER bills simply for walking through the door, even for minor triage visits. Under hospital transparency rules and billing guidelines, patients have the right to challenge inflated facility fee level codes.",
    "steps": [
      {
        "title": "Demand an Itemized UB-04 Form",
        "description": "Request the official hospital claim form showing Revenue Codes (typically Revenue Code 0450) and HCPCS/CPT Level codes (99281 through 99285)."
      },
      {
        "title": "Audit the Severity Level Coding",
        "description": "Hospitals often improperly upcode routine visits to Level 4 (99284) or Level 5 (99285) without meeting the clinical documentation requirements for high-complexity medical decision-making."
      },
      {
        "title": "Send a Facility Fee Dispute & Fee-Waiver Demand",
        "description": "Demand a downward code adjustment to Level 1 or 2, or request complete fee waiver under hospital charity care policies."
      }
    ],
    "legalGrounds": [
      "Improper upcoding of facility fees violates False Claims and state deceptive billing practices acts",
      "Federal Hospital Price Transparency Rule mandates public disclosure of standard charges"
    ],
    "sampleSnippet": "I am writing to contest the Emergency Department Facility Fee of $[Amount] coded under CPT 99285 on Account #[Number]. The clinical intervention provided did not involve high-complexity medical decision making. I demand an itemized coding audit and downward fee adjustment.",
    "faqs": [
      {
        "question": "What is an ER facility fee?",
        "answer": "A facility fee is an overhead charge billed by the hospital building itself, separate from the doctor's professional fee, to cover equipment, nursing staff, and operating costs."
      },
      {
        "question": "Can facility fees be negotiated or removed?",
        "answer": "Yes. Hospitals frequently reduce or eliminate facility fees when patients formally challenge the complexity level code or request charity care review."
      }
    ]
  },
  {
    "slug": "midland-credit-management-validation-letter",
    "title": "Demand Validation from Midland Credit Management",
    "metaDescription": "Stop collection calls and freeze accounts from Midland Credit Management using an official FDCPA debt validation demand.",
    "badge": "Federal Law",
    "statute": "Fair Debt Collection Practices Act (15 U.S.C. § 1692g) & CFPB Consent Order",
    "statutoryDeadline": "Within 30 days of initial notice",
    "estimatedSavings": "Full debt dismissal / removal from credit",
    "summary": "Midland Credit Management (MCM/Encore Capital) is the largest debt buyer in the nation. Under federal law and CFPB consent orders, Midland cannot collect on purchased debt without chain-of-title proof, original signed contracts, and verified itemized accounting.",
    "steps": [
      {
        "title": "Do Not Acknowledge Debt on the Phone",
        "description": "Never agree to a phone payment or verbally confirm owing the debt, which can reset expired state statutes of limitations."
      },
      {
        "title": "Send FDCPA § 809 Debt Validation Demand",
        "description": "Send a formal written letter demanding proof of ownership, original creditor account agreement, and chain-of-assignment records."
      },
      {
        "title": "Enforce the 30-Day Mandatory Collection Freeze",
        "description": "By federal law, Midland must cease all telephone calls and collection efforts until they mail complete written verification."
      }
    ],
    "legalGrounds": [
      "15 U.S.C. § 1692g requires complete verification before continuing collection activity",
      "CFPB Consent Decree strictly bars Midland from collecting debts without verified account documentation",
      "15 U.S.C. § 1692e prohibits false representations regarding debt amounts or legal status"
    ],
    "sampleSnippet": "Pursuant to the Fair Debt Collection Practices Act, 15 U.S.C. § 1692g, I dispute the validity of the debt referenced under MCM Reference #[Number]. I demand verification of the original signed contract, complete chain of title assignment, and itemized calculation of interest and fees. Cease all telephone contact.",
    "faqs": [
      {
        "question": "What happens if Midland cannot validate the debt within 30 days?",
        "answer": "They must cease collection activity and remove any negative reporting marks submitted to TransUnion, Experian, or Equifax."
      }
    ]
  },
  {
    "slug": "portfolio-recovery-associates-dispute",
    "title": "Stop Portfolio Recovery Associates Debt Harassment",
    "metaDescription": "How to stop calls, demand validation, and dispute unverified debts from Portfolio Recovery Associates (PRA Group).",
    "badge": "Federal Law",
    "statute": "FDCPA (15 U.S.C. § 1692) & CFPB Enforcement Orders",
    "statutoryDeadline": "30-day statutory window",
    "estimatedSavings": "Up to 100% debt reduction",
    "summary": "Portfolio Recovery Associates buys delinquent consumer accounts for pennies on the dollar. Force them to provide documentation or dismiss the account under federal debt validation laws.",
    "steps": [
      {
        "title": "Send Formal Cease Communication Notice",
        "description": "Demand in writing under FDCPA § 805(c) that PRA cease calling your personal or workplace phone numbers."
      },
      {
        "title": "Demand Chain-of-Title & Balance Itemization",
        "description": "Require proof of the bill of sale transferring the specific account from the original creditor to PRA."
      }
    ],
    "legalGrounds": [
      "FDCPA § 805(c) right to cease debt collector communications",
      "FDCPA § 809 debt validation requirements",
      "CFPB statutory bar on collecting unsubstantiated debt portfolios"
    ],
    "sampleSnippet": "I dispute this alleged debt under 15 U.S.C. § 1692g. Demanding full chain of custody documentation proving PRA's legal right to collect on Account #[Number]. All telephone calls are strictly refused; all future communications must be in writing.",
    "faqs": [
      {
        "question": "Can PRA sue me for old credit card debt?",
        "answer": "Only if the debt is within your state's statute of limitations (typically 3 to 6 years). Threatening to sue on time-barred debt violates federal law."
      }
    ]
  },
  {
    "slug": "lvnv-funding-zombie-debt-dispute",
    "title": "Fight LVNV Funding Time-Barred Zombie Debt",
    "metaDescription": "Dispute old zombie debt and collection lawsuits from LVNV Funding and Resurgent Capital Services using federal statutes of limitations.",
    "badge": "Federal Law",
    "statute": "FDCPA (15 U.S.C. § 1692e) & State Statutes of Limitations",
    "statutoryDeadline": "Immediately upon notice",
    "estimatedSavings": "Complete debt dismissal",
    "summary": "LVNV Funding and Resurgent Capital frequently pursue 'zombie debt' where the legal statute of limitations for filing a lawsuit has already expired. Assert your affirmative legal defense in writing.",
    "steps": [
      {
        "title": "Check Date of First Delinquency (DOFD)",
        "description": "Review your credit report to locate the exact date when the original account first went delinquent."
      },
      {
        "title": "Send Time-Barred Debt Estoppel Demand",
        "description": "Notify LVNV Funding that the statute of limitations has run out and that any threat of legal action violates federal law."
      }
    ],
    "legalGrounds": [
      "CFPB Regulation F prohibits debt collectors from suing or threatening to sue on time-barred debt",
      "15 U.S.C. § 1692e(2) false representation of debt legal enforceability"
    ],
    "sampleSnippet": "The alleged debt on Account #[Number] is time-barred under the applicable state statute of limitations. Under 15 U.S.C. § 1692e and CFPB Regulation F, collecting or threatening litigation on time-barred accounts is unlawful. Close this file and cease collection immediately.",
    "faqs": [
      {
        "question": "What is zombie debt?",
        "answer": "Zombie debt is debt that has passed the state statute of limitations for legal collection, but debt buyers attempt to revive it through aggressive letters and calls."
      }
    ]
  },
  {
    "slug": "radiology-reading-fee-double-billing",
    "title": "Dispute Surprise Out-of-Network Radiology Fees",
    "metaDescription": "How to challenge unexpected separate bills from radiologists, pathologists, and imaging centers after in-network hospital visits.",
    "badge": "Federal Law",
    "statute": "No Surprises Act (42 U.S.C. § 300gg-111(b))",
    "statutoryDeadline": "120 days from billing",
    "estimatedSavings": "$300 – $2,500",
    "summary": "Patients having an X-ray, MRI, or CT scan at an in-network facility frequently receive a surprise bill months later from an independent radiology group that read the scan. Under the No Surprises Act, radiologists at in-network facilities are strictly barred from balance billing patients.",
    "steps": [
      {
        "title": "Confirm the Imaging Facility Was In-Network",
        "description": "Verify that the hospital or clinic where your scan occurred participates with your insurance plan."
      },
      {
        "title": "Issue a No Surprises Ancillary Service Demand",
        "description": "Inform the radiology practice that ancillary services rendered at in-network facilities are covered under 42 U.S.C. § 300gg-111."
      }
    ],
    "legalGrounds": [
      "No Surprises Act explicitly defines radiology and pathology as non-waivable ancillary services barred from balance billing",
      "Patient responsibility is restricted by law to in-network deductible and copay rates"
    ],
    "sampleSnippet": "Under 42 U.S.C. § 300gg-111(b), radiology services performed at an in-network facility are non-waivable ancillary services. I cannot be balance-billed for out-of-network professional interpretation fees. Adjust this balance to in-network rates immediately.",
    "faqs": [
      {
        "question": "Can an out-of-network radiologist ask me to sign a waiver?",
        "answer": "No. Federal regulations explicitly prohibit out-of-network radiologists and anesthesiologists from asking patients to sign balance billing waivers."
      }
    ]
  },
  {
    "slug": "charity-care-financial-assistance-retroactive",
    "title": "Apply for Retroactive Hospital Charity Care & Forgiveness",
    "metaDescription": "Complete guide to wiping out hospital bills through mandatory nonprofit hospital financial assistance and charity care policies.",
    "badge": "Federal Law",
    "statute": "IRS Section 501(r)(4) & Affordable Care Act",
    "statutoryDeadline": "Up to 240 days from first post-discharge billing statement",
    "estimatedSavings": "Up to 100% total bill forgiveness",
    "summary": "By federal law, all nonprofit 501(c)(3) hospitals must provide Financial Assistance Policies (Charity Care) providing 50% to 100% bill forgiveness for families earning under 300% to 400% of the Federal Poverty Level, even retroactively after bills are sent to collections.",
    "steps": [
      {
        "title": "Verify Nonprofit Hospital Status",
        "description": "Check if the hospital is classified as a 501(c)(3) nonprofit institution (over 60% of all US hospitals are nonprofits)."
      },
      {
        "title": "Submit a Retroactive Financial Assistance Application",
        "description": "Request the hospital's Plain Language Summary of Financial Assistance and submit proof of income within the 240-day federal window."
      },
      {
        "title": "Enforce Mandatory Collection Recall",
        "description": "Under IRS rules, the hospital must pause or recall all collection actions while your financial assistance application is evaluated."
      }
    ],
    "legalGrounds": [
      "26 U.S.C. § 501(r) prohibits extraordinary collection actions prior to making reasonable efforts to determine charity care eligibility",
      "IRS Treasury Regulation § 1.501(r)-6 mandates 240-day application period"
    ],
    "sampleSnippet": "I am formally requesting a Financial Assistance Application under IRS Section 501(r) for Account #[Number]. Pursuant to federal regulations, you must suspend all extraordinary collection actions and credit reporting while my eligibility is reviewed.",
    "faqs": [
      {
        "question": "Can I apply for hospital charity care if my bill was already sent to collections?",
        "answer": "Yes. Federal law grants patients a 240-day window from the first billing statement to apply, which legally forces the hospital to recall the account from third-party debt collection."
      }
    ]
  },
  {
    "slug": "security-deposit-carpet-wear-and-tear",
    "title": "Dispute Unfair Carpet Replacement Deductions",
    "metaDescription": "How to dispute landlord security deposit deductions for carpet replacement, routine wear and tear, and depreciated flooring.",
    "badge": "State & Common Law",
    "statute": "Uniform Residential Landlord and Tenant Act (URLTA) & State Tenancy Statutes",
    "statutoryDeadline": "14 to 30 days depending on state",
    "estimatedSavings": "$500 – $2,500",
    "summary": "Landlords frequently bill departing tenants thousands to replace carpet that was already years old. Under common law and state tenant rights, landlords can only deduct for actual damage exceeding normal wear and tear, and must account for IRS carpet depreciation schedules (typically 5 to 7-year useful life).",
    "steps": [
      {
        "title": "Demand Age and Purchase Invoices",
        "description": "Require the landlord to produce the original purchase receipt and installation date of the carpet."
      },
      {
        "title": "Apply Straight-Line Depreciation",
        "description": "If carpet has a 7-year lifespan and was 5 years old at move-out, the landlord cannot legally charge you full replacement cost."
      },
      {
        "title": "Send Formal Demand for Full Deposit Return",
        "description": "Notify the landlord that deducting for ordinary wear and tear violates state law and exposes them to double or triple statutory damages."
      }
    ],
    "legalGrounds": [
      "Common law doctrine bars deduction for ordinary wear and tear resulting from normal residential occupancy",
      "Landlord duty to mitigate damages using IRS asset depreciation standards",
      "Statutory penalties for bad-faith deposit retention"
    ],
    "sampleSnippet": "I dispute the $[Amount] deduction for carpet replacement from my security deposit for [Rental Address]. Carpet discoloration constitutes ordinary wear and tear under state tenancy law. Furthermore, you have failed to account for useful life depreciation. I demand the immediate refund of $[Amount] within 10 days.",
    "faqs": [
      {
        "question": "Can a landlord charge me for a brand new carpet if I stained one room?",
        "answer": "No. Landlords cannot upgrade flooring at your expense. They can only charge for localized repair, or the depreciated value of the damaged portion."
      }
    ]
  },
  {
    "slug": "expired-statute-of-limitations-debt",
    "title": "Dispute Expired Time-Barred Debt",
    "metaDescription": "How to permanently dismiss old debt after the legal statute of limitations has expired using federal FDCPA defense letters.",
    "badge": "Federal Law",
    "statute": "FDCPA (15 U.S.C. § 1692e) & CFPB Regulation F (12 C.F.R. § 1006.26)",
    "statutoryDeadline": "Assert immediately upon contact",
    "estimatedSavings": "Complete debt cancellation",
    "summary": "Every state sets a legal deadline (typically 3 to 6 years) after which creditors and debt collectors lose the legal right to sue you in court. Under CFPB rules, debt collectors are strictly prohibited from suing or threatening to sue on time-barred debt.",
    "steps": [
      {
        "title": "Calculate the State Statute of Limitations",
        "description": "Determine the legal time limit based on your state of residence and the contract type (written contract, open account, promissory note)."
      },
      {
        "title": "Avoid Making Any Payments",
        "description": "Never make even a $1 token payment, which in many states legally resets the clock on expired debt."
      },
      {
        "title": "Send Time-Barred Affirmative Defense Notice",
        "description": "Issue a formal written demand informing the collector that the debt is time-barred and requiring them to close their collection file."
      }
    ],
    "legalGrounds": [
      "12 C.F.R. § 1006.26 explicitly makes it illegal for collectors to sue or threaten litigation on expired debt",
      "15 U.S.C. § 1692e prohibits deceptive threats of legal action on unenforceable claims"
    ],
    "sampleSnippet": "The debt referenced under Account #[Number] is past the applicable state statute of limitations. Under CFPB Regulation F, 12 C.F.R. § 1006.26, you cannot file or threaten litigation. I will make no payment on this expired claim. Close this account immediately and cease all communications.",
    "faqs": [
      {
        "question": "Can an expired debt still stay on my credit report?",
        "answer": "Under the FCRA (15 U.S.C. § 1681c), debts must be completely deleted from credit reports 7 years plus 180 days from the date of first delinquency, regardless of the lawsuit statute of limitations."
      }
    ]
  }
];

export function getDisputeGuide(slug: string): DisputeGuide | undefined {
  return DISPUTE_GUIDES.find((g) => g.slug === slug);
}

export function getAllDisputeSlugs(): string[] {
  return DISPUTE_GUIDES.map((g) => g.slug);
}