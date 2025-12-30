import { Request, Response } from 'express';
import { query } from '../config/db';
import { generateReply } from '../services/llmService';

export const handleMessage = async (req: Request, res: Response) => {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ error: 'Message is required and cannot be empty' });
    }

    try {
        let currentSessionId = sessionId;

        if (!currentSessionId) {
            const sessionResult = await query('INSERT INTO sessions (title) VALUES ($1) RETURNING id', [message.substring(0, 50)]);
            currentSessionId = sessionResult.rows[0].id;
        } else {
            const sessionCheck = await query('SELECT id, title FROM sessions WHERE id = $1', [currentSessionId]);
            if (sessionCheck.rows.length === 0) {
                const sessionResult = await query('INSERT INTO sessions (id, title) VALUES ($1, $2) RETURNING id', [currentSessionId, message.substring(0, 50)]);
                currentSessionId = sessionResult.rows[0].id;
            } else if (!sessionCheck.rows[0].title) {
                await query('UPDATE sessions SET title = $1 WHERE id = $2', [message.substring(0, 50), currentSessionId]);
            }
        }

        await query(
            'INSERT INTO messages (session_id, sender, content) VALUES ($1, $2, $3)',
            [currentSessionId, 'user', message]
        );
        const historyResult = await query(
            'SELECT sender, content FROM messages WHERE session_id = $1 ORDER BY created_at ASC',
            [currentSessionId]
        );

        const history = historyResult.rows.map(row => ({
            role: row.sender === 'user' ? 'user' : 'ai',
            parts: row.content
        }));

        const historyForContext = history.slice(0, -1);

        const replyText = await generateReply(historyForContext, message);

        await query(
            'INSERT INTO messages (session_id, sender, content) VALUES ($1, $2, $3)',
            [currentSessionId, 'ai', replyText]
        );

        res.json({ reply: replyText, sessionId: currentSessionId });

    } catch (error) {
        console.error('Error handling chat message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getHistory = async (req: Request, res: Response) => {
    const { sessionId } = req.params;

    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
    }

    try {
        const result = await query(
            'SELECT id, sender, content, created_at FROM messages WHERE session_id = $1 ORDER BY created_at ASC',
            [sessionId]
        );

        const messages = result.rows.map(row => ({
            id: row.id,
            sender: row.sender,
            text: row.content,
            timestamp: row.created_at
        }));

        res.json({ messages });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const getSessions = async (req: Request, res: Response) => {
    try {
        const result = await query(
            'SELECT id, title, created_at FROM sessions ORDER BY created_at DESC'
        );
        res.json({ sessions: result.rows });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteAllSessions = async (req: Request, res: Response) => {
    try {
        await query('TRUNCATE TABLE sessions CASCADE');
        res.json({ message: 'All chat history deleted successfully' });
    } catch (error) {
        console.error('Error deleting sessions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
