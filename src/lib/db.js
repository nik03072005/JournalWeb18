import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

let isConnected = false

// Handle connection events
mongoose.connection.on('connected', () => {
  isConnected = true
  console.log('✅ Mongoose connected to MongoDB')
})

mongoose.connection.on('error', (err) => {
  isConnected = false
  console.error('❌ Mongoose connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  isConnected = false
  console.log('⚠️ Mongoose disconnected from MongoDB')
})

export async function connectToDatabase() {
  if (isConnected) return

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined')
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    })
    isConnected = true
    console.log('✅ Connected to MongoDB')
  } catch (err) {
    console.error('❌ MongoDB connection error:', err)
    isConnected = false
    throw new Error(`Failed to connect to MongoDB: ${err.message}`)
  }
}
