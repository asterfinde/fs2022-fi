import dotenv  from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'

const DB = 'mongodb+srv://asterfinde:G.t.A-281295@cluster0-moocfi.kyguul4.mongodb.net/phonebookApp?retryWrites=true&w=majority'
// const DB = process.env.DATABASE.replace( '<PASSWORD>', process.env.DATABASE_PASSWORD )
console.log('=======> connecting to mongoDB...')

mongoose.connect(DB)
  .then(result => {
    console.log('=======> connected to MongoDB')
  })
  .catch((error) => {
    console.log('XXXXXXXXXXX> error connecting to MongoDB:', error.message)
  })
  
const personSchema = new mongoose.Schema({
	name: String, 
	number: String,
})

// personSchema.set('toJSON', {
  // transform: (document, returnedObject) => {
    // returnedObject.id = returnedObject._id.toString()
    // delete returnedObject._id
    // delete returnedObject.__v
  // }
// })

const Person = mongoose.model( 'Person', personSchema )

export default Person