import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';

dotenv.config();

export async function connectDB() {
  return open({
    filename: process.env.DB_USERS,
    driver: sqlite3.Database
  });
}

