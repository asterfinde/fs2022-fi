//~
import express from 'express'

import morgan from 'morgan'

import cors from 'cors'

let persons = [
   { 
      id: 1,
      name: "Arto Hellas", 
      number: "040-123456"
    },
    { 
      id: 2,
      name: "Ada Lovelace", 
      number: "39-44-5323523"
    },
    { 
      id: 3,
      name: "Dan Abramov", 
      number: "12-43-234345"
    },
    { 
      id: 4,
      name: "Mary Poppendieck", 
      number: "39-23-6423122"
    }
]

const requestLogger = ( request, response, next ) => {
	console.log('Method:', request.method)
	console.log('Path:  ', request.path)
	console.log('Body:  ', request.body)
	console.log('----')
	
	next()
}

const HOST_NAME = "0.0.0.0"
const PORT = process.env.PORT || 3001

const app = express()

app.use( express.json() )

app.use( requestLogger )

app.use( cors() )

app.use( express.static('build') )	// to make express show static content

// token
morgan.token('body', req => {
	return JSON.stringify( req.body )
})

// middlewares
app.use(morgan(':method :url - :response-time ms :body'))

// app.use( express.json() )

// helpers
const generateId = ( min_val, max_val ) => {
	// the maximum is exclusive and the minimum is inclusive
	const min = Math.ceil( min_val )
	const max = Math.floor( max_val )
	
	return Math.floor( Math.random() * (max - min) + min ) 
}

// routes
app.get('/info', ( request, response ) => {
	const entries = persons.length
	const requestTime = new Date() 
	
	response.send(`Phonebook has info for ${entries.toString()} people<br/> ${requestTime}`)
})

app.get('/api/persons', ( request, response ) => {
	response.json( persons )
})

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

	const isFound = persons.some( element => element.name === body.name ? true : false )
		
	if ( isFound ) {
		return response.status( 400 ).json({ 
			error: 'name must be unique' 
		})
	}
	
	const person = {
		id: generateId( persons.length + 1, 101 ),
		name: body.name,
		number: body.number,
	}

	persons = persons.concat( person )
	// console.log( persons )
	response.json( person )
})

app.get('/api/persons/:id', ( request, response ) => {
	const id = Number( request.params.id )
	console.log(id)
	
	const person = persons.find( person => person.id === id )
	
	if ( person ) {
		response.json( person )
	} else {
		response.status( 404 )
		response.send( `Current person: ${id} doesn't match` )
	}
})

app.delete('/api/persons/:id', ( request, response ) => {
	const id = Number( request.params.id )
	
	persons = persons.filter( person => person.id !== id )

	response.status( 204 ).end()
})

// middleware
const unknownEndpoint = ( request, response ) => {
	response.status( 404 ).send({ error: 'unknown endpoint' })
}

app.use( unknownEndpoint )

// server
app.listen( PORT, HOST_NAME, () => {
	console.log(`Server running at http://${HOST_NAME}:${PORT}/` );
})
