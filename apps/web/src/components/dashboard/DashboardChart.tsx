'use client'

import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrencyCompact, formatCurrency } from '@/lib/utils'

interface DashboardChartProps {
  data: any[]
  currency: string
}

export function DashboardChart({ data, currency }: DashboardChartProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="h-48 w-full bg-foreground/[0.02] rounded-xl animate-pulse" />
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14F195" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#14F195" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrencyCompact(v, currency)} width={50} />
          <Tooltip
            contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
            formatter={(value: number, name: string) => [formatCurrency(value, currency), name === 'income' ? 'Income' : 'Expenses']}
          />
          <Area type="monotone" dataKey="income" stroke="#14F195" strokeWidth={2} fill="url(#incomeGrad)" />
          <Area type="monotone" dataKey="expenses" stroke="#3B82F6" strokeWidth={2} fill="url(#expGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}