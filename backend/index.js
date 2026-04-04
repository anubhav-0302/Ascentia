const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock employee data
const employees = [
    {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@ascentia.com',
        jobTitle: 'Senior Developer',
        department: 'Engineering',
        location: 'San Francisco',
        status: 'Active'
    },
    {
        id: 2,
        name: 'Michael Chen',
        email: 'michael.chen@ascentia.com',
        jobTitle: 'Product Manager',
        department: 'Product',
        location: 'New York',
        status: 'Active'
    },
    {
        id: 3,
        name: 'Emily Davis',
        email: 'emily.davis@ascentia.com',
        jobTitle: 'UX Designer',
        department: 'Design',
        location: 'Chicago',
        status: 'Remote'
    },
    {
        id: 4,
        name: 'James Wilson',
        email: 'james.wilson@ascentia.com',
        jobTitle: 'Marketing Lead',
        department: 'Marketing',
        location: 'Los Angeles',
        status: 'Active'
    },
    {
        id: 5,
        name: 'Lisa Anderson',
        email: 'lisa.anderson@ascentia.com',
        jobTitle: 'Sales Manager',
        department: 'Sales',
        location: 'Boston',
        status: 'Onboarding'
    },
    {
        id: 6,
        name: 'David Martinez',
        email: 'david.martinez@ascentia.com',
        jobTitle: 'DevOps Engineer',
        department: 'Engineering',
        location: 'Seattle',
        status: 'Active'
    },
    {
        id: 7,
        name: 'Jennifer Taylor',
        email: 'jennifer.taylor@ascentia.com',
        jobTitle: 'HR Specialist',
        department: 'Human Resources',
        location: 'Austin',
        status: 'Active'
    },
    {
        id: 8,
        name: 'Robert Brown',
        email: 'robert.brown@ascentia.com',
        jobTitle: 'Data Analyst',
        department: 'Analytics',
        location: 'Miami',
        status: 'Remote'
    },
    {
        id: 9,
        name: 'Maria Garcia',
        email: 'maria.garcia@ascentia.com',
        jobTitle: 'Frontend Developer',
        department: 'Engineering',
        location: 'San Francisco',
        status: 'Active'
    },
    {
        id: 10,
        name: 'Thomas Lee',
        email: 'thomas.lee@ascentia.com',
        jobTitle: 'Finance Manager',
        department: 'Finance',
        location: 'New York',
        status: 'Active'
    }
];

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Ascentia API running' });
});

// Employees route
app.get('/employees', (req, res) => {
    res.json(employees);
});

// Start server
app.listen(PORT, () => {
    console.log(`Ascentia API server running on port ${PORT}`);
});
