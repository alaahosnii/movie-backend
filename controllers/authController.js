const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const prisma = new PrismaClient();

const userRegisterSchema = z.object({
    email: z.string().email(),
    name: z.string().optional(),
    password: z.string().min(6),
});
const userLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

exports.register = async (req, res) => {
    try {
        const parsed = userRegisterSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ status: false, message: 'Validation error', data: null });
        }
        const { email, name, password } = parsed.data;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ status: false, message: 'Email already registered', data: null });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, name, password: hashedPassword },
        });
        res.status(201).json({
            status: true,
            message: 'Registration successful',
            data: {
                user: { id: user.id, email: user.email, name: user.name },
                token: null
            }
        });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message, data: null });
    }
};

exports.login = async (req, res) => {
    try {
        const parsed = userLoginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ status: false, message: 'Validation error', data: null });
        }
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ status: false, message: 'Invalid email or password', data: null });
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ status: false, message: 'Invalid email or password', data: null });
        }
        const token = jwt.sign(
            { userId: user.id, email: user.email, name: user.name },
            process.env.JWT_SECRET || 'changeme',
            { expiresIn: '1h' }
        );
        res.json({
            status: true,
            message: 'Login successful',
            data: {
                user: { id: user.id, email: user.email, name: user.name },
                token
            }
        });
    } catch (err) {
        res.status(500).json({ status: false, message: err.message, data: null });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}; 