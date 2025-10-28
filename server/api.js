import { Router } from 'express';
import * as db from './db.js';

const router = Router();

// --- AUTH ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db.validateUser(email, password);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- USERS ---
router.get('/users', async (req, res) => {
    try {
        const users = await db.getUsers();
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/users', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = await db.createUser(name, email, password);
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- TRANSFERS ---
router.get('/transfers', async (req, res) => {
    try {
        const transfers = await db.getTransfers();
        res.json(transfers);
    } catch (error) {
        console.error('Get transfers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/transfers/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const transfers = await db.getTransfersByUserId(userId);
        res.json(transfers);
    } catch (error) {
        console.error('Get user transfers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/transfers', async (req, res) => {
    try {
        const result = await db.createTransfer(req.body);
        res.status(201).json(result);
    } catch (error) {
        console.error('Create transfer error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/transfers/:id', async (req, res) => {
    try {
        const updatedTransfer = await db.updateTransfer(req.params.id, req.body);
        res.json(updatedTransfer);
    } catch (error) {
        console.error('Update transfer error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/transfers/generate-code', async (req, res) => {
    try {
        const { transferId, step } = req.body;
        const code = await db.generateUnlockCode(transferId, step);
        res.json({ code });
    } catch (error) {
        console.error('Generate code error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/transfers/verify-code', async (req, res) => {
    try {
        const { transferId, step, code } = req.body;
        const result = await db.verifyUnlockCode(transferId, step, code);
        res.json(result);
    } catch (error) {
        console.error('Verify code error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// --- CREDIT REQUESTS ---
router.get('/credit-requests', async (req, res) => {
    try {
        const requests = await db.getCreditRequests();
        res.json(requests);
    } catch (error) {
        console.error('Get credit requests error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/credit-requests/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const requests = await db.getCreditRequestsByUserId(userId);
        res.json(requests);
    } catch (error) {
        console.error('Get user credit requests error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/credit-requests', async (req, res) => {
    try {
        const newRequest = await db.createCreditRequest(req.body);
        res.status(201).json(newRequest);
    } catch (error) {
        console.error('Create credit request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/credit-requests/:id', async (req, res) => {
    try {
        const result = await db.updateCreditRequest(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        console.error('Update credit request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- CHAT ---
router.get('/chats', async (req, res) => {
    try {
        const sessions = await db.getAllChatSessions();
        res.json(sessions);
    } catch (error) {
        console.error('Get chat sessions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/chats/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const session = await db.getChatSessionByUserId(userId);
        res.json(session);
    } catch (error) {
        console.error('Get user chat session error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/chats/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const message = req.body;
        await db.addChatMessage(userId, message);
        res.status(201).send();
    } catch (error) {
        console.error('Add chat message error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- SETTINGS ---
router.get('/settings/block-messages', async (req, res) => {
    try {
        const messages = await db.getBlockStepMessages();
        res.json(messages);
    } catch (error) {
        console.error('Get block messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/settings/block-messages', async (req, res) => {
    try {
        const { messages } = req.body;
        await db.updateBlockStepMessages(messages);
        res.json({ success: true });
    } catch (error) {
        console.error('Update block messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


export default router;
