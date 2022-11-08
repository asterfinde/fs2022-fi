//~
import mongoose from 'mongoose'
import dotenv  from 'dotenv'

if ( process.env.NODE_ENV !== 'production' ) {
    dotenv.config()
}

const DB_PASSWORD = process.env.DB_PASSWORD
const DB_COLLECTION = process.env.DB_COLLECTION

let DB = process.env.MONGODB_URI.replace( '<COLLECTION>', DB_COLLECTION )
DB = DB.replace( '<PASSWORD>', DB_PASSWORD )

console.log('===========> connecting to mongoDB...')

mongoose.connect( DB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {
        console.log('===========> connected to MongoDB 🚀')
    })

    .catch((error) => {
        console.log('XXXXXXXXXXX> error connection to MongoDB 😵: ', error.message)
    })
  
const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: [3, 'Person validation : "name" is shorter than the minimum required length (3).'],
        required: true,
        unique: true
    },
    
	number: {
        type: String,
        validate: {
            validator: function(v) {
                return /^\d{2,3}-\d{1,}$/.test(v)
            },

            message: props => `${props.value} is not a valid phone number!`
        }
    }    
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Person = mongoose.model( 'Person', personSchema )
export default Person