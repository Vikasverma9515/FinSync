// Tax calculation utilities for Indian Income Tax

// FY 2023-24 Tax Slabs (New Regime)
export const TAX_SLABS_NEW = [
    { min: 0, max: 300000, rate: 0 },
    { min: 300000, max: 600000, rate: 5 },
    { min: 600000, max: 900000, rate: 10 },
    { min: 900000, max: 1200000, rate: 15 },
    { min: 1200000, max: 1500000, rate: 20 },
    { min: 1500000, max: Infinity, rate: 30 },
]

// FY 2023-24 Tax Slabs (Old Regime)
export const TAX_SLABS_OLD = [
    { min: 0, max: 250000, rate: 0 },
    { min: 250000, max: 500000, rate: 5 },
    { min: 500000, max: 1000000, rate: 20 },
    { min: 1000000, max: Infinity, rate: 30 },
]

// Deduction Limits
export const DEDUCTION_LIMITS = {
    '80C': 150000, // PPF, ELSS, LIC, etc.
    '80D': 25000, // Health insurance (self)
    '80D_SENIOR': 50000, // Health insurance (senior citizen)
    '80D_PARENTS': 25000, // Health insurance (parents)
    '80D_PARENTS_SENIOR': 50000, // Health insurance (senior parents)
    '80CCD1B': 50000, // NPS additional
    '80TTA': 10000, // Savings account interest
    '80TTB': 50000, // Savings account interest (senior citizen)
    STANDARD_DEDUCTION: 50000, // Standard deduction for salaried
    HOME_LOAN_INTEREST: 200000, // Home loan interest (self-occupied)
}

// Calculate tax using new regime
export function calculateTaxNewRegime(income: number): number {
    let tax = 0
    let remainingIncome = income

    for (const slab of TAX_SLABS_NEW) {
        if (remainingIncome <= 0) break

        const taxableInThisSlab = Math.min(
            remainingIncome,
            slab.max === Infinity ? remainingIncome : slab.max - slab.min
        )

        tax += (taxableInThisSlab * slab.rate) / 100
        remainingIncome -= taxableInThisSlab
    }

    // Add 4% cess
    return tax * 1.04
}

// Calculate tax using old regime with deductions
export function calculateTaxOldRegime(
    income: number,
    deductions: {
        section80C?: number
        section80D?: number
        homeLoanInterest?: number
        standardDeduction?: number
    }
): number {
    // Apply deductions
    let taxableIncome = income

    // Standard deduction
    taxableIncome -= deductions.standardDeduction || DEDUCTION_LIMITS.STANDARD_DEDUCTION

    // 80C deduction
    taxableIncome -= Math.min(deductions.section80C || 0, DEDUCTION_LIMITS['80C'])

    // 80D deduction
    taxableIncome -= Math.min(deductions.section80D || 0, DEDUCTION_LIMITS['80D'])

    // Home loan interest
    taxableIncome -= Math.min(deductions.homeLoanInterest || 0, DEDUCTION_LIMITS.HOME_LOAN_INTEREST)

    // Ensure taxable income is not negative
    taxableIncome = Math.max(0, taxableIncome)

    let tax = 0
    let remainingIncome = taxableIncome

    for (const slab of TAX_SLABS_OLD) {
        if (remainingIncome <= 0) break

        const taxableInThisSlab = Math.min(
            remainingIncome,
            slab.max === Infinity ? remainingIncome : slab.max - slab.min
        )

        tax += (taxableInThisSlab * slab.rate) / 100
        remainingIncome -= taxableInThisSlab
    }

    // Add 4% cess
    return tax * 1.04
}

// Calculate HRA exemption
export function calculateHRAExemption(
    salary: number,
    hra: number,
    rentPaid: number,
    isMetro: boolean
): number {
    const basicSalary = salary * 0.5 // Assuming basic is 50% of salary

    const exemption1 = hra
    const exemption2 = isMetro ? basicSalary * 0.5 : basicSalary * 0.4
    const exemption3 = rentPaid - basicSalary * 0.1

    return Math.max(0, Math.min(exemption1, exemption2, exemption3))
}

// Get tax breakdown by slabs
export function getTaxBreakdown(income: number, regime: 'old' | 'new' = 'old'): {
    slab: string
    rate: number
    amount: number
}[] {
    const slabs = regime === 'new' ? TAX_SLABS_NEW : TAX_SLABS_OLD
    const breakdown: { slab: string; rate: number; amount: number }[] = []
    let remainingIncome = income

    for (const slab of slabs) {
        if (remainingIncome <= 0) break

        const taxableInThisSlab = Math.min(
            remainingIncome,
            slab.max === Infinity ? remainingIncome : slab.max - slab.min
        )

        if (taxableInThisSlab > 0) {
            breakdown.push({
                slab: `₹${(slab.min / 100000).toFixed(1)}L - ${slab.max === Infinity ? '∞' : '₹' + (slab.max / 100000).toFixed(1) + 'L'}`,
                rate: slab.rate,
                amount: (taxableInThisSlab * slab.rate) / 100,
            })
        }

        remainingIncome -= taxableInThisSlab
    }

    return breakdown
}

// Calculate optimal tax regime
export function getOptimalRegime(
    income: number,
    deductions: {
        section80C?: number
        section80D?: number
        homeLoanInterest?: number
    }
): 'old' | 'new' {
    const taxNew = calculateTaxNewRegime(income)
    const taxOld = calculateTaxOldRegime(income, {
        ...deductions,
        standardDeduction: DEDUCTION_LIMITS.STANDARD_DEDUCTION,
    })

    return taxOld < taxNew ? 'old' : 'new'
}

// Format currency in Indian format
export function formatIndianCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount)
}
