import mongoose from 'mongoose';

let mongoServer;

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ticketharbor';
    
    // Attempt standard connection first
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log(`[TicketHarbor DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[TicketHarbor DB] Local MongoDB unavailable (${error.message}). Initializing In-Memory MongoServer fallback...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[TicketHarbor DB] In-Memory MongoServer Connected successfully at ${memoryUri}`);
    } catch (memErr) {
      console.error(`[TicketHarbor DB] Failed to start In-Memory MongoServer: ${memErr.message}`);
    }
  }
};
