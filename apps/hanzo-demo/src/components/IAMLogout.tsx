import { redirect } from 'next/navigation.js'

/**
 * The admin's sign-out screen, which does nothing itself and sends the browser to
 * the route that ends both halves of the session — the local cookies and the IAM
 * session behind them. Sign-out lives in one place; this is the admin's door onto
 * it, not a second implementation of it.
 */
export function IAMLogout() {
  redirect('/auth/signout')
}
