"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const load_entity_1 = require("../loads/load.entity");
let StatsService = class StatsService {
    constructor(loadRepo) {
        this.loadRepo = loadRepo;
    }
    getDateRange(period) {
        const now = new Date();
        const months = period === '3M' ? 3 : period === '6M' ? 6 : 12;
        const from = new Date(now);
        from.setMonth(from.getMonth() - months);
        return from;
    }
    async getOverview(period = '12M') {
        const from = this.getDateRange(period);
        const qb = this.loadRepo.createQueryBuilder('l').where('l.created_at >= :from', { from });
        const totals = await qb
            .select('COUNT(*)', 'total_loads')
            .addSelect('SUM(l.revenue)', 'total_revenue')
            .addSelect('SUM(l.revenue - l.fuel_cost - l.driver_pay)', 'total_profit')
            .addSelect('SUM(l.miles)', 'total_miles')
            .addSelect('SUM(l.fuel_cost)', 'total_fuel')
            .addSelect('SUM(l.driver_pay)', 'total_driver_pay')
            .getRawOne();
        const statusCounts = await this.loadRepo
            .createQueryBuilder('l')
            .where('l.created_at >= :from', { from })
            .select('l.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('l.status')
            .getRawMany();
        const statusMap = {};
        statusCounts.forEach(s => { statusMap[s.status] = parseInt(s.count); });
        const revenue = parseFloat(totals.total_revenue) || 0;
        const profit = parseFloat(totals.total_profit) || 0;
        const miles = parseFloat(totals.total_miles) || 0;
        const fuel = parseFloat(totals.total_fuel) || 0;
        const loads = parseInt(totals.total_loads) || 0;
        const delivered = statusMap.delivered || 0;
        return {
            revenue,
            profit,
            margin: revenue > 0 ? ((profit / revenue) * 100).toFixed(1) + '%' : '0%',
            miles,
            rpm: miles > 0 ? '$' + (revenue / miles).toFixed(2) : '$0.00',
            fuel,
            fcpm: miles > 0 ? '$' + (fuel / miles).toFixed(2) : '$0.00',
            total_loads: loads,
            avg_rev_load: loads > 0 ? Math.round(revenue / loads) : 0,
            delivered,
            delivery_rate: loads > 0 ? ((delivered / loads) * 100).toFixed(1) + '%' : '0%',
            in_transit: statusMap.in_transit || 0,
            booked: statusMap.booked || 0,
            cancelled: statusMap.cancelled || 0,
            driver_pay: parseFloat(totals.total_driver_pay) || 0,
        };
    }
    async getMonthly(period = '12M') {
        const from = this.getDateRange(period);
        const rows = await this.loadRepo
            .createQueryBuilder('l')
            .where('l.created_at >= :from', { from })
            .select("TO_CHAR(l.created_at, 'Mon')", 'month')
            .addSelect("DATE_TRUNC('month', l.created_at)", 'month_date')
            .addSelect('SUM(l.revenue)', 'revenue')
            .addSelect('SUM(l.revenue - l.fuel_cost - l.driver_pay)', 'profit')
            .addSelect('COUNT(*)', 'loads')
            .addSelect('SUM(l.fuel_cost)', 'fuel')
            .addSelect('SUM(l.miles)', 'miles')
            .addSelect('SUM(l.driver_pay)', 'driver_pay')
            .groupBy("TO_CHAR(l.created_at, 'Mon'), DATE_TRUNC('month', l.created_at)")
            .orderBy("DATE_TRUNC('month', l.created_at)", 'ASC')
            .getRawMany();
        return rows.map(r => ({
            month: r.month,
            revenue: parseFloat(r.revenue) || 0,
            profit: parseFloat(r.profit) || 0,
            loads: parseInt(r.loads) || 0,
            fuel: parseFloat(r.fuel) || 0,
            miles: parseFloat(r.miles) || 0,
            driver_pay: parseFloat(r.driver_pay) || 0,
        }));
    }
    async getFinancials(period = '12M') {
        const overview = await this.getOverview(period);
        const monthly = await this.getMonthly(period);
        const rev = overview.revenue;
        return {
            totals: {
                revenue: overview.revenue,
                profit: overview.profit,
                fuel: overview.fuel,
                driver_pay: overview.driver_pay,
            },
            exp_pct: {
                profit: rev > 0 ? parseFloat(((overview.profit / rev) * 100).toFixed(1)) : 0,
                driver_pay: rev > 0 ? parseFloat(((overview.driver_pay / rev) * 100).toFixed(1)) : 0,
                fuel: rev > 0 ? parseFloat(((overview.fuel / rev) * 100).toFixed(1)) : 0,
            },
            monthly,
        };
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(load_entity_1.Load)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StatsService);
//# sourceMappingURL=stats.service.js.map