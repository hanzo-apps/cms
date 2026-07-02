'use client'
import { useCurrency } from '@hanzo/cms-plugin-ecommerce/react'
import React from 'react'
import { CurrenciesConfig } from '@hanzo/cms-plugin-ecommerce/types'

type Props = {
  currenciesConfig: CurrenciesConfig
}

export const CurrencySelector: React.FC<Props> = ({ currenciesConfig }) => {
  const { currency, setCurrency } = useCurrency()

  return (
    <div>
      selected: {currency.label} ({currency.code})<br />
      <select
        value={currency.code}
        onChange={(e) => {
          const selectedCurrency = currenciesConfig.supportedCurrencies.find(
            (c) => c.code === e.target.value,
          )
          if (selectedCurrency) {
            setCurrency(selectedCurrency.code)
          }
        }}
      >
        {currenciesConfig.supportedCurrencies.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label} ({c.code})
          </option>
        ))}
      </select>
    </div>
  )
}
