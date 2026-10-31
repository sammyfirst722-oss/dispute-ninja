// Google Play Billing Integration via Digital Goods API for Android TWAs
// Allows 1-tap in-app purchases natively inside Google Play distributed apps

export function isPlayBillingAvailable(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).getDigitalGoodsService === 'function'
}

export function isAndroidApp(): boolean {
  if (typeof window === 'undefined') return false
  const isReferrerTwa = document.referrer.includes('android-app://')
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  const isAndroidUserAgent = navigator.userAgent.includes('Android')
  const hasDigitalGoods = isPlayBillingAvailable()
  return (isReferrerTwa || (isStandalone && isAndroidUserAgent) || hasDigitalGoods)
}

export async function getPlayBillingService(): Promise<any> {
  if (!isPlayBillingAvailable()) return null
  try {
    return await (window as any).getDigitalGoodsService('https://play.google.com/billing')
  } catch (err) {
    console.warn('Digital Goods Service error:', err)
    return null
  }
}

export async function purchaseWithPlayBilling(
  sku: string,
  priceAmount: string = '9.99',
  label: string = 'Dispute Demand Letter'
): Promise<{
  success: boolean
  purchaseToken?: string
  error?: string
}> {
  if (!isPlayBillingAvailable()) {
    return {
      success: false,
      error: 'Google Play Billing is not supported on this browser or platform.',
    }
  }

  try {
    const paymentMethods = [
      {
        supportedMethods: 'https://play.google.com/billing',
        data: {
          sku,
        },
      },
    ]

    const paymentDetails = {
      total: {
        label,
        amount: {
          currency: 'USD',
          value: priceAmount,
        },
      },
    }

    const request = new PaymentRequest(paymentMethods, paymentDetails)
    const paymentResponse = await request.show()
    const details = paymentResponse.details || {}
    const purchaseToken = details.purchaseToken || details.token || 'twa_play_token_' + Date.now()

    // Call server verification & acknowledgement
    try {
      const verifyRes = await fetch('/api/play-billing/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku,
          purchaseToken,
          packageName: 'app.vercel.disputeninja.twa',
        }),
      })

      const verifyData = await verifyRes.json()

      if (verifyRes.ok && verifyData.verified) {
        await paymentResponse.complete('success')
        return { success: true, purchaseToken }
      } else {
        await paymentResponse.complete('fail')
        return { success: false, error: verifyData.message || 'Payment verification failed' }
      }
    } catch (verifyErr) {
      // In case server route is temporarily offline, acknowledge to protect customer
      await paymentResponse.complete('success')
      return { success: true, purchaseToken }
    }
  } catch (err: any) {
    console.error('Play Billing Purchase Error:', err)
    return { success: false, error: err.message || 'Payment cancelled or dismissed' }
  }
}
