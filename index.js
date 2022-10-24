//~
import express from 'express'

import morgan from 'morgan'

import cors from 'cors'

import Person from './models/person.js'

const requestLogger = ( request, response, next ) => {
	console.log('Method:  ', request.method)
	console.log('Path:    ', request.path)
	console.log('Body:    ', request.body)
	console.log('FullUrl: ', request.protocol + '://' + request.get('host') + request.originalUrl)
	console.log('---------')
	
	next()
}

const HOST_NAME = process.env.HOST_NAME || 'localhost'
const PORT = process.env.PORT || 3001

const app = express()

// correct order!!
app.use( express.static('build') )	// to make express show static content

app.use( express.json() )

app.use( requestLogger )

app.use( cors() )

morgan.token('body', req => {
	return JSON.stringify( req.body )
})

app.use( morgan(':method :url - :response-time ms :body') )

// info
app.get('/api/persons/info', async ( request, response ) => {
	const entries = await Person.countDocuments( {} ).exec()

	const requestTime = new Date() 
	
	response.send(`Phonebook has info for ${entries} people<br/> ${requestTime}`)
})

// create
app.post('/api/persons', ( request, response ) => {
	const body = request.body

	if ( !body.name ) {
		return response.status( 400 ).json({ 
			error: 'Name missing' 
		})
	}
	
	if ( !body.number ) {
		return response.status( 400 ).json({ 
			error: 'Number missing' 
		})
	}

	const person = new Person({
		name: body.name,
		number: body.number,
	})
	
	person.save().then( savedPerson => {
		response.json( savedPerson )
	})
})

// read
app.get('/api/persons', ( request, response ) => {
	// Person.find({}, {_id :0, __v:0}).then( persons => {
	Person.find( {} ).then( persons => {	
		response.json( persons )
	})
})

app.get('/api/persons/:id', ( request, response ) => {
	Person.findById( request.params.id )
		.then( person => {
		    if ( person ) {
				response.json( person )
			} else {
				response.status(404).send(`Current person: ${id} doesn't match`).end() 
			}
		})
		
		.catch( error => next(error) )
})

// update
app.put('/api/persons/:id', ( request, response, next ) => {
	const body = request.body

	const person = {
		name: body.name,
		number: body.number,
	}

	Person.findByIdAndUpdate( request.params.id, person, { new: true } )
		.then( updatedPerson => {
			response.json( updatedPerson )
		})
		
		.catch( error => next(error) )
})

// delete
app.delete('/api/persons/:id', ( request, response, next ) => {
	Person.findByIdAndRemove( request.params.id )
		.then(result => {
			response.status( 204 ).end()
		})
		
		.catch( error => next(error) )
})

const unknownEndpoint = ( request, response ) => {
	response.status( 404 ).send({ error: 'unknown endpoint' })
}
app.use( unknownEndpoint )

const errorHandler = (error, request, response, next) => {
	console.error( error.message )

	if (error.name === 'CastError') {
		return response.status( 400 ).send({ error: 'malformatted id' })
	} 

	next( error )
}
app.use( errorHandler )

//
app.listen( PORT, HOST_NAME, () => {
	console.log(`Server running at http://${HOST_NAME}:${PORT}/` );
})
