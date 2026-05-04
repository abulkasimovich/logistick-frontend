"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../users/user.entity");
const driver_entity_1 = require("../drivers/driver.entity");
const customer_entity_1 = require("../customers/customer.entity");
const dispatcher_entity_1 = require("../dispatchers/dispatcher.entity");
const load_entity_1 = require("../loads/load.entity");
const dotenv = require("dotenv");
dotenv.config();
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'fleet_command',
    username: process.env.DB_USER || 'fleet_user',
    password: process.env.DB_PASSWORD || 'password',
    entities: [user_entity_1.User, driver_entity_1.Driver, customer_entity_1.Customer, dispatcher_entity_1.Dispatcher, load_entity_1.Load],
    synchronize: true,
});
const DRIVERS_DATA = [
    { name: 'Harper Allen', truck_type: 'Flatbed', terminal: 'Phoenix, AZ', status: 'active' },
    { name: 'Luis Walker', truck_type: 'Tanker', terminal: 'Dallas, TX', status: 'on_trip' },
    { name: 'James Carter', truck_type: 'Reefer', terminal: 'Atlanta, GA', status: 'active' },
    { name: 'Maria Torres', truck_type: 'Box Truck', terminal: 'Chicago, IL', status: 'active' },
    { name: 'Kevin Johnson', truck_type: 'Semi-Truck', terminal: 'Los Angeles, CA', status: 'on_trip' },
    { name: 'Sandra Lee', truck_type: 'Flatbed', terminal: 'Houston, TX', status: 'active' },
    { name: 'Robert Davis', truck_type: 'Reefer', terminal: 'Miami, FL', status: 'rest' },
    { name: 'Emily Chen', truck_type: 'Tanker', terminal: 'Seattle, WA', status: 'active' },
    { name: 'Mike Brown', truck_type: 'Box Truck', terminal: 'Denver, CO', status: 'active' },
    { name: 'Anna White', truck_type: 'Semi-Truck', terminal: 'Nashville, TN', status: 'on_trip' },
    { name: 'Tom Wilson', truck_type: 'Flatbed', terminal: 'Portland, OR', status: 'active' },
    { name: 'Lisa Garcia', truck_type: 'Reefer', terminal: 'Phoenix, AZ', status: 'active' },
];
const CUSTOMERS_DATA = [
    { name: 'Amazon Logistics', contact_email: 'ops@amazon.com', phone: '(206) 266-1000' },
    { name: 'UPS Supply Chain', contact_email: 'freight@ups.com', phone: '(404) 828-6000' },
    { name: 'FedEx Freight', contact_email: 'freight@fedex.com', phone: '(901) 818-7500' },
    { name: 'Walmart Transport', contact_email: 'transport@walmart.com', phone: '(479) 273-4000' },
    { name: 'Home Depot Logistics', contact_email: 'logistics@homedepot.com', phone: '(770) 433-8211' },
    { name: 'Kroger Distribution', contact_email: 'dist@kroger.com', phone: '(513) 762-4000' },
];
const DISPATCHERS_DATA = [
    { name: 'Hannah Wilson', team: 'Team Alpha', region: 'Southeast' },
    { name: 'Abigail Brown', team: 'Team Alpha', region: 'Southeast' },
    { name: 'Michael Scott', team: 'Team Omega', region: 'Midwest' },
    { name: 'Rachel Green', team: 'Team Delta', region: 'West Coast' },
    { name: 'David Kim', team: 'Team Alpha', region: 'Northeast' },
    { name: 'Sofia Martinez', team: 'Team Omega', region: 'Southwest' },
];
const US_ROUTES = [
    { origin: 'Phoenix, AZ', destination: 'Los Angeles, CA', miles: 372 },
    { origin: 'Dallas, TX', destination: 'Houston, TX', miles: 239 },
    { origin: 'Atlanta, GA', destination: 'Miami, FL', miles: 662 },
    { origin: 'Chicago, IL', destination: 'Detroit, MI', miles: 281 },
    { origin: 'Seattle, WA', destination: 'Portland, OR', miles: 174 },
    { origin: 'Denver, CO', destination: 'Kansas City, MO', miles: 601 },
    { origin: 'Nashville, TN', destination: 'Charlotte, NC', miles: 409 },
    { origin: 'Los Angeles, CA', destination: 'San Francisco, CA', miles: 381 },
    { origin: 'Houston, TX', destination: 'New Orleans, LA', miles: 349 },
    { origin: 'Miami, FL', destination: 'Orlando, FL', miles: 236 },
];
const TRUCK_TYPES = ['Flatbed', 'Tanker', 'Reefer', 'Box Truck', 'Semi-Truck'];
const STATUSES = ['delivered', 'delivered', 'delivered', 'in_transit', 'booked', 'cancelled'];
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function seed() {
    await AppDataSource.initialize();
    console.log('🌱 Starting seed...');
    await AppDataSource.query('TRUNCATE loads, dispatchers, customers, drivers, users RESTART IDENTITY CASCADE');
    const adminHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Admin123!', 12);
    const userRepo = AppDataSource.getRepository(user_entity_1.User);
    const u1 = Object.assign(new user_entity_1.User(), { name: 'Fleet Admin', email: process.env.SEED_ADMIN_EMAIL || 'admin@fleetcommand.com', password_hash: adminHash, role: 'admin', is_active: true });
    const u2 = Object.assign(new user_entity_1.User(), { name: 'Jane Dispatcher', email: 'dispatcher@fleetcommand.com', password_hash: await bcrypt.hash('Pass123!', 12), role: 'dispatcher', is_active: true });
    const u3 = Object.assign(new user_entity_1.User(), { name: 'Alex Analyst', email: 'analyst@fleetcommand.com', password_hash: await bcrypt.hash('Pass123!', 12), role: 'analyst', is_active: true });
    await userRepo.save([u1, u2, u3]);
    console.log('✅ Users seeded');
    const driverRepo = AppDataSource.getRepository(driver_entity_1.Driver);
    const driverEntities = DRIVERS_DATA.map(d => Object.assign(new driver_entity_1.Driver(), d));
    const drivers = await driverRepo.save(driverEntities);
    console.log(`✅ ${drivers.length} drivers seeded`);
    const custRepo = AppDataSource.getRepository(customer_entity_1.Customer);
    const customerEntities = CUSTOMERS_DATA.map(c => Object.assign(new customer_entity_1.Customer(), c));
    const customers = await custRepo.save(customerEntities);
    console.log(`✅ ${customers.length} customers seeded`);
    const dispRepo = AppDataSource.getRepository(dispatcher_entity_1.Dispatcher);
    const dispatcherEntities = DISPATCHERS_DATA.map(d => Object.assign(new dispatcher_entity_1.Dispatcher(), d));
    const dispatchers = await dispRepo.save(dispatcherEntities);
    console.log(`✅ ${dispatchers.length} dispatchers seeded`);
    const loadRepo = AppDataSource.getRepository(load_entity_1.Load);
    const loads = [];
    const now = new Date();
    for (let i = 0; i < 500; i++) {
        const route = US_ROUTES[i % US_ROUTES.length];
        const status = STATUSES[randomBetween(0, STATUSES.length - 1)];
        const revenue = randomBetween(2500, 8000);
        const fuelCost = Math.round(revenue * randomBetween(12, 20) / 100);
        const driverPay = Math.round(revenue * randomBetween(15, 22) / 100);
        const createdDate = new Date(now);
        createdDate.setDate(createdDate.getDate() - randomBetween(0, 365));
        loads.push({
            load_number: `LD-${String(i + 1001).padStart(4, '0')}`,
            status,
            origin: route.origin,
            destination: route.destination,
            truck_type: TRUCK_TYPES[i % TRUCK_TYPES.length],
            miles: route.miles + randomBetween(-20, 50),
            revenue,
            fuel_cost: fuelCost,
            driver_pay: driverPay,
            driver_id: drivers[i % drivers.length].id,
            customer_id: customers[i % customers.length].id,
            dispatcher_id: dispatchers[i % dispatchers.length].id,
            created_at: createdDate,
            delivered_at: status === 'delivered' ? createdDate : null,
        });
    }
    for (let i = 0; i < loads.length; i += 50) {
        const batch = loads.slice(i, i + 50).map(l => Object.assign(new load_entity_1.Load(), l));
        await loadRepo.save(batch);
    }
    console.log(`✅ ${loads.length} loads seeded`);
    await AppDataSource.destroy();
    console.log('\n🎉 Seed completed! Login: admin@fleetcommand.com / Admin123!');
}
seed().catch(console.error);
//# sourceMappingURL=seed.js.map