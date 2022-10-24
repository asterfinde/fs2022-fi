import dotenv  from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'

const DB_PASSWORD = process.env.DB_PASSWORD
const DB_COLLECTION = process.env.DB_COLLECTION

let DB = process.env.MONGODB_URI.replace( '<COLLECTION>', DB_COLLECTION )
DB = DB.replace( '<PASSWORD>', DB_PASSWORD )
console.log(DB)

// works!
// const DB = 'mongodb+srv://asterfinde:G.t.A-281295@cluster0-moocfi.kyguul4.mongodb.net/phonebookApp?retryWrites=true&w=majority'

console.log('=======> connecting to mongoDB...')

mongoose.connect( DB )
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