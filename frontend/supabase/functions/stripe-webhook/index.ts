import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', { apiVersion: '2023-10-16' })

Deno.serve(async (req) => {
  try {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')

    // If webhook secret is set, verify signature
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    let event: Stripe.Event

    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } else {
      event = JSON.parse(body)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const planMap: Record<string, string> = {}

    async function getPlanFromPrice(priceId: string): Promise<string> {
      const price = await stripe.prices.retrieve(priceId)
      const product = await stripe.products.retrieve(price.product as string)
      const name = product.name.toLowerCase()
      if (name.includes('enterprise')) return 'enterprise'
      if (name.includes('pro')) return 'pro'
      return 'basic'
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const institutionId = session.metadata?.institution_id
        if (institutionId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          const plan = await getPlanFromPrice(subscription.items.data[0].price.id)
          await supabase.from('institutions').update({
            subscription_plan: plan,
            subscription_status: 'active',
          }).eq('id', institutionId)
        }
        break
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const { data: institution } = await supabase.from('institutions').select('id').eq('stripe_customer_id', customerId).single()
        if (institution) {
          const plan = await getPlanFromPrice(subscription.items.data[0].price.id)
          await supabase.from('institutions').update({
            subscription_plan: plan,
            subscription_status: subscription.status === 'active' ? 'active' : subscription.status,
          }).eq('id', institution.id)
        }
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const { data: institution } = await supabase.from('institutions').select('id').eq('stripe_customer_id', customerId).single()
        if (institution) {
          await supabase.from('institutions').update({
            subscription_plan: 'basic',
            subscription_status: 'canceled',
          }).eq('id', institution.id)
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})