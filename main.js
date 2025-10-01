// Legal Deadline Calculator - Core JavaScript Functionality
// Professional deadline calculation tool for legal professionals

class LegalDeadlineCalculator {
    constructor() {
        this.federalHolidays = {
            2025: [
                '2025-01-01', // New Year's Day
                '2025-01-20', // Martin Luther King Jr. Day
                '2025-02-17', // Washington's Birthday
                '2025-05-26', // Memorial Day
                '2025-06-19', // Juneteenth National Independence Day
                '2025-07-04', // Independence Day
                '2025-09-01', // Labor Day
                '2025-10-13', // Columbus Day
                '2025-11-11', // Veterans Day
                '2025-11-27', // Thanksgiving Day
                '2025-12-25'  // Christmas Day
            ],
            2026: [
                '2026-01-01', // New Year's Day
                '2026-01-19', // Martin Luther King Jr. Day
                '2026-02-16', // Washington's Birthday
                '2026-05-25', // Memorial Day
                '2026-06-19', // Juneteenth National Independence Day
                '2026-07-03', // Independence Day (observed)
                '2026-09-07', // Labor Day
                '2026-10-12', // Columbus Day
                '2026-11-11', // Veterans Day
                '2026-11-26', // Thanksgiving Day
                '2026-12-25'  // Christmas Day
            ]
        };
        
        this.calculationHistory = JSON.parse(localStorage.getItem('deadlineHistory') || '[]');
        this.savedDeadlines = JSON.parse(localStorage.getItem('savedDeadlines') || '[]');
        
        this.initializeEventListeners();
        this.loadCalculationHistory();
        this.initializeAnimations();
    }

    initializeEventListeners() {
        // Real-time calculation inputs
        const triggerDateInput = document.getElementById('triggerDate');
        const daysInput = document.getElementById('daysInput');
        const directionToggle = document.getElementById('directionToggle');
        const businessDaysToggle = document.getElementById('businessDaysToggle');
        const excludeHolidaysToggle = document.getElementById('excludeHolidaysToggle');

        if (triggerDateInput) {
            triggerDateInput.addEventListener('input', () => this.calculateDeadline());
            triggerDateInput.addEventListener('change', () => this.calculateDeadline());
        }

        if (daysInput) {
            daysInput.addEventListener('input', () => this.calculateDeadline());
            daysInput.addEventListener('change', () => this.calculateDeadline());
        }

        if (directionToggle) {
            directionToggle.addEventListener('click', () => this.calculateDeadline());
        }

        if (businessDaysToggle) {
            businessDaysToggle.addEventListener('click', () => this.calculateDeadline());
        }

        if (excludeHolidaysToggle) {
            excludeHolidaysToggle.addEventListener('click', () => this.calculateDeadline());
        }

        // Preset buttons
        this.initializePresetButtons();
        
        // Save deadline functionality
        const saveDeadlineBtn = document.getElementById('saveDeadlineBtn');
        if (saveDeadlineBtn) {
            saveDeadlineBtn.addEventListener('click', () => this.saveCurrentDeadline());
        }

        // Clear history functionality
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        }

        // Set default date to today and trigger initial calculation
        if (triggerDateInput && daysInput) {
            const today = new Date().toISOString().split('T')[0];
            triggerDateInput.value = today;
            // Ensure days input has a value
            if (!daysInput.value) {
                daysInput.value = 30;
            }
            // Delay initial calculation to ensure DOM is ready
            setTimeout(() => {
                console.log('Running initial calculation...');
                this.calculateDeadline();
            }, 200);
        }
    }

    initializePresetButtons() {
        const presets = [
            { id: 'preset30', days: 30 },
            { id: 'preset60', days: 60 },
            { id: 'preset90', days: 90 },
            { id: 'preset120', days: 120 }
        ];

        presets.forEach(preset => {
            const button = document.getElementById(preset.id);
            if (button) {
                button.addEventListener('click', () => {
                    const daysInput = document.getElementById('daysInput');
                    if (daysInput) {
                        daysInput.value = preset.days;
                        this.calculateDeadline();
                        this.animatePresetSelection(button);
                    }
                });
            }
        });
    }

    calculateDeadline() {
        const triggerDateInput = document.getElementById('triggerDate');
        const daysInput = document.getElementById('daysInput');
        const directionToggle = document.getElementById('directionToggle');
        const businessDaysToggle = document.getElementById('businessDaysToggle');
        const excludeHolidaysToggle = document.getElementById('excludeHolidaysToggle');

        if (!triggerDateInput || !daysInput) return;

        // Parse date in local timezone to avoid timezone issues
        const dateString = triggerDateInput.value;
        const [year, month, day] = dateString.split('-').map(num => parseInt(num));
        const triggerDate = new Date(year, month - 1, day); // month is 0-indexed

        const days = parseInt(daysInput.value) || 0;
        const direction = directionToggle && directionToggle.classList.contains('active') ? 'backward' : 'forward';
        const useBusinessDays = businessDaysToggle && businessDaysToggle.classList.contains('active');
        const excludeHolidays = excludeHolidaysToggle && excludeHolidaysToggle.classList.contains('active');

        if (isNaN(triggerDate.getTime()) || isNaN(days) || days <= 0) {
            this.displayError('Please enter a valid date and number of days');
            return;
        }

        const result = this.calculateDate(triggerDate, days, direction, useBusinessDays, excludeHolidays);
        console.log('Calculation result:', {
            startDate: result.startDate,
            endDate: result.endDate,
            days: days,
            direction: direction,
            useBusinessDays: useBusinessDays,
            excludeHolidays: excludeHolidays
        });
        this.displayResult(result);
        this.addToHistory(result);
    }

    calculateDate(startDate, days, direction, useBusinessDays, excludeHolidays) {
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
        
        // If going backward, move in negative direction
        const dayIncrement = direction === 'backward' ? -1 : 1;

        while (daysRemaining > 0) {
            currentDate.setDate(currentDate.getDate() + dayIncrement);
            
            let shouldCountDay = true;
            let exclusionReason = null;

            // Check if it's a weekend
            if (useBusinessDays) {
                const dayOfWeek = currentDate.getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday = 0, Saturday = 6
                    shouldCountDay = false;
                    exclusionReason = 'Weekend';
                }
            }

            // Check if it's a holiday
            if (excludeHolidays && shouldCountDay) {
                const dateString = currentDate.toISOString().split('T')[0];
                const year = currentDate.getFullYear();
                if (this.federalHolidays[year] && this.federalHolidays[year].includes(dateString)) {
                    shouldCountDay = false;
                    exclusionReason = 'Federal Holiday';
                }
            }

            if (shouldCountDay) {
                daysRemaining--;
                result.businessDaysCount++;
                result.calculationSteps.push({
                    date: new Date(currentDate),
                    action: 'Counted',
                    daysRemaining: daysRemaining
                });
            } else {
                result.excludedDates.push({
                    date: new Date(currentDate),
                    reason: exclusionReason
                });
                result.calculationSteps.push({
                    date: new Date(currentDate),
                    action: 'Excluded',
                    reason: exclusionReason,
                    daysRemaining: daysRemaining
                });
            }
            
            result.totalCalendarDays++;
        }

        result.endDate = new Date(currentDate);
        
        // Apply rollover rule: if deadline falls on weekend/holiday, move to next business day
        if (useBusinessDays || excludeHolidays) {
            result.endDate = this.applyRolloverRule(result.endDate, useBusinessDays, excludeHolidays);
        }

        return result;
    }

    applyRolloverRule(date, useBusinessDays, excludeHolidays) {
        let rolloverDate = new Date(date);
        let isRollover = false;

        while (true) {
            let shouldRollOver = false;
            const dayOfWeek = rolloverDate.getDay();
            const dateString = rolloverDate.toISOString().split('T')[0];
            const year = rolloverDate.getFullYear();

            // Check weekend
            if (useBusinessDays && (dayOfWeek === 0 || dayOfWeek === 6)) {
                shouldRollOver = true;
            }

            // Check holiday
            if (excludeHolidays && this.federalHolidays[year] && this.federalHolidays[year].includes(dateString)) {
                shouldRollOver = true;
            }

            if (!shouldRollOver) break;

            isRollover = true;
            rolloverDate.setDate(rolloverDate.getDate() + 1);
        }

        return {
            date: rolloverDate,
            isRollover: isRollover,
            originalDate: date
        };
    }

    displayResult(result) {
        const resultDisplay = document.getElementById('resultDisplay');
        const calculationDetails = document.getElementById('calculationDetails');
        const urgencyIndicator = document.getElementById('urgencyIndicator');

        if (!resultDisplay) return;

        // Format dates
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        // Handle both Date objects and rollover objects
        const endDate = result.endDate.date || result.endDate;
        const isRollover = result.endDate.isRollover || false;

        const formattedDate = endDate.toLocaleDateString('en-US', options);
        const daysFromNow = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));

        // Display main result
        resultDisplay.innerHTML = `
            <div class="text-center">
                <div class="text-4xl font-bold text-gray-800 mb-2">${formattedDate}</div>
                <div class="text-lg text-gray-600 mb-1">
                    ${daysFromNow === 0 ? 'Today' : 
                      daysFromNow > 0 ? `${daysFromNow} days from now` : 
                      `${Math.abs(daysFromNow)} days ago`}
                </div>
                ${isRollover ?
                    '<div class="text-sm text-amber-600">Rolled over from weekend/holiday</div>' : ''}
            </div>
        `;

        // Display calculation details
        if (calculationDetails) {
            const businessDaysText = result.useBusinessDays ? 
                `${result.businessDaysCount} business days` : 
                `${result.totalCalendarDays} calendar days`;
            
            const holidayText = result.excludeHolidays ? 
                `, excluding federal holidays` : '';

            calculationDetails.innerHTML = `
                <div class="bg-gray-50 p-4 rounded-lg mt-4">
                    <h4 class="font-semibold text-gray-800 mb-2">Calculation Details</h4>
                    <p class="text-sm text-gray-600 mb-2">
                        ${result.direction === 'forward' ? 'Added' : 'Subtracted'} 
                        ${businessDaysText}${holidayText}
                    </p>
                    <p class="text-sm text-gray-600">
                        From: ${result.startDate.toLocaleDateString('en-US', options)}
                    </p>
                    <p class="text-sm text-gray-600">
                        To: ${endDate.toLocaleDateString('en-US', options)}
                    </p>
                    ${result.excludedDates.length > 0 ? `
                        <div class="mt-3">
                            <p class="text-sm font-medium text-gray-700 mb-1">Excluded Dates:</p>
                            <ul class="text-xs text-gray-600 space-y-1">
                                ${result.excludedDates.slice(0, 5).map(excluded => `
                                    <li>${excluded.date.toLocaleDateString('en-US')}: ${excluded.reason}</li>
                                `).join('')}
                                ${result.excludedDates.length > 5 ? 
                                    `<li>... and ${result.excludedDates.length - 5} more</li>` : ''}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        // Update urgency indicator
        if (urgencyIndicator) {
            urgencyIndicator.className = 'h-4 w-4 rounded-full ml-2 ' + this.getUrgencyClass(daysFromNow);
        }

        // Animate result display
        this.animateResultDisplay();
    }

    getUrgencyClass(daysFromNow) {
        if (daysFromNow < 0) return 'bg-red-500';
        if (daysFromNow <= 3) return 'bg-red-500 animate-pulse';
        if (daysFromNow <= 7) return 'bg-orange-500';
        if (daysFromNow <= 30) return 'bg-yellow-500';
        return 'bg-green-500';
    }

    displayError(message) {
        const resultDisplay = document.getElementById('resultDisplay');
        if (resultDisplay) {
            resultDisplay.innerHTML = `
                <div class="text-center text-red-600">
                    <div class="text-lg font-semibold">Error</div>
                    <div class="text-sm">${message}</div>
                </div>
            `;
        }
    }

    addToHistory(result) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date(),
            startDate: result.startDate,
            endDate: result.endDate.date,
            targetDays: result.targetDays,
            direction: result.direction,
            useBusinessDays: result.useBusinessDays,
            excludeHolidays: result.excludeHolidays
        };

        this.calculationHistory.unshift(historyItem);
        
        // Keep only last 10 calculations
        if (this.calculationHistory.length > 10) {
            this.calculationHistory = this.calculationHistory.slice(0, 10);
        }

        localStorage.setItem('deadlineHistory', JSON.stringify(this.calculationHistory));
        this.loadCalculationHistory();
    }

    loadCalculationHistory() {
        const historyContainer = document.getElementById('calculationHistory');
        if (!historyContainer) return;

        if (this.calculationHistory.length === 0) {
            historyContainer.innerHTML = `
                <div class="text-center text-gray-500 py-4">
                    <p class="text-sm">No recent calculations</p>
                </div>
            `;
            return;
        }

        historyContainer.innerHTML = this.calculationHistory.map(item => {
            const options = { month: 'short', day: 'numeric' };
            const startDate = new Date(item.startDate).toLocaleDateString('en-US', options);
            const endDate = new Date(item.endDate).toLocaleDateString('en-US', options);
            const direction = item.direction === 'forward' ? '→' : '←';
            const businessDays = item.useBusinessDays ? ' (Business Days)' : '';
            
            return `
                <div class="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                     onclick="calculator.loadCalculation('${item.id}')">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="text-sm font-medium text-gray-800">
                                ${startDate} ${direction} ${endDate}
                            </div>
                            <div class="text-xs text-gray-500">
                                ${item.targetDays} days${businessDays}
                            </div>
                        </div>
                        <div class="text-xs text-gray-400">
                            ${new Date(item.timestamp).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadCalculation(id) {
        const calculation = this.calculationHistory.find(item => item.id.toString() === id);
        if (!calculation) return;

        const triggerDateInput = document.getElementById('triggerDate');
        const daysInput = document.getElementById('daysInput');
        const directionToggle = document.getElementById('directionToggle');
        const businessDaysToggle = document.getElementById('businessDaysToggle');
        const excludeHolidaysToggle = document.getElementById('excludeHolidaysToggle');

        if (triggerDateInput) {
            triggerDateInput.value = new Date(calculation.startDate).toISOString().split('T')[0];
        }
        if (daysInput) {
            daysInput.value = calculation.targetDays;
        }
        if (directionToggle) {
            if (calculation.direction === 'backward') {
                directionToggle.classList.add('active');
            } else {
                directionToggle.classList.remove('active');
            }
        }
        if (businessDaysToggle) {
            if (calculation.useBusinessDays) {
                businessDaysToggle.classList.add('active');
            } else {
                businessDaysToggle.classList.remove('active');
            }
        }
        if (excludeHolidaysToggle) {
            if (calculation.excludeHolidays) {
                excludeHolidaysToggle.classList.add('active');
            } else {
                excludeHolidaysToggle.classList.remove('active');
            }
        }

        this.calculateDeadline();
    }

    saveCurrentDeadline() {
        const resultDisplay = document.getElementById('resultDisplay');
        if (!resultDisplay || !resultDisplay.textContent.trim()) {
            this.showNotification('No calculation to save', 'error');
            return;
        }

        const name = prompt('Enter a name for this deadline:');
        if (!name) return;

        const triggerDateInput = document.getElementById('triggerDate');
        const daysInput = document.getElementById('daysInput');
        const directionToggle = document.getElementById('directionToggle');
        const businessDaysToggle = document.getElementById('businessDaysToggle');
        const excludeHolidaysToggle = document.getElementById('excludeHolidaysToggle');

        const savedDeadline = {
            id: Date.now(),
            name: name,
            triggerDate: triggerDateInput.value,
            days: parseInt(daysInput.value),
            direction: directionToggle.classList.contains('active') ? 'backward' : 'forward',
            useBusinessDays: businessDaysToggle.classList.contains('active'),
            excludeHolidays: excludeHolidaysToggle.classList.contains('active'),
            created: new Date()
        };

        this.savedDeadlines.push(savedDeadline);
        localStorage.setItem('savedDeadlines', JSON.stringify(this.savedDeadlines));
        
        this.showNotification('Deadline saved successfully', 'success');
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all calculation history?')) {
            this.calculationHistory = [];
            localStorage.removeItem('deadlineHistory');
            this.loadCalculationHistory();
            this.showNotification('History cleared', 'success');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
        }`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        anime({
            targets: notification,
            translateX: [300, 0],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuart'
        });

        // Remove after 3 seconds
        setTimeout(() => {
            anime({
                targets: notification,
                translateX: [0, 300],
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInQuart',
                complete: () => notification.remove()
            });
        }, 3000);
    }

    initializeAnimations() {
        // Initialize background shader effect
        if (typeof ShaderPark !== 'undefined') {
            this.initializeBackgroundEffect();
        }

        // Initialize text animations
        this.initializeTextAnimations();
    }

    initializeBackgroundEffect() {
        // Subtle background animation using shader-park
        const canvas = document.getElementById('backgroundCanvas');
        if (canvas) {
            // Simple geometric pattern animation
            const ctx = canvas.getContext('2d');
            let time = 0;
            
            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Draw subtle geometric patterns
                ctx.fillStyle = `rgba(26, 54, 93, ${0.02 + Math.sin(time) * 0.01})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                time += 0.01;
                requestAnimationFrame(animate);
            };
            
            animate();
        }
    }

    initializeTextAnimations() {
        // Initialize Typed.js for dynamic text
        if (typeof Typed !== 'undefined') {
            const typedElement = document.getElementById('typedText');
            if (typedElement) {
                new Typed('#typedText', {
                    strings: [
                        'Calculate legal deadlines with precision',
                        'Account for weekends and federal holidays',
                        'Never miss a critical filing deadline',
                        'Professional deadline management tool'
                    ],
                    typeSpeed: 50,
                    backSpeed: 30,
                    backDelay: 2000,
                    loop: true
                });
            }
        }
    }

    animateResultDisplay() {
        const resultDisplay = document.getElementById('resultDisplay');
        if (resultDisplay && typeof anime !== 'undefined') {
            anime({
                targets: resultDisplay,
                scale: [0.95, 1],
                opacity: [0.7, 1],
                duration: 400,
                easing: 'easeOutQuart'
            });
        }
    }

    animatePresetSelection(button) {
        if (typeof anime !== 'undefined') {
            anime({
                targets: button,
                scale: [1, 0.95, 1],
                duration: 200,
                easing: 'easeOutQuart'
            });
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new LegalDeadlineCalculator();
});

// Utility functions for date formatting and validation
const DateUtils = {
    formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day);
    },

    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    },

    getDaysBetween(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((date1 - date2) / oneDay));
    }
};