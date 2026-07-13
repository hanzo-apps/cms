import Stripe from 'stripe'

import type { PaymentAdapter } from '../../../types/index.js'
import type { StripeAdapterArgs } from './index.js'

type Props = {
  apiVersion?: Stripe.StripeConfig['apiVersion']
  appInfo?: Stripe.StripeConfig['appInfo']
  secretKey: StripeAdapterArgs['secretKey']
}

export const confirmOrder: (props: Props) => NonNullable<PaymentAdapter>['confirmOrder'] =
  (props) =>
  async ({
    cartsSlug = 'carts',
    data,
    ordersSlug = 'orders',
    req,
    transactionsSlug = 'transactions',
  }) => {
    const cms = req.cms
    const { apiVersion, appInfo, secretKey } = props || {}

    const customerEmail = data.customerEmail

    const paymentIntentID = data.paymentIntentID as string

    if (!secretKey) {
      throw new Error('Stripe secret key is required')
    }

    if (!paymentIntentID) {
      throw new Error('PaymentIntent ID is required')
    }

    const stripe = new Stripe(secretKey, {
      // API version can only be the latest, stripe recommends ts ignoring it
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - ignoring since possible versions are not type safe, only the latest version is recognised
      apiVersion: apiVersion || '2025-03-31.basil',
      appInfo: appInfo || {
        name: 'Stripe CMS Plugin',
        url: 'https://payloadcms.com',
      },
    })

    try {
      let customer = (
        await stripe.customers.list({
          email: customerEmail,
        })
      ).data[0]

      if (!customer?.id) {
        customer = await stripe.customers.create({
          email: customerEmail,
        })
      }

      // Find our existing transaction by the payment intent ID
      const transactionsResults = await cms.find({
        collection: transactionsSlug,
        req,
        where: {
          'stripe.paymentIntentID': {
            equals: paymentIntentID,
          },
        },
      })

      const transaction = transactionsResults.docs[0]

      if (!transactionsResults.totalDocs || !transaction) {
        throw new Error('No transaction found for the provided PaymentIntent ID')
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID)

      if (paymentIntent.status !== 'succeeded') {
        throw new Error(`Payment not completed.`)
      }

      const cartID = paymentIntent.metadata.cartID
      const cartItemsSnapshot = paymentIntent.metadata.cartItemsSnapshot
        ? JSON.parse(paymentIntent.metadata.cartItemsSnapshot)
        : undefined

      const shippingAddress = paymentIntent.metadata.shippingAddress
        ? JSON.parse(paymentIntent.metadata.shippingAddress)
        : undefined

      if (!cartID) {
        throw new Error('Cart ID not found in the PaymentIntent metadata')
      }

      if (!cartItemsSnapshot || !Array.isArray(cartItemsSnapshot)) {
        throw new Error('Cart items snapshot not found or invalid in the PaymentIntent metadata')
      }

      const order = await cms.create({
        collection: ordersSlug,
        data: {
          amount: paymentIntent.amount,
          currency: paymentIntent.currency.toUpperCase(),
          ...(req.user ? { customer: req.user.id } : { customerEmail }),
          items: cartItemsSnapshot,
          shippingAddress,
          status: 'processing',
          transactions: [transaction.id],
        },
        req,
      })

      const timestamp = new Date().toISOString()

      await cms.update({
        id: cartID,
        collection: cartsSlug,
        data: {
          purchasedAt: timestamp,
        },
        req,
      })

      await cms.update({
        id: transaction.id,
        collection: transactionsSlug,
        data: {
          order: order.id,
          status: 'succeeded',
        },
        req,
      })

      return {
        message: 'Payment initiated successfully',
        orderID: order.id,
        transactionID: transaction.id,
        ...(order.accessToken ? { accessToken: order.accessToken } : {}),
      }
    } catch (error) {
      cms.logger.error({ err: error, msg: 'Error confirming order with Stripe' })

      throw new Error(error instanceof Error ? error.message : 'Unknown error initiating payment')
    }
  }
