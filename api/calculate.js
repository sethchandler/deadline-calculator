// API endpoint for legal deadline calculation
// POST /api/calculate

const federalHolidays = {
    2025: [
        '2025-01-01', '2025-01-20', '2025-02-17', '2025-05-26',
        '2025-06-19', '2025-07-04', '2025-09-01', '2025-10-13',
        '2025-11-11', '2025-11-27', '2025-12-25'
    ],
    2026: [
        '2026-01-01', '2026-01-19', '2026-02-16', '2026-05-25',
        '2026-06-19', '2026-07-03', '2026-09-07', '2026-10-12',
        '2026-11-11', '2026-11-26', '2026-12-25'
    ]
};

function calculateDeadline(startDate, days, direction, useBusinessDays, excludeHolidays) {
    const result = {
        startDate: new Date(startDate),
        targetDays: days,
        direction: direction,
        useBusinessDays: useBusinessDays,
        excludeHolidays: excludeHolidays,
        endDate: new Date(startDate),
        calculationSteps: [],
        excludedDates: [],
        totalCalendarDays: 0,
        businessDaysCount: 0
    };

    let daysRemaining = Math.abs(days);
    let currentDate = new Date(startDate);
    const dayIncrement = direction === 'backward' ? -1 : 1;

    while (daysRemaining > 0) {
        currentDate.setDate(currentDate.getDate() + dayIncrement);

        let shouldCountDay = true;
        let exclusionReason = null;

        // Check if it's a weekend
        if (useBusinessDays) {
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                shouldCountDay = false;
                exclusionReason = 'Weekend';
            }
        }

        // Check if it's a holiday
        if (excludeHolidays && shouldCountDay) {
            const dateString = currentDate.toISOString().split('T')[0];
            const year = currentDate.getFullYear();
            if (federalHolidays[year] && federalHolidays[year].includes(dateString)) {
                shouldCountDay = false;
                exclusionReason = 'Federal Holiday';
            }
        }

        if (shouldCountDay) {
            daysRemaining--;
            result.businessDaysCount++;
            result.calculationSteps.push({
                date: currentDate.toISOString().split('T')[0],
                action: 'Counted',
                daysRemaining: daysRemaining
            });
        } else {
            result.excludedDates.push({
                date: currentDate.toISOString().split('T')[0],
                reason: exclusionReason
            });
            result.calculationSteps.push({
                date: currentDate.toISOString().split('T')[0],
                action: 'Excluded',
                reason: exclusionReason,
                daysRemaining: daysRemaining
            });
        }

        result.totalCalendarDays++;
    }

    result.endDate = new Date(currentDate);

    // Apply rollover rule
    if (useBusinessDays || excludeHolidays) {
        const rolloverResult = applyRolloverRule(result.endDate, useBusinessDays, excludeHolidays);
        result.endDate = rolloverResult.date;
        result.isRollover = rolloverResult.isRollover;
        if (rolloverResult.isRollover) {
            result.originalEndDate = rolloverResult.originalDate;
        }
    }

    return {
        ...result,
        startDate: result.startDate.toISOString().split('T')[0],
        endDate: result.endDate.toISOString().split('T')[0],
        originalEndDate: result.originalEndDate ? result.originalEndDate.toISOString().split('T')[0] : undefined
    };
}

function applyRolloverRule(date, useBusinessDays, excludeHolidays) {
    let rolloverDate = new Date(date);
    let isRollover = false;
    const originalDate = new Date(date);

    while (true) {
        let shouldRollOver = false;
        const dayOfWeek = rolloverDate.getDay();
        const dateString = rolloverDate.toISOString().split('T')[0];
        const year = rolloverDate.getFullYear();

        if (useBusinessDays && (dayOfWeek === 0 || dayOfWeek === 6)) {
            shouldRollOver = true;
        }

        if (excludeHolidays && federalHolidays[year] && federalHolidays[year].includes(dateString)) {
            shouldRollOver = true;
        }

        if (!shouldRollOver) break;

        isRollover = true;
        rolloverDate.setDate(rolloverDate.getDate() + 1);
    }

    return {
        date: rolloverDate,
        isRollover: isRollover,
        originalDate: originalDate
    };
}

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed',
            message: 'Please use POST request'
        });
    }

    try {
        const {
            startDate,
            days,
            direction = 'forward',
            useBusinessDays = false,
            excludeHolidays = false
        } = req.body;

        // Validation
        if (!startDate) {
            return res.status(400).json({
                error: 'Missing required field: startDate',
                message: 'Please provide a startDate in YYYY-MM-DD format'
            });
        }

        if (!days && days !== 0) {
            return res.status(400).json({
                error: 'Missing required field: days',
                message: 'Please provide the number of days'
            });
        }

        const parsedDate = new Date(startDate);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                error: 'Invalid date format',
                message: 'startDate must be in YYYY-MM-DD format'
            });
        }

        const parsedDays = parseInt(days);
        if (isNaN(parsedDays) || parsedDays < 0) {
            return res.status(400).json({
                error: 'Invalid days value',
                message: 'days must be a positive number'
            });
        }

        if (direction !== 'forward' && direction !== 'backward') {
            return res.status(400).json({
                error: 'Invalid direction',
                message: 'direction must be "forward" or "backward"'
            });
        }

        // Calculate deadline
        const result = calculateDeadline(
            startDate,
            parsedDays,
            direction,
            useBusinessDays,
            excludeHolidays
        );

        // Calculate days from now
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDateObj = new Date(result.endDate);
        endDateObj.setHours(0, 0, 0, 0);
        const daysFromNow = Math.ceil((endDateObj - today) / (1000 * 60 * 60 * 24));

        return res.status(200).json({
            success: true,
            result: {
                ...result,
                daysFromNow: daysFromNow
            }
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
