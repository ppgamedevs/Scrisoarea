export const MONTHLY_AMOUNTS = [10, 25, 50] as const

export type MonthlyAmount = (typeof MONTHLY_AMOUNTS)[number]

export function isMonthlyAmount(value: number): value is MonthlyAmount {
    return (MONTHLY_AMOUNTS as readonly number[]).includes(value)
}
