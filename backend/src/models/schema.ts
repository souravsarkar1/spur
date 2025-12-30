import { query } from '../config/db';

export const createTables = async () => {
    const createSessionsTable = `
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

    const createMessagesTable = `
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
      sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'ai')),
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

    try {
        await query(createSessionsTable);
        await query('ALTER TABLE sessions ADD COLUMN IF NOT EXISTS title TEXT');
        await query(createMessagesTable);
        console.log('Tables created successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    }
};
