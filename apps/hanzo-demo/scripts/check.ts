/** The assertion vocabulary the acceptance proofs are written in. */

export const step = (m: string) => {
  console.log(`\n=== ${m} ===`)
}

export const ok = (m: string) => {
  console.log(`  ✓ ${m}`)
}

export const fail = (m: string) => {
  console.error(`  ✗ ${m}`)
  process.exitCode = 1
}

/** Record one assertion: `passed` prints the claim, otherwise `detail` prints why. */
export const check = (passed: boolean, claim: string, detail: string) => {
  if (passed) {
    ok(claim)
  } else {
    fail(detail)
  }
}
