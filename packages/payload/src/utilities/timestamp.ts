export const timestamp = (label: string) => {
  if (!process.env.CMS_TIME) {
    process.env.CMS_TIME = String(new Date().getTime())
  }
  const now = new Date()
  console.log(`[${now.getTime() - Number(process.env.CMS_TIME)}ms] ${label}`)
}
