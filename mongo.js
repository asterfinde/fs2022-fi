import mongoose from 'mongoose'

if ( process.argv.length < 3 ) {
	console.log( 'Please provide at least the password as an argument: node mongo.js <password>' )
	process.exit( 1 )
}

const password = process.argv[ 2 ]

let nameArg = ''
let numberArg = ''

if ( password != '' && process.argv.length === 5 ) {
	nameArg = process.argv[ 3 ]
	numberArg = process.argv[ 4 ]
}

const url = `mongodb+srv://asterfinde:${password}@cluster0-moocfi.kyguul4.mongodb.net/phonebookApp?retryWrites=true&w=majority`

const phonebookSchema = new mongoose.Schema({
	name: String,
    number: String,
})

// phonebookSchema.set('toJSON', {
  // transform: (document, returnedObject) => {
    // returnedObject.id = returnedObject._id.toString()
    // delete returnedObject._id
    // delete returnedObject.__v
  // }
// })

const Person = mongoose.model( 'Person', phonebookSchema )

mongoose
	.connect( url )
	
	.then( result => {
		// console.log('connected')
		
		if ( process.argv.length === 3 ) {
			Person.find({}, {_id :0, __v:0})
				.then(result => {
					result.forEach( p => {
						console.log( `${p.name} ${p.number}` )
				})
			})
		}

		if ( process.argv.length === 5 ) {
			const person = new Person({
				name: nameArg, 
				number: numberArg,
			})

			return person.save()
		}	
	})
	
	.then( () => {
		if ( process.argv.length === 3 ) {
			console.log('phonebook:')
		} 
		
		if ( process.argv.length === 5 ) {  
			console.log('person saved!')
		}

		return mongoose.connection.close()  	
	})
	
	.catch( err => console.log(err) )